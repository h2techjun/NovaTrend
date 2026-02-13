"""
K-POP 뉴스 API 라우터 — 실 데이터 연동

GET /api/news/kpop — K-POP 아이돌 뉴스 감성 분석
GET /api/news/kpop/trending — 트렌딩 K-POP 뉴스
"""

from fastapi import APIRouter, Query
from models.schemas import NewsListResponse, SentimentGrade
from services.news_pipeline import fetch_analyzed_news

router = APIRouter()

DEFAULT_QUERIES = ["K-POP 뉴스", "아이돌 컴백", "K-POP 콘서트"]


@router.get("/kpop", response_model=NewsListResponse)
async def get_kpop_news(
    idol: str = Query(default=None, description="아이돌 검색 키워드"),
    grade: SentimentGrade = Query(default=None, description="등급 필터"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
):
    """K-POP 뉴스 목록 (아이돌/등급 필터링)"""
    if idol:
        queries = [f"{idol} 뉴스", f"{idol} 컴백", idol]
    else:
        queries = DEFAULT_QUERIES

    items = await fetch_analyzed_news(queries, display_per_query=10)

    if grade:
        items = [i for i in items if i["grade"] == grade.value]

    total = len(items)
    start = (page - 1) * limit
    paged = items[start:start + limit]

    return NewsListResponse(items=paged, total=total, page=page, limit=limit)


@router.get("/kpop/trending", response_model=NewsListResponse)
async def get_kpop_trending():
    """트렌딩 K-POP 뉴스 (인기 아이돌 기반)"""
    trending_queries = ["BTS 뉴스", "뉴진스 뉴스", "aespa 뉴스", "BLACKPINK 뉴스"]
    items = await fetch_analyzed_news(trending_queries, display_per_query=5)

    return NewsListResponse(items=items[:20], total=len(items), page=1, limit=20)
