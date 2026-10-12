import {
  StudentInfo,
  StudentRecord,
  StudentProgress,
  SessionAccess,
  SessionRelease,
} from '../types';
import { MISSIONS } from '../data/curriculum';
import {
  generateMasterCsv,
  generateTestsCsv,
  generateSessionsCsv,
  generateItemAnalysisCsv,
  downloadCsv,
} from './exportCsv';

export const DEFAULT_SESSION_RELEASE: SessionRelease = {
  s1: false,
  s2: false,
  s3: false,
  s4: false,
  s5: false,
  posttest: false,
};

const LOCAL_STORAGE_KEYS = {
  RECORDS: 'gramco.records.v1',
  PROGRESS: 'gramco.progress.v1',
  ACTIVE_STUDENT: 'gramco.active_student.v1',
  ACCESS: 'gramco.session_access.v1',
  STUDENTS: 'gramco.student_registry.v1',
  SESSION_RELEASE: 'gramco.session_release.v1',
  PIN: 'gramco.teacher_pin.v1',
  TEACHER_AUTH: 'gramco.teacher_auth_active.v1',
  TEACHER_LOCKED_AT: 'gramco.teacher_locked_at.v1',
};

// Check if server is accessible
export async function checkServerStatus(): Promise<{
  connected: boolean;
  totalStudents?: number;
  totalRecords?: number;
}> {
  try {
    const res = await fetch('/api/status', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        connected: true,
        totalStudents: data.totalStudents,
        totalRecords: data.totalRecords,
      };
    }
  } catch {
    // offline or static mode
  }
  return { connected: false };
}

// ------------------------------------
// LocalStorage Fallbacks
// ------------------------------------
function getLocalRecords(): StudentRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.RECORDS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalRecord(record: StudentRecord) {
  try {
    const list = getLocalRecords();
    list.push(record);
    localStorage.setItem(LOCAL_STORAGE_KEYS.RECORDS, JSON.stringify(list));
  } catch (err) {
    console.warn('[LocalStore] Save record error:', err);
  }
}

function getLocalProgress(): Record<string, StudentProgress> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.PROGRESS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getLocalAccess(): Record<string, SessionAccess> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getLocalStudents(): StudentInfo[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.STUDENTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ------------------------------------
// Student Records
// ------------------------------------
export async function fetchAllRecords(): Promise<StudentRecord[]> {
  try {
    const res = await fetch('/api/records', { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const serverRecords = await res.json();
      const localRecords = getLocalRecords();
      const combined = [...serverRecords];
      localRecords.forEach((local) => {
        const exists = combined.some(
          (c) =>
            c.code.toUpperCase() === local.code.toUpperCase() &&
            c.phase === local.phase &&
            c.finishedAt === local.finishedAt
        );
        if (!exists) {
          combined.push(local);
        }
      });
      try {
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.RECORDS,
          JSON.stringify(combined)
        );
      } catch {}
      return combined;
    }
  } catch {
    // Fall back to local
  }
  return getLocalRecords();
}

export async function submitStudentRecord(record: StudentRecord): Promise<void> {
  saveLocalRecord(record);
  registerStudentLocal({
    code: record.code,
    grade: record.grade,
    sex: record.sex,
  });

  try {
    await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    console.warn('[API] Could not sync record to server, stored locally:', err);
  }
}

export function hasStudentCompletedPhaseLocally(
  code: string,
  phase: string
): boolean {
  const local = getLocalRecords();
  return local.some(
    (r) => r.code.toUpperCase() === code.toUpperCase() && r.phase === phase
  );
}

// ------------------------------------
// Student Registry
// ------------------------------------
export function registerStudentLocal(student: StudentInfo) {
  try {
    const list = getLocalStudents();
    const cleanCode = student.code.trim().toUpperCase();
    const idx = list.findIndex((s) => s.code.toUpperCase() === cleanCode);
    if (idx >= 0) {
      list[idx] = {
        ...list[idx],
        grade: student.grade || list[idx].grade,
        sex: student.sex || list[idx].sex,
      };
    } else {
      list.push({
        ...student,
        code: cleanCode,
        addedAt: student.addedAt || new Date().toISOString(),
      });
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.STUDENTS, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to register student locally', err);
  }
}

export async function fetchStudents(): Promise<StudentInfo[]> {
  try {
    const res = await fetch('/api/students', { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return getLocalStudents();
}

export async function registerStudent(student: StudentInfo): Promise<void> {
  registerStudentLocal(student);
  try {
    await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student),
    });
  } catch {}
}

// ------------------------------------
// Active Session Storage
// ------------------------------------
export function getActiveStudent(): StudentInfo | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.ACTIVE_STUDENT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setActiveStudent(student: StudentInfo) {
  try {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.ACTIVE_STUDENT,
      JSON.stringify(student)
    );
    registerStudent(student);
  } catch (err) {
    console.error('Failed to set active student', err);
  }
}

export function clearActiveStudent() {
  localStorage.removeItem(LOCAL_STORAGE_KEYS.ACTIVE_STUDENT);
}

// ------------------------------------
// Mission Progress
// ------------------------------------
export async function fetchAllProgress(): Promise<Record<string, StudentProgress>> {
  try {
    const res = await fetch('/api/progress', { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const serverProg = await res.json();
      const localProg = getLocalProgress();
      const merged: Record<string, StudentProgress> = { ...serverProg };
      Object.keys(localProg).forEach((code) => {
        merged[code] = {
          ...(merged[code] || {}),
          ...localProg[code],
        };
      });
      try {
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.PROGRESS,
          JSON.stringify(merged)
        );
      } catch {}
      return merged;
    }
  } catch {}
  return getLocalProgress();
}

export function getStudentProgressLocal(code: string): StudentProgress {
  return getLocalProgress()[code.toUpperCase()] || {};
}

export async function markSessionStarted(code: string): Promise<void> {
  const cleanCode = code.trim().toUpperCase();
  const dateStr = new Date().toISOString().slice(0, 10);
  try {
    const prog = getLocalProgress();
    prog[cleanCode] = prog[cleanCode] || {};
    if (!prog[cleanCode].startedAt) {
      prog[cleanCode].startedAt = dateStr;
      localStorage.setItem(LOCAL_STORAGE_KEYS.PROGRESS, JSON.stringify(prog));
    }
  } catch {}
  try {
    await fetch(`/api/progress/${encodeURIComponent(cleanCode)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startedAt: dateStr }),
    });
  } catch {}
}

export async function markSessionCompleted(
  code: string,
  sessionKey: string
): Promise<void> {
  const cleanCode = code.trim().toUpperCase();
  const now = new Date().toISOString();
  try {
    const prog = getLocalProgress();
    prog[cleanCode] = prog[cleanCode] || {};
    prog[cleanCode][sessionKey] = { completedAt: now };
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROGRESS, JSON.stringify(prog));
  } catch {}
  try {
    await fetch(`/api/progress/${encodeURIComponent(cleanCode)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionKey, completedAt: now }),
    });
  } catch {}
}

