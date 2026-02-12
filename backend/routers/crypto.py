"""
크립토 뉴스 + 공포탐욕지수 API 라우터

GET /api/news/crypto — 크립토 뉴스 감성 분석
GET /api/crypto/fear-greed — 공포탐욕지수
"""

from fastapi import APIRouter, Query
from models.schemas import NewsItem, NewsListResponse, FearGreedResponse, SentimentGrade
from datetime import datetime

router = APIRouter()

# 데모 데이터
DEMO_CRYPTO_NEWS: list[NewsItem] = [
    NewsItem(
        id="crypto-1",
        headline="비트코인 $120,000 돌파 — 기관 투자자 매수세 지속",
        summary="비트코인이 사상 최고가를 경신하며 12만 달러를 돌파했습니다. BlackRock ETF의 대규모 유입이 핵심 동력입니다.",
        source="CoinDesk",
        url="https://coindesk.com/example/1",
        grade=SentimentGrade.BIG_GOOD,
        confidence=0.91,
        published_at=datetime.now(),
        keywords=["비트코인", "ETF", "BlackRock"],
    ),
    NewsItem(
        id="crypto-2",
        headline="이더리움 Pectra 업그레이드 성공 — 가스비 90% 감소",
        summary="이더리움의 대규모 네트워크 업그레이드가 성공적으로 완료되어 가스비가 크게 감소하고 처리 속도가 향상되었습니다.",
        source="The Block",
        url="https://theblock.com/example/2",
        grade=SentimentGrade.GOOD,
        confidence=0.88,
        published_at=datetime.now(),
        keywords=["이더리움", "Pectra", "가스비"],
    ),
]


@router.get("/news/crypto", response_model=NewsListResponse)
async def get_crypto_news(
    grade: SentimentGrade = Query(default=None, description="등급 필터"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
):
    """크립토 뉴스 목록"""
    items = DEMO_CRYPTO_NEWS

    if grade:
        items = [i for i in items if i.grade == grade]

    return NewsListResponse(
        items=items[(page - 1) * limit : page * limit],
        total=len(items),
        page=page,
        limit=limit,
    )


@router.get("/crypto/fear-greed", response_model=FearGreedResponse)
async def get_fear_greed_index():
    """공포탐욕지수 (데모 — 추후 Alternative.me API 연동)"""
    return FearGreedResponse(
        value=72,
        label="탐욕",
        previous_close=68,
        last_updated=datetime.now(),
    )
