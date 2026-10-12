import React, { useState } from 'react';
import { StudentInfo } from '../types';
import { sound } from '../services/sound';
import { markSessionCompleted } from '../services/api';
import { Compass, Lightbulb, Trophy, Sparkles } from 'lucide-react';

interface Mission1ScreenProps {
  student: StudentInfo;
  onFinish: () => void;
  onBackToHub: () => void;
}

export const Mission1Screen: React.FC<Mission1ScreenProps> = ({
  student,
  onFinish,
  onBackToHub,
}) => {
  const [step, setStep] = useState(1);
  const [highlightPart, setHighlightPart] = useState<string | null>(null);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [hintCount, setHintCount] = useState(0);

  const goToStep = (s: number) => {
    sound.playPop();
    setStep(s);
    setHighlightPart(null);
    setSelectedOpt(null);
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelect = (val: string) => {
    sound.playPop();
    setSelectedOpt(val);
  };

  const handleSubmitQuestion = () => {
    sound.playCorrect();
    setSubmitted(true);
  };

  return (
    <div className="card p-6 sm:p-8 bg-[#12213b] border border-[#1e3458] rounded-[28px] shadow-[0_18px_40px_rgba(0,0,0,0.4)] animate-in fade-in duration-300">
      {/* Top Bar */}
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
          Mission 1 • Step {step} of 21
        </span>
      </div>

      {/* STEP 1: Mission Intro */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="text-center py-2">
            <div className="text-6xl mb-2 animate-bounce">🎯</div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#ffd166]">
              MISSION 1 UNLOCKED!
            </h2>
          </div>

          <div className="flex items-center gap-3 bg-[#1a2c4a] p-4 rounded-2xl border border-[#27406a]">
            <div className="w-12 h-12 rounded-full bg-[#bfe3f7] text-2xl grid place-items-center flex-none">
              🦉
            </div>
            <p className="text-sm sm:text-base font-bold text-[#f4f7fc] leading-snug">
              👋 Great job completing the Pretest, Sentence Builders! 🎉 Now it's
              time for your first mission!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#3b2f12] border border-[#c48f00] text-center">
            <p className="text-xs font-black uppercase text-[#e3c065] tracking-wider mb-1">
              ⭐ MISSION 1
            </p>
            <h3 className="text-xl font-black text-[#f4f7fc]">
              Complete the Thought
            </h3>
          </div>

          <div className="space-y-2 bg-[#0d1a2e] p-4 rounded-2xl border border-[#223655]">
            <p className="text-sm font-black text-[#f4f7fc]">
              Today you will learn how to:
            </p>
            <ul className="text-sm text-[#cbd8ec] space-y-1.5 list-disc list-inside font-semibold">
              <li>Identify a complete thought;</li>
              <li>Identify an incomplete thought; and</li>
              <li>Complete a sentence so that its meaning is clear.</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => goToStep(2)}
            className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] active:translate-y-1 transition-all cursor-pointer"
          >
            START MISSION 1 🚀
          </button>
        </div>
      )}

      {/* STEP 2: Roles */}
      {step === 2 && (
        <div className="space-y-5">
          <h2 className="text-2xl font-black text-center text-[#f4f7fc]">
            👥 HOW TO PLAY
          </h2>
          <div className="flex items-center gap-3 bg-[#1a2c4a] p-3.5 rounded-2xl border border-[#27406a]">
            <div className="w-11 h-11 rounded-full bg-[#bfe3f7] text-2xl grid place-items-center flex-none">
              🦉
            </div>
            <p className="text-sm font-bold text-[#f4f7fc]">
              💡 You will learn together with your group. Listen, think, discuss,
              and answer together!
            </p>
          </div>

          <p className="text-xs font-black text-[#ffd166] uppercase tracking-wider">
            ⭐ YOUR GROUP HAS 5 ROLES:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl text-center">
              <span className="text-2xl block mb-1">📖</span>
              <strong className="text-xs font-black text-[#ffd166] uppercase block">
                Reader
              </strong>
              <span className="text-[11px] text-[#8ea0bc] font-semibold">
                Reads question aloud.
              </span>
            </div>
            <div className="p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl text-center">
              <span className="text-2xl block mb-1">💡</span>
              <strong className="text-xs font-black text-[#ffd166] uppercase block">
                Solver
              </strong>
              <span className="text-[11px] text-[#8ea0bc] font-semibold">
                Gives the first idea.
              </span>
            </div>
            <div className="p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl text-center">
              <span className="text-2xl block mb-1">🔍</span>
              <strong className="text-xs font-black text-[#ffd166] uppercase block">
                Checker
              </strong>
              <span className="text-[11px] text-[#8ea0bc] font-semibold">
                Checks if it makes sense.
              </span>
            </div>
            <div className="p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl text-center">
              <span className="text-2xl block mb-1">🗣️</span>
              <strong className="text-xs font-black text-[#ffd166] uppercase block">
                Explainer
              </strong>
              <span className="text-[11px] text-[#8ea0bc] font-semibold">
                Explains why it is right.
              </span>
            </div>
            <div className="p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl text-center col-span-2 sm:col-span-1">
              <span className="text-2xl block mb-1">🎮</span>
              <strong className="text-xs font-black text-[#ffd166] uppercase block">
                Player
              </strong>
              <span className="text-[11px] text-[#8ea0bc] font-semibold">
                Taps answer on screen.
              </span>
            </div>
          </div>

          <p className="text-center text-xs text-[#8ea0bc] font-bold">
            🔄 Rotate the roles after each challenge!
          </p>

          <button
            type="button"
            onClick={() => goToStep(3)}
            className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] active:translate-y-1 transition-all cursor-pointer"
          >
            GOT IT! 👍
          </button>
        </div>
      )}

      {/* STEP 3: I DO intro */}
      {step === 3 && (
        <div className="space-y-5">
          <span className="inline-block text-xs font-black px-3 py-1 rounded-full bg-[#182b4a] text-[#8ea0bc]">
            Progress: I DO 🚀
          </span>
          <h2 className="text-2xl font-black text-[#f4f7fc]">
            👁️ I DO – GRAMMY'S TURN!
          </h2>
          <div className="flex items-center gap-3 bg-[#1a2c4a] p-3.5 rounded-2xl border border-[#27406a]">
            <div className="w-11 h-11 rounded-full bg-[#bfe3f7] text-2xl grid place-items-center flex-none">
              🦉
            </div>
            <p className="text-sm font-bold text-[#f4f7fc]">
              👀 First, watch me! I will show you how to identify a complete
              thought.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#3b2f12] border border-[#c48f00]">
            <p className="text-xs font-black text-[#e3c065] uppercase tracking-wider mb-1">
              What is a complete thought?
            </p>
            <p className="text-sm sm:text-base font-bold text-[#f4f7fc]">
              A <strong>complete thought</strong> is a sentence that gives a
              finished message.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-3 p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl">
              <span className="text-xl">1️⃣</span>
              <div>
                <strong className="text-xs font-black text-[#ffd166] block">
                  WHO or WHAT?
                </strong>
                <span className="text-xs text-[#8ea0bc] font-semibold">
                  Who or what is the sentence about?
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl">
              <span className="text-xl">2️⃣</span>
              <div>
                <strong className="text-xs font-black text-[#ffd166] block">
                  WHAT HAPPENED?
                </strong>
                <span className="text-xs text-[#8ea0bc] font-semibold">
                  What did the person, animal, or thing do?
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl">
              <span className="text-xl">3️⃣</span>
              <div>
                <strong className="text-xs font-black text-[#ffd166] block">
                  IS THE MESSAGE FINISHED?
                </strong>
                <span className="text-xs text-[#8ea0bc] font-semibold">
                  Does the sentence make sense by itself?
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => goToStep(4)}
            className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] active:translate-y-1 transition-all cursor-pointer"
          >
            SHOW ME AN EXAMPLE ➡️
          </button>
        </div>
      )}

      {/* STEP 4: Sentence Breakdown Interactive */}
      {step === 4 && (
        <div className="space-y-5">
          <span className="inline-block text-xs font-black px-3 py-1 rounded-full bg-[#133328] text-[#6fe0ae] border border-[#22b07d]">
            ✅ COMPLETE THOUGHT
          </span>
          <div className="p-5 bg-[#0d1a2e] border-2 border-dashed border-[#f4b400] rounded-2xl text-center text-xl font-black">
            <button
              type="button"
              onClick={() => setHighlightPart('who')}
              className={`px-2.5 py-1 m-1 rounded-lg border cursor-pointer transition-all ${
                highlightPart === 'who'
                  ? 'bg-[#f4b400] text-[#1c2b46] border-[#ffd44d]'
                  : 'bg-[#1a2c4a] text-white border-[#3b537d] hover:border-[#f4b400]'
              }`}
            >
              The students
            </button>
            <button
              type="button"
              onClick={() => setHighlightPart('what')}
              className={`px-2.5 py-1 m-1 rounded-lg border cursor-pointer transition-all ${
                highlightPart === 'what'
                  ? 'bg-[#f4b400] text-[#1c2b46] border-[#ffd44d]'
                  : 'bg-[#1a2c4a] text-white border-[#3b537d] hover:border-[#f4b400]'
              }`}
            >
              arrived
            </button>
            <button
              type="button"
              onClick={() => setHighlightPart('more')}
              className={`px-2.5 py-1 m-1 rounded-lg border cursor-pointer transition-all ${
                highlightPart === 'more'
                  ? 'bg-[#f4b400] text-[#1c2b46] border-[#ffd44d]'
                  : 'bg-[#1a2c4a] text-white border-[#3b537d] hover:border-[#f4b400]'
              }`}
            >
              at school.
            </button>
          </div>

          <p className="text-center text-xs text-[#8ea0bc] font-bold">
            👆 Tap each highlighted piece of the sentence above to inspect it!
          </p>

          {highlightPart === 'who' && (
            <div className="p-3.5 bg-[#3b2f12] border-2 border-[#f4b400] rounded-xl animate-in fade-in">
              <h4 className="text-xs font-black text-[#f4b400] uppercase">
                👤 WHO?
              </h4>
              <p className="text-sm font-bold text-[#f4f7fc]">
                The students – who the sentence is about.
              </p>
            </div>
          )}
          {highlightPart === 'what' && (
            <div className="p-3.5 bg-[#3b2f12] border-2 border-[#f4b400] rounded-xl animate-in fade-in">
              <h4 className="text-xs font-black text-[#f4b400] uppercase">
                🏃 WHAT HAPPENED?
              </h4>
              <p className="text-sm font-bold text-[#f4f7fc]">
                They arrived – the action they performed.
              </p>
            </div>
          )}
          {highlightPart === 'more' && (
            <div className="p-3.5 bg-[#3b2f12] border-2 border-[#f4b400] rounded-xl animate-in fade-in">
              <h4 className="text-xs font-black text-[#f4b400] uppercase">
                📍 MORE INFORMATION
              </h4>
              <p className="text-sm font-bold text-[#f4f7fc]">
                It tells us where they arrived (at school).
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 bg-[#1a2c4a] p-3.5 rounded-2xl border border-[#27406a]">
            <div className="w-11 h-11 rounded-full bg-[#bfe3f7] text-2xl grid place-items-center flex-none">
              🦉
            </div>
            <p className="text-sm font-bold text-[#f4f7fc]">
              ✨ The sentence gives us a complete message. We know WHO the
              sentence is about and WHAT happened.
            </p>
          </div>

          <button
            type="button"
            onClick={() => goToStep(5)}
            className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] active:translate-y-1 transition-all cursor-pointer"
          >
            NEXT ➡️
          </button>
        </div>
      )}

      {/* STEP 5: Incomplete thought */}
      {step === 5 && (
        <div className="space-y-5">
          <span className="inline-block text-xs font-black px-3 py-1 rounded-full bg-[#3a1c1c] text-[#ff9b8f] border border-[#ff5a4f]">
            ❌ INCOMPLETE THOUGHT EXAMPLE
          </span>
          <div className="p-5 bg-[#0d1a2e] border-2 border-dashed border-[#ff5a4f] rounded-2xl text-center text-xl font-black text-[#f4f7fc]">
            "Because the students arrived late."
          </div>

          <div className="flex items-center gap-3 bg-[#1a2c4a] p-3.5 rounded-2xl border border-[#27406a]">
            <div className="w-11 h-11 rounded-full bg-[#bfe3f7] text-2xl grid place-items-center flex-none">
              🦉
            </div>
            <p className="text-sm font-bold text-[#f4f7fc]">
              ❓ Is this a complete thought?
            </p>
          </div>

          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => handleSelect('yes')}
              className={`p-4 rounded-xl border-2 font-bold text-left flex items-center gap-3 cursor-pointer ${
                selectedOpt === 'yes'
                  ? 'border-[#ff5a4f] bg-[#3a1c1c]'
                  : 'border-[#223655] bg-[#0d1a2e]'
              }`}
            >
              <span className="text-lg">❌</span>
              <span>YES, COMPLETE</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelect('no')}
              className={`p-4 rounded-xl border-2 font-bold text-left flex items-center gap-3 cursor-pointer ${
                selectedOpt === 'no'
                  ? 'border-[#22b07d] bg-[#133328]'
                  : 'border-[#223655] bg-[#0d1a2e]'
              }`}
            >
              <span className="text-lg">✅</span>
              <span>NO, INCOMPLETE</span>
            </button>
          </div>

          {selectedOpt && (
            <div className="p-4 bg-[#133328] border border-[#22b07d] rounded-2xl animate-in fade-in space-y-2">
              <h3 className="text-base font-black text-[#6fe0ae]">
                💡 Correct Insight!
              </h3>
              <p className="text-xs sm:text-sm text-[#cbd8ec] font-semibold">
                "Because the students arrived late..." leaves us waiting for more
                information. The reader asks: "What happened because they
                arrived late?"
              </p>
              <div className="pt-2 border-t border-[#22b07d]/30 text-xs space-y-1">
                <p className="line-through text-[#ff9b8f]">
                  ❌ Because the students arrived late.
                </p>
                <p className="text-[#6fe0ae] font-bold">
                  ✅ The students missed the opening activity because they
                  arrived late.
                </p>
              </div>
            </div>
          )}

          {selectedOpt && (
            <button
              type="button"
              onClick={() => goToStep(6)}
              className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] active:translate-y-1 transition-all cursor-pointer"
            >
              I UNDERSTAND 👍
            </button>
          )}
        </div>
      )}

      {/* STEP 6: Three Questions */}
      {step === 6 && (
        <div className="space-y-5">
          <h2 className="text-2xl font-black text-[#f4f7fc]">
            🔍 GRAMMY'S COMPLETE THOUGHT CHECK
          </h2>
          <div className="flex items-center gap-3 bg-[#1a2c4a] p-3.5 rounded-2xl border border-[#27406a]">
            <div className="w-11 h-11 rounded-full bg-[#bfe3f7] text-2xl grid place-items-center flex-none">
              🦉
            </div>
            <p className="text-sm font-bold text-[#f4f7fc]">
              💡 Whenever you are unsure, use my three questions!
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-[#0d1a2e] border border-[#223655] rounded-2xl flex items-start gap-3">
              <span className="text-2xl">1️⃣</span>
              <div>
                <strong className="text-sm font-black text-[#ffd166] block">
                  1. WHO OR WHAT?
                </strong>
                <span className="text-xs text-[#8ea0bc] font-semibold">
                  Who or what is the sentence about?
                </span>
              </div>
            </div>
            <div className="p-4 bg-[#0d1a2e] border border-[#223655] rounded-2xl flex items-start gap-3">
              <span className="text-2xl">2️⃣</span>
              <div>
                <strong className="text-sm font-black text-[#ffd166] block">
                  2. WHAT HAPPENED?
                </strong>
                <span className="text-xs text-[#8ea0bc] font-semibold">
                  What did the subject do or what happened?
                </span>
              </div>
            </div>
            <div className="p-4 bg-[#0d1a2e] border border-[#223655] rounded-2xl flex items-start gap-3">
              <span className="text-2xl">3️⃣</span>
              <div>
                <strong className="text-sm font-black text-[#ffd166] block">
                  3. IS IT FINISHED?
                </strong>
                <span className="text-xs text-[#8ea0bc] font-semibold">
                  Does the sentence give a complete message?
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => goToStep(7)}
            className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] active:translate-y-1 transition-all cursor-pointer"
          >
            LET'S PRACTICE! 🚀
          </button>
        </div>
      )}

      {/* STEP 7: Practice 1 */}
      {step === 7 && (
        <div className="space-y-5">
          <h2 className="text-xl sm:text-2xl font-black text-[#f4f7fc]">
            ❓ WHICH ONE IS COMPLETE?
          </h2>
          <p className="text-xs sm:text-sm text-[#8ea0bc] font-semibold">
            Discuss with your group first before choosing!
          </p>

          <div className="grid gap-3">
            {[
              { id: 'A', text: 'The little boy with the red backpack.' },
              { id: 'B', text: 'The little boy carries a red backpack.' },
              { id: 'C', text: 'Because the little boy has a red backpack.' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`p-4 rounded-xl border-2 font-bold text-left flex items-center gap-3 cursor-pointer ${
                  selectedOpt === item.id
                    ? item.id === 'B'
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

          {selectedOpt === 'B' && (
            <div className="p-4 bg-[#133328] border border-[#22b07d] rounded-2xl animate-in fade-in">
              <h3 className="text-base font-black text-[#6fe0ae]">
                🎉 That's right!
              </h3>
              <p className="text-xs sm:text-sm text-[#cbd8ec] font-semibold mt-1">
                "The little boy carries a red backpack." tells us WHO (the
                little boy) and WHAT HAPPENED (carries a red backpack) with a
                finished message.
              </p>
            </div>
          )}

          {selectedOpt && selectedOpt !== 'B' && (
            <div className="p-3.5 bg-[#381919] border border-[#ff5a4f] rounded-xl text-[#ff9b8f] text-xs sm:text-sm font-bold">
              Try again! Check which sentence gives a finished message.
            </div>
          )}

          {selectedOpt === 'B' && (
            <button
              type="button"
              onClick={() => goToStep(8)}
              className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] active:translate-y-1 transition-all cursor-pointer"
            >
              CONTINUE ➡️
            </button>
          )}
        </div>
      )}

      {/* STEP 8: WE DO Intro */}
      {step === 8 && (
        <div className="space-y-5">
          <span className="inline-block text-xs font-black px-3 py-1 rounded-full bg-[#182b4a] text-[#8ea0bc]">
            Progress: WE DO 🤝
          </span>
          <h2 className="text-2xl font-black text-[#f4f7fc]">
            🤝 WE DO – LET'S DO IT TOGETHER!
          </h2>
          <div className="flex items-center gap-3 bg-[#1a2c4a] p-3.5 rounded-2xl border border-[#27406a]">
            <div className="w-11 h-11 rounded-full bg-[#bfe3f7] text-2xl grid place-items-center flex-none">
              🦉
            </div>
            <p className="text-sm font-bold text-[#f4f7fc]">
              👥 Now it's your turn to practice with me! Discuss the answer with
              your group before the Player taps.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#3b2f12] border border-dashed border-[#c48f00] text-center">
            <p className="text-xs font-black uppercase text-[#e3c065] tracking-wider mb-1">
              REMINDER
            </p>
            <p className="text-base sm:text-lg font-black text-[#f4f7fc]">
              THINK ➡️ DISCUSS ➡️ CHECK ➡️ TAP
            </p>
          </div>

          <button
            type="button"
            onClick={() => goToStep(9)}
            className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] active:translate-y-1 transition-all cursor-pointer"
          >
            START GROUP PRACTICE 🚀
          </button>
        </div>
      )}

      {/* STEP 9: WE DO Challenge 1 */}
      {step === 9 && (
        <div className="space-y-5">
          <span className="inline-block text-xs font-black px-3 py-1 rounded-full bg-[#1a2d4b] text-[#ffd166]">
            ⭐ CHALLENGE 1
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#f4f7fc]">
            Which sentence expresses a complete thought?
          </h2>

          <div className="grid gap-3">
            {[
              { id: 'A', text: 'Because Maria was tired.' },
              { id: 'B', text: 'Maria went home because she was tired.' },
              { id: 'C', text: 'After Maria went home.' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`p-4 rounded-xl border-2 font-bold text-left flex items-center gap-3 cursor-pointer ${
                  selectedOpt === item.id
                    ? item.id === 'B'
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

          {selectedOpt === 'B' && (
            <div className="p-4 bg-[#133328] border border-[#22b07d] rounded-2xl animate-in fade-in">
              <h3 className="text-base font-black text-[#6fe0ae]">
                🎉 Excellent teamwork!
              </h3>
              <p className="text-xs sm:text-sm text-[#cbd8ec] font-semibold mt-1">
                "Maria went home because she was tired." gives a complete message.
              </p>
            </div>
          )}

          {selectedOpt && selectedOpt !== 'B' && (
            <div className="p-3.5 bg-[#381919] border border-[#ff5a4f] rounded-xl text-[#ff9b8f] text-xs sm:text-sm font-bold">
              Not quite! Discuss with your group and find the sentence that
              gives a finished message.
            </div>
          )}

          {selectedOpt === 'B' && (
            <button
              type="button"
              onClick={() => goToStep(10)}
              className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] active:translate-y-1 transition-all cursor-pointer"
            >
              NEXT CHALLENGE ➡️
            </button>
          )}
        </div>
      )}

      {/* STEP 10: WE DO Challenge 2 */}
      {step === 10 && (
        <div className="space-y-5">
          <span className="inline-block text-xs font-black px-3 py-1 rounded-full bg-[#1a2d4b] text-[#ffd166]">
            ⭐ CHALLENGE 2
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#f4f7fc]">
            Which one is INCOMPLETE?
          </h2>

          <div className="grid gap-3">
            {[
              { id: 'A', text: 'The children played outside.' },
              { id: 'B', text: 'The children were happy.' },
              { id: 'C', text: 'When the children played outside.' },
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
                🎯 Correct!
              </h3>
              <p className="text-xs sm:text-sm text-[#cbd8ec] font-semibold mt-1">
                "When the children played outside..." leaves us waiting for
                another part of the sentence (e.g., they found a puppy).
              </p>
            </div>
          )}

          {selectedOpt && selectedOpt !== 'C' && (
            <div className="p-3.5 bg-[#381919] border border-[#ff5a4f] rounded-xl text-[#ff9b8f] text-xs sm:text-sm font-bold">
              Try again! Look for the phrase that leaves you waiting for what
              happened next.
            </div>
          )}

          {selectedOpt === 'C' && (
            <button
              type="button"
              onClick={() => goToStep(11)}
              className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] active:translate-y-1 transition-all cursor-pointer"
            >
              NEXT CHALLENGE ➡️
            </button>
          )}
        </div>
      )}

      {/* STEP 11: WE DO Challenge 3 */}
      {step === 11 && (
        <div className="space-y-5">
          <span className="inline-block text-xs font-black px-3 py-1 rounded-full bg-[#1a2d4b] text-[#ffd166]">
            ⭐ CHALLENGE 3 – FINISH THE THOUGHT
          </span>
          <div className="p-4 bg-[#0d1a2e] border-2 border-dashed border-[#ffd166] rounded-2xl text-center text-xl font-black">
            "The boy ________."
          </div>

          <div className="grid gap-3">
            {[
              { id: 'A', text: 'walks to church.' },
              { id: 'B', text: 'with a red bag.' },
              { id: 'C', text: 'running fast.' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`p-4 rounded-xl border-2 font-bold text-left flex items-center gap-3 cursor-pointer ${
                  selectedOpt === item.id
                    ? item.id === 'A'
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

          {selectedOpt === 'A' && (
            <div className="p-4 bg-[#133328] border border-[#22b07d] rounded-2xl animate-in fade-in">
              <h3 className="text-base font-black text-[#6fe0ae]">
                🎉 Great!
              </h3>
              <p className="text-xs sm:text-sm text-[#cbd8ec] font-semibold mt-1">
                Choice A adds the action ("walks to church") to make a complete
                sentence!
              </p>
            </div>
          )}

          {selectedOpt && selectedOpt !== 'A' && (
            <div className="p-3.5 bg-[#381919] border border-[#ff5a4f] rounded-xl text-[#ff9b8f] text-xs sm:text-sm font-bold">
              Try again! Find the option that adds what the boy does.
            </div>
          )}

          {selectedOpt === 'A' && (
            <button
              type="button"
              onClick={() => goToStep(12)}
              className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] active:translate-y-1 transition-all cursor-pointer"
            >
              NEXT ➡️
            </button>
          )}
        </div>
      )}

      {/* STEP 12: Hint System */}
      {step === 12 && (
        <div className="space-y-5">
          <h2 className="text-2xl font-black text-[#f4f7fc]">
            💡 HINT SYSTEM
          </h2>
          <p className="text-xs sm:text-sm text-[#8ea0bc] font-semibold">
            During the guided WE DO phase, you can request hints when your
            group needs guidance!
          </p>

          <div className="p-4 bg-[#0d1a2e] border border-[#223655] rounded-2xl space-y-3">
            <button
              type="button"
              onClick={() => {
                if (hintCount < 3) {
                  sound.playPop();
                  setHintCount(hintCount + 1);
                }
              }}
              className="w-full py-3 px-4 bg-[#182b4a] hover:bg-[#20375d] border border-[#ffd166] text-[#ffd166] font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lightbulb className="w-4 h-4" />
              <span>GET HINT ({hintCount}/3)</span>
            </button>

            {hintCount >= 1 && (
              <div className="p-3 bg-[#1c2b46] border border-[#ffd166]/40 rounded-xl text-xs font-bold text-[#cbd8ec] animate-in fade-in">
                <strong>Hint 1:</strong> Look for a sentence that gives a
                finished message.
              </div>
            )}
            {hintCount >= 2 && (
              <div className="p-3 bg-[#1c2b46] border border-[#ffd166]/40 rounded-xl text-xs font-bold text-[#cbd8ec] animate-in fade-in">
                <strong>Hint 2:</strong> Ask: Can this sentence stand alone by
                itself?
              </div>
            )}
            {hintCount >= 3 && (
              <div className="p-3 bg-[#1c2b46] border border-[#ffd166]/40 rounded-xl text-xs font-bold text-[#cbd8ec] animate-in fade-in">
                <strong>Hint 3:</strong> A sentence starting with words like
                'because' or 'when' usually needs another part.
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => goToStep(13)}
            className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] active:translate-y-1 transition-all cursor-pointer"
          >
            CONTINUE ➡️
          </button>
        </div>
      )}

      {/* STEP 13: Fix it */}
      {step === 13 && (
        <div className="space-y-5">
          <span className="inline-block text-xs font-black px-3 py-1 rounded-full bg-[#3a1c1c] text-[#ff9b8f] border border-[#ff5a4f]">
            🔧 FIX IT!
          </span>
          <div className="p-4 bg-[#0d1a2e] border-2 border-dashed border-[#ff5a4f] rounded-2xl text-center text-xl font-black text-[#ff9b8f]">
            "Maria before driving to school."
          </div>

          <div className="flex items-center gap-3 bg-[#1a2c4a] p-3.5 rounded-2xl border border-[#27406a]">
            <div className="w-11 h-11 rounded-full bg-[#bfe3f7] text-2xl grid place-items-center flex-none">
              🦉
            </div>
            <p className="text-sm font-bold text-[#f4f7fc]">
              ❓ Something is missing. Can your group fix it?
            </p>
          </div>

          <div className="grid gap-3">
            {[
              { id: 'A', text: 'Maria before driving to school.' },
              { id: 'B', text: 'Maria eats breakfast before driving to school.' },
              { id: 'C', text: 'Because Maria before driving to school.' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`p-4 rounded-xl border-2 font-bold text-left flex items-center gap-3 cursor-pointer ${
                  selectedOpt === item.id
                    ? item.id === 'B'
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

          {selectedOpt === 'B' && (
            <div className="p-4 bg-[#133328] border border-[#22b07d] rounded-2xl animate-in fade-in">
              <h3 className="text-base font-black text-[#6fe0ae]">
                Explanation:
              </h3>
              <p className="text-xs sm:text-sm text-[#cbd8ec] font-semibold mt-1">
                The original sentence tells WHO, but doesn't tell WHAT HAPPENED.
                "Maria eats breakfast before driving to school" gives a complete
                message!
              </p>
            </div>
          )}

          {selectedOpt === 'B' && (
            <button
              type="button"
              onClick={() => goToStep(14)}
              className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] active:translate-y-1 transition-all cursor-pointer"
            >
              READY FOR YOU DO 🚀
            </button>
          )}
        </div>
      )}

      {/* STEP 14: YOU DO Intro */}
      {step === 14 && (
        <div className="space-y-5">
          <span className="inline-block text-xs font-black px-3 py-1 rounded-full bg-[#182b4a] text-[#8ea0bc]">
            Progress: YOU DO 🎯
          </span>
          <h2 className="text-2xl font-black text-[#f4f7fc]">
            🎯 YOU DO – YOUR TURN!
          </h2>
          <div className="flex items-center gap-3 bg-[#1a2c4a] p-3.5 rounded-2xl border border-[#27406a]">
            <div className="w-11 h-11 rounded-full bg-[#bfe3f7] text-2xl grid place-items-center flex-none">
              🦉
            </div>
            <p className="text-sm font-bold text-[#f4f7fc]">
              ⭐ You have practiced with me. Now show what you have learned! No
              hints will appear until you submit.
            </p>
          </div>

          <div className="p-4 bg-[#0d1a2e] border border-[#223655] rounded-2xl">
            <strong className="text-xs font-black text-[#ffd166] uppercase block mb-1">
              Group instruction:
            </strong>
            <p className="text-xs sm:text-sm text-[#cbd8ec] font-semibold">
              Everyone thinks about the answer first. The assigned Player taps
              the group's answer and clicks SUBMIT.
            </p>
          </div>

          <button
            type="button"
            onClick={() => goToStep(15)}
            className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] active:translate-y-1 transition-all cursor-pointer"
          >
            START INDEPENDENT PRACTICE 🚀
          </button>
        </div>
      )}

      {/* STEP 15: YOU DO Q1 */}
      {step === 15 && (
        <div className="space-y-5">
          <span className="inline-block text-xs font-black px-3 py-1 rounded-full bg-[#1a2d4b] text-[#ffd166]">
            QUESTION 1 OF 5
          </span>
          <h2 className="text-xl font-black text-[#f4f7fc]">
            Which sentence expresses a complete thought?
          </h2>

          <div className="grid gap-2.5">
            {[
              { id: 'A', text: 'Because Kian runs every morning.' },
              { id: 'B', text: 'Kian runs to school but is still late.' },
              { id: 'C', text: 'After Kian arrives at school.' },
              { id: 'D', text: 'While Kian was running.' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={submitted}
                onClick={() => handleSelect(item.id)}
                className={`p-3.5 rounded-xl border-2 font-bold text-left flex items-center gap-3 transition-colors cursor-pointer ${
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
                <p className="text-xs sm:text-sm text-[#cbd8ec] mt-1 font-semibold">
                  Choice B ("Kian runs to school but is still late.") gives a
                  complete message.
                </p>
              </div>
              <button
                type="button"
                onClick={() => goToStep(16)}
                className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
              >
                NEXT QUESTION ➡️
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={!selectedOpt}
              onClick={handleSubmitQuestion}
              className={`w-full h-14 font-black rounded-2xl text-lg transition-all ${
                selectedOpt
                  ? 'bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] shadow-[0_5px_0_#c48f00] cursor-pointer'
                  : 'bg-[#2a3850] text-[#7385a3] cursor-not-allowed'
              }`}
            >
              SUBMIT
            </button>
          )}
        </div>
      )}

      {/* STEP 16: YOU DO Q2 */}
      {step === 16 && (
        <div className="space-y-5">
          <span className="inline-block text-xs font-black px-3 py-1 rounded-full bg-[#1a2d4b] text-[#ffd166]">
            QUESTION 2 OF 5
          </span>
          <h2 className="text-xl font-black text-[#f4f7fc]">
            Which sentence expresses a complete thought?
          </h2>

          <div className="grid gap-2.5">
            {[
              { id: 'A', text: 'Because the book was old.' },
              { id: 'B', text: 'After the book fell.' },
              { id: 'C', text: 'The book fell into the river.' },
              { id: 'D', text: 'While the river was flowing.' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={submitted}
                onClick={() => handleSelect(item.id)}
                className={`p-3.5 rounded-xl border-2 font-bold text-left flex items-center gap-3 transition-colors cursor-pointer ${
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
                  selectedOpt === 'C'
                    ? 'bg-[#133328] border-[#22b07d] text-[#6fe0ae]'
                    : 'bg-[#381919] border-[#ff5a4f] text-[#ff9b8f]'
                }`}
              >
                <h4 className="font-black text-base">
                  {selectedOpt === 'C' ? 'Correct! 🎉' : 'Incorrect'}
                </h4>
                <p className="text-xs sm:text-sm text-[#cbd8ec] mt-1 font-semibold">
                  Choice C ("The book fell into the river.") expresses a complete
                  thought.
                </p>
              </div>
              <button
                type="button"
                onClick={() => goToStep(17)}
                className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
              >
                NEXT QUESTION ➡️
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={!selectedOpt}
              onClick={handleSubmitQuestion}
              className={`w-full h-14 font-black rounded-2xl text-lg transition-all ${
                selectedOpt
                  ? 'bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] shadow-[0_5px_0_#c48f00] cursor-pointer'
                  : 'bg-[#2a3850] text-[#7385a3] cursor-not-allowed'
              }`}
            >
              SUBMIT
            </button>
          )}
        </div>
      )}

      {/* STEP 17: YOU DO Q3 */}
      {step === 17 && (
        <div className="space-y-5">
          <span className="inline-block text-xs font-black px-3 py-1 rounded-full bg-[#1a2d4b] text-[#ffd166]">
            QUESTION 3 OF 5
          </span>
          <h2 className="text-xl font-black text-[#f4f7fc]">
            Which sentence expresses a complete thought?
          </h2>

          <div className="grid gap-2.5">
            {[
              { id: 'A', text: 'Because the teacher is busy.' },
              { id: 'B', text: 'After teaching the class.' },
              { id: 'C', text: 'The teacher is teaching the class.' },
              { id: 'D', text: 'While the teacher explains.' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={submitted}
                onClick={() => handleSelect(item.id)}
                className={`p-3.5 rounded-xl border-2 font-bold text-left flex items-center gap-3 transition-colors cursor-pointer ${
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
                  selectedOpt === 'C'
                    ? 'bg-[#133328] border-[#22b07d] text-[#6fe0ae]'
                    : 'bg-[#381919] border-[#ff5a4f] text-[#ff9b8f]'
                }`}
              >
                <h4 className="font-black text-base">
                  {selectedOpt === 'C' ? 'Correct! 🎉' : 'Incorrect'}
                </h4>
                <p className="text-xs sm:text-sm text-[#cbd8ec] mt-1 font-semibold">
                  Choice C ("The teacher is teaching the class.") is complete.
                </p>
              </div>
              <button
                type="button"
                onClick={() => goToStep(18)}
                className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
              >
                NEXT QUESTION ➡️
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={!selectedOpt}
              onClick={handleSubmitQuestion}
              className={`w-full h-14 font-black rounded-2xl text-lg transition-all ${
                selectedOpt
                  ? 'bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] shadow-[0_5px_0_#c48f00] cursor-pointer'
                  : 'bg-[#2a3850] text-[#7385a3] cursor-not-allowed'
              }`}
            >
              SUBMIT
            </button>
          )}
        </div>
      )}

      {/* STEP 18: YOU DO Q4 */}
      {step === 18 && (
        <div className="space-y-5">
          <span className="inline-block text-xs font-black px-3 py-1 rounded-full bg-[#1a2d4b] text-[#ffd166]">
            QUESTION 4 OF 5
          </span>
          <h2 className="text-xl font-black text-[#f4f7fc]">
            Which sentence is complete?
          </h2>

          <div className="grid gap-2.5">
            {[
              { id: 'A', text: 'Because the girl loves swimming.' },
              { id: 'B', text: 'The girl is swimming in the ocean.' },
              { id: 'C', text: 'After swimming in the ocean.' },
              { id: 'D', text: 'While the waves were high.' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={submitted}
                onClick={() => handleSelect(item.id)}
                className={`p-3.5 rounded-xl border-2 font-bold text-left flex items-center gap-3 transition-colors cursor-pointer ${
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
                <p className="text-xs sm:text-sm text-[#cbd8ec] mt-1 font-semibold">
                  Choice B ("The girl is swimming in the ocean.") expresses a
                  complete thought.
                </p>
              </div>
              <button
                type="button"
                onClick={() => goToStep(19)}
                className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
              >
                NEXT QUESTION ➡️
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={!selectedOpt}
              onClick={handleSubmitQuestion}
              className={`w-full h-14 font-black rounded-2xl text-lg transition-all ${
                selectedOpt
                  ? 'bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] shadow-[0_5px_0_#c48f00] cursor-pointer'
                  : 'bg-[#2a3850] text-[#7385a3] cursor-not-allowed'
              }`}
            >
              SUBMIT
            </button>
          )}
        </div>
      )}

      {/* STEP 19: YOU DO Q5 */}
      {step === 19 && (
        <div className="space-y-5">
          <span className="inline-block text-xs font-black px-3 py-1 rounded-full bg-[#1a2d4b] text-[#ffd166]">
            QUESTION 5 OF 5
          </span>
          <h2 className="text-xl font-black text-[#f4f7fc]">
            Which sentence expresses a complete thought?
          </h2>

          <div className="grid gap-2.5">
            {[
              { id: 'A', text: 'Because Santino wakes up early.' },
              { id: 'B', text: 'After waking up early.' },
              {
                id: 'C',
                text: 'Santino wakes up early so he is not late to school.',
              },
              { id: 'D', text: 'While getting ready for school.' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={submitted}
                onClick={() => handleSelect(item.id)}
                className={`p-3.5 rounded-xl border-2 font-bold text-left flex items-center gap-3 transition-colors cursor-pointer ${
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
                  selectedOpt === 'C'
                    ? 'bg-[#133328] border-[#22b07d] text-[#6fe0ae]'
                    : 'bg-[#381919] border-[#ff5a4f] text-[#ff9b8f]'
                }`}
              >
                <h4 className="font-black text-base">
                  {selectedOpt === 'C' ? 'Correct! 🎉' : 'Incorrect'}
                </h4>
                <p className="text-xs sm:text-sm text-[#cbd8ec] mt-1 font-semibold">
                  Choice C ("Santino wakes up early so he is not late to
                  school.") gives a complete message!
                </p>
              </div>
              <button
                type="button"
                onClick={() => goToStep(20)}
                className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
              >
                VIEW MISSION SUMMARY ➡️
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={!selectedOpt}
              onClick={handleSubmitQuestion}
              className={`w-full h-14 font-black rounded-2xl text-lg transition-all ${
                selectedOpt
                  ? 'bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] shadow-[0_5px_0_#c48f00] cursor-pointer'
                  : 'bg-[#2a3850] text-[#7385a3] cursor-not-allowed'
              }`}
            >
              SUBMIT
            </button>
          )}
        </div>
      )}

      {/* STEP 20: Mission Summary */}
      {step === 20 && (
        <div className="space-y-5">
          <div className="text-center py-2">
            <div className="text-6xl mb-2 animate-bounce">🎉</div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#22b07d]">
              MISSION 1 COMPLETE!
            </h2>
          </div>

          <div className="flex items-center gap-3 bg-[#1a2c4a] p-3.5 rounded-2xl border border-[#27406a]">
            <div className="w-11 h-11 rounded-full bg-[#bfe3f7] text-2xl grid place-items-center flex-none">
              🦉
            </div>
            <p className="text-sm font-bold text-[#f4f7fc]">
              🌟 Amazing work, Sentence Builder! You learned how to identify
              complete and incomplete thoughts.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#133328] border border-[#22b07d] text-center space-y-1">
            <p className="text-xs font-black uppercase text-[#6fe0ae] tracking-wider">
              ⭐ MISSION 1: Complete the Thought
            </p>
            <p className="text-sm font-bold text-[#cbd8ec]">
              🧠 SKILL LEARNED: Completeness of Thought
            </p>
            <p className="text-lg font-black text-[#ffd166] flex items-center justify-center gap-1.5 pt-1">
              <Trophy className="w-5 h-5 text-[#f4b400]" />
              <span>Status: COMPLETE</span>
            </p>
          </div>

          <div className="space-y-1.5 bg-[#0d1a2e] p-4 rounded-2xl border border-[#223655] text-xs sm:text-sm font-bold text-[#cbd8ec]">
            <p className="text-[#ffd166] mb-1">What you mastered today:</p>
            <p>✅ Identify a complete thought</p>
            <p>✅ Identify an incomplete thought</p>
            <p>✅ Check if a sentence gives a finished message</p>
          </div>

          <button
            type="button"
            onClick={() => goToStep(21)}
            className="w-full h-14 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] active:translate-y-1 transition-all cursor-pointer"
          >
            CLAIM BADGE 🎖️
          </button>
        </div>
      )}

      {/* STEP 21: Badge Claim */}
      {step === 21 && (
        <div className="text-center space-y-6 py-4">
          <div className="text-6xl animate-bounce">🧩</div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#ffd166]">
              NEW BADGE UNLOCKED!
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#f4f7fc] mt-1">
              🎖️ COMPLETE THOUGHT MASTER
            </h2>
            <p className="text-sm text-[#8ea0bc] font-semibold mt-1">
              You completed your first GramCo mission!
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#1a2c4a] p-4 rounded-2xl border border-[#27406a] text-left">
            <div className="w-12 h-12 rounded-full bg-[#bfe3f7] text-2xl grid place-items-center flex-none">
              🦉
            </div>
            <p className="text-sm font-bold text-[#f4f7fc]">
              🌟 You now have the power to spot full, complete thoughts! Next up:
              arranging words in the right order!
            </p>
          </div>

          <button
            type="button"
            onClick={async () => {
              sound.playFanfare();
              await markSessionCompleted(student.code, 's1');
              onFinish();
            }}
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
