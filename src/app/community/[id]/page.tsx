'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ThumbsUp,
  Eye,
  Clock,
  Share2,
  Flag,
  Bookmark,
} from 'lucide-react';
import CommentSection from '@/components/community/CommentSection';
import ReportForm from '@/components/community/ReportForm';

/**
 * 📄 게시글 상세 페이지
 *
 * 기능:
 * - 게시글 내용 표시
 * - 좋아요 / 북마크 / 공유 / 신고
 * - 댓글 섹션 (CommentSection)
 * - 신고 모달 (ReportForm)
 */

// 데모 데이터
const DEMO_POST = {
  id: 1,
  title: '삼성전자 HBM3E 양산 소식 — 대박호재 분석',
  author: {
    username: 'stock_master',
    plan: 'pro',
  },
  category: 'stock',
  content: `삼성전자가 HBM3E 양산을 본격화한다는 소식입니다.

## 핵심 포인트

1. **HBM3E 수율 개선**: 기존 60%에서 85%까지 개선
2. **NVIDIA 납품 확정**: 2026년 하반기부터 본격 납품
3. **SK하이닉스 대비 가격 경쟁력**: 10~15% 저렴

## NovaTrend AI 감성 분석

- 등급: **🟢 대박호재**
- 신뢰도: 92%
- 관련 키워드: HBM, NVIDIA, 반도체, 수율

## 개인 의견

반도체 슈퍼사이클이 다시 시작되는 신호로 볼 수 있습니다.
다만, 단기적으로는 이미 주가에 반영된 부분도 있으니 분할 매수 전략이 적절해 보입니다.

> ⚠️ 이 글은 투자 조언이 아닌 개인적인 분석입니다. 투자의 최종 결정은 본인의 책임입니다.`,
  likes: 24,
  views: 182,
  createdAt: '2026-02-13T06:00:00Z',
};

const CATEGORY_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  stock: { label: '주식', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
  crypto: { label: '크립토', bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
  kpop: { label: 'K-POP', bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400' },
  free: { label: '자유', bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
};

export default function PostDetailPage() {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(DEMO_POST.likes);
  const [bookmarked, setBookmarked] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const badge = CATEGORY_BADGE[DEMO_POST.category];

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* 뒤로가기 */}
      <Link
        href="/community"
        className="inline-flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        커뮤니티로 돌아가기
      </Link>

      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* 카테고리 + 제목 */}
        <div className="mb-4">
          {badge && (
            <span className={`${badge.bg} ${badge.text} rounded-lg px-2 py-1 text-xs font-bold`}>
              {badge.label}
            </span>
          )}
          <h1 className="text-2xl font-bold mt-2">{DEMO_POST.title}</h1>
        </div>

        {/* 작성자 정보 */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[hsl(var(--border))]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white font-bold">
            {DEMO_POST.author.username[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{DEMO_POST.author.username}</span>
              {DEMO_POST.author.plan === 'pro' && (
                <span className="rounded bg-brand-600/10 px-1.5 py-0.5 text-[10px] font-bold text-brand-600">PRO</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
              <span className="flex items-center gap-0.5">
                <Clock className="h-3 w-3" />
                2분 전
              </span>
              <span className="flex items-center gap-0.5">
                <Eye className="h-3 w-3" />
                {DEMO_POST.views}
              </span>
            </div>
          </div>
        </div>

        {/* 본문 — 간단한 마크다운 렌더링 */}
        <div className="prose prose-sm dark:prose-invert max-w-none mb-8 whitespace-pre-wrap leading-relaxed">
          {DEMO_POST.content}
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-3 py-4 border-y border-[hsl(var(--border))] mb-6">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              liked
                ? 'bg-brand-600 text-white'
                : 'bg-[hsl(var(--muted))] hover:bg-brand-600/10 hover:text-brand-600'
            }`}
          >
            <ThumbsUp className="h-4 w-4" />
            좋아요 {likeCount}
          </button>
          <button
            onClick={() => setBookmarked(!bookmarked)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              bookmarked
                ? 'bg-amber-500/10 text-amber-600'
                : 'bg-[hsl(var(--muted))] hover:bg-amber-500/10 hover:text-amber-600'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
            북마크
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-[hsl(var(--muted))] px-4 py-2 text-sm font-medium hover:bg-[hsl(var(--muted))]/80 transition-colors">
            <Share2 className="h-4 w-4" />
            공유
          </button>
          <button
            onClick={() => setShowReport(true)}
            className="flex items-center gap-2 rounded-xl bg-[hsl(var(--muted))] px-4 py-2 text-sm font-medium hover:bg-red-500/10 hover:text-red-500 transition-colors ml-auto"
          >
            <Flag className="h-4 w-4" />
            신고
          </button>
        </div>

        {/* 댓글 */}
        <CommentSection postId={DEMO_POST.id} />
      </motion.article>

      {/* 신고 모달 */}
      <ReportForm
        targetType="post"
        targetId={DEMO_POST.id}
        isOpen={showReport}
        onClose={() => setShowReport(false)}
      />
    </div>
  );
}
