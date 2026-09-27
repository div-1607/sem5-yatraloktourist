import React from 'react';
import { Users } from 'lucide-react';

const CrowdBadge = ({ level = 'low', percentage, size = 'sm', showPercentage = true }) => {
  const normalizedLevel = (level || 'low').toLowerCase();

  const configs = {
    low: {
      label: 'Low Crowd',
      bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
      textColor: 'text-emerald-300',
    },
    moderate: {
      label: 'Moderate Rush',
      bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
      dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
      textColor: 'text-amber-300',
    },
    high: {
      label: 'Heavy Rush',
      bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
      dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
      textColor: 'text-rose-300',
    },
  };

  const config = configs[normalizedLevel] || configs.low;
  const isSmall = size === 'sm';

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md transition-all ${
        config.bg
      } ${isSmall ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm font-medium'}`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`}
        ></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`}></span>
      </span>
      <span className="font-semibold">{config.label}</span>
      {showPercentage && percentage !== undefined && (
        <span className="opacity-80 text-[11px] font-mono">
          ({percentage}%)
        </span>
      )}
    </div>
  );
};

export default CrowdBadge;
