'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import type { Sanction, SanctionLevel } from '@/types/community';

interface SanctionState {
  loading: boolean;
  isBanned: boolean;
  activeSanction: Sanction | null;
  level: SanctionLevel | null;
  /** 임시 정지 남은 시간 (ms) */
  remainingMs: number | null;
  /** 글쓰기 가능 여부 */
  canWrite: boolean;
}

/**
 * 현재 유저의 활성 제재 상태를 확인합니다.
 * - warning: 글쓰기 가능, 경고 배너 표시
 * - temp_ban: 만료 전까지 글쓰기 차단
 * - permanent_ban: 영구 글쓰기 차단
 */
export function useSanction(): SanctionState {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeSanction, setActiveSanction] = useState<Sanction | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setActiveSanction(null);
      return;
    }

    const supabase = createClient();

    async function checkSanction() {
      // 가장 최근의 활성 제재를 가져옴
      const { data } = await supabase
        .from('sanctions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        // 임시 정지의 경우 만료 확인
        if (data.level === 'temp_ban' && data.expires_at) {
          const isExpired = new Date(data.expires_at).getTime() < Date.now();
          setActiveSanction(isExpired ? null : data);
        } else {
          setActiveSanction(data);
        }
      } else {
        setActiveSanction(null);
      }

      setLoading(false);
    }

    checkSanction();
  }, [user]);

  const level = activeSanction?.level ?? null;
  const isBanned = level === 'temp_ban' || level === 'permanent_ban';
  const canWrite = !isBanned;

  const remainingMs = activeSanction?.expires_at
    ? Math.max(0, new Date(activeSanction.expires_at).getTime() - Date.now())
    : null;

  return {
    loading,
    isBanned,
    activeSanction,
    level,
    remainingMs,
    canWrite,
  };
}
