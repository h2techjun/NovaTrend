'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Camera, X, Send, CheckCircle } from 'lucide-react';

/**
 * 🚨 신고 시스템 컴포넌트
 *
 * 기능:
 * - 신고 대상: 게시글, 댓글, 사용자, 쪽지
 * - 신고 사유 선택 + 상세 설명
 * - 스크린샷 첨부 (URL)
 * - 3단계 제재: 경고 → 임시 정지 → 영구 차단
 */

type ReportTarget = 'post' | 'comment' | 'user' | 'message';

interface ReportFormProps {
  targetType: ReportTarget;
  targetId: number;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  { value: 'spam', label: '스팸 / 광고' },
  { value: 'abuse', label: '욕설 / 비방' },
  { value: 'misinformation', label: '허위 정보 / 조작' },
  { value: 'scam', label: '사기 / 피싱' },
  { value: 'copyright', label: '저작권 침해' },
  { value: 'nsfw', label: '부적절한 콘텐츠' },
  { value: 'other', label: '기타' },
];

const TARGET_LABELS: Record<ReportTarget, string> = {
  post: '게시글',
  comment: '댓글',
  user: '사용자',
  message: '쪽지',
};

export default function ReportForm({ targetType, targetId, isOpen, onClose }: ReportFormProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!reason) return;
    // TODO: Supabase에 신고 데이터 저장
    // await supabase.from('reports').insert({ ... })
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setReason('');
    setDescription('');
    setScreenshotUrl('');
    setIsSubmitted(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="w-full max-w-md rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-2xl"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
              <h3 className="flex items-center gap-2 text-base font-bold">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                {TARGET_LABELS[targetType]} 신고
              </h3>
              <button onClick={onClose}>
                <X className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
              </button>
            </div>

            {/* 내용 */}
            <div className="p-4">
              {isSubmitted ? (
                /* 신고 완료 */
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <h4 className="text-lg font-bold mb-2">신고가 접수되었습니다</h4>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                    운영팀이 검토 후 적절한 조치를 취하겠습니다.
                  </p>
                  <button
                    onClick={handleReset}
                    className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
                  >
                    확인
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 신고 사유 */}
                  <div>
                    <label className="text-sm font-semibold mb-2 block">신고 사유 *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {REPORT_REASONS.map((r) => (
                        <button
                          key={r.value}
                          onClick={() => setReason(r.value)}
                          className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                            reason === r.value
                              ? 'border-brand-600 bg-brand-600/10 text-brand-600'
                              : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 상세 설명 */}
                  <div>
                    <label className="text-sm font-semibold mb-2 block">상세 설명</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="구체적인 상황을 설명해주세요..."
                      rows={3}
                      className="w-full rounded-lg bg-[hsl(var(--muted))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600 resize-none"
                    />
                  </div>

                  {/* 스크린샷 */}
                  <div>
                    <label className="text-sm font-semibold mb-2 block">
                      <Camera className="h-4 w-4 inline mr-1" />
                      증거 스크린샷 URL (선택)
                    </label>
                    <input
                      type="url"
                      value={screenshotUrl}
                      onChange={(e) => setScreenshotUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-lg bg-[hsl(var(--muted))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600"
                    />
                  </div>

                  {/* 제재 안내 */}
                  <div className="rounded-lg bg-[hsl(var(--muted))] p-3 text-xs text-[hsl(var(--muted-foreground))]">
                    <p className="font-semibold mb-1">3단계 제재 기준</p>
                    <p>1차: 경고 → 2차: 7일 정지 → 3차: 영구 차단</p>
                    <p className="mt-1">허위 신고 시 신고자에게 페널티가 부과됩니다.</p>
                  </div>

                  {/* 제출 */}
                  <button
                    onClick={handleSubmit}
                    disabled={!reason}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                    신고 접수
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
