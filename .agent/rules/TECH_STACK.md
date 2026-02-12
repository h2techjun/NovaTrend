# 🚀 TECH STACK — NovaTrend

## 아키텍처 개요

```
┌─────────────────────┐
│   User (Browser)    │
└──────────┬──────────┘
           │
    ┌──────▼──────┐
    │  Next.js 15 │ (Vercel 배포)
    │  App Router │
    └──────┬──────┘
           │
    ┌──────▼──────────────────────┐
    │  Supabase Platform         │
    │  ┌──────┬────────┬────────┐│
    │  │  DB  │Storage │ Auth   ││
    │  └──────┴────────┴────────┘│
    └──────┬──────────────────────┘
           │
    ┌──────▼──────┐
    │ Google AI   │ (Gemini 2.0 Flash)
    │ News APIs   │ (뉴스 데이터)
    └─────────────┘
```

---

## 기술 스택 상세

| 레이어         | 기술                    | 버전   | 선정 이유                  |
| -------------- | ----------------------- | ------ | -------------------------- |
| **프론트엔드** | Next.js                 | 15     | App Router, SSR/SSG        |
| **UI**         | Shadcn UI               | latest | 커스터마이즈 가능, 접근성  |
| **스타일**     | Tailwind CSS            | 4.x    | 유틸리티 퍼스트, 빠른 개발 |
| **DB**         | Supabase (PostgreSQL)   | —      | RLS, 실시간, Auth 통합     |
| **인증**       | Supabase Auth           | —      | OAuth, 이메일/비밀번호     |
| **AI**         | Google Gemini 2.0 Flash | —      | 비용 효율적, 빠른 응답     |
| **배포**       | Vercel                  | —      | Next.js 최적, 자동 배포    |
| **결제**       | Paddle + Toss           | —      | 글로벌 + 한국 결제         |
| **캐싱**       | Upstash Redis           | —      | 서버리스 Redis             |

---

## DocTranslation 공유 리소스

- **Supabase 프로젝트**: 동일 프로젝트 공유 (비용 절감)
- **인증**: 통합 사용자 시스템
- **포인트/결제**: 통합 관리
- **Ezoic 광고**: 동일 네트워크

---

## 뉴스 데이터 소스 (예정)

| 카테고리    | API                           | 비용      |
| ----------- | ----------------------------- | --------- |
| 글로벌 뉴스 | NewsAPI / GNews               | 무료 티어 |
| 주식 시장   | Alpha Vantage / Yahoo Finance | 무료 티어 |
| 암호화폐    | CoinGecko / CryptoCompare     | 무료 티어 |
| K-POP       | Twitter/X API + 웹 크롤링     | TBD       |
