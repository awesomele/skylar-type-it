import React, { useState, useEffect, useRef } from 'react';

const TypingPractice = () => {
  // All state declarations
  const [text, setText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isComplete, setIsComplete] = useState(false);
  const [errors, setErrors] = useState(0);
  const [totalErrorCount, setTotalErrorCount] = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [justBrokeRecord, setJustBrokeRecord] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSoccerBalls, setShowSoccerBalls] = useState(false);
  const [showRecordBreakEffect, setShowRecordBreakEffect] = useState(false);
  const [showMiniConfetti, setShowMiniConfetti] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [passageLength, setPassageLength] = useState(15);
  const [soundMode, setSoundMode] = useState('speak');
  const [speakEnabled, setSpeakEnabled] = useState(true);
  const [practiceMode, setPracticeMode] = useState('typing');
  
  const vocabList = 'advise - to give suggestions or recommendations\nalmanac - a book with calendars, weather forecasts, and facts\naqueduct - a structure for carrying water over long distances\narmada - a large fleet of warships\natlas - a book of maps\natmosphere - the air around the Earth or the mood of a place\nbarometer - an instrument that measures air pressure\nbrash - rude and bold\ncell - a small room or the basic unit of life\nCelsius - a scale for measuring temperature\ncolonel - a high military rank\ncommend - to praise\ncondo - a condominium, an owned apartment\ncorporation - a large company or business\ndense - thick or closely packed\ndiameter - the distance across a circle\nradius - Half of a diameter is called the radius\nduet - a performance by two people\nelement - a basic part or chemical substance\nenvelop - to wrap or cover completely\nenvelope - a paper container for letters\nexotic - unusual and from far away\nexquisite - very beautiful and delicate\nFahrenheit - a temperature scale\nfrankfurter - a type of sausage (hot dog)\nfrantic - wildly excited or anxious\nfrontier - the edge of settled land\ngrate - to shred or a metal frame\nhumane - kind and compassionate';
  
  const wordPoolText = 'time, person, year, thing, world, life, hand, part, child, woman, place, work, week, case, point, government, company, number, group, problem, fact, good, first, last, long, great, little, other, right, high, different, small, large, next, early, young, important, public, same, able, make, know, take, come, think, look, want, give, find, tell, work, seem, feel, leave, call, keep, begin, help, show, hear, play, move, live, believe, hold, bring, happen, write, provide, stand, lose, meet, include, continue, learn, change, lead, understand, watch, follow, stop, create, speak, read, allow, spend, grow, open, walk, offer, remember, love, consider, appear, wait, serve, send, expect, build, stay, fall, reach, kill, remain, suggest, raise, pass, sell, require, report, decide, pull, break, pick, wear, carry, describe, return, explain, hope, develop, represent, agree, receive, involve, increase';
  
  const [customMaterial, setCustomMaterial] = useState(vocabList);
  const [customTypingPool, setCustomTypingPool] = useState(wordPoolText);
  const [useCustomMaterial, setUseCustomMaterial] = useState(false);
  const [isVocabPoolExpanded, setIsVocabPoolExpanded] = useState(false);
  const [wordExplanations, setWordExplanations] = useState({});
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWordPosition, setCurrentWordPosition] = useState({ x: 0, y: 0 });
  const [completedWords, setCompletedWords] = useState([]);
  
  const inputRef = useRef(null);
  const audioContextRef = useRef(null);
  const textContainerRef = useRef(null);
  const speechQueueRef = useRef([]);
  const isSpeakingRef = useRef(false);

  const wordPool = ['time', 'person', 'year', 'thing', 'world', 'life', 'hand', 'part', 'child', 'woman', 'place', 'work', 'week', 'case', 'point', 'government', 'company', 'number', 'group', 'problem', 'fact', 'good', 'first', 'last', 'long', 'great', 'little', 'other', 'right', 'high', 'different', 'small', 'large', 'next', 'early', 'young', 'important', 'public', 'same', 'able', 'make', 'know', 'take', 'come', 'think', 'look', 'want', 'give', 'find', 'tell', 'work', 'seem', 'feel', 'leave', 'call', 'keep', 'begin', 'help', 'show', 'hear', 'play', 'move', 'live', 'believe', 'hold', 'bring', 'happen', 'write', 'provide', 'stand', 'lose', 'meet', 'include', 'continue', 'learn', 'change', 'lead', 'understand', 'watch', 'follow', 'stop', 'create', 'speak', 'read', 'allow', 'spend', 'grow', 'open', 'walk', 'offer', 'remember', 'love', 'consider', 'appear', 'wait', 'serve', 'send', 'expect', 'build', 'stay', 'fall', 'reach', 'kill', 'remain', 'suggest', 'raise', 'pass', 'sell', 'require', 'report', 'decide', 'pull', 'break', 'pick', 'wear', 'carry', 'describe', 'return', 'explain', 'hope', 'develop', 'represent', 'agree', 'receive', 'involve', 'increase'];

  const getMaxPassageLength = () => {
    if (practiceMode === 'memorize' && customMaterial.trim()) {
      // Count unique words in vocabulary list
      const lines = customMaterial.split('\n');
      const words = [];
      
      for (let line of lines) {
        if (line.includes('-')) {
          const dashIndex = line.indexOf('-');
          const word = line.substring(0, dashIndex).trim();
          if (word) words.push(word);
        }
      }
      
      return Math.min(words.length, 200);
    } else {
      // For typing mode, use custom pool or default word pool
      const poolWords = customTypingPool
        .split(/[,\s]+/)
        .map(w => w.trim())
        .filter(w => w.length > 0);
      
      const poolSize = poolWords.length > 0 ? poolWords.length : wordPool.length;
      return Math.min(poolSize, 200);
    }
  };

  const generateText = () => {
    if (practiceMode === 'memorize' && customMaterial.trim()) {
      const lines = customMaterial.split('\n');
      const words = [];
      const explanations = {};
      
      let currentWord = null;
      let currentExplanation = [];
      
      for (let line of lines) {
        if (line.includes('-')) {
          if (currentWord) {
            explanations[currentWord] = currentExplanation.join('\n').trim();
          }
          
          const dashIndex = line.indexOf('-');
          currentWord = line.substring(0, dashIndex).trim();
          words.push(currentWord);
          currentExplanation = [line.substring(dashIndex + 1).trim()];
        } else if (currentWord && line.trim()) {
          currentExplanation.push(line.trim());
        }
      }
      
      if (currentWord) {
        explanations[currentWord] = currentExplanation.join('\n').trim();
      }
      
      setWordExplanations(explanations);
      
      // Generate unique random words (no duplicates)
      const selectedWords = [];
      const availableWords = [...words];
      const count = Math.min(passageLength, availableWords.length);
      
      for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * availableWords.length);
        selectedWords.push(availableWords[randomIndex]);
        availableWords.splice(randomIndex, 1); // Remove selected word to avoid duplicates
      }
      
      return selectedWords.join(' ').trim();
    } else {
      setWordExplanations({});
      
      // Parse custom typing pool (comma-separated or space-separated)
      const poolWords = customTypingPool
        .split(/[,\s]+/)
        .map(w => w.trim())
        .filter(w => w.length > 0);
      
      if (poolWords.length === 0) {
        // Fallback to default wordPool if custom pool is empty
        const words = [];
        for (let i = 0; i < passageLength; i++) {
          words.push(wordPool[Math.floor(Math.random() * wordPool.length)]);
        }
        return words.join(' ').trim();
      }
      
      const words = [];
      for (let i = 0; i < passageLength; i++) {
        words.push(poolWords[Math.floor(Math.random() * poolWords.length)]);
      }
      return words.join(' ').trim();
    }
  };

  useEffect(() => {
    // Initialize audio context and regenerate text when practice mode changes
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Load voices for speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
    
    resetPractice();
  }, [practiceMode]);

  useEffect(() => {
    // Regenerate text when passage length changes
    const maxLength = getMaxPassageLength();
    const actualLength = Math.min(passageLength, maxLength);
    
    const newText = generateText();
    setText(newText);
    setUserInput('');
    setCurrentWordIndex(0);
    setCompletedWords([]);
    setConsecutiveCorrect(0);
    setHighestStreak(0);
    setStartTime(null);
    setTimeElapsed(0);
    setIsComplete(false);
    
    // Update passage length if it exceeds max
    if (passageLength > maxLength) {
      setPassageLength(maxLength);
    }
    
    // Refocus the input after state updates
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [passageLength, practiceMode, customMaterial, customTypingPool]);

  useEffect(() => {
    // Focus input when component mounts or when mode changes
    inputRef.current?.focus();
  }, [practiceMode, currentWordIndex]);

  const speakWord = (word) => {
    if ('speechSynthesis' in window && word) {
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
      
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.9; // Slower, clearer for kids
      utterance.pitch = 1.2; // Higher pitch for female voice
      utterance.volume = 0.9;
      
      // Try to get a female voice
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('woman') ||
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('victoria') ||
        voice.name.toLowerCase().includes('zira')
      );
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    let interval;
    if (startTime && !isComplete) {
      interval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 100);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [startTime, isComplete]);

  const playClickSound = () => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  };

  const playErrorSound = () => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 200;
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  };

  useEffect(() => {
    if (userInput.length > 0 && !startTime) setStartTime(Date.now());

    if (userInput.length > 0 && !isComplete) {
      if (practiceMode === 'typing') {
        // Only calculate WPM and accuracy for typing mode
        const timeElapsed = (Date.now() - startTime) / 1000 / 60;
        const wordsTyped = userInput.trim().split(/\s+/).length;
        setWpm(Math.round(wordsTyped / timeElapsed) || 0);

        let correctChars = 0;
        for (let i = 0; i < userInput.length; i++) {
          if (userInput[i] === text[i]) correctChars++;
        }

        const totalKeystrokes = correctChars + totalErrorCount;
        setAccuracy(totalKeystrokes > 0 ? Math.round((correctChars / totalKeystrokes) * 100) : 100);

        const newWordIndex = userInput.trim().split(/\s+/).length - 1;
        setCurrentWordIndex(newWordIndex);
        
        setTimeout(() => {
          const wordElement = document.getElementById(`word-${newWordIndex}`);
          if (wordElement) {
            const wordRect = wordElement.getBoundingClientRect();
            setCurrentWordPosition({ x: wordRect.left + wordRect.width / 2, y: wordRect.top });
          }
        }, 0);
      }
    }
  }, [userInput, startTime, text, isComplete, totalErrorCount, practiceMode]);

  useEffect(() => {
    const updateWordPosition = () => {
      const wordElement = document.getElementById(`word-${currentWordIndex}`);
      if (wordElement) {
        const wordRect = wordElement.getBoundingClientRect();
        setCurrentWordPosition({ x: wordRect.left + wordRect.width / 2, y: wordRect.top });
      }
    };

    window.addEventListener('scroll', updateWordPosition);
    window.addEventListener('resize', updateWordPosition);
    return () => {
      window.removeEventListener('scroll', updateWordPosition);
      window.removeEventListener('resize', updateWordPosition);
    };
  }, [currentWordIndex]);

  const handleInputChange = (e) => {
    if (isComplete) return;
    
    const newValue = e.target.value;
    
    if (practiceMode === 'memorize') {
      // In memorize mode, handle one word at a time
      const words = text.split(' ');
      const currentWord = words[currentWordIndex] || '';
      
      // Don't allow typing beyond current word length
      if (newValue.length > currentWord.length) return;
      
      const lastChar = newValue[newValue.length - 1];
      const lastIndex = newValue.length - 1;
      
      if (newValue.length > userInput.length) {
        if (lastChar === currentWord[lastIndex]) {
          const newStreak = consecutiveCorrect + 1;
          setConsecutiveCorrect(newStreak);
          
          if (newStreak > highestStreak) {
            setHighestStreak(newStreak);
            setJustBrokeRecord(true);
            setShowRecordBreakEffect(true);
            setShowMiniConfetti(true);
            setTimeout(() => {
              setShowRecordBreakEffect(false);
              setShowMiniConfetti(false);
            }, 800);
            setTimeout(() => setJustBrokeRecord(false), 200);
          }
          
          // Check if word is complete
          if (newValue.length === currentWord.length) {
            // Update userInput first to show the green character
            setUserInput(newValue);
            
            if (speakEnabled) {
              speakWord(currentWord);
            } else {
              playClickSound();
            }
            
            // Move to next word or complete
            setTimeout(() => {
              if (currentWordIndex < words.length - 1) {
                // Add completed word to the list
                setCompletedWords(prev => [...prev, currentWord]);
                setCurrentWordIndex(currentWordIndex + 1);
                setUserInput('');
                setTimeout(() => inputRef.current?.focus(), 50);
              } else {
                // All words complete - add final word and update progress to 100% first
                setCompletedWords(prev => [...prev, currentWord]);
                setCurrentWordIndex(words.length);
                
                // Then show completion
                setTimeout(() => {
                  setTimeElapsed(Math.floor((Date.now() - (startTime || Date.now())) / 1000));
                  setIsComplete(true);
                  setShowConfetti(true);
                  setTimeout(() => setShowConfetti(false), 1500);
                  setTimeout(() => {
                    setShowSoccerBalls(true);
                    setTimeout(() => setShowSoccerBalls(false), 4000);
                  }, 1500);
                }, 300);
              }
            }, 100);
            return;
          } else {
            playClickSound();
          }
        } else {
          setConsecutiveCorrect(0);
          playErrorSound();
          setTotalErrorCount(prev => prev + 1);
        }
      }
      
      setUserInput(newValue);
    } else {
      // Original typing mode logic
      if (newValue.length > text.length) return;
      
      const lastChar = newValue[newValue.length - 1];
      const lastIndex = newValue.length - 1;
      
      if (newValue.length > userInput.length) {
        if (lastChar === text[lastIndex]) {
          const newStreak = consecutiveCorrect + 1;
          setConsecutiveCorrect(newStreak);
          
          if (newStreak > highestStreak) {
            setHighestStreak(newStreak);
            setJustBrokeRecord(true);
            setShowRecordBreakEffect(true);
            setShowMiniConfetti(true);
            setTimeout(() => {
              setShowRecordBreakEffect(false);
              setShowMiniConfetti(false);
            }, 800);
            setTimeout(() => setJustBrokeRecord(false), 200);
          }
          
          if (lastIndex === text.length - 1) {
            setUserInput(newValue);
            setTimeElapsed(Math.floor((Date.now() - (startTime || Date.now())) / 1000));
            setIsComplete(true);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 1500);
            setTimeout(() => {
              setShowSoccerBalls(true);
              setTimeout(() => setShowSoccerBalls(false), 4000);
            }, 1500);
            return;
          }
          
          const nextChar = text[lastIndex + 1];
          const isLastCharOfWord = nextChar === ' ' || nextChar === undefined;
          
          if (isLastCharOfWord && speakEnabled) {
            const typedWords = newValue.trim().split(/\s+/);
            const lastWord = typedWords[typedWords.length - 1];
            const textWords = text.split(' ');
            const wordIndex = typedWords.length - 1;
            if (lastWord && textWords[wordIndex] === lastWord) {
              speakWord(lastWord);
            } else {
              playClickSound();
            }
          } else {
            playClickSound();
          }
        } else {
          setConsecutiveCorrect(0);
          playErrorSound();
          setTotalErrorCount(prev => prev + 1);
        }
      }
      
      setUserInput(newValue);
    }
  };

  const resetPractice = () => {
    const newText = generateText();
    setText(newText);
    setUserInput('');
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setIsComplete(false);
    setErrors(0);
    setTotalErrorCount(0);
    setConsecutiveCorrect(0);
    setHighestStreak(0);
    setJustBrokeRecord(false);
    setShowConfetti(false);
    setShowSoccerBalls(false);
    setShowRecordBreakEffect(false);
    setShowMiniConfetti(false);
    setTimeElapsed(0);
    setCurrentWordIndex(0);
    setCompletedWords([]);
    inputRef.current?.focus();
  };

  const handleLengthChange = (newLength) => {
    setPassageLength(newLength);
  };

  const renderText = () => {
    if (practiceMode === 'memorize') {
      // In memorize mode, show one word at a time
      const words = text.split(' ');
      const currentWord = words[currentWordIndex] || '';
      
      return currentWord.split('').map((char, charIdx) => {
        let className = 'text-gray-400';
        
        if (charIdx < userInput.length) {
          className = userInput[charIdx] === char ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
        } else if (charIdx === userInput.length) {
          className = 'text-gray-800 border-l-2 border-blue-500';
        }

        return <span key={charIdx} className={className}>{char}</span>;
      });
    } else {
      // Original typing mode logic
      let charIndex = 0;
      const words = text.split(' ');
      
      return words.map((word, wordIdx) => {
        const chars = word.split('').map((char) => {
          const index = charIndex;
          charIndex++;
          
          let className = 'text-gray-400';
          if (index < userInput.length) {
            className = userInput[index] === char ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
          } else if (index === userInput.length) {
            className = 'text-gray-800 border-l-2 border-blue-500';
          }

          return <span key={index} className={className}>{char}</span>;
        });
        
        if (wordIdx < words.length - 1) {
          const spaceIndex = charIndex;
          charIndex++;
          let spaceClassName = 'text-gray-400';
          if (spaceIndex < userInput.length) {
            spaceClassName = userInput[spaceIndex] === ' ' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
          } else if (spaceIndex === userInput.length) {
            spaceClassName = 'text-gray-800 border-l-2 border-blue-500';
          }
          chars.push(<span key={spaceIndex} className={spaceClassName}> </span>);
        }
        
        return <span key={wordIdx} id={`word-${wordIdx}`}>{chars}</span>;
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentWordExplanation = () => {
    const textWords = text.split(' ');
    const currentWord = textWords[currentWordIndex];
    return currentWord && wordExplanations[currentWord] ? wordExplanations[currentWord] : null;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      {showMiniConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-[6rem] animate-ping">🎉</div>
          {[...Array(20)].map((_, i) => {
            const colors = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'];
            return (
              <div
                key={i}
                className={`absolute w-3 h-3 rounded-full ${colors[Math.floor(Math.random() * colors.length)]}`}
                style={{
                  left: '50%',
                  top: '50%',
                  animation: `mini-confetti-${i} 0.8s ease-out forwards`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: `0 0 6px ${colors[Math.floor(Math.random() * colors.length)]}`
                }}
              />
            );
          })}
          
          <style>{`
            ${[...Array(20)].map((_, i) => {
              const angle = (Math.PI * 2 * i) / 20;
              const velocity = 150 + Math.random() * 200;
              const endX = Math.cos(angle) * velocity;
              const endY = Math.sin(angle) * velocity;
              const rotation = Math.random() * 540 - 270;
              
              return `
                @keyframes mini-confetti-${i} {
                  0% {
                    transform: translate(-50%, -50%) rotate(0deg);
                    opacity: 1;
                  }
                  100% {
                    transform: translate(calc(-50% + ${endX}px), calc(-50% + ${endY}px)) rotate(${rotation}deg);
                    opacity: 0;
                  }
                }
              `;
            }).join('\n')}
          `}</style>
        </div>
      )}
      
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-[15rem] animate-ping">🎉</div>
          {[...Array(100)].map((_, i) => {
            const colors = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500'];
            return (
              <div
                key={i}
                className={`absolute rounded-full ${colors[Math.floor(Math.random() * colors.length)]}`}
                style={{
                  width: `${12 + Math.random() * 16}px`,
                  height: `${12 + Math.random() * 16}px`,
                  left: '50%',
                  top: '50%',
                  animation: `confetti-fall-${i} 2s ease-out forwards`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            );
          })}
          
          <style>{`
            ${[...Array(100)].map((_, i) => {
              const angle = (Math.PI * 2 * i) / 100;
              const velocity = 400 + Math.random() * 600;
              const endX = Math.cos(angle) * velocity;
              const endY = Math.sin(angle) * velocity;
              const rotation = Math.random() * 720 - 360;
              
              return `
                @keyframes confetti-fall-${i} {
                  0% {
                    transform: translate(-50%, -50%) rotate(0deg);
                    opacity: 1;
                  }
                  100% {
                    transform: translate(calc(-50% + ${endX}px), calc(-50% + ${endY}px)) rotate(${rotation}deg);
                    opacity: 0;
                  }
                }
              `;
            }).join('\n')}
          `}</style>
        </div>
      )}

      {showSoccerBalls && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(Math.min(50, text.split(' ').length * highestStreak))].map((_, i) => {
            const startX = Math.random() * window.innerWidth;
            const delay = Math.random() * 3;
            return (
              <div
                key={i}
                className="absolute text-4xl"
                style={{
                  left: `${startX}px`,
                  animation: `soccer-fall-${i} 4s ease-in forwards`,
                  animationDelay: `${delay}s`,
                  top: '-50px',
                }}
              >
                ⚽
              </div>
            );
          })}
          
          <style>{`
            ${[...Array(Math.min(50, text.split(' ').length * highestStreak))].map((_, i) => {
              const bounces = 2 + Math.floor(Math.random() * 3);
              const bounceHeights = Array.from({length: bounces}, (_, j) => 
                80 - (j * 20) - Math.random() * 20
              );
              
              let keyframes = `
                @keyframes soccer-fall-${i} {
                  0% { top: -50px; transform: rotate(0deg); }
              `;
              
              let currentProgress = 0;
              bounceHeights.forEach((height, j) => {
                const segmentDuration = 100 / (bounces + 1);
                currentProgress += segmentDuration;
                const bottomProgress = currentProgress - segmentDuration / 2;
                
                keyframes += `
                  ${bottomProgress}% { 
                    top: calc(100vh - 50px); 
                    transform: rotate(${(j + 1) * 180}deg); 
                  }
                  ${currentProgress}% { 
                    top: calc(100vh - ${height}px); 
                    transform: rotate(${(j + 1) * 180 + 90}deg); 
                  }
                `;
              });
              
              keyframes += `
                100% { 
                  top: calc(100vh - 50px); 
                  transform: rotate(${(bounces + 1) * 180}deg); 
                  opacity: 0;
                }
              }`;
              
              return keyframes;
            }).join('\n')}
          `}</style>
        </div>
      )}
      
      <div className="max-w-7xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-800 mb-2">Typing Practice</h1>
          <p className="text-gray-500">Type the text below as accurately and quickly as you can</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-gray-600 font-medium">
                Custom vocabulary pool {practiceMode === 'memorize' ? '(word - explanation)' : '(comma or space separated)'}:
              </label>
              <button
                onClick={() => setIsVocabPoolExpanded(!isVocabPoolExpanded)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {isVocabPoolExpanded ? '▼ Collapse' : '▶ Expand'}
              </button>
            </div>
            {isVocabPoolExpanded && (
              <>
                <textarea
                  value={practiceMode === 'memorize' ? customMaterial : customTypingPool}
                  onChange={(e) => practiceMode === 'memorize' ? setCustomMaterial(e.target.value) : setCustomTypingPool(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded font-mono text-sm focus:outline-none focus:border-blue-500 resize-none"
                  rows="6"
                  placeholder={practiceMode === 'memorize' ? 'word - explanation' : 'word1, word2, word3...'}
                />
                <button
                  onClick={resetPractice}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                >
                  Update Vocabulary Pool
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-6 mb-6">
          {/* Left sidebar for controls */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="mb-6">
                <label className="block text-sm text-gray-600 font-medium mb-3">Practice Mode:</label>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-2 cursor-pointer p-3 border-2 rounded-lg hover:bg-gray-50 transition-colors" style={{ borderColor: practiceMode === 'typing' ? '#3b82f6' : '#e5e7eb' }}>
                    <input
                      type="radio"
                      name="practiceMode"
                      value="typing"
                      checked={practiceMode === 'typing'}
                      onChange={(e) => {
                        setPracticeMode(e.target.value);
                        if (useCustomMaterial) {
                          setUseCustomMaterial(false);
                          resetPractice();
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700 font-medium">Typing Mode</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-3 border-2 rounded-lg hover:bg-gray-50 transition-colors" style={{ borderColor: practiceMode === 'memorize' ? '#3b82f6' : '#e5e7eb' }}>
                    <input
                      type="radio"
                      name="practiceMode"
                      value="memorize"
                      checked={practiceMode === 'memorize'}
                      onChange={(e) => {
                        setPracticeMode(e.target.value);
                        setUseCustomMaterial(true);
                        resetPractice();
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700 font-medium">Memorize Mode</span>
                  </label>
                </div>
              </div>

              <div className="mb-6 pb-6 border-b border-gray-200">
                <label className="block text-sm text-gray-600 font-medium mb-3">Passage Length (words):</label>
                <div className="flex flex-col gap-2">
                  <input
                    type="range"
                    min="1"
                    max={getMaxPassageLength()}
                    step="1"
                    value={Math.min(passageLength, getMaxPassageLength())}
                    onChange={(e) => handleLengthChange(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-2xl font-medium text-gray-800 text-center">{Math.min(passageLength, getMaxPassageLength())}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 font-medium mb-3">Speak Words:</label>
                <label className="relative inline-flex items-center cursor-pointer w-full justify-center">
                  <input
                    type="checkbox"
                    checked={speakEnabled}
                    onChange={(e) => {
                      setSpeakEnabled(e.target.checked);
                      setTimeout(() => inputRef.current?.focus(), 0);
                    }}
                    className="sr-only peer"
                  />
                  <div className={`w-14 h-7 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all ${speakEnabled ? 'bg-green-600 after:translate-x-7' : 'bg-gray-200'}`}></div>
                  <span className="ml-3 text-sm text-gray-700 font-medium">{speakEnabled ? 'On' : 'Off'}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1">
            <div className="grid grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center flex flex-col items-center justify-center min-h-48">
            <div 
              className="font-light text-red-600 mb-2 transition-all duration-300 leading-none"
              style={{ fontSize: `${Math.max(2.5, Math.min(10, 2.5 + Math.pow(totalErrorCount / Math.max(text.length, 1), 0.4) * 7.5))}rem` }}
            >
              {totalErrorCount}
            </div>
            <div className="text-base text-gray-500 uppercase tracking-wide font-medium">Errors</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-8 text-center flex flex-col items-center justify-center min-h-48">
            <div 
              className="font-light text-green-600 mb-2 transition-all duration-300 leading-none"
              style={{ fontSize: `${Math.max(2.5, Math.min(10, 2.5 + Math.pow(consecutiveCorrect / Math.max(text.length, 1), 0.4) * 7.5))}rem` }}
            >
              {consecutiveCorrect}
            </div>
            <div className="text-base text-gray-500 uppercase tracking-wide font-medium">Streak</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-8 text-center flex flex-col items-center justify-center min-h-48">
            <div 
              className={`font-light mb-2 relative leading-none transition-all ${justBrokeRecord ? 'duration-200 scale-125' : 'duration-500 scale-100'}`}
              style={{ color: '#FFD700' }}
            >
              <div className="text-3xl mb-2">👑</div>
              <div 
                className="transition-all duration-300"
                style={{ fontSize: `${Math.max(2.5, Math.min(10, 2.5 + Math.pow(highestStreak / Math.max(text.length, 1), 0.4) * 7.5))}rem` }}
              >
                {highestStreak}
              </div>
            </div>
            <div className="text-base text-gray-500 uppercase tracking-wide font-medium">Best</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-8 text-center flex flex-col items-center justify-center min-h-48">
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-light text-gray-600">{wpm}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">WPM</div>
              </div>
              <div>
                <div className="text-2xl font-light text-gray-600">{accuracy}%</div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-light text-gray-600">{formatTime(timeElapsed)}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Time</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-6 relative">
          {practiceMode === 'memorize' && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 font-medium">
                  {currentWordIndex} of {text.split(' ').length}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round((currentWordIndex / text.split(' ').length) * 100)}% complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(currentWordIndex / text.split(' ').length) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {practiceMode === 'memorize' ? (
            <div className="bg-white border-2 border-gray-200 rounded-lg p-12 mb-6 text-center min-h-[400px] flex flex-col items-center justify-center">
              {!isComplete ? (
                <>
                  <div className="text-6xl font-mono mb-12 leading-relaxed font-semibold">
                    {renderText()}
                  </div>
                  
                  {getCurrentWordExplanation() && (
                    <div className="mt-4 p-8 bg-blue-50 border-3 border-blue-300 rounded-xl max-w-3xl w-full">
                      <div className="text-3xl text-gray-800 whitespace-pre-line leading-relaxed">
                        {getCurrentWordExplanation()}
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
            </div>
          ) : (
            <div 
              ref={textContainerRef}
              className="text-2xl leading-relaxed font-mono mb-6 p-6 bg-gray-50 rounded relative overflow-visible"
              style={{ minHeight: '120px' }}
            >
              {renderText()}
              
              {practiceMode === 'memorize' && getCurrentWordExplanation() && (
                <div 
                  className="absolute z-50 pointer-events-none"
                  style={{
                    left: `${Math.max(10, Math.min(currentWordPosition.x - (textContainerRef.current?.getBoundingClientRect().left || 0), (textContainerRef.current?.offsetWidth || 400) - 10))}px`,
                    top: `${Math.max(10, currentWordPosition.y - (textContainerRef.current?.getBoundingClientRect().top || 0) - 5)}px`,
                    transform: (() => {
                      const containerWidth = textContainerRef.current?.offsetWidth || 400;
                      const relativeX = currentWordPosition.x - (textContainerRef.current?.getBoundingClientRect().left || 0);
                      if (relativeX < 150) return 'translate(0, -100%)';
                      else if (relativeX > containerWidth - 150) return 'translate(-100%, -100%)';
                      else return 'translate(-50%, -100%)';
                    })()
                  }}
                >
                  <div className="bg-blue-600 text-white px-3 py-2 rounded shadow-xl text-sm max-w-md">
                    <div className="whitespace-pre-line">{getCurrentWordExplanation()}</div>
                    <div 
                      className="absolute bottom-0 rotate-45 w-2 h-2 bg-blue-600"
                      style={{
                        left: (() => {
                          const containerWidth = textContainerRef.current?.offsetWidth || 400;
                          const relativeX = currentWordPosition.x - (textContainerRef.current?.getBoundingClientRect().left || 0);
                          if (relativeX < 150) return '10px';
                          else if (relativeX > containerWidth - 150) return 'calc(100% - 10px)';
                          else return '50%';
                        })(),
                        transform: (() => {
                          const containerWidth = textContainerRef.current?.offsetWidth || 400;
                          const relativeX = currentWordPosition.x - (textContainerRef.current?.getBoundingClientRect().left || 0);
                          if (relativeX < 150) return 'translate(0, 50%)';
                          else if (relativeX > containerWidth - 150) return 'translate(-100%, 50%)';
                          else return 'translate(-50%, 50%)';
                        })()
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}

          <textarea
            ref={inputRef}
            value={userInput}
            onChange={handleInputChange}
            className="w-full p-4 border-2 border-gray-200 rounded font-mono text-lg focus:outline-none focus:border-blue-500 resize-none"
            style={{ opacity: 0, height: 0, position: 'absolute', top: 0, left: 0 }}
            rows="4"
            placeholder="Start typing here..."
            disabled={isComplete}
            autoFocus
          />
        </div>

        {isComplete && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-center">
            <h2 className="text-2xl font-light text-green-800 mb-2">Complete! 🎉</h2>
            <p className="text-green-700">
              You typed at {wpm} WPM with {accuracy}% accuracy in {formatTime(timeElapsed)}
            </p>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={resetPractice}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {isComplete ? 'Try Again' : 'Reset'}
          </button>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingPractice;