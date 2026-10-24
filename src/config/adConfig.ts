/**
 * Google AdSense Configuration
 * 
 * Separated into two distinct configurations:
 * 1. BANNER_AD_CONFIG: Bottom banner advertisement
 * 2. GAMES_4_AD_CONFIG: Interstitial modal advertisement shown every 4 games
 */

/**
 * 1. Bottom Banner Ad Configuration (底部横幅广告配置)
 */
export interface BannerAdConfig {
  enabled: boolean;
  publisherId: string;
  slotId: string; // Bottom banner ad unit slot ID
  testMode: boolean; // Set false for live production ads
}

export const BANNER_AD_CONFIG: BannerAdConfig = {
  enabled: true,
  // Google AdSense Publisher ID
  publisherId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADSENSE_PUB_ID) || 'ca-pub-3612854431763761',
  // Banner Ad Slot ID (speak on the beat banner)
  slotId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADSENSE_BANNER_SLOT_ID) || '9775053206',
  // Live mode enabled for real ads
  testMode: false,
};

/**
 * 2. Every 4 Games Ad Configuration (每4局游戏插屏广告配置)
 */
export interface Games4AdConfig {
  enabled: boolean;
  publisherId: string;
  slotId: string; // 4-games interstitial modal slot ID
  gamesInterval: number; // Show ad every X completed games (default: 4)
  testMode: boolean; // Set false for live production ads
  adCountdownSeconds: number; // Seconds before user can skip/close the ad
}

export const GAMES_4_AD_CONFIG: Games4AdConfig = {
  enabled: true,
  // Google AdSense Publisher ID
  publisherId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADSENSE_PUB_ID) || 'ca-pub-3612854431763761',
  // 4-games square ad modal slot ID (speak on the beat square ad)
  slotId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADSENSE_INTERSTITIAL_SLOT_ID) || '1704991499',
  // Show ad every 4 completed games
  gamesInterval: 4,
  // Live mode enabled for real ads
  testMode: false,
  // Countdown seconds before skip is allowed
  adCountdownSeconds: 3,
};

// Convenient aliases
export const INTERSTITIAL_AD_CONFIG = GAMES_4_AD_CONFIG;
