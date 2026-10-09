import React, { useState, useRef, useEffect } from 'react';
import {
  Phone,
  Volume2,
  Video,
  Share2,
  Flashlight,
  AlertTriangle,
  Shield,
  ShieldAlert,
  MapPin,
  ExternalLink,
  ChevronRight,
  Radio,
} from 'lucide-react';
import { LocationData } from '../hooks/useGeolocation';
import { Contact } from '../types';

interface SOSScreenProps {
  isEmergency: boolean;
  onTriggerSOS: () => void;
  onCancelSOS: () => void;
  location: LocationData | null;
  contacts: Contact[];
  onOpenFakeCall: () => void;
  onOpenSiren: () => void;
  onOpenRecorder: () => void;
  onShareLocation: () => void;
}

export const SOSScreen: React.FC<SOSScreenProps> = ({
  isEmergency,
  onTriggerSOS,
  onCancelSOS,
  location,
  contacts,
  onOpenFakeCall,
  onOpenSiren,
  onOpenRecorder,
  onShareLocation,
}) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flashActive, setFlashActive] = useState(false);
  const timerRef = useRef<number | null>(null);

  const helplines = [
    { number: '112', title: 'Police / Universal Emergency', sub: 'National 24/7 Response', icon: '👮' },
    { number: '1091', title: 'Women in Distress Helpline', sub: 'Dedicated Women Cell', icon: '👩' },
    { number: '181', title: 'Women Helpline (Domestic)', sub: 'State & Domestic Protection', icon: '🛡️' },
    { number: '108', title: 'Ambulance & Medical Emergency', sub: 'Urgent Paramedic Dispatch', icon: '🚑' },
    { number: '1098', title: 'Childline & Minor Support', sub: 'National Child Safety', icon: '👶' },
    { number: '1930', title: 'Cyber Crime Helpline', sub: 'Online Harassment & Blackmail', icon: '💻' },
  ];

  // Abortable countdown trigger
  const handleSOSPress = () => {
    if (isEmergency) {
      onCancelSOS();
      return;
    }

    if (countdown !== null) {
      handleCancelCountdown();
      return;
    }

    // Start 3-second abort window
    setCountdown(3);
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

    let count = 3;
    timerRef.current = window.setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        setCountdown(null);
        onTriggerSOS();
      } else {
        setCountdown(count);
        if (navigator.vibrate) navigator.vibrate(150);
      }
    }, 1000);
  };

  const handleCancelCountdown = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCountdown(null);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const toggleScreenFlash = () => {
    setFlashActive((prev) => !prev);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="space-y-5 pb-24 animate-in fade-in">
      {/* Full-screen Flashlight / Strobe mode */}
      {flashActive && (
        <div
          onClick={() => setFlashActive(false)}
          className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-black select-none cursor-pointer animate-pulse"
        >
          <div className="text-center font-black text-3xl">SCREEN TORCH ACTIVE</div>
          <p className="text-sm font-semibold mt-2">Tap anywhere to turn off</p>
        </div>
      )}

      {/* Emergency Active Banner */}
      {isEmergency && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-xl shadow-red-600/30 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm font-black uppercase tracking-wider">EMERGENCY SOS ACTIVE</div>
              <div className="text-xs text-red-100">Live coordinates sent to emergency contacts</div>
            </div>
          </div>
          <button
            onClick={onCancelSOS}
            className="px-3 py-1.5 rounded-xl bg-white text-red-700 text-xs font-black shadow hover:bg-red-50 active:scale-95 transition"
          >
            DISARM
          </button>
        </div>
      )}

      {/* Status Card */}
      <div className="p-3.5 rounded-2xl bg-[#141528] border border-white/5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <span
              className={`block w-3 h-3 rounded-full ${
                isEmergency ? 'bg-red-500 animate-ping' : 'bg-emerald-400'
              }`}
            />
            <span
              className={`block w-3 h-3 rounded-full absolute inset-0 ${
                isEmergency ? 'bg-red-500' : 'bg-emerald-400'
              }`}
            />
          </div>
          <div>
            <div className="font-bold text-white">
              {isEmergency ? 'SOS Alert Active' : 'Protection Armed'}
            </div>
            <div className="text-[11px] text-zinc-400">
              {location
                ? `GPS Locked: ±${location.accuracy}m`
                : 'Acquiring GPS coordinates...'}
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-white/5 text-zinc-300">
            {contacts.length} Contacts Set
          </span>
        </div>
      </div>

      {/* Main Tactile SOS Button */}
      <div className="py-4 text-center">
        <div className="relative inline-flex items-center justify-center">
          {/* Pulsing Outer Ripples */}
          <div
            className={`absolute -inset-4 rounded-full border-2 transition-all ${
              isEmergency
                ? 'border-red-500/60 animate-ping'
                : 'border-rose-500/20 animate-pulse duration-1000'
            }`}
          />
          <div
            className={`absolute -inset-8 rounded-full border border-rose-500/10 ${
              isEmergency ? 'animate-ping duration-700' : ''
            }`}
          />

          <button
            onClick={handleSOSPress}
            className={`relative w-44 h-44 rounded-full shadow-2xl transition-all duration-200 active:scale-95 flex flex-col items-center justify-center text-white ${
              isEmergency
                ? 'bg-gradient-to-br from-red-600 to-rose-700 shadow-red-600/50 ring-4 ring-red-400'
                : countdown !== null
                ? 'bg-gradient-to-br from-amber-600 to-red-600 shadow-amber-600/50 ring-4 ring-amber-300'
                : 'bg-gradient-to-br from-rose-500 via-rose-600 to-red-600 shadow-rose-600/40 hover:shadow-rose-600/60'
            }`}
          >
            {countdown !== null ? (
              <>
                <span className="text-5xl font-black">{countdown}</span>
                <span className="text-[11px] font-bold uppercase tracking-wider mt-1 text-white/90">
                  Tap to Cancel
                </span>
              </>
            ) : isEmergency ? (
              <>
                <ShieldAlert className="w-12 h-12 mb-1 animate-bounce" />
                <span className="text-2xl font-black tracking-wider">STOP SOS</span>
                <span className="text-[10px] font-semibold text-white/80">Tap to Disarm</span>
              </>
            ) : (
              <>
                <Radio className="w-10 h-10 mb-1 opacity-90 animate-pulse" />
                <span className="text-3xl font-black tracking-widest drop-shadow">SOS</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 mt-1">
                  Tap to Activate
                </span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-zinc-400 mt-4 max-w-xs mx-auto">
          {countdown !== null
            ? `Emergency firing in ${countdown} seconds! Tap SOS button to cancel.`
            : 'Vibrate & shake phone, or tap SOS to trigger emergency protocol.'}
        </p>
      </div>

      {/* Quick Action Tiles Grid */}
      <div>
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 px-1">
          Quick Defensive Tools
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Fake Call */}
          <button
            onClick={onOpenFakeCall}
            className="p-3.5 rounded-2xl bg-[#141528] hover:bg-[#1a1c35] border border-white/5 text-left transition active:scale-95 group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Phone className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-white">Fake Call</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Pretend caller escape</div>
          </button>

          {/* Police Siren */}
          <button
            onClick={onOpenSiren}
            className="p-3.5 rounded-2xl bg-[#141528] hover:bg-[#1a1c35] border border-white/5 text-left transition active:scale-95 group"
          >
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Volume2 className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-white">Police Siren</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Loud alarm deterrent</div>
          </button>

          {/* Record Evidence */}
          <button
            onClick={onOpenRecorder}
            className="p-3.5 rounded-2xl bg-[#141528] hover:bg-[#1a1c35] border border-white/5 text-left transition active:scale-95 group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Video className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-white">Evidence Rec</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Silent video/audio</div>
          </button>

          {/* Share Live Location */}
          <button
            onClick={onShareLocation}
            className="p-3.5 rounded-2xl bg-[#141528] hover:bg-[#1a1c35] border border-white/5 text-left transition active:scale-95 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Share2 className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-white">Share GPS</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">WhatsApp / SMS</div>
          </button>
        </div>
      </div>

      {/* Emergency Helplines Direct Dial List */}
      <div>
        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 px-1 flex items-center justify-between">
          <span>Emergency Helplines (1-Tap Call)</span>
          <span className="text-[10px] text-zinc-500">Toll Free 24/7</span>
        </div>

        <div className="space-y-2">
          {helplines.map((item) => (
            <a
              key={item.number}
              href={`tel:${item.number}`}
              className="p-3 rounded-2xl bg-[#141528] hover:bg-[#191b36] border border-white/5 flex items-center justify-between text-xs transition active:scale-98"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="font-semibold text-white">{item.title}</div>
                  <div className="text-[10px] text-zinc-400">{item.sub}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20">
                  {item.number}
                </span>
                <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  <Phone className="w-3.5 h-3.5" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
