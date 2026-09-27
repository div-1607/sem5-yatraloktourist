import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  Loader2,
  ExternalLink,
  ShieldAlert,
  Volume2,
  VolumeX,
  Navigation,
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

const AdminSOS = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Siren audio state
  const [sirenMuted, setLocalSirenMuted] = useState(false);

  // Resolution modal / inline form
  const [resolvingId, setResolvingId] = useState(null);
  const [newStatus, setNewStatus] = useState('responding');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSOS();

    const interval = setInterval(() => {
      fetchSOS(false);
    }, 4000);

    return () => {
      clearInterval(interval);
      stopEmergencySiren();
    };
  }, []);

  // Control siren audio based on pending requests
  useEffect(() => {
    const hasPending = requests.some((r) => r.status === 'pending');
    if (hasPending && !sirenMuted) {
      startEmergencySiren();
    } else {
      stopEmergencySiren();
    }
  }, [requests, sirenMuted]);

  const toggleSirenMute = () => {
    const nextMuted = !sirenMuted;
    setLocalSirenMuted(nextMuted);
    setSirenMuted(nextMuted);
    if (nextMuted) {
      toast('Siren audio silenced', { icon: '🔇' });
    } else {
      toast.success('Emergency siren audio activated', { icon: '🔊' });
    }
  };

  const fetchSOS = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.get('/sos/all');
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching SOS signals:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.patch(`/sos/${resolvingId}/status`, {
        status: newStatus,
        resolutionNotes: notes,
      });

      if (res.data.success) {
        toast.success(`SOS signal status set to ${newStatus.toUpperCase()}`);
        setRequests((prev) =>
          prev.map((r) => (r._id === resolvingId ? res.data.data : r))
        );
        setResolvingId(null);
        setNotes('');
      }
    } catch (err) {
      toast.error('Failed to update SOS status');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = requests.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        <Sidebar role="admin" />

        <div className="flex-1 space-y-6 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
                <ShieldAlert className="w-6 h-6 text-rose-500" />
                <span>Emergency SOS Command Terminal</span>
              </h1>
              <p className="text-xs text-slate-400">
                Live distress signals transmitted by travelers across India with verified GPS telemetry
              </p>
            </div>

            {/* Siren Mute / Unmute Button */}
            {pendingCount > 0 && (
              <button
                onClick={toggleSirenMute}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${
                  !sirenMuted
                    ? 'bg-rose-600 text-white border-rose-400 shadow-glow-red animate-bounce'
                    : 'bg-navy-900 text-slate-300 border-white/20'
                }`}
              >
                {!sirenMuted ? (
                  <>
                    <Volume2 className="w-4 h-4 text-white animate-pulse" />
                    <span>Siren Blaring (Silence)</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4 text-slate-400" />
                    <span>Siren Muted (Unmute)</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 text-xs">
            {[
              { id: 'all', label: `All Alerts (${requests.length})` },
              { id: 'pending', label: `🚨 Pending (${pendingCount})` },
              { id: 'responding', label: '⏱ Responders Dispatched' },
              { id: 'resolved', label: '✅ Resolved' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-full font-bold border transition-all ${
                  filter === tab.id
                    ? 'bg-amber-500 text-navy-950 border-amber-400 shadow-md'
                    : 'bg-navy-900/60 text-slate-300 border-white/10 hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* SOS List */}
          {loading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass-card p-12 text-center text-xs text-slate-400 space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-white font-bold">No active SOS alerts in this filter.</p>
              <p>All clear across destinations.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filtered.map((sos) => {
                const lat = sos.location?.lat || 28.6139;
                const lng = sos.location?.lng || 77.2090;
                const address = sos.location?.address || 'GPS Coordinates Broadcast';

                return (
                  <div
                    key={sos._id}
                    className={`glass-card p-6 border-2 transition-all space-y-4 ${
                      sos.status === 'pending'
                        ? 'border-rose-500 shadow-glow-red bg-rose-950/20'
                        : sos.status === 'responding'
                        ? 'border-amber-500/40 bg-amber-950/15'
                        : 'border-white/10'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-xl text-white ${
                            sos.status === 'pending'
                              ? 'bg-rose-600 animate-pulse'
                              : sos.status === 'responding'
                              ? 'bg-amber-600'
                              : 'bg-emerald-600'
                          }`}
                        >
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-extrabold text-white">
                              {sos.userName}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              {sos.emergencyType || 'SOS Alert'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            Distress Signal ID: #{sos._id.slice(-8).toUpperCase()} &bull;{' '}
                            {new Date(sos.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                            sos.status === 'pending'
                              ? 'bg-rose-500 text-white animate-pulse'
                              : sos.status === 'responding'
                              ? 'bg-amber-500 text-navy-950'
                              : 'bg-emerald-500 text-navy-950'
                          }`}
                        >
                          {sos.status}
                        </span>
                      </div>
                    </div>

                    {/* Caller & Location Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Contact Mobile</span>
                        <a
                          href={`tel:${sos.userMobile}`}
                          className="text-amber-400 hover:text-amber-300 font-mono font-bold flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{sos.userMobile}</span>
                        </a>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">Email</span>
                        <span className="text-slate-200">{sos.userEmail || 'Tourist broadcast'}</span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">GPS Coordinates</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-slate-200 font-mono text-[11px] font-bold">
                            {lat?.toFixed(5)}, {lng?.toFixed(5)}
                          </span>
                          <a
                            href={`https://www.google.com/maps?q=${lat},${lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-400 hover:text-amber-300"
                            title="Open in Maps"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Embedded Location Map */}
                    <div className="rounded-xl overflow-hidden border border-white/10">
                      <MapView
                        lat={lat}
                        lng={lng}
                        title={`🚨 ${sos.userName}`}
                        address={address}
                        zoom={15}
                        className="h-48 w-full"
                      />
                    </div>

                    {/* Situation message */}
                    <div className="p-3 rounded-xl bg-navy-950/70 text-xs text-slate-300">
                      <span className="text-slate-400 font-semibold block text-[11px]">
                        Message / Status:
                      </span>
                      <p className="mt-0.5">{sos.message || 'Distress signal active.'}</p>
                    </div>

                    {sos.resolutionNotes && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200">
                        <span className="font-bold block text-[11px]">Resolution Log:</span>
                        <p className="mt-0.5">{sos.resolutionNotes}</p>
                      </div>
                    )}

                    {/* Action trigger */}
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          setResolvingId(sos._id);
                          setNewStatus(sos.status === 'pending' ? 'responding' : 'resolved');
                        }}
                        className="glass-button-primary text-xs uppercase tracking-wider py-2 px-4"
                      >
                        Update Signal Status &rarr;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RESOLUTION MODAL */}
      {resolvingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-navy-900 border border-white/20 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Update SOS Status</h3>
            <form onSubmit={handleUpdateStatus} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Select Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="glass-input w-full text-xs"
                >
                  <option value="pending" className="bg-navy-950 text-white">Pending</option>
                  <option value="responding" className="bg-navy-950 text-white">Responding / Help Dispatched</option>
                  <option value="resolved" className="bg-navy-950 text-white">Resolved / Case Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Resolution Notes / Action Taken</label>
                <textarea
                  rows="3"
                  placeholder="E.g. Local tourist police dispatched to North Gate. Tourist escorted to first aid booth."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="glass-input w-full text-xs resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingId(null)}
                  className="glass-button-secondary w-1/2 py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="glass-button-primary w-1/2 py-2.5"
                >
                  {submitting ? 'Saving...' : 'Save Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSOS;
