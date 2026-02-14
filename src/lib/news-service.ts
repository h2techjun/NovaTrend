/**
 * 뉴스 수집 서비스 — Naver News API + 감성 분석
 *
 * 서버 사이드 전용 (Next.js API Routes에서 사용)
 * 환경변수: NAVER_CLIENT_ID, NAVER_CLIENT_SECRET
 */

import { createClient } from '@supabase/supabase-js';

// Supabase 서비스 클라이언트 (서버 사이드)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getSupabase() {
  return createClient(supabaseUrl, supabaseKey);
}

// === Naver News API 수집 ===

interface NaverNewsItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
}

/**
 * 네이버 뉴스 검색 API
 */
export async function searchNaverNews(
  query: string,
  display = 20,
  sort = 'date'
): Promise<NaverNewsItem[]> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn('[뉴스 수집] Naver API 키 미설정');
    return [];
  }

  const params = new URLSearchParams({ query, display: String(display), sort });
  const url = `https://openapi.naver.com/v1/search/news.json?${params}`;

  const res = await fetch(url, {
    headers: {
      'X-Naver-Client-Id': clientId,
      'X-Naver-Client-Secret': clientSecret,
    },
    next: { revalidate: 300 }, // 5분 캐시
  });

  if (!res.ok) {
    console.error(`[뉴스 수집] Naver API 오류: ${res.status}`);
    return [];
  }

  const data = await res.json();
  return data.items || [];
}

// === HTML 태그 제거 ===

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
}

// === 감성 분석 (HuggingFace Inference API + 키워드 폴백) ===

// 긍정/부정 키워드 사전
const POSITIVE_KEYWORDS = [
  '상승', '급등', '호재', '신고가', '사상최고', '반등', '돌파', '상한가',
  '흑자', '성장', '수혜', '매수', '기대', '쏠린다', '주목', '강세',
  '컴백', '1위', '기록', '대박', '역대급', '성공', '흥행', '인기',
  'surge', 'rally', 'record', 'bullish', 'breakthrough', 'soar',
];
const NEGATIVE_KEYWORDS = [
  '하락', '급락', '악재', '폭락', '약세', '손실', '적자', '위기',
  '매도', '공매도', '경고', '우려', '리스크', '불안', '침체', '하한가',
  '논란', '해체', '탈퇴', '사건', '고소', '처벌', '피소', '불화',
  'crash', 'plunge', 'bearish', 'risk', 'crisis', 'plummet', 'decline',
];

interface SentimentResult {
  grade: 'big_good' | 'good' | 'bad' | 'big_bad';
  confidence: number;
}

/**
 * 키워드 기반 감성 분석 (폴백)
 */
function analyzeByKeywords(text: string): SentimentResult {
  const lower = text.toLowerCase();
  let positiveScore = 0;
  let negativeScore = 0;

  for (const kw of POSITIVE_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) positiveScore++;
  }
  for (const kw of NEGATIVE_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) negativeScore++;
  }

  const total = positiveScore + negativeScore;
  if (total === 0) {
    return { grade: 'good', confidence: 0.5 };
  }

  const ratio = positiveScore / total;

  if (ratio >= 0.8) return { grade: 'big_good', confidence: Math.min(0.6 + ratio * 0.3, 0.95) };
  if (ratio >= 0.5) return { grade: 'good', confidence: 0.5 + ratio * 0.2 };
  if (ratio >= 0.2) return { grade: 'bad', confidence: 0.5 + (1 - ratio) * 0.2 };
  return { grade: 'big_bad', confidence: Math.min(0.6 + (1 - ratio) * 0.3, 0.95) };
}

/**
 * HuggingFace Inference API 감성 분석
 *   모델: 환경변수 SENTIMENT_MODEL 또는 기본 multilingual sentiment
 */
async function analyzeByHuggingFace(text: string): Promise<SentimentResult | null> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) return null;

  const model = process.env.SENTIMENT_MODEL || 'nlptown/bert-base-multilingual-uncased-sentiment';
  const url = `https://api-inference.huggingface.co/models/${model}`;

  try {
    // 입력 텍스트 길이 제한 (512 토큰 근사)
    const truncated = text.slice(0, 512);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: truncated }),
    });

    if (!res.ok) {
      console.warn(`[HuggingFace] API 응답 오류: ${res.status}`);
      return null;
    }

    const data = await res.json();

    // nlptown 모델: [[{label: "5 stars", score: 0.8}, ...]]
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const predictions = data[0] as { label: string; score: number }[];
      const best = predictions.reduce((a, b) => (b.score > a.score ? b : a));

      // 5-star → 4등급 매핑
      const stars = parseInt(best.label, 10);
      let grade: SentimentResult['grade'];
      if (stars >= 5) grade = 'big_good';
      else if (stars >= 4) grade = 'good';
      else if (stars >= 2) grade = 'bad';
      else grade = 'big_bad';

      return { grade, confidence: Math.round(best.score * 100) / 100 };
    }

    return null;
  } catch (err) {
    console.warn('[HuggingFace] 호출 실패:', err);
    return null;
  }
}

