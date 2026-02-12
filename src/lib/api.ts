import { API_BASE_URL } from './utils';

// API 호출 유틸리티 (FastAPI 백엔드)
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

// 주식 뉴스 API
export async function getStockNewsKR() {
  return fetchApi<{ news: unknown[] }>('/api/news/stock/kr');
}

export async function getStockNewsGlobal() {
  return fetchApi<{ news: unknown[] }>('/api/news/stock/global');
}

// 크립토 API
export async function getCryptoNews() {
  return fetchApi<{ news: unknown[] }>('/api/news/crypto');
}

export async function getFearGreedIndex() {
  return fetchApi<{ value: number; classification: string }>('/api/crypto/fear-greed');
}

// K-POP API
export async function getKpopNews(idol?: string) {
  const query = idol ? `?idol=${encodeURIComponent(idol)}` : '';
  return fetchApi<{ news: unknown[] }>(`/api/news/kpop${query}`);
}

export async function getKpopTrending() {
  return fetchApi<{ news: unknown[] }>('/api/news/kpop/trending');
}
