'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Globe, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';

/**
 * 🔗 DocTranslation 시너지 컴포넌트
 *
 * 목적:
 * 1. NovaTrend → DocTranslation: "이 뉴스 번역하기" CTA
 * 2. 뉴스 요약 위젯 (DocTranslation 번역 대기 화면에 임베드 가능)
 * 3. 크로스 프로모션 배너
 */

// === 1. "이 뉴스 번역하기" CTA 버튼 ===
interface TranslateCTAProps {
  newsUrl: string;
  newsTitle: string;
  sourceLanguage?: string;
}

export function TranslateCTA({ newsUrl, newsTitle, sourceLanguage = 'ko' }: TranslateCTAProps) {
  const docTranslationUrl = `https://doctranslation.site/translate?url=${encodeURIComponent(newsUrl)}&source=${sourceLanguage}`;

  return (
    <a
      href={docTranslationUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-lg shadow-brand-600/25"
    >
      <Globe className="h-4 w-4" />
      이 뉴스 번역하기
      <ExternalLink className="h-3.5 w-3.5 opacity-70" />
    </a>
  );
}

// === 2. 뉴스 요약 위젯 (DocTranslation 대기 화면용) ===
interface NewsWidgetItem {
  title: string;
  grade: 'big_good' | 'good' | 'bad' | 'big_bad';
  category: string;
  timeAgo: string;
}

const GRADE_STYLE = {
  big_good: { label: '대박호재', bg: 'bg-green-500', text: 'text-green-500' },
  good: { label: '호재', bg: 'bg-emerald-400', text: 'text-emerald-400' },
  bad: { label: '악재', bg: 'bg-red-400', text: 'text-red-400' },
  big_bad: { label: '대박악재', bg: 'bg-red-600', text: 'text-red-600' },
};

const DEMO_WIDGET_NEWS: NewsWidgetItem[] = [
  { title: '삼성전자 HBM3E 양산 본격화', grade: 'big_good', category: '주식', timeAgo: '2분 전' },
  { title: '비트코인 12만 달러 돌파', grade: 'good', category: '크립토', timeAgo: '5분 전' },
  { title: 'NewJeans 월드투어 서울 공연 매진', grade: 'big_good', category: 'K-POP', timeAgo: '10분 전' },
];

export function NewsWidget() {
  return (
    <div className="w-full max-w-sm rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] overflow-hidden shadow-xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-brand-600 to-indigo-600">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-bold">NovaTrend 속보</span>
        </div>
        <a
          href="https://novatrend.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-white/70 hover:text-white transition-colors"
        >
          전체 보기 →
        </a>
      </div>

      {/* 뉴스 목록 */}
      <div className="divide-y divide-[hsl(var(--border))]">
        {DEMO_WIDGET_NEWS.map((news, i) => {
          const grade = GRADE_STYLE[news.grade];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
            >
              <div className={`flex h-2 w-2 rounded-full ${grade.bg} shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{news.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-bold ${grade.text}`}>{grade.label}</span>
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{news.category} · {news.timeAgo}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 푸터 */}
      <div className="px-4 py-2 bg-[hsl(var(--muted))]">
        <p className="text-[10px] text-center text-[hsl(var(--muted-foreground))]">
          Powered by NovaTrend AI 감성 분석
        </p>
      </div>
    </div>
  );
}

// === 3. 크로스 프로모션 배너 ===
export function CrossPromoBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-br from-brand-600/10 via-indigo-600/10 to-purple-600/10 border border-brand-600/20 p-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shrink-0">
          <Globe className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold mb-1">뉴스를 다른 언어로 읽고 싶으신가요?</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            DocTranslation으로 전 세계 뉴스를 원하는 언어로 번역하세요.
            AI 기반 고품질 문서 번역 서비스입니다.
          </p>
        </div>
        <a
          href="https://doctranslation.site"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors whitespace-nowrap"
        >
          DocTranslation 방문
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </motion.div>
  );
}

// === 4. SEO 상호 링크용 Footer 배지 ===
export function PartnerBadge() {
  return (
    <div className="flex items-center gap-3 text-sm text-[hsl(var(--muted-foreground))]">
      <span>파트너</span>
      <a
        href="https://doctranslation.site"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 hover:text-brand-600 transition-colors"
      >
        <Globe className="h-3.5 w-3.5" />
        DocTranslation
      </a>
      <span className="text-[hsl(var(--border))]">|</span>
      <a
        href="https://novatrend.vercel.app"
        className="flex items-center gap-1 hover:text-brand-600 transition-colors"
      >
        <TrendingUp className="h-3.5 w-3.5" />
        NovaTrend
      </a>
    </div>
  );
}
