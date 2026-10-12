import React, { useState } from 'react';
import { StudentInfo } from '../types';
import { PRETEST_QUESTIONS, scorePretest } from '../data/curriculum';
import { sound } from '../services/sound';
import { submitStudentRecord, hasStudentCompletedPhaseLocally } from '../services/api';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CircleCheck,
  AlertTriangle,
} from 'lucide-react';

interface PretestScreenProps {
  student: StudentInfo;
  onPretestComplete: () => void;
  onBackToRoadmap: () => void;
  onExit: () => void;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export const PretestScreen: React.FC<PretestScreenProps> = ({
  student,
  onPretestComplete,
  onBackToRoadmap,
  onExit,
}) => {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const currentQ = PRETEST_QUESTIONS[index];
  const total = PRETEST_QUESTIONS.length;
  const currentAnswer = answers[index];

  const isMC = currentQ.type === 'mc';
  const isOrder = currentQ.type === 'order';
  const alreadyCompleted = hasStudentCompletedPhaseLocally(student.code, 'pretest');

  let hasAnsweredCurrent = false;
  if (isMC) {
    hasAnsweredCurrent = currentAnswer !== undefined && currentAnswer !== null;
  } else if (isOrder) {
    hasAnsweredCurrent =
      (currentAnswer || []).length === currentQ.words.length;
  }

  const handleSelectMC = (optIndex: number) => {
    sound.playPop();
    const updated = [...answers];
    updated[index] = optIndex;
    setAnswers(updated);
  };

  const handlePickOrderWord = (wordIdx: number) => {
    sound.playPop();
    const list = ((answers[index] as number[]) || []).slice();
    if (!list.includes(wordIdx)) {
      list.push(wordIdx);
      const updated = [...answers];
      updated[index] = list;
      setAnswers(updated);
    }
  };

  const handleRemoveOrderWord = (wordIdx: number) => {
    sound.playPop();
    const list = ((answers[index] as number[]) || []).filter(
      (w) => w !== wordIdx
    );
    const updated = [...answers];
    updated[index] = list;
    setAnswers(updated);
  };

  const handleNext = async () => {
    if (!hasAnsweredCurrent) return;
    sound.playPop();

    if (index < total - 1) {
      setIndex(index + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Calculate and save pretest score to centralized server
      const result = scorePretest(answers);
      await submitStudentRecord({
        recordType: 'test',
        phase: 'pretest',
        code: student.code,
        sex: student.sex,
        grade: student.grade,
        finishedAt: new Date().toISOString(),
        score: result.score,
        total: result.total,
        bySkill: result.bySkill,
        items: result.items,
      });
      sound.playFanfare();
      onPretestComplete();
    }
  };

  const handleBack = () => {
    if (index > 0) {
      sound.playPop();
      setIndex(index - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleConfirmExit = () => {
    sound.playPop();
    setShowExitConfirm(false);
    if (alreadyCompleted && onBackToRoadmap) {
      onBackToRoadmap();
    } else if (onExit) {
      onExit();
    } else {
      onBackToRoadmap();
    }
  };

  const progressPercent = Math.round(((index + 1) / total) * 100);

  return (
    <div className="card p-6 sm:p-8 bg-[#12213b] border border-[#1e3458] rounded-[28px] shadow-[0_18px_40px_rgba(0,0,0,0.4)] animate-in fade-in duration-300">
      {/* Sub Header & Exit Navigation */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1e3458]">
        <button
          type="button"
          onClick={() => setShowExitConfirm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#182b4a] hover:bg-[#20375d] border border-[#263c62] text-[#8ea0bc] hover:text-[#ffd166] text-xs font-bold transition-colors cursor-pointer"
          title="Exit to Roadmap / Main Menu"
        >
          <Compass className="w-3.5 h-3.5 text-[#ffd166]" />
          <span>Exit / Go to Roadmap</span>
        </button>
        <span className="inline-block px-3 py-1 rounded-full bg-[#1a2d4b] text-[#ffd166] text-xs font-extrabold uppercase border border-[#263c62]">
          Pretest Phase
        </span>
      </div>

      {/* Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-[#12213b] border-2 border-[#2b446e] rounded-[24px] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#f4b400]">
              <div className="p-2.5 rounded-xl bg-[#f4b400]/20">
                <AlertTriangle className="w-6 h-6 text-[#f4b400]" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#f4f7fc]">
                  Exit Pretest?
                </h3>
                <p className="text-xs text-[#8ea0bc] font-semibold">
                  You are currently on Question {index + 1} of {total}.
                </p>
              </div>
            </div>
            <p className="text-xs text-[#cbd8ec] leading-relaxed">
              {alreadyCompleted
                ? 'You have already completed the Pretest earlier. You can safely return to your learning roadmap anytime.'
                : 'Leaving now means your current pretest session will not be saved until completed. Are you sure you want to go back?'}
            </p>
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleConfirmExit}
                className="flex-1 py-2.5 px-3 bg-[#e65100] hover:bg-[#ff6d00] text-white font-black rounded-xl text-xs shadow-sm cursor-pointer"
              >
                Yes, Exit to Roadmap
              </button>
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="py-2.5 px-4 bg-[#182b4a] hover:bg-[#20375d] text-[#cbd8ec] font-bold rounded-xl text-xs border border-[#223655] cursor-pointer"
              >
                Keep Going
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skill Category & Counter */}
      <div className="flex items-center justify-between mb-4">
        <span className="inline-block px-3.5 py-1.5 rounded-full bg-[#1a2d4b] text-[#8ea0bc] text-xs font-extrabold tracking-wide uppercase border border-[#263c62]">
          {currentQ.skill}
        </span>
        <span className="text-xs font-bold text-[#8ea0bc]">
          Item {index + 1} of {total}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-3.5 mb-6">
        <div className="flex-1 h-3 rounded-full bg-[#1c2e4c] overflow-hidden p-0.5 border border-[#223655]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#f4b400] via-[#ff8a3d] to-[#22b07d] transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-xs sm:text-sm font-extrabold text-[#9fb0cc] whitespace-nowrap">
          {progressPercent}%
        </span>
      </div>

      {/* Hint Bubble if available */}
      {currentQ.hint && (
        <div className="flex items-center gap-3 mb-5 bg-[#1a2c4a] p-3.5 rounded-2xl border border-[#27406a]">
          <div className="w-11 h-11 rounded-full bg-[#bfe3f7] text-2xl grid place-items-center flex-none">
            💡
          </div>
          <div className="text-sm font-bold text-[#f4f7fc] leading-snug">
            {currentQ.hint}
          </div>
        </div>
      )}

      {/* Question Prompt */}
      <h2 className="text-xl sm:text-2xl font-black text-[#f4f7fc] leading-snug mb-5">
        {currentQ.q}
      </h2>

      {/* Multiple Choice Format */}
      {isMC && (
        <div className="grid gap-3 mb-6" role="radiogroup">
          {currentQ.options.map((opt, optIdx) => {
            const isSelected = currentAnswer === optIdx;
            return (
              <button
                key={optIdx}
                type="button"
                onClick={() => handleSelectMC(optIdx)}
                className={`w-full min-h-[58px] p-3.5 sm:px-5 flex items-center gap-3.5 rounded-[18px] border-2 text-left font-bold text-base sm:text-lg transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-[#3b2f12] border-[#f4b400] text-[#f4f7fc] shadow-md ring-2 ring-[#f4b400]/30'
                    : 'bg-[#0d1a2e] border-[#223655] hover:border-[#38537d] text-[#e2eaf6]'
                }`}
              >
                <span
                  className={`w-9 h-9 rounded-full grid place-items-center text-sm font-black flex-none transition-colors ${
                    isSelected
                      ? 'bg-[#f4b400] text-[#1c2b46]'
                      : 'bg-[#182b4a] text-[#cbd8ec]'
                  }`}
                >
                  {LETTERS[optIdx]}
                </span>
                <span className="flex-1">{opt}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Word Arrangement Format */}
      {isOrder && (
        <div className="space-y-4 mb-6">
          <div className="min-h-[86px] p-4 bg-[#0d1a2e] border-2 border-dashed border-[#2b446e] rounded-[18px] flex flex-wrap gap-2 items-center">
            {(currentAnswer || []).length === 0 ? (
              <span className="text-sm font-bold text-[#6f86ad]">
                Tap the words below in order to build the sentence 👇
              </span>
            ) : (
              (currentAnswer || []).map((wIdx: number) => (
                <button
                  key={wIdx}
                  type="button"
                  onClick={() => handleRemoveOrderWord(wIdx)}
                  className="px-4 py-2.5 bg-[#f4b400] text-[#1c2b46] rounded-xl font-black text-base shadow-[0_3px_0_#c48f00] hover:bg-[#ffc117] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>{currentQ.words[wIdx]}</span>
                  <span className="text-xs opacity-75">✕</span>
                </button>
              ))
            )}
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            {currentQ.words.map((word, wIdx) => {
              const isChosen = (currentAnswer || []).includes(wIdx);
              if (isChosen) return null;
              return (
                <button
                  key={wIdx}
                  type="button"
                  onClick={() => handlePickOrderWord(wIdx)}
                  className="px-4 py-2.5 bg-[#182b4a] hover:bg-[#203960] text-[#f4f7fc] border border-[#2a3850] rounded-xl font-bold text-base shadow-[0_3px_0_#0e1a2f] active:scale-95 transition-all cursor-pointer"
                >
                  {word}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        {index > 0 && (
          <button
            type="button"
            onClick={handleBack}
            className="w-1/3 min-h-[56px] px-4 rounded-[18px] bg-transparent hover:bg-[#182b4a] border-2 border-[#223655] text-[#b9c6dd] font-black text-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        )}
        <button
          type="button"
          onClick={handleNext}
          disabled={!hasAnsweredCurrent}
          className={`flex-1 min-h-[56px] px-6 rounded-[18px] font-black text-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            hasAnsweredCurrent
              ? 'bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] shadow-[0_5px_0_#c48f00] active:translate-y-1 active:shadow-[0_2px_0_#c48f00]'
              : 'bg-[#2a3850] text-[#7385a3] shadow-[0_3px_0_#1c283c] cursor-not-allowed'
          }`}
        >
          {index === total - 1 ? (
            <>
              <CircleCheck className="w-5 h-5 text-[#1c2b46]" />
              <span>Finish Pretest 🚀</span>
            </>
          ) : (
            <>
              <span>Next</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
