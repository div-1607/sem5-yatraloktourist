import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Circle, CircleMarker, MapContainer, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  AlertTriangle,
  ExternalLink,
  LocateFixed,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Phone,
  Info,
  Navigation,
  Volume2,
  VolumeX,
  Compass,
  CheckCircle2,
  AlertOctagon,
  Copy,
  Check,
  Crosshair,
  ArrowRight,
  Shield,
  LifeBuoy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { calculateHaversineDistance, useLiveLocation } from '../context/LiveLocationContext';

const DESTINATION_OPTIONS = [
  {
    key: 'shimla',
    label: 'Shimla, Himachal Pradesh',
    state: 'Himachal Pradesh',
    center: [31.1048, 77.1734],
    zoom: 13,
    icon: '🏔️',
    description: 'Himalayan hill capital prone to steep slope landslides, black ice, and road chokepoints.',
  },
  {
    key: 'jammu-kashmir',
    label: 'Jammu & Kashmir',
    state: 'Jammu & Kashmir',
    center: [34.0837, 74.7973],
    zoom: 9,
    icon: '❄️',
    description: 'High-altitude alpine valleys with severe weather swings, avalanche corridors, and river currents.',
  },
  {
    key: 'mussoorie',
    label: 'Mussoorie, Uttarakhand',
    state: 'Uttarakhand',
    center: [30.4599, 78.0644],
    zoom: 13,
    icon: '🌲',
    description: 'Garhwal ridge town featuring single-lane switchbacks, waterfall gorge spates, and active landslide zones.',
  },
  {
    key: 'rishikesh',
    label: 'Rishikesh, Uttarakhand',
    state: 'Uttarakhand',
    center: [30.1038, 78.2942],
    zoom: 12,
    icon: '🌊',
    description: 'Sacred river valley characterized by powerful Ganga rapids, dam surge currents, and mountain rockfalls.',
  },
  {
    key: 'manali',
    label: 'Manali, Himachal Pradesh',
    state: 'Himachal Pradesh',
    center: [32.2396, 77.1887],
    zoom: 13,
    icon: '⛷️',
    description: 'Snow-draped Himalayan valley with avalanche-prone passes, adventure sports zones, and river rapids.',
  },
  {
    key: 'nainital',
    label: 'Nainital, Uttarakhand',
    state: 'Uttarakhand',
    center: [29.3919, 79.4542],
    zoom: 13,
    icon: '🏞️',
    description: 'Lake district hill town with active landslide zones, steep trekking trails, and weather-exposed peaks.',
  },
  {
    key: 'ooty',
    label: 'Ooty, Tamil Nadu',
    state: 'Tamil Nadu',
    center: [11.4064, 76.6932],
    zoom: 12,
    icon: '🌿',
    description: 'Nilgiri hill station with tea plantation landslide zones, fog-prone peaks, and flash flood areas.',
  },
  {
    key: 'darjeeling',
    label: 'Darjeeling, West Bengal',
    state: 'West Bengal',
    center: [27.0440, 88.2636],
    zoom: 12,
    icon: '🍵',
    description: 'Colonial hill town with landslide corridors, extreme weather treks, and fog-bound mountain roads.',
  },
];

const MAP_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const MAP_TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const APPROACH_METERS = 500;

const RISK_CONFIG = {
  Low: {
    color: '#22c55e',
    fillColor: '#22c55e',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/40',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-500',
    label: 'Low Risk',
    icon: ShieldCheck,
  },
  Moderate: {
    color: '#eab308',
    fillColor: '#eab308',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/40',
    text: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    dot: 'bg-amber-500',
    label: 'Moderate Risk',
    icon: AlertTriangle,
  },
  High: {
    color: '#ef4444',
    fillColor: '#ef4444',
    bg: 'bg-rose-500/15',
    border: 'border-rose-500/50',
    text: 'text-rose-400',
    badge: 'bg-rose-500/25 text-rose-300 border-rose-500/40',
    dot: 'bg-rose-500',
    label: 'High Risk',
    icon: AlertOctagon,
  },
};

const playWarningBeep = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.32);
  } catch (e) {
    // Autoplay restrictions or muted audio
  }
};

const RecenterMap = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center?.[0] != null && center?.[1] != null) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
};

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

