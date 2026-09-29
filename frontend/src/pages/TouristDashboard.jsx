import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  User,
  Heart,
  Search,
  ShieldAlert,
  MapPin,
  Phone,
  Edit3,
  Calendar,
  Sparkles,
  Compass,
  CheckCircle,
  ArrowRight,
  Loader2,
  Trash2,
  Radio,
  QrCode,
  ShieldCheck,
  LocateFixed,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLiveLocation, FALLBACK_MAP_CENTER } from '../context/LiveLocationContext';
import api from '../services/api';
import geofenceApi from '../services/geofenceApi';
import Sidebar from '../components/Sidebar';
import DestinationCard from '../components/DestinationCard';
import LiveUserMarker from '../components/LiveUserMarker';
import { FreeTileLayer } from '../components/MapView';
import toast from 'react-hot-toast';

const TouristDashboard = () => {
  const { user, updateUser, toggleFavorite } = useAuth();
  const {
    coordinates: liveCoords,
    userLocation: liveGpsCoords,
    hasFix,
    isTracking,
    permissionStatus,
    error: gpsError,
    placeLabel,
    activeZones,
    nearbyAttractions,
    highRiskWarning,
    startTracking,
    forceLocate,
  } = useLiveLocation();
  const navigate = useNavigate();
  const [shouldRecenterRadar, setShouldRecenterRadar] = useState(false);

  const [favorites, setFavorites] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [geofences, setGeofences] = useState([]);

  // Edit Profile modal
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    mobile: user?.mobile || '',
    city: user?.city || '',
    address: user?.address || '',
    age: user?.age || '',
    gender: user?.gender || 'Male',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    geofenceApi
      .getActiveGeofences()
      .then((res) => {
        if (res.data?.data) setGeofences(res.data.data);
      })
      .catch(() => {});
    startTracking();
    forceLocate();
  }, []);

  useEffect(() => {
    if (!hasFix || !liveGpsCoords) return;
    setShouldRecenterRadar(true);
    const timer = setTimeout(() => setShouldRecenterRadar(false), 1600);
    return () => clearTimeout(timer);
  }, [hasFix]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [favRes, recRes, userRes] = await Promise.all([
        api.get('/users/favorites').catch(() => ({ data: { success: false, data: [] } })),
        api.get('/destinations/recommendations').catch(() => ({ data: { success: false, data: [] } })),
        api.get('/users/profile').catch(() => ({ data: { success: false, data: user || {} } })),
      ]);

      if (favRes.data?.success && Array.isArray(favRes.data.data)) {
        setFavorites(favRes.data.data);
      }
      if (recRes.data?.success && Array.isArray(recRes.data.data)) {
        setRecommendations(recRes.data.data);
      }
      const userData = userRes.data?.data || user || {};
      setRecentSearches(userData.recentSearches || []);
      setProfileForm({
        name: userData.name || user?.name || '',
        mobile: userData.mobile || user?.mobile || '',
        city: userData.city || user?.city || '',
        address: userData.address || user?.address || '',
        age: userData.age || user?.age || '',
        gender: userData.gender || user?.gender || 'Male',
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/users/profile', profileForm);
      if (res.data.success) {
        updateUser(res.data.data);
        setIsEditing(false);
        toast.success('Profile updated successfully');
      }
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRemoveFavorite = async (destId) => {
    await toggleFavorite(destId);
    setFavorites((prev) => prev.filter((item) => item._id !== destId));
    toast.success('Removed from bookmarks');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        {/* Sidebar Navigation */}
        <Sidebar role="tourist" />

        {/* Main Content Area */}
        <div className="flex-1 space-y-8 min-w-0">
          {/* 1. TOP HERO WELCOME BANNER (Futuristic Glassmorphic) */}
          <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-navy-900 via-blue-royal/50 to-navy-950 border border-blue-electric/30 shadow-glass-card">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-electric/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-royal/40 border border-blue-electric/30 text-blue-neon text-[11px] font-bold uppercase tracking-wider mb-2">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-blue-electric" />
                  <span>Tourist Command Hub Active</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  Namaste, {user?.name || 'Explorer'}!
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  Real-time GPS geofence radar, AI travel recommendations, and emergency SOS monitoring are active for your journey.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/geofencing"
                  className="glass-button-primary text-xs uppercase tracking-wider py-3 px-5 flex items-center gap-2"
                >
                  <Compass className="w-4 h-4" />
                  <span>Launch Geofence Radar</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 2. LIVE NATIONAL TRAVEL ADVISORY (Warning Status Yellow) */}
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-3.5 shadow-glow-warning backdrop-blur-xl">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1">
              <h4 className="font-bold text-amber-300 text-sm">
                Live Regional Travel Advisory:
              </h4>
              <p className="text-amber-200/90 leading-relaxed text-[11px]">
                Peak crowd hours detected at major heritage corridors (11:00 AM – 04:00 PM). Use YatraLok AI crowd forecasts to visit during early morning or sunset for optimal safety scores.
              </p>
            </div>
          </div>

          {/* LIVE LOCATION TELEMETRY BOX - SHOWN INSIDE THE BOX EVERY TIME */}
          <div className="p-4 sm:p-5 rounded-2xl bg-black-midnight/85 border border-blue-electric/30 backdrop-blur-xl shadow-glass flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-blue-electric/20 border border-blue-electric/40 text-blue-neon shadow-glow-electric shrink-0">
                <MapPin className="w-6 h-6 animate-pulse text-blue-electric" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`w-2 h-2 rounded-full ${hasFix ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                  <span className="text-[11px] uppercase font-black text-blue-neon tracking-wider">
                    {hasFix ? 'Live GPS Telemetry Stream' : isTracking ? 'Acquiring GPS lock…' : 'Browser GPS idle'}
                  </span>
                  {hasFix && (
                    <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                      ±{liveCoords?.accuracy ?? 0}m precision
                    </span>
                  )}
                </div>
                <p className="text-base sm:text-lg font-mono font-black text-white mt-0.5 tracking-wide">
                  {liveGpsCoords
                    ? `${liveGpsCoords[0].toFixed(6)}°, ${liveGpsCoords[1].toFixed(6)}°`
                    : 'Awaiting navigator.geolocation lock'}
                </p>
                {placeLabel && (
                  <p className="text-[11px] text-blue-neon mt-0.5 line-clamp-2">{placeLabel}</p>
                )}
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <span className="text-blue-electric font-semibold">Current Containment:</span>
                  <span>{activeZones.length > 0 ? activeZones[0].name : 'Free roam — no geofence match yet'}</span>
                </p>
                {gpsError && (
                  <p className="text-[11px] text-amber-300 mt-1">{gpsError}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!isTracking && (
                <button
                  type="button"
                  onClick={startTracking}
                  className="px-3.5 py-2 rounded-xl bg-blue-electric/20 hover:bg-blue-electric/30 border border-blue-electric/40 text-blue-neon font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <LocateFixed className="w-3.5 h-3.5" />
                  <span>Start Live GPS</span>
                </button>
              )}
              {isTracking && (
                <button
                  type="button"
                  onClick={forceLocate}
                  className="px-3.5 py-2 rounded-xl bg-navy-950/80 hover:bg-blue-royal/30 border border-blue-electric/30 text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <LocateFixed className="w-3.5 h-3.5" />
                  Recalibrate
                </button>
              )}
              <Link
                to="/geofencing"
                className="glass-button-primary text-xs py-2 px-4 flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Open Radar Map</span>
              </Link>
            </div>
          </div>

          {/* 3. PROFILE DETAILS & DIGITAL TOURIST ID CARD */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Digital ID Holographic Card (1 col) */}
            <div className="relative rounded-3xl bg-gradient-to-br from-navy-900/90 via-navy-950 to-black-deep border border-blue-electric/40 p-6 shadow-glass-panel overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-electric/15 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-royal/60 border border-blue-electric/40 flex items-center justify-center text-blue-neon">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Official Credential
                      </span>
                      <h4 className="text-xs font-black text-white">DIGITAL TOURIST ID</h4>
                    </div>
                  </div>
                  <span className="badge-safe text-[10px] font-mono px-2 py-0.5 rounded-full">
                    ACTIVE
                  </span>
                </div>

                {/* ID Code Banner */}
                <div className="my-5 p-3 rounded-xl bg-black-deep/80 border border-blue-electric/30 text-center">
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 block mb-0.5">
                    Universal Tourist Token
                  </span>
                  <span className="text-sm sm:text-base font-black font-mono tracking-widest text-blue-neon">
                    {user?.digitalId || 'YL-IND-2026-X89'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Cardholder:</span>
                    <span className="font-bold text-white">{user?.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Emergency Phone:</span>
                    <span className="font-mono text-white">{user?.mobile || '+91 98765 43210'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Registered City:</span>
                    <span className="text-white">{user?.city || 'Delhi NCR, India'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Safety Clearance:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Biometric Verified
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 text-center">
                <span className="text-[10px] text-slate-500 font-mono">
                  Tamper-proof Cryptographic QR ID
                </span>
              </div>
            </div>

            {/* Tourist Profile Details & Statistics (2 cols) */}
            <div className="lg:col-span-2 glass-card p-6 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-electric" />
                  <span>Profile Information & Telemetry Settings</span>
                </h3>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-neon hover:text-white transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Update Profile</span>
                </button>
              </div>

              {/* Statistics Counters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-navy-950/60 border border-blue-electric/25">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Bookmarked Places
                  </span>
                  <span className="text-2xl font-black text-white font-mono">
                    {favorites.length}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-navy-950/60 border border-blue-electric/25">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Searches Run
                  </span>
                  <span className="text-2xl font-black text-blue-neon font-mono">
                    {recentSearches.length}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-navy-950/60 border border-blue-electric/25">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Perimeter Status
                  </span>
                  <span className={`text-xs font-bold flex items-center gap-1 mt-1 ${activeZones.length ? 'text-emerald-400' : 'text-blue-electric'}`}>
                    <CheckCircle className="w-3.5 h-3.5" /> {activeZones.length ? 'Inside geofence' : 'Free roam'}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-navy-950/60 border border-blue-electric/25">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Telemetry
                  </span>
                  <span className={`text-xs font-bold flex items-center gap-1 mt-1 ${hasFix ? 'text-blue-electric' : 'text-slate-400'}`}>
                    <Zap className="w-3.5 h-3.5" /> {hasFix ? 'watchPosition live' : 'No GPS lock'}
                  </span>
                </div>
              </div>

              {/* Profile Details List */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Primary Email</span>
                  <span className="text-white font-medium truncate block mt-0.5">{user?.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Age & Gender</span>
                  <span className="text-white font-medium block mt-0.5">
                    {user?.age || '26'} Yrs • {user?.gender || 'Tourist'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Permanent Address</span>
                  <span className="text-white font-medium block mt-0.5 truncate">
                    {user?.address || 'Verified Residential Address'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. INTERACTIVE RADAR MINI MAP (Dark Glassmorphic) */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-neon" />
                <h3 className="text-base font-bold text-white">Live Geofence Radar Preview</h3>
              </div>
              <Link
                to="/geofencing"
                className="text-xs font-bold text-blue-neon hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Open Full Radar Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {permissionStatus === 'denied' && (
              <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-200 text-xs">
                Location is blocked. Allow GPS in the address bar, then tap Start Live GPS.
              </div>
            )}

            {highRiskWarning && (
              <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs">
                Hazard zone: {highRiskWarning.name} — {highRiskWarning.message}
              </div>
            )}

            <div className="h-72 w-full rounded-2xl overflow-hidden border border-blue-electric/25 shadow-glass relative">
              <MapContainer
                key={liveGpsCoords ? 'radar-live' : 'radar-fallback'}
                center={liveGpsCoords || FALLBACK_MAP_CENTER}
                zoom={liveGpsCoords ? 17 : 5}
                scrollWheelZoom={false}
                className="w-full h-full bg-black-midnight yatralok-map"
              >
                <FreeTileLayer />
                {liveGpsCoords && (
                  <LiveUserMarker
                    position={liveGpsCoords}
                    coordinates={{ ...(liveCoords || {}), placeLabel }}
                    followUser
                    shouldRecenter={shouldRecenterRadar}
                    openPopup
                  />
                )}
                {geofences.map((fence) => {
                  const coords = fence.center?.coordinates;
                  if (!coords || coords.length < 2) return null;
                  const [lon, lat] = coords;
                  const danger =
                    fence.category === 'high-risk' ||
                    fence.category === 'restricted' ||
                    fence.alertLevel === 'danger';
                  return (
                    <Circle
                      key={fence._id}
                      center={[lat, lon]}
                      radius={fence.radiusMeters || 300}
                      pathOptions={{
                        color: danger ? '#EF4444' : '#3B82F6',
                        fillColor: danger ? '#F87171' : '#60A5FA',
                        fillOpacity: 0.16,
                        weight: 1.5,
                      }}
                    >
                      <Popup>
                        <div className="text-white p-1">
                          <p className="font-bold text-sm text-blue-neon">{fence.name}</p>
                          <p className="text-xs text-slate-300">{fence.radiusMeters}m {fence.category}</p>
                        </div>
                      </Popup>
                    </Circle>
                  );
                })}
              </MapContainer>
              <div className="absolute top-3 left-3 z-[1000] max-w-[85%] p-3 rounded-xl bg-black-midnight/90 border border-blue-electric/40 backdrop-blur-xl pointer-events-none">
                <p className="text-[10px] uppercase font-black tracking-wider text-blue-neon">Your exact location</p>
                <p className="text-xs font-mono font-bold text-white mt-0.5">
                  {liveGpsCoords
                    ? `${liveGpsCoords[0].toFixed(6)}°, ${liveGpsCoords[1].toFixed(6)}°`
                    : 'Acquiring GPS…'}
                </p>
                {placeLabel && (
                  <p className="text-[10px] text-slate-300 mt-1 line-clamp-2">{placeLabel}</p>
                )}
              </div>
            </div>

            {nearbyAttractions.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {nearbyAttractions.slice(0, 3).map((item) => (
                  <div
                    key={item.geofenceId || item.id || item.name}
                    className="p-3 rounded-xl bg-navy-950/70 border border-blue-electric/20 text-xs"
                  >
                    <p className="font-bold text-white truncate">{item.name}</p>
                    <p className="text-blue-electric mt-1">
                      {item.distanceMeters > 1000
                        ? `${(item.distanceMeters / 1000).toFixed(1)} km away`
                        : `${Math.round(item.distanceMeters || 0)} m away`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. SAVED DESTINATIONS (FAVORITES) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                <span>Saved Destinations ({favorites.length})</span>
              </h2>
              {favorites.length > 0 && (
                <Link
                  to="/destinations"
                  className="text-xs text-blue-neon hover:text-white font-semibold"
                >
                  Explore More &rarr;
                </Link>
              )}
            </div>

            {loading ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-8 h-8 text-blue-electric animate-spin" />
              </div>
            ) : favorites.length === 0 ? (
              <div className="glass-card p-10 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-navy-950/80 border border-blue-electric/30 text-slate-400 mx-auto flex items-center justify-center">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">No Saved Places Yet</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Click the heart icon on any destination card to bookmark it here for fast itinerary access.
                  </p>
                </div>
                <Link
                  to="/destinations"
                  className="glass-button-primary inline-flex items-center gap-2 text-xs uppercase tracking-wider py-2.5 px-5"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((dest) => (
                  <div key={dest._id} className="relative group">
                    <DestinationCard destination={dest} />
                    <button
                      onClick={() => handleRemoveFavorite(dest._id)}
                      className="absolute top-3 left-3 z-20 p-2 rounded-full bg-black-midnight/80 border border-white/10 text-slate-300 hover:text-red-400 hover:bg-black-deep transition-all text-xs shadow-glass cursor-pointer"
                      title="Remove from bookmarks"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 6. NETFLIX-STYLE PERSONALIZED RECOMMENDATIONS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-electric" />
                <span>AI Personalized Recommendations</span>
              </h2>
              <Link
                to="/recommendations"
                className="text-xs text-blue-neon hover:text-white font-semibold"
              >
                Open Recommendation Engine &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.slice(0, 3).map((dest) => (
                <DestinationCard key={dest._id} destination={dest} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 space-y-5 border border-blue-electric/30">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Update Tourist Profile</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full glass-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Emergency Mobile
                </label>
                <input
                  type="tel"
                  value={profileForm.mobile}
                  onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                  className="w-full glass-input text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Home City
                  </label>
                  <input
                    type="text"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    className="w-full glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={profileForm.age}
                    onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                    className="w-full glass-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Permanent Address
                </label>
                <textarea
                  rows="2"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="w-full glass-input text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="glass-button-primary text-xs font-bold px-5 py-2.5"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TouristDashboard;
