import * as XLSX from 'xlsx';
import {
  StudentRecord,
  StudentProgress,
  StudentInfo,
} from '../types';
import {
  PRETEST_QUESTIONS,
  POSTTEST_QUESTIONS,
  MISSIONS,
} from '../data/curriculum';

export interface ItemAnalysisRow {
  itemNumber: number;
  skill: string;
  questionPrompt: string;
  correctAnswer: string;
  totalTakers: number;
  correctCount: number;
  incorrectCount: number;
  difficultyIndex: number; // 0 to 1
  percentCorrect: number; // 0 to 100
  interpretation: string; // DepEd classification
  recommendation: string;
}

export interface ComparativeItemRow {
  itemNumber: number;
  skill: string;
  preCorrectPct: number;
  postCorrectPct: number;
  absoluteGainPct: number;
  normalizedGain: number; // Hake's g
  impactStatus: string;
}

export function getDifficultyInterpretation(p: number): {
  level: string;
  recommendation: string;
} {
  if (p >= 0.81) {
    return {
      level: 'Very Easy',
      recommendation: 'Mastered by class. Ready to advance to enrichment.',
    };
  }
  if (p >= 0.61) {
    return {
      level: 'Easy',
      recommendation: 'Good mastery. Retain item as benchmark.',
    };
  }
  if (p >= 0.41) {
    return {
      level: 'Moderate / Desirable',
      recommendation: 'Optimal discriminating power. Good assessment balance.',
    };
  }
  if (p >= 0.21) {
    return {
      level: 'Difficult',
      recommendation: 'Requires targeted classroom remediation & practice.',
    };
  }
  return {
    level: 'Very Difficult',
    recommendation: 'Critical gap: Re-teach concept with explicit examples.',
  };
}

// Calculate pre-test or post-test item analysis
export function computeItemAnalysis(
  records: StudentRecord[],
  phase: 'pretest' | 'posttest'
): ItemAnalysisRow[] {
  const phaseRecords = records.filter((r) => r.phase === phase);
  const questions =
    phase === 'pretest' ? PRETEST_QUESTIONS : POSTTEST_QUESTIONS;

  return questions.map((q, idx) => {
    const itemNum = idx + 1;
    const skill = q.skill;
    const questionPrompt = q.q;
    let correctAnswer = '';

    if (phase === 'pretest') {
      const preQ = PRETEST_QUESTIONS[idx];
      if (preQ.type === 'mc') {
        correctAnswer = preQ.options[preQ.answer] || '';
      } else {
        correctAnswer = preQ.accept[0] || '';
      }
    } else {
      const postQ = POSTTEST_QUESTIONS[idx];
      const letters = ['A', 'B', 'C', 'D'];
      const ansIdx = letters.indexOf(postQ.answer);
      correctAnswer =
        ansIdx >= 0 && postQ.opts[ansIdx]
          ? `${postQ.answer} (${postQ.opts[ansIdx]})`
          : postQ.answer;
    }

    let correctCount = 0;
    let totalTakers = 0;

    phaseRecords.forEach((rec) => {
      totalTakers += 1;
      if (rec.items && Array.isArray(rec.items)) {
        const itemObj = rec.items.find((it) => it.item === itemNum);
        if (itemObj && itemObj.correct) {
          correctCount += 1;
        }
      }
    });

    const incorrectCount = Math.max(0, totalTakers - correctCount);
    const difficultyIndex =
      totalTakers > 0 ? Number((correctCount / totalTakers).toFixed(3)) : 0;
    const percentCorrect =
      totalTakers > 0 ? Number(((correctCount / totalTakers) * 100).toFixed(1)) : 0;
    const { level, recommendation } =
      totalTakers > 0
        ? getDifficultyInterpretation(difficultyIndex)
        : { level: 'No Data', recommendation: 'Awaiting student submissions' };

    return {
      itemNumber: itemNum,
      skill,
      questionPrompt,
      correctAnswer,
      totalTakers,
      correctCount,
      incorrectCount,
      difficultyIndex,
      percentCorrect,
      interpretation: level,
      recommendation,
    };
  });
}

