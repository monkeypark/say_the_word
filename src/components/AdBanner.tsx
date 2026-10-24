import React, { useEffect, useRef } from 'react';
import { BANNER_AD_CONFIG } from '../config/adConfig';

interface AdBannerProps {
  language?: 'zh' | 'en';
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export const AdBanner: React.FC<AdBannerProps> = ({ language = 'zh' }) => {
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!BANNER_AD_CONFIG.enabled) return;

    if (!pushedRef.current) {
      pushedRef.current = true;
      const timer = setTimeout(() => {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
          console.log('AdBanner adsbygoogle push caught:', e);
        }
      }, 200);

      return () => clearTimeout(timer);
    }
  }, []);

  if (!BANNER_AD_CONFIG.enabled) return null;

  return (
    <div className="w-full py-0.5 px-2 bg-slate-50 dark:bg-[#0a0d16] border-t border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 h-[28px] sm:h-[32px] overflow-hidden">
        {/* Subtle inline ad label badge */}
        <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 rounded px-1 shrink-0 select-none">
          {language === 'zh' ? '广告' : 'AD'}
        </span>

        {/* Ultra-compact, half-height container */}
        <div className="flex-1 h-[28px] sm:h-[32px] flex items-center justify-center overflow-hidden">
          <div className="w-full flex items-center justify-center origin-center transform scale-[0.55] sm:scale-[0.6]">
            {/* speak on the beat banner */}
            <ins
              className="adsbygoogle"
              style={{ display: 'block', width: '100%', minWidth: '300px', height: '50px' }}
              data-ad-client={BANNER_AD_CONFIG.publisherId}
              data-ad-slot={BANNER_AD_CONFIG.slotId}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
