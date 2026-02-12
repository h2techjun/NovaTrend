"""
NovaTrend FastAPI 백엔드 — 메인 엔트리포인트

뉴스 수집 → AI 감성 분석 → REST API 제공
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import stock, crypto, kpop

# 환경 변수 로드
load_dotenv()

app = FastAPI(
    title="NovaTrend API",
    description="AI 기반 글로벌 뉴스 감성 분석 API",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS 설정 — 프론트엔드 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js 개발 서버
        "https://novatrend.com",  # 프로덕션
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(stock.router, prefix="/api/news", tags=["주식 뉴스"])
app.include_router(crypto.router, prefix="/api", tags=["크립토"])
app.include_router(kpop.router, prefix="/api/news", tags=["K-POP 뉴스"])


@app.get("/api/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {"status": "ok", "service": "NovaTrend API"}


@app.get("/")
async def root():
    """루트 — API 문서 리다이렉트 안내"""
    return {
        "message": "NovaTrend API",
        "docs": "/api/docs",
    }
