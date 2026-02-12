# 💻 CODING STANDARDS — NovaTrend

> 프로젝트 코딩 표준을 정의합니다.
> 마지막 업데이트: 2026-02-12

---

## 언어

- **TypeScript** (strict mode)
- **Korean First** (주석, 문서, 커밋 메시지)

## 프레임워크 규칙

### Next.js 15 App Router

- Server Components 우선 (기본값)
- `'use client'` 최소화 — 상태/이벤트 있을 때만
- Route Groups: `(auth)`, `(dashboard)`, `(public)` 등

### Supabase

- RLS 필수 (모든 테이블)
- Supabase Client: Server/Client 분리
- Edge Functions < 50ms 응답 목표

### React

- 함수형 컴포넌트만 (class 금지)
- Custom Hooks로 로직 분리
- `key` prop에 인덱스 사용 금지

## 파일 구조

```
src/
├── app/              # App Router 페이지
├── components/       # UI 컴포넌트
│   ├── ui/           # Shadcn 기반 원자 컴포넌트
│   └── feature/      # 기능별 컴포넌트
├── lib/              # 비즈니스 로직
├── hooks/            # Custom Hooks
├── types/            # TypeScript 타입
├── utils/            # 유틸리티 함수
└── styles/           # 글로벌 스타일
```

## 금지 사항

- ❌ `any` 타입
- ❌ `console.log` (프로덕션)
- ❌ 상대 경로 import
- ❌ 500줄 초과 파일
- ❌ 미사용 import/변수
