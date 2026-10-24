export type CardModeType = 'text' | 'image' | 'mixed';

export interface CardItem {
  id: string;
  word: string;
  subtext?: string;
  emoji?: string;
  imageUrl?: string;
  color?: string;
  textOnly?: boolean;
  cardMode?: CardModeType;
}

export interface RoundConfig {
  roundNumber: number;
  name?: string;
  bpm: number;
  cards: CardItem[];
  loopCount: number; // typically 2 or 4 loops per round
  countInBeats?: number;
  textOnly?: boolean; // round-level pure text flag
  shuffleCards?: boolean; // whether to shuffle cards order each level
  cardCount?: number; // number of cards to draw for this round
}

export type SoundPackType = 'whistle' | 'trap' | 'drill' | 'arcade' | 'funk' | 'jersey' | 'lofi';

export type MetronomeAccentType = 'woodblock' | 'electronic' | 'cowbell' | 'voice_count';

export type IntroStyleType = 'quick_8' | 'quick_4';

export const INTRO_STYLES: Array<{
  id: IntroStyleType;
  labelZh: string;
  labelEn: string;
  beats: number;
  descZh: string;
  descEn: string;
}> = [
  { id: 'quick_8', labelZh: '⚡ 8 拍前奏', labelEn: '8 Beats Intro', beats: 8, descZh: '经典 8 拍预热（2 小节）', descEn: 'Classic 8-beat warmup (2 bars)' },
  { id: 'quick_4', labelZh: '⚡ 4 拍前奏', labelEn: '4 Beats Intro', beats: 4, descZh: '紧凑 4 拍预热', descEn: 'Fast 4-beat warmup' },
];

export interface Challenge {
  id: string;
  title: string;
  description?: string;
  category: string;
  soundPack: SoundPackType;
  customAudioUrl?: string; // base64 data URL or blob URL for user uploaded music
  audioFileName?: string;
  audioOffsetSec?: number; // intro offset in seconds
  customIntroAudioUrl?: string; // custom pre-music / intro music file
  introAudioFileName?: string;
  introDurationSec?: number; // duration of custom intro audio in seconds
  audioLoopEndSec?: number; // loop end point for custom audio in seconds
  baseBpm?: number; // native recording tempo of custom audio in BPM (e.g. 182.8 for beat.mp3)
  introStyle?: IntroStyleType;
  shuffleCards?: boolean; // whether to shuffle cards order each level
  isCustom?: boolean;
  cardPool?: CardItem[];
  rounds: RoundConfig[];
  createdAt?: number;
}

export type BeatJudgmentType = 'PERFECT' | 'GREAT' | 'MISS' | null;

export interface GameStats {
  score: number;
  combo: number;
  maxCombo: number;
  perfectCount: number;
  greatCount: number;
  missCount: number;
  totalNotes: number;
  roundScores: number[];
}

export type GamePhase = 'idle' | 'countdown' | 'playing' | 'roundSuccess' | 'gameOver' | 'allClear';
