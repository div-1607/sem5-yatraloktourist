import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import geofenceApi from '../services/geofenceApi';
import socketService from '../services/socketService';

const LiveLocationContext = createContext(null);

export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const FALLBACK_MAP_CENTER = [22.9734, 78.6569];

const isSecureGeoContext = () =>
  typeof window !== 'undefined' && window.isSecureContext === true;

const readSavedGps = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('yatralok_last_coords') || 'null');
    if (saved?.latitude && saved?.longitude && saved.source === 'gps') {
      return saved;
    }
  } catch {
    /* ignore */
  }
  return null;
};

export const LiveLocationProvider = ({ children }) => {
  const savedGps = readSavedGps();

  const [coordinates, setCoordinates] = useState(savedGps);
  const [userLocation, setUserLocation] = useState(
    savedGps ? [savedGps.latitude, savedGps.longitude] : null
  );
  const [hasFix, setHasFix] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('prompt');
  const [error, setError] = useState(null);
  const [movementPath, setMovementPath] = useState(savedGps ? [[savedGps.latitude, savedGps.longitude]] : []);
  const [totalDistanceMeters, setTotalDistanceMeters] = useState(0);

  const [activeZones, setActiveZones] = useState([]);
  const [nearbyAttractions, setNearbyAttractions] = useState([]);
  const [highRiskWarning, setHighRiskWarning] = useState(null);
  const [recentGeofenceEvents, setRecentGeofenceEvents] = useState([]);
  const [placeLabel, setPlaceLabel] = useState(savedGps?.placeLabel || null);

  const reverseGeocodeTimerRef = useRef(null);

  const watchIdRef = useRef(null);
  const lastPingCoordRef = useRef(null);
  const isPingingRef = useRef(false);
  const startedRef = useRef(false);

  const lookupPlaceLabel = useCallback((lat, lng) => {
    if (reverseGeocodeTimerRef.current) {
      clearTimeout(reverseGeocodeTimerRef.current);
    }
    reverseGeocodeTimerRef.current = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
        const res = await fetch(url, {
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) return;
        const data = await res.json();
        const label = data?.display_name || null;
        if (label) {
          setPlaceLabel(label);
          setCoordinates((prev) => (prev ? { ...prev, placeLabel: label } : prev));
        }
      } catch {
        /* reverse geocode is optional */
      }
    }, 900);
  }, []);

  const syncGeofenceTelemetry = useCallback(async (lat, lng, accuracy, speed) => {
    if (isPingingRef.current) return;
    isPingingRef.current = true;

    try {
      const res = await geofenceApi.pingLocation(lat, lng);
      if (res.data && res.data.success) {
        const { activeZonesInside, triggeredEvents, highRiskWarning: warning, nearbyAttractions: nearby } =
          res.data.data || {};

        setActiveZones(activeZonesInside || []);
        setHighRiskWarning(warning || null);
        setNearbyAttractions(nearby || []);

        if (triggeredEvents && triggeredEvents.length > 0) {
          setRecentGeofenceEvents((prev) => [...triggeredEvents, ...prev].slice(0, 20));
          triggeredEvents.forEach((evt) => {
            if (evt.eventType === 'BREACH_RESTRICTED') {
              toast.error(`${evt.notificationTitle}: ${evt.notificationMessage}`, { duration: 7000 });
            } else if (evt.eventType === 'ENTRY') {
              toast.success(evt.notificationTitle, { duration: 4500 });
            } else if (evt.eventType === 'EXIT') {
              toast(evt.notificationTitle, { duration: 3500 });
            }
          });
        }
      }

      try {
        await geofenceApi.getNearbyAttractions(lat, lng, 10000).then((nearRes) => {
          if (nearRes.data?.success && Array.isArray(nearRes.data.data) && nearRes.data.data.length) {
            setNearbyAttractions(nearRes.data.data);
          }
        });
      } catch {
        /* nearby is optional */
      }

      socketService.sendLocationUpdate(lat, lng, accuracy, speed);
    } catch (err) {
      console.warn('[LiveLocation] Geofence sync notice:', err.message);
    } finally {
      isPingingRef.current = false;
    }
  }, []);

  const handlePositionSuccess = useCallback(
    (position) => {
      const { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed } = position.coords;

      const newCoords = {
        latitude,
        longitude,
        accuracy: Math.round(accuracy || 0),
        altitude: altitude !== null ? Math.round(altitude) : null,
        altitudeAccuracy: altitudeAccuracy !== null ? Math.round(altitudeAccuracy) : null,
        heading: heading !== null ? Math.round(heading) : null,
        speed: speed !== null && !Number.isNaN(speed) ? +(speed * 3.6).toFixed(1) : 0,
        source: 'gps',
        timestamp: position.timestamp,
      };

      setCoordinates(newCoords);
      setUserLocation([latitude, longitude]);
      setHasFix(true);
      setError(null);
      setPermissionStatus('granted');

      try {
        localStorage.setItem('yatralok_last_coords', JSON.stringify(newCoords));
        localStorage.setItem('yatralok_last_user_loc', JSON.stringify([latitude, longitude]));
      } catch {
        /* quota */
      }

      setMovementPath((prev) => {
        if (prev.length === 0) {
          return [[latitude, longitude]];
        }
        const last = prev[prev.length - 1];
        const dist = calculateHaversineDistance(last[0], last[1], latitude, longitude);
        if (dist >= 2) {
          setTotalDistanceMeters((total) => total + Math.round(dist));
          return [...prev.slice(-400), [latitude, longitude]];
        }
        return prev;
      });

      const movedEnough =
        !lastPingCoordRef.current ||
        calculateHaversineDistance(
          lastPingCoordRef.current[0],
          lastPingCoordRef.current[1],
          latitude,
          longitude
        ) >= 5;

      if (movedEnough) {
        lastPingCoordRef.current = [latitude, longitude];
        syncGeofenceTelemetry(latitude, longitude, newCoords.accuracy, newCoords.speed);
        lookupPlaceLabel(latitude, longitude);
      }
    },
    [syncGeofenceTelemetry, lookupPlaceLabel]
  );

  const handlePositionError = useCallback((err) => {
    console.warn('[LiveLocation] Geolocation watch error:', err);
    let friendlyMessage = 'Unable to retrieve your location.';

    switch (err.code) {
      case err.PERMISSION_DENIED:
        friendlyMessage =
          'Location permission denied. Allow location in the browser address bar (lock icon) to enable live tracking.';
        setPermissionStatus('denied');
        setIsTracking(false);
        toast.error(friendlyMessage, { id: 'gps-error', duration: 6000 });
        break;
      case err.POSITION_UNAVAILABLE:
        friendlyMessage = 'GPS is unavailable. Check that location services are enabled on this device.';
        setError(friendlyMessage);
        return;
      case err.TIMEOUT:
        friendlyMessage = 'Waiting for a GPS lock. Move near a window if indoors.';
        setError(friendlyMessage);
        return;
      default:
        friendlyMessage = err.message || 'An unknown location error occurred.';
    }

    setError(friendlyMessage);
  }, []);

  const forceLocate = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    toast.loading('Acquiring GPS coordinates…', { id: 'gps-lock' });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handlePositionSuccess(pos);
        toast.success(`GPS locked (±${Math.round(pos.coords.accuracy)}m)`, { id: 'gps-lock' });
      },
      () => {
        navigator.geolocation.getCurrentPosition(
          (fallbackPos) => {
            handlePositionSuccess(fallbackPos);
            toast.success(`Location locked (±${Math.round(fallbackPos.coords.accuracy)}m)`, { id: 'gps-lock' });
          },
          (finalErr) => {
            handlePositionError(finalErr);
            toast.error(finalErr.message || 'Unable to acquire GPS lock', { id: 'gps-lock' });
          },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  }, [handlePositionSuccess, handlePositionError]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      const msg = 'Geolocation is not supported by your browser.';
      setError(msg);
      setPermissionStatus('unsupported');
      toast.error(msg);
      return;
    }

    if (!isSecureGeoContext()) {
      const msg =
        'Live GPS needs a secure origin (localhost or HTTPS). Open the app on http://localhost or an HTTPS URL.';
      setError(msg);
      setPermissionStatus('insecure');
      toast.error(msg, { id: 'gps-insecure' });
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setError(null);
    setIsTracking(true);

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 3000,
    };

    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        handlePositionSuccess,
        (err) => {
          if (err.code === err.TIMEOUT || err.code === err.POSITION_UNAVAILABLE) {
            if (watchIdRef.current !== null) {
              navigator.geolocation.clearWatch(watchIdRef.current);
            }
            watchIdRef.current = navigator.geolocation.watchPosition(
              handlePositionSuccess,
              handlePositionError,
              { enableHighAccuracy: false, timeout: 30000, maximumAge: 10000 }
            );
          } else {
            handlePositionError(err);
          }
        },
        geoOptions
      );
    } catch (e) {
      setIsTracking(false);
      setError('Failed to initialize geolocation watch: ' + e.message);
    }
  }, [handlePositionSuccess, handlePositionError]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  const clearMovementPath = useCallback(() => {
    setMovementPath(userLocation ? [userLocation] : []);
    setTotalDistanceMeters(0);
    toast.success('Movement path history cleared');
  }, [userLocation]);

  const getDistanceMeters = useCallback(
    (lat, lng) => {
      if (!userLocation) return null;
      return calculateHaversineDistance(userLocation[0], userLocation[1], lat, lng);
    },
    [userLocation]
  );

  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionStatus('unsupported');
      setError('Geolocation is not supported by this browser.');
      return;
    }

    if (!startedRef.current) {
      startedRef.current = true;
      startTracking();
    }

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((permission) => {
          setPermissionStatus(permission.state);
          permission.onchange = () => {
            setPermissionStatus(permission.state);
            if (permission.state === 'granted') {
              startTracking();
            } else if (permission.state === 'denied') {
              stopTracking();
              setError('Location permission was revoked in browser settings.');
            }
          };
        })
        .catch(() => {});
    }
  }, [startTracking, stopTracking]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const value = {
    coordinates,
    userLocation,
    placeLabel,
    hasFix,
    isTracking,
    permissionStatus,
    error,
    isSecureContext: isSecureGeoContext(),
    movementPath,
    totalDistanceMeters,
    activeZones,
    nearbyAttractions,
    highRiskWarning,
    recentGeofenceEvents,
    startTracking,
    stopTracking,
    forceLocate,
    clearMovementPath,
    syncGeofenceTelemetry,
    getDistanceMeters,
  };

  return <LiveLocationContext.Provider value={value}>{children}</LiveLocationContext.Provider>;
};

export const useLiveLocation = () => {
  const context = useContext(LiveLocationContext);
  if (!context) {
    throw new Error('useLiveLocation must be used within a LiveLocationProvider');
  }
  return context;
};

export default LiveLocationContext;
