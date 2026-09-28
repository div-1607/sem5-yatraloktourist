import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  MapPin,
  Users,
  AlertTriangle,
  MessageSquare,
  ShieldCheck,
  Plus,
  Loader2,
  ExternalLink,
  CheckCircle,
  Volume2,
  VolumeX,
  Phone,
  Radio,
  Clock,
  Navigation,
  ShieldAlert,
  Search,
  CheckCircle2,
  Calendar,
  Compass,
  Copy,
  Check,
  X,
  Eye,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import MapView from '../components/MapView';
import {
  startEmergencySiren,
  stopEmergencySiren,
  setSirenMuted,
} from '../utils/sirenAudio';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [activeSOSList, setActiveSOSList] = useState([]);
  const [signedInUsers, setSignedInUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Digital ID Tracking State
  const [trackQuery, setTrackQuery] = useState('');
  const [trackedTourist, setTrackedTourist] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackError, setTrackError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Siren audio state - ONLY starts when SOS is clicked
  const [sirenMuted, setLocalSirenMuted] = useState(false);
  const [sirenAudible, setSirenAudible] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);
  const [incomingSOSAlert, setIncomingSOSAlert] = useState(null);

  const pollIntervalRef = useRef(null);
  const knownSOSIdsRef = useRef(new Set());
  const isInitialLoadRef = useRef(true);

  // Function to trigger siren and alert banner ONLY when SOS is clicked
  const triggerSOSAlert = (sos) => {
    if (!sos) return;
    knownSOSIdsRef.current.add(sos._id);
    setActiveSOSList((prev) => {
      const exists = prev.some((p) => p._id === sos._id);
      return exists ? prev : [sos, ...prev];
    });
    setIncomingSOSAlert(sos);
    if (!sirenMuted) {
      startEmergencySiren();
      setSirenAudible(true);
    }
    toast.error(`🚨 INCOMING SOS ALERT! Distress signal received from ${sos.userName || 'Tourist'}!`, {
      duration: 8000,
    });
  };

  useEffect(() => {
    // Initial fetch (will NOT start siren)
    fetchDashboardData();

    // BroadcastChannel listener for immediate SOS click notification
    let bc;
    try {
      bc = new BroadcastChannel('yatralok_emergency_channel');
      bc.onmessage = (event) => {
        if (event.data?.type === 'SOS_CLICKED') {
          const sos = event.data.data;
          if (sos) {
            triggerSOSAlert(sos);
          }
        }
      };
    } catch (e) {}

    // LocalStorage fallback event listener
    const handleStorage = (e) => {
      if (e.key === 'yatralok_latest_sos_event' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.data) {
            triggerSOSAlert(parsed.data);
          }
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    // Auto-polling interval every 3.5 seconds
    pollIntervalRef.current = setInterval(() => {
      pollLiveAlerts();
    }, 3500);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (bc) {
        try {
          bc.close();
        } catch (e) {}
      }
      window.removeEventListener('storage', handleStorage);
      stopEmergencySiren();
    };
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, activeSOSRes, usersRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/sos/active'),
        api.get('/admin/signed-in-users').catch(() => ({ data: { success: false } })),
      ]);

      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.data);
      }
      if (activeSOSRes.data.success) {
        const list = activeSOSRes.data.data || [];
        setActiveSOSList(list);
        // On initial load, record known IDs and DO NOT sound siren
        if (isInitialLoadRef.current) {
          knownSOSIdsRef.current = new Set(list.map((item) => item._id));
          isInitialLoadRef.current = false;
        }
      }
      if (usersRes.data.success) {
        setSignedInUsers(usersRes.data.data);
      } else if (analyticsRes.data.data?.signedInUsers) {
        setSignedInUsers(analyticsRes.data.data.signedInUsers);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const pollLiveAlerts = async () => {
    try {
      const [activeSOSRes, analyticsRes, usersRes] = await Promise.all([
        api.get('/sos/active'),
        api.get('/admin/analytics'),
        api.get('/admin/signed-in-users').catch(() => ({ data: { success: false } })),
      ]);

      if (activeSOSRes.data.success) {
        const list = activeSOSRes.data.data || [];
        setActiveSOSList(list);

        // Check for any newly arrived SOS clicked after initial load
        if (!isInitialLoadRef.current) {
          const newAlerts = list.filter((item) => !knownSOSIdsRef.current.has(item._id));
          if (newAlerts.length > 0) {
            newAlerts.forEach((a) => knownSOSIdsRef.current.add(a._id));
            triggerSOSAlert(newAlerts[0]);
          }
        }

        // If no active SOS signals exist in database, silence siren
        if (list.length === 0) {
          stopEmergencySiren();
          setSirenAudible(false);
          setIncomingSOSAlert(null);
        }
      }

      if (usersRes?.data?.success) {
        setSignedInUsers(usersRes.data.data);
      } else if (analyticsRes.data.success && analyticsRes.data.data?.signedInUsers) {
        setSignedInUsers(analyticsRes.data.data.signedInUsers);
      }

      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.data);
      }
    } catch (err) {
      // Background poll silently fails without disrupting UI
    }
  };

  const toggleSirenMute = () => {
    const nextMuted = !sirenMuted;
    setLocalSirenMuted(nextMuted);
    setSirenMuted(nextMuted);
    if (nextMuted) {
      stopEmergencySiren();
      setSirenAudible(false);
      toast('Siren silenced for this session', { icon: '🔇' });
    } else {
      if (activeSOSList.length > 0) {
        startEmergencySiren();
        setSirenAudible(true);
        toast.success('Emergency siren audio activated', { icon: '🔊' });
      } else {
        toast('Siren unmuted (will buzz when SOS is clicked)', { icon: '🔔' });
      }
    }
  };

  const handleCopyId = (id) => {
    if (!id) return;
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    toast.success(`Digital ID copied: ${id}`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleTrackTourist = async (queryId) => {
    const q = (queryId || trackQuery).trim();
    if (!q) {
      toast.error('Please enter a Tourist Digital ID (e.g. YL-IND-XXXXXX), Email, or Mobile');
      return;
    }

    setTrackingLoading(true);
    setTrackError(null);
    try {
      const res = await api.get(`/admin/tourist/${encodeURIComponent(q)}`);
      if (res.data.success) {
        setTrackedTourist(res.data.data);
        toast.success(`Identity Verified: ${res.data.data.tourist?.name}`);
        const el = document.getElementById('digital-id-tracker-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        setTrackedTourist(null);
        setTrackError(`No tourist found with ID "${q}"`);
      }
    } catch (err) {
      setTrackedTourist(null);
      setTrackError(err.response?.data?.message || `No tourist found matching "${q}"`);
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleUpdateSOSStatus = async (id, status) => {
    setResolvingId(id);
    try {
      const res = await api.patch(`/sos/${id}/status`, {
        status,
        resolutionNotes:
          status === 'resolved'
            ? 'Emergency resolved and closed by Admin from Central Command Center.'
            : 'Responders and emergency assistance dispatched to GPS location.',
      });

      if (res.data.success) {
        toast.success(`SOS Alert marked as ${status.toUpperCase()}`);
        setActiveSOSList((prev) => prev.filter((item) => item._id !== id));
        fetchDashboardData();
      }
    } catch (err) {
      toast.error('Failed to update SOS status');
    } finally {
      setResolvingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading Central Operations Command Center...</p>
      </div>
    );
  }

  const {
    totalDestinations = 0,
    totalUsers = 0,
    totalReviews = 0,
    activeSOS = activeSOSList.length,
    crowdDistribution = { low: 0, moderate: 0, high: 0 },
    recentReviews = [],
  } = analytics || {};

  const filteredUsers = signedInUsers.filter((u) => {
    if (!userSearch) return true;
    const term = userSearch.toLowerCase();
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.mobile?.toLowerCase().includes(term) ||
      u.city?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        {/* Admin Sidebar */}
        <Sidebar role="admin" />

        {/* Main Admin Content */}
        <div className="flex-1 space-y-8 min-w-0">
          {/* Header Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-900/90 via-navy-800/80 to-navy-900/90 border border-white/10 shadow-glass flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Central Operations Control</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Admin Command Center
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Live monitoring of tourist distress signals, signed-in users, destinations, and crowd density.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/admin/destinations"
                className="glass-button-primary text-xs uppercase tracking-wider py-2.5 px-4 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Manage Destinations</span>
              </Link>
            </div>
          </div>

          {/* Incoming Urgent SOS Clicked Notification Banner */}
          {incomingSOSAlert && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-700 to-red-600 border-2 border-amber-400 text-white shadow-glow-red flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-bounce">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-black/30 shrink-0">
                  <ShieldAlert className="w-8 h-8 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-black/40 text-[11px] font-black tracking-widest uppercase">
                      🚨 SOS BUTTON CLICKED &bull; SIREN ACTIVE
                    </span>
                    <span className="text-xs text-amber-200 font-mono font-bold">
                      {incomingSOSAlert.digitalId || 'DISTRESS'}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    Distress Signal from {incomingSOSAlert.userName || 'Tourist Traveler'}
                  </h3>
                  <p className="text-xs text-rose-100 flex flex-wrap items-center gap-3 mt-1">
                    <span>📞 {incomingSOSAlert.userMobile}</span>
                    <span>📍 {incomingSOSAlert.location?.address || 'GPS Coordinates Transmitted'}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={toggleSirenMute}
                  className="px-4 py-2 rounded-xl bg-black/50 hover:bg-black/70 text-white font-bold text-xs uppercase tracking-wider border border-white/20 flex items-center gap-1.5 transition-all"
                >
                  <VolumeX className="w-4 h-4 text-amber-300" />
                  <span>Silence Siren</span>
                </button>
                <button
                  onClick={() => setIncomingSOSAlert(null)}
                  className="px-4 py-2 rounded-xl bg-white text-navy-950 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ACTIVE SOS SIREN & LIVE LOCATION TRACKER (CRITICAL EMERGENCY BROADCAST)   */}
          {/* ========================================================================= */}
          {activeSOSList.length > 0 ? (
            <div className="p-6 rounded-3xl bg-gradient-to-b from-red-950/70 via-navy-950/90 to-red-950/60 border-2 border-red-500 shadow-glow-red space-y-6 animate-in fade-in duration-300">
              {/* Header with Siren Indicator & Audio Mute Controller */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-red-500/30">
                <div className="flex items-center gap-3">
                  <div className="relative p-3 rounded-2xl bg-red-600 text-white shadow-glow-red animate-pulse">
                    <ShieldAlert className="w-7 h-7" />
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 animate-ping"></span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-red-500 text-white animate-pulse">
                        EMERGENCY SOS ACTIVE
                      </span>
                      <span className="text-xs text-red-300 font-bold">
                        {activeSOSList.length} Active Distress Signal(s)
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                      🚨 LIVE DISTRESS LOCATION TRACKER
                    </h2>
                  </div>
                </div>

                {/* Siren Audio Controls */}
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={toggleSirenMute}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all border ${
                      sirenAudible
                        ? 'bg-red-600 hover:bg-red-500 text-white border-red-400 shadow-glow-red animate-bounce'
                        : 'bg-navy-900/80 hover:bg-navy-800 text-slate-300 border-white/20'
                    }`}
                  >
                    {sirenAudible ? (
                      <>
                        <Volume2 className="w-4 h-4 text-white animate-pulse" />
                        <span>SIREN BLARING (CLICK TO MUTE)</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-4 h-4 text-slate-400" />
                        <span>SIREN MUTED (ENABLE AUDIO)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Active Distress Signals with Embedded Map & Telemetry */}
              <div className="space-y-6">
                {activeSOSList.map((sos) => {
                  const lat = sos.location?.lat || 28.6139;
                  const lng = sos.location?.lng || 77.2090;
                  const address = sos.location?.address || 'GPS Coordinates Broadcast';

                  return (
                    <div
                      key={sos._id}
                      className="p-5 rounded-2xl bg-navy-900/90 border border-red-500/40 space-y-5"
                    >
                      {/* Top caller & status info */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center font-black text-sm">
                            {sos.userName?.charAt(0) || 'T'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-extrabold text-white">
                                {sos.userName}
                              </h3>
                              <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                                {sos.emergencyType || 'SOS Alert'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>Signal ID: #{sos._id.slice(-6).toUpperCase()}</span>
                              <span>&bull;</span>
                              <span className="text-rose-400 font-semibold flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(sos.createdAt).toLocaleTimeString()}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Caller Contact Pill */}
                        <div className="flex items-center gap-3">
                          <a
                            href={`tel:${sos.userMobile}`}
                            className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs flex items-center gap-2 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-amber-400" />
                            <span>{sos.userMobile}</span>
                          </a>
                        </div>
                      </div>

                      {/* GPS Telemetry & Coordinates */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left Details Card */}
                        <div className="space-y-3 p-4 rounded-xl bg-navy-950/80 border border-white/10 text-xs">
                          <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider text-[11px]">
                            <Radio className="w-3.5 h-3.5 animate-pulse" />
                            <span>Current GPS Telemetry</span>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-slate-400 block text-[11px]">
                              Exact Coordinates:
                            </span>
                            <div className="text-white font-mono font-bold text-base bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 inline-block">
                              Lat: {lat?.toFixed(5)}, Lng: {lng?.toFixed(5)}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-slate-400 block text-[11px]">
                              Detected Location / Address:
                            </span>
                            <p className="text-slate-200 font-medium">{address}</p>
                          </div>

                          {sos.userEmail && (
                            <div className="space-y-1 pt-1 border-t border-white/5">
                              <span className="text-slate-400 block text-[11px]">User Email:</span>
                              <span className="text-slate-300">{sos.userEmail}</span>
                            </div>
                          )}

                          {/* Quick Map Action Links */}
                          <div className="pt-2 flex flex-wrap gap-2">
                            <a
                              href={`https://www.google.com/maps?q=${lat},${lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                              <span>Open in Google Maps</span>
                            </a>
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                            >
                              <Navigation className="w-3.5 h-3.5" />
                              <span>Dispatch Route & Directions</span>
                            </a>
                          </div>
                        </div>

                        {/* Right: Embedded Interactive Map showing exact location */}
                        <div className="h-64 sm:h-auto rounded-xl overflow-hidden border border-red-500/30 relative">
                          <MapView
                            lat={lat}
                            lng={lng}
                            title={`🚨 SOS: ${sos.userName}`}
                            address={address}
                            zoom={15}
                            className="h-full min-h-[220px] w-full"
                          />
                        </div>
                      </div>

                      {/* Admin Resolution & Action Buttons */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
                        <span className="text-xs text-slate-400">
                          Status:{' '}
                          <span className="font-bold text-rose-400 uppercase">
                            {sos.status}
                          </span>
                        </span>

                        <div className="flex items-center gap-2">
                          {sos.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateSOSStatus(sos._id, 'responding')}
                              disabled={resolvingId === sos._id}
                              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs uppercase tracking-wider transition-all"
                            >
                              {resolvingId === sos._id ? 'Dispatching...' : 'Dispatch Responders'}
                            </button>
                          )}

                          <button
                            onClick={() => handleUpdateSOSStatus(sos._id, 'resolved')}
                            disabled={resolvingId === sos._id}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Resolve & Silence Siren</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* All Clear Banner */
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold block text-white text-sm">
                    All Clear & Safe Across Monitored Destinations
                  </span>
                  <span className="text-emerald-300/80">
                    No active emergency distress signals. Auto-telemetry listener active.
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px] uppercase">
                Normal Status
              </span>
            </div>
          )}

          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>Total Destinations</span>
                <MapPin className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {totalDestinations}
              </div>
              <p className="text-[11px] text-slate-400">Verified locations</p>
            </div>

            <div className="glass-card p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>Registered Tourists</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {totalUsers}
              </div>
              <p className="text-[11px] text-slate-400">Tourist accounts</p>
            </div>

            <div className="glass-card p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>Active SOS Alerts</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-400">
                {activeSOS}
              </div>
              <p className="text-[11px] text-slate-400">Distress calls active</p>
            </div>

            <div className="glass-card p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span>User Reviews</span>
                <MessageSquare className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {totalReviews}
              </div>
              <p className="text-[11px] text-slate-400">Feedback submitted</p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TRACK TOURIST BY DIGITAL ID COMMAND CONSOLE                               */}
          {/* ========================================================================= */}
          <div id="digital-id-tracker-section" className="glass-card p-6 space-y-5 border border-amber-500/30 bg-navy-950/70">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>Track Tourist by Digital ID</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Real-Time Telemetry
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Enter any tourist's unique Digital ID (issued upon registration) or mobile/email to inspect identity, chosen destination, and emergency status.
                  </p>
                </div>
              </div>

              <span className="text-[11px] text-amber-300 font-mono hidden sm:inline-block">
                Passport ID: YL-IND-XXXXXX
              </span>
            </div>

            {/* Search Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleTrackTourist();
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter Tourist Digital ID (e.g. YL-IND-482910), Mobile, or Email..."
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  className="glass-input w-full pl-10 text-xs py-2.5 text-white"
                />
              </div>
              <button
                type="submit"
                disabled={trackingLoading}
                className="glass-button-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shrink-0"
              >
                {trackingLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Tracking...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Track Tourist</span>
                  </>
                )}
              </button>
            </form>

            {/* Error feedback */}
            {trackError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
                <span>{trackError}</span>
                <button onClick={() => setTrackError(null)} className="text-rose-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Tracked Tourist Passport Dossier */}
            {trackedTourist && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-navy-900/90 via-navy-950 to-navy-900/90 border border-amber-500/40 space-y-5 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-black text-lg">
                      {trackedTourist.tourist?.name?.charAt(0) || 'T'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-black text-white">
                          {trackedTourist.tourist?.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Verified Tourist
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Registered on {new Date(trackedTourist.tourist?.createdAt).toLocaleDateString()} &bull;{' '}
                        {trackedTourist.tourist?.loginCount || 1} Total Sessions
                      </p>
                    </div>
                  </div>

                  {/* Digital ID badge with copy */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Digital ID:</span>
                      <span className="font-mono font-bold text-xs text-amber-400">
                        {trackedTourist.tourist?.digitalId || 'NOT ASSIGNED'}
                      </span>
                      <button
                        onClick={() => handleCopyId(trackedTourist.tourist?.digitalId)}
                        className="p-1 hover:text-white transition-colors"
                        title="Copy Digital ID"
                      >
                        {copiedId === trackedTourist.tourist?.digitalId ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <button
                      onClick={() => setTrackedTourist(null)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                      title="Close Dossier"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Grid of Tourist details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Contact Info */}
                  <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 space-y-2">
                    <span className="text-[11px] font-bold uppercase text-slate-400 block">Contact Telemetry</span>
                    <div className="space-y-1">
                      <p className="text-slate-300">
                        <span className="text-slate-500">Mobile: </span>
                        <a href={`tel:${trackedTourist.tourist?.mobile}`} className="text-amber-400 hover:underline font-mono">
                          {trackedTourist.tourist?.mobile || 'N/A'}
                        </a>
                      </p>
                      <p className="text-slate-300 truncate">
                        <span className="text-slate-500">Email: </span>
                        <a href={`mailto:${trackedTourist.tourist?.email}`} className="text-blue-400 hover:underline">
                          {trackedTourist.tourist?.email}
                        </a>
                      </p>
                      <p className="text-slate-300">
                        <span className="text-slate-500">Age / Gender: </span>
                        {trackedTourist.tourist?.age || 'N/A'} yrs &bull; {trackedTourist.tourist?.gender || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Origin / Residence */}
                  <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 space-y-2">
                    <span className="text-[11px] font-bold uppercase text-slate-400 block">Home / Origin</span>
                    <div className="space-y-1">
                      <p className="text-white font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span>{trackedTourist.tourist?.city || 'India'}</span>
                      </p>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {trackedTourist.tourist?.address || 'Address registered on file'}
                      </p>
                    </div>
                  </div>

                  {/* Destination Chosen */}
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                    <span className="text-[11px] font-bold uppercase text-amber-300 block flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      <span>Destination Chosen</span>
                    </span>
                    {trackedTourist.tourist?.chosenDestination ? (
                      <div className="p-2 rounded-lg bg-navy-950/70 border border-amber-500/30">
                        <p className="font-bold text-white text-xs">{trackedTourist.tourist.chosenDestination}</p>
                        <span className="text-[10px] text-amber-300/80">Primary Target Destination</span>
                      </div>
                    ) : (
                      <p className="text-slate-400 text-[11px] italic">No target destination specified at signup</p>
                    )}

                    {trackedTourist.tourist?.favorites && trackedTourist.tourist.favorites.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[10px] text-slate-400 block mb-1">Favorited / Saved Places:</span>
                        <div className="flex flex-wrap gap-1">
                          {trackedTourist.tourist.favorites.map((fav, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-semibold border border-blue-500/30">
                              {typeof fav === 'object' ? fav.title : fav}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* SOS Signal Distress History for this tourist */}
                {trackedTourist.sosAlerts && trackedTourist.sosAlerts.length > 0 && (
                  <div className="pt-2 border-t border-white/10 space-y-2">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Emergency Distress Signal History ({trackedTourist.sosAlerts.length})</span>
                    </span>
                    <div className="space-y-2">
                      {trackedTourist.sosAlerts.map((sos) => (
                        <div key={sos._id} className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white uppercase">{sos.emergencyType || 'SOS Alert'}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(sos.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 mt-0.5">{sos.location?.address || 'GPS Coordinates'}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                            sos.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300 animate-pulse'
                          }`}>
                            {sos.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* WHO ALL HAVE SIGNED IN & REGISTERED (REAL TOURISTS DATABASE)              */}
          {/* ========================================================================= */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>Registered Tourists & Signed-In Directory</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {signedInUsers.length} Users
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live database showing real registered users, their Digital ID, contact numbers, email, and the destinations they chose.
                  </p>
                </div>
              </div>

              {/* Search user */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by name, ID, phone, city..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="glass-input w-full pl-9 py-1.5 text-xs"
                />
              </div>
            </div>

            {/* Signed-in Users Table */}
            {filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <Users className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="font-semibold text-slate-300">No registered users in database yet.</p>
                <p className="text-[11px]">When tourists register on Yatra Lok, their Digital ID, contact, and chosen destination will appear here in real time.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-navy-950/80 text-[11px] uppercase font-bold text-slate-400 border-b border-white/10">
                    <tr>
                      <th className="p-3.5">Tourist / User</th>
                      <th className="p-3.5">Digital ID</th>
                      <th className="p-3.5">Contact Number</th>
                      <th className="p-3.5">Destination Chosen</th>
                      <th className="p-3.5">Origin City</th>
                      <th className="p-3.5">Last Signed In</th>
                      <th className="p-3.5 text-center">Track</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((item) => {
                      return (
                        <tr key={item._id} className="hover:bg-white/5 transition-colors">
                          {/* User info */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                                  item.role === 'admin'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {item.name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <p className="font-bold text-white text-xs">{item.name}</p>
                                <a
                                  href={`mailto:${item.email}`}
                                  className="text-[11px] text-slate-400 hover:text-blue-300 block truncate max-w-[170px]"
                                >
                                  {item.email}
                                </a>
                              </div>
                            </div>
                          </td>

                          {/* Digital ID */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30 text-[11px]">
                                {item.digitalId || 'YL-IND-PENDING'}
                              </span>
                              {item.digitalId && (
                                <button
                                  onClick={() => handleCopyId(item.digitalId)}
                                  className="p-1 text-slate-400 hover:text-white transition-colors"
                                  title="Copy Digital ID"
                                >
                                  {copiedId === item.digitalId ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Mobile */}
                          <td className="p-3.5">
                            <a
                              href={`tel:${item.mobile}`}
                              className="text-amber-400 hover:underline font-mono font-medium text-[11px] flex items-center gap-1.5"
                            >
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{item.mobile || 'Not Specified'}</span>
                            </a>
                          </td>

                          {/* Destination Chosen */}
                          <td className="p-3.5">
                            {item.chosenDestination ? (
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold max-w-[200px]">
                                <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span className="truncate">{item.chosenDestination}</span>
                              </div>
                            ) : item.favorites && item.favorites.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {item.favorites.slice(0, 2).map((fav, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-semibold border border-blue-500/30 truncate max-w-[140px]"
                                  >
                                    {typeof fav === 'object' ? fav.title : fav}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-500 italic">None selected</span>
                            )}
                          </td>

                          {/* City */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-1 text-slate-300">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{item.city || 'India'}</span>
                            </div>
                          </td>

                          {/* Last signed in */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>
                                {item.lastLogin
                                  ? new Date(item.lastLogin).toLocaleString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : 'New Registration'}
                              </span>
                            </div>
                          </td>

                          {/* Action Track */}
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => {
                                const target = item.digitalId || item.email;
                                setTrackQuery(target);
                                handleTrackTourist(target);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Track ID</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Crowd Distribution Bar */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span>Real-Time Destination Crowd Telemetry</span>
              </h3>
              <Link
                to="/admin/destinations"
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                Update Crowd Levels &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                <span className="text-xs text-emerald-400 font-semibold block">
                  🟢 Low Density
                </span>
                <span className="text-2xl font-black text-white mt-1 block">
                  {crowdDistribution.low}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25">
                <span className="text-xs text-amber-400 font-semibold block">
                  🟡 Moderate Rush
                </span>
                <span className="text-2xl font-black text-white mt-1 block">
                  {crowdDistribution.moderate}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25">
                <span className="text-xs text-rose-400 font-semibold block">
                  🔴 Heavy Rush
                </span>
                <span className="text-2xl font-black text-white mt-1 block">
                  {crowdDistribution.high}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
