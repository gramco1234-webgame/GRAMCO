import { QuestionBreakdown, SkillScore } from '../types';

export interface MissionDef {
  key: string;
  day: number;
  icon: string;
  skill: string;
  title: string;
  missionTitle: string;
  missionDesc: string;
  badgeName: string;
}

export const MISSIONS: MissionDef[] = [
  {
    key: 's1',
    day: 1,
    icon: '🧩',
    skill: 'Completeness of Thought',
    title: 'Session 1 – Completeness of Thought',
    missionTitle: 'Complete the Thought',
    missionDesc: 'Learn how to identify sentences that express a complete thought.',
    badgeName: 'Complete Thought Master',
  },
  {
    key: 's2',
    day: 2,
    icon: '🎯',
    skill: 'Word Order and Arrangement',
    title: 'Session 2 – Word Order and Arrangement',
    missionTitle: 'Arrange It Right!',
    missionDesc: 'Learn how to put words in the correct order to make sense.',
    badgeName: 'Word Order Expert',
  },
  {
    key: 's3',
    day: 3,
    icon: '🤝',
    skill: 'Subject Verb Agreement',
    title: 'Session 3 – Subject Verb Agreement',
    missionTitle: 'Subject-Verb Match',
    missionDesc: 'Learn how subjects and verbs must agree in singular and plural.',
    badgeName: 'Subject Verb Match Master',
  },
  {
    key: 's4',
    day: 3,
    icon: '✍️',
    skill: 'Punctuation and Capitalization',
    title: 'Session 4 – Punctuation and Capitalization',
    missionTitle: 'Punctuation & Capitalization',
    missionDesc: 'Learn how to use capital letters and punctuation correctly.',
    badgeName: 'Punctuation Pro',
  },
  {
    key: 's5',
    day: 4,
    icon: '🏆',
    skill: 'Putting It All Together',
    title: 'Session 5 – Putting It All Together',
    missionTitle: 'Sentence Builder Challenge',
    missionDesc: 'Combine all your sentence-building skills for the ultimate test!',
    badgeName: 'GramCo Sentence Builder',
  },
];

export interface PretestMCQuestion {
  type: 'mc';
  skill: string;
  hint?: string;
  q: string;
  options: string[];
  answer: number;
}

export interface PretestOrderQuestion {
  type: 'order';
  skill: string;
  hint?: string;
  q: string;
  words: string[];
  accept: string[];
}

export type PretestQuestion = PretestMCQuestion | PretestOrderQuestion;

