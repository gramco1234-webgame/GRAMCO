import React, { useState } from 'react';
import { StudentInfo } from '../types';
import { POSTTEST_QUESTIONS, SKILL_PART_MAP, scorePosttest } from '../data/curriculum';
import { sound } from '../services/sound';
import { submitStudentRecord } from '../services/api';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CircleCheck,
  AlertTriangle,
} from 'lucide-react';

interface PosttestScreenProps {
  student: StudentInfo;
  onFinishAll: () => void;
  onBackToHub: () => void;
}

const LETTERS = ['A', 'B', 'C', 'D'];

export const PosttestScreen: React.FC<PosttestScreenProps> = ({
  student,
  onFinishAll,
  onBackToHub,
}) => {
  const [step, setStep] = useState(25);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(
    Array(POSTTEST_QUESTIONS.length).fill(null)
  );
  const [, setScoreAchieved] = useState<number | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const currQ = POSTTEST_QUESTIONS[qIndex];
  const selectedAnswer = answers[qIndex];
  const total = POSTTEST_QUESTIONS.length;

  const handleSelectAnswer = (letter: string) => {
    sound.playPop();
    const updated = [...answers];
    updated[qIndex] = letter;
    setAnswers(updated);
  };

  const handleNextQ = async () => {
    if (!selectedAnswer) return;
    sound.playPop();

    if (qIndex < total - 1) {
      setQIndex(qIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Finished all 20 questions!
      const evaluated = scorePosttest(answers);
      setScoreAchieved(evaluated.score);
      await submitStudentRecord({
        recordType: 'test',
        phase: 'posttest',
        code: student.code,
        sex: student.sex,
        grade: student.grade,
        finishedAt: new Date().toISOString(),
        score: evaluated.score,
        total: evaluated.total,
        bySkill: evaluated.bySkill,
        items: evaluated.items,
      });
      sound.playFanfare();
      setStep(27);
    }
  };

  const handleBackQ = () => {
    if (qIndex > 0) {
      sound.playPop();
      setQIndex(qIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="card p-6 sm:p-8 bg-[#12213b] border border-[#1e3458] rounded-[28px] shadow-[0_18px_40px_rgba(0,0,0,0.4)] animate-in fade-in duration-300">
      {/* STEP 25: Posttest Intro */}
      {step === 25 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e3458]">
            <span className="text-xs font-black uppercase text-[#c99be0] bg-[#182b4a] px-3 py-1 rounded-full border border-[#263c62]">
              FINAL EVALUATION
            </span>
            <button
              type="button"
              onClick={onBackToHub}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#182b4a] hover:bg-[#20375d] border border-[#263c62] text-[#cbd8ec] hover:text-[#ffd166] text-xs font-bold transition-colors cursor-pointer"
              title="Return to the Roadmap"
            >
              <Compass className="w-3.5 h-3.5 text-[#ffd166]" />
              <span>Exit to Roadmap</span>
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#f4f7fc]">
            🎯 GRAMCO POST-TEST
          </h1>

          <div className="flex items-start gap-3 bg-[#1a2c4a] p-4 rounded-2xl border border-[#27406a]">
            <div className="w-12 h-12 rounded-full bg-[#bfe3f7] text-2xl grid place-items-center flex-none">
              🦉
            </div>
            <p className="text-sm font-bold text-[#f4f7fc] leading-snug">
              👋 Welcome to the GramCo Posttest! 🏆 You have completed all 5
              learning missions. Now let's see how much your sentence skills
              have grown!
            </p>
          </div>

          <div className="p-4 bg-[#0d1a2e] rounded-2xl border border-[#223655] space-y-2 text-xs sm:text-sm font-semibold text-[#cbd8ec]">
            <p className="font-black text-[#ffd166] uppercase text-xs">
              Post-test Instructions:
            </p>
            <p>
              • You will answer <strong>20 questions</strong> covering all 4 core
              sentence skills.
            </p>
            <p>• Choose the best answer for each question.</p>
            <p>• Take your time and read each sentence carefully.</p>
            <p>
              • No hints are given during the Posttest so results reflect true
              mastery.
            </p>
            <p>
              • Your results will be saved under Student Code{' '}
              <strong>{student.code}</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playPop();
              setStep(26);
            }}
            className="w-full h-15 bg-[#c99be0] hover:bg-[#d5afee] text-[#1c2b46] text-xl font-black rounded-2xl shadow-[0_5px_0_#9a6cb0] flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <span>START POST-TEST 🚀</span>
          </button>
        </div>
      )}

      {/* STEP 26: 20 Questions */}
      {step === 26 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e3458]">
            <button
              type="button"
              onClick={() => setShowExitConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#182b4a] hover:bg-[#20375d] border border-[#263c62] text-[#8ea0bc] hover:text-[#ffd166] text-xs font-bold transition-colors cursor-pointer"
              title="Return to the Roadmap"
            >
              <Compass className="w-3.5 h-3.5 text-[#ffd166]" />
              <span>Exit to Roadmap</span>
            </button>
            <span className="text-[11px] font-black uppercase text-[#ffd166] bg-[#182b4a] px-3 py-1 rounded-full border border-[#263c62]">
              {SKILL_PART_MAP[currQ.skill] || currQ.skill}
            </span>
          </div>

          {/* Exit Confirmation Modal */}
          {showExitConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
              <div className="w-full max-w-sm bg-[#12213b] border-2 border-[#2b446e] rounded-[24px] p-6 shadow-2xl space-y-4">
                <div className="flex items-center gap-3 text-[#f4b400]">
                  <div className="p-2.5 rounded-xl bg-[#f4b400]/20">
                    <AlertTriangle className="w-6 h-6 text-[#f4b400]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#f4f7fc]">
                      Exit Post-test?
                    </h3>
                    <p className="text-xs text-[#8ea0bc] font-semibold">
                      Question {qIndex + 1} of {total}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[#cbd8ec] leading-relaxed">
                  Your answers for this post-test attempt are not submitted
                  until you finish all 20 questions. Are you sure you want to go
                  back to the roadmap?
                </p>
                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowExitConfirm(false);
                      onBackToHub();
                    }}
                    className="flex-1 py-2.5 px-3 bg-[#e65100] hover:bg-[#ff6d00] text-white font-black rounded-xl text-xs shadow-sm cursor-pointer"
                  >
                    Yes, Return to Roadmap
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowExitConfirm(false)}
                    className="py-2.5 px-4 bg-[#182b4a] hover:bg-[#20375d] text-[#cbd8ec] font-bold rounded-xl text-xs border border-[#223655] cursor-pointer"
                  >
                    Keep Testing
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 rounded-full bg-[#1c2e4c] overflow-hidden p-0.5 border border-[#223655]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#c99be0] via-[#8ecdf5] to-[#22b07d] transition-all duration-300"
                style={{ width: `${Math.round(((qIndex + 1) / total) * 100)}%` }}
              />
            </div>
            <span className="text-xs sm:text-sm font-extrabold text-[#9fb0cc] whitespace-nowrap">
              Question {qIndex + 1} of {total}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-[#f4f7fc] leading-snug">
            {currQ.q}
          </h2>

          <div className="grid gap-2.5">
            {currQ.opts.map((opt, optIdx) => {
              const letter = LETTERS[optIdx];
              const isSelected = selectedAnswer === letter;
              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => handleSelectAnswer(letter)}
                  className={`w-full p-3.5 sm:px-4 rounded-xl border-2 font-bold text-left flex items-center gap-3 transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-[#c99be0] bg-[#2c1d42] text-white shadow-md ring-2 ring-[#c99be0]/30'
                      : 'border-[#223655] bg-[#0d1a2e] text-[#cbd8ec] hover:border-[#38537d]'
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-full grid place-items-center text-xs font-black flex-none ${
                      isSelected
                        ? 'bg-[#c99be0] text-[#1c2b46]'
                        : 'bg-[#182b4a] text-[#8ea0bc]'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="text-sm sm:text-base flex-1">{opt}</span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-3 pt-2">
            {qIndex > 0 && (
              <button
                type="button"
                onClick={handleBackQ}
                className="w-1/3 min-h-[54px] rounded-xl bg-transparent border-2 border-[#223655] text-[#b9c6dd] font-bold text-base flex items-center justify-center gap-1 cursor-pointer hover:bg-[#182b4a]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
            <button
              type="button"
              disabled={!selectedAnswer}
              onClick={handleNextQ}
              className={`flex-1 min-h-[54px] rounded-xl font-black text-lg transition-all flex items-center justify-center gap-2 ${
                selectedAnswer
                  ? 'bg-[#c99be0] hover:bg-[#d5afee] text-[#1c2b46] shadow-[0_5px_0_#9a6cb0] cursor-pointer'
                  : 'bg-[#2a3850] text-[#7385a3] cursor-not-allowed'
              }`}
            >
              {qIndex === total - 1 ? (
                <>
                  <CircleCheck className="w-5 h-5 text-[#1c2b46]" />
                  <span>FINISH POST-TEST 🎉</span>
                </>
              ) : (
                <>
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 27: Posttest Completed */}
      {step === 27 && (
        <div className="space-y-5 text-center py-3">
          <div className="text-6xl animate-bounce">🎉</div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#6fe0ae]">
            POST-TEST COMPLETE!
          </h2>

          <div className="flex items-start gap-3 bg-[#1a2c4a] p-4 rounded-2xl border border-[#27406a] text-left">
            <div className="w-12 h-12 rounded-full bg-[#bfe3f7] text-2xl grid place-items-center flex-none">
              🦉
            </div>
            <p className="text-sm sm:text-base font-bold text-[#f4f7fc]">
              🌟 You finished the GramCo Post-test! 🏆 Fantastic effort completing
              all 20 questions!
            </p>
          </div>

          <div className="p-4 bg-[#133328] border border-[#22b07d] rounded-2xl text-center space-y-1">
            <h4 className="text-sm font-black text-[#6fe0ae] uppercase">
              🔒 YOUR ANSWERS HAVE BEEN SAVED
            </h4>
            <p className="text-xs text-[#cbd8ec] font-semibold">
              Your responses have been recorded under student code{' '}
              <strong>{student.code}</strong>. Your teacher can view your growth
              results in the Teacher Portal.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playPop();
              setStep(28);
            }}
            className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
          >
            SEE ALL EARNED BADGES 🎖️
          </button>
        </div>
      )}

      {/* STEP 28: All Badges */}
      {step === 28 && (
        <div className="space-y-5">
          <div className="text-center py-2">
            <div className="text-6xl mb-2">🎓</div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#ffd166]">
              CONGRATULATIONS, {student.code}!
            </h2>
            <p className="text-sm text-[#8ea0bc] font-bold">
              Official GramCo Sentence Builder Graduate
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-[#ffd166] tracking-wider">
              ⭐ YOUR EARNED BADGES:
            </h4>
            <div className="grid gap-2">
              <div className="p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl flex items-center gap-3">
                <span className="text-2xl">🧩</span>
                <div>
                  <strong className="text-sm text-white">
                    Complete Thought Master
                  </strong>
                  <p className="text-xs text-[#8ea0bc]">
                    Session 1: Completeness of Thought
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <strong className="text-sm text-white">
                    Word Order Expert
                  </strong>
                  <p className="text-xs text-[#8ea0bc]">
                    Session 2: Word Order and Arrangement
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl flex items-center gap-3">
                <span className="text-2xl">🤝</span>
                <div>
                  <strong className="text-sm text-white">
                    Subject-Verb Match Master
                  </strong>
                  <p className="text-xs text-[#8ea0bc]">
                    Session 3: Subject-Verb Agreement
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl flex items-center gap-3">
                <span className="text-2xl">✍️</span>
                <div>
                  <strong className="text-sm text-white">Punctuation Pro</strong>
                  <p className="text-xs text-[#8ea0bc]">
                    Session 4: Punctuation and Capitalization
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#3b2f12] border border-[#f4b400] rounded-xl flex items-center gap-3">
                <span className="text-2xl">🏆</span>
                <div>
                  <strong className="text-sm text-[#ffd166]">
                    GramCo Sentence Builder
                  </strong>
                  <p className="text-xs text-[#e3c065]">
                    Session 5: Putting It All Together
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playPop();
              setStep(29);
            }}
            className="w-full h-14 bg-[#22b07d] text-white text-lg font-black rounded-2xl shadow-[0_5px_0_#147a54] cursor-pointer"
          >
            VIEW PROGRAM COMPLETION 🚀
          </button>
        </div>
      )}

      {/* STEP 29: Complete */}
      {step === 29 && (
        <div className="space-y-5 text-center py-2">
          <div className="text-6xl">🎓</div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#ffd166]">
            GREAT JOB!
          </h2>
          <h3 className="text-lg font-black text-[#f4f7fc]">
            GRAMCO: SENTENCE BUILDER ADVENTURE
          </h3>
          <p className="text-sm text-[#b5c3db] italic max-w-sm mx-auto">
            "Every great sentence starts with one correctly placed word."
          </p>

          <div className="p-4 bg-[#133328] border border-[#22b07d] rounded-2xl">
            <span className="text-xs font-bold text-[#8ea0bc] uppercase block mb-1">
              Status
            </span>
            <p className="text-base font-black text-[#6fe0ae]">
              🎉 GRAMCO PROGRAM FULLY COMPLETE
            </p>
          </div>

          <button
            type="button"
            onClick={onFinishAll}
            className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
          >
            RETURN TO ROADMAP 🏠
          </button>
        </div>
      )}
    </div>
  );
};
