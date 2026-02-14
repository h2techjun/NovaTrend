'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';

export type UserRole = 'user' | 'admin' | 'master';

interface RoleInfo {
  role: UserRole;
  isMaster: boolean;
  isAdmin: boolean;
  canModerate: boolean; // admin 또는 master
  loading: boolean;
}

/**
 * 현재 유저의 역할(role)을 조회하는 hook
 * - user: 일반 유저
 * - admin: 관리자 (게시글/댓글 삭제, 제재)
 * - master: 총관리자 (모든 권한 + 관리자 지정/해제)
 */
export function useRole(): RoleInfo {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setRole('user');
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (data?.role) {
        setRole(data.role as UserRole);
      }
      setLoading(false);
    };

    fetchRole();
  }, [user, supabase]);

  return {
    role,
    isMaster: role === 'master',
    isAdmin: role === 'admin',
    canModerate: role === 'admin' || role === 'master',
    loading,
  };
}
