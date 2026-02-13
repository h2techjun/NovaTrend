"""
뉴스 파이프라인 — 수집 → 감성 분석 → 중복 제거 → 정규화

모든 라우터에서 공유하는 통합 파이프라인
"""

import uuid
from datetime import datetime
from typing import Optional

from services.news_collector import search_naver_news
from services.sentiment import analyze_sentiment
from services.dedup import deduplicate_news
from models.schemas import SentimentGrade, NewsRegion


async def fetch_analyzed_news(
    queries: list[str],
    region: Optional[NewsRegion] = None,
    display_per_query: int = 10,
) -> list[dict]:
    """
    키워드 리스트 → 뉴스 수집 → 감성 분석 → 중복 제거 → 정규화된 뉴스 반환

    :param queries: 검색 키워드 리스트
    :param region: 뉴스 지역 태그
    :param display_per_query: 키워드당 수집 건수
    :return: 분석 완료된 뉴스 리스트
    """
    all_raw = []

    # 1. 네이버 뉴스 수집
    for query in queries:
        try:
            items = await search_naver_news(query, display=display_per_query)
            for item in items:
                item["query"] = query
            all_raw.extend(items)
        except Exception as e:
            print(f"[파이프라인] '{query}' 수집 실패: {e}")

    if not all_raw:
        return []

    # 2. 중복 제거
    unique = deduplicate_news(all_raw, threshold=0.4, key="title")

    # 3. 감성 분석 + 정규화
    analyzed = []
    for item in unique:
        text = f"{item.get('title', '')} {item.get('description', '')}"
        sentiment = await analyze_sentiment(text)

        analyzed.append({
            "id": str(uuid.uuid4())[:8],
            "headline": item.get("title", ""),
            "summary": item.get("description", ""),
            "source": item.get("source", "Unknown"),
            "url": item.get("link", ""),
            "grade": sentiment["grade"],
            "confidence": sentiment["confidence"],
            "published_at": item.get("published_at") or datetime.now().isoformat(),
            "region": region.value if region else None,
            "keywords": [item.get("query", "")],
        })

    return analyzed
