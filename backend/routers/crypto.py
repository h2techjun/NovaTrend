"""
크립토 뉴스 + 공포탐욕지수 API 라우터 — 실 데이터 연동

GET /api/news/crypto — 크립토 뉴스 감성 분석
GET /api/crypto/fear-greed — Alternative.me 공포탐욕지수
"""

from fastapi import APIRouter, Query
from models.schemas import NewsListResponse, FearGreedResponse, SentimentGrade
from services.news_pipeline import fetch_analyzed_news
from datetime import datetime
import httpx

router = APIRouter()

CRYPTO_QUERIES = ["비트코인 뉴스", "이더리움 뉴스", "크립토 시장"]

FEAR_GREED_LABELS = {
    (0, 25): "극도의 공포",
    (25, 45): "공포",
    (45, 55): "중립",
    (55, 75): "탐욕",
    (75, 101): "극도의 탐욕",
}


@router.get("/news/crypto", response_model=NewsListResponse)
async def get_crypto_news(
    grade: SentimentGrade = Query(default=None, description="등급 필터"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
):
    """크립토 뉴스 목록 (네이버 API → 감성 분석)"""
    items = await fetch_analyzed_news(CRYPTO_QUERIES, display_per_query=10)

    if grade:
        items = [i for i in items if i["grade"] == grade.value]

    total = len(items)
    start = (page - 1) * limit
    paged = items[start:start + limit]

    return NewsListResponse(items=paged, total=total, page=page, limit=limit)


@router.get("/crypto/fear-greed", response_model=FearGreedResponse)
async def get_fear_greed_index():
    """공포탐욕지수 (Alternative.me API)"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get("https://api.alternative.me/fng/?limit=2")
            resp.raise_for_status()
            data = resp.json()

        entries = data.get("data", [])
        current = int(entries[0]["value"]) if entries else 50
        previous = int(entries[1]["value"]) if len(entries) > 1 else None

        label = "중립"
        for (lo, hi), lbl in FEAR_GREED_LABELS.items():
            if lo <= current < hi:
                label = lbl
                break

        return FearGreedResponse(
            value=current,
            label=label,
            previous_close=previous,
            last_updated=datetime.now(),
        )
    except Exception as e:
        print(f"[공포탐욕] API 오류: {e}")
        return FearGreedResponse(
            value=50,
            label="중립",
            previous_close=None,
            last_updated=datetime.now(),
        )