export function isSessionCompleted(
  sessionKey: string,
  progress: StudentProgress
): boolean {
  const item = progress[sessionKey];
  return Boolean(
    item && typeof item === 'object' && 'completedAt' in item && item.completedAt
  );
}

// ------------------------------------
// Global Class Session Release (Synced for All Students)
// ------------------------------------
export function getSessionReleaseLocal(): SessionRelease {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.SESSION_RELEASE);
    if (raw) {
      return {
        ...DEFAULT_SESSION_RELEASE,
        ...JSON.parse(raw),
      };
    }
  } catch {}
  return { ...DEFAULT_SESSION_RELEASE };
}

export function saveSessionReleaseLocal(release: SessionRelease) {
  try {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.SESSION_RELEASE,
      JSON.stringify(release)
    );
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('gramco-session-release-changed', { detail: release })
      );
    }
  } catch (err) {
    console.warn('[SessionRelease] Local save error:', err);
  }
}

export async function fetchSessionRelease(): Promise<SessionRelease> {
  try {
    const res = await fetch('/api/session-release', {
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      const merged = { ...DEFAULT_SESSION_RELEASE, ...data };
      saveSessionReleaseLocal(merged);
      return merged;
    }
  } catch {}
  return getSessionReleaseLocal();
}

export async function updateSessionRelease(
  sessionKey: string,
  enabled: boolean
): Promise<SessionRelease> {
  const current = getSessionReleaseLocal();
  const updated: SessionRelease = {
    ...current,
    [sessionKey]: enabled,
  };
  saveSessionReleaseLocal(updated);
  try {
    const res = await fetch('/api/session-release', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionKey, enabled }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.sessionRelease) {
        saveSessionReleaseLocal(data.sessionRelease);
        return data.sessionRelease;
      }
    }
  } catch (err) {
    console.warn('[SessionRelease] Server sync failed, using local:', err);
  }
  return updated;
}

export const setSessionRelease = updateSessionRelease;

