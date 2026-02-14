'use client';

import { getLevelInfo } from '@/hooks/useLevel';
import { useTranslations } from 'next-intl';

interface LevelBadgeProps {
  xp: number;
  level: number;
  showXp?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 유저 등급 뱃지 — 닉네임 옆에 표시
 */
export default function LevelBadge({ xp, level, showXp = false, size = 'sm' }: LevelBadgeProps) {
  const t = useTranslations('level');
  const info = getLevelInfo(xp, level);

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-0.5',
    md: 'text-sm px-2 py-1 gap-1',
    lg: 'text-base px-3 py-1.5 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${sizeClasses[size]}`}
      style={{ backgroundColor: `${info.color}20`, color: info.color }}
      title={`Lv.${info.level} ${t(info.name)} — ${xp} XP`}
    >
      <span>{info.icon}</span>
      <span>{t(info.name)}</span>
      {showXp && <span className="opacity-70">({xp})</span>}
    </span>
  );
}
