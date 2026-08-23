/**
 * Web Audio API synthesizer for OmprengBid
 * Generates realistic stainless steel metallic clicks, harmonic bells, combo chimes, and fanfare.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Lazy init audio context on first interaction
    const savedMute = localStorage.getItem('omprengbid_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('omprengbid_muted', String(this.isMuted));
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Stainless steel tray drop sound (metallic clank)
   */
  public playDrop(pitchOffset = 0) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(320 + pitchOffset, t);
    osc1.frequency.exponentialRampToValueAtTime(140, t + 0.12);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880 + pitchOffset, t);
    osc2.frequency.exponentialRampToValueAtTime(440, t + 0.08);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.12);
    osc2.stop(t + 0.12);
  }

  /**
   * Perfect alignment metallic bell (scales up musically with combo)
   */
  public playPerfect(combo = 1) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Pentatonic scale frequencies starting at C5
    const baseFreq = 523.25; // C5
    const semitones = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
    const index = Math.min(combo - 1, semitones.length - 1);
    const freq = baseFreq * Math.pow(2, semitones[index] / 12);

    const osc = this.ctx.createOscillator();
    const harm = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    harm.type = 'triangle';
    harm.frequency.setValueAtTime(freq * 2.01, t); // Slight detune for metallic chime

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    harm.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    harm.start(t);
    osc.stop(t + 0.45);
    harm.stop(t + 0.45);
  }

  /**
   * Tray cut / slice sound (metal sliding snip)
   */
  public playSlice() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.09);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  /**
   * Width restore celebration chime (5 combos)
   */
  public playRestore() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const chords = [523.25, 659.25, 783.99, 1046.5]; // C Major
    chords.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.06);

      gain.gain.setValueAtTime(0.2, t + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t + i * 0.06);
      osc.stop(t + i * 0.06 + 0.35);
    });
  }

  /**
   * Game Over fanfare / whistle
   */
  public playGameOver() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(380, t);
    osc.frequency.setValueAtTime(340, t + 0.15);
    osc.frequency.setValueAtTime(290, t + 0.3);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.65);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.65);
  }

  /**
   * Subtle UI click
   */
  public playClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.03);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.03);
  }
}

export const sound = new SoundEngine();
