import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  Heart,
  Compass,
  MapPin,
  Calendar,
  Settings,
  Briefcase,
  Edit3,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Loader2,
  Trash2,
  Plus,
  Bell,
  LocateFixed,
  QrCode,
  Sparkles,
  Route,
  TrendingUp,
  Clock3,
  CloudSun,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLiveLocation } from '../context/LiveLocationContext';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import DestinationCard from '../components/DestinationCard';
import JourneyPlanner from '../components/JourneyPlanner';
import TouristSafetyMap from '../components/TouristSafetyMap';
import toast from 'react-hot-toast';

const TouristDashboard = () => {
  const { user, updateUser, toggleFavorite, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab);

  const {
    coordinates: liveCoords,
    userLocation: liveGpsCoords,
    hasFix,
    isTracking,
    placeLabel,
    activeZones,
    startTracking,
    forceLocate,
  } = useLiveLocation();

  const [favorites, setFavorites] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [allDestinations, setAllDestinations] = useState([]);
  const [exploreSearch, setExploreSearch] = useState('');
  const [exploreCategory, setExploreCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [readNotificationIds, setReadNotificationIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('yatralok_tourist_read_notifications') || '[]'); }
    catch { return []; }
  });
  const [travelPreferences, setTravelPreferences] = useState(() => {
    try { return { safetyAlerts: true, tripReminders: true, recommendationUpdates: true, ...JSON.parse(localStorage.getItem('yatralok_tourist_preferences') || '{}') }; }
    catch { return { safetyAlerts: true, tripReminders: true, recommendationUpdates: true }; }
  });

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

  // Sync tab with URL
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  useEffect(() => {
    fetchDashboardData();
    startTracking();
  }, []);

  useEffect(() => {
    if (!user?.favorites) return;
    api.get('/users/favorites').then((response) => {
      if (response.data?.success && Array.isArray(response.data.data)) setFavorites(response.data.data);
    }).catch(() => {});
  }, [user?.favorites]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [favRes, recRes, userRes, tripsRes, destinationRes] = await Promise.all([
        api.get('/users/favorites').catch(() => ({ data: { success: false, data: [] } })),
        api.get('/destinations/recommendations').catch(() => ({ data: { success: false, data: [] } })),
        api.get('/users/profile').catch(() => ({ data: { success: false, data: user || {} } })),
        api.get('/trips').catch(() => ({ data: { success: false, data: [] } })),
        api.get('/destinations?limit=1000').catch(() => ({ data: { success: false, data: [] } })),
      ]);

      if (favRes.data?.success && Array.isArray(favRes.data.data)) {
        setFavorites(favRes.data.data);
      }
      if (recRes.data?.success && Array.isArray(recRes.data.data)) {
        setRecommendations(recRes.data.data);
      }
      if (tripsRes.data?.success && Array.isArray(tripsRes.data.data)) {
        setTrips(tripsRes.data.data);
      }
      if (destinationRes.data?.success) {
        setAllDestinations(destinationRes.data.destinations || destinationRes.data.data || []);
      }
      const userData = userRes.data?.data || user || {};
      setProfileForm({
        name: userData.name || user?.name || '',
        mobile: userData.mobile || user?.mobile || '',
        city: userData.city || user?.city || '',
        address: userData.address || user?.address || '',
        age: userData.age || user?.age || '',
        gender: userData.gender || user?.gender || 'Male',
      });
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
    const result = await toggleFavorite(destId);
    if (result !== false) setFavorites((prev) => prev.filter((item) => item._id !== destId));
  };

  const openTripInPlanner = (tripId) => {
    setSelectedTripId(tripId);
    handleTabChange('journey');
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Delete this saved itinerary?')) return;
    try {
      await api.delete(`/trips/${tripId}`);
      setTrips((current) => current.filter((trip) => trip._id !== tripId));
      if (selectedTripId === tripId) setSelectedTripId('');
      toast.success('Trip deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not delete this trip');
    }
  };

  const handleContinueTrip = async (trip) => {
    try {
      if (trip.status === 'planning' || trip.status === 'paused') {
        const response = await api.patch(`/trips/${trip._id}/status`, { status: 'active' });
        if (response.data?.success) setTrips((current) => current.map((item) => item._id === trip._id ? response.data.data : item));
      }
      openTripInPlanner(trip._id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not continue this trip');
    }
  };

  const activeTrip = trips.find((trip) => trip.status === 'active' || trip.status === 'paused')
    || trips.find((trip) => trip.status === 'planning' && trip.itineraryEmailedAt)
    || trips.find((trip) => trip.status === 'planning');
  const tripIsUnderway = activeTrip && ['active', 'paused'].includes(activeTrip.status);
  const activeWaypoints = activeTrip?.waypoints || [];
  const completedWaypoints = activeWaypoints.filter((waypoint) => waypoint.status === 'visited');
  const currentWaypoint = completedWaypoints[completedWaypoints.length - 1];
  const currentDestination = currentWaypoint?.destination;
  const nextWaypoint = activeWaypoints.find((waypoint) => waypoint.status === 'pending');
  const journeyProgress = activeWaypoints.length
    ? Math.round((completedWaypoints.length / activeWaypoints.length) * 100)
    : 0;
  const totalTravelDays = trips.reduce((total, trip) => {
    const duration = trip.startDate && trip.endDate
      ? Math.max(0, Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000))
      : 0;
    return total + duration;
  }, 0);
  const tripStatusLabel = (status) => ({
    active: 'In progress',
    paused: 'Paused',
    completed: 'Completed',
    cancelled: 'Cancelled',
    planning: 'Planned',
  }[status] || 'Planned');
  const tripProgress = (trip) => {
    const waypoints = trip.waypoints || [];
    return waypoints.length ? Math.round((waypoints.filter((waypoint) => waypoint.status === 'visited').length / waypoints.length) * 100) : 0;
  };
  const filteredExploreDestinations = allDestinations.filter((destination) => {
    const matchesCategory = exploreCategory === 'All' || destination.category === exploreCategory;
    const query = exploreSearch.trim().toLowerCase();
    const matchesSearch = !query || [destination.title, destination.city, destination.state, destination.category, destination.shortDescription, ...(destination.tags || [])].join(' ').toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });
  const touristNotifications = [
    ...trips.map((trip) => ({
      id: `trip-${trip._id}`,
      title: trip.status === 'active' ? 'Journey in progress' : 'Trip itinerary update',
      message: `${trip.title} · ${trip.waypoints?.length || 0} planned stops · ${tripStatusLabel(trip.status)}`,
      createdAt: trip.updatedAt || trip.createdAt,
      type: 'trip',
    })),
    ...favorites.filter((destination) => destination.crowdStatus === 'high').map((destination) => ({
      id: `crowd-${destination._id}`,
      title: `High crowd estimate: ${destination.title}`,
      message: 'YatraLok catalog currently marks this place high. Confirm conditions locally before travel.',
      createdAt: destination.updatedAt || destination.createdAt,
      type: 'safety',
    })),
  ].sort((first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0));

  const updateTravelPreference = (key, value) => {
    const next = { ...travelPreferences, [key]: value };
    setTravelPreferences(next);
    localStorage.setItem('yatralok_tourist_preferences', JSON.stringify(next));
  };

  const markNotificationRead = (notificationId) => {
    const next = [...new Set([...readNotificationIds, notificationId])];
    setReadNotificationIds(next);
    localStorage.setItem('yatralok_tourist_read_notifications', JSON.stringify(next));
  };

  return (
    <div className="w-full px-4 sm:px-6 xl:px-10 py-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Widened Modern Sidebar (w-80) */}
        <Sidebar
          role="tourist"
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Main Travel Workspace */}
        <div className="flex-1 min-w-0 space-y-8 w-full">
          {/* TAB 1: MAIN DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Welcome Banner */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
                <div className="relative z-10 max-w-2xl space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Traveler Hub Active</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Namaste, {user?.name || 'Explorer'}!
                  </h1>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Ready for your next adventure across India? Discover curated monuments, manage your saved bookmarks, and track your active itineraries.
                  </p>
                  <div className="pt-3 flex flex-wrap gap-3">
                    <Link
                      to="/destinations"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
                    >
                      <Compass className="w-4 h-4" />
                      <span>Explore All Destinations</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleTabChange('bookmarks')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold transition-all"
                    >
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>View Bookmarks ({favorites.length})</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Metrics Cards */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
                  <span className="text-sm font-semibold text-slate-500 block mb-1">
                    {tripIsUnderway ? 'Current Trip' : 'Next Trip'}
                  </span>
                  <span className="text-lg font-extrabold text-slate-900 line-clamp-1">
                    {activeTrip?.title || 'No active trip'}
                  </span>
                </div>
                <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
                  <span className="text-sm font-semibold text-slate-500 block mb-1">
                    Current Location
                  </span>
                  <span className="text-lg font-extrabold text-slate-900 line-clamp-1">
                    {placeLabel || (tripIsUnderway ? (hasFix ? 'GPS fix received' : 'Location not available') : activeTrip ? 'Journey not started' : 'Location not available')}
                  </span>
                </div>
                <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
                  <span className="text-sm font-semibold text-slate-500 block mb-1">
                    Next Destination
                  </span>
                  <span className="text-lg font-extrabold text-slate-900 line-clamp-1">
                    {nextWaypoint?.name || 'Not scheduled'}
                  </span>
                </div>
                <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
                  <span className="text-sm font-semibold text-slate-500 block mb-1">
                    Active / Completed Trips
                  </span>
                  <span className="text-2xl font-black text-blue-700">
                    {trips.filter((trip) => ['active', 'paused'].includes(trip.status)).length} / {trips.filter((trip) => trip.status === 'completed').length}
                  </span>
                </div>
                <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
                  <span className="text-sm font-semibold text-slate-500 block mb-1">Total Travel Days</span>
                  <span className="text-2xl font-black text-slate-900">{totalTravelDays}</span>
                </div>
                <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
                  <span className="text-sm font-semibold text-slate-500 block mb-1">Saved Destinations</span>
                  <span className="text-2xl font-black text-blue-700">{favorites.length}</span>
                </div>
                <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
                  <span className="text-sm font-semibold text-slate-500 block mb-1">Places Visited</span>
                  <span className="text-2xl font-black text-emerald-700">
                    {trips.reduce((count, trip) => count + (trip.waypoints || []).filter((waypoint) => waypoint.status === 'visited').length, 0)}
                  </span>
                </div>
                <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
                  <span className="text-sm font-semibold text-slate-500 block mb-1">Digital Tourist ID</span>
                  <span className="text-base font-extrabold text-emerald-700 flex items-center gap-2 mt-1">
                    <ShieldCheck className="w-5 h-5" /> {user?.digitalId || 'Verified account'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <section className="xl:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wide text-blue-700">Journey Progress</p>
                      <h2 className="text-2xl font-extrabold text-slate-900 mt-1">{activeTrip?.title || 'Your next journey starts here'}</h2>
                    </div>
                    <button type="button" onClick={() => handleTabChange('journey')} className="shrink-0 text-sm font-bold text-blue-700 hover:text-blue-800">Full journey <ArrowRight className="inline w-4 h-4 ml-1" /></button>
                  </div>
                  {activeTrip ? (
                    <>
                      <div className="flex justify-between text-sm text-slate-600">
                        <span>{completedWaypoints.length} of {activeWaypoints.length} stops completed</span>
                        <span className="font-bold text-slate-900">{journeyProgress}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${journeyProgress}%` }} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                        <div><span className="text-xs font-semibold text-slate-500">{tripIsUnderway ? 'Current location' : 'Starting location'}</span><p className="text-base font-bold text-slate-900 mt-1">{tripIsUnderway ? (placeLabel || 'Waiting for GPS') : (activeTrip.startingLocation || 'Not specified')}</p></div>
                        <div><span className="text-xs font-semibold text-slate-500">Next stop</span><p className="text-base font-bold text-slate-900 mt-1">{nextWaypoint?.name || 'All stops completed'}</p></div>
                        <div><span className="text-xs font-semibold text-slate-500">Trip dates</span><p className="text-base font-bold text-slate-900 mt-1">{new Date(activeTrip.startDate).toLocaleDateString()} – {new Date(activeTrip.endDate).toLocaleDateString()}</p></div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2"><p className="text-sm text-slate-600">{tripIsUnderway ? `${Math.min(Math.max(0, Math.floor((Date.now() - new Date(activeTrip.startDate)) / 86400000)), activeTrip.durationDays || 0)} days completed · ${Math.max(0, (activeTrip.durationDays || 0) - Math.max(0, Math.floor((Date.now() - new Date(activeTrip.startDate)) / 86400000)))} days remaining` : `${activeTrip.durationDays || 0} days planned`} · {activeTrip.durationDays || 0} days total</p><span className="text-sm font-bold capitalize text-blue-800">{tripStatusLabel(activeTrip.status)}</span></div>
                      {activeTrip.itineraryEmailedAt && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">Journey emailed to {user?.email || 'your registered email'} · {new Date(activeTrip.itineraryEmailedAt).toLocaleDateString()}</p>}
                    </>
                  ) : (
                    <div className="rounded-2xl bg-blue-50 border border-blue-100 p-5 flex items-center gap-4">
                      <Route className="w-8 h-8 text-blue-700 shrink-0" />
                      <div><p className="font-bold text-slate-900">No active itinerary</p><p className="text-sm text-slate-600 mt-1">Your saved destinations and planned trips will appear here when available.</p></div>
                    </div>
                  )}
                </section>

                <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2"><CloudSun className="w-5 h-5 text-sky-600" /><h2 className="text-lg font-bold text-slate-900">Destination Weather</h2></div>
                  <p className="text-sm text-slate-600">A verified weather provider is not connected yet, so forecasts are not shown.</p>
                  <div className="border-t border-slate-100 pt-3 text-sm"><span className="font-semibold text-slate-700">Crowd indicators</span><p className="text-slate-500 mt-1">YatraLok destination-level status and percentages are estimates, not verified physical headcounts.</p></div>
                  <Link to="/crowd-indicator" className="inline-flex items-center text-sm font-bold text-blue-700">View crowd indicators <ArrowRight className="w-4 h-4 ml-1" /></Link>
                </section>
              </div>

              {tripIsUnderway && currentDestination && (
                <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div><p className="text-sm font-bold uppercase tracking-wide text-blue-700">Current destination</p><h2 className="text-2xl font-extrabold text-slate-900 mt-1">{currentDestination?.title || currentWaypoint?.name || 'No stop marked as visited'}</h2><p className="text-base text-slate-600 mt-1">{currentDestination ? `${currentDestination.city || ''}${currentDestination.state ? `, ${currentDestination.state}` : ''}` : 'Complete a waypoint to identify the current trip destination.'}</p></div>
                    {currentDestination?.category && <span className="rounded-full bg-blue-50 text-blue-800 px-4 py-2 text-sm font-bold">{currentDestination.category}</span>}
                  </div>
                  {currentDestination ? <><p className="text-base text-slate-700 mt-4">{currentDestination.shortDescription || 'Destination details are available in the catalog.'}</p><div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mt-5"><div className="p-4 rounded-xl bg-slate-50"><span className="text-sm text-slate-500">Platform crowd level</span><p className="text-lg font-bold capitalize text-slate-900 mt-1">{currentDestination.crowdStatus || 'Not reported'}</p></div><div className="p-4 rounded-xl bg-slate-50"><span className="text-sm text-slate-500">Crowd estimate</span><p className="text-lg font-bold text-slate-900 mt-1">{currentDestination.crowdPercentage == null ? 'Unavailable' : `${currentDestination.crowdPercentage}% · YatraLok estimate`}</p></div><div className="p-4 rounded-xl bg-slate-50"><span className="text-sm text-slate-500">Best visiting time</span><p className="text-lg font-bold text-slate-900 mt-1">{currentDestination.bestTimeToVisit || 'Not recorded'}</p></div><div className="p-4 rounded-xl bg-slate-50"><span className="text-sm text-slate-500">Tourist count / stay</span><p className="text-base font-bold text-slate-900 mt-1">Not provided by platform data</p></div></div><p className="text-sm text-slate-500 mt-4">Crowd indicators are YatraLok platform estimates, not verified real-world headcounts. Attractions and nearby-place data are not connected for this itinerary.</p></> : <p className="text-base text-slate-600 mt-4">No current itinerary destination is available yet.</p>}
                </section>
              )}

              {recommendations.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-end justify-between"><div><p className="text-sm font-bold uppercase tracking-wide text-blue-700">Picked for you</p><h2 className="text-2xl font-extrabold text-slate-900 mt-1">Recommended destinations</h2></div><Link to="/recommendations" className="text-sm font-bold text-blue-700">Explore all <ArrowRight className="inline w-4 h-4" /></Link></div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{recommendations.slice(0, 2).map((destination) => <DestinationCard key={destination._id} destination={destination} />)}</div>
                </section>
              )}

              {/* Live Location Telemetry Pill */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${hasFix ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {hasFix ? 'Current GPS Location' : 'Live Location Status'}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">
                      {liveGpsCoords
                        ? `${liveGpsCoords[0].toFixed(4)}°, ${liveGpsCoords[1].toFixed(4)}°`
                        : 'GPS Coordinates Standby'}
                    </p>
                    {placeLabel && <p className="text-xs text-slate-500">{placeLabel}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={forceLocate}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LocateFixed className="w-3.5 h-3.5" />
                    <span>Recalibrate</span>
                  </button>
                  <Link
                    to="/destinations"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Browse Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Bookmarks Quick Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    <span>Saved Bookmarks ({favorites.length})</span>
                  </h3>
                  {favorites.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleTabChange('bookmarks')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      View All Bookmarks &rarr;
                    </button>
                  )}
                </div>

                {loading ? (
                  <div className="py-8 flex justify-center">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                      <Heart className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">No bookmarked places yet</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Click the heart icon on any destination card to bookmark it for fast access.
                    </p>
                    <Link
                      to="/destinations"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      <span>Explore Places</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.slice(0, 3).map((dest) => (
                      <DestinationCard key={dest._id} destination={dest} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BOOKMARKS */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                    <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                    <span>My Bookmarked Destinations</span>
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    All your saved destinations in one place. Click to view full details.
                  </p>
                </div>
                <Link
                  to="/destinations"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Discover More</span>
                </Link>
              </div>

              {loading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : favorites.length === 0 ? (
                <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Your Bookmarks List is Empty</h3>
                    <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                      Explore our directory of 370+ destinations across India and bookmark your favorite places.
                    </p>
                  </div>
                  <Link
                    to="/destinations"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white text-sm font-semibold shadow-sm"
                  >
                    <span>Browse Destinations</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((dest) => (
                    <div key={dest._id} className="relative group">
                      <DestinationCard destination={dest} />
                      <button
                        type="button"
                        onClick={() => handleRemoveFavorite(dest._id)}
                        className="absolute top-3 left-3 z-20 p-2 rounded-full bg-white/95 text-slate-500 hover:text-red-500 hover:bg-white shadow-md transition-all text-xs cursor-pointer border border-slate-200"
                        title="Remove from bookmarks"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TRIPS */}
          {activeTab === 'trips' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                    <span>My Trips & Itineraries</span>
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Plan, organize, and review your upcoming travel expeditions across India.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openTripInPlanner('')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Plan New Trip</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {trips.map((trip) => (
                  <div
                    key={trip._id}
                    className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="relative h-44 w-full">
                      <img
                        src={trip.waypoints?.[0]?.destination?.images?.[0] || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80'}
                        alt={trip.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-blue-600 shadow-sm">
                          {tripStatusLabel(trip.status)}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 space-y-3 flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            {new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900">{trip.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">{Math.max(0, Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000))} days · {trip.travelerCount || 1} traveler(s) · {tripStatusLabel(trip.status)}</p>
                        <div className="mt-3"><div className="flex justify-between text-xs mb-1"><span className="text-slate-600">Journey progress</span><span className="font-bold text-slate-800">{tripProgress(trip)}%</span></div><div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-blue-600" style={{ width: `${tripProgress(trip)}%` }} /></div></div>
                        <div className="mt-2 space-y-1">
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Key Stops:
                          </span>
                          <p className="text-sm text-slate-600">{(trip.waypoints || []).map((waypoint) => `${waypoint.name} (${waypoint.status === 'visited' ? 'visited' : waypoint.status === 'skipped' ? 'skipped' : 'upcoming'})`).join(' · ') || 'No stops added yet'}</p>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs mt-3">
                        <span className="font-semibold text-slate-500">
                          {(trip.waypoints || []).length} Destinations
                        </span>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => openTripInPlanner(trip._id)} className="font-bold text-blue-700 hover:text-blue-800">View / Edit</button>
                          {trip.status !== 'completed' && trip.status !== 'cancelled' && <button type="button" onClick={() => handleContinueTrip(trip)} className="font-bold text-emerald-700 hover:text-emerald-800">Continue</button>}
                          <button type="button" onClick={() => handleDeleteTrip(trip._id)} className="font-bold text-red-700 hover:text-red-800">Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'explore' && (
            <section className="space-y-6 animate-in fade-in duration-200">
              <header className="border-b border-slate-200 pb-4"><p className="text-sm font-bold uppercase tracking-wide text-blue-700">Explore India</p><h1 className="text-3xl font-extrabold text-slate-900 mt-1">Find your next stop</h1><p className="text-base text-slate-600 mt-1">Search the connected destination catalog, save places, or add them to a journey.</p></header>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3"><input value={exploreSearch} onChange={(event) => setExploreSearch(event.target.value)} placeholder="Search destination, city, state or activity" className="glass-input w-full text-base" /><select value={exploreCategory} onChange={(event) => setExploreCategory(event.target.value)} className="glass-input w-full text-base"><option value="All">All categories</option>{[...new Set(allDestinations.map((destination) => destination.category).filter(Boolean))].sort().map((category) => <option key={category}>{category}</option>)}</select></div>
              {loading ? <div className="py-12 text-center text-slate-600">Loading destinations…</div> : filteredExploreDestinations.length ? <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">{filteredExploreDestinations.map((destination) => <div key={destination._id} className="space-y-2"><DestinationCard destination={destination} /><div className="flex gap-2"><Link to={`/destinations/${destination.slug || destination._id}`} className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-center text-sm font-bold text-slate-700 hover:bg-slate-50">View Details</Link><button type="button" onClick={() => toggleFavorite(destination._id)} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50">{user?.favorites?.some((favorite) => (typeof favorite === 'string' ? favorite : favorite._id) === destination._id) ? 'Saved' : 'Save'}</button><button type="button" onClick={() => { setSelectedTripId(''); setActiveTab('journey'); setSearchParams({ tab: 'journey', destination: destination._id }); }} className="rounded-lg bg-blue-700 px-3 py-2.5 text-sm font-bold text-white hover:bg-blue-800">Plan</button></div></div>)}</div> : <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center"><p className="font-bold text-slate-900">No matching destinations</p><p className="text-sm text-slate-600 mt-1">Try a different place or category.</p></div>}
            </section>
          )}

          {activeTab === 'safety' && <TouristSafetyMap />}

          {activeTab === 'journey' && <JourneyPlanner
            trips={trips}
            selectedTripId={selectedTripId}
            onSelectTrip={setSelectedTripId}
            onTripsChanged={fetchDashboardData}
            startingLocation={placeLabel || ''}
            initialDestinationId={searchParams.get('destination')}
            userEmail={user?.email || ''}
          />}

          {activeTab === 'journey-legacy' && (
            <section className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-200 pb-4"><p className="text-sm font-bold uppercase tracking-wide text-blue-700">Journey Planner</p><h1 className="text-3xl font-extrabold text-slate-900 mt-1">Your complete route</h1><p className="text-base text-slate-600 mt-1">Trip stops and completion are loaded from your saved itinerary.</p></div>
              {activeTrip ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex flex-wrap justify-between gap-4"><div><h2 className="text-2xl font-bold text-slate-900">{activeTrip.title}</h2><p className="text-sm text-slate-600 mt-1">{new Date(activeTrip.startDate).toLocaleDateString()} – {new Date(activeTrip.endDate).toLocaleDateString()} · {Math.max(0, Math.ceil((new Date(activeTrip.endDate) - new Date(activeTrip.startDate)) / 86400000))} days</p></div><span className="rounded-full bg-blue-50 text-blue-800 px-4 py-2 text-sm font-bold">{tripStatusLabel(activeTrip.status)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-600">Journey progress</span><span className="font-bold text-slate-900">{journeyProgress}% · {completedWaypoints.length}/{activeWaypoints.length} stops</span></div>
                  <div className="h-3 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-blue-600 rounded-full" style={{ width: `${journeyProgress}%` }} /></div>
                  <ol className="space-y-0">
                    {activeWaypoints.map((waypoint, index) => {
                      const state = waypoint.status === 'visited' ? 'Visited' : waypoint === nextWaypoint ? 'Next stop' : 'Upcoming';
                      const stateStyle = waypoint.status === 'visited' ? 'bg-emerald-100 text-emerald-800' : waypoint === nextWaypoint ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700';
                      const stayDays = waypoint.arrivalTime && waypoint.departureTime ? Math.max(1, Math.ceil((new Date(waypoint.departureTime) - new Date(waypoint.arrivalTime)) / 86400000)) : null;
                      return <li key={waypoint._id || `${waypoint.name}-${index}`} className="relative flex gap-4 pb-6 last:pb-0"><div className="flex flex-col items-center"><span className={`w-4 h-4 rounded-full mt-1 ${waypoint.status === 'visited' ? 'bg-emerald-500' : waypoint === nextWaypoint ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-slate-300'}`} />{index < activeWaypoints.length - 1 && <span className="w-px flex-1 bg-slate-200 mt-2" />}</div><div className="flex-1 flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-lg font-bold text-slate-900">{waypoint.name}</h3><p className="text-sm text-slate-600 mt-1">{waypoint.arrivalTime ? new Date(waypoint.arrivalTime).toLocaleDateString() : 'Dates not scheduled'}{waypoint.departureTime ? ` – ${new Date(waypoint.departureTime).toLocaleDateString()}` : ''}{stayDays ? ` · ${stayDays} days planned` : ''}</p>{waypoint.notes && <p className="text-sm text-slate-500 mt-1">{waypoint.notes}</p>}</div><span className={`px-3 py-1 rounded-full text-sm font-bold ${stateStyle}`}>{state}</span></div></li>;
                    })}

                    {activeTab === 'safety' && <TouristSafetyMap />}
                  </ol>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-5"><div><span className="text-sm text-slate-500">Starting point</span><p className="font-bold text-slate-900 mt-1">{activeWaypoints[0]?.name || 'Not set'}</p></div><div><span className="text-sm text-slate-500">Current location</span><p className="font-bold text-slate-900 mt-1">{placeLabel || 'Location not available'}</p></div><div><span className="text-sm text-slate-500">Final destination</span><p className="font-bold text-slate-900 mt-1">{activeWaypoints.at(-1)?.name || 'Not set'}</p></div></div>
                </div>
              ) : <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center"><Route className="w-10 h-10 text-blue-600 mx-auto" /><h2 className="text-xl font-bold text-slate-900 mt-3">No active journey to track</h2><p className="text-base text-slate-600 mt-2">Trips you create will show each stop, its status, and your route progress here.</p><button type="button" onClick={() => handleTabChange('trips')} className="mt-5 px-5 py-3 rounded-xl bg-blue-600 text-white font-bold">Open My Trips</button></div>}
            </section>
          )}

          {activeTab === 'insights' && (
            <section className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-200 pb-4"><p className="text-sm font-bold uppercase tracking-wide text-blue-700">Travel Insights</p><h1 className="text-3xl font-extrabold text-slate-900 mt-1">Your travel at a glance</h1></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {[['Trips on record', trips.length, Briefcase], ['Travel days', totalTravelDays, Calendar], ['Destinations saved', favorites.length, Heart], ['Average trip duration', trips.length ? `${Math.round(totalTravelDays / trips.length)} days` : '—', Calendar], ['Stops completed', trips.reduce((count, trip) => count + (trip.waypoints || []).filter((waypoint) => waypoint.status === 'visited').length, 0), MapPin]].map(([label, value, Icon]) => <div key={label} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs"><Icon className="w-6 h-6 text-blue-700" /><p className="text-sm font-semibold text-slate-600 mt-4">{label}</p><p className="text-3xl font-black text-slate-900 mt-1">{value}</p></div>)}
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6"><h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-700" />Popular saved categories</h2>{favorites.length ? <div className="mt-5 space-y-4">{Object.entries(favorites.reduce((totals, place) => { const category = place.category || 'Uncategorized'; totals[category] = (totals[category] || 0) + 1; return totals; }, {})).sort((a, b) => b[1] - a[1]).map(([category, count]) => <div key={category} className="flex justify-between border-b border-slate-100 pb-3"><span className="font-semibold text-slate-700">{category}</span><span className="font-bold text-slate-900">{count} saved</span></div>)}</div> : <p className="text-base text-slate-600 mt-4">Save destinations to see your most frequently collected categories here.</p>}</div>
                <div className="bg-white border border-slate-200 rounded-3xl p-6"><h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Clock3 className="w-5 h-5 text-blue-700" />Recent trip history</h2>{trips.length ? <div className="mt-5 space-y-4">{trips.slice(0, 5).map((trip) => <div key={trip._id} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3"><div><p className="font-bold text-slate-900">{trip.title}</p><p className="text-sm text-slate-500">{new Date(trip.startDate).toLocaleDateString()} · {(trip.waypoints || []).length} stops</p></div><span className="text-sm font-semibold text-slate-700">{tripStatusLabel(trip.status)}</span></div>)}</div> : <p className="text-base text-slate-600 mt-4">Your trip history will appear once an itinerary is created.</p>}</div>
              </div>
            </section>
          )}

          {activeTab === 'notifications' && (
            <section className="space-y-5 animate-in fade-in duration-200"><div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4"><div><p className="text-sm font-bold uppercase tracking-wide text-blue-700">Updates</p><h1 className="text-3xl font-extrabold text-slate-900 mt-1">Notifications</h1><p className="text-sm text-slate-600 mt-1">Trip and saved-destination alerts derived from your YatraLok data. This account has no separate push-notification feed.</p></div><button type="button" onClick={() => { const next = [...new Set([...readNotificationIds, ...touristNotifications.map((notification) => notification.id)])]; setReadNotificationIds(next); localStorage.setItem('yatralok_tourist_read_notifications', JSON.stringify(next)); }} disabled={touristNotifications.every((notification) => readNotificationIds.includes(notification.id))} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-50">Mark all read</button></div><div className="space-y-3">{touristNotifications.length ? touristNotifications.map((notification) => { const isRead = readNotificationIds.includes(notification.id); return <article key={notification.id} className={`rounded-2xl border p-5 ${isRead ? 'bg-white border-slate-200' : 'bg-blue-50 border-blue-200'}`}><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${notification.type === 'safety' ? 'bg-red-500' : 'bg-blue-600'}`} /><h2 className="font-bold text-slate-900">{notification.title}</h2></div><p className="text-sm text-slate-700 mt-2">{notification.message}</p><p className="text-xs text-slate-500 mt-2">{notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Timestamp unavailable'}</p></div>{isRead ? <span className="text-xs font-semibold text-slate-500">Read</span> : <button type="button" onClick={() => markNotificationRead(notification.id)} className="shrink-0 rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm font-bold text-blue-700">Mark read</button>}</div></article>; }) : <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center"><Bell className="w-8 h-8 text-slate-400 mx-auto" /><p className="font-bold text-slate-900 mt-3">No updates yet</p><p className="text-sm text-slate-600 mt-1">Trip activity and high crowd estimates for saved destinations will appear here.</p></div>}</div></section>
          )}

          {/* TAB 4: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                    <User className="w-6 h-6 text-blue-600" />
                    <span>Tourist Profile & Identity</span>
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Your personal information and official verified digital tourist credential.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold shadow-sm cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Digital ID Card */}
                <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-5 h-5 text-blue-400" />
                        <span className="text-xs font-bold tracking-wider uppercase text-slate-800">
                          Digital Tourist ID
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ACTIVE
                      </span>
                    </div>

                    <div className="my-5 p-3 rounded-2xl bg-blue-50 text-center">
                      <span className="text-xs text-slate-600 uppercase tracking-widest block mb-0.5">
                        Token Code
                      </span>
                      <span className="text-lg font-black font-mono tracking-widest text-blue-800">
                        {user?.digitalId || 'Not assigned'}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Cardholder:</span>
                        <span className="font-bold">{user?.name}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Mobile:</span>
                        <span className="font-mono">{user?.mobile || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Location:</span>
                        <span>{user?.city || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-center">
                    <span className="text-xs text-slate-500">
                      Official Tourist Credential • YatraLok Platform
                    </span>
                  </div>
                </div>

                {/* Profile Details Panel */}
                <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                  <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                    <div>
                      <span className="text-xs text-slate-400 block">Full Name</span>
                      <span className="font-semibold text-slate-900 mt-0.5 block">{user?.name}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Email Address</span>
                      <span className="font-semibold text-slate-900 mt-0.5 block">{user?.email}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Contact Number</span>
                      <span className="font-semibold text-slate-900 mt-0.5 block">
                        {user?.mobile || 'Not provided'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Home City</span>
                      <span className="font-semibold text-slate-900 mt-0.5 block">
                        {user?.city || 'Not specified'}
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-xs text-slate-400 block">Address</span>
                          <span className="font-semibold text-slate-900 mt-0.5 block">
                            {user?.address || 'Not provided'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="pb-4 border-b border-slate-200">
                <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Settings className="w-6 h-6 text-slate-700" />
                  <span>Account & Travel Settings</span>
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Configure preferences, safety alerts, and notification settings.
                </p>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 max-w-2xl">
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900">Notifications & Alerts</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
                      <div>
                        <span className="text-sm font-semibold text-slate-900 block">
                          Real-Time Safety & Crowd Alerts
                        </span>
                        <span className="text-xs text-slate-500">
                          Receive notifications when major monuments reach peak crowd congestion.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={travelPreferences.safetyAlerts}
                        onChange={(event) => updateTravelPreference('safetyAlerts', event.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
                      <div>
                        <span className="text-sm font-semibold text-slate-900 block">
                          Travel Recommendations
                        </span>
                        <span className="text-xs text-slate-500">
                          Get suggestions tailored to your bookmarked heritage and scenic spots.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={travelPreferences.recommendationUpdates}
                        onChange={(event) => updateTravelPreference('recommendationUpdates', event.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
                      <div>
                        <span className="text-sm font-semibold text-slate-900 block">
                          Trip Reminder Updates
                        </span>
                        <span className="text-xs text-slate-500">
                          Show itinerary updates and journey reminders in the Notifications section.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={travelPreferences.tripReminders}
                        onChange={(event) => updateTravelPreference('tripReminders', event.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-slate-500">Preferences save automatically on this device.</p>
                  <button
                    type="button"
                    onClick={() => { logout(); navigate('/'); }}
                    className="px-5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 font-bold text-sm cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-5 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Update Profile Details</h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={profileForm.mobile}
                  onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full glass-input text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    className="w-full glass-input text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={profileForm.age}
                    onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                    className="w-full glass-input text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Residential Address
                </label>
                <textarea
                  rows={2}
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="w-full glass-input text-sm resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
                >
                  {savingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TouristDashboard;
