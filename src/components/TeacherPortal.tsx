import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  StudentRecord,
  StudentProgress,
  SessionAccess,
  SessionRelease,
  StudentInfo,
} from '../types';
import { sound } from '../services/sound';
import {
  fetchAllRecords,
  fetchAllProgress,
  fetchAllAccess,
  fetchStudents,
  setStudentSessionAccess,
  getSessionReleaseLocal,
  fetchSessionRelease,
  updateSessionRelease,
  updateAllSessionRelease,
  DEFAULT_SESSION_RELEASE,
  isSessionCompleted,
  registerStudent,
  verifyTeacherPin,
  updateTeacherPin,
  resetTeacherPin,
  isTeacherAuthActive,
  setTeacherAuthActive,
  getTeacherLockedAt,
  seedDemoStudent,
  clearAllData,
  exportCsvBlob,
  exportTestsCsvBlob,
  exportSessionsCsvBlob,
  exportItemAnalysisCsvBlob,
  exportMultiTabExcel,
  computeItemAnalysis,
  computeComparativeAnalysis,
  checkServerStatus,
} from '../services/api';
import {
  ShieldCheck,
  Lock,
  LockOpen,
  UserCheck,
  Search,
  Download,
  Trash2,
  KeyRound,
  RotateCcw,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Clock,
  Compass,
  PlusCircle,
  FileSpreadsheet,
  BarChart3,
  TrendingUp,
  FileText,
  CalendarCheck,
  Award,
} from 'lucide-react';

interface TeacherPortalProps {
  onExit: () => void;
  onExitToRoadmap: () => void;
  teacherOverride: boolean;
  onToggleTeacherOverride: () => void;
}

