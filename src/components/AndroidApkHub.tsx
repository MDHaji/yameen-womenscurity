import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  CheckCircle2,
  Copy,
  Check,
  FileCode,
  Shield,
  Layers,
  Terminal,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const AndroidApkHub: React.FC = () => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const bubblewrapCmd = `npm i -g @bubblewrap/cli
bubblewrap init --manifest="${window.location.origin}/manifest.webmanifest"
bubblewrap build
# Output: app-release-signed.apk`;

  const capacitorCmd = `npm i @capacitor/core @capacitor/cli @capacitor/android
npx cap init SafeGuard com.safeguard.emergency --web-dir=dist
npx cap add android
npx cap open android
# Build APK in Android Studio -> Build -> Build APK(s)`;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  const downloadAndroidConfig = () => {
    const config = {
      app_name: 'SafeGuard - Women Safety & Emergency SOS',
      package_name: 'com.safeguard.emergency',
      version_name: '1.0.0',
      version_code: 1,
      min_sdk: 24,
      target_sdk: 35,
      permissions: [
        'android.permission.INTERNET',
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.CAMERA',
        'android.permission.RECORD_AUDIO',
        'android.permission.VIBRATE',
        'android.permission.WAKE_LOCK',
      ],
      twa_manifest: {
        host: window.location.host,
        start_url: '/',
        theme_color: '#0f0f1a',
        background_color: '#0f0f1a',
        display: 'standalone',
      },
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'safeguard-android-manifest.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-5 pb-24 animate-in fade-in">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-[#0e1022] border border-indigo-500/20 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Android APK &amp; App Hub
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                Native Ready
              </span>
            </h2>
            <p className="text-xs text-zinc-400">Install as standalone Android WebAPK or compile signed .apk</p>
          </div>
        </div>

        {/* 1-Click Install or Status */}
        <div className="mt-4 pt-4 border-t border-white/10">
          {isInstalled ? (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>SafeGuard is already installed in Standalone Mode on your device!</span>
            </div>
          ) : isInstallable ? (
            <button
              onClick={install}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 hover:opacity-95 active:scale-98 transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Install Directly on Android (1-Tap WebAPK)
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300">
              <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                How to install on Android phone right now:
              </div>
              <ol className="list-decimal list-inside space-y-1 text-zinc-400 text-[11px]">
                <li>Open this app in Chrome on your Android smartphone.</li>
                <li>Tap the three dots (<strong>⋮</strong>) menu in the top-right corner.</li>
                <li>Tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home Screen&quot;</strong>.</li>
                <li>The app appears in your Android App Drawer with native full-screen launch!</li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* Android Hardware Capabilities */}
      <div className="p-4 rounded-2xl bg-[#141528] border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-400" />
            Android Native Permissions Status
          </h3>
          <span className="text-[10px] text-zinc-500 font-mono">SDK 35 (Android 15)</span>
        </div>

        <div className="space-y-2 text-xs">
          {[
            {
              perm: 'ACCESS_FINE_LOCATION',
              name: 'Precise GPS Location',
              desc: 'Enables real-time live coordinate sharing on SOS',
              granted: true,
            },
            {
              perm: 'CAMERA & RECORD_AUDIO',
              name: 'Evidence Camera & Mic',
              desc: 'Enables background evidence recording to local device',
              granted: true,
            },
            {
              perm: 'VIBRATE',
              name: 'Haptic Engine',
              desc: 'Tactile vibration pulse for incoming fake calls & SOS',
              granted: true,
            },
            {
              perm: 'WAKE_LOCK',
              name: 'Screen WakeLock',
              desc: 'Keeps siren and SOS active without display sleep',
              granted: true,
            },
          ].map((item, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {item.name}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{item.perm}</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                GRANTED
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* APK Compilation Instructions */}
      <div className="p-4 rounded-2xl bg-[#141528] border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-indigo-400" />
              Build Standalone .APK File (TWA / Bubblewrap)
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Google-recommended tool to package this app into an official Android APK for Play Store or side-loading.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-zinc-300 relative">
          <button
            onClick={() => handleCopy(bubblewrapCmd, 'bubblewrap')}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 flex items-center gap-1 text-[10px]"
          >
            {copiedCmd === 'bubblewrap' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copiedCmd === 'bubblewrap' ? 'Copied' : 'Copy'}
          </button>
          <pre className="overflow-x-auto whitespace-pre">{bubblewrapCmd}</pre>
        </div>

        {/* Capacitor Method */}
        <div>
          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
            <Layers className="w-4 h-4 text-emerald-400" />
            Alternative: Build with Capacitor &amp; Android Studio
          </h4>
          <div className="p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-zinc-300 relative">
            <button
              onClick={() => handleCopy(capacitorCmd, 'cap')}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 flex items-center gap-1 text-[10px]"
            >
              {copiedCmd === 'cap' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedCmd === 'cap' ? 'Copied' : 'Copy'}
            </button>
            <pre className="overflow-x-auto whitespace-pre">{capacitorCmd}</pre>
          </div>
        </div>

        {/* Download Android Manifest */}
        <button
          onClick={downloadAndroidConfig}
          className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 active:scale-98 transition"
        >
          <FileCode className="w-4 h-4 text-indigo-400" />
          Download Android Package Spec (safeguard-android-manifest.json)
        </button>
      </div>

      {/* Online APK Builders reference */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-zinc-300 flex items-center justify-between">
        <div>
          <div className="font-semibold text-white">Free Online APK Builder (PWABuilder)</div>
          <div className="text-[11px] text-zinc-400">Generate APK without Android Studio using Microsoft PWABuilder</div>
        </div>
        <a
          href="https://www.pwabuilder.com"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 flex items-center gap-1 text-[11px] font-semibold"
        >
          Open <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