export async function updateAllSessionRelease(
  enabled: boolean
): Promise<SessionRelease> {
  const updated: SessionRelease = {
    s1: enabled,
    s2: enabled,
    s3: enabled,
    s4: enabled,
    s5: enabled,
    posttest: enabled,
  };
  saveSessionReleaseLocal(updated);
  try {
    const res = await fetch('/api/session-release', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: enabled }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.sessionRelease) {
        saveSessionReleaseLocal(data.sessionRelease);
        return data.sessionRelease;
      }
    }
  } catch (err) {
    console.warn('[SessionRelease] Server sync all failed, using local:', err);
  }
  return updated;
}

export const setAllSessionRelease = updateAllSessionRelease;

// ------------------------------------
// Session Access Check
// ------------------------------------
export async function fetchAllAccess(): Promise<Record<string, SessionAccess>> {
  try {
    const res = await fetch('/api/access', { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return getLocalAccess();
}

export function getStudentAccessLocal(code: string): SessionAccess {
  if (!code) return {};
  return getLocalAccess()[code.trim().toUpperCase()] || {};
}

export function isSessionAccessible(
  code: string,
  sessionKey: string,
  teacherOverride = false
): boolean {
  if (teacherOverride) return true;
  const release = getSessionReleaseLocal();
  if (Boolean(release[sessionKey as keyof SessionRelease])) {
    return true;
  }
  if (code) {
    const access = getStudentAccessLocal(code);
    if (Boolean(access[sessionKey as keyof SessionAccess])) {
      return true;
    }
  }
  return false;
}

export async function setStudentSessionAccess(
  code: string,
  sessionKey: string,
  enabled: boolean
): Promise<void> {
  const cleanCode = code.trim().toUpperCase();
  try {
    const access = getLocalAccess();
    access[cleanCode] = access[cleanCode] || {};
    (access[cleanCode] as any)[sessionKey] = enabled;
    localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS, JSON.stringify(access));
  } catch {}
  try {
    await fetch(`/api/access/${encodeURIComponent(cleanCode)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionKey, enabled }),
    });
  } catch {}
}

export async function setAllSessionsForStudent(
  code: string,
  enabled: boolean
): Promise<void> {
  const cleanCode = code.trim().toUpperCase();
  try {
    const access = getLocalAccess();
    access[cleanCode] = {
      s1: enabled,
      s2: enabled,
      s3: enabled,
      s4: enabled,
      s5: enabled,
      posttest: enabled,
    };
    localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS, JSON.stringify(access));
  } catch {}
  try {
    await fetch(`/api/access/${encodeURIComponent(cleanCode)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: enabled }),
    });
  } catch {}
}

// ------------------------------------
// Teacher PIN Security
// ------------------------------------
export async function verifyTeacherPin(pin: string): Promise<boolean> {
  const clean = pin.trim();
  try {
    const res = await fetch('/api/teacher/pin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: clean }),
    });
    if (res.ok) {
      const data = await res.json();
      return Boolean(data.valid);
    }
  } catch {}
  const localPin = localStorage.getItem(LOCAL_STORAGE_KEYS.PIN) || '1234';
  return clean === localPin;
}

export async function updateTeacherPin(
  currentPin: string,
  newPin: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/teacher/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPin, newPin }),
    });
    if (res.ok) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.PIN, newPin.trim());
      return { success: true };
    }
    const data = await res.json();
    return { success: false, error: data.error };
  } catch {
    const local = localStorage.getItem(LOCAL_STORAGE_KEYS.PIN) || '1234';
    if (currentPin.trim() !== local) {
      return { success: false, error: 'Current PIN is incorrect' };
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.PIN, newPin.trim());
    return { success: true };
  }
}

export async function resetTeacherPin(): Promise<void> {
  try {
    await fetch('/api/teacher/pin/reset', { method: 'POST' });
  } catch {}
  localStorage.removeItem(LOCAL_STORAGE_KEYS.PIN);
}

// ------------------------------------
// Teacher Session Lock State
// ------------------------------------
export function isTeacherAuthActive(): boolean {
  try {
    return sessionStorage.getItem(LOCAL_STORAGE_KEYS.TEACHER_AUTH) === 'true';
  } catch {
    return false;
  }
}

export function setTeacherAuthActive(active: boolean) {
  try {
    if (active) {
      sessionStorage.setItem(LOCAL_STORAGE_KEYS.TEACHER_AUTH, 'true');
      sessionStorage.removeItem(LOCAL_STORAGE_KEYS.TEACHER_LOCKED_AT);
    } else {
      sessionStorage.removeItem(LOCAL_STORAGE_KEYS.TEACHER_AUTH);
      sessionStorage.setItem(
        LOCAL_STORAGE_KEYS.TEACHER_LOCKED_AT,
        new Date().toISOString()
      );
    }
  } catch {}
}

