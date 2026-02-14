/**
 * GET /api/crypto/fear-greed — 공포탐욕지수 (Alternative.me API 프록시)
 */

import { NextResponse } from 'next/server';

const FEAR_GREED_LABELS: Record<string, string> = {
  '0-25': '극도의 공포',
  '25-45': '공포',
  '45-55': '중립',
  '55-75': '탐욕',
  '75-101': '극도의 탐욕',
};

function getLabel(value: number): string {
  if (value <= 25) return '극도의 공포';
  if (value <= 45) return '공포';
  if (value <= 55) return '중립';
  if (value <= 75) return '탐욕';
  return '극도의 탐욕';
}

export async function GET() {
  try {
    const res = await fetch('https://api.alternative.me/fng/?limit=2', {
      next: { revalidate: 300 }, // 5분 캐시
    });

    if (!res.ok) throw new Error(`Alternative.me API: ${res.status}`);

    const data = await res.json();
    const entries = data?.data || [];

    const current = entries[0] ? parseInt(entries[0].value, 10) : 50;
    const previous = entries[1] ? parseInt(entries[1].value, 10) : null;

    return NextResponse.json({
      value: current,
      label: getLabel(current),
      previous_close: previous,
      last_updated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[공포탐욕] API 오류:', error);
    return NextResponse.json({
      value: 50,
      label: '중립',
      previous_close: null,
      last_updated: new Date().toISOString(),
    });
  }
}
