/**
 * Procedural Web Audio Engine for Mechanic Simulator
 * Generates all mechanical tool sounds, starter cranking, dynamic engine RPM combustion rumble,
 * turbo spooling, blow-off valve, and mechanical failure effects purely in browser memory without external assets.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  // Running engine sound nodes
  private engineGain: GainNode | null = null;
  private crankOsc1: OscillatorNode | null = null;
  private crankOsc2: OscillatorNode | null = null;
  private exhaustFilter: BiquadFilterNode | null = null;
  private noiseNode: AudioNode | null = null;
  private noiseGain: GainNode | null = null;
  private turboOsc: OscillatorNode | null = null;
  private turboGain: GainNode | null = null;
  private isEngineRunning: boolean = false;
  private isCranking: boolean = false;
  private crankInterval: number | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.ctx) {
      if (this.isEngineRunning) {
        this.stopEngine();
      }
      this.stopCranking();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Mechanical tool sounds
   */
  public playToolSound(type: 'wrench' | 'ratchet' | 'torque_click' | 'place' | 'oil_pour' | 'key_click') {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (type) {
      case 'wrench': {
        // Metallic resonant strike
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.15);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.Q.setValueAtTime(8, now);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }

      case 'ratchet': {
        // Rapid 3-click ratchet sound
        for (let i = 0; i < 3; i++) {
          const clickTime = now + i * 0.045;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(2400 + i * 200, clickTime);

          gain.gain.setValueAtTime(0.2, clickTime);
          gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.025);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(clickTime);
          osc.stop(clickTime + 0.03);
        }
        break;
      }

      case 'torque_click': {
        // Deep solid torque wrench mechanical click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);

        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);

        // Resonant ring
        const ring = ctx.createOscillator();
        const ringGain = ctx.createGain();
        ring.type = 'sine';
        ring.frequency.setValueAtTime(1850, now);
        ringGain.gain.setValueAtTime(0.25, now);
        ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        ring.connect(ringGain);
        ringGain.connect(ctx.destination);

        ring.start(now);
        ring.stop(now + 0.3);
        break;
      }

      case 'place': {
        // Solid heavy metallic placement thud
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.14);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.16);
        break;
      }

      case 'oil_pour': {
        // Gurgling liquid sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.linearRampToValueAtTime(320, now + 0.25);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }

      case 'key_click': {
        // Ignition switch turn click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1500, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.07);
        break;
      }
    }
  }

  /**
   * Starter motor cranking sound
   */
  public startCranking() {
    if (this.isMuted || this.isCranking) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.isCranking = true;

    // Periodic starter pulse (approx. 240 RPM = 4 revolutions/sec = 8 piston compression strokes/sec)
    const playCrankPulse = () => {
      if (!this.isCranking || !this.ctx) return;
      const t = this.ctx.currentTime;

      // Whirring starter electric motor
      const starterWhir = this.ctx.createOscillator();
      const starterGain = this.ctx.createGain();
      starterWhir.type = 'sawtooth';
      starterWhir.frequency.setValueAtTime(140, t);
      starterWhir.frequency.linearRampToValueAtTime(110, t + 0.1);

      starterGain.gain.setValueAtTime(0.22, t);
      starterGain.gain.exponentialRampToValueAtTime(0.01, t + 0.11);

      starterWhir.connect(starterGain);
      starterGain.connect(this.ctx.destination);
      starterWhir.start(t);
      starterWhir.stop(t + 0.12);

      // Low compression thump
      const thump = this.ctx.createOscillator();
      const thumpGain = this.ctx.createGain();
      thump.type = 'triangle';
      thump.frequency.setValueAtTime(80, t);
      thump.frequency.exponentialRampToValueAtTime(40, t + 0.09);

      thumpGain.gain.setValueAtTime(0.3, t);
      thumpGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

      thump.connect(thumpGain);
      thumpGain.connect(this.ctx.destination);
      thump.start(t);
      thump.stop(t + 0.11);
    };

    playCrankPulse();
    this.crankInterval = window.setInterval(playCrankPulse, 125);
  }

  public stopCranking() {
    this.isCranking = false;
    if (this.crankInterval !== null) {
      clearInterval(this.crankInterval);
      this.crankInterval = null;
    }
  }

  /**
   * Continuous engine combustion audio loop
   */
  public startEngine(initialRpm: number = 950) {
    if (this.isMuted) return;
    this.stopCranking();
    this.stopEngine();

    const ctx = this.initContext();
    if (!ctx) return;

    this.isEngineRunning = true;
    const now = ctx.currentTime;

    // Master engine gain
    this.engineGain = ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.01, now);
    this.engineGain.gain.linearRampToValueAtTime(0.45, now + 0.3); // Smooth catch

    // Crankshaft firing frequency: 4-cylinder 4-stroke has 2 firing pulses per revolution
    // Firing Hz = (RPM / 60) * 2
    const firingHz = (initialRpm / 60) * 2;

    // Primary combustion oscillation (deep mechanical thump)
    this.crankOsc1 = ctx.createOscillator();
    this.crankOsc1.type = 'sawtooth';
    this.crankOsc1.frequency.setValueAtTime(firingHz, now);

    // Sub-harmonic oscillator for body resonance
    this.crankOsc2 = ctx.createOscillator();
    this.crankOsc2.type = 'triangle';
    this.crankOsc2.frequency.setValueAtTime(firingHz * 0.5, now);

    // Exhaust low-pass filter (simulates manifold & muffler damping)
    this.exhaustFilter = ctx.createBiquadFilter();
    this.exhaustFilter.type = 'lowpass';
    this.exhaustFilter.frequency.setValueAtTime(220, now);
    this.exhaustFilter.Q.setValueAtTime(3.5, now);

    // Combustion noise (air rush through exhaust valves)
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(350, now);
    noiseFilter.Q.setValueAtTime(2.0, now);

    this.noiseGain = ctx.createGain();
    this.noiseGain.gain.setValueAtTime(0.12, now);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(this.noiseGain);
    this.noiseNode = whiteNoise;

    // Turbocharger spool whistle
    this.turboOsc = ctx.createOscillator();
    this.turboOsc.type = 'sine';
    this.turboOsc.frequency.setValueAtTime(1800, now);
    this.turboGain = ctx.createGain();
    this.turboGain.gain.setValueAtTime(0.01, now);

    this.turboOsc.connect(this.turboGain);
    this.turboGain.connect(this.engineGain);

    // Route audio graphs
    this.crankOsc1.connect(this.exhaustFilter);
    this.crankOsc2.connect(this.exhaustFilter);
    this.noiseGain.connect(this.exhaustFilter);

    this.exhaustFilter.connect(this.engineGain);
    this.engineGain.connect(ctx.destination);

    // Start nodes
    this.crankOsc1.start(now);
    this.crankOsc2.start(now);
    whiteNoise.start(now);
    this.turboOsc.start(now);
  }

  /**
   * Update engine sound live during revving / throttle
   */
  public updateEngineRpm(rpm: number, throttle: number) {
    if (!this.isEngineRunning || !this.ctx) return;
    const now = this.ctx.currentTime;
    const firingHz = Math.max(20, (rpm / 60) * 2);

    if (this.crankOsc1) {
      this.crankOsc1.frequency.setTargetAtTime(firingHz, now, 0.04);
    }
    if (this.crankOsc2) {
      this.crankOsc2.frequency.setTargetAtTime(firingHz * 0.5, now, 0.04);
    }
    if (this.exhaustFilter) {
      // High throttle opens exhaust cutoff
      const cutoff = 200 + (rpm / 7500) * 1200 + throttle * 800;
      this.exhaustFilter.frequency.setTargetAtTime(cutoff, now, 0.05);
    }
    if (this.noiseGain) {
      const noiseVol = 0.08 + throttle * 0.25 + (rpm / 7500) * 0.2;
      this.noiseGain.gain.setTargetAtTime(noiseVol, now, 0.05);
    }
    if (this.turboOsc && this.turboGain) {
      // Turbo spools with RPM and throttle boost
      const turboPitch = 1400 + (rpm / 7500) * 3800 + throttle * 2200;
      const turboVol = Math.max(0.01, (rpm - 2200) / 5000) * (0.15 + throttle * 0.25);
      this.turboOsc.frequency.setTargetAtTime(turboPitch, now, 0.08);
      this.turboGain.gain.setTargetAtTime(Math.max(0, turboVol), now, 0.08);
    }
    if (this.engineGain) {
      const engineVol = 0.4 + throttle * 0.35 + (rpm / 7500) * 0.15;
      this.engineGain.gain.setTargetAtTime(engineVol, now, 0.05);
    }
  }

  /**
   * Turbo Blow-Off Valve (wastegate / dump valve flutter)
   */
  public playBlowOff() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Air hiss with stutter
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3200, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    // Fluttering blow-off envelope
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.08);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.35);
  }

  /**
   * Mechanical failures (Bent valves, seized piston, backfire)
   */
  public playEngineFailure(type: 'seize' | 'clatter' | 'backfire') {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    switch (type) {
      case 'seize': {
        // High screech metal friction then abrupt stop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.linearRampToValueAtTime(300, now + 0.4);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.45);
        this.stopEngine();
        break;
      }

      case 'clatter': {
        // Nasty valve-to-piston clash clatter
        for (let i = 0; i < 6; i++) {
          const t = now + i * 0.06;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(750 + Math.random() * 300, t);

          gain.gain.setValueAtTime(0.4, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(t);
          osc.stop(t + 0.05);
        }
        break;
      }

      case 'backfire': {
        // Loud gunshot-like combustion explosion in exhaust
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.2);

        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.26);
        break;
      }
    }
  }

  public stopEngine() {
    this.isEngineRunning = false;
    if (this.engineGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.engineGain.gain.linearRampToValueAtTime(0.001, now + 0.25);
      setTimeout(() => {
        try {
          this.crankOsc1?.stop();
          this.crankOsc2?.stop();
          this.turboOsc?.stop();
        } catch {
          // ignore if already stopped
        }
        this.crankOsc1 = null;
        this.crankOsc2 = null;
        this.turboOsc = null;
        this.engineGain = null;
        this.exhaustFilter = null;
      }, 300);
    }
  }

  /**
   * Arcade Game Sound: Combo streak chime (scales with combo level)
   */
  public playCombo(comboLevel: number) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const baseFreq = 440 * Math.pow(1.12, Math.min(6, comboLevel));
    const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2];
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.055;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.18);
    });
  }

  /**
   * Arcade Game Sound: Achievement unlocked fanfare chord
   */
  public playAchievement() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 major arpeggio

    chord.forEach((freq, i) => {
      const t = now + i * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.5);
    });
  }

  /**
   * Arcade Game Sound: Misplacement error buzzer
   */
  public playErrorBuzzer() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    for (let i = 0; i < 2; i++) {
      const t = now + i * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.1);
    }
  }

  /**
   * Arcade Game Sound: Stage complete / All parts assembled
   */
  public playStageClear() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const melody = [
      { f: 523.25, d: 0.1 },  // C5
      { f: 659.25, d: 0.1 },  // E5
      { f: 783.99, d: 0.1 },  // G5
      { f: 1046.5, d: 0.3 },  // C6
    ];

    let t = now;
    melody.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + note.d + 0.02);
      t += note.d * 0.85;
    });
  }
}

export const soundEngine = new SoundEngine();
