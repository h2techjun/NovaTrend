'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  PenSquare,
  ThumbsUp,
  Clock,
  Eye,
  ChevronRight,
} from 'lucide-react';
import DirectMessage from '@/components/community/DirectMessage';

// 데모 게시글
const DEMO_POSTS = [
  {
    id: '1',
    title: '삼성전자 지금 매수 타이밍일까요?',
    author: '투자고수',
    category: 'stock',
    createdAt: new Date(Date.now() - 600000).toISOString(),
    likes: 24,
    views: 182,
    comments: 8,
  },
  {
    id: '2',
    title: '비트코인 10만달러 돌파 시 알트코인 전략 공유',
    author: '크립토매니아',
    category: 'crypto',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    likes: 56,
    views: 423,
    comments: 15,
  },
  {
    id: '3',
    title: 'NewJeans 서울 콘서트 티켓팅 후기 & 좌석 추천',
    author: '버니즈',
    category: 'kpop',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    likes: 89,
    views: 634,
    comments: 31,
  },
  {
    id: '4',
    title: '미국 CPI 발표 전 포지션 어떻게 가져가시나요?',
    author: '월가워리어',
    category: 'stock',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    likes: 12,
    views: 95,
    comments: 4,
  },
  {
    id: '5',
    title: '이더리움 POS 전환 후 스테이킹 수익률 정리',
    author: 'ETH홀더',
    category: 'crypto',
    createdAt: new Date(Date.now() - 21600000).toISOString(),
    likes: 34,
    views: 267,
    comments: 11,
  },
];

const CATEGORIES = [
  { value: 'all', label: '전체', color: 'brand-600' },
  { value: 'stock', label: '주식', color: 'emerald-500' },
  { value: 'crypto', label: '크립토', color: 'amber-500' },
  { value: 'kpop', label: 'K-POP', color: 'pink-500' },
  { value: 'free', label: '자유', color: 'blue-500' },
];

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

const CATEGORY_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  stock: { label: '주식', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
  crypto: { label: '크립토', bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
  kpop: { label: 'K-POP', bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400' },
  free: { label: '자유', bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
};

export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = DEMO_POSTS.filter((post) => {
    if (activeCategory === 'all') return true;
    return post.category === activeCategory;
  });

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
            onClick={() => setActiveCategory(cat.value)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === cat.value
                ? 'bg-brand-600 text-white'
                : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 게시글 리스트 */}
      <div className="space-y-2">
        {filtered.map((post, i) => {
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
                    <span>{post.author}</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(post.createdAt)}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Eye className="h-3 w-3" />
                      {post.views}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <ThumbsUp className="h-3 w-3" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <MessageSquare className="h-3 w-3" />
                      {post.comments}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[hsl(var(--muted-foreground))]">게시글이 없습니다.</p>
        </div>
      )}

      {/* 쪽지 플로팅 버튼 */}
      <DirectMessage />
    </div>
  );
}
