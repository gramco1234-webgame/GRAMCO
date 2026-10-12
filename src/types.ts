export interface StudentInfo {
  code: string;
  grade: string;
  sex: string;
  addedAt?: string;
}

export interface QuestionBreakdown {
  item: number;
  skill: string;
  response: string;
  correct: boolean;
}

export interface SkillScore {
  score: number;
  total: number;
}

export interface StudentRecord {
  recordType: 'test' | 'mission';
  phase: 'pretest' | 'posttest' | string;
  code: string;
  sex: string;
  grade: string;
  finishedAt: string;
  score: number;
  total: number;
  bySkill: Record<string, SkillScore>;
  items?: QuestionBreakdown[];
}

export interface StudentProgress {
  startedAt?: string;
  [sessionKey: string]: { completedAt: string } | string | undefined;
}

export interface SessionAccess {
  s1?: boolean;
  s2?: boolean;
  s3?: boolean;
  s4?: boolean;
  s5?: boolean;
  posttest?: boolean;
}

export interface SessionRelease {
  s1: boolean;
  s2: boolean;
  s3: boolean;
  s4: boolean;
  s5: boolean;
  posttest: boolean;
}

export interface CompiledStudentSummary {
  code: string;
  sex: string;
  grade: string;
  pretest?: StudentRecord;
  posttest?: StudentRecord;
  progress?: StudentProgress;
  access?: SessionAccess;
}
