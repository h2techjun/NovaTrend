"""
Pydantic 스키마 — 요청/응답 모델 정의
"""

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum
from datetime import datetime


class SentimentGrade(str, Enum):
    """감성 분석 등급"""
    BIG_GOOD = "big_good"     # 대박호재
    GOOD = "good"             # 호재
    BAD = "bad"               # 악재
    BIG_BAD = "big_bad"       # 대박악재


class NewsRegion(str, Enum):
    """주식 뉴스 지역"""
    KR = "kr"
    US = "us"
    EU = "eu"
    GLOBAL = "global"


class NewsItem(BaseModel):
    """뉴스 항목 (프론트엔드에 전달)"""
    id: str
    headline: str = Field(description="뉴스 헤드라인")
    summary: str = Field(description="AI 재작성 요약 (저작권 준수)")
    source: str = Field(description="출처 (예: 네이버뉴스, Reuters)")
    url: str = Field(description="원문 링크")
    grade: SentimentGrade = Field(description="AI 감성 등급")
    confidence: float = Field(ge=0.0, le=1.0, description="분석 신뢰도 (0~1)")
    published_at: datetime = Field(description="발행 시각")
    region: Optional[NewsRegion] = None
    keywords: list[str] = Field(default_factory=list, description="핵심 키워드")


class FearGreedResponse(BaseModel):
    """공포탐욕지수 응답"""
    value: int = Field(ge=0, le=100, description="공포탐욕지수 (0~100)")
    label: str = Field(description="극도의 공포 ~ 극도의 탐욕")
    previous_close: Optional[int] = None
    last_updated: datetime


class NewsListResponse(BaseModel):
    """뉴스 목록 응답"""
    items: list[NewsItem]
    total: int
    page: int = 1
    limit: int = 20


class HealthResponse(BaseModel):
    """헬스 체크 응답"""
    status: str
    service: str
