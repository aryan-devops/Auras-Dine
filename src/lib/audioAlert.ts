// Web Audio API Synthesizer for Kitchen Ticket Bell and Order Alarms
// Operates with zero network dependencies, 100% reliable across browsers

class KitchenAudioAlert {
  private ctx: AudioContext | null = null;

  public init(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch (e) {
      console.warn('AudioContext initialization note:', e);
      return null;
    }
  }

  /**
   * Plays a resonant, dual-tone restaurant service bell (Ding-Ding!)
   */
  public playKitchenBell(): void {
    try {
      const ctx = this.init();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Strike 1 (High tone)
      this.strikeBell(ctx, now, 1318.51); // Note E6
      // Strike 2 (Harmonic answer)
      this.strikeBell(ctx, now + 0.22, 1567.98); // Note G6
    } catch (e) {
      console.warn('Kitchen bell chime audio note:', e);
    }
  }

  /**
   * Plays a rapid 3-strike alarm sequence for urgent tickets
   */
  public playOrderAlarm(): void {
    try {
      const ctx = this.init();
      if (!ctx) return;

      const now = ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        this.strikeBell(ctx, now + i * 0.22, 1400);
      }
    } catch (e) {
      console.warn('Order alarm audio note:', e);
    }
  }

  private strikeBell(ctx: AudioContext, startTime: number, freq: number): void {
    try {
      // Primary resonant tone
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, startTime);

      gain1.gain.setValueAtTime(0.7, startTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(startTime);
      osc1.stop(startTime + 1.2);

      // Inharmonic metallic harmonic for brass service bell character
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2.76, startTime);

      gain2.gain.setValueAtTime(0.35, startTime);
      gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.7);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(startTime);
      osc2.stop(startTime + 0.7);
    } catch (e) {
      console.warn('Bell strike synthesis error:', e);
    }
  }

  /**
   * Plays a crisp high-frequency hospitality calling chime (Ding-Dong!)
   * specifically for customer tables paging their floor server/waiter.
   */
  public playWaiterCallChime(): void {
    try {
      const ctx = this.init();
      if (!ctx) return;

      const now = ctx.currentTime;
      // High bright call chime
      this.strikeBell(ctx, now, 1760); // Note A6
      // Warm response
      this.strikeBell(ctx, now + 0.18, 1318.51); // Note E6
      // Gentle sparkle finish
      this.strikeBell(ctx, now + 0.36, 2093); // Note C7
    } catch (e) {
      console.warn('Waiter call chime audio note:', e);
    }
  }
}

export const kitchenAlert = new KitchenAudioAlert();
export const waiterAlert = kitchenAlert;

