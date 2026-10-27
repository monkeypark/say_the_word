import React, { useState, useEffect } from 'react';
import {
  Save,
  Plus,
  Trash2,
  Play,
  Download,
  Layers,
  Music,
  Gauge,
  Image as ImageIcon,
  Copy,
  Type,
  Check,
  RotateCcw,
  Clock,
  Square,
  Shuffle,
  ArrowRight,
  ArrowLeft,
  Sliders,
  CheckCircle2,
  HelpCircle,
  Volume2,
  Flame,
  FileText,
  Dices,
  Upload,
  Sparkles,
  X,
  Grid,
  Tag,
  Edit3,
  Wand2
} from 'lucide-react';
import { Challenge, RoundConfig, SoundPackType, CardItem, IntroStyleType, CardModeType } from '../types/game';
import { DEFAULT_CHALLENGES } from '../data/defaultChallenges';
import { soundEngine } from '../services/soundEngine';

interface ChallengeCreatorProps {
  initialChallenge?: Challenge | null;
  onSave: (challenge: Challenge) => void;
  onPlayDirectly: (challenge: Challenge) => void;
  language: 'zh' | 'en';
  onCancel: () => void;
}

const DEFAULT_CARD_COLORS = [
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#f97316', // Orange
];

export interface WordPresetCategory {
  id: string;
  labelZh: string;
  labelEn: string;
  icon: string;
  gradient: string;
  words: { word: string; subtext?: string }[];
}

export const WORD_PRESETS: WordPresetCategory[] = [
  {
    id: 'chinese-nov',
    labelZh: '中文科11月',
    labelEn: 'Chinese Nov',
    icon: '📚',
    gradient: 'from-blue-500/20 to-teal-500/20 border-teal-500/40 text-teal-700 dark:text-teal-300',
    words: [
      { word: '王' },
      { word: '方' },
      { word: '青' },
      { word: '清' },
      { word: '气' },
      { word: '晴' },
      { word: '情' },
      { word: '请' },
      { word: '生' },
      { word: '字' },
      { word: '左' },
      { word: '右' },
    ],
  },
  {
    id: 'fruits',
    labelZh: '水果派对',
    labelEn: 'Fruits',
    icon: '🍎',
    gradient: 'from-pink-500/20 to-rose-500/20 border-rose-500/40 text-rose-700 dark:text-rose-300',
    words: [
      { word: '苹果' },
      { word: '香蕉' },
      { word: '西瓜' },
      { word: '草莓' },
      { word: '葡萄' },
      { word: '樱桃' },
      { word: '芒果' },
      { word: '水蜜桃' },
    ],
  },
  {
    id: 'animals',
    labelZh: '疯狂动物',
    labelEn: 'Animals',
    icon: '🐱',
    gradient: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-700 dark:text-amber-300',
    words: [
      { word: '小猫' },
      { word: '小狗' },
      { word: '大熊猫' },
      { word: '老虎' },
      { word: '兔子' },
      { word: '树袋熊' },
      { word: '狮子' },
      { word: '小猴子' },
    ],
  },
  {
    id: 'food',
    labelZh: '舌尖美食',
    labelEn: 'Food',
    icon: '🍜',
    gradient: 'from-orange-500/20 to-red-500/20 border-orange-500/40 text-orange-700 dark:text-orange-300',
    words: [
      { word: '麻辣火锅' },
      { word: '珍珠奶茶' },
      { word: '碳烤生蚝' },
      { word: '手工水饺' },
      { word: '香脆炸鸡' },
      { word: '芝士披萨' },
      { word: '双层汉堡' },
      { word: '日式拉面' },
    ],
  },
  {
    id: 'idioms',
    labelZh: '经典成语',
    labelEn: 'Idioms',
    icon: '🎭',
    gradient: 'from-purple-500/20 to-indigo-500/20 border-purple-500/40 text-purple-700 dark:text-purple-300',
    words: [
      { word: '一马当先' },
      { word: '二龙腾飞' },
      { word: '三阳开泰' },
      { word: '四季平安' },
      { word: '五福临门' },
      { word: '六六大顺' },
      { word: '七星高照' },
      { word: '八方来财' },
    ],
  },
  {
    id: 'memes',
    labelZh: '爆笑热梗',
    labelEn: 'Viral Memes',
    icon: '⚡',
    gradient: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300',
    words: [
      { word: '尊嘟假嘟' },
      { word: '绝绝子' },
      { word: '泰裤辣' },
      { word: '显眼包' },
      { word: '挖呀挖' },
      { word: '恐龙抗狼' },
      { word: '奥利给' },
      { word: '栓Q' },
    ],
  },
  {
    id: 'english',
    labelZh: '潮流英文',
    labelEn: 'English Beat',
    icon: '🌍',
    gradient: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-700 dark:text-cyan-300',
    words: [
      { word: 'DANCE' },
      { word: 'FIRE' },
      { word: 'SUPER' },
      { word: 'LUCKY' },
      { word: 'PARTY' },
      { word: 'DREAM' },
      { word: 'MAGIC' },
      { word: 'CHILL' },
    ],
  },
];



