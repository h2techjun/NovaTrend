'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  PenSquare,
  ThumbsUp,
  Clock,
  Eye,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import DirectMessage from '@/components/community/DirectMessage';
import type { Post, PostCategory } from '@/types/community';
import { CATEGORIES, CATEGORY_BADGE } from '@/types/community';

const PAGE_SIZE = 20;

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return '방금 전';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

export default function CommunityPage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<'all' | PostCategory>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const supabase = createClient();

  const fetchPosts = useCallback(async (pageNum: number, category: string, reset = false) => {
    setLoading(true);

    let query = supabase
      .from('posts')
      .select('*, author:profiles!posts_author_id_fkey(id, username, display_name, avatar_url, plan)', { count: 'exact' })
      .eq('is_deleted', false)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

    if (category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, count, error } = await query;

    if (!error && data) {
      setPosts((prev) => reset ? data : [...prev, ...data]);
      setTotalCount(count ?? 0);
      setHasMore(data.length === PAGE_SIZE);
    }

    setLoading(false);
  }, [supabase]);

  // 카테고리 변경 시 리셋
  useEffect(() => {
    setPage(0);
    fetchPosts(0, activeCategory, true);
  }, [activeCategory, fetchPosts]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, activeCategory);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">커뮤니티</h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                투자 토론, K-POP 덕질, 자유 게시판
                {totalCount > 0 && <span className="ml-1">· {totalCount}개의 글</span>}
              </p>
            </div>
          </div>
          <Link
            href="/community/write"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            <PenSquare className="h-4 w-4" />
            글쓰기
          </Link>
        </div>
      </motion.div>

      {/* 카테고리 탭 */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value as 'all' | PostCategory)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === cat.value
                ? 'bg-brand-600 text-white'
                : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* 게시글 리스트 */}
      <div className="space-y-2">
        {posts.map((post, i) => {
          const badge = CATEGORY_BADGE[post.category];
          return (
            <Link key={post.id} href={`/community/${post.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="group flex items-center gap-4 rounded-xl bg-[hsl(var(--card))] p-4 hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {post.is_pinned && (
                      <span className="bg-brand-600/10 text-brand-600 rounded px-1.5 py-0.5 text-[10px] font-bold">
                        📌 고정
                      </span>
                    )}
                    {badge && (
                      <span className={`${badge.bg} ${badge.text} rounded px-1.5 py-0.5 text-[10px] font-bold`}>
                        {badge.label}
                      </span>
                    )}
                    <h3 className="text-sm font-semibold truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {post.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                    <span>{post.author?.username || '익명'}</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(post.created_at)}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Eye className="h-3 w-3" />
                      {post.views}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <ThumbsUp className="h-3 w-3" />
                      {post.likes}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* 로딩 */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
        </div>
      )}

      {/* 빈 상태 */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-16">
          <MessageSquare className="h-12 w-12 text-[hsl(var(--muted-foreground))] mx-auto mb-3 opacity-30" />
          <p className="text-[hsl(var(--muted-foreground))] mb-4">아직 게시글이 없습니다.</p>
          <Link
            href="/community/write"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <PenSquare className="h-4 w-4" />
            첫 글을 작성해보세요
          </Link>
        </div>
      )}

      {/* 더보기 */}
      {!loading && hasMore && posts.length > 0 && (
        <div className="flex justify-center pt-6">
          <button
            onClick={loadMore}
            className="rounded-xl bg-[hsl(var(--muted))] px-6 py-3 text-sm font-medium hover:bg-[hsl(var(--border))] transition-colors"
          >
            더 보기
          </button>
        </div>
      )}

      {/* 쪽지 플로팅 버튼 */}
      {user && <DirectMessage />}
    </div>
  );
}
