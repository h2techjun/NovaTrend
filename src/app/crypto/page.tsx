'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bitcoin, Filter, RefreshCw, Gauge, TrendingDown, TrendingUp } from 'lucide-react';
import NewsCard from '@/components/news/NewsCard';
import type { SentimentGrade } from '@/lib/utils';

// 공포탐욕지수 데모
const FEAR_GREED = {
  value: 38,
  label: '공포',
  description: '시장이 공포 상태에 있습니다. 매수 기회일 수 있습니다.',
};

// 데모 뉴스
const DEMO_NEWS = [
  {
    id: '1',
    title: '비트코인, SEC ETF 승인으로 사상 최고가 돌파',
    summary: 'SEC가 비트코인 현물 ETF를 승인하면서 기관 투자 자금 유입이 가속화되고 있습니다.',
    sourceUrl: 'https://example.com',
    sourceName: 'CoinDesk',
    publishedAt: new Date(Date.now() - 900000).toISOString(),
    grade: 'BIG_GOOD' as SentimentGrade,
    confidence: 0.95,
  },
  {
    id: '2',
    title: '이더리움 2.0 스테이킹 물량 사상 최대치 경신',
    summary: '이더리움 네트워크에 스테이킹된 ETH가 전체 공급량의 28%를 넘어서면서 디플레이셔너리 영향이 강화되고 있습니다.',
    sourceUrl: 'https://example.com',
    sourceName: 'The Block',
    publishedAt: new Date(Date.now() - 5400000).toISOString(),
    grade: 'GOOD' as SentimentGrade,
    confidence: 0.82,
  },
  {
    id: '3',
    title: '美 재무부, 스테이블코인 규제 강화 법안 발의',
    summary: '미 재무부가 스테이블코인 발행사에 대한 은행 수준의 규제를 요구하는 법안을 의회에 제출했습니다.',
    sourceUrl: 'https://example.com',
    sourceName: 'Reuters',
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
    grade: 'BAD' as SentimentGrade,
    confidence: 0.76,
  },
  {
    id: '4',
    title: '대형 거래소 해킹으로 $5억 유출 사태',
    summary: '보안 취약점을 이용한 해킹으로 인해 대규모 자금 유출이 발생했으며, 시장 신뢰에 큰 타격을 입히고 있습니다.',
    sourceUrl: 'https://example.com',
    sourceName: 'CoinTelegraph',
    publishedAt: new Date(Date.now() - 21600000).toISOString(),
    grade: 'BIG_BAD' as SentimentGrade,
    confidence: 0.91,
  },
];

function getFearGreedColor(value: number): string {
  if (value <= 25) return '#D50000';
  if (value <= 45) return '#FF6D00';
  if (value <= 55) return '#FFC107';
  if (value <= 75) return '#2979FF';
  return '#00C853';
}

export default function CryptoPage() {
  const [gradeFilter, setGradeFilter] = useState<'all' | SentimentGrade>('all');
  const fgColor = getFearGreedColor(FEAR_GREED.value);

  const filtered = DEMO_NEWS.filter((item) => {
    if (gradeFilter !== 'all' && item.grade !== gradeFilter) return false;
    return true;
  });

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
        </div>
        <div className="flex items-center gap-8">
          <div className="relative flex h-28 w-28 items-center justify-center">
            <svg className="absolute inset-0" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={fgColor}
                strokeWidth="8"
                strokeDasharray={`${FEAR_GREED.value * 2.64} 264`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="text-center">
              <span className="text-3xl font-bold" style={{ color: fgColor }}>
                {FEAR_GREED.value}
              </span>
            </div>
          </div>
          <div>
            <p className="text-lg font-semibold" style={{ color: fgColor }}>
              {FEAR_GREED.label}
            </p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              {FEAR_GREED.description}
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
                all: '전체',
                BIG_GOOD: '대박호재',
                GOOD: '호재',
                BAD: '악재',
                BIG_BAD: '대박악재',
              };
              return (
                <button
                  key={g}
                  onClick={() => setGradeFilter(g)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    gradeFilter === g
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
        <button className="ml-auto flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition-colors">
          <RefreshCw className="h-3.5 w-3.5" />
          새로고침
        </button>
      </div>

      {/* 뉴스 그리드 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((item, i) => (
          <NewsCard
            key={item.id}
            title={item.title}
            summary={item.summary}
            sourceUrl={item.sourceUrl}
            sourceName={item.sourceName}
            publishedAt={item.publishedAt}
            grade={item.grade}
            confidence={item.confidence}
            index={i}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[hsl(var(--muted-foreground))]">해당 조건의 뉴스가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
