import { useState, useEffect, useCallback, useRef } from 'react';

export interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  altitude?: number | null;
  speed?: number | null;
  timestamp: number;
}

export function useGeolocation() {
  const [location, setLocation] = useState<LocationData | null>(() => {
    const saved = localStorage.getItem('sg_last_loc');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const refreshLocation = useCallback((highAccuracy = true) => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported on this device');
      return;
    }
    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const data: LocationData = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          altitude: pos.coords.altitude,
          speed: pos.coords.speed,
          timestamp: pos.timestamp || Date.now(),
        };
        setLocation(data);
        localStorage.setItem('sg_last_loc', JSON.stringify(data));
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Unable to retrieve location');
        setLoading(false);
      },
      {
        enableHighAccuracy: highAccuracy,
        timeout: 12000,
        maximumAge: 10000,
      }
    );
  }, []);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation || watchIdRef.current !== null) return;
    setIsWatching(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const data: LocationData = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          altitude: pos.coords.altitude,
          speed: pos.coords.speed,
          timestamp: pos.timestamp || Date.now(),
        };
        setLocation(data);
        localStorage.setItem('sg_last_loc', JSON.stringify(data));
      },
      (err) => {
        console.warn('Watch location error:', err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000,
      }
    );
  }, []);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsWatching(false);
  }, []);

  useEffect(() => {
    refreshLocation(false);
    return () => {
      stopWatching();
    };
  }, [refreshLocation, stopWatching]);

  const getGoogleMapsUrl = useCallback(() => {
    if (!location) return '';
    return `https://maps.google.com/?q=${location.lat},${location.lng}`;
  }, [location]);

  return {
    location,
    loading,
    error,
    isWatching,
    refreshLocation,
    startWatching,
    stopWatching,
    getGoogleMapsUrl,
  };
}
