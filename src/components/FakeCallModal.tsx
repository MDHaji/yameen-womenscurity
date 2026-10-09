import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, Volume2, Grid3X3, UserCheck } from 'lucide-react';
import { useAudioSiren } from '../hooks/useAudioSiren';

interface FakeCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FakeCallModal: React.FC<FakeCallModalProps> = ({ isOpen, onClose }) => {
  const [callerName, setCallerName] = useState('Mom');
  const [callState, setCallState] = useState<'incoming' | 'active'>('incoming');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const timerRef = useRef<number | null>(null);
  const vibrateRef = useRef<number | null>(null);

  const { startRingtone, stopRingtone } = useAudioSiren();

  useEffect(() => {
    if (isOpen) {
      setCallState('incoming');
      setDuration(0);
      startRingtone();

      // Realistic Android vibration ring sequence
      if (navigator.vibrate) {
        navigator.vibrate([400, 200, 400, 200, 800]);
        vibrateRef.current = window.setInterval(() => {
          navigator.vibrate([400, 200, 400, 200, 800]);
        }, 2200);
      }
    } else {
      stopRingtone();
      if (vibrateRef.current) clearInterval(vibrateRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (navigator.vibrate) navigator.vibrate(0);
    }

    return () => {
      stopRingtone();
      if (vibrateRef.current) clearInterval(vibrateRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (navigator.vibrate) navigator.vibrate(0);
    };
  }, [isOpen, startRingtone, stopRingtone]);

  const handleAccept = () => {
    stopRingtone();
    if (vibrateRef.current) clearInterval(vibrateRef.current);
    if (navigator.vibrate) navigator.vibrate(0);
    setCallState('active');

    timerRef.current = window.setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  };

  const handleDecline = () => {
    stopRingtone();
    if (vibrateRef.current) clearInterval(vibrateRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (navigator.vibrate) navigator.vibrate(0);
    onClose();
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#070b14] flex flex-col justify-between p-6 select-none animate-in fade-in duration-200">
      {/* Top Header / Caller Identity */}
      <div className="text-center pt-8">
        <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-tr from-rose-600 via-indigo-600 to-purple-500 p-1 shadow-2xl flex items-center justify-center mb-5">
          <div className="w-full h-full rounded-full bg-[#121626] flex items-center justify-center text-4xl font-bold text-white shadow-inner">
            {callerName.charAt(0).toUpperCase()}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white tracking-wide">{callerName}</h2>
        <p className="text-sm font-medium text-emerald-400 mt-1">
          {callState === 'incoming' ? 'Incoming voice call...' : formatDuration(duration)}
        </p>

        {callState === 'incoming' && (
          <div className="mt-4 flex justify-center gap-2 flex-wrap">
            {['Mom', 'Police (Control)', 'Dad', 'Brother'].map((name) => (
              <button
                key={name}
                onClick={() => setCallerName(name)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition ${
                  callerName === name
                    ? 'bg-white/20 border-white text-white'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Middle info */}
      <div className="text-center py-4">
        {callState === 'active' ? (
          <div className="grid grid-cols-3 gap-6 max-w-xs mx-auto text-zinc-300">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-2xl flex flex-col items-center gap-1 ${
                isMuted ? 'bg-rose-500/20 text-rose-400' : 'bg-white/10 hover:bg-white/15'
              }`}
            >
              <Mic className="w-6 h-6" />
              <span className="text-xs">{isMuted ? 'Muted' : 'Mute'}</span>
            </button>
            <button
              onClick={() => setIsSpeaker(!isSpeaker)}
              className={`p-4 rounded-2xl flex flex-col items-center gap-1 ${
                isSpeaker ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 hover:bg-white/15'
              }`}
            >
              <Volume2 className="w-6 h-6" />
              <span className="text-xs">Speaker</span>
            </button>
            <button className="p-4 rounded-2xl flex flex-col items-center gap-1 bg-white/10 hover:bg-white/15">
              <Grid3X3 className="w-6 h-6" />
              <span className="text-xs">Keypad</span>
            </button>
          </div>
        ) : (
          <div className="text-xs text-zinc-500">
            Swipe or tap green button to pretend someone is actively talking to you.
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pb-10">
        {callState === 'incoming' ? (
          <div className="flex items-center justify-around max-w-xs mx-auto">
            {/* Decline */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleDecline}
                className="w-18 h-18 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/40 active:scale-95 transition"
              >
                <PhoneOff className="w-8 h-8" />
              </button>
              <span className="text-xs text-zinc-400">Decline</span>
            </div>

            {/* Accept */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleAccept}
                className="w-18 h-18 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 active:scale-95 transition animate-bounce"
              >
                <Phone className="w-8 h-8" />
              </button>
              <span className="text-xs text-zinc-400">Accept</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={handleDecline}
              className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-xl shadow-red-600/40 active:scale-95 transition"
            >
              <PhoneOff className="w-9 h-9" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
