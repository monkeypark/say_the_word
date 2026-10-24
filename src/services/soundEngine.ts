import { SoundPackType, MetronomeAccentType } from '../types/game';

export interface RoundSessionOptions {
  bpm: number;
  introBeats: number;
  cardsCount: number;
  totalGameBeats: number;
  soundPack?: SoundPackType;
  customAudioUrl?: string;
  customIntroAudioUrl?: string;
  audioOffsetSec?: number;
  introDurationSec?: number;
  audioLoopEndSec?: number;
  baseBpm?: number;
  onIntroBeat?: (currentIntroBeat: number, totalIntroBeats: number, audioTime: number) => void;
  onGameBeat?: (cardIndex: number, currentBeatInRound: number, audioTime: number) => void;
  onRoundComplete?: (nextBeatTime: number) => void;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private currentBpm: number = 160;
  private soundPack: SoundPackType = 'whistle';
  private metronomeAccent: MetronomeAccentType = 'woodblock';
  private masterGain: GainNode | null = null;
  private rhythmGain: GainNode | null = null;
  private volume: number = 0.8;
  private isMuted: boolean = false;

  // Lookahead scheduler properties
  private nextBeatTime: number = 0;
  private beatIndex: number = 0;
  private timerId: number | null = null;
  private cardsCount: number = 4;

  private scheduleAheadTime: number = 0.1; // seconds to look ahead
  private lookaheadIntervalMs: number = 25; // check every 25ms

  // Active round session config
  private activeSession: RoundSessionOptions | null = null;
  private onSimpleBeatCallback: ((beatIndex: number, audioTime: number) => void) | null = null;

  // Preview state
  private previewTimer: number | null = null;
  private previewing: boolean = false;

  constructor() {
    // AudioContext will be initialized on user interaction
  }

