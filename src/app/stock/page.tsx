'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Globe,
  Filter,
  RefreshCw,
} from 'lucide-react';
import NewsCard from '@/components/news/NewsCard';
import { CrossPromoBanner } from '@/components/synergy/DocTranslation';
import type { SentimentGrade } from '@/lib/utils';

// 데모 데이터 (API 연동 전 화면 구성용)
const DEMO_NEWS = [
  {
    id: '1',
    title: '삼성전자, AI 반도체 수주 2배 증가… 글로벌 수요 폭증',
    summary: 'AI 가속기용 HBM 메모리 주문이 전년 대비 2배 이상 증가했으며, 하반기 실적 전망이 크게 개선되었습니다.',
    sourceUrl: 'https://example.com',
    sourceName: '연합뉴스',
    publishedAt: new Date(Date.now() - 1800000).toISOString(),
    grade: 'BIG_GOOD' as SentimentGrade,
    confidence: 0.92,
    category: 'stock' as const,
    region: 'kr' as const,
  },
  {
    id: '2',
    title: 'NVIDIA 실적 발표 앞두고 반도체 섹터 강세',
    summary: 'AI 반도체 수요 증가에 따른 NVIDIA의 호실적이 기대되며, 관련 종목들이 동반 상승세를 보이고 있습니다.',
    sourceUrl: 'https://example.com',
    sourceName: 'Bloomberg',
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    grade: 'GOOD' as SentimentGrade,
    confidence: 0.85,
    category: 'stock' as const,
    region: 'us' as const,
  },
  {
    id: '3',
    title: '미 연준 금리인상 시사, 글로벌 증시 혼조',
    summary: '연준 의사록에서 추가 긴축 가능성이 언급되면서 시장 불확실성이 확대되고 있습니다.',
    sourceUrl: 'https://example.com',
    sourceName: 'Reuters',
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    grade: 'BAD' as SentimentGrade,
    confidence: 0.78,
    category: 'stock' as const,
    region: 'global' as const,
  },
  {
    id: '4',
    title: '코스피 3개월 연속 하락, 외국인 매도세 지속',
    summary: '외국인 투자자의 지속적인 매도와 환율 불안으로 인해 코스피 지수가 큰 폭으로 하락했습니다.',
    sourceUrl: 'https://example.com',
    sourceName: '한국경제',
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
    grade: 'BIG_BAD' as SentimentGrade,
    confidence: 0.88,
    category: 'stock' as const,
    region: 'kr' as const,
  },
  {
    id: '5',
    title: 'EU, 탄소국경세 발효에 따른 수출 기업 부담 증가',
    summary: '유럽연합의 탄소국경조정메커니즘이 본격 시행되면서 한국 수출 기업에 추가 비용이 발생할 전망입니다.',
    sourceUrl: 'https://example.com',
    sourceName: 'Financial Times',
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    grade: 'BAD' as SentimentGrade,
    confidence: 0.72,
    category: 'stock' as const,
    region: 'eu' as const,
  },
  {
    id: '6',
    title: '현대차, 미국 EV 공장 완공으로 생산능력 확대',
    summary: '조지아주 신규 전기차 공장이 예정대로 완공되어 연간 30만대 추가 생산이 가능해졌습니다.',
    sourceUrl: 'https://example.com',
    sourceName: '매일경제',
    publishedAt: new Date(Date.now() - 18000000).toISOString(),
    grade: 'GOOD' as SentimentGrade,
    confidence: 0.81,
    category: 'stock' as const,
    region: 'kr' as const,
  },
];

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

  const filtered = DEMO_NEWS.filter((item) => {
    if (region !== 'all' && item.region !== region) return false;
    if (grade !== 'all' && item.grade !== grade) return false;
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
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  region === r.value
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
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  grade === g.value
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

        <button className="ml-auto flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition-colors">
          <RefreshCw className="h-3.5 w-3.5" />
          새로고침
        </button>
      </div>

      {/* 뉴스 그리드 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
