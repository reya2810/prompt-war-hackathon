import React from 'react';

export const ReadinessGauge = ({ score = 42, size = 180, label = "Job Readiness" }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (val) => {
    if (val >= 75) return '#10b981'; // emerald
    if (val >= 50) return '#6366f1'; // indigo
    return '#f59e0b'; // amber
  };

  const currentColor = getColor(score);

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          className="text-slate-800"
          fill="transparent"
        />
        {/* Animated fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={currentColor}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          fill="transparent"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-extrabold tracking-tight text-white">
          {score.toFixed(0)}%
        </span>
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-0.5">
          {label}
        </span>
      </div>
    </div>
  );
};

