import React, { useState, useEffect } from 'react';
import {
  Volume2,
  X,
  Play,
  Square,
  Music,
  Sparkles,
  Zap,
  Mic,
  Award,
  Radio
} from 'lucide-react';
import { SoundPackType, MetronomeAccentType } from '../types/game';
import { soundEngine } from '../services/soundEngine';

interface SoundTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'zh' | 'en';
}

const SOUND_PACK_INFO: Array<{
  id: SoundPackType;
  name: string;
  nameEn: string;
  desc: string;
  descEn: string;
  emoji: string;
  color: string;
}> = [
  {
    id: 'whistle',
    name: 'TikTok 经典口哨',
    nameEn: 'Viral Whistle',
    desc: '轻快上头的标志性口哨旋律，TikTok 爆款标配',
    descEn: 'Catchy melodic whistle melody from the viral trend',
    emoji: '🎵',
    color: '#ec4899',
  },
  {
    id: 'trap',
    name: 'Trap 808 重低音',
    nameEn: 'Trap 808 Bass',
    desc: '下潜极深的 808 鼓点与清脆拍手，动感十足',
    descEn: 'Deep sub-bass kick with rolling hi-hats and clap',
    emoji: '🔥',
    color: '#ef4444',
  },
  {
    id: 'drill',
    name: 'UK Drill 滑音滑轨',
    nameEn: 'UK Drill Flow',
    desc: '滑音贝斯与跳跃击打，英伦风硬核节奏',
    descEn: 'Sliding 808 pitch glides and punchy snare',
    emoji: '⚡',
    color: '#8b5cf6',
  },
  {
    id: 'arcade',
    name: '8-Bit 复古街机',
    nameEn: '8-Bit Arcade',
    desc: '红白机像素风格方波合成器，童年游戏厅氛围',
    descEn: 'Nostalgic retro chiptune square-wave tones',
    emoji: '🕹️',
    color: '#06b6d4',
  },
  {
    id: 'funk',
    name: 'Funky Bass 律动贝斯',
    nameEn: 'Funky Bass Groove',
    desc: '摇摆放克低音弹拨，复古迪斯科派对感',
    descEn: 'Bouncy slap bass pulse with groovy swagger',
    emoji: '🎸',
    color: '#f59e0b',
  },
  {
    id: 'jersey',
    name: 'Jersey Club 极速连击',
    nameEn: 'Jersey Club Fast Bounce',
    desc: '跳跃感三连音底鼓与清脆拍击，极速高燃氛围',
    descEn: 'Bouncy syncopated kick rolls and fast club rhythm',
    emoji: '👟',
    color: '#10b981',
  },
  {
    id: 'lofi',
    name: 'Chill Lofi 暖调舒缓',
    nameEn: 'Chill Lofi Beats',
    desc: '温暖微醺电钢琴与慢拍低保真鼓点，适合练词与轻松挑战',
    descEn: 'Warm vintage Rhodes piano and relaxed hip-hop beat',
    emoji: '☕',
    color: '#6366f1',
  },
];

