import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { AD_CONFIG } from '../config/adConfig';

interface AdBannerProps {
  language?: 'zh' | 'en';
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export const AdBanner: React.FC<AdBannerProps> = ({ language = 'zh' }) => {
  const [adLoaded, setAdLoaded] = useState(false);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!AD_CONFIG.enabled || !AD_CONFIG.bannerEnabled) return;

    if (!pushedRef.current) {
      pushedRef.current = true;
      const timer = setTimeout(() => {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setAdLoaded(true);
        } catch (e) {
          console.log('AdBanner adsbygoogle push caught:', e);
        }
      }, 200);

      return () => clearTimeout(timer);
    }
  }, []);

  if (!AD_CONFIG.enabled || !AD_CONFIG.bannerEnabled) return null;

  return (
    <div className="w-full py-3 px-4 bg-slate-50/80 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Subtle Ad Label */}
        <div className="w-full flex items-center justify-between text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 mb-1.5 px-1 tracking-wider">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-pink-500" />
            {language === 'zh' ? '赞助商广告' : 'SPONSORED ADVERTISEMENT'}
          </span>
          <span>Google AdSense</span>
        </div>

        {/* Ad Container */}
        <div className="w-full min-h-[90px] bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-center overflow-hidden relative">
          {/* Real Google AdSense Banner Tag */}
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', minHeight: '90px' }}
            data-ad-client={AD_CONFIG.publisherId}
            data-ad-slot={AD_CONFIG.bannerSlotId}
            data-ad-format="horizontal"
            data-full-width-responsive="true"
          />

          {/* Test Mode / Fallback Banner Preview */}
          {(AD_CONFIG.testMode || !adLoaded) && (
            <div className="absolute inset-0 bg-white dark:bg-slate-950 flex items-center justify-between px-4 sm:px-6 py-2 pointer-events-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      Google AdSense Banner
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-pink-500/10 text-pink-500 border border-pink-500/20">
                      {language === 'zh' ? '横幅展示位' : 'Display Slot'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'zh'
                      ? '正式上线请在 src/config/adConfig.ts 填入您的真实 Banner Slot ID'
                      : 'Set your real bannerSlotId in src/config/adConfig.ts for live ads'}
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex flex-col items-end text-[10px] font-mono text-slate-600 dark:text-slate-400">
                <span>Slot: {AD_CONFIG.bannerSlotId}</span>
                <span>Pub: {AD_CONFIG.publisherId}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
