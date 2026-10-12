import React, { useState } from 'react';
import { StudentInfo } from '../types';
import { sound } from '../services/sound';
import { markSessionCompleted } from '../services/api';
import { Compass, Sparkles, ArrowRight } from 'lucide-react';

interface Mission3ScreenProps {
  student: StudentInfo;
  onFinish: () => void;
  onBackToHub: () => void;
  onProceedToMission4?: () => void;
}

const PRACTICE_ITEMS = [
  {
    q: 'She ___ board game.',
    options: ['A. play', 'B. plays', 'C. played', 'D. playing'],
    correct: 1,
    exp: 'She is ONE person, so we use plays (verb + s).',
  },
  {
    q: 'The dog ___ on the bed.',
    options: ['A. sleeps', 'B. sleep', 'C. sleeping', 'D. slept'],
    correct: 0,
    exp: 'The dog is ONE animal, so sleeps is correct.',
  },
  {
    q: 'My dad ___ cooks dinner.',
    options: ['A. cook', 'B. cooks', 'C. cooking'],
    correct: 1,
    exp: 'My dad is ONE person, so cooks agrees with dad.',
  },
  {
    q: 'The girls ___ run to school.',
    options: ['A. runs', 'B. run', 'C. running'],
    correct: 1,
    exp: 'The girls is MORE THAN ONE, so we use the base verb run.',
  },
  {
    q: 'My friends ___ pizza.',
    options: ['A. like', 'B. likes', 'C. liking'],
    correct: 0,
    exp: 'My friends is MORE THAN ONE, so we use like.',
  },
];

