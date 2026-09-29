import React from 'react';

const CrowdBadge = ({ level = 'low', percentage, size = 'sm', showPercentage = true }) => {
  const normalizedLevel = (level || 'low').toLowerCase();

  const configs = {
    low: {
      label: 'Safe • Low Crowd',
      bg: 'bg-emerald-950/50 border-emerald-500/40 text-emerald-400 shadow-glow-safe',
      dot: 'bg-emerald-500 shadow-[0_0_10px_#10B981]',
    },
    safe: {
      label: 'Safe • Low Crowd',
      bg: 'bg-emerald-950/50 border-emerald-500/40 text-emerald-400 shadow-glow-safe',
      dot: 'bg-emerald-500 shadow-[0_0_10px_#10B981]',
    },
    moderate: {
      label: 'Warning • Moderate Crowd',
      bg: 'bg-amber-950/50 border-amber-500/40 text-amber-400 shadow-glow-warning',
      dot: 'bg-amber-500 shadow-[0_0_10px_#F59E0B]',
    },
    warning: {
      label: 'Warning • Moderate Crowd',
      bg: 'bg-amber-950/50 border-amber-500/40 text-amber-400 shadow-glow-warning',
      dot: 'bg-amber-500 shadow-[0_0_10px_#F59E0B]',
    },
    high: {
      label: 'Critical • High Crowd',
      bg: 'bg-red-950/60 border-red-500/50 text-red-400 shadow-glow-danger',
      dot: 'bg-red-500 shadow-[0_0_12px_#EF4444]',
    },
    danger: {
      label: 'Critical • Danger Alert',
      bg: 'bg-red-950/60 border-red-500/50 text-red-400 shadow-glow-danger',
      dot: 'bg-red-500 shadow-[0_0_12px_#EF4444]',
    },
  };

  const config = configs[normalizedLevel] || configs.low;
  const isSmall = size === 'sm';

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border backdrop-blur-xl transition-all ${
        config.bg
      } ${isSmall ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm font-semibold'}`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`}
        />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`} />
      </span>
      <span className="font-bold tracking-wide">{config.label}</span>
      {showPercentage && percentage !== undefined && (
        <span className="opacity-90 text-[11px] font-mono pl-1 border-l border-white/10">
          {percentage}%
        </span>
      )}
    </div>
  );
};

export default CrowdBadge;
