import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, MapPin, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import CrowdBadge from './CrowdBadge';
import { useAuth } from '../context/AuthContext';

const DestinationCard = ({ destination }) => {
  const { toggleFavorite, isFavorite } = useAuth();
  const favorited = isFavorite(destination._id);

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(destination._id);
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="group relative bg-navy-900/40 backdrop-blur-xl border border-white/10 hover:border-amber-500/40 rounded-2xl overflow-hidden shadow-glass hover:shadow-glass-hover flex flex-col h-full"
    >
      {/* Thumbnail */}
      <div className="relative h-52 w-full overflow-hidden bg-navy-950">
        <img
          src={
            destination.images?.[0] ||
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80'
          }
          alt={destination.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-black/30" />

        {/* Crowd Badge */}
        <div className="absolute top-3 left-3">
          <CrowdBadge
            level={destination.crowdStatus}
            percentage={destination.crowdPercentage}
            size="sm"
          />
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 p-2.5 rounded-full bg-navy-950/60 backdrop-blur-md border border-white/15 text-slate-200 hover:text-rose-500 hover:bg-white/10 active:scale-90 transition-all duration-200"
          title={favorited ? 'Remove from saved' : 'Save destination'}
        >
          <Heart
            className={`w-4 h-4 ${
              favorited ? 'fill-rose-500 text-rose-500' : 'text-slate-200'
            }`}
          />
        </button>

        {/* Category Tag */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
            {destination.category}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Location Hierarchy */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5 font-medium">
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">
            {destination.city}, {destination.state}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1 mb-2">
          {destination.title}
        </h3>

        {/* Description snippet */}
        <p className="text-xs text-slate-300/80 line-clamp-2 mb-4 leading-relaxed flex-grow">
          {destination.shortDescription || destination.description}
        </p>

        {/* Footer info: Rating & Details link */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs mt-auto">
          <div className="flex items-center gap-1 text-amber-400 font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{destination.rating?.toFixed(1) || '4.5'}</span>
            <span className="text-slate-400 font-normal">
              ({destination.numReviews || 0})
            </span>
          </div>

          <Link
            to={`/destinations/${destination.slug || destination._id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 group-hover:translate-x-0.5 transition-all"
          >
            <span>Explore</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default DestinationCard;
