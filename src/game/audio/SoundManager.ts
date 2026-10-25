/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  private isMuted: boolean = false;
  private masterVol: number = 0.8;
  private bgmVol: number = 0.55;
  private sfxVol: number = 0.75;

  private currentBgmId: string | null = null;
  private bgmIntervalId: number | null = null;
  private bgmNodes: AudioNode[] = [];

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  public init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.bgmGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.bgmGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.applyVolumes();
    } catch {
      // Audio not supported in environment
    }
  }

  public setVolumes(master: number, bgm: number, sfx: number, muted: boolean) {
    this.masterVol = Math.max(0, Math.min(1, master));
    this.bgmVol = Math.max(0, Math.min(1, bgm));
    this.sfxVol = Math.max(0, Math.min(1, sfx));
    this.isMuted = muted;
    this.applyVolumes();
  }

  private applyVolumes() {
    if (!this.ctx || !this.masterGain || !this.bgmGain || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const effectiveMaster = this.isMuted ? 0 : this.masterVol;
    this.masterGain.gain.setValueAtTime(effectiveMaster, now);
    this.bgmGain.gain.setValueAtTime(this.bgmVol, now);
    this.sfxGain.gain.setValueAtTime(this.sfxVol, now);
  }

  // --- SOUND EFFECTS SYNTHESIS ---

  public playKatanaSlash(comboStep: number = 1) {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.init();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    const baseFreq = comboStep === 1 ? 520 : comboStep === 2 ? 640 : 780;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.16);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.Q.setValueAtTime(2.5, t);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.45, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.19);

    // Add white noise swoosh
    this.playNoiseWhoosh(0.14, 0.3);
  }

  public playKatanaHit() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.init();
    const t = this.ctx.currentTime;

    // Flesh/armor punch
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);

    // Metallic ring clink
    const ring = this.ctx.createOscillator();
    const ringGain = this.ctx.createGain();
    ring.type = 'sine';
    ring.frequency.setValueAtTime(1480, t);
    ringGain.gain.setValueAtTime(0.3, t);
    ringGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    ring.connect(ringGain);
    ringGain.connect(this.sfxGain);
    ring.start(t);
    ring.stop(t + 0.23);
  }

  public playJump() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.init();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(360, t + 0.15);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.17);
  }

  public playDoubleJump() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.init();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(560, t + 0.18);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.19);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  public playDash() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.init();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.22);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.25);

    this.playNoiseWhoosh(0.2, 0.45);
  }

  public playShuriken() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.init();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(980, t);
    osc.frequency.exponentialRampToValueAtTime(1450, t + 0.08);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  public playCoin() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.init();
    const t = this.ctx.currentTime;

    // Dual crystal chime
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, t); // B5
    osc1.frequency.setValueAtTime(1318.51, t + 0.08); // E6
    osc2.frequency.setValueAtTime(1975.53, t + 0.08); // B6

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc1.stop(t + 0.36);
    osc2.start(t + 0.08);
    osc2.stop(t + 0.36);
  }

  public playCheckpoint() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.init();
    const t = this.ctx.currentTime;

    // Deep temple bell / gong
    const fundamental = 220;
    [1, 1.48, 2.05, 2.76].forEach((partial, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * partial, t);

      const vol = 0.35 / (idx + 1);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 1.9);
    });
  }

  public playHurt() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.init();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.2);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.23);
  }

  public playEnemyDeath() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.init();
    const t = this.ctx.currentTime;

    // Low crumble / poof
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(95, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.28);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.32);

    this.playNoiseWhoosh(0.25, 0.4);
  }

  public playButtonClick() {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.init();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.05);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.07);
  }

  private playNoiseWhoosh(duration: number, volume: number) {
    if (!this.ctx || !this.sfxGain) return;
    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start();
    } catch {
      // ignore
    }
  }

  // --- BACKGROUND MUSIC GENERATOR (Japanese Pentatonic Ambient Synth) ---

  public playBGM(theme: 'menu' | 'forest' | 'ice' | 'lava' | 'cliffs' | 'boss' | 'dojo') {
    this.init();
    if (this.currentBgmId === theme) return;
    this.stopBGM();
    this.currentBgmId = theme;

    if (!this.ctx || !this.bgmGain) return;

    // Pentatonic / Hirajoshi scale notes (in Hz):
    // Root D: D3 (146.83), Eb3 (155.56), G3 (196.00), A3 (220.00), Bb3 (233.08), D4 (293.66), Eb4 (311.13)
    const forestMelody = [220, 293.66, 392, 311.13, 293.66, 220, 196, 220];
    const iceMelody = [392, 440, 587.33, 440, 392, 311.13, 293.66, 392];
    const lavaMelody = [146.83, 155.56, 196, 155.56, 146.83, 110, 146.83, 196];
    const bossMelody = [146.83, 146.83, 220, 155.56, 146.83, 293.66, 233.08, 146.83];
    const menuMelody = [196, 220, 293.66, 392, 293.66, 220, 196, 155.56];
    const dojoMelody = [220, 246.94, 293.66, 329.63, 392, 440, 392, 329.63];

    let melody = menuMelody;
    let tempo = 1200; // ms per beat

    if (theme === 'forest') {
      melody = forestMelody;
      tempo = 900;
    } else if (theme === 'ice') {
      melody = iceMelody;
      tempo = 1100;
    } else if (theme === 'lava') {
      melody = lavaMelody;
      tempo = 680;
    } else if (theme === 'boss') {
      melody = bossMelody;
      tempo = 480;
    } else if (theme === 'cliffs') {
      melody = forestMelody;
      tempo = 800;
    } else if (theme === 'dojo') {
      melody = dojoMelody;
      tempo = 1000;
    }

    let noteIndex = 0;

    const playNextBeat = () => {
      if (!this.ctx || !this.bgmGain || this.isMuted) return;
      const t = this.ctx.currentTime;

      // Bass drone / Taiko drum on beat
      if (noteIndex % 2 === 0 || theme === 'boss') {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = theme === 'lava' || theme === 'boss' ? 'triangle' : 'sine';
        bassOsc.frequency.setValueAtTime(theme === 'boss' ? 73.4 : 98, t);
        bassOsc.frequency.exponentialRampToValueAtTime(35, t + 0.35);

        bassGain.gain.setValueAtTime(0.35, t);
        bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

        bassOsc.connect(bassGain);
        bassGain.connect(this.bgmGain);
        bassOsc.start(t);
        bassOsc.stop(t + 0.5);
      }

      // Koto / Flute pluck
      const noteFreq = melody[noteIndex % melody.length];
      const pluckOsc = this.ctx.createOscillator();
      const pluckGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      pluckOsc.type = theme === 'ice' ? 'sine' : 'triangle';
      pluckOsc.frequency.setValueAtTime(noteFreq, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, t);
      filter.frequency.exponentialRampToValueAtTime(300, t + 0.6);

      pluckGain.gain.setValueAtTime(0.2, t);
      pluckGain.gain.exponentialRampToValueAtTime(0.001, t + (tempo / 1000) * 1.5);

      pluckOsc.connect(filter);
      filter.connect(pluckGain);
      pluckGain.connect(this.bgmGain);

      pluckOsc.start(t);
      pluckOsc.stop(t + (tempo / 1000) * 1.6);

      noteIndex++;
    };

    playNextBeat();
    this.bgmIntervalId = window.setInterval(playNextBeat, tempo);
  }

  public stopBGM() {
    if (this.bgmIntervalId !== null) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    this.currentBgmId = null;
  }
}

export const soundManager = new SoundManager();
