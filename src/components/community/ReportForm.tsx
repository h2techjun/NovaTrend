'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Send, CheckCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import type { ReportTargetType } from '@/types/community';
import { useTranslations } from 'next-intl';

interface ReportFormProps {
  targetType: ReportTargetType;
  targetId: number;
  onClose: () => void;
}

export default function ReportForm({ targetType, targetId, onClose }: ReportFormProps) {
  const t = useTranslations('community.report');
  const tCommon = useTranslations('common');
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const REPORT_REASONS = [
    { value: 'spam', label: t('reasons.spam') },
    { value: 'hate', label: t('reasons.hate') },
    { value: 'harassment', label: t('reasons.harassment') },
    { value: 'misinformation', label: t('reasons.misinformation') },
    { value: 'copyright', label: t('reasons.copyright') },
    { value: 'nsfw', label: t('reasons.nsfw') },
    { value: 'other', label: t('reasons.other') },
  ];

  const supabase = createClient();

  const handleSubmit = async () => {
    if (!user) return;
    if (!reason) {
      setError(t('errorReason'));
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from('reports').insert({
      reporter_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reason,
      description: description.trim() || null,
      status: 'pending',
    });

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="w-full max-w-md rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-2xl overflow-hidden"
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h3 className="text-base font-bold">{t('title')}</h3>
            </div>
            <button onClick={onClose}>
              <X className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
            </button>
          </div>

          <div className="p-5">
            {submitted ? (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h4 className="text-lg font-bold mb-2">{t('success')}</h4>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                  {t('successDesc')}
                </p>
                <button
                  onClick={onClose}
                  className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  {tCommon('confirm')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 신고 사유 */}
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] mb-2 block">
                    {t('reason')} *
                  </label>
                  <div className="space-y-1.5">
                    {REPORT_REASONS.map((r) => (
                      <label
                        key={r.value}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                          reason === r.value
                            ? 'bg-brand-600/10 text-brand-600 font-medium'
                            : 'hover:bg-[hsl(var(--muted))]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={r.value}
                          checked={reason === r.value}
                          onChange={(e) => setReason(e.target.value)}
                          className="accent-brand-600"
                        />
                        {r.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* 상세 설명 */}
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] mb-2 block">
                    {t('description')}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('descriptionPlaceholder')}
                    rows={3}
                    className="w-full rounded-xl bg-[hsl(var(--muted))] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-600 resize-none"
                  />
                </div>

                {/* 에러 */}
                {error && (
                  <p className="text-xs text-red-500 bg-red-500/10 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                {/* 제출 */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !reason}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {t('submit')}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
