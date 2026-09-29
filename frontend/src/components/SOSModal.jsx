import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  X,
  MapPin,
  Phone,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  Navigation,
  Radio,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLiveLocation } from '../context/LiveLocationContext';
import toast from 'react-hot-toast';

const SOSModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { coordinates: liveCoords, userLocation: liveUserLocation, isTracking, startTracking } = useLiveLocation();

  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [dispatchedTicket, setDispatchedTicket] = useState(null);

  // Request browser GPS location as soon as modal opens
  useEffect(() => {
    if (!isOpen) return;
    setDispatchedTicket(null);
    setLocationError(null);
    startTracking();
    if (!(liveCoords && liveCoords.latitude && liveCoords.longitude)) {
      fetchLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, startTracking]);

  useEffect(() => {
    if (!isOpen || !liveCoords?.latitude || !liveCoords?.longitude) return;
    setLocation({
      lat: liveCoords.latitude,
      lng: liveCoords.longitude,
      accuracy: liveCoords.accuracy || 10,
      speed: liveCoords.speed,
      altitude: liveCoords.altitude,
      address: `Live GPS Fix: ${liveCoords.latitude.toFixed(5)}, ${liveCoords.longitude.toFixed(5)} (±${liveCoords.accuracy || 10}m accuracy)`,
    });
    setLocationLoading(false);
  }, [isOpen, liveCoords]);

  const fetchLocation = () => {
    setLocationLoading(true);
    setLocationError(null);

    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by your browser.');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude);
        const lng = Number(pos.coords.longitude);
        const accuracy = Math.round(pos.coords.accuracy || 10);
        setLocation({
          lat,
          lng,
          accuracy,
          speed: pos.coords.speed !== null ? +(pos.coords.speed * 3.6).toFixed(1) : null,
          altitude: pos.coords.altitude !== null ? Math.round(pos.coords.altitude) : null,
          address: `GPS Fix: ${lat.toFixed(5)}, ${lng.toFixed(5)} (±${accuracy}m accuracy)`,
        });
        setLocationLoading(false);
      },
      (err) => {
        let msg = 'Unable to get location.';
        if (err.code === 1) {
          msg = 'Location permission denied. Please allow location permissions in your browser to dispatch SOS with live GPS.';
        } else if (err.code === 2) {
          msg = 'Location unavailable. Please check your device GPS / location services.';
        } else if (err.code === 3) {
          msg = 'Location request timed out. Please try again.';
        }
        setLocationError(msg);
        setLocationLoading(false);
      },
      { timeout: 12000, enableHighAccuracy: true }
    );
  };

  const effectiveLocation =
    location ||
    (liveCoords?.latitude && liveCoords?.longitude
      ? {
          lat: liveCoords.latitude,
          lng: liveCoords.longitude,
          accuracy: liveCoords.accuracy || 10,
          speed: liveCoords.speed,
          altitude: liveCoords.altitude,
          address: `Live GPS Fix: ${liveCoords.latitude.toFixed(5)}, ${liveCoords.longitude.toFixed(5)} (±${liveCoords.accuracy || 10}m precision)`,
        }
      : null) ||
    (() => {
      try {
        const cached = JSON.parse(localStorage.getItem('yatralok_last_coords'));
        if (cached?.latitude && cached?.longitude) {
          return {
            lat: cached.latitude,
            lng: cached.longitude,
            accuracy: cached.accuracy || 12,
            speed: cached.speed,
            altitude: cached.altitude,
            address: `Live GPS Fix: ${cached.latitude.toFixed(5)}, ${cached.longitude.toFixed(5)} (±${cached.accuracy || 12}m precision)`,
          };
        }
      } catch {}
      return null;
    })();

  const handleTransmitLocation = async () => {
    if (!effectiveLocation) {
      toast.error('Please allow GPS location permission to broadcast your emergency distress signal.');
      return;
    }

    setSubmitting(true);
    try {
      const activeLocation = effectiveLocation;

      const payload = {
        userName: user?.name || 'Tourist Traveler',
        userMobile: user?.mobile || 'Emergency Broadcast',
        userEmail: user?.email || '',
        digitalId: user?.digitalId || 'GUEST-UNREGISTERED',
        location: activeLocation,
        emergencyType: 'Emergency SOS',
        message: 'Live GPS location distress signal transmitted to Admin Command Center.',
      };

      const res = await api.post('/sos/create', payload);
      if (res.data.success) {
        setDispatchedTicket(res.data.data);
        toast.success('Live Location Transmitted to Admin Dashboard!');

        // Broadcast to Admin Dashboard immediately across tabs/windows
        try {
          const bc = new BroadcastChannel('yatralok_emergency_channel');
          bc.postMessage({
            type: 'SOS_CLICKED',
            data: res.data.data,
            timestamp: Date.now(),
          });
          bc.close();
        } catch (e) {}

        try {
          localStorage.setItem(
            'yatralok_latest_sos_event',
            JSON.stringify({
              id: res.data.data?._id || Date.now(),
              data: res.data.data,
              timestamp: Date.now(),
            })
          );
        } catch (e) {}
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to transmit location to admin');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-navy-900 border-2 border-red-500 rounded-3xl shadow-glow-red overflow-hidden">
        {/* Urgent Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 animate-pulse">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-black text-lg tracking-wider uppercase">
                EMERGENCY SOS
              </h3>
              <p className="text-[11px] text-rose-100 font-medium">
                Instant Live Location Broadcast
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {dispatchedTicket ? (
            /* Confirmation Screen */
            <div className="text-center py-2 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h4 className="text-xl font-black text-white">
                  Location Dispatched to Admin!
                </h4>
                <p className="text-xs text-rose-300 font-semibold mt-1">
                  🚨 Siren is currently alerting the Admin Command Center
                </p>
              </div>

              {/* Coordinates sent card */}
              <div className="p-4 rounded-2xl bg-navy-950/80 border border-emerald-500/30 text-left space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Distress Ticket ID:</span>
                  <span className="text-amber-400 font-mono font-bold">
                    #{dispatchedTicket._id.slice(-6).toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>GPS Coordinates:</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {dispatchedTicket.location?.lat?.toFixed(5)}, {dispatchedTicket.location?.lng?.toFixed(5)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Timestamp:</span>
                  <span className="text-slate-300">
                    {new Date(dispatchedTicket.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Instant Call Hotlines */}
              <div className="p-3.5 rounded-xl bg-navy-950/60 border border-white/10 text-left space-y-2.5">
                <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  Direct Emergency Hotlines:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <a
                    href="tel:112"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold hover:bg-rose-500/25 transition-all"
                  >
                    <span>Police / 112</span>
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="tel:108"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold hover:bg-emerald-500/25 transition-all"
                  >
                    <span>Ambulance / 108</span>
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-bold transition-colors"
              >
                Close Window
              </button>
            </div>
          ) : (
            /* Instant Single-Action SOS Option */
            <div className="space-y-6">
              {/* Location telemetry display */}
              <div className="p-4 rounded-2xl bg-navy-950/90 border border-white/15 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>Current GPS Status:</span>
                  </div>
                  <button
                    type="button"
                    onClick={fetchLocation}
                    disabled={locationLoading}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${locationLoading ? 'animate-spin' : ''}`} />
                    <span>Recalibrate</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-900/90 border border-blue-electric/30 flex items-start gap-3 shadow-glass">
                  <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0 mt-0.5 border border-rose-500/30">
                    <MapPin className="w-5 h-5 text-rose-500 animate-pulse" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {effectiveLocation ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                            Live GPS Locked
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-black/40 border border-white/10">
                            ±{effectiveLocation.accuracy || 10}m precision
                          </span>
                        </div>
                        <div className="text-white font-mono font-black text-base tracking-wide">
                          {effectiveLocation.lat?.toFixed(5)}° N, {effectiveLocation.lng?.toFixed(5)}° E
                        </div>
                        <p className="text-[11px] text-slate-300 truncate">
                          {effectiveLocation.address || `Live Browser Coordinates Fix`}
                        </p>
                        {effectiveLocation.speed !== null && effectiveLocation.speed !== undefined && (
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1 border-t border-white/5 font-mono">
                            <span>Speed: {effectiveLocation.speed} km/h</span>
                            {effectiveLocation.altitude && <span>Alt: {effectiveLocation.altitude}m</span>}
                          </div>
                        )}
                      </div>
                    ) : locationLoading ? (
                      <div className="flex items-center gap-2 text-xs text-amber-400 py-1.5">
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                        <span>Acquiring live satellite GPS coordinates...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-xs text-amber-300">Location permission required</span>
                        <button
                          type="button"
                          onClick={fetchLocation}
                          className="px-2.5 py-1 rounded bg-blue-electric text-white text-[11px] font-bold"
                        >
                          Enable GPS
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {user && (
                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
                    <span>Broadcasting as:</span>
                    <span className="text-amber-300 font-semibold">{user.name} ({user.mobile})</span>
                  </div>
                )}
              </div>

              {/* Main Instant Action Button */}
              <div className="space-y-3 text-center">
                <button
                  type="button"
                  onClick={handleTransmitLocation}
                  disabled={submitting || locationLoading}
                  className="w-full py-5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-black tracking-wider text-base shadow-glow-red flex items-center justify-center gap-3 active:scale-95 transition-all border-2 border-red-400 group cursor-pointer disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>DISPATCHING LOCATION...</span>
                    </>
                  ) : (
                    <>
                      <div className="relative">
                        <Navigation className="w-6 h-6 text-white group-hover:rotate-45 transition-transform" />
                        <span className="absolute -inset-1 rounded-full bg-white/40 animate-ping pointer-events-none"></span>
                      </div>
                      <span>SEND CURRENT LOCATION TO ADMIN</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  One tap transmits your current GPS coordinates straight to the Admin Command Center with a live audible siren alert.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SOSModal;
