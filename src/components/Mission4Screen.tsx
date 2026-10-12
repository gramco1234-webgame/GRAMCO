import React, { useState } from 'react';
import { StudentInfo } from '../types';
import { sound } from '../services/sound';
import { markSessionCompleted } from '../services/api';
import { Compass, ArrowRight } from 'lucide-react';

interface Mission4ScreenProps {
  student: StudentInfo;
  onFinish: () => void;
  onBackToHub: () => void;
  onProceedToMission5?: () => void;
}

const PRACTICE_ITEMS = [
  {
    q: 'Which sentence is written correctly?',
    options: [
      'A. Last December, Joana traveled to Japan.',
      'B. Last december, Joana traveled to Japan.',
      'C. Last december, joana traveled to Japan.',
      'D. Last December, Joana traveled to japan.',
    ],
    correct: 0,
    exp: 'Month (December), name (Joana), and place (Japan) all need capital letters!',
  },
  {
    q: 'Which sentence is written correctly?',
    options: [
      'A. I am going to school tomorrow.',
      'B. i Am going to school tomorrow.',
      'C. I am going to School Tomorrow.',
      'D. I am going to school Tomorrow.',
    ],
    correct: 0,
    exp: "Start with capital 'I'. Common nouns like school and tomorrow don't need capitals.",
  },
  {
    q: 'Which sentence is written correctly?',
    options: [
      'A. We re going to attend, a birthday party on friday.',
      'B. We re going to attend a birthday party, on Friday.',
      'C. We re going to attend a birthday, party on friday.',
      'D. We re going to attend a birthday party on Friday.',
    ],
    correct: 3,
    exp: 'Friday needs a capital letter and the sentence flows smoothly with a period at the end.',
  },
  {
    q: 'Which sentence is written correctly?',
    options: [
      'A. The students borrowed books from the library',
      'B. The students, borrowed books from the library?',
      'C. The students borrowed books from the library.',
      'D. The students borrowed books, from the library.',
    ],
    correct: 2,
    exp: 'It is a standard statement, so it ends with a period without unnecessary commas.',
  },
  {
    q: 'Which sentence is written correctly?',
    options: [
      'A. my family visited naga last summer.',
      'B. My family visited naga last summer.',
      'C. My family visited Naga last summer.',
      'D. My Family visited Naga Last Summer.',
    ],
    correct: 2,
    exp: "Capitalize the start of sentence ('My') and place name ('Naga').",
  },
];

