import { AD_CONFIG } from '../config/adConfig';

const STORAGE_KEY_GAMES_COUNT = 'say_the_word_games_played_count_v1';

export class AdService {
  /**
   * Dynamically ensure Google AdSense script is injected into <head>
   */
  public static initAdSense(): void {
    if (typeof window === 'undefined' || !AD_CONFIG.enabled) return;

    const existing = document.querySelector('script[src*="pagead2.googlesyndication.com"]');
    if (!existing) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CONFIG.publisherId}`;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }
  }

  /**
   * Get total number of completed games from localStorage
   */
  public static getGamesPlayedCount(): number {
    try {
      const val = localStorage.getItem(STORAGE_KEY_GAMES_COUNT);
      return val ? Math.max(0, parseInt(val, 10) || 0) : 0;
    } catch (_) {
      return 0;
    }
  }

  /**
   * Increment game count by 1 upon game completion
   * Returns the new games count
   */
  public static incrementGamesPlayed(): number {
    try {
      const current = this.getGamesPlayedCount() + 1;
      localStorage.setItem(STORAGE_KEY_GAMES_COUNT, current.toString());
      return current;
    } catch (_) {
      return 1;
    }
  }

  /**
   * Determine whether an ad should trigger for this game count
   * E.g. every 4 games (game 4, 8, 12, 16...)
   */
  public static shouldShowAd(count?: number): boolean {
    if (!AD_CONFIG.enabled) return false;
    const current = count !== undefined ? count : this.getGamesPlayedCount();
    return current > 0 && current % AD_CONFIG.gamesInterval === 0;
  }

  /**
   * Get progress to next ad (e.g. 1/4, 2/4, 3/4, 4/4)
   */
  public static getNextAdProgress(count?: number): { current: number; total: number } {
    const current = count !== undefined ? count : this.getGamesPlayedCount();
    const interval = AD_CONFIG.gamesInterval;
    const modulo = current % interval;
    return {
      current: modulo === 0 && current > 0 ? interval : modulo,
      total: interval,
    };
  }

  /**
   * Reset game counter
   */
  public static resetGamesPlayed(): void {
    try {
      localStorage.setItem(STORAGE_KEY_GAMES_COUNT, '0');
    } catch (_) {}
  }
}
