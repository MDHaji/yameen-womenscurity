import React from 'react';
import { ShieldAlert, Users, MapPin, Download, Settings } from 'lucide-react';

export type NavTab = 'sos' | 'contacts' | 'radar' | 'apk' | 'settings';

interface BottomNavProps {
  currentTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  isEmergency: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onChangeTab, isEmergency }) => {
  const tabs: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'sos', label: 'Emergency', icon: ShieldAlert },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'radar', label: 'GPS Radar', icon: MapPin },
    { id: 'apk', label: 'Android APK', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="shrink-0 z-40 bg-[#121224]/95 backdrop-blur-md border-t border-white/10 w-full">
      <div className="flex items-center justify-around py-2 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          const isSOS = tab.id === 'sos';

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all relative ${
                isActive
                  ? isEmergency
                    ? 'text-rose-400 font-semibold'
                    : 'text-rose-500 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {isSOS && isEmergency && (
                <span className="absolute -top-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-rose-500/10' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
