import React, { useState, useEffect } from 'react';
import { Lock, Delete, ShieldAlert } from 'lucide-react';

interface PinLockModalProps {
  isOpen: boolean;
  expectedPin: string;
  onSuccess: () => void;
  title?: string;
  subtitle?: string;
  allowCancel?: boolean;
  onCancel?: () => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({
  isOpen,
  expectedPin,
  onSuccess,
  title = 'SafeGuard Security',
  subtitle = 'Enter 4-digit PIN to continue',
  allowCancel = false,
  onCancel,
}) => {
  const [pin, setPin] = useState('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setHasError(false);
    }
  }, [isOpen]);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setHasError(false);

      if (nextPin.length === 4) {
        if (nextPin === expectedPin) {
          onSuccess();
        } else {
          setHasError(true);
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
          setTimeout(() => {
            setPin('');
            setHasError(false);
          }, 600);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setHasError(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0b0c16] flex flex-col items-center justify-between p-6 select-none animate-in fade-in">
      <div className="w-full max-w-xs text-center pt-8">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>

        {/* PIN Dots */}
        <div className={`flex justify-center gap-4 mt-8 ${hasError ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = index < pin.length;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-rose-500 scale-110 shadow-lg shadow-rose-500/50'
                    : 'border-2 border-zinc-700 bg-zinc-900'
                } ${hasError ? 'border-red-500 bg-red-500' : ''}`}
              />
            );
          })}
        </div>
        {hasError && (
          <p className="text-xs font-semibold text-rose-400 mt-3 animate-pulse">Incorrect PIN. Try again.</p>
        )}
      </div>

      {/* Numeric Keypad */}
      <div className="w-full max-w-xs mb-8">
        <div className="grid grid-cols-3 gap-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-rose-500/20 border border-white/5 text-2xl font-semibold text-white shadow transition flex items-center justify-center active:scale-95"
            >
              {digit}
            </button>
          ))}
          <div className="flex items-center justify-center">
            {allowCancel ? (
              <button
                onClick={onCancel}
                className="text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
            ) : null}
          </div>
          <button
            onClick={() => handleKeyPress('0')}
            className="h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-rose-500/20 border border-white/5 text-2xl font-semibold text-white shadow transition flex items-center justify-center active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/5 text-zinc-300 flex items-center justify-center transition active:scale-95"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        {/* SOS bypass button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              // Direct emergency bypass
              alert('Emergency SOS remains active in the background.');
            }}
            className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300"
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Emergency Contacts Still Active
          </button>
        </div>
      </div>
    </div>
  );
};
