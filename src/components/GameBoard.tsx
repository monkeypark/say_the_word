import React, { useEffect, useState, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Play,
  RotateCcw,
  Volume2,
  Mic,
  ChevronRight,
  Sparkles,
  Music,
  Square,
  Layers,
  Clock,
  Radio,
  CheckCircle2,
  Shuffle,
  Dices,
  Edit3,
  Video,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react';
import { Challenge, RoundConfig, GameStats, BeatJudgmentType, IntroStyleType, INTRO_STYLES, CardItem } from '../types/game';
import { VIRAL_CLASSICS_MUSIC } from '../data/defaultChallenges';
import { soundEngine } from '../services/soundEngine';
import { MicDetector } from '../services/micDetector';
import { AdService } from '../services/adService';
import { AdModal } from './AdModal';

// Fisher-Yates shuffle to randomize cards order
function shuffleCardsArray(cards: CardItem[]): CardItem[] {
  if (!cards || cards.length <= 1) return [...(cards || [])];
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  // Ensure that if cards length > 1, it's not strictly in the exact original order
  if (shuffled.length > 1 && shuffled.every((c, idx) => c.id === cards[idx]?.id)) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }
  return shuffled;
}

// Pick cards for each round: Round 1 (2 words), Round 2 (3 words), Round 3 (4 words), Round 4 (5 words), Round 5 (6 words)
function getCardsForRound(pool: CardItem[], roundIdx: number, shuffle: boolean, targetCount?: number): CardItem[] {
  if (!pool || pool.length === 0) return [];
  const count = (targetCount && targetCount > 0) ? targetCount : (roundIdx + 2);
  const base = shuffle ? shuffleCardsArray(pool) : [...pool];
  if (base.length === count) return base;
  if (base.length > count) return base.slice(0, count);

  // Pad up to count cards by cycling through base
  const result: CardItem[] = [];
  while (result.length < count) {
    for (const card of base) {
      if (result.length >= count) break;
      result.push({
        ...card,
        id: `${card.id || 'card'}-${result.length}`,
      });
    }
  }
  return result;
}

