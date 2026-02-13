'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Globe,
  Filter,
  RefreshCw,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import NewsCard from '@/components/news/NewsCard';
import { CrossPromoBanner } from '@/components/synergy/DocTranslation';
import { getStockNews, type NewsItem } from '@/lib/api';
import type { SentimentGrade } from '@/lib/utils';

// 백엔드 소문자 → 프론트 대문자 변환
const GRADE_MAP: Record<string, SentimentGrade> = {
  big_good: 'BIG_GOOD',
  good: 'GOOD',
  bad: 'BAD',
  big_bad: 'BIG_BAD',
};

type RegionFilter = 'all' | 'kr' | 'us' | 'eu' | 'global';
type GradeFilter = 'all' | SentimentGrade;

const REGIONS: { value: RegionFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'kr', label: '🇰🇷 한국' },
  { value: 'us', label: '🇺🇸 미국' },
  { value: 'eu', label: '🇪🇺 유럽' },
  { value: 'global', label: '🌐 글로벌' },
];

const GRADES: { value: GradeFilter; label: string; color?: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'BIG_GOOD', label: '대박호재', color: '#00C853' },
  { value: 'GOOD', label: '호재', color: '#2979FF' },
  { value: 'BAD', label: '악재', color: '#FF6D00' },
  { value: 'BIG_BAD', label: '대박악재', color: '#D50000' },
];

export default function StockPage() {
  const [region, setRegion] = useState<RegionFilter>('all');
  const [grade, setGrade] = useState<GradeFilter>('all');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 등급 필터: 대문자 → 소문자로 변환하여 API 호출
      const gradeParam = grade !== 'all' ? grade.toLowerCase() : undefined;
      const data = await getStockNews(
        region !== 'all' ? region : undefined,
        gradeParam,
      );
      setNews(data.items);
    } catch (err) {
      setError('뉴스를 불러오는데 실패했습니다. 백엔드 서버가 실행 중인지 확인하세요.');
      console.error('Stock API 오류:', err);
    } finally {
      setLoading(false);
    }
  }, [region, grade]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">글로벌 주식 뉴스</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              AI가 분석한 실시간 주식 뉴스 감성 등급
            </p>
          </div>
        </div>
      </motion.div>

      {/* 필터 바 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        {/* 지역 필터 */}
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <div className="flex gap-1">
            {REGIONS.map((r) => (
              <button
                key={r.value}
                onClick={() => setRegion(r.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${region === r.value
                    ? 'bg-brand-600 text-white'
                    : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                  }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* 등급 필터 */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <div className="flex gap-1">
            {GRADES.map((g) => (
              <button
                key={g.value}
                onClick={() => setGrade(g.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${grade === g.value
                    ? 'text-white'
                    : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                  }`}
                style={
                  grade === g.value && g.color
                    ? { backgroundColor: g.color }
                    : grade === g.value
                      ? { backgroundColor: 'hsl(225, 73%, 57%)' }
                      : {}
                }
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={fetchNews}
          disabled={loading}
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </button>
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          <span className="ml-3 text-sm text-[hsl(var(--muted-foreground))]">
            뉴스를 분석하고 있습니다...
          </span>
        </div>
      )}

      {/* 에러 상태 */}
      {error && !loading && (
        <div className="flex items-center justify-center gap-3 py-16 text-red-500">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchNews}
            className="ml-2 text-xs underline hover:no-underline"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 뉴스 그리드 */}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item, i) => (
            <NewsCard
              key={item.id}
              title={item.headline}
              summary={item.summary}
              sourceUrl={item.url}
              sourceName={item.source}
              publishedAt={item.published_at}
              grade={GRADE_MAP[item.grade] || 'GOOD'}
              confidence={item.confidence}
              index={i}
            />
          ))}
        </div>
      )}

      {!loading && !error && news.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[hsl(var(--muted-foreground))]">
            해당 조건의 뉴스가 없습니다.
          </p>
        </div>
      )}

      {/* DocTranslation 크로스 프로모션 */}
      <div className="mt-8">
        <CrossPromoBanner />
      </div>
    </div>
  );
}
