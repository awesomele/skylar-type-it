import React, { useState, useEffect, useRef } from 'react';
import type { PracticeMode, WordExplanations, WordPosition } from './types';
import { DEFAULT_VOCAB_LIST, DEFAULT_WORD_POOL_TEXT } from './constants';
import { formatTime } from './utils/formatting';
import { generateText, getMaxPassageLength } from './utils/textGeneration';
import { useAudio } from './hooks/useAudio';
import { useSpeech } from './hooks/useSpeech';
import { useStreak } from './hooks/useStreak';
import { useAnimations } from './hooks/useAnimations';
import { MiniConfetti, FullConfetti, SoccerBalls } from './components/AnimationEffects';
import { StatisticsGrid } from './components/StatisticsGrid';
import { ControlPanel } from './components/ControlPanel';
import { VocabularyEditor } from './components/VocabularyEditor';
import { TextDisplay } from './components/TextDisplay';
import { ProgressBar } from './components/ProgressBar';
import { CompletionBanner } from './components/CompletionBanner';
import { WpmChart } from './components/WpmChart';

const TypingPractice = () => {
  // --- Content state ---
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('typing');
  const [customMaterial, setCustomMaterial] = useState(DEFAULT_VOCAB_LIST);
  const [customTypingPool, setCustomTypingPool] = useState(DEFAULT_WORD_POOL_TEXT);
  const [passageLength, setPassageLength] = useState(15);

  // --- Session state ---
  const [text, setText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [totalErrorCount, setTotalErrorCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // --- Memorize mode state ---
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [completedWords, setCompletedWords] = useState<string[]>([]);
  const [wordExplanations, setWordExplanations] = useState<WordExplanations>({});
  const [currentWordPosition, setCurrentWordPosition] = useState<WordPosition>({ x: 0, y: 0 });

  // --- WPM history (typing mode only) ---
  const [wpmHistory, setWpmHistory] = useState<{ time: number; wpm: number }[]>([]);

  // --- UI state ---
  const [isTypingAreaFocused, setIsTypingAreaFocused] = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(true);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { playClickSound, playErrorSound } = useAudio();
  const { speakWord } = useSpeech();
  const streak = useStreak();
  const animations = useAnimations();

  // Derived
  const maxPassageLength = getMaxPassageLength(practiceMode, customMaterial, customTypingPool);
  const clampedLength = Math.min(passageLength, maxPassageLength);

  // --- Helpers ---
  function newSession(overridePracticeMode?: PracticeMode) {
    const mode = overridePracticeMode ?? practiceMode;
    const { text: newText, explanations } = generateText({
      practiceMode: mode,
      passageLength: clampedLength,
      customMaterial,
      customTypingPool,
    });
    setText(newText);
    if (explanations) setWordExplanations(explanations);
    else setWordExplanations({});
    setUserInput('');
    setStartTime(null);
    setTimeElapsed(0);
    setWpm(0);
    setAccuracy(100);
    setTotalErrorCount(0);
    setIsComplete(false);
    setCurrentWordIndex(0);
    setCompletedWords([]);
    setWpmHistory([]);
    streak.reset();
    animations.reset();
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  // Init + regenerate on config changes
  useEffect(() => {
    newSession();
  }, [passageLength, practiceMode, customMaterial, customTypingPool]); // eslint-disable-line react-hooks/exhaustive-deps

  // Focus input when word advances in memorize mode
  useEffect(() => {
    inputRef.current?.focus();
  }, [practiceMode, currentWordIndex]);

  // Timer
  useEffect(() => {
    if (!startTime || isComplete) return;
    const interval = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 100);
    return () => clearInterval(interval);
  }, [startTime, isComplete]);

  // WPM history sampling — one point per second in typing mode
  useEffect(() => {
    if (practiceMode !== 'typing' || wpm === 0 || isComplete) return;
    setWpmHistory((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].time === timeElapsed) return prev;
      return [...prev, { time: timeElapsed, wpm }];
    });
  }, [timeElapsed]); // eslint-disable-line react-hooks/exhaustive-deps

  // WPM + accuracy + word position (typing mode)
  useEffect(() => {
    if (userInput.length > 0 && !startTime) setStartTime(Date.now());
    if (userInput.length === 0 || isComplete || practiceMode !== 'typing') return;

    const elapsed = (Date.now() - (startTime ?? Date.now())) / 1000 / 60;
    const wordsTyped = userInput.trim().split(/\s+/).length;
    setWpm(Math.round(wordsTyped / elapsed) || 0);

    let correctChars = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === text[i]) correctChars++;
    }
    const total = correctChars + totalErrorCount;
    setAccuracy(total > 0 ? Math.round((correctChars / total) * 100) : 100);

    const newWordIndex = userInput.trim().split(/\s+/).length - 1;
    setCurrentWordIndex(newWordIndex);
    setTimeout(() => {
      const el = document.getElementById(`word-${newWordIndex}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        setCurrentWordPosition({ x: rect.left + rect.width / 2, y: rect.top });
      }
    }, 0);
  }, [userInput, startTime, text, isComplete, totalErrorCount, practiceMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Word position on scroll/resize
  useEffect(() => {
    const update = () => {
      const el = document.getElementById(`word-${currentWordIndex}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        setCurrentWordPosition({ x: rect.left + rect.width / 2, y: rect.top });
      }
    };
    window.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [currentWordIndex]);

  // --- Input handler ---
  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (isComplete) return;
    const newValue = e.target.value;

    if (practiceMode === 'memorize') {
      handleMemorizeInput(newValue);
    } else {
      handleTypingInput(newValue);
    }
  }

  function handleMemorizeInput(newValue: string) {
    const words = text.split(' ');
    const currentWord = words[currentWordIndex] ?? '';

    if (newValue.length > currentWord.length) return;

    const isAddingChar = newValue.length > userInput.length;
    if (isAddingChar) {
      const lastIdx = newValue.length - 1;
      const isCorrect = newValue[lastIdx] === currentWord[lastIdx];

      if (isCorrect) {
        const brokeRecord = newValue.length > streak.highestStreak;
        // NOTE: streak.recordCorrect() handles this internally
        streak.recordCorrect();
        if (brokeRecord || streak.consecutiveCorrect + 1 > streak.highestStreak) {
          animations.triggerRecordBreak();
        }

        const wordComplete = newValue.length === currentWord.length;
        if (wordComplete) {
          setUserInput(newValue);
          if (speakEnabled) speakWord(currentWord);
          else playClickSound();

          setTimeout(() => {
            if (currentWordIndex < words.length - 1) {
              setCompletedWords((prev) => [...prev, currentWord]);
              setCurrentWordIndex(currentWordIndex + 1);
              setUserInput('');
              setTimeout(() => inputRef.current?.focus(), 50);
            } else {
              setCompletedWords((prev) => [...prev, currentWord]);
              setCurrentWordIndex(words.length);
              setTimeout(() => {
                setTimeElapsed(Math.floor((Date.now() - (startTime ?? Date.now())) / 1000));
                setIsComplete(true);
                animations.triggerCompletion();
              }, 300);
            }
          }, 100);
          return;
        } else {
          playClickSound();
        }
      } else {
        streak.recordError();
        playErrorSound();
        setTotalErrorCount((prev) => prev + 1);
      }
    }

    setUserInput(newValue);
  }

  function handleTypingInput(newValue: string) {
    if (newValue.length > text.length) return;

    const isAddingChar = newValue.length > userInput.length;
    if (isAddingChar) {
      const lastIdx = newValue.length - 1;
      const isCorrect = newValue[lastIdx] === text[lastIdx];

      if (isCorrect) {
        streak.recordCorrect();
        if (streak.consecutiveCorrect + 1 > streak.highestStreak) {
          animations.triggerRecordBreak();
        }

        if (lastIdx === text.length - 1) {
          setUserInput(newValue);
          setTimeElapsed(Math.floor((Date.now() - (startTime ?? Date.now())) / 1000));
          setIsComplete(true);
          animations.triggerCompletion();
          return;
        }

        const nextChar = text[lastIdx + 1];
        const isWordEnd = nextChar === ' ' || nextChar === undefined;
        if (isWordEnd && speakEnabled) {
          const typedWords = newValue.trim().split(/\s+/);
          const lastWord = typedWords[typedWords.length - 1];
          const textWord = text.split(' ')[typedWords.length - 1];
          if (lastWord && textWord === lastWord) speakWord(lastWord);
          else playClickSound();
        } else {
          playClickSound();
        }
      } else {
        streak.recordError();
        playErrorSound();
        setTotalErrorCount((prev) => prev + 1);
      }
    }

    setUserInput(newValue);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      {animations.showMiniConfetti && <MiniConfetti />}
      {animations.showConfetti && <FullConfetti />}
      {animations.showSoccerBalls && (
        <SoccerBalls count={text.split(' ').length * streak.highestStreak} />
      )}

      <div className="max-w-7xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-800 mb-2">Typing Practice</h1>
          <p className="text-gray-500">Type the text below as accurately and quickly as you can</p>
        </div>

        <VocabularyEditor
          practiceMode={practiceMode}
          customMaterial={customMaterial}
          customTypingPool={customTypingPool}
          onCustomMaterialChange={setCustomMaterial}
          onCustomTypingPoolChange={setCustomTypingPool}
          onApply={() => newSession()}
        />

        <div className="flex gap-6 mb-6">
          <div className="w-80 flex-shrink-0">
            <ControlPanel
              practiceMode={practiceMode}
              onPracticeModeChange={(mode) => {
                setPracticeMode(mode);
                newSession(mode);
              }}
              passageLength={clampedLength}
              maxPassageLength={maxPassageLength}
              onPassageLengthChange={setPassageLength}
              speakEnabled={speakEnabled}
              onSpeakEnabledChange={(v) => {
                setSpeakEnabled(v);
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
            />
          </div>

          <div className="flex-1">
            <StatisticsGrid
              totalErrorCount={totalErrorCount}
              consecutiveCorrect={streak.consecutiveCorrect}
              highestStreak={streak.highestStreak}
              justBrokeRecord={streak.justBrokeRecord}
              wpm={wpm}
              accuracy={accuracy}
              timeElapsed={timeElapsed}
              textLength={text.length}
              formatTime={formatTime}
            />

            {practiceMode === 'typing' && <WpmChart wpmHistory={wpmHistory} />}

            <div className="bg-white rounded-lg shadow-sm p-8 mb-6 relative">
              {practiceMode === 'memorize' && (
                <ProgressBar current={currentWordIndex} total={text.split(' ').length} />
              )}

              <TextDisplay
                practiceMode={practiceMode}
                text={text}
                userInput={userInput}
                isComplete={isComplete}
                isTypingAreaFocused={isTypingAreaFocused}
                currentWordIndex={currentWordIndex}
                completedWords={completedWords}
                wordExplanations={wordExplanations}
                currentWordPosition={currentWordPosition}
                inputRef={inputRef}
                onInputChange={handleInputChange}
                onFocus={() => setIsTypingAreaFocused(true)}
                onBlur={() => setIsTypingAreaFocused(false)}
              />

              {isComplete && (
                <CompletionBanner
                  wpm={wpm}
                  accuracy={accuracy}
                  timeFormatted={formatTime(timeElapsed)}
                />
              )}

              <div className="text-center">
                <button
                  onClick={() => newSession()}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {isComplete ? 'Try Again' : 'Reset'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingPractice;
