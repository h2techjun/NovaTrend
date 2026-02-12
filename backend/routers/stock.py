"""
주식 뉴스 API 라우터

GET /api/news/stock/{region} — 지역별 주식 뉴스 감성 분석 결과
"""

from fastapi import APIRouter, Query
from models.schemas import NewsItem, NewsListResponse, NewsRegion, SentimentGrade
from datetime import datetime

router = APIRouter()

# 데모 데이터 (추후 services 모듈로 대체)
DEMO_STOCK_NEWS: list[NewsItem] = [
    NewsItem(
        id="stock-1",
        headline="삼성전자, AI 반도체 수요 급증으로 분기 실적 사상 최대",
        summary="삼성전자가 HBM3E 메모리 수요 폭발에 힘입어 분기 영업이익이 전년 대비 300% 증가한 사상 최대 실적을 기록했습니다.",
        source="네이버뉴스",
        url="https://news.naver.com/example/1",
        grade=SentimentGrade.BIG_GOOD,
        confidence=0.95,
        published_at=datetime.now(),
        region=NewsRegion.KR,
        keywords=["삼성전자", "HBM", "AI반도체"],
    ),
    NewsItem(
        id="stock-2",
        headline="NVIDIA, 차세대 GPU 'Blackwell Ultra' 공개 — 시장 기대 초과",
        summary="NVIDIA가 차세대 GPU 아키텍처를 공개하며 데이터센터 시장 지배력을 더욱 강화할 전망입니다.",
        source="Reuters",
        url="https://reuters.com/example/2",
        grade=SentimentGrade.BIG_GOOD,
        confidence=0.93,
        published_at=datetime.now(),
        region=NewsRegion.US,
        keywords=["NVIDIA", "Blackwell", "GPU"],
    ),
    NewsItem(
        id="stock-3",
        headline="유럽 중앙은행, 금리 동결 결정 — 경기 둔화 우려",
        summary="ECB가 예상과 달리 금리를 동결하며 유로존 경기 침체 가능성에 대한 우려가 확대되고 있습니다.",
        source="Bloomberg",
        url="https://bloomberg.com/example/3",
        grade=SentimentGrade.BAD,
        confidence=0.87,
        published_at=datetime.now(),
        region=NewsRegion.EU,
        keywords=["ECB", "금리", "유로존"],
    ),
]


@router.get("/stock", response_model=NewsListResponse)
async def get_stock_news(
    region: NewsRegion = Query(default=None, description="지역 필터"),
    grade: SentimentGrade = Query(default=None, description="등급 필터"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
):
    """주식 뉴스 목록 (지역/등급 필터링)"""
    items = DEMO_STOCK_NEWS

    if region:
        items = [i for i in items if i.region == region]
    if grade:
        items = [i for i in items if i.grade == grade]

    return NewsListResponse(
        items=items[(page - 1) * limit : page * limit],
        total=len(items),
        page=page,
        limit=limit,
    )
