import React, { useState } from 'react';
import { StudentInfo } from '../types';
import { sound } from '../services/sound';
import { markSessionCompleted } from '../services/api';
import { Compass, RotateCcw, Sparkles, Lightbulb, Trophy } from 'lucide-react';

interface Mission2ScreenProps {
  student: StudentInfo;
  onFinish: () => void;
  onBackToHub: () => void;
}

export const Mission2Screen: React.FC<Mission2ScreenProps> = ({
  student,
  onFinish,
  onBackToHub,
}) => {
  const [step, setStep] = useState(1);
  const [highlightPart, setHighlightPart] = useState<string | null>(null);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [arrangedWords, setArrangedWords] = useState<string[]>([]);
  const [hintCount, setHintCount] = useState(0);

  const goToStep = (s: number) => {
    sound.playPop();
    setStep(s);
    setHighlightPart(null);
    setSelectedOpt(null);
    setSubmitted(false);
    setArrangedWords([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelect = (val: string) => {
    sound.playPop();
    setSelectedOpt(val);
  };

  const handlePickWord = (word: string) => {
    sound.playPop();
    if (!arrangedWords.includes(word)) {
      setArrangedWords([...arrangedWords, word]);
    }
  };

  const handleRemoveWord = (idx: number) => {
    sound.playPop();
    const updated = [...arrangedWords];
    updated.splice(idx, 1);
    setArrangedWords(updated);
  };

  const handleResetArrangement = () => {
    sound.playPop();
    setArrangedWords([]);
    setSubmitted(false);
  };

  const handleSubmit = () => {
    sound.playCorrect();
    setSubmitted(true);
  };

  const handleCompleteMission = async () => {
    sound.playFanfare();
    await markSessionCompleted(student.code, 's2');
    onFinish();
  };

  const renderWordOrderChallenge = (
    challengeTitle: string,
    promptText: string,
    bankWords: string[],
    acceptableAnswers: string[],
    explanation: string,
    nextStepNum: number
  ) => {
    const currentSentence = arrangedWords.join(' ');
    const isCorrect = acceptableAnswers.some(
      (ans) => ans.trim().toLowerCase() === currentSentence.trim().toLowerCase()
    );

    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3 bg-[#1a2c4a] p-3.5 rounded-2xl border border-[#27406a]">
          <div className="w-11 h-11 rounded-full bg-[#bfe3f7] text-2xl grid place-items-center flex-none">
            🦉
          </div>
          <p className="text-sm font-bold text-[#f4f7fc]">
            Tap the word pieces in the correct order to build the sentence.
          </p>
        </div>

        <h3 className="text-lg sm:text-xl font-black text-[#f4f7fc]">
          {promptText}
        </h3>

        {/* Selected pieces */}
        <div className="min-h-[86px] p-4 bg-[#0d1a2e] border-2 border-dashed border-[#2b446e] rounded-[18px] flex flex-wrap gap-2 items-center">
          {arrangedWords.length === 0 ? (
            <span className="text-sm font-bold text-[#6f86ad]">
              Tap the words below in order 👇
            </span>
          ) : (
            arrangedWords.map((word, idx) => (
              <button
                key={idx}
                type="button"
                disabled={submitted}
                onClick={() => handleRemoveWord(idx)}
                className="px-4 py-2.5 bg-[#f4b400] text-[#1c2b46] rounded-xl font-black text-base shadow-[0_3px_0_#c48f00] flex items-center gap-1.5 cursor-pointer"
              >
                <span>{word}</span>
                {!submitted && <span className="text-xs opacity-75">✕</span>}
              </button>
            ))
          )}
        </div>

        {/* Word Bank */}
        <div className="flex flex-wrap gap-2.5">
          {bankWords.map((word) => {
            const isUsed = arrangedWords.includes(word);
            if (isUsed) return null;
            return (
              <button
                key={word}
                type="button"
                disabled={submitted}
                onClick={() => handlePickWord(word)}
                className="px-4 py-2.5 bg-[#182b4a] hover:bg-[#203960] text-[#f4f7fc] border border-[#2a3850] rounded-xl font-bold text-base shadow-[0_3px_0_#0e1a2f] active:scale-95 transition-all cursor-pointer"
              >
                {word}
              </button>
            );
          })}
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-2xl border ${
                isCorrect
                  ? 'bg-[#133328] border-[#22b07d] text-[#6fe0ae]'
                  : 'bg-[#381919] border-[#ff5a4f] text-[#ff9b8f]'
              }`}
            >
              <h4 className="font-black text-base">
                {isCorrect ? '🎉 Correct! Great job!' : '❌ Try again!'}
              </h4>
              <p className="text-xs sm:text-sm text-[#cbd8ec] mt-1 font-semibold">
                {explanation}
              </p>
            </div>
            <div className="flex gap-3">
              {!isCorrect && (
                <button
                  type="button"
                  onClick={handleResetArrangement}
                  className="px-5 py-3.5 bg-[#182b4a] hover:bg-[#20375d] border border-[#223655] text-[#b9c6dd] font-bold rounded-2xl flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => goToStep(nextStepNum)}
                className="flex-1 h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
              >
                NEXT ➡️
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 pt-2">
            {arrangedWords.length > 0 && (
              <button
                type="button"
                onClick={handleResetArrangement}
                className="px-4 py-3 bg-[#182b4a] text-[#8ea0bc] font-bold rounded-xl border border-[#223655]"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              disabled={arrangedWords.length === 0}
              onClick={handleSubmit}
              className={`flex-1 h-14 font-black rounded-2xl text-lg transition-all ${
                arrangedWords.length > 0
                  ? 'bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] shadow-[0_5px_0_#c48f00] cursor-pointer'
                  : 'bg-[#2a3850] text-[#7385a3] cursor-not-allowed'
              }`}
            >
              CHECK SENTENCE
            </button>
          </div>
        )}
      </div>
    );
  };

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
          Mission 2 • Step {step} of 24
        </span>
      </div>

      {step === 1 && (
        <div className="space-y-5">
          <div className="text-center py-2">
            <div className="text-6xl mb-2 animate-bounce">🎯</div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#ffd166]">
              MISSION 2 UNLOCKED!
            </h2>
          </div>

          <div className="flex items-center gap-3 bg-[#1a2c4a] p-4 rounded-2xl border border-[#27406a]">
            <div className="w-12 h-12 rounded-full bg-[#bfe3f7] text-2xl grid place-items-center flex-none">
              🦉
            </div>
            <p className="text-sm sm:text-base font-bold text-[#f4f7fc] leading-snug">
              👋 Welcome back, Sentence Builders! 🎉 You completed your first
              mission. Today, we are going to learn how to put words in the
              right order!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#3b2f12] border border-[#c48f00] text-center">
            <p className="text-xs font-black uppercase text-[#e3c065] tracking-wider mb-1">
              ⭐ MISSION 2
            </p>
            <h3 className="text-xl font-black text-[#f4f7fc]">
              Arrange It Right!
            </h3>
          </div>

          <div className="space-y-2 bg-[#0d1a2e] p-4 rounded-2xl border border-[#223655]">
            <p className="text-sm font-black text-[#ffd166]">🎯 SESSION GOALS:</p>
            <ul className="text-sm text-[#cbd8ec] space-y-1.5 list-disc list-inside font-semibold">
              <li>Identify the correct order of words in a sentence;</li>
              <li>Arrange words to form a meaningful sentence;</li>
              <li>Recognize incorrect word arrangement; and</li>
              <li>Complete a sentence so that its meaning is clear.</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => goToStep(2)}
            className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] active:translate-y-1 transition-all cursor-pointer"
          >
            START MISSION 2 🚀
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <h2 className="text-2xl font-black text-center text-[#f4f7fc]">
            MISSION 2 BRIEFING
          </h2>
          <div className="flex items-center gap-3 bg-[#1a2c4a] p-3.5 rounded-2xl border border-[#27406a]">
            <div className="w-11 h-11 rounded-full bg-[#bfe3f7] text-2xl grid place-items-center flex-none">
              🦉
            </div>
            <p className="text-sm font-bold text-[#f4f7fc]">
              💡 Words need to be in the right places so that a sentence makes
              sense.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-[#0d1a2e] border border-[#223655] rounded-xl">
              <span className="text-2xl block mb-1">🧩</span>
              <strong className="text-xs font-black text-[#ffd166] uppercase block">
                ARRANGE
              </strong>
              <span className="text-xs text-[#8ea0bc] font-semibold">
                Put words in the correct order.
              </span>
            </div>
            <div className="p-3.5 bg-[#0d1a2e] border border-[#223655] rounded-xl">
              <span className="text-2xl block mb-1">📖</span>
              <strong className="text-xs font-black text-[#ffd166] uppercase block">
                READ
              </strong>
              <span className="text-xs text-[#8ea0bc] font-semibold">
                Check if sentence sounds right.
              </span>
            </div>
            <div className="p-3.5 bg-[#0d1a2e] border border-[#223655] rounded-xl">
              <span className="text-2xl block mb-1">🤔</span>
              <strong className="text-xs font-black text-[#ffd166] uppercase block">
                THINK
              </strong>
              <span className="text-xs text-[#8ea0bc] font-semibold">
                Ask what sentence is saying.
              </span>
            </div>
            <div className="p-3.5 bg-[#0d1a2e] border border-[#223655] rounded-xl">
              <span className="text-2xl block mb-1">✅</span>
              <strong className="text-xs font-black text-[#ffd166] uppercase block">
                CHECK
              </strong>
              <span className="text-xs text-[#8ea0bc] font-semibold">
                Make sure whole sentence works.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => goToStep(3)}
            className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] active:translate-y-1 transition-all cursor-pointer"
          >
            LET'S GO! 🚀
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <h2 className="text-2xl font-black text-center text-[#f4f7fc]">
            👥 HOW TO PLAY
          </h2>
          <div className="p-4 bg-[#0d1a2e] border border-[#223655] rounded-2xl text-center">
            <p className="text-xs font-black uppercase text-[#ffd166] mb-1">
              TEAMWORK RULE
            </p>
            <p className="text-sm font-bold text-[#cbd8ec]">
              READ ➡️ THINK ➡️ ARRANGE ➡️ CHECK ➡️ EXPLAIN
            </p>
          </div>
          <button
            type="button"
            onClick={() => goToStep(4)}
            className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] active:translate-y-1 transition-all cursor-pointer"
          >
            GOT IT! 👍
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-5">
          <span className="inline-block text-xs font-black px-3 py-1 rounded-full bg-[#182b4a] text-[#8ea0bc]">
            Progress: I DO 🚀
          </span>
          <h2 className="text-2xl font-black text-[#f4f7fc]">
            👁️ I DO – GRAMMY'S TURN!
          </h2>
          <div className="p-4 bg-[#3a1c1c] border border-[#ff5a4f] rounded-2xl text-center text-lg font-black text-[#ff9b8f]">
            "Park the running students are in quickly the."
          </div>
          <div className="p-4 bg-[#3b2f12] border border-[#c48f00] rounded-2xl">
            <p className="text-xs font-black text-[#e3c065] uppercase mb-1">
              What happens when words are in the wrong order?
            </p>
            <p className="text-sm sm:text-base font-bold text-[#f4f7fc]">
              All the words are there, but they are scrambled! The reader cannot
              understand what happened.
            </p>
          </div>
          <button
            type="button"
            onClick={() => goToStep(5)}
            className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] active:translate-y-1 transition-all cursor-pointer"
          >
            SHOW ME HOW ➡️
          </button>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-5">
          <span className="inline-block text-xs font-black px-3 py-1 rounded-full bg-[#133328] text-[#6fe0ae] border border-[#22b07d]">
            ✅ CLEAR SENTENCE ORDER
          </span>
          <div className="p-5 bg-[#0d1a2e] border-2 border-dashed border-[#f4b400] rounded-2xl text-center text-xl font-black">
            <button
              type="button"
              onClick={() => setHighlightPart('who')}
              className={`px-2.5 py-1 m-1 rounded-lg border cursor-pointer ${
                highlightPart === 'who'
                  ? 'bg-[#f4b400] text-[#1c2b46]'
                  : 'bg-[#1a2c4a] text-white'
              }`}
            >
              The students
            </button>
            <button
              type="button"
              onClick={() => setHighlightPart('what')}
              className={`px-2.5 py-1 m-1 rounded-lg border cursor-pointer ${
                highlightPart === 'what'
                  ? 'bg-[#f4b400] text-[#1c2b46]'
                  : 'bg-[#1a2c4a] text-white'
              }`}
            >
              are running
            </button>
            <button
              type="button"
              onClick={() => setHighlightPart('more')}
              className={`px-2.5 py-1 m-1 rounded-lg border cursor-pointer ${
                highlightPart === 'more'
                  ? 'bg-[#f4b400] text-[#1c2b46]'
                  : 'bg-[#1a2c4a] text-white'
              }`}
            >
              in the park.
            </button>
          </div>

          <p className="text-center text-xs text-[#8ea0bc] font-bold">
            👆 Tap each sentence chunk to inspect its job!
          </p>

          {highlightPart === 'who' && (
            <div className="p-3.5 bg-[#3b2f12] border-2 border-[#f4b400] rounded-xl animate-in fade-in">
              <h4 className="text-xs font-black text-[#f4b400] uppercase">
                👤 WHO?
              </h4>
              <p className="text-sm font-bold text-[#f4f7fc]">
                The students are the people doing the action.
              </p>
            </div>
          )}
          {highlightPart === 'what' && (
            <div className="p-3.5 bg-[#3b2f12] border-2 border-[#f4b400] rounded-xl animate-in fade-in">
              <h4 className="text-xs font-black text-[#f4b400] uppercase">
                🏃 WHAT ARE THEY DOING?
              </h4>
              <p className="text-sm font-bold text-[#f4f7fc]">
                They are running (the verb phrase).
              </p>
            </div>
          )}
          {highlightPart === 'more' && (
            <div className="p-3.5 bg-[#3b2f12] border-2 border-[#f4b400] rounded-xl animate-in fade-in">
              <h4 className="text-xs font-black text-[#f4b400] uppercase">
                📍 WHERE? (MORE INFORMATION)
              </h4>
              <p className="text-sm font-bold text-[#f4f7fc]">
                In the park tells us where the action occurs.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => goToStep(6)}
            className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] active:translate-y-1 transition-all cursor-pointer"
          >
            NEXT ➡️
          </button>
        </div>
      )}

      {step === 6 && (
        <div className="space-y-5">
          <h2 className="text-2xl font-black text-[#f4f7fc]">
            📋 GRAMMY'S WORD ORDER GUIDE
          </h2>
          <div className="p-4 bg-[#3b2f12] border border-[#c48f00] rounded-2xl text-center">
            <strong className="text-base text-[#ffd166]">
              WHO + ACTION + MORE INFORMATION
            </strong>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-[#0d1a2e] border border-[#223655] rounded-xl flex items-start gap-3">
              <span className="text-xl">1️⃣</span>
              <div>
                <strong className="text-xs font-black text-[#ffd166] uppercase block">
                  1. WHO OR WHAT?
                </strong>
                <span className="text-xs text-[#8ea0bc] font-semibold">
                  It is the subject.
                </span>
              </div>
            </div>
            <div className="p-3.5 bg-[#0d1a2e] border border-[#223655] rounded-xl flex items-start gap-3">
              <span className="text-xl">2️⃣</span>
              <div>
                <strong className="text-xs font-black text-[#ffd166] uppercase block">
                  2. WHAT DID THEY DO?
                </strong>
                <span className="text-xs text-[#8ea0bc] font-semibold">
                  This is the verb or action.
                </span>
              </div>
            </div>
            <div className="p-3.5 bg-[#0d1a2e] border border-[#223655] rounded-xl flex items-start gap-3">
              <span className="text-xl">3️⃣</span>
              <div>
                <strong className="text-xs font-black text-[#ffd166] uppercase block">
                  3. MORE INFORMATION
                </strong>
                <span className="text-xs text-[#8ea0bc] font-semibold">
                  It answers where, when, and how.
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => goToStep(7)}
            className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] active:translate-y-1 transition-all cursor-pointer"
          >
            I UNDERSTAND! 👍
          </button>
        </div>
      )}

      {step === 7 && (
        <div className="space-y-5">
          <h2 className="text-2xl font-black text-[#f4f7fc]">
            I DO EXAMPLE 2
          </h2>
          <div className="p-4 bg-[#133328] border border-[#22b07d] rounded-2xl text-center">
            <h3 className="text-lg font-black text-[#6fe0ae]">
              "He never eats breakfast."
            </h3>
            <p className="text-xs text-[#cbd8ec] font-semibold mt-1">
              WHO (He) + ADVERB (never) + VERB (eats) + OBJECT (breakfast). Words
              cannot simply be placed anywhere!
            </p>
          </div>
          <button
            type="button"
            onClick={() => goToStep(8)}
            className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] active:translate-y-1 transition-all cursor-pointer"
          >
            QUICK CHECK ➡️
          </button>
        </div>
      )}

      {step === 8 && (
        <div className="space-y-5">
          <span className="inline-block text-xs font-black px-3 py-1 rounded-full bg-[#1a2d4b] text-[#ffd166]">
            ⭐ QUICK CHECK
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#f4f7fc]">
            Which sentence is correct?
          </h2>

          <div className="grid gap-3">
            {[
              {
                id: 'A',
                text: 'Quickly the students are running in the park.',
              },
              {
                id: 'B',
                text: 'The park are running quickly in the students.',
              },
              {
                id: 'C',
                text: 'The students are running quickly in the park.',
              },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`p-4 rounded-xl border-2 font-bold text-left flex items-center gap-3 cursor-pointer ${
                  selectedOpt === item.id
                    ? item.id === 'C'
                      ? 'border-[#22b07d] bg-[#133328]'
                      : 'border-[#ff5a4f] bg-[#3a1c1c]'
                    : 'border-[#223655] bg-[#0d1a2e]'
                }`}
              >
                <span className="w-8 h-8 rounded-full bg-[#182b4a] grid place-items-center text-xs font-black">
                  {item.id}
                </span>
                <span className="text-sm sm:text-base">{item.text}</span>
              </button>
            ))}
          </div>

          {selectedOpt === 'C' && (
            <div className="p-4 bg-[#133328] border border-[#22b07d] rounded-2xl animate-in fade-in">
              <h3 className="text-base font-black text-[#6fe0ae]">
                🎉 Correct!
              </h3>
              <p className="text-xs sm:text-sm text-[#cbd8ec] font-semibold mt-1">
                The words are arranged clearly, so the sentence makes sense.
              </p>
            </div>
          )}

          {selectedOpt && selectedOpt !== 'C' && (
            <div className="p-3.5 bg-[#381919] border border-[#ff5a4f] rounded-xl text-[#ff9b8f] text-xs sm:text-sm font-bold">
              Not quite! Check which sentence puts the subject first, then the
              action.
            </div>
          )}

          {selectedOpt === 'C' && (
            <button
              type="button"
              onClick={() => goToStep(9)}
              className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] active:translate-y-1 transition-all cursor-pointer"
            >
              START WE DO 🚀
            </button>
          )}
        </div>
      )}

      {step === 9 && (
        <div className="space-y-5">
          <span className="inline-block text-xs font-black px-3 py-1 rounded-full bg-[#182b4a] text-[#8ea0bc]">
            Progress: WE DO 🤝
          </span>
          <h2 className="text-2xl font-black text-[#f4f7fc]">
            🤝 WE DO – LET'S BUILD TOGETHER!
          </h2>
          <div className="flex items-center gap-3 bg-[#1a2c4a] p-3.5 rounded-2xl border border-[#27406a]">
            <div className="w-11 h-11 rounded-full bg-[#bfe3f7] text-2xl grid place-items-center flex-none">
              🦉
            </div>
            <p className="text-sm font-bold text-[#f4f7fc]">
              👥 Now we'll arrange sentences together! Work as a team to test
              different orders.
            </p>
          </div>

          <div className="p-4 bg-[#3b2f12] border border-dashed border-[#c48f00] rounded-2xl text-center">
            <p className="text-xs font-black uppercase text-[#e3c065] mb-1">
              TEAM REMINDER
            </p>
            <p className="text-base font-black text-[#f4f7fc]">
              READ ➡️ THINK ➡️ ARRANGE ➡️ CHECK
            </p>
          </div>

          <button
            type="button"
            onClick={() => goToStep(10)}
            className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] active:translate-y-1 transition-all cursor-pointer"
          >
            START CHALLENGE 1 🚀
          </button>
        </div>
      )}

      {step === 10 &&
        renderWordOrderChallenge(
          'WE DO CHALLENGE 1',
          'Arrange the words into a correct sentence:',
          ['to school', 'every day', 'walks', 'Maria'],
          [
            'Maria walks to school every day',
            'Every day Maria walks to school',
          ],
          '"Maria walks to school every day." gives a clear, natural order!',
          11
        )}

      {step === 11 && (
        <div className="space-y-5">
          <h2 className="text-2xl font-black text-[#f4f7fc]">
            💡 HINT SYSTEM
          </h2>
          <div className="p-4 bg-[#0d1a2e] border border-[#223655] rounded-2xl space-y-3">
            <button
              type="button"
              onClick={() => {
                if (hintCount < 4) {
                  sound.playPop();
                  setHintCount(hintCount + 1);
                }
              }}
              className="w-full py-3 px-4 bg-[#182b4a] hover:bg-[#20375d] border border-[#ffd166] text-[#ffd166] font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lightbulb className="w-4 h-4" />
              <span>GET HINT ({hintCount}/4)</span>
            </button>

            {hintCount >= 1 && (
              <div className="p-2.5 bg-[#1c2b46] rounded-lg text-xs text-[#cbd8ec]">
                <strong>Hint 1:</strong> Who is doing the action?
              </div>
            )}
            {hintCount >= 2 && (
              <div className="p-2.5 bg-[#1c2b46] rounded-lg text-xs text-[#cbd8ec]">
                <strong>Hint 2:</strong> Find the subject first.
              </div>
            )}
            {hintCount >= 3 && (
              <div className="p-2.5 bg-[#1c2b46] rounded-lg text-xs text-[#cbd8ec]">
                <strong>Hint 3:</strong> After the subject, look for the action
                verb.
              </div>
            )}
            {hintCount >= 4 && (
              <div className="p-2.5 bg-[#1c2b46] rounded-lg text-xs text-[#cbd8ec]">
                <strong>Hint 4:</strong> Read the sentence from beginning to end
                to check flow.
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => goToStep(12)}
            className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] active:translate-y-1 transition-all cursor-pointer"
          >
            NEXT CHALLENGE ➡️
          </button>
        </div>
      )}

      {step === 12 &&
        renderWordOrderChallenge(
          'WE DO CHALLENGE 2',
          'Arrange the words into a correct sentence:',
          ['in the park', 'are playing', 'the children'],
          [
            'the children are playing in the park',
            'The children are playing in the park',
          ],
          '"The children" tells WHO. "are playing" is the action. "in the park" gives WHERE!',
          13
        )}

      {step === 13 &&
        renderWordOrderChallenge(
          'WE DO CHALLENGE 3',
          'Arrange the words into a correct sentence:',
          ['every morning', 'breakfast', 'eats', 'Ana'],
          [
            'Ana eats breakfast every morning',
            'Every morning Ana eats breakfast',
          ],
          '"Ana eats breakfast every morning." is well structured!',
          15
        )}

      {step === 15 && (
        <div className="space-y-5">
          <span className="inline-block text-xs font-black px-3 py-1 rounded-full bg-[#3a1c1c] text-[#ff9b8f] border border-[#ff5a4f]">
            🔧 FIX IT!
          </span>
          <div className="p-4 bg-[#0d1a2e] border-2 border-dashed border-[#ff5a4f] rounded-2xl text-center text-xl font-black text-[#ff9b8f]">
            "Breakfast he eats never."
          </div>

          <div className="grid gap-3">
            {[
              { id: 'A', text: 'He never eats breakfast.' },
              { id: 'B', text: 'He eats never breakfast.' },
              { id: 'C', text: 'Breakfast never he eats.' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={submitted}
                onClick={() => handleSelect(item.id)}
                className={`p-4 rounded-xl border-2 font-bold text-left flex items-center gap-3 cursor-pointer ${
                  selectedOpt === item.id
                    ? 'border-[#f4b400] bg-[#3b2f12]'
                    : 'border-[#223655] bg-[#0d1a2e]'
                }`}
              >
                <span className="w-8 h-8 rounded-full bg-[#182b4a] grid place-items-center text-xs font-black">
                  {item.id}
                </span>
                <span className="text-sm sm:text-base">{item.text}</span>
              </button>
            ))}
          </div>

          {submitted ? (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-2xl border ${
                  selectedOpt === 'A'
                    ? 'bg-[#133328] border-[#22b07d] text-[#6fe0ae]'
                    : 'bg-[#381919] border-[#ff5a4f] text-[#ff9b8f]'
                }`}
              >
                <h4 className="font-black text-base">
                  {selectedOpt === 'A' ? 'Excellent!' : 'Incorrect'}
                </h4>
                <p className="text-xs sm:text-sm text-[#cbd8ec] mt-1 font-semibold">
                  "He never eats breakfast." arranges the words in a natural,
                  clear order.
                </p>
              </div>
              <button
                type="button"
                onClick={() => goToStep(16)}
                className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00]"
              >
                NEXT QUESTION ➡️
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={!selectedOpt}
              onClick={handleSubmit}
              className={`w-full h-14 font-black rounded-2xl text-lg ${
                selectedOpt
                  ? 'bg-[#f4b400] text-[#1c2b46] shadow-[0_5px_0_#c48f00]'
                  : 'bg-[#2a3850] text-[#7385a3]'
              }`}
            >
              SUBMIT
            </button>
          )}
        </div>
      )}

      {step === 16 && (
        <div className="space-y-5">
          <span className="inline-block text-xs font-black px-3 py-1 rounded-full bg-[#1a2d4b] text-[#ffd166]">
            WE DO MINI CHALLENGE
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#f4f7fc]">
            ❓ WHICH ONE IS CORRECT?
          </h2>

          <div className="grid gap-3">
            {[
              { id: 'A', text: 'The classroom in are studying students' },
              { id: 'B', text: 'The students are studying in the classroom.' },
              { id: 'C', text: 'Are studying the classroom students in.' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={submitted}
                onClick={() => handleSelect(item.id)}
                className={`p-4 rounded-xl border-2 font-bold text-left flex items-center gap-3 cursor-pointer ${
                  selectedOpt === item.id
                    ? 'border-[#f4b400] bg-[#3b2f12]'
                    : 'border-[#223655] bg-[#0d1a2e]'
                }`}
              >
                <span className="w-8 h-8 rounded-full bg-[#182b4a] grid place-items-center text-xs font-black">
                  {item.id}
                </span>
                <span className="text-sm sm:text-base">{item.text}</span>
              </button>
            ))}
          </div>

          {submitted ? (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-2xl border ${
                  selectedOpt === 'B'
                    ? 'bg-[#133328] border-[#22b07d] text-[#6fe0ae]'
                    : 'bg-[#381919] border-[#ff5a4f] text-[#ff9b8f]'
                }`}
              >
                <h4 className="font-black text-base">
                  {selectedOpt === 'B' ? 'Great teamwork!' : 'Incorrect'}
                </h4>
                <p className="text-xs sm:text-sm text-[#cbd8ec] mt-1 font-semibold">
                  The sentence begins with the subject, followed by the action
                  and additional information.
                </p>
              </div>
              <button
                type="button"
                onClick={() => goToStep(17)}
                className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00]"
              >
                MOVE TO YOU DO ➡️
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={!selectedOpt}
              onClick={handleSubmit}
              className={`w-full h-14 font-black rounded-2xl text-lg ${
                selectedOpt
                  ? 'bg-[#f4b400] text-[#1c2b46] shadow-[0_5px_0_#c48f00]'
                  : 'bg-[#2a3850] text-[#7385a3]'
              }`}
            >
              SUBMIT
            </button>
          )}
        </div>
      )}

      {step === 17 && (
        <div className="space-y-5">
          <span className="inline-block text-xs font-black px-3 py-1 rounded-full bg-[#182b4a] text-[#8ea0bc]">
            Progress: YOU DO 🎯
          </span>
          <h2 className="text-2xl font-black text-[#f4f7fc]">
            🎯 YOU DO – YOUR TURN!
          </h2>
          <div className="p-4 bg-[#0d1a2e] border border-[#223655] rounded-2xl text-center">
            <p className="text-xs font-black uppercase text-[#ffd166] mb-1">
              GROUP INSTRUCTIONS
            </p>
            <p className="text-sm font-bold text-[#cbd8ec]">
              Everyone thinks about the answer first. The Player taps or
              arranges the answer.
            </p>
          </div>
          <button
            type="button"
            onClick={() => goToStep(18)}
            className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00]"
          >
            START 🚀
          </button>
        </div>
      )}

      {step === 18 && (
        <div className="space-y-5">
          <span className="inline-block text-xs font-black px-3 py-1 rounded-full bg-[#1a2d4b] text-[#ffd166]">
            QUESTION 1 OF 5
          </span>
          <h2 className="text-xl font-black text-[#f4f7fc]">
            Which sentence has the correct word order?
          </h2>

          <div className="grid gap-2.5">
            {[
              { id: 'A', text: 'The bus I waited for arrive to.' },
              { id: 'B', text: 'I waited for the bus to arrive.' },
              { id: 'C', text: 'Arrive I waited for the bus to.' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={submitted}
                onClick={() => handleSelect(item.id)}
                className={`p-3.5 rounded-xl border-2 font-bold text-left flex items-center gap-3 cursor-pointer ${
                  selectedOpt === item.id
                    ? 'border-[#f4b400] bg-[#3b2f12]'
                    : 'border-[#223655] bg-[#0d1a2e]'
                }`}
              >
                <span className="w-8 h-8 rounded-full bg-[#182b4a] grid place-items-center text-xs font-black">
                  {item.id}
                </span>
                <span className="text-sm">{item.text}</span>
              </button>
            ))}
          </div>

          {submitted ? (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-2xl border ${
                  selectedOpt === 'B'
                    ? 'bg-[#133328] border-[#22b07d] text-[#6fe0ae]'
                    : 'bg-[#381919] border-[#ff5a4f] text-[#ff9b8f]'
                }`}
              >
                <h4 className="font-black text-base">
                  {selectedOpt === 'B' ? 'Correct! 🎉' : 'Incorrect'}
                </h4>
                <p className="text-xs text-[#cbd8ec] mt-1 font-semibold">
                  "I waited for the bus to arrive."
                </p>
              </div>
              <button
                type="button"
                onClick={() => goToStep(19)}
                className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00]"
              >
                NEXT QUESTION ➡️
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={!selectedOpt}
              onClick={handleSubmit}
              className={`w-full h-14 font-black rounded-2xl text-lg ${
                selectedOpt
                  ? 'bg-[#f4b400] text-[#1c2b46] shadow-[0_5px_0_#c48f00]'
                  : 'bg-[#2a3850] text-[#7385a3]'
              }`}
            >
              SUBMIT
            </button>
          )}
        </div>
      )}

      {step === 19 && (
        <div className="space-y-5">
          <span className="inline-block text-xs font-black px-3 py-1 rounded-full bg-[#1a2d4b] text-[#ffd166]">
            QUESTION 2 OF 5
          </span>
          <h2 className="text-xl font-black text-[#f4f7fc]">
            Which sentence has the correct word order?
          </h2>

          <div className="grid gap-2.5">
            {[
              { id: 'A', text: 'The dog barked outside.' },
              { id: 'B', text: 'Outside the dog barked.' },
              { id: 'C', text: 'Barked the dog outside.' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={submitted}
                onClick={() => handleSelect(item.id)}
                className={`p-3.5 rounded-xl border-2 font-bold text-left flex items-center gap-3 cursor-pointer ${
                  selectedOpt === item.id
                    ? 'border-[#f4b400] bg-[#3b2f12]'
                    : 'border-[#223655] bg-[#0d1a2e]'
                }`}
              >
                <span className="w-8 h-8 rounded-full bg-[#182b4a] grid place-items-center text-xs font-black">
                  {item.id}
                </span>
                <span className="text-sm">{item.text}</span>
              </button>
            ))}
          </div>

          {submitted ? (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-2xl border ${
                  selectedOpt === 'A'
                    ? 'bg-[#133328] border-[#22b07d] text-[#6fe0ae]'
                    : 'bg-[#381919] border-[#ff5a4f] text-[#ff9b8f]'
                }`}
              >
                <h4 className="font-black text-base">
                  {selectedOpt === 'A' ? 'Correct! 🎉' : 'Incorrect'}
                </h4>
                <p className="text-xs text-[#cbd8ec] mt-1 font-semibold">
                  "The dog barked outside."
                </p>
              </div>
              <button
                type="button"
                onClick={() => goToStep(20)}
                className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00]"
              >
                NEXT QUESTION ➡️
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={!selectedOpt}
              onClick={handleSubmit}
              className={`w-full h-14 font-black rounded-2xl text-lg ${
                selectedOpt
                  ? 'bg-[#f4b400] text-[#1c2b46] shadow-[0_5px_0_#c48f00]'
                  : 'bg-[#2a3850] text-[#7385a3]'
              }`}
            >
              SUBMIT
            </button>
          )}
        </div>
      )}

      {step === 20 &&
        renderWordOrderChallenge(
          'YOU DO QUESTION 3',
          'Arrange the words into a correct sentence:',
          ['pizza', 'I ate', 'the', 'leftover'],
          ['I ate the leftover pizza'],
          '"I ate the leftover pizza." puts the subject and verb (I ate) first!',
          21
        )}

      {step === 21 &&
        renderWordOrderChallenge(
          'YOU DO QUESTION 4',
          'Arrange the words into a correct sentence:',
          ['over', 'grades', 'her', 'She cried'],
          ['She cried over her grades'],
          '"She cried over her grades." is the correct, natural arrangement!',
          22
        )}

      {step === 22 && (
        <div className="space-y-5">
          <span className="inline-block text-xs font-black px-3 py-1 rounded-full bg-[#1a2d4b] text-[#ffd166]">
            QUESTION 5 OF 5
          </span>
          <h2 className="text-xl font-black text-[#f4f7fc]">
            Which sentence has the correct word order?
          </h2>

          <div className="grid gap-2.5">
            {[
              { id: 'A', text: 'In the classroom studying the students are.' },
              { id: 'B', text: 'The students are studying in the classroom.' },
              { id: 'C', text: 'Studying the classroom are students in the.' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={submitted}
                onClick={() => handleSelect(item.id)}
                className={`p-3.5 rounded-xl border-2 font-bold text-left flex items-center gap-3 cursor-pointer ${
                  selectedOpt === item.id
                    ? 'border-[#f4b400] bg-[#3b2f12]'
                    : 'border-[#223655] bg-[#0d1a2e]'
                }`}
              >
                <span className="w-8 h-8 rounded-full bg-[#182b4a] grid place-items-center text-xs font-black">
                  {item.id}
                </span>
                <span className="text-sm">{item.text}</span>
              </button>
            ))}
          </div>

          {submitted ? (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-2xl border ${
                  selectedOpt === 'B'
                    ? 'bg-[#133328] border-[#22b07d] text-[#6fe0ae]'
                    : 'bg-[#381919] border-[#ff5a4f] text-[#ff9b8f]'
                }`}
              >
                <h4 className="font-black text-base">
                  {selectedOpt === 'B' ? 'Correct! 🎉' : 'Incorrect'}
                </h4>
                <p className="text-xs text-[#cbd8ec] mt-1 font-semibold">
                  "The students are studying in the classroom."
                </p>
              </div>
              <button
                type="button"
                onClick={() => goToStep(23)}
                className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00]"
              >
                FINISH MISSION 🚀
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={!selectedOpt}
              onClick={handleSubmit}
              className={`w-full h-14 font-black rounded-2xl text-lg ${
                selectedOpt
                  ? 'bg-[#f4b400] text-[#1c2b46] shadow-[0_5px_0_#c48f00]'
                  : 'bg-[#2a3850] text-[#7385a3]'
              }`}
            >
              SUBMIT
            </button>
          )}
        </div>
      )}

      {step === 23 && (
        <div className="space-y-5">
          <div className="text-center py-2">
            <div className="text-6xl mb-2 animate-bounce">🎉</div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#22b07d]">
              MISSION 2 COMPLETE!
            </h2>
          </div>

          <div className="flex items-center gap-3 bg-[#1a2c4a] p-3.5 rounded-2xl border border-[#27406a]">
            <div className="w-11 h-11 rounded-full bg-[#bfe3f7] text-2xl grid place-items-center flex-none">
              🦉
            </div>
            <p className="text-sm font-bold text-[#f4f7fc]">
              🌟 Amazing! You learned how to arrange words to build clear
              sentences!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#133328] border border-[#22b07d] text-center space-y-1">
            <p className="text-xs font-black uppercase text-[#6fe0ae]">
              ⭐ MISSION 2: Arrange It Right!
            </p>
            <p className="text-sm font-bold text-[#cbd8ec]">
              🧠 SKILL LEARNED: Word Order and Arrangement
            </p>
            <p className="text-lg font-black text-[#ffd166] flex items-center justify-center gap-1.5 pt-1">
              <Trophy className="w-5 h-5 text-[#f4b400]" />
              <span>Status: COMPLETE</span>
            </p>
          </div>

          <div className="space-y-1.5 bg-[#0d1a2e] p-4 rounded-2xl border border-[#223655] text-xs sm:text-sm font-bold text-[#cbd8ec]">
            <p className="text-[#ffd166] mb-1">You mastered:</p>
            <p>✅ Find the subject</p>
            <p>✅ Find the action</p>
            <p>✅ Arrange words in logical sequence</p>
            <p>✅ Check if the sentence makes sense</p>
          </div>

          <button
            type="button"
            onClick={() => goToStep(24)}
            className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] active:translate-y-1 transition-all cursor-pointer"
          >
            CLAIM BADGE 🎖️
          </button>
        </div>
      )}

      {step === 24 && (
        <div className="text-center space-y-6 py-4">
          <div className="text-6xl animate-bounce">🎯</div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#ffd166]">
              NEW BADGE UNLOCKED!
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#f4f7fc] mt-1">
              🎖️ WORD ORDER EXPERT
            </h2>
            <p className="text-sm text-[#8ea0bc] font-semibold mt-1">
              You can now arrange words and build clear sentences!
            </p>
          </div>

          <button
            type="button"
            onClick={handleCompleteMission}
            className="w-full h-15 bg-[#22b07d] hover:bg-[#28c58d] text-white text-xl font-black rounded-2xl shadow-[0_5px_0_#147a54] active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-5 h-5" />
            <span>CONTINUE TO ROADMAP ➡️</span>
          </button>
        </div>
      )}
    </div>
  );
};
