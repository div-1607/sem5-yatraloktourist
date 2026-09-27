import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  ExternalLink,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CrowdBadge from '../components/CrowdBadge';
import MapView from '../components/MapView';
import toast from 'react-hot-toast';

const DestinationDetailsPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated, toggleFavorite, isFavorite } = useAuth();

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
        fetchDestination(); // reload reviews & updated rating
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
        <p className="text-xs text-slate-400">Loading destination insights...</p>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Destination Not Found</h2>
        <Link to="/destinations" className="glass-button-primary inline-block text-xs uppercase px-5 py-2.5">
          Back to Explorer
        </Link>
      </div>
    );
  }

  const favorited = isFavorite(destination._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Nav Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/destinations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Destinations</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl bg-navy-900/60 border border-white/10 hover:bg-white/5 text-slate-300 transition-all text-xs"
            title="Share Destination"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleFavorite(destination._id)}
            className={`p-2.5 rounded-xl border transition-all text-xs flex items-center gap-1.5 font-semibold ${
              favorited
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-navy-900/60 border-white/10 text-slate-300 hover:text-rose-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-500' : ''}`} />
            <span>{favorited ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Main Title & Hierarchy Badges */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
            {destination.category}
          </span>
          <span className="text-slate-400">&bull;</span>
          <span className="text-slate-300 font-medium">
            {destination.country} &rarr; {destination.state} &rarr; {destination.city}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
          {destination.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1 text-amber-400 font-bold">
            <Star className="w-4 h-4 fill-amber-400" />
            <span className="text-sm">{destination.rating?.toFixed(1)}</span>
            <span className="text-slate-400 font-normal">
              ({destination.numReviews || 0} reviews)
            </span>
          </div>
          <span className="text-slate-600">&bull;</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <MapPin className="w-4 h-4 text-rose-400" />
            <span>{destination.location?.address}</span>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="space-y-4">
        <div className="relative h-96 sm:h-[480px] w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-navy-950">
          <img
            src={destination.images?.[activeImageIndex] || destination.images?.[0]}
            alt={destination.title}
            className="w-full h-full object-cover transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-black/20" />

          {/* Crowd Badge in Hero Image */}
          <div className="absolute top-4 left-4">
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
                className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                  activeImageIndex === idx
                    ? 'border-amber-500 shadow-glow-amber scale-105'
                    : 'border-white/10 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid: Details & Crowd Safety Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Description & Map */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview */}
          <div className="glass-card p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Historical & Cultural Significance</span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {destination.description}
            </p>

            {destination.tags?.length > 0 && (
              <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2">
                {destination.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Map */}
          <div className="glass-card p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-400" />
                <span>Geographic Location & Route</span>
              </h2>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${destination.location?.lat},${destination.location?.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <MapView
              lat={destination.location?.lat}
              lng={destination.location?.lng}
              title={destination.title}
              address={destination.location?.address}
              className="h-80 w-full"
            />
          </div>

          {/* User Reviews Section */}
          <div className="glass-card p-8 space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-400" />
                <span>Traveler Reviews ({reviews.length})</span>
              </h2>
              <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{destination.rating?.toFixed(1)} / 5.0</span>
              </div>
            </div>

            {/* Post Review Form */}
            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} className="p-4 rounded-xl bg-navy-950/60 border border-white/10 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Leave Your Review & Rating
                </h4>

                {/* 5-Star Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300">Rating:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setUserRating(star)}
                        className="p-1 text-amber-400 hover:scale-125 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= userRating ? 'fill-amber-400' : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-amber-300 font-bold ml-2">
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
              <div className="p-4 rounded-xl bg-navy-950/60 border border-white/10 text-center space-y-2">
                <p className="text-xs text-slate-300">
                  Have you visited {destination.title}? Sign in to share your review and tips.
                </p>
                <Link to="/login" className="glass-button-primary inline-block text-xs uppercase py-2 px-4">
                  Log In to Review
                </Link>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  No reviews posted yet. Be the first traveler to review this place!
                </p>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="p-4 rounded-xl bg-navy-950/40 border border-white/5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center">
                          {rev.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{rev.user?.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {rev.user?.city || 'Traveler'} &bull;{' '}
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

        {/* Right 1 Col: Crowd Safety & Travel Facts Widget */}
        <div className="space-y-6">
          {/* CROWD SAFETY INDICATOR WIDGET */}
          <div className="glass-card p-6 space-y-5 border-amber-500/30">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
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
                <span className="text-slate-300">Current Footfall Density</span>
                <span className="font-mono font-bold text-amber-400">
                  {destination.crowdPercentage}%
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-navy-950 overflow-hidden border border-white/10 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    destination.crowdStatus === 'low'
                      ? 'bg-emerald-500'
                      : destination.crowdStatus === 'moderate'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${destination.crowdPercentage}%` }}
                />
              </div>
            </div>

            {/* Safety Advisory Note */}
            <div className="p-3.5 rounded-xl bg-navy-950/70 border border-white/10 text-xs space-y-1.5">
              <span className="font-bold text-amber-400 block">
                Visitor Advisory:
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {destination.crowdStatus === 'low' &&
                  'Optimal visiting time with tranquil surroundings and negligible wait times. Perfect for peaceful exploration.'}
                {destination.crowdStatus === 'moderate' &&
                  'Lively footfall. Average queue times of 15-25 minutes. Follow guidelines and keep your tickets handy.'}
                {destination.crowdStatus === 'high' &&
                  'Heavy rush hours. Keep personal belongings close, ensure children stay accompanied, and expect security checks.'}
              </p>
            </div>

            <Link
              to="/crowd-safety"
              className="w-full text-center text-xs text-amber-400 hover:text-amber-300 font-semibold block pt-1 underline"
            >
              View Full Crowd Telemetry &rarr;
            </Link>
          </div>

          {/* TRAVEL ESSENTIALS CARD */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider pb-3 border-b border-white/10">
              Travel Essentials
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <Ticket className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Entry Fee</span>
                  <span className="text-white font-medium">{destination.entryFee}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Visiting Timings</span>
                  <span className="text-white font-medium">{destination.timings}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Best Time to Visit</span>
                  <span className="text-white font-medium">{destination.bestTimeToVisit}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Emergency Helpline</span>
                  <span className="text-rose-300 font-bold">{destination.emergencyHelpline}</span>
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
