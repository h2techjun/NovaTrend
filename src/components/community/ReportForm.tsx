'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Send, CheckCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import type { ReportTargetType } from '@/types/community';

interface ReportFormProps {
  targetType: ReportTargetType;
  targetId: number;
  onClose: () => void;
}

const REPORT_REASONS = [
  { value: 'spam', label: '스팸 / 광고' },
  { value: 'hate', label: '혐오 발언 / 차별' },
  { value: 'harassment', label: '괴롭힘 / 위협' },
  { value: 'misinformation', label: '허위 정보' },
  { value: 'copyright', label: '저작권 침해' },
  { value: 'nsfw', label: '부적절한 콘텐츠' },
  { value: 'other', label: '기타' },
];

export default function ReportForm({ targetType, targetId, onClose }: ReportFormProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async () => {
    if (!user) return;
    if (!reason) {
      setError('신고 사유를 선택해주세요.');
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
              <h3 className="text-base font-bold">신고하기</h3>
            </div>
            <button onClick={onClose}>
              <X className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
            </button>
          </div>

          <div className="p-5">
            {submitted ? (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h4 className="text-lg font-bold mb-2">신고가 접수되었습니다</h4>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                  운영진이 검토 후 적절한 조치를 취하겠습니다.
                </p>
                <button
                  onClick={onClose}
                  className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  확인
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 신고 사유 */}
                <div>
                  <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] mb-2 block">
                    신고 사유 *
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
                    상세 설명 (선택)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="추가 설명이 있다면 작성해주세요..."
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
                  신고 접수
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
