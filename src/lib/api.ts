import { API_BASE_URL } from './utils';

// === 타입 정의 (백엔드 스키마 매칭) ===

export interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  grade: 'big_good' | 'good' | 'bad' | 'big_bad';
  confidence: number;
  published_at: string;
  region?: string;
  keywords: string[];
}

export interface NewsListResponse {
  items: NewsItem[];
  total: number;
  page: number;
  limit: number;
}

export interface FearGreedResponse {
  value: number;
  label: string;
  previous_close: number | null;
  last_updated: string;
}

// === API 호출 유틸리티 ===

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API 오류: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// === 주식 뉴스 API ===

export async function getStockNews(region?: string, grade?: string) {
  const params = new URLSearchParams();
  if (region && region !== 'all') params.set('region', region);
  if (grade && grade !== 'all') params.set('grade', grade);
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchApi<NewsListResponse>(`/api/news/stock${query}`);
}

// === 크립토 API ===

export async function getCryptoNews(grade?: string) {
  const params = new URLSearchParams();
  if (grade && grade !== 'all') params.set('grade', grade);
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchApi<NewsListResponse>(`/api/news/crypto${query}`);
}

export async function getFearGreedIndex() {
  return fetchApi<FearGreedResponse>('/api/crypto/fear-greed');
}

// === K-POP API ===

export async function getKpopNews(idol?: string, grade?: string) {
  const params = new URLSearchParams();
  if (idol) params.set('idol', idol);
  if (grade && grade !== 'all') params.set('grade', grade);
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchApi<NewsListResponse>(`/api/news/kpop${query}`);
}

export async function getKpopTrending() {
  return fetchApi<NewsListResponse>('/api/news/kpop/trending');
}
