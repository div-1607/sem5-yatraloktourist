import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  MapPin,
  Users,
  AlertTriangle,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Plus,
  Loader2,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import CrowdBadge from '../components/CrowdBadge';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/analytics');
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading administrative analytics...</p>
      </div>
    );
  }

  const {
    totalDestinations = 0,
    totalUsers = 0,
    totalReviews = 0,
    activeSOS = 0,
    crowdDistribution = { low: 0, moderate: 0, high: 0 },
    recentSOS = [],
    recentReviews = [],
  } = analytics || {};

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
                Oversee destinations, live crowd levels, user profiles, and emergency distress signals.
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

          {/* ACTIVE SOS ALERT BANNER */}
          {activeSOS > 0 && (
            <div className="p-4 rounded-2xl bg-rose-600/20 border-2 border-rose-500 text-rose-200 flex items-center justify-between gap-4 shadow-glow-red animate-pulse">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-sm text-white">
                    {activeSOS} PENDING EMERGENCY SOS DISTRESS SIGNAL(S)
                  </h4>
                  <p className="text-xs text-rose-200">
                    Immediate review and dispatch coordination required.
                  </p>
                </div>
              </div>
              <Link
                to="/admin/sos"
                className="glass-button-sos text-xs uppercase tracking-wider py-2 px-4 shrink-0"
              >
                View SOS Feed
              </Link>
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
              <p className="text-[11px] text-slate-400">Verified user accounts</p>
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

          {/* Recent SOS Distress Feed */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Recent SOS Signals</span>
              </h3>
              <Link
                to="/admin/sos"
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                View All SOS ({activeSOS} active) &rarr;
              </Link>
            </div>

            {recentSOS.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No emergency distress signals logged recently.
              </p>
            ) : (
              <div className="space-y-3">
                {recentSOS.map((sos) => (
                  <div
                    key={sos._id}
                    className="p-3.5 rounded-xl bg-navy-950/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-semibold text-white">
                        <span>{sos.userName}</span>
                        <span className="text-slate-400">&bull;</span>
                        <span className="text-amber-400 font-mono">{sos.userMobile}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          {sos.emergencyType}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] mt-1">
                        {sos.location?.address} &bull; Lat: {sos.location?.lat}, Lng: {sos.location?.lng}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                          sos.status === 'pending'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : sos.status === 'responding'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {sos.status}
                      </span>
                      <Link
                        to="/admin/sos"
                        className="text-amber-400 hover:text-amber-300 font-semibold"
                      >
                        Resolve &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
