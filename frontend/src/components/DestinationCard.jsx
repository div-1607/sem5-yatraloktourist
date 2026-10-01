import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Star,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Sun,
  CloudSun,
  CloudFog,
  Wind,
  Thermometer,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getOptimizedWebPUrl,
  formatCategoryName,
  getDestinationWeather,
  getDestinationSafetyScore,
} from '../utils/destinationUtils';

/**
 * Weather Icon Renderer
 */
const WeatherIcon = ({ type, className = 'w-3.5 h-3.5' }) => {
  switch (type) {
    case 'mountain':
      return <CloudFog className={`${className} text-sky-500`} />;
    case 'coastal':
      return <Sun className={`${className} text-amber-500`} />;
    case 'sunny':
      return <Sun className={`${className} text-amber-500`} />;
    case 'pleasant':
    default:
      return <CloudSun className={`${className} text-blue-500`} />;
  }
};

/**
 * Universal Consistent Destination Card
 * Used identically for all categories: Tourist Places, Temples, Historical Sites,
 * Cafes, Shopping, Beaches, Airports, Hill Stations.
 */
const DestinationCard = ({ destination }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const { toggleFavorite, isFavorite } = useAuth();
  const navigate = useNavigate();

  const destId = destination._id || destination.id;
  const favorited = isFavorite ? isFavorite(destId) : false;
  const destLink = `/destinations/${destination.slug || destId}`;

  // Process data with unified utilities
  const rawImageUrl = destination.images?.[0] || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80';
  const webpImageUrl = getOptimizedWebPUrl(rawImageUrl, 800, 82);
  const categoryLabel = formatCategoryName(destination.category);
  const weather = getDestinationWeather(destination);
  const safetyScore = getDestinationSafetyScore(destination);

  const ratingValue = destination.rating ? Number(destination.rating).toFixed(1) : '4.6';
  const reviewsCount = destination.numReviews || 0;
  const locationText = destination.city
    ? `${destination.city}, ${destination.state || 'India'}`
    : destination.state || 'India';

  const crowdLevel = (destination.crowdStatus || 'low').toLowerCase();
  const crowdPercentage = destination.crowdPercentage != null ? destination.crowdPercentage : (crowdLevel === 'high' ? 82 : crowdLevel === 'moderate' ? 54 : 26);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (toggleFavorite) {
      toggleFavorite(destId);
    }
  };

  const handleCardClick = (e) => {
    // Avoid triggering card navigation if clicking interactive buttons
    if (e.target.closest('button')) return;
    navigate(destLink);
  };

  const handleViewDetails = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(destLink);
  };

  return (
    <article
      onClick={handleCardClick}
      className="group relative bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs hover:shadow-[0_20px_45px_-12px_rgba(30,58,138,0.18)] hover:border-blue-300/80 transition-all duration-300 flex flex-col h-full cursor-pointer hover:-translate-y-1.5 focus-within:ring-2 focus-within:ring-blue-500"
    >
      {/* 1. Large Optimized Image Container */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-100">
        {/* Skeleton shimmer before image decode */}
        {!imageLoaded && !imageFailed && (
          <div className="absolute inset-0 bg-slate-200 animate-pulse" />
        )}

        <picture>
          <source srcSet={webpImageUrl} type="image/webp" />
          <img
            src={rawImageUrl}
            alt={destination.title || destination.name || 'Travel Destination'}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              if (!imageFailed) {
                setImageFailed(true);
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80';
              }
            }}
            className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </picture>

        {/* Ambient Dark Gradient Vignette for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-black/20 pointer-events-none" />

        {/* Top-Left: Category Badge */}
        <div className="absolute top-3.5 left-3.5 z-10">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold tracking-wide bg-white/95 backdrop-blur-md text-slate-800 shadow-sm border border-white/70">
            {categoryLabel}
          </span>
        </div>

        {/* Top-Right: Bookmark / Favorite Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className="absolute top-3.5 right-3.5 z-10 p-2.5 rounded-full bg-white/90 backdrop-blur-md text-slate-600 hover:text-red-500 hover:bg-white active:scale-90 transition-all duration-200 shadow-sm cursor-pointer border border-white/70"
          title={favorited ? 'Remove from saved' : 'Save destination'}
          aria-label={favorited ? 'Remove from saved' : 'Save destination'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              favorited ? 'fill-red-500 text-red-500' : 'text-slate-600'
            }`}
          />
        </button>

        {/* Bottom-Left inside image: Weather Badge */}
        <div className="absolute bottom-3 left-3.5 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-xs font-semibold shadow-md border border-white/10">
          <WeatherIcon type={weather.type} />
          <span>{weather.temp}</span>
          <span className="text-slate-300 font-normal">• {weather.condition}</span>
        </div>
      </div>

      {/* 2. Structured Card Content Area */}
      <div className="p-5 sm:p-6 flex flex-col flex-grow justify-between space-y-4">
        <div className="space-y-2">
          {/* Location line */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 tracking-wide">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-blue-600" />
            <span className="truncate">{locationText}</span>
          </div>

          {/* Destination Name */}
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors line-clamp-1">
            {destination.title || destination.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {destination.shortDescription ||
              destination.description ||
              'Experience iconic landmarks, cultural treasures, and scenic vistas.'}
          </p>
        </div>

        {/* 3. Essential Telemetry Row: Crowd Status & Safety Score */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
          {/* Crowd Status Pill */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold ${
              crowdLevel === 'high'
                ? 'bg-red-50 text-red-700 border border-red-200/70'
                : crowdLevel === 'moderate'
                ? 'bg-amber-50 text-amber-800 border border-amber-200/70'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                crowdLevel === 'high'
                  ? 'bg-red-500 animate-pulse'
                  : crowdLevel === 'moderate'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            />
            <span className="truncate capitalize">
              {crowdLevel} Crowd ({crowdPercentage}%)
            </span>
          </div>

          {/* Safety Score Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-teal-50 text-teal-800 border border-teal-200/70">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="truncate">Safety {safetyScore}/10</span>
          </div>
        </div>

        {/* 4. Action Row: Rating & "View Details" Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          {/* Rating */}
          <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-black">{ratingValue}</span>
            {reviewsCount > 0 && (
              <span className="text-slate-400 font-normal">
                ({reviewsCount > 999 ? `${(reviewsCount / 1000).toFixed(1)}k` : reviewsCount})
              </span>
            )}
          </div>

          {/* View Details CTA Button */}
          <button
            type="button"
            onClick={handleViewDetails}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold text-xs transition-all duration-200 shadow-2xs group-hover:bg-blue-600 group-hover:text-white cursor-pointer"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default DestinationCard;
