/**
 * Audio Engine for Bel Sekolah SDN Kartika Sejahtera 01
 * Supports both Web Audio API synthesized chimes (100% offline, crystal clear)
 * and custom uploaded / URL audio files.
 */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let activeHtmlAudio: HTMLAudioElement | null = null;
let currentVolume = 0.85;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(currentVolume, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setMasterVolume(vol: number) {
  currentVolume = Math.max(0, Math.min(1, vol));
  if (masterGain && audioCtx) {
    masterGain.gain.setValueAtTime(currentVolume, audioCtx.currentTime);
  }
  if (activeHtmlAudio) {
    activeHtmlAudio.volume = currentVolume;
  }
}

export function getMasterVolume(): number {
  return currentVolume;
}

/**
 * Unlock Audio Context upon user gesture
 */
export async function unlockAudioSystem(): Promise<boolean> {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    // Play ultra-short silent audio element to unlock iOS/Chrome restrictions
    const silent = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
    await silent.play().catch(() => {});
    return true;
  } catch (err) {
    console.error("Audio unlock error:", err);
    return false;
  }
}

/**
 * Stop any currently playing audio (synth or HTML5)
 */
export function stopAllPlayback() {
  if (activeHtmlAudio) {
    try {
      activeHtmlAudio.pause();
      activeHtmlAudio.currentTime = 0;
    } catch {}
    activeHtmlAudio = null;
  }
  if (audioCtx && audioCtx.state !== 'closed') {
    // If synth notes are sounding, briefly mute and unmute
    if (masterGain) {
      masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
      setTimeout(() => {
        if (masterGain && audioCtx) {
          masterGain.gain.setValueAtTime(currentVolume, audioCtx.currentTime);
        }
      }, 150);
    }
  }
}

/**
 * Synthesizes a resonant bell chime note using FM/Harmonics
 */
function playBellNote(ctx: AudioContext, targetGain: GainNode, freq: number, startTime: number, duration: number) {
  // Fundamental sine wave
  const osc1 = ctx.createOscillator();
  const noteGain = ctx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(freq, startTime);

  // First overtone (metallic bell timbre)
  const osc2 = ctx.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(freq * 2.02, startTime);

  // Sub-harmonic strike
  const osc3 = ctx.createOscillator();
  osc3.type = 'sine';
  osc3.frequency.setValueAtTime(freq * 0.5, startTime);

  // Envelope: sharp attack, exponential decay
  noteGain.gain.setValueAtTime(0.0001, startTime);
  noteGain.gain.exponentialRampToValueAtTime(0.7, startTime + 0.015);
  noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc1.connect(noteGain);
  osc2.connect(noteGain);
  osc3.connect(noteGain);
  noteGain.connect(targetGain);

  osc1.start(startTime);
  osc2.start(startTime);
  osc3.start(startTime);

  osc1.stop(startTime + duration + 0.05);
  osc2.stop(startTime + duration + 0.05);
  osc3.stop(startTime + duration + 0.05);
}

/**
 * Westminster Chimes (Classic School Bell / Big Ben Melody)
 */
export function playSynthWestminster(repeatCount = 1): Promise<void> {
  return new Promise((resolve) => {
    const ctx = getAudioContext();
    if (!masterGain) return resolve();

    // Notes: E5 (659Hz), C5 (523Hz), D5 (587Hz), G4 (392Hz)
    const melody = [
      { f: 659.25, d: 0.65 }, // E
      { f: 523.25, d: 0.65 }, // C
      { f: 587.33, d: 0.65 }, // D
      { f: 392.00, d: 1.10 }, // G
      { f: 523.25, d: 0.65 }, // C
      { f: 587.33, d: 0.65 }, // D
      { f: 659.25, d: 0.65 }, // E
      { f: 523.25, d: 1.40 }, // C
    ];

    let currentStart = ctx.currentTime + 0.05;

    for (let r = 0; r < repeatCount; r++) {
      melody.forEach((note) => {
        playBellNote(ctx, masterGain!, note.f, currentStart, note.d * 1.5);
        currentStart += note.d;
      });
      if (r < repeatCount - 1) {
        currentStart += 0.5; // pause between repeats
      }
    }

    const totalDuration = (currentStart - ctx.currentTime) * 1000;
    setTimeout(() => {
      resolve();
    }, totalDuration);
  });
}

/**
 * Modern High-Pitched School Bell (3-note chime)
 */
export function playSynthModernChime(repeatCount = 2): Promise<void> {
  return new Promise((resolve) => {
    const ctx = getAudioContext();
    if (!masterGain) return resolve();

    const notes = [
      { f: 523.25, d: 0.4 }, // C5
      { f: 659.25, d: 0.4 }, // E5
      { f: 783.99, d: 0.8 }, // G5
    ];

    let currentStart = ctx.currentTime + 0.05;

    for (let r = 0; r < repeatCount; r++) {
      notes.forEach((note) => {
        playBellNote(ctx, masterGain!, note.f, currentStart, note.d * 1.2);
        currentStart += note.d;
      });
      if (r < repeatCount - 1) {
        currentStart += 0.3;
      }
    }

    const totalDuration = (currentStart - ctx.currentTime) * 1000;
    setTimeout(() => {
      resolve();
    }, totalDuration);
  });
}

