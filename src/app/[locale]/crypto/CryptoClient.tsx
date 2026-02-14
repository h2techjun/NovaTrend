'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Bitcoin,
  Filter,
  RefreshCw,
  Gauge,
  TrendingDown,
  TrendingUp,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import NewsCard from '@/components/news/NewsCard';
import KeywordSubscription from '@/components/news/KeywordSubscription';
import { getCryptoNews, getFearGreedIndex, type NewsItem, type FearGreedResponse } from '@/lib/api';
import type { SentimentGrade } from '@/lib/utils';
import { CrossPromoBanner } from '@/components/synergy/DocTranslation';
import { Skeleton } from '@/components/ui/Skeleton';

const GRADE_MAP: Record<string, SentimentGrade> = {
  big_good: 'BIG_GOOD', good: 'GOOD', bad: 'BAD', big_bad: 'BIG_BAD',
};

function getFearGreedColor(value: number): string {
  if (value <= 25) return '#D50000';
  if (value <= 45) return '#FF6D00';
  if (value <= 55) return '#FFC107';
  if (value <= 75) return '#2979FF';
  return '#00C853';
}

function CryptoSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-[280px] w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function CryptoClient() {
  const t = useTranslations('crypto');
  const tGrade = useTranslations('grade');
  const tCommon = useTranslations('common');

  const [gradeFilter, setGradeFilter] = useState<'all' | SentimentGrade>('all');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [fearGreed, setFearGreed] = useState<FearGreedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const gradeParam = gradeFilter !== 'all' ? gradeFilter.toLowerCase() : undefined;
      const [newsData, fgData] = await Promise.all([
        getCryptoNews(gradeParam),
        getFearGreedIndex(),
      ]);
      setNews(newsData.items);
      setFearGreed(fgData);
    } catch (err) {
      setError(t('status.error'));
      console.error('Crypto API 오류:', err);
    } finally {
      setLoading(false);
    }
  }, [gradeFilter, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fgValue = fearGreed?.value ?? 50;
  const fgLabel = fearGreed?.label ?? '...';
  const fgColor = getFearGreedColor(fgValue);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <Bitcoin className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* 공포탐욕지수 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 mb-8 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <Gauge className="h-5 w-5 text-brand-600 dark:text-brand-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider">{t('fearGreedIndex')}</h2>
          {fearGreed?.previous_close && (
            <span className="ml-auto text-xs font-medium text-[hsl(var(--muted-foreground))] px-2 py-1 rounded bg-[hsl(var(--muted))]">
               PREV: {fearGreed.previous_close}
            </span>
          )}
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative flex h-32 w-32 items-center justify-center">
            <svg className="absolute inset-0" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none" stroke={fgColor} strokeWidth="8"
                strokeDasharray={`${fgValue * 2.64} 264`}
                strokeLinecap="round" transform="rotate(-90 50 50)"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="text-center">
              <span className="text-4xl font-black" style={{ color: fgColor }}>
                {fgValue}
              </span>
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <p className="text-2xl font-black mb-1" style={{ color: fgColor }}>
              {fgLabel}
            </p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed max-w-md">
              {/* Descriptions are localized in API currently, but better to have UI fallbacks */}
              {fgLabel === '극도의 공포' && t('fearGreedDesc.extremeFear')}
              {fgLabel === '공포' && t('fearGreedDesc.fear')}
              {fgLabel === '중립' && t('fearGreedDesc.neutral')}
              {fgLabel === '탐욕' && t('fearGreedDesc.greed')}
              {fgLabel === '극도의 탐욕' && t('fearGreedDesc.extremeGreed')}
              {!['극도의 공포', '공포', '중립', '탐욕', '극도의 탐욕'].includes(fgLabel) && t('fearGreedDesc.default')}
            </p>
            
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
               <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-[#D50000] text-[10px] font-bold">
                  <TrendingDown className="h-3 w-3" /> {t('extremeFear')} (0-25)
               </div>
               <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-[#00C853] text-[10px] font-bold">
                  <TrendingUp className="h-3 w-3" /> {t('extremeGreed')} (75-100)
               </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 필터 바 */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8 p-4 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto no-scrollbar">
          <Filter className="h-4 w-4 text-[hsl(var(--muted-foreground))] flex-shrink-0" />
          <div className="flex gap-1.5">
            <button
               onClick={() => setGradeFilter('all')}
               className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${gradeFilter === 'all'
                   ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                   : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted-foreground)/0.1)]'
                 }`}
             >
               {tCommon('all')}
             </button>
            {(['BIG_GOOD', 'GOOD', 'BAD', 'BIG_BAD'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGradeFilter(g)}
                className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${gradeFilter === g
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                    : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted-foreground)/0.1)]'
                  }`}
              >
                {tGrade(g === 'BIG_GOOD' ? 'bigGood' : g === 'GOOD' ? 'good' : g === 'BAD' ? 'bad' : 'bigBad')}
              </button>
            ))}
          </div>
        </div>
        
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-[hsl(var(--muted))] px-4 py-2.5 text-sm font-semibold transition-all hover:bg-[hsl(var(--muted-foreground)/0.1)] active:scale-[0.98] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {t('status.refresh')}
        </button>
      </div>

      {/* 컨텐츠 영역 */}
      {loading ? (
        <CryptoSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 mb-4">
            <AlertCircle className="h-8 w-8" />
          </div>
          <p className="text-lg font-bold text-red-500 mb-2">{error}</p>
          <button
            onClick={fetchData}
            className="text-sm font-semibold text-brand-600 hover:underline"
          >
            {t('status.retry')}
          </button>
        </div>
      ) : news.length === 0 ? (
         <div className="text-center py-20 rounded-3xl border-2 border-dashed border-[hsl(var(--border))]">
          <Bitcoin className="h-12 w-12 mx-auto mb-4 text-[hsl(var(--muted-foreground))] opacity-20" />
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
