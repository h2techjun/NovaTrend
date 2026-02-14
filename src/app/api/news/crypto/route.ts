/**
 * GET /api/news/crypto — 크립토 뉴스 API
 */

import { NextResponse } from 'next/server';
import { fetchAnalyzedNews, getCachedNews, cacheNews } from '@/lib/news-service';

const CRYPTO_QUERIES = ['비트코인 뉴스', '이더리움 뉴스', '크립토 시장'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const grade = searchParams.get('grade');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  try {
    let items = await getCachedNews('crypto');

    if (!items) {
      items = await fetchAnalyzedNews(CRYPTO_QUERIES);
      cacheNews(items, 'crypto').catch(console.error);
    }

    if (grade) {
      items = items.filter((i) => i.grade === grade);
    }

    const total = items.length;
    const start = (page - 1) * limit;
    const paged = items.slice(start, start + limit);

    return NextResponse.json({ items: paged, total, page, limit });
  } catch (error) {
    console.error('[Crypto API] 오류:', error);
    return NextResponse.json(
      { items: [], total: 0, page: 1, limit: 20 },
      { status: 500 }
    );
  }
}
