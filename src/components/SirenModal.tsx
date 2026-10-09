import React, { useEffect, useState, useRef } from 'react';
import { VolumeX, AlertOctagon } from 'lucide-react';
import { useAudioSiren } from '../hooks/useAudioSiren';

interface SirenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SirenModal: React.FC<SirenModalProps> = ({ isOpen, onClose }) => {
  const [isRed, setIsRed] = useState(true);
  const { startSiren, stopSiren } = useAudioSiren();
  const strobeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      startSiren();
      strobeRef.current = window.setInterval(() => {
        setIsRed((prev) => !prev);
      }, 180);

      if (navigator.vibrate) {
        navigator.vibrate([300, 100, 300, 100, 300, 100]);
      }
    } else {
      stopSiren();
      if (strobeRef.current) clearInterval(strobeRef.current);
      if (navigator.vibrate) navigator.vibrate(0);
    }

    return () => {
      stopSiren();
      if (strobeRef.current) clearInterval(strobeRef.current);
      if (navigator.vibrate) navigator.vibrate(0);
    };
  }, [isOpen, startSiren, stopSiren]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-8 transition-colors duration-150 ${
        isRed ? 'bg-red-600' : 'bg-blue-600'
      }`}
    >
      <div className="pt-10 text-center text-white">
        <div className="inline-flex p-4 rounded-full bg-white/20 backdrop-blur-md mb-4 animate-pulse">
          <AlertOctagon className="w-16 h-16 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight drop-shadow-lg">
          EMERGENCY SIREN
        </h1>
        <p className="text-base font-semibold text-white/90 mt-2 max-w-xs mx-auto">
          Loud audio alert &amp; flashing deterrent active to attract immediate public attention.
        </p>
      </div>

      <div className="text-center my-auto">
        <div className="w-48 h-48 rounded-full border-4 border-white/60 flex items-center justify-center animate-ping duration-1000">
          <div className="w-32 h-32 rounded-full bg-white text-zinc-950 flex items-center justify-center font-black text-2xl shadow-2xl">
            112
          </div>
        </div>
      </div>

      <div className="pb-12 w-full max-w-xs">
        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl bg-white text-zinc-950 font-black text-lg tracking-wide shadow-2xl hover:bg-zinc-100 active:scale-95 transition flex items-center justify-center gap-3"
        >
          <VolumeX className="w-6 h-6 text-red-600" />
          STOP SIREN
        </button>
      </div>
    </div>
  );
};
