'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Link } from '@/navigation';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTranslations } from 'next-intl';

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { user } = useAuth();
  const supabase = createClient();
  const t = useTranslations('community');
  const tCommon = useTranslations('common');

  const CATEGORIES = [
    { value: 'free', label: t('categories.free') },
    { value: 'stock', label: t('categories.stock') },
    { value: 'crypto', label: t('categories.crypto') },
    { value: 'kpop', label: t('categories.kpop') },
  ];

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('free');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 기존 게시글 로드
  useEffect(() => {
    const fetchPost = async () => {
      const { data, error: fetchError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (fetchError || !data) {
        setError(t('post.notFound'));
        setLoading(false);
        return;
      }

      // 작성자 확인
      if (user && data.author_id !== user.id) {
        setError(t('edit.noPermission'));
        setLoading(false);
        return;
      }

      setTitle(data.title);
      setContent(data.content);
      setCategory(data.category);
      setLoading(false);
    };

    if (user) fetchPost();
  }, [postId, user, supabase, t]);

  const handleSubmit = async () => {
    if (!user) return;
    if (!title.trim() || title.trim().length < 2) {
      setError(t('edit.errorMinTitle'));
      return;
    }
    if (!content.trim() || content.trim().length < 10) {
      setError(t('edit.errorMinContent'));
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('posts')
      .update({
        title: title.trim(),
        content: content.trim(),
        category,
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId)
      .eq('author_id', user.id);

    if (updateError) {
      setError(updateError.message);
      setSubmitting(false);
      return;
    }

    router.push(`/community/${postId}`);
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-[hsl(var(--muted-foreground))]">{tCommon('loginRequired')}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error && !title) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Link href="/community" className="text-brand-600 hover:underline">← {t('post.backToList')}</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/community/${postId}`} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[hsl(var(--muted))] transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">{t('edit.title')}</h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* 카테고리 */}
        <div>
          <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] mb-2 block">{t('selectCategory')}</label>
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  category === cat.value
                    ? 'bg-brand-600 text-white'
                    : 'bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 제목 */}
        <div>
          <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] mb-2 block">{t('postTitle')}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl bg-[hsl(var(--muted))] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-600"
            placeholder={t('titlePlaceholder')}
          />
        </div>

        {/* 내용 */}
        <div>
          <label className="text-xs font-bold text-[hsl(var(--muted-foreground))] mb-2 block">{t('postContent')}</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="w-full rounded-xl bg-[hsl(var(--muted))] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-600 resize-none"
            placeholder={t('contentPlaceholder')}
          />
        </div>

        {/* 에러 */}
        {error && <p className="text-xs text-red-500 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}

        {/* 제출 */}
        <div className="flex gap-3">
          <Link
            href={`/community/${postId}`}
            className="flex-1 text-center rounded-xl border border-[hsl(var(--border))] px-4 py-3 text-sm font-semibold hover:bg-[hsl(var(--muted))] transition-colors"
          >
            {tCommon('cancel')}
          </Link>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t('edit.save')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