export const SoundTestModal: React.FC<SoundTestModalProps> = ({ isOpen, onClose, language }) => {
  const [activePreviewPack, setActivePreviewPack] = useState<SoundPackType | null>(null);
  const [previewBpm, setPreviewBpm] = useState(120);
  const [currentBeatStep, setCurrentBeatStep] = useState(0);
  const [selectedMetronome, setSelectedMetronome] = useState<MetronomeAccentType>(() => soundEngine.getMetronomeAccent());

  useEffect(() => {
    if (!isOpen && activePreviewPack) {
      soundEngine.stopPreview();
      setActivePreviewPack(null);
    }
  }, [isOpen]);

  const handleTogglePreview = (pack: SoundPackType) => {
    if (activePreviewPack === pack) {
      soundEngine.stopPreview();
      setActivePreviewPack(null);
      setCurrentBeatStep(0);
    } else {
      setActivePreviewPack(pack);
      soundEngine.previewSoundPack(
        pack,
        previewBpm,
        16, // 16 beats preview (4 bars)
        (beat) => {
          setCurrentBeatStep(beat % 4);
        },
        () => {
          setActivePreviewPack(null);
          setCurrentBeatStep(0);
        }
      );
    }
  };

  const handleTestHit = (type: 'PERFECT' | 'GREAT' | 'MISS') => {
    soundEngine.playHitSound(type);
  };

  const handleTestAirhorn = () => {
    soundEngine.playAirhorn();
  };

  const handleTestTick = () => {
    soundEngine.playCountTick(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="max-w-2xl w-full bg-[#0f1422] border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {language === 'zh' ? '音效与伴奏试听中心' : 'Sound & Beat Preview'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'zh'
                  ? '试听 5 种纯 Web Audio 伴奏节拍与各种判定音效'
                  : 'Test Web Audio beat packs and interactive game hit sounds'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.stopPreview();
              setActivePreviewPack(null);
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BPM Tempo preview adjuster */}
        <div className="flex items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-pink-400" />
            <span className="text-xs font-bold text-slate-300">
              {language === 'zh' ? '伴奏试听速度 (BPM):' : 'Preview Tempo (BPM):'}
            </span>
            <span className="font-mono font-black text-pink-400 text-sm">
              {previewBpm} BPM
            </span>
          </div>

          <div className="flex items-center gap-3 flex-1 max-w-xs">
            <input
              type="range"
              min="80"
              max="200"
              step="5"
              value={previewBpm}
              onChange={(e) => {
                const bpm = parseInt(e.target.value);
                setPreviewBpm(bpm);
                if (activePreviewPack) {
                  soundEngine.setBpm(bpm);
                }
              }}
              className="w-full accent-pink-500 cursor-pointer"
            />
          </div>
        </div>

        {/* 5 BEAT PACKS LIST */}
        <div className="mb-6">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-pink-400" />
            <span>{language === 'zh' ? '5 大节拍伴奏试听' : 'Beat Sound Packs'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SOUND_PACK_INFO.map((item) => {
              const isPlaying = activePreviewPack === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isPlaying
                      ? 'bg-slate-900 border-pink-500 shadow-lg shadow-pink-500/20'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-white">
                          {language === 'zh' ? item.name : item.nameEn}
                        </span>
                        {isPlaying && (
                          <span className="flex gap-0.5 items-end h-3">
                            <span className="w-1 bg-pink-500 animate-bounce h-3 rounded-full"></span>
                            <span className="w-1 bg-pink-400 animate-bounce h-2 rounded-full delay-75"></span>
                            <span className="w-1 bg-pink-300 animate-bounce h-3 rounded-full delay-150"></span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {language === 'zh' ? item.desc : item.descEn}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTogglePreview(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-transform active:scale-95 ${
                      isPlaying
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>{language === 'zh' ? '停止' : 'Stop'}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current text-pink-400" />
                        <span>{language === 'zh' ? '试听' : 'Play'}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* METRONOME TIMBRE & COUNT-IN ACCENT SELECTOR */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-pink-400" />
              <span>{language === 'zh' ? '节拍器与报拍音色 (Metronome Sound)' : 'Metronome Accent Sound'}</span>
            </h3>
            <span className="text-[11px] font-mono text-pink-400 font-bold">
              {selectedMetronome.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'woodblock', nameZh: '🪵 原木清脆 (Woodblock)', nameEn: 'Woodblock', desc: '经典有机敲击声' },
              { id: 'electronic', nameZh: '⚡ 数字电音 (Digital Bleep)', nameEn: 'Electronic', desc: '清脆高辨识度' },
              { id: 'cowbell', nameZh: '🔔 808 牛铃 (808 Cowbell)', nameEn: '808 Cowbell', desc: '复古嘻哈金属质感' },
            ].map((metro) => {
              const isSelected = selectedMetronome === metro.id;
              return (
                <button
                  key={metro.id}
                  onClick={() => {
                    setSelectedMetronome(metro.id as MetronomeAccentType);
                    soundEngine.setMetronomeAccent(metro.id as MetronomeAccentType);
                    soundEngine.playCountTick(true);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-pink-600/20 border-pink-500 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold mb-0.5 text-slate-200">
                    {language === 'zh' ? metro.nameZh : metro.nameEn}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {metro.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* INTERACTIVE GAMEPLAY SFX PREVIEW */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'zh' ? '游戏判定与结算音效试听' : 'Hit & Judgment SFX'}</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button
              onClick={() => handleTestHit('PERFECT')}
              className="p-3 rounded-2xl bg-slate-900 border border-amber-500/40 hover:border-amber-400 text-left hover:scale-105 active:scale-95 transition-all group"
            >
              <div className="text-amber-400 font-black text-xs flex items-center justify-between mb-1">
                <span>🔥 PERFECT</span>
                <Play className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </div>
              <span className="text-[10px] text-slate-400">
                {language === 'zh' ? '完美卡点 (+100)' : 'High Chime'}
              </span>
            </button>

            <button
              onClick={() => handleTestHit('GREAT')}
              className="p-3 rounded-2xl bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-left hover:scale-105 active:scale-95 transition-all group"
            >
              <div className="text-cyan-400 font-black text-xs flex items-center justify-between mb-1">
                <span>✨ GREAT</span>
                <Play className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </div>
              <span className="text-[10px] text-slate-400">
                {language === 'zh' ? '良好判定 (+60)' : 'Mid Tone'}
              </span>
            </button>

            <button
              onClick={() => handleTestHit('MISS')}
              className="p-3 rounded-2xl bg-slate-900 border border-rose-500/40 hover:border-rose-400 text-left hover:scale-105 active:scale-95 transition-all group"
            >
              <div className="text-rose-400 font-black text-xs flex items-center justify-between mb-1">
                <span>💨 MISS</span>
                <Play className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </div>
              <span className="text-[10px] text-slate-400">
                {language === 'zh' ? '失误低音' : 'Buzz Low'}
              </span>
            </button>

            <button
              onClick={handleTestAirhorn}
              className="p-3 rounded-2xl bg-slate-900 border border-purple-500/40 hover:border-purple-400 text-left hover:scale-105 active:scale-95 transition-all group"
            >
              <div className="text-purple-400 font-black text-xs flex items-center justify-between mb-1">
                <span>🏆 AIRHORN</span>
                <Play className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </div>
              <span className="text-[10px] text-slate-400">
                {language === 'zh' ? '胜利通关号角' : 'Victory Horn'}
              </span>
            </button>

            <button
              onClick={handleTestTick}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-left hover:scale-105 active:scale-95 transition-all group"
            >
              <div className="text-slate-200 font-black text-xs flex items-center justify-between mb-1">
                <span>⏱️ TICK</span>
                <Play className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </div>
              <span className="text-[10px] text-slate-400">
                {language === 'zh' ? '倒计时节拍' : 'Metronome'}
              </span>
            </button>

            <button
              onClick={() => soundEngine.playReadySound()}
              className="p-3 rounded-2xl bg-slate-900 border border-emerald-500/40 hover:border-emerald-400 text-left hover:scale-105 active:scale-95 transition-all group"
            >
              <div className="text-emerald-300 font-black text-xs flex items-center justify-between mb-1">
                <span>🎶 READY</span>
                <Play className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </div>
              <span className="text-[10px] text-slate-400">
                {language === 'zh' ? '前奏就绪提示' : 'Rising Chime'}
              </span>
            </button>

            <button
              onClick={() => soundEngine.playDropSwoosh()}
              className="p-3 rounded-2xl bg-slate-900 border border-indigo-500/40 hover:border-indigo-400 text-left hover:scale-105 active:scale-95 transition-all group"
            >
              <div className="text-indigo-300 font-black text-xs flex items-center justify-between mb-1">
                <span>⚡ SWOOSH</span>
                <Play className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </div>
              <span className="text-[10px] text-slate-400">
                {language === 'zh' ? '提速下坠呼啸' : 'Drop Riser'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