interface GameBoardProps {
  challenge: Challenge;
  isMicActive: boolean;
  onToggleMic: () => void;
  language: 'zh' | 'en';
  onBackToMenu: () => void;
  onEditChallenge?: (c: Challenge) => void;
  onCopyChallenge?: (c: Challenge) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  challenge,
  isMicActive,
  onToggleMic,
  language,
  onBackToMenu,
  onEditChallenge,
  onCopyChallenge,
}) => {
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'intro' | 'countdown' | 'playing' | 'allClear'>('idle');
  const [showAdModal, setShowAdModal] = useState<boolean>(false);
  const [gamesCompletedCount, setGamesCompletedCount] = useState<number>(() => AdService.getGamesPlayedCount());
  const [countdownNum, setCountdownNum] = useState<number | string>(4);
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const [maxRevealedIdx, setMaxRevealedIdx] = useState<number>(-1);
  const [currentBeatTotal, setCurrentBeatTotal] = useState(0);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    combo: 0,
    maxCombo: 0,
    perfectCount: 0,
    greatCount: 0,
    missCount: 0,
    totalNotes: 0,
    roundScores: [],
  });

  const [isPreLoop, setIsPreLoop] = useState(true);
  const isPreLoopRef = useRef(true);

  const [lastJudgment, setLastJudgment] = useState<{
    type: BeatJudgmentType;
    id: number;
    text: string;
  } | null>(null);

  const [micVolume, setMicVolume] = useState(0);
  const [voiceSpokeRecent, setVoiceSpokeRecent] = useState(false);

  // For all custom challenges, strictly match the Viral Classics music (intro + beat + loop)
  const isCustomOrUsesBeat = challenge.isCustom || !challenge.customAudioUrl || challenge.customAudioUrl.includes('beat.mp3');
  const effectiveAudioUrl: string = (isCustomOrUsesBeat || !challenge.customAudioUrl) ? VIRAL_CLASSICS_MUSIC.customAudioUrl : challenge.customAudioUrl;
  const effectiveAudioOffsetSec = isCustomOrUsesBeat ? VIRAL_CLASSICS_MUSIC.audioOffsetSec : (challenge.audioOffsetSec ?? 2.626);
  const effectiveIntroDurationSec = isCustomOrUsesBeat ? VIRAL_CLASSICS_MUSIC.introDurationSec : (challenge.introDurationSec ?? 2.626);
  const effectiveAudioLoopEndSec = isCustomOrUsesBeat ? VIRAL_CLASSICS_MUSIC.audioLoopEndSec : (challenge.audioLoopEndSec ?? 5.251);
  const effectiveBaseBpm = isCustomOrUsesBeat ? VIRAL_CLASSICS_MUSIC.baseBpm : (challenge.baseBpm || 182.8);
  const effectiveSoundPack = isCustomOrUsesBeat ? VIRAL_CLASSICS_MUSIC.soundPack : challenge.soundPack;

  // Intro setting state (Defaults to 8-beat intro for 'bala bala bala bala 1 2 3 go' chant)
  const [introStyle, setIntroStyle] = useState<IntroStyleType>(challenge.introStyle || 'quick_8');
  const [introStep, setIntroStep] = useState(0);
  const [introTotalBeats, setIntroTotalBeats] = useState(challenge.introStyle === 'quick_4' ? 4 : 8);
  const [audioOffsetSec, setAudioOffsetSec] = useState<number>(effectiveAudioOffsetSec);

  // Audio preview on waiting screen
  const [isAuditioningBeat, setIsAuditioningBeat] = useState(false);

  // Safe round boundary
  const totalRounds = challenge.rounds.length;
  const safeRoundIdx = Math.max(0, Math.min(totalRounds - 1, currentRoundIdx));
  const currentRound: RoundConfig = challenge.rounds[safeRoundIdx] || challenge.rounds[0];

  // Shuffle cards order setting (default true: 每轮卡片顺序打乱)
  const [shuffleCards, setShuffleCards] = useState<boolean>(
    challenge.shuffleCards !== undefined ? challenge.shuffleCards : true
  );

  // Active displayed cards (Round 1: 2 words, Round 2: 3 words, Round 3: 4 words...)
  const [displayedCards, setDisplayedCards] = useState<CardItem[]>(() => {
    const pool = challenge.rounds[0]?.cards?.length ? challenge.rounds[0].cards : (challenge.cardPool || []);
    const count = challenge.rounds[0]?.cardCount || 2;
    return getCardsForRound(pool, 0, shuffleCards, count);
  });
  const displayedCardsRef = useRef<CardItem[]>(displayedCards);

  // Hidden cards toggle on preview panel (default false: cards are hidden before every round)
  const [showPreviewCards, setShowPreviewCards] = useState<boolean>(false);

  useEffect(() => {
    displayedCardsRef.current = displayedCards;
  }, [displayedCards]);

  useEffect(() => {
    isPreLoopRef.current = isPreLoop;
  }, [isPreLoop]);



  // Timing & state refs
  const beatStartTimeRef = useRef<number>(0);
  const activeCardIndexRef = useRef<number | null>(null);
  const hitRegisteredThisBeatRef = useRef<boolean>(false);
  const micDetectorRef = useRef<MicDetector | null>(null);
  const countdownTimerRef = useRef<any>(null);
  const roundEndTimeoutRef = useRef<any>(null);
  const transitionTimeoutRef = useRef<any>(null);

  // Clear all running timers helper
  const clearAllTimers = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (roundEndTimeoutRef.current) {
      clearTimeout(roundEndTimeoutRef.current);
      roundEndTimeoutRef.current = null;
    }
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  };

  // Sync current round, soundpack, and user-uploaded custom audio / pre-music
  useEffect(() => {
    setAudioOffsetSec(effectiveAudioOffsetSec);
    soundEngine.loadCustomAudio(effectiveAudioUrl);

    return () => {
      clearAllTimers();
      soundEngine.stopRhythm();
      soundEngine.stopPreview();
      soundEngine.stopCustomTrack();
      soundEngine.stopIntroMusic();
    };
  }, [challenge.id, effectiveAudioUrl, effectiveAudioOffsetSec]);

  // Setup Microphone Detector
  useEffect(() => {
    if (isMicActive) {
      const detector = new MicDetector({
        threshold: 0.12,
        onVoiceTrigger: (rms) => {
          setMicVolume(Math.min(1, rms * 4));
          setVoiceSpokeRecent(true);
          setTimeout(() => setVoiceSpokeRecent(false), 300);
          handleHitAttempt('voice');
        },
        onSpeechWord: (spokenWord) => {
          const activeIdx = activeCardIndexRef.current;
          const currentCards = displayedCardsRef.current;
          if (activeIdx !== null && currentCards[activeIdx]) {
            const cardWord = currentCards[activeIdx].word.toLowerCase();
            if (spokenWord.includes(cardWord) || cardWord.includes(spokenWord)) {
              handleHitAttempt('voice-match');
            }
          }
        },
      });

      detector.start().then((ok) => {
        if (!ok) {
          console.log('Mic not permitted');
        }
      });
      micDetectorRef.current = detector;

      const volInterval = setInterval(() => {
        if (detector) {
          setMicVolume(detector.getVolumeLevel());
        }
      }, 50);

      return () => {
        clearInterval(volInterval);
        detector.stop();
        micDetectorRef.current = null;
      };
    } else {
      if (micDetectorRef.current) {
        micDetectorRef.current.stop();
        micDetectorRef.current = null;
      }
    }
  }, [isMicActive, currentRoundIdx]);

  // Handle player hit (either via voice burst or spacebar / screen tap)
  const handleHitAttempt = useCallback((source: 'tap' | 'voice' | 'voice-match') => {
    if (gameState !== 'playing') return;
    if (isPreLoopRef.current) return; // Skip if it's the demonstration loop
    if (hitRegisteredThisBeatRef.current) return;

    const now = performance.now();
    const beatTime = beatStartTimeRef.current;
    const diff = Math.abs(now - beatTime);

    // Audio hit timing window (BPM dependent)
    const tolerancePerfect = 140; // ms
    const toleranceGreat = 260; // ms

    let judgment: BeatJudgmentType = 'MISS';
    let addedScore = 0;

    if (source === 'voice-match' || diff <= tolerancePerfect) {
      judgment = 'PERFECT';
      addedScore = 100;
    } else if (diff <= toleranceGreat) {
      judgment = 'GREAT';
      addedScore = 60;
    } else {
      judgment = 'MISS';
      addedScore = 0;
    }

    hitRegisteredThisBeatRef.current = true;
    soundEngine.playHitSound(judgment);

    setStats((prev) => {
      const isHit = judgment !== 'MISS';
      const newCombo = isHit ? prev.combo + 1 : 0;
      const maxCombo = Math.max(prev.maxCombo, newCombo);
      const bonus = newCombo > 3 ? 20 : 0;

      return {
        ...prev,
        score: prev.score + addedScore + bonus,
        combo: newCombo,
        maxCombo,
        perfectCount: prev.perfectCount + (judgment === 'PERFECT' ? 1 : 0),
        greatCount: prev.greatCount + (judgment === 'GREAT' ? 1 : 0),
        missCount: prev.missCount + (judgment === 'MISS' ? 1 : 0),
        totalNotes: prev.totalNotes + 1,
        roundScores: prev.roundScores,
      };
    });

    setLastJudgment({
      type: judgment,
      id: Date.now(),
      text: judgment === 'PERFECT' ? '🔥 PERFECT!' : judgment === 'GREAT' ? '✨ GREAT!' : '💨 MISS',
    });
  }, [gameState]);

  // Spacebar key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'idle') {
          startGame();
        } else if (gameState === 'playing') {
          handleHitAttempt('tap');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleHitAttempt]);

  // Start the countdown sequence then rhythm for a specific round index and phase
  const startCountdownAndPlay = (targetRoundIdx: number, phase: 'demo' | 'challenge' = 'demo', startTime?: number) => {
    clearAllTimers();
    soundEngine.stopPreview();
    // Do not stop rhythm if we are chaining seamlessly
    if (!startTime) {
      soundEngine.stopRhythm();
    }
    setIsAuditioningBeat(false);

    const safeTargetIdx = Math.max(0, Math.min(totalRounds - 1, targetRoundIdx));
    setCurrentRoundIdx(safeTargetIdx);
    const roundToPlay = challenge.rounds[safeTargetIdx] || challenge.rounds[0];

    // Only shuffle and set cards if starting a new round (demo phase)
    if (phase === 'demo') {
      const pool = roundToPlay.cards?.length ? roundToPlay.cards : (challenge.cardPool || []);
      const count = roundToPlay.cardCount || (safeTargetIdx + 2);
      const initialCards = getCardsForRound(pool, safeTargetIdx, shuffleCards, count);
      setDisplayedCards(initialCards);
      displayedCardsRef.current = initialCards;
      setIsPreLoop(true);
      isPreLoopRef.current = true;
      setMaxRevealedIdx(-1);
    } else {
      setIsPreLoop(false);
      isPreLoopRef.current = false;
      // 到你时（挑战阶段）：卡片全开显示
      setMaxRevealedIdx(displayedCardsRef.current.length);
    }

    const currentCards = displayedCardsRef.current;
    const introConfig = INTRO_STYLES.find((s) => s.id === introStyle) || INTRO_STYLES[0];
    const introBeats = introConfig.beats > 0 ? introConfig.beats : 8;
    // 只有第1个关卡的示范阶段保留前奏准备环节（“示范即将开始...”），从第2个关卡开始以及所有挑战阶段均无前奏准备，无缝直入
    const hasIntro = phase === 'demo' && safeTargetIdx === 0;
    const effectiveIntroBeats = hasIntro ? introBeats : 0;

    const effectiveLoopCount = Math.max(2, roundToPlay.loopCount || 2);

    // In phased mode:
    // 'demo' phase is always the first loop
    // 'challenge' phase is the remaining loops (usually the 2nd loop)
    const loopsInThisPhase = phase === 'demo' ? 1 : (effectiveLoopCount - 1);
    const totalBeats = currentCards.length * loopsInThisPhase;

    setActiveCardIndex(null);
    setCurrentBeatTotal(0);

    // Initial state setup: 只有需要前奏时进入 intro，其余直接进入 playing
    if (hasIntro) {
      setGameState('intro');
      setIntroTotalBeats(effectiveIntroBeats);
      setIntroStep(0);
      setCountdownNum(language === 'zh' ? '示范即将开始...' : 'GET READY (LISTEN)');
    } else {
      setGameState('playing');
    }

    // 挑战阶段不需要准备环节（“准备！轮到你了”），直接进入报词
    // 挑战阶段的报词音乐：按照上一轮需求调换后的设定，到你了报词轮播放 0 ~ 2.626s
    const isSwappedChallenge = phase === 'challenge';
    const introAudioOffset = isSwappedChallenge ? effectiveAudioOffsetSec : 0;
    const introAudioLoopEnd = isSwappedChallenge ? effectiveAudioLoopEndSec : effectiveAudioOffsetSec;
    const gameAudioOffset = isSwappedChallenge ? 0 : effectiveAudioOffsetSec;
    const gameAudioLoopEnd = isSwappedChallenge ? effectiveAudioOffsetSec : effectiveAudioLoopEndSec;

    // Launch unified session: Intro counts down with clean ticks for demo,
    // and accompaniment drops in on downbeat 0 seamlessly!
    soundEngine.startRoundSession({
      bpm: roundToPlay.bpm,
      introBeats: effectiveIntroBeats,
      cardsCount: currentCards.length,
      totalGameBeats: totalBeats,
      soundPack: effectiveSoundPack,
      customAudioUrl: effectiveAudioUrl,
      customIntroAudioUrl: challenge.customIntroAudioUrl,
      audioOffsetSec: gameAudioOffset,
      audioLoopEndSec: gameAudioLoopEnd,
      introAudioOffsetSec: introAudioOffset,
      introAudioLoopEndSec: introAudioLoopEnd,
      introDurationSec: effectiveIntroDurationSec,
      baseBpm: effectiveBaseBpm,
      onIntroBeat: (currentBeat, totalBeatsCount) => {
        setGameState('intro');
        setIntroStep(currentBeat - 1);
        const chantIndex = Math.max(0, currentBeat - 1);
        const remaining = totalBeatsCount - currentBeat;
        // Generic countdown display for all tracks
        if (remaining <= 0) {
          setCountdownNum('🚀 GO!');
        } else if (remaining <= 3) {
          const countSymbols = ['💥 3', '⚡ 2', '✨ 1'];
          setCountdownNum(countSymbols[3 - remaining] || remaining);
        } else {
          setCountdownNum(language === 'zh' ? `准备 ${currentBeat}/${totalBeatsCount}` : `READY ${currentBeat}/${totalBeatsCount}`);
        }
      },
      onGameBeat: (cardIdx, beatNumber) => {
        // In phased execution, the loop status is fixed per session
        if (isPreLoopRef.current !== isPreLoop) {
          setIsPreLoop(isPreLoopRef.current);
        }

        setGameState('playing');
        setActiveCardIndex(cardIdx);
        activeCardIndexRef.current = cardIdx;
        setMaxRevealedIdx((prev) => Math.max(prev, cardIdx));
        setCurrentBeatTotal(beatNumber);
        beatStartTimeRef.current = performance.now();
        hitRegisteredThisBeatRef.current = false;
      },
      onRoundComplete: (nextBeatTime) => {
        // Trigger completion of current PHASE
        handlePhaseComplete(safeTargetIdx, phase, nextBeatTime);
      },
    }, startTime);
  };

  // Handle phase completion: transition from Demo to Challenge within a round, or move to next round
  const handlePhaseComplete = (roundIdx: number, completedPhase: 'demo' | 'challenge', nextBeatAudioTime?: number) => {
    clearAllTimers();

    if (completedPhase === 'demo') {
      // Transition from DEMO to CHALLENGE of the same round
      // This will trigger another INTRO before the challenge loops
      startCountdownAndPlay(roundIdx, 'challenge', nextBeatAudioTime);
    } else {
      // Transition to next round
      soundEngine.playHitSound('PERFECT');
      setActiveCardIndex(null);

      if (roundIdx + 1 >= totalRounds) {
        soundEngine.stopRhythm();
        const newCount = AdService.incrementGamesPlayed();
        setGamesCompletedCount(newCount);

        roundEndTimeoutRef.current = setTimeout(() => {
          setGameState('allClear');
          soundEngine.playAirhorn();
          confetti({
            particleCount: 120,
            spread: 100,
            origin: { y: 0.6 },
          });

          // Google AdSense: trigger interstitial modal every 4 completed games
          if (AdService.shouldShowAd(newCount)) {
            setTimeout(() => {
              setShowAdModal(true);
            }, 800);
          }
        }, 2000);
      } else {
        // Seamlessly move to the demo of the next round
        startCountdownAndPlay(roundIdx + 1, 'demo', nextBeatAudioTime);
      }
    }
  };

  const startGame = async () => {
    soundEngine.init();
    await soundEngine.loadCustomAudio(effectiveAudioUrl);
    startCountdownAndPlay(0, 'demo');
  };

  // Toggle beat audition on waiting screen
  const handleToggleAudition = async () => {
    if (isAuditioningBeat) {
      soundEngine.stopPreview();
      soundEngine.stopRhythm();
      soundEngine.stopCustomTrack();
      setIsAuditioningBeat(false);
    } else {
      setIsAuditioningBeat(true);
      await soundEngine.loadCustomAudio(effectiveAudioUrl);
      const rate = (currentRound.bpm || 160) / effectiveBaseBpm;
      soundEngine.playCustomTrack(0, audioOffsetSec, 1.0, effectiveAudioLoopEndSec, rate);
    }
  };





  // Restart challenge from Round 1
  const restartGame = () => {
    clearAllTimers();
    soundEngine.stopRhythm();
    soundEngine.stopPreview();
    setIsAuditioningBeat(false);
    setCurrentRoundIdx(0);
    setGameState('idle');
    setActiveCardIndex(null);
    setMaxRevealedIdx(-1);
    setStats({
      score: 0,
      combo: 0,
      maxCombo: 0,
      perfectCount: 0,
      greatCount: 0,
      missCount: 0,
      totalNotes: 0,
      roundScores: [],
    });
  };

  // Dynamic grid class based on cards count
  const getGridColsClass = (count: number) => {
    if (count <= 4) {
      switch (count) {
        case 1: return 'grid-cols-1 max-w-sm';
        case 2: return 'grid-cols-2 max-w-2xl';
        case 3: return 'grid-cols-1 sm:grid-cols-3 max-w-3xl';
        case 4: return 'grid-cols-2 md:grid-cols-4 max-w-5xl';
        default: return 'grid-cols-1';
      }
    }

    // For more than 4 cards, split into rows of 3 or 4
    // Priority: If multiple of 4 (e.g. 8 cards), use 2 cols on mobile and 4 cols on tablet/desktop
    if (count % 4 === 0) {
      return 'grid-cols-2 sm:grid-cols-4 max-w-5xl';
    }
    if (count % 3 === 0) {
      return 'grid-cols-2 sm:grid-cols-3 max-w-4xl';
    }
    return 'grid-cols-2 sm:grid-cols-4 max-w-5xl';
  };

  // Calculate Accuracy
  const accuracy = stats.totalNotes > 0
    ? Math.round(((stats.perfectCount * 1.0 + stats.greatCount * 0.7) / stats.totalNotes) * 100)
    : 100;

  // Grade
  const getGrade = () => {
    if (accuracy >= 95) return { grade: 'SSS', color: 'from-amber-400 to-yellow-200' };
    if (accuracy >= 85) return { grade: 'S', color: 'from-pink-500 to-rose-400' };
    if (accuracy >= 70) return { grade: 'A', color: 'from-purple-500 to-indigo-400' };
    return { grade: 'B', color: 'from-cyan-400 to-blue-500' };
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col p-1.5 xs:p-2 sm:p-4 select-none overflow-x-hidden space-y-1.5 sm:space-y-3">
      {/* Top Rhythm HUD */}
      <div className="w-full flex items-center justify-between gap-1.5 sm:gap-4 bg-white dark:bg-[#0f1422] border border-slate-200 dark:border-slate-800/80 rounded-xl sm:rounded-2xl px-2 sm:px-4 py-1.5 sm:py-3 shadow-sm dark:shadow-md min-w-0 transition-colors">
        {/* Left: Back & Track Info */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            onClick={() => {
              clearAllTimers();
              soundEngine.stopRhythm();
              soundEngine.stopPreview();
              onBackToMenu();
            }}
            className="shrink-0 flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-800 transition-colors"
          >
            <span>{language === 'zh' ? '← 返回' : '← Back'}</span>
          </button>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <h2 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white tracking-tight truncate min-w-0 max-w-[100px] xs:max-w-[140px] sm:max-w-xs">
                {challenge.title}
              </h2>
              <span className="shrink-0 text-[10px] sm:text-[11px] font-semibold px-1.5 py-0.2 rounded-md bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20 whitespace-nowrap">
                {language === 'zh' ? `第 ${safeRoundIdx + 1} 关` : `Level ${safeRoundIdx + 1}`} · {currentRound.bpm} BPM
              </span>
            </div>
            {shuffleCards && (
              <span className="hidden sm:inline text-[11px] text-slate-600 dark:text-slate-500 dark:text-slate-400">
                {language === 'zh' ? '每个关卡已开启随机打乱' : 'Shuffle enabled (per level)'}
              </span>
            )}
          </div>
        </div>

        {/* Center: Beat Step Dots (Adaptive to 8-beat intro and card beats) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shrink-0">
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-wider">
            {gameState === 'intro' ? 'INTRO' : 'BEAT'}
          </span>
          <div className="flex items-center gap-1.5">
            {gameState === 'intro'
              ? Array.from({ length: introTotalBeats }).map((_, step) => {
                const isCurrentStep = introStep === step;
                const isPassed = step < introStep;
                return (
                  <div
                    key={`intro-dot-${step}`}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-75 ${isCurrentStep
                        ? 'bg-amber-400 scale-125 shadow-sm shadow-amber-500'
                        : isPassed
                          ? 'bg-amber-500/40'
                          : 'bg-slate-300 dark:bg-slate-800'
                      }`}
                  />
                );
              })
              : displayedCards.map((c, step) => {
                const isCurrentStep = activeCardIndex === step;
                return (
                  <div
                    key={`beat-dot-${c.id || step}-${step}`}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-75 ${isCurrentStep
                        ? 'bg-pink-400 scale-125 shadow-sm shadow-pink-500'
                        : 'bg-slate-300 dark:bg-slate-800'
                      }`}
                  />
                );
              })}
          </div>
        </div>

        {/* Right: Score & Combo */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="text-right">
            <span className="text-[9px] sm:text-[10px] uppercase font-semibold text-slate-600 dark:text-slate-500 block leading-tight">
              {language === 'zh' ? '得分' : 'SCORE'}
            </span>
            <span className="text-base sm:text-xl font-black text-slate-900 dark:text-white font-mono-numeric">
              {stats.score.toLocaleString()}
            </span>
          </div>

          <div className="text-right border-l border-slate-200 dark:border-slate-800 pl-2 sm:pl-3">
            <span className="text-[9px] sm:text-[10px] uppercase font-semibold text-slate-600 dark:text-slate-500 block leading-tight">
              {language === 'zh' ? '连击' : 'COMBO'}
            </span>
            <span className="text-base sm:text-xl font-black text-pink-500 font-mono-numeric">
              {stats.combo}x
            </span>
          </div>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="py-2 flex flex-col items-center justify-center relative w-full">
        {/* Floating Judgment FX */}
        {lastJudgment && (
          <div
            key={lastJudgment.id}
            className="absolute -top-3 pointer-events-none z-20"
          >
            <span
              className={`text-xl sm:text-2xl font-black tracking-wider uppercase px-4 py-1 rounded-xl shadow-lg ${lastJudgment.type === 'PERFECT'
                  ? 'bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-400/60'
                  : lastJudgment.type === 'GREAT'
                    ? 'bg-cyan-400/20 text-cyan-700 dark:text-cyan-300 border border-cyan-400/60'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/60'
                }`}
            >
              {lastJudgment.text}
            </span>
          </div>
        )}

        {/* PROMINENT GAMEPLAY STATUS BANNER (Compact & responsive height to fit mobile screens) */}
        <div className="w-full max-w-md mx-auto h-8 xs:h-10 sm:h-14 flex items-center justify-center mb-1 xs:mb-1.5 sm:mb-3">
          {(gameState === 'playing' || gameState === 'intro') ? (
            <div className={`px-3 py-1 sm:px-6 sm:py-2 rounded-xl sm:rounded-2xl border-2 flex items-center gap-2 sm:gap-3 shadow-md sm:shadow-lg transition-colors duration-150 ${gameState === 'intro'
                ? 'bg-amber-500/20 border-amber-400/60 text-amber-300 shadow-amber-500/20'
                : isPreLoop
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 shadow-indigo-500/20'
                  : 'bg-pink-600/20 border-pink-500/50 text-pink-300 shadow-pink-500/20'
              }`}>
              <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full animate-pulse ${gameState === 'intro' ? 'bg-amber-400' : isPreLoop ? 'bg-indigo-400' : 'bg-pink-400'
                }`} />
              <span className="text-xs xs:text-sm sm:text-xl font-black uppercase tracking-wider sm:tracking-[0.15em]">
                {gameState === 'intro'
                  ? String(countdownNum)
                  : isPreLoop
                    ? (language === 'zh' ? '示范中 · 准备' : 'DEMO · GET READY')
                    : (language === 'zh' ? '到你了 · 报词！' : 'YOUR TURN!')}
              </span>
              <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full animate-pulse ${gameState === 'intro' ? 'bg-amber-400' : isPreLoop ? 'bg-indigo-400' : 'bg-pink-400'
                }`} />
            </div>
          ) : (
            <div className="h-full" />
          )}
        </div>

        {/* CARDS DISPLAY GRID (Only shown during active gameplay/intro/countdown/allClear) */}
        {gameState !== 'idle' && (
          <div className={`grid gap-1.5 xs:gap-2 sm:gap-4 w-full mx-auto ${getGridColsClass(displayedCards.length)} items-stretch`}>
            {displayedCards.map((card, idx) => {
              const isActive = activeCardIndex === idx;
              // 到你时（!isPreLoop）卡片全开；示范阶段（isPreLoop）跟随节拍翻开；通关全开
              const isRevealed = gameState === 'allClear' || !isPreLoop || (gameState === 'playing' && idx <= maxRevealedIdx);
              const mode = card.cardMode || (card.textOnly ? 'text' : 'image');

              if (!isRevealed) {
                return (
                  <div
                    key={`mystery-card-${idx}`}
                    className={`relative flex flex-col items-center justify-center rounded-xl sm:rounded-2xl p-2 sm:p-4 ${displayedCards.length > 4
                        ? 'h-[clamp(88px,12.8vh,140px)] sm:h-52 md:h-64'
                        : 'h-40 sm:h-56 md:h-64'
                      } bg-slate-100 dark:bg-[#0a0e1a]/95 border-2 border-slate-200 dark:border-slate-800/80 shadow-inner select-none transition-all duration-150`}
                  >
                    {/* Card Number Badge - Absolute top-left */}
                    <span className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 w-5 h-5 sm:w-6 sm:h-6 rounded sm:rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-black bg-slate-200 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700/60">
                      {idx + 1}
                    </span>

                    {/* Locked indicator - Absolute top-right */}
                    <span className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 text-[9px] sm:text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-600 dark:text-slate-400" />
                      {language === 'zh' ? '隐藏' : 'LOCKED'}
                    </span>

                    {/* Mystery Center */}
                    <div className="w-full flex flex-col items-center justify-center text-center px-1">
                      <div className="w-9 h-9 sm:w-16 sm:h-20 rounded-lg sm:rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 flex items-center justify-center text-xl sm:text-3xl text-slate-600 dark:text-slate-400 font-black shadow-inner">
                        <span className="animate-pulse text-pink-500 dark:text-pink-400/80">?</span>
                      </div>
                      <span className="text-[9px] sm:text-[11px] text-slate-600 dark:text-slate-400 font-semibold mt-1 sm:mt-2 tracking-widest uppercase">
                        {language === 'zh' ? '示范中翻牌' : 'ON BEAT'}
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={`board-card-${card.id || idx}-${idx}`}
                  onClick={() => gameState === 'playing' && handleHitAttempt('tap')}
                  className={`relative flex flex-col items-center justify-center rounded-xl sm:rounded-2xl p-2 sm:p-4 ${displayedCards.length > 4
                      ? 'h-[clamp(88px,12.8vh,140px)] sm:h-52 md:h-64'
                      : 'h-40 sm:h-56 md:h-64'
                    } cursor-pointer select-none overflow-hidden transition-[border-color,background-color,box-shadow,transform,opacity] duration-100 ${isActive
                      ? 'bg-pink-50/60 dark:bg-[#181f33] border-2 border-pink-500 shadow-md sm:shadow-xl shadow-pink-500/20 dark:shadow-pink-500/30 scale-[1.02] z-10 opacity-100'
                      : gameState === 'intro'
                        ? 'bg-white dark:bg-[#0f1422] border-2 border-pink-500/30 opacity-90 shadow-sm'
                        : 'bg-white dark:bg-[#0f1422] border-2 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 opacity-100 shadow-sm'
                    }`}
                >
                  {/* Header Badge - Absolute top-left */}
                  <span
                    className={`absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 w-5 h-5 sm:w-6 sm:h-6 rounded sm:rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-black transition-colors ${isActive ? 'bg-pink-500 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400'
                      }`}
                  >
                    {idx + 1}
                  </span>

                  {/* Status tag - Absolute top-right */}
                  {isActive && (
                    <span className={`absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 text-[9px] sm:text-[11px] font-black uppercase px-1.5 sm:px-2 py-0.5 rounded shadow-xs ${isPreLoop ? 'bg-indigo-500/20 dark:bg-indigo-500/40 text-indigo-700 dark:text-indigo-100 border border-indigo-400/30' : 'bg-pink-500/20 dark:bg-pink-500/40 text-pink-700 dark:text-pink-100 border border-pink-400/30 animate-pulse'
                      }`}>
                      {isPreLoop
                        ? (language === 'zh' ? '准备' : 'READY')
                        : (language === 'zh' ? '报词!' : 'YOUR TURN!')}
                    </span>
                  )}

                  {/* Card Center Body - Letters fill and center inside the card */}
                  <div className="w-full flex-1 flex flex-col items-center justify-center text-center px-1">
                    {/* Image if available */}
                    {mode !== 'text' && card.imageUrl && (
                      <div className="h-7 xs:h-8 sm:h-14 flex items-center justify-center mb-0.5">
                        <img
                          src={card.imageUrl}
                          alt={card.word}
                          className="max-h-full max-w-full object-contain rounded-md"
                        />
                      </div>
                    )}

                    {/* Main Word / Letters - Large and filling center */}
                    <div
                      className={`font-black tracking-tight leading-tight w-full transition-colors ${
                        card.word.length > 5
                          ? 'text-lg xs:text-xl sm:text-3xl md:text-4xl'
                          : 'text-2xl xs:text-3xl sm:text-4xl md:text-5xl'
                      } ${isActive ? 'text-pink-600 dark:text-white' : 'text-slate-900 dark:text-slate-100'}`}
                    >
                      {card.word}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CLEAN PRE-GAME SETUP PANEL (When idle) */}
        {gameState === 'idle' && (
          <div className="max-w-2xl w-full mx-auto p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm dark:shadow-lg transition-colors">
            {/* Preview Cards Strip (Hidden by default before game starts) */}
            <div className="space-y-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-pink-500" />
                  {language === 'zh' ? `本关卡片 (${displayedCards.length}张 · 默认隐藏)` : `Level Cards (${displayedCards.length} · Hidden)`}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPreviewCards(prev => !prev)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-pink-500 transition-colors px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    {showPreviewCards ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPreviewCards ? (language === 'zh' ? '隐藏卡片' : 'Hide Cards') : (language === 'zh' ? '偷看卡片' : 'Peek Cards')}</span>
                  </button>
                  <span className="text-[11px] font-mono text-pink-500 font-bold">
                    BPM: {currentRound.bpm}
                  </span>
                </div>
              </div>
              <div className={`grid gap-2 ${displayedCards.length <= 2 ? 'grid-cols-2 max-w-sm mx-auto' : displayedCards.length <= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3 sm:grid-cols-6'}`}>
                {displayedCards.map((card, idx) => (
                  <div
                    key={`preview-card-${card.id || idx}-${idx}`}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm min-h-[72px]"
                  >
                    {showPreviewCards ? (
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate w-full">
                        {card.word}
                      </span>
                    ) : (
                      <>
                        <span className="text-lg mb-1 text-slate-600 dark:text-slate-400 dark:text-slate-600">❓</span>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500 truncate w-full">
                          ???
                        </span>
                        <span className="text-[10px] text-slate-600 dark:text-slate-400 dark:text-slate-600 truncate w-full font-mono">
                          #{idx + 1}
                        </span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Card Order Shuffle Mode Controls */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2 flex-wrap">
                <Clock className="w-4 h-4 text-pink-500" />
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  {language === 'zh'
                    ? `前奏: ${(INTRO_STYLES.find(s => s.id === introStyle)?.beats || 8)} 拍`
                    : `Intro: ${(INTRO_STYLES.find(s => s.id === introStyle)?.beats || 8)} Beats`}
                </span>
                {challenge.customAudioUrl && (
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-0.5 text-[11px]">
                    <span className="text-slate-600 dark:text-slate-400">{language === 'zh' ? '卡点偏移:' : 'Offset:'}</span>
                    <button
                      type="button"
                      onClick={() => setAudioOffsetSec(prev => Math.max(0, Math.round((prev - 0.05) * 100) / 100))}
                      className="px-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold"
                    >
                      -
                    </button>
                    <span className="font-mono text-pink-500 font-bold">{audioOffsetSec.toFixed(2)}s</span>
                    <button
                      type="button"
                      onClick={() => setAudioOffsetSec(prev => Math.round((prev + 0.05) * 100) / 100)}
                      className="px-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold"
                    >
                      +
                    </button>
                  </div>
                )}
                {challenge.audioFileName && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-pink-500/10 border border-pink-500/20 text-pink-600 dark:text-pink-300 font-medium truncate max-w-[130px]">
                    🎵 {challenge.audioFileName}
                  </span>
                )}
              </div>

              {/* Sound Audition Button */}
              <button
                type="button"
                onClick={handleToggleAudition}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs ${isAuditioningBeat
                    ? 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:text-pink-400 dark:border-slate-700/80'
                  }`}
              >
                {isAuditioningBeat ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current text-rose-600 dark:text-rose-400" />
                    <span>{language === 'zh' ? '停止试听' : 'Stop Preview'}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                    <span>{language === 'zh' ? '试听伴奏' : 'Preview Beat'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Card Order Shuffle Mode Controls */}
            <div className="pt-1 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Shuffle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  {language === 'zh' ? '卡片顺序' : 'Card Order'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const newSetting = !shuffleCards;
                    setShuffleCards(newSetting);
                    const pool = currentRound.cards?.length ? currentRound.cards : (challenge.cardPool || []);
                    const count = currentRound.cardCount || (safeRoundIdx + 2);
                    const res = getCardsForRound(pool, safeRoundIdx, newSetting, count);
                    setDisplayedCards(res);
                    displayedCardsRef.current = res;
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs ${shuffleCards
                      ? 'bg-purple-100 text-purple-900 border border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40'
                      : 'bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/80'
                    }`}
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>
                    {language === 'zh'
                      ? (shuffleCards ? '每个关卡乱序 (开启)' : '固定顺序')
                      : (shuffleCards ? 'Shuffled' : 'Fixed')}
                  </span>
                </button>

                {shuffleCards && (
                  <button
                    type="button"
                    onClick={() => {
                      const pool = currentRound.cards?.length ? currentRound.cards : (challenge.cardPool || []);
                      const count = currentRound.cardCount || (safeRoundIdx + 2);
                      const res = getCardsForRound(pool, safeRoundIdx, true, count);
                      setDisplayedCards(res);
                      displayedCardsRef.current = res;
                    }}
                    title={language === 'zh' ? '重新打乱' : 'Reshuffle'}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 text-xs font-bold transition-colors shadow-2xs"
                  >
                    <Dices className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>{language === 'zh' ? '洗牌' : 'Reshuffle'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons inside panel */}
            <div className="pt-2 flex items-center gap-2">
              {onCopyChallenge && (
                <button
                  type="button"
                  onClick={() => {
                    clearAllTimers();
                    soundEngine.stopRhythm();
                    soundEngine.stopPreview();
                    onCopyChallenge(challenge);
                  }}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 font-bold text-xs sm:text-sm transition-all shrink-0 shadow-2xs"
                  title={language === 'zh' ? '复制并修改此挑战' : 'Copy and edit track'}
                >
                  <Copy className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span>{language === 'zh' ? '复制' : 'Copy'}</span>
                </button>
              )}
              {onEditChallenge && (
                <button
                  type="button"
                  onClick={() => {
                    clearAllTimers();
                    soundEngine.stopRhythm();
                    soundEngine.stopPreview();
                    onEditChallenge(challenge);
                  }}
                  className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-purple-600/20 dark:hover:bg-purple-600/30 dark:text-purple-300 dark:border-purple-500/40 font-bold text-xs sm:text-sm transition-all shrink-0 shadow-2xs"
                >
                  <Edit3 className="w-4 h-4 text-indigo-600 dark:text-purple-400" />
                  <span>{language === 'zh' ? '修改挑战' : 'Edit Track'}</span>
                </button>
              )}
              <button
                onClick={startGame}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-black text-sm sm:text-base shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{language === 'zh' ? '开始挑战 (按空格键)' : 'START CHALLENGE'}</span>
              </button>
            </div>
          </div>
        )}

        {/* In-Game Interactive Prompt */}
        {gameState === 'playing' && (
          <div className="mt-4 text-center text-xs text-slate-600 dark:text-slate-400 font-semibold">
            <span>
              {language === 'zh'
                ? '卡准鼓点报出高亮词汇 (敲击空格键 / 触屏 / 开麦皆可判定)'
                : 'Shout or tap when the card flashes! (Mic or Spacebar supported)'}
            </span>
          </div>
        )}
      </div>

      {/* Mic Volume Level Bar */}
      {isMicActive && (
        <div className="max-w-xs mx-auto w-full mb-3 flex items-center gap-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5">
          <Mic className={`w-3.5 h-3.5 ${voiceSpokeRecent ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-500'}`} />
          <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-75"
              style={{ width: `${Math.min(100, micVolume * 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400">
            {voiceSpokeRecent ? (language === 'zh' ? '发声' : 'Voice') : (language === 'zh' ? '音量' : 'Level')}
          </span>
        </div>
      )}

      {/* Bottom Control Bar */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between gap-4 pt-2">
        <button
          onClick={() => {
            clearAllTimers();
            soundEngine.stopRhythm();
            soundEngine.stopPreview();
            onBackToMenu();
          }}
          className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          {language === 'zh' ? '← 返回挑战库' : '← Challenges'}
        </button>

        <div className="flex items-center gap-3">
          {(gameState === 'playing' || gameState === 'intro') && (
            <button
              onClick={restartGame}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'zh' ? '重新开始本关' : 'Restart Level'}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
          <span>{language === 'zh' ? '准确率:' : 'Accuracy:'}</span>
          <span className="font-mono-numeric font-bold text-slate-900 dark:text-white">
            {accuracy}%
          </span>
        </div>
      </div>

      {/* ALL CLEAR VICTORY MODAL */}
      {gameState === 'allClear' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="max-w-md w-full bg-white dark:bg-slate-950 border-2 border-amber-400/60 rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-amber-500/20">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/30 mb-4 animate-bounce">
              🏆
            </div>

            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
              {language === 'zh' ? `恭喜全部 ${totalRounds} 关通关!` : 'ALL LEVELS CLEARED!'}
            </h3>
            <p className="text-sm text-amber-600 dark:text-amber-400 font-semibold mb-4">
              {language === 'zh' ? '你的嘴速与节奏感已达封神水准！' : 'Godlike Rhythm Master on TikTok!'}
            </p>

            {/* Ad Frequency & Games Progress Badge */}
            <div className="mb-6 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-pink-500 shrink-0" />
              <span>{language === 'zh' ? '已完成:' : 'Finished:'}</span>
              <span className="font-bold text-pink-500 font-mono">{gamesCompletedCount} {language === 'zh' ? '局' : 'games'}</span>
              <span>•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {language === 'zh'
                  ? `广告进度: ${((gamesCompletedCount - 1) % 4) + 1}/4`
                  : `Ad: ${((gamesCompletedCount - 1) % 4) + 1}/4`}
              </span>
            </div>

            {/* Action Buttons */}

            <div className="flex flex-col gap-2.5">
              <button
                onClick={restartGame}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white font-black text-sm shadow-xl shadow-pink-500/30 hover:scale-[1.02] transition-transform"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{language === 'zh' ? '再次挑战' : 'Play Again'}</span>
              </button>

              <button
                onClick={() => {
                  clearAllTimers();
                  soundEngine.stopRhythm();
                  soundEngine.stopPreview();
                  onBackToMenu();
                }}
                className="w-full py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm border border-slate-300 dark:border-slate-800 transition-colors"
              >
                {language === 'zh' ? '选择其他挑战' : 'Choose Another Challenge'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google AdSense Interstitial Modal (Every 4 completed games) */}
      <AdModal
        isOpen={showAdModal}
        onClose={() => setShowAdModal(false)}
        language={language}
        gamesCompletedCount={gamesCompletedCount}
      />
    </div>
  );
};
