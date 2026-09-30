import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Star,
  Clock,
  Calendar,
  Ticket,
  Phone,
  Heart,
  Share2,
  ArrowLeft,
  ShieldAlert,
  Users,
  MessageSquare,
  Send,
  Loader2,
  Sparkles,
  CloudSun,
  ShieldCheck,
  Compass,
  Wind,
  Droplets,
  Thermometer,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CrowdBadge from '../components/CrowdBadge';
import MapView from '../components/MapView';
import toast from 'react-hot-toast';

const DestinationDetailsPage = () => {
  const { id } = useParams();
  const { isAuthenticated, toggleFavorite, isFavorite } = useAuth();
  const navigate = useNavigate();

  const [destination, setDestination] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Review Form
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchDestination();
  }, [id]);

  const fetchDestination = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/destinations/${id}`);
      if (res.data.success) {
        setDestination(res.data.data);
        setReviews(res.data.reviews || []);
      }
    } catch (err) {
      console.error('Error fetching destination details:', err);
      toast.error('Destination not found');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to submit a review.');
      return;
    }

    if (!userComment.trim()) {
      toast.error('Please write a review comment.');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        destinationId: destination._id,
        rating: userRating,
        comment: userComment.trim(),
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Review posted!');
        setUserComment('');
        fetchDestination();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: destination?.title,
        text: destination?.shortDescription,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="light-theme-page min-h-[75vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 text-blue-electric animate-spin" />
        <p className="text-xs text-slate-400">Loading destination insights...</p>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="light-theme-page max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Destination Not Found</h2>
        <Link to="/destinations" className="glass-button-primary inline-block text-xs uppercase py-2.5 px-5">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const favorited = isFavorite(destination._id);
  const mountainDestination = /leh|ladakh|manali|shimla|mussoorie|nainital|uttarakhand|himachal|sikkim/i.test(
    `${destination.title} ${destination.city} ${destination.state}`
  );
  const crowdRisk = destination.crowdStatus === 'high'
    ? { level: 'High', reason: 'YatraLok crowd estimate is high.' }
    : destination.crowdStatus === 'moderate'
      ? { level: 'Moderate', reason: 'YatraLok crowd estimate is moderate.' }
      : { level: 'Low', reason: 'YatraLok crowd estimate is low; this is not a live hazard assessment.' };
  const suggestedStay = /mountain|nature|adventure/i.test(destination.category || '') ? '2 days suggested' : '1 day suggested';
  const startJourney = () => {
    if (isAuthenticated) {
      navigate(`/dashboard?tab=journey&destination=${encodeURIComponent(destination._id)}`);
      return;
    }
    navigate('/login', { state: { from: { pathname: '/dashboard' }, planDestinationId: destination._id } });
  };

  return (
    <div className="light-theme-page min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Nav Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/destinations"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-blue-electric" />
            <span>Back to All Destinations</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-navy-950/70 border border-blue-electric/25 hover:border-blue-electric text-slate-300 hover:text-white transition-all text-xs shadow-glass cursor-pointer"
              title="Share Destination"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleFavorite(destination._id)}
              className={`p-2.5 rounded-xl border transition-all text-xs flex items-center gap-2 font-bold cursor-pointer ${
                favorited
                  ? 'bg-red-950/50 border-red-500/50 text-red-400 shadow-glow-danger'
                  : 'bg-navy-950/70 border-blue-electric/25 text-slate-300 hover:text-white shadow-glass'
              }`}
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{favorited ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Main Title & Hierarchy Badges */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-navy-900/90 text-blue-neon font-bold border border-blue-electric/40 shadow-glow-electric">
              {destination.category}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 font-mono text-[11px]">
              {destination.country} &rarr; {destination.state} &rarr; {destination.city}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            {destination.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Star className="w-4 h-4 fill-amber-400" />
              <span className="text-sm text-white">{destination.rating?.toFixed(1) || '4.8'}</span>
              <span className="text-slate-500 font-normal">
                ({destination.numReviews || 128} reviews)
              </span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-4 h-4 text-blue-neon" />
              <span>{destination.location?.address || `${destination.city}, ${destination.state}`}</span>
            </div>
          </div>

          <button type="button" onClick={startJourney} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-base font-bold text-white hover:bg-blue-800">
            <Compass className="w-5 h-5" />Plan Journey
          </button>
        </div>

        {/* Full-Screen Hero Image Gallery */}
        <div className="space-y-4">
          <div className="relative h-96 sm:h-[500px] w-full rounded-3xl overflow-hidden border border-blue-electric/30 shadow-glass-panel bg-navy-950">
            <img
              src={destination.images?.[activeImageIndex] || destination.images?.[0]}
              alt={destination.title}
              className="w-full h-full object-cover transition-all duration-700"
              onError={(event) => {
                if (event.currentTarget.dataset.fallback) event.currentTarget.style.visibility = 'hidden';
                else {
                  event.currentTarget.dataset.fallback = 'true';
                  event.currentTarget.src = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80';
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black-deep via-black-deep/30 to-black/20" />

            {/* Crowd Badge in Hero Image */}
            <div className="absolute top-5 left-5">
              <CrowdBadge
                level={destination.crowdStatus}
                percentage={destination.crowdPercentage}
                size="md"
              />
            </div>
          </div>

          {/* Thumbnail Strip */}
          {destination.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {destination.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-blue-electric shadow-glow-electric scale-105'
                      : 'border-white/10 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${destination.title} view ${idx + 1}`} className="w-full h-full object-cover" onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid: Details & Crowd Safety Meter */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Description, Map, Reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <div className="glass-card p-6 sm:p-8 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-neon" />
                <span>Historical & Cultural Significance</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {destination.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                <div className="rounded-xl bg-slate-50 p-4"><span className="text-xs font-semibold text-slate-500">Recommended stay</span><p className="font-bold text-slate-900 mt-1">{suggestedStay}</p><p className="text-xs text-slate-500 mt-1">YatraLok planning suggestion</p></div>
                <div className="rounded-xl bg-slate-50 p-4"><span className="text-xs font-semibold text-slate-500">Best visiting time</span><p className="font-bold text-slate-900 mt-1">{destination.bestTimeToVisit || 'Not recorded'}</p></div>
                <div className="rounded-xl bg-slate-50 p-4"><span className="text-xs font-semibold text-slate-500">Entry information</span><p className="font-bold text-slate-900 mt-1">{destination.entryFee || 'Not recorded'}</p></div>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <h3 className="font-bold text-slate-900">Activities and catalog tags</h3>
                {destination.tags?.length ? <div className="flex flex-wrap gap-2 mt-3">{destination.tags.map((tag) => <span key={tag} className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-800">{tag}</span>)}</div> : <p className="text-sm text-slate-600 mt-2">Attractions and activities are not listed for this destination yet.</p>}
              </div>

              {destination.tags?.length > 0 && (
                <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2">
                  {destination.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl bg-navy-950/70 border border-blue-electric/25 text-xs text-blue-neon font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Dark Map */}
            <div className="glass-card p-6 sm:p-8 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-electric" />
                <span>Geo-Spatial Coordinates & Navigation</span>
              </h2>
              <p className="text-sm text-slate-600">
                Destination coordinates from the YatraLok catalog; this map does not report live road or hazard conditions.
              </p>

              {Number.isFinite(destination.location?.lat) && Number.isFinite(destination.location?.lng)
                ? <MapView lat={destination.location.lat} lng={destination.location.lng} title={destination.title} address={destination.location?.address} className="h-80 w-full" />
                : <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Map coordinates are not available for this destination.</p>}
            </div>

            {/* Reviews Section */}
            <div className="glass-card p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-neon" />
                  <span>Traveler Feedback & Reviews</span>
                </h2>
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="text-white">{destination.rating?.toFixed(1) || '4.8'} / 5.0</span>
                </div>
              </div>

              {/* Post Review Form */}
              {isAuthenticated ? (
                <form onSubmit={handleReviewSubmit} className="p-5 rounded-2xl bg-navy-950/70 border border-blue-electric/25 space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Submit Verified Traveler Review
                  </h4>

                  {/* 5-Star Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setUserRating(star)}
                          className="p-1 text-amber-400 hover:scale-125 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= userRating ? 'fill-amber-400' : 'text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs text-amber-400 font-bold ml-2">
                      {userRating} Stars
                    </span>
                  </div>

                  <textarea
                    rows="3"
                    required
                    placeholder="Share your experience, travel tips, best time of day, crowd conditions..."
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    className="glass-input w-full text-xs"
                  />

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="glass-button-primary text-xs uppercase tracking-wider py-2.5 px-5 flex items-center gap-2"
                  >
                    {submittingReview ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Posting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Review</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="p-5 rounded-2xl bg-navy-950/70 border border-blue-electric/25 text-center space-y-2">
                  <p className="text-xs text-slate-300">
                    Have you visited {destination.title}? Sign in to share your review and tips.
                  </p>
                  <Link to="/login" className="glass-button-primary inline-block text-xs uppercase py-2 px-4">
                    Sign In to Review
                  </Link>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-3">
                {reviews.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    No reviews posted yet. Be the first traveler to review this place!
                  </p>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev._id}
                      className="p-4 rounded-xl bg-navy-950/50 border border-white/5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-royal/60 border border-blue-electric/30 text-white font-bold text-xs flex items-center justify-center">
                            {rev.user?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{rev.user?.name}</p>
                            <p className="text-[10px] text-slate-400">
                              {rev.user?.city || 'Traveler'} •{' '}
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed pl-9">
                        {rev.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right 1 Col: Crowd Safety Meter & Live Weather Widget */}
          <div className="space-y-6">
            {/* CROWD SAFETY INDICATOR WIDGET */}
            <div className="glass-card p-6 space-y-5 border-blue-electric/30">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-blue-neon" />
                  <span>Crowd Safety Meter</span>
                </h3>
                <CrowdBadge
                  level={destination.crowdStatus}
                  percentage={destination.crowdPercentage}
                  size="sm"
                />
              </div>

              {/* Density Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">YatraLok crowd estimate</span>
                  <span className="font-mono font-bold text-blue-neon">
                    {destination.crowdPercentage ?? '—'}%
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-black-deep overflow-hidden border border-blue-electric/30 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      destination.crowdStatus === 'low'
                        ? 'bg-emerald-500 shadow-glow-safe'
                        : destination.crowdStatus === 'moderate'
                        ? 'bg-amber-500 shadow-glow-warning'
                        : 'bg-red-500 shadow-glow-danger'
                    }`}
                    style={{ width: `${Math.max(0, Math.min(100, destination.crowdPercentage || 0))}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-navy-950/70 border border-blue-electric/25 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Crowd-based planning risk
                  </span>
                  <span className="text-xl font-black text-slate-900">
                    {crowdRisk.level}
                  </span>
                  <p className="text-xs text-slate-600 mt-1">{crowdRisk.reason}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-slate-500">Crowd indicators are YatraLok estimates, not verified physical counts.</p>
            </div>

            {/* LIVE WEATHER WIDGET */}
            <div className="glass-card p-6 space-y-4 border-blue-electric/30">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CloudSun className="w-4 h-4 text-amber-400" />
                  <span>Weather & safety</span>
                </h3>
                <span className="text-xs text-slate-500">No live feed</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-slate-900">Forecast unavailable</span>
                  <p className="text-sm text-slate-600 mt-1">A verified weather provider is not connected.</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <CloudSun className="w-7 h-7" />
                </div>
              </div>

              <p className="text-sm text-slate-700">Current rainfall, flood, landslide, snow and road conditions are not available from connected data sources.</p>
              {mountainDestination && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">General mountain guidance: allow time to acclimatize and verify current access, snow and road conditions with local authorities before departure.</p>}
            </div>

            {/* Travel Essentials Card */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-white/10">
                <Ticket className="w-4 h-4 text-blue-neon" />
                <span>Visit Logistics</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-electric" /> Timings:
                  </span>
                  <span className="font-semibold text-slate-900">{destination.timings || 'Not recorded'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-electric" /> Ideal Season:
                  </span>
                  <span className="font-semibold text-slate-900">{destination.bestTimeToVisit || 'Not recorded'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-electric" /> YatraLok tourist count:
                  </span>
                  <span className="font-semibold text-slate-900">Not provided</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetailsPage;
