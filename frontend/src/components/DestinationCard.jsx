import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, MapPin, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import CrowdBadge from './CrowdBadge';
import { useAuth } from '../context/AuthContext';

const DestinationCard = ({ destination }) => {
  const { toggleFavorite, isFavorite } = useAuth();
  const navigate = useNavigate();
  const favorited = isFavorite(destination._id);
  const destLink = `/destinations/${destination.slug || destination._id}`;

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(destination._id);
  };

  const handleCardClick = (e) => {
    // If clicked on favorite button or other button, don't navigate
    if (e.target.closest('button')) return;
    navigate(destLink);
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      onClick={handleCardClick}
      className="group relative bg-black-midnight/70 backdrop-blur-2xl border border-blue-electric/25 hover:border-blue-electric/60 rounded-2xl overflow-hidden shadow-glass hover:shadow-glass-hover flex flex-col h-full transition-all duration-300 cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative h-52 w-full overflow-hidden bg-navy-950">
        <img
          src={
            destination.images?.[0] ||
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80'
          }
          alt={destination.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black-deep via-black-deep/30 to-transparent" />

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
          className="absolute top-3 right-3 p-2.5 rounded-full bg-black-midnight/80 backdrop-blur-md border border-white/15 text-slate-300 hover:text-red-400 hover:bg-black-deep active:scale-90 transition-all duration-200 shadow-glass cursor-pointer"
          title={favorited ? 'Remove from saved' : 'Save destination'}
        >
          <Heart
            className={`w-4 h-4 ${
              favorited ? 'fill-red-500 text-red-500' : 'text-slate-300'
            }`}
          />
        </button>

        {/* Category Tag */}
        <div className="absolute bottom-3 left-3">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-navy-900/80 text-blue-neon border border-blue-electric/40 backdrop-blur-md shadow-glow-electric">
            {destination.category}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Location Hierarchy */}
        <div className="flex items-center gap-1.5 text-xs text-blue-neon mb-1.5 font-medium">
          <MapPin className="w-3.5 h-3.5 text-blue-electric shrink-0" />
          <span className="truncate">
            {destination.city}, {destination.state}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white group-hover:text-blue-electric transition-colors line-clamp-1 mb-2">
          {destination.title}
        </h3>

        {/* Description snippet */}
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed flex-grow">
          {destination.shortDescription || destination.description}
        </p>

        {/* Footer info: Rating & Details link */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs mt-auto">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-white">{destination.rating?.toFixed(1) || '4.8'}</span>
            <span className="text-slate-500 font-normal">
              ({destination.numReviews || 128})
            </span>
          </div>

          <Link
            to={`/destinations/${destination.slug || destination._id}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-neon hover:text-white group-hover:translate-x-1 transition-all"
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
