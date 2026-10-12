/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { StudentInfo, StudentProgress, SessionRelease } from './types';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { PretestScreen } from './components/PretestScreen';
import { PretestDoneScreen } from './components/PretestDoneScreen';
import { RoadmapScreen } from './components/RoadmapScreen';
import { Mission1Screen } from './components/Mission1Screen';
import { Mission2Screen } from './components/Mission2Screen';
import { Mission3Screen } from './components/Mission3Screen';
import { Mission4Screen } from './components/Mission4Screen';
import { Mission5Screen } from './components/Mission5Screen';
import { PosttestScreen } from './components/PosttestScreen';
import { TeacherPortal } from './components/TeacherPortal';
import {
  getActiveStudent,
  clearActiveStudent,
  getStudentProgressLocal,
  getSessionReleaseLocal,
  fetchSessionRelease,
  fetchAllRecords,
  fetchAllProgress,
  isSessionAccessible,
  hasStudentCompletedPhaseLocally,
  checkServerStatus,
  setTeacherAuthActive,
} from './services/api';
import { SCHOOL_NAME } from './data/curriculum';

export default function App() {
  const [student, setStudent] = useState<StudentInfo | null>(() =>
    getActiveStudent()
  );
  const [currentScreen, setCurrentScreen] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#teacher') {
      return 'teacher';
    }
    const current = getActiveStudent();
    if (current?.code) {
      return hasStudentCompletedPhaseLocally(current.code, 'pretest')
        ? 'learn'
        : 'pretest';
    }
    return 'login';
  });

  const [teacherOverride, setTeacherOverride] = useState(false);
  const [deniedToast, setDeniedToast] = useState<string | null>(null);
  const [serverConnected, setServerConnected] = useState(false);
  const [sessionRelease, setSessionRelease] = useState<SessionRelease>(() =>
    getSessionReleaseLocal()
  );
  const [progress, setProgress] = useState<StudentProgress>(() =>
    student ? getStudentProgressLocal(student.code) : {}
  );

  const refreshProgress = useCallback(() => {
    if (student?.code) {
      setProgress(getStudentProgressLocal(student.code));
    }
  }, [student]);

  // Fast polling to keep student device synced with teacher session release & server data
  useEffect(() => {
    const syncRelease = async () => {
      const rel = await fetchSessionRelease();
      setSessionRelease(rel);
    };

    const syncDeviceData = async () => {
      await Promise.all([fetchAllRecords(), fetchAllProgress()]);
      if (student?.code) {
        setProgress(getStudentProgressLocal(student.code));
      }
    };

    syncRelease();
    syncDeviceData();

    const interval = setInterval(syncRelease, 2500);
    const dataInterval = setInterval(syncDeviceData, 10000);

    const onReleaseChanged = (e: any) => {
      if (e.detail) setSessionRelease(e.detail);
    };
    window.addEventListener('gramco-session-release-changed', onReleaseChanged);
    window.addEventListener('focus', () => {
      syncRelease();
      syncDeviceData();
    });

    const onVisibilityChange = () => {
      if (!document.hidden) {
        syncRelease();
        syncDeviceData();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      clearInterval(dataInterval);
      window.removeEventListener('gramco-session-release-changed', onReleaseChanged);
      window.removeEventListener('focus', syncRelease);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [student]);

  // Periodic server health check
  useEffect(() => {
    const pingServer = async () => {
      const res = await checkServerStatus();
      setServerConnected(res.connected);
    };
    pingServer();
    const interval = setInterval(pingServer, 10000);
    return () => clearInterval(interval);
  }, []);

  // Hash route listener for #teacher
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#teacher') {
        setCurrentScreen('teacher');
      } else if (currentScreen === 'teacher') {
        const active = getActiveStudent();
        if (active?.code) {
          setCurrentScreen(
            hasStudentCompletedPhaseLocally(active.code, 'pretest')
              ? 'learn'
              : 'pretest'
          );
        } else {
          setCurrentScreen('login');
        }
      }
    };

    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [currentScreen]);

  const showDeniedAlert = (msg: string) => {
    setDeniedToast(msg);
    setTimeout(() => {
      setDeniedToast((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const handleLoginSuccess = (user: StudentInfo, next: string) => {
    setStudent(user);
    setProgress(getStudentProgressLocal(user.code));
    setCurrentScreen(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    clearActiveStudent();
    setStudent(null);
    setCurrentScreen('login');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenTeacher = () => {
    window.location.hash = '#teacher';
    setCurrentScreen('teacher');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExitTeacher = () => {
    setTeacherAuthActive(false);
    window.location.hash = '';
    if (student?.code) {
      setCurrentScreen('learn');
    } else {
      setCurrentScreen('login');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToRoadmap = () => {
    if (!student?.code) {
      setCurrentScreen('login');
      return;
    }
    if (hasStudentCompletedPhaseLocally(student.code, 'pretest')) {
      setCurrentScreen('learn');
    } else {
      setCurrentScreen('pretest');
    }
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Enforce session locks whenever navigating
  useEffect(() => {
    if (!student?.code) return;

    if (currentScreen.startsWith('session-')) {
      const sessionKey = currentScreen.replace('session-', '');
      const canAccess =
        teacherOverride ||
        Boolean(sessionRelease[sessionKey as keyof SessionRelease]) ||
        isSessionAccessible(student.code, sessionKey, teacherOverride);

      if (!canAccess) {
        setCurrentScreen('learn');
        showDeniedAlert(
          `🔒 Access Denied: Mission ${sessionKey.toUpperCase()} is locked by your teacher.`
        );
      }
    } else if (currentScreen === 'posttest') {
      const canAccess =
        teacherOverride ||
        Boolean(sessionRelease.posttest) ||
        isSessionAccessible(student.code, 'posttest', teacherOverride);

      if (!canAccess) {
        setCurrentScreen('learn');
        showDeniedAlert(
          '🔒 Access Denied: The Post-test is locked by your teacher.'
        );
      }
    }
  }, [currentScreen, student, teacherOverride, sessionRelease]);

  const handleSelectSession = (key: string) => {
    const canAccess =
      teacherOverride ||
      Boolean(sessionRelease[key as keyof SessionRelease]) ||
      (student && isSessionAccessible(student.code, key, teacherOverride));

    if (!canAccess) {
      showDeniedAlert(
        `🔒 Mission ${key.toUpperCase()} is locked. When your teacher releases this mission in their portal, it will unlock automatically!`
      );
      return;
    }
    setCurrentScreen(`session-${key}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-[#0c1524] text-[#f4f7fc] overflow-x-hidden">
      {/* Decorative ambient background blobs */}
      <div className="blob blob-olive" />
      <div className="blob blob-brown" />
      <div className="blob blob-blue" />

      {/* Access Denied Toast */}
      {deniedToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-[#381919] border-2 border-[#ff5a4f] text-[#ff9b8f] font-black text-xs sm:text-sm rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <span>🔒</span>
          <span>{deniedToast}</span>
        </div>
      )}

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-6 sm:py-8 flex flex-col min-h-screen justify-between">
        <div>
          <Header
            currentScreen={currentScreen}
            student={student}
            serverConnected={serverConnected}
            onNavigate={(scr) => setCurrentScreen(scr)}
            onOpenTeacher={handleOpenTeacher}
            onLogout={handleLogout}
            onBackToRoadmap={handleBackToRoadmap}
          />

          <main>
            {currentScreen === 'login' && (
              <LoginScreen
                initialStudent={student}
                onLoginSuccess={handleLoginSuccess}
              />
            )}

            {currentScreen === 'pretest' && student && (
              <PretestScreen
                student={student}
                onPretestComplete={() => {
                  refreshProgress();
                  setCurrentScreen('pretest-done');
                }}
                onBackToRoadmap={handleBackToRoadmap}
                onExit={handleLogout}
              />
            )}

            {currentScreen === 'pretest-done' && student && (
              <PretestDoneScreen
                student={student}
                onContinue={() => setCurrentScreen('learn')}
              />
            )}

            {currentScreen === 'learn' && student && (
              <RoadmapScreen
                student={student}
                progress={progress}
                sessionRelease={sessionRelease}
                onSelectSession={handleSelectSession}
                onStartPosttest={() => {
                  if (
                    teacherOverride ||
                    Boolean(sessionRelease.posttest) ||
                    isSessionAccessible(student.code, 'posttest', teacherOverride)
                  ) {
                    setCurrentScreen('posttest');
                  } else {
                    showDeniedAlert(
                      '🔒 The Post-test is locked. Awaiting teacher permission.'
                    );
                  }
                }}
                onLogout={handleLogout}
                onReviewPretest={() => setCurrentScreen('pretest')}
              />
            )}

            {/* Missions 1 through 5 */}
            {currentScreen === 'session-s1' && student && (
              <Mission1Screen
                student={student}
                onFinish={() => {
                  refreshProgress();
                  setCurrentScreen('learn');
                }}
                onBackToHub={handleBackToRoadmap}
              />
            )}

            {currentScreen === 'session-s2' && student && (
              <Mission2Screen
                student={student}
                onFinish={() => {
                  refreshProgress();
                  setCurrentScreen('learn');
                }}
                onBackToHub={handleBackToRoadmap}
              />
            )}

            {currentScreen === 'session-s3' && student && (
              <Mission3Screen
                student={student}
                onFinish={() => {
                  refreshProgress();
                  setCurrentScreen('learn');
                }}
                onBackToHub={handleBackToRoadmap}
                onProceedToMission4={
                  isSessionAccessible(student.code, 's4', teacherOverride)
                    ? () => setCurrentScreen('session-s4')
                    : undefined
                }
              />
            )}

            {currentScreen === 'session-s4' && student && (
              <Mission4Screen
                student={student}
                onFinish={() => {
                  refreshProgress();
                  setCurrentScreen('learn');
                }}
                onBackToHub={handleBackToRoadmap}
                onProceedToMission5={
                  isSessionAccessible(student.code, 's5', teacherOverride)
                    ? () => setCurrentScreen('session-s5')
                    : undefined
                }
              />
            )}

            {currentScreen === 'session-s5' && student && (
              <Mission5Screen
                student={student}
                onFinish={() => {
                  refreshProgress();
                  setCurrentScreen('learn');
                }}
                onBackToHub={handleBackToRoadmap}
                onProceedToPosttest={
                  isSessionAccessible(student.code, 'posttest', teacherOverride)
                    ? () => setCurrentScreen('posttest')
                    : undefined
                }
              />
            )}

            {currentScreen === 'posttest' && student && (
              <PosttestScreen
                student={student}
                onFinishAll={() => {
                  refreshProgress();
                  setCurrentScreen('learn');
                }}
                onBackToHub={handleBackToRoadmap}
              />
            )}

            {currentScreen === 'teacher' && (
              <TeacherPortal
                onExit={handleExitTeacher}
                onExitToRoadmap={handleBackToRoadmap}
                teacherOverride={teacherOverride}
                onToggleTeacherOverride={() =>
                  setTeacherOverride(!teacherOverride)
                }
              />
            )}
          </main>
        </div>

        <footer className="mt-8 pt-4 border-t border-[#1e3458]/60 text-center text-xs text-[#6f86ad] font-bold">
          <p>{SCHOOL_NAME}</p>
          <div className="flex items-center justify-center gap-3 mt-1.5 text-[11px] text-[#55698a]">
            <span>GramCo Educational Platform</span>
            <span>•</span>
            <button
              type="button"
              onClick={handleOpenTeacher}
              className="text-[#ffd166] hover:underline cursor-pointer transition-colors"
            >
              Teacher Portal (PIN Protected)
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
