import React, { useRef } from 'react';
import type { PracticeMode, WordExplanations, WordPosition } from '../types';

interface Props {
  practiceMode: PracticeMode;
  text: string;
  userInput: string;
  isComplete: boolean;
  isTypingAreaFocused: boolean;
  currentWordIndex: number;
  completedWords: string[];
  wordExplanations: WordExplanations;
  currentWordPosition: WordPosition;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
}

function renderChars(
  text: string,
  userInput: string,
  practiceMode: PracticeMode,
  currentWordIndex: number,
): React.ReactNode {
  if (practiceMode === 'memorize') {
    const currentWord = text.split(' ')[currentWordIndex] ?? '';
    return currentWord.split('').map((char, idx) => {
      let className = 'text-gray-400';
      if (idx < userInput.length) {
        className = userInput[idx] === char ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
      } else if (idx === userInput.length) {
        className = 'text-gray-800 border-l-2 border-blue-500';
      }
      return <span key={idx} className={className}>{char}</span>;
    });
  }

  let charIndex = 0;
  return text.split(' ').map((word, wordIdx) => {
    const chars = word.split('').map((char) => {
      const index = charIndex++;
      let className = 'text-gray-400';
      if (index < userInput.length) {
        className = userInput[index] === char ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
      } else if (index === userInput.length) {
        className = 'text-gray-800 border-l-2 border-blue-500';
      }
      return <span key={index} className={className}>{char}</span>;
    });

    if (wordIdx < text.split(' ').length - 1) {
      const spaceIndex = charIndex++;
      let spaceClass = 'text-gray-400';
      if (spaceIndex < userInput.length) {
        spaceClass = userInput[spaceIndex] === ' ' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
      } else if (spaceIndex === userInput.length) {
        spaceClass = 'text-gray-800 border-l-2 border-blue-500';
      }
      chars.push(<span key={spaceIndex} className={spaceClass}> </span>);
    }

    return <span key={wordIdx} id={`word-${wordIdx}`}>{chars}</span>;
  });
}

const AREA_STYLES = `
  @keyframes breathing {
    0%, 100% { box-shadow: 0 0 10px rgba(59, 130, 246, 0.2); }
    50% { box-shadow: 0 0 50px rgba(59, 130, 246, 0.5); }
  }
  .shadow-breathing { animation: breathing 2.5s ease-in-out infinite; }
  @keyframes rainbow {
    0%   { border-color: #ff0000; box-shadow: 0 0 30px #ff0000; }
    16%  { border-color: #ff8800; box-shadow: 0 0 30px #ff8800; }
    33%  { border-color: #ffff00; box-shadow: 0 0 30px #ffff00; }
    50%  { border-color: #00ff00; box-shadow: 0 0 30px #00ff00; }
    66%  { border-color: #0088ff; box-shadow: 0 0 30px #0088ff; }
    83%  { border-color: #8800ff; box-shadow: 0 0 30px #8800ff; }
    100% { border-color: #ff0000; box-shadow: 0 0 30px #ff0000; }
  }
  .animate-rainbow-border { animation: rainbow 2s linear infinite; }
`;

function borderClass(isComplete: boolean, isFocused: boolean): string {
  if (isComplete) return 'border-4 animate-rainbow-border';
  if (isFocused) return 'border-4 border-blue-400 shadow-breathing';
  return 'border-2 border-gray-200';
}

