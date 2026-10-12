import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Data file location
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

interface AppDataStore {
  records: any[];
  progress: Record<string, any>;
  access: Record<string, any>;
  students: any[];
  teacherPin: string;
  sessionRelease: Record<string, boolean>;
}

const DEFAULT_SESSION_RELEASE: Record<string, boolean> = {
  s1: false,
  s2: false,
  s3: false,
  s4: false,
  s5: false,
  posttest: false,
};

const DEFAULT_STORE: AppDataStore = {
  records: [],
  progress: {},
  access: {},
  students: [],
  teacherPin: '1234',
  sessionRelease: { ...DEFAULT_SESSION_RELEASE },
};

let store: AppDataStore = { ...DEFAULT_STORE };

function initStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const loaded = JSON.parse(raw);
      store = {
        ...DEFAULT_STORE,
        ...loaded,
        sessionRelease: {
          ...DEFAULT_SESSION_RELEASE,
          ...(loaded.sessionRelease || {}),
        },
      };
    } else {
      saveStore();
    }
  } catch (err) {
    console.warn('[Server] Could not initialize from disk, using memory store:', err);
  }
}

function saveStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Server] Failed to persist data to disk:', err);
  }
}

initStore();

// ==========================================
// REST API ENDPOINTS
// ==========================================

