"""
K-POP 뉴스 API 라우터

GET /api/news/kpop — K-POP 아이돌 뉴스 감성 분석
"""

from fastapi import APIRouter, Query
from models.schemas import NewsItem, NewsListResponse, SentimentGrade
from datetime import datetime

router = APIRouter()

# 데모 데이터
DEMO_KPOP_NEWS: list[NewsItem] = [
    NewsItem(
        id="kpop-1",
        headline="BTS RM, 솔로 월드투어 'Right Place, Wrong Person' 전석 매진",
        summary="RM의 솔로 월드투어가 아시아·북미·유럽 전 공연 티켓이 10분 만에 매진되는 기록을 세웠습니다.",
        source="네이버뉴스",
        url="https://news.naver.com/example/kpop1",
        grade=SentimentGrade.BIG_GOOD,
        confidence=0.94,
        published_at=datetime.now(),
        keywords=["BTS", "RM", "월드투어"],
    ),
    NewsItem(
        id="kpop-2",
        headline="aespa 새 앨범, 빌보드 핫 100 진입 — K-POP 4세대 기록",
        summary="aespa의 정규 3집이 빌보드 핫 100에 진입하며 4세대 걸그룹 최초의 기록을 달성했습니다.",
        source="Soompi",
        url="https://soompi.com/example/kpop2",
        grade=SentimentGrade.GOOD,
        confidence=0.89,
        published_at=datetime.now(),
        keywords=["aespa", "빌보드", "K-POP"],
    ),
]


@router.get("/kpop", response_model=NewsListResponse)
async def get_kpop_news(
    idol: str = Query(default=None, description="아이돌 검색 키워드"),
    grade: SentimentGrade = Query(default=None, description="등급 필터"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
):
    """K-POP 뉴스 목록 (아이돌/등급 필터링)"""
    items = DEMO_KPOP_NEWS

    if idol:
        items = [i for i in items if idol.lower() in " ".join(i.keywords).lower()]
    if grade:
        items = [i for i in items if i.grade == grade]

    return NewsListResponse(
        items=items[(page - 1) * limit : page * limit],
        total=len(items),
        page=page,
        limit=limit,
    )
