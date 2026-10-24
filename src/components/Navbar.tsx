import React from 'react';
import { Volume2, VolumeX, Mic, MicOff, PlusCircle, Play, Globe, Sun, Moon } from 'lucide-react';

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
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isMuted,
  onToggleMute,
  isMicActive,
  onToggleMic,
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0c101a]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-2.5 transition-colors w-full max-w-full shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3 min-w-0">
        {/* Brand */}
        <div
          onClick={() => setActiveTab('play')}
          className="flex items-center gap-2 cursor-pointer select-none group shrink-0 min-w-0"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-indigo-600 flex items-center justify-center text-base shadow-sm group-hover:scale-105 transition-transform shrink-0">
            🎵
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors whitespace-nowrap">
                SPEAK ON
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-pink-500/10 dark:bg-pink-500/20 border border-pink-500/20 dark:border-pink-500/40 text-pink-600 dark:text-pink-400 shrink-0">
                THE BEAT
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden md:block truncate">
              {language === 'zh' ? '卡点报词 · 极速节奏大挑战' : 'The Viral Rhythm Word Challenge'}
            </span>
          </div>
        </div>

        {/* Navigation Tabs - Clean Segmented Control */}
        <nav className="flex items-center p-1 rounded-xl bg-slate-200/70 dark:bg-slate-900/90 border border-slate-300/80 dark:border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('play')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'play'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${activeTab === 'play' ? 'text-pink-600 fill-pink-600' : ''}`} />
            <span>{language === 'zh' ? '曲目库' : 'Tracks'}</span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'create'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <PlusCircle className={`w-3.5 h-3.5 ${activeTab === 'create' ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
            <span>{language === 'zh' ? '自制关卡' : 'Create'}</span>
          </button>
        </nav>

        {/* Right Controls: Mic, Volume, Theme, Language */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Microphone Mode */}
          <button
            onClick={onToggleMic}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all shadow-2xs ${
              isMicActive
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-400'
                : 'bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300'
            }`}
            title={language === 'zh' ? '麦克风发声识别' : 'Microphone Mode'}
          >
            {isMicActive ? <Mic className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <MicOff className="w-3.5 h-3.5 text-slate-700 dark:text-slate-400" />}
            <span className="hidden sm:inline text-[11px] font-bold">{isMicActive ? 'MIC ON' : 'MIC'}</span>
          </button>

          {/* Volume / Mute Toggle */}
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-xl text-xs font-bold border transition-all shadow-2xs ${
              isMuted
                ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30 text-rose-600'
                : 'bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300'
            }`}
            title={language === 'zh' ? (isMuted ? '开启声音' : '静音') : (isMuted ? 'Unmute' : 'Mute')}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />}
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-xs font-bold border transition-all bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300 shadow-2xs"
            title={theme === 'dark' ? (language === 'zh' ? '切换浅色模式' : 'Switch to Light Mode') : (language === 'zh' ? '切换深色模式' : 'Switch to Dark Mode')}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Language Switcher */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300 text-xs font-bold transition-all shadow-2xs"
            title="Switch Language / 切换语言"
          >
            <Globe className="w-3.5 h-3.5 text-pink-600" />
            <span>{language === 'zh' ? 'EN' : '中文'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
