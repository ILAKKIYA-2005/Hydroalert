/**
 * Audio Alert Utility for HydroAlert Dashboard
 * Synthesizes a crisp, professional two-tone chime via Web Audio API.
 * Does not depend on external MP3 files or network requests.
 */

let audioCtx: AudioContext | null = null;

export function playAlertSound(): void {
  try {
    if (typeof window === 'undefined') return;

    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    const now = audioCtx.currentTime;

    // Dual-tone synthesizer: Professional, clean supervisory alert
    // Tone 1: 880 Hz (A5), Tone 2: 1046.5 Hz (C6)
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.12);

    // Smooth envelope attack and decay to prevent clicking
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch (err) {
    // Safely ignore autoplay restrictions without console error spam
    console.debug('Audio playback deferred:', err);
  }
}