const SOUND_PACK_INFO: Record<SoundPackType, {
  nameZh: string;
  nameEn: string;
  tagZh: string;
  tagEn: string;
  descZh: string;
  descEn: string;
  vibeZh: string;
  vibeEn: string;
  icon: string;
  gradient: string;
}> = {
  whistle: {
    nameZh: 'Viral Whistle (经典口哨伴奏)',
    nameEn: 'Viral Whistle (Classic)',
    tagZh: 'TikTok 爆款',
    tagEn: 'Viral Classic',
    descZh: '清脆动听的标志性口哨旋律，卡点明确，适合所有玩家！',
    descEn: 'Iconic whistling melody with crisp beats and joyful rhythm.',
    vibeZh: '欢快动听 · 经典洗脑',
    vibeEn: 'Catchy & Upbeat',
    icon: '🎵',
    gradient: 'from-pink-500/20 to-purple-500/20 border-pink-500/40 text-pink-700 dark:text-pink-300'
  },
  trap: {
    nameZh: 'Trap Beat (808 重低音)',
    nameEn: 'Trap Beat (808 Bass)',
    tagZh: '街头潮流',
    tagEn: 'Hip-Hop Trap',
    descZh: '强力 808 饱满底鼓与密集滚击踩镲，低音轰头，派对炸场！',
    descEn: 'Heavy 808 sub-bass, punchy kicks, and rolling hi-hats.',
    vibeZh: '重低音 · 潮流炸场',
    vibeEn: 'Heavy Bass & Energy',
    icon: '🔥',
    gradient: 'from-amber-500/20 to-orange-500/20 border-orange-500/40 text-amber-700 dark:text-amber-300'
  },
  drill: {
    nameZh: 'UK Drill (滑音滑轨)',
    nameEn: 'UK Drill (Sliding 808)',
    tagZh: '硬核滑音',
    tagEn: 'UK Drill Vibes',
    descZh: '标志性 808 滑音与切分碎拍，张力十足的高难度挑战！',
    descEn: 'Gliding 808 bass slides and syncopated snare bounces.',
    vibeZh: '极限切分 · 节奏张力',
    vibeEn: 'Dark & Fast-Paced',
    icon: '⚡',
    gradient: 'from-violet-500/20 to-indigo-500/20 border-violet-500/40 text-violet-700 dark:text-violet-300'
  },
  arcade: {
    nameZh: '8-Bit Arcade (复古街机电音)',
    nameEn: '8-Bit Arcade (Retro Synth)',
    tagZh: '像素复古',
    tagEn: 'Chiptune Retro',
    descZh: '80年代芯片合成器电子乐，欢快跳跃，满满红白机怀旧感！',
    descEn: 'Nostalgic 8-bit chip melodies and bouncing square-wave beats.',
    vibeZh: '怀旧红白机 · 趣味跳跃',
    vibeEn: 'Retro Gaming Fun',
    icon: '🕹️',
    gradient: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-700 dark:text-cyan-300'
  },
  funk: {
    nameZh: 'Funky Bass (律动贝斯)',
    nameEn: 'Funky Bass (Groove)',
    tagZh: '放克律动',
    tagEn: 'Groovy Funk',
    descZh: '律动感极强的击弦放克贝斯与迪斯科节拍，身体忍不住摇摆！',
    descEn: 'Bouncy slap-bass lines and infectious disco swing rhythms.',
    vibeZh: '放克摇摆 · 热情派对',
    vibeEn: 'Party Groove',
    icon: '🎸',
    gradient: 'from-amber-500/20 to-yellow-500/20 border-amber-500/40 text-amber-700 dark:text-amber-300'
  },
  jersey: {
    nameZh: 'Jersey Club (极速连击)',
    nameEn: 'Jersey Club (Fast Bounce)',
    tagZh: '极速高燃',
    tagEn: 'Jersey Club',
    descZh: '跳跃感三连音底鼓与清脆拍击，高燃连击节奏！',
    descEn: 'Fast syncopated kick rolls and bouncy club energy.',
    vibeZh: '高频轰炸 · 极速卡点',
    vibeEn: 'High-Tempo & Bounce',
    icon: '👟',
    gradient: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
  },
  lofi: {
    nameZh: 'Chill Lofi (舒缓暖调)',
    nameEn: 'Chill Lofi (Warm Rhodes)',
    tagZh: '暖调微醺',
    tagEn: 'Lofi Relax',
    descZh: '温暖微醺电钢琴与慢拍低保真鼓点，适合练词与轻松挑战！',
    descEn: 'Warm vintage electric piano and relaxed hip-hop groove.',
    vibeZh: '微醺舒适 · 稳步跟拍',
    vibeEn: 'Warm & Mellow',
    icon: '☕',
    gradient: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/40 text-indigo-700 dark:text-indigo-300'
  }
};

const RANDOM_TITLES = [
  '🔥 狂暴手速卡点大挑战',
  '⚡ 极速心跳四连击',
  '🍎 魔性水果卡点狂欢',
  '🐱 动物家族急速派对',
  '🎯 纯文字成语极限接招',
  '🚀 赛博朋克超速节奏',
  '🍔 美食大乱斗卡点战'
];

