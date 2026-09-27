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

  // Siren audio state
  const [sirenMuted, setLocalSirenMuted] = useState(false);
  const [sirenAudible, setSirenAudible] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);

  const pollIntervalRef = useRef(null);

  useEffect(() => {
    // Initial fetch
    fetchDashboardData();

    // Auto-polling interval every 3.5 seconds for live SOS alerts and user logins
    pollIntervalRef.current = setInterval(() => {
      pollLiveAlerts();
    }, 3500);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      stopEmergencySiren();
    };
  }, []);

  // Manage Siren Audio state based on active SOS count and mute setting
  useEffect(() => {
    if (activeSOSList.length > 0 && !sirenMuted) {
      startEmergencySiren();
      setSirenAudible(true);
    } else {
      stopEmergencySiren();
      setSirenAudible(false);
    }
  }, [activeSOSList, sirenMuted]);

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
        setActiveSOSList(activeSOSRes.data.data);
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
      const [activeSOSRes, analyticsRes] = await Promise.all([
        api.get('/sos/active'),
        api.get('/admin/analytics'),
      ]);

      if (activeSOSRes.data.success) {
        setActiveSOSList(activeSOSRes.data.data);
      }
      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.data);
        if (analyticsRes.data.data?.signedInUsers) {
          setSignedInUsers(analyticsRes.data.data.signedInUsers);
        }
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
      toast('Siren silenced for this session', { icon: '🔇' });
    } else {
      toast.success('Emergency siren audio activated', { icon: '🔊' });
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
          {/* WHO ALL HAVE SIGNED IN (ACTIVE USERS & SESSIONS LIST)                    */}
          {/* ========================================================================= */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>Signed-In Users & Active Accounts</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {signedInUsers.length} Logged
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real-time list of all users who have signed in, their credentials, roles, and last login activity.
                  </p>
                </div>
              </div>

              {/* Search user */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter signed-in users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="glass-input w-full pl-9 py-1.5 text-xs"
                />
              </div>
            </div>

            {/* Signed-in Users Table */}
            {filteredUsers.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No users found matching your search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-navy-950/80 text-[11px] uppercase font-bold text-slate-400 border-b border-white/10">
                    <tr>
                      <th className="p-3.5">User</th>
                      <th className="p-3.5">Contact & City</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Last Signed In</th>
                      <th className="p-3.5">Login Frequency</th>
                      <th className="p-3.5">Session Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((item) => {
                      const isRecent = item.lastLogin
                        ? Date.now() - new Date(item.lastLogin).getTime() < 1000 * 60 * 60 * 24
                        : true;

                      return (
                        <tr key={item._id} className="hover:bg-white/5 transition-colors">
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
                                <span className="text-[11px] text-slate-400 block">{item.email}</span>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <p className="text-amber-400 font-mono font-medium text-[11px]">
                              {item.mobile || 'Not Specified'}
                            </p>
                            <span className="text-[11px] text-slate-400">
                              {item.city || 'India'}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                item.role === 'admin'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              }`}
                            >
                              {item.role}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5 text-slate-200">
                              <Calendar className="w-3.5 h-3.5 text-amber-400" />
                              <span>
                                {item.lastLogin
                                  ? new Date(item.lastLogin).toLocaleString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : 'Active Session'}
                              </span>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-lg bg-navy-950 font-mono font-semibold text-slate-300 border border-white/5">
                              {item.loginCount || 1} logins
                            </span>
                          </td>

                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2.5 h-2.5 rounded-full ${
                                  isRecent
                                    ? 'bg-emerald-400 animate-pulse'
                                    : 'bg-slate-500'
                                }`}
                              ></span>
                              <span
                                className={`text-[11px] font-semibold ${
                                  isRecent ? 'text-emerald-400' : 'text-slate-400'
                                }`}
                              >
                                {isRecent ? 'Signed In & Active' : 'Offline'}
                              </span>
                            </div>
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
