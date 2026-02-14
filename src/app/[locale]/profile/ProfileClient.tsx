'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Shield, Star, Calendar, TrendingUp,
  Award, Bell, Settings, LogOut, Flame, Loader2,
  ChevronRight, Zap, Target, History
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase';
import { useRouter } from '@/navigation';
import { getLevel, getNextLevel, getLevelProgress } from '@/lib/level';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { ProfileSkeleton } from '@/components/ui/Skeleton';

interface AttendanceRecord {
  checked_date: string;
}

export default function PrivateProfileClient() {
  const t = useTranslations('profile.private');
  const tLevel = useTranslations('level');
  const tCommon = useTranslations('common');
  
  const { user, profile, loading: authLoading, signOut, refreshProfile } = useAuth();
  const router = useRouter();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [todayChecked, setTodayChecked] = useState(false);
  const [streak, setStreak] = useState(0);
  const [checkingIn, setCheckingIn] = useState(false);

  const supabase = createClient();
  const xp = profile?.points ?? 0;
  const level = getLevel(xp);
  const nextLevel = getNextLevel(level);
  const progress = getLevelProgress(xp);

  // 출석 기록 로드
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('attendance')
        .select('checked_date')
        .eq('user_id', user.id)
        .order('checked_date', { ascending: false })
        .limit(30);

      if (data) {
        setAttendance(data);
        const today = new Date().toISOString().slice(0, 10);
        setTodayChecked(data.some((r) => r.checked_date === today));

        // 연속 출석 계산
        let s = 0;
        const sorted = [...data].sort((a, b) => b.checked_date.localeCompare(a.checked_date));
        for (let i = 0; i < sorted.length; i++) {
          const expected = new Date();
          expected.setDate(expected.getDate() - i);
          const exp = expected.toISOString().slice(0, 10);
          if (sorted[i].checked_date === exp) {
            s++;
          } else break;
        }
        setStreak(s);
      }
    })();
  }, [user, supabase]);

  // 출석 체크
  const handleCheckIn = async () => {
    if (!user || todayChecked || checkingIn) return;
    setCheckingIn(true);
    const today = new Date().toISOString().slice(0, 10);

    const { error } = await supabase.from('attendance').insert({
      user_id: user.id,
      checked_date: today,
    });

    if (!error) {
      await supabase.rpc('increment_xp', { user_id: user.id, amount: 10 });
      setTodayChecked(true);
      setStreak((s) => s + 1);
      setAttendance((prev) => [{ checked_date: today }, ...prev]);
      await refreshProfile();
    }
    setCheckingIn(false);
  };

  if (authLoading) return <ProfileSkeleton />;

  if (!user || !profile) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
           <User className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />
        </div>
        <h2 className="text-2xl font-black mb-2">{t('loginRequired')}</h2>
        <p className="text-[hsl(var(--muted-foreground))] mb-8">
          {t('loginRequiredDesc')}
        </p>
        <button 
          onClick={() => router.push('/')}
          className="rounded-xl bg-brand-600 px-8 py-3 font-bold text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700 transition-all"
        >
          {tCommon('login')}
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* 프로필 헤더 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 overflow-hidden group shadow-xl shadow-black/5"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
          {/* 아바타 & 레벨 아이콘 */}
          <div className="relative group/avatar">
            <div className="h-32 w-32 rounded-full p-1 bg-gradient-to-br from-brand-500 via-purple-500 to-pink-500 animate-gradient-xy">
              <div className="h-full w-full rounded-full bg-[hsl(var(--card))] p-1">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-[hsl(var(--muted))] text-3xl font-black text-brand-600">
                    {profile.display_name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <motion.div 
              whileHover={{ scale: 1.2, rotate: 15 }}
              className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-xl text-2xl"
            >
              {level.icon}
            </motion.div>
          </div>

          {/* 정보 섹션 */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-1">
                <h1 className="text-3xl font-black tracking-tight">{profile.display_name}</h1>
                <span className="rounded-full bg-brand-600/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-600 border border-brand-600/20">
                  {profile.plan || 'free'}
                </span>
              </div>
              <p className="text-[hsl(var(--muted-foreground))] font-medium">@{profile.username}</p>
              {profile.bio && (
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))] leading-relaxed max-w-md mx-auto md:mx-0">
                  {profile.bio}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[hsl(var(--muted))] border border-transparent transition-all", level.color.replace('text-', 'bg-').concat('/10'))}>
                <span className={cn("text-sm font-bold", level.color)}>{tLevel(level.name)}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
                 <Zap className="h-3.5 w-3.5 text-amber-500" />
                 <span className="text-sm font-bold">{xp} XP</span>
              </div>
            </div>

            {/* XP 진행 바 */}
            <div className="space-y-2">
              <div className="flex justify-between items-end px-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
                   {t('levelProgress')}
                </span>
                <span className="text-xs font-bold font-mono">
                  {nextLevel.max !== Infinity ? `${xp} / ${nextLevel.max} XP` : t('maxLevel')}
                </span>
              </div>
              <div className="h-3 rounded-full bg-[hsl(var(--muted))] p-0.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 통계 카드 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Star, label: t('stats.points'), value: profile.points ?? 0, color: 'text-amber-400', bg: 'bg-amber-400/10' },
          { icon: Flame, label: t('stats.streak'), value: `${streak}d`, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { icon: Target, label: t('stats.accuracy'), value: '94%', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { icon: History, label: t('stats.activity'), value: '1,248', color: 'text-brand-500', bg: 'bg-brand-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * i }}
            className="group rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 hover:border-brand-500/30 transition-all hover:shadow-lg active:scale-[0.98]"
          >
            <div className={cn("mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110", stat.bg)}>
               <stat.icon className={cn("h-6 w-6", stat.color)} />
            </div>
            <div className="text-center">
              <p className="text-2xl font-black tracking-tight">{stat.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mt-1">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 출석 체크 프리미엄 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-xl shadow-black/5"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600/10 text-brand-600">
               <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black">{t('checkInTitle')}</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('checkInSubtitle')}</p>
            </div>
          </div>
          
          <button
            onClick={handleCheckIn}
            disabled={todayChecked || checkingIn}
            className={cn(
              "relative group overflow-hidden rounded-2xl px-8 py-3.5 font-black text-sm transition-all active:scale-[0.95] disabled:opacity-50",
              todayChecked
                ? "bg-emerald-500/10 text-emerald-600 cursor-default border border-emerald-500/20"
                : "bg-brand-600 text-white hover:bg-brand-700 shadow-xl shadow-brand-600/30"
            )}
          >
            {checkingIn ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : todayChecked ? (
              <span className="flex items-center gap-2">
                 <Star className="h-4 w-4 fill-current" /> {t('checkInDone')}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                 <Zap className="h-4 w-4 fill-current group-hover:animate-bounce" /> {t('checkInAction')}
              </span>
            )}
            {!todayChecked && !checkingIn && (
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out" />
            )}
          </button>
        </div>

        {/* 출석 캘린더 피드백 */}
        <div className="grid grid-cols-7 gap-3">
          {Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dateStr = d.toISOString().slice(0, 10);
            const checked = attendance.some((r) => r.checked_date === dateStr);
            const isToday = i === 6;
            
            return (
              <div
                key={dateStr}
                className={cn(
                  "relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all",
                  checked
                    ? "bg-brand-600/5 border-brand-600/20"
                    : isToday
                      ? "bg-[hsl(var(--muted))] border-brand-600 shadow-inner"
                      : "bg-[hsl(var(--muted))] border-transparent opacity-60"
                )}
              >
                <span className="text-[10px] font-black uppercase text-[hsl(var(--muted-foreground))]">
                   {d.toLocaleDateString(tCommon('localeAbbr'), { weekday: 'short' })}
                </span>
                <span className={cn("text-lg", checked ? "animate-in zoom-in-50 duration-300" : "")}>
                   {checked ? '🔥' : '❄️'}
                </span>
                {isToday && !checked && (
                   <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
                   </span>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* 액션 링크 섹션 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => router.push('/settings')}
          className="group flex items-center justify-between rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 hover:border-brand-500/30 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] group-hover:bg-brand-600/10 group-hover:text-brand-600 transition-colors">
              <Settings className="h-6 w-6" />
            </div>
            <div className="text-left">
              <p className="font-bold">{t('settings')}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{t('settingsDesc')}</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-[hsl(var(--muted-foreground))] group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={async () => { await signOut(); router.push('/'); }}
          className="group flex items-center justify-between rounded-3xl border border-red-500/20 bg-red-500/[0.03] p-6 hover:bg-red-500/[0.08] transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 transition-colors">
              <LogOut className="h-6 w-6" />
            </div>
            <div className="text-left">
              <p className="font-bold text-red-500">{tCommon('logout')}</p>
              <p className="text-xs text-red-500/60">{t('logoutDesc')}</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-red-500/40 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
