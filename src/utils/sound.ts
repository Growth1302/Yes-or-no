import type { WheelCategoryId } from '../types/spinverse';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private lastTickTime: number = 0;

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  /**
   * Plays a crisp mechanical peg click as a segment boundary crosses the pointer.
   * Rate-limited slightly so fast initial rotation sounds smooth, not harsh.
   */
  playTick(velocityFactor: number = 0.5) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = performance.now();
    if (now - this.lastTickTime < 28) return;
    this.lastTickTime = now;

    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const baseFreq = 520 + Math.min(1, Math.max(0, velocityFactor)) * 320;
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(160, t + 0.032);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.04);
    } catch {
      // Ignore audio failures when autoplay policy restricts playback
    }
  }

  /**
   * Plays a pleasant category-matched celebratory chord on spin completion.
   */
  playWin(category: WheelCategoryId) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const notesByCategory: Record<WheelCategoryId, number[]> = {
        decision: [523.25, 659.25, 783.99, 1046.5],
        daily: [440, 554.37, 659.25, 880],
        difficult: [392.0, 493.88, 587.33, 783.99],
        fun: [523.25, 659.25, 783.99, 987.77, 1046.5],
        motivation: [440, 523.25, 659.25, 783.99],
        custom: [493.88, 622.25, 739.99, 987.77],
      };

      const notes = notesByCategory[category] || notesByCategory.decision;
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = t + idx * 0.065;
        const duration = category === 'difficult' ? 0.55 : 0.4;

        osc.type = category === 'difficult' ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.09, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + duration + 0.02);
      });
    } catch {
      // Ignore audio context errors
    }
  }

  playClick() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, t);
      osc.frequency.exponentialRampToValueAtTime(340, t + 0.025);
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.028);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.03);
    } catch {
      // Ignore
    }
  }
}

export const soundEngine = new SoundEngine();
