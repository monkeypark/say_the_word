/**
 * Google AdSense Configuration
 * 
 * Instructions:
 * 1. Replace 'publisherId' with your Google AdSense Publisher ID (e.g. 'ca-pub-1234567890123456').
 * 2. Replace 'slotId' with your AdSense Interstitial Modal Slot ID.
 * 3. Replace 'bannerSlotId' with your AdSense Bottom Banner Display Slot ID.
 * 4. Set 'testMode: false' once your AdSense account is approved and ready for live production ads.
 */

export interface AdConfiguration {
  enabled: boolean;
  publisherId: string;
  slotId: string; // Interstitial Modal Slot ID
  bannerSlotId: string; // Bottom Banner Slot ID
  bannerEnabled: boolean; // Bottom Banner toggle
  gamesInterval: number; // Show interstitial ad every X completed games
  testMode: boolean;
  adCountdownSeconds: number;
}

export const AD_CONFIG: AdConfiguration = {
  enabled: true,
  // Google AdSense Publisher ID
  publisherId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADSENSE_PUB_ID) || 'ca-pub-3612854431763761',
  // Interstitial Ad Unit Slot ID (for every 4 games modal)
  slotId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADSENSE_SLOT_ID) || '9775053206',
  // Bottom Banner Slot ID (Speak on the beat banner)
  bannerSlotId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADSENSE_BANNER_SLOT_ID) || '9775053206',
  // Enable bottom banner ad
  bannerEnabled: true,
  // Frequency: show interstitial ad every 4 completed games
  gamesInterval: 4,
  // Live mode enabled for real ads
  testMode: false,
  // Seconds before close/skip button becomes active in modal
  adCountdownSeconds: 3,
};
