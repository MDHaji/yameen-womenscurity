import React, { useState, useEffect } from 'react';
import {
  Vibrate,
  Lock,
  EyeOff,
  Video,
  Volume2,
  Sliders,
  Globe,
  MessageSquare,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onRequestPinModal: () => void;
  onEnterDiscreet: (mode: 'notes' | 'calculator') => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onRequestPinModal,
  onEnterDiscreet,
}) => {
  const [motionAcc, setMotionAcc] = useState<number>(0);
  const [msgDraft, setMsgDraft] = useState(settings.emergencyMessage);
  const [savedMsg, setSavedMsg] = useState(false);

  // Live motion monitor for testing shake sensitivity
  useEffect(() => {
    let lastX = 0, lastY = 0, lastZ = 0;
    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;
      const delta = Math.abs(acc.x - lastX) + Math.abs(acc.y - lastY) + Math.abs(acc.z - lastZ);
      setMotionAcc(Math.round(delta));
      lastX = acc.x;
      lastY = acc.y;
      lastZ = acc.z;
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, []);

  const toggle = (key: keyof AppSettings) => {
    onUpdateSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleSaveMessage = () => {
    onUpdateSettings({
      ...settings,
      emergencyMessage: msgDraft,
    });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in">
      {/* Shake Detection Configuration */}
      <div className="p-4 rounded-2xl bg-[#141528] border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Vibrate className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Shake-to-SOS Trigger</h3>
              <p className="text-xs text-zinc-400">Vigorously shake phone to trigger emergency SOS</p>
            </div>
          </div>
          <button
            onClick={() => toggle('shakeEnabled')}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              settings.shakeEnabled ? 'bg-rose-600' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.shakeEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {settings.shakeEnabled && (
          <div className="pt-2 border-t border-white/5 space-y-2">
            <div className="flex justify-between text-xs text-zinc-300">
              <span className="flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5" /> Sensitivity Threshold
              </span>
              <span className="font-mono font-bold text-rose-400">{settings.shakeSensitivity}</span>
            </div>
            <input
              type="range"
              min="15"
              max="45"
              step="2"
              value={settings.shakeSensitivity}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  shakeSensitivity: Number(e.target.value),
                })
              }
              className="w-full accent-rose-500 cursor-pointer"
            />
            {/* Live sensor visualizer */}
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
              <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                <span>Live Accelerometer Meter: {motionAcc}</span>
                <span>Threshold: {settings.shakeSensitivity}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-100 ${
                    motionAcc >= settings.shakeSensitivity ? 'bg-rose-500' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, (motionAcc / 50) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Disguise / Discreet Mode */}
      <div className="p-4 rounded-2xl bg-[#141528] border border-white/5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
            <EyeOff className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Discreet Disguise Mode</h3>
            <p className="text-xs text-zinc-400">Mask the app interface under hostile surveillance</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => onEnterDiscreet('notes')}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left transition group active:scale-98"
          >
            <div className="text-xl mb-1">📝</div>
            <div className="text-xs font-bold text-white group-hover:text-blue-400">Notes App Disguise</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Disguises as QuickNotes with secret title gesture</div>
          </button>

          <button
            onClick={() => onEnterDiscreet('calculator')}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left transition group active:scale-98"
          >
            <div className="text-xl mb-1">🧮</div>
            <div className="text-xs font-bold text-white group-hover:text-blue-400">Calculator Disguise</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Functional calculator unlocked by PIN + &quot;=&quot;</div>
          </button>
        </div>
      </div>

      {/* Security & PIN Lock */}
      <div className="p-4 rounded-2xl bg-[#141528] border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">PIN App Lock</h3>
              <p className="text-xs text-zinc-400">Require 4-digit PIN to open application</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (!settings.pinLockEnabled && !settings.pinCode) {
                onRequestPinModal();
              } else {
                toggle('pinLockEnabled');
              }
            }}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              settings.pinLockEnabled ? 'bg-rose-600' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.pinLockEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {settings.pinLockEnabled && (
          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-zinc-300">
              Current PIN: <span className="font-mono text-rose-400 font-bold">••••</span>
            </span>
            <button
              onClick={onRequestPinModal}
              className="px-3 py-1.5 rounded-lg bg-white/10 text-zinc-200 text-xs font-semibold hover:bg-white/15"
            >
              Change PIN
            </button>
          </div>
        )}
      </div>

      {/* Emergency Automated Actions */}
      <div className="p-4 rounded-2xl bg-[#141528] border border-white/5 space-y-3">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          SOS Trigger Automations
        </h3>

        {/* Auto Record */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2.5">
            <Video className="w-4 h-4 text-rose-400" />
            <div>
              <div className="text-xs font-semibold text-white">Auto-Record Evidence</div>
              <div className="text-[10px] text-zinc-400">Start silent camera/mic recording when SOS fires</div>
            </div>
          </div>
          <button
            onClick={() => toggle('autoRecordSOS')}
            className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
              settings.autoRecordSOS ? 'bg-rose-600' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                settings.autoRecordSOS ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Siren on SOS */}
        <div className="flex items-center justify-between py-1 border-t border-white/5 pt-2">
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-4 h-4 text-rose-400" />
            <div>
              <div className="text-xs font-semibold text-white">Emergency Siren on SOS</div>
              <div className="text-[10px] text-zinc-400">Loud dual-tone siren sounds automatically</div>
            </div>
          </div>
          <button
            onClick={() => toggle('sirenOnSOS')}
            className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
              settings.sirenOnSOS ? 'bg-rose-600' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                settings.sirenOnSOS ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* SOS Message Template */}
      <div className="p-4 rounded-2xl bg-[#141528] border border-white/5 space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Custom Emergency SOS Message
          </h3>
        </div>

        <textarea
          rows={3}
          value={msgDraft}
          onChange={(e) => setMsgDraft(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-rose-500 font-sans"
        />

        <div className="flex justify-between items-center pt-1">
          <span className="text-[10px] text-zinc-500">Live coordinates &amp; map link are appended automatically</span>
          <button
            onClick={handleSaveMessage}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shadow"
          >
            {savedMsg ? <Check className="w-3.5 h-3.5" /> : null}
            {savedMsg ? 'Saved' : 'Save Message'}
          </button>
        </div>
      </div>

      {/* Firebase Cloud Sync & Security */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121832] to-[#16122c] border border-amber-500/20 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
              🔥
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Firebase Cloud Database
              </h3>
              <p className="text-[10px] text-zinc-400">Project: coherent-math-w8p5g</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
            Active
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-[11px]">
          <div className="flex justify-between text-zinc-400">
            <span>Database Engine:</span>
            <span className="font-mono text-zinc-200">Cloud Firestore</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>API Key:</span>
            <span className="font-mono text-amber-300">AIzaSyDEHi...ZsGM</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Real-time SOS Sync:</span>
            <span className="text-emerald-400 font-semibold">Enabled</span>
          </div>
        </div>

        <p className="text-[10px] text-zinc-400 leading-relaxed">
          Your emergency alerts and contact list are backed up to Google Cloud Firestore with zero-trust security rules for remote access and emergency dispatch verification.
        </p>
      </div>
    </div>
  );
};
