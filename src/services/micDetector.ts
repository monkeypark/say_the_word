// Microphone energy detector and Web Speech API recognition helper

export interface MicDetectorOptions {
  threshold?: number; // RMS threshold between 0.05 and 0.4
  onVoiceTrigger?: (rms: number) => void;
  onSpeechWord?: (word: string) => void;
}

export class MicDetector {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private isListening: boolean = false;
  private threshold: number = 0.12;
  private lastTriggerTime: number = 0;
  private minTriggerInterval: number = 200; // ms debounce between vocal hits
  private animationFrameId: number | null = null;
  private speechRecognition: any = null;
  private onVoiceTrigger: ((rms: number) => void) | null = null;
  private onSpeechWord: ((word: string) => void) | null = null;
  private currentVolumeLevel: number = 0;

  constructor(options?: MicDetectorOptions) {
    if (options?.threshold) this.threshold = options.threshold;
    if (options?.onVoiceTrigger) this.onVoiceTrigger = options.onVoiceTrigger;
    if (options?.onSpeechWord) this.onSpeechWord = options.onSpeechWord;
  }

  public setThreshold(val: number) {
    this.threshold = Math.max(0.02, Math.min(0.5, val));
  }

  public getVolumeLevel(): number {
    return this.currentVolumeLevel;
  }

  public async start(): Promise<boolean> {
    try {
      if (this.isListening) return true;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.mediaStream = stream;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtx();
      const source = this.audioCtx.createMediaStreamSource(stream);

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.2;
      source.connect(this.analyser);

      this.isListening = true;
      this.monitorAudio();
      this.initSpeechRecognition();

      return true;
    } catch (err) {
      console.warn('Microphone access denied or unavailable:', err);
      return false;
    }
  }

  private initSpeechRecognition() {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    try {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'zh-CN'; // default, will detect or match

      recognition.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult && lastResult[0]) {
          const transcript = lastResult[0].transcript.trim().toLowerCase();
          if (this.onSpeechWord) {
            this.onSpeechWord(transcript);
          }
        }
      };

      recognition.onerror = (e: any) => {
        // Silently handle speech recognition errors
      };

      recognition.onend = () => {
        if (this.isListening) {
          try {
            recognition.start();
          } catch (_) {}
        }
      };

      recognition.start();
      this.speechRecognition = recognition;
    } catch (e) {
      console.warn('Speech recognition start failed:', e);
    }
  }

  private monitorAudio() {
    if (!this.isListening || !this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(dataArray);

    // Calculate Root Mean Square (RMS) amplitude
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const normalized = (dataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / dataArray.length);
    this.currentVolumeLevel = Math.min(1, rms * 3.5);

    const now = performance.now();
    if (rms > this.threshold && now - this.lastTriggerTime > this.minTriggerInterval) {
      this.lastTriggerTime = now;
      if (this.onVoiceTrigger) {
        this.onVoiceTrigger(rms);
      }
    }

    this.animationFrameId = requestAnimationFrame(() => this.monitorAudio());
  }

  public stop() {
    this.isListening = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.speechRecognition) {
      try {
        this.speechRecognition.stop();
      } catch (_) {}
      this.speechRecognition = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}
