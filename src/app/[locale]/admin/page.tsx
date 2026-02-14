'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Users,
  FileText,
  AlertTriangle,
  Ban,
  Trash2,
  UserCheck,
  UserX,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRole } from '@/hooks/useRole';
import LevelBadge from '@/components/community/LevelBadge';

type Tab = 'users' | 'reports' | 'posts';

interface UserRow {
  id: string;
  username: string;
  display_name: string | null;
  role: string;
  xp: number;
  level: number;
  created_at: string;
}

interface ReportRow {
  id: number;
  reporter_id: string;
  target_type: string;
  target_id: number;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  reporter?: { username: string };
}

export default function AdminPage() {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const { user } = useAuth();
  const { canModerate, isMaster, loading: roleLoading } = useRole();
  const [tab, setTab] = useState<Tab>('users');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // 유저 목록 조회
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name, role, xp, level, created_at')
      .order('created_at', { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  }, [supabase]);

  // 신고 목록 조회
  const fetchReports = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reports')
      .select('*, reporter:profiles!reports_reporter_id_fkey(username)')
      .order('created_at', { ascending: false });
    if (data) setReports(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (!canModerate) return;
    if (tab === 'users') fetchUsers();
    if (tab === 'reports') fetchReports();
  }, [tab, canModerate, fetchUsers, fetchReports]);

  // 관리자 지정/해제 (총관리자 전용)
  const toggleAdmin = async (userId: string, currentRole: string) => {
    if (!isMaster) return;
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    fetchUsers();
  };

  // 유저 제재
  const sanctionUser = async (userId: string, level: string) => {
    const reason = prompt(t('sanctions.reasonPrompt', { level }));
    if (!reason) return;

    const expiresAt = level === 'temp_ban'
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      : level === 'permanent_ban' ? null : null;

    await supabase.from('sanctions').insert({
      user_id: userId,
      level,
      reason,
      expires_at: expiresAt,
    });

    // 경고 시 XP 차감
    if (level === 'warning') {
      await supabase.rpc('add_xp', { target_user_id: userId, amount: -50 });
    }

    alert(t('sanctions.applied'));
  };

  // 신고 상태 변경
  const updateReportStatus = async (reportId: number, status: string) => {
    await supabase.from('reports').update({ status, resolved_at: new Date().toISOString() }).eq('id', reportId);
    fetchReports();
  };

  // 게시글/댓글 삭제
  const deleteContent = async (targetType: string, targetId: number) => {
    if (!confirm(t('sanctions.confirmDelete'))) return;
    if (targetType === 'post') {
      await supabase.from('posts').update({ is_deleted: true }).eq('id', targetId);
    } else if (targetType === 'comment') {
      await supabase.from('comments').update({ is_deleted: true }).eq('id', targetId);
    }
    alert(tCommon('success') || 'Deleted.');
  };

  // 권한 없음
  if (!roleLoading && !canModerate) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">{tCommon('unauthorized')}</h1>
        <p className="text-[hsl(var(--muted-foreground))]">{tCommon('adminOnly')}</p>
      </div>
    );
  }

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
          <Shield className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{t('title')}</h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {isMaster ? `👑 ${t('roles.master')}` : `🛡️ ${t('roles.admin')}`}
          </p>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-6 border-b border-[hsl(var(--border))]">
        {[
          { key: 'users' as Tab, label: t('tabs.users'), icon: Users },
          { key: 'reports' as Tab, label: t('tabs.reports'), icon: AlertTriangle },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* 콘텐츠 */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
        </div>
      ) : tab === 'users' ? (
        <div className="space-y-2">
          {users.map((u) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 p-3 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))/50] transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600/10 text-sm font-bold text-brand-600 shrink-0">
                {(u.display_name || u.username)[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{u.display_name || u.username}</span>
                  <LevelBadge xp={u.xp} level={u.level} />
                  {u.role === 'master' && <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded-full font-bold">👑 {t('roles.master')}</span>}
                  {u.role === 'admin' && <span className="text-[10px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded-full font-bold">🛡️ {t('roles.admin')}</span>}
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">@{u.username} · XP: {u.xp}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {/* 총관리자만 관리자 지정/해제 가능 */}
                {isMaster && u.role !== 'master' && (
                  <button
                    onClick={() => toggleAdmin(u.id, u.role)}
                    className={`p-2 rounded-lg text-xs ${
                      u.role === 'admin' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'
                    } hover:opacity-80`}
                    title={u.role === 'admin' ? t('users.removeAdmin') : t('users.giveAdmin')}
                  >
                    {u.role === 'admin' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                  </button>
                )}
                {/* 제재 */}
                {u.role === 'user' && (
                  <>
                    <button
                      onClick={() => sanctionUser(u.id, 'warning')}
                      className="p-2 rounded-lg bg-yellow-500/10 text-yellow-600 hover:opacity-80"
                      title={tCommon('status.error')}
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => sanctionUser(u.id, 'temp_ban')}
                      className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:opacity-80"
                      title={t('sanctions.tempBan7d')}
                    >
                      <Ban className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {reports.length === 0 ? (
            <p className="text-center text-sm text-[hsl(var(--muted-foreground))] py-12">{t('reports.noReports')}</p>
          ) : (
            reports.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-xl border border-[hsl(var(--border))]"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        r.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' :
                        r.status === 'resolved' ? 'bg-green-500/10 text-green-600' :
                        'bg-gray-500/10 text-gray-500'
                      }`}>
                        {r.status === 'pending' ? t('reports.pending') : r.status === 'resolved' ? t('reports.resolved') : r.status === 'dismissed' ? t('reports.dismiss') : r.status}
                      </span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">
                        {r.target_type === 'post' ? t('tabs.posts') : r.target_type === 'comment' ? t('tabs.reports') : r.target_type} #{r.target_id}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{r.reason}</p>
                    {r.description && <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{r.description}</p>}
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1">
                      {t('reports.reporter')}: @{r.reporter?.username || 'Unknown'} · {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {r.status === 'pending' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { deleteContent(r.target_type, r.target_id); updateReportStatus(r.id, 'resolved'); }}
                        className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:opacity-80 text-xs"
                        title={t('sanctions.deleteAndResolve')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => updateReportStatus(r.id, 'dismissed')}
                        className="px-3 py-1.5 rounded-lg bg-[hsl(var(--muted))] text-xs font-medium hover:opacity-80"
                      >
                        {t('reports.dismiss')}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
