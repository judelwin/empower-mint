import { ReactNode } from 'react';

interface XPBadgeProps {
  xp: number;
  level?: number;
  size?: 'sm' | 'md' | 'lg';
  showLevel?: boolean;
}

export default function XPBadge({ xp, level, size = 'md', showLevel = true }: XPBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const calculatedLevel = level ?? Math.floor(xp / 100);

  return (
    <div className={`inline-flex items-center gap-2 bg-primary-100 text-primary-700 rounded-full font-semibold ${sizeClasses[size]}`}>
      {showLevel && (
        <span className="flex items-center justify-center w-6 h-6 bg-primary-600 text-white rounded-full text-xs">
          {calculatedLevel}
        </span>
      )}
      <span>{xp.toLocaleString()} XP</span>
    </div>
  );
}

