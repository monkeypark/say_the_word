/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { GameBoard } from './components/GameBoard';
import { ChallengeList } from './components/ChallengeList';
import { ChallengeCreator } from './components/ChallengeCreator';
import { DEFAULT_CHALLENGES, VIRAL_CLASSICS_MUSIC } from './data/defaultChallenges';
import { Challenge } from './types/game';
import { soundEngine } from './services/soundEngine';
import { AdService } from './services/adService';
import { AdBanner } from './components/AdBanner';

const STORAGE_KEY_CUSTOM_CHALLENGES = 'say_the_word_custom_challenges_v1';
const STORAGE_KEY_LANGUAGE = 'say_the_word_language_v1';
const STORAGE_KEY_THEME = 'say_the_word_theme_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'play' | 'create' | 'customList'>('play');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);

  // Settings
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
    } catch (_) {}
    return 'light';
  });
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMicActive, setIsMicActive] = useState(false);

  // Apply theme class to HTML root and persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    } catch (_) {}

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Challenges collection
  const [challenges, setChallenges] = useState<Challenge[]>(DEFAULT_CHALLENGES);

  // Load from local storage on mount
  useEffect(() => {
    AdService.initAdSense();
    try {
      const savedLang = localStorage.getItem(STORAGE_KEY_LANGUAGE);
      if (savedLang === 'en' || savedLang === 'zh') {
        setLanguage(savedLang);
      }

      const savedCustom = localStorage.getItem(STORAGE_KEY_CUSTOM_CHALLENGES);
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        if (Array.isArray(parsed)) {
          // Merge custom challenges, replacing default ones with the same ID if necessary
          const merged = [...DEFAULT_CHALLENGES];
          parsed.forEach((custom: Challenge) => {
            // Ensure every challenge uses beat.mp3 as universal game music
            const sanitized: Challenge = {
              ...custom,
              isCustom: true,
              soundPack: 'drill',
              customAudioUrl: '/assets/music/beat.mp3',
              audioFileName: 'beat.mp3',
              audioOffsetSec: custom.audioOffsetSec !== undefined ? custom.audioOffsetSec : 2.626,
              introDurationSec: 2.626,
              audioLoopEndSec: 5.251,
              baseBpm: 182.8,
              introStyle: 'quick_8',
              cardPool: (custom.cardPool || []).map(c => ({
                ...c,
                emoji: undefined,
                subtext: undefined,
              })),
              rounds: (custom.rounds || []).map(r => ({
                ...r,
                bpm: r.bpm || 160,
                cards: (r.cards || []).map(c => ({
                  ...c,
                  emoji: undefined,
                  subtext: undefined,
                })),
              })),
            };
            const idx = merged.findIndex(c => c.id === sanitized.id);
            if (idx !== -1) {
              merged[idx] = sanitized;
            } else {
              merged.push(sanitized);
            }
          });
          setChallenges(merged);
        }
      }
    } catch (e) {
      console.warn('Failed to load local storage:', e);
    }
  }, []);

  // Sync volume with sound engine
  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    soundEngine.setVolume(vol);
    if (vol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleLanguage = () => {
    const nextLang = language === 'zh' ? 'en' : 'zh';
    setLanguage(nextLang);
    try {
      localStorage.setItem(STORAGE_KEY_LANGUAGE, nextLang);
    } catch (_) {}
  };

  // Save new or updated challenge
  const handleSaveChallenge = (challenge: Challenge) => {
    const formattedChallenge: Challenge = {
      ...challenge,
      isCustom: true,
      soundPack: 'drill',
      customAudioUrl: '/assets/music/beat.mp3',
      audioFileName: 'beat.mp3',
      audioOffsetSec: 2.626,
      introDurationSec: 2.626,
      audioLoopEndSec: 5.251,
      baseBpm: 182.8,
      introStyle: 'quick_8',
      rounds: (challenge.rounds || []).map((r) => ({
        ...r,
        bpm: r.bpm || 160,
      })),
    };

    setChallenges((prev) => {
      const exists = prev.some((c) => c.id === formattedChallenge.id);
      let updated: Challenge[];
      if (exists) {
        updated = prev.map((c) => (c.id === formattedChallenge.id ? formattedChallenge : c));
      } else {
        updated = [formattedChallenge, ...prev];
      }

      // Persist only custom ones
      const customOnly = updated.filter((c) => c.isCustom);
      try {
        localStorage.setItem(STORAGE_KEY_CUSTOM_CHALLENGES, JSON.stringify(customOnly));
      } catch (e) {
        console.warn('Failed to persist challenge:', e);
      }

      return updated;
    });

    setActiveTab('play');
    setEditingChallenge(null);
    setSelectedChallenge(formattedChallenge);
  };

  // Delete challenge
  const handleDeleteChallenge = (id: string) => {
    setChallenges((prev) => {
      // 1. Remove the challenge from the list
      let updated = prev.filter((c) => c.id !== id);
      
      // 2. If we deleted an override of a default challenge, restore the default at its original position
      const defaultMatch = DEFAULT_CHALLENGES.find(c => c.id === id);
      if (defaultMatch) {
        // Find original index in DEFAULT_CHALLENGES to try to keep order
        const originalIndex = DEFAULT_CHALLENGES.findIndex(c => c.id === id);
        updated.splice(originalIndex, 0, defaultMatch);
      }

      // 3. Immediately persist updated custom challenges
      const customOnly = updated.filter((c) => c.isCustom);
      try {
        localStorage.setItem(STORAGE_KEY_CUSTOM_CHALLENGES, JSON.stringify(customOnly));
      } catch (e) {
        console.warn('Failed to persist after delete:', e);
      }
      
      return [...updated]; // Return new array to trigger re-render
    });

    if (selectedChallenge?.id === id) {
      setSelectedChallenge(null);
    }
  };

  // Import challenge
  const handleImportChallenge = (imported: Challenge) => {
    const formatted: Challenge = {
      ...imported,
      isCustom: true,
      soundPack: 'drill',
      customAudioUrl: '/assets/music/beat.mp3',
      audioFileName: 'beat.mp3',
      audioOffsetSec: 2.626,
      introDurationSec: 2.626,
      audioLoopEndSec: 5.251,
      baseBpm: 182.8,
      introStyle: 'quick_8',
      rounds: (imported.rounds || []).map((r) => ({
        ...r,
        bpm: r.bpm || 160,
      })),
    };

    setChallenges((prev) => {
      const updated = [formatted, ...prev];
      const customOnly = updated.filter((c) => c.isCustom);
      try {
        localStorage.setItem(STORAGE_KEY_CUSTOM_CHALLENGES, JSON.stringify(customOnly));
      } catch (_) {}
      return updated;
    });
    setSelectedChallenge(formatted);
    setActiveTab('play');
  };

  // Copy / Duplicate challenge
  const handleCopyChallenge = (challenge: Challenge, autoEdit = false) => {
    const newId = `custom_${Date.now()}`;
    const copySuffix = language === 'zh' ? ' (副本)' : ' (Copy)';
    const cloned: Challenge = {
      ...JSON.parse(JSON.stringify(challenge)),
      id: newId,
      title: `${challenge.title}${copySuffix}`,
      isCustom: true,
      soundPack: 'drill',
      customAudioUrl: '/assets/music/beat.mp3',
      audioFileName: 'beat.mp3',
      audioOffsetSec: 2.626,
      introDurationSec: 2.626,
      audioLoopEndSec: 5.251,
      baseBpm: 182.8,
      introStyle: 'quick_8',
      rounds: (challenge.rounds || []).map((r) => ({
        ...r,
        bpm: r.bpm || 160,
      })),
    };

    setChallenges((prev) => {
      const updated = [cloned, ...prev];
      const customOnly = updated.filter((c) => c.isCustom);
      try {
        localStorage.setItem(STORAGE_KEY_CUSTOM_CHALLENGES, JSON.stringify(customOnly));
      } catch (e) {
        console.warn('Failed to persist copied challenge:', e);
      }
      return updated;
    });

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(JSON.stringify(cloned, null, 2));
      }
    } catch (_) {}

    if (autoEdit) {
      soundEngine.stopRhythm();
      soundEngine.stopPreview();
      setEditingChallenge(cloned);
      setSelectedChallenge(null);
      setActiveTab('create');
    }

    return cloned;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-pink-500 selection:text-white w-full max-w-full overflow-x-hidden transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'play' && !selectedChallenge) {
            // Keep on list
          } else if (tab === 'create') {
            setEditingChallenge(null);
            setSelectedChallenge(null);
          }
        }}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        isMicActive={isMicActive}
        onToggleMic={() => setIsMicActive((prev) => !prev)}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'create' ? (
          <ChallengeCreator
            key={editingChallenge ? `edit-${editingChallenge.id}-${editingChallenge.rounds.length}` : 'create-new'}
            initialChallenge={editingChallenge}
            onSave={handleSaveChallenge}
            onPlayDirectly={(challenge) => {
              const formatted: Challenge = {
                ...challenge,
                isCustom: true,
                ...VIRAL_CLASSICS_MUSIC,
              };
              setSelectedChallenge(formatted);
              setActiveTab('play');
            }}
            language={language}
            onCancel={() => {
              setActiveTab('play');
              setEditingChallenge(null);
            }}
          />
        ) : selectedChallenge ? (
          <GameBoard
            key={`${selectedChallenge.id}-${selectedChallenge.rounds.length}`}
            challenge={selectedChallenge}
            isMicActive={isMicActive}
            onToggleMic={() => setIsMicActive((prev) => !prev)}
            language={language}
            onBackToMenu={() => {
              soundEngine.stopRhythm();
              soundEngine.stopPreview();
              setSelectedChallenge(null);
            }}
            onEditChallenge={(c) => {
              soundEngine.stopRhythm();
              soundEngine.stopPreview();
              setEditingChallenge(c);
              setSelectedChallenge(null);
              setActiveTab('create');
            }}
            onCopyChallenge={(c) => {
              handleCopyChallenge(c, true);
            }}
          />
        ) : (
          <ChallengeList
            challenges={challenges}
            onSelectChallenge={(c) => setSelectedChallenge(c)}
            onCreateNew={() => {
              setEditingChallenge(null);
              setActiveTab('create');
            }}
            onEditChallenge={(c) => {
              setEditingChallenge(c);
              setActiveTab('create');
            }}
            onCopyChallenge={(c) => {
              handleCopyChallenge(c, false);
            }}
            onDeleteChallenge={handleDeleteChallenge}
            onImportChallenge={handleImportChallenge}
            language={language}
          />
        )}
      </main>

      {/* Footer - hide on mobile during gameplay to keep game board fitted on screen */}
      <footer className={`${selectedChallenge ? 'hidden sm:block' : 'block'} border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0d16]/80 py-4 px-4 text-center text-xs text-slate-600 dark:text-slate-400 transition-colors shadow-xs`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-black text-pink-400">SPEAK ON THE BEAT</span>
            <span>•</span>
            <span>{language === 'zh' ? '卡点报词节奏挑战' : 'Viral Rhythm Game'}</span>
          </div>
          <p>
            {language === 'zh'
              ? '支持 Web Audio 零延迟合成伴奏、麦克风声学拾音、AI 智能关卡生成。'
              : 'Zero-latency Web Audio engine, mic voice onset detection, and AI challenge generation.'}
          </p>
        </div>
      </footer>

      {/* Google AdSense Bottom Banner at the absolute bottom of page */}
      <AdBanner language={language} />
    </div>
  );
}
