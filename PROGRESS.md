# NovaTrend 진행 현황 & 다음 작업 가이드

> 마지막 업데이트: 2026-02-13

---

## ✅ 완료된 작업

### 환경 설정

- `.env.local` (프론트엔드) — Supabase, 네이버, HuggingFace, GA 키 설정 완료
- `backend/.env` (백엔드) — 동일 키 설정 완료
- Vercel 배포 설정 준비 완료

### Phase 1: 핵심 기능 실연동

| 파일 | 변경 내용 |
|------|---------|
| `backend/services/sentiment.py` | torch/transformers 제거 → HuggingFace Inference API (HTTP) |
| `backend/services/news_pipeline.py` | **신규** — 수집→감성분석→중복제거 통합 파이프라인 |
| `backend/routers/stock.py` | 데모 → 네이버 뉴스 API + 감성 분석 실연동 |
| `backend/routers/crypto.py` | 데모 → 네이버 + Alternative.me 공포탐욕지수 실연동 |
| `backend/routers/kpop.py` | 데모 → 네이버 + 아이돌 검색/트렌딩 실연동 |
| `backend/requirements.txt` | torch/transformers 제거 (경량화) |
| `src/lib/api.ts` | 타입 정의 + 백엔드 엔드포인트 매칭 |
| `src/app/stock/page.tsx` | 데모 → useEffect API 호출 + 로딩/에러 UI |
| `src/app/crypto/page.tsx` | 데모 → API 호출 + 공포탐욕지수 실연동 |
| `src/app/kpop/page.tsx` | 데모 → API 호출 + 아이돌 검색 |

---

## 🔜 다음 작업 (Phase 2)

### 1. 백엔드 실행 테스트

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# http://localhost:8000/docs 에서 API 확인
```

### 2. 프론트엔드 실행

```bash
cd ..  # 프로젝트 루트
npm run dev
# http://localhost:3000 에서 3개 대시보드 확인
```

### 3. 구현 예정 기능

- [ ] **Supabase DB 연동** — 뉴스 캐싱, 사용자 북마크
- [ ] **인증 시스템** — Supabase Auth (소셜 로그인)
- [ ] **K-POP 일정 DB화** — 현재 데모 데이터를 Supabase 테이블로
- [ ] **정기 수집 스케줄러** — APScheduler로 30분마다 뉴스 자동 수집
- [ ] **커뮤니티 기능** — 게시판, 댓글, 좋아요
- [ ] **Vercel 배포** — 환경 변수 설정 후 배포

---

## 📁 프로젝트 구조 (핵심)

```
00_NovaTrend/
├── src/                     # Next.js 14 프론트엔드
│   ├── app/
│   │   ├── stock/page.tsx   # 주식 뉴스 대시보드
│   │   ├── crypto/page.tsx  # 크립토 + 공포탐욕지수
│   │   └── kpop/page.tsx    # K-POP 뉴스 + 일정
│   └── lib/
│       ├── api.ts           # FastAPI 호출 함수
│       └── utils.ts         # 등급 타입, 색상, 유틸
├── backend/                 # FastAPI 백엔드
│   ├── main.py              # 앱 진입점 (CORS, 라우터)
│   ├── routers/
│   │   ├── stock.py         # /api/news/stock
│   │   ├── crypto.py        # /api/news/crypto, /api/crypto/fear-greed
│   │   └── kpop.py          # /api/news/kpop, /api/news/kpop/trending
│   ├── services/
│   │   ├── news_collector.py  # 네이버 뉴스 API 호출
│   │   ├── sentiment.py       # HuggingFace 감성 분석
│   │   ├── dedup.py           # Jaccard 중복 제거
│   │   └── news_pipeline.py   # 통합 파이프라인
│   └── models/schemas.py     # Pydantic 스키마
├── .env.local               # 프론트 환경변수 (git 무시)
└── backend/.env             # 백엔드 환경변수 (git 무시)
```

## 🔑 환경변수 (다른 컴퓨터에서 설정 필요)

**`.env.local`** (프론트엔드):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

**`backend/.env`** (백엔드):

```
NAVER_CLIENT_ID=your_id
NAVER_CLIENT_SECRET=your_secret
HUGGINGFACE_API_KEY=hf_xxx
SENTIMENT_MODEL=snunlp/KR-FinBert-SC
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
FRONTEND_URL=http://localhost:3000
```
