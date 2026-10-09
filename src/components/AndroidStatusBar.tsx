import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, ShieldCheck, AlertTriangle } from 'lucide-react';

interface AndroidStatusBarProps {
  isEmergency: boolean;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({ isEmergency }) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`px-4 py-1.5 flex items-center justify-between text-xs select-none transition-colors duration-300 ${
      isEmergency ? 'bg-red-900/80 text-white border-b border-red-500/30' : 'bg-[#0f0f1a] text-zinc-400 border-b border-white/5'
    }`}>
      {/* Time & Carrier */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-zinc-200">{time || '09:41'}</span>
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 hidden sm:inline">5G VoLTE</span>
      </div>

      {/* Safety Mode Indicator */}
      <div className="flex items-center gap-1.5">
        {isEmergency ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-300 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-red-400" /> SOS ACTIVE
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> PROTECTED
          </span>
        )}
      </div>

      {/* Android System Icons */}
      <div className="flex items-center gap-2 text-zinc-300">
        <Wifi className="w-3.5 h-3.5" />
        <span className="text-[10px] font-mono">92%</span>
        <BatteryMedium className="w-4 h-4 text-emerald-400" />
      </div>
    </div>
  );
};