/**
 * Traditional Electric School Ring (Metallic tremolo ring)
 */
export function playSynthElectricRing(durationSec = 3.5): Promise<void> {
  return new Promise((resolve) => {
    const ctx = getAudioContext();
    if (!masterGain) return resolve();

    const startTime = ctx.currentTime + 0.05;
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const ringGain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, startTime);

    // LFO rapid amplitude modulation (striker hitting bell 20 times/sec)
    lfo.type = 'square';
    lfo.frequency.setValueAtTime(22, startTime);

    lfoGain.gain.setValueAtTime(0.4, startTime);
    lfo.connect(ringGain.gain);

    ringGain.gain.setValueAtTime(0.6, startTime);
    ringGain.gain.linearRampToValueAtTime(0.6, startTime + durationSec - 0.2);
    ringGain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec);

    osc.connect(ringGain);
    ringGain.connect(masterGain);

    lfo.start(startTime);
    osc.start(startTime);

    lfo.stop(startTime + durationSec + 0.05);
    osc.stop(startTime + durationSec + 0.05);

    setTimeout(() => {
      resolve();
    }, durationSec * 1000);
  });
}

/**
 * Play an audio item: either synthesized or HTML5 Audio
 */
export async function playSoundItem(
  sound: {
    id: string;
    type?: 'synth' | 'audio';
    synthPattern?: 'westminster' | 'modern' | 'electric';
    url?: string;
  },
  repeat = 1
): Promise<void> {
  stopAllPlayback();

  if (sound.type === 'synth') {
    if (sound.synthPattern === 'modern') {
      return playSynthModernChime(repeat);
    } else if (sound.synthPattern === 'electric') {
      return playSynthElectricRing(3.5);
    } else {
      return playSynthWestminster(repeat);
    }
  }

  // Otherwise audio URL / Data URL
  if (sound.url) {
    return new Promise((resolve, reject) => {
      try {
        const audio = new Audio(sound.url);
        audio.volume = currentVolume;
        activeHtmlAudio = audio;

        let playCounter = 0;
        audio.onended = () => {
          playCounter++;
          if (playCounter < repeat) {
            audio.currentTime = 0;
            audio.play().catch(reject);
          } else {
            activeHtmlAudio = null;
            resolve();
          }
        };

        audio.onerror = (e) => {
          console.warn("Audio file playback error, falling back to synthesizer:", e);
          activeHtmlAudio = null;
          // Graceful fallback to synthesized chime
          playSynthWestminster(repeat).then(resolve);
        };

        audio.play().catch((err) => {
          console.warn("Audio element play error:", err);
          // Try synth
          playSynthWestminster(repeat).then(resolve);
        });
      } catch (err) {
        console.error("Audio init error:", err);
        playSynthWestminster(repeat).then(resolve);
      }
    });
  }

  // Default fallback
  return playSynthWestminster(repeat);
}

/**
 * Distinct, short pre-bell audio cue (plays a few seconds before main bell)
 */
export function playPreBellCue(pattern: 'soft_dual' | 'radar_beep' | 'short_ding' = 'soft_dual'): Promise<void> {
  return new Promise((resolve) => {
    try {
      const ctx = getAudioContext();
      if (!masterGain) return resolve();

      const startTime = ctx.currentTime + 0.02;

      if (pattern === 'radar_beep') {
        // Double electronic warning ping (880Hz, 880Hz)
        [0, 0.16].forEach((offset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, startTime + offset);

          gain.gain.setValueAtTime(0.001, startTime + offset);
          gain.gain.linearRampToValueAtTime(0.35, startTime + offset + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + offset + 0.1);

          osc.connect(gain);
          gain.connect(masterGain!);

          osc.start(startTime + offset);
          osc.stop(startTime + offset + 0.12);
        });

        setTimeout(resolve, 350);
      } else if (pattern === 'short_ding') {
        // Single resonant bell tap (784Hz)
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(783.99, startTime); // G5
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(783.99 * 2, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.45, startTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.65);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(masterGain);

        osc.start(startTime);
        osc2.start(startTime);
        osc.stop(startTime + 0.7);
        osc2.stop(startTime + 0.7);

        setTimeout(resolve, 700);
      } else {
        // 'soft_dual': Melodic 2-tone chime (E5 -> A5)
        const notes = [
          { f: 659.25, d: 0.18, offset: 0 },
          { f: 880.00, d: 0.45, offset: 0.22 }
        ];

        notes.forEach((n) => {
          const t = startTime + n.offset;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(n.f, t);

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.35, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + n.d);

          osc.connect(gain);
          gain.connect(masterGain!);

          osc.start(t);
          osc.stop(t + n.d + 0.05);
        });

        setTimeout(resolve, 750);
      }
    } catch (err) {
      console.warn("Pre-bell sound error:", err);
      resolve();
    }
  });
}