export function getTeacherLockedAt(): string | null {
  try {
    return sessionStorage.getItem(LOCAL_STORAGE_KEYS.TEACHER_LOCKED_AT);
  } catch {
    return null;
  }
}

// ------------------------------------
// Demo & Reset
// ------------------------------------
export async function seedDemoStudent(): Promise<void> {
  try {
    await fetch('/api/teacher/demo', { method: 'POST' });
  } catch {}
  const demoCode = 'DEMO-01';
  const now = new Date().toISOString();
  saveLocalRecord({
    recordType: 'test',
    phase: 'pretest',
    code: demoCode,
    sex: 'Female',
    grade: 'Grade 6 - Mabini',
    finishedAt: now,
    score: 13,
    total: 20,
    bySkill: {
      'Completeness of Thought': { score: 4, total: 5 },
      'Word Order and Arrangement': { score: 3, total: 5 },
      'Subject Verb Agreement': { score: 3, total: 5 },
      'Punctuation and Capitalization': { score: 3, total: 5 },
    },
    items: [],
  });
  saveLocalRecord({
    recordType: 'test',
    phase: 'posttest',
    code: demoCode,
    sex: 'Female',
    grade: 'Grade 6 - Mabini',
    finishedAt: now,
    score: 19,
    total: 20,
    bySkill: {
      'Completeness of Thought': { score: 5, total: 5 },
      'Word Order and Arrangement': { score: 9, total: 10 },
      'Punctuation and Capitalization': { score: 5, total: 5 },
    },
    items: [],
  });
  MISSIONS.forEach((m) => {
    markSessionCompleted(demoCode, m.key);
  });
  setAllSessionsForStudent(demoCode, true);
}

export async function clearAllData(): Promise<void> {
  try {
    await fetch('/api/reset', { method: 'POST' });
  } catch {}
  try {
    await fetch('/api/reset', { method: 'DELETE' });
  } catch {}
  localStorage.removeItem(LOCAL_STORAGE_KEYS.RECORDS);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.PROGRESS);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.ACTIVE_STUDENT);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.STUDENTS);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.SESSION_RELEASE);
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (
        k &&
        k.startsWith('gramco.') &&
        k !== LOCAL_STORAGE_KEYS.PIN &&
        k !== LOCAL_STORAGE_KEYS.TEACHER_AUTH
      ) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('gramco-session-release-changed', {
        detail: DEFAULT_SESSION_RELEASE,
      })
    );
  }
}

// ------------------------------------
// Multi-Tab Excel & Separated CSV Exports
// ------------------------------------
export {
  exportMultiTabExcel,
  computeItemAnalysis,
  computeComparativeAnalysis,
  getDifficultyInterpretation,
} from './exportExcel';
export type { ItemAnalysisRow, ComparativeItemRow } from './exportExcel';

export {
  generateMasterCsv,
  generateTestsCsv,
  generateSessionsCsv,
  generateItemAnalysisCsv,
} from './exportCsv';

/**
 * Master Separated CSV Export (Backward-compatible exportCsvBlob)
 */
export function exportCsvBlob(
  records: StudentRecord[],
  progressMap: Record<string, StudentProgress>,
  students: StudentInfo[] = []
): void {
  const csv = generateMasterCsv(records, progressMap, students);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadCsv(csv, `gramco-master-separated-assessment-${dateStr}.csv`);
}

/**
 * Dedicated Tests CSV Export
 */
export function exportTestsCsvBlob(
  records: StudentRecord[],
  progressMap: Record<string, StudentProgress>,
  students: StudentInfo[] = []
): void {
  const csv = generateTestsCsv(records, progressMap, students);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadCsv(csv, `gramco-test-scores-comparison-${dateStr}.csv`);
}

/**
 * Dedicated Sessions Progress CSV Export
 */
export function exportSessionsCsvBlob(
  records: StudentRecord[],
  progressMap: Record<string, StudentProgress>,
  students: StudentInfo[] = []
): void {
  const csv = generateSessionsCsv(records, progressMap, students);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadCsv(csv, `gramco-sessions-progress-${dateStr}.csv`);
}

/**
 * Dedicated Item Analysis CSV Export
 */
export function exportItemAnalysisCsvBlob(records: StudentRecord[]): void {
  const csv = generateItemAnalysisCsv(records);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadCsv(csv, `gramco-item-analysis-deped-${dateStr}.csv`);
}