export const Mission3Screen: React.FC<Mission3ScreenProps> = ({
  student,
  onFinish,
  onBackToHub,
  onProceedToMission4,
}) => {
  const [step, setStep] = useState(1);
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
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
    setActiveHighlight(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [matchError, setMatchError] = useState<string | null>(null);

  const handleSelectSubject = (subj: string) => {
    sound.playPop();
    setSelectedSubject(subj);
    setMatchError(null);
  };

  const handleSelectVerb = (verb: string) => {
    if (!selectedSubject) return;
    const correctMatch: Record<string, string> = {
      'The dog': 'barks',
      'The dogs': 'bark',
      Ana: 'studies',
      'Ana and Mia': 'study',
    };
    if (correctMatch[selectedSubject] === verb) {
      sound.playCorrect();
      setMatchedPairs({
        ...matchedPairs,
        [selectedSubject]: verb,
      });
      setSelectedSubject(null);
      setMatchError(null);
    } else {
      sound.playPop();
      setMatchError(`"${selectedSubject}" does not agree with "${verb}". Try again!`);
      setTimeout(() => setMatchError(null), 3500);
    }
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
        <span className="text-xs font-black text-[#ffd166] uppercase bg-[#182b4a] px-3 py-1 rounded-full border border-[#263c62]">
          Mission 3 • Step {step} of 16
        </span>
      </div>

      {step === 1 && (
        <div className="space-y-5 text-center">
          <div className="text-6xl animate-bounce">🤝</div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#ffd166]">
            DAY 3 IS UNLOCKED!
          </h2>
          <div className="flex items-start gap-3 bg-[#1a2c4a] p-4 rounded-2xl border border-[#27406a] text-left">
            <div className="w-12 h-12 rounded-full bg-[#bfe3f7] text-2xl grid place-items-center flex-none">
              🦉
            </div>
            <div>
              <h4 className="font-bold text-[#ffd166] text-sm">Grammy says:</h4>
              <p className="text-xs sm:text-sm text-[#f4f7fc] mt-1 font-semibold">
                👋 Welcome to Day 3, Sentence Builders! 🎉 Today is special
                because you have <strong>TWO missions</strong> to complete!
              </p>
            </div>
          </div>

          <div className="space-y-2.5 text-left">
            <div className="p-3.5 rounded-xl bg-[#0d1a2e] border border-[#f4b400]/40 flex items-center gap-3">
              <span className="text-2xl">🤝</span>
              <div>
                <span className="text-xs font-black text-[#ffd166] uppercase block">
                  Mission 3
                </span>
                <strong className="text-sm text-white">Subject-Verb Match</strong>
                <p className="text-xs text-[#8ea0bc]">
                  Learn how to make the subject and verb agree.
                </p>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0d1a2e] border border-[#223655] flex items-center gap-3 opacity-80">
              <span className="text-2xl">✍️</span>
              <div>
                <span className="text-xs font-black text-[#c99be0] uppercase block">
                  Mission 4
                </span>
                <strong className="text-sm text-white">
                  Punctuation & Capitalization
                </strong>
                <p className="text-xs text-[#8ea0bc]">
                  Learn how to make sentences look correct.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => goToStep(2)}
            className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
          >
            START DAY 3 🚀
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <h2 className="text-2xl font-black text-center text-[#f4f7fc]">
            📋 TODAY'S CHALLENGES
          </h2>
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[#133328] border-2 border-[#22b07d] space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-[#6fe0ae] text-base">
                  MISSION 3: SUBJECT-VERB MATCH
                </h3>
                <span className="text-xs font-black bg-[#22b07d]/20 text-[#6fe0ae] px-2.5 py-0.5 rounded-full">
                  READY
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-[#cbd8ec]">
                <div className="bg-[#0d1a2e] p-2 rounded-lg">1. Subject</div>
                <div className="bg-[#0d1a2e] p-2 rounded-lg">2. Verb</div>
                <div className="bg-[#0d1a2e] p-2 rounded-lg">3. Agreement</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0d1a2e] border border-[#223655] opacity-75 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-[#b5c3db] text-base">
                  MISSION 4: PUNCTUATION & CAPITALIZATION
                </h3>
                <span className="text-xs text-[#7385a3]">Opens Next</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => goToStep(3)}
            className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
          >
            START MISSION 3 🚀
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <span className="inline-block text-xs font-black px-3 py-1 rounded-full bg-[#182b4a] text-[#ffd166]">
            📋 MISSION 3 BRIEFING
          </span>
          <div className="flex items-start gap-3 bg-[#1a2c4a] p-3.5 rounded-2xl border border-[#27406a]">
            <div className="w-11 h-11 rounded-full bg-[#bfe3f7] text-2xl grid place-items-center flex-none">
              🦉
            </div>
            <p className="text-sm font-bold text-[#f4f7fc]">
              💡 Every sentence has a <strong>subject</strong> and a{' '}
              <strong>verb</strong>. They need to match!
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl flex items-center gap-3">
              <span className="text-xl">👤</span>
              <div>
                <strong className="text-xs font-black text-[#8ecdf5] block">
                  SUBJECT:
                </strong>
                <span className="text-xs text-[#8ea0bc]">
                  Who or what is the sentence about?
                </span>
              </div>
            </div>
            <div className="p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl flex items-center gap-3">
              <span className="text-xl">🏃</span>
              <div>
                <strong className="text-xs font-black text-[#ffd166] block">
                  VERB:
                </strong>
                <span className="text-xs text-[#8ea0bc]">
                  What does the subject do?
                </span>
              </div>
            </div>
            <div className="p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl flex items-center gap-3">
              <span className="text-xl">🤝</span>
              <div>
                <strong className="text-xs font-black text-[#6fe0ae] block">
                  MATCH:
                </strong>
                <span className="text-xs text-[#8ea0bc]">
                  Does the verb agree with the subject count?
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#381919] border border-[#ff5a4f]/40 rounded-xl text-xs space-y-1">
            <p className="line-through text-[#ff9b8f]">
              ❌ The boy play basketball.
            </p>
            <p className="text-[#6fe0ae] font-bold">
              ✅ The boy plays basketball.
            </p>
          </div>

          <button
            type="button"
            onClick={() => goToStep(4)}
            className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
          >
            LET'S LEARN! 🚀
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-5">
          <h2 className="text-2xl font-black text-center text-[#f4f7fc]">
            👥 GROUP ROLES
          </h2>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-[#0d1a2e] border border-[#223655] rounded-xl">
              <span className="font-bold text-[#ffd166] block">📖 READER</span>
              <span className="text-[#8ea0bc]">Reads sentence aloud.</span>
            </div>
            <div className="p-2.5 bg-[#0d1a2e] border border-[#223655] rounded-xl">
              <span className="font-bold text-[#8ecdf5] block">💡 SOLVER</span>
              <span className="text-[#8ea0bc]">Suggests the answer.</span>
            </div>
            <div className="p-2.5 bg-[#0d1a2e] border border-[#223655] rounded-xl">
              <span className="font-bold text-[#6fe0ae] block">🔍 CHECKER</span>
              <span className="text-[#8ea0bc]">Checks subject & verb.</span>
            </div>
            <div className="p-2.5 bg-[#0d1a2e] border border-[#223655] rounded-xl">
              <span className="font-bold text-[#c99be0] block">🗣️ EXPLAINER</span>
              <span className="text-[#8ea0bc]">Explains the reason.</span>
            </div>
          </div>

          <div className="p-3 bg-[#3b2f12] border border-[#c48f00] rounded-xl text-center text-xs font-bold text-[#ffd166]">
            Group Strategy: FIND ➡️ COUNT ➡️ MATCH ➡️ CHECK ➡️ EXPLAIN
          </div>

          <button
            type="button"
            onClick={() => goToStep(5)}
            className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
          >
            GOT IT! 👍
          </button>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-5">
          <span className="text-xs font-bold text-[#8ea0bc]">
            👁️ I DO – GRAMMY'S TURN
          </span>
          <div className="p-5 bg-[#0d1a2e] border border-[#223655] rounded-2xl text-center space-y-2">
            <p className="text-xs text-[#8ea0bc]">
              Tap each part of the sentence below:
            </p>
            <div className="text-xl font-bold">
              <button
                type="button"
                onClick={() => setActiveHighlight('subject')}
                className={`px-2.5 py-1 m-1 rounded-lg border font-black cursor-pointer transition-all ${
                  activeHighlight === 'subject'
                    ? 'bg-[#3b82f6] text-white border-blue-400'
                    : 'bg-[#1e293b] text-blue-400 border-blue-500/30'
                }`}
              >
                The boy
              </button>
              <button
                type="button"
                onClick={() => setActiveHighlight('verb')}
                className={`px-2.5 py-1 m-1 rounded-lg border font-black cursor-pointer transition-all ${
                  activeHighlight === 'verb'
                    ? 'bg-[#eab308] text-[#1c2b46] border-yellow-300'
                    : 'bg-[#1e293b] text-yellow-400 border-yellow-500/30'
                }`}
              >
                plays
              </button>
              <span className="text-[#cbd8ec]">basketball.</span>
            </div>
          </div>

          {activeHighlight === 'subject' && (
            <div className="p-3 bg-[#1e293b] border border-blue-500 rounded-xl text-xs space-y-1 animate-in fade-in">
              <strong className="text-blue-400">👤 SUBJECT: "The boy"</strong>
              <p className="text-[#cbd8ec]">
                The sentence is about ONE boy (singular).
              </p>
            </div>
          )}

          {activeHighlight === 'verb' && (
            <div className="p-3 bg-[#1e293b] border border-yellow-500 rounded-xl text-xs space-y-1 animate-in fade-in">
              <strong className="text-yellow-400">🏃 VERB: "plays"</strong>
              <p className="text-[#cbd8ec]">
                Because the subject is ONE, we use the verb with an 's'.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => goToStep(6)}
            className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
          >
            NEXT ➡️
          </button>
        </div>
      )}

      {step === 6 && (
        <div className="space-y-5">
          <h2 className="text-2xl font-black text-center text-[#f4f7fc]">
            ONE OR MORE THAN ONE?
          </h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-[#0d1a2e] border border-[#3b82f6]/40 rounded-xl space-y-2">
              <strong className="text-blue-400 block font-black">
                👤 ONE (Singular)
              </strong>
              <p className="text-[#cbd8ec]">
                The boy → <span className="text-yellow-400 font-bold">plays</span>
              </p>
              <p className="text-[#cbd8ec]">
                Maria → <span className="text-yellow-400 font-bold">studies</span>
              </p>
              <p className="text-[#cbd8ec]">
                The dog → <span className="text-yellow-400 font-bold">barks</span>
              </p>
            </div>
            <div className="p-3.5 bg-[#0d1a2e] border border-[#a855f7]/40 rounded-xl space-y-2">
              <strong className="text-purple-400 block font-black">
                👥 MORE THAN ONE
              </strong>
              <p className="text-[#cbd8ec]">
                The boys → <span className="text-emerald-400 font-bold">play</span>
              </p>
              <p className="text-[#cbd8ec]">
                The students →{' '}
                <span className="text-emerald-400 font-bold">study</span>
              </p>
              <p className="text-[#cbd8ec]">
                The dogs → <span className="text-emerald-400 font-bold">bark</span>
              </p>
            </div>
          </div>

          <div className="p-3 bg-[#3b2f12] border border-[#c48f00] rounded-xl text-xs font-bold text-[#ffd166]">
            💡 EASY RULE: ONE → Verb + S | MORE THAN ONE → Base Verb (No S)
          </div>

          <button
            type="button"
            onClick={() => goToStep(7)}
            className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
          >
            NEXT ➡️
          </button>
        </div>
      )}

      {step === 7 && (
        <div className="space-y-5">
          <span className="text-xs font-bold text-[#8ea0bc]">
            👁️ I DO EXAMPLE 1
          </span>
          <div className="p-4 bg-[#0d1a2e] border border-[#223655] rounded-2xl">
            <p className="text-lg font-bold text-[#f4f7fc]">
              His mother{' '}
              <span className="text-[#ffd166] border-b-2 border-[#ffd166] px-2">
                ___
              </span>{' '}
              him breakfast every morning.
            </p>
          </div>
          <div className="space-y-2 text-sm font-bold">
            <div className="p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl opacity-60">
              A. give
            </div>
            <div className="p-3 bg-[#133328] border-2 border-[#22b07d] text-[#6fe0ae] rounded-xl flex justify-between">
              <span>B. gives</span>
              <span>✅ Correct</span>
            </div>
            <div className="p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl opacity-60">
              C. giving
            </div>
            <div className="p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl opacity-60">
              D. are giving
            </div>
          </div>
          <p className="text-xs text-[#cbd8ec] font-semibold">
            Mother is ONE person, so "gives" matches the singular subject.
          </p>
          <button
            type="button"
            onClick={() => goToStep(8)}
            className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
          >
            NEXT ➡️
          </button>
        </div>
      )}

      {step === 8 && (
        <div className="space-y-5">
          <span className="text-xs font-bold text-[#8ea0bc]">
            👁️ I DO EXAMPLE 2
          </span>
          <div className="p-4 bg-[#0d1a2e] border border-[#223655] rounded-2xl">
            <p className="text-lg font-bold text-[#f4f7fc]">
              The girls{' '}
              <span className="text-[#ffd166] border-b-2 border-[#ffd166] px-2">
                ___
              </span>{' '}
              their lessons every afternoon.
            </p>
          </div>
          <div className="space-y-2 text-sm font-bold">
            <div className="p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl opacity-60">
              A. studies
            </div>
            <div className="p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl opacity-60">
              B. studying
            </div>
            <div className="p-3 bg-[#133328] border-2 border-[#22b07d] text-[#6fe0ae] rounded-xl flex justify-between">
              <span>C. study</span>
              <span>✅ Correct</span>
            </div>
            <div className="p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl opacity-60">
              D. is studying
            </div>
          </div>
          <p className="text-xs text-[#cbd8ec] font-semibold">
            "Girls" means MORE THAN ONE, so we use the base verb "study".
          </p>
          <button
            type="button"
            onClick={() => goToStep(9)}
            className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
          >
            QUICK CHECK ➡️
          </button>
        </div>
      )}

      {step === 9 && (
        <div className="space-y-5">
          <span className="text-xs font-bold text-[#ffd166]">⭐ QUICK CHECK</span>
          <div className="p-4 bg-[#0d1a2e] border border-[#223655] rounded-2xl">
            <p className="text-lg font-bold text-[#f4f7fc]">
              The cat{' '}
              <span className="text-[#ffd166] border-b-2 border-[#ffd166] px-2">
                ___
              </span>{' '}
              on the sofa.
            </p>
          </div>
          <div className="grid gap-2.5">
            {[
              { id: 'A', text: 'sleep' },
              { id: 'B', text: 'sleeps' },
              { id: 'C', text: 'sleeping' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedOpt(item.id)}
                className={`p-3.5 rounded-xl border-2 font-bold text-left cursor-pointer ${
                  selectedOpt === item.id
                    ? item.id === 'B'
                      ? 'border-[#22b07d] bg-[#133328] text-[#6fe0ae]'
                      : 'border-[#ff5a4f] bg-[#381919] text-[#ff9b8f]'
                    : 'border-[#223655] bg-[#0d1a2e]'
                }`}
              >
                {item.id}. {item.text}
              </button>
            ))}
          </div>

          {selectedOpt === 'B' && (
            <div className="p-3 bg-[#133328] border border-[#22b07d] rounded-xl text-xs font-bold text-[#6fe0ae]">
              Correct! "The cat" is ONE animal, so "sleeps" is correct!
            </div>
          )}

          <button
            type="button"
            disabled={selectedOpt !== 'B'}
            onClick={() => goToStep(10)}
            className={`w-full h-14 font-black rounded-2xl text-lg ${
              selectedOpt === 'B'
                ? 'bg-[#f4b400] text-[#1c2b46] shadow-[0_5px_0_#c48f00] cursor-pointer'
                : 'bg-[#2a3850] text-[#7385a3] cursor-not-allowed'
            }`}
          >
            START WE DO 🚀
          </button>
        </div>
      )}

      {step === 10 && (
        <div className="space-y-5">
          <span className="text-xs font-bold text-[#ffd166]">
            ⭐ WE DO CHALLENGE 1
          </span>
          <div className="p-4 bg-[#0d1a2e] border border-[#223655] rounded-2xl text-lg font-bold">
            The boy ___ basketball every afternoon.
          </div>
          <div className="grid gap-2.5">
            {['A. play', 'B. plays', 'C. playing'].map((opt, i) => (
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
            onClick={() => goToStep(11)}
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

      {step === 11 && (
        <div className="space-y-5">
          <span className="text-xs font-bold text-[#ffd166]">
            ⭐ WE DO CHALLENGE 2
          </span>
          <div className="p-4 bg-[#0d1a2e] border border-[#223655] rounded-2xl text-lg font-bold">
            The children ___ in the playground.
          </div>
          <div className="grid gap-2.5">
            {['A. plays', 'B. play', 'C. is playing'].map((opt, i) => (
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
            onClick={() => goToStep(12)}
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

      {step === 12 && (
        <div className="space-y-5">
          <span className="text-xs font-bold text-[#ffd166]">
            ⭐ WE DO CHALLENGE 3
          </span>
          <div className="p-4 bg-[#0d1a2e] border border-[#223655] rounded-2xl text-lg font-bold">
            Maria ___ English every day.
          </div>
          <div className="grid gap-2.5">
            {['A. study', 'B. studies', 'C. studying'].map((opt, i) => (
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
            onClick={() => goToStep(13)}
            className={`w-full h-14 font-black rounded-2xl text-lg ${
              selectedOpt === '1'
                ? 'bg-[#f4b400] text-[#1c2b46] cursor-pointer'
                : 'bg-[#2a3850] text-[#7385a3]'
            }`}
          >
            PLAY MATCHING GAME 🎮
          </button>
        </div>
      )}

      {/* STEP 13: Matching Game */}
      {step === 13 && (
        <div className="space-y-5">
          <h2 className="text-xl sm:text-2xl font-black text-center text-[#f4f7fc]">
            🎮 MATCH SUBJECT & VERB
          </h2>
          <p className="text-xs text-center text-[#8ea0bc] font-semibold">
            Tap a Subject, then tap its matching Verb!
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <span className="text-xs font-bold text-blue-400 uppercase">
                Subjects
              </span>
              {['The dog', 'The dogs', 'Ana', 'Ana and Mia'].map((subj) => {
                const isMatched = Boolean(matchedPairs[subj]);
                return (
                  <button
                    key={subj}
                    type="button"
                    disabled={isMatched}
                    onClick={() => handleSelectSubject(subj)}
                    className={`w-full p-3 rounded-xl text-xs font-bold text-left border transition-all cursor-pointer ${
                      isMatched
                        ? 'bg-[#133328] border-[#22b07d] text-[#6fe0ae] opacity-75'
                        : selectedSubject === subj
                        ? 'bg-[#3b82f6] border-blue-400 text-white ring-2 ring-blue-400'
                        : 'bg-[#0d1a2e] border-[#223655] text-[#cbd8ec] hover:border-blue-400'
                    }`}
                  >
                    👤 {subj} {isMatched && '✓'}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-yellow-400 uppercase">
                Verbs
              </span>
              {['barks', 'bark', 'studies', 'study'].map((verb) => {
                const isUsed = Object.values(matchedPairs).includes(verb);
                return (
                  <button
                    key={verb}
                    type="button"
                    disabled={isUsed}
                    onClick={() => handleSelectVerb(verb)}
                    className={`w-full p-3 rounded-xl text-xs font-bold text-left border transition-all cursor-pointer ${
                      isUsed
                        ? 'bg-[#133328] border-[#22b07d] text-[#6fe0ae] opacity-75'
                        : 'bg-[#0d1a2e] border-[#223655] text-[#cbd8ec] hover:border-yellow-400'
                    }`}
                  >
                    🏃 {verb} {isUsed && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {matchError && (
            <div className="p-3 bg-[#381919] border border-[#ff5a4f] rounded-xl text-center text-xs font-bold text-[#ff9b8f] animate-shake">
              ⚠️ {matchError}
            </div>
          )}

          {Object.keys(matchedPairs).length === 4 && (
            <div className="p-3 bg-[#133328] border border-[#22b07d] rounded-xl text-center text-xs font-bold text-[#6fe0ae] animate-in fade-in">
              🎉 Perfect! All subjects and verbs agreed!
            </div>
          )}

          <button
            type="button"
            disabled={Object.keys(matchedPairs).length < 4}
            onClick={() => goToStep(14)}
            className={`w-full h-14 font-black rounded-2xl text-lg ${
              Object.keys(matchedPairs).length === 4
                ? 'bg-[#f4b400] text-[#1c2b46] shadow-[0_5px_0_#c48f00] cursor-pointer'
                : 'bg-[#2a3850] text-[#7385a3] cursor-not-allowed'
            }`}
          >
            NEXT ➡️
          </button>
        </div>
      )}

      {step === 14 && (
        <div className="space-y-5">
          <span className="text-xs font-bold text-[#ff9b8f]">🔧 FIX IT!</span>
          <div className="p-4 bg-[#381919] border border-[#ff5a4f] rounded-2xl text-center text-lg font-bold text-[#ff9b8f]">
            "The girls studies every afternoon."
          </div>
          <div className="grid gap-2.5">
            {[
              { id: 'A', text: 'The girls studies every afternoon.' },
              { id: 'B', text: 'The girls study every afternoon.' },
              { id: 'C', text: 'The girls studying every afternoon.' },
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
              Explanation: "Girls" is plural, so we use "study".
            </div>
          )}
          <button
            type="button"
            disabled={selectedOpt !== 'B'}
            onClick={() => goToStep(15)}
            className={`w-full h-14 font-black rounded-2xl text-lg ${
              selectedOpt === 'B'
                ? 'bg-[#f4b400] text-[#1c2b46] cursor-pointer'
                : 'bg-[#2a3850] text-[#7385a3]'
            }`}
          >
            READY FOR YOU DO 🚀
          </button>
        </div>
      )}

      {/* STEP 15: YOU DO 5 Questions */}
      {step === 15 && (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#ffd166]">
              🎯 SHOW WHAT YOU KNOW!
            </span>
            <span className="text-xs font-bold text-[#8ea0bc]">
              Q {quizIndex + 1} / 5
            </span>
          </div>

          <div className="p-4 bg-[#0d1a2e] border border-[#223655] rounded-2xl text-lg font-bold">
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
                  onClick={() => goToStep(16)}
                  className="w-full h-14 bg-[#22b07d] text-white text-lg font-black rounded-2xl cursor-pointer"
                >
                  COMPLETE MISSION 3 🎉
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

      {/* STEP 16: Complete & Proceed to Mission 4 */}
      {step === 16 && (
        <div className="text-center space-y-5 py-4">
          <div className="text-6xl animate-bounce">🎉</div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#22b07d]">
            MISSION 3 COMPLETE!
          </h2>
          <p className="text-xs font-black uppercase text-[#ffd166] tracking-widest">
            🎖️ SUBJECT-VERB MATCH MASTER
          </p>

          <div className="p-4 bg-[#1a2c4a] rounded-2xl text-left border border-[#27406a]">
            <p className="text-xs sm:text-sm font-semibold text-[#cbd8ec]">
              🌟 Great job! You now know how to make subjects and verbs agree in
              both singular and plural!
            </p>
          </div>

          {onProceedToMission4 ? (
            <div className="p-3 bg-[#133328] border border-[#22b07d] rounded-xl text-xs text-[#6fe0ae] font-bold text-center">
              🔓 Mission 4 has been authorized by your teacher/researcher.
            </div>
          ) : (
            <div className="p-3 bg-[#17253d] border border-[#27406a] rounded-xl text-xs text-[#ffd166] font-bold text-center">
              🔒 Mission 4 is locked. Please return to your Roadmap and wait for
              your teacher or researcher to unlock it.
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {onProceedToMission4 && (
              <button
                type="button"
                onClick={async () => {
                  sound.playFanfare();
                  await markSessionCompleted(student.code, 's3');
                  onProceedToMission4();
                }}
                className="flex-1 h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-base font-black rounded-2xl shadow-[0_5px_0_#c48f00] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>CONTINUE TO MISSION 4</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={async () => {
                await markSessionCompleted(student.code, 's3');
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