const TouristSafetyMap = () => {
  const [destinationKey, setDestinationKey] = useState('shimla');
  const [zones, setZones] = useState([]);
  const [destinationEmergency, setDestinationEmergency] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [filterRisk, setFilterRisk] = useState('All');

  // Simulated location pin for interactive testing anywhere
  const [simulatedLocation, setSimulatedLocation] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const warnedZoneIds = useRef(new Set());
  const { userLocation: realGpsCoords, hasFix, forceLocate, startTracking } = useLiveLocation();

  const destination = useMemo(
    () => DESTINATION_OPTIONS.find((option) => option.key === destinationKey) || DESTINATION_OPTIONS[0],
    [destinationKey]
  );

  // Active user position: simulated position takes priority if active, else real GPS
  const activePosition = isSimulating && simulatedLocation ? simulatedLocation : (hasFix ? realGpsCoords : null);

  // Load Zones for the selected destination
  useEffect(() => {
    let isSubscribed = true;
    const loadSafetyData = async () => {
      setLoading(true);
      setLoadError('');
      setSelectedZone(null);
      warnedZoneIds.current.clear();
      try {
        const response = await api.get('/zones/tourist-safety', { params: { destination: destinationKey } });
        if (!isSubscribed) return;
        const loadedZones = response.data?.data?.zones || [];
        setZones(loadedZones);
        setDestinationEmergency(response.data?.data?.emergencyContacts || []);
        if (loadedZones.length > 0) {
          setSelectedZone(loadedZones[0]);
          // Default simulated location to the first location for instant interactive testing
          setSimulatedLocation([loadedZones[0].center.coordinates[1], loadedZones[0].center.coordinates[0]]);
        }
      } catch (err) {
        if (!isSubscribed) return;
        setLoadError(err.response?.data?.message || 'Unable to load safety zones for this destination.');
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };
    loadSafetyData();
    return () => { isSubscribed = false; };
  }, [destinationKey]);

  // Geofence Detection Engine: Calculate distance and zone entry status
  const geofenceStatus = useMemo(() => {
    if (!activePosition || !zones.length) {
      return { status: 'UNKNOWN', matchedZone: null, distance: null, inside: false, safeAlternatives: [] };
    }

    const [userLat, userLng] = activePosition;

    // Check each zone
    const assessed = zones.map((zone) => {
      const [zLng, zLat] = zone.center.coordinates;
      const dist = calculateHaversineDistance(userLat, userLng, zLat, zLng);
      const meta = zone.metadata instanceof Map ? Object.fromEntries(zone.metadata) : (zone.metadata || {});
      const primaryRadius = Number(zone.radius || 350);
      return {
        zone,
        meta,
        distance: dist,
        isInside: dist <= primaryRadius,
        isApproaching: dist <= primaryRadius + APPROACH_METERS,
        risk: meta.riskLevel || 'Low',
      };
    });

    // 1. High risk inside or approaching
    const highRiskAlert = assessed.find((item) => item.risk === 'High' && (item.isInside || item.isApproaching));
    if (highRiskAlert) {
      return {
        status: highRiskAlert.isInside ? 'CRITICAL_INSIDE' : 'CRITICAL_APPROACH',
        matchedZone: highRiskAlert.zone,
        distance: Math.round(highRiskAlert.distance),
        inside: highRiskAlert.isInside,
        meta: highRiskAlert.meta,
      };
    }

    // 2. Moderate risk inside or approaching
    const moderateRiskAlert = assessed.find((item) => item.risk === 'Moderate' && (item.isInside || item.isApproaching));
    if (moderateRiskAlert) {
      return {
        status: moderateRiskAlert.isInside ? 'CAUTION_INSIDE' : 'CAUTION_APPROACH',
        matchedZone: moderateRiskAlert.zone,
        distance: Math.round(moderateRiskAlert.distance),
        inside: moderateRiskAlert.isInside,
        meta: moderateRiskAlert.meta,
      };
    }

    // 3. Safe zone inside
    const safeZoneMatch = assessed.find((item) => item.risk === 'Low' && item.isInside);
    if (safeZoneMatch) {
      return {
        status: 'SAFE_ZONE',
        matchedZone: safeZoneMatch.zone,
        distance: Math.round(safeZoneMatch.distance),
        inside: true,
        meta: safeZoneMatch.meta,
      };
    }

    // Nearest zone overall
    const sorted = [...assessed].sort((a, b) => a.distance - b.distance);
    return {
      status: 'MONITORING',
      matchedZone: sorted[0]?.zone || null,
      distance: sorted[0] ? Math.round(sorted[0].distance) : null,
      inside: false,
      meta: sorted[0]?.meta || {},
    };
  }, [activePosition, zones]);

  // Handle Geofence Alarm Trigger
  useEffect(() => {
    if (!geofenceStatus.matchedZone) return;
    const zoneId = String(geofenceStatus.matchedZone._id);

    if (geofenceStatus.status === 'CRITICAL_INSIDE' || geofenceStatus.status === 'CRITICAL_APPROACH') {
      if (!warnedZoneIds.current.has(zoneId)) {
        warnedZoneIds.current.add(zoneId);
        if (soundEnabled) playWarningBeep();
        toast.error(
          geofenceStatus.status === 'CRITICAL_INSIDE'
            ? `🚨 DANGER: You are inside the High-Risk Zone at ${geofenceStatus.matchedZone.name}!`
            : `⚠️ WARNING: Approaching High-Risk Hazard Zone: ${geofenceStatus.matchedZone.name} (${geofenceStatus.distance}m)!`,
          { duration: 8000 }
        );
      }
    } else {
      // Clear alert flag if moved away
      warnedZoneIds.current.delete(zoneId);
    }
  }, [geofenceStatus, soundEnabled]);

  // Safer Alternatives: Low-Risk locations ranked by distance
  const nearbySafeAlternatives = useMemo(() => {
    if (!zones.length) return [];
    const origin = activePosition || destination.center;
    return zones
      .filter((z) => {
        const meta = z.metadata instanceof Map ? Object.fromEntries(z.metadata) : (z.metadata || {});
        return meta.riskLevel === 'Low';
      })
      .map((z) => {
        const [zLng, zLat] = z.center.coordinates;
        const dist = calculateHaversineDistance(origin[0], origin[1], zLat, zLng);
        const meta = z.metadata instanceof Map ? Object.fromEntries(z.metadata) : (z.metadata || {});
        return { zone: z, meta, distance: dist };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
  }, [zones, activePosition, destination.center]);

  // Filtered zones list
  const filteredZones = useMemo(() => {
    if (filterRisk === 'All') return zones;
    return zones.filter((z) => {
      const meta = z.metadata instanceof Map ? Object.fromEntries(z.metadata) : (z.metadata || {});
      return meta.riskLevel === filterRisk;
    });
  }, [zones, filterRisk]);

  // Map Click handler for Simulated Pin
  const handleMapPin = useCallback((coords) => {
    setIsSimulating(true);
    setSimulatedLocation(coords);
    toast.success(`📍 Tourist location pinned to [${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}]`, { duration: 3000 });
  }, []);

  // Quick preset jump
  const jumpToZone = (zone) => {
    setSelectedZone(zone);
    const [zLng, zLat] = zone.center.coordinates;
    setSimulatedLocation([zLat, zLng]);
    setIsSimulating(true);
  };

  const copyCoordinates = (lat, lng) => {
    navigator.clipboard.writeText(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    setCopiedCoords(true);
    toast.success('Coordinates copied to clipboard');
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const selectedMeta = useMemo(() => {
    if (!selectedZone) return null;
    return selectedZone.metadata instanceof Map
      ? Object.fromEntries(selectedZone.metadata)
      : (selectedZone.metadata || {});
  }, [selectedZone]);

  const selectedRisk = selectedMeta?.riskLevel || 'Low';
  const selectedRiskConfig = RISK_CONFIG[selectedRisk] || RISK_CONFIG.Low;

  const mapCenterCoords = selectedZone?.center?.coordinates
    ? [selectedZone.center.coordinates[1], selectedZone.center.coordinates[0]]
    : destination.center;

  return (
    <section className="tourist-safety-panel rounded-3xl border border-slate-700/80 bg-[#061326] p-4 text-slate-100 shadow-2xl sm:p-6 lg:p-8">
      {/* 1. Header with Destination Selection and Status Stats */}
      <header className="flex flex-col gap-5 border-b border-slate-700/80 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 shadow-inner">
              <ShieldAlert className="h-4 w-4" />
            </span>
            <span className="text-xs font-black uppercase tracking-[0.18em] text-sky-400">
              Government / Disaster Management Verified
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Geo-Fencing Safety System
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Real-time geofence monitoring, verified hazard perimeters, and safe haven alternatives across Himalayan routes.
          </p>
        </div>

        {/* Destination Picker & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Select Destination
            </label>
            <select
              value={destinationKey}
              onChange={(e) => setDestinationKey(e.target.value)}
              className="rounded-xl border border-slate-600 bg-slate-900/90 px-3.5 py-2.5 text-sm font-semibold text-white shadow-inner focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/20 cursor-pointer"
            >
              {DESTINATION_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.icon} {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2 pt-4 sm:pt-0">
            {/* GPS Toggle */}
            <button
              type="button"
              onClick={() => {
                setIsSimulating(false);
                if (hasFix) forceLocate();
                else startTracking();
                toast.success('Live GPS location tracking activated');
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all shadow-sm ${
                !isSimulating && hasFix
                  ? 'border border-sky-400 bg-sky-500/20 text-sky-300'
                  : 'border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
              title="Use actual GPS coordinates"
            >
              <LocateFixed className="h-4 w-4 text-sky-400" />
              <span>{hasFix ? 'Live GPS' : 'Enable GPS'}</span>
            </button>

            {/* Simulation Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                setIsSimulating(true);
                toast('Click anywhere on the map to place your simulated tourist pin', { icon: '📍' });
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all shadow-sm ${
                isSimulating
                  ? 'border border-amber-400 bg-amber-500/20 text-amber-300 ring-2 ring-amber-400/20'
                  : 'border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
              title="Test geofence warnings by placing pin anywhere on the map"
            >
              <Crosshair className="h-4 w-4 text-amber-400" />
              <span>{isSimulating ? 'Simulator: Active' : 'Simulate Location'}</span>
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                toast(soundEnabled ? 'Warning alarm muted' : 'Warning alarm enabled', {
                  icon: soundEnabled ? '🔇' : '🔊',
                });
              }}
              className="rounded-xl border border-slate-700 bg-slate-800/80 p-2.5 text-slate-300 hover:bg-slate-800 transition-colors"
              title={soundEnabled ? 'Mute Warning Beep' : 'Enable Warning Beep'}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <VolumeX className="h-4 w-4 text-slate-500" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Real-time Geofence Alert Bar */}
      <div className="mt-4">
        {geofenceStatus.status === 'CRITICAL_INSIDE' && (
          <div className="flex items-start gap-3.5 rounded-2xl border-2 border-rose-500 bg-rose-950/80 p-4 text-rose-100 shadow-lg shadow-rose-950/60 animate-pulse">
            <AlertOctagon className="h-6 w-6 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-rose-500 px-2 py-0.5 text-xs font-black text-white uppercase tracking-wider">
                  Critical Hazard Zone
                </span>
                <span className="font-bold text-white text-base">
                  Inside High-Risk Area: {geofenceStatus.matchedZone.name}
                </span>
              </div>
              <p className="mt-1 text-sm text-rose-200 leading-relaxed">
                <strong>Hazard:</strong> {geofenceStatus.meta?.hazardType}. Immediate precaution required.
              </p>
              <p className="mt-1 text-xs text-rose-300">
                <strong>Safety Instruction:</strong> {geofenceStatus.meta?.safetyInstructions}
              </p>
            </div>
          </div>
        )}

        {geofenceStatus.status === 'CRITICAL_APPROACH' && (
          <div className="flex items-start gap-3.5 rounded-2xl border border-rose-500/80 bg-rose-950/50 p-4 text-rose-100 shadow-md">
            <AlertTriangle className="h-6 w-6 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-rose-500/30 px-2 py-0.5 text-xs font-bold text-rose-300 uppercase">
                  Warning: Approaching Hazard
                </span>
                <span className="font-bold text-white text-base">
                  {geofenceStatus.distance}m from {geofenceStatus.matchedZone.name}
                </span>
              </div>
              <p className="mt-1 text-sm text-rose-200">
                You are nearing an active danger zone ({geofenceStatus.meta?.hazardType}). Refer to safe alternatives below.
              </p>
            </div>
          </div>
        )}

        {geofenceStatus.status === 'CAUTION_INSIDE' && (
          <div className="flex items-start gap-3.5 rounded-2xl border border-amber-500/80 bg-amber-950/60 p-4 text-amber-100 shadow-md">
            <AlertTriangle className="h-6 w-6 shrink-0 text-amber-400 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-amber-500/30 px-2 py-0.5 text-xs font-bold text-amber-300 uppercase">
                  Caution Area
                </span>
                <span className="font-bold text-white text-base">
                  Inside Caution Zone: {geofenceStatus.matchedZone.name}
                </span>
              </div>
              <p className="mt-1 text-sm text-amber-200">
                {geofenceStatus.meta?.hazardType} · {geofenceStatus.meta?.safetyInstructions}
              </p>
            </div>
          </div>
        )}

        {geofenceStatus.status === 'SAFE_ZONE' && (
          <div className="flex items-start gap-3.5 rounded-2xl border border-emerald-500/60 bg-emerald-950/40 p-3.5 text-emerald-100 shadow-sm">
            <ShieldCheck className="h-6 w-6 shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <span className="font-bold text-white text-sm">
                Safe Haven Verified: You are inside {geofenceStatus.matchedZone.name}
              </span>
              <p className="mt-0.5 text-xs text-emerald-300/90">
                Recommended safe visitor precinct with active monitoring and medical/police connectivity.
              </p>
            </div>
          </div>
        )}

        {geofenceStatus.status === 'MONITORING' && (
          <div className="flex items-center justify-between rounded-2xl border border-slate-700/60 bg-slate-900/60 px-4 py-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-sky-400 animate-ping" />
              <span>
                Monitoring Geofences: Nearest landmark is <strong>{geofenceStatus.matchedZone?.name}</strong> ({geofenceStatus.distance < 1000 ? `${geofenceStatus.distance}m` : `${(geofenceStatus.distance / 1000).toFixed(1)}km`} away)
              </span>
            </div>
            <span className="text-slate-400 hidden sm:inline">
              Click map or zone below to simulate movement
            </span>
          </div>
        )}

        {geofenceStatus.status === 'UNKNOWN' && (
          <div className="flex items-center justify-between rounded-2xl border border-slate-700/60 bg-slate-900/60 px-4 py-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-sky-400" />
              <span>
                Click anywhere on the map or click <strong>Simulate Location</strong> to position your tourist avatar and test geofence perimeters.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Main Grid: Leaflet Map & Zone Safety Inspector */}
      <div className="mt-5 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.25fr)_420px]">
        {/* Map Container */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-inner">
          <div className="relative h-[62vh] min-h-[460px] w-full">
            <MapContainer
              key={destinationKey}
              center={destination.center}
              zoom={destination.zoom}
              scrollWheelZoom
              className="h-full w-full"
            >
              <RecenterMap center={mapCenterCoords} zoom={destination.zoom} />
              <MapClickHandler onMapClick={handleMapPin} />
              <TileLayer attribution={MAP_TILE_ATTRIBUTION} url={MAP_TILE_URL} />

              {/* Draw All Stored Locations */}
              {zones.map((zone) => {
                const [lng, lat] = zone.center.coordinates;
                const meta = zone.metadata instanceof Map ? Object.fromEntries(zone.metadata) : (zone.metadata || {});
                const risk = meta.riskLevel || 'Low';
                const config = RISK_CONFIG[risk] || RISK_CONFIG.Low;
                const isSelected = String(selectedZone?._id) === String(zone._id);

                // Use radii: Safe, Caution, Hazard zones
                const safeRadius = meta.safeZone?.radius || (risk === 'Low' ? zone.radius : 0);
                const cautionRadius = meta.cautionZone?.radius || (risk === 'Moderate' ? zone.radius : 0);
                const hazardRadius = meta.hazardZone?.radius || (risk === 'High' ? zone.radius : 0);

                return (
                  <React.Fragment key={zone._id}>
                    {/* Safe Zone Boundary Circle (Green) */}
                    {safeRadius > 0 && (
                      <Circle
                        center={[lat, lng]}
                        radius={safeRadius}
                        pathOptions={{
                          color: '#22c55e',
                          weight: isSelected && risk === 'Low' ? 3 : 1.5,
                          opacity: isSelected ? 0.9 : 0.6,
                          fillColor: '#22c55e',
                          fillOpacity: isSelected && risk === 'Low' ? 0.22 : 0.1,
                          dashArray: '4, 4',
                        }}
                        eventHandlers={{ click: () => setSelectedZone(zone) }}
                      >
                        <Popup>
                          <div className="p-1">
                            <span className="text-xs font-bold text-emerald-600 block uppercase">🟢 Safe Area</span>
                            <strong className="text-sm font-bold text-slate-900">{zone.name}</strong>
                            <p className="text-xs text-slate-600 mt-1">{meta.safeZone?.description || meta.safeZone?.label}</p>
                            <p className="text-[11px] text-slate-400 mt-1">Buffer: {safeRadius}m</p>
                          </div>
                        </Popup>
                      </Circle>
                    )}

                    {/* Caution Zone Boundary Circle (Yellow) */}
                    {cautionRadius > 0 && (
                      <Circle
                        center={[lat, lng]}
                        radius={cautionRadius}
                        pathOptions={{
                          color: '#eab308',
                          weight: isSelected && risk === 'Moderate' ? 3 : 1.5,
                          opacity: isSelected ? 0.9 : 0.6,
                          fillColor: '#eab308',
                          fillOpacity: isSelected && risk === 'Moderate' ? 0.25 : 0.12,
                        }}
                        eventHandlers={{ click: () => setSelectedZone(zone) }}
                      >
                        <Popup>
                          <div className="p-1">
                            <span className="text-xs font-bold text-amber-600 block uppercase">🟡 Caution Area</span>
                            <strong className="text-sm font-bold text-slate-900">{zone.name}</strong>
                            <p className="text-xs text-slate-600 mt-1">{meta.cautionZone?.description || meta.cautionZone?.label}</p>
                            <p className="text-[11px] text-slate-400 mt-1">Buffer: {cautionRadius}m</p>
                          </div>
                        </Popup>
                      </Circle>
                    )}

                    {/* Hazard Zone Boundary Circle (Red) */}
                    {hazardRadius > 0 && (
                      <Circle
                        center={[lat, lng]}
                        radius={hazardRadius}
                        pathOptions={{
                          color: '#ef4444',
                          weight: isSelected && risk === 'High' ? 3.5 : 2,
                          opacity: isSelected ? 0.95 : 0.75,
                          fillColor: '#ef4444',
                          fillOpacity: isSelected && risk === 'High' ? 0.35 : 0.2,
                        }}
                        eventHandlers={{ click: () => setSelectedZone(zone) }}
                      >
                        <Popup>
                          <div className="p-1">
                            <span className="text-xs font-bold text-rose-600 block uppercase">🔴 Hazard Zone</span>
                            <strong className="text-sm font-bold text-slate-900">{zone.name}</strong>
                            <p className="text-xs text-rose-700 font-semibold mt-1">Hazard: {meta.hazardType}</p>
                            <p className="text-xs text-slate-600 mt-1">{meta.hazardZone?.description || zone.alertMessage}</p>
                            <p className="text-[11px] text-slate-400 mt-1">Buffer: {hazardRadius}m (Approximate)</p>
                          </div>
                        </Popup>
                      </Circle>
                    )}

                    {/* Center Landmark Pinpoint Marker */}
                    <CircleMarker
                      center={[lat, lng]}
                      radius={isSelected ? 9 : 7}
                      pathOptions={{
                        color: '#ffffff',
                        weight: isSelected ? 3 : 2,
                        fillColor: config.color,
                        fillOpacity: 1,
                      }}
                      eventHandlers={{ click: () => setSelectedZone(zone) }}
                    >
                      <Popup>
                        <div className="p-1 min-w-[180px]">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: config.color }} />
                            <span className="text-xs font-black uppercase" style={{ color: config.color }}>
                              {risk} Risk
                            </span>
                          </div>
                          <strong className="text-sm font-bold text-slate-900 block">{zone.name}</strong>
                          <p className="text-xs text-slate-600 mt-1">{meta.hazardType}</p>
                          <button
                            type="button"
                            onClick={() => setSelectedZone(zone)}
                            className="mt-2 text-xs font-bold text-blue-600 hover:underline block"
                          >
                            View Safety Details &rarr;
                          </button>
                        </div>
                      </Popup>
                    </CircleMarker>
                  </React.Fragment>
                );
              })}

              {/* User Location Avatar Marker (GPS or Simulated) */}
              {activePosition && (
                <CircleMarker
                  center={activePosition}
                  radius={10}
                  pathOptions={{
                    color: '#ffffff',
                    weight: 3,
                    fillColor: '#0284c7',
                    fillOpacity: 1,
                  }}
                >
                  <Popup>
                    <div className="p-1">
                      <strong className="text-xs font-bold text-sky-800 block">
                        {isSimulating ? '📍 Simulated Tourist Position' : '🔵 Live GPS Position'}
                      </strong>
                      <p className="text-xs text-slate-600 mt-1">
                        Lat: {activePosition[0].toFixed(5)}, Lng: {activePosition[1].toFixed(5)}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Drag or click on map to reposition avatar.
                      </p>
                    </div>
                  </Popup>
                </CircleMarker>
              )}
            </MapContainer>

            {/* Map Simulator Hint Overlay */}
            <div className="absolute top-3 left-3 z-[1000] rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2 text-xs font-semibold text-slate-200 backdrop-blur-md shadow-md flex items-center gap-2">
              <Crosshair className="h-3.5 w-3.5 text-amber-400" />
              <span>Click anywhere on map to simulate your tourist location</span>
            </div>
          </div>

          {/* Map Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-700/80 bg-[#08172c] px-4 py-3 text-xs text-slate-200 sm:px-6">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-semibold">
              <span className="font-black uppercase tracking-wider text-slate-400">Map Legend:</span>
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                <span>🟢 Low Risk (Safe Zone)</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                <span>🟡 Moderate (Caution Area)</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
                <span>🔴 High Risk (Hazard Zone)</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border-2 border-white bg-sky-500 shadow-sm" />
                <span>🔵 Your Location</span>
              </span>
            </div>
            <span className="text-[11px] text-slate-400 italic">
              *Boundaries are approximate disaster planning buffers.
            </span>
          </div>
        </div>

        {/* Zone Safety Inspector (Side Panel) */}
        <aside className="space-y-4">
          {/* Quick Simulation Presets */}
          <div className="rounded-2xl border border-slate-700/80 bg-[#091a30] p-4 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold uppercase tracking-wider text-slate-400">Quick Test Simulation:</span>
              <span className="text-[11px] text-sky-400">Jump avatar to zone</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {zones.slice(0, 3).map((z, idx) => {
                const meta = z.metadata instanceof Map ? Object.fromEntries(z.metadata) : (z.metadata || {});
                const r = meta.riskLevel || 'Low';
                const c = RISK_CONFIG[r];
                return (
                  <button
                    key={z._id}
                    type="button"
                    onClick={() => jumpToZone(z)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 transition-colors text-center cursor-pointer"
                  >
                    <span className="h-2 w-2 rounded-full mb-1" style={{ backgroundColor: c.color }} />
                    <span className="font-bold text-white truncate max-w-full">{z.name.split(' ')[0]}</span>
                    <span className="text-[10px] text-slate-400">{r} Risk</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Zone Inspector Details */}
          <section className="rounded-2xl border border-slate-700/80 bg-[#091a30] p-5 shadow-sm text-sm">
            {selectedZone ? (
              <div className="space-y-4">
                {/* Header: Title & Risk Badge */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-700/80 pb-3">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                      Zone Details & Geofence
                    </span>
                    <h2 className="text-lg font-black text-white leading-tight mt-0.5">
                      {selectedZone.name}
                    </h2>
                    <p className="text-xs text-sky-400 mt-0.5">
                      {destination.label}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black border ${selectedRiskConfig.badge}`}>
                    {selectedRisk} Risk
                  </span>
                </div>

                {/* Coordinates & Copy */}
                <div className="flex items-center justify-between rounded-xl bg-slate-900/80 p-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-sky-400" />
                    <span>
                      {selectedZone.center.coordinates[1].toFixed(5)}° N, {selectedZone.center.coordinates[0].toFixed(5)}° E
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyCoordinates(selectedZone.center.coordinates[1], selectedZone.center.coordinates[0])}
                    className="flex items-center gap-1 text-[11px] font-bold text-sky-400 hover:text-sky-300"
                  >
                    {copiedCoords ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedCoords ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Hazard Type & Overview */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Hazard / Area Nature</h3>
                  <p className="text-sm font-semibold text-white mt-1">
                    {selectedMeta?.hazardType || 'Standard Visitor Area'}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    {selectedZone.alertMessage || selectedZone.description}
                  </p>
                </div>

                {/* 3 Stored Zones: Safe, Caution, Hazard */}
                <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3 space-y-2 text-xs">
                  <h4 className="font-bold text-slate-200 uppercase tracking-wide text-[11px]">
                    Stored Geofence Boundaries
                  </h4>
                  <div className="flex items-center justify-between text-emerald-300">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Safe Area ({selectedMeta?.safeZone?.radius || 350}m)
                    </span>
                    <span className="text-[11px] text-slate-400 truncate max-w-[170px]">
                      {selectedMeta?.safeZone?.label || 'Recommended buffer'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-amber-300">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      Caution Zone ({selectedMeta?.cautionZone?.radius || 450}m)
                    </span>
                    <span className="text-[11px] text-slate-400 truncate max-w-[170px]">
                      {selectedMeta?.cautionZone?.label || 'Advisory perimeter'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-rose-300">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      Hazard Zone ({selectedMeta?.hazardZone?.radius || (selectedRisk === 'High' ? 500 : 0)}m)
                    </span>
                    <span className="text-[11px] text-slate-400 truncate max-w-[170px]">
                      {selectedMeta?.hazardZone?.label || (selectedRisk === 'High' ? 'Active hazard' : 'None')}
                    </span>
                  </div>
                </div>

                {/* Safety Instructions */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Safety Instructions
                  </h3>
                  <div className="mt-1.5 rounded-xl border border-slate-700/60 bg-slate-900/50 p-3 text-xs leading-relaxed text-slate-200">
                    {selectedMeta?.safetyInstructions || 'Maintain general awareness and obey local signage.'}
                  </div>
                </div>

                {/* Nearby Safe Points */}
                {selectedMeta?.nearbySafePoints && selectedMeta.nearbySafePoints.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Nearby Safe Points & Assembly
                    </h3>
                    <ul className="mt-1.5 space-y-1 text-xs text-slate-200">
                      {selectedMeta.nearbySafePoints.map((pt, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Emergency Information */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Emergency Information
                  </h3>
                  <div className="mt-1.5 grid grid-cols-2 gap-2 text-xs">
                    {(selectedMeta?.emergencyInformation || destinationEmergency || []).slice(0, 4).map((item, idx) => (
                      <a
                        key={idx}
                        href={`tel:${item.number}`}
                        className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/70 p-2 text-slate-200 hover:border-sky-400/50 hover:bg-slate-800 transition-colors"
                      >
                        <span className="truncate pr-1 text-[11px]">{item.label}</span>
                        <strong className="text-sky-300 font-bold shrink-0">{item.number}</strong>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Government Source & Boundary Disclaimer */}
                <div className="border-t border-slate-700/80 pt-3 text-[11px] text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">Verified Authority Source:</span>
                    {selectedMeta?.sourceUrl && (
                      <a
                        href={selectedMeta.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-bold"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <p className="mt-1 text-slate-400 leading-normal">
                    {selectedMeta?.sourceLabel || 'State Disaster Management Authority'}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500 italic">
                    {selectedMeta?.sourceNote || 'Boundaries are approximate disaster planning buffers, not surveyed property or hazard lines.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400">
                <Compass className="h-8 w-8 mx-auto text-slate-600 mb-2 animate-spin" />
                <p>Loading destination safety database…</p>
              </div>
            )}
          </section>

          {/* 4. Nearby Safer Alternatives Section */}
          <section className="rounded-2xl border border-emerald-500/30 bg-[#091a30] p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm">Nearby Safer Alternatives</h3>
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              Nearest Low-Risk recommended zones with emergency access:
            </p>

            <div className="mt-3 space-y-2">
              {nearbySafeAlternatives.map(({ zone, meta, distance }) => (
                <div
                  key={zone._id}
                  className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 hover:bg-emerald-950/40 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-white text-xs block truncate">
                      {zone.name}
                    </span>
                    <span className="text-[11px] text-emerald-300 block mt-0.5">
                      {distance < 1000 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(1)}km`} away · 🟢 Low Risk
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => jumpToZone(zone)}
                    className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-500 transition-colors cursor-pointer"
                  >
                    <span>Focus</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {/* 5. Destination Safety Catalog Directory (All 8 Locations Grid) */}
      <div className="mt-8 border-t border-slate-700/80 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-extrabold text-white">
              All Stored Safety Locations in {destination.label} ({zones.length} Locations)
            </h3>
            <p className="text-xs text-slate-400">
              Select any location to view its precise safe, caution, and hazard perimeters.
            </p>
          </div>

          {/* Risk Level Filter Chips */}
          <div className="flex items-center gap-1.5">
            {['All', 'Low', 'Moderate', 'High'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setFilterRisk(lvl)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
                  filterRisk === lvl
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {lvl} {lvl !== 'All' ? 'Risk' : ''}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {filteredZones.map((z) => {
            const meta = z.metadata instanceof Map ? Object.fromEntries(z.metadata) : (z.metadata || {});
            const r = meta.riskLevel || 'Low';
            const c = RISK_CONFIG[r];
            const isSelected = String(selectedZone?._id) === String(z._id);
            return (
              <div
                key={z._id}
                onClick={() => setSelectedZone(z)}
                className={`rounded-2xl border p-4 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-sky-400 bg-sky-950/30 ring-1 ring-sky-400/40'
                    : 'border-slate-800 bg-[#08172c] hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {z.category || 'Geofence'}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold border ${c.badge}`}>
                      {r} Risk
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm line-clamp-1">{z.name}</h4>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                    {meta.hazardType || z.alertMessage}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    Radius: {z.radius}m
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      jumpToZone(z);
                    }}
                    className="font-bold text-sky-400 hover:text-sky-300 flex items-center gap-0.5"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TouristSafetyMap;
