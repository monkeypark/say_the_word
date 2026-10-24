/**
 * Google AdSense Configuration
 * 
 * Instructions:
 * 1. Replace 'publisherId' with your Google AdSense Publisher ID (e.g. 'ca-pub-1234567890123456').
 * 2. Replace 'slotId' with your AdSense Display Ad unit Slot ID (e.g. '1234567890').
 * 3. Set 'testMode: false' once your AdSense account is approved and ready for live production ads.
 */

export interface AdConfiguration {
  enabled: boolean;
  publisherId: string;
  slotId: string;
  gamesInterval: number; // Show ad every X completed games
  testMode: boolean;
  adCountdownSeconds: number;
}

export const AD_CONFIG: AdConfiguration = {
  enabled: true,
  // Google AdSense Publisher ID (Replace with your ca-pub-XXXXXXXXXXXXXXXX)
  publisherId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADSENSE_PUB_ID) || 'ca-pub-3940256099942544',
  // Ad Unit Slot ID (from your Google AdSense Dashboard -> Ads -> By ad unit)
  slotId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADSENSE_SLOT_ID) || '1234567890',
  // Frequency: show an ad every 4 completed games
  gamesInterval: 4,
  // Keep testMode true until your AdSense account & domain are approved
  testMode: true,
  // Seconds before close/skip button becomes active
  adCountdownSeconds: 3,
};
