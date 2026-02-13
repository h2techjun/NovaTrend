'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bitcoin, Filter, RefreshCw, Gauge, TrendingDown, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import NewsCard from '@/components/news/NewsCard';
import { getCryptoNews, getFearGreedIndex, type NewsItem, type FearGreedResponse } from '@/lib/api';
import type { SentimentGrade } from '@/lib/utils';

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

function getFearGreedDescription(label: string): string {
  const desc: Record<string, string> = {
    '극도의 공포': '시장이 극도의 공포 상태입니다. 매수 기회일 수 있습니다.',
    '공포': '시장이 공포 상태에 있습니다. 신중한 접근이 필요합니다.',
    '중립': '시장이 중립적인 상태입니다.',
    '탐욕': '시장이 탐욕 상태입니다. 과열에 주의하세요.',
    '극도의 탐욕': '시장이 극도의 탐욕 상태입니다. 조정 가능성에 유의하세요.',
  };
  return desc[label] || '시장 심리 데이터를 분석 중입니다.';
}

export default function CryptoPage() {
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
      setError('데이터를 불러오는데 실패했습니다. 백엔드 서버를 확인하세요.');
      console.error('Crypto API 오류:', err);
    } finally {
      setLoading(false);
    }
  }, [gradeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fgValue = fearGreed?.value ?? 50;
  const fgLabel = fearGreed?.label ?? '로딩 중';
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
            <h1 className="text-2xl font-bold">크립토 마켓</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              AI 뉴스 분석 + 공포탐욕지수
            </p>
          </div>
        </div>
      </motion.div>

      {/* 공포탐욕지수 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <Gauge className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
          <h2 className="text-sm font-semibold">공포 & 탐욕 지수</h2>
          {fearGreed?.previous_close && (
            <span className="ml-auto text-xs text-[hsl(var(--muted-foreground))]">
              전일: {fearGreed.previous_close}
            </span>
          )}
        </div>
        <div className="flex items-center gap-8">
          <div className="relative flex h-28 w-28 items-center justify-center">
            <svg className="absolute inset-0" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none" stroke={fgColor} strokeWidth="8"
                strokeDasharray={`${fgValue * 2.64} 264`}
                strokeLinecap="round" transform="rotate(-90 50 50)"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="text-center">
              <span className="text-3xl font-bold" style={{ color: fgColor }}>
                {fgValue}
              </span>
            </div>
          </div>
          <div>
            <p className="text-lg font-semibold" style={{ color: fgColor }}>
              {fgLabel}
            </p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              {getFearGreedDescription(fgLabel)}
            </p>
            <div className="mt-3 flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
              <span className="flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-[#D50000]" /> 극단적 공포 0-25
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-[#00C853]" /> 극단적 탐욕 75-100
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 필터 + 새로고침 */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <div className="flex gap-1">
            {(['all', 'BIG_GOOD', 'GOOD', 'BAD', 'BIG_BAD'] as const).map((g) => {
              const labels: Record<string, string> = {
                all: '전체', BIG_GOOD: '대박호재', GOOD: '호재', BAD: '악재', BIG_BAD: '대박악재',
              };
              return (
                <button
                  key={g}
                  onClick={() => setGradeFilter(g)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${gradeFilter === g
                      ? 'bg-brand-600 text-white'
                      : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                    }`}
                >
                  {labels[g]}
                </button>
              );
            })}
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </button>
      </div>

      {/* 로딩/에러 */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          <span className="ml-3 text-sm text-[hsl(var(--muted-foreground))]">크립토 뉴스를 분석하고 있습니다...</span>
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center justify-center gap-3 py-16 text-red-500">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">{error}</p>
          <button onClick={fetchData} className="ml-2 text-xs underline hover:no-underline">다시 시도</button>
        </div>
      )}

      {/* 뉴스 그리드 */}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          <p className="text-[hsl(var(--muted-foreground))]">해당 조건의 뉴스가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
