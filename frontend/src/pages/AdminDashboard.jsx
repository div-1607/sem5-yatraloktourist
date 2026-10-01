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
  Copy,
  Check,
  X,
  Compass,
  Route,
  Star,
  TrendingUp,
} from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import {
  startEmergencySiren,
  stopEmergencySiren,
  setSirenMuted,
} from '../utils/sirenAudio';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [activeSOSList, setActiveSOSList] = useState([]);
  const [signedInUsers, setSignedInUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [destinationAnalytics, setDestinationAnalytics] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Digital ID Tracking State
  const [trackQuery, setTrackQuery] = useState('');
  const [trackedTourist, setTrackedTourist] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackError, setTrackError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Siren audio state
  const [sirenMuted, setLocalSirenMuted] = useState(false);
  const [sirenAudible, setSirenAudible] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);

  const pollIntervalRef = useRef(null);

  useEffect(() => {
    fetchDashboardData();

    pollIntervalRef.current = setInterval(() => {
      pollLiveAlerts();
    }, 4000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      stopEmergencySiren();
    };
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user || user.role !== 'admin') return;
    setLoading(true);
    try {
      const [analyticsRes, activeSOSRes, usersRes, tripsRes, destinationsRes] = await Promise.all([
        api.get('/admin/analytics').catch(() => ({ data: { success: false } })),
        api.get('/sos/active').catch(() => ({ data: { success: false, data: [] } })),
        api.get('/admin/signed-in-users').catch(() => ({ data: { success: false, data: [] } })),
        api.get('/trips/admin/all?limit=1000').catch(() => ({ data: { success: false, data: [] } })),
        api.get('/analytics/destinations').catch(() => ({ data: { success: false, data: {} } })),
      ]);

      if (analyticsRes.data?.success) {
        setAnalytics(analyticsRes.data.data);
      }
      if (activeSOSRes.data?.success) {
        setActiveSOSList(activeSOSRes.data.data || []);
      }
      if (usersRes.data?.success) {
        setSignedInUsers(usersRes.data.data || []);
      } else if (analyticsRes.data?.data?.signedInUsers) {
        setSignedInUsers(analyticsRes.data.data.signedInUsers);
      }
      if (tripsRes.data?.success) setTrips(tripsRes.data.data || []);
      if (destinationsRes.data?.success) setDestinationAnalytics(destinationsRes.data.data?.topRated || []);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const pollLiveAlerts = async () => {
    if (!user || user.role !== 'admin') return;
    try {
      const [activeSOSRes, analyticsRes] = await Promise.all([
        api.get('/sos/active').catch(() => ({ data: { success: false } })),
        api.get('/admin/analytics').catch(() => ({ data: { success: false } })),
      ]);

      if (activeSOSRes.data?.success) {
        const list = activeSOSRes.data.data || [];
        setActiveSOSList(list);
        if (list.length === 0) {
          stopEmergencySiren();
          setSirenAudible(false);
        }
      }
      if (analyticsRes.data?.success) {
        setAnalytics(analyticsRes.data.data);
      }
    } catch (err) {}
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
      }
    }
  };

  const handleCopyId = (id) => {
    if (!id) return;
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    toast.success(`Copied: ${id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTrackTourist = async (e) => {
    e?.preventDefault();
    const q = trackQuery.trim();
    if (!q) {
      toast.error('Please enter a Tourist Digital ID, Email, or Mobile');
      return;
    }

    setTrackingLoading(true);
    setTrackError(null);
    try {
      const res = await api.get(`/admin/tourist/${encodeURIComponent(q)}`);
      if (res.data?.success) {
        setTrackedTourist(res.data.data);
        toast.success(`Identity Verified: ${res.data.data.tourist?.name}`);
      } else {
        setTrackError('Tourist record not found. Check Digital ID or mobile.');
      }
    } catch (err) {
      setTrackError('Tourist profile could not be retrieved.');
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleResolveSOS = async (sosId) => {
    setResolvingId(sosId);
    try {
      const res = await api.put(`/sos/${sosId}`, { status: 'resolved' });
      if (res.data?.success) {
        toast.success('Distress incident resolved.');
        setActiveSOSList((prev) => prev.filter((item) => item._id !== sosId));
      }
    } catch (err) {
      toast.error('Failed to resolve SOS incident.');
    } finally {
      setResolvingId(null);
    }
  };

  const {
    totalDestinations = 0,
    totalUsers = signedInUsers.length,
    totalReviews = 0,
  } = analytics || {};

  const activeTourists = signedInUsers.filter((person) => person.isOnline).length;
  const ongoingTrips = trips.filter((trip) => ['active', 'paused'].includes(trip.status));
  const completedTrips = trips.filter((trip) => trip.status === 'completed');
  const averageTripDays = trips.length
    ? Math.round(trips.reduce((total, trip) => total + Math.max(0, (new Date(trip.endDate) - new Date(trip.startDate)) / 86400000), 0) / trips.length)
    : 0;
  const registrationRecords = analytics?.allRegistrations || signedInUsers;
  const newTourists = registrationRecords.filter((person) => person.createdAt && Date.now() - new Date(person.createdAt).getTime() <= 30 * 86400000).length;
  const mostReviewedDestination = [...destinationAnalytics].sort((a, b) => (b.numReviews || 0) - (a.numReviews || 0))[0];

  const filteredUsers = signedInUsers.filter((u) => {
    if (!userSearch) return true;
    const term = userSearch.toLowerCase();
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.mobile?.toLowerCase().includes(term) ||
      u.city?.toLowerCase().includes(term) ||
      u.digitalId?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="w-full px-4 sm:px-6 xl:px-10 py-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Widened Admin Sidebar (w-80) */}
        <Sidebar role="admin" />

        {/* Main Admin Workspace */}
        <div className="flex-1 min-w-0 space-y-8 w-full">
          {/* Header Banner */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Central Administration</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Admin Command Center
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Monitor destinations, registered travelers, crowd telemetry, and emergency SOS alerts.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/admin/destinations"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Manage Destinations</span>
              </Link>
            </div>
          </div>

          {/* ACTIVE SOS NOTIFICATION (IF ACTIVE) */}
          {activeSOSList.length > 0 ? (
            <div className="bg-red-50 border-2 border-red-500 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold">
                    <ShieldAlert className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-red-700">
                      Emergency Alert Active
                    </span>
                    <h2 className="text-xl font-extrabold text-red-900">
                      {activeSOSList.length} Active Distress Signal(s)
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleSirenMute}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-red-300 text-red-700 font-semibold text-xs shadow-xs hover:bg-red-100/50 cursor-pointer"
                >
                  {sirenAudible ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span>{sirenAudible ? 'Silence Siren' : 'Enable Audio'}</span>
                </button>
              </div>

              <div className="space-y-4">
                {activeSOSList.map((sos) => (
                  <div
                    key={sos._id}
                    className="bg-white border border-red-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-base">{sos.userName}</h4>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                          {sos.emergencyType || 'SOS Alert'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 space-x-3">
                        <span>📞 {sos.userMobile}</span>
                        <span>📍 {sos.location?.address || 'GPS Coordinates Broadcast'}</span>
                        <span>⏱ {new Date(sos.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {sos.location?.lat && (
                        <a
                          href={`https://www.google.com/maps?q=${sos.location.lat},${sos.location.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Google Maps</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleResolveSOS(sos._id)}
                        disabled={resolvingId === sos._id}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Resolve Alert</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-800">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-semibold">
                  All Systems Clear: No active emergency distress signals across destinations.
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-200/60 font-bold text-emerald-900 text-[11px] uppercase">
                Normal
              </span>
            </div>
          )}

          {/* Key KPI Stats Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-sm font-semibold text-slate-600">Total Tourists</span>
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">{totalUsers}</div>
              <p className="text-sm text-slate-500 pt-1">Registered platform accounts</p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-sm font-semibold text-slate-600">Active Tourists</span>
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-emerald-700">{activeTourists}</div>
              <p className="text-sm text-slate-500 pt-1">Online account status</p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-sm font-semibold text-slate-600">Ongoing Trips</span>
                <Route className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-black text-blue-700">{ongoingTrips.length}</div>
              <Link to="/admin/tracking" className="text-sm font-semibold text-blue-600 hover:underline block pt-1">Open tracking &rarr;</Link>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-sm font-semibold text-slate-600">Completed Trips</span>
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">{completedTrips.length}</div>
              <p className="text-sm text-slate-500 pt-1">Recorded itineraries</p>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400"><span className="text-sm font-semibold text-slate-600">Total Destinations</span><MapPin className="w-5 h-5 text-blue-600" /></div>
              <div className="text-3xl font-black text-slate-900">{totalDestinations}</div>
              <Link to="/admin/destinations" className="text-sm font-semibold text-blue-600 hover:underline block pt-1">Manage catalog &rarr;</Link>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400"><span className="text-sm font-semibold text-slate-600">Most Reviewed</span><Star className="w-5 h-5 text-amber-500" /></div>
              <div className="text-lg font-black text-slate-900 line-clamp-1">{mostReviewedDestination?.title || 'No review data'}</div>
              <p className="text-sm text-slate-500 pt-1">{mostReviewedDestination?.numReviews || 0} platform reviews</p>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400"><span className="text-sm font-semibold text-slate-600">Average Trip Duration</span><Clock className="w-5 h-5 text-blue-600" /></div>
              <div className="text-3xl font-black text-slate-900">{averageTripDays} <span className="text-base">days</span></div>
              <p className="text-sm text-slate-500 pt-1">Across saved itineraries</p>
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400"><span className="text-sm font-semibold text-slate-600">New Tourists</span><TrendingUp className="w-5 h-5 text-emerald-600" /></div>
              <div className="text-3xl font-black text-slate-900">{newTourists}</div>
              <p className="text-sm text-slate-500 pt-1">Registered in last 30 days</p>
            </div>
          </div>

          {/* TRACK TOURIST BY DIGITAL ID */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Track Tourist by Digital ID</h3>
                <p className="text-xs text-slate-500">
                  Search any traveler's unique Token, Email, or Mobile to inspect their travel identity.
                </p>
              </div>
            </div>

            <form onSubmit={handleTrackTourist} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter Tourist Digital ID (e.g. YL-IND-2026-X89), Mobile, or Email..."
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  className="glass-input w-full pl-10 text-xs py-2.5"
                />
              </div>
              <button
                type="submit"
                disabled={trackingLoading}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                {trackingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Verify Identity</span>
              </button>
            </form>

            {trackError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center justify-between">
                <span>{trackError}</span>
                <button type="button" onClick={() => setTrackError(null)}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {trackedTourist && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      {trackedTourist.tourist?.name?.charAt(0) || 'T'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{trackedTourist.tourist?.name}</h4>
                      <p className="text-xs text-slate-500">{trackedTourist.tourist?.email}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-100 text-blue-800">
                    {trackedTourist.tourist?.digitalId || 'YL-IND-ACTIVE'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
                  <div>
                    <span className="text-slate-400 block">Mobile</span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">
                      {trackedTourist.tourist?.mobile || 'Not set'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">City</span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">
                      {trackedTourist.tourist?.city || 'India'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Age / Gender</span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">
                      {trackedTourist.tourist?.age || '26'} yrs • {trackedTourist.tourist?.gender || 'Tourist'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Status</span>
                    <span className="font-semibold text-emerald-600 mt-0.5 block">Active Traveler</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* REGISTERED TOURISTS DIRECTORY */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Registered Travelers Directory</h3>
                <p className="text-xs text-slate-500">Live database of signed-in travelers and their travel credentials.</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter travelers..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="glass-input w-full pl-9 py-1.5 text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Traveler Name</th>
                    <th className="p-3">Digital ID</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Origin City</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No travelers found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                              {item.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{item.name}</p>
                              <p className="text-[11px] text-slate-400">{item.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            {item.digitalId || 'YL-IND-2026-X01'}
                          </span>
                        </td>
                        <td className="p-3 font-mono">{item.mobile || '+91 98765 43210'}</td>
                        <td className="p-3">{item.city || 'Delhi NCR'}</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            Verified
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
