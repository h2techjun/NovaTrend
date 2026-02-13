"""
주식 뉴스 API 라우터 — 실 데이터 연동

GET /api/news/stock — 한국/미국/유럽/글로벌 주식 뉴스 감성 분석
"""

from fastapi import APIRouter, Query
from models.schemas import NewsListResponse, NewsRegion, SentimentGrade
from services.news_pipeline import fetch_analyzed_news

router = APIRouter()

# 지역별 검색 키워드
STOCK_QUERIES = {
    NewsRegion.KR: ["코스피 주식", "삼성전자 주가", "한국 증시"],
    NewsRegion.US: ["나스닥 뉴스", "뉴욕 증시", "미국 주식"],
    NewsRegion.EU: ["유럽 증시", "유로 경제"],
    NewsRegion.GLOBAL: ["글로벌 증시", "세계 경제"],
}


@router.get("/stock", response_model=NewsListResponse)
async def get_stock_news(
    region: NewsRegion = Query(default=None, description="지역 필터"),
    grade: SentimentGrade = Query(default=None, description="등급 필터"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
):
    """주식 뉴스 목록 (네이버 API → 감성 분석)"""

    # 지역 필터에 따라 검색어 선택
    if region:
        queries = STOCK_QUERIES.get(region, ["주식 뉴스"])
        target_region = region
    else:
        # 전체: 모든 지역 키워드 수집
        queries = []
        for q_list in STOCK_QUERIES.values():
            queries.extend(q_list[:1])  # 각 지역 대표 1개씩
        target_region = None

    items = await fetch_analyzed_news(queries, region=target_region, display_per_query=10)

    # 등급 필터
    if grade:
        items = [i for i in items if i["grade"] == grade.value]

    # 페이지네이션
    total = len(items)
    start = (page - 1) * limit
    paged = items[start:start + limit]

    return NewsListResponse(
        items=paged,
        total=total,
        page=page,
        limit=limit,
    )
