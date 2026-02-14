'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  TrendingUp,
  Globe,
  Filter,
  RefreshCw,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import NewsCard from '@/components/news/NewsCard';
import KeywordSubscription from '@/components/news/KeywordSubscription';
import { CrossPromoBanner } from '@/components/synergy/DocTranslation';
import { getStockNews, type NewsItem } from '@/lib/api';
import type { SentimentGrade } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

// 백엔드 소문자 → 프론트 대문자 변환
const GRADE_MAP: Record<string, SentimentGrade> = {
  big_good: 'BIG_GOOD',
  good: 'GOOD',
  bad: 'BAD',
  big_bad: 'BIG_BAD',
};

type RegionFilter = 'all' | 'kr' | 'us' | 'eu' | 'global';
type GradeFilter = 'all' | SentimentGrade;

function StockSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="h-[280px] w-full rounded-2xl" />
      ))}
    </div>
  );
}

export default function StockClient() {
  const t = useTranslations('stock');
  const tGrade = useTranslations('grade');
  const tCommon = useTranslations('common');

  const [region, setRegion] = useState<RegionFilter>('all');
  const [grade, setGrade] = useState<GradeFilter>('all');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const REGIONS: { value: RegionFilter; label: string }[] = [
    { value: 'all', label: t('regions.all') },
    { value: 'kr', label: `🇰🇷 ${t('regions.kr')}` },
    { value: 'us', label: `🇺🇸 ${t('regions.us')}` },
    { value: 'eu', label: `🇪🇺 ${t('regions.eu')}` },
    { value: 'global', label: `🌐 ${t('regions.global')}` },
  ];

  const GRADES: { value: GradeFilter; label: string; color?: string }[] = [
    { value: 'all', label: t('regions.all') },
    { value: 'BIG_GOOD', label: tGrade('bigGood'), color: '#00C853' },
    { value: 'GOOD', label: tGrade('good'), color: '#2979FF' },
    { value: 'BAD', label: tGrade('bad'), color: '#FF6D00' },
    { value: 'BIG_BAD', label: tGrade('bigBad'), color: '#D50000' },
  ];

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const gradeParam = grade !== 'all' ? grade.toLowerCase() : undefined;
      const data = await getStockNews(
        region !== 'all' ? region : undefined,
        gradeParam,
      );
      setNews(data.items);
    } catch (err) {
      setError(t('status.error'));
      console.error('Stock API 오류:', err);
    } finally {
      setLoading(false);
    }
  }, [region, grade, t]);

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
            <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* 필터 바 */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8 p-4 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-sm">
        <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto">
          {/* 지역 필터 */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] ml-1">
               {tCommon('location')}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {REGIONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRegion(r.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${region === r.value
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                      : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted-foreground)/0.1)]'
                    }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* 등급 필터 */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] ml-1">
               {tCommon('grade')}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {GRADES.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGrade(g.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${grade === g.value
                      ? 'text-white'
                      : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted-foreground)/0.1)]'
                    }`}
                  style={
                    grade === g.value && g.color
                      ? { backgroundColor: g.color, boxShadow: `0 4px 12px ${g.color}33` }
                      : grade === g.value
                        ? { backgroundColor: 'hsl(var(--brand-600))' }
                        : {}
                  }
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={fetchNews}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-[hsl(var(--muted))] px-4 py-2.5 text-sm font-semibold transition-all hover:bg-[hsl(var(--muted-foreground)/0.1)] active:scale-[0.98] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {t('status.refresh')}
        </button>
      </div>

      {/* 컨텐츠 영역 */}
      {loading ? (
        <StockSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 mb-4">
            <AlertCircle className="h-8 w-8" />
          </div>
          <p className="text-lg font-bold text-red-500 mb-2">{error}</p>
          <button
            onClick={fetchNews}
            className="text-sm font-semibold text-brand-600 hover:underline"
          >
            {t('status.retry')}
          </button>
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-20 rounded-3xl border-2 border-dashed border-[hsl(var(--border))]">
          <Globe className="h-12 w-12 mx-auto mb-4 text-[hsl(var(--muted-foreground))] opacity-20" />
          <p className="text-lg font-medium text-[hsl(var(--muted-foreground))]">
            {t('status.empty')}
          </p>
        </div>
      ) : (
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

      {/* 푸터 섹션 */}
      <div className="mt-12 space-y-6">
        <KeywordSubscription />
        <CrossPromoBanner />
      </div>
    </div>
  );
}
