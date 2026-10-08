import { PersonaId } from './types';
import { PERSONAS } from './personas';

export interface TTSQueueItem {
  id: string;
  text: string;
  personaId: PersonaId;
  onStart?: () => void;
  onEnd?: () => void;
}

export class TTSManager {
  private queue: TTSQueueItem[] = [];
  private isPlaying: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private volume: number = 1.0; // Max volume 1.0
  private watchdogTimer: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1.0, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  private loadVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
  }

  private getVoiceForPersona(personaId: PersonaId): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) {
      this.loadVoices();
    }
    const persona = PERSONAS[personaId];
    if (!persona || this.voices.length === 0) return null;

    const isFemale = persona.voiceGender === 'female';

    // Look for natural English voices matching gender
    const englishVoices = this.voices.filter(
      (v) =>
        v.lang.startsWith('en') ||
        v.lang.startsWith('en-IN') ||
        v.lang.startsWith('en-US') ||
        v.lang.startsWith('en-GB')
    );

    if (englishVoices.length > 0) {
      if (personaId === 'dr_nair') {
        const v = englishVoices.find((x) =>
          /David|George|Guy|Natural|Google US English|Microsoft David/i.test(x.name)
        );
        if (v) return v;
      } else if (personaId === 'arjun') {
        const v = englishVoices.find((x) =>
          /Mark|James|Oliver|Alex|Microsoft Mark|Google UK English Male/i.test(x.name)
        );
        if (v) return v;
      } else if (personaId === 'meera') {
        const v = englishVoices.find((x) =>
          /Zira|Jenny|Samantha|Victoria|Google US English Female|Microsoft Zira/i.test(x.name)
        );
        if (v) return v;
      } else if (personaId === 'kabir') {
        const v = englishVoices.find((x) =>
          /Daniel|Arthur|Brian|Google UK English/i.test(x.name)
        );
        if (v) return v;
      } else if (personaId === 'sana') {
        const v = englishVoices.find((x) =>
          /Karen|Sonia|Ava|Emma|Google UK English Female/i.test(x.name)
        );
        if (v) return v;
      } else if (personaId === 'rohan') {
        const v = englishVoices.find((x) =>
          /Ryan|Liam|Noah|Microsoft Ravi/i.test(x.name)
        );
        if (v) return v;
      }

      // Filter by approximate gender heuristic
      const genderMatches = englishVoices.filter((v) =>
        isFemale
          ? /female|woman|girl|samantha|zira|jenny|karen/i.test(v.name)
          : /male|man|boy|david|george|alex|mark/i.test(v.name)
      );

      if (genderMatches.length > 0) {
        return genderMatches[0];
      }

      return englishVoices[0];
    }

    return this.voices[0] || null;
  }

  public enqueue(item: TTSQueueItem) {
    this.queue.push(item);
    if (!this.isPlaying) {
      this.playNext();
    }
  }

  public stopAll() {
    this.queue = [];
    this.isPlaying = false;
    if (this.watchdogTimer) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
  }

  private playNext() {
    if (this.watchdogTimer) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }

    if (this.queue.length === 0) {
      this.isPlaying = false;
      this.currentUtterance = null;
      return;
    }

    const item = this.queue.shift()!;
    this.isPlaying = true;

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      item.onStart?.();
      setTimeout(() => {
        this.isPlaying = false;
        item.onEnd?.();
        this.playNext();
      }, 1500);
      return;
    }

    const persona = PERSONAS[item.personaId];
    const utterance = new SpeechSynthesisUtterance(item.text);
    this.currentUtterance = utterance;

    // Prevent GC in Chromium
    if (typeof window !== 'undefined') {
      (window as any).__activeUtterance = utterance;
    }

    const voice = this.getVoiceForPersona(item.personaId);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.volume = this.volume; // 1.0 max volume
    utterance.pitch = persona ? Math.max(0.85, Math.min(1.2, persona.pitch)) : 1.0;
    utterance.rate = persona ? Math.max(0.9, Math.min(1.15, persona.rate)) : 1.0;
    utterance.lang = 'en-US';

    const finishUtterance = () => {
      if (this.watchdogTimer) {
        clearTimeout(this.watchdogTimer);
        this.watchdogTimer = null;
      }
      this.isPlaying = false;
      item.onEnd?.();
      // Slight pacing gap before next sentence
      setTimeout(() => {
        this.playNext();
      }, 100);
    };

    utterance.onstart = () => {
      item.onStart?.();
    };

    utterance.onend = () => {
      finishUtterance();
    };

    utterance.onerror = (e) => {
      console.warn('TTS playback error or interrupted:', e);
      finishUtterance();
    };

    // Watchdog timer: If browser fails to trigger onend, automatically advance
    const estimatedDurationMs = Math.max(2500, item.text.length * 100);
    this.watchdogTimer = setTimeout(() => {
      if (this.isPlaying && this.currentUtterance === utterance) {
        finishUtterance();
      }
    }, estimatedDurationMs);

    // Cancel previous stale speech and speak
    try {
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('SpeechSynthesis error:', err);
      finishUtterance();
    }
  }
}
