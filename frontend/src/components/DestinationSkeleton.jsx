import React from 'react';

/**
 * High-fidelity Skeleton Loader for Destination Cards with shimmer animation
 */
const DestinationSkeleton = () => {
  return (
    <div className="relative bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs flex flex-col h-full animate-pulse">
      {/* Top Image Placeholder */}
      <div className="relative h-64 sm:h-72 w-full bg-slate-200">
        {/* Shimmer gradient simulation */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

        {/* Category Pill Placeholder */}
        <div className="absolute top-3.5 left-3.5 h-7 w-28 rounded-full bg-white/70" />

        {/* Favorite Button Placeholder */}
        <div className="absolute top-3.5 right-3.5 h-9 w-9 rounded-full bg-white/70" />

        {/* Weather Badge Placeholder */}
        <div className="absolute bottom-3.5 left-3.5 h-6 w-32 rounded-full bg-white/70" />
      </div>

      {/* Content Area */}
      <div className="p-5 sm:p-6 flex flex-col flex-grow justify-between space-y-4">
        <div className="space-y-3">
          {/* Location line */}
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 rounded-full bg-slate-200" />
            <div className="h-3.5 w-32 rounded bg-slate-200" />
          </div>

          {/* Destination Title */}
          <div className="h-6 w-3/4 rounded-md bg-slate-200" />

          {/* Description line */}
          <div className="space-y-1.5 pt-1">
            <div className="h-3.5 w-full rounded bg-slate-100" />
            <div className="h-3.5 w-4/5 rounded bg-slate-100" />
          </div>
        </div>

        {/* Metrics Row: Crowd & Safety Score */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
          <div className="h-7 rounded-xl bg-slate-100" />
          <div className="h-7 rounded-xl bg-slate-100" />
        </div>

        {/* Bottom CTA Row */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="h-4 w-20 rounded bg-slate-100" />
          <div className="h-9 w-28 rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
};

export default DestinationSkeleton;
