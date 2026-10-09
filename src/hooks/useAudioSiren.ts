import { useRef, useCallback } from 'react';

export function useAudioSiren() {
  const sirenContextRef = useRef<AudioContext | null>(null);
  const sirenOscRef = useRef<OscillatorNode | null>(null);
  const sirenGainRef = useRef<GainNode | null>(null);
  const sirenTimerRef = useRef<number | null>(null);

  const ringtoneCtxRef = useRef<AudioContext | null>(null);
  const ringtoneTimerRef = useRef<number | null>(null);

  // Play short countdown beep
  const playBeep = useCallback((freq = 880, duration = 0.15) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
      setTimeout(() => ctx.close(), duration * 1000 + 100);
    } catch {
      // Audio not permitted yet
    }
  }, []);

  // Start continuous emergency police/warning siren
  const startSiren = useCallback(() => {
    stopSiren();
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      sirenContextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.6, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      sirenOscRef.current = osc;
      sirenGainRef.current = gain;

      let freq = 650;
      let step = 45;
      sirenTimerRef.current = window.setInterval(() => {
        if (!sirenOscRef.current || !sirenContextRef.current) return;
        freq += step;
        if (freq >= 1350) step = -50;
        if (freq <= 650) step = 50;
        sirenOscRef.current.frequency.setTargetAtTime(freq, sirenContextRef.current.currentTime, 0.03);
      }, 35);
    } catch (err) {
      console.warn('AudioContext failed:', err);
    }
  }, []);

  const stopSiren = useCallback(() => {
    if (sirenTimerRef.current) {
      clearInterval(sirenTimerRef.current);
      sirenTimerRef.current = null;
    }
    if (sirenOscRef.current) {
      try {
        sirenOscRef.current.stop();
        sirenOscRef.current.disconnect();
      } catch {}
      sirenOscRef.current = null;
    }
    if (sirenContextRef.current) {
      try {
        sirenContextRef.current.close();
      } catch {}
      sirenContextRef.current = null;
    }
  }, []);

  // Android phone ringtone simulation (chime melody)
  const startRingtone = useCallback(() => {
    stopRingtone();
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      ringtoneCtxRef.current = ctx;

      const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25]; // C5, E5, G5, C6...
      let step = 0;

      const playChime = () => {
        if (!ringtoneCtxRef.current) return;
        const now = ringtoneCtxRef.current.currentTime;
        const note = notes[step % notes.length];
        step++;

        const osc = ringtoneCtxRef.current.createOscillator();
        const gain = ringtoneCtxRef.current.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ringtoneCtxRef.current.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      };

      playChime();
      ringtoneTimerRef.current = window.setInterval(playChime, 380);
    } catch (e) {
      console.warn('Ringtone audio failed', e);
    }
  }, []);

  const stopRingtone = useCallback(() => {
    if (ringtoneTimerRef.current) {
      clearInterval(ringtoneTimerRef.current);
      ringtoneTimerRef.current = null;
    }
    if (ringtoneCtxRef.current) {
      try {
        ringtoneCtxRef.current.close();
      } catch {}
      ringtoneCtxRef.current = null;
    }
  }, []);

  return {
    playBeep,
    startSiren,
    stopSiren,
    startRingtone,
    stopRingtone,
  };
}