  public init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private ensureRhythmGain(): GainNode {
    this.init();
    if (!this.rhythmGain && this.ctx && this.masterGain) {
      this.rhythmGain = this.ctx.createGain();
      this.rhythmGain.gain.setValueAtTime(1.5, this.ctx.currentTime);
      this.rhythmGain.connect(this.masterGain);
    }
    return this.rhythmGain!;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setSoundPack(pack: SoundPackType) {
    this.soundPack = pack;
  }

  public getSoundPack(): SoundPackType {
    return this.soundPack;
  }

  public setMetronomeAccent(accent: MetronomeAccentType) {
    this.metronomeAccent = accent;
  }

  public getMetronomeAccent(): MetronomeAccentType {
    return this.metronomeAccent;
  }

  public setBpm(bpm: number) {
    this.currentBpm = Math.max(40, Math.min(260, bpm));
  }

  public getBpm(): number {
    return this.currentBpm;
  }

  public getCurrentTime(): number {
    return this.ctx ? this.ctx.currentTime : 0;
  }

  // Precise scheduled count-in tick sound with multiple metronome timbre variations
  public playScheduledTick(time: number, isAccent: boolean = false) {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const rhythmBus = this.ensureRhythmGain();

    if (this.metronomeAccent === 'cowbell') {
      // 808 Style Cowbell
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'square';
      osc2.type = 'square';
      const baseF = isAccent ? 800 : 560;
      osc1.frequency.setValueAtTime(baseF, time);
      osc2.frequency.setValueAtTime(baseF * 1.5, time);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(baseF * 1.2, time);
      filter.Q.setValueAtTime(3.5, time);

      gain.gain.setValueAtTime(isAccent ? 0.35 : 0.22, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(rhythmBus);

      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + 0.14);
      osc2.stop(time + 0.14);
      return;
    }

    if (this.metronomeAccent === 'electronic') {
      // Crisp digital bleep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const freq = isAccent ? 2400 : 1600;
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(isAccent ? 0.45 : 0.28, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

      osc.connect(gain);
      gain.connect(rhythmBus);

      osc.start(time);
      osc.stop(time + 0.06);
      return;
    }

    // Default: Organic Woodblock metronome click
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const freq = isAccent ? 1200 : 750;
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.7, time + 0.08);

    gain.gain.setValueAtTime(isAccent ? 0.55 : 0.38, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    osc.connect(gain);
    gain.connect(rhythmBus);

    osc.start(time);
    osc.stop(time + 0.12);
  }

  // Plays a count-in metronome click immediately
  public playCountTick(pitchHigh: boolean = false) {
    this.init();
    if (!this.ctx) return;
    this.playScheduledTick(this.ctx.currentTime, pitchHigh);
  }

  // Synthesize a stylish rising ready sound (fallback if no audio file)
  public playReadySound() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const baseTime = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, baseTime);
    osc.frequency.exponentialRampToValueAtTime(880, baseTime + 0.15);

    gain.gain.setValueAtTime(0.35, baseTime);
    gain.gain.exponentialRampToValueAtTime(0.001, baseTime + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(baseTime);
    osc.stop(baseTime + 0.2);
  }

  // Support for user custom uploaded audio file (MP3 / WAV / OGG / AAC)
  private customAudioBuffer: AudioBuffer | null = null;
  private customAudioSource: AudioBufferSourceNode | null = null;
  private currentCustomAudioUrl: string | null = null;
  private pendingAudioDecode: Promise<boolean> | null = null;

  public async loadCustomAudio(urlOrDataUri: string): Promise<boolean> {
    this.init();
    if (!this.ctx) return false;
    if (this.currentCustomAudioUrl === urlOrDataUri && this.customAudioBuffer) {
      return true; // Already loaded and decoded
    }
    if (this.pendingAudioDecode && this.currentCustomAudioUrl === urlOrDataUri) {
      return this.pendingAudioDecode;
    }

    this.pendingAudioDecode = (async () => {
      try {
        let resolvedUrl = urlOrDataUri;
        if (
          urlOrDataUri.startsWith('/') &&
          !urlOrDataUri.startsWith('//') &&
          !urlOrDataUri.startsWith('data:') &&
          !urlOrDataUri.startsWith('blob:')
        ) {
          const base = import.meta.env.BASE_URL || './';
          resolvedUrl = base.endsWith('/')
            ? `${base}${urlOrDataUri.slice(1)}`
            : `${base}/${urlOrDataUri.slice(1)}`;
        }
        const response = await fetch(resolvedUrl);
        const arrayBuffer = await response.arrayBuffer();
        if (this.ctx) {
          this.customAudioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
          this.currentCustomAudioUrl = urlOrDataUri;

          // If a session is actively running during the intro phase and customAudioSource hasn't started yet, launch it immediately!
          if (this.isRunning && this.activeSession && this.beatIndex < this.activeSession.introBeats && !this.customAudioSource) {
            const session = this.activeSession;
            const secondsPerBeat = 60.0 / this.currentBpm;
            const baseBpm = session.baseBpm || (session.customAudioUrl?.includes('beat.mp3') ? 182.8 : session.bpm);
            const rate = (baseBpm && baseBpm > 0) ? (session.bpm / baseBpm) : 1.0;
            const introElapsedSec = this.beatIndex * secondsPerBeat;
            const audioOffset = introElapsedSec * rate;
            this.playCustomTrack(this.ctx.currentTime, audioOffset, 1.0, undefined, rate);
          }
          return true;
        }
        return false;
      } catch (e) {
        console.warn('Failed to decode user audio track:', e);
        return false;
      } finally {
        this.pendingAudioDecode = null;
      }
    })();

    return this.pendingAudioDecode;
  }

  private customAudioGain: GainNode | null = null;

  public playCustomTrack(
    startTime: number = 0,
    offsetSec: number = 0,
    volumeMultiplier: number = 1.0,
    loopEndSec?: number,
    playbackRate: number = 1.0
  ) {
    this.init();
    if (!this.ctx || !this.customAudioBuffer || this.isMuted) return;

    this.stopCustomTrack();

    this.customAudioSource = this.ctx.createBufferSource();
    this.customAudioSource.buffer = this.customAudioBuffer;

    // Scale playback speed dynamically to match customized BPM
    const safeRate = Math.max(0.2, Math.min(3.0, playbackRate || 1.0));
    this.customAudioSource.playbackRate.setValueAtTime(safeRate, this.ctx.currentTime);

    if (loopEndSec && loopEndSec > offsetSec) {
      this.customAudioSource.loop = true;
      this.customAudioSource.loopStart = offsetSec;
      this.customAudioSource.loopEnd = loopEndSec;
    }

    this.customAudioGain = this.ctx.createGain();
    this.customAudioGain.gain.setValueAtTime(Math.max(0, volumeMultiplier), this.ctx.currentTime);

    this.customAudioSource.connect(this.customAudioGain);
    this.customAudioGain.connect(this.masterGain!);

    const playAt = Math.max(startTime, this.ctx.currentTime);
    const safeOffset = Math.min(Math.max(0, offsetSec), this.customAudioBuffer.duration - 0.05);
    this.customAudioSource.start(playAt, safeOffset);
  }

  public stopCustomTrack() {
    if (this.customAudioSource) {
      try {
        this.customAudioSource.stop();
      } catch (e) {}
      try {
        this.customAudioSource.disconnect();
      } catch (e) {}
      this.customAudioSource = null;
    }
    if (this.customAudioGain) {
      try {
        this.customAudioGain.disconnect();
      } catch (e) {}
      this.customAudioGain = null;
    }
  }

  public getHasCustomAudio(): boolean {
    return !!this.customAudioBuffer;
  }

  // Support for external intro / pre-music file
  private introBuffer: AudioBuffer | null = null;
  private introSource: AudioBufferSourceNode | null = null;
  private currentIntroAudioUrl: string | null = null;

  public async loadIntroMusic(urlOrDataUri: string = '/assets/music/beat.mp3'): Promise<boolean> {
    this.init();
    if (!this.ctx) return false;
    if (this.currentIntroAudioUrl === urlOrDataUri && this.introBuffer) return true;

    try {
      let arrayBuffer: ArrayBuffer;
      if (urlOrDataUri.startsWith('data:')) {
        const base64 = urlOrDataUri.split(',')[1];
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        arrayBuffer = bytes.buffer;
      } else {
        const response = await fetch(urlOrDataUri);
        arrayBuffer = await response.arrayBuffer();
      }

      this.introBuffer = await this.ctx.decodeAudioData(arrayBuffer.slice(0));
      this.currentIntroAudioUrl = urlOrDataUri;
      return true;
    } catch (e) {
      console.warn('Failed to load intro music, will use fallback sounds:', e);
      return false;
    }
  }

  public playIntroMusic(startTime: number = 0, offsetSec: number = 0) {
    this.init();
    if (!this.ctx || !this.introBuffer || this.isMuted) {
      this.playReadySound();
      return;
    }

    this.stopIntroMusic();

    this.introSource = this.ctx.createBufferSource();
    this.introSource.buffer = this.introBuffer;
    this.introSource.connect(this.masterGain!);
    
    // Play exactly at the requested time (or now)
    const playAt = startTime || this.ctx.currentTime;
    const safeOffset = Math.max(0, offsetSec);
    this.introSource.start(playAt, safeOffset);
  }

  public stopIntroMusic() {
    if (this.introSource) {
      try {
        this.introSource.stop();
      } catch (e) {}
      try {
        this.introSource.disconnect();
      } catch (e) {}
      this.introSource = null;
    }
  }

  // Play a punchy drop riser/swoosh on game transition
  public playDropSwoosh() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, time);
    osc.frequency.exponentialRampToValueAtTime(70, time + 0.22);

    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.28);
  }

  // Synthesize rhythmic instruments at scheduled time connected to rhythmGain
  private playKick(time: number) {
    if (!this.ctx || this.isMuted) return;
    const rhythmBus = this.ensureRhythmGain();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const startFreq = this.soundPack === 'drill' || this.soundPack === 'trap' ? 160 : 130;
    const endFreq = 38;

    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.12);

    gain.gain.setValueAtTime(0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.26);

    osc.connect(gain);
    gain.connect(rhythmBus);

    osc.start(time);
    osc.stop(time + 0.28);
  }

  // Realistic, deep and punchy Floor Tom drum (approx 85Hz - 100Hz fundamental decaying to 50Hz)
  private playFloorTom(time: number, isAccent: boolean = false) {
    if (!this.ctx || this.isMuted) return;
    const rhythmBus = this.ensureRhythmGain();

    // 1. Resonant drum skin oscillator (punchy pitch drop)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const initialFreq = isAccent ? 130 : 110;
    const bodyFreq = 62;

    osc.frequency.setValueAtTime(initialFreq, time);
    osc.frequency.exponentialRampToValueAtTime(bodyFreq, time + 0.08);
    osc.frequency.linearRampToValueAtTime(45, time + 0.28);

    const initialGain = isAccent ? 0.95 : 0.8;
    gain.gain.setValueAtTime(initialGain, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.32);

    osc.connect(gain);
    gain.connect(rhythmBus);

    osc.start(time);
    osc.stop(time + 0.35);

    // 2. Beater stick attack transient (subtle click for definition)
    const attackOsc = this.ctx.createOscillator();
    const attackGain = this.ctx.createGain();
    attackOsc.type = 'triangle';
    attackOsc.frequency.setValueAtTime(260, time);
    attackOsc.frequency.exponentialRampToValueAtTime(80, time + 0.025);

    attackGain.gain.setValueAtTime(0.35, time);
    attackGain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

    attackOsc.connect(attackGain);
    attackGain.connect(rhythmBus);

    attackOsc.start(time);
    attackOsc.stop(time + 0.04);
  }

  private playSnare(time: number) {
    if (!this.ctx || this.isMuted) return;
    const rhythmBus = this.ensureRhythmGain();

    // Noise buffer
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.16);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1100, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.55, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(rhythmBus);

    noise.start(time);
    noise.stop(time + 0.16);

    // Tonal body pop
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, time);
    osc.frequency.exponentialRampToValueAtTime(100, time + 0.08);

    oscGain.gain.setValueAtTime(0.35, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

    osc.connect(oscGain);
    oscGain.connect(rhythmBus);

    osc.start(time);
    osc.stop(time + 0.1);
  }

  private playHiHat(time: number, accent: boolean = false) {
    if (!this.ctx || this.isMuted) return;
    const rhythmBus = this.ensureRhythmGain();

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.05);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(8000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(accent ? 0.45 : 0.22, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(rhythmBus);

    noise.start(time);
    noise.stop(time + 0.05);
  }

  // Catchy melodic TikTok Whistle hook or synth lead that plays synchronously on each beat
  private playMelodicLead(time: number, stepInBar: number) {
    if (!this.ctx || this.isMuted) return;
    const rhythmBus = this.ensureRhythmGain();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Pentatonic & modal scale notes based on beat step
    const whistleNotes = [523.25, 587.33, 659.25, 783.99, 880.0, 987.77, 1046.5, 1174.66];
    const arcadeNotes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
    const drillNotes = [392.0, 440.0, 493.88, 523.25, 587.33, 659.25, 783.99, 880.0];
    const jerseyNotes = [440.0, 523.25, 659.25, 783.99, 880.0, 1046.5];
    const lofiNotes = [329.63, 392.0, 440.0, 493.88, 587.33, 659.25];

    const noteIdx = stepInBar % whistleNotes.length;
    let freq = whistleNotes[noteIdx];
    if (this.soundPack === 'arcade') {
      osc.type = 'square';
      freq = arcadeNotes[noteIdx];
    } else if (this.soundPack === 'drill') {
      osc.type = 'sawtooth';
      freq = drillNotes[noteIdx];
    } else if (this.soundPack === 'jersey') {
      osc.type = 'triangle';
      freq = jerseyNotes[noteIdx % jerseyNotes.length];
    } else if (this.soundPack === 'lofi') {
      osc.type = 'sine';
      freq = lofiNotes[noteIdx % lofiNotes.length];
    } else {
      osc.type = 'sine'; // Classic smooth whistle
    }

    osc.frequency.setValueAtTime(freq, time);
    if (this.soundPack === 'lofi') {
      // Warm vibrato & lowpass warmth
      osc.frequency.linearRampToValueAtTime(freq * 0.99, time + 0.12);
    } else {
      osc.frequency.exponentialRampToValueAtTime(freq * 1.02, time + 0.1);
    }

    gain.gain.setValueAtTime(this.soundPack === 'lofi' ? 0.32 : 0.26, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (this.soundPack === 'jersey' ? 0.12 : 0.22));

    osc.connect(gain);
    gain.connect(rhythmBus);

    osc.start(time);
    osc.stop(time + 0.24);
  }

  // High-energy Rock & Roll intro with heavy drums, power chords, and explosive drum fill on last beat
  private playStrongIntroBeat(time: number, beat: number, totalIntroBeats: number, secondsPerBeat: number) {
    if (!this.ctx || this.isMuted) return;

    const isLastBeat = beat === totalIntroBeats - 1;

    // 1. Heavy Rock Kick on downbeats & Backbeat Snare
    if (beat === 0 || beat === 2 || isLastBeat) {
      this.playKick(time);
    }
    if (beat === 1 || beat === 3 || isLastBeat) {
      this.playSnare(time);
    }

    // 2. Driving Hi-Hats with rolling subdivision
    this.playHiHat(time, true);
    if (secondsPerBeat > 0) {
      this.playHiHat(time + secondsPerBeat * 0.5, false);
      this.playHiHat(time + secondsPerBeat * 0.25, false);
      this.playHiHat(time + secondsPerBeat * 0.75, false);
    }



    // 4. Heavy Rock Power Chords (E5, G5, A5, B5)
    const rockChords = [164.81, 196.00, 220.00, 246.94];
    const rootFreq = rockChords[beat % rockChords.length];
    const rhythmBus = this.ensureRhythmGain();

    [rootFreq, rootFreq * 1.5, rootFreq * 2].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = idx === 2 ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + (secondsPerBeat * 0.8));

      osc.connect(gain);
      gain.connect(rhythmBus);

      osc.start(time);
      osc.stop(time + secondsPerBeat);
    });

    // 5. On final drop beat: trigger drop swoosh transition sound effect
    if (isLastBeat) {
      this.playDropSwoosh();
    }
  }

  // Play full accompaniment layer according to current step in measure (0 to cardsCount-1)
  private playBeatPattern(time: number, beat: number) {
    const totalCards = Math.max(1, this.cardsCount);
    const stepInMeasure = beat % totalCards;

    // Hi-hat plays every beat
    this.playHiHat(time, stepInMeasure === 0);

    // Dynamic Kick & Snare placement based on measure length
    if (totalCards <= 2) {
      if (stepInMeasure === 0) this.playKick(time);
      if (stepInMeasure === 1) this.playSnare(time);
    } else if (totalCards === 3) {
      if (stepInMeasure === 0) this.playKick(time);
      else this.playSnare(time);
    } else {
      // 4 or more cards: Kick on 0 and halfway point; snare on intermediate backbeats
      const half = Math.floor(totalCards / 2);
      if (stepInMeasure === 0 || stepInMeasure === half) {
        this.playKick(time);
      }
      if (stepInMeasure % 2 === 1) {
        this.playSnare(time);
      }
    }

    // Whistle / Melody tone on every beat card!
    this.playMelodicLead(time, stepInMeasure);
  }

  // Lookahead scheduler loop
  private schedule() {
    if (!this.isRunning || !this.ctx) return;

    const secondsPerBeat = 60.0 / this.currentBpm;

    while (this.nextBeatTime < this.ctx.currentTime + this.scheduleAheadTime) {
      const scheduledTime = this.nextBeatTime;
      const currentBeat = this.beatIndex;

      if (this.activeSession) {
        const session = this.activeSession;
        const introBeats = session.introBeats;

        // Dynamic playback speed: match custom BPM relative to native base BPM
        const baseBpm = session.baseBpm || (session.customAudioUrl?.includes('beat.mp3') ? 182.8 : session.bpm);
        const rate = (baseBpm && baseBpm > 0) ? (session.bpm / baseBpm) : 1.0;

        if (currentBeat < introBeats) {
          // --- INTRO PHASE ---
          if (currentBeat === 0) {
            if (this.customAudioBuffer) {
              this.stopCustomTrack();
              this.playCustomTrack(scheduledTime, 0, 1.0, undefined, rate);
            }
          }

          // In case custom audio buffer finished decoding slightly after beat 0 during intro
          if (!this.customAudioSource && this.customAudioBuffer) {
            const introElapsedSec = currentBeat * secondsPerBeat;
            const audioOffset = introElapsedSec * rate;
            this.playCustomTrack(scheduledTime, audioOffset, 1.0, undefined, rate);
          }

          // Trigger visual callback at exact audio sync time
          const delayMs = Math.max(0, (scheduledTime - this.ctx.currentTime) * 1000);
          const introStepNum = currentBeat + 1;
          setTimeout(() => {
            if (this.isRunning && this.activeSession?.onIntroBeat) {
              this.activeSession.onIntroBeat(introStepNum, introBeats, scheduledTime);
            }
          }, delayMs);

        } else {
          // --- GAME PHASE (伴奏播放 + 卡点触发) ---
          const gameBeatIndex = currentBeat - introBeats;
          
          // Drop into the game phase: play the music track scaled by BPM rate
          if (gameBeatIndex === 0) {
            this.stopIntroMusic();
            if (this.customAudioBuffer) {
              const offset = Math.max(0, session.audioOffsetSec !== undefined ? session.audioOffsetSec : 2.626);
              this.stopCustomTrack();
              this.playCustomTrack(scheduledTime, offset, 1.0, session.audioLoopEndSec, rate);
            }
          } else if (!this.customAudioSource && this.customAudioBuffer) {
            // In case custom audio buffer finished decoding slightly after game beat 0
            const offset = Math.max(0, session.audioOffsetSec !== undefined ? session.audioOffsetSec : 2.626);
            const loopEnd = session.audioLoopEndSec || 5.251;
            const loopDuration = loopEnd > offset ? (loopEnd - offset) : (8 * (60.0 / 182.8));
            const gameElapsedSec = (gameBeatIndex * secondsPerBeat) * rate;
            const currentLoopOffset = offset + (gameElapsedSec % loopDuration);
            this.playCustomTrack(scheduledTime, currentLoopOffset, 1.0, session.audioLoopEndSec, rate);
          }

          if (gameBeatIndex >= session.totalGameBeats) {
            // Round finished: stop rhythm and fire onRoundComplete callback
            const delayMs = Math.max(0, (scheduledTime - this.ctx.currentTime) * 1000);
            setTimeout(() => {
              if (session.onRoundComplete) {
                session.onRoundComplete(scheduledTime);
              }
            }, delayMs);
            // Clear scheduler for this session but don't stop the loop immediately to allow trailing notes
            this.isRunning = false;
            return;
          }

          const delayMs = Math.max(0, (scheduledTime - this.ctx.currentTime) * 1000);
          const cardIdx = gameBeatIndex % Math.max(1, session.cardsCount);
          const beatNum = gameBeatIndex + 1;
          setTimeout(() => {
            if (this.isRunning && this.activeSession?.onGameBeat) {
              this.activeSession.onGameBeat(cardIdx, beatNum, scheduledTime);
            }
          }, delayMs);
        }

      } else {
        // Simple standalone rhythm (e.g. preview mode or free play)
        this.playBeatPattern(scheduledTime, currentBeat);

        const delayMs = Math.max(0, (scheduledTime - this.ctx.currentTime) * 1000);
        setTimeout(() => {
          if (this.isRunning && this.onSimpleBeatCallback) {
            this.onSimpleBeatCallback(currentBeat, scheduledTime);
          }
        }, delayMs);
      }

      // Advance clock: each beat is secondsPerBeat (60 / currentBpm)
      this.nextBeatTime += secondsPerBeat;
      this.beatIndex++;
    }

    this.timerId = window.setTimeout(() => this.schedule(), this.lookaheadIntervalMs);
  }

  /**
   * Unified, seamless round session with guaranteed ZERO audio overlap between intro and accompaniment.
   * Intro beats cleanly count down without heavy drums, and accompaniment drops in on downbeat 0!
   */
  public startRoundSession(options: RoundSessionOptions, startTime?: number): void {
    this.stopPreview();
    // Do not call stopRhythm() here if chaining, but we need to clear previous session
    this.isRunning = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.activeSession = null;
    this.onSimpleBeatCallback = null;
    
    this.init();

    if (options.soundPack) {
      this.soundPack = options.soundPack;
    }

    this.currentBpm = options.bpm;
    this.cardsCount = Math.max(1, options.cardsCount);
    this.activeSession = options;
    this.isRunning = true;
    this.beatIndex = 0;

    const effectiveAudioUrl = (!options.customAudioUrl || options.customAudioUrl.includes('Bala_Bala'))
      ? '/assets/music/beat.mp3'
      : options.customAudioUrl;
    this.loadCustomAudio(effectiveAudioUrl);

    this.ensureRhythmGain();

    if (this.ctx) {
      // If startTime is provided, ensure it hasn't expired; otherwise use small lead-in
      const minStartTime = this.ctx.currentTime + 0.02;
      this.nextBeatTime = (startTime && startTime > minStartTime) ? startTime : (this.ctx.currentTime + 0.05);
      this.schedule();
    }
  }

  /**
   * Basic rhythm runner for standalone previews and tests
   */
  public startRhythm(
    bpm: number,
    onBeat: (beatIndex: number, audioTime: number) => void,
    cardsCount: number = 4
  ) {
    this.stopRhythm();
    this.init();

    this.currentBpm = bpm;
    this.cardsCount = Math.max(1, cardsCount);
    this.activeSession = null;
    this.onSimpleBeatCallback = onBeat;
    this.isRunning = true;
    this.beatIndex = 0;

    this.ensureRhythmGain();

    if (this.ctx) {
      this.nextBeatTime = this.ctx.currentTime + 0.04;
      this.schedule();
    }
  }

  /**
   * Backward compatibility for startRhythmWithIntro
   */
  public startRhythmWithIntro(
    bpm: number,
    introBeatsCount: number,
    onIntroBeat: (currentIntroBeat: number, totalIntroBeats: number) => void,
    onMainBeat: (beatIndex: number, audioTime: number) => void,
    cardsCount: number = 4
  ) {
    this.startRoundSession({
      bpm,
      introBeats: introBeatsCount,
      cardsCount,
      totalGameBeats: 9999, // infinite until stopped
      onIntroBeat: (cur, tot) => onIntroBeat(cur, tot),
      onGameBeat: (cardIdx, beatNum, audioTime) => onMainBeat(beatNum - 1, audioTime),
    });
  }

  public stopRhythm() {
    this.isRunning = false;
    this.previewing = false;
    this.stopCustomTrack();
    this.stopIntroMusic();
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.onSimpleBeatCallback = null;
    this.activeSession = null;

    // Instantly silence and disconnect rhythm bus so zero trailing or scheduled notes can sound!
    if (this.rhythmGain && this.ctx) {
      try {
        this.rhythmGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.rhythmGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.rhythmGain.disconnect();
      } catch (e) {
        // ignore
      }
      this.rhythmGain = null;
    }
  }

  // Hit sound effects
  public playHitSound(type: 'PERFECT' | 'GREAT' | 'MISS') {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (type === 'PERFECT') {
      // Crisp celebratory high chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, time); // B5
      osc.frequency.exponentialRampToValueAtTime(1318.51, time + 0.1); // E6
      gain.gain.setValueAtTime(0.5, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
    } else if (type === 'GREAT') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, time);
      gain.gain.setValueAtTime(0.4, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
    } else {
      // Miss buzz
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, time);
      osc.frequency.linearRampToValueAtTime(90, time + 0.22);
      gain.gain.setValueAtTime(0.5, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
    }

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.3);
  }

  // Airhorn victory blast!
  public playAirhorn() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const freqs = [466.16, 466.16, 466.16, 554.37, 622.25];
    const baseTime = this.ctx.currentTime;

    freqs.forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = baseTime + i * 0.08;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  public isPreviewPlaying(): boolean {
    return this.previewing;
  }

  public stopPreview() {
    this.previewing = false;
    if (this.previewTimer !== null) {
      clearTimeout(this.previewTimer);
      this.previewTimer = null;
    }
    this.stopRhythm();
  }

  public previewSoundPack(
    pack: SoundPackType,
    bpm: number = 160,
    totalBeats: number = 8,
    onBeat?: (beat: number) => void,
    onComplete?: () => void
  ) {
    this.stopPreview();
    this.stopRhythm();
    this.init();

    this.soundPack = pack;
    let count = 0;

    this.startRhythm(bpm, (beatIndex) => {
      count++;
      if (onBeat) onBeat(beatIndex);
      if (count >= totalBeats) {
        this.stopPreview();
        if (onComplete) onComplete();
      }
    }, 4);

    this.previewing = true;
  }

  // Clean up
  public destroy() {
    this.stopPreview();
    this.stopRhythm();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

export const soundEngine = new SoundEngine();
