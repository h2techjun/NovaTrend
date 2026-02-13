'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Music,
  Calendar,
  Ticket,
  Search,
  RefreshCw,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import NewsCard from '@/components/news/NewsCard';
import { getKpopNews, type NewsItem } from '@/lib/api';
import type { SentimentGrade } from '@/lib/utils';

const GRADE_MAP: Record<string, SentimentGrade> = {
  big_good: 'BIG_GOOD', good: 'GOOD', bad: 'BAD', big_bad: 'BIG_BAD',
};

const TRENDING_IDOLS = ['BTS', 'BLACKPINK', 'NewJeans', 'aespa', 'SEVENTEEN', 'Stray Kids', 'LE SSERAFIM', 'IVE'];

// 일정은 추후 Supabase DB 연동 예정 (Phase 2)
const DEMO_SCHEDULE = [
  {
    id: '1', idolName: 'BTS', eventType: 'concert',
    title: 'BTS 월드 투어 서울 공연', eventDate: '2025-03-15',
    venue: '잠실 올림픽 주경기장', ticketUrl: 'https://ticket.interpark.com',
  },
  {
    id: '2', idolName: 'NewJeans', eventType: 'fanmeeting',
    title: 'NewJeans Fan Meeting "Bunnies"', eventDate: '2025-02-28',
    venue: 'KSPO DOME', ticketUrl: 'https://ticket.yes24.com',
  },
  {
    id: '3', idolName: 'aespa', eventType: 'comeback',
    title: 'aespa 새 미니앨범 "Supernova" 발매', eventDate: '2025-02-20',
    venue: '', ticketUrl: '',
  },
];

const EVENT_ICONS: Record<string, string> = {
  concert: '🎤', fanmeeting: '💜', broadcast: '📺',
  comeback: '💿', birthday: '🎂', other: '📌',
};

export default function KpopPage() {
  const [searchIdol, setSearchIdol] = useState('');
  const [activeIdol, setActiveIdol] = useState<string | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = activeIdol || searchIdol || undefined;
      const data = await getKpopNews(query);
      setNews(data.items);
    } catch (err) {
      setError('K-POP 뉴스를 불러오는데 실패했습니다.');
      console.error('K-POP API 오류:', err);
    } finally {
      setLoading(false);
    }
  }, [activeIdol, searchIdol]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setActiveIdol(null);
      fetchNews();
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white">
            <Music className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">K-POP 뉴스 & 일정</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              아이돌 뉴스 분석 & 콘서트 일정 & 티켓 정보
            </p>
          </div>
        </div>
      </motion.div>

      {/* 아이돌 검색 + 트렌딩 태그 */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text" placeholder="아이돌/그룹명 검색..."
            value={searchIdol}
            onChange={(e) => setSearchIdol(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {TRENDING_IDOLS.map((idol) => (
            <button
              key={idol}
              onClick={() => {
                setActiveIdol(activeIdol === idol ? null : idol);
                setSearchIdol('');
              }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${activeIdol === idol
                  ? 'bg-pink-600 text-white'
                  : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                }`}
            >
              {idol}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* 뉴스 영역 — 2/3 */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {activeIdol ? `${activeIdol} 뉴스` : '최신 K-POP 뉴스'}
            </h2>
            <button
              onClick={fetchNews}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
              <span className="ml-3 text-sm text-[hsl(var(--muted-foreground))]">K-POP 뉴스를 분석하고 있습니다...</span>
            </div>
          )}

          {error && !loading && (
            <div className="flex items-center justify-center gap-3 py-12 text-red-500">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{error}</p>
              <button onClick={fetchNews} className="ml-2 text-xs underline">다시 시도</button>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-4">
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
              {news.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-[hsl(var(--muted-foreground))]">
                    {activeIdol ? `${activeIdol} 관련 뉴스가 없습니다.` : '뉴스가 없습니다.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 일정 사이드바 — 1/3 */}
        <aside>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-pink-500" />
            <h2 className="text-lg font-semibold">다가오는 일정</h2>
          </div>
          <div className="space-y-3">
            {DEMO_SCHEDULE.map((schedule) => (
              <motion.div
                key={schedule.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">
                    {EVENT_ICONS[schedule.eventType] || '📌'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-pink-500 mb-0.5">
                      {schedule.idolName}
                    </p>
                    <p className="text-sm font-medium line-clamp-2 mb-1">
                      {schedule.title}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      📅 {schedule.eventDate}
                      {schedule.venue && ` · 📍 ${schedule.venue}`}
                    </p>
                    {schedule.ticketUrl && (
                      <a
                        href={schedule.ticketUrl} target="_blank" rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 rounded-md bg-pink-600/10 px-2.5 py-1 text-xs font-medium text-pink-600 hover:bg-pink-600/20 transition-colors"
                      >
                        <Ticket className="h-3 w-3" /> 티켓 구매 <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