export const PRETEST_QUESTIONS: PretestQuestion[] = [
  {
    type: 'mc',
    skill: 'Completeness of Thought',
    hint: 'A complete sentence has a subject and a verb, and expresses a full idea.',
    q: 'Which of these is a complete sentence?',
    options: [
      'Running through the park.',
      'The dog is running through the park.',
      'Because it was raining.',
      'Under the old bridge.',
    ],
    answer: 1,
  },
  {
    type: 'mc',
    skill: 'Completeness of Thought',
    q: 'Which sentence expresses a complete thought?',
    options: [
      'The children after school.',
      'When the bell rang.',
      'The children went home after school.',
      'Went home quickly.',
    ],
    answer: 2,
  },
  {
    type: 'mc',
    skill: 'Completeness of Thought',
    q: 'Choose the complete sentence.',
    options: [
      'My favorite subject.',
      'My favorite subject is Science.',
      'Is my favorite.',
      'Favorite subject in school.',
    ],
    answer: 1,
  },
  {
    type: 'order',
    skill: 'Word Order and Arrangement',
    hint: 'Tap the word pieces in the correct order to build the sentence.',
    q: 'Arrange the words into a correct sentence.',
    words: ['to school', 'every day', 'walks', 'Maria'],
    accept: ['Maria walks to school every day', 'Every day Maria walks to school'],
  },
  {
    type: 'order',
    skill: 'Word Order and Arrangement',
    q: 'Arrange the words into a correct sentence.',
    words: ['every weekend', 'Ben', 'reads', 'comic books'],
    accept: ['Ben reads comic books every weekend', 'Every weekend Ben reads comic books'],
  },
  {
    type: 'order',
    skill: 'Word Order and Arrangement',
    q: 'Arrange the words into a correct sentence.',
    words: ['in the park', 'The children', 'played', 'yesterday'],
    accept: [
      'The children played in the park yesterday',
      'The children played yesterday in the park',
      'Yesterday the children played in the park',
    ],
  },
  {
    type: 'mc',
    skill: 'Subject Verb Agreement',
    hint: 'The verb must match the subject – singular subjects take singular verbs, plural subjects take plural verbs.',
    q: 'The boys ___ playing basketball.',
    options: ['is', 'are', 'was', 'be'],
    answer: 1,
  },
  {
    type: 'mc',
    skill: 'Subject Verb Agreement',
    q: 'She ___ her homework every night.',
    options: ['do', 'does', 'doing', 'did'],
    answer: 1,
  },
  {
    type: 'mc',
    skill: 'Subject Verb Agreement',
    q: 'The cat and the dog ___ sleeping.',
    options: ['is', 'are', 'was', 'am'],
    answer: 1,
  },
  {
    type: 'mc',
    skill: 'Punctuation and Capitalization',
    hint: 'Sentences start with a capital letter and end with the correct punctuation mark.',
    q: 'Which sentence is written correctly?',
    options: [
      'my teacher is Mrs Santos',
      'My teacher is Mrs. Santos.',
      'my Teacher is mrs santos',
      'My teacher is mrs Santos',
    ],
    answer: 1,
  },
  {
    type: 'mc',
    skill: 'Punctuation and Capitalization',
    q: 'Which sentence is written correctly?',
    options: [
      'Do you like mangoes',
      'do you like mangoes?',
      'Do you like mangoes?',
      'do You like Mangoes.',
    ],
    answer: 2,
  },
  {
    type: 'mc',
    skill: 'Punctuation and Capitalization',
    q: 'Which sentence is written correctly?',
    options: [
      'we live in pilar, sorsogon.',
      'We live in Pilar, Sorsogon.',
      'We live in pilar Sorsogon',
      'we Live In Pilar, sorsogon.',
    ],
    answer: 1,
  },
  {
    type: 'mc',
    skill: 'Completeness of Thought',
    q: 'Which sentence expresses a complete thought?',
    options: [
      'Because the students arrived late.',
      'When the students arrived at school.',
      'The students arrived at school late.',
      'Although the students arrived late.',
    ],
    answer: 2,
  },
  {
    type: 'mc',
    skill: 'Completeness of Thought',
    q: 'Which sentence expresses a complete thought?',
    options: [
      'The leftover pizza on the table.',
      'The leftover pizza is on the table.',
      'Because the pizza was leftover.',
      'After eating the leftover pizza.',
    ],
    answer: 1,
  },
  {
    type: 'mc',
    skill: 'Word Order and Arrangement',
    q: 'Which sentence has the correct word order?',
    options: [
      'The students quickly are running in the park.',
      'The park are running quickly in the students.',
      'The students are running quickly in the park.',
    ],
    answer: 2,
  },
  {
    type: 'mc',
    skill: 'Word Order and Arrangement',
    q: 'Which sentence has the correct word order?',
    options: [
      'He never eats breakfast.',
      'He eats never breakfast.',
      'Breakfast he never eats.',
    ],
    answer: 0,
  },
  {
    type: 'mc',
    skill: 'Subject Verb Agreement',
    q: 'His mother ___ him breakfast every morning.',
    options: ['give', 'gives', 'giving', 'are giving'],
    answer: 1,
  },
  {
    type: 'mc',
    skill: 'Subject Verb Agreement',
    q: 'The girls ___ their lessons every afternoon.',
    options: ['studies', 'studying', 'study', 'is studying'],
    answer: 2,
  },
  {
    type: 'mc',
    skill: 'Punctuation and Capitalization',
    q: 'Which sentence is written correctly?',
    options: [
      'she went to the store yesterday.',
      'She went to the store yesterday.',
      'She went to the store Yesterday.',
      'she went to the store Yesterday.',
    ],
    answer: 1,
  },
  {
    type: 'mc',
    skill: 'Punctuation and Capitalization',
    q: 'Which sentence is written correctly?',
    options: [
      'Ana went to manila to study!',
      'ana went to Manila to study?',
      'Ana went to Manila to study.',
      'Ana went to Manila to Study.',
    ],
    answer: 2,
  },
];

export interface PosttestQuestion {
  skill: string;
  q: string;
  opts: string[];
  answer: string; // 'A' | 'B' | 'C' | 'D'
}