const shuffleCardsArray = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const ChallengeCreator: React.FC<ChallengeCreatorProps> = ({
  initialChallenge,
  onSave,
  onPlayDirectly,
  language,
  onCancel,
}) => {
  // WIZARD STEP: 1 = Card Pool, 2 = Level Hierarchy, 3 = Challenge Info & Music
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Challenge Identity & Basic Info - Default to match Bala Bala Beat style
  const defaultTrack = DEFAULT_CHALLENGES[0];
  const [title, setTitle] = useState(
    initialChallenge?.title || (language === 'zh' ? '🔥 巴拉巴拉魔性自制挑战' : '🔥 Bala Bala Custom Beat')
  );
  const [description, setDescription] = useState(
    initialChallenge?.description ||
    (language === 'zh'
      ? '跟随专属巴拉巴拉洗脑口哨节奏，在重拍节拍点精准喊出卡片词语！'
      : 'Shout the word on beat with the viral Bala Bala whistle music!')
  );
  const [category, setCategory] = useState(initialChallenge?.category || 'Custom');

  // Music & Intro Settings (Default to 🔥 巴拉巴拉魔性洗脑 beat.mp3 music)
  const [soundPack, setSoundPack] = useState<SoundPackType>(initialChallenge?.soundPack || 'drill');
  const [customAudioUrl, setCustomAudioUrl] = useState<string | undefined>(initialChallenge?.customAudioUrl || '/assets/music/beat.mp3');
  const [audioFileName, setAudioFileName] = useState<string | undefined>(initialChallenge?.audioFileName || 'beat.mp3');
  const [audioOffsetSec, setAudioOffsetSec] = useState<number>(
    initialChallenge?.audioOffsetSec !== undefined ? initialChallenge.audioOffsetSec : 2.626
  );
  const [isPlayingCustomAudio, setIsPlayingCustomAudio] = useState(false);
  const [introStyle] = useState<IntroStyleType>(initialChallenge?.introStyle || 'quick_8');
  const [shuffleCards, setShuffleCards] = useState<boolean>(
    initialChallenge?.shuffleCards !== undefined ? initialChallenge.shuffleCards : true
  );

  // Progression Settings
  const [startBpm, setStartBpm] = useState<number | string>(initialChallenge?.rounds[0]?.bpm || 160);

  // Step 1: Card Vocabulary Pool State - Default to Bala Bala preset cards
  const [cardPool, setCardPool] = useState<CardItem[]>(
    initialChallenge?.cardPool && initialChallenge.cardPool.length > 0
      ? initialChallenge.cardPool
      : initialChallenge?.rounds?.[0]?.cards && initialChallenge.rounds[0].cards.length > 0
        ? initialChallenge.rounds[0].cards
        : defaultTrack?.cardPool || []
  );

  // Step 2: Levels State - Default to match Bala Bala Beat levels
  const [rounds, setRounds] = useState<RoundConfig[]>(
    initialChallenge?.rounds?.map((r, idx) => ({
      ...r,
      roundNumber: idx + 1,
      cardCount: r.cardCount !== undefined ? r.cardCount : (r.cards?.length || 8),
      loopCount: 2,
    })) || [
      {
        roundNumber: 1,
        name: language === 'zh' ? '第 1 关: 慢速试温' : 'Level 1: Warmup',
        bpm: 160,
        loopCount: 2,
        textOnly: false,
        cards: defaultTrack?.rounds?.[0]?.cards || [],
        cardCount: 8,
      },
      {
        roundNumber: 2,
        name: language === 'zh' ? '第 2 关: 节奏拉满' : 'Level 2: Speed Up',
        bpm: 160,
        loopCount: 2,
        textOnly: false,
        cards: defaultTrack?.rounds?.[1]?.cards || [],
        cardCount: 8,
      },
    ]
  );

  const [activeRoundIndex, setActiveRoundIndex] = useState(0);

  // Audio Preview & Audition State
  const [isPlayingSoundPackPreview, setIsPlayingSoundPackPreview] = useState(false);

  // Batch Add Words Modal/Drawer State
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchWordsText, setBatchWordsText] = useState('');

  // Quick Input & Fast Tag Management
  const [quickInputText, setQuickInputText] = useState('');
  const [viewMode, setViewMode] = useState<'chips' | 'cards'>('chips');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);



  // Stop sound on unmount
  useEffect(() => {
    return () => {
      soundEngine.stopPreview();
    };
  }, []);

  // Sync if initialChallenge changes
  useEffect(() => {
    if (initialChallenge) {
      setTitle(initialChallenge.title || '');
      setDescription(initialChallenge.description || '');
      setCategory(initialChallenge.category || 'Custom');
      setSoundPack(initialChallenge.soundPack || 'whistle');
      setCustomAudioUrl(initialChallenge.customAudioUrl);
      setAudioFileName(initialChallenge.audioFileName);
      setAudioOffsetSec(initialChallenge.audioOffsetSec || 0);
      setShuffleCards(initialChallenge.shuffleCards !== undefined ? initialChallenge.shuffleCards : true);
      if (initialChallenge.cardPool && initialChallenge.cardPool.length > 0) {
        setCardPool(initialChallenge.cardPool);
      } else if (initialChallenge.rounds?.[0]?.cards) {
        setCardPool(initialChallenge.rounds[0].cards);
      }
      if (initialChallenge.rounds && initialChallenge.rounds.length > 0) {
        setRounds(
          initialChallenge.rounds.map((r, idx) => ({
            ...r,
            roundNumber: idx + 1,
            cardCount: r.cardCount !== undefined ? r.cardCount : 4,
            loopCount: 2,
          }))
        );
        setStartBpm(initialChallenge.rounds[0].bpm || 160);
      }
    }
  }, [initialChallenge]);

  // Re-apply BPM globally to all rounds
  const handleApplyGlobalProgression = () => {
    const baseBpm = typeof startBpm === 'number' ? startBpm : (parseInt(startBpm as any) || 160);
    setRounds((prev) =>
      prev.map((r) => ({
        ...r,
        bpm: Math.min(260, Math.max(40, baseBpm)),
      }))
    );
  };

  // --- Step 1: Card Pool Management Handlers ---
  const handleAddCardToPool = () => {
    const newCard: CardItem = {
      id: `card_${Date.now()}_${cardPool.length}`,
      word: '',
      subtext: '',
      emoji: '',
      color: DEFAULT_CARD_COLORS[cardPool.length % DEFAULT_CARD_COLORS.length],
      cardMode: 'text',
    };
    setCardPool([...cardPool, newCard]);
  };

  // Instant quick add from top input bar (supports comma, space, newline multi-word split)
  const handleQuickAddWords = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const words = trimmed
      .split(/[\n,，;；\s]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    if (words.length === 0) return;

    const newCards: CardItem[] = words.map((word, idx) => ({
      id: `card_${Date.now()}_${cardPool.length + idx}`,
      word,
      subtext: '',
      emoji: '',
      color: DEFAULT_CARD_COLORS[(cardPool.length + idx) % DEFAULT_CARD_COLORS.length],
      cardMode: 'text',
    }));

    setCardPool([...cardPool, ...newCards]);
    setQuickInputText('');
  };

  // 1-Click apply category presets
  const handleApplyPreset = (presetWords: { word: string; subtext?: string }[]) => {
    const newCards: CardItem[] = presetWords.map((item, idx) => ({
      id: `preset_${Date.now()}_${cardPool.length + idx}`,
      word: item.word,
      subtext: item.subtext || '',
      emoji: '',
      color: DEFAULT_CARD_COLORS[(cardPool.length + idx) % DEFAULT_CARD_COLORS.length],
      cardMode: 'text',
    }));
    setCardPool([...cardPool, ...newCards]);
  };

  // Clear pool
  const handleClearPool = () => {
    if (cardPool.length === 0) return;
    if (window.confirm(language === 'zh' ? '确定清空词库中的所有文字吗？' : 'Clear all words in the pool?')) {
      setCardPool([]);
    }
  };

  // Cycle color with 1 click
  const handleCycleCardColor = (cardIdx: number) => {
    const currentColor = cardPool[cardIdx].color || DEFAULT_CARD_COLORS[0];
    const currentIndex = DEFAULT_CARD_COLORS.indexOf(currentColor);
    const nextColor = DEFAULT_CARD_COLORS[(currentIndex + 1) % DEFAULT_CARD_COLORS.length];
    handlePoolCardChange(cardIdx, 'color', nextColor);
  };

  const handleDuplicateCard = (cIdx: number) => {
    const target = cardPool[cIdx];
    const duplicated: CardItem = {
      ...target,
      id: `card_${Date.now()}_${cardPool.length}`,
      word: target.word ? `${target.word} 2` : '',
    };
    const nextList = [...cardPool];
    nextList.splice(cIdx + 1, 0, duplicated);
    setCardPool(nextList);
  };

  const handleRemoveCardFromPool = (cardIdx: number) => {
    setCardPool(cardPool.filter((_, i) => i !== cardIdx));
  };

  const handlePoolCardChange = (cardIdx: number, field: keyof CardItem, value: any) => {
    setCardPool((prev) => {
      const updated = [...prev];
      updated[cardIdx] = {
        ...updated[cardIdx],
        [field]: value,
      };
      return updated;
    });
  };

  const handlePoolCardImageUpload = (cardIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert(language === 'zh' ? '上传图片请小于 2MB' : 'Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      handlePoolCardChange(cardIdx, 'imageUrl', base64);
    };
    reader.readAsDataURL(file);
  };

  // Batch add words from text
  const handleExecuteBatchAdd = () => {
    if (!batchWordsText.trim()) return;
    const words = batchWordsText
      .split(/[\n,，\s]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    if (words.length === 0) return;

    const newCards: CardItem[] = words.map((word, idx) => ({
      id: `batch_${Date.now()}_${idx}`,
      word,
      subtext: '',
      emoji: '',
      color: DEFAULT_CARD_COLORS[(cardPool.length + idx) % DEFAULT_CARD_COLORS.length],
      cardMode: 'text',
    }));

    setCardPool([...cardPool, ...newCards]);
    setBatchWordsText('');
    setIsBatchModalOpen(false);
  };

  // Shuffle card pool
  const handleShufflePool = () => {
    setCardPool(shuffleCardsArray(cardPool));
  };

  // --- Step 2: Levels Management Handlers ---
  const handleAddRound = () => {
    const nextRoundNum = rounds.length + 1;
    const baseBpm = typeof startBpm === 'number' ? startBpm : (parseInt(startBpm as any) || 160);
    const newRound: RoundConfig = {
      roundNumber: nextRoundNum,
      name: language === 'zh' ? `第 ${nextRoundNum} 关: 进阶冲刺` : `Level ${nextRoundNum}`,
      bpm: baseBpm,
      loopCount: 2,
      textOnly: false,
      cards: [],
      cardCount: 8,
    };
    setRounds([...rounds, newRound]);
    setActiveRoundIndex(rounds.length);
  };

  const handleDeleteRound = (idx: number) => {
    if (rounds.length <= 1) {
      alert(language === 'zh' ? '至少需要保留 1 个关卡！' : 'Must keep at least 1 level');
      return;
    }
    const filtered = rounds.filter((_, i) => i !== idx).map((r, i) => ({
      ...r,
      roundNumber: i + 1,
    }));
    setRounds(filtered);
    setActiveRoundIndex(Math.max(0, idx - 1));
  };

  const handleSetNumberOfRounds = (count: number) => {
    const baseBpm = typeof startBpm === 'number' ? startBpm : (parseInt(startBpm as any) || 160);
    const newRounds: RoundConfig[] = Array.from({ length: count }, (_, i) => {
      const existing = rounds[i];
      const rNum = i + 1;
      return {
        roundNumber: rNum,
        name: existing?.name || (language === 'zh' ? `第 ${rNum} 关` : `Level ${rNum}`),
        bpm: existing?.bpm || baseBpm,
        loopCount: 2,
        textOnly: false,
        cards: [],
        cardCount: existing?.cardCount || 8,
      };
    });
    setRounds(newRounds);
  };

  // --- Final Challenge Builder ---
  const buildChallengeObject = (): Challenge => {
    const pool =
      cardPool.length > 0
        ? cardPool
        : [{ id: 'c1', word: '苹果', subtext: 'Apple', emoji: '🍎', color: '#ef4444' }];

    let accumulatedCards: CardItem[] = [];
    const builtRounds: RoundConfig[] = rounds.map((r, idx) => {
      const targetCount = r.cardCount !== undefined ? r.cardCount : 4;

      if (idx === 0) {
        const poolCopy = [...pool];
        while (poolCopy.length < targetCount && poolCopy.length > 0) {
          poolCopy.push(...pool);
        }
        const shuffled = shuffleCardsArray(poolCopy);
        accumulatedCards = shuffled.slice(0, targetCount);
      } else {
        const existingIds = new Set(accumulatedCards.map((c) => c.id));
        const remainingPool = pool.filter((c) => !existingIds.has(c.id));

        let currentRoundCards = [...accumulatedCards];
        if (currentRoundCards.length < targetCount) {
          const needed = targetCount - currentRoundCards.length;
          const shuffledRemaining = shuffleCardsArray(remainingPool.length > 0 ? remainingPool : pool);
          currentRoundCards.push(...shuffledRemaining.slice(0, needed));
        } else {
          if (remainingPool.length > 0) {
            const newCard = remainingPool[Math.floor(Math.random() * remainingPool.length)];
            currentRoundCards[Math.floor(Math.random() * currentRoundCards.length)] = newCard;
          }
        }
        accumulatedCards = currentRoundCards;
      }

      return {
        ...r,
        roundNumber: idx + 1,
        cards: shuffleCards ? shuffleCardsArray([...accumulatedCards]) : [...accumulatedCards],
      };
    });

    return {
      id: initialChallenge?.id || 'custom-' + Date.now(),
      title: title.trim() || (language === 'zh' ? '🔥 巴拉巴拉魔性自制挑战' : '🔥 Bala Bala Custom Beat'),
      description: description.trim() || (language === 'zh' ? '跟随专属巴拉巴拉洗脑口哨节奏，在重拍节拍点精准喊出卡片词语！' : 'Shout the word on beat with the viral Bala Bala whistle music!'),
      category: category || 'Custom',
      soundPack: 'drill',
      customAudioUrl: '/assets/music/beat.mp3',
      audioFileName: 'beat.mp3',
      audioOffsetSec: 2.626,
      introDurationSec: 2.626,
      audioLoopEndSec: 5.251,
      baseBpm: 182.8,
      introStyle: 'quick_8',
      shuffleCards,
      isCustom: true,
      cardPool: pool,
      rounds: builtRounds,
      createdAt: initialChallenge?.createdAt || Date.now(),
    };
  };



  // Export JSON file
  const handleExportJson = () => {
    const obj = buildChallengeObject();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(obj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${title.replace(/\s+/g, '_')}_beat_challenge.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Copy Challenge JSON to clipboard
  const [hasCopiedJson, setHasCopiedJson] = useState(false);
  const handleCopyJson = () => {
    const obj = buildChallengeObject();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
        setHasCopiedJson(true);
        setTimeout(() => setHasCopiedJson(false), 2000);
      }
    } catch (_) {
      alert(language === 'zh' ? '复制失败，请使用导出' : 'Copy failed, please export');
    }
  };

  // Random title generator
  const handleRandomTitle = () => {
    const randomPick = RANDOM_TITLES[Math.floor(Math.random() * RANDOM_TITLES.length)];
    setTitle(randomPick);
  };

  // Validation before going to next steps
  const handleGoToStep = (step: 1 | 2 | 3) => {
    if (step > 1 && cardPool.length < 2) {
      alert(language === 'zh' ? '卡片词库池至少需要保留 2 张卡片才能进入下一步！' : 'Please keep at least 2 cards in the pool!');
      return;
    }
    // Stop audio preview when changing step
    if (isPlayingSoundPackPreview) {
      soundEngine.stopPreview();
      setIsPlayingSoundPackPreview(false);
    }
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Speed level badge helper
  const getBpmBadge = (bpm: number) => {
    if (bpm < 100) return { label: language === 'zh' ? '轻松热身' : 'Warmup', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (bpm <= 125) return { label: language === 'zh' ? '动感常速' : 'Groove', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
    if (bpm <= 145) return { label: language === 'zh' ? '高速激战' : 'Speedy', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    if (bpm <= 170) return { label: language === 'zh' ? '极限手速' : 'Extreme', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
    return { label: language === 'zh' ? '疯狂神手' : 'Insane', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-32">
      {/* Top Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {language === 'zh' ? '创作自定义卡点挑战' : 'Custom Challenge Creator'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-600 border border-pink-200 text-xs font-black uppercase tracking-wider">
              向导模式
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-500 mt-1.5">
            {language === 'zh'
              ? '三步极简向导：构建卡片词库池 ➔ 配置关卡速度层级 ➔ 挑选伴奏与基础资料！'
              : '3-Step Wizard: Build Card Pool ➔ Configure Levels Hierarchy ➔ Challenge Info & Music Soundtrack!'}
          </p>
        </div>

        {/* Sleek compact step indicator in top header */}
        <div className="flex items-center gap-3 bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-2xl">
          <div className="flex flex-col text-right">
            <span className="text-xs font-black text-pink-600">
              {language === 'zh' ? `步骤 ${currentStep} / 3` : `Step ${currentStep} of 3`}
            </span>
            <span className="text-[11px] text-slate-600 dark:text-slate-500 font-medium">
              {currentStep === 1
                ? (language === 'zh' ? '卡片词库池' : 'Card Pool')
                : currentStep === 2
                  ? (language === 'zh' ? '关卡层级配置' : 'Level Progression')
                  : (language === 'zh' ? '基础信息与音乐' : 'Music & Info')}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => handleGoToStep(step as 1 | 2 | 3)}
                className={`h-2.5 rounded-full transition-all duration-300 ${currentStep === step
                    ? 'w-7 bg-pink-500 shadow-sm shadow-pink-500/50'
                    : currentStep > step
                      ? 'w-3 bg-emerald-500 hover:opacity-80'
                      : 'w-3 bg-slate-300 hover:bg-slate-400'
                  }`}
                title={language === 'zh' ? `跳转至第 ${step} 步` : `Go to step ${step}`}
              />
            ))}
          </div>
        </div>
      </div>



      {/* ========================================================================================= */}
      {/* STEP 1: WORD VOCABULARY POOL (第 1 步：建文字词库池) */}
      {/* ========================================================================================= */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-fadeIn">
          {/* Step 1 Introduction & Quick Actions */}
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm dark:shadow-xl space-y-5 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-pink-500 flex items-center justify-center text-white text-xs font-black shadow-md shadow-pink-500/30">
                    1
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    {language === 'zh' ? '构建文字词库池 (Word Pool)' : 'Build Word Vocabulary Pool'}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-500 dark:text-slate-400 mt-1">
                  {language === 'zh'
                    ? '卡点挑战的核心是文字词库。输入文字按回车快速录入，或直接粘贴多词自动切分，也可以点击分类一键导入！'
                    : 'The foundation of the game! Type words and hit Enter, paste multiple words to auto-split, or click presets below!'}
                </p>
              </div>

              {/* View Switcher & Word Count Badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-300 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setViewMode('chips')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'chips'
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>{language === 'zh' ? '快速标签' : 'Fast Tags'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('cards')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'cards'
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>{language === 'zh' ? '详细卡片' : 'Detail Cards'}</span>
                  </button>
                </div>

                <div
                  className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 ${cardPool.length < 2
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      : cardPool.length >= 8
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                    }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {language === 'zh'
                      ? `${cardPool.length} 个词 ${cardPool.length < 2 ? '(需≥2个)' : cardPool.length >= 8 ? '(超丰富)' : ''}`
                      : `${cardPool.length} words`}
                  </span>
                </div>
              </div>
            </div>

            {/* HERO FAST INPUT BAR (Simple, Snappy, Effective) */}
            <div className="relative">
              <div className="flex items-center gap-2 bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800 hover:border-pink-500/50 focus-within:border-pink-500 rounded-2xl p-2 transition-all shadow-inner">
                <div className="pl-2 text-pink-600 dark:text-pink-400">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <input
                  type="text"
                  value={quickInputText}
                  onChange={(e) => setQuickInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleQuickAddWords(quickInputText);
                    }
                  }}
                  placeholder={
                    language === 'zh'
                      ? '💡 输入词语按回车秒添加，或直接粘贴多词（空格/逗号自动切分，如：西瓜 苹果 草莓 香蕉）...'
                      : '💡 Type word & hit Enter, or paste multiple words (auto-splits by space/comma)...'
                  }
                  className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none px-2 font-medium"
                />
                <button
                  type="button"
                  onClick={() => handleQuickAddWords(quickInputText)}
                  disabled={!quickInputText.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'zh' ? '添加词语' : 'Add'}</span>
                  <span className="hidden sm:inline-block text-[10px] bg-pink-100 dark:bg-black/30 px-1.5 py-0.5 rounded text-pink-800 dark:text-pink-200">
                    ↵ Enter
                  </span>
                </button>
              </div>
            </div>

            {/* 1-CLICK CATEGORY INSPIRATION PRESETS */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-bold px-1">
                <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>{language === 'zh' ? '一键灵感词库 (点击直接填入 8 个热词):' : '1-Click Presets (8 Words Each):'}</span>
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-500 hidden sm:inline">
                  {language === 'zh' ? '点击可多次添加，丰富词库' : 'Click to append words'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {WORD_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset.words)}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border bg-gradient-to-br ${preset.gradient} hover:scale-105 active:scale-95 transition-all text-xs font-black shadow-sm group`}
                  >
                    <span className="text-base group-hover:scale-125 transition-transform">{preset.icon}</span>
                    <span>{language === 'zh' ? preset.labelZh : preset.labelEn}</span>
                    <Plus className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Action Toolbar (Batch, Shuffle, Clear, Empty Card) */}
            <div className="pt-3 border-t border-slate-300 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-300 dark:border-indigo-500/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{language === 'zh' ? '多行文本批量导入' : 'Multi-Line Batch Import'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddCardToPool}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                  <span>{language === 'zh' ? '添加空白卡' : 'Add Blank Card'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={handleShufflePool}
                  disabled={cardPool.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 hover:border-purple-500/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 disabled:opacity-40 text-xs font-bold transition-all shadow-sm"
                  title="Shuffle words in pool"
                >
                  <Shuffle className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>{language === 'zh' ? '打乱顺序' : 'Shuffle'}</span>
                </button>

                {cardPool.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearPool}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 hover:border-rose-500/40 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold transition-all shadow-sm"
                    title="Clear all words"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span>{language === 'zh' ? '清空' : 'Clear'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Batch Words Input Modal / Expandable Box */}
          {isBatchModalOpen && (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-indigo-500/50 shadow-2xl animate-fadeIn space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{language === 'zh' ? '多行文本批量导入' : 'Multi-Line Batch Importer'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {language === 'zh'
                  ? '粘贴多组词语，支持逗号、空格或换行隔开（例如：“成语接龙, 一心一意, 双喜临门, 三阳开泰”），将自动批量生成文字！'
                  : 'Paste words separated by commas, spaces, or line breaks. We will automatically generate cards for each item!'}
              </p>
              <textarea
                value={batchWordsText}
                onChange={(e) => setBatchWordsText(e.target.value)}
                rows={4}
                placeholder={
                  language === 'zh'
                    ? '苹果, 香蕉, 西瓜, 草莓, 葡萄, 樱桃, 芒果, 蜜桃...'
                    : 'Apple, Banana, Watermelon, Cherry...'
                }
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white placeholder-slate-600 focus:outline-none focus:border-indigo-400 font-mono"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  {language === 'zh' ? '取消' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleExecuteBatchAdd}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-black text-white shadow-md transition-all"
                >
                  {language === 'zh' ? '一键生成全部文字' : 'Generate Words'}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================================= */}
          {/* WORDS LIST: VIEW MODE A (FAST CHIPS / TAGS) */}
          {/* ========================================================================================= */}
          {viewMode === 'chips' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                    <span>
                      {language === 'zh' ? `文字标签库 (${cardPool.length} 个)` : `Words (${cardPool.length})`}
                    </span>
                  </h3>
                  {cardPool.length < 2 && (
                    <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
                      {language === 'zh' ? '至少需要 2 个文字！' : 'At least 2 words required!'}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {language === 'zh' ? '点击文字可直接修改 · 悬浮可换色/删除' : 'Click word to edit · Hover for color/delete'}
                </span>
              </div>

              {cardPool.length === 0 ? (
                /* Empty state */
                <div className="text-center py-16 px-4 bg-slate-50 dark:bg-slate-900/40 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-3xl">
                  <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/30 text-pink-400 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                    {language === 'zh' ? '词库池还是空的！' : 'Word pool is empty!'}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
                    {language === 'zh'
                      ? '在上方输入框中输入词语按回车，或直接点击预设按钮一键添加 8 个热门文字！'
                      : 'Type words above and hit Enter, or click any preset to fill with 8 curated words!'}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {WORD_PRESETS.slice(0, 3).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleApplyPreset(p.words)}
                        className={`px-4 py-2 rounded-xl text-xs font-black border bg-gradient-to-r ${p.gradient} hover:scale-105 active:scale-95 transition-all shadow-md flex items-center gap-2`}
                      >
                        <span>{p.icon}</span>
                        <span>{language === 'zh' ? `一键导入 ${p.labelZh}` : `Import ${p.labelEn}`}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Chips flow grid */
                <div className="flex flex-wrap gap-2.5 p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800/80 min-h-[160px] content-start">
                  {cardPool.map((card, cIdx) => (
                    <div
                      key={card.id || cIdx}
                      className="group flex items-center gap-2 px-3 py-2 rounded-2xl bg-white dark:bg-slate-950 border-2 transition-all hover:scale-[1.02] shadow-md relative"
                      style={{ borderColor: card.color || '#ec4899' }}
                    >
                      {/* Number badge */}
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-slate-900 dark:text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: card.color || '#ec4899' }}
                      >
                        {cIdx + 1}
                      </span>

                      {/* Word text / Inline edit */}
                      {editingCardId === card.id ? (
                        <input
                          type="text"
                          autoFocus
                          value={card.word}
                          onChange={(e) => handlePoolCardChange(cIdx, 'word', e.target.value)}
                          onBlur={() => setEditingCardId(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              setEditingCardId(null);
                            }
                          }}
                          className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-black text-sm px-2 py-0.5 rounded border border-pink-500 focus:outline-none min-w-[80px]"
                        />
                      ) : (
                        <div
                          onClick={() => setEditingCardId(card.id)}
                          className="cursor-pointer select-none flex flex-col justify-center"
                          title={language === 'zh' ? '点击修改文字' : 'Click to edit'}
                        >
                          <span
                            className="text-sm font-black tracking-wide"
                            style={{ color: card.color || '#ec4899' }}
                          >
                            {card.word || (language === 'zh' ? '空白词' : 'Empty')}
                          </span>
                          {card.subtext && (
                            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium -mt-0.5 truncate max-w-[120px]">
                              {card.subtext}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action buttons (Color cycle, edit, delete) */}
                      <div className="flex items-center gap-1 pl-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        {/* Cycle color */}
                        <button
                          type="button"
                          onClick={() => handleCycleCardColor(cIdx)}
                          className="w-4 h-4 rounded-full border border-white/40 hover:scale-125 transition-transform"
                          style={{ backgroundColor: card.color || '#ec4899' }}
                          title={language === 'zh' ? '切换颜色' : 'Cycle color'}
                        />

                        {/* Edit button */}
                        <button
                          type="button"
                          onClick={() => setEditingCardId(card.id)}
                          className="p-1 rounded text-slate-600 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                          title={language === 'zh' ? '编辑' : 'Edit'}
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveCardFromPool(cIdx)}
                          className="p-1 rounded text-slate-600 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                          title={language === 'zh' ? '删除' : 'Delete'}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Inline quick-add chip at end of list */}
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white dark:bg-slate-950/40 border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-pink-500/40 transition-all">
                    <Plus className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400 shrink-0" />
                    <input
                      type="text"
                      placeholder={language === 'zh' ? '输入新词按回车...' : 'Type word & Enter...'}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value;
                          if (val.trim()) {
                            handleQuickAddWords(val);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                      className="bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-600 focus:outline-none w-28 font-medium"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================================= */}
          {/* WORDS LIST: VIEW MODE B (DETAIL CARDS) */}
          {/* ========================================================================================= */}
          {viewMode === 'cards' && (
            <div>
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Grid className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>
                      {language === 'zh' ? `文字卡片详情 (${cardPool.length} 个)` : `Cards (${cardPool.length})`}
                    </span>
                  </h3>
                  {cardPool.length < 2 && (
                    <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
                      {language === 'zh' ? '词库至少需要 2 个文字！' : 'At least 2 words required!'}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {language === 'zh' ? '可自定义副标题与个性主题色' : 'Customize subtext & colors'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cardPool.map((card, cIdx) => (
                  <div
                    key={card.id || cIdx}
                    className="flex flex-col justify-between p-4 rounded-2xl bg-white dark:bg-slate-950 border-2 transition-all relative group shadow-lg"
                    style={{ borderColor: card.color || '#ec4899' }}
                  >
                    <div>
                      {/* Word header with index, color palette, duplicate & delete */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-slate-900 dark:text-white shadow-sm"
                            style={{ backgroundColor: card.color || '#ec4899' }}
                          >
                            {cIdx + 1}
                          </span>
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                            文字 #{cIdx + 1}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Color swatches */}
                          <div className="flex items-center gap-1">
                            {DEFAULT_CARD_COLORS.slice(0, 4).map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => handlePoolCardChange(cIdx, 'color', c)}
                                className={`w-3.5 h-3.5 rounded-full border transition-transform ${card.color === c ? 'border-white scale-125' : 'border-transparent'
                                  }`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>

                          {/* Duplicate */}
                          <button
                            type="button"
                            onClick={() => handleDuplicateCard(cIdx)}
                            className="flex items-center gap-1 px-1.5 py-1 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 rounded transition-colors text-[11px]"
                            title="Duplicate word"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleRemoveCardFromPool(cIdx)}
                            className="flex items-center gap-1 px-1.5 py-1 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors text-[11px]"
                            title="Delete word"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Word Live Preview Box */}
                      <div
                        className="h-24 flex flex-col items-center justify-center mb-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-300 dark:border-slate-800 text-center px-2 relative"
                        style={{ boxShadow: `inset 0 0 15px ${card.color || '#ec4899'}15` }}
                      >
                        <input
                          type="text"
                          value={card.word}
                          onChange={(e) => handlePoolCardChange(cIdx, 'word', e.target.value)}
                          placeholder={language === 'zh' ? '输入卡点文字' : 'Enter Text'}
                          className="w-full bg-transparent text-center text-lg font-black tracking-tight focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                          style={{ color: card.color || '#ec4899' }}
                        />
                        {card.subtext ? (
                          <span className="text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-full mt-0.5">
                            {card.subtext}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-600 italic">
                            {language === 'zh' ? '卡点高亮大字' : 'Punchy beat word'}
                          </span>
                        )}
                      </div>

                      {/* Subtext input */}
                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                            {language === 'zh' ? '副标题 / 提示拼音 (可选)' : 'Subtext / Hint (Optional)'}
                          </label>
                          <input
                            type="text"
                            value={card.subtext || ''}
                            onChange={(e) => handlePoolCardChange(cIdx, 'subtext', e.target.value)}
                            placeholder={language === 'zh' ? '提示或英文...' : 'Hint...'}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-pink-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* In-Grid Add Word Button */}
                <button
                  type="button"
                  onClick={handleAddCardToPool}
                  className="flex flex-col items-center justify-center min-h-[220px] rounded-2xl bg-white dark:bg-slate-950/60 border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-pink-500/50 text-slate-600 dark:text-slate-500 hover:text-pink-600 dark:hover:text-pink-400 transition-all p-4 group"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 group-hover:bg-pink-500/20 flex items-center justify-center mb-2 transition-colors">
                    <Plus className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-pink-400" />
                  </div>
                  <span className="text-xs font-bold">{language === 'zh' ? '添加空白卡片' : 'Add Card'}</span>
                  <span className="text-[10px] text-slate-600 mt-1">
                    {language === 'zh' ? '扩充词库池' : 'Expand pool'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Step 1 in-flow footer / Next step shortcut */}
          <div className="mt-8 pt-5 border-t border-slate-300 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              {language === 'zh'
                ? `当前文字词库池已就绪 (${cardPool.length} 个文字)`
                : `Word pool ready (${cardPool.length} words)`}
            </span>

            <button
              type="button"
              onClick={() => handleGoToStep(2)}
              disabled={cardPool.length < 2}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs sm:text-sm shadow-lg shadow-pink-500/20 transition-all active:scale-95"
            >
              <span>{language === 'zh' ? '下一步: 配置关卡进阶' : 'Next: Level Setup'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* STEP 2: LEVEL & TIER PROGRESSION CONFIG (第 2 步：关卡层级配置) */}
      {/* ========================================================================================= */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-fadeIn">
          {/* Step 2 Introduction */}
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm dark:shadow-xl space-y-6 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-purple-500 flex items-center justify-center text-white text-xs font-black">
                    2
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    {language === 'zh' ? '关卡流水线 (自定义关卡数)' : 'Levels Pipeline (Custom Levels)'}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-500 dark:text-slate-400 mt-1">
                  {language === 'zh'
                    ? '选择挑战的关卡总数，系统将根据全局规则为您自动生成自定义关卡流水线！'
                    : 'Select total number of levels and customize your challenge progression!'}
                </p>
              </div>
            </div>

            {/* Select Number of Levels (关卡数选择) */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                {language === 'zh' ? '选择关卡数 (Number of Levels)' : 'Select Number of Levels'}
              </label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => {
                  const isSelected = rounds.length === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleSetNumberOfRounds(num)}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${isSelected
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30 ring-2 ring-purple-400/50'
                          : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-700'
                        }`}
                    >
                      {num} {language === 'zh' ? '关' : 'Levels'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Global BPM Setting Bar */}
            <div className="pt-2 space-y-4 border-t border-slate-300 dark:border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>{language === 'zh' ? '全局速度设置' : 'Global Tempo Setting'}</span>
                </span>
                <button
                  type="button"
                  onClick={handleApplyGlobalProgression}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold underline"
                >
                  {language === 'zh' ? '应用速度到所有关卡' : 'Apply to All Rounds'}
                </button>
              </div>

              <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-300 dark:border-slate-800">
                {/* Start BPM */}
                <div className="max-w-xs">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    {language === 'zh' ? '起始速度 (BPM)' : 'Start BPM'}
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="260"
                    placeholder="160"
                    value={startBpm}
                    onChange={(e) => {
                      const valStr = e.target.value;
                      setStartBpm(valStr);
                      if (valStr !== '') {
                        const val = parseInt(valStr);
                        if (!isNaN(val)) {
                          setRounds((prev) =>
                            prev.map((r) => ({
                              ...r,
                              bpm: Math.min(260, Math.max(40, val)),
                            }))
                          );
                        }
                      }
                    }}
                    onBlur={() => {
                      const num = typeof startBpm === 'string' ? parseInt(startBpm) : startBpm;
                      const validBpm = isNaN(num) || num <= 0 ? 160 : Math.min(260, Math.max(40, num));
                      setStartBpm(validBpm);
                      setRounds((prev) =>
                        prev.map((r) => ({
                          ...r,
                          bpm: validBpm,
                        }))
                      );
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                  <span className="text-[10px] text-slate-600 dark:text-slate-500 mt-0.5 block">
                    {language === 'zh' ? '关卡初始速度 (默认 160 BPM)' : 'Default level tempo (Default 160 BPM)'}
                  </span>
                </div>
              </div>

              {/* Shuffle Cards toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/30">
                <div className="flex items-center gap-2">
                  <Shuffle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {language === 'zh' ? '关卡内卡片随机打乱 (Shuffle)' : 'Shuffle Cards Order Per Level'}
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">
                      {language === 'zh'
                        ? '开启后，每关抽选的卡片顺序随机打乱，防止玩家背板记忆'
                        : 'Randomizes order each round to keep challenges fresh and unexpected'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShuffleCards(!shuffleCards)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${shuffleCards
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-800'
                    }`}
                >
                  <span>{shuffleCards ? (language === 'zh' ? '已开启乱序' : 'Shuffle ON') : (language === 'zh' ? '固定顺序' : 'Fixed')}</span>
                  {shuffleCards && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Per-Round Pipeline Manual Customization */}
              <div className="space-y-3 pt-3 border-t border-slate-300 dark:border-slate-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    {language === 'zh' ? '各关卡速度与配置 (支持单独手动修改)' : 'Level Details & Manual BPM Control'}
                  </label>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                    {language === 'zh' ? `共 ${rounds.length} 个关卡` : `${rounds.length} levels`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {rounds.map((round, idx) => {
                    const badge = getBpmBadge(round.bpm);
                    return (
                      <div
                        key={idx}
                        className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl p-3.5 space-y-2.5 transition-all hover:border-slate-400 dark:hover:border-slate-700"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-400 font-mono text-[11px] flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            <span>{round.name}</span>
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md border font-bold ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>

                        <div className="pt-1">
                          {/* Round BPM Manual Input */}
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                              {language === 'zh' ? '速度 (BPM)' : 'Tempo (BPM)'}
                            </label>
                            <input
                              type="number"
                              min="40"
                              max="260"
                              value={round.bpm}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val)) {
                                  setRounds((prev) =>
                                    prev.map((r, i) => (i === idx ? { ...r, bpm: val } : r))
                                  );
                                  if (idx === 0) {
                                    setStartBpm(val);
                                  }
                                }
                              }}
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>


        </div>
      )}

      {/* ========================================================================================= */}
      {/* STEP 3: CHALLENGE INFO & MUSIC SOUNDTRACK (第 3 步：挑战基础信息 音乐相关资料) */}
      {/* ========================================================================================= */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-fadeIn">
          {/* Step 3 Introduction */}
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm dark:shadow-xl transition-colors">
            <div className="pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center text-white text-xs font-black">
                  3
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {language === 'zh' ? '挑战基础信息与音乐伴奏' : 'Challenge Details & Music Soundtrack'}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-500 dark:text-slate-400 mt-1">
                {language === 'zh'
                  ? '为你的挑战命名，挑选最带感的卡点伴奏音乐与前奏，试听后即可立即试玩或发布！'
                  : 'Name your challenge, pick your rhythm soundtrack, preview the beat, and hit play!'}
              </p>
            </div>

            {/* Challenge Identity Info */}
            <div className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>{language === 'zh' ? '挑战基础资料' : 'Basic Identity'}</span>
                </span>
                <button
                  type="button"
                  onClick={handleRandomTitle}
                  className="flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-bold"
                >
                  <Dices className="w-3.5 h-3.5" />
                  <span>{language === 'zh' ? '随机爆款标题' : 'Random Title'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    {language === 'zh' ? '挑战名称' : 'Challenge Title'}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={language === 'zh' ? '例如：魔性成语卡点连击' : 'e.g. Viral Rhythm Challenge'}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    {language === 'zh' ? '分类标签' : 'Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Custom">Custom (自制挑战)</option>
                    <option value="Viral Classics">Viral Classics (经典爆款)</option>
                    <option value="Party Mode">Party Mode (聚会狂欢)</option>
                    <option value="Fast Speed">Fast Speed (极限手速)</option>
                    <option value="Kids & Family">Kids & Family (益智亲子)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  {language === 'zh' ? '挑战简介' : 'Description'}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder={language === 'zh' ? '简短介绍挑战玩法或卡点要领...' : 'Brief description of the challenge...'}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>



            {/* Temporarily hidden: Soundtrack & Intro sections (kept to add back later) */}
            {false && (
              <>
                {/* Soundtrack Settings: Matches Bala Bala Beat music (beat.mp3) by default */}
                <div className="pt-6 border-t border-slate-300 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                      <span>{language === 'zh' ? '专属伴奏音乐 (默认匹配巴拉巴拉原曲)' : 'Soundtrack (Bala Bala Beat Default)'}</span>
                    </span>
                    <span className="text-[10px] font-bold text-pink-400 bg-pink-500/10 px-2.5 py-0.5 rounded-full border border-pink-500/30 flex items-center gap-1">
                      ⭐ {language === 'zh' ? '默认官方伴奏' : 'Default Soundtrack'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 text-lg shrink-0">
                        🔥
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            {language === 'zh' ? '🔥 爆款经典原版音乐 (Viral Classics Beat)' : '🔥 Viral Classics Soundtrack'}
                          </span>
                          <span className="text-[10px] font-mono text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/60 px-1.5 py-0.5 rounded border border-pink-500/30">
                            beat.mp3
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                          {language === 'zh'
                            ? '所有自定义挑战已统一使用 Viral Classics 爆款经典音乐：8 拍前奏 (0~2.62s) + 8 拍魔性口哨高潮卡点 (2.62~5.25s 循环)，速度自适应各关卡 BPM！'
                            : 'All custom challenges use the exact Viral Classics music: 8-beat intro (0~2.62s) + 8-beat drop (2.62~5.25s loop), tempo scaled to each round BPM!'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        if (isPlayingCustomAudio) {
                          soundEngine.stopCustomTrack();
                          setIsPlayingCustomAudio(false);
                        } else {
                          setIsPlayingCustomAudio(true);
                          await soundEngine.loadCustomAudio('/assets/music/beat.mp3');
                          const baseBpm = 182.8;
                          const targetBpm = typeof startBpm === 'number' ? startBpm : (parseInt(startBpm as any) || 160);
                          const rate = targetBpm / baseBpm;
                          soundEngine.playCustomTrack(0, 0, 1.0, undefined, rate);
                        }
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shrink-0 ${isPlayingCustomAudio
                          ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30 ring-2 ring-pink-400'
                          : 'bg-slate-50 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-pink-700 dark:text-pink-300 border border-pink-500/30'
                        }`}
                    >
                      {isPlayingCustomAudio ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span>{isPlayingCustomAudio ? (language === 'zh' ? '停止试听' : 'Stop') : (language === 'zh' ? '试听伴奏' : 'Preview Beat')}</span>
                    </button>
                  </div>
                </div>

                {/* Intro Style Information (Fixed 8 beats standard) */}
                <div className="pt-6 border-t border-slate-300 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{language === 'zh' ? '进入关卡前奏 (经典 8 拍预热)' : 'Level Intro (8 Beats Classic Warmup)'}</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      8 {language === 'zh' ? '拍经典前奏' : 'Beats Intro'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-3">
                    <span className="text-xl">⚡</span>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {language === 'zh' ? '经典 8 拍前奏 (示范轮与挑战轮充足准备)' : 'Classic 8 Beats Warmup'}
                      </span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400">
                        {language === 'zh'
                          ? '每个关卡的示范轮和挑战轮都会播放 8 拍鼓点前奏（2 个小节），带来充裕的进场铺垫与卡点抓拍感！'
                          : 'Both demonstration and challenge rounds feature 8 beats (2 bars) of intro warmup for a confident drop.'}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Final Challenge Overview Summary Card */}
            <div className="pt-6 border-t border-slate-300 dark:border-slate-800">
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-3">
                {language === 'zh' ? '挑战就绪全貌总览' : 'Challenge Readiness Summary'}
              </span>

              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/40 border border-slate-300 dark:border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-300 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">{title || '未命名挑战'}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{description}</p>
                  </div>
                  <span className="text-xs font-bold text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/30 self-start sm:self-auto">
                    {category}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-600 dark:text-slate-500 text-[11px] block">{language === 'zh' ? '词库池卡片' : 'Card Pool'}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{cardPool.length} {language === 'zh' ? '张卡片' : 'cards'}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-500 text-[11px] block">{language === 'zh' ? '关卡进阶' : 'Levels'}</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {rounds.length} {language === 'zh' ? '关' : 'lvls'} ({rounds[0]?.bpm} ~ {rounds[rounds.length - 1]?.bpm} BPM)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-500 text-[11px] block">{language === 'zh' ? '伴奏音乐' : 'Soundtrack'}</span>
                    <span className="font-bold text-pink-600 dark:text-pink-400 flex items-center gap-1">
                      <span>🔥 巴拉巴拉魔性伴奏</span>
                      <span className="text-[9px] bg-pink-500/20 text-pink-300 px-1 py-0.5 rounded border border-pink-500/40">Default</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-500 text-[11px] block">{language === 'zh' ? '卡片顺序' : 'Order'}</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      {shuffleCards ? (language === 'zh' ? '随机乱序' : 'Shuffled') : (language === 'zh' ? '固定顺序' : 'Fixed')}
                    </span>
                  </div>
                </div>

                {/* Step 3 in-flow Actions */}
                <div className="pt-4 border-t border-slate-300 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
                  <div className="w-full sm:w-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onPlayDirectly(buildChallengeObject())}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs sm:text-sm shadow-md hover:scale-105 transition-all"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>{language === 'zh' ? '立即试玩' : 'Test Play'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSave(buildChallengeObject())}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-pink-500/25 hover:scale-105 transition-all"
                    >
                      <Save className="w-4 h-4" />
                      <span>{language === 'zh' ? '保存并发布挑战' : 'Save Challenge'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING STICKY BOTTOM WIZARD BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Cancel & Export */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs sm:text-sm font-bold transition-colors"
            >
              {language === 'zh' ? '取消退出' : 'Cancel'}
            </button>

            {/* Export JSON quick button */}
            <button
              type="button"
              onClick={handleExportJson}
              className="hidden sm:flex items-center gap-1 px-3 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition-colors"
              title="Export Challenge JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'zh' ? '导出' : 'JSON'}</span>
            </button>

            {/* Copy JSON quick button */}
            <button
              type="button"
              onClick={handleCopyJson}
              className="hidden sm:flex items-center gap-1 px-3 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition-colors"
              title={language === 'zh' ? '复制挑战 JSON 到剪贴板' : 'Copy Challenge JSON'}
            >
              {hasCopiedJson ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">{language === 'zh' ? '已复制' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{language === 'zh' ? '复制' : 'Copy'}</span>
                </>
              )}
            </button>
          </div>

          {/* Center: Current step info */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 font-semibold">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
            <span>
              {currentStep === 1
                ? language === 'zh'
                  ? `步骤 1: 文字词库池 (${cardPool.length} 个文字)`
                  : `Step 1: Word Pool (${cardPool.length} words)`
                : currentStep === 2
                  ? language === 'zh'
                    ? `步骤 2: 关卡层级 (${rounds.length} 关)`
                    : `Step 2: Levels Hierarchy (${rounds.length} levels)`
                  : language === 'zh'
                    ? `步骤 3: 基础资料与伴奏`
                    : `Step 3: Identity & Soundtrack`}
            </span>
          </div>

          {/* Right: Step Navigation & Test Play / Save actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleGoToStep((currentStep - 1) as 1 | 2 | 3)}
              disabled={currentStep === 1}
              className={`flex items-center gap-1 px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-colors ${currentStep === 1
                  ? 'border-slate-200 text-slate-600 dark:text-slate-400 bg-slate-100 cursor-not-allowed opacity-60'
                  : 'border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'zh' ? '上一步' : 'Prev'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleGoToStep((currentStep + 1) as 1 | 2 | 3)}
              disabled={currentStep === 3}
              className={`flex items-center gap-1 px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-colors ${currentStep === 3
                  ? 'border-slate-200 text-slate-600 dark:text-slate-400 bg-slate-100 cursor-not-allowed opacity-60'
                  : 'border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              <span className="hidden sm:inline">{language === 'zh' ? '下一步' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onPlayDirectly(buildChallengeObject())}
              className="flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{language === 'zh' ? '试玩' : 'Test Play'}</span>
            </button>
            <button
              type="button"
              onClick={() => onSave(buildChallengeObject())}
              className="flex items-center justify-center gap-1.5 px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-pink-500/25 hover:scale-105 transition-transform"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'zh' ? '保存' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
