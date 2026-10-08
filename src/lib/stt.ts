/**
 * Ultra-Perceptive Speech Recognition Manager
 * Supports regional English accents (en-IN, en-US), aggressive auto-recovery, and continuous streaming.
 */

export interface STTCallbacks {
  onSpeechStart: () => void;
  onInterimResult: (transcript: string) => void;
  onFinalResult: (transcript: string) => void;
  onError: (error: string) => void;
  onStatusChange: (listening: boolean) => void;
}

export class SpeechManager {
  private recognition: any = null;
  private isRunning: boolean = false;
  private shouldRestart: boolean = true;
  private callbacks: STTCallbacks;
  private restartTimeout: NodeJS.Timeout | null = null;
  private speechActive: boolean = false;

  constructor(callbacks: STTCallbacks) {
    this.callbacks = callbacks;
    this.initRecognition();
  }

  public static isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  private initRecognition() {
    if (!SpeechManager.isSupported()) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 3;

      // Detect user locale for natural accents
      const userLang = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
      this.recognition.lang = userLang.startsWith('en') ? userLang : 'en-IN';

      this.recognition.onstart = () => {
        this.isRunning = true;
        this.callbacks.onStatusChange(true);
      };

      this.recognition.onspeechstart = () => {
        this.speechActive = true;
        this.callbacks.onSpeechStart();
      };

      this.recognition.onspeechend = () => {
        this.speechActive = false;
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          const text = item[0].transcript;
          if (item.isFinal) {
            finalTranscript += text + ' ';
          } else {
            interimTranscript += text;
          }
        }

        if (interimTranscript) {
          this.callbacks.onSpeechStart();
          this.callbacks.onInterimResult(interimTranscript);
        }

        if (finalTranscript.trim()) {
          const cleanFinal = finalTranscript.trim();
          this.callbacks.onFinalResult(cleanFinal);
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          return;
        }
        if (event.error === 'not-allowed') {
          this.shouldRestart = false;
          this.callbacks.onError('Microphone permission required for speech.');
        } else {
          // Auto recover on network or aborted
          this.scheduleRestart();
        }
      };

      this.recognition.onend = () => {
        this.isRunning = false;
        this.callbacks.onStatusChange(false);
        if (this.shouldRestart) {
          this.scheduleRestart();
        }
      };
    } catch (e) {
      console.error('Failed to init SpeechRecognition:', e);
    }
  }

  private scheduleRestart() {
    if (!this.shouldRestart) return;
    if (this.restartTimeout) clearTimeout(this.restartTimeout);
    this.restartTimeout = setTimeout(() => {
      if (this.shouldRestart && !this.isRunning) {
        try {
          this.recognition?.start();
        } catch (err) {
          // Safe catch for start collision
        }
      }
    }, 80);
  }

  public setAiSpeakingContext(_sentence: string) {
    // Kept for interface compatibility
  }

  public start() {
    this.shouldRestart = true;
    if (!this.recognition) {
      this.initRecognition();
    }
    if (!this.isRunning && this.recognition) {
      try {
        this.recognition.start();
      } catch (err) {
        // Safe catch
      }
    }
  }

  public stop() {
    this.shouldRestart = false;
    if (this.restartTimeout) clearTimeout(this.restartTimeout);
    if (this.isRunning && this.recognition) {
      try {
        this.recognition.stop();
      } catch (err) {
        // Safe catch
      }
    }
  }

  public abort() {
    this.shouldRestart = false;
    if (this.restartTimeout) clearTimeout(this.restartTimeout);
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (err) {
        // Safe catch
      }
    }
  }
}
