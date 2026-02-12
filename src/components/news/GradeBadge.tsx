'use client';

import { cn, type SentimentGrade, GRADE_LABELS, GRADE_COLORS } from '@/lib/utils';

interface GradeBadgeProps {
  grade: SentimentGrade;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function GradeBadge({ grade, size = 'md', showLabel = true }: GradeBadgeProps) {
  const label = GRADE_LABELS[grade];
  const color = GRADE_COLORS[grade];

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md font-bold',
        sizeClasses[size]
      )}
      style={{
        backgroundColor: `${color}15`,
        color: color,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {showLabel && label.ko}
    </span>
  );
}
