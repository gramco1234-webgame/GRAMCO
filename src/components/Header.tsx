import React from 'react';
import { StudentInfo } from '../types';
import {
  Compass,
  LogOut,
  User,
  ShieldCheck,
} from 'lucide-react';

interface HeaderProps {
  currentScreen: string;
  student: StudentInfo | null;
  serverConnected: boolean;
  onNavigate: (screen: string) => void;
  onOpenTeacher?: () => void;
  onLogout: () => void;
  onBackToRoadmap?: () => void;
}

const STEPS = [
  { key: 'login', icon: '👤', label: 'Login' },
  { key: 'pretest', icon: '📝', label: 'Pretest' },
  { key: 'learn', icon: '🗺️', label: 'Roadmap' },
  { key: 'posttest', icon: '🎯', label: 'Post-test' },
  { key: 'results', icon: '🏆', label: 'Results' },
];

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  student,
  serverConnected,
  onNavigate,
  onOpenTeacher,
  onLogout,
  onBackToRoadmap,
}) => {
  let stepIndex = 0;
  if (currentScreen === 'login') stepIndex = 0;
  else if (currentScreen === 'pretest') stepIndex = 1;
  else if (
    currentScreen === 'pretest-done' ||
    currentScreen === 'learn' ||
    currentScreen.startsWith('session-')
  )
    stepIndex = 2;
  else if (currentScreen === 'posttest') stepIndex = 3;
  else if (currentScreen === 'posttest-done' || currentScreen === 'teacher')
    stepIndex = 4;

  const showBackToRoadmap =
    student?.code &&
    currentScreen !== 'learn' &&
    currentScreen !== 'teacher' &&
    currentScreen !== 'login';

  return (
    <header className="w-full max-w-2xl mx-auto mb-6 text-center select-none">
      {/* Top action status row */}
      <div className="flex items-center justify-between px-2 py-1.5 mb-3 text-xs">
        <div className="flex items-center gap-2">
          {student?.code && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#12213b] border border-[#2a3850] text-[#cbd8ec] font-bold">
              <User className="w-3.5 h-3.5 text-[#ffd166]" />
              <span className="text-[#ffd166]">{student.code}</span>
              <span className="text-[#8ea0bc] hidden sm:inline">
                ({student.grade})
              </span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onOpenTeacher && currentScreen !== 'teacher' && (
            <button
              type="button"
              onClick={onOpenTeacher}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2a1e4a] hover:bg-[#392963] border border-[#6b47a4] text-[#ffd166] hover:text-white font-extrabold transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Direct Access to Teacher Portal (PIN: 1234)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#ffd166]" />
              <span>Teacher Portal</span>
            </button>
          )}
          {showBackToRoadmap && (
            <button
              type="button"
              onClick={onBackToRoadmap || (() => onNavigate('learn'))}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b3d32] hover:bg-[#234e40] border border-[#2ea47b]/60 text-[#6fe0ae] font-black transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Return to the Learning Missions Roadmap"
            >
              <Compass className="w-3.5 h-3.5 text-[#6fe0ae]" />
              <span>Back to Roadmap</span>
            </button>
          )}
          {student?.code && (
            <button
              type="button"
              onClick={onLogout}
              title="Sign Out Student Account"
              className="p-1.5 rounded-full bg-[#12213b] hover:bg-[#1a2c4a] border border-[#2a3850] text-[#8ea0bc] hover:text-[#ff9b8f] transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* GramCo Colorful Logo Blocks */}
      <div className="inline-flex gap-2 mb-2 items-center justify-center">
        <span className="w-12 h-12 sm:w-14 sm:h-14 grid place-items-center rounded-2xl text-3xl sm:text-4xl font-black text-[#1c2b46] shadow-[0_5px_0_rgba(0,0,0,0.3)] bg-[#ffd166] transform -rotate-3 transition-transform hover:scale-105">
          G
        </span>
        <span className="w-12 h-12 sm:w-14 sm:h-14 grid place-items-center rounded-2xl text-3xl sm:text-4xl font-black text-[#1c2b46] shadow-[0_5px_0_rgba(0,0,0,0.3)] bg-[#8ecdf5] transform rotate-2 transition-transform hover:scale-105">
          r
        </span>
        <span className="w-12 h-12 sm:w-14 sm:h-14 grid place-items-center rounded-2xl text-3xl sm:text-4xl font-black text-[#1c2b46] shadow-[0_5px_0_rgba(0,0,0,0.3)] bg-[#ff9f80] transform -rotate-2 transition-transform hover:scale-105">
          a
        </span>
        <span className="w-12 h-12 sm:w-14 sm:h-14 grid place-items-center rounded-2xl text-3xl sm:text-4xl font-black text-[#1c2b46] shadow-[0_5px_0_rgba(0,0,0,0.3)] bg-[#a8dfb0] transform rotate-3 transition-transform hover:scale-105">
          m
        </span>
        <span className="w-12 h-12 sm:w-14 sm:h-14 grid place-items-center rounded-2xl text-3xl sm:text-4xl font-black text-[#1c2b46] shadow-[0_5px_0_rgba(0,0,0,0.3)] bg-[#c99be0] transform -rotate-2 transition-transform hover:scale-105">
          C
        </span>
        <span className="w-12 h-12 sm:w-14 sm:h-14 grid place-items-center rounded-2xl text-3xl sm:text-4xl font-black text-[#1c2b46] shadow-[0_5px_0_rgba(0,0,0,0.3)] bg-[#f28cb5] transform rotate-2 transition-transform hover:scale-105">
          o
        </span>
      </div>

      <p className="text-base sm:text-lg font-bold text-[#9fb0cc] tracking-wide mb-5">
        Aid in Sentence Structure Skills Development
      </p>

      {/* Progress Trail Header */}
      {currentScreen !== 'teacher' && (
        <div className="flex items-start justify-center max-w-md mx-auto my-4 px-2">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < stepIndex;
            const isCurrent = idx === stepIndex;
            return (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center gap-1.5 w-14 flex-none">
                  <div
                    className={`w-11 h-11 rounded-full grid place-items-center text-lg border-2 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-[#22b07d] border-[#9be3c5] text-white shadow-md'
                        : isCurrent
                        ? 'bg-[#f4b400] border-[#ffd44d] text-[#1c2b46] ring-4 ring-[#f4b400]/25 shadow-lg scale-105'
                        : 'bg-[#0d1a2e] border-[#223655] text-[#7385a3]'
                    }`}
                  >
                    {isCompleted ? '✓' : step.icon}
                  </div>
                  <span
                    className={`text-[11px] font-extrabold whitespace-nowrap ${
                      isCurrent
                        ? 'text-[#f4b400]'
                        : isCompleted
                        ? 'text-[#6fe0ae]'
                        : 'text-[#7385a3]'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mt-5.5 transition-colors duration-300 ${
                      idx < stepIndex ? 'bg-[#22b07d]' : 'bg-[#223655]'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </header>
  );
};
