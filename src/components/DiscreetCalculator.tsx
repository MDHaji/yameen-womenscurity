import React, { useState } from 'react';
import { Shield } from 'lucide-react';

interface DiscreetCalculatorProps {
  unlockPin: string;
  onUnlock: () => void;
}

export const DiscreetCalculator: React.FC<DiscreetCalculatorProps> = ({ unlockPin, onUnlock }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleDigit = (val: string) => {
    setDisplay((prev) => (prev === '0' ? val : prev + val));
  };

  const handleOp = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleEqual = () => {
    // Secret unlock check
    const currentClean = display.trim();
    if (currentClean === unlockPin || (unlockPin === '' && currentClean === '1234')) {
      onUnlock();
      return;
    }

    try {
      const full = equation + display;
      // Simple safe evaluation
      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${full.replace(/×/g, '*').replace(/÷/g, '/')})`)();
      setDisplay(String(result));
      setEquation('');
    } catch {
      setDisplay('Error');
    }
  };

  return (
    <div className="min-h-screen bg-[#1c1c1e] text-white flex flex-col justify-end p-5 select-none font-sans">
      {/* Top bar with subtle switch icon */}
      <div className="flex justify-between items-center text-zinc-500 mb-auto pt-2">
        <span className="text-xs tracking-wider font-mono">CALCULATOR</span>
        <button
          onClick={onUnlock}
          className="p-1 rounded-full text-zinc-600 hover:text-zinc-400"
          title="SafeGuard Return"
        >
          <Shield className="w-4 h-4" />
        </button>
      </div>

      {/* Calculator Display */}
      <div className="text-right pb-6 pr-2">
        <div className="text-sm text-zinc-400 font-mono h-6">{equation}</div>
        <div className="text-5xl font-light text-white tracking-tight overflow-x-auto">
          {display}
        </div>
        <div className="text-[10px] text-zinc-600 mt-1">Secret: Enter PIN &amp; press = to open SafeGuard</div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto w-full pb-6">
        <button
          onClick={handleClear}
          className="h-16 rounded-full bg-zinc-400 text-black text-xl font-medium active:bg-zinc-300 transition"
        >
          AC
        </button>
        <button
          onClick={() => setDisplay((p) => (p.startsWith('-') ? p.slice(1) : '-' + p))}
          className="h-16 rounded-full bg-zinc-400 text-black text-xl font-medium active:bg-zinc-300 transition"
        >
          +/-
        </button>
        <button
          onClick={() => setDisplay((p) => String(parseFloat(p) / 100))}
          className="h-16 rounded-full bg-zinc-400 text-black text-xl font-medium active:bg-zinc-300 transition"
        >
          %
        </button>
        <button
          onClick={() => handleOp('÷')}
          className="h-16 rounded-full bg-amber-500 text-white text-2xl font-medium active:bg-amber-400 transition"
        >
          ÷
        </button>

        {['7', '8', '9'].map((d) => (
          <button
            key={d}
            onClick={() => handleDigit(d)}
            className="h-16 rounded-full bg-zinc-700 text-white text-2xl font-medium active:bg-zinc-600 transition"
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => handleOp('×')}
          className="h-16 rounded-full bg-amber-500 text-white text-2xl font-medium active:bg-amber-400 transition"
        >
          ×
        </button>

        {['4', '5', '6'].map((d) => (
          <button
            key={d}
            onClick={() => handleDigit(d)}
            className="h-16 rounded-full bg-zinc-700 text-white text-2xl font-medium active:bg-zinc-600 transition"
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => handleOp('-')}
          className="h-16 rounded-full bg-amber-500 text-white text-2xl font-medium active:bg-amber-400 transition"
        >
          -
        </button>

        {['1', '2', '3'].map((d) => (
          <button
            key={d}
            onClick={() => handleDigit(d)}
            className="h-16 rounded-full bg-zinc-700 text-white text-2xl font-medium active:bg-zinc-600 transition"
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => handleOp('+')}
          className="h-16 rounded-full bg-amber-500 text-white text-2xl font-medium active:bg-amber-400 transition"
        >
          +
        </button>

        <button
          onClick={() => handleDigit('0')}
          className="h-16 col-span-2 rounded-full bg-zinc-700 text-white text-2xl font-medium pl-6 text-left active:bg-zinc-600 transition"
        >
          0
        </button>
        <button
          onClick={() => !display.includes('.') && setDisplay((p) => p + '.')}
          className="h-16 rounded-full bg-zinc-700 text-white text-2xl font-medium active:bg-zinc-600 transition"
        >
          .
        </button>
        <button
          onClick={handleEqual}
          className="h-16 rounded-full bg-amber-500 text-white text-2xl font-medium active:bg-amber-400 transition"
        >
          =
        </button>
      </div>
    </div>
  );
};
