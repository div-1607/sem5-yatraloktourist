import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Shield,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Sparkles,
  Info,
  ChevronRight,
  Flame,
} from 'lucide-react';
import toast from 'react-hot-toast';
import mlApi from '../services/mlApi';
import api from '../services/api';

export default function CrowdSafetyForecastPage() {
  const [destinations, setDestinations] = useState([]);
  const [selectedDestId, setSelectedDestId] = useState('');
  const [selectedDest, setSelectedDest] = useState(null);
  const [loading, setLoading] = useState(false);

  // Prediction Outputs
  const [prediction, setPrediction] = useState(null);
  const [safetyData, setSafetyData] = useState(null);
  const [safetyHeatmap, setSafetyHeatmap] = useState([]);
  const [viewHeatmap, setViewHeatmap] = useState(false);

  // Custom Simulator Controls
  const [hour, setHour] = useState(new Date().getHours());
  const [isWeekend, setIsWeekend] = useState(false);
  const [isFestival, setIsFestival] = useState(false);

  // Fetch all destinations on mount
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await api.get('/destinations?limit=60');
        const list = res.data?.destinations || res.data?.data || [];
        if (res.data) {
          setDestinations(list);
          if (list.length > 0) {
            setSelectedDestId(list[0]._id);
            setSelectedDest(list[0]);
          }
        }
      } catch (err) {
        toast.error('Failed to load destinations');
      }
    };
    fetchDestinations();
  }, []);

  // Fetch predictions whenever destination or simulator controls change
  useEffect(() => {
    if (!selectedDestId) return;

    const runPredictions = async () => {
      try {
        setLoading(true);
        // 1. Crowd Prediction
        const crowdRes = await mlApi.predictDestinationCrowd(selectedDestId, {
          hour,
          isWeekend,
          isFestival,
        });
        if (crowdRes.data && crowdRes.data.data) {
          setPrediction(crowdRes.data.data);
        }

        // 2. Safety Prediction
        const currentCrowd = crowdRes.data?.data?.predictedCrowdLevel || 'MEDIUM';
        const safetyRes = await mlApi.getSafetyScore({
          destinationId: selectedDestId,
          crowdLevel: currentCrowd,
          localIncidents: 0,
          hour,
        });
        if (safetyRes.data && safetyRes.data.data) {
          setSafetyData(safetyRes.data.data);
        }
      } catch (err) {
        toast.error('Failed to run ML prediction pipeline');
      } finally {
        setLoading(false);
      }
    };

    runPredictions();
  }, [selectedDestId, hour, isWeekend, isFestival]);

  // Load Safety Heatmap
  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const res = await mlApi.getSafetyHeatmap();
        if (res.data && res.data.data) {
          setSafetyHeatmap(res.data.data);
        }
      } catch (err) {
        // Silent catch
      }
    };
    fetchHeatmap();
  }, []);

  const handleDestinationChange = (id) => {
    setSelectedDestId(id);
    const dest = destinations.find((d) => d._id === id);
    setSelectedDest(dest || null);
  };

  const getStatusColorBadge = (color) => {
    if (color === 'Green') {
      return {
        bg: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40 shadow-glow-safe',
        dot: 'bg-emerald-500 shadow-[0_0_10px_#10B981]',
        text: 'Safe • Low Crowd (Green Status)',
      };
    }
    if (color === 'Red') {
      return {
        bg: 'bg-red-950/70 text-red-400 border-red-500/50 shadow-glow-danger',
        dot: 'bg-red-500 animate-ping shadow-[0_0_12px_#EF4444]',
        text: 'Critical • High Congestion (Red Alert)',
      };
    }
    return {
      bg: 'bg-amber-950/60 text-amber-400 border-amber-500/40 shadow-glow-warning',
      dot: 'bg-amber-500 shadow-[0_0_10px_#F59E0B]',
      text: 'Warning • Moderate Crowd (Yellow Status)',
    };
  };

  const getSafetyTierBadge = (tier) => {
    if (tier === 'OPTIMAL') return 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40 shadow-glow-safe';
    if (tier === 'HAZARDOUS') return 'bg-red-950/70 text-red-400 border-red-500/50 shadow-glow-danger';
    return 'bg-amber-950/60 text-amber-400 border-amber-500/40 shadow-glow-warning';
  };

  return (
    <div className="light-theme-page min-h-screen pt-20 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-navy-900 via-blue-royal/40 to-navy-950 border border-blue-electric/30 backdrop-blur-2xl shadow-glass-panel relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-electric/15 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-royal/40 border border-blue-electric/30 text-blue-neon text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-electric animate-spin" />
              Machine Learning Predictive Analytics
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Crowd Forecaster & Tourist Safety Monitor
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Random Forest crowd classifiers & Gradient Boosting safety models analyzing historical footfall, seasons, festival calendars, and time factors.
            </p>
          </div>

          {/* Destination Selector Dropdown */}
          <div className="w-full md:w-72 relative z-10">
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Select Destination
            </label>
            <select
              value={selectedDestId}
              onChange={(e) => handleDestinationChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-navy-950/90 border border-blue-electric/30 text-white text-xs focus:ring-2 focus:ring-blue-electric focus:outline-none shadow-glass"
            >
              {destinations.map((d) => (
                <option key={d._id} value={d._id} className="bg-black-midnight text-white">
                  {d.title} ({d.city})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Simulation Controls & 24h Forecast (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Controls Bar */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl">
            <h3 className="font-bold text-sm text-slate-200 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              Predictive Simulation Parameters
            </h3>

            <div className="space-y-4">
              {/* Hour Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-300">Simulate Time of Day</span>
                  <span className="text-blue-400">{hour.toString().padStart(2, '0')}:00 hrs</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={hour}
                  onChange={(e) => setHour(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isWeekend}
                    onChange={(e) => setIsWeekend(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
                  />
                  Weekend Rush Factor (+22%)
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFestival}
                    onChange={(e) => setIsFestival(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
                  />
                  Cultural Festival Surge (+35%)
                </label>
              </div>
            </div>
          </div>

          {/* 24-Hour Crowd Hourly Forecast Timeline */}
          {prediction && (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    24-Hour Hourly Footfall Forecast
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Recommended Visit Window:{' '}
                    <span className="text-emerald-400 font-bold">{prediction.recommendedVisitWindow}</span>
                  </p>
                </div>
              </div>

              {/* Hourly Bar Timeline */}
              <div className="grid grid-cols-12 sm:grid-cols-24 gap-1 pt-6 pb-2 items-end h-40">
                {prediction.hourlyForecast &&
                  prediction.hourlyForecast.map((slot) => {
                    const isCurrent = slot.hour === hour;
                    const heightPercent = `${Math.max(15, slot.crowdScore)}%`;
                    const barColor =
                      slot.statusColor === 'Green'
                        ? 'bg-emerald-500'
                        : slot.statusColor === 'Red'
                        ? 'bg-red-500'
                        : 'bg-amber-500';

                    return (
                      <div
                        key={slot.hour}
                        className="flex flex-col items-center justify-end h-full group relative cursor-pointer"
                        onClick={() => setHour(slot.hour)}
                      >
                        {/* Tooltip on Hover */}
                        <div className="hidden group-hover:block absolute -top-12 z-20 px-2 py-1 rounded bg-slate-900 border border-white/20 text-[10px] text-slate-100 whitespace-nowrap shadow-xl">
                          {slot.hour}:00 hrs: {slot.predictedCrowdLevel} ({slot.crowdScore}%)
                        </div>

                        <div
                          style={{ height: heightPercent }}
                          className={`w-full rounded-t transition-all ${barColor} ${
                            isCurrent ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-70 group-hover:opacity-100'
                          }`}
                        ></div>
                        <span className="text-[9px] text-slate-500 mt-1">{slot.hour}h</span>
                      </div>
                    );
                  })}
              </div>

              {/* Status Color Legend */}
              <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-white/5 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-300">Green (Low Crowd)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-slate-300">Yellow (Medium Crowd)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span className="text-slate-300">Red (High Crowd)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Prediction Gauges & Safety Score (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Output Status Card */}
          {prediction && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl text-center"
            >
              <div className="flex justify-between items-center mb-3 text-xs text-slate-400">
                <span>Model Confidence</span>
                <span className="font-bold text-blue-400">
                  {Math.round((prediction.confidenceScore || 0.88) * 100)}%
                </span>
              </div>

              {/* Main Badge */}
              {(() => {
                const badge = getStatusColorBadge(prediction.statusColor);
                return (
                  <div className={`p-4 rounded-xl border ${badge.bg} inline-flex items-center gap-3 my-2 shadow-lg`}>
                    <span className={`w-3.5 h-3.5 rounded-full ${badge.dot}`}></span>
                    <span className="text-base font-black tracking-wide">{badge.text}</span>
                  </div>
                );
              })()}

              <p className="text-xs text-slate-400 mt-2">
                Simulated for <strong>{prediction.destinationTitle}</strong> at <strong>{hour}:00 hrs</strong>
              </p>
            </motion.div>
          )}

          {/* Safety Prediction Score Card */}
          {safetyData && (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Tourist Safety Index
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getSafetyTierBadge(
                    safetyData.safetyTier
                  )}`}
                >
                  {safetyData.safetyTier}
                </span>
              </div>

              {/* Score Number Gauge */}
              <div className="flex items-center justify-center py-4">
                <div className="relative flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full border-4 border-emerald-500/20 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-emerald-400">{safetyData.safetyScore}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Score / 100</span>
                  </div>
                </div>
              </div>

              {/* Metric Breakdown Progress Bars */}
              <div className="space-y-3 mt-2 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Crowd Safety Factor</span>
                    <span className="font-semibold text-emerald-400">
                      {safetyData.metricsBreakdown?.crowdSafetyScore || 90}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${safetyData.metricsBreakdown?.crowdSafetyScore || 90}%` }}
                      className="h-full bg-emerald-500 rounded-full"
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Time & Lighting Factor</span>
                    <span className="font-semibold text-blue-400">
                      {safetyData.metricsBreakdown?.timeLightingScore || 85}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${safetyData.metricsBreakdown?.timeLightingScore || 85}%` }}
                      className="h-full bg-blue-500 rounded-full"
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Police & Medical Proximity</span>
                    <span className="font-semibold text-indigo-400">
                      {safetyData.metricsBreakdown?.policeEmergencyAccessScore || 84}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${safetyData.metricsBreakdown?.policeEmergencyAccessScore || 84}%` }}
                      className="h-full bg-indigo-500 rounded-full"
                    ></div>
                  </div>
                </div>
              </div>

              {/* Safety Advisories List */}
              {safetyData.recommendations && safetyData.recommendations.length > 0 && (
                <div className="mt-5 pt-4 border-t border-white/5 space-y-1.5">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Live Safety Advisories:</p>
                  {safetyData.recommendations.map((adv, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{adv}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
