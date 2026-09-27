import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingDown,
  TrendingUp,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import api from '../services/api';
import CrowdBadge from '../components/CrowdBadge';

const CrowdIndicatorPage = () => {
  const [crowdData, setCrowdData] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'low' | 'moderate' | 'high'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCrowdData();
  }, []);

  const fetchCrowdData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/crowd/status');
      if (res.data.success) {
        setCrowdData(res.data);
      }
    } catch (err) {
      console.error('Error fetching crowd data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading crowd radar data...</p>
      </div>
    );
  }

  const summary = crowdData?.summary || {
    total: 0,
    low: { count: 0, percentage: 0 },
    moderate: { count: 0, percentage: 0 },
    high: { count: 0, percentage: 0 },
  };

  const getFilteredPlaces = () => {
    if (!crowdData?.destinations) return [];
    if (activeTab === 'low') return crowdData.destinations.low || [];
    if (activeTab === 'moderate') return crowdData.destinations.moderate || [];
    if (activeTab === 'high') return crowdData.destinations.high || [];
    return [
      ...(crowdData.destinations.low || []),
      ...(crowdData.destinations.moderate || []),
      ...(crowdData.destinations.high || []),
    ];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="space-y-3 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Real-time Density Radar</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
          Crowd Safety Indicator
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Real-time footfall monitoring across major heritage sites, temples, markets, and beaches. Plan visits during green hours to enjoy peaceful experiences.
        </p>
      </div>

      {/* Aggregate Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Green - Low */}
        <div
          onClick={() => setActiveTab('low')}
          className={`cursor-pointer glass-card p-6 border-2 transition-all ${
            activeTab === 'low'
              ? 'border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
              : 'border-emerald-500/30 hover:border-emerald-500/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              <h3 className="font-bold text-sm text-emerald-300 uppercase">
                Low Crowd (Calm)
              </h3>
            </div>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-extrabold text-white">
              {summary.low.count}
            </span>
            <span className="text-xs text-slate-400 ml-2">
              ({summary.low.percentage}% of places)
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mt-2">
            Capacity &lt; 40%. Optimal peaceful sightseeing with minimal wait times.
          </p>
        </div>

        {/* Yellow - Moderate */}
        <div
          onClick={() => setActiveTab('moderate')}
          className={`cursor-pointer glass-card p-6 border-2 transition-all ${
            activeTab === 'moderate'
              ? 'border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.3)]'
              : 'border-amber-500/30 hover:border-amber-500/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
              <h3 className="font-bold text-sm text-amber-300 uppercase">
                Moderate Rush
              </h3>
            </div>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-extrabold text-white">
              {summary.moderate.count}
            </span>
            <span className="text-xs text-slate-400 ml-2">
              ({summary.moderate.percentage}% of places)
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mt-2">
            Capacity 40-75%. Standard queues (15-25 min) and active tourist footfall.
          </p>
        </div>

        {/* Red - High */}
        <div
          onClick={() => setActiveTab('high')}
          className={`cursor-pointer glass-card p-6 border-2 transition-all ${
            activeTab === 'high'
              ? 'border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.3)]'
              : 'border-rose-500/30 hover:border-rose-500/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
              <h3 className="font-bold text-sm text-rose-300 uppercase">
                Heavy Rush / Caution
              </h3>
            </div>
            <TrendingUp className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-extrabold text-white">
              {summary.high.count}
            </span>
            <span className="text-xs text-slate-400 ml-2">
              ({summary.high.percentage}% of places)
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mt-2">
            Capacity &gt; 75%. Peak tourist crush. Keep belongings secure and follow staff directions.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-2">
        {[
          { id: 'all', label: 'All Destinations' },
          { id: 'low', label: '🟢 Low Crowd' },
          { id: 'moderate', label: '🟡 Moderate Rush' },
          { id: 'high', label: '🔴 Heavy Rush' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
              activeTab === tab.id
                ? 'bg-amber-500 text-navy-950 border-amber-400 shadow-md'
                : 'bg-navy-900/60 text-slate-300 border-white/10 hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Destination Crowd Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredPlaces().map((place) => (
          <div
            key={place._id}
            className="glass-card p-5 space-y-4 hover:border-amber-500/40 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Image & Badge */}
              <div className="relative h-40 w-full rounded-xl overflow-hidden bg-navy-950">
                <img
                  src={place.images?.[0]}
                  alt={place.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5">
                  <CrowdBadge
                    level={place.crowdStatus}
                    percentage={place.crowdPercentage}
                    size="sm"
                  />
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>{place.city}, {place.state}</span>
                </span>
                <h3 className="text-base font-bold text-white mt-1 line-clamp-1">
                  {place.title}
                </h3>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Current Capacity:</span>
                  <span className="font-bold text-white font-mono">
                    {place.crowdPercentage}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-navy-950 overflow-hidden">
                  <div
                    className={`h-full ${
                      place.crowdStatus === 'low'
                        ? 'bg-emerald-500'
                        : place.crowdStatus === 'moderate'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${place.crowdPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <Link
              to={`/destinations/${place._id}`}
              className="glass-button-secondary w-full py-2 text-center text-xs font-semibold flex items-center justify-center gap-1 mt-3"
            >
              <span>View Safety & Travel Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>

      {/* Crowd Safety Advice Banner */}
      <div className="glass-card p-8 border-white/10 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" />
          <span>General Crowd Avoidance Guidelines</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-navy-950/60 border border-white/5 space-y-1.5">
            <h4 className="font-bold text-amber-300">Golden Morning Window</h4>
            <p className="text-[11px] leading-relaxed">
              Temples and heritage monuments typically experience lowest crowds between 06:00 AM and 09:00 AM.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-navy-950/60 border border-white/5 space-y-1.5">
            <h4 className="font-bold text-amber-300">Midday Slump</h4>
            <p className="text-[11px] leading-relaxed">
              Between 01:00 PM and 03:00 PM, outdoor monuments often have reduced footfall compared to evening twilight.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-navy-950/60 border border-white/5 space-y-1.5">
            <h4 className="font-bold text-amber-300">Peak Festival Alert</h4>
            <p className="text-[11px] leading-relaxed">
              Always check official government advisories for religious celebrations (Diwali, Holi, Dev Deepawali in Varanasi).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrowdIndicatorPage;
