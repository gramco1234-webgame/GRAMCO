import React, { useState } from 'react';
import { StudentInfo, StudentProgress, SessionRelease } from '../types';
import { MISSIONS } from '../data/curriculum';
import { sound } from '../services/sound';
import {
  isSessionCompleted,
  isSessionAccessible,
  hasStudentCompletedPhaseLocally,
} from '../services/api';
import {
  ShieldCheck,
  ShieldAlert,
  Compass,
  CircleAlert,
  CircleCheck,
  Play,
  Lock,
  Trophy,
  ArrowRight,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface RoadmapScreenProps {
  student: StudentInfo;
  progress: StudentProgress;
  sessionRelease?: SessionRelease;
  onSelectSession: (sessionKey: string) => void;
  onStartPosttest: () => void;
  onLogout?: () => void;
  onReviewPretest?: () => void;
}

export const RoadmapScreen: React.FC<RoadmapScreenProps> = ({
  student,
  progress,
  sessionRelease,
  onSelectSession,
  onStartPosttest,
  onLogout,
}) => {
  const [deniedMsg, setDeniedMsg] = useState<string | null>(null);

  const checkUnlocked = (key: string) => {
    if (sessionRelease && sessionRelease[key as keyof SessionRelease] !== undefined) {
      if (sessionRelease[key as keyof SessionRelease]) return true;
    }
    return isSessionAccessible(student.code, key, false);
  };

  const hasPosttest = hasStudentCompletedPhaseLocally(student.code, 'posttest');
  const posttestUnlocked = checkUnlocked('posttest');
  const authorizedCount = MISSIONS.filter((m) => checkUnlocked(m.key)).length;
  const completedCount = MISSIONS.filter((m) =>
    isSessionCompleted(m.key, progress)
  ).length;

  const triggerAccessDenied = (title: string, missionNum: number) => {
    sound.playLock();
    setDeniedMsg(
      `Access Denied: Mission ${missionNum} (${title}) is locked by your teacher. When your teacher releases this mission in the Teacher Portal, it will automatically unlock here for you in real time!`
    );
    setTimeout(() => setDeniedMsg(null), 5000);
  };

  const triggerPosttestDenied = () => {
    sound.playLock();
    setDeniedMsg(
      'Access Denied: The Post-test is locked. When your teacher releases the Post-test assessment in the Teacher Portal, it will unlock automatically here!'
    );
    setTimeout(() => setDeniedMsg(null), 5000);
  };

  return (
    <div className="card p-6 sm:p-8 bg-[#12213b] border border-[#1e3458] rounded-[28px] shadow-[0_18px_40px_rgba(0,0,0,0.4)] animate-in fade-in duration-300">
      {/* Access Denied Warning Toast */}
      {deniedMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[90%] p-4 bg-[#3d1919] border-2 border-[#ff5a4f] text-[#ffb0a6] rounded-2xl shadow-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-3">
          <CircleAlert className="w-5 h-5 text-[#ff5a4f] flex-none mt-0.5" />
          <div className="text-xs font-bold leading-relaxed flex-1">
            <strong className="text-white block font-black mb-0.5">
              ⚠️ Strictly Controlled Session
            </strong>
            {deniedMsg}
          </div>
          <button
            type="button"
            onClick={() => setDeniedMsg(null)}
            className="text-[#ffb0a6] hover:text-white text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Live Classroom Sync Indicator */}
      <div className="flex items-center justify-between px-3.5 py-2.5 mb-4 bg-[#0d1a2e] border border-[#223655] rounded-xl text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22b07d] animate-pulse"></span>
          <span className="font-extrabold text-[#6fe0ae]">
            Live Session Release Hub
          </span>
          <span className="text-[#8ea0bc] hidden sm:inline">
            • Real-time class synchronization
          </span>
        </div>
        <span className="font-black text-[#ffd166] text-xs">
          {authorizedCount} of 5 Missions Released
        </span>
      </div>

      {/* Grammy Greeting & Status */}
      <div className="flex items-center gap-3 mb-6 bg-[#1a2c4a] p-3.5 rounded-2xl border border-[#27406a]">
        <div className="w-12 h-12 rounded-full bg-[#bfe3f7] text-2xl grid place-items-center flex-none shadow-sm">
          🦉
        </div>
        <div className="text-sm font-bold text-[#f4f7fc] leading-snug">
          {authorizedCount === 0 ? (
            <span>
              Hello <strong className="text-[#ffd166]">{student.code}</strong>!
              All sessions are locked for safety. Your teacher will release
              missions when class begins!
            </span>
          ) : (
            <span>
              Welcome, <strong className="text-[#ffd166]">{student.code}</strong>
              ! Your teacher has released{' '}
              <strong className="text-[#6fe0ae]">
                {authorizedCount} of 5
              </strong>{' '}
              missions for you ({completedCount} completed).
            </span>
          )}
        </div>
      </div>

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1e3458]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#ffd166]/20 text-[#ffd166]">
              <Compass className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#f4f7fc]">
              Student Roadmap
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#8ea0bc] font-semibold mt-1">
            {authorizedCount === 0
              ? 'All sessions currently locked by teacher/researcher'
              : `${authorizedCount} mission(s) authorized for ${student.code}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#132c25] border border-[#22b07d]/40 text-[#6fe0ae] text-xs font-bold select-none">
            <ShieldCheck className="w-3.5 h-3.5 text-[#6fe0ae]" />
            <span>Teacher/Researcher Controlled</span>
          </span>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="text-xs px-3 py-1.5 rounded-xl bg-[#182b4a] hover:bg-[#20375d] border border-[#223655] text-[#8ea0bc] hover:text-[#ff9b8f] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Exit and sign out of this device"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit / Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Anti-Bypass Security Policy Box */}
      <div className="p-3.5 my-3.5 bg-[#17253d] border border-[#27406a] rounded-2xl flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-[#ffd166] flex-none mt-0.5" />
        <div className="text-xs text-[#cbd8ec] leading-relaxed">
          <strong className="text-[#ffd166] block font-bold mb-0.5">
            🔒 Anti-Bypass Security Policy
          </strong>
          Sessions 1 through 5 and the Post-test cannot be turned on or bypassed
          by students. Only verified teachers and researchers can grant permission
          through the Teacher Portal.
        </div>
      </div>

      {/* Horizontal Trail Indicator */}
      <div className="p-3 my-3 bg-[#0d1a2e] border border-[#223655] rounded-2xl flex items-center justify-between text-xs font-black overflow-x-auto">
        <span className="text-[#8ea0bc] uppercase text-[10px] tracking-wider flex-none">
          Roadmap Trail:
        </span>
        <div className="flex items-center gap-2">
          {MISSIONS.map((m, idx) => {
            const done = isSessionCompleted(m.key, progress);
            const unlocked = checkUnlocked(m.key);
            return (
              <React.Fragment key={m.key}>
                <div
                  className={`px-2 py-1 rounded-lg text-[11px] font-black flex items-center gap-1 ${
                    done
                      ? 'bg-[#133328] text-[#6fe0ae] border border-[#22b07d]'
                      : unlocked
                      ? 'bg-[#3b2f12] text-[#ffd166] border border-[#f4b400]'
                      : 'bg-[#182335] text-[#55698a] border border-[#223655]'
                  }`}
                  title={`${m.missionTitle}: ${
                    done
                      ? 'Completed'
                      : unlocked
                      ? 'Released by Teacher'
                      : 'Locked by Teacher'
                  }`}
                >
                  <span>{done ? '✓' : unlocked ? '🔓' : '🔒'}</span>
                  <span>M{idx + 1}</span>
                </div>
                {idx < MISSIONS.length - 1 && (
                  <span className="text-[#2e4466]">›</span>
                )}
              </React.Fragment>
            );
          })}
          <span className="text-[#2e4466]">›</span>
          <div
            className={`px-2 py-1 rounded-lg text-[11px] font-black flex items-center gap-1 ${
              hasPosttest
                ? 'bg-[#133328] text-[#6fe0ae] border border-[#22b07d]'
                : posttestUnlocked
                ? 'bg-[#2c1d42] text-[#c99be0] border border-[#c99be0]'
                : 'bg-[#182335] text-[#55698a] border border-[#223655]'
            }`}
          >
            <span>{hasPosttest ? '✓' : posttestUnlocked ? '🔓' : '🔒'}</span>
            <span>Post</span>
          </div>
        </div>
      </div>

      {/* Missions List */}
      <div className="grid gap-3.5 my-4">
        {MISSIONS.map((m, idx) => {
          const completed = isSessionCompleted(m.key, progress);
          const unlocked = checkUnlocked(m.key);
          return (
            <div
              key={m.key}
              onClick={() => {
                if (unlocked) {
                  sound.playPop();
                  onSelectSession(m.key);
                } else {
                  triggerAccessDenied(m.missionTitle, idx + 1);
                }
              }}
              className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 text-left transition-all duration-200 select-none ${
                unlocked
                  ? completed
                    ? 'bg-[#132c25] border-[#22b07d] hover:bg-[#18362d] cursor-pointer shadow-sm'
                    : 'bg-[#182b4a] border-[#f4b400] hover:bg-[#20375d] shadow-md cursor-pointer'
                  : 'bg-[#0d1a2e]/60 border-[#1a2c48] opacity-65 cursor-not-allowed hover:border-[#ff5a4f]/50'
              }`}
            >
              <div
                className={`w-13 h-13 rounded-2xl grid place-items-center text-2xl flex-none shadow-sm ${
                  completed
                    ? 'bg-[#22b07d] text-white'
                    : unlocked
                    ? 'bg-[#eef3fb] text-[#1c2b46]'
                    : 'bg-[#1e2a3c] text-[#55698a]'
                }`}
              >
                {completed ? '✓' : unlocked ? m.icon : '🔒'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className={`text-[11px] font-black uppercase tracking-wider ${
                      unlocked ? 'text-[#ffd166]' : 'text-[#62779a]'
                    }`}
                  >
                    Day {m.day}
                  </span>
                  <span className="text-[11px] font-bold text-[#8ea0bc]">
                    • Mission {idx + 1}
                  </span>
                  {unlocked ? (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#22b07d]/20 text-[#6fe0ae] border border-[#22b07d]/30">
                      Authorized by Teacher
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#2a1d1d] text-[#ff9b8f] border border-[#ff5a4f]/30">
                      Locked by Teacher/Researcher
                    </span>
                  )}
                </div>
                <h3
                  className={`text-base sm:text-lg font-black truncate ${
                    unlocked ? 'text-[#f4f7fc]' : 'text-[#7a8ea8]'
                  }`}
                >
                  {m.title}
                </h3>
                <p className="text-xs text-[#8ea0bc] font-semibold truncate">
                  {completed
                    ? 'Completed! Badge earned – Tap to replay'
                    : unlocked
                    ? 'Teacher unlocked – Tap to enter mission!'
                    : 'Locked – Awaiting teacher or researcher permission to proceed'}
                </p>
              </div>

              <div className="flex-none">
                {completed && unlocked ? (
                  <span className="px-3 py-1 rounded-full bg-[#22b07d]/20 text-[#6fe0ae] font-black text-xs flex items-center gap-1 border border-[#22b07d]/30">
                    <CircleCheck className="w-3.5 h-3.5" />
                    <span>Done</span>
                  </span>
                ) : unlocked ? (
                  <span className="px-3.5 py-1.5 rounded-full bg-[#f4b400] text-[#1c2b46] font-black text-xs flex items-center gap-1.5 shadow-sm">
                    <Play className="w-3 h-3 fill-current" />
                    <span>Play</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerAccessDenied(m.missionTitle, idx + 1);
                    }}
                    className="px-3 py-1 rounded-full bg-[#182b4a] hover:bg-[#253957] text-[#7385a3] hover:text-[#ff9b8f] font-bold text-xs flex items-center gap-1 border border-[#223655] cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Locked</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Post-test Card */}
      <div
        className={`p-5 rounded-2xl border-2 transition-all mt-6 ${
          posttestUnlocked
            ? 'bg-gradient-to-r from-[#2c1d42] to-[#1c284a] border-[#c99be0] shadow-lg'
            : 'bg-[#0d1a2e]/50 border-[#1c2c48] opacity-60'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl text-3xl grid place-items-center flex-none ${
                posttestUnlocked
                  ? 'bg-[#c99be0]/20 text-[#c99be0]'
                  : 'bg-[#182b4a] text-[#7385a3]'
              }`}
            >
              {posttestUnlocked ? '🎯' : '🔒'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#c99be0]">
                  Final Assessment
                </span>
                {posttestUnlocked ? (
                  <span className="text-[10px] font-black uppercase bg-[#22b07d]/20 text-[#6fe0ae] px-2 py-0.5 rounded-full border border-[#22b07d]/30">
                    Teacher Authorized
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase bg-[#381919] text-[#ff9b8f] px-2 py-0.5 rounded-full border border-[#ff5a4f]/30">
                    Locked by Teacher/Researcher
                  </span>
                )}
                {hasPosttest && (
                  <span className="text-[10px] font-black uppercase bg-[#22b07d]/20 text-[#6fe0ae] px-2 py-0.5 rounded-full">
                    Completed
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#f4f7fc]">
                GramCo Post-test (20 Questions)
              </h3>
              <p className="text-xs text-[#b5c3db] font-semibold">
                {posttestUnlocked
                  ? 'Your teacher/researcher has authorized the final evaluation for your account!'
                  : 'Locked – Your teacher or researcher must authorize Post-test access before you can take it.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (posttestUnlocked) {
                sound.playPop();
                onStartPosttest();
              } else {
                triggerPosttestDenied();
              }
            }}
            className={`px-4 py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              posttestUnlocked
                ? 'bg-[#c99be0] hover:bg-[#d5afee] text-[#1c2b46] shadow-[0_4px_0_#9d66b5] active:translate-y-1'
                : 'bg-[#2a3850] hover:bg-[#344666] text-[#8ea0bc]'
            }`}
          >
            {posttestUnlocked ? (
              <Sparkles className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            <span>
              {hasPosttest
                ? 'Review Post-test'
                : posttestUnlocked
                ? 'Start Post-test'
                : 'Locked by Teacher'}
            </span>
            {posttestUnlocked && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
