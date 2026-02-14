'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  PenSquare,
  ArrowLeft,
  Send,
  Tag,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSanction } from '@/hooks/useSanction';
import type { PostCategory } from '@/types/community';

const CATEGORY_OPTIONS: { value: PostCategory; label: string; emoji: string }[] = [
  { value: 'stock', label: '주식', emoji: '📈' },
  { value: 'crypto', label: '크립토', emoji: '💰' },
  { value: 'kpop', label: 'K-POP', emoji: '🎤' },
  { value: 'free', label: '자유', emoji: '💬' },
];

export default function WritePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { isBanned, canWrite, level } = useSanction();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>('free');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async () => {
    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }
    if (!canWrite) {
      setError('활동이 제한된 계정입니다.');
      return;
    }
    if (!title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }
    if (title.trim().length < 2) {
      setError('제목은 2자 이상이어야 합니다.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from('posts')
      .insert({
        author_id: user.id,
        title: title.trim(),
        content: content.trim(),
        category,
      })
      .select('id')
      .single();

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    router.push(`/community/${data.id}`);
  };

  // 제재 상태 경고
  if (isBanned) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">활동이 제한되었습니다</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">
          {level === 'permanent_ban'
            ? '영구 제재된 계정입니다.'
            : '임시 제재 기간 중에는 글을 작성할 수 없습니다.'}
        </p>
        <button
          onClick={() => router.push('/community')}
          className="rounded-xl bg-[hsl(var(--muted))] px-4 py-2 text-sm font-medium"
        >
          커뮤니티로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          뒤로
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
            <PenSquare className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold">새 글 작성</h1>
        </div>
      </motion.div>

      {/* 로그인 안내 */}
      {!user && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 mb-6">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            글을 작성하려면 먼저 로그인해주세요.
          </p>
        </div>
      )}

      {/* 폼 */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="space-y-4"
      >
        {/* 카테고리 */}
        <div>
          <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] mb-2 block">
            카테고리
          </label>
          <div className="flex gap-2 flex-wrap">
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  category === cat.value
                    ? 'bg-brand-600 text-white'
                    : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 제목 */}
        <div>
          <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] mb-2 block">
            제목
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            maxLength={100}
            className="w-full rounded-xl bg-[hsl(var(--muted))] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-600"
          />
          <p className="text-right text-xs text-[hsl(var(--muted-foreground))] mt-1">
            {title.length}/100
          </p>
        </div>

        {/* 내용 */}
        <div>
          <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] mb-2 block">
            내용
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요..."
            rows={12}
            className="w-full rounded-xl bg-[hsl(var(--muted))] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-600 resize-y min-h-[200px]"
          />
        </div>

        {/* 에러 */}
        {error && (
          <p className="text-xs text-red-500 bg-red-500/10 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* 제출 */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => router.back()}
            className="rounded-xl px-5 py-2.5 text-sm font-medium bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))] transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !user}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            게시하기
          </button>
        </div>
      </motion.div>
    </div>
  );
}
