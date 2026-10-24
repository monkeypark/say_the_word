import React, { useEffect, useState, useRef } from 'react';
import { X, Sparkles, ShieldCheck, Clock } from 'lucide-react';
import { AD_CONFIG } from '../config/adConfig';

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'zh' | 'en';
  gamesCompletedCount: number;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export const AdModal: React.FC<AdModalProps> = ({
  isOpen,
  onClose,
  language,
  gamesCompletedCount,
}) => {
  const [countdown, setCountdown] = useState<number>(AD_CONFIG.adCountdownSeconds || 3);
  const [adLoaded, setAdLoaded] = useState<boolean>(false);
  const adPushedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(AD_CONFIG.adCountdownSeconds || 3);
      adPushedRef.current = false;
      return;
    }

    // Countdown interval
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Initialize AdSense unit
    try {
      if (typeof window !== 'undefined' && !adPushedRef.current) {
        adPushedRef.current = true;
        // Wait a tick for the DOM <ins> element to mount
        setTimeout(() => {
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            setAdLoaded(true);
          } catch (e) {
            console.log('AdSense push caught:', e);
          }
        }, 150);
      }
    } catch (_) {}

    return () => {
      clearInterval(timer);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const canClose = countdown <= 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative max-w-lg w-full bg-white dark:bg-slate-950 border-2 border-indigo-400/50 dark:border-indigo-500/40 rounded-3xl p-5 sm:p-7 text-center shadow-2xl shadow-indigo-500/20 flex flex-col items-center">
        {/* Header Bar */}
        <div className="w-full flex items-center justify-between gap-3 mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {language === 'zh' ? '赞助商广告' : 'SPONSORED'}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {language === 'zh' ? `第 ${gamesCompletedCount} 局已通关` : `Game ${gamesCompletedCount} Completed`}
            </span>
          </div>

          {/* Close button with countdown */}
          <button
            onClick={() => {
              if (canClose) onClose();
            }}
            disabled={!canClose}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              canClose
                ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white cursor-pointer active:scale-95'
                : 'bg-slate-100/50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            {canClose ? (
              <>
                <X className="w-4 h-4" />
                <span>{language === 'zh' ? '关闭' : 'Close'}</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>{language === 'zh' ? `${countdown}s 后可跳过` : `Skip in ${countdown}s`}</span>
              </>
            )}
          </button>
        </div>

        {/* Ad Content Area */}
        <div className="w-full min-h-[260px] sm:min-h-[280px] bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-3 flex flex-col items-center justify-center overflow-hidden relative">
          {/* Real Google AdSense Tag */}
          <div className="w-full flex justify-center">
            <ins
              className="adsbygoogle"
              style={{ display: 'block', width: '100%', minWidth: '280px', minHeight: '250px' }}
              data-ad-client={AD_CONFIG.publisherId}
              data-ad-slot={AD_CONFIG.slotId}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>

          {/* Test Mode / Fallback Card when testMode is active */}
          {AD_CONFIG.testMode && (
            <div className="absolute inset-0 bg-slate-50/95 dark:bg-slate-900/95 flex flex-col items-center justify-center p-5 text-center pointer-events-none">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h4 className="text-base font-black text-slate-900 dark:text-white mb-1">
                Google AdSense
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-3">
                {language === 'zh'
                  ? '每 4 局游戏展示一次插屏广告。正式上线前请在 src/config/adConfig.ts 填入您的真实 Publisher ID。'
                  : 'Shown every 4 completed games. Replace publisher ID in src/config/adConfig.ts with your real AdSense ID.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-200/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <span>Client: {AD_CONFIG.publisherId}</span>
                <span>•</span>
                <span>Slot: {AD_CONFIG.slotId}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Continue Button */}
        <div className="w-full mt-4">
          <button
            onClick={() => {
              if (canClose) onClose();
            }}
            disabled={!canClose}
            className={`w-full py-3 rounded-2xl font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 ${
              canClose
                ? 'bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white shadow-pink-500/25 hover:scale-[1.02] active:scale-[0.99] cursor-pointer'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
            }`}
          >
            {canClose
              ? (language === 'zh' ? '继续游戏 ✨' : 'Continue Playing ✨')
              : (language === 'zh' ? `广告展示中 (${countdown}s)` : `Ad in progress (${countdown}s)`)}
          </button>
        </div>
      </div>
    </div>
  );
};
