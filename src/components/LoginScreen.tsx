import React, { useState, useEffect } from 'react';
import { StudentInfo } from '../types';
import { sound } from '../services/sound';
import {
  setActiveStudent,
  markSessionStarted,
  hasStudentCompletedPhaseLocally,
  registerStudent,
  fetchAllRecords,
} from '../services/api';
import { SCHOOL_NAME } from '../data/curriculum';
import { Sparkles } from 'lucide-react';

interface LoginScreenProps {
  initialStudent: StudentInfo | null;
  onLoginSuccess: (student: StudentInfo, nextScreen: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  initialStudent,
  onLoginSuccess,
}) => {
  const [code, setCode] = useState(initialStudent?.code || '');
  const [sex, setSex] = useState(initialStudent?.sex || '');
  const [grade, setGrade] = useState(
    initialStudent?.grade || 'Grade 6 - Mabini'
  );
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllRecords();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    const cleanGrade = grade.trim();
    if (!cleanCode || !sex || !cleanGrade) {
      setError('Please fill in your student code, sex, and grade & section.');
      return;
    }

    sound.playPop();
    const student: StudentInfo = {
      code: cleanCode,
      sex,
      grade: cleanGrade,
    };

    setActiveStudent(student);
    registerStudent(student);
    markSessionStarted(cleanCode);

    // If student has already completed pretest, route to Roadmap; otherwise to Pretest
    if (hasStudentCompletedPhaseLocally(cleanCode, 'pretest')) {
      onLoginSuccess(student, 'learn');
    } else {
      onLoginSuccess(student, 'pretest');
    }
  };

  return (
    <div className="card p-6 sm:p-8 bg-[#12213b] border border-[#1e3458] rounded-[28px] shadow-[0_18px_40px_rgba(0,0,0,0.4)] animate-in fade-in duration-300">
      {/* Grammy Welcome Dialog */}
      <div className="flex items-center gap-3 mb-6 bg-[#1a2c4a] p-3.5 rounded-2xl border border-[#27406a]">
        <div className="w-13 h-13 rounded-full bg-[#bfe3f7] text-3xl grid place-items-center flex-none shadow-sm">
          🦉
        </div>
        <div className="text-sm sm:text-base font-bold text-[#f4f7fc] leading-snug">
          Hi! I'm <span className="text-[#ffd166]">Grammy</span>! Let's build
          some sentences together. Fill in your details to start!
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[#f4f7fc] mb-1">
          Welcome to GramCo!
        </h1>
        <p className="text-[#8ea0bc] text-sm sm:text-base font-semibold">
          Please enter your information to begin your sentence builder
          adventure.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4.5" noValidate>
        <div>
          <label
            htmlFor="student-code"
            className="block text-sm font-extrabold text-[#8ea0bc] mb-2"
          >
            Student's Code
          </label>
          <input
            id="student-code"
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g., GC-01"
            className="w-full h-14 px-4 bg-[#0d1a2e] text-[#f4f7fc] border-2 border-[#223655] focus:border-[#f4b400] rounded-[18px] text-lg font-bold outline-none transition-colors placeholder:text-[#5a6e8e]"
            autoComplete="off"
          />
          <p className="text-xs text-[#7385a3] font-semibold mt-1.5">
            Ask your teacher for your assigned student code (e.g., GC-01).
          </p>
        </div>

        <div>
          <label
            htmlFor="student-sex"
            className="block text-sm font-extrabold text-[#8ea0bc] mb-2"
          >
            Sex
          </label>
          <div className="relative">
            <select
              id="student-sex"
              value={sex}
              onChange={(e) => {
                setSex(e.target.value);
                if (error) setError('');
              }}
              className="w-full h-14 px-4 bg-[#0d1a2e] text-[#f4f7fc] border-2 border-[#223655] focus:border-[#f4b400] rounded-[18px] text-lg font-bold outline-none appearance-none transition-colors"
            >
              <option value="">Select your sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8ea0bc]">
              ▼
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="student-grade"
            className="block text-sm font-extrabold text-[#8ea0bc] mb-2"
          >
            Grade & Section
          </label>
          <input
            id="student-grade"
            type="text"
            value={grade}
            onChange={(e) => {
              setGrade(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g., Grade 6 - Mabini"
            className="w-full h-14 px-4 bg-[#0d1a2e] text-[#f4f7fc] border-2 border-[#223655] focus:border-[#f4b400] rounded-[18px] text-lg font-bold outline-none transition-colors placeholder:text-[#5a6e8e]"
          />
        </div>

        {error && (
          <div className="p-3 bg-[#381919] border border-[#ff5a4f] rounded-xl text-[#ff9b8f] text-sm font-bold animate-shake">
            ⚠️ {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full h-15 mt-3 bg-[#f4b400] hover:bg-[#ffc117] text-[#1c2b46] text-xl font-black rounded-[18px] shadow-[0_5px_0_#c48f00] active:translate-y-1 active:shadow-[0_2px_0_#c48f00] flex items-center justify-center gap-2 transition-transform cursor-pointer"
        >
          <Sparkles className="w-5 h-5" />
          <span>Enter GramCo</span>
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-[#1e3458] text-center text-xs font-bold text-[#6f86ad]">
        {SCHOOL_NAME}
      </div>
    </div>
  );
};
