import {
  StudentRecord,
  StudentProgress,
  StudentInfo,
} from '../types';
import { MISSIONS } from '../data/curriculum';
import {
  buildUnifiedStudentMap,
  computeItemAnalysis,
  computeComparativeAnalysis,
} from './exportExcel';

export const escapeCell = (val: any): string => {
  const str = String(val ?? '');
  return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

export const formatRow = (cells: any[]): string => {
  return cells.map(escapeCell).join(',');
};

/**
 * 1. DEDICATED TEST SCORES CSV
 * Contains only Pre-Test and Post-Test scores, gains, dates, and per-skill breakdowns.
 */
export function generateTestsCsv(
  records: StudentRecord[],
  progressMap: Record<string, StudentProgress>,
  students: StudentInfo[] = []
): string {
  const lines: string[] = [];
  const unifiedMap = buildUnifiedStudentMap(records, progressMap, students);
  const studentCodes = Object.keys(unifiedMap).sort();

  lines.push('=== GRAMCO - TEST ASSESSMENT COMPARISON & SCORES REPORT ===');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');

  const headers = [
    'Student Code',
    'Sex',
    'Grade & Section',
    'Pre-Test Score (/20)',
    'Pre-Test %',
    'Pre-Test Finished At',
    'Post-Test Score (/20)',
    'Post-Test %',
    'Post-Test Finished At',
    'Net Score Gain (+/-)',
    'Percentage Gain (%)',
    'Test Status',
    'Pre: Completeness of Thought (/5)',
    'Pre: Word Order and Arrangement (/5)',
    'Pre: Subject Verb Agreement (/5)',
    'Pre: Punctuation and Capitalization (/5)',
    'Post: Word Order and Arrangement (/10)',
    'Post: Completeness of Thought (/5)',
    'Post: Punctuation and Capitalization (/5)',
  ];
  lines.push(formatRow(headers));

  let preSum = 0;
  let preCount = 0;
  let postSum = 0;
  let postCount = 0;

  studentCodes.forEach((code) => {
    const s = unifiedMap[code];
    const pre = s.pretest;
    const post = s.posttest;

    const preScore = pre ? String(pre.score) : '–';
    const prePct = pre ? `${Math.round((pre.score / pre.total) * 100)}%` : '–';
    const preDate = pre ? pre.finishedAt : '–';

    const postScore = post ? String(post.score) : '–';
    const postPct = post ? `${Math.round((post.score / post.total) * 100)}%` : '–';
    const postDate = post ? post.finishedAt : '–';

    let diff = '–';
    let pctGain = '–';
    if (pre && post) {
      const d = post.score - pre.score;
      diff = d > 0 ? `+${d}` : String(d);
      pctGain = `${Number((((post.score - pre.score) / pre.total) * 100).toFixed(1))}%`;
      preSum += pre.score;
      preCount += 1;
      postSum += post.score;
      postCount += 1;
    } else if (pre) {
      preSum += pre.score;
      preCount += 1;
    } else if (post) {
      postSum += post.score;
      postCount += 1;
    }

    let testStatus = 'Not Started';
    if (pre && post) testStatus = 'Both Completed';
    else if (pre && !post) testStatus = 'Pre-Test Only';
    else if (!pre && post) testStatus = 'Post-Test Only';

    const preSkills = pre?.bySkill || {};
    const postSkills = post?.bySkill || {};

    const preThought = preSkills['Completeness of Thought'] ? String(preSkills['Completeness of Thought'].score) : '–';
    const preOrder = preSkills['Word Order and Arrangement'] ? String(preSkills['Word Order and Arrangement'].score) : '–';
    const preSVA = preSkills['Subject Verb Agreement'] ? String(preSkills['Subject Verb Agreement'].score) : '–';
    const prePunct = preSkills['Punctuation and Capitalization'] ? String(preSkills['Punctuation and Capitalization'].score) : '–';

    const postOrder = postSkills['Word Order and Arrangement'] ? String(postSkills['Word Order and Arrangement'].score) : '–';
    const postThought = postSkills['Completeness of Thought'] ? String(postSkills['Completeness of Thought'].score) : '–';
    const postPunct = postSkills['Punctuation and Capitalization'] ? String(postSkills['Punctuation and Capitalization'].score) : '–';

    lines.push(
      formatRow([
        s.code,
        s.sex,
        s.grade,
        preScore,
        prePct,
        preDate,
        postScore,
        postPct,
        postDate,
        diff,
        pctGain,
        testStatus,
        preThought,
        preOrder,
        preSVA,
        prePunct,
        postOrder,
        postThought,
        postPunct,
      ])
    );
  });

  if (studentCodes.length > 0) {
    const avgPre = preCount > 0 ? (preSum / preCount).toFixed(2) : '–';
    const avgPost = postCount > 0 ? (postSum / postCount).toFixed(2) : '–';
    const avgGain =
      preCount > 0 && postCount > 0
        ? (Number(avgPost) - Number(avgPre)).toFixed(2)
        : '–';

    lines.push(
      formatRow([
        'CLASS AVERAGE',
        '–',
        `Total Students: ${studentCodes.length}`,
        avgPre,
        preCount > 0 ? `${Math.round((Number(avgPre) / 20) * 100)}%` : '–',
        '–',
        avgPost,
        postCount > 0 ? `${Math.round((Number(avgPost) / 20) * 100)}%` : '–',
        '–',
        avgGain,
        '–',
        '–',
        '–',
        '–',
        '–',
        '–',
        '–',
        '–',
        '–',
      ])
    );
  }

  return '\uFEFF' + lines.join('\r\n');
}

/**
 * 2. DEDICATED SESSION PROGRESS CSV
 * Contains only Missions/Sessions 1 to 5 status, completion dates, and progress rates.
 */
export function generateSessionsCsv(
  records: StudentRecord[],
  progressMap: Record<string, StudentProgress>,
  students: StudentInfo[] = []
): string {
  const lines: string[] = [];
  const unifiedMap = buildUnifiedStudentMap(records, progressMap, students);
  const studentCodes = Object.keys(unifiedMap).sort();

  lines.push('=== GRAMCO - SESSIONS & LEARNING MISSIONS PROGRESS REPORT ===');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');

  const headers = [
    'Student Code',
    'Sex',
    'Grade & Section',
    'Session 1: Completeness of Thought',
    'Session 1 Completed At',
    'Session 2: Word Order & Arrangement',
    'Session 2 Completed At',
    'Session 3: Subject-Verb Agreement',
    'Session 3 Completed At',
    'Session 4: Punctuation & Capitalization',
    'Session 4 Completed At',
    'Session 5: Putting It All Together',
    'Session 5 Completed At',
    'Total Missions Completed (/5)',
    'Completion Rate %',
    'Curriculum Status',
  ];
  lines.push(formatRow(headers));

  let totalCompletedAll = 0;
  let totalSessionsChecked = 0;

  studentCodes.forEach((code) => {
    const s = unifiedMap[code];
    const prog = s.progress || {};

    const sessionCols: string[] = [];
    let completedCount = 0;

    MISSIONS.forEach((m) => {
      const pItem = prog[m.key];
      const completedAt =
        pItem && typeof pItem === 'object' && 'completedAt' in pItem
          ? (pItem as any).completedAt
          : '';
      const isDone = Boolean(completedAt);
      if (isDone) completedCount += 1;

      sessionCols.push(isDone ? 'COMPLETED' : 'Pending');
      sessionCols.push(completedAt || '–');
    });

    totalCompletedAll += completedCount;
    totalSessionsChecked += 5;

    const completionPct = `${Math.round((completedCount / 5) * 100)}%`;
    let status = 'In Progress';
    if (completedCount === 5) status = 'All Missions Mastered';
    else if (completedCount === 0) status = 'Not Started';

    lines.push(
      formatRow([
        s.code,
        s.sex,
        s.grade,
        ...sessionCols,
        `${completedCount}/5`,
        completionPct,
        status,
      ])
    );
  });

  if (studentCodes.length > 0) {
    const classAvgRate =
      totalSessionsChecked > 0
        ? `${Math.round((totalCompletedAll / totalSessionsChecked) * 100)}%`
        : '0%';
    lines.push(
      formatRow([
        'CLASS SUMMARY',
        '–',
        `Total Students: ${studentCodes.length}`,
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
        `${(totalCompletedAll / studentCodes.length).toFixed(1)}/5`,
        classAvgRate,
        'Active Cohort',
      ])
    );
  }

  return '\uFEFF' + lines.join('\r\n');
}

/**
 * 3. DEDICATED ITEM ANALYSIS CSV
 * Contains pre-test and post-test question item statistics, difficulty index, and comparative growth.
 */
export function generateItemAnalysisCsv(records: StudentRecord[]): string {
  const lines: string[] = [];
  lines.push('=== GRAMCO - ITEM ANALYSIS & DEPED DIFFICULTY DIAGNOSTIC REPORT ===');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');

  // Pre-test section
  lines.push('--- PRE-TEST ITEM ANALYSIS (20 ITEMS) ---');
  const preAnalysis = computeItemAnalysis(records, 'pretest');
  lines.push(
    formatRow([
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
      'Pedagogical Recommendation',
    ])
  );
  preAnalysis.forEach((row) => {
    lines.push(
      formatRow([
        `Item ${row.itemNumber}`,
        row.skill,
        row.questionPrompt,
        row.correctAnswer,
        row.totalTakers,
        row.correctCount,
        row.incorrectCount,
        row.difficultyIndex.toFixed(3),
        `${row.percentCorrect}%`,
        row.interpretation,
        row.recommendation,
      ])
    );
  });

  lines.push('');
  // Post-test section
  lines.push('--- POST-TEST ITEM ANALYSIS (20 ITEMS) ---');
  const postAnalysis = computeItemAnalysis(records, 'posttest');
  lines.push(
    formatRow([
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
      'Pedagogical Recommendation',
    ])
  );
  postAnalysis.forEach((row) => {
    lines.push(
      formatRow([
        `Item ${row.itemNumber}`,
        row.skill,
        row.questionPrompt,
        row.correctAnswer,
        row.totalTakers,
        row.correctCount,
        row.incorrectCount,
        row.difficultyIndex.toFixed(3),
        `${row.percentCorrect}%`,
        row.interpretation,
        row.recommendation,
      ])
    );
  });

  lines.push('');
  // Comparative Gain section
  lines.push('--- COMPARATIVE ITEM GROWTH & HAKE\'S NORMALIZED GAIN ---');
  const comparative = computeComparativeAnalysis(records);
  lines.push(
    formatRow([
      'Item #',
      'Target Skill',
      'Pre-Test Mastery %',
      'Post-Test Mastery %',
      'Absolute % Gain',
      'Normalized Gain (g)',
      'Action Research Impact Status',
    ])
  );
  comparative.forEach((row) => {
    lines.push(
      formatRow([
        `Item ${row.itemNumber}`,
        row.skill,
        `${row.preCorrectPct}%`,
        `${row.postCorrectPct}%`,
        row.absoluteGainPct > 0 ? `+${row.absoluteGainPct}%` : `${row.absoluteGainPct}%`,
        row.normalizedGain.toFixed(2),
        row.impactStatus,
      ])
    );
  });

  return '\uFEFF' + lines.join('\r\n');
}

/**
 * 4. MASTER SEPARATED CSV
 * Contains distinct, clearly organized sections separating:
 * - Section 1: Test Assessment Scores & Growth (Pre-Test vs Post-Test)
 * - Section 2: Session & Mission Progression (Sessions 1 to 5)
 * - Section 3: Test Competency Breakdown
 * - Section 4: Pre-Test Item Analysis
 * - Section 5: Post-Test Item Analysis
 * - Section 6: Comparative Growth & Normalized Gain
 */
export function generateMasterCsv(
  records: StudentRecord[],
  progressMap: Record<string, StudentProgress>,
  students: StudentInfo[] = []
): string {
  const unifiedMap = buildUnifiedStudentMap(records, progressMap, students);
  const studentCodes = Object.keys(unifiedMap).sort();
  const lines: string[] = [];

  lines.push('================================================================================');
  lines.push('   GRAMCO COMPLETE EVALUATION REPORT - SEPARATED SCORES & SESSION PROGRESS     ');
  lines.push('================================================================================');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Total Registered Students: ${studentCodes.length}`);
  lines.push(`Total Test Submissions: ${records.length}`);
  lines.push('');

  // -------------------------------------------------------------
  // SECTION 1: TEST ASSESSMENT SCORES (PRE-TEST vs POST-TEST)
  // -------------------------------------------------------------
  lines.push('================================================================================');
  lines.push('=== SECTION 1: TEST ASSESSMENT SCORES (PRE-TEST vs POST-TEST) ===');
  lines.push('================================================================================');
  lines.push(
    formatRow([
      'Student Code',
      'Sex',
      'Grade & Section',
      'Pre-Test Score (/20)',
      'Pre-Test %',
      'Pre-Test Date Finished',
      'Post-Test Score (/20)',
      'Post-Test %',
      'Post-Test Date Finished',
      'Score Gain (+/-)',
      'Percentage Gain (%)',
      'Evaluation Status',
    ])
  );

  let preSum = 0;
  let preCount = 0;
  let postSum = 0;
  let postCount = 0;

  studentCodes.forEach((code) => {
    const s = unifiedMap[code];
    const pre = s.pretest;
    const post = s.posttest;

    const preScore = pre ? String(pre.score) : '–';
    const prePct = pre ? `${Math.round((pre.score / pre.total) * 100)}%` : '–';
    const preDate = pre ? pre.finishedAt : '–';

    const postScore = post ? String(post.score) : '–';
    const postPct = post ? `${Math.round((post.score / post.total) * 100)}%` : '–';
    const postDate = post ? post.finishedAt : '–';

    let diff = '–';
    let pctGain = '–';
    if (pre && post) {
      const d = post.score - pre.score;
      diff = d > 0 ? `+${d}` : String(d);
      pctGain = `${Number((((post.score - pre.score) / pre.total) * 100).toFixed(1))}%`;
      preSum += pre.score;
      preCount += 1;
      postSum += post.score;
      postCount += 1;
    } else if (pre) {
      preSum += pre.score;
      preCount += 1;
    } else if (post) {
      postSum += post.score;
      postCount += 1;
    }

    let status = 'Not Started';
    if (pre && post) status = 'Both Completed';
    else if (pre && !post) status = 'Pre-Test Only';
    else if (!pre && post) status = 'Post-Test Only';

    lines.push(
      formatRow([
        s.code,
        s.sex,
        s.grade,
        preScore,
        prePct,
        preDate,
        postScore,
        postPct,
        postDate,
        diff,
        pctGain,
        status,
      ])
    );
  });

  if (studentCodes.length > 0) {
    const avgPre = preCount > 0 ? (preSum / preCount).toFixed(2) : '–';
    const avgPost = postCount > 0 ? (postSum / postCount).toFixed(2) : '–';
    const avgGain =
      preCount > 0 && postCount > 0
        ? (Number(avgPost) - Number(avgPre)).toFixed(2)
        : '–';

    lines.push(
      formatRow([
        'CLASS AVERAGE',
        '–',
        `Total: ${studentCodes.length}`,
        avgPre,
        preCount > 0 ? `${Math.round((Number(avgPre) / 20) * 100)}%` : '–',
        '–',
        avgPost,
        postCount > 0 ? `${Math.round((Number(avgPost) / 20) * 100)}%` : '–',
        '–',
        avgGain,
        '–',
        '–',
      ])
    );
  }

  lines.push('');
  // -------------------------------------------------------------
  // SECTION 2: LEARNING SESSIONS & MISSIONS PROGRESSION (1 TO 5)
  // -------------------------------------------------------------
  lines.push('================================================================================');
  lines.push('=== SECTION 2: LEARNING SESSIONS & MISSIONS PROGRESSION (SESSIONS 1 TO 5) ===');
  lines.push('================================================================================');
  lines.push(
    formatRow([
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
      'Session Completion Rate %',
      'Overall Session Status',
    ])
  );

  let classSessionsDone = 0;
  studentCodes.forEach((code) => {
    const s = unifiedMap[code];
    const prog = s.progress || {};

    const sessionCols: string[] = [];
    let completedCount = 0;

    MISSIONS.forEach((m) => {
      const pItem = prog[m.key];
      const completedAt =
        pItem && typeof pItem === 'object' && 'completedAt' in pItem
          ? (pItem as any).completedAt
          : '';
      const isDone = Boolean(completedAt);
      if (isDone) completedCount += 1;

      sessionCols.push(isDone ? 'COMPLETED' : 'Pending');
      sessionCols.push(completedAt || '–');
    });

    classSessionsDone += completedCount;
    const completionPct = `${Math.round((completedCount / 5) * 100)}%`;
    let status = 'In Progress';
    if (completedCount === 5) status = 'All 5 Missions Complete';
    else if (completedCount === 0) status = 'Not Started';

    lines.push(
      formatRow([
        s.code,
        s.sex,
        s.grade,
        ...sessionCols,
        `${completedCount}/5`,
        completionPct,
        status,
      ])
    );
  });

  if (studentCodes.length > 0) {
    const classAvgMissions = (classSessionsDone / studentCodes.length).toFixed(1);
    const classAvgPct = `${Math.round((classSessionsDone / (studentCodes.length * 5)) * 100)}%`;
    lines.push(
      formatRow([
        'CLASS SUMMARY',
        '–',
        `Total: ${studentCodes.length}`,
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
        `${classAvgMissions}/5`,
        classAvgPct,
        'Active Cohort',
      ])
    );
  }

  lines.push('');
  // -------------------------------------------------------------
  // SECTION 3: TEST COMPETENCY & SKILLS BREAKDOWN
  // -------------------------------------------------------------
  lines.push('================================================================================');
  lines.push('=== SECTION 3: TEST COMPETENCY & SKILLS BREAKDOWN ===');
  lines.push('================================================================================');
  lines.push(
    formatRow([
      'Student Code',
      'Pre: Thought (/5)',
      'Pre: Word Order (/5)',
      'Pre: SVA (/5)',
      'Pre: Punctuation (/5)',
      'Post: Thought (/5)',
      'Post: Word Order (/10)',
      'Post: Punctuation (/5)',
    ])
  );

  studentCodes.forEach((code) => {
    const s = unifiedMap[code];
    const preSkills = s.pretest?.bySkill || {};
    const postSkills = s.posttest?.bySkill || {};

    lines.push(
      formatRow([
        s.code,
        preSkills['Completeness of Thought'] ? `${preSkills['Completeness of Thought'].score}/5` : '–',
        preSkills['Word Order and Arrangement'] ? `${preSkills['Word Order and Arrangement'].score}/5` : '–',
        preSkills['Subject Verb Agreement'] ? `${preSkills['Subject Verb Agreement'].score}/5` : '–',
        preSkills['Punctuation and Capitalization'] ? `${preSkills['Punctuation and Capitalization'].score}/5` : '–',
        postSkills['Completeness of Thought'] ? `${postSkills['Completeness of Thought'].score}/5` : '–',
        postSkills['Word Order and Arrangement'] ? `${postSkills['Word Order and Arrangement'].score}/10` : '–',
        postSkills['Punctuation and Capitalization'] ? `${postSkills['Punctuation and Capitalization'].score}/5` : '–',
      ])
    );
  });

  lines.push('');
  // -------------------------------------------------------------
  // SECTION 4: PRE-TEST ITEM ANALYSIS (20 ITEMS)
  // -------------------------------------------------------------
  lines.push('================================================================================');
  lines.push('=== SECTION 4: PRE-TEST ITEM ANALYSIS (20 ITEMS - DEPED STANDARD) ===');
  lines.push('================================================================================');
  lines.push(
    formatRow([
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
      'Pedagogical Recommendation',
    ])
  );
  const preAnalysis = computeItemAnalysis(records, 'pretest');
  preAnalysis.forEach((row) => {
    lines.push(
      formatRow([
        `Item ${row.itemNumber}`,
        row.skill,
        row.questionPrompt,
        row.correctAnswer,
        row.totalTakers,
        row.correctCount,
        row.incorrectCount,
        row.difficultyIndex.toFixed(3),
        `${row.percentCorrect}%`,
        row.interpretation,
        row.recommendation,
      ])
    );
  });

  lines.push('');
  // -------------------------------------------------------------
  // SECTION 5: POST-TEST ITEM ANALYSIS (20 ITEMS)
  // -------------------------------------------------------------
  lines.push('================================================================================');
  lines.push('=== SECTION 5: POST-TEST ITEM ANALYSIS (20 ITEMS - DEPED STANDARD) ===');
  lines.push('================================================================================');
  lines.push(
    formatRow([
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
      'Pedagogical Recommendation',
    ])
  );
  const postAnalysis = computeItemAnalysis(records, 'posttest');
  postAnalysis.forEach((row) => {
    lines.push(
      formatRow([
        `Item ${row.itemNumber}`,
        row.skill,
        row.questionPrompt,
        row.correctAnswer,
        row.totalTakers,
        row.correctCount,
        row.incorrectCount,
        row.difficultyIndex.toFixed(3),
        `${row.percentCorrect}%`,
        row.interpretation,
        row.recommendation,
      ])
    );
  });

  lines.push('');
  // -------------------------------------------------------------
  // SECTION 6: COMPARATIVE ITEM GROWTH (HAKE'S NORMALIZED GAIN)
  // -------------------------------------------------------------
  lines.push('================================================================================');
  lines.push('=== SECTION 6: COMPARATIVE ITEM GROWTH & ACTION RESEARCH IMPACT ===');
  lines.push('================================================================================');
  lines.push(
    formatRow([
      'Item #',
      'Target Skill',
      'Pre-Test Mastery %',
      'Post-Test Mastery %',
      'Absolute % Gain',
      'Normalized Gain (g)',
      'Action Research Impact Status',
    ])
  );
  const comparative = computeComparativeAnalysis(records);
  comparative.forEach((row) => {
    lines.push(
      formatRow([
        `Item ${row.itemNumber}`,
        row.skill,
        `${row.preCorrectPct}%`,
        `${row.postCorrectPct}%`,
        row.absoluteGainPct > 0 ? `+${row.absoluteGainPct}%` : `${row.absoluteGainPct}%`,
        row.normalizedGain.toFixed(2),
        row.impactStatus,
      ])
    );
  });

  return '\uFEFF' + lines.join('\r\n');
}

/**
 * Trigger CSV download in browser
 */
export function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
