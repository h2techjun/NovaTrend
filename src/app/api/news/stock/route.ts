/**
 * GET /api/news/stock — 주식 뉴스 API (Naver News → 감성 분석 → 캐싱)
 */

import { NextResponse } from 'next/server';
import { fetchAnalyzedNews, getCachedNews, cacheNews, type AnalyzedNewsItem } from '@/lib/news-service';

// 지역별 검색 키워드
const STOCK_QUERIES: Record<string, string[]> = {
  kr: ['코스피 주식', '삼성전자 주가', '한국 증시'],
  us: ['나스닥 뉴스', '뉴욕 증시', '미국 주식'],
  eu: ['유럽 증시', '유로 경제'],
  global: ['글로벌 증시', '세계 경제'],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get('region');
  const grade = searchParams.get('grade');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  try {
    // 1. 캐시 확인
    let items = await getCachedNews('stock', region || undefined);

    // 2. 캐시 미스 → 실시간 수집
    if (!items) {
      let queries: string[];
      if (region && STOCK_QUERIES[region]) {
        queries = STOCK_QUERIES[region];
      } else {
        // 전체: 각 지역 대표 키워드
        queries = Object.values(STOCK_QUERIES).map((q) => q[0]);
      }

      items = await fetchAnalyzedNews(queries, region);

      // 캐시에 저장 (비동기)
      cacheNews(items, 'stock').catch(console.error);
    }

    // 3. 등급 필터
    if (grade) {
      items = items.filter((i) => i.grade === grade);
    }

    // 4. 페이지네이션
    const total = items.length;
    const start = (page - 1) * limit;
    const paged = items.slice(start, start + limit);

    return NextResponse.json({ items: paged, total, page, limit });
  } catch (error) {
    console.error('[Stock API] 오류:', error);
    return NextResponse.json(
      { items: [], total: 0, page: 1, limit: 20 },
      { status: 500 }
    );
  }
}
