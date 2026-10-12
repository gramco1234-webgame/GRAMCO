class SoundService {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playPop() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {}
  }

  playCorrect() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const t = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.07);
        gain.gain.setValueAtTime(0.18, t + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.07 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + idx * 0.07);
        osc.stop(t + idx * 0.07 + 0.28);
      });
    } catch {}
  }

  playFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const t = ctx.currentTime;
      const notes = [
        { f: 523.25, t: 0.12 },
        { f: 659.25, t: 0.12 },
        { f: 783.99, t: 0.12 },
        { f: 1046.5, t: 0.35 },
      ];
      let offset = 0;
      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, t + offset);
        gain.gain.setValueAtTime(0.22, t + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, t + offset + n.t);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + offset);
        osc.stop(t + offset + n.t + 0.05);
        offset += n.t * 0.9;
      });
    } catch {}
  }

  playLock() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(160, t + 0.15);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.16);
    } catch {}
  }
}

export const sound = new SoundService();
