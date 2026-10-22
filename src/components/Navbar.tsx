import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Mic, MicOff, PlusCircle, Play, Globe, Music, MoreHorizontal, X } from 'lucide-react';

interface NavbarProps {
  activeTab: 'play' | 'create' | 'customList';
  setActiveTab: (tab: 'play' | 'create' | 'customList') => void;
  isMuted: boolean;
  onToggleMute: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isMicActive: boolean;
  onToggleMic: () => void;
  language: 'zh' | 'en';
  onToggleLanguage: () => void;
  onOpenSoundTest: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isMuted,
  onToggleMute,
  volume,
  onVolumeChange,
  isMicActive,
  onToggleMic,
  language,
  onToggleLanguage,
  onOpenSoundTest,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-[#0c101a]/95 backdrop-blur-md border-b border-slate-800/80 px-2.5 sm:px-6 py-2 transition-all w-full max-w-full">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3 min-w-0">
        {/* Brand */}
        <div
          onClick={() => setActiveTab('play')}
          className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer select-none group shrink-0 min-w-0"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-indigo-600 flex items-center justify-center text-sm sm:text-base shadow-sm group-hover:scale-105 transition-transform shrink-0">
            🎵
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-xs sm:text-base font-black tracking-tight text-white group-hover:text-pink-300 transition-colors whitespace-nowrap">
                SAY THE WORD
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider rounded bg-pink-500/10 border border-pink-500/20 text-pink-400 shrink-0">
                ON BEAT
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium hidden md:block truncate">
              {language === 'zh' ? '卡点报词 · 极速节奏大挑战' : 'The Viral Rhythm Word Challenge'}
            </span>
          </div>
        </div>

        {/* Navigation Tabs - Clean Segmented Control */}
        <nav className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800/80 shrink-0">
          <button
            onClick={() => setActiveTab('play')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'play'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className={`w-4 h-4 ${activeTab === 'play' ? 'text-pink-400 fill-pink-400' : ''}`} />
            <span>{language === 'zh' ? '曲目库' : 'Tracks'}</span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'create'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className={`w-4 h-4 ${activeTab === 'create' ? 'text-indigo-400' : ''}`} />
            <span>{language === 'zh' ? '自制关卡' : 'Create'}</span>
          </button>
        </nav>

        {/* More / Settings Menu Trigger (...) */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm"
            title="Menu / 菜单"
          >
            <MoreHorizontal className="w-4 h-4 text-pink-400" />
            <span className="hidden sm:inline">{language === 'zh' ? '菜单' : 'Menu'}</span>
          </button>

          {/* Dropdown Menu */}
          {isMobileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 p-3.5 rounded-2xl bg-[#0f1422] border border-slate-800 shadow-2xl z-50 flex flex-col gap-3 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-300">
                  {language === 'zh' ? '游戏与音效菜单' : 'Game & Sound Menu'}
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-slate-500 hover:text-slate-300 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sound Test / Beats Library */}
              <button
                onClick={() => {
                  onOpenSoundTest();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-between p-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-pink-400" />
                  <span>{language === 'zh' ? '伴奏与音效库 (Beats & SFX)' : 'Beats & SFX Library'}</span>
                </div>
              </button>

              {/* Microphone Toggle */}
              <button
                onClick={() => {
                  onToggleMic();
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-colors ${
                  isMicActive
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isMicActive ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4" />}
                  <span>{language === 'zh' ? '麦克风发声识别' : 'Microphone Mode'}</span>
                </div>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {isMicActive ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Volume Slider */}
              <div className="flex flex-col gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <button
                    onClick={onToggleMute}
                    className="flex items-center gap-1.5 text-slate-300 hover:text-white"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                    <span>{language === 'zh' ? '主音量' : 'Master Volume'}</span>
                  </button>
                  <span className="font-mono text-pink-400 font-bold">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-2 accent-pink-500 bg-slate-800 rounded-lg cursor-pointer mt-1"
                />
              </div>

              {/* Language Switcher */}
              <button
                onClick={() => {
                  onToggleLanguage();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-between p-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <span>{language === 'zh' ? '切换语言 (Language)' : 'Switch Language'}</span>
                </div>
                <span className="text-xs font-bold text-pink-400 uppercase bg-slate-800 px-2 py-0.5 rounded">
                  {language === 'zh' ? 'EN' : '中文'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
