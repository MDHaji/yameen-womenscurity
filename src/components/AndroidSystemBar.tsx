import React, { useState } from 'react';
import { ChevronLeft, Circle, Square, Activity, Shield, Cpu, HardDrive } from 'lucide-react';
import { NavTab } from './BottomNav';

interface AndroidSystemBarProps {
  currentTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  onBack: () => void;
  isEmergency: boolean;
}

export const AndroidSystemBar: React.FC<AndroidSystemBarProps> = ({
  currentTab,
  onChangeTab,
  onBack,
  isEmergency,
}) => {
  const [showRecents, setShowRecents] = useState(false);

  return (
    <>
      {/* 3-Button Android System Navigation Bar */}
      <div className="h-9 bg-[#080912] border-t border-white/5 flex items-center justify-around px-8 shrink-0 select-none z-40">
        {/* Back Button (Triangle/Chevron) */}
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white active:scale-90 transition"
          title="Android Back"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Home Button (Circle) */}
        <button
          onClick={() => onChangeTab('sos')}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white active:scale-90 transition"
          title="Android Home"
        >
          <Circle className="w-3.5 h-3.5 fill-current" />
        </button>

        {/* Recents Button (Square) */}
        <button
          onClick={() => setShowRecents(!showRecents)}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white active:scale-90 transition"
          title="Android Recents & Running Services"
        >
          <Square className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Recents / Android System Task Overview Modal */}
      {showRecents && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end p-4 animate-in fade-in">
          <div className="w-full max-w-sm mx-auto bg-[#141628] rounded-3xl border border-white/10 p-5 shadow-2xl mb-12 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-xs">Android Running Tasks</h3>
              </div>
              <button
                onClick={() => setShowRecents(false)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Close ✕
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">SafeGuard Android Service</div>
                    <div className="text-[10px] text-zinc-400">Foreground Safety Listener • Active</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  RUNNING
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Motion Sensor Daemon</div>
                    <div className="text-[10px] text-zinc-400">devicemotion @ 50Hz</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
                  ACTIVE
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Firestore Realtime Database</div>
                    <div className="text-[10px] text-zinc-400">Cloud Sync &amp; Backup Channel</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  SYNCED
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowRecents(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs"
            >
              Resume SafeGuard
            </button>
          </div>
        </div>
      )}
    </>
  );
};
