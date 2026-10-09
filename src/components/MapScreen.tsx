import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Plus,
  Compass,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { LocationData } from '../hooks/useGeolocation';
import { SafeZone } from '../types';

interface MapScreenProps {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  getGoogleMapsUrl: () => string;
}

export const MapScreen: React.FC<MapScreenProps> = ({
  location,
  loading,
  error,
  onRefresh,
  getGoogleMapsUrl,
}) => {
  const [copied, setCopied] = useState(false);
  const [safeZones, setSafeZones] = useState<SafeZone[]>(() => {
    const saved = localStorage.getItem('sg_safezones');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: '1',
            name: 'Home Sanctuary',
            icon: '🏠',
            lat: 28.6139,
            lng: 77.209,
            radiusMeters: 150,
          },
          {
            id: '2',
            name: 'Office / Campus',
            icon: '🏢',
            lat: 28.62,
            lng: 77.215,
            radiusMeters: 200,
          },
        ];
  });

  const handleCopyCoords = () => {
    if (!location) return;
    navigator.clipboard.writeText(`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddCurrentAsZone = (name: string, icon: string) => {
    if (!location) return;
    const newZone: SafeZone = {
      id: String(Date.now()),
      name,
      icon,
      lat: location.lat,
      lng: location.lng,
      radiusMeters: 150,
    };
    const updated = [newZone, ...safeZones];
    setSafeZones(updated);
    localStorage.setItem('sg_safezones', JSON.stringify(updated));
  };

  // Haversine distance in meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const mapIframeUrl = location
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.008}%2C${
        location.lat - 0.008
      }%2C${location.lng + 0.008}%2C${location.lat + 0.008}&layer=mapnik&marker=${location.lat}%2C${
        location.lng
      }`
    : '';

  return (
    <div className="space-y-4 pb-24 animate-in fade-in">
      {/* Location Status Card */}
      <div className="p-4 rounded-2xl bg-[#141528] border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Live GPS Tracker</h3>
              <p className="text-xs text-zinc-400">
                {location ? `Accuracy: ±${location.accuracy} meters` : 'Searching satellites...'}
              </p>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 disabled:opacity-50 transition"
            title="Refresh GPS"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {location ? (
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-zinc-300 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">Coordinates</div>
              <div className="font-semibold text-white mt-0.5">
                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCoords}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-200 flex items-center gap-1 text-[11px]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <a
                href={getGoogleMapsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 flex items-center gap-1 text-[11px]"
              >
                Maps <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-zinc-500">
            Fetching accurate coordinates from device GPS...
          </div>
        )}
      </div>

      {/* Embedded Live Map */}
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0d0f1e] shadow-xl relative">
        <div className="h-64 w-full relative">
          {mapIframeUrl ? (
            <iframe
              title="Current Location Map"
              src={mapIframeUrl}
              className="w-full h-full border-none filter brightness-90 contrast-125"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-zinc-500 text-xs">
              <Compass className="w-8 h-8 mb-2 opacity-50 animate-spin" />
              <span>Map preview will display after GPS lock</span>
            </div>
          )}
        </div>
      </div>

      {/* Safe Zones / Geofencing */}
      <div className="p-4 rounded-2xl bg-[#141528] border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Safe Zones (Geofencing)
            </h3>
            <p className="text-[11px] text-zinc-400">Alert triggers if you leave predetermined safety perimeter</p>
          </div>
        </div>

        <div className="space-y-2">
          {safeZones.map((zone) => {
            const distance = location
              ? calculateDistance(location.lat, location.lng, zone.lat, zone.lng)
              : null;
            const isInside = distance !== null && distance <= zone.radiusMeters;

            return (
              <div
                key={zone.id}
                className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{zone.icon}</span>
                  <div>
                    <div className="font-semibold text-white">{zone.name}</div>
                    <div className="text-[10px] text-zinc-400">
                      Radius: {zone.radiusMeters}m •{' '}
                      {distance !== null ? `${distance}m away` : 'Calculating...'}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {isInside ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                      INSIDE ZONE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-zinc-700/50 text-zinc-400 text-[10px]">
                      OUTSIDE
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick add current spot as safe zone */}
        <div className="pt-2 flex gap-2">
          <button
            onClick={() => handleAddCurrentAsZone('Current Location', '📍')}
            disabled={!location}
            className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Save Current GPS as Safe Zone
          </button>
        </div>
      </div>
    </div>
  );
};
