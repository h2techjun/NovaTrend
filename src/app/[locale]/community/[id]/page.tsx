'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ThumbsUp,
  Eye,
  Clock,
  Flag,
  Share2,
  Loader2,
  Trash2,
  Edit3,
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRole } from '@/hooks/useRole';
import CommentSection from '@/components/community/CommentSection';
import ReportForm from '@/components/community/ReportForm';
import LevelBadge from '@/components/community/LevelBadge';
import type { Post } from '@/types/community';
import { CATEGORY_BADGE } from '@/types/community';
import { useLocale, useTranslations } from 'next-intl';

function formatDate(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleDateString(locale === 'ko' ? 'ko-KR' : locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('community');
  const tLevel = useTranslations('level');
  const tCommon = useTranslations('common');
  const { user } = useAuth();
  const { canModerate } = useRole();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [reportOpen, setReportOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const supabase = createClient();

  // 게시글 조회
  const fetchPost = useCallback(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, author:profiles!posts_author_id_fkey(id, username, display_name, avatar_url, plan, xp, level)')
      .eq('id', Number(id))
      .eq('is_deleted', false)
      .single();

    if (error || !data) {
      setLoading(false);
      return;
    }

    setPost(data);
    setLikeCount(data.likes);
    setLoading(false);

    // 조회수 증가 (비동기, 에러 무시)
    supabase.rpc('increment_views', { post_id: Number(id) }).then();
  }, [id, supabase]);

  // 좋아요 상태 확인
  const checkLiked = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('target_type', 'post')
      .eq('target_id', Number(id))
      .single();
    setLiked(!!data);
  }, [user, id, supabase]);

  useEffect(() => {
    fetchPost();
    checkLiked();
  }, [fetchPost, checkLiked]);

  // 좋아요 토글
  const toggleLike = async () => {
    if (!user) return;

    if (liked) {
      await supabase
        .from('likes')
        .delete()
        .eq('user_id', user.id)
        .eq('target_type', 'post')
        .eq('target_id', Number(id));
      setLiked(false);
      setLikeCount((c) => c - 1);

      // posts 테이블 likes 카운트 감소
      await supabase.rpc('decrement_likes', { row_id: Number(id), table_name: 'posts' });
    } else {
      await supabase.from('likes').insert({
        user_id: user.id,
        target_type: 'post',
        target_id: Number(id),
      });
      setLiked(true);
      setLikeCount((c) => c + 1);

      // posts 테이블 likes 카운트 증가
      await supabase.rpc('increment_likes', { row_id: Number(id), table_name: 'posts' });
    }
  };

  // 삭제
  const handleDelete = async () => {
    if (!user || !post) return;
    if (user.id !== post.author_id && !canModerate) return;
    if (!confirm(t('post.confirmDelete'))) return;

    setDeleting(true);
    await supabase
      .from('posts')
      .update({ is_deleted: true })
      .eq('id', post.id);
    router.push('/community');
  };

  // 공유
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: post?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(t('post.linkCopied'));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold mb-2">{t('post.notFound')}</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">
          {t('post.notFoundDesc')}
        </p>
        <button
          onClick={() => router.push('/community')}
          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
        >
          {t('post.back')}
        </button>
      </div>
    );
  }

  const badge = CATEGORY_BADGE[post.category];
  const isAuthor = user?.id === post.author_id;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* 뒤로가기 */}
      <button
        onClick={() => router.push('/community')}
        className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('post.backToList')}
      </button>

      {/* 게시글 */}
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6"
      >
        {/* 카테고리 + 제목 */}
        <div className="mb-4">
          {badge && (
            <span className={`${badge.bg} ${badge.text} rounded px-2 py-0.5 text-xs font-bold mb-2 inline-block`}>
              {t(`categories.${post.category}`)}
            </span>
          )}
          <h1 className="text-xl font-bold mt-1">{post.title}</h1>
        </div>

        {/* 작성자 정보 */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600/10 text-sm font-bold text-brand-600">
              {post.author?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-sm font-semibold">
                {post.author?.display_name || post.author?.username || t('post.anonymous')}
                {' '}
                {post.author && <LevelBadge xp={(post.author as any).xp || 0} level={(post.author as any).level || 1} />}
              </p>
              <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                <span className="flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  {formatDate(post.created_at, locale)}
                </span>
                <span className="flex items-center gap-0.5">
                  <Eye className="h-3 w-3" />
                  {post.views}
                </span>
              </div>
            </div>
          </div>

          {/* 작성자 또는 관리자 메뉴 */}
          {(isAuthor || canModerate) && (
            <div className="flex gap-1">
              {isAuthor && (
                <button
                  onClick={() => router.push(`/community/edit/${post.id}`)}
                  className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
                  title={t('post.edit')}
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg p-2 text-red-500 hover:bg-red-500/10 transition-colors"
                title={isAuthor ? t('post.delete') : t('post.adminDelete')}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* 본문 */}
        <div className="prose prose-sm dark:prose-invert max-w-none mb-6 whitespace-pre-wrap">
          {post.content}
        </div>

        {/* 액션 바 */}
        <div className="flex items-center gap-2 pt-4 border-t border-[hsl(var(--border))]">
          <button
            onClick={toggleLike}
            disabled={!user}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              liked
                ? 'bg-brand-600/10 text-brand-600'
                : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
            }`}
          >
            <ThumbsUp className={`h-4 w-4 ${liked ? 'fill-brand-600' : ''}`} />
            {likeCount}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
          >
            <Share2 className="h-4 w-4" />
            {t('post.share')}
          </button>
          {user && !isAuthor && (
            <button
              onClick={() => setReportOpen(true)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-[hsl(var(--muted-foreground))] hover:bg-red-500/10 hover:text-red-500 transition-colors"
            >
              <Flag className="h-4 w-4" />
              {t('post.report')}
            </button>
          )}
        </div>
      </motion.article>

      {/* 댓글 */}
      <CommentSection postId={post.id} />

      {/* 신고 모달 */}
      {reportOpen && (
        <ReportForm
          targetType="post"
          targetId={post.id}
          onClose={() => setReportOpen(false)}
        />
      )}
    </div>
  );
}
