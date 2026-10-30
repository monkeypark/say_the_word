import React, { useState, useEffect } from 'react';
import { Play, Sparkles, PlusCircle, Flame, Music, Upload, Trash2, Edit3, ArrowRight, Square, Volume2, Copy, Check } from 'lucide-react';
import { Challenge } from '../types/game';
import { soundEngine } from '../services/soundEngine';

interface ChallengeListProps {
  challenges: Challenge[];
  onSelectChallenge: (c: Challenge) => void;
  onCreateNew: () => void;
  onEditChallenge?: (c: Challenge) => void;
  onCopyChallenge?: (c: Challenge) => void;
  onDeleteChallenge?: (id: string) => void;
  onImportChallenge: (c: Challenge) => void;
  language: 'zh' | 'en';
}

export const ChallengeList: React.FC<ChallengeListProps> = ({
  challenges,
  onSelectChallenge,
  onCreateNew,
  onEditChallenge,
  onCopyChallenge,
  onDeleteChallenge,
  onImportChallenge,
  language,
}) => {
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      soundEngine.stopPreview();
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.rounds && parsed.rounds.length > 0) {
          onImportChallenge({
            ...parsed,
            id: 'imported-' + Date.now(),
            isCustom: true,
          });
          alert(language === 'zh' ? '挑战导入成功！' : 'Challenge imported successfully!');
        }
      } catch (err) {
        alert(language === 'zh' ? '无效的挑战 JSON 文件' : 'Invalid challenge JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 w-full max-w-full overflow-x-hidden">
      {/* Clean Hero Section */}
      <div className="relative rounded-2xl bg-white dark:bg-[#0f1422] border border-slate-200 dark:border-slate-800 p-5 sm:p-8 mb-6 sm:mb-8 shadow-sm dark:shadow-md overflow-hidden transition-colors">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-500/10 border border-pink-200 dark:border-pink-500/20 text-pink-700 dark:text-pink-400 text-xs font-bold mb-3">
            <Flame className="w-3.5 h-3.5" />
            <span>{language === 'zh' ? '风靡全网的卡点节奏挑战' : 'The Viral Rhythm Hit'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
            SPEAK ON <span className="text-pink-600 dark:text-pink-500">THE BEAT</span>
          </h1>

          <p className="text-sm text-slate-700 dark:text-slate-300 mb-6 leading-relaxed font-normal">
            {language === 'zh'
              ? '听准鼓点，按节奏念出对应词汇！速度逐关飙升，挑战大脑与反应力。随时自选曲目开玩，也可随心创作专属卡点关卡。'
              : 'Listen to the drop, match the cards, and shout the word on tempo! Beats accelerate each level. Pick a track or create your own.'}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectChallenge(challenges[0])}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-black text-sm shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{language === 'zh' ? '🔥 立即畅玩默认挑战 (巴拉巴拉)' : '🔥 Play Default Track'}</span>
            </button>

            <button
              onClick={onCreateNew}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold text-sm border border-slate-300 dark:border-slate-700 shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-pink-600 dark:text-pink-400" />
              <span>{language === 'zh' ? '制作自定关卡' : 'Create Custom'}</span>
            </button>

            <label className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-300 font-bold text-xs border border-slate-300 dark:border-slate-700 shadow-xs cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span>{language === 'zh' ? '导入 JSON' : 'Import'}</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Challenges Grid */}
      {challenges.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900/30 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl text-center shadow-xs">
          <Music className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-4" />
          <p className="text-slate-700 dark:text-slate-400 font-bold">
            {language === 'zh' ? '暂无曲目' : 'No tracks found'}
          </p>
          <button
            onClick={onCreateNew}
            className="mt-4 text-pink-600 dark:text-pink-400 hover:underline font-black text-sm"
          >
            {language === 'zh' ? '+ 立即创作' : '+ Create your first track'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {challenges.map((item) => {
          const firstBpm = item.rounds[0]?.bpm || 160;
          const lastBpm = item.rounds[item.rounds.length - 1]?.bpm || 180;
          const sampleCards = (item.cardPool && item.cardPool.length > 0) ? item.cardPool : (item.rounds[0]?.cards || []);
          const isDefaultTrack = item.id === 'bala-bala-challenge';

          return (
            <div
              key={item.id}
              className={`group flex flex-col justify-between rounded-2xl bg-white dark:bg-[#0f1422] p-5 transition-all duration-200 hover:shadow-md dark:hover:shadow-black/40 ${
                isDefaultTrack
                  ? 'border-2 border-pink-500 shadow-md shadow-pink-500/10 hover:border-pink-600 dark:hover:border-pink-400'
                  : 'border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-transparent">
                      {item.category}
                    </span>
                    {isDefaultTrack && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40 flex items-center gap-1">
                        ⭐ {language === 'zh' ? '默认推荐' : 'Default'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {item.customAudioUrl && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-900 border border-pink-300 dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-500/40 flex items-center gap-1">
                        <Music className="w-2.5 h-2.5" />
                        {language === 'zh' ? '专属音乐' : 'Custom Audio'}
                      </span>
                    )}
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      {firstBpm} → {lastBpm} BPM
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-300 transition-colors mb-1.5">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed font-normal">
                  {item.description || (language === 'zh' ? '跟着强劲节拍，大声说出卡片内容！' : 'Shout the word on beat!')}
                </p>

                {/* Challenge Words Preview Strip (Show all words for the challenge) */}
                <div className="flex flex-wrap gap-1.5 mb-5 max-h-28 overflow-y-auto">
                  {sampleCards.map((card, i) => (
                    <span
                      key={`sample-card-${item.id}-${card.id || i}-${i}`}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs"
                    >
                      {card.word}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Row */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (activePreviewId === item.id) {
                        soundEngine.stopPreview();
                        soundEngine.stopRhythm();
                        soundEngine.stopCustomTrack();
                        setActivePreviewId(null);
                      } else {
                        setActivePreviewId(item.id);
                        if (item.customAudioUrl) {
                          const baseBpm = item.baseBpm || (item.customAudioUrl?.includes('beat.mp3') ? 182.8 : item.rounds[0]?.bpm);
                          const rate = (baseBpm && baseBpm > 0 && item.rounds[0]?.bpm) ? (item.rounds[0].bpm / baseBpm) : 1.0;
                          soundEngine.playCustomTrack(0, item.audioOffsetSec || 0, 1.0, item.audioLoopEndSec, rate);
                        } else {
                          soundEngine.previewSoundPack(
                            item.soundPack,
                            item.rounds[0]?.bpm || 160,
                            16,
                            undefined,
                            () => setActivePreviewId(null)
                          );
                        }
                      }
                    }}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs ${
                      activePreviewId === item.id
                        ? 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700'
                    }`}
                    title="Preview Track Beat"
                  >
                    {activePreviewId === item.id ? (
                      <>
                        <Square className="w-3 h-3 fill-current text-rose-600 dark:text-rose-400" />
                        <span>{language === 'zh' ? '停止' : 'Stop'}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                        <span>{language === 'zh' ? '试听' : 'Preview'}</span>
                      </>
                    )}
                  </button>

                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    {item.rounds.length} {language === 'zh' ? '关' : 'Levels'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {item.isCustom && onDeleteChallenge && (
                    <div className="flex items-center gap-1">
                      {confirmDeleteId === item.id ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-1 rounded bg-slate-200 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          >
                            {language === 'zh' ? '取消' : 'No'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (activePreviewId === item.id) {
                                soundEngine.stopPreview();
                                setActivePreviewId(null);
                              }
                              onDeleteChallenge(item.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-1 rounded bg-rose-600 text-[10px] font-bold text-white shadow-2xs"
                          >
                            {language === 'zh' ? '确认' : 'Yes'}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(item.id);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 border border-slate-300 dark:bg-slate-800/60 dark:hover:bg-rose-500/10 dark:text-slate-400 dark:hover:text-rose-400 dark:border-transparent transition-colors shadow-2xs"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                  {onCopyChallenge && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopyChallenge(item);
                        setCopiedId(item.id);
                        setTimeout(() => {
                          setCopiedId((prev) => (prev === item.id ? null : prev));
                        }, 2000);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 text-xs font-bold transition-all shadow-2xs"
                      title={language === 'zh' ? '复制挑战' : 'Copy Challenge'}
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold">{language === 'zh' ? '已复制' : 'Copied'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                          <span>{language === 'zh' ? '复制' : 'Copy'}</span>
                        </>
                      )}
                    </button>
                  )}
                  {onEditChallenge && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (activePreviewId === item.id) {
                          soundEngine.stopPreview();
                          setActivePreviewId(null);
                        }
                        onEditChallenge(item);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-purple-300 dark:border-slate-700 text-xs font-bold transition-all shadow-2xs"
                      title="Edit Challenge"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-600 dark:text-purple-400" />
                      <span>{language === 'zh' ? '修改' : 'Edit'}</span>
                    </button>
                  )}
                  <button
                    onClick={() => onSelectChallenge(item)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-black text-xs transition-colors shadow-sm"
                  >
                    <span>{language === 'zh' ? '开始挑战' : 'Play'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

        );
      })}
      </div>
      )}
    </div>
  );
};
