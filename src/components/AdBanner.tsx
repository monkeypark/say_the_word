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
    <div className="w-full py-1 px-3 bg-slate-50 dark:bg-[#0a0d16] border-t border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Subtle, slim Ad Header */}
        <div className="w-full flex items-center justify-between text-[9px] uppercase font-semibold text-slate-400 dark:text-slate-500 mb-0.5 px-1 tracking-wider">
          <span>{language === 'zh' ? '广告' : 'ADVERTISEMENT'}</span>
          <span>Google AdSense</span>
        </div>

        {/* Ultra-slim Ad Container (50px standard mobile/desktop banner height) */}
        <div className="w-full min-h-[50px] max-h-[60px] flex items-center justify-center overflow-hidden">
          {/* speak on the beat banner */}
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', height: '50px', minHeight: '50px', maxHeight: '60px' }}
            data-ad-client={BANNER_AD_CONFIG.publisherId}
            data-ad-slot={BANNER_AD_CONFIG.slotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </div>
  );
};