export function TextDisplay({
  practiceMode,
  text,
  userInput,
  isComplete,
  isTypingAreaFocused,
  currentWordIndex,
  completedWords,
  wordExplanations,
  currentWordPosition,
  inputRef,
  onInputChange,
  onFocus,
  onBlur,
}: Props) {
  const textContainerRef = useRef<HTMLDivElement>(null);
  const totalWords = text.split(' ').length;

  const currentWordExplanation = (() => {
    const word = text.split(' ')[currentWordIndex];
    return word && wordExplanations[word] ? wordExplanations[word] : null;
  })();

  const focusInput = () => inputRef.current?.focus();

  if (practiceMode === 'memorize') {
    return (
      <div
        className={`bg-white rounded-lg p-12 mb-6 text-center min-h-[400px] flex flex-col items-center justify-center relative transition-all duration-300 cursor-pointer ${borderClass(isComplete, isTypingAreaFocused)}`}
        onClick={focusInput}
      >
        <style>{AREA_STYLES}</style>

        {!isComplete && !isTypingAreaFocused && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-gray-400 text-lg">Click here to start typing</div>
          </div>
        )}

        {!isComplete ? (
          <>
            <div className="text-6xl font-mono mb-12 leading-relaxed font-semibold">
              {renderChars(text, userInput, practiceMode, currentWordIndex)}
            </div>
            {currentWordExplanation && (
              <div className="mt-4 p-8 bg-blue-50 border-3 border-blue-300 rounded-xl max-w-3xl w-full">
                <div className="text-3xl text-gray-800 whitespace-pre-line leading-relaxed">
                  {currentWordExplanation}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Words Completed:</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {completedWords.map((word, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 bg-green-100 border-2 border-green-300 rounded-lg text-lg font-mono text-green-800"
                >
                  {word}
                </div>
              ))}
            </div>
          </div>
        )}

        <textarea
          ref={inputRef}
          value={userInput}
          onChange={onInputChange}
          onFocus={onFocus}
          onBlur={onBlur}
          className="w-full p-4 border-2 border-gray-200 rounded font-mono text-lg focus:outline-none focus:border-blue-500 resize-none"
          style={{ opacity: 0, height: 0, position: 'absolute', top: 0, left: 0 }}
          rows={4}
          placeholder="Start typing here..."
          disabled={isComplete}
        />
      </div>
    );
  }

  // Typing mode
  return (
    <div
      className={`rounded-lg p-6 mb-6 relative transition-all duration-300 cursor-pointer ${
        isComplete
          ? 'border-4 animate-rainbow-border bg-gray-50'
          : isTypingAreaFocused
          ? 'border-4 border-blue-400 shadow-breathing bg-gray-50'
          : 'border-2 border-gray-200 bg-gray-50'
      }`}
      style={{ minHeight: '120px' }}
      onClick={focusInput}
    >
      <style>{AREA_STYLES}</style>

      {!isComplete && !isTypingAreaFocused && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-gray-400 text-lg">Click here to start typing</div>
        </div>
      )}

      <div
        ref={textContainerRef}
        className="text-2xl leading-relaxed font-mono relative overflow-visible"
        data-testid="text-display"
      >
        {renderChars(text, userInput, practiceMode, currentWordIndex)}

        {currentWordExplanation && (
          <Tooltip
            explanation={currentWordExplanation}
            position={currentWordPosition}
            containerRef={textContainerRef}
          />
        )}
      </div>

      <textarea
        ref={inputRef}
        value={userInput}
        onChange={onInputChange}
        onFocus={onFocus}
        onBlur={onBlur}
        className="w-full p-4 border-2 border-gray-200 rounded font-mono text-lg focus:outline-none focus:border-blue-500 resize-none"
        style={{ opacity: 0, height: 0, position: 'absolute', top: 0, left: 0 }}
        rows={4}
        placeholder="Start typing here..."
        disabled={isComplete}
      />
    </div>
  );
}

interface TooltipProps {
  explanation: string;
  position: { x: number; y: number };
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function Tooltip({ explanation, position, containerRef }: TooltipProps) {
  const containerRect = containerRef.current?.getBoundingClientRect();
  const containerWidth = containerRef.current?.offsetWidth ?? 400;
  const relativeX = position.x - (containerRect?.left ?? 0);
  const relativeY = position.y - (containerRect?.top ?? 0);

  const clampedX = Math.max(10, Math.min(relativeX, containerWidth - 10));
  const arrowLeft =
    relativeX < 150 ? '10px' : relativeX > containerWidth - 150 ? 'calc(100% - 10px)' : '50%';
  const transform =
    relativeX < 150
      ? 'translate(0, -100%)'
      : relativeX > containerWidth - 150
      ? 'translate(-100%, -100%)'
      : 'translate(-50%, -100%)';
  const arrowTransform =
    relativeX < 150
      ? 'translate(0, 50%)'
      : relativeX > containerWidth - 150
      ? 'translate(-100%, 50%)'
      : 'translate(-50%, 50%)';

  return (
    <div
      className="absolute z-50 pointer-events-none"
      style={{ left: `${clampedX}px`, top: `${Math.max(10, relativeY - 5)}px`, transform }}
    >
      <div className="bg-blue-600 text-white px-3 py-2 rounded shadow-xl text-sm max-w-md">
        <div className="whitespace-pre-line">{explanation}</div>
        <div
          className="absolute bottom-0 rotate-45 w-2 h-2 bg-blue-600"
          style={{ left: arrowLeft, transform: arrowTransform }}
        />
      </div>
    </div>
  );
}
