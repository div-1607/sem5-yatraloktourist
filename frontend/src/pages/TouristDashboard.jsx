import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Heart,
  Search,
  ShieldAlert,
  MapPin,
  Phone,
  Edit3,
  Calendar,
  Sparkles,
  Compass,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Loader2,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import DestinationCard from '../components/DestinationCard';
import GlassCard from '../components/GlassCard';
import toast from 'react-hot-toast';

const TouristDashboard = () => {
  const { user, updateUser, toggleFavorite } = useAuth();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Profile modal
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    mobile: user?.mobile || '',
    city: user?.city || '',
    address: user?.address || '',
    age: user?.age || '',
    gender: user?.gender || 'Male',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [favRes, recRes, userRes] = await Promise.all([
        api.get('/users/favorites'),
        api.get('/destinations/recommendations'),
        api.get('/users/profile'),
      ]);

      if (favRes.data.success) {
        setFavorites(favRes.data.data);
      }
      if (recRes.data.success) {
        setRecommendations(recRes.data.data);
      }
      if (userRes.data.success) {
        setRecentSearches(userRes.data.data.recentSearches || []);
        setProfileForm({
          name: userRes.data.data.name || '',
          mobile: userRes.data.data.mobile || '',
          city: userRes.data.data.city || '',
          address: userRes.data.data.address || '',
          age: userRes.data.data.age || '',
          gender: userRes.data.data.gender || 'Male',
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/users/profile', profileForm);
      if (res.data.success) {
        updateUser(res.data.data);
        setIsEditing(false);
        toast.success('Profile updated successfully');
      }
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRemoveFavorite = async (destId) => {
    await toggleFavorite(destId);
    setFavorites((prev) => prev.filter((item) => item._id !== destId));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        {/* Sidebar */}
        <Sidebar role="tourist" />

        {/* Main Content Area */}
        <div className="flex-1 space-y-10 min-w-0">
          {/* Top Welcome Header */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-900/90 via-navy-800/80 to-navy-900/90 border border-white/10 shadow-glass flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tourist Command Hub</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Namaste, {user?.name}!
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Ready for your next adventure? Monitor crowd conditions and explore safely.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/destinations"
                className="glass-button-primary text-xs uppercase tracking-wider py-2.5 px-5 flex items-center gap-1.5"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Places</span>
              </Link>
            </div>
          </div>

          {/* Safety Alerts Banner */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-3 shadow-md">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-amber-300">
                Live National Travel Advisory:
              </h4>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                High footfall reported at Kashi Vishwanath & Taj Mahal during peak hours (11:00 AM - 04:00 PM). Plan visits during early dawn or late twilight for smooth access and low crowd density.
              </p>
            </div>
          </div>

          {/* Profile Card & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Info */}
            <div className="md:col-span-2 glass-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  <span>Tourist Profile Details</span>
                </h3>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Tourist Digital ID</span>
                  <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 text-xs inline-block mt-0.5">
                    {user?.digitalId || 'YL-IND-PENDING'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Destination Chosen</span>
                  <span className="text-amber-300 font-semibold truncate block mt-0.5">
                    {user?.chosenDestination || 'None selected yet'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Emergency Mobile</span>
                  <span className="text-white font-semibold font-mono block mt-0.5">{user?.mobile || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Home City</span>
                  <span className="text-white font-semibold block mt-0.5">{user?.city || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Full Name</span>
                  <span className="text-white font-semibold block mt-0.5">{user?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Email Address</span>
                  <span className="text-white font-semibold truncate block mt-0.5">{user?.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Age / Gender</span>
                  <span className="text-white font-semibold block mt-0.5">
                    {user?.age} Yrs &bull; {user?.gender}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Passport Status</span>
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold mt-0.5">
                    <CheckCircle className="w-3 h-3" />
                    <span>Verified Active</span>
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-slate-400 block text-[11px]">Permanent Address</span>
                  <span className="text-slate-200 text-xs">{user?.address || 'Not specified'}</span>
                </div>
                <div className="text-[11px] text-amber-300 font-mono">
                  Trackable by Central Operations Command Center
                </div>
              </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="glass-card p-6 flex flex-col justify-between space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Travel Portfolio</span>
              </h3>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-navy-950/60 flex items-center justify-between">
                  <span className="text-xs text-slate-300">Saved Destinations</span>
                  <span className="text-lg font-bold text-amber-400">
                    {favorites.length}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-navy-950/60 flex items-center justify-between">
                  <span className="text-xs text-slate-300">Recent Searches</span>
                  <span className="text-lg font-bold text-blue-400">
                    {recentSearches.length}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-navy-950/60 flex items-center justify-between">
                  <span className="text-xs text-slate-300">Account Safety Status</span>
                  <span className="text-xs font-bold text-emerald-400">Secure</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Searches Pills */}
          {recentSearches.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Search className="w-4 h-4 text-amber-400" />
                <span>Recent Searches</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(`/destinations?search=${encodeURIComponent(term)}`)}
                    className="px-3 py-1.5 rounded-xl bg-navy-900/60 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-white/10 text-xs transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Saved Destinations (Favorites) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <span>Saved Destinations ({favorites.length})</span>
              </h2>
              {favorites.length > 0 && (
                <Link
                  to="/destinations"
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                >
                  Discover More &rarr;
                </Link>
              )}
            </div>

            {loading ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              </div>
            ) : favorites.length === 0 ? (
              <div className="glass-card p-10 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 text-slate-400 mx-auto flex items-center justify-center">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">No Saved Places Yet</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Click the heart icon on any destination card to bookmark it here for quick access.
                  </p>
                </div>
                <Link
                  to="/destinations"
                  className="glass-button-primary inline-flex items-center gap-1.5 text-xs uppercase tracking-wider py-2.5 px-5"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((dest) => (
                  <div key={dest._id} className="relative group">
                    <DestinationCard destination={dest} />
                    <button
                      onClick={() => handleRemoveFavorite(dest._id)}
                      className="absolute top-3 left-3 z-20 p-2 rounded-full bg-navy-950/80 border border-white/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all text-xs"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Destinations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Personalized Recommendations</span>
              </h2>
              <Link
                to="/destinations?sort=rating-desc"
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                View All &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.slice(0, 3).map((dest) => (
                <DestinationCard key={dest._id} destination={dest} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-navy-900 border border-white/20 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Update Tourist Profile</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="glass-input w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    value={profileForm.age}
                    onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                    className="glass-input w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Gender</label>
                  <select
                    value={profileForm.gender}
                    onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                    className="glass-input w-full text-xs"
                  >
                    <option value="Male" className="bg-navy-950 text-white">Male</option>
                    <option value="Female" className="bg-navy-950 text-white">Female</option>
                    <option value="Other" className="bg-navy-950 text-white">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={profileForm.mobile}
                  onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                  className="glass-input w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">City</label>
                <input
                  type="text"
                  required
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  className="glass-input w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Street Address</label>
                <input
                  type="text"
                  required
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="glass-input w-full text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="glass-button-primary w-full py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Save Profile</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TouristDashboard;
