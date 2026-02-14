import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 감성 분석 등급 타입
export type SentimentGrade = 'BIG_GOOD' | 'GOOD' | 'BAD' | 'BIG_BAD';

// 등급별 라벨 (다국어)
export const GRADE_LABELS: Record<SentimentGrade, { ko: string; en: string; zh: string }> = {
  BIG_GOOD: { ko: '대박호재', en: 'Big Good', zh: '重大利好' },
  GOOD: { ko: '호재', en: 'Good', zh: '利好' },
  BAD: { ko: '악재', en: 'Bad', zh: '利空' },
  BIG_BAD: { ko: '대박악재', en: 'Big Bad', zh: '重大利空' },
};

// 등급별 색상
export const GRADE_COLORS: Record<SentimentGrade, string> = {
  BIG_GOOD: '#00C853',
  GOOD: '#2979FF',
  BAD: '#FF6D00',
  BIG_BAD: '#D50000',
};

// 등급별 CSS 클래스
export const GRADE_CLASSES: Record<SentimentGrade, string> = {
  BIG_GOOD: 'grade-big-good',
  GOOD: 'grade-good',
  BAD: 'grade-bad',
  BIG_BAD: 'grade-big-bad',
};

// API 기본 URL
// Next.js API Routes 사용 (자체 서버)
// FastAPI 백엔드 전환 시 NEXT_PUBLIC_API_URL 설정
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// 날짜 포맷
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

// 뉴스 아이템 타입
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: string;
  grade: SentimentGrade;
  confidence: number;
  category: 'stock' | 'crypto' | 'kpop';
  region?: 'kr' | 'us' | 'eu' | 'global';
}

// 아이돌 일정 타입
export interface IdolSchedule {
  id: string;
  idolName: string;
  groupName?: string;
  eventType: 'concert' | 'fanmeeting' | 'broadcast' | 'comeback' | 'birthday' | 'other';
  title: string;
  eventDate: string;
  venue?: string;
  ticketUrl?: string;
}
