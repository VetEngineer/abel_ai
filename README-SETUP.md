# 🚀 SaaS 배포 설정 가이드

이 가이드는 AI 블로그 콘텐츠 자동화 플랫폼을 SaaS로 배포하는 방법을 설명합니다.

## 📋 필수 요구사항

1. **Claude API 키** (추천, 가장 효과적)
2. **OpenAI API 키** (선택사항)
3. **Google AI API 키** (Gemini, 선택사항)
4. **Supabase 프로젝트** (데이터베이스, 선택사항)

## 🔧 환경 설정

### 1. 환경 변수 파일 생성

`.env.local` 파일을 프로젝트 루트에 생성:

```bash
# 최소 설정 (Claude API만 사용)
CLAUDE_API_KEY=sk-ant-api03-your_claude_api_key_here

# 추가 AI 서비스 (선택사항)
OPENAI_API_KEY=sk-your_openai_api_key_here
GOOGLE_AI_API_KEY=AIza_your_gemini_api_key_here

# Supabase 설정 (데이터 저장용, 선택사항)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 보안 설정
ENCRYPTION_KEY=your-32-character-encryption-key-here
ADMIN_SECRET_KEY=your-admin-secret-key

# 결제 기능 (고급 기능, 선택사항)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 2. API 키 발급 방법

#### Claude API (추천)
1. [Anthropic Console](https://console.anthropic.com/) 방문
2. 계정 생성 또는 로그인
3. API 키 생성
4. 사용량 제한 및 예산 설정

#### OpenAI API (선택사항)
1. [OpenAI Platform](https://platform.openai.com/) 방문
2. API 키 생성
3. 결제 방법 추가

#### Google AI (Gemini) API (선택사항)
1. [Google AI Studio](https://makersuite.google.com/) 방문
2. API 키 생성

## 🚢 배포 옵션

### 옵션 1: Vercel (추천)

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 배포
vercel

# 환경 변수 설정 (Vercel 대시보드에서)
```

### 옵션 2: Netlify

```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 빌드
npm run build

# 배포
netlify deploy --prod --dir=out
```

### 옵션 3: Docker

```bash
# Docker 이미지 빌드
docker build -t blog-automation .

# 컨테이너 실행
docker run -p 3000:3000 --env-file .env.local blog-automation
```

## 🔍 기능 테스트

### 1. 로컬 개발 서버 실행

```bash
npm run dev
```

### 2. 기본 기능 테스트

1. **콘텐츠 생성**: http://localhost:3000 에서 주제 입력
2. **관리자 패널**: http://localhost:3000/admin (ADMIN_SECRET_KEY 필요)
3. **API 엔드포인트**: http://localhost:3000/api/workflows

### 3. AI 연동 확인

브라우저 개발자 도구 콘솔에서 다음 메시지 확인:
- ✅ "Claude API 키를 사용합니다" → AI 연동 성공
- ⚠️ "Claude API 키가 설정되지 않음. 목업 데이터 사용" → 목업 모드

## 🛠 고급 설정

### Supabase 데이터베이스 설정 (선택사항)

1. [Supabase](https://supabase.com/) 프로젝트 생성
2. 다음 테이블 생성:

```sql
-- 사용자 테이블
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- API 키 관리
CREATE TABLE api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name VARCHAR,
  api_key_name VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 워크플로우 로그
CREATE TABLE workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  status VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 결제 기능 설정 (고급)

Stripe를 사용한 구독 결제 시스템:

1. Stripe 계정 생성
2. Webhook 엔드포인트 설정: `/api/stripe/webhook`
3. 제품 및 가격 설정

## 🚨 보안 고려사항

1. **API 키 보안**
   - 환경 변수로만 관리
   - `.env.local`을 절대 커밋하지 말 것
   - 프로덕션에서는 암호화된 저장소 사용

2. **Rate Limiting**
   - API 호출 제한 설정
   - 사용자별 요청 제한

3. **인증 시스템**
   - JWT 토큰 사용
   - 세션 관리
   - 관리자 권한 분리

## 📊 모니터링

### 사용량 추적

관리자 대시보드에서 확인:
- API 호출 횟수
- 토큰 사용량
- 비용 분석
- 사용자 활동

### 알림 설정

- API 한도 도달 시 알림
- 오류 발생 시 로그
- 성능 모니터링

## 🎯 SaaS 변환 체크리스트

- [ ] API 키 설정 완료
- [ ] 로컬 테스트 성공
- [ ] 배포 플랫폼 선택
- [ ] 환경 변수 설정
- [ ] 도메인 연결
- [ ] SSL 인증서 설정
- [ ] 데이터베이스 연결 (선택)
- [ ] 결제 시스템 연결 (선택)
- [ ] 모니터링 도구 설정
- [ ] 백업 시스템 구축

## 💡 최적화 팁

1. **비용 절약**
   - Claude-3-Haiku 모델 사용 (저렴하고 빠름)
   - 응답 캐싱으로 중복 호출 방지
   - 사용자별 요청 제한

2. **성능 향상**
   - CDN 사용
   - 이미지 최적화
   - API 응답 캐싱

3. **사용자 경험**
   - 로딩 상태 표시
   - 진행률 표시
   - 에러 처리

이제 실제 AI 기반 SaaS 플랫폼이 준비되었습니다! 🎉