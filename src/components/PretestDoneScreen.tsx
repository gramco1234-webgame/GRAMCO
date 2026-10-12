import React, { useEffect } from 'react';
import { StudentInfo } from '../types';
import { MISSIONS } from '../data/curriculum';
import { sound } from '../services/sound';
import { Compass, Trophy, Lock, LockOpen, ArrowRight, Sparkles } from 'lucide-react';

interface PretestDoneScreenProps {
  student: StudentInfo;
  onContinue: () => void;
}

export const PretestDoneScreen: React.FC<PretestDoneScreenProps> = ({
  student,
  onContinue,
}) => {
  useEffect(() => {
    sound.playFanfare();
  }, []);

  return (
    <div className="card p-6 sm:p-8 bg-[#12213b] border border-[#1e3458] rounded-[28px] shadow-[0_18px_40px_rgba(0,0,0,0.4)] animate-in fade-in duration-300">
      <div className="text-center pt-2 pb-5">
        <div className="text-6xl sm:text-7xl mb-3 animate-bounce">🎉</div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#f4f7fc] mb-2">
          Great job, {student.code}!
        </h2>
        <p className="text-[#b5c3db] text-sm sm:text-base font-semibold max-w-md mx-auto leading-relaxed">
          You've completed the Pretest. Grammy has safely recorded your answers —
          no scores are displayed yet, ensuring a fair starting benchmark.
        </p>
      </div>

      <div className="flex items-center gap-3.5 mb-6 bg-[#1a2c4a] p-4 rounded-2xl border border-[#27406a]">
        <div className="w-13 h-13 rounded-full bg-[#bfe3f7] text-3xl grid place-items-center flex-none shadow-sm">
          🦉
        </div>
        <div className="text-sm sm:text-base font-bold text-[#f4f7fc] leading-snug">
          Welcome, Sentence Builder! 🚀 Get ready to master your sentence
          structure skills through fun interactive challenges and missions!
        </div>
      </div>

      {/* 5 Missions Roadmap Preview */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#ffd166]" />
          <h3 className="text-xs font-black uppercase tracking-wider text-[#ffd166]">
            🗺️ Your Adventure Roadmap (5 Learning Missions)
          </h3>
        </div>

        <div className="grid gap-2.5">
          {MISSIONS.map((m, idx) => {
            const isFirst = idx === 0;
            return (
              <div
                key={m.key}
                className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 text-left transition-all ${
                  isFirst
                    ? 'bg-[#182b4a] border-[#f4b400] shadow-sm'
                    : 'bg-[#0d1a2e]/70 border-[#1c2c48] opacity-75'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl grid place-items-center text-lg flex-none ${
                    isFirst
                      ? 'bg-[#f4b400]/20 text-[#ffd166]'
                      : 'bg-[#182b4a] text-[#7385a3]'
                  }`}
                >
                  {isFirst ? (
                    <LockOpen className="w-4 h-4 text-[#f4b400]" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#ffd166] uppercase">
                      Day {m.day}
                    </span>
                    <span className="text-xs font-bold text-[#8ea0bc]">
                      • Mission {idx + 1}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-[#f4f7fc] truncate">
                    {m.missionTitle}
                  </h4>
                  <p className="text-xs text-[#8ea0bc] font-semibold line-clamp-1">
                    {m.missionDesc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-[#3b2f12] border border-dashed border-[#c48f00] text-center mb-6">
        <p className="text-xs font-black uppercase tracking-wider text-[#e3c065] mb-1">
          🎯 YOUR GOAL
        </p>
        <p className="text-base sm:text-lg font-black text-[#f4f7fc] flex items-center justify-center gap-2">
          <Trophy className="w-5 h-5 text-[#f4b400]" />
          <span>Complete all missions to become a GramCo Sentence Builder!</span>
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          sound.playPop();
          onContinue();
        }}
        className="w-full h-15 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-xl font-black rounded-[18px] shadow-[0_5px_0_#c48f00] active:translate-y-1 active:shadow-[0_2px_0_#c48f00] flex items-center justify-center gap-2 transition-transform cursor-pointer"
      >
        <Sparkles className="w-5 h-5" />
        <span>Open Sentence Roadmap</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};
