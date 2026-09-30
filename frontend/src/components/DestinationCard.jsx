import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, MapPin, ArrowUpRight, Users, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Hill station destination keys that have geofencing safety data
const SAFETY_KEYS = new Set([
  'shimla', 'jammu-kashmir', 'mussoorie', 'rishikesh',
  'manali', 'nainital', 'ooty', 'darjeeling',
]);

// Map destination names/cities to safety keys for search matching
const SAFETY_NAME_MAP = {
  shimla: 'shimla',
  manali: 'manali',
  mussoorie: 'mussoorie',
  rishikesh: 'rishikesh',
  nainital: 'nainital',
  ooty: 'ooty',
  darjeeling: 'darjeeling',
  'jammu': 'jammu-kashmir',
  'kashmir': 'jammu-kashmir',
  'srinagar': 'jammu-kashmir',
};

const getDestinationSafetyKey = (destination) => {
  // Direct safetyKey
  if (destination.safetyKey && SAFETY_KEYS.has(destination.safetyKey)) return destination.safetyKey;
  // Try matching by title/city
  const titleLower = (destination.title || destination.name || '').toLowerCase();
  const cityLower = (destination.city || '').toLowerCase();
  for (const [name, key] of Object.entries(SAFETY_NAME_MAP)) {
    if (titleLower.includes(name) || cityLower.includes(name)) return key;
  }
  return null;
};

const DestinationCard = ({ destination }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const { toggleFavorite, isFavorite } = useAuth();
  const navigate = useNavigate();
  const favorited = isFavorite(destination._id);
  const destLink = `/destinations/${destination.slug || destination._id}`;
  const safetyKey = getDestinationSafetyKey(destination);

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(destination._id);
  };

  const handleCardClick = (e) => {
    if (e.target.closest('button')) return;
    navigate(destLink);
  };

  const handleSafetyClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/tourist-dashboard', { state: { openSafety: true, safetyDestination: safetyKey } });
  };

  // Realistic fallback image if missing
  const imageUrl =
    destination.images?.[0] ||
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80';

  const ratingValue = destination.rating ? Number(destination.rating).toFixed(1) : '—';
  const reviewsCount = destination.numReviews || 0;
  const locationText = destination.city
    ? `${destination.city}, ${destination.state || 'India'}`
    : destination.state || 'India';

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-[0_18px_48px_-15px_rgba(37,99,235,0.28)] hover:border-blue-200 transition-all duration-300 flex flex-col h-full cursor-pointer hover:-translate-y-1.5"
    >
      {/* Thumbnail Container */}
      <div className="relative h-80 w-full overflow-hidden bg-slate-100">
        {!imageFailed && (
          <img
            src={imageUrl}
            alt={destination.title || destination.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
            onError={(event) => {
              if (event.currentTarget.src !== 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80') {
                event.currentTarget.src = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80';
              } else {
                setImageFailed(true);
              }
            }}
          />
        )}

        {/* Gradient overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Category Pill */}
        {destination.category && (
          <div className="absolute top-3.5 left-3.5">
            <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-white/95 backdrop-blur-md text-slate-800 shadow-sm border border-white/60">
              {destination.category}
            </span>
          </div>
        )}

        {/* Bookmark Heart Button */}
        <button
          type="button"
          onClick={handleFavorite}
          className="absolute top-3.5 right-3.5 p-2.5 rounded-full bg-white/90 backdrop-blur-md text-slate-600 hover:text-red-500 hover:bg-white active:scale-90 transition-all duration-150 shadow-sm cursor-pointer border border-white/60"
          title={favorited ? 'Remove from bookmarks' : 'Save destination'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              favorited ? 'fill-red-500 text-red-500' : 'text-slate-600'
            }`}
          />
        </button>

        {/* Safety Badge for hill stations */}
        {safetyKey && (
          <button
            type="button"
            onClick={handleSafetyClick}
            className="absolute bottom-3 left-3.5 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/95 backdrop-blur-md text-white text-xs font-bold shadow-md hover:bg-emerald-600 transition-colors cursor-pointer border border-emerald-400/60"
            title="View safety & geofencing information"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Safety Info</span>
          </button>
        )}

        {/* Visitor estimate badge */}
        <div className="absolute bottom-3 right-3.5 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-slate-800 text-xs font-bold shadow-sm">
          <Users className="w-4 h-4 text-blue-700" />
          <span>YatraLok est. {destination.visitorCount || 'unavailable'}</span>
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-5 sm:p-6 flex flex-col flex-grow justify-between">
        <div>
          {/* Location Line */}
          <div className="flex items-center gap-1.5 text-sm font-bold text-blue-700 mb-2">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-blue-600" />
            <span className="truncate">{locationText}</span>
          </div>

          <div className="mb-3 flex flex-wrap gap-2 text-sm">
            <span className={`rounded-full px-2.5 py-1 font-bold capitalize ${destination.crowdStatus === 'high' ? 'bg-red-100 text-red-800' : destination.crowdStatus === 'moderate' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'}`}>
              {destination.crowdStatus || 'low'} crowd
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
              {destination.crowdPercentage == null ? 'Estimate unavailable' : `${destination.crowdPercentage}% YatraLok estimate`}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">
            {destination.title || destination.name}
          </h3>

          {/* Short Description */}
          <p className="text-base text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {destination.shortDescription ||
              destination.description ||
              'Experience iconic landmarks, cultural treasures, and scenic vistas.'}
          </p>
        </div>

        {/* Card Footer: Rating & Explore Link */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm mt-auto">
          <div className="flex items-center gap-1.5 font-semibold text-slate-900">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{ratingValue}</span>
            {reviewsCount > 0 && (
              <span className="text-slate-400 font-normal">
                ({reviewsCount.toLocaleString()} reviews)
              </span>
            )}
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
            <span>Explore</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;