/**
 * 하이브리드 감성 분석: HuggingFace 우선 → 키워드 폴백
 */
async function analyzeSentiment(text: string): Promise<SentimentResult> {
  // HuggingFace 시도
  const hfResult = await analyzeByHuggingFace(text);
  if (hfResult) return hfResult;

  // 폴백: 키워드 기반
  return analyzeByKeywords(text);
}

// === 출처 도메인 추출 ===

function extractSource(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return 'Unknown';
  }
}

// === 네이버 날짜 파싱 ===

function parseNaverDate(dateStr: string): string {
  try {
    return new Date(dateStr).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

// === 중복 제거 (Jaccard 유사도) ===

function jaccardSim(a: string, b: string): number {
  const setA = new Set(a.toLowerCase().split(/\s+/));
  const setB = new Set(b.toLowerCase().split(/\s+/));
  const intersection = Array.from(setA).filter((x) => setB.has(x));
  const union = new Set(Array.from(setA).concat(Array.from(setB)));
  return union.size > 0 ? intersection.length / union.size : 0;
}

export interface AnalyzedNewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  grade: string;
  confidence: number;
  published_at: string;
  region: string | null;
  keywords: string[];
}

/**
 * 키워드 리스트 → 뉴스 수집 → 감성 분석 → 중복 제거 → 정규화
 */
export async function fetchAnalyzedNews(
  queries: string[],
  region: string | null = null,
  displayPerQuery = 10,
): Promise<AnalyzedNewsItem[]> {
  const allRaw: (NaverNewsItem & { query: string })[] = [];

  // 1. 수집
  for (const query of queries) {
    try {
      const items = await searchNaverNews(query, displayPerQuery);
      for (const item of items) {
        allRaw.push({ ...item, query });
      }
    } catch (e) {
      console.error(`[파이프라인] '${query}' 수집 실패:`, e);
    }
  }

  if (allRaw.length === 0) return [];

  // 2. 중복 제거
  const unique: typeof allRaw = [allRaw[0]];
  for (const item of allRaw.slice(1)) {
    const isDup = unique.some(
      (existing) => jaccardSim(item.title, existing.title) >= 0.4
    );
    if (!isDup) unique.push(item);
  }

  // 3. 감성 분석 + 정규화
  const results: AnalyzedNewsItem[] = [];
  for (const item of unique) {
    const headline = stripHtml(item.title);
    const summary = stripHtml(item.description);
    const sentiment = await analyzeSentiment(`${headline} ${summary}`);

    results.push({
      id: Math.random().toString(36).slice(2, 10),
      headline,
      summary,
      source: extractSource(item.originallink || item.link),
      url: item.originallink || item.link,
      grade: sentiment.grade,
      confidence: sentiment.confidence,
      published_at: parseNaverDate(item.pubDate),
      region,
      keywords: [item.query],
    });
  }
  return results;
}

// === Supabase 캐싱 ===

const CACHE_TTL_MS = 60 * 60 * 1000; // 1시간

/**
 * 캐시된 뉴스 조회 (TTL 내이면 캐시 반환)
 */
export async function getCachedNews(
  category: 'stock' | 'crypto' | 'kpop',
  region?: string,
): Promise<AnalyzedNewsItem[] | null> {
  const supabase = getSupabase();

  let query = supabase
    .from('news_cache')
    .select('*')
    .eq('category', category)
    .gte('created_at', new Date(Date.now() - CACHE_TTL_MS).toISOString())
    .order('published_at', { ascending: false })
    .limit(50);

  if (region) {
    query = query.eq('region', region);
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) return null;

  return data.map((row) => ({
    id: String(row.id),
    headline: row.headline,
    summary: row.summary,
    source: row.source,
    url: row.url,
    grade: row.grade,
    confidence: row.confidence,
    published_at: row.published_at,
    region: row.region,
    keywords: row.keywords || [],
  }));
}

/**
 * 뉴스를 캐시에 저장
 */
export async function cacheNews(
  items: AnalyzedNewsItem[],
  category: 'stock' | 'crypto' | 'kpop',
): Promise<void> {
  if (items.length === 0) return;

  const supabase = getSupabase();

  const rows = items.map((item) => ({
    external_id: `${category}_${item.id}`,
    category,
    region: item.region,
    headline: item.headline,
    summary: item.summary,
    source: item.source,
    url: item.url,
    grade: item.grade,
    confidence: item.confidence,
    keywords: item.keywords,
    published_at: item.published_at,
  }));

  // upsert로 중복 방지
  const { error } = await supabase
    .from('news_cache')
    .upsert(rows, { onConflict: 'external_id' });

  if (error) {
    console.error('[캐싱] 저장 실패:', error);
  }
}