// Compute comparative item analysis between pre and post test
export function computeComparativeAnalysis(
  records: StudentRecord[]
): ComparativeItemRow[] {
  const preAnalysis = computeItemAnalysis(records, 'pretest');
  const postAnalysis = computeItemAnalysis(records, 'posttest');

  return preAnalysis.map((pre, idx) => {
    const post = postAnalysis[idx] || { percentCorrect: 0, skill: pre.skill };
    const prePct = pre.percentCorrect;
    const postPct = post.percentCorrect;
    const absGain = Number((postPct - prePct).toFixed(1));

    // Normalized gain: g = (post - pre) / (100 - pre)
    let g = 0;
    if (100 - prePct > 0) {
      g = Number(((postPct - prePct) / (100 - prePct)).toFixed(2));
    }

    let impactStatus = 'Emerging';
    if (postPct >= 80) {
      impactStatus = 'High Mastery (>=80%)';
    } else if (absGain >= 25) {
      impactStatus = 'Significant Improvement (+25%)';
    } else if (absGain > 0) {
      impactStatus = 'Positive Growth';
    } else if (absGain === 0 && prePct > 0) {
      impactStatus = 'Sustained Score';
    } else {
      impactStatus = 'Needs Reinforcement';
    }

    return {
      itemNumber: pre.itemNumber,
      skill: pre.skill,
      preCorrectPct: prePct,
      postCorrectPct: postPct,
      absoluteGainPct: absGain,
      normalizedGain: g,
      impactStatus,
    };
  });
}

// Build student master records map
export function buildUnifiedStudentMap(
  records: StudentRecord[],
  progressMap: Record<string, StudentProgress>,
  students: StudentInfo[] = []
): Record<
  string,
  {
    code: string;
    sex: string;
    grade: string;
    pretest?: StudentRecord;
    posttest?: StudentRecord;
    progress: StudentProgress;
  }
