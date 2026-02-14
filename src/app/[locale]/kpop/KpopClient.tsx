'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Music,
  Calendar,
  Ticket,
  Search,
  RefreshCw,
  ExternalLink,
  Loader2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import NewsCard from '@/components/news/NewsCard';
import KeywordSubscription from '@/components/news/KeywordSubscription';
import { getKpopNews, type NewsItem } from '@/lib/api';
import { createClient } from '@/lib/supabase';
import type { SentimentGrade } from '@/lib/utils';
import { CrossPromoBanner } from '@/components/synergy/DocTranslation';
import { Skeleton } from '@/components/ui/Skeleton';

const GRADE_MAP: Record<string, SentimentGrade> = {
  big_good: 'BIG_GOOD', good: 'GOOD', bad: 'BAD', big_bad: 'BIG_BAD',
};

const TRENDING_IDOLS = ['BTS', 'BLACKPINK', 'NewJeans', 'aespa', 'SEVENTEEN', 'Stray Kids', 'LE SSERAFIM', 'IVE'];

interface ScheduleItem {
  id: number;
  idol_name: string;
  event_type: string;
  title: string;
  description: string | null;
  event_date: string;
  venue: string | null;
  ticket_url: string | null;
}

const EVENT_ICONS: Record<string, string> = {
  concert: '🎤', fanmeeting: '💜', variety: '📺',
  release: '💿', other: '📌',
};

function KpopSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
       <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
       </div>
       <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
       </div>
    </div>
  );
}

export default function KpopClient() {
  const t = useTranslations('kpop');
  const tCommon = useTranslations('common');
  const tGrade = useTranslations('grade');

  const [searchIdol, setSearchIdol] = useState('');
  const [activeIdol, setActiveIdol] = useState<string | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('idol_schedules')
        .select('*')
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .limit(10);

      if (data) setSchedules(data as ScheduleItem[]);
    };
    fetchSchedules();
  }, []);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = activeIdol || searchIdol || undefined;
      const data = await getKpopNews(query);
      setNews(data.items);
    } catch (err) {
      setError(t('status.error'));
      console.error('K-POP API 오류:', err);
    } finally {
      setLoading(false);
    }
  }, [activeIdol, searchIdol, t]);

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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/20">
            <Music className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* 탐색 바 */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10 space-y-4 p-6 glass-card rounded-3xl border-pink-500/10 dark:border-pink-500/10">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))] group-focus-within:text-pink-500 transition-colors" />
          <input
            type="text" placeholder={t('searchPlaceholder')}
            value={searchIdol}
            onChange={(e) => setSearchIdol(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] py-3.5 pl-12 pr-4 text-sm font-medium outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all placeholder:text-[hsl(var(--muted-foreground)/0.5)]"
          />
        </div>
        
        <div className="flex items-center gap-3 px-1">
          <TrendingUp className="h-3.5 w-3.5 text-pink-500 flex-shrink-0" />
          <div className="flex flex-wrap gap-2">
            {TRENDING_IDOLS.map((idol) => (
              <button
                key={idol}
                onClick={() => {
                  setActiveIdol(activeIdol === idol ? null : idol);
                  setSearchIdol('');
                }}
                className={`rounded-full px-4 py-1.5 text-xs font-bold tracking-tight transition-all active:scale-[0.95] ${activeIdol === idol
                    ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
                    : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-pink-100 dark:hover:bg-pink-900/20 hover:text-pink-600'
                  }`}
              >
                {idol}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {loading ? (
        <KpopSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 mb-4">
            <AlertCircle className="h-8 w-8" />
          </div>
          <p className="text-lg font-bold text-red-500 mb-2">{error}</p>
          <button
            onClick={fetchNews}
            className="text-sm font-semibold text-pink-600 hover:underline"
          >
            {t('status.retry')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* 뉴스 영역 — 2/3 */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black flex items-center gap-2">
                {activeIdol ? t('newsTitleIdol', { idol: activeIdol }) : t('newsTitleLatest')}
                <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" />
              </h2>
              <button
                onClick={fetchNews}
                className="flex items-center gap-2 rounded-xl bg-[hsl(var(--muted))] px-3 py-1.5 text-xs font-bold transition-all hover:bg-pink-100 dark:hover:bg-pink-900/20 hover:text-pink-600"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                {t('status.refresh')}
              </button>
            </div>

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
                <div className="text-center py-20 rounded-3xl border-2 border-dashed border-[hsl(var(--border))]">
                  <Music className="h-12 w-12 mx-auto mb-4 text-[hsl(var(--muted-foreground))] opacity-20" />
                  <p className="text-lg font-medium text-[hsl(var(--muted-foreground))]">
                    {t('status.empty')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 일정 사이드바 — 1/3 */}
          <aside className="space-y-6">
            <div className="flex items-center gap-2.5 px-1">
              <div className="h-8 w-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-pink-600" />
              </div>
              <h2 className="text-lg font-black">{t('schedule')}</h2>
            </div>
            
            <div className="space-y-4">
              {schedules.length === 0 && (
                <div className="text-center py-10 glass-card">
                   <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{t('noSchedule')}</p>
                </div>
              )}
              {schedules.map((schedule, i) => (
                <motion.div
                  key={schedule.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="glass-card p-4 hover:border-pink-500/30 transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-2xl bg-[hsl(var(--muted))] w-12 h-12 rounded-2xl flex items-center justify-center group-hover:bg-pink-500/10 transition-colors">
                      {EVENT_ICONS[schedule.event_type] || '📌'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-pink-500 mb-1">
                        {schedule.idol_name}
                      </p>
                      <h3 className="text-sm font-bold leading-snug line-clamp-2 mb-2 group-hover:text-pink-600 transition-colors">
                        {schedule.title}
                      </h3>
                      <div className="flex flex-col gap-1.5">
                        <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" /> {schedule.event_date}
                        </p>
                        {schedule.venue && (
                          <p className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1.5">
                            <span className="text-[10px]">📍</span> {schedule.venue}
                          </p>
                        )}
                      </div>
                      
                      {schedule.ticket_url && (
                        <a
                          href={schedule.ticket_url} target="_blank" rel="noopener noreferrer"
                          className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-3 py-2 text-xs font-bold text-white hover:bg-pink-700 shadow-md shadow-pink-600/20 transition-all active:scale-[0.98]"
                        >
                          <Ticket className="h-3.5 w-3.5" /> {t('buyTicket')}
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </aside>
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