export const Mission4Screen: React.FC<Mission4ScreenProps> = ({
  student,
  onFinish,
  onBackToHub,
  onProceedToMission5,
}) => {
  const [step, setStep] = useState(17);
  const [highlightPart, setHighlightPart] = useState<string | null>(null);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [fixedCaps, setFixedCaps] = useState(false);
  const [fixedPeriod, setFixedPeriod] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([
    null,
    null,
    null,
    null,
    null,
  ]);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
  ]);

  const goToStep = (s: number) => {
    sound.playPop();
    setStep(s);
    setSelectedOpt(null);
    setHighlightPart(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currQuiz = PRACTICE_ITEMS[quizIndex];
  const isQuizCurrentAnswered = quizAnswers[quizIndex] !== null;

  return (
    <div className="card p-6 sm:p-8 bg-[#12213b] border border-[#1e3458] rounded-[28px] shadow-[0_18px_40px_rgba(0,0,0,0.4)] animate-in fade-in duration-300">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1e3458]">
        <button
          type="button"
          onClick={onBackToHub}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#182b4a] hover:bg-[#20375d] border border-[#263c62] text-[#cbd8ec] hover:text-[#ffd166] text-xs font-bold transition-colors cursor-pointer"
          title="Exit and return to the Roadmap"
        >
          <Compass className="w-3.5 h-3.5 text-[#ffd166]" />
          <span>Exit to Roadmap</span>
        </button>
        <span className="text-xs font-black text-[#c99be0] uppercase bg-[#182b4a] px-3 py-1 rounded-full border border-[#263c62]">
          Mission 4 • Step {step - 16} of 15
        </span>
      </div>

      {step === 17 && (
        <div className="space-y-5">
          <div className="text-center py-2">
            <div className="text-6xl mb-2 animate-bounce">✍️</div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#c99be0]">
              MISSION 4 UNLOCKED!
            </h2>
            <p className="text-base text-white font-bold">
              PUNCTUATION & CAPITALIZATION
            </p>
          </div>

          <div className="flex items-start gap-3 bg-[#1a2c4a] p-3.5 rounded-2xl border border-[#27406a]">
            <div className="w-11 h-11 rounded-full bg-[#bfe3f7] text-2xl grid place-items-center flex-none">
              🦉
            </div>
            <p className="text-sm font-bold text-[#f4f7fc]">
              💡 You made your subjects and verbs match! Now let's make your
              sentences look correct and polished.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <div className="p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl text-purple-300 flex items-center gap-2">
              <span>🔤</span> Capital letters
            </div>
            <div className="p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl text-emerald-300 flex items-center gap-2">
              <span>.</span> Period
            </div>
            <div className="p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl text-blue-300 flex items-center gap-2">
              <span>?</span> Question mark
            </div>
            <div className="p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl text-yellow-300 flex items-center gap-2">
              <span>!</span> Exclamation mark
            </div>
          </div>

          <button
            type="button"
            onClick={() => goToStep(18)}
            className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
          >
            START MISSION 4 🚀
          </button>
        </div>
      )}

      {step === 18 && (
        <div className="space-y-4">
          <span className="text-xs font-bold text-[#c99be0]">
            👁️ I DO – GRAMMY'S TURN
          </span>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl space-y-1">
              <span className="font-black text-[#c99be0] block">
                RULE 1: 🔤 START WITH A CAPITAL LETTER
              </span>
              <p className="line-through text-[#ff9b8f]">
                ❌ she went to school.
              </p>
              <p className="text-[#6fe0ae] font-bold">
                ✅ She went to school.
              </p>
            </div>

            <div className="p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl space-y-1">
              <span className="font-black text-[#c99be0] block">
                RULE 2: 👤 NAMES START WITH CAPITAL LETTERS
              </span>
              <p className="line-through text-[#ff9b8f]">
                ❌ ana went to school.
              </p>
              <p className="text-[#6fe0ae] font-bold">
                ✅ Ana went to school.
              </p>
            </div>

            <div className="p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl space-y-1">
              <span className="font-black text-[#c99be0] block">
                RULE 3: 📍 PLACES START WITH CAPITAL LETTERS
              </span>
              <p className="line-through text-[#ff9b8f]">
                ❌ Ana went to manila.
              </p>
              <p className="text-[#6fe0ae] font-bold">
                ✅ Ana went to Manila.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => goToStep(19)}
            className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
          >
            NEXT ➡️
          </button>
        </div>
      )}

      {step === 19 && (
        <div className="space-y-4">
          <h2 className="text-xl font-black text-center text-[#f4f7fc]">
            🎯 CHOOSE THE RIGHT ENDING
          </h2>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-[#0d1a2e] border border-emerald-500/30 rounded-xl space-y-1">
              <span className="font-bold text-emerald-400 text-sm block">
                . PERIOD
              </span>
              <p className="text-[#cbd8ec]">Use for a standard statement.</p>
              <p className="text-[#6fe0ae] font-bold">
                👉 She went to school.
              </p>
            </div>
            <div className="p-3 bg-[#0d1a2e] border border-blue-500/30 rounded-xl space-y-1">
              <span className="font-bold text-blue-400 text-sm block">
                ? QUESTION MARK
              </span>
              <p className="text-[#cbd8ec]">Use when asking a question.</p>
              <p className="text-blue-300 font-bold">
                👉 Where is your bag?
              </p>
            </div>
            <div className="p-3 bg-[#0d1a2e] border border-yellow-500/30 rounded-xl space-y-1">
              <span className="font-bold text-yellow-400 text-sm block">
                ! EXCLAMATION MARK
              </span>
              <p className="text-[#cbd8ec]">
                Use for strong feeling or excitement.
              </p>
              <p className="text-yellow-300 font-bold">
                👉 Wow, that is amazing!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => goToStep(20)}
            className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
          >
            NEXT ➡️
          </button>
        </div>
      )}

      {step === 20 && (
        <div className="space-y-5">
          <span className="text-xs font-bold text-[#c99be0]">
            👁️ INTERACTIVE EXAMPLE
          </span>
          <div className="p-5 bg-[#0d1a2e] border border-[#223655] rounded-2xl text-center space-y-2">
            <p className="text-xs text-[#8ea0bc]">
              Tap the components below to inspect:
            </p>
            <div className="text-xl font-bold">
              <button
                type="button"
                onClick={() => setHighlightPart('name')}
                className={`px-2.5 py-1 m-1 rounded-lg border font-black cursor-pointer transition-all ${
                  highlightPart === 'name'
                    ? 'bg-[#3b82f6] text-white border-blue-400'
                    : 'bg-[#1e293b] text-blue-400 border-blue-500/30'
                }`}
              >
                Maria
              </button>
              <span className="text-[#cbd8ec]">went to school</span>
              <button
                type="button"
                onClick={() => setHighlightPart('period')}
                className={`px-2.5 py-1 m-1 rounded-lg border font-black cursor-pointer transition-all ${
                  highlightPart === 'period'
                    ? 'bg-[#22b07d] text-white border-emerald-400'
                    : 'bg-[#1e293b] text-emerald-400 border-emerald-500/30'
                }`}
              >
                .
              </button>
            </div>
          </div>

          {highlightPart === 'name' && (
            <div className="p-3 bg-[#1e293b] border border-blue-500 rounded-xl text-xs space-y-1 animate-in fade-in">
              <strong className="text-blue-400">
                👤 NAME & START CAPITAL:
              </strong>
              <p className="text-[#cbd8ec]">
                Maria is a person's name and begins the sentence, so it starts
                with capital 'M'.
              </p>
            </div>
          )}

          {highlightPart === 'period' && (
            <div className="p-3 bg-[#1e293b] border border-emerald-500 rounded-xl text-xs space-y-1 animate-in fade-in">
              <strong className="text-emerald-400">🎯 PERIOD (.):</strong>
              <p className="text-[#cbd8ec]">
                This sentence ends with a period because it tells a simple
                statement.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => goToStep(21)}
            className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
          >
            QUICK CHECK ➡️
          </button>
        </div>
      )}

      {step === 21 && (
        <div className="space-y-5">
          <span className="text-xs font-bold text-[#c99be0]">
            ⭐ QUICK CHECK
          </span>
          <h2 className="text-xl font-bold text-[#f4f7fc]">
            Which sentence is correct?
          </h2>

          <div className="grid gap-2.5">
            {[
              { id: 'A', text: 'she went to the store yesterday.' },
              { id: 'B', text: 'She went to the store yesterday.' },
              { id: 'C', text: 'She went to the store Yesterday.' },
              { id: 'D', text: 'she went to the store Yesterday.' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedOpt(item.id)}
                className={`p-3.5 rounded-xl border-2 font-bold text-left cursor-pointer ${
                  selectedOpt === item.id
                    ? item.id === 'B'
                      ? 'border-[#22b07d] bg-[#133328] text-[#6fe0ae]'
                      : 'border-[#ff5a4f] bg-[#381919]'
                    : 'border-[#223655] bg-[#0d1a2e]'
                }`}
              >
                {item.id}. {item.text}
              </button>
            ))}
          </div>

          {selectedOpt === 'B' && (
            <div className="p-3 bg-[#133328] border border-[#22b07d] rounded-xl text-xs font-bold text-[#6fe0ae]">
              Correct! Starts with a capital letter, common nouns like
              'yesterday' are lowercase, and ends with a period.
            </div>
          )}

          <button
            type="button"
            disabled={selectedOpt !== 'B'}
            onClick={() => goToStep(22)}
            className={`w-full h-14 font-black rounded-2xl text-lg ${
              selectedOpt === 'B'
                ? 'bg-[#f4b400] text-[#1c2b46] cursor-pointer'
                : 'bg-[#2a3850] text-[#7385a3]'
            }`}
          >
            START WE DO 🚀
          </button>
        </div>
      )}

      {step === 22 && (
        <div className="space-y-5">
          <span className="text-xs font-bold text-[#c99be0]">
            ⭐ WE DO CHALLENGE 1
          </span>
          <div className="p-4 bg-[#0d1a2e] border border-[#223655] rounded-2xl">
            <p className="text-xs text-[#8ea0bc] mb-1">
              Sentence: "ana went to school."
            </p>
            <p className="text-base font-bold text-white">
              What should be changed?
            </p>
          </div>
          <div className="grid gap-2.5">
            {[
              'A. Change ana to Ana.',
              'B. Change school to School.',
              'C. Remove the period.',
            ].map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedOpt(String(i))}
                className={`p-3.5 rounded-xl border-2 font-bold text-left cursor-pointer ${
                  selectedOpt === String(i)
                    ? i === 0
                      ? 'border-[#22b07d] bg-[#133328] text-[#6fe0ae]'
                      : 'border-[#ff5a4f] bg-[#381919]'
                    : 'border-[#223655] bg-[#0d1a2e]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={selectedOpt !== '0'}
            onClick={() => goToStep(23)}
            className={`w-full h-14 font-black rounded-2xl text-lg ${
              selectedOpt === '0'
                ? 'bg-[#f4b400] text-[#1c2b46] cursor-pointer'
                : 'bg-[#2a3850] text-[#7385a3]'
            }`}
          >
            NEXT ➡️
          </button>
        </div>
      )}

      {step === 23 && (
        <div className="space-y-5">
          <span className="text-xs font-bold text-[#c99be0]">
            ⭐ WE DO CHALLENGE 2
          </span>
          <div className="p-4 bg-[#0d1a2e] border border-[#223655] rounded-2xl">
            <p className="text-xs text-[#8ea0bc] mb-1">
              Fix the place name: "Ana went to manila to study."
            </p>
            <p className="text-base font-bold text-white">Which is correct?</p>
          </div>
          <div className="grid gap-2.5">
            {[
              'A. Ana went to manila to study.',
              'B. Ana went to Manila to study.',
              'C. ana went to Manila to study.',
            ].map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedOpt(String(i))}
                className={`p-3.5 rounded-xl border-2 font-bold text-left cursor-pointer ${
                  selectedOpt === String(i)
                    ? i === 1
                      ? 'border-[#22b07d] bg-[#133328] text-[#6fe0ae]'
                      : 'border-[#ff5a4f] bg-[#381919]'
                    : 'border-[#223655] bg-[#0d1a2e]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={selectedOpt !== '1'}
            onClick={() => goToStep(24)}
            className={`w-full h-14 font-black rounded-2xl text-lg ${
              selectedOpt === '1'
                ? 'bg-[#f4b400] text-[#1c2b46] cursor-pointer'
                : 'bg-[#2a3850] text-[#7385a3]'
            }`}
          >
            NEXT ➡️
          </button>
        </div>
      )}

      {step === 24 && (
        <div className="space-y-5">
          <span className="text-xs font-bold text-[#c99be0]">
            ⭐ WE DO CHALLENGE 3 – PUNCTUATION
          </span>
          <div className="p-4 bg-[#0d1a2e] border border-[#223655] rounded-2xl">
            <p className="text-lg font-bold text-white">
              "Where is your notebook ___"
            </p>
            <p className="text-xs text-[#8ea0bc] mt-1">
              Choose the correct punctuation mark:
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['.', '?', '!'].map((mark, i) => (
              <button
                key={mark}
                type="button"
                onClick={() => setSelectedOpt(String(i))}
                className={`p-4 rounded-xl border-2 text-2xl font-black text-center cursor-pointer ${
                  selectedOpt === String(i)
                    ? i === 1
                      ? 'border-[#22b07d] bg-[#133328] text-[#6fe0ae]'
                      : 'border-[#ff5a4f] bg-[#381919]'
                    : 'border-[#223655] bg-[#0d1a2e]'
                }`}
              >
                {mark}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={selectedOpt !== '1'}
            onClick={() => goToStep(25)}
            className={`w-full h-14 font-black rounded-2xl text-lg ${
              selectedOpt === '1'
                ? 'bg-[#f4b400] text-[#1c2b46] cursor-pointer'
                : 'bg-[#2a3850] text-[#7385a3]'
            }`}
          >
            NEXT ➡️
          </button>
        </div>
      )}

      {step === 25 && (
        <div className="space-y-5">
          <span className="text-xs font-bold text-[#c99be0]">
            ⭐ WE DO CHALLENGE 4 – PUNCTUATION
          </span>
          <div className="p-4 bg-[#0d1a2e] border border-[#223655] rounded-2xl">
            <p className="text-lg font-bold text-white">
              "Wow, you did a great job ___"
            </p>
            <p className="text-xs text-[#8ea0bc] mt-1">
              Choose the correct punctuation mark:
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['.', '?', '!'].map((mark, i) => (
              <button
                key={mark}
                type="button"
                onClick={() => setSelectedOpt(String(i))}
                className={`p-4 rounded-xl border-2 text-2xl font-black text-center cursor-pointer ${
                  selectedOpt === String(i)
                    ? i === 2
                      ? 'border-[#22b07d] bg-[#133328] text-[#6fe0ae]'
                      : 'border-[#ff5a4f] bg-[#381919]'
                    : 'border-[#223655] bg-[#0d1a2e]'
                }`}
              >
                {mark}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={selectedOpt !== '2'}
            onClick={() => goToStep(26)}
            className={`w-full h-14 font-black rounded-2xl text-lg ${
              selectedOpt === '2'
                ? 'bg-[#f4b400] text-[#1c2b46] cursor-pointer'
                : 'bg-[#2a3850] text-[#7385a3]'
            }`}
          >
            FIX BOTH CHALLENGE ➡️
          </button>
        </div>
      )}

      {step === 26 && (
        <div className="space-y-5">
          <h2 className="text-xl font-black text-center text-[#f4f7fc]">
            🔧 WE DO: FIX BOTH
          </h2>
          <div className="p-4 bg-[#0d1a2e] border border-[#223655] rounded-2xl text-center">
            <p className="text-xs text-[#8ea0bc] mb-1">Sentence Preview:</p>
            <p
              className={`text-lg font-black ${
                fixedCaps && fixedPeriod ? 'text-[#6fe0ae]' : 'text-[#ff9b8f]'
              }`}
            >
              {fixedCaps ? 'M' : 'm'}y friend {fixedCaps ? 'A' : 'a'}na lives in{' '}
              {fixedCaps ? 'N' : 'n'}aga{fixedPeriod ? '.' : ''}
            </p>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setFixedCaps(!fixedCaps);
              }}
              className={`w-full p-3.5 rounded-xl border-2 font-bold text-xs flex justify-between items-center cursor-pointer ${
                fixedCaps
                  ? 'border-[#22b07d] bg-[#133328] text-[#6fe0ae]'
                  : 'border-[#223655] bg-[#0d1a2e] text-white'
              }`}
            >
              <span>1. Fix Capital Letters (My, Ana, Naga)</span>
              <span>{fixedCaps ? '✅ FIXED' : '👆 TAP TO FIX'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setFixedPeriod(!fixedPeriod);
              }}
              className={`w-full p-3.5 rounded-xl border-2 font-bold text-xs flex justify-between items-center cursor-pointer ${
                fixedPeriod
                  ? 'border-[#22b07d] bg-[#133328] text-[#6fe0ae]'
                  : 'border-[#223655] bg-[#0d1a2e] text-white'
              }`}
            >
              <span>2. Add Ending Period (.)</span>
              <span>{fixedPeriod ? '✅ FIXED' : '👆 TAP TO FIX'}</span>
            </button>
          </div>

          {fixedCaps && fixedPeriod && (
            <div className="p-3 bg-[#133328] border border-[#22b07d] rounded-xl text-xs font-bold text-[#6fe0ae] animate-in fade-in">
              🎉 Both fixed! We need capital letters for sentence starts, names,
              and places, and a period at the end!
            </div>
          )}

          <button
            type="button"
            disabled={!fixedCaps || !fixedPeriod}
            onClick={() => goToStep(27)}
            className={`w-full h-14 font-black rounded-2xl text-lg ${
              fixedCaps && fixedPeriod
                ? 'bg-[#f4b400] text-[#1c2b46] cursor-pointer'
                : 'bg-[#2a3850] text-[#7385a3]'
            }`}
          >
            READY FOR YOU DO 🚀
          </button>
        </div>
      )}

      {/* STEP 27: YOU DO 5 Questions */}
      {step === 27 && (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#ffd166]">🎯 YOUR TURN!</span>
            <span className="text-xs font-bold text-[#8ea0bc]">
              Q {quizIndex + 1} / 5
            </span>
          </div>

          <div className="p-4 bg-[#0d1a2e] border border-[#223655] rounded-2xl text-base font-bold">
            {currQuiz.q}
          </div>

          <div className="grid gap-2.5">
            {currQuiz.options.map((opt, optIdx) => {
              const isSelected = quizAnswers[quizIndex] === optIdx;
              return (
                <button
                  key={optIdx}
                  type="button"
                  disabled={quizSubmitted[quizIndex]}
                  onClick={() => {
                    sound.playPop();
                    const updated = [...quizAnswers];
                    updated[quizIndex] = optIdx;
                    setQuizAnswers(updated);
                  }}
                  className={`p-3.5 rounded-xl border-2 font-bold text-left cursor-pointer ${
                    isSelected
                      ? 'border-[#f4b400] bg-[#3b2f12]'
                      : 'border-[#223655] bg-[#0d1a2e]'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {quizSubmitted[quizIndex] ? (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-2xl border ${
                  quizAnswers[quizIndex] === currQuiz.correct
                    ? 'bg-[#133328] border-[#22b07d] text-[#6fe0ae]'
                    : 'bg-[#381919] border-[#ff5a4f] text-[#ff9b8f]'
                }`}
              >
                <h4 className="font-black text-base">
                  {quizAnswers[quizIndex] === currQuiz.correct
                    ? '🎉 Correct!'
                    : '❌ Not quite right!'}
                </h4>
                <p className="text-xs text-[#cbd8ec] mt-1 font-semibold">
                  {currQuiz.exp}
                </p>
              </div>

              {quizIndex < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setQuizIndex(quizIndex + 1);
                  }}
                  className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl cursor-pointer"
                >
                  NEXT QUESTION ➡️
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => goToStep(28)}
                  className="w-full h-14 bg-[#22b07d] text-white text-lg font-black rounded-2xl cursor-pointer"
                >
                  FINISH MISSION 4 🎉
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              disabled={!isQuizCurrentAnswered}
              onClick={() => {
                sound.playCorrect();
                const updated = [...quizSubmitted];
                updated[quizIndex] = true;
                setQuizSubmitted(updated);
              }}
              className={`w-full h-14 font-black rounded-2xl text-lg ${
                isQuizCurrentAnswered
                  ? 'bg-[#f4b400] text-[#1c2b46] cursor-pointer'
                  : 'bg-[#2a3850] text-[#7385a3]'
              }`}
            >
              SUBMIT ANSWER
            </button>
          )}
        </div>
      )}

      {step === 28 && (
        <div className="space-y-5 text-center py-2">
          <div className="text-6xl animate-bounce">✍️</div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#c99be0]">
            MISSION 4 COMPLETE!
          </h2>
          <p className="text-xs font-black uppercase text-[#ffd166] tracking-widest">
            🎖️ PUNCTUATION PRO
          </p>

          <div className="p-4 bg-[#1a2c4a] rounded-2xl text-left border border-[#27406a]">
            <p className="text-xs sm:text-sm font-semibold text-[#cbd8ec]">
              🌟 Amazing! You can now use capital letters and punctuation marks
              correctly.
            </p>
          </div>

          <button
            type="button"
            onClick={() => goToStep(29)}
            className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
          >
            CONTINUE ➡️
          </button>
        </div>
      )}

      {step === 29 && (
        <div className="space-y-5 text-center py-2">
          <div className="text-6xl animate-bounce">🏆</div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#ffd166]">
            DAY 3 COMPLETE!
          </h2>

          <div className="p-4 bg-[#0d1a2e] rounded-2xl text-left border border-[#223655] space-y-2 text-xs">
            <h4 className="font-black text-[#ffd166] uppercase">
              Today's Achievements:
            </h4>
            <p className="text-[#6fe0ae] font-bold">
              ✅ Mission 3 – Subject-Verb Match (Subject-Verb Match Master)
            </p>
            <p className="text-[#c99be0] font-bold">
              ✅ Mission 4 – Punctuation & Capitalization (Punctuation Pro)
            </p>
          </div>

          {onProceedToMission5 ? (
            <div className="p-3 bg-[#133328] border border-[#22b07d] rounded-xl text-xs text-[#6fe0ae] font-bold text-center">
              🔓 Mission 5 has been authorized by your teacher/researcher.
            </div>
          ) : (
            <div className="p-3 bg-[#17253d] border border-[#27406a] rounded-xl text-xs text-[#ffd166] font-bold text-center">
              🔒 Mission 5 is locked. Please return to your Roadmap and wait for
              your teacher or researcher to unlock it.
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {onProceedToMission5 && (
              <button
                type="button"
                onClick={async () => {
                  sound.playFanfare();
                  await markSessionCompleted(student.code, 's4');
                  onProceedToMission5();
                }}
                className="flex-1 h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-base font-black rounded-2xl shadow-[0_5px_0_#c48f00] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>PROCEED TO MISSION 5</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={async () => {
                await markSessionCompleted(student.code, 's4');
                onFinish();
              }}
              className="px-6 h-14 bg-[#182b4a] hover:bg-[#223655] text-white text-base font-black rounded-2xl border border-[#2a3850] cursor-pointer flex-1"
            >
              Exit to Roadmap
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
