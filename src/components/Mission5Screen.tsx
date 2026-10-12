import React, { useState } from 'react';
import { StudentInfo } from '../types';
import { sound } from '../services/sound';
import { markSessionCompleted } from '../services/api';
import { Compass, ArrowRight } from 'lucide-react';

interface Mission5ScreenProps {
  student: StudentInfo;
  onFinish: () => void;
  onBackToHub: () => void;
  onProceedToPosttest?: () => void;
}

export const Mission5Screen: React.FC<Mission5ScreenProps> = ({
  student,
  onFinish,
  onBackToHub,
  onProceedToPosttest,
}) => {
  const [step, setStep] = useState(1);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [arrangedWords, setArrangedWords] = useState<string[]>([]);

  const goToStep = (s: number) => {
    sound.playPop();
    setStep(s);
    setSelectedOpt(null);
    setSubmitted(false);
    setArrangedWords([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleFinishMission = async () => {
    sound.playFanfare();
    await markSessionCompleted(student.code, 's5');
    if (onProceedToPosttest) {
      onProceedToPosttest();
    } else {
      onFinish();
    }
  };

  const renderMCQ = (
    badge: string,
    questionText: string,
    wrongBanner: string | null,
    options: string[],
    correctLetter: string,
    explanation: string,
    nextStepNum: number
  ) => {
    const isCorrect = selectedOpt === correctLetter;
    return (
      <div className="space-y-5">
        <span className="text-xs font-black uppercase text-[#ffd166] bg-[#182b4a] px-3 py-1 rounded-full border border-[#263c62]">
          {badge}
        </span>
        {wrongBanner && (
          <div className="p-4 bg-[#3a1c1c] border border-[#ff5a4f] rounded-2xl text-center text-lg font-black text-[#ff9b8f]">
            {wrongBanner}
          </div>
        )}
        <h3 className="text-lg font-black text-[#f4f7fc]">{questionText}</h3>

        <div className="grid gap-2.5">
          {options.map((opt, idx) => {
            const letter = ['A', 'B', 'C', 'D'][idx];
            return (
              <button
                key={letter}
                type="button"
                disabled={submitted}
                onClick={() => {
                  sound.playPop();
                  setSelectedOpt(letter);
                }}
                className={`p-3.5 rounded-xl border-2 font-bold text-left flex items-center gap-3 cursor-pointer ${
                  selectedOpt === letter
                    ? 'border-[#f4b400] bg-[#3b2f12]'
                    : 'border-[#223655] bg-[#0d1a2e]'
                }`}
              >
                <span className="w-8 h-8 rounded-full bg-[#182b4a] grid place-items-center text-xs font-black">
                  {letter}
                </span>
                <span className="text-sm sm:text-base">{opt}</span>
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
                {isCorrect ? 'Correct! 🎉' : 'Incorrect'}
              </h4>
              <p className="text-xs sm:text-sm text-[#cbd8ec] mt-1 font-semibold">
                {explanation}
              </p>
            </div>
            <button
              type="button"
              onClick={() => goToStep(nextStepNum)}
              className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
            >
              NEXT ➡️
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={!selectedOpt}
            onClick={() => {
              sound.playCorrect();
              setSubmitted(true);
            }}
            className={`w-full h-14 font-black rounded-2xl text-lg ${
              selectedOpt
                ? 'bg-[#f4b400] text-[#1c2b46] shadow-[0_5px_0_#c48f00] cursor-pointer'
                : 'bg-[#2a3850] text-[#7385a3]'
            }`}
          >
            SUBMIT ANSWER
          </button>
        )}
      </div>
    );
  };

  const renderOrder = (
    badge: string,
    wordList: string[],
    correctJoined: string,
    nextStepNum: number
  ) => {
    const isCorrect =
      arrangedWords.join(' ').trim().toLowerCase() ===
      correctJoined.trim().toLowerCase();

    return (
      <div className="space-y-5">
        <span className="text-xs font-black uppercase text-[#ffd166] bg-[#182b4a] px-3 py-1 rounded-full border border-[#263c62]">
          {badge}
        </span>
        <h3 className="text-lg font-black text-[#f4f7fc]">
          Tap the words in the correct order:
        </h3>

        <div className="min-h-[86px] p-4 bg-[#0d1a2e] border-2 border-dashed border-[#2b446e] rounded-2xl flex flex-wrap gap-2 items-center">
          {arrangedWords.length === 0 ? (
            <span className="text-xs sm:text-sm font-bold text-[#6f86ad]">
              Tap the words below to arrange 👇
            </span>
          ) : (
            arrangedWords.map((word, idx) => (
              <button
                key={idx}
                type="button"
                disabled={submitted}
                onClick={() => handleRemoveWord(idx)}
                className="px-4 py-2 bg-[#f4b400] text-[#1c2b46] rounded-xl font-black text-sm shadow-[0_3px_0_#c48f00]"
              >
                {word} ✕
              </button>
            ))
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {wordList.map((word) => {
            const isUsed = arrangedWords.includes(word);
            if (isUsed) return null;
            return (
              <button
                key={word}
                type="button"
                disabled={submitted}
                onClick={() => handlePickWord(word)}
                className="px-4 py-2 bg-[#182b4a] text-white border border-[#2a3850] rounded-xl font-bold text-sm shadow-sm cursor-pointer"
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
                {isCorrect ? 'Correct! 🎉' : 'Not quite right!'}
              </h4>
              <p className="text-xs text-[#cbd8ec] mt-1 font-semibold">
                Correct sentence: "{correctJoined}."
              </p>
            </div>
            <button
              type="button"
              onClick={() => goToStep(nextStepNum)}
              className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
            >
              NEXT ➡️
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={arrangedWords.length !== wordList.length}
            onClick={() => {
              sound.playCorrect();
              setSubmitted(true);
            }}
            className={`w-full h-14 font-black rounded-2xl text-lg ${
              arrangedWords.length === wordList.length
                ? 'bg-[#f4b400] text-[#1c2b46] shadow-[0_5px_0_#c48f00] cursor-pointer'
                : 'bg-[#2a3850] text-[#7385a3]'
            }`}
          >
            CHECK ARRANGEMENT
          </button>
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
        <span className="text-xs font-black text-[#a8dfb0] uppercase bg-[#182b4a] px-3 py-1 rounded-full border border-[#263c62]">
          Mission 5 • Step {step} of 23
        </span>
      </div>

      {step === 1 && (
        <div className="space-y-5 text-center">
          <div className="text-6xl animate-bounce">🏆</div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#a8dfb0]">
            WELCOME TO DAY 4!
          </h2>
          <div className="flex items-start gap-3 bg-[#1a2c4a] p-4 rounded-2xl border border-[#27406a] text-left">
            <div className="w-12 h-12 rounded-full bg-[#bfe3f7] text-2xl grid place-items-center flex-none">
              🦉
            </div>
            <p className="text-sm font-bold text-[#f4f7fc]">
              🌟 You made it to the final day, Sentence Builders! 🎉 Today, you
              will use EVERYTHING you have learned from all your missions.
            </p>
          </div>

          <div className="p-4 bg-[#0d1a2e] rounded-2xl border border-[#223655] text-left space-y-1.5 text-xs font-bold">
            <p className="text-[#ffd166] font-black uppercase text-sm mb-1">
              🎯 TODAY'S GOAL – You will combine:
            </p>
            <p className="text-[#cbd8ec]">1. Completeness of Thought</p>
            <p className="text-[#cbd8ec]">2. Word Order and Arrangement</p>
            <p className="text-[#cbd8ec]">3. Subject-Verb Agreement</p>
            <p className="text-[#cbd8ec]">4. Punctuation and Capitalization</p>
          </div>

          <button
            type="button"
            onClick={() => goToStep(2)}
            className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
          >
            START FINAL MISSION 🚀
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <h2 className="text-2xl font-black text-center text-[#f4f7fc]">
            📋 TODAY'S FINAL CHALLENGE
          </h2>
          <div className="space-y-3 text-xs font-bold">
            <div className="p-4 rounded-2xl bg-[#133328] border-2 border-[#22b07d] space-y-1">
              <span className="text-[#6fe0ae] font-black text-sm block">
                MISSION 5 – PUTTING IT ALL TOGETHER
              </span>
              <p className="text-[#cbd8ec]">
                Status: 🔓 UNLOCKED – Use all four sentence skills together!
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#0d1a2e] border border-[#223655] opacity-75 space-y-1">
              <span className="text-[#ffd166] font-black text-sm block">
                POST-TEST
              </span>
              <p className="text-[#8ea0bc]">
                Status: 🔒 Complete Mission 5 to unlock the final Post-test.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => goToStep(3)}
            className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
          >
            START MISSION 5 🚀
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <span className="text-xs font-bold text-[#ffd166]">
            ⭐ YOUR FINAL MISSION
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#f4f7fc]">
            THE FOUR CHECKS OF A SENTENCE
          </h2>

          <div className="space-y-2.5 text-xs font-bold">
            <div className="p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl flex items-center gap-3">
              <span className="text-xl">1️⃣</span>
              <div>
                <strong className="text-yellow-400 block text-sm">
                  COMPLETE
                </strong>
                <span className="text-[#8ea0bc]">
                  Does it express a complete thought?
                </span>
              </div>
            </div>
            <div className="p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl flex items-center gap-3">
              <span className="text-xl">2️⃣</span>
              <div>
                <strong className="text-blue-400 block text-sm">
                  ARRANGE
                </strong>
                <span className="text-[#8ea0bc]">
                  Are the words in the correct order?
                </span>
              </div>
            </div>
            <div className="p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl flex items-center gap-3">
              <span className="text-xl">3️⃣</span>
              <div>
                <strong className="text-emerald-400 block text-sm">MATCH</strong>
                <span className="text-[#8ea0bc]">
                  Does the subject agree with the verb?
                </span>
              </div>
            </div>
            <div className="p-3 bg-[#0d1a2e] border border-[#223655] rounded-xl flex items-center gap-3">
              <span className="text-xl">4️⃣</span>
              <div>
                <strong className="text-purple-400 block text-sm">
                  FINISH
                </strong>
                <span className="text-[#8ea0bc]">
                  Are capitalization and punctuation correct?
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#3b2f12] border border-[#c48f00] rounded-xl text-center text-xs font-black text-[#ffd166]">
            COMPLETE ➡️ ARRANGE ➡️ MATCH ➡️ FINISH
          </div>

          <button
            type="button"
            onClick={() => goToStep(4)}
            className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
          >
            LET'S BUILD! 🚀
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-5">
          <h2 className="text-2xl font-black text-center text-[#f4f7fc]">
            👥 FINAL MISSION RULE
          </h2>
          <p className="text-xs sm:text-sm text-center text-[#8ea0bc] font-semibold">
            Every team member contributes to inspecting the four checks!
          </p>
          <div className="p-4 bg-[#0d1a2e] border border-[#223655] rounded-2xl text-center space-y-1 text-xs">
            <p className="text-[#ffd166] font-black uppercase text-sm">
              GROUP WORKFLOW
            </p>
            <p className="text-[#cbd8ec]">
              Reader reads choices ➡️ Solver drafts ➡️ Checker runs 4 checks ➡️
              Explainer justifies ➡️ Player taps answer.
            </p>
          </div>
          <button
            type="button"
            onClick={() => goToStep(5)}
            className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
          >
            I'M READY! 🚀
          </button>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <span className="text-xs font-bold text-[#8ea0bc]">
            👁️ I DO – GRAMMY'S FINAL DEMONSTRATION
          </span>
          <div className="p-4 bg-[#0d1a2e] border border-[#223655] rounded-2xl text-center text-xl font-bold text-white">
            "Maria goes home after school."
          </div>
          <div className="space-y-2 text-xs font-bold">
            <div className="p-2.5 bg-[#133328] rounded-xl flex items-center gap-2 text-[#6fe0ae]">
              <span>✅</span>
              <span>CHECK 1: COMPLETE? Yes – tells WHO and WHAT she does.</span>
            </div>
            <div className="p-2.5 bg-[#133328] rounded-xl flex items-center gap-2 text-[#6fe0ae]">
              <span>✅</span>
              <span>
                CHECK 2: ARRANGE? Yes – Subject (Maria) + Verb (goes) + Where/When.
              </span>
            </div>
            <div className="p-2.5 bg-[#133328] rounded-xl flex items-center gap-2 text-[#6fe0ae]">
              <span>✅</span>
              <span>
                CHECK 3: MATCH? Yes – Maria (singular) matches 'goes'.
              </span>
            </div>
            <div className="p-2.5 bg-[#133328] rounded-xl flex items-center gap-2 text-[#6fe0ae]">
              <span>✅</span>
              <span>
                CHECK 4: FINISH? Yes – Capital 'M' and ending period '.'
              </span>
            </div>
          </div>
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
            REMEMBER THE 4 CHECKS!
          </h2>
          <div className="p-4 bg-[#3b2f12] border border-[#c48f00] rounded-2xl text-center text-sm font-black text-[#ffd166]">
            ✨ If all four checks are correct, your sentence is ready!
          </div>
          <button
            type="button"
            onClick={() => goToStep(7)}
            className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
          >
            SEE FIXING EXAMPLE ➡️
          </button>
        </div>
      )}

      {step === 7 && (
        <div className="space-y-4">
          <span className="text-xs font-bold text-[#ff9b8f]">
            🔧 LET'S FIX A SENTENCE
          </span>
          <div className="p-4 bg-[#3a1c1c] border border-[#ff5a4f] rounded-2xl text-center text-lg font-bold text-[#ff9b8f]">
            "the girls plays basketball in the park"
          </div>
          <div className="p-4 bg-[#133328] border border-[#22b07d] rounded-2xl text-xs space-y-1 font-bold text-[#cbd8ec]">
            <p className="text-[#6fe0ae] font-black text-sm mb-1">
              Fixed sentence:
            </p>
            <p className="text-base text-white">
              👉 "The girls play basketball in the park."
            </p>
            <p className="text-[#8ea0bc] pt-1">
              Changes made: the → The (capital), plays → play (plural match),
              and added ending period.
            </p>
          </div>
          <button
            type="button"
            onClick={() => goToStep(8)}
            className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
          >
            START WE DO 🚀
          </button>
        </div>
      )}

      {step === 8 && (
        <div className="space-y-5">
          <span className="text-xs font-bold text-[#ffd166]">
            🤝 WE DO – BUILD IT TOGETHER!
          </span>
          <h2 className="text-2xl font-black text-[#f4f7fc]">
            Group Challenges Ahead
          </h2>
          <div className="p-4 bg-[#3b2f12] border border-[#c48f00] rounded-2xl text-center text-sm font-bold text-[#ffd166]">
            COMPLETE ➡️ ARRANGE ➡️ MATCH ➡️ FINISH
          </div>
          <button
            type="button"
            onClick={() => goToStep(9)}
            className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
          >
            CHALLENGE 1 🚀
          </button>
        </div>
      )}

      {step === 9 &&
        renderOrder(
          'WE DO CHALLENGE 1',
          ['The boy', 'plays', 'basketball'],
          'The boy plays basketball',
          10
        )}

      {step === 10 &&
        renderMCQ(
          'WE DO CHALLENGE 2',
          "What needs to be fixed in: 'the girls plays basketball'?",
          'the girls plays basketball',
          [
            'Capitalization only',
            'Subject-verb agreement only',
            'Punctuation only',
            'All of these',
          ],
          'D',
          'All of these! We need to change the → The, plays → play, and add a period.',
          11
        )}

      {step === 11 &&
        renderOrder(
          'WE DO CHALLENGE 3',
          ['every morning', 'Ana', 'breakfast', 'eats'],
          'Ana eats breakfast every morning',
          12
        )}

      {step === 12 &&
        renderMCQ(
          'WE DO CHALLENGE 4',
          "What is wrong in: 'the students is studying in the classroom'?",
          'the students is studying in the classroom',
          [
            'Capitalization',
            'Subject-verb agreement',
            'Punctuation',
            'More than one thing',
          ],
          'D',
          "More than one thing: Capital 'T', plural verb 'are', and a period!",
          13
        )}

      {step === 13 && (
        <div className="space-y-4">
          <span className="text-xs font-bold text-[#ffd166]">
            🖼️ PICTURE SENTENCE CHALLENGE
          </span>
          <div className="p-4 bg-[#3b2f12] rounded-2xl text-center border border-[#c48f00]">
            <div className="text-5xl mb-2">📚</div>
            <p className="text-xs font-bold text-[#ffd166]">
              A girl reading a book in a library.
            </p>
          </div>
          {renderMCQ(
            'PICTURE CHALLENGE',
            'Which sentence correctly describes the picture with all 4 checks?',
            null,
            [
              'The girl reads a book in the library.',
              'The girl read a book in the library',
              'the girl reads a book in the library.',
              'The girl reading book library.',
            ],
            'A',
            'Excellent! Choice A is complete, correctly arranged, matches singular subject, and has proper capitalization & punctuation.',
            14
          )}
        </div>
      )}

      {step === 14 && (
        <div className="space-y-5">
          <span className="text-xs font-bold text-[#ffd166]">
            🎯 FINAL CHALLENGE
          </span>
          <h2 className="text-2xl font-black text-[#f4f7fc]">
            Independent Practice (8 Questions)
          </h2>
          <div className="p-4 bg-[#0d1a2e] border border-[#223655] rounded-2xl text-xs sm:text-sm font-semibold text-[#cbd8ec]">
            Everyone thinks first. Discuss with your group. The Player submits
            the final answer.
          </div>
          <button
            type="button"
            onClick={() => goToStep(15)}
            className="w-full h-14 bg-[#f4b400] text-[#1c2b46] text-lg font-black rounded-2xl shadow-[0_5px_0_#c48f00] cursor-pointer"
          >
            START FINAL CHALLENGE 🚀
          </button>
        </div>
      )}

      {step === 15 &&
        renderMCQ(
          'YOU DO QUESTION 1',
          'Which sentence expresses a complete thought?',
          null,
          [
            'Because the students arrived late.',
            'When the students arrived at school.',
            'The students arrived at school late.',
            'Although the students arrived late.',
          ],
          'C',
          'Choice C tells WHO (the students) and WHAT HAPPENED (arrived late) completely.',
          16
        )}

      {step === 16 &&
        renderMCQ(
          'YOU DO QUESTION 2',
          'Which sentence has the correct word order?',
          null,
          [
            'The students are running quickly in the park.',
            'Quickly the students park are running in.',
            'The park students are quickly in running.',
          ],
          'A',
          'Choice A places the subject first, then the verb and adverb.',
          17
        )}

      {step === 17 &&
        renderMCQ(
          'YOU DO QUESTION 3',
          'Choose the sentence with correct subject-verb agreement:',
          null,
          [
            'The girls studies every afternoon.',
            'The girls study every afternoon.',
            'The girls studying every afternoon.',
          ],
          'B',
          "The girls is plural, so we use the base verb 'study'.",
          18
        )}

      {step === 18 &&
        renderMCQ(
          'YOU DO QUESTION 4',
          'Which sentence is capitalized correctly?',
          null,
          [
            'ana went to Manila to study.',
            'Ana went to manila to study.',
            'Ana went to Manila to study.',
            'ana went to manila to study.',
          ],
          'C',
          'Ana (name & start) and Manila (place) must both be capitalized.',
          19
        )}

      {step === 19 &&
        renderOrder(
          'YOU DO QUESTION 5',
          ['every afternoon', 'Carlo', 'basketball', 'plays'],
          'Carlo plays basketball every afternoon',
          20
        )}

      {step === 20 &&
        renderMCQ(
          'YOU DO QUESTION 6',
          'Which is the correct sentence?',
          '❌ the girls plays in the park',
          [
            'The girls plays in the park.',
            'The girls play in the park.',
            'the girls play in the park.',
            'The girls playing in the park.',
          ],
          'B',
          "Choice B fixes the capital 'T' and plural verb 'play'.",
          21
        )}

      {step === 21 &&
        renderMCQ(
          'YOU DO QUESTION 7',
          'Which sentence has correct punctuation?',
          null,
          [
            'Where is your notebook.',
            'Where is your notebook!',
            'Where is your notebook?',
            'where is your notebook?',
          ],
          'C',
          'A question ends with a question mark (?)!',
          22
        )}

      {step === 22 &&
        renderMCQ(
          'YOU DO QUESTION 8 – FINAL CHECK',
          'Which sentence is completely correct across all 4 checks?',
          null,
          [
            'the students is studying in the classroom.',
            'The students is studying in the classroom.',
            'The students are studying in the classroom.',
            'The students are studying in the classroom',
          ],
          'C',
          "Choice C passes all 4 checks: complete thought, proper order, subject-verb match ('are'), and punctuation.",
          23
        )}

      {step === 23 && (
        <div className="space-y-5 text-center py-4">
          <div className="text-6xl animate-bounce">🎉</div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#22b07d]">
            MISSION 5 COMPLETE!
          </h2>
          <h3 className="text-xl font-black text-[#ffd166]">
            🎖️ GRAMCO SENTENCE BUILDER
          </h3>
          <p className="text-xs sm:text-sm text-[#cbd8ec] font-semibold">
            You have mastered Completeness of Thought, Word Order,
            Subject-Verb Agreement, and Capitalization & Punctuation!
          </p>

          {onProceedToPosttest ? (
            <div className="p-4 bg-[#2c1d42] border border-[#c99be0] rounded-2xl text-left">
              <span className="text-xs font-black text-[#c99be0] uppercase block">
                FINAL GATE OPENED:
              </span>
              <strong className="text-base text-white">
                🎯 POST-TEST IS NOW READY!
              </strong>
              <p className="text-xs text-[#b5c3db] mt-1">
                Your teacher/researcher has authorized the Posttest. Take the
                20-question evaluation to measure your growth!
              </p>
            </div>
          ) : (
            <div className="p-4 bg-[#17253d] border border-[#27406a] rounded-2xl text-left">
              <span className="text-xs font-black text-[#ffd166] uppercase block">
                🔒 POST-TEST LOCKED BY TEACHER/RESEARCHER:
              </span>
              <strong className="text-base text-white">
                All 5 Missions Completed!
              </strong>
              <p className="text-xs text-[#b5c3db] mt-1">
                Please return to your Roadmap. The Post-test will unlock only
                when your teacher or researcher authorizes it.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {onProceedToPosttest && (
              <button
                type="button"
                onClick={handleFinishMission}
                className="flex-1 h-14 bg-[#c99be0] hover:bg-[#d5afee] text-[#1c2b46] text-base font-black rounded-2xl shadow-[0_5px_0_#9a6cb0] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>PROCEED TO POSTTEST</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={async () => {
                await markSessionCompleted(student.code, 's5');
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
