import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { BottomNav, NavTab } from './components/BottomNav';
import { SOSScreen } from './components/SOSScreen';
import { ContactsScreen } from './components/ContactsScreen';
import { MapScreen } from './components/MapScreen';
import { AndroidApkHub } from './components/AndroidApkHub';
import { SettingsScreen } from './components/SettingsScreen';
import { FakeCallModal } from './components/FakeCallModal';
import { SirenModal } from './components/SirenModal';
import { EvidenceRecorderModal } from './components/EvidenceRecorderModal';
import { PinLockModal } from './components/PinLockModal';
import { DiscreetNotes } from './components/DiscreetNotes';
import { DiscreetCalculator } from './components/DiscreetCalculator';
import { useGeolocation } from './hooks/useGeolocation';
import { usePWAInstall } from './hooks/usePWAInstall';
import { Contact, AppSettings } from './types';
import { Shield, EyeOff, Download, WifiOff } from 'lucide-react';
import {
  testConnection,
  syncEmergencyAlertToFirebase,
  resolveEmergencyAlertInFirebase,
} from './lib/firebase';

export default function App() {
  // Navigation & Core States
  const [currentTab, setCurrentTab] = useState<NavTab>('sos');
  const [isEmergency, setIsEmergency] = useState(false);
  const activeAlertIdRef = useRef<string | null>(null);

  // Modals
  const [isFakeCallOpen, setIsFakeCallOpen] = useState(false);
  const [isSirenOpen, setIsSirenOpen] = useState(false);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [autoRecordTrigger, setAutoRecordTrigger] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [discreetMode, setDiscreetMode] = useState<'none' | 'notes' | 'calculator'>('none');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Geolocation & PWA
  const { location, loading: locLoading, error: locError, refreshLocation, startWatching, stopWatching, getGoogleMapsUrl } = useGeolocation();
  const { isInstallable, isInstalled, install } = usePWAInstall();

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('sg_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      shakeEnabled: true,
      shakeSensitivity: 26,
      autoRecordSOS: false,
      sirenOnSOS: false,
      strobeOnSOS: true,
      pinLockEnabled: false,
      pinCode: '1234',
      discreetMode: 'none',
      emergencyMessage: '🚨 EMERGENCY! I need urgent help! My live GPS location is attached.',
      country: 'IN',
    };
  });

  // Contacts
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('sg_contacts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: '1',
        name: 'Mom / Family',
        phone: '+91 98765 43210',
        relation: 'Mother',
        isPrimary: true,
      },
      {
        id: '2',
        name: 'Police Emergency (112)',
        phone: '112',
        relation: 'Emergency Authority',
        isPrimary: false,
      },
    ];
  });

  // Save Settings & Contacts
  useEffect(() => {
    localStorage.setItem('sg_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('sg_contacts', JSON.stringify(contacts));
  }, [contacts]);

  // Test Firebase connection on mount
  useEffect(() => {
    testConnection().then((connected) => {
      if (connected) {
        console.log('SafeGuard connected to Firebase Cloud Firestore.');
      }
    });
  }, []);

  // Online / Offline monitor
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Handle URL params for Android Shortcuts
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'sos') {
      handleTriggerSOS();
    } else if (params.get('action') === 'fakecall') {
      setIsFakeCallOpen(true);
    } else if (params.get('discreet') === 'true') {
      setDiscreetMode('notes');
    }

    // App Lock on initial load if configured
    if (settings.pinLockEnabled && settings.pinCode) {
      setIsAppLocked(true);
    }
  }, []);

  // Shake detection listener
  const lastShakeRef = useRef<number>(0);
  const lastAccRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    if (!settings.shakeEnabled) return;

    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      const delta =
        Math.abs(acc.x - lastAccRef.current.x) +
        Math.abs(acc.y - lastAccRef.current.y) +
        Math.abs(acc.z - lastAccRef.current.z);

      if (delta > settings.shakeSensitivity) {
        const now = Date.now();
        if (now - lastShakeRef.current > 2000) {
          lastShakeRef.current = now;
          handleTriggerSOS();
        }
      }

      lastAccRef.current = { x: acc.x, y: acc.y, z: acc.z };
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [settings.shakeEnabled, settings.shakeSensitivity]);

  // Send SOS WhatsApp message
  const handleSendSOSMessage = useCallback(
    (contact?: Contact) => {
      const target = contact || contacts.find((c) => c.isPrimary) || contacts[0];
      const mapsUrl = getGoogleMapsUrl();
      const coordsText = location
        ? `\nCoordinates: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)} (±${location.accuracy}m)`
        : '';
      const fullText = `${settings.emergencyMessage}\n\n📍 Live GPS: ${mapsUrl || 'Acquiring...'}${coordsText}\nSent via SafeGuard Android Companion.`;

      if (target) {
        const cleanNumber = target.phone.replace(/[^\d+]/g, '');
        window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(fullText)}`, '_blank');
      } else {
        if (navigator.share) {
          navigator.share({ title: 'EMERGENCY SOS', text: fullText, url: mapsUrl }).catch(() => {});
        } else {
          window.open(`https://wa.me/?text=${encodeURIComponent(fullText)}`, '_blank');
        }
      }
    },
    [contacts, getGoogleMapsUrl, location, settings.emergencyMessage]
  );

  // Trigger Emergency Protocol
  const handleTriggerSOS = useCallback(() => {
    setIsEmergency(true);
    startWatching();

    if (navigator.vibrate) {
      navigator.vibrate([300, 150, 300, 150, 500]);
    }

    if (settings.sirenOnSOS) {
      setIsSirenOpen(true);
    }

    if (settings.autoRecordSOS) {
      setAutoRecordTrigger(true);
      setIsRecorderOpen(true);
    }

    // Persist active alert to Firebase Cloud
    if (location) {
      syncEmergencyAlertToFirebase({
        lat: location.lat,
        lng: location.lng,
        accuracy: location.accuracy,
        message: settings.emergencyMessage,
      }).then((alertId) => {
        if (alertId) activeAlertIdRef.current = alertId;
      });
    }

    // Auto-dispatch WhatsApp SOS message to primary contact
    handleSendSOSMessage();
  }, [handleSendSOSMessage, location, settings.autoRecordSOS, settings.emergencyMessage, settings.sirenOnSOS, startWatching]);

  const handleCancelSOS = () => {
    setIsEmergency(false);
    stopWatching();
    setIsSirenOpen(false);
    if (navigator.vibrate) navigator.vibrate(50);

    if (activeAlertIdRef.current) {
      resolveEmergencyAlertInFirebase(activeAlertIdRef.current);
      activeAlertIdRef.current = null;
    }
  };

  // Discreet Modes
  if (discreetMode === 'notes') {
    return <DiscreetNotes onUnlock={() => setDiscreetMode('none')} />;
  }

  if (discreetMode === 'calculator') {
    return (
      <DiscreetCalculator
        unlockPin={settings.pinCode}
        onUnlock={() => setDiscreetMode('none')}
      />
    );
  }

  // PIN App Lock
  if (isAppLocked) {
    return (
      <PinLockModal
        isOpen={true}
        expectedPin={settings.pinCode}
        onSuccess={() => setIsAppLocked(false)}
        title="SafeGuard Android"
        subtitle="Enter 4-digit PIN to access safety controls"
        allowCancel={false}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b16] text-[#eaeaea] flex flex-col font-sans select-none max-w-md mx-auto relative shadow-2xl overflow-x-hidden">
      {/* Android System Status Bar */}
      <AndroidStatusBar isEmergency={isEmergency} />

      {/* Offline Toast */}
      {!isOnline && (
        <div className="bg-amber-600/90 text-white text-[11px] font-semibold py-1 px-4 flex items-center justify-center gap-1.5 shadow">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode — All SOS triggers &amp; local records are fully functional.</span>
        </div>
      )}

      {/* App Header */}
      <header className="px-4 py-3 bg-[#121427]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-600/30 text-white">
            <Shield className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
              SafeGuard
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                APK
              </span>
            </h1>
            <p className="text-[10px] text-zinc-400">Women Safety &amp; Emergency SOS</p>
          </div>
        </div>

        {/* Quick disguise button & PWA Install */}
        <div className="flex items-center gap-1.5">
          {isInstallable && !isInstalled && (
            <button
              onClick={install}
              className="p-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1 transition"
              title="Install on Android"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install</span>
            </button>
          )}

          <button
            onClick={() => setDiscreetMode('notes')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition"
            title="Discreet Disguise Mode"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Screen Container */}
      <main className="flex-1 p-4 overflow-y-auto">
        {currentTab === 'sos' && (
          <SOSScreen
            isEmergency={isEmergency}
            onTriggerSOS={handleTriggerSOS}
            onCancelSOS={handleCancelSOS}
            location={location}
            contacts={contacts}
            onOpenFakeCall={() => setIsFakeCallOpen(true)}
            onOpenSiren={() => setIsSirenOpen(true)}
            onOpenRecorder={() => {
              setAutoRecordTrigger(false);
              setIsRecorderOpen(true);
            }}
            onShareLocation={() => handleSendSOSMessage()}
          />
        )}

        {currentTab === 'contacts' && (
          <ContactsScreen
            contacts={contacts}
            onUpdateContacts={setContacts}
            onSendSOSMessage={handleSendSOSMessage}
          />
        )}

        {currentTab === 'radar' && (
          <MapScreen
            location={location}
            loading={locLoading}
            error={locError}
            onRefresh={() => refreshLocation(true)}
            getGoogleMapsUrl={getGoogleMapsUrl}
          />
        )}

        {currentTab === 'apk' && <AndroidApkHub />}

        {currentTab === 'settings' && (
          <SettingsScreen
            settings={settings}
            onUpdateSettings={setSettings}
            onRequestPinModal={() => setIsPinModalOpen(true)}
            onEnterDiscreet={(mode) => setDiscreetMode(mode)}
          />
        )}
      </main>

      {/* Bottom Android Navigation */}
      <BottomNav
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        isEmergency={isEmergency}
      />

      {/* Global Interactive Overlays */}
      <FakeCallModal
        isOpen={isFakeCallOpen}
        onClose={() => setIsFakeCallOpen(false)}
      />

      <SirenModal
        isOpen={isSirenOpen}
        onClose={() => setIsSirenOpen(false)}
      />

      <EvidenceRecorderModal
        isOpen={isRecorderOpen}
        onClose={() => {
          setIsRecorderOpen(false);
          setAutoRecordTrigger(false);
        }}
        autoStart={autoRecordTrigger}
      />

      {/* PIN Setup / Change Modal */}
      {isPinModalOpen && (
        <PinLockModal
          isOpen={true}
          expectedPin={settings.pinCode}
          onSuccess={() => {
            const nextPin = prompt('Enter new 4-digit PIN:', '1234');
            if (nextPin && /^\d{4}$/.test(nextPin)) {
              setSettings({ ...settings, pinCode: nextPin, pinLockEnabled: true });
              alert('New PIN set successfully!');
            }
            setIsPinModalOpen(false);
          }}
          title="Security PIN Verification"
          subtitle="Enter current PIN to update settings"
          allowCancel={true}
          onCancel={() => setIsPinModalOpen(false)}
        />
      )}
    </div>
  );
}
