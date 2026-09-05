/**
 * Web Audio API based hospital acoustic announcement generator
 * Generates futuristic, soothing, crystal-clear hospital announcement chime
 */
class HospitalAudioEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Classic futuristic medical chime (Ding-Dong-Ding)
   */
  playTokenCallChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 587.33, time: 0.0, dur: 0.35 },   // D5
      { freq: 880.00, time: 0.25, dur: 0.45 },  // A5
      { freq: 1174.66, time: 0.55, dur: 0.8 },  // D6
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.freq, now + n.time);

      gain.gain.setValueAtTime(0.001, now + n.time);
      gain.gain.exponentialRampToValueAtTime(0.18, now + n.time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.time + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur);
    });
  }

  /**
   * Alert chime when patient is next in line (2 tokens away)
   */
  playUrgentAlertChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 659.25, time: 0.0, dur: 0.2 },   // E5
      { freq: 783.99, time: 0.18, dur: 0.25 }, // G5
      { freq: 987.77, time: 0.36, dur: 0.4 },  // B5
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.freq, now + n.time);

      gain.gain.setValueAtTime(0.001, now + n.time);
      gain.gain.exponentialRampToValueAtTime(0.22, now + n.time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.time + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur);
    });
  }

  /**
   * Booking success chime
   */
  playSuccessChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, time: 0.0, dur: 0.25 },  // C5
      { freq: 659.25, time: 0.15, dur: 0.25 }, // E5
      { freq: 783.99, time: 0.3, dur: 0.5 },   // G5
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.freq, now + n.time);

      gain.gain.setValueAtTime(0.001, now + n.time);
      gain.gain.exponentialRampToValueAtTime(0.15, now + n.time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.time + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur);
    });
  }
}

export const soundEngine = new HospitalAudioEngine();
