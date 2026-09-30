import React, { useState, useEffect } from 'react';
import { MapContainer, Popup, Circle, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ShieldAlert,
  Radio,
  MapPin,
  Compass,
  AlertTriangle,
  LocateFixed,
  Navigation,
  Sparkles,
  RefreshCw,
  Info,
  Footprints,
  Eye,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLiveLocation, FALLBACK_MAP_CENTER } from '../context/LiveLocationContext';
import geofenceApi from '../services/geofenceApi';
import api from '../services/api';
import LiveUserMarker from '../components/LiveUserMarker';
import { FreeTileLayer } from '../components/MapView';

export default function GeofencingLivePage() {
  const { user } = useAuth();
  const {
    coordinates,
    userLocation: liveGpsCoords,
    hasFix,
    isTracking,
    permissionStatus,
    error: gpsError,
    movementPath,
    totalDistanceMeters,
    activeZones: liveActiveZones,
    nearbyAttractions: liveNearbyAttractions,
    highRiskWarning: liveHighRiskWarning,
    startTracking,
    stopTracking,
    forceLocate,
    clearMovementPath,
    placeLabel,
  } = useLiveLocation();

  const [simulatedLocation, setSimulatedLocation] = useState(null);
  const [simulatedPath, setSimulatedPath] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [manualZones, setManualZones] = useState([]);
  const [manualNearby, setManualNearby] = useState([]);
  const [manualWarning, setManualWarning] = useState(null);

  const [geofences, setGeofences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosReason, setSosReason] = useState('Immediate Emergency Assistance Needed');
  const [shouldRecenter, setShouldRecenter] = useState(false);

  const activePosition = isSimulating ? simulatedLocation : liveGpsCoords;
  const mapCenter = activePosition || FALLBACK_MAP_CENTER;
  const activeMovementPath = isSimulating ? simulatedPath : movementPath;
  const displayZones = isSimulating ? manualZones : liveActiveZones;
  const displayNearby = isSimulating ? manualNearby : liveNearbyAttractions;
  const displayWarning = isSimulating ? manualWarning : liveHighRiskWarning;
  const markerCoords = isSimulating
    ? { accuracy: 18, speed: 0, altitude: null, heading: null }
    : coordinates;

  const simulatedRoute = [
    liveGpsCoords || FALLBACK_MAP_CENTER,
    [
      (liveGpsCoords || FALLBACK_MAP_CENTER)[0] + 0.012,
      (liveGpsCoords || FALLBACK_MAP_CENTER)[1] + 0.008,
    ],
    [
      (liveGpsCoords || FALLBACK_MAP_CENTER)[0] + 0.006,
      (liveGpsCoords || FALLBACK_MAP_CENTER)[1] - 0.01,
    ],
    [
      (liveGpsCoords || FALLBACK_MAP_CENTER)[0] - 0.008,
      (liveGpsCoords || FALLBACK_MAP_CENTER)[1] + 0.004,
    ],
  ];

  // Fetch registered geofences on mount
  useEffect(() => {
    const fetchGeofences = async () => {
      try {
        setLoading(true);
        const res = await geofenceApi.getActiveGeofences();
        if (res.data && res.data.data) {
          setGeofences(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load active geofences from server');
      } finally {
        setLoading(false);
      }
    };
    fetchGeofences();
    startTracking();
    forceLocate();
  }, []);

  useEffect(() => {
    if (!hasFix || !activePosition) return;
    setShouldRecenter(true);
    const timer = setTimeout(() => setShouldRecenter(false), 1600);
    return () => clearTimeout(timer);
  }, [hasFix]);

  useEffect(() => {
    if (!isSimulating || !simulatedLocation?.[0]) return;

    const pingSim = async () => {
      try {
        const res = await geofenceApi.pingLocation(simulatedLocation[0], simulatedLocation[1]);
        if (res.data && res.data.success) {
          const { activeZonesInside, highRiskWarning: warning, nearbyAttractions: nearby } = res.data.data;
          setManualZones(activeZonesInside || []);
          setManualWarning(warning || null);
          setManualNearby(nearby || []);
        }
      } catch {
        /* simulation ping is best-effort */
      }
    };
    pingSim();
  }, [simulatedLocation, isSimulating]);

  const stepSimulation = () => {
    if (isTracking) {
      toast('Pausing live GPS to preview a movement step', { icon: 'ℹ️' });
      stopTracking();
    }
    setIsSimulating(true);
    const nextIdx = (simulationStep + 1) % simulatedRoute.length;
    setSimulationStep(nextIdx);
    const nextCoords = simulatedRoute[nextIdx];
    setSimulatedLocation(nextCoords);
    setSimulatedPath((prev) => [...prev.slice(-30), nextCoords]);
    setShouldRecenter(true);
    setTimeout(() => setShouldRecenter(false), 800);
  };

  const handleEnableLiveGps = () => {
    setIsSimulating(false);
    startTracking();
  };

  // Trigger Emergency SOS with current coordinates
  const handleTriggerSOS = async () => {
    if (!activePosition) {
      toast.error('Allow live GPS first so SOS can send your real coordinates.');
      handleEnableLiveGps();
      return;
    }
    try {
      const payload = {
        latitude: activePosition[0],
        longitude: activePosition[1],
        alertType: 'MANUAL_PANIC',
        message: sosReason,
      };
      await api.post('/emergency-sos/trigger', payload);
      toast.success('🚨 SOS Dispatched! Emergency responders have been alerted with your live GPS coordinates.', {
        duration: 8000,
      });
      setSosModalOpen(false);
    } catch (err) {
      toast.error('Failed to trigger SOS: ' + (err.response?.data?.message || err.message));
    }
  };

  // Center on current position
  const handleCenterOnMe = () => {
    if (!activePosition) {
      toast.error('Enable live GPS to center the radar on you.');
      handleEnableLiveGps();
      return;
    }
    setShouldRecenter(true);
    setTimeout(() => setShouldRecenter(false), 800);
    toast.success('Map centered on your current location', { duration: 1500 });
  };

  // Geofence styling helper
  const getCircleColor = (category, alertLevel) => {
    if (category === 'high-risk' || category === 'restricted' || alertLevel === 'danger' || alertLevel === 'critical') {
      return { stroke: '#EF4444', fill: '#F87171', fillOpacity: 0.28 };
    }
    if (category === 'safe-zone') {
      return { stroke: '#10B981', fill: '#34D399', fillOpacity: 0.22 };
    }
    if (category === 'transit-hub') {
      return { stroke: '#F59E0B', fill: '#FBBF24', fillOpacity: 0.2 };
    }
    return { stroke: '#3B82F6', fill: '#60A5FA', fillOpacity: 0.2 };
  };

  return (
    <div className="light-theme-page min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Top Banner Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl bg-black-midnight/80 border border-blue-electric/25 backdrop-blur-xl shadow-glass-card">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-electric/20 text-blue-neon text-xs font-semibold mb-2 border border-blue-electric/30">
              <Radio className="w-3.5 h-3.5 animate-pulse text-blue-electric" />
              <span>Native Geolocation API Engine (No Paid API Required)</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-neon via-blue-electric to-blue-royal bg-clip-text text-transparent">
              Live Tourist Geofencing & GPS Telemetry
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Continuous GPS tracking via <code className="text-blue-electric font-mono text-xs">watchPosition()</code>, real-time perimeter entry/exit detection, automated hazard alarms, and instant SOS dispatch.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Live GPS Watch Toggle Button */}
            {isTracking ? (
              <button
                onClick={stopTracking}
                className="px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all border border-emerald-400/40 cursor-pointer"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                <LocateFixed className="w-4 h-4" />
                Live GPS Active (Pause)
              </button>
            ) : (
              <button
                onClick={handleEnableLiveGps}
                className="glass-button-primary px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 cursor-pointer"
              >
                <LocateFixed className="w-4 h-4 text-blue-electric" />
                Enable Live GPS Tracking
              </button>
            )}

            {/* Center Map on User */}
            <button
              onClick={handleCenterOnMe}
              title="Center map on current position"
              className="p-2.5 rounded-xl bg-navy-950/80 hover:bg-blue-royal/40 text-slate-300 border border-blue-electric/20 transition-all cursor-pointer shadow-glass"
            >
              <Navigation className="w-4 h-4 text-blue-electric" />
            </button>

            {/* Movement Simulation Button (For Testing) */}
            <button
              onClick={stepSimulation}
              className="px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 bg-navy-950/80 hover:bg-blue-royal/30 text-slate-200 border border-blue-electric/25 transition-all cursor-pointer shadow-glass"
            >
              <Footprints className="w-4 h-4 text-sky-400" />
              Simulate Movement Step
            </button>

            {/* Emergency SOS Button (Only for logged in tourist) */}
            {user?.role === 'tourist' && (
              <button
                onClick={() => setSosModalOpen(true)}
                className="px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/40 animate-pulse transition-all cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                Emergency SOS
              </button>
            )}
          </div>
        </div>

        {/* Live Warning Banner if High-Risk Hazard Zone Entered */}
        <AnimatePresence>
          {displayWarning && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="mt-4 p-4 rounded-xl bg-red-950/85 border border-red-500/50 backdrop-blur-xl flex items-center justify-between text-red-200 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-600/30 text-red-400">
                  <AlertTriangle className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-red-300">Hazard Zone Warning: {displayWarning.name}</h4>
                  <p className="text-xs text-red-200/90">{displayWarning.message}</p>
                </div>
              </div>
              {user?.role === 'tourist' && (
                <button
                  onClick={() => setSosModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow cursor-pointer"
                >
                  Trigger SOS
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Permission Notification / Error Banner */}
        {permissionStatus === 'denied' && (
          <div className="mt-4 p-4 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Location Permission Blocked:</strong> To use real-time GPS tracking and live geofence detection, click the lock/settings icon in your browser address bar and set Location to <em>Allow</em>.
              </span>
            </div>
            <button
              onClick={handleEnableLiveGps}
              className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold rounded-lg border border-amber-500/30 shrink-0 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {gpsError && permissionStatus !== 'denied' && (
          <div className="mt-4 p-4 rounded-xl bg-navy-950/80 border border-blue-electric/25 text-slate-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-electric shrink-0" />
              <span>{gpsError}</span>
            </div>
            <button
              type="button"
              onClick={forceLocate}
              className="px-3 py-1 bg-blue-electric/20 hover:bg-blue-electric/30 text-blue-neon font-semibold rounded-lg border border-blue-electric/30 shrink-0 cursor-pointer"
            >
              Recalibrate
            </button>
          </div>
        )}
        {permissionStatus === 'prompt' && !isTracking && (
          <div className="mt-4 p-3.5 rounded-xl bg-navy-950/60 border border-blue-electric/20 text-slate-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-electric shrink-0" />
              <span>
                Live GPS is currently off. Click <strong>Enable Live GPS Tracking</strong> to begin continuous browser location monitoring with zero API keys required.
              </span>
            </div>
            <button
              onClick={handleEnableLiveGps}
              className="px-3 py-1 bg-blue-electric/20 hover:bg-blue-electric/30 text-blue-neon font-semibold rounded-lg border border-blue-electric/30 shrink-0 cursor-pointer"
            >
              Enable Now
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Interactive Map (8 cols) + Telemetry / Radar (4 cols) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Leaflet Map */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="h-[580px] w-full rounded-2xl overflow-hidden border border-blue-electric/25 shadow-glass-card relative">
            <MapContainer
              key={activePosition ? 'console-live' : 'console-fallback'}
              center={mapCenter}
              zoom={activePosition ? 17 : 5}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
              className="bg-black-midnight yatralok-map"
            >
              <FreeTileLayer />

              {activePosition && (
                <LiveUserMarker
                  position={activePosition}
                  coordinates={{ ...markerCoords, placeLabel }}
                  shouldRecenter={shouldRecenter}
                  followUser
                  openPopup
                />
              )}

              {/* Movement Path (Trail) */}
              {activeMovementPath && activeMovementPath.length > 1 && (
                <Polyline
                  positions={activeMovementPath}
                  pathOptions={{
                    color: '#3B82F6',
                    weight: 3.5,
                    opacity: 0.9,
                    dashArray: '6, 8',
                  }}
                />
              )}

              {/* Registered Geofence Circles */}
              {geofences.map((fence) => {
                const coords = fence.center?.coordinates;
                if (!coords || coords.length < 2) return null;
                const [lon, lat] = coords;
                if (lat == null || lon == null) return null;
                const colors = getCircleColor(fence.category, fence.alertLevel);

                return (
                  <Circle
                    key={fence._id}
                    center={[lat, lon]}
                    radius={fence.radiusMeters}
                    pathOptions={{
                      color: colors.stroke,
                      fillColor: colors.fill,
                      fillOpacity: colors.fillOpacity,
                      weight: 2,
                    }}
                  >
                    <Popup className="luxury-glass-popup">
                      <div className="p-2 text-white font-sans max-w-xs">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              fence.category === 'high-risk' || fence.category === 'restricted'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {fence.category}
                          </span>
                          <span className="text-xs text-slate-400">• {fence.radiusMeters}m radius</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-100">{fence.name}</h4>
                        <p className="text-xs text-slate-300 mt-1">{fence.description}</p>
                        <div className="mt-2 pt-2 border-t border-white/10 text-xs flex justify-between text-slate-400">
                          <span>Tourists inside: <strong className="text-blue-electric">{fence.activeTouristsCount || 0}</strong></span>
                          <span>Cap: <strong>{fence.maxCapacity || 500}</strong></span>
                        </div>
                      </div>
                    </Popup>
                  </Circle>
                );
              })}
            </MapContainer>

            {/* PERSISTENT LIVE LOCATION HUD BOX - SHOWN INSIDE THE BOX EVERY TIME */}
            <div className="absolute top-4 left-4 z-[1000] p-4 rounded-2xl bg-black-midnight/92 border border-blue-electric/40 backdrop-blur-2xl shadow-glass-card max-w-sm sm:max-w-md pointer-events-auto">
              <div className="flex items-center justify-between gap-3 pb-2 mb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-blue-neon">
                    Your Exact GPS Location
                  </span>
                </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                    {hasFix && isTracking ? 'Hardware GPS Active' : isSimulating ? 'Simulation Preview' : 'Awaiting GPS'}
                  </span>
              </div>

              {/* Exact Coordinates */}
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-electric/20 text-blue-neon border border-blue-electric/30">
                  <MapPin className="w-5 h-5 animate-pulse text-blue-electric" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Current Coordinates:
                  </p>
                  <p className="text-white font-mono font-black text-sm sm:text-base tracking-wide">
                    {activePosition
                      ? `${Number(activePosition[0]).toFixed(6)}°, ${Number(activePosition[1]).toFixed(6)}°`
                      : 'Waiting for browser GPS lock…'}
                  </p>
                  {placeLabel && (
                    <p className="text-[11px] text-blue-neon mt-1 leading-snug line-clamp-2">{placeLabel}</p>
                  )}
                </div>
              </div>

              {/* Current Zone Containment & Accuracy details inside the box */}
              <div className="mt-2.5 pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Zone Status:</span>
                  <span className="font-bold text-blue-electric truncate block max-w-[150px]">
                    {displayZones.length > 0 ? displayZones[0].name : 'Free Roam Safe Territory'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">GPS Accuracy:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {markerCoords?.accuracy != null ? `±${markerCoords.accuracy} meters` : 'Acquiring'}
                  </span>
                </div>
              </div>
            </div>

            {/* Map Legend Overlay */}
            <div className="absolute bottom-4 left-4 z-[1000] p-3 rounded-xl bg-black-midnight/85 border border-blue-electric/20 backdrop-blur-md text-xs space-y-1.5 shadow-glass">
              <p className="font-bold text-slate-300 text-[11px] uppercase tracking-wider mb-1">Geofence Legend</p>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-400"></span>
                <span className="text-slate-300">Safe Heritage Zones</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500/80 border border-blue-400"></span>
                <span className="text-slate-300">Attraction Perimeters</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 border border-red-400"></span>
                <span className="text-slate-300">High-Risk / Restricted</span>
              </div>
            </div>

            {/* Movement Path Reset Button on Map */}
            {activeMovementPath.length > 1 && (
              <div className="absolute top-4 right-4 z-[1000]">
                <button
                  onClick={clearMovementPath}
                  className="px-3 py-1.5 rounded-lg bg-black-midnight/80 hover:bg-red-950/60 border border-white/10 hover:border-red-500/30 text-xs text-slate-300 hover:text-red-300 backdrop-blur-md flex items-center gap-1.5 transition-all shadow-glass cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Path
                </button>
              </div>
            )}
          </div>

          {/* Real-time Telemetry Dashboard Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-xl bg-black-midnight/70 border border-blue-electric/20 backdrop-blur-lg shadow-glass">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-electric/15 text-blue-neon">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Live Location</p>
                <p className="text-xs font-mono font-bold text-white">
                  {activePosition
                    ? `${Number(activePosition[0]).toFixed(6)}, ${Number(activePosition[1]).toFixed(6)}`
                    : 'No GPS lock'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Speed</p>
                <p className="text-base font-bold text-slate-100">
                  {markerCoords?.speed != null ? `${markerCoords.speed} km/h` : '—'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-royal/20 text-sky-400">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Altitude</p>
                <p className="text-base font-bold text-slate-100">
                  {markerCoords?.altitude != null ? `${markerCoords.altitude} m` : '—'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-500/15 text-indigo-400">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">GPS Precision</p>
                <p className="text-base font-bold text-emerald-400">
                  {markerCoords?.accuracy != null ? `±${markerCoords.accuracy}m` : '—'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/15 text-purple-400">
                <Footprints className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Distance</p>
                <p className="text-base font-bold text-slate-100">
                  {totalDistanceMeters > 1000
                    ? `${(totalDistanceMeters / 1000).toFixed(2)} km`
                    : `${totalDistanceMeters} m`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Current Zone</p>
                <p className="text-xs font-bold text-slate-100 truncate max-w-[110px]" title={displayZones[0]?.name || 'Free Roam Area'}>
                  {displayZones.length > 0 ? displayZones[0].name : 'Free Roam Area'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Radar & Nearby Attractions */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Active Inside Zones Card */}
          <div className="p-5 rounded-2xl bg-black-midnight/70 border border-blue-electric/25 backdrop-blur-xl shadow-glass-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-electric" />
                Active Zone Containment
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-electric/20 text-blue-neon text-xs font-semibold border border-blue-electric/30">
                {displayZones.length} Zones
              </span>
            </div>

            {displayZones.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                Currently outside registered geofence perimeters. You are exploring in safe free-roam mode.
              </p>
            ) : (
              <div className="space-y-2.5">
                {displayZones.map((z) => (
                  <div
                    key={z.id || z.name}
                    className="p-3 rounded-xl bg-blue-electric/10 border border-blue-electric/25 flex items-start justify-between"
                  >
                    <div>
                      <p className="font-bold text-sm text-slate-200">{z.name}</p>
                      <p className="text-xs text-slate-400 capitalize mt-0.5">
                        Category: {z.category} • Radius: {z.radiusMeters}m
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                      INSIDE
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nearby Attractions Discovery Radar (Dynamically Updated by Current Coordinates) */}
          <div className="p-5 rounded-2xl bg-black-midnight/70 border border-blue-electric/25 backdrop-blur-xl shadow-glass-card flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Nearby Attractions Radar
              </h3>
              <span className="text-xs text-slate-400">&lt; 10 km live</span>
            </div>

            {displayNearby.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                Scanning GPS coordinates for monuments and attractions within 10 km...
              </p>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                {displayNearby.map((item) => (
                  <div
                    key={item.geofenceId || item.id || item.name}
                    className="p-3.5 rounded-xl bg-navy-950/60 hover:bg-blue-royal/20 border border-white/5 hover:border-blue-electric/30 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-sm text-slate-200 group-hover:text-blue-neon transition-colors">
                        {item.name}
                      </h4>
                      <span className="text-xs font-semibold text-blue-electric shrink-0">
                        {item.distanceMeters > 1000
                          ? `${(item.distanceMeters / 1000).toFixed(1)} km`
                          : `${item.distanceMeters} m`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                      <span className="capitalize">{item.category || 'attraction'} perimeter</span>
                      <button
                        onClick={() => {
                          if (item.coordinates) {
                            setShouldRecenter(true);
                            setTimeout(() => setShouldRecenter(false), 800);
                            toast('Centered radar on your live position', { icon: '📍' });
                          }
                        }}
                        className="text-blue-electric hover:text-blue-neon font-medium cursor-pointer"
                      >
                        View On Map &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Emergency SOS Modal */}
      {sosModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-md w-full p-6 rounded-2xl bg-black-midnight border border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.4)]">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <ShieldAlert className="w-8 h-8 animate-bounce" />
              <h3 className="text-xl font-black">Dispatch Emergency SOS</h3>
            </div>
            <p className="text-sm text-slate-300 mb-4">
              This will broadcast an urgent SOS alert with your live GPS coordinates (
              <span className="font-mono text-white">
                {activePosition
                  ? `${activePosition[0].toFixed(5)}, ${activePosition[1].toFixed(5)}`
                  : 'GPS lock required'}
              </span>
              ) to local tourist police, nearby emergency responders, and command centers.
            </p>
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-400 mb-1">Emergency Nature</label>
              <select
                value={sosReason}
                onChange={(e) => setSosReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-navy-950 border border-red-500/30 text-white text-sm focus:outline-none"
              >
                <option value="Medical Emergency / Physical Injury">Medical Emergency / Physical Injury</option>
                <option value="Lost in High-Risk Wilderness / Off-Trail">Lost in High-Risk Wilderness / Off-Trail</option>
                <option value="Severe Weather / Natural Hazard">Severe Weather / Natural Hazard</option>
                <option value="Harassment / Security Threat">Harassment / Security Threat</option>
                <option value="Immediate Emergency Assistance Needed">Immediate Emergency Assistance Needed</option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSosModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleTriggerSOS}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/40 cursor-pointer"
              >
                Confirm SOS Broadcast
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
