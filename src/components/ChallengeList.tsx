import React, { useState, useEffect } from 'react';
import { Play, Sparkles, PlusCircle, Flame, Music, Upload, Trash2, Edit3, ArrowRight, Square, Volume2 } from 'lucide-react';
import { Challenge } from '../types/game';
import { soundEngine } from '../services/soundEngine';

interface ChallengeListProps {
  challenges: Challenge[];
  onSelectChallenge: (c: Challenge) => void;
  onCreateNew: () => void;
  onEditChallenge?: (c: Challenge) => void;
  onDeleteChallenge?: (id: string) => void;
  onImportChallenge: (c: Challenge) => void;
  language: 'zh' | 'en';
}

export const ChallengeList: React.FC<ChallengeListProps> = ({
  challenges,
  onSelectChallenge,
  onCreateNew,
  onEditChallenge,
  onDeleteChallenge,
  onImportChallenge,
  language,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      soundEngine.stopPreview();
    };
  }, []);

  const categories = [
    { id: 'all', label: language === 'zh' ? '全部挑战' : 'All Tracks' },
    { id: 'Text Flow', label: language === 'zh' ? '📜 纯文字速击' : 'Text Flow' },
    { id: 'Viral Classics', label: language === 'zh' ? '爆款经典' : 'Viral' },
    { id: 'Party Hits', label: language === 'zh' ? '派对美食' : 'Party' },
    { id: 'Rhyme Challenge', label: language === 'zh' ? '押韵说唱' : 'Rhyme' },
    { id: 'Meme Trends', label: language === 'zh' ? '网络热梗' : 'Memes' },
    { id: 'Brain Training', label: language === 'zh' ? '思维逆向' : 'Brain' },
    { id: 'custom', label: language === 'zh' ? '我的创作 (Pro)' : 'My Custom' },
  ];

  const filtered = challenges.filter((c) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'custom') return c.isCustom;
    return c.category === selectedCategory;
  });

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
      <div className="relative rounded-2xl bg-[#0f1422] border border-slate-800 p-4 sm:p-8 mb-6 sm:mb-8 overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold mb-3">
            <Flame className="w-3.5 h-3.5" />
            <span>{language === 'zh' ? '风靡全网的卡点节奏挑战' : 'The Viral Rhythm Hit'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-2">
            SAY THE WORD <span className="text-pink-400">ON BEAT</span>
          </h1>

          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            {language === 'zh'
              ? '听准鼓点，按节奏念出对应词汇！速度逐关飙升，挑战大脑与反应力。随时自选曲目开玩，也可随心创作专属卡点关卡。'
              : 'Listen to the drop, match the cards, and shout the word on tempo! Beats accelerate each level. Pick a track or create your own.'}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectChallenge(challenges[0])}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{language === 'zh' ? '立即开始' : 'Play First Track'}</span>
            </button>

            <button
              onClick={onCreateNew}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700/80 transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-pink-400" />
              <span>{language === 'zh' ? '制作自定关卡' : 'Create Custom'}</span>
            </button>

            <label className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 font-medium text-xs border border-slate-700/60 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>{language === 'zh' ? '导入 JSON' : 'Import'}</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              selectedCategory === cat.id
                ? 'bg-white text-slate-950 font-bold shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800/60'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Challenges Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl text-center">
          <Music className="w-12 h-12 text-slate-700 mb-4" />
          <p className="text-slate-400 font-medium">
            {language === 'zh' ? '暂无曲目' : 'No tracks found'}
          </p>
          {selectedCategory === 'custom' && (
            <button
              onClick={onCreateNew}
              className="mt-4 text-pink-400 hover:text-pink-300 font-bold text-sm"
            >
              {language === 'zh' ? '+ 立即创作' : '+ Create your first track'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => {
          const firstBpm = item.rounds[0]?.bpm || 100;
          const lastBpm = item.rounds[item.rounds.length - 1]?.bpm || 180;
          const sampleCards = item.rounds[0]?.cards || [];

          return (
            <div
              key={item.id}
              className="group flex flex-col justify-between rounded-2xl bg-[#0f1422] border border-slate-800 hover:border-slate-700 p-5 transition-all duration-200 hover:shadow-lg"
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300">
                    {item.category}
                  </span>

                  <div className="flex items-center gap-2">
                    {item.customAudioUrl && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 flex items-center gap-1">
                        <Music className="w-2.5 h-2.5" />
                        {language === 'zh' ? '专属音乐' : 'Custom Audio'}
                      </span>
                    )}
                    <span className="text-xs font-mono font-medium text-slate-400">
                      {firstBpm} → {lastBpm} BPM
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-pink-300 transition-colors mb-1.5">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {item.description || (language === 'zh' ? '跟着强劲节拍，大声说出卡片内容！' : 'Shout the word on beat!')}
                </p>

                {/* 4 Card Preview Strip */}
                <div className="grid grid-cols-4 gap-1.5 mb-5">
                  {sampleCards.slice(0, 4).map((card, i) => (
                    <div
                      key={`sample-card-${item.id}-${card.id || i}-${i}`}
                      className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/90 border border-slate-800/60 text-center"
                    >
                      <span className="text-lg mb-0.5">{card.emoji || '✨'}</span>
                      <span className="text-[11px] font-medium text-slate-300 truncate w-full">
                        {card.word}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Row */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
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
                          await soundEngine.loadCustomAudio(item.customAudioUrl);
                          soundEngine.playCustomTrack(0, item.audioOffsetSec || 0);
                        } else {
                          soundEngine.previewSoundPack(
                            item.soundPack,
                            item.rounds[0]?.bpm || 110,
                            16,
                            undefined,
                            () => setActivePreviewId(null)
                          );
                        }
                      }
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activePreviewId === item.id
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                    title="Preview Track Beat"
                  >
                    {activePreviewId === item.id ? (
                      <>
                        <Square className="w-3 h-3 fill-current text-rose-400" />
                        <span>{language === 'zh' ? '停止' : 'Stop'}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3 text-pink-400" />
                        <span>{language === 'zh' ? '试听' : 'Preview'}</span>
                      </>
                    )}
                  </button>

                  <span className="text-[11px] text-slate-500">
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
                            className="px-2 py-1 rounded bg-slate-800 text-[10px] font-bold text-slate-400"
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
                            className="px-2 py-1 rounded bg-rose-500 text-[10px] font-bold text-white"
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
                          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
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
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white border border-slate-700 text-xs font-bold transition-all"
                      title="Edit Challenge"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                      <span>{language === 'zh' ? '修改' : 'Edit'}</span>
                    </button>
                  )}
                  <button
                    onClick={() => onSelectChallenge(item)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs transition-colors"
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
