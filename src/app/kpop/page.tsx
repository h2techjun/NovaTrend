'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Music,
  Calendar,
  Ticket,
  Search,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import NewsCard from '@/components/news/NewsCard';
import type { SentimentGrade } from '@/lib/utils';

// 인기 아이돌 리스트
const TRENDING_IDOLS = ['BTS', 'BLACKPINK', 'NewJeans', 'aespa', 'SEVENTEEN', 'Stray Kids', 'LE SSERAFIM', 'IVE'];

// 데모 일정
const DEMO_SCHEDULE = [
  {
    id: '1',
    idolName: 'BTS',
    eventType: 'concert',
    title: 'BTS 월드 투어 서울 공연',
    eventDate: '2025-03-15',
    venue: '잠실 올림픽 주경기장',
    ticketUrl: 'https://ticket.interpark.com',
  },
  {
    id: '2',
    idolName: 'NewJeans',
    eventType: 'fanmeeting',
    title: 'NewJeans Fan Meeting "Bunnies"',
    eventDate: '2025-02-28',
    venue: 'KSPO DOME',
    ticketUrl: 'https://ticket.yes24.com',
  },
  {
    id: '3',
    idolName: 'aespa',
    eventType: 'comeback',
    title: 'aespa 새 미니앨범 "Supernova" 발매',
    eventDate: '2025-02-20',
    venue: '',
    ticketUrl: '',
  },
];

// 데모 뉴스
const DEMO_NEWS = [
  {
    id: '1',
    title: 'BTS 지민, 솔로 앨범 글로벌 차트 1위 석권',
    summary: 'BTS 지민의 새 솔로 앨범이 빌보드 200 1위를 차지하며 K-POP 솔로 아티스트 최고 기록을 경신했습니다.',
    sourceUrl: 'https://example.com',
    sourceName: '스포츠조선',
    publishedAt: new Date(Date.now() - 1200000).toISOString(),
    grade: 'BIG_GOOD' as SentimentGrade,
    confidence: 0.94,
  },
  {
    id: '2',
    title: 'NewJeans, 일본 데뷔 시동 — 도쿄돔 공연 확정',
    summary: 'NewJeans가 일본 정식 데뷔를 발표하며 3월 도쿄돔 공연을 확정했습니다.',
    sourceUrl: 'https://example.com',
    sourceName: '한국일보',
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    grade: 'GOOD' as SentimentGrade,
    confidence: 0.87,
  },
  {
    id: '3',
    title: '[단독] 대형 기획사 소속 아이돌 멤버 학폭 논란',
    summary: '대형 기획사 소속 아이돌 그룹 멤버에 대한 학교 폭력 의혹이 제기되어 소속사가 이에 대한 입장을 발표했습니다.',
    sourceUrl: 'https://example.com',
    sourceName: 'OSEN',
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    grade: 'BIG_BAD' as SentimentGrade,
    confidence: 0.83,
  },
];

const EVENT_ICONS: Record<string, string> = {
  concert: '🎤',
  fanmeeting: '💜',
  broadcast: '📺',
  comeback: '💿',
  birthday: '🎂',
  other: '📌',
};

export default function KpopPage() {
  const [searchIdol, setSearchIdol] = useState('');
  const [activeIdol, setActiveIdol] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="아이돌/그룹명 검색..."
            value={searchIdol}
            onChange={(e) => setSearchIdol(e.target.value)}
            className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {TRENDING_IDOLS.map((idol) => (
            <button
              key={idol}
              onClick={() => setActiveIdol(activeIdol === idol ? null : idol)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeIdol === idol
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
            <button className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
              <RefreshCw className="h-3.5 w-3.5" />
              새로고침
            </button>
          </div>
          <div className="space-y-4">
            {DEMO_NEWS.map((item, i) => (
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
                        href={schedule.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 rounded-md bg-pink-600/10 px-2.5 py-1 text-xs font-medium text-pink-600 hover:bg-pink-600/20 transition-colors"
                      >
                        <Ticket className="h-3 w-3" />
                        티켓 구매
                        <ExternalLink className="h-3 w-3" />
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