export const POSTTEST_QUESTIONS: PosttestQuestion[] = [
  {
    skill: 'Subject-Verb Agreement',
    q: 'The Grade 6 student _____ her assignment every evening.',
    opts: [
      'A. complete',
      'B. completes',
      'C. completing',
    ],
    answer: 'B',
  },
  {
    skill: 'Subject-Verb Agreement',
    q: 'The boys _____ basketball after class',
    opts: [
      'A. plays',
      'B. playing',
      'C. play',
      'D. playes',
    ],
    answer: 'C',
  },
  {
    skill: 'Subject-Verb Agreement',
    q: 'Which sentence has correct subject-verb agreement?',
    opts: [
      'A. The books on the shelf is dusty.',
      'B. The books on the shelf are dusty.',
      'C. The book on the shelves are dusty.',
    ],
    answer: 'B',
  },
  {
    skill: 'Subject-Verb Agreement',
    q: 'Each of the pupils _____ a notebook.',
    opts: [
      'A. have',
      'B. are having',
      'C. were having',
      'D. has',
    ],
    answer: 'D',
  },
  {
    skill: 'Subject-Verb Arrangement',
    q: 'The pupils and their teacher ______ planting trees.',
    opts: [
      'A. is',
      'B. are',
      'C. am',
      'D. be',
    ],
    answer: 'B',
  },
  {
    skill: 'Completeness of Thought',
    q: 'Which of the following is a complete sentence?',
    opts: [
      'Every afternoon the boy played',
      'The played boy',
      'The boy played basketball',
      'The boy played basketball every afternoon.',
    ],
    answer: 'D',
  },
  {
    skill: 'Completeness of Thought',
    q: 'Which of the following is NOT a complete sentence?',
    opts: [
      'She went home after',
      'The party ended early.',
      'We went to the waterpark yesterday after school.',
      'The doctor is very friendly to patients.',
    ],
    answer: 'A',
  },
  {
    skill: 'Completeness of Thought',
    q: 'Which option expresses a complete thought without grammatical errors?',
    opts: [
      'I was running late.',
      'I woke up late because my alarm did not rang',
      'My alarm did not rang',
      'Because I woke up late',
    ],
    answer: 'A',
  },
  {
    skill: 'Completeness of Thought',
    q: 'Choose the sentence that expresses a complete thought.',
    opts: [
      'If you study hard',
      'If you study hard to the exam',
      'You will pass the exam if you study hard.',
      'Study hard for the exam',
    ],
    answer: 'C',
  },
  {
    skill: 'Completeness of Thought',
    q: 'Which of the following forms a fully detailed, complete sentence?',
    opts: [
      'The teacher gave us ice cream',
      'The teacher gave us ice cream as a reward.',
      'The ice cream the teacher gave',
      'We got rewarded',
    ],
    answer: 'B',
  },
  {
    skill: 'Punctuation and Capitalization',
    q: 'Choose the correctly punctuated and capitalized sentence.',
    opts: [
      'I traveled to countries like the Philippines, France, Canada, and Brazil.',
      'I traveled to country like philippines france canada and brazil.',
      'i traveled to country like philippines, france , canada and brazil.',
      'i traveled to country like philippines France Canada And brazil.',
    ],
    answer: 'A',
  },
  {
    skill: 'Punctuation and Capitalization',
    q: 'Which option uses correct capitalization and end punctuation for a question?',
    opts: [
      'What time does your school start on Monday?',
      'what time does your school start on monday?',
      'What time does your school start on monday?',
      'What time does your school start on monday.',
    ],
    answer: 'A',
  },
  {
    skill: 'Punctuation and Capitalization',
    q: 'Which sentence is correctly capitalized and punctuated?',
    opts: [
      'After work, we ate at McDo.',
      'after work we ate at mcdo.',
      'After Work we ate at mcdo.',
      'After work we ate at McDo',
    ],
    answer: 'A',
  },
  {
    skill: 'Punctuation and Capitalization',
    q: 'Choose the sentence with proper capitalization and punctuation.',
    opts: [
      'I wanted to walk my dog, but it was raining.',
      'I wanted to walk my Dog but it was raining.',
      'I wanted to walk my dog but it was raining.',
      'I wanted, to walk my dog but it was raining.',
    ],
    answer: 'A',
  },
  {
    skill: 'Punctuation and Capitalization',
    q: 'Which sentence uses standard capitalization and punctuation?',
    opts: [
      'Tomorrow, we will go to church.',
      'tomorrow we will go to church.',
      'Tomorrow,we will go to church.',
      'Tomorrow we will go to church',
    ],
    answer: 'A',
  },
  {
    skill: 'Word Order and Arrangement',
    q: 'Which sentence is arranged correctly?',
    opts: [
      'Early I woke up this morning.',
      'I woke up early this morning.',
      'This morning early I woke up.',
      'Woke up I this morning early.',
    ],
    answer: 'B',
  },
  {
    skill: 'Word Order and Arrangement',
    q: 'Rearrange the words into the correct order: (river / near / lives / family / My / the)',
    opts: [
      'My family lives near the river.',
      'Near the river my family lives.',
      'My family near the river lives.',
      'Lives my family near the river.',
    ],
    answer: 'A',
  },
  {
    skill: 'Word Order and Arrangement',
    q: 'Which sentence is arranged correctly?',
    opts: [
      'Fast the car drove down the street.',
      'The car drove fast down the street.',
      'Down the street fast the car drove.',
      'Drove the car down the street fast.',
    ],
    answer: 'B',
  },
  {
    skill: 'Word Order and Arrangement',
    q: 'Rearrange the words into the correct order: (present / brother / opened / his / carefully / My)',
    opts: [
      'My brother opened his present carefully.',
      'Carefully my brother opened his present.',
      'My brother his present opened carefully.',
      'Opened my brother carefully his present.',
    ],
    answer: 'A',
  },
  {
    skill: 'Word Order and Arrangement',
    q: 'Which sentence has the most natural and correct word order?',
    opts: [
      'Quietly she closed the door.',
      'She closed quietly the door.',
      'The door she quietly closed.',
      'Closed she the door quietly.',
    ],
    answer: 'A',
  },
];