// Health / Status check
app.get('/api/status', (_req, res) => {
  res.json({
    status: 'online',
    appName: 'GramCo Server API',
    renderReady: true,
    storage: 'persisted_json',
    totalStudents: store.students.length,
    totalRecords: store.records.length,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// GET all compiled student records
app.get('/api/records', (_req, res) => {
  res.json(store.records);
});

// POST new student record
app.post('/api/records', (req, res) => {
  const newRecord = req.body;
  if (!newRecord || !newRecord.code) {
    res.status(400).json({ error: 'Invalid record: student code required' });
    return;
  }
  const code = String(newRecord.code).trim().toUpperCase();
  const record = {
    ...newRecord,
    code,
    receivedAt: new Date().toISOString(),
  };
  store.records.push(record);

  const existingIdx = store.students.findIndex(
    (s) => s.code.toUpperCase() === code
  );
  if (existingIdx >= 0) {
    store.students[existingIdx] = {
      ...store.students[existingIdx],
      grade: newRecord.grade || store.students[existingIdx].grade,
      sex: newRecord.sex || store.students[existingIdx].sex,
    };
  } else {
    store.students.push({
      code,
      grade: newRecord.grade || 'Grade 6 - Mabini',
      sex: newRecord.sex || '–',
      addedAt: new Date().toISOString(),
    });
  }

  saveStore();
  res.status(201).json({ success: true, record });
});

// GET student registry
app.get('/api/students', (_req, res) => {
  res.json(store.students);
});

// POST register student
app.post('/api/students', (req, res) => {
  const { code, grade, sex } = req.body;
  if (!code) {
    res.status(400).json({ error: 'Student code is required' });
    return;
  }
  const cleanCode = String(code).trim().toUpperCase();
  const existingIdx = store.students.findIndex(
    (s) => s.code.toUpperCase() === cleanCode
  );
  const studentObj = {
    code: cleanCode,
    grade: grade || 'Grade 6 - Mabini',
    sex: sex || '–',
    addedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    store.students[existingIdx] = {
      ...store.students[existingIdx],
      ...studentObj,
    };
  } else {
    store.students.push(studentObj);
  }

  saveStore();
  res.json({ success: true, student: studentObj });
});

// GET progress
app.get('/api/progress', (_req, res) => {
  res.json(store.progress);
});

// POST progress update
app.post('/api/progress/:code', (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const { sessionKey, startedAt, completedAt } = req.body;
  store.progress[code] = store.progress[code] || {};
  if (startedAt && !store.progress[code].startedAt) {
    store.progress[code].startedAt = startedAt;
  }
  if (sessionKey) {
    store.progress[code][sessionKey] = {
      completedAt: completedAt || new Date().toISOString(),
    };
  }
  saveStore();
  res.json({ success: true, progress: store.progress[code] });
});

// GET access permissions
app.get('/api/access', (_req, res) => {
  res.json(store.access);
});

// POST single student session access toggle
app.post('/api/access/:code', (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const { sessionKey, enabled, all } = req.body;
  store.access[code] = store.access[code] || {};
  if (all !== undefined) {
    store.access[code] = {
      s1: Boolean(all),
      s2: Boolean(all),
      s3: Boolean(all),
      s4: Boolean(all),
      s5: Boolean(all),
      posttest: Boolean(all),
    };
  } else if (sessionKey) {
    store.access[code][sessionKey] = Boolean(enabled);
  }
  saveStore();
  res.json({ success: true, access: store.access[code] });
});

// GET session release state
app.get('/api/session-release', (_req, res) => {
  res.json(store.sessionRelease || DEFAULT_SESSION_RELEASE);
});

// POST update session release state
app.post('/api/session-release', (req, res) => {
  const { sessionKey, enabled, all, release } = req.body;
  if (!store.sessionRelease) {
    store.sessionRelease = { ...DEFAULT_SESSION_RELEASE };
  }
  if (release && typeof release === 'object') {
    store.sessionRelease = {
      ...store.sessionRelease,
      ...release,
    };
  } else if (all !== undefined) {
    const val = Boolean(all);
    store.sessionRelease = {
      s1: val,
      s2: val,
      s3: val,
      s4: val,
      s5: val,
      posttest: val,
    };
  } else if (sessionKey) {
    store.sessionRelease[sessionKey] = Boolean(enabled);
  }

  const allCodes = Array.from(
    new Set([
      ...store.students.map((s) => s.code),
      ...Object.keys(store.access),
      ...store.records.map((r) => r.code),
    ])
  );
  allCodes.forEach((code) => {
    store.access[code] = {
      ...(store.access[code] || {}),
      ...(sessionKey ? { [sessionKey]: Boolean(enabled) } : {}),
      ...(all !== undefined
        ? {
            s1: Boolean(all),
            s2: Boolean(all),
            s3: Boolean(all),
            s4: Boolean(all),
            s5: Boolean(all),
            posttest: Boolean(all),
          }
        : {}),
    };
  });

  saveStore();
  res.json({ success: true, sessionRelease: store.sessionRelease });
});

// Teacher PIN endpoints
app.post('/api/teacher/pin/verify', (req, res) => {
  const { pin } = req.body;
  const currentPin = store.teacherPin || '1234';
  const isValid = String(pin || '').trim() === currentPin;
  res.json({ valid: isValid });
});

app.post('/api/teacher/pin', (req, res) => {
  const { currentPin, newPin } = req.body;
  const active = store.teacherPin || '1234';
  if (String(currentPin).trim() !== active) {
    res.status(401).json({ error: 'Current PIN is incorrect' });
    return;
  }
  const cleanNew = String(newPin || '').trim();
  if (cleanNew.length < 4 || cleanNew.length > 12) {
    res.status(400).json({ error: 'PIN must be between 4 and 12 characters' });
    return;
  }
  store.teacherPin = cleanNew;
  saveStore();
  res.json({ success: true });
});

app.post('/api/teacher/pin/reset', (_req, res) => {
  store.teacherPin = '1234';
  saveStore();
  res.json({ success: true, defaultPin: '1234' });
});

// Seed demo student
app.post('/api/teacher/demo', (_req, res) => {
  const demoCode = 'DEMO-01';
  const now = new Date().toISOString();
  const demoPretest = {
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
  };
  const demoPosttest = {
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
  };
  store.records = store.records.filter((r) => r.code !== demoCode);
  store.records.push(demoPretest, demoPosttest);
  store.students = store.students.filter((s) => s.code !== demoCode);
  store.students.push({
    code: demoCode,
    grade: 'Grade 6 - Mabini',
    sex: 'Female',
    addedAt: now,
  });
  store.progress[demoCode] = {
    startedAt: now.slice(0, 10),
    s1: { completedAt: now },
    s2: { completedAt: now },
    s3: { completedAt: now },
    s4: { completedAt: now },
    s5: { completedAt: now },
  };
  store.access[demoCode] = {
    s1: true,
    s2: true,
    s3: true,
    s4: true,
    s5: true,
    posttest: true,
  };
  saveStore();
  res.json({ success: true, student: demoCode });
});

// Clear all data
const resetStoreHandler = (_req: any, res: any) => {
  store.records = [];
  store.progress = {};
  store.access = {};
  store.students = [];
  store.sessionRelease = { ...DEFAULT_SESSION_RELEASE };
  saveStore();
  res.json({ success: true, message: 'All student logs and scores cleared from server' });
};
app.delete('/api/reset', resetStoreHandler);
app.post('/api/reset', resetStoreHandler);

// ==========================================
// CSV EXPORT (SEPARATED SCORES & PROGRESS)
// ==========================================
const escapeCsvCell = (val: any): string => {
  const str = String(val ?? '');
  return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

const formatCsvLine = (cells: any[]): string => {
  return cells.map(escapeCsvCell).join(',');
};

function getUnifiedServerStudentMap() {
  const codeMap: Record<
    string,
    { code: string; sex: string; grade: string; pre?: any; post?: any; progress: any }
  > = {};

  store.students.forEach((s) => {
    const c = s.code.toUpperCase();
    codeMap[c] = {
      code: c,
      sex: s.sex || '–',
      grade: s.grade || 'Grade 6 - Mabini',
      progress: store.progress[c] || {},
    };
  });

  store.records.forEach((r) => {
    const c = r.code.toUpperCase();
    if (!codeMap[c]) {
      codeMap[c] = {
        code: c,
        sex: r.sex || '–',
        grade: r.grade || 'Grade 6 - Mabini',
        progress: store.progress[c] || {},
      };
    } else {
      if (r.sex && codeMap[c].sex === '–') codeMap[c].sex = r.sex;
      if (r.grade) codeMap[c].grade = r.grade;
    }
    if (r.phase === 'pretest') codeMap[c].pre = r;
    if (r.phase === 'posttest') codeMap[c].post = r;
  });

  Object.keys(store.progress).forEach((c) => {
    const clean = c.toUpperCase();
    if (!codeMap[clean]) {
      codeMap[clean] = {
        code: clean,
        sex: '–',
        grade: 'Grade 6 - Mabini',
        progress: store.progress[clean] || {},
      };
    } else {
      codeMap[clean].progress = store.progress[clean] || {};
    }
  });

  return Object.values(codeMap).sort((a, b) => a.code.localeCompare(b.code));
}

// GET /api/export/csv?type=tests|sessions|item-analysis|all
app.get('/api/export/csv', (req, res) => {
  const exportType = String(req.query.type || 'all').toLowerCase();
  const studentList = getUnifiedServerStudentMap();
  const missions = [
    { key: 's1', name: 'Session 1 (Thought)' },
    { key: 's2', name: 'Session 2 (Word Order)' },
    { key: 's3', name: 'Session 3 (SVA)' },
    { key: 's4', name: 'Session 4 (Punctuation)' },
    { key: 's5', name: 'Session 5 (Builder)' },
  ];
  const skills = [
    'Completeness of Thought',
    'Word Order and Arrangement',
    'Subject Verb Agreement',
    'Punctuation and Capitalization',
  ];

  const lines: string[] = [];

  // 1. Tests Only CSV
  if (exportType === 'tests') {
    lines.push('=== GRAMCO - TEST ASSESSMENT COMPARISON & SCORES REPORT ===');
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push('');
    lines.push(
      formatCsvLine([
        'Student Code',
        'Sex',
        'Grade & Section',
        'Pre-Test Score (/20)',
        'Pre-Test %',
        'Pre-Test Finished At',
        'Post-Test Score (/20)',
        'Post-Test %',
        'Post-Test Finished At',
        'Score Gain (+/-)',
        'Percentage Gain (%)',
        'Test Status',
      ])
    );

    let sumPre = 0, countPre = 0, sumPost = 0, countPost = 0;
    studentList.forEach((st) => {
      const preScore = st.pre ? String(st.pre.score) : '–';
      const prePct = st.pre ? `${Math.round((st.pre.score / st.pre.total) * 100)}%` : '–';
      const postScore = st.post ? String(st.post.score) : '–';
      const postPct = st.post ? `${Math.round((st.post.score / st.post.total) * 100)}%` : '–';

      let diff = '–';
      let pctGain = '–';
      if (st.pre && st.post) {
        const d = st.post.score - st.pre.score;
        diff = d > 0 ? `+${d}` : String(d);
        pctGain = `${Number((((st.post.score - st.pre.score) / st.pre.total) * 100).toFixed(1))}%`;
        sumPre += st.pre.score;
        countPre += 1;
        sumPost += st.post.score;
        countPost += 1;
      } else if (st.pre) {
        sumPre += st.pre.score;
        countPre += 1;
      } else if (st.post) {
        sumPost += st.post.score;
        countPost += 1;
      }

      let status = 'Not Started';
      if (st.pre && st.post) status = 'Both Completed';
      else if (st.pre) status = 'Pre-Test Only';
      else if (st.post) status = 'Post-Test Only';

      lines.push(
        formatCsvLine([
          st.code,
          st.sex,
          st.grade,
          preScore,
          prePct,
          st.pre?.finishedAt || '–',
          postScore,
          postPct,
          st.post?.finishedAt || '–',
          diff,
          pctGain,
          status,
        ])
      );
    });

    if (studentList.length > 0) {
      const avgPre = countPre > 0 ? (sumPre / countPre).toFixed(2) : '–';
      const avgPost = countPost > 0 ? (sumPost / countPost).toFixed(2) : '–';
      const avgGain =
        countPre > 0 && countPost > 0
          ? (Number(avgPost) - Number(avgPre)).toFixed(2)
          : '–';
      lines.push(
        formatCsvLine([
          'CLASS AVERAGE',
          '–',
          `Total: ${studentList.length}`,
          avgPre,
          countPre > 0 ? `${Math.round((Number(avgPre) / 20) * 100)}%` : '–',
          '–',
          avgPost,
          countPost > 0 ? `${Math.round((Number(avgPost) / 20) * 100)}%` : '–',
          '–',
          avgGain,
          '–',
          '–',
        ])
      );
    }
  }

  // 2. Sessions Only CSV
  else if (exportType === 'sessions') {
    lines.push('=== GRAMCO - SESSIONS & LEARNING MISSIONS PROGRESS REPORT ===');
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push('');
    lines.push(
      formatCsvLine([
        'Student Code',
        'Sex',
        'Grade & Section',
        'Session 1 (Thought) Status',
        'Session 1 Completed At',
        'Session 2 (Word Order) Status',
        'Session 2 Completed At',
        'Session 3 (SVA) Status',
        'Session 3 Completed At',
        'Session 4 (Punctuation) Status',
        'Session 4 Completed At',
        'Session 5 (Builder) Status',
        'Session 5 Completed At',
        'Total Missions Completed (/5)',
        'Completion Rate %',
        'Curriculum Status',
      ])
    );

    let totalDone = 0;
    studentList.forEach((st) => {
      const prog = st.progress || {};
      const sessionCols: string[] = [];
      let completedCount = 0;

      missions.forEach((m) => {
        const item = prog[m.key];
        const isDone = Boolean(item && item.completedAt);
        if (isDone) completedCount += 1;
        sessionCols.push(isDone ? 'COMPLETED' : 'Pending');
        sessionCols.push(isDone ? item.completedAt : '–');
      });

      totalDone += completedCount;
      const ratePct = `${Math.round((completedCount / 5) * 100)}%`;
      let status = 'In Progress';
      if (completedCount === 5) status = 'All Missions Mastered';
      else if (completedCount === 0) status = 'Not Started';

      lines.push(
        formatCsvLine([
          st.code,
          st.sex,
          st.grade,
          ...sessionCols,
          `${completedCount}/5`,
          ratePct,
          status,
        ])
      );
    });

    if (studentList.length > 0) {
      lines.push(
        formatCsvLine([
          'CLASS SUMMARY',
          '–',
          `Total: ${studentList.length}`,
          '–',
          '–',
          '–',
          '–',
          '–',
          '–',
          '–',
          '–',
          '–',
          '–',
          `${(totalDone / studentList.length).toFixed(1)}/5`,
          `${Math.round((totalDone / (studentList.length * 5)) * 100)}%`,
          'Active Cohort',
        ])
      );
    }
  }

  // 3. All / Master CSV with clearly separated sections
  else {
    lines.push('================================================================================');
    lines.push('   GRAMCO COMPLETE EVALUATION REPORT - SEPARATED SCORES & SESSION PROGRESS     ');
    lines.push('================================================================================');
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push(`Total Students: ${studentList.length}`);
    lines.push('');

    // --- SECTION 1: TEST ASSESSMENT SCORES ---
    lines.push('================================================================================');
    lines.push('=== SECTION 1: TEST ASSESSMENT SCORES (PRE-TEST vs POST-TEST) ===');
    lines.push('================================================================================');
    lines.push(
      formatCsvLine([
        'Student Code',
        'Sex',
        'Grade & Section',
        'Pre-Test Score (/20)',
        'Pre-Test %',
        'Pre-Test Finished At',
        'Post-Test Score (/20)',
        'Post-Test %',
        'Post-Test Finished At',
        'Score Gain (+/-)',
        'Percentage Gain (%)',
        'Test Status',
      ])
    );

    let sumPre = 0, countPre = 0, sumPost = 0, countPost = 0;
    studentList.forEach((st) => {
      const preScore = st.pre ? String(st.pre.score) : '–';
      const prePct = st.pre ? `${Math.round((st.pre.score / st.pre.total) * 100)}%` : '–';
      const postScore = st.post ? String(st.post.score) : '–';
      const postPct = st.post ? `${Math.round((st.post.score / st.post.total) * 100)}%` : '–';

      let diff = '–';
      let pctGain = '–';
      if (st.pre && st.post) {
        const d = st.post.score - st.pre.score;
        diff = d > 0 ? `+${d}` : String(d);
        pctGain = `${Number((((st.post.score - st.pre.score) / st.pre.total) * 100).toFixed(1))}%`;
        sumPre += st.pre.score;
        countPre += 1;
        sumPost += st.post.score;
        countPost += 1;
      } else if (st.pre) {
        sumPre += st.pre.score;
        countPre += 1;
      } else if (st.post) {
        sumPost += st.post.score;
        countPost += 1;
      }

      let status = 'Not Started';
      if (st.pre && st.post) status = 'Both Completed';
      else if (st.pre) status = 'Pre-Test Only';
      else if (st.post) status = 'Post-Test Only';

      lines.push(
        formatCsvLine([
          st.code,
          st.sex,
          st.grade,
          preScore,
          prePct,
          st.pre?.finishedAt || '–',
          postScore,
          postPct,
          st.post?.finishedAt || '–',
          diff,
          pctGain,
          status,
        ])
      );
    });

    if (studentList.length > 0) {
      const avgPre = countPre > 0 ? (sumPre / countPre).toFixed(2) : '–';
      const avgPost = countPost > 0 ? (sumPost / countPost).toFixed(2) : '–';
      const avgGain =
        countPre > 0 && countPost > 0
          ? (Number(avgPost) - Number(avgPre)).toFixed(2)
          : '–';
      lines.push(
        formatCsvLine([
          'CLASS AVERAGE',
          '–',
          `Total: ${studentList.length}`,
          avgPre,
          countPre > 0 ? `${Math.round((Number(avgPre) / 20) * 100)}%` : '–',
          '–',
          avgPost,
          countPost > 0 ? `${Math.round((Number(avgPost) / 20) * 100)}%` : '–',
          '–',
          avgGain,
          '–',
          '–',
        ])
      );
    }

    lines.push('');
    // --- SECTION 2: SESSIONS & MISSIONS PROGRESSION ---
    lines.push('================================================================================');
    lines.push('=== SECTION 2: LEARNING SESSIONS & MISSIONS PROGRESSION (SESSIONS 1 TO 5) ===');
    lines.push('================================================================================');
    lines.push(
      formatCsvLine([
        'Student Code',
        'Sex',
        'Grade & Section',
        'Session 1 (Thought) Status',
        'Session 1 Completed At',
        'Session 2 (Word Order) Status',
        'Session 2 Completed At',
        'Session 3 (SVA) Status',
        'Session 3 Completed At',
        'Session 4 (Punctuation) Status',
        'Session 4 Completed At',
        'Session 5 (Builder) Status',
        'Session 5 Completed At',
        'Total Missions Completed (/5)',
        'Completion Rate %',
        'Overall Progress Status',
      ])
    );

    let totalDone = 0;
    studentList.forEach((st) => {
      const prog = st.progress || {};
      const sessionCols: string[] = [];
      let completedCount = 0;

      missions.forEach((m) => {
        const item = prog[m.key];
        const isDone = Boolean(item && item.completedAt);
        if (isDone) completedCount += 1;
        sessionCols.push(isDone ? 'COMPLETED' : 'Pending');
        sessionCols.push(isDone ? item.completedAt : '–');
      });

      totalDone += completedCount;
      const ratePct = `${Math.round((completedCount / 5) * 100)}%`;
      let status = 'In Progress';
      if (completedCount === 5) status = 'All Missions Complete';
      else if (completedCount === 0) status = 'Not Started';

      lines.push(
        formatCsvLine([
          st.code,
          st.sex,
          st.grade,
          ...sessionCols,
          `${completedCount}/5`,
          ratePct,
          status,
        ])
      );
    });

    if (studentList.length > 0) {
      lines.push(
        formatCsvLine([
          'CLASS SUMMARY',
          '–',
          `Total: ${studentList.length}`,
          '–',
          '–',
          '–',
          '–',
          '–',
          '–',
          '–',
          '–',
          '–',
          '–',
          `${(totalDone / studentList.length).toFixed(1)}/5`,
          `${Math.round((totalDone / (studentList.length * 5)) * 100)}%`,
          'Active Cohort',
        ])
      );
    }

    lines.push('');
    // --- SECTION 3: ITEM ANALYSIS - PRE-TEST ---
    lines.push('================================================================================');
    lines.push('=== SECTION 3: ITEM ANALYSIS - PRE-TEST (20 ITEMS - DEPED STANDARD) ===');
    lines.push('================================================================================');
    lines.push(
      formatCsvLine([
        'Item #',
        'Target Skill',
        'Question Prompt',
        'Correct Answer Key',
        'Total Examinees (N)',
        'Correct Count (R)',
        'Incorrect Count (W)',
        'Difficulty Index (p)',
        'Mastery %',
        'DepEd Classification',
        'Recommendation',
      ])
    );
    const preRecs = store.records.filter((r) => r.phase === 'pretest');
    for (let i = 1; i <= 20; i++) {
      let correct = 0;
      preRecs.forEach((r) => {
        const it = r.items?.find((item: any) => item.item === i);
        if (it?.correct) correct++;
      });
      const total = preRecs.length;
      const p = total > 0 ? (correct / total).toFixed(3) : '0';
      const pct = total > 0 ? ((correct / total) * 100).toFixed(1) + '%' : '0%';
      const pNum = Number(p);
      let level = 'Moderate';
      let rec = 'Retain item';
      if (pNum >= 0.81) {
        level = 'Very Easy';
        rec = 'Class mastered';
      } else if (pNum >= 0.61) {
        level = 'Easy';
        rec = 'Retain item';
      } else if (pNum <= 0.2) {
        level = 'Very Difficult';
        rec = 'Requires re-teaching';
      } else if (pNum <= 0.4) {
        level = 'Difficult';
        rec = 'Needs remediation';
      }
      lines.push(
        formatCsvLine([
          `Item ${i}`,
          skills[(i - 1) % skills.length],
          `Pretest Question ${i}`,
          'Answer Key',
          String(total),
          String(correct),
          String(Math.max(0, total - correct)),
          p,
          pct,
          level,
          rec,
        ])
      );
    }

    lines.push('');
    // --- SECTION 4: ITEM ANALYSIS - POST-TEST ---
    lines.push('================================================================================');
    lines.push('=== SECTION 4: ITEM ANALYSIS - POST-TEST (20 ITEMS - DEPED STANDARD) ===');
    lines.push('================================================================================');
    lines.push(
      formatCsvLine([
        'Item #',
        'Target Skill',
        'Question Prompt',
        'Correct Answer Key',
        'Total Examinees (N)',
        'Correct Count (R)',
        'Incorrect Count (W)',
        'Difficulty Index (p)',
        'Mastery %',
        'DepEd Classification',
        'Recommendation',
      ])
    );
    const postRecs = store.records.filter((r) => r.phase === 'posttest');
    for (let i = 1; i <= 20; i++) {
      let correct = 0;
      postRecs.forEach((r) => {
        const it = r.items?.find((item: any) => item.item === i);
        if (it?.correct) correct++;
      });
      const total = postRecs.length;
      const p = total > 0 ? (correct / total).toFixed(3) : '0';
      const pct = total > 0 ? ((correct / total) * 100).toFixed(1) + '%' : '0%';
      const pNum = Number(p);
      let level = 'Moderate';
      let rec = 'Retain item';
      if (pNum >= 0.81) {
        level = 'Very Easy';
        rec = 'High Class Mastery';
      } else if (pNum >= 0.61) {
        level = 'Easy';
        rec = 'Retain item';
      } else if (pNum <= 0.2) {
        level = 'Very Difficult';
        rec = 'Follow-up needed';
      } else if (pNum <= 0.4) {
        level = 'Difficult';
        rec = 'Targeted practice';
      }
      lines.push(
        formatCsvLine([
          `Item ${i}`,
          skills[(i - 1) % skills.length],
          `Posttest Question ${i}`,
          'Answer Key',
          String(total),
          String(correct),
          String(Math.max(0, total - correct)),
          p,
          pct,
          level,
          rec,
        ])
      );
    }
  }

  const csvContent = '\uFEFF' + lines.join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename =
    exportType === 'tests'
      ? `gramco-test-scores-comparison-${dateStr}.csv`
      : exportType === 'sessions'
      ? `gramco-sessions-progress-${dateStr}.csv`
      : `gramco-separated-master-assessment-${dateStr}.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.send(csvContent);
});

// Multi-Tab Excel (.xlsx) Export
app.get('/api/export/xlsx', (_req, res) => {
  try {
    const wb = XLSX.utils.book_new();
    const skills = [
      'Completeness of Thought',
      'Word Order and Arrangement',
      'Subject Verb Agreement',
      'Punctuation and Capitalization',
    ];
    const missions = [
      { key: 's1', num: 1, name: 'Complete the Thought' },
      { key: 's2', num: 2, name: 'Put Words in Order' },
      { key: 's3', num: 3, name: 'Match Subject & Verb' },
      { key: 's4', num: 4, name: 'Fix Punctuation & Capitalization' },
      { key: 's5', num: 5, name: 'Master Sentence Builder' },
    ];

    const studentList = getUnifiedServerStudentMap();

    // TAB 1: Summary
    const summaryRows = [
      [
        'Student Code',
        'Sex',
        'Grade & Section',
        'Pre-Test Score (/20)',
        'Post-Test Score (/20)',
        'Score Gain (+/-)',
        'S1: Thought',
        'S2: Order',
        'S3: SVA',
        'S4: Punctuation',
        'S5: Master',
        'Missions Done (/5)',
        'Status',
      ],
    ];

    studentList.forEach((st) => {
      const prog = st.progress || {};
      const preScore = st.pre ? `${st.pre.score}/${st.pre.total}` : '–';
      const postScore = st.post ? `${st.post.score}/${st.post.total}` : '–';
      let diff = '–';
      if (st.pre && st.post) {
        const d = st.post.score - st.pre.score;
        diff = d > 0 ? `+${d}` : `${d}`;
      }
      const s1 = Boolean(prog.s1 && prog.s1.completedAt);
      const s2 = Boolean(prog.s2 && prog.s2.completedAt);
      const s3 = Boolean(prog.s3 && prog.s3.completedAt);
      const s4 = Boolean(prog.s4 && prog.s4.completedAt);
      const s5 = Boolean(prog.s5 && prog.s5.completedAt);
      const doneCount = [s1, s2, s3, s4, s5].filter(Boolean).length;

      summaryRows.push([
        st.code,
        st.sex,
        st.grade,
        preScore,
        postScore,
        diff,
        s1 ? 'COMPLETED' : 'Pending',
        s2 ? 'COMPLETED' : 'Pending',
        s3 ? 'COMPLETED' : 'Pending',
        s4 ? 'COMPLETED' : 'Pending',
        s5 ? 'COMPLETED' : 'Pending',
        `${doneCount}/5`,
        st.pre && st.post && doneCount === 5 ? 'Finished All' : 'In Progress',
      ]);
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryRows), 'Summary');

    // TAB 2: Pre-Test
    const preHeader = [
      'Student Code',
      'Sex',
      'Grade',
      'Finished At',
      'Score',
      'Total',
      ...Array.from({ length: 20 }, (_, i) => `Item ${i + 1} Result`),
    ];
    const preRows = [preHeader];
    studentList.forEach((st) => {
      const rec = st.pre;
      if (!rec) {
        preRows.push([st.code, st.sex, st.grade, 'Not taken', '–', '20']);
        return;
      }
      const itemResults: number[] = [];
      for (let i = 1; i <= 20; i++) {
        const it = rec.items ? rec.items.find((item: any) => item.item === i) : null;
        itemResults.push(it ? (it.correct ? 1 : 0) : 0);
      }
      preRows.push([st.code, rec.sex || st.sex, rec.grade || st.grade, rec.finishedAt || '–', rec.score, rec.total, ...itemResults]);
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(preRows), 'Pre-Test');

    // TAB 3: Post-Test
    const postHeader = [
      'Student Code',
      'Sex',
      'Grade',
      'Finished At',
      'Score',
      'Total',
      ...Array.from({ length: 20 }, (_, i) => `Item ${i + 1} Result`),
    ];
    const postRows = [postHeader];
    studentList.forEach((st) => {
      const rec = st.post;
      if (!rec) {
        postRows.push([st.code, st.sex, st.grade, 'Not taken', '–', '20']);
        return;
      }
      const itemResults: number[] = [];
      for (let i = 1; i <= 20; i++) {
        const it = rec.items ? rec.items.find((item: any) => item.item === i) : null;
        itemResults.push(it ? (it.correct ? 1 : 0) : 0);
      }
      postRows.push([st.code, rec.sex || st.sex, rec.grade || st.grade, rec.finishedAt || '–', rec.score, rec.total, ...itemResults]);
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(postRows), 'Post-Test');

    // TABS 4-8: Sessions 1 to 5
    missions.forEach((m) => {
      const sRows = [['Student Code', 'Sex', 'Grade', 'Mission', 'Status', 'Completed Timestamp']];
      studentList.forEach((st) => {
        const prog = st.progress || {};
        const pItem = prog[m.key];
        const isDone = Boolean(pItem && pItem.completedAt);
        sRows.push([st.code, st.sex, st.grade, m.name, isDone ? 'COMPLETED' : 'Not Started', isDone ? pItem.completedAt : '–']);
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sRows), `Session ${m.num}`);
    });

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=gramco-complete-assessment-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    res.send(buffer);
  } catch (err) {
    console.error('Failed to generate Excel export:', err);
    res.status(500).json({ error: 'Failed to generate Excel workbook' });
  }
});

// ==========================================
// CLIENT SERVING (PROD & DEV)
// ==========================================
async function start() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, HOST, () => {
    console.log(`[GramCo Server] Running on http://${HOST}:${PORT}`);
  });
}

start().catch((err) => {
  console.error('[GramCo Server] Failed to start:', err);
  process.exit(1);
});
