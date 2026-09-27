/**
 * Emergency Audio Siren Generator using Web Audio API
 * Generates an authentic alternating emergency frequency siren without external mp3 dependencies.
 */

let audioCtx = null;
let oscillator = null;
let gainNode = null;
let lfo = null;
let lfoGain = null;
let isPlaying = false;
let isMuted = false;

const initAudioContext = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

// Global click listener to unlock AudioContext if suspended
if (typeof window !== 'undefined') {
  const unlock = () => {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  };
  window.addEventListener('click', unlock, { once: false });
  window.addEventListener('touchstart', unlock, { once: false });
}

export const startEmergencySiren = () => {
  if (isPlaying || isMuted) return;

  try {
    const ctx = initAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // Master Gain
    gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);

    // Primary Siren Oscillator (Tone carrier)
    oscillator = ctx.createOscillator();
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);

    // Lowpass filter to smooth the harsh sawtooth into an authentic siren sound
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, ctx.currentTime);

    // LFO (Low Frequency Oscillator) to modulate the frequency up and down (700Hz to 1100Hz)
    lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.8, ctx.currentTime); // ~0.8 Hz cycling speed (one rise & fall every 1.25s)

    lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(250, ctx.currentTime); // Frequency variation +/- 250Hz -> 550Hz to 1050Hz

    // Connect LFO to oscillator frequency
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);

    // Connect oscillator -> filter -> gain -> destination
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    lfo.start();
    isPlaying = true;
  } catch (err) {
    console.warn('[Siren] Web Audio initialization deferred:', err);
  }
};

export const stopEmergencySiren = () => {
  if (!isPlaying) return;

  try {
    if (gainNode && audioCtx) {
      gainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    }
    setTimeout(() => {
      try {
        if (oscillator) {
          oscillator.stop();
          oscillator.disconnect();
          oscillator = null;
        }
        if (lfo) {
          lfo.stop();
          lfo.disconnect();
          lfo = null;
        }
        if (lfoGain) {
          lfoGain.disconnect();
          lfoGain = null;
        }
        if (gainNode) {
          gainNode.disconnect();
          gainNode = null;
        }
      } catch (e) {
        // cleanup safety
      }
      isPlaying = false;
    }, 120);
  } catch (err) {
    isPlaying = false;
  }
};

export const setSirenMuted = (muted) => {
  isMuted = muted;
  if (muted && isPlaying) {
    stopEmergencySiren();
  }
};

export const getSirenState = () => ({
  isPlaying,
  isMuted,
  audioContextState: audioCtx ? audioCtx.state : 'uninitialized',
});