> {
  const map: Record<
    string,
    {
      code: string;
      sex: string;
      grade: string;
      pretest?: StudentRecord;
      posttest?: StudentRecord;
      progress: StudentProgress;
    }
  > = {};

  students.forEach((s) => {
    const code = s.code.toUpperCase();
    map[code] = {
      code,
      sex: s.sex || '–',
      grade: s.grade || 'Grade 6 - Mabini',
      progress: progressMap[code] || {},
    };
  });

  Object.keys(progressMap).forEach((codeKey) => {
    const code = codeKey.toUpperCase();
    if (!map[code]) {
      map[code] = {
        code,
        sex: '–',
        grade: 'Grade 6 - Mabini',
        progress: progressMap[code] || {},
      };
    } else {
      map[code].progress = progressMap[code] || {};
    }
  });

  records.forEach((rec) => {
    const code = rec.code.toUpperCase();
    if (!map[code]) {
      map[code] = {
        code,
        sex: rec.sex || '–',
        grade: rec.grade || 'Grade 6 - Mabini',
        progress: progressMap[code] || {},
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
}

export function exportMultiTabExcel(
  records: StudentRecord[],
  progressMap: Record<string, StudentProgress>,
  students: StudentInfo[] = []
): void {
  const wb = XLSX.utils.book_new();
  const unifiedMap = buildUnifiedStudentMap(records, progressMap, students);
  const studentCodes = Object.keys(unifiedMap).sort();

  // TAB 1: Summary & Master Scores
  const summaryHeader = [
    'Student Code',
    'Sex',
    'Grade & Section',
    'Pre-Test Score',
    'Pre-Test Total',
    'Pre-Test %',
    'Post-Test Score',
    'Post-Test Total',
    'Post-Test %',
    'Score Gain (+/-)',
    'Percentage Gain (%)',
    'S1: Thought',
    'S2: Order',
    'S3: SVA',
    'S4: Punctuation',
    'S5: Master',
    'Missions Completed (/5)',
    'Overall Status',
  ];
  const summaryRows: any[][] = [summaryHeader];
  let sumPre = 0;
  let countPre = 0;
  let sumPost = 0;
  let countPost = 0;

  studentCodes.forEach((code) => {
    const s = unifiedMap[code];
    const pre = s.pretest;
    const post = s.posttest;
    const prog = s.progress || {};

    const preScore = pre ? pre.score : '';
    const preTotal = pre ? pre.total : '';
    const prePct = pre && pre.total ? `${Math.round((pre.score / pre.total) * 100)}%` : '';

    const postScore = post ? post.score : '';
    const postTotal = post ? post.total : '';
    const postPct = post && post.total ? `${Math.round((post.score / post.total) * 100)}%` : '';

    let diff: string | number = '';
    let pctGain = '';
    if (pre && post) {
      diff = post.score - pre.score;
      pctGain = `${Number((((post.score - pre.score) / pre.total) * 100).toFixed(1))}%`;
      sumPre += pre.score;
      countPre += 1;
      sumPost += post.score;
      countPost += 1;
    } else if (pre) {
      sumPre += pre.score;
      countPre += 1;
    } else if (post) {
      sumPost += post.score;
      countPost += 1;
    }

    const s1Done = Boolean(prog.s1 && (prog.s1 as any).completedAt);
    const s2Done = Boolean(prog.s2 && (prog.s2 as any).completedAt);
    const s3Done = Boolean(prog.s3 && (prog.s3 as any).completedAt);
    const s4Done = Boolean(prog.s4 && (prog.s4 as any).completedAt);
    const s5Done = Boolean(prog.s5 && (prog.s5 as any).completedAt);
    const completedMissions = [s1Done, s2Done, s3Done, s4Done, s5Done].filter(Boolean).length;

    let overallStatus = 'In Progress';
    if (pre && post && completedMissions === 5) {
      overallStatus = 'Completed All Phases';
    } else if (pre && !post) {
      overallStatus = 'Awaiting Post-Test';
    } else if (!pre) {
      overallStatus = 'Awaiting Pre-Test';
    }

    summaryRows.push([
      s.code,
      s.sex,
      s.grade,
      preScore,
      preTotal,
      prePct,
      postScore,
      postTotal,
      postPct,
      diff,
      pctGain,
      s1Done ? 'COMPLETED' : 'Pending',
      s2Done ? 'COMPLETED' : 'Pending',
      s3Done ? 'COMPLETED' : 'Pending',
      s4Done ? 'COMPLETED' : 'Pending',
      s5Done ? 'COMPLETED' : 'Pending',
      `${completedMissions}/5`,
      overallStatus,
    ]);
  });

  if (studentCodes.length > 0) {
    summaryRows.push([]);
    const avgPre = countPre > 0 ? (sumPre / countPre).toFixed(2) : '–';
    const avgPost = countPost > 0 ? (sumPost / countPost).toFixed(2) : '–';
    const avgGain =
      countPre > 0 && countPost > 0
        ? (Number(avgPost) - Number(avgPre)).toFixed(2)
        : '–';

    summaryRows.push([
      'CLASS AVERAGE',
      '–',
      `Total Students: ${studentCodes.length}`,
      avgPre,
      '20',
      countPre > 0 ? `${Math.round((Number(avgPre) / 20) * 100)}%` : '–',
      avgPost,
      '20',
      countPost > 0 ? `${Math.round((Number(avgPost) / 20) * 100)}%` : '–',
      avgGain,
      '–',
      '–',
      '–',
      '–',
      '–',
      '–',
      '–',
      '–',
    ]);
  }

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // TAB 2: Pre-Test Detailed
  const pretestHeader = [
    'Student Code',
    'Sex',
    'Grade & Section',
    'Date Finished',
    'Pre-Test Score',
    'Total Questions',
    'Score %',
    'Completeness of Thought (/5)',
    'Word Order and Arrangement (/5)',
    'Subject Verb Agreement (/5)',
    'Punctuation and Capitalization (/5)',
    ...Array.from({ length: 20 }, (_, i) => `Item ${i + 1} (Score)`),
    ...Array.from({ length: 20 }, (_, i) => `Item ${i + 1} (Response)`),
  ];
  const pretestRows: any[][] = [pretestHeader];

  studentCodes.forEach((code) => {
    const s = unifiedMap[code];
    const rec = s.pretest;
    if (!rec) {
      pretestRows.push([
        s.code,
        s.sex,
        s.grade,
        'Not taken yet',
        '–',
        '20',
        '–',
        '–',
        '–',
        '–',
        '–',
      ]);
      return;
    }
    const bySkill = rec.bySkill || {};
    const skillThought = bySkill['Completeness of Thought']
      ? `${bySkill['Completeness of Thought'].score}/5`
      : '–';
    const skillOrder = bySkill['Word Order and Arrangement']
      ? `${bySkill['Word Order and Arrangement'].score}/5`
      : '–';
    const skillSVA = bySkill['Subject Verb Agreement']
      ? `${bySkill['Subject Verb Agreement'].score}/5`
      : '–';
    const skillPunct = bySkill['Punctuation and Capitalization']
      ? `${bySkill['Punctuation and Capitalization'].score}/5`
      : '–';

    const itemScores: number[] = [];
    const itemResponses: string[] = [];
    for (let i = 1; i <= 20; i++) {
      const it = rec.items ? rec.items.find((item) => item.item === i) : undefined;
      itemScores.push(it ? (it.correct ? 1 : 0) : 0);
      itemResponses.push(it ? it.response || '' : '');
    }

    pretestRows.push([
      rec.code,
      rec.sex || s.sex,
      rec.grade || s.grade,
      rec.finishedAt || '–',
      rec.score,
      rec.total,
      `${Math.round((rec.score / rec.total) * 100)}%`,
      skillThought,
      skillOrder,
      skillSVA,
      skillPunct,
      ...itemScores,
      ...itemResponses,
    ]);
  });
  const wsPretest = XLSX.utils.aoa_to_sheet(pretestRows);
  XLSX.utils.book_append_sheet(wb, wsPretest, 'Pre-Test');

  // TAB 3: Post-Test Detailed
  const posttestHeader = [
    'Student Code',
    'Sex',
    'Grade & Section',
    'Date Finished',
    'Post-Test Score',
    'Total Questions',
    'Score %',
    'Word Order and Arrangement (/10)',
    'Completeness of Thought (/5)',
    'Punctuation and Capitalization (/5)',
    ...Array.from({ length: 20 }, (_, i) => `Item ${i + 1} (Score)`),
    ...Array.from({ length: 20 }, (_, i) => `Item ${i + 1} (Response)`),
  ];
  const posttestRows: any[][] = [posttestHeader];

  studentCodes.forEach((code) => {
    const s = unifiedMap[code];
    const rec = s.posttest;
    if (!rec) {
      posttestRows.push([
        s.code,
        s.sex,
        s.grade,
        'Not taken yet',
        '–',
        '20',
        '–',
        '–',
        '–',
        '–',
      ]);
      return;
    }
    const bySkill = rec.bySkill || {};
    const skillOrder = bySkill['Word Order and Arrangement']
      ? `${bySkill['Word Order and Arrangement'].score}/10`
      : '–';
    const skillThought = bySkill['Completeness of Thought']
      ? `${bySkill['Completeness of Thought'].score}/5`
      : '–';
    const skillPunct = bySkill['Punctuation and Capitalization']
      ? `${bySkill['Punctuation and Capitalization'].score}/5`
      : '–';

    const itemScores: number[] = [];
    const itemResponses: string[] = [];
    for (let i = 1; i <= 20; i++) {
      const it = rec.items ? rec.items.find((item) => item.item === i) : undefined;
      itemScores.push(it ? (it.correct ? 1 : 0) : 0);
      itemResponses.push(it ? it.response || '' : '');
    }

    posttestRows.push([
      rec.code,
      rec.sex || s.sex,
      rec.grade || s.grade,
      rec.finishedAt || '–',
      rec.score,
      rec.total,
      `${Math.round((rec.score / rec.total) * 100)}%`,
      skillOrder,
      skillThought,
      skillPunct,
      ...itemScores,
      ...itemResponses,
    ]);
  });
  const wsPosttest = XLSX.utils.aoa_to_sheet(posttestRows);
  XLSX.utils.book_append_sheet(wb, wsPosttest, 'Post-Test');

  // TABS 4 to 8: Individual Sessions 1 to 5
  MISSIONS.forEach((m) => {
    const sessionHeader = [
      'Student Code',
      'Sex',
      'Grade & Section',
      'Mission Title',
      'Focus Learning Competency',
      'Status',
      'Completion Timestamp',
    ];
    const sessionRows: any[][] = [sessionHeader];

    studentCodes.forEach((code) => {
      const s = unifiedMap[code];
      const prog = s.progress || {};
      const sessionItem = prog[m.key];
      const completedAt =
        sessionItem && typeof sessionItem === 'object' && 'completedAt' in sessionItem
          ? sessionItem.completedAt
          : '';
      const isDone = Boolean(completedAt);

      sessionRows.push([
        s.code,
        s.sex,
        s.grade,
        `Mission ${m.day}: ${m.missionTitle}`,
        m.skill,
        isDone ? 'COMPLETED' : 'Not Completed',
        completedAt || '–',
      ]);
    });

    const wsSession = XLSX.utils.aoa_to_sheet(sessionRows);
    XLSX.utils.book_append_sheet(wb, wsSession, `Session ${m.day}`);
  });

  // TAB 9: Item Analysis - Pre-Test
  const preAnalysis = computeItemAnalysis(records, 'pretest');
  const preAnalysisHeader = [
    'Item #',
    'Target Competency / Skill',
    'Question Prompt',
    'Correct Answer Key',
    'Total Examinees (N)',
    'Correct Count (R)',
    'Incorrect Count (W)',
    'Difficulty Index (p)',
    'Mastery % (Correct)',
    'DepEd Difficulty Level',
    'Pedagogical Recommendation',
  ];
  const preAnalysisRows: any[][] = [
    preAnalysisHeader,
    ...preAnalysis.map((row) => [
      row.itemNumber,
      row.skill,
      row.questionPrompt,
      row.correctAnswer,
      row.totalTakers,
      row.correctCount,
      row.incorrectCount,
      row.difficultyIndex,
      `${row.percentCorrect}%`,
      row.interpretation,
      row.recommendation,
    ]),
  ];
  const wsPreAnalysis = XLSX.utils.aoa_to_sheet(preAnalysisRows);
  XLSX.utils.book_append_sheet(wb, wsPreAnalysis, 'Item Analysis - Pre');

  // TAB 10: Item Analysis - Post-Test
  const postAnalysis = computeItemAnalysis(records, 'posttest');
  const postAnalysisHeader = [
    'Item #',
    'Target Competency / Skill',
    'Question Prompt',
    'Correct Answer Key',
    'Total Examinees (N)',
    'Correct Count (R)',
    'Incorrect Count (W)',
    'Difficulty Index (p)',
    'Mastery % (Correct)',
    'DepEd Difficulty Level',
    'Pedagogical Recommendation',
  ];
  const postAnalysisRows: any[][] = [
    postAnalysisHeader,
    ...postAnalysis.map((row) => [
      row.itemNumber,
      row.skill,
      row.questionPrompt,
      row.correctAnswer,
      row.totalTakers,
      row.correctCount,
      row.incorrectCount,
      row.difficultyIndex,
      `${row.percentCorrect}%`,
      row.interpretation,
      row.recommendation,
    ]),
  ];
  const wsPostAnalysis = XLSX.utils.aoa_to_sheet(postAnalysisRows);
  XLSX.utils.book_append_sheet(wb, wsPostAnalysis, 'Item Analysis - Post');

  // TAB 11: Comparative Item Analysis
  const comparativeList = computeComparativeAnalysis(records);
  const comparativeHeader = [
    'Item #',
    'Target Competency / Skill',
    'Pre-Test Mastery %',
    'Post-Test Mastery %',
    'Absolute % Gain',
    "Normalized Gain (Hake's g)",
    'Action Research Impact Status',
  ];
  const comparativeRows: any[][] = [
    comparativeHeader,
    ...comparativeList.map((row) => [
      row.itemNumber,
      row.skill,
      `${row.preCorrectPct}%`,
      `${row.postCorrectPct}%`,
      row.absoluteGainPct > 0 ? `+${row.absoluteGainPct}%` : `${row.absoluteGainPct}%`,
      row.normalizedGain,
      row.impactStatus,
    ]),
  ];
  const wsComparative = XLSX.utils.aoa_to_sheet(comparativeRows);
  XLSX.utils.book_append_sheet(wb, wsComparative, 'Comparative Analysis');

  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `GramCo-Complete-Class-Assessment-${dateStr}.xlsx`;
  XLSX.writeFile(wb, filename);
}
