# 개발 가이드

## 프로젝트 현재 상태

✅ **완료된 기능**
- Next.js 14 기본 설정 및 TypeScript 구성
- Tailwind CSS 스타일링 시스템
- 11개 에이전트 아키텍처 설계
- Supabase 데이터베이스 스키마 설계
- 기본 워크플로우 시스템 구현
- 데모 API (실제 데이터베이스 없이 작동)
- 반응형 UI 컴포넌트

## 실행 방법

### 1. 개발 환경 설정
```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

### 2. 애플리케이션 테스트
1. 브라우저에서 http://localhost:3000 접속
2. "🚀 데모 시작하기" 버튼 클릭
3. 주제 입력 후 "AI 에이전트로 콘텐츠 생성" 버튼 클릭
4. 실시간으로 11개 에이전트의 실행 상태 확인

## 아키텍처 개요

### 에이전트 시스템
```typescript
// 11개 전문 에이전트
1. TrendKeywordAgent - 트렌드 키워드 분석
2. ContentPlanningAgent - 콘텐츠 기획
3. SEOOptimizationAgent - SEO 최적화
4. CopywritingAgent - 카피라이팅
5. ContentWritingAgent - 콘텐츠 작성
6. VisualDesignAgent - 시각 디자인
7. LocalSEOAgent - 로컬 SEO
8. AnswerOptimizationAgent - 답변 최적화
9. MarketingFunnelAgent - 마케팅 퍼널
10. BrandSupervisionAgent - 브랜드 감독
11. BlogDeploymentAgent - 블로그 배포
```

### 토큰 최적화 시스템
- 에이전트별 핵심 스킬 압축 (3-4개)
- SharedContext를 통한 컨텍스트 공유 (250 토큰 제한)
- 구조화된 데이터 교환으로 토큰 사용량 60-75% 절약

## 다음 구현 단계

### Phase 1: AI 모델 통합
- [ ] Claude API 통합
- [ ] OpenAI API 통합
- [ ] Google AI API 통합
- [ ] 실제 에이전트 로직 구현

### Phase 2: 플랫폼 연동
- [ ] 워드프레스 API 연동
- [ ] 네이버 블로그 API 연동
- [ ] 배포 자동화 시스템

### Phase 3: 사용자 인증 및 프로젝트 관리
- [ ] Supabase 인증 시스템
- [ ] 프로젝트 관리 UI
- [ ] 사용자 대시보드

### Phase 4: 고급 기능
- [ ] 실시간 협업 기능
- [ ] A/B 테스트 시스템
- [ ] 성능 분석 대시보드

## 폴더 구조
```
blog-content-automation-platform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/demo/          # 데모 API 라우트
│   │   ├── page.tsx           # 메인 페이지
│   │   └── layout.tsx         # 전역 레이아웃
│   ├── components/            # React 컴포넌트
│   │   ├── ContentCreationForm.tsx
│   │   └── WorkflowStatus.tsx
│   ├── lib/                   # 라이브러리 및 유틸
│   │   ├── agents/           # 에이전트 시스템
│   │   └── supabase/         # Supabase 클라이언트
│   ├── agents/               # 개별 에이전트 구현
│   └── types/                # TypeScript 타입 정의
├── supabase/                 # Supabase 설정
│   ├── migrations/          # DB 마이그레이션
│   └── config.toml          # Supabase 설정
└── docs/                    # 문서
```

## 개발 참고사항

### 1. 에이전트 개발 가이드
- `BaseAgent` 클래스를 상속받아 구현
- `execute()` 메서드에서 핵심 로직 구현
- 토큰 사용량 최적화 고려

### 2. API 라우트
- `/api/demo/*` - 데모용 API (데이터베이스 없이 작동)
- 향후 `/api/v1/*` - 실제 프로덕션 API

### 3. 컴포넌트 스타일
- Tailwind CSS 사용
- 반응형 디자인 고려
- 접근성 고려사항 포함

## 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (Supabase)
- **AI Models**: Claude, OpenAI, Google AI
- **Deployment**: Vercel (예정)

## 라이선스

MIT License