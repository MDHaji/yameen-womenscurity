import React, { useState } from 'react';
import { Power, Volume2, VolumeX, Shield, Bell, CheckCircle2 } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  onVolumeSOS?: () => void;
  onVolumeSiren?: () => void;
  isEmergency?: boolean;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  onVolumeSOS,
  onVolumeSiren,
  isEmergency,
}) => {
  const [isScreenOff, setIsScreenOff] = useState(false);
  const [showNotificationShade, setShowNotificationShade] = useState(false);

  return (
    <div className="min-h-screen bg-[#06070d] flex items-center justify-center p-0 sm:p-4 select-none">
      {/* Outer Phone Shell on Desktop (Invisible/100% on Mobile) */}
      <div className="relative w-full sm:max-w-[420px] h-screen sm:h-[870px] sm:rounded-[50px] sm:border-[10px] sm:border-[#1e202e] sm:shadow-[0_0_60px_rgba(0,0,0,0.8),0_0_20px_rgba(233,69,96,0.15)] flex flex-col overflow-hidden bg-[#0a0b16]">
        
        {/* Physical Button Mockups on Desktop Frame */}
        <div className="hidden sm:block">
          {/* Power Button (Right) */}
          <button
            onClick={() => setIsScreenOff(!isScreenOff)}
            title="Power Key (Click to test lock/unlock)"
            className="absolute -right-[15px] top-32 w-1.5 h-12 bg-[#2d3042] hover:bg-rose-500 rounded-r-md transition cursor-pointer"
          />

          {/* Volume Up (Left) -> Quick Siren */}
          <button
            onClick={onVolumeSiren}
            title="Volume Up (Quick Siren)"
            className="absolute -left-[15px] top-28 w-1.5 h-11 bg-[#2d3042] hover:bg-indigo-500 rounded-l-md transition cursor-pointer"
          />

          {/* Volume Down (Left) -> Quick SOS */}
          <button
            onClick={onVolumeSOS}
            title="Volume Down (Quick SOS Trigger)"
            className="absolute -left-[15px] top-42 w-1.5 h-11 bg-[#2d3042] hover:bg-rose-500 rounded-l-md transition cursor-pointer"
          />
        </div>

        {/* Punch-hole Front Camera */}
        <div className="hidden sm:flex absolute top-2.5 left-1/2 -translate-x-1/2 z-50 items-center justify-center pointer-events-none">
          <div className="w-3.5 h-3.5 rounded-full bg-black ring-2 ring-[#1e202e]/80 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0d1b2a]" />
          </div>
        </div>

        {/* Notification Shade Pull-down Toggle */}
        <div
          onClick={() => setShowNotificationShade(!showNotificationShade)}
          className="absolute top-0 left-0 right-0 h-4 z-40 cursor-pointer flex justify-center items-center opacity-30 hover:opacity-100 transition"
          title="Click to view Android Notification Shade"
        >
          <div className="w-12 h-1 rounded-full bg-white/40" />
        </div>

        {/* Android Notification Shade Drawer */}
        {showNotificationShade && (
          <div className="absolute inset-x-0 top-0 z-50 bg-[#101224]/95 backdrop-blur-xl border-b border-white/10 p-4 shadow-2xl animate-in slide-in-from-top-4 duration-200">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10 text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-rose-400" /> Android System Notifications
              </span>
              <button
                onClick={() => setShowNotificationShade(false)}
                className="text-[11px] text-zinc-400 hover:text-white"
              >
                Close ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white text-[11px]">SafeGuard Background Guardian</div>
                  <div className="text-[10px] text-zinc-400">
                    Background GPS active • Shake sensor monitoring at 26 m/s²
                  </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-mono">NOW</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white text-[11px]">Firebase Cloud Sync Active</div>
                  <div className="text-[10px] text-zinc-400">
                    Project: coherent-math-w8p5g connected to Firestore
                  </div>
                </div>
                <span className="text-[9px] text-zinc-500 font-mono">1m</span>
              </div>
            </div>
          </div>
        )}

        {/* Screen Off State simulation (if power button clicked) */}
        {isScreenOff ? (
          <div
            onClick={() => setIsScreenOff(false)}
            className="flex-1 bg-black flex flex-col items-center justify-center p-6 text-zinc-600 text-center cursor-pointer select-none"
          >
            <Power className="w-12 h-12 mb-3 opacity-30" />
            <div className="text-sm font-semibold text-zinc-500">Android Screen Standby</div>
            <p className="text-xs text-zinc-700 mt-1">Tap screen or click Power key to wake up</p>
          </div>
        ) : (
          /* Main Interactive Application */
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {children}
          </div>
        )}

        {/* Android Gesture Pill / Navigation bar at bottom */}
        <div className="h-4 bg-[#0a0b16] shrink-0 flex items-center justify-center pointer-events-none select-none">
          <div className="w-24 h-1 rounded-full bg-zinc-600/70" />
        </div>
      </div>
    </div>
  );
};