const MISSIONS_LIST = [
  { key: 's1', label: 'M1', name: 'Mission 1 (Completeness of Thought)' },
  { key: 's2', label: 'M2', name: 'Mission 2 (Word Order and Arrangement)' },
  { key: 's3', label: 'M3', name: 'Mission 3 (Subject-Verb Agreement)' },
  { key: 's4', label: 'M4', name: 'Mission 4 (Punctuation & Capitalization)' },
  { key: 's5', label: 'M5', name: 'Mission 5 (Putting It All Together)' },
  { key: 'posttest', label: 'Post', name: 'Post-test (Final Evaluation)' },
];

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  onExit,
  onExitToRoadmap,
  teacherOverride,
  onToggleTeacherOverride,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    isTeacherAuthActive()
  );
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPinMask, setShowPinMask] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Data states
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, StudentProgress>>({});
  const [accessMap, setAccessMap] = useState<Record<string, SessionAccess>>({});
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [sessionRelease, setSessionRelease] = useState<SessionRelease>(() =>
    getSessionReleaseLocal()
  );
  const [, setServerOnline] = useState<boolean>(false);
  const [, setIsRefreshing] = useState(false);

  // Filters & UI
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showCsvMenu, setShowCsvMenu] = useState(false);
  const csvMenuRef = useRef<HTMLDivElement>(null);

  // Modals
  const [showChangePin, setShowChangePin] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showItemAnalysisModal, setShowItemAnalysisModal] = useState(false);
  const [itemAnalysisTab, setItemAnalysisTab] = useState<'pre' | 'post' | 'compare'>('pre');
  const [itemAnalysisSkillFilter, setItemAnalysisSkillFilter] = useState('all');

  // Change PIN fields
  const [currPinInput, setCurrPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinChangeError, setPinChangeError] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState('');

  // Add Student fields
  const [newStudentCode, setNewStudentCode] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState('Grade 6 - Mabini');
  const [newStudentSex, setNewStudentSex] = useState('Male');
  const [newStudentAccess] = useState<SessionAccess>({
    s1: false,
    s2: false,
    s3: false,
    s4: false,
    s5: false,
    posttest: false,
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [status, recs, progs, accs, studs, rel] = await Promise.all([
        checkServerStatus(),
        fetchAllRecords(),
        fetchAllProgress(),
        fetchAllAccess(),
        fetchStudents(),
        fetchSessionRelease(),
      ]);
      setServerOnline(status.connected);
      setRecords(recs);
      setProgressMap(progs);
      setAccessMap(accs);
      setStudents(studs);
      setSessionRelease(rel);
    } catch (err) {
      console.warn('Data load err:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Close CSV dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (csvMenuRef.current && !csvMenuRef.current.contains(e.target as Node)) {
        setShowCsvMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Inactivity timeout: 15 minutes
  useEffect(() => {
    if (!isAuthenticated) return;
    const checkTimer = setInterval(() => {
      if (Date.now() - lastActivity > 15 * 60 * 1000) {
        handleLockPortal('Session timed out after 15 minutes of inactivity.');
      }
    }, 20000);
    return () => clearInterval(checkTimer);
  }, [isAuthenticated, lastActivity]);

  const touchActivity = () => {
    setLastActivity(Date.now());
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    touchActivity();
    const isValid = await verifyTeacherPin(pinInput);
    if (isValid) {
      sound.playCorrect();
      setIsAuthenticated(true);
      setTeacherAuthActive(true);
      setPinError('');
      setPinInput('');
      setFailedAttempts(0);
      showToast('Teacher authenticated successfully. Portal unlocked.');
    } else {
      sound.playPop();
      const nextFail = failedAttempts + 1;
      setFailedAttempts(nextFail);
      setPinError(
        nextFail >= 3
          ? `Incorrect PIN (Attempt ${nextFail}). Default PIN is 1234.`
          : 'Incorrect PIN. Please enter the authorized teacher password.'
      );
    }
  };

  const handleLockPortal = (reason?: string) => {
    sound.playLock();
    setIsAuthenticated(false);
    setTeacherAuthActive(false);
    setShowChangePin(false);
    setShowAddStudent(false);
    setShowClearConfirm(false);
    setShowCsvMenu(false);
    setPinInput('');
    setPinError('');
    showToast(reason || '🔒 Teacher Portal locked.');
  };

  const handleExitAndLock = () => {
    sound.playLock();
    setIsAuthenticated(false);
    setTeacherAuthActive(false);
    onExit();
  };

  // Compile unified student rows
  const compiledStudents = useMemo(() => {
    const map: Record<
      string,
      {
        code: string;
        sex: string;
        grade: string;
        pretest?: StudentRecord;
        posttest?: StudentRecord;
      }
    > = {};

    students.forEach((s) => {
      const code = s.code.toUpperCase();
      map[code] = {
        code,
        sex: s.sex || '–',
        grade: s.grade || 'Grade 6 - Mabini',
      };
    });

    Object.keys(progressMap).forEach((codeKey) => {
      const code = codeKey.toUpperCase();
      if (!map[code]) {
        map[code] = { code, sex: '–', grade: 'Grade 6 - Mabini' };
      }
    });

    Object.keys(accessMap).forEach((codeKey) => {
      const code = codeKey.toUpperCase();
      if (!map[code]) {
        map[code] = { code, sex: '–', grade: 'Grade 6 - Mabini' };
      }
    });

    records.forEach((rec) => {
      const code = rec.code.toUpperCase();
      if (!map[code]) {
        map[code] = {
          code,
          sex: rec.sex || '–',
          grade: rec.grade || 'Grade 6 - Mabini',
        };
      } else {
        if (rec.sex && map[code].sex === '–') map[code].sex = rec.sex;
        if (rec.grade) map[code].grade = rec.grade;
      }

      if (rec.phase === 'pretest') {
        map[code].pretest = rec;
      } else if (rec.phase === 'posttest') {
        map[code].posttest = rec;
      }
    });

    return map;
  }, [students, progressMap, accessMap, records]);

  // Compute question-by-question Item Analysis for Pre-test, Post-test & Comparative Growth
  const preAnalysis = useMemo(
    () => computeItemAnalysis(records, 'pretest'),
    [records]
  );
  const postAnalysis = useMemo(
    () => computeItemAnalysis(records, 'posttest'),
    [records]
  );
  const comparativeAnalysis = useMemo(
    () => computeComparativeAnalysis(records),
    [records]
  );

  const handleExportExcel = () => {
    touchActivity();
    sound.playCorrect();
    exportMultiTabExcel(records, progressMap, students);
    showToast('📊 Multi-Tab Excel Workbook (.xlsx) downloaded!');
  };

  const handleExportMasterCsv = () => {
    touchActivity();
    sound.playPop();
    setShowCsvMenu(false);
    exportCsvBlob(records, progressMap, students);
    showToast('📄 Master Separated Assessment CSV downloaded!');
  };

  const handleExportTestsCsv = () => {
    touchActivity();
    sound.playPop();
    setShowCsvMenu(false);
    exportTestsCsvBlob(records, progressMap, students);
    showToast('📊 Test Scores Comparison CSV downloaded!');
  };

  const handleExportSessionsCsv = () => {
    touchActivity();
    sound.playPop();
    setShowCsvMenu(false);
    exportSessionsCsvBlob(records, progressMap, students);
    showToast('🧭 Learning Sessions Progress CSV downloaded!');
  };

  const handleExportItemAnalysisCsv = () => {
    touchActivity();
    sound.playPop();
    setShowCsvMenu(false);
    exportItemAnalysisCsvBlob(records);
    showToast('📈 Item Analysis & DepEd Index CSV downloaded!');
  };

  const allStudentCodes = Object.keys(compiledStudents).sort();
  const filteredStudentCodes = allStudentCodes.filter((code) => {
    const data = compiledStudents[code];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      data.code.toLowerCase().includes(q) ||
      (data.grade && data.grade.toLowerCase().includes(q))
    );
  });

  const handleToggleSessionRelease = async (sessionKey: string) => {
    touchActivity();
    sound.playPop();
    const currentVal = Boolean(
      sessionRelease[sessionKey as keyof SessionRelease]
    );
    const nextVal = !currentVal;
    const updated = await updateSessionRelease(sessionKey, nextVal);
    setSessionRelease(updated);
    const found = MISSIONS_LIST.find((m) => m.key === sessionKey);
    showToast(
      `${found?.name || sessionKey} is now ${
        nextVal ? 'UNLOCKED 🔓 for all students' : 'LOCKED 🔒 for all students'
      }`
    );
  };

  const handleReleaseAllSessions = async (enabled: boolean) => {
    touchActivity();
    if (enabled) {
      sound.playFanfare();
    } else {
      sound.playLock();
    }
    const updated = await updateAllSessionRelease(enabled);
    setSessionRelease(updated);
    showToast(
      enabled
        ? 'All sessions (Missions 1-5 + Post-test) UNLOCKED 🔓 for all students!'
        : 'All sessions LOCKED 🔒 for all students.'
    );
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    touchActivity();
    const cleanCode = newStudentCode.trim().toUpperCase();
    if (!cleanCode) return;
    sound.playCorrect();
    await registerStudent({
      code: cleanCode,
      grade: newStudentGrade.trim(),
      sex: newStudentSex,
    });
    for (const m of MISSIONS_LIST) {
      if (newStudentAccess[m.key as keyof SessionAccess]) {
        await setStudentSessionAccess(cleanCode, m.key, true);
      }
    }
    await loadData();
    setShowAddStudent(false);
    setNewStudentCode('');
    showToast(`Student ${cleanCode} registered and initialized.`);
  };

  const handleSimulateMultiUser = async () => {
    touchActivity();
    sound.playFanfare();
    await seedDemoStudent();
    await loadData();
    showToast('Simulated student DEMO-01 submitted from another device! Scores compiled.');
  };

  const executeClearLogs = async () => {
    touchActivity();
    sound.playPop();
    setShowClearConfirm(false);
    await clearAllData();
    setRecords([]);
    setProgressMap({});
    setAccessMap({});
    setStudents([]);
    setExpandedStudent(null);
    setSessionRelease(DEFAULT_SESSION_RELEASE);
    await loadData();
    showToast('All student logs and scores have been cleared successfully.');
  };

  const handleChangePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeError('');
    setPinChangeSuccess('');
    if (newPinInput.trim().length < 4) {
      setPinChangeError('New PIN must be at least 4 characters long.');
      return;
    }
    if (newPinInput.trim() !== confirmPinInput.trim()) {
      setPinChangeError('New PIN and confirmation PIN do not match.');
      return;
    }
    const res = await updateTeacherPin(currPinInput, newPinInput);
    if (res.success) {
      sound.playFanfare();
      setPinChangeSuccess('Teacher PIN changed successfully!');
      setCurrPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
    } else {
      setPinChangeError(res.error || 'Failed to update PIN.');
    }
  };

  // If locked, render PIN screen
  if (!isAuthenticated) {
    const lockedAtTime = getTeacherLockedAt();
    return (
      <div className="card p-6 sm:p-8 bg-[#12213b] border-2 border-[#1e3458] rounded-[28px] shadow-[0_18px_40px_rgba(0,0,0,0.5)] max-w-md mx-auto animate-in fade-in">
        {toastMsg && (
          <div className="mb-4 px-3.5 py-2 bg-[#2c1d1d] border border-[#ff5a4f] text-[#ff9b8f] font-bold text-xs rounded-xl flex items-center gap-2">
            <Lock className="w-4 h-4 flex-none" />
            <span>{toastMsg}</span>
          </div>
        )}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-3">
            <div className="w-16 h-16 rounded-2xl bg-[#ffd166]/15 border border-[#ffd166]/30 text-3xl grid place-items-center mx-auto text-[#ffd166] shadow-inner">
              🔐
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#133328] border-2 border-[#22b07d] grid place-items-center text-[10px] text-[#6fe0ae]">
              ✓
            </div>
          </div>
          <h2 className="text-2xl font-black text-[#f4f7fc]">
            Teacher Access Portal
          </h2>
          <p className="text-xs text-[#8ea0bc] font-semibold mt-1">
            Protected area for authorized educators & researchers. Enter PIN to
            view live compiled scores & control student session locks.
          </p>
          <p className="text-[11px] text-[#ffd166] font-bold mt-2">
            Default initial PIN: 1234
          </p>
          {lockedAtTime && (
            <p className="text-[11px] text-[#7385a3] font-bold mt-1 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-[#ffd166]" />
              <span>
                Locked at{' '}
                {new Date(lockedAtTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </p>
          )}
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPinMask ? 'text' : 'password'}
              maxLength={12}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError('');
              }}
              placeholder="Enter Teacher PIN"
              className="w-full h-14 px-12 bg-[#0d1a2e] text-[#f4f7fc] border-2 border-[#223655] focus:border-[#f4b400] rounded-xl text-center text-2xl font-black tracking-widest outline-none transition-colors shadow-inner"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPinMask(!showPinMask)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8ea0bc] hover:text-white p-1"
              title={showPinMask ? 'Hide PIN' : 'Show PIN'}
            >
              {showPinMask ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {pinError && (
            <p className="text-xs font-bold text-[#ff9b8f] text-center bg-[#381919] p-2.5 rounded-xl border border-[#ff5a4f]/50 animate-shake">
              ⚠️ {pinError}
            </p>
          )}

          <button
            type="submit"
            className="w-full h-13 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] font-black rounded-xl text-base shadow-[0_4px_0_#c48f00] active:translate-y-1 cursor-pointer transition-transform flex items-center justify-center gap-2"
          >
            <LockOpen className="w-4 h-4 text-[#1c2b46]" />
            <span>Authenticate & Unlock</span>
          </button>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={onExitToRoadmap || onExit}
              className="w-full py-2.5 px-4 bg-[#182b4a] hover:bg-[#20375d] border border-[#223655] text-[#cbd8ec] hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-[#ffd166]" />
              <span>Go Back to Student Roadmap</span>
            </button>
          </div>
        </form>

        <div className="mt-6 pt-3 border-t border-[#1e3458] text-center">
          <span className="text-[11px] text-[#5a6e8e]">
            🔒 Secure Access Control Active • Student access restricted
          </span>
        </div>
      </div>
    );
  }

  // Authenticated Dashboard
  return (
    <div
      onMouseMove={touchActivity}
      onKeyDown={touchActivity}
      className="card p-6 sm:p-8 bg-[#12213b] border border-[#1e3458] rounded-[28px] shadow-[0_18px_40px_rgba(0,0,0,0.4)] animate-in fade-in space-y-5"
    >
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-[#133328] border-2 border-[#22b07d] text-[#6fe0ae] font-bold text-xs sm:text-sm rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <ShieldCheck className="w-4 h-4 flex-none" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#1e3458]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#22b07d]/20 text-[#6fe0ae]">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#f4f7fc]">
              Teacher Score Dashboard & Session Controller
            </h1>
          </div>
          <div className="mt-1">
            <p className="text-xs text-[#8ea0bc] font-semibold">
              Live compiled student scores across all devices with instant
              permission gating & separated reporting.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleLockPortal()}
            className="px-3.5 py-2 bg-[#4a2222] hover:bg-[#5c2a2a] border border-[#ff5a4f]/60 text-[#ff9b8f] font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
            title="Lock the Teacher Portal immediately (requires PIN to open again)"
          >
            <Lock className="w-3.5 h-3.5 text-[#ff9b8f]" />
            <span>Lock Portal</span>
          </button>
          <button
            type="button"
            onClick={handleExitAndLock}
            className="px-3.5 py-2 bg-[#b83828] hover:bg-[#cf4230] text-white font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all"
            title="Lock portal and return to student roadmap"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Exit & Lock</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddStudent(true)}
            className="px-3 py-2 bg-[#1b3d32] hover:bg-[#234e40] border border-[#2ea47b] text-[#6fe0ae] font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Pre-register a student and configure their permissions"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Add Student</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setPinChangeError('');
              setPinChangeSuccess('');
              setShowChangePin(true);
            }}
            className="px-3 py-2 bg-[#2a1e4a] hover:bg-[#382862] border border-[#6b47a4] text-[#d6bdf5] font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Edit Teacher Security PIN"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#ffd166]" />
            <span>Change PIN</span>
          </button>
        </div>
      </div>

      {/* Search, Override, Simulation and Export toolbar */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2.5 items-center justify-between">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-[#8ea0bc] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student code or grade..."
              className="w-full h-11 pl-10 pr-4 bg-[#0d1a2e] text-[#f4f7fc] border border-[#223655] rounded-xl text-xs font-bold outline-none placeholder:text-[#5a6e8e] focus:border-[#f4b400]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onToggleTeacherOverride}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border cursor-pointer ${
                teacherOverride
                  ? 'bg-[#22b07d]/20 border-[#22b07d] text-[#6fe0ae]'
                  : 'bg-[#182b4a] border-[#223655] text-[#8ea0bc] hover:text-[#f4b400]'
              }`}
              title="Override unlocks all missions for teacher preview"
            >
              <LockOpen className="w-3.5 h-3.5" />
              <span>
                {teacherOverride ? 'Preview Bypass: ON' : 'Preview Bypass: OFF'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleSimulateMultiUser}
              className="px-3 py-2 bg-[#182b4a] hover:bg-[#20375d] border border-[#223655] text-[#8ecdf5] text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              title="Simulate receiving student answers from another device"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Simulate Multi-User</span>
            </button>

            <button
              type="button"
              onClick={() => {
                touchActivity();
                sound.playPop();
                setShowItemAnalysisModal(true);
              }}
              className="px-3.5 py-2 bg-[#173153] hover:bg-[#1f426e] border border-[#2a598c] text-[#7dd3fc] text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-all active:scale-95"
              title="View question-by-question Item Analysis & DepEd Difficulty Index"
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>Item Analysis</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              disabled={records.length === 0 && students.length === 0}
              className="px-3.5 py-2 bg-[#1b7a4d] hover:bg-[#229960] border border-[#2ebf78] text-white text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all active:scale-95"
              title="Download Multi-Tab Excel spreadsheet with individual tabs for Sessions 1-5, Pre/Post-tests, and Item Analysis"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#86efac]" />
              <span>Export Excel (.xlsx)</span>
            </button>

            {/* SEPARATED CSV EXPORT DROPDOWN MENU */}
            <div className="relative" ref={csvMenuRef}>
              <button
                type="button"
                onClick={() => {
                  touchActivity();
                  setShowCsvMenu(!showCsvMenu);
                }}
                disabled={records.length === 0 && students.length === 0}
                className="px-3.5 py-2 bg-[#1e3458] hover:bg-[#284674] border border-[#395c91] text-[#ffd166] text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all active:scale-95"
                title="Download CSV: choose separated Test Scores, Session Progress, or Master Separated CSV"
              >
                <Download className="w-3.5 h-3.5 text-[#ffd166]" />
                <span>Export CSV</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#ffd166]" />
              </button>

              {showCsvMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-[#0d1a2e] border-2 border-[#2b446e] rounded-2xl shadow-2xl z-40 p-2 space-y-1 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-[#1e3458] mb-1">
                    <p className="text-[11px] font-black uppercase text-[#ffd166] tracking-wider">
                      Separated CSV Exports
                    </p>
                    <p className="text-[10px] text-[#8ea0bc] font-semibold">
                      Download focused files or master structured CSV
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportTestsCsv}
                    className="w-full px-3 py-2.5 text-left text-xs font-bold rounded-xl hover:bg-[#1a2d4b] text-[#cbd8ec] hover:text-[#ffd166] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="p-1.5 rounded-lg bg-[#ffd166]/15 text-[#ffd166]">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-black text-[#f4f7fc]">
                        Test Scores CSV (Pre & Post)
                      </div>
                      <div className="text-[10px] text-[#8ea0bc] font-normal">
                        Pre vs Post scores, net gains, dates & skills only
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportSessionsCsv}
                    className="w-full px-3 py-2.5 text-left text-xs font-bold rounded-xl hover:bg-[#1a2d4b] text-[#cbd8ec] hover:text-[#6fe0ae] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="p-1.5 rounded-lg bg-[#22b07d]/20 text-[#6fe0ae]">
                      <CalendarCheck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-black text-[#f4f7fc]">
                        Session Progress CSV (Missions 1–5)
                      </div>
                      <div className="text-[10px] text-[#8ea0bc] font-normal">
                        Sessions 1–5 statuses, timestamps & rates only
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportItemAnalysisCsv}
                    className="w-full px-3 py-2.5 text-left text-xs font-bold rounded-xl hover:bg-[#1a2d4b] text-[#cbd8ec] hover:text-[#38bdf8] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="p-1.5 rounded-lg bg-[#38bdf8]/15 text-[#38bdf8]">
                      <BarChart3 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-black text-[#f4f7fc]">
                        Item Analysis CSV (DepEd Index)
                      </div>
                      <div className="text-[10px] text-[#8ea0bc] font-normal">
                        Item difficulty (p), mastery & comparative growth
                      </div>
                    </div>
                  </button>

                  <div className="border-t border-[#1e3458] my-1 pt-1">
                    <button
                      type="button"
                      onClick={handleExportMasterCsv}
                      className="w-full px-3 py-2.5 text-left text-xs font-bold rounded-xl hover:bg-[#1a2d4b] text-[#cbd8ec] hover:text-[#c99be0] flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <div className="p-1.5 rounded-lg bg-[#c99be0]/20 text-[#c99be0]">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-black text-[#f4f7fc]">
                          Master Separated CSV
                        </div>
                        <div className="text-[10px] text-[#8ea0bc] font-normal">
                          All sections cleanly separated in one file
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                touchActivity();
                setShowClearConfirm(true);
              }}
              className="px-3 py-2 bg-[#381919] hover:bg-[#4a2222] border border-[#ff5a4f]/50 text-[#ff9b8f] text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Clear all student records and logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Logs</span>
            </button>
          </div>
        </div>

        {/* Class Session Release Controller */}
        <div className="p-4 sm:p-5 bg-[#0d1a2e] rounded-2xl border-2 border-[#223655] shadow-lg space-y-3.5">
          <div className="flex items-center justify-between flex-wrap gap-2.5 pb-2.5 border-b border-[#1e3458]">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#ffd166]" />
                <h3 className="text-sm sm:text-base font-black text-[#f4f7fc]">
                  Class Session Release Controller
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#133328] border border-[#22b07d]/40 text-[#6fe0ae] text-[10px] font-extrabold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22b07d] animate-ping"></span>
                  <span>Synced for All Students</span>
                </span>
              </div>
              <p className="text-xs text-[#8ea0bc] font-semibold mt-0.5">
                Release or lock learning sessions. Changes sync live across all student devices in real time.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleReleaseAllSessions(true)}
                className="px-3 py-1.5 rounded-xl bg-[#1b3d32] hover:bg-[#255243] text-[#6fe0ae] border border-[#2ea47b] font-black text-xs cursor-pointer shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                title="Unlock Missions 1-5 and Post-test for all students"
              >
                <LockOpen className="w-3.5 h-3.5" />
                <span>Release All for All</span>
              </button>
              <button
                type="button"
                onClick={() => handleReleaseAllSessions(false)}
                className="px-3 py-1.5 rounded-xl bg-[#381919] hover:bg-[#4b2222] text-[#ff9b8f] border border-[#ff5a4f]/50 font-black text-xs cursor-pointer shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                title="Lock all sessions for all students"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock All for All</span>
              </button>
            </div>
          </div>

          {/* 6 session release cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {MISSIONS_LIST.map((m) => {
              const isReleased = Boolean(
                sessionRelease[m.key as keyof SessionRelease]
              );
              return (
                <div
                  key={m.key}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                    isReleased
                      ? 'bg-[#122e23] border-[#22b07d] shadow-sm'
                      : 'bg-[#15233a] border-[#233857]'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                          isReleased
                            ? 'bg-[#22b07d] text-[#0d2319]'
                            : 'bg-[#223655] text-[#8ea0bc]'
                        }`}
                      >
                        {m.label}
                      </span>
                      <span className="text-xs font-black text-[#f4f7fc] truncate">
                        {m.name.split(' (')[0]}
                      </span>
                    </div>
                    <div className="text-[11px] font-bold mt-1 flex items-center gap-1">
                      {isReleased ? (
                        <span className="text-[#6fe0ae] flex items-center gap-1 font-black">
                          <Check className="w-3 h-3 text-[#6fe0ae]" />
                          <span>Released (Unlocked)</span>
                        </span>
                      ) : (
                        <span className="text-[#7e91ad] flex items-center gap-1">
                          <Lock className="w-3 h-3 opacity-60" />
                          <span>Locked</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleSessionRelease(m.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer transition-all active:scale-95 flex items-center gap-1 ${
                      isReleased
                        ? 'bg-[#381919] hover:bg-[#4d2222] text-[#ff9b8f] border border-[#ff5a4f]/50'
                        : 'bg-[#22b07d] hover:bg-[#28c58d] text-white shadow-sm'
                    }`}
                  >
                    {isReleased ? (
                      <>
                        <Lock className="w-3 h-3" />
                        <span>Lock</span>
                      </>
                    ) : (
                      <>
                        <LockOpen className="w-3 h-3" />
                        <span>Release</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Aggregated Score Table */}
        <div className="overflow-x-auto rounded-2xl border border-[#223655] bg-[#0d1a2e]">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#223655] bg-[#12213b] text-[#8ea0bc] font-black uppercase text-[11px]">
                <th className="py-3 px-3.5">Student Code</th>
                <th className="py-3 px-3">Grade</th>
                <th className="py-3 px-3">Pretest</th>
                <th className="py-3 px-3">Post-test</th>
                <th className="py-3 px-3">Score Gain</th>
                <th className="py-3 px-3 min-w-[220px]">
                  <div className="flex items-center gap-1">
                    <span>Missions Completed</span>
                    <span className="text-[10px] text-[#8ea0bc] normal-case font-bold">
                      (Sessions Progress)
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e3458]">
              {filteredStudentCodes.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-[#8ea0bc] font-semibold text-xs space-y-2"
                  >
                    <p>
                      {searchQuery
                        ? 'No students match your search filter.'
                        : 'No student scores recorded yet.'}
                    </p>
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddStudent(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f4b400] text-[#1c2b46] font-bold text-xs cursor-pointer shadow-sm"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Add Student</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSimulateMultiUser}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#182b4a] border border-[#223655] text-[#8ecdf5] font-bold text-xs cursor-pointer"
                      >
                        <span>Simulate User Response</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudentCodes.map((code) => {
                  const studentData = compiledStudents[code];
                  const pretest = studentData.pretest;
                  const posttest = studentData.posttest;
                  const isExpanded = expandedStudent === code;

                  let gainDisplay = <span className="text-[#7385a3]">–</span>;
                  if (pretest && posttest) {
                    const diff = posttest.score - pretest.score;
                    gainDisplay =
                      diff > 0 ? (
                        <span className="text-[#6fe0ae] font-black">
                          +{diff}
                        </span>
                      ) : diff < 0 ? (
                        <span className="text-[#ff9b8f] font-black">
                          {diff}
                        </span>
                      ) : (
                        <span className="text-[#cbd8ec] font-bold">0</span>
                      );
                  }

                  return (
                    <React.Fragment key={code}>
                      <tr
                        onClick={() =>
                          setExpandedStudent(isExpanded ? null : code)
                        }
                        className="hover:bg-[#152744] transition-colors cursor-pointer font-bold"
                      >
                        <td className="py-3 px-3.5 text-[#ffd166] font-black whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span>{studentData.code}</span>
                            <span className="text-[10px] text-[#8ea0bc] font-normal">
                              ({studentData.sex || '–'})
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-[#cbd8ec] whitespace-nowrap">
                          {studentData.grade || '–'}
                        </td>
                        <td className="py-3 px-3 text-white whitespace-nowrap">
                          {pretest ? `${pretest.score}/${pretest.total}` : '–'}
                        </td>
                        <td className="py-3 px-3 text-white whitespace-nowrap">
                          {posttest
                            ? `${posttest.score}/${posttest.total}`
                            : '–'}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {gainDisplay}
                        </td>
                        <td className="py-2 px-3">
                          <div
                            className="flex items-center gap-1.5 flex-wrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {MISSIONS_LIST.map((m) => {
                              const prog = progressMap[code] || {};
                              const isDone = isSessionCompleted(m.key, prog);
                              return (
                                <span
                                  key={m.key}
                                  title={`${m.name}: ${
                                    isDone ? 'Completed by student' : 'Not yet completed'
                                  }`}
                                  className={`px-2 py-0.5 rounded text-[11px] font-black transition-all flex items-center gap-1 border ${
                                    isDone
                                      ? 'bg-[#163c2c] border-[#22b07d] text-[#6fe0ae]'
                                      : 'bg-[#15233a] border-[#233857] text-[#637796]'
                                  }`}
                                >
                                  {isDone ? (
                                    <Check className="w-3 h-3 text-[#6fe0ae]" />
                                  ) : (
                                    <span className="text-[10px] opacity-60">○</span>
                                  )}
                                  <span>{m.label}</span>
                                </span>
                              );
                            })}
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedStudent(isExpanded ? null : code)
                              }
                              className="ml-1 p-1 rounded-lg hover:bg-[#1a2c4a] text-[#8ea0bc] hover:text-white transition-colors cursor-pointer"
                              title={
                                isExpanded
                                  ? 'Collapse student details'
                                  : 'View full scores & question details'
                              }
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-[#ffd166]" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-[#8ea0bc]" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Student Diagnostics */}
                      {isExpanded && (
                        <tr className="bg-[#0a1424]">
                          <td colSpan={6} className="p-4 space-y-4">
                            <div className="p-3.5 bg-[#12213b] rounded-2xl border border-[#223655] space-y-3">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div>
                                  <h4 className="text-xs font-black uppercase text-[#ffd166] flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>
                                      Curriculum Mission Completion: {studentData.code}
                                    </span>
                                  </h4>
                                  <p className="text-[11px] text-[#8ea0bc] font-semibold">
                                    All missions sync live with your Class Session Release Controller above.
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
                                {MISSIONS_LIST.map((m) => {
                                  const prog = progressMap[code] || {};
                                  const isDone = isSessionCompleted(m.key, prog);
                                  const isReleased = Boolean(
                                    sessionRelease[m.key as keyof SessionRelease]
                                  );
                                  const doneObj = prog[m.key];
                                  const completedTime =
                                    doneObj &&
                                    typeof doneObj === 'object' &&
                                    'completedAt' in doneObj
                                      ? new Date(
                                          doneObj.completedAt
                                        ).toLocaleTimeString([], {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })
                                      : null;

                                  return (
                                    <div
                                      key={m.key}
                                      className={`p-2.5 rounded-xl border text-center transition-all ${
                                        isDone
                                          ? 'bg-[#133328] border-[#22b07d] text-[#6fe0ae]'
                                          : isReleased
                                          ? 'bg-[#152744] border-[#3b5987] text-[#cbd8ec]'
                                          : 'bg-[#0d1a2e] border-[#223655] text-[#617492]'
                                      }`}
                                    >
                                      <div className="text-[11px] font-black">
                                        {m.label}
                                      </div>
                                      <div className="text-[10px] font-bold mt-0.5 truncate">
                                        {isDone
                                          ? `Completed ${
                                              completedTime
                                                ? `(${completedTime})`
                                                : ''
                                            }`
                                          : isReleased
                                          ? 'Released (Ready)'
                                          : 'Locked'}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Skills breakdown */}
                            <div className="text-xs font-bold text-[#8ea0bc] flex items-center justify-between">
                              <span>TEST DIAGNOSTICS & SKILL BREAKDOWN</span>
                              <span className="text-[11px] text-[#7385a3]">
                                Pretest date:{' '}
                                {pretest
                                  ? new Date(
                                      pretest.finishedAt
                                    ).toLocaleDateString()
                                  : '–'}{' '}
                                | Posttest date:{' '}
                                {posttest
                                  ? new Date(
                                      posttest.finishedAt
                                    ).toLocaleDateString()
                                  : '–'}
                              </span>
                            </div>

                            {pretest && (
                              <div>
                                <span className="text-[11px] font-black uppercase text-[#ffd166] block mb-1">
                                  Pretest Skills:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {Object.keys(pretest.bySkill || {}).map(
                                    (sk) => (
                                      <span
                                        key={sk}
                                        className="px-2.5 py-1 rounded-full bg-[#182b4a] text-[11px] font-bold text-[#cbd8ec] border border-[#223655]"
                                      >
                                        {sk}:{' '}
                                        <strong className="text-white">
                                          {pretest.bySkill[sk].score}/
                                          {pretest.bySkill[sk].total}
                                        </strong>
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                            {posttest && (
                              <div>
                                <span className="text-[11px] font-black uppercase text-[#c99be0] block mb-1">
                                  Posttest Skills:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {Object.keys(posttest.bySkill || {}).map(
                                    (sk) => (
                                      <span
                                        key={sk}
                                        className="px-2.5 py-1 rounded-full bg-[#2c1d42] text-[11px] font-bold text-[#e2d5ec] border border-[#482e6c]"
                                      >
                                        {sk}:{' '}
                                        <strong className="text-white">
                                          {posttest.bySkill[sk].score}/
                                          {posttest.bySkill[sk].total}
                                        </strong>
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CLEAR LOGS CONFIRMATION MODAL */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-[#12213b] border-2 border-[#ff5a4f]/60 rounded-[24px] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#ff9b8f]">
              <div className="p-2.5 rounded-xl bg-[#ff5a4f]/20">
                <Trash2 className="w-6 h-6 text-[#ff5a4f]" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#f4f7fc]">
                  Clear All Student Logs?
                </h3>
                <p className="text-xs text-[#8ea0bc] font-semibold">
                  Permanently wipe all records & scores
                </p>
              </div>
            </div>
            <p className="text-xs text-[#cbd8ec] leading-relaxed">
              Are you sure you want to delete all compiled student records, test
              scores, and activity logs? This action will reset the table and
              cannot be undone.
            </p>
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={executeClearLogs}
                className="flex-1 py-2.5 px-3 bg-[#b83828] hover:bg-[#cf4230] text-white font-black rounded-xl text-xs shadow-sm cursor-pointer"
              >
                Yes, Clear All Logs
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="py-2.5 px-4 bg-[#182b4a] hover:bg-[#20375d] text-[#cbd8ec] font-bold rounded-xl text-xs border border-[#223655] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-[#12213b] border-2 border-[#2b446e] rounded-[24px] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e3458]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#22b07d]/20 text-[#6fe0ae]">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#f4f7fc]">
                    Register Student Account
                  </h3>
                  <p className="text-xs text-[#8ea0bc] font-semibold">
                    Pre-set a student ID and configure their initial sessions.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStudent(false)}
                className="p-1 rounded-lg text-[#8ea0bc] hover:text-white hover:bg-[#1a2c4a]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-extrabold text-[#8ea0bc] mb-1">
                  Student Code / ID
                </label>
                <input
                  type="text"
                  value={newStudentCode}
                  onChange={(e) => setNewStudentCode(e.target.value)}
                  placeholder="e.g., GC-01, GC-02, STUD-10"
                  className="w-full h-11 px-3 bg-[#0d1a2e] text-[#f4f7fc] border border-[#223655] focus:border-[#f4b400] rounded-xl text-sm font-bold uppercase outline-none"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#8ea0bc] mb-1">
                  Grade & Section
                </label>
                <input
                  type="text"
                  value={newStudentGrade}
                  onChange={(e) => setNewStudentGrade(e.target.value)}
                  placeholder="e.g., Grade 6 - Mabini"
                  className="w-full h-11 px-3 bg-[#0d1a2e] text-[#f4f7fc] border border-[#223655] focus:border-[#f4b400] rounded-xl text-sm font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#8ea0bc] mb-1">
                  Sex
                </label>
                <select
                  value={newStudentSex}
                  onChange={(e) => setNewStudentSex(e.target.value)}
                  className="w-full h-11 px-3 bg-[#0d1a2e] text-[#f4f7fc] border border-[#223655] focus:border-[#f4b400] rounded-xl text-sm font-bold outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="p-3 bg-[#0d1a2e] rounded-xl border border-[#223655] text-xs space-y-1">
                <span className="text-[#ffd166] font-extrabold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#ffd166]" />
                  <span>Session Access Automatically Synced</span>
                </span>
                <p className="text-[#8ea0bc] leading-relaxed">
                  This student will automatically inherit all sessions currently released by your Class Session Release Controller.
                </p>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 h-11 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] font-black rounded-xl text-sm shadow-[0_3px_0_#c48f00] cursor-pointer"
                >
                  Save & Grant Access
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddStudent(false)}
                  className="px-4 h-11 bg-[#182b4a] hover:bg-[#20375d] text-[#cbd8ec] font-bold rounded-xl text-xs border border-[#223655] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PIN MODAL */}
      {showChangePin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-[#12213b] border-2 border-[#2b446e] rounded-[24px] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e3458]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#ffd166]/20 text-[#ffd166]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#f4f7fc]">
                    Change Teacher PIN
                  </h3>
                  <p className="text-xs text-[#8ea0bc] font-semibold">
                    Set a confidential security PIN for teacher portal access.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowChangePin(false)}
                className="p-1 rounded-lg text-[#8ea0bc] hover:text-white hover:bg-[#1a2c4a]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePinSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-extrabold text-[#8ea0bc] mb-1">
                  Current PIN
                </label>
                <input
                  type="password"
                  value={currPinInput}
                  onChange={(e) => {
                    setCurrPinInput(e.target.value);
                    setPinChangeError('');
                    setPinChangeSuccess('');
                  }}
                  placeholder="Enter current PIN"
                  className="w-full h-11 px-3 bg-[#0d1a2e] text-[#f4f7fc] border border-[#223655] focus:border-[#f4b400] rounded-xl text-sm font-bold outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#8ea0bc] mb-1">
                  New PIN (min. 4 characters)
                </label>
                <input
                  type="password"
                  value={newPinInput}
                  maxLength={12}
                  onChange={(e) => {
                    setNewPinInput(e.target.value);
                    setPinChangeError('');
                    setPinChangeSuccess('');
                  }}
                  placeholder="Enter new PIN"
                  className="w-full h-11 px-3 bg-[#0d1a2e] text-[#f4f7fc] border border-[#223655] focus:border-[#f4b400] rounded-xl text-sm font-bold outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#8ea0bc] mb-1">
                  Confirm New PIN
                </label>
                <input
                  type="password"
                  value={confirmPinInput}
                  maxLength={12}
                  onChange={(e) => {
                    setConfirmPinInput(e.target.value);
                    setPinChangeError('');
                    setPinChangeSuccess('');
                  }}
                  placeholder="Re-enter new PIN"
                  className="w-full h-11 px-3 bg-[#0d1a2e] text-[#f4f7fc] border border-[#223655] focus:border-[#f4b400] rounded-xl text-sm font-bold outline-none"
                  required
                />
              </div>

              {pinChangeError && (
                <div className="p-2.5 bg-[#381919] border border-[#ff5a4f] rounded-xl text-[#ff9b8f] text-xs font-bold">
                  {pinChangeError}
                </div>
              )}
              {pinChangeSuccess && (
                <div className="p-2.5 bg-[#133328] border border-[#22b07d] rounded-xl text-[#6fe0ae] text-xs font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 flex-none" />
                  <span>{pinChangeSuccess}</span>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 h-11 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] font-black rounded-xl text-sm shadow-[0_3px_0_#c48f00] cursor-pointer"
                >
                  Save New PIN
                </button>
                <button
                  type="button"
                  onClick={() => setShowChangePin(false)}
                  className="px-4 h-11 bg-[#182b4a] hover:bg-[#20375d] text-[#cbd8ec] font-bold rounded-xl text-xs border border-[#223655] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </form>

            <div className="pt-3 border-t border-[#1e3458] flex justify-between items-center text-xs">
              <span className="text-[#8ea0bc]">Need to reset?</span>
              <button
                type="button"
                onClick={async () => {
                  await resetTeacherPin();
                  sound.playPop();
                  setPinChangeSuccess('Teacher PIN has been reset to default (1234).');
                }}
                className="text-[#ff9b8f] hover:underline flex items-center gap-1 cursor-pointer font-bold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Default (1234)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ITEM ANALYSIS MODAL */}
      {showItemAnalysisModal && (
        <div className="fixed inset-0 z-50 bg-[#050b14]/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-6xl bg-[#0a1526] border-2 border-[#1e3458] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#0f1e36] border-b border-[#1e3458] flex items-center justify-between flex-wrap gap-3 flex-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1b3d54] text-[#38bdf8] border border-[#2e6288] grid place-items-center flex-none">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#f4f7fc] flex items-center gap-2">
                    <span>Item Analysis & Diagnostic Report</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#163c2c] text-[#6fe0ae] border border-[#22b07d]/40">
                      DepEd Standard
                    </span>
                  </h3>
                  <p className="text-xs text-[#8ea0bc] font-semibold mt-0.5">
                    Question-by-question difficulty index (p-value), accuracy, and pre-vs-post mastery growth.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="px-3 py-1.5 bg-[#1b7a4d] hover:bg-[#229960] text-white text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-all active:scale-95"
                  title="Download all tabs in Excel workbook"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#86efac]" />
                  <span>Download Excel (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportItemAnalysisCsv}
                  className="px-3 py-1.5 bg-[#182b4a] hover:bg-[#20375d] border border-[#223655] text-[#cbd8ec] hover:text-[#38bdf8] text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all"
                  title="Download Item Analysis CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Item CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowItemAnalysisModal(false)}
                  className="p-1.5 text-[#8ea0bc] hover:text-white hover:bg-[#1a2c4a] rounded-xl cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Controls Bar */}
            <div className="px-4 py-3 bg-[#0d1a2e] border-b border-[#1e3458] flex flex-wrap items-center justify-between gap-3 flex-none">
              {/* Tab Selector */}
              <div className="flex items-center gap-1.5 bg-[#081325] p-1 rounded-xl border border-[#1e3458]">
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setItemAnalysisTab('pre');
                  }}
                  className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                    itemAnalysisTab === 'pre'
                      ? 'bg-[#f4b400] text-[#1c2b46] shadow-sm'
                      : 'text-[#8ea0bc] hover:text-white'
                  }`}
                >
                  Pre-Test Analysis (20 Items)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setItemAnalysisTab('post');
                  }}
                  className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                    itemAnalysisTab === 'post'
                      ? 'bg-[#22b07d] text-white shadow-sm'
                      : 'text-[#8ea0bc] hover:text-white'
                  }`}
                >
                  Post-Test Analysis (20 Items)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setItemAnalysisTab('compare');
                  }}
                  className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    itemAnalysisTab === 'compare'
                      ? 'bg-[#38bdf8] text-[#081325] shadow-sm'
                      : 'text-[#8ea0bc] hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Comparative Gain & Growth</span>
                </button>
              </div>

              {/* Skill Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8ea0bc] font-bold">Competency:</span>
                <select
                  value={itemAnalysisSkillFilter}
                  onChange={(e) => setItemAnalysisSkillFilter(e.target.value)}
                  className="bg-[#081325] text-xs font-bold text-[#f4f7fc] border border-[#223655] rounded-xl px-2.5 py-1.5 outline-none focus:border-[#38bdf8]"
                >
                  <option value="all">All Grammar Skills (20 Items)</option>
                  <option value="Completeness of Thought">Completeness of Thought</option>
                  <option value="Word Order and Arrangement">Word Order & Arrangement</option>
                  <option value="Subject Verb Agreement">Subject-Verb Agreement</option>
                  <option value="Punctuation and Capitalization">Punctuation & Capitalization</option>
                </select>
              </div>
            </div>

            {/* Modal Body / Table Content */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
              {/* Summary KPIs */}
              {(() => {
                const activeList =
                  itemAnalysisTab === 'pre'
                    ? preAnalysis
                    : itemAnalysisTab === 'post'
                    ? postAnalysis
                    : null;
                const filtered = activeList
                  ? activeList.filter(
                      (it) =>
                        itemAnalysisSkillFilter === 'all' ||
                        it.skill === itemAnalysisSkillFilter
                    )
                  : [];
                const sortedByPct = [...filtered].sort(
                  (a, b) => b.percentCorrect - a.percentCorrect
                );
                const highest = sortedByPct[0];
                const lowest = sortedByPct[sortedByPct.length - 1];
                const totalTakers = activeList && activeList[0] ? activeList[0].totalTakers : 0;
                const avgPct =
                  filtered.length > 0
                    ? Math.round(
                        filtered.reduce((acc, curr) => acc + curr.percentCorrect, 0) /
                          filtered.length
                      )
                    : 0;

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-[#0f1e36] border border-[#1e3458] rounded-xl p-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#8ea0bc]">
                        Total Submissions
                      </p>
                      <p className="text-xl font-black text-[#f4f7fc] mt-1">
                        {totalTakers} students
                      </p>
                      <p className="text-[11px] text-[#7385a3] font-semibold mt-0.5">
                        {itemAnalysisTab === 'pre' ? 'Pre-Test' : itemAnalysisTab === 'post' ? 'Post-Test' : 'Class Evaluation'}
                      </p>
                    </div>
                    <div className="bg-[#0f1e36] border border-[#1e3458] rounded-xl p-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#8ea0bc]">
                        Average Class Mastery
                      </p>
                      <p className="text-xl font-black text-[#ffd166] mt-1">
                        {avgPct}%
                      </p>
                      <p className="text-[11px] text-[#7385a3] font-semibold mt-0.5">
                        Across {filtered.length || 20} items
                      </p>
                    </div>
                    <div className="bg-[#0f1e36] border border-[#1e3458] rounded-xl p-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#8ea0bc]">
                        Highest Mastery Item
                      </p>
                      <p className="text-xl font-black text-[#6fe0ae] mt-1">
                        {highest ? `Item ${highest.itemNumber} (${highest.percentCorrect}%)` : '–'}
                      </p>
                      <p className="text-[11px] text-[#7385a3] font-semibold mt-0.5 truncate" title={highest?.skill}>
                        {highest ? highest.skill : 'Awaiting data'}
                      </p>
                    </div>
                    <div className="bg-[#0f1e36] border border-[#1e3458] rounded-xl p-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#8ea0bc]">
                        Needs Targeted Review
                      </p>
                      <p className="text-xl font-black text-[#ff9b8f] mt-1">
                        {lowest ? `Item ${lowest.itemNumber} (${lowest.percentCorrect}%)` : '–'}
                      </p>
                      <p className="text-[11px] text-[#7385a3] font-semibold mt-0.5 truncate" title={lowest?.skill}>
                        {lowest ? lowest.skill : 'Awaiting data'}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* DepEd Index Legend Bar */}
              <div className="flex flex-wrap items-center gap-2 p-2.5 bg-[#081325] border border-[#1e3458] rounded-xl text-[11px] font-semibold text-[#8ea0bc]">
                <span className="font-bold text-[#cbd8ec]">DepEd Difficulty Interpretation:</span>
                <span className="px-2 py-0.5 rounded bg-[#133328] text-[#6fe0ae] border border-[#22b07d]/40 font-bold">
                  Very Easy (0.81 - 1.00)
                </span>
                <span className="px-2 py-0.5 rounded bg-[#0e2c3d] text-[#38bdf8] border border-[#38bdf8]/40 font-bold">
                  Easy (0.61 - 0.80)
                </span>
                <span className="px-2 py-0.5 rounded bg-[#3b2f12] text-[#ffd166] border border-[#ffd166]/40 font-bold">
                  Moderate / Desirable (0.41 - 0.60)
                </span>
                <span className="px-2 py-0.5 rounded bg-[#382613] text-[#fb923c] border border-[#fb923c]/40 font-bold">
                  Difficult (0.21 - 0.40)
                </span>
                <span className="px-2 py-0.5 rounded bg-[#381919] text-[#ff9b8f] border border-[#ff5a4f]/40 font-bold">
                  Very Difficult (0.00 - 0.20)
                </span>
              </div>

              {/* Table rendering based on tab */}
              {itemAnalysisTab !== 'compare' ? (
                <div className="overflow-x-auto rounded-xl border border-[#1e3458]">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#0f1e36] text-[#8ea0bc] font-black uppercase tracking-wider text-[10px] border-b border-[#1e3458]">
                        <th className="py-2.5 px-3">Item</th>
                        <th className="py-2.5 px-3">Competency</th>
                        <th className="py-2.5 px-3 min-w-[200px]">Question & Key</th>
                        <th className="py-2.5 px-2.5 text-center">Takers (N)</th>
                        <th className="py-2.5 px-2.5 text-center">Correct (R)</th>
                        <th className="py-2.5 px-2.5 text-center">Index (p)</th>
                        <th className="py-2.5 px-3 min-w-[140px]">Mastery Rate</th>
                        <th className="py-2.5 px-3">Classification</th>
                        <th className="py-2.5 px-3 min-w-[180px]">Recommendation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e3458] bg-[#0a1526]">
                      {(() => {
                        const list = itemAnalysisTab === 'pre' ? preAnalysis : postAnalysis;
                        const filtered = list.filter(
                          (item) =>
                            itemAnalysisSkillFilter === 'all' ||
                            item.skill === itemAnalysisSkillFilter
                        );
                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan={9} className="py-8 text-center text-[#8ea0bc] font-semibold">
                                No questions found matching this filter.
                              </td>
                            </tr>
                          );
                        }
                        return filtered.map((row) => {
                          const p = row.difficultyIndex;
                          let badgeBg = 'bg-[#15233a] text-[#8ea0bc] border-[#223655]';
                          if (p >= 0.81) badgeBg = 'bg-[#133328] text-[#6fe0ae] border-[#22b07d]/40';
                          else if (p >= 0.61) badgeBg = 'bg-[#0e2c3d] text-[#38bdf8] border-[#38bdf8]/40';
                          else if (p >= 0.41) badgeBg = 'bg-[#3b2f12] text-[#ffd166] border-[#ffd166]/40';
                          else if (p >= 0.21) badgeBg = 'bg-[#382613] text-[#fb923c] border-[#fb923c]/40';
                          else badgeBg = 'bg-[#381919] text-[#ff9b8f] border-[#ff5a4f]/40';

                          return (
                            <tr key={row.itemNumber} className="hover:bg-[#0f1e36] transition-colors">
                              <td className="py-2.5 px-3 font-black text-[#ffd166] whitespace-nowrap">
                                Item {row.itemNumber}
                              </td>
                              <td className="py-2.5 px-3 font-bold text-[#cbd8ec] whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded bg-[#182b4a] border border-[#223655] text-[10px]">
                                  {row.skill}
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                <p className="font-semibold text-[#f4f7fc] line-clamp-2">
                                  {row.questionPrompt}
                                </p>
                                <p className="text-[11px] text-[#6fe0ae] font-bold mt-0.5 truncate">
                                  Key: {row.correctAnswer}
                                </p>
                              </td>
                              <td className="py-2.5 px-2.5 text-center font-bold text-[#8ea0bc]">
                                {row.totalTakers}
                              </td>
                              <td className="py-2.5 px-2.5 text-center font-black text-[#6fe0ae]">
                                {row.correctCount}
                              </td>
                              <td className="py-2.5 px-2.5 text-center font-black text-[#f4f7fc]">
                                {row.difficultyIndex.toFixed(2)}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[11px] font-bold">
                                    <span className="text-[#f4f7fc]">{row.percentCorrect}%</span>
                                  </div>
                                  <div className="w-full h-2 bg-[#182b4a] rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full transition-all duration-500"
                                      style={{
                                        width: `${row.percentCorrect}%`,
                                        backgroundColor:
                                          p >= 0.61
                                            ? '#22b07d'
                                            : p >= 0.41
                                            ? '#ffd166'
                                            : '#ff5a4f',
                                      }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${badgeBg}`}>
                                  {row.interpretation}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-[11px] text-[#cbd8ec] font-semibold">
                                {row.recommendation}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Comparative View */
                <div className="overflow-x-auto rounded-xl border border-[#1e3458]">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#0f1e36] text-[#8ea0bc] font-black uppercase tracking-wider text-[10px] border-b border-[#1e3458]">
                        <th className="py-2.5 px-3">Item</th>
                        <th className="py-2.5 px-3">Competency</th>
                        <th className="py-2.5 px-3 text-center">Pre-Test %</th>
                        <th className="py-2.5 px-3 text-center">Post-Test %</th>
                        <th className="py-2.5 px-3 text-center">Net Gain</th>
                        <th className="py-2.5 px-3 text-center">Hake's Gain (g)</th>
                        <th className="py-2.5 px-3 min-w-[180px]">Intervention Impact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e3458] bg-[#0a1526]">
                      {(() => {
                        const filtered = comparativeAnalysis.filter(
                          (item) =>
                            itemAnalysisSkillFilter === 'all' ||
                            item.skill === itemAnalysisSkillFilter
                        );
                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-[#8ea0bc] font-semibold">
                                No questions found matching this filter.
                              </td>
                            </tr>
                          );
                        }
                        return filtered.map((row) => {
                          const gain = row.absoluteGainPct;
                          const isPositive = gain > 0;
                          return (
                            <tr key={row.itemNumber} className="hover:bg-[#0f1e36] transition-colors">
                              <td className="py-2.5 px-3 font-black text-[#ffd166] whitespace-nowrap">
                                Item {row.itemNumber}
                              </td>
                              <td className="py-2.5 px-3 font-bold text-[#cbd8ec] whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded bg-[#182b4a] border border-[#223655] text-[10px]">
                                  {row.skill}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-[#f4b400]">
                                {row.preCorrectPct}%
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-[#22b07d]">
                                {row.postCorrectPct}%
                              </td>
                              <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-black ${
                                    isPositive
                                      ? 'bg-[#133328] text-[#6fe0ae] border border-[#22b07d]/40'
                                      : gain < 0
                                      ? 'bg-[#381919] text-[#ff9b8f] border border-[#ff5a4f]/40'
                                      : 'bg-[#182b4a] text-[#8ea0bc] border border-[#223655]'
                                  }`}
                                >
                                  {isPositive ? `+${gain}%` : `${gain}%`}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center font-black text-[#38bdf8]">
                                {row.normalizedGain > 0 ? row.normalizedGain.toFixed(2) : '0.00'}
                              </td>
                              <td className="py-2.5 px-3 text-[11px] font-bold text-[#f4f7fc]">
                                <div className="flex items-center gap-1.5">
                                  {gain >= 20 ? (
                                    <span className="w-2 h-2 rounded-full bg-[#22b07d]"></span>
                                  ) : (
                                    <span className="w-2 h-2 rounded-full bg-[#ffd166]"></span>
                                  )}
                                  <span>{row.impactStatus}</span>
                                </div>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-[#0f1e36] border-t border-[#1e3458] flex items-center justify-between flex-wrap gap-2 flex-none text-xs">
              <span className="text-[#8ea0bc] font-semibold">
                Excel & CSV exports separate test performance from session progression for research and grading.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportItemAnalysisCsv}
                  className="px-3.5 py-1.5 bg-[#173153] hover:bg-[#1f426e] text-[#7dd3fc] font-bold rounded-xl border border-[#2a598c] cursor-pointer"
                >
                  Download Item CSV
                </button>
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="px-3.5 py-1.5 bg-[#1b7a4d] hover:bg-[#229960] text-white font-black rounded-xl cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#86efac]" />
                  <span>Download Multi-Tab Excel (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowItemAnalysisModal(false)}
                  className="px-3 py-1.5 bg-[#182b4a] hover:bg-[#20375d] text-[#cbd8ec] font-bold rounded-xl border border-[#223655] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
