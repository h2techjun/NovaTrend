'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';

import { LEVELS } from '@/lib/level';

export interface LevelInfo {
  level: number;
  xp: number;
  name: string;
  icon: string;
  color: string;
  nextLevelXp: number;
  progress: number; // 0~100 현재 레벨 내 진행률
  loading: boolean;
}

export function getLevelInfo(xp: number, level: number) {
  const config = LEVELS.find((c) => c.level === level) || LEVELS[0];
  const nextConfig = LEVELS.find((c) => c.level === level + 1);
  const nextLevelXp = nextConfig ? nextConfig.min : config.max;
  const currentMin = config.min;
  const range = (nextLevelXp === Infinity ? 0 : nextLevelXp) - currentMin;
  const progress = range > 0 ? Math.min(((xp - currentMin) / range) * 100, 100) : 100;

  return {
    level: config.level,
    name: config.name,
    icon: config.icon,
    color: config.color,
    nextLevelXp,
    progress,
  };
}

export function getLevelConfig() {
  return LEVELS;
}

/**
 * 현재 유저의 레벨/XP 정보를 조회하는 hook
 */
export function useLevel(): LevelInfo {
  const { user } = useAuth();
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetch = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('xp, level')
        .eq('id', user.id)
        .single();

      if (data) {
        setXp(data.xp || 0);
        setLevel(data.level || 1);
      }
      setLoading(false);
    };

    fetch();
  }, [user, supabase]);

  const info = getLevelInfo(xp, level);

  return {
    ...info,
    xp,
    loading,
  };
}
