import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Plus,
  Trash2,
  Edit3,
  Shield,
  AlertTriangle,
  Radio,
  CheckCircle,
  Eye,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import geofenceApi from '../services/geofenceApi';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function AdminGeofenceManager() {
  const [geofences, setGeofences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'attraction',
    latitude: '',
    longitude: '',
    radiusMeters: 500,
    alertLevel: 'info',
    entryNotificationMessage: '',
    exitNotificationMessage: '',
    highRiskAdvisory: '',
    maxCapacity: 500,
  });

  const fetchGeofences = async () => {
    try {
      setLoading(true);
      const res = await geofenceApi.adminGetGeofences();
      if (res.data && res.data.data) {
        setGeofences(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load geofences');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeofences();
  }, []);

  const handleCreateGeofence = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.latitude || !formData.longitude) {
      toast.error('Name, Latitude, and Longitude are required');
      return;
    }

    try {
      await geofenceApi.adminCreateGeofence(formData);
      toast.success('Geofence created successfully!');
      setIsModalOpen(false);
      setFormData({
        name: '',
        description: '',
        category: 'attraction',
        latitude: '',
        longitude: '',
        radiusMeters: 500,
        alertLevel: 'info',
        entryNotificationMessage: '',
        exitNotificationMessage: '',
        highRiskAdvisory: '',
        maxCapacity: 500,
      });
      fetchGeofences();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create geofence');
    }
  };

  const handleDeleteGeofence = async (id) => {
    if (!window.confirm('Are you sure you want to delete this geofence?')) return;
    try {
      await geofenceApi.adminDeleteGeofence(id);
      toast.success('Geofence deleted');
      fetchGeofences();
    } catch (err) {
      toast.error('Failed to delete geofence');
    }
  };

  const filtered = geofences.filter(
    (g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="light-theme-page w-full px-4 sm:px-6 xl:px-10 py-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <Sidebar role="admin" />
        <main className="flex-1 min-w-0 w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
            <Radio className="w-3.5 h-3.5" /> Admin Control Tower
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Geofence & High-Risk Zone Manager
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Configure spatial boundaries, entry/exit alert triggers, and tourist containment zones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/geofencing"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-white/10 transition"
          >
            <Eye className="w-4 h-4" /> Live Map View
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition"
          >
            <Plus className="w-4 h-4" /> New Geofence
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search geofences by title or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none w-full"
        />
      </div>

      {/* Geofences Table */}
      <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 uppercase text-slate-400 font-semibold border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Zone Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Coordinates (Lng, Lat)</th>
                <th className="py-3.5 px-4">Radius</th>
                <th className="py-3.5 px-4">Active Footfall</th>
                <th className="py-3.5 px-4">Alert Level</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-500">
                    Loading registered geofences...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-500">
                    No geofences found. Click "New Geofence" to create one.
                  </td>
                </tr>
              ) : (
                filtered.map((fence) => {
                  const [lon, lat] = fence.center.coordinates;
                  return (
                    <tr key={fence._id} className="hover:bg-white/5 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-100">{fence.name}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            fence.category === 'high-risk' || fence.category === 'restricted'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : fence.category === 'safe-zone'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {fence.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {lon.toFixed(4)}, {lat.toFixed(4)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">{fence.radiusMeters} m</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-emerald-400">{fence.activeTouristsCount || 0}</span>
                        <span className="text-slate-500"> / {fence.maxCapacity}</span>
                      </td>
                      <td className="py-3.5 px-4 uppercase text-[10px] font-bold text-slate-400">
                        {fence.alertLevel}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteGeofence(fence._id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                          title="Delete Geofence"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Geofence */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                Create New Geofence Perimeter
              </h3>

              <form onSubmit={handleCreateGeofence} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Zone Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Qutub Minar Safe Buffer"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
                    >
                      <option value="attraction">Attraction</option>
                      <option value="safe-zone">Safe Zone</option>
                      <option value="high-risk">High-Risk Hazard</option>
                      <option value="restricted">Restricted Area</option>
                      <option value="transit-hub">Transit Hub</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Alert Level</label>
                    <select
                      value={formData.alertLevel}
                      onChange={(e) => setFormData({ ...formData, alertLevel: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
                    >
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="danger">Danger</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="28.5245"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="77.1855"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Radius (m)</label>
                    <input
                      type="number"
                      min="20"
                      max="50000"
                      value={formData.radiusMeters}
                      onChange={(e) => setFormData({ ...formData, radiusMeters: parseInt(e.target.value, 10) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Entry Notification Message</label>
                  <input
                    type="text"
                    value={formData.entryNotificationMessage}
                    onChange={(e) => setFormData({ ...formData, entryNotificationMessage: e.target.value })}
                    placeholder="Welcome to this zone..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none"
                  />
                </div>

                {formData.category === 'high-risk' && (
                  <div>
                    <label className="block font-semibold text-red-300 mb-1">High-Risk Hazard Advisory</label>
                    <textarea
                      rows={2}
                      value={formData.highRiskAdvisory}
                      onChange={(e) => setFormData({ ...formData, highRiskAdvisory: e.target.value })}
                      placeholder="Warning details for tourists..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-red-500/40 text-slate-200 focus:outline-none"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 transition"
                  >
                    Save Geofence
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
