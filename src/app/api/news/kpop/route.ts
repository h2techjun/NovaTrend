/**
 * GET /api/news/kpop — K-POP 뉴스 API
 */

import { NextResponse } from 'next/server';
import { fetchAnalyzedNews, getCachedNews, cacheNews } from '@/lib/news-service';

const DEFAULT_QUERIES = ['K-POP 뉴스', '아이돌 컴백', 'K-POP 콘서트'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idol = searchParams.get('idol');
  const grade = searchParams.get('grade');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  try {
    // 아이돌 검색은 캐시 우회 (동적 쿼리)
    let items = idol ? null : await getCachedNews('kpop');

    if (!items) {
      const queries = idol
        ? [`${idol} 뉴스`, `${idol} 컴백`, idol]
        : DEFAULT_QUERIES;

      items = await fetchAnalyzedNews(queries);

      // 기본 쿼리만 캐싱
      if (!idol) {
        cacheNews(items, 'kpop').catch(console.error);
      }
    }

    if (grade) {
      items = items.filter((i) => i.grade === grade);
    }

    const total = items.length;
    const start = (page - 1) * limit;
    const paged = items.slice(start, start + limit);

    return NextResponse.json({ items: paged, total, page, limit });
  } catch (error) {
    console.error('[K-POP API] 오류:', error);
    return NextResponse.json(
      { items: [], total: 0, page: 1, limit: 20 },
      { status: 500 }
    );
  }
}
