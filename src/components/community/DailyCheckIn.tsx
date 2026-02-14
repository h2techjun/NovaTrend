'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Sparkles, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';

import { useTranslations } from 'next-intl';

interface DailyCheckInProps {
  onCheckIn?: (xpEarned: number) => void;
}

/**
 * 출석 체크 컴포넌트 — 하루 1회, +5 XP
 */
export default function DailyCheckIn({ onCheckIn }: DailyCheckInProps) {
  const t = useTranslations('community.dailyCheckIn');
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; xpEarned?: number; message?: string } | null>(null);
  const supabase = createClient();

  const handleCheckIn = async () => {
    if (!user || loading) return;

    setLoading(true);

    const { data, error } = await supabase.rpc('daily_check_in', {
      target_user_id: user.id,
    });

    if (error) {
      setResult({ success: false, message: t('error') });
    } else if (data && typeof data === 'object') {
      const res = data as { success: boolean; xp_earned?: number; message?: string };
      if (res.success) {
        setResult({ success: true, xpEarned: res.xp_earned || 5 });
        onCheckIn?.(res.xp_earned || 5);
      } else {
        setResult({ success: false, message: t('alreadyChecked') });
      }
    }

    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
      <div className="flex items-center gap-2 mb-3">
        <CalendarCheck className="h-5 w-5 text-brand-600" />
        <h3 className="text-sm font-bold">{t('title')}</h3>
      </div>

      {result ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-2"
        >
          {result.success ? (
            <>
              <Sparkles className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-amber-600">{t('success', { xp: result.xpEarned ?? 5 })}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{t('nextDay')}</p>
            </>
          ) : (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{result.message}</p>
          )}
        </motion.div>
      ) : (
        <button
          onClick={handleCheckIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CalendarCheck className="h-4 w-4" />
          )}
          {t('submit')}
        </button>
      )}
    </div>
  );
}
