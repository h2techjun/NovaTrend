# 🚀 NovaTrend

AI 기반 글로벌 뉴스 감성 분석 대시보드

> 주식 · 크립토 · K-POP 뉴스를 AI가 실시간 분석하여 **대박호재 / 호재 / 악재 / 대박악재** 4단계로 분류합니다.

## ✨ 주요 기능

| 대시보드           | 설명                               |
| ------------------ | ---------------------------------- |
| 📈 **글로벌 주식** | 한국·미국·유럽 주식 뉴스 감성 분석 |
| 💰 **크립토 마켓** | BTC·ETH 뉴스 + 공포탐욕지수        |
| 🎤 **K-POP**       | 아이돌 뉴스·일정·콘서트 티켓       |
| 💬 **커뮤니티**    | 투자 토론 + K-POP 덕질 게시판      |

## 🛠 기술 스택

| 영역       | 기술                                             |
| ---------- | ------------------------------------------------ |
| Frontend   | Next.js 14 (App Router), TailwindCSS 3, Radix UI |
| Backend    | Python FastAPI                                   |
| AI         | HuggingFace (KR-FinBERT, FinBERT)                |
| DB & Auth  | Supabase (PostgreSQL + Auth)                     |
| 차트       | Recharts                                         |
| 애니메이션 | Framer Motion                                    |
| i18n       | next-intl (한국어/영어/중국어)                   |

## 🚀 시작하기

```bash
# 프론트엔드
npm install
npm run dev

# 백엔드 (준비 중)
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## 📂 프로젝트 구조

```
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── page.tsx          # 메인 랜딩
│   │   ├── stock/            # 주식 대시보드
│   │   ├── crypto/           # 크립토 대시보드
│   │   ├── kpop/             # K-POP 대시보드
│   │   └── community/        # 커뮤니티
│   ├── components/           # 공용 컴포넌트
│   └── lib/                  # 유틸리티
├── backend/                  # Python FastAPI (준비 중)
├── messages/                 # i18n 메시지 (준비 중)
└── public/                   # 정적 파일
```

## 📊 감성 분석 등급

| 등급 | 한국어   | English  | 中文     |
| ---- | -------- | -------- | -------- |
| 🟢   | 대박호재 | Big Good | 重大利好 |
| 🔵   | 호재     | Good     | 利好     |
| 🟠   | 악재     | Bad      | 利空     |
| 🔴   | 대박악재 | Big Bad  | 重大利空 |

## 🤝 파트너

[DocTranslation](https://doctranslation.com) — AI 문서 번역 서비스

## 📄 라이선스

Private — All rights reserved.
