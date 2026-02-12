---
description: "The Living Constitution" - JARVIS의 핵심 행동 원칙.
---

# 📜 DOCTRINE v3.1 (The Living Constitution)

> 이 문서는 J.A.R.V.I.S.와 모든 하위 에이전트의 행동을 지배하는 **진화하는 헌법**입니다.
> 모든 작업에서 최우선 순위로 준수하십시오.
> 마지막 업데이트: 2026-02-12

---

## 0. 🏛️ SUPREME COMMANDS (최상위 강제 원칙) [ZERO TOLERANCE]

### SC-1. 🇰🇷 격식 있는 한국어 원칙 (Korean First)

- **모든** 대화, 계획, 보고는 **격식 있는 한국어**로 작성합니다.
- 예외: 기술 용어, 코드 변수/함수명 (영어 유지)
- 커밋 메시지, 코드 주석 모두 한국어

### SC-2. 🤖 에이전트 책임제

- 모든 작업에 적절한 에이전트 페르소나를 할당합니다
- 에이전트 전환 시 명시적 선언 필요

### SC-3. 🔒 보안 제1원칙

- API Key, 비밀번호 등 하드코딩 절대 금지
- `.env` 파일은 반드시 `.gitignore`에 포함
- RLS 정책 필수

---

## 1. 📐 코딩 표준 (Coding Standards)

### CS-1. TypeScript Strict Mode

- `strict: true` 필수
- `any` 타입 절대 금지
- 모든 함수에 반환 타입 명시

### CS-2. 네이밍 규칙

| 대상     | 규칙        | 예시              |
| -------- | ----------- | ----------------- |
| 변수     | camelCase   | `userId`          |
| 상수     | UPPER_SNAKE | `MAX_RETRY_COUNT` |
| 함수     | 동사+명사   | `fetchArticles()` |
| 컴포넌트 | PascalCase  | `TrendCard`       |
| 파일     | kebab-case  | `trend-card.tsx`  |

### CS-3. 함수형 프로그래밍 우선

- 순수 함수 우선
- 상태 변이 최소화
- Early Return 패턴

### CS-4. 절대 경로 사용

```typescript
// ✅
import { TrendCard } from "@/components/trend-card";

// ❌
import { TrendCard } from "../../../components/trend-card";
```

---

## 2. 🧪 테스트 표준

- 단위 테스트: 핵심 비즈니스 로직
- 통합 테스트: API 엔드포인트
- 80% 커버리지 목표
- 테스트 파일은 소스 옆에 `.test.ts`

---

## 3. 📁 파일 관리

- 파일당 최대 300줄
- 컴포넌트당 최대 200줄
- 500줄 초과 시 즉시 분할

---

## 4. 🔄 Git 규칙

- Conventional Commits (한국어)
- 원자적 커밋 (하나의 논리적 변경)
- 좀비 코드 금지 (주석 처리된 코드 삭제)

---

## 5. 🧬 자가 진화

- 3회 이상 반복 패턴 → 자동화 제안
- 실패 패턴 → `ANTI_PATTERNS.md` 기록
- 성공 패턴 → `SUCCESS_PATTERNS.md` 기록

---

## 6. 🔗 크로스 프로젝트 참조

- DocTranslation과 공유 리소스: Supabase Auth, 결제, 포인트
- 공통 컴포넌트/유틸은 패키지화 또는 심링크
- `.agent/memory/` 간 지식 공유 허용

---

## 7. 💰 비용 모니터링

- API 비용 5달러 초과 시 경고
- Supabase 무료 플랜 한도 모니터링
- 불필요한 API 호출 제거
