"""
뉴스 수집기 — Naver API + RSS 피드 수집

실제 API 키 설정 전까지는 데모 모드로 동작합니다.
"""

import os
from typing import Optional
import httpx
from datetime import datetime

# Naver API 키
NAVER_CLIENT_ID = os.getenv("NAVER_CLIENT_ID", "")
NAVER_CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET", "")

NAVER_NEWS_API = "https://openapi.naver.com/v1/search/news.json"


async def search_naver_news(
    query: str,
    display: int = 20,
    sort: str = "date",
) -> list[dict]:
    """
    네이버 뉴스 검색 API 호출

    :param query: 검색 키워드
    :param display: 결과 개수 (최대 100)
    :param sort: 정렬 (date: 최신순, sim: 관련도순)
    :return: 뉴스 항목 리스트
    """
    if not NAVER_CLIENT_ID or not NAVER_CLIENT_SECRET:
        # API 키 미설정 시 빈 결과 반환 (데모 모드)
        return []

    headers = {
        "X-Naver-Client-Id": NAVER_CLIENT_ID,
        "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
    }

    params = {
        "query": query,
        "display": display,
        "sort": sort,
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(NAVER_NEWS_API, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()

    return [
        {
            "title": item.get("title", "").replace("<b>", "").replace("</b>", ""),
            "description": item.get("description", "").replace("<b>", "").replace("</b>", ""),
            "link": item.get("originallink", item.get("link", "")),
            "source": _extract_source(item.get("originallink", "")),
            "published_at": _parse_naver_date(item.get("pubDate", "")),
        }
        for item in data.get("items", [])
    ]


def _extract_source(url: str) -> str:
    """URL에서 출처 도메인 추출"""
    try:
        from urllib.parse import urlparse
        domain = urlparse(url).netloc
        return domain.replace("www.", "")
    except Exception:
        return "Unknown"


def _parse_naver_date(date_str: str) -> Optional[datetime]:
    """네이버 API 날짜 파싱 (RFC 822)"""
    try:
        from email.utils import parsedate_to_datetime
        return parsedate_to_datetime(date_str)
    except Exception:
        return datetime.now()