export const SKILL_PART_MAP: Record<string, string> = {
  'Word Order and Arrangement': 'PART I & IV – WORD ORDER AND ARRANGEMENT',
  'Completeness of Thought': 'PART II – COMPLETENESS OF THOUGHT',
  'Punctuation and Capitalization': 'PART III – PUNCTUATION AND CAPITALIZATION',
  'Subject Verb Agreement': 'PART V – SUBJECT VERB AGREEMENT',
};

export const DEFAULT_TEACHER_PIN = '1234';
export const SCHOOL_NAME = 'Banuyo Elementary School – Grade 6';

function cleanText(text: string): string {
  return text.toLowerCase().replace(/[.!?,]/g, '').replace(/\s+/g, ' ').trim();
}

export function scorePretest(answers: any[]): {
  score: number;
  total: number;
  bySkill: Record<string, SkillScore>;
  items: QuestionBreakdown[];
} {
  let score = 0;
  const bySkill: Record<string, SkillScore> = {};
  const items: QuestionBreakdown[] = PRETEST_QUESTIONS.map((q, idx) => {
    const rawAnswer = answers[idx];
    let responseText = '';
    let isCorrect = false;

    if (q.type === 'mc') {
      const selectedIndex = rawAnswer as number;
      responseText = selectedIndex !== undefined && q.options[selectedIndex] ? q.options[selectedIndex] : '';
      isCorrect = selectedIndex === q.answer;
    } else {
      const orderIndexes = (rawAnswer || []) as number[];
      responseText = orderIndexes.map((i) => q.words[i]).join(' ');
      isCorrect = q.accept.some((acceptable) => cleanText(acceptable) === cleanText(responseText));
    }

    if (!bySkill[q.skill]) {
      bySkill[q.skill] = { score: 0, total: 0 };
    }
    bySkill[q.skill].total += 1;
    if (isCorrect) {
      score += 1;
      bySkill[q.skill].score += 1;
    }

    return {
      item: idx + 1,
      skill: q.skill,
      response: responseText,
      correct: isCorrect,
    };
  });

  return {
    score,
    total: PRETEST_QUESTIONS.length,
    bySkill,
    items,
  };
}

export function scorePosttest(answers: (string | null)[]): {
  score: number;
  total: number;
  bySkill: Record<string, SkillScore>;
  items: QuestionBreakdown[];
} {
  const letters = ['A', 'B', 'C', 'D'];
  let score = 0;
  const bySkill: Record<string, SkillScore> = {};
  const items: QuestionBreakdown[] = POSTTEST_QUESTIONS.map((q, idx) => {
    const selectedLetter = answers[idx];
    const isCorrect = selectedLetter === q.answer;
    const letterIndex = selectedLetter ? letters.indexOf(selectedLetter) : -1;
    const responseText = letterIndex !== -1 && q.opts[letterIndex] ? q.opts[letterIndex] : selectedLetter || '';

    if (!bySkill[q.skill]) {
      bySkill[q.skill] = { score: 0, total: 0 };
    }
    bySkill[q.skill].total += 1;
    if (isCorrect) {
      score += 1;
      bySkill[q.skill].score += 1;
    }

    return {
      item: idx + 1,
      skill: q.skill,
      response: responseText,
      correct: isCorrect,
    };
  });

  return {
    score,
    total: POSTTEST_QUESTIONS.length,
    bySkill,
    items,
  };
}
