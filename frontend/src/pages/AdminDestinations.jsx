import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  MapPin,
  Star,
  Users,
  X,
  Loader2,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import CrowdBadge from '../components/CrowdBadge';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Tourist Places',
  'Temples',
  'Historical Places',
  'Shopping Areas',
  'Old Towns',
  'Beaches',
  'Airports',
  'Cafes & Restaurants',
];

const AdminDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const initialFormState = {
    title: '',
    country: 'India',
    state: '',
    city: '',
    category: 'Tourist Places',
    description: '',
    shortDescription: '',
    imageUrls: '',
    lat: '',
    lng: '',
    address: '',
    crowdStatus: 'low',
    crowdPercentage: 25,
    entryFee: 'Free',
    timings: '09:00 AM - 06:00 PM',
    bestTimeToVisit: 'October to March',
    emergencyHelpline: '112 / 1363',
    isPopular: false,
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchDestinations();
  }, [search]);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/destinations?search=${encodeURIComponent(search)}&limit=50`);
      if (res.data.success) {
        setDestinations(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching destinations:', err);
      toast.error('Failed to load destinations');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedId(null);
    setFormData(initialFormState);
    setModalOpen(true);
  };

  const openEditModal = (dest) => {
    setIsEditMode(true);
    setSelectedId(dest._id);
    setFormData({
      title: dest.title,
      country: dest.country || 'India',
      state: dest.state,
      city: dest.city,
      category: dest.category,
      description: dest.description,
      shortDescription: dest.shortDescription || '',
      imageUrls: (dest.images || []).join(', '),
      lat: dest.location?.lat || '',
      lng: dest.location?.lng || '',
      address: dest.location?.address || '',
      crowdStatus: dest.crowdStatus || 'low',
      crowdPercentage: dest.crowdPercentage || 25,
      entryFee: dest.entryFee || 'Free',
      timings: dest.timings || '09:00 AM - 06:00 PM',
      bestTimeToVisit: dest.bestTimeToVisit || 'October to March',
      emergencyHelpline: dest.emergencyHelpline || '112 / 1363',
      isPopular: Boolean(dest.isPopular),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const imagesArray = formData.imageUrls
      .split(',')
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    const payload = {
      title: formData.title,
      country: formData.country,
      state: formData.state,
      city: formData.city,
      category: formData.category,
      description: formData.description,
      shortDescription: formData.shortDescription,
      images: imagesArray.length > 0 ? imagesArray : ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'],
      location: {
        lat: Number(formData.lat) || 28.6139,
        lng: Number(formData.lng) || 77.209,
        address: formData.address,
      },
      crowdStatus: formData.crowdStatus,
      crowdPercentage: Number(formData.crowdPercentage),
      entryFee: formData.entryFee,
      timings: formData.timings,
      bestTimeToVisit: formData.bestTimeToVisit,
      emergencyHelpline: formData.emergencyHelpline,
      isPopular: formData.isPopular,
    };

    try {
      if (isEditMode) {
        const res = await api.put(`/admin/destinations/${selectedId}`, payload);
        if (res.data.success) {
          toast.success('Destination updated successfully');
          setModalOpen(false);
          fetchDestinations();
        }
      } else {
        const res = await api.post('/admin/destinations', payload);
        if (res.data.success) {
          toast.success('Destination created successfully');
          setModalOpen(false);
          fetchDestinations();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to remove "${title}"?`)) return;

    try {
      const res = await api.delete(`/admin/destinations/${id}`);
      if (res.data.success) {
        toast.success('Destination removed');
        setDestinations((prev) => prev.filter((d) => d._id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete destination');
    }
  };

  // Direct In-Place Crowd Update from Table
  const handleQuickCrowdChange = async (destId, newLevel) => {
    try {
      const percentage = newLevel === 'low' ? 25 : newLevel === 'moderate' ? 60 : 90;
      const res = await api.put(`/crowd/${destId}`, {
        level: newLevel,
        percentage,
        notes: `Quick updated by admin to ${newLevel}`,
      });

      if (res.data.success) {
        toast.success(`Crowd status set to ${newLevel.toUpperCase()}`);
        setDestinations((prev) =>
          prev.map((d) =>
            d._id === destId
              ? { ...d, crowdStatus: newLevel, crowdPercentage: percentage }
              : d
          )
        );
      }
    } catch (err) {
      toast.error('Could not update crowd status');
    }
  };

  return (
    <div className="light-theme-page w-full px-4 sm:px-6 xl:px-10 py-8">
      <div className="flex gap-8">
        <Sidebar role="admin" />

        <div className="flex-1 space-y-6 min-w-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white">
                Destination Registry Management
              </h1>
              <p className="text-xs text-slate-400">
                Add, modify, remove destinations and override real-time crowd safety levels
              </p>
            </div>

            <button
              onClick={openAddModal}
              className="glass-button-primary text-xs uppercase tracking-wider py-2.5 px-4 flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Destination</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="glass-card p-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, state, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="glass-input w-full pl-10 text-xs"
              />
            </div>
          </div>

          {/* Destinations Table */}
          <div className="glass-card overflow-hidden p-0">
            {loading ? (
              <div className="py-16 flex justify-center">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              </div>
            ) : destinations.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No destinations registered. Click "Add New Destination" to create one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-navy-950/80 text-[11px] uppercase font-bold text-slate-400 border-b border-white/10">
                    <tr>
                      <th className="p-4">Destination</th>
                      <th className="p-4">Hierarchy (State &bull; City)</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Crowd Density Status</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {destinations.map((dest) => (
                      <tr key={dest._id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={dest.images?.[0]}
                              alt={dest.title}
                              className="w-10 h-10 rounded-lg object-cover bg-navy-950 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-white text-xs">{dest.title}</p>
                              <span className="text-[10px] text-slate-400 font-mono">
                                #{dest.slug}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="font-medium text-slate-200">
                            {dest.state} &bull; {dest.city}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {dest.category}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="space-y-1">
                            <CrowdBadge
                              level={dest.crowdStatus}
                              percentage={dest.crowdPercentage}
                              size="sm"
                            />
                            {/* In-place status selector */}
                            <select
                              value={dest.crowdStatus}
                              onChange={(e) =>
                                handleQuickCrowdChange(dest._id, e.target.value)
                              }
                              className="block text-[10px] bg-navy-950 border border-white/10 rounded px-1.5 py-0.5 text-slate-300 mt-1"
                            >
                              <option value="low">Set Low</option>
                              <option value="moderate">Set Moderate</option>
                              <option value="high">Set High</option>
                            </select>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-1 text-amber-400 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{dest.rating?.toFixed(1)}</span>
                          </div>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(dest)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-amber-400 transition-colors"
                              title="Edit destination"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(dest._id, dest.title)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                              title="Delete destination"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ADD / EDIT DESTINATION MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-navy-900 border border-white/20 rounded-2xl p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">
                {isEditMode ? 'Edit Destination' : 'Add New Tourism Destination'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amber Palace"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="glass-input w-full text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="glass-input w-full text-xs"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-navy-950 text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hierarchy State & City */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Country</label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="glass-input w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">State *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajasthan"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="glass-input w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jaipur"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="glass-input w-full text-xs"
                  />
                </div>
              </div>

              {/* Image URLs */}
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Photo URLs (Comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://images.unsplash.com/..., https://..."
                  value={formData.imageUrls}
                  onChange={(e) => setFormData({ ...formData, imageUrls: e.target.value })}
                  className="glass-input w-full text-xs"
                />
              </div>

              {/* Coordinates & Physical Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Latitude *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="26.9855"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                    className="glass-input w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Longitude *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="75.8513"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                    className="glass-input w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Address Landmark *</label>
                  <input
                    type="text"
                    required
                    placeholder="Devisinghpura, Amer, Jaipur"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="glass-input w-full text-xs"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Short Summary</label>
                <input
                  type="text"
                  placeholder="One sentence teaser for destination card"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="glass-input w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Full Description *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Detailed history, cultural background, and attractions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="glass-input w-full text-xs resize-none"
                />
              </div>

              {/* Crowd & Travel Info */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Crowd Status</label>
                  <select
                    value={formData.crowdStatus}
                    onChange={(e) => setFormData({ ...formData, crowdStatus: e.target.value })}
                    className="glass-input w-full text-xs"
                  >
                    <option value="low" className="bg-navy-950 text-white">Low Crowd (Green)</option>
                    <option value="moderate" className="bg-navy-950 text-white">Moderate Rush (Yellow)</option>
                    <option value="high" className="bg-navy-950 text-white">Heavy Rush (Red)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Crowd % (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.crowdPercentage}
                    onChange={(e) => setFormData({ ...formData, crowdPercentage: e.target.value })}
                    className="glass-input w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Entry Fee</label>
                  <input
                    type="text"
                    value={formData.entryFee}
                    onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
                    className="glass-input w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Timings</label>
                  <input
                    type="text"
                    value={formData.timings}
                    onChange={(e) => setFormData({ ...formData, timings: e.target.value })}
                    className="glass-input w-full text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPopular"
                  checked={formData.isPopular}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  className="rounded bg-navy-950 border-white/20 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="isPopular" className="text-xs text-slate-300">
                  Feature this place on Landing Page Popular Destinations
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="glass-button-primary w-full py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-4"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Destination...</span>
                  </>
                ) : (
                  <span>{isEditMode ? 'Update Destination' : 'Publish Destination'}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDestinations;
