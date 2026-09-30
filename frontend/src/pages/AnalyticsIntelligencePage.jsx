import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  ShieldCheck,
  MapPin,
  AlertTriangle,
  Radio,
  PieChart,
  Activity,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import analyticsApi from '../services/analyticsApi';

export default function AnalyticsIntelligencePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await analyticsApi.getOverview();
        if (res.data && res.data.data) {
          setData(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load analytics overview');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="light-theme-page min-h-screen flex flex-col items-center justify-center text-slate-600">
        <div className="w-12 h-12 border-4 border-blue-electric border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold tracking-wider text-slate-300">
          Aggregating Platform Intelligence & Geofence Telemetry...
        </p>
      </div>
    );
  }

  if (!data) return null;

  const { kpis, mostVisitedDestinations, touristTrends, crowdDistribution, safetyOverview, geofenceActivity } = data;

  return (
    <div className="light-theme-page min-h-screen pt-20 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-navy-900 via-blue-royal/40 to-navy-950 border border-blue-electric/30 backdrop-blur-2xl shadow-glass-panel relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-electric/15 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-royal/40 border border-blue-electric/30 text-blue-neon text-[11px] font-bold uppercase tracking-wider mb-2">
              <Activity className="w-3.5 h-3.5 text-blue-electric animate-pulse" />
              <span>Live Tourism Intelligence Network</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Platform Analytics & Spatial Trends
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Live tourist footfall telemetry, ML predicted crowd distributions, regional safety indices, and real-time geofence audit logs.
            </p>
          </div>
          <span className="text-xs px-3.5 py-2 rounded-xl bg-navy-950/80 border border-blue-electric/30 text-blue-neon font-mono shadow-glow-electric relative z-10">
            Live Stream Connected
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="glass-card p-6 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Active Tourists Live</span>
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <p className="text-3xl font-black text-white font-mono mt-2">{kpis.activeTouristsLive}</p>
            <p className="text-xs text-emerald-400 font-semibold mt-1">↑ Active GPS Telemetry Pings</p>
          </div>

          <div className="glass-card p-6 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Active Geofences</span>
              <MapPin className="w-4 h-4 text-blue-electric" />
            </div>
            <p className="text-3xl font-black text-white font-mono mt-2">{kpis.activeGeofencesCount}</p>
            <p className="text-xs text-blue-neon font-semibold mt-1">Monitored Heritage & Hazards</p>
          </div>

          <div className="glass-card p-6 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Safety Compliance</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-white font-mono mt-2">{kpis.safetyComplianceRate}</p>
            <p className="text-xs text-emerald-400 font-semibold mt-1">Zero Security Breaches</p>
          </div>

          <div className="glass-card p-6 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>SOS Alerts Resolved</span>
              <CheckCircle2 className="w-4 h-4 text-blue-neon" />
            </div>
            <p className="text-3xl font-black text-white font-mono mt-2">
              {kpis.resolvedSosAlerts} / {kpis.activeSosAlerts + kpis.resolvedSosAlerts}
            </p>
            <p className="text-xs text-blue-neon font-semibold mt-1">Average Response &lt; 3 mins</p>
          </div>
        </div>

        {/* Second Row: Tourist Footfall Trends & Predicted Crowd Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Tourist Trends (7 cols) */}
          <div className="lg:col-span-7 glass-card p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-neon" />
                <span>Tourist Footfall Volume (Past 6 Months)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Domestic vs International Visitor Volumes</p>
            </div>

            {/* Visual Bar Graph */}
            <div className="space-y-4">
              {touristTrends.map((trend) => {
                const maxTotal = 120000;
                const domesticWidth = `${(trend.domesticTourists / maxTotal) * 100}%`;
                const intlWidth = `${(trend.internationalTourists / maxTotal) * 100}%`;

                return (
                  <div key={trend.month} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-300">{trend.month}</span>
                      <span className="font-bold text-blue-neon font-mono">
                        {trend.total.toLocaleString()} visitors
                      </span>
                    </div>
                    <div className="w-full h-3 bg-navy-950 rounded-full overflow-hidden flex border border-blue-electric/20 p-0.5">
                      <div
                        style={{ width: domesticWidth }}
                        className="h-full bg-gradient-to-r from-blue-royal to-blue-electric rounded-l-full"
                      />
                      <div
                        style={{ width: intlWidth }}
                        className="h-full bg-blue-neon rounded-r-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-6 pt-4 border-t border-white/10 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-blue-electric shadow-glow-electric" />
                <span>Domestic Travelers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-blue-neon" />
                <span>International Travelers</span>
              </div>
            </div>
          </div>

          {/* Predicted Crowd Distribution (5 cols) */}
          <div className="lg:col-span-5 glass-card p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2 mb-1">
                <PieChart className="w-5 h-5 text-amber-400" />
                <span>Crowd Safety Level Distribution</span>
              </h3>
              <p className="text-xs text-slate-400 mb-6">Strict Safe, Warning, Danger classification</p>

              <div className="space-y-3">
                {/* Low Crowd (Safe Green) */}
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 shadow-glow-safe">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-bold text-emerald-400 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
                      Safe Status (Green)
                    </span>
                    <span className="font-bold text-emerald-300 font-mono">
                      {crowdDistribution.lowCrowdGreen.percentage}% ({crowdDistribution.lowCrowdGreen.count} spots)
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-200/80">{crowdDistribution.lowCrowdGreen.status}</p>
                </div>

                {/* Medium Crowd (Warning Yellow) */}
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 shadow-glow-warning">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-bold text-amber-400 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#F59E0B]" />
                      Warning Status (Yellow)
                    </span>
                    <span className="font-bold text-amber-300 font-mono">
                      {crowdDistribution.mediumCrowdYellow.percentage}% ({crowdDistribution.mediumCrowdYellow.count} spots)
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-200/80">{crowdDistribution.mediumCrowdYellow.status}</p>
                </div>

                {/* High Crowd (Danger Red) */}
                <div className="p-4 rounded-2xl bg-red-950/50 border border-red-500/50 shadow-glow-danger">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-bold text-red-400 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#EF4444] animate-pulse" />
                      Critical Congestion (Red)
                    </span>
                    <span className="font-bold text-red-300 font-mono">
                      {crowdDistribution.highCrowdRed.percentage}% ({crowdDistribution.highCrowdRed.count} spots)
                    </span>
                  </div>
                  <p className="text-[11px] text-red-200/80">{crowdDistribution.highCrowdRed.status}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 text-[11px] text-slate-400 text-center font-mono">
              Random Forest Classifier Telemetry
            </div>
          </div>
        </div>

        {/* Third Row: Most Visited Destinations & Geofence Activity Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Most Visited Destinations (7 cols) */}
          <div className="lg:col-span-7 glass-card p-6 sm:p-8 space-y-4">
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-neon" />
              <span>Highest Footfall Tourism Hubs</span>
            </h3>

            <div className="divide-y divide-white/5">
              {mostVisitedDestinations.map((dest, idx) => (
                <div key={dest.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-xs font-mono font-bold text-slate-400">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-white">{dest.name}</h4>
                      <p className="text-xs text-slate-400">{dest.city}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm text-blue-neon font-mono">
                      {dest.monthlyVisitors.toLocaleString()}
                    </span>
                    <p className="text-[11px] text-slate-400">visitors / mo</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-Time Geofence Activity Stream (5 cols) */}
          <div className="lg:col-span-5 glass-card p-6 sm:p-8 space-y-4">
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-blue-electric animate-pulse" />
              <span>Live Geofence Boundary Activity</span>
            </h3>

            <div className="space-y-3">
              {geofenceActivity.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-navy-950/60 border border-blue-electric/20 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          act.action === 'ENTRY' ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                      />
                      <span className="font-bold text-white">{act.zone}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Tourist ID: <span className="font-mono text-slate-300">{act.tourist}</span>
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
