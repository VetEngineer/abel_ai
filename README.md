# Blog Content Automation Platform

AI 기반 블로그 콘텐츠 자동화 플랫폼입니다. 11개의 전문 에이전트가 협업하여 고품질 블로그 콘텐츠를 생성하고 다중 플랫폼에 배포합니다.

## 주요 기능

### 🤖 11개 전문 에이전트 시스템
1. **트렌드 키워드 에이전트** - 네이버 검색 API를 활용한 키워드 발굴
2. **콘텐츠 기획 에이전트** - 전략 수립 및 구조 설계
3. **SEO 최적화 에이전트** - 검색엔진 최적화
4. **카피라이팅 에이전트** - 매력적인 제목과 문구 작성
5. **콘텐츠 작성 에이전트** - 고품질 본문 작성
6. **시각 디자인 에이전트** - 이미지 및 시각 요소 생성
7. **로컬 SEO 에이전트** - 지역 검색 최적화
8. **답변 최적화 에이전트** - 음성검색 및 AEO 최적화
9. **마케팅 퍼널 에이전트** - 전환율 최적화
10. **브랜드 감독 에이전트** - 브랜드 일관성 관리
11. **블로그 배포 에이전트** - 다중 플랫폼 자동 배포

### 🔧 기술 스택
- **Frontend**: EasyNext (Next.js)
- **Backend**: Supabase (Database, Edge Functions)
- **AI Models**: Claude, OpenAI, Google AI
- **APIs**: 네이버 검색 API, 워드프레스 API
- **Deployment**: Vercel + GitHub Actions

### 🎯 토큰 최적화
- 에이전트별 핵심 스킬 압축 (3-4개)
- 컨텍스트 공유 최소화 (250 토큰)
- 구조화된 데이터 교환
- 60-75% 토큰 사용량 절약

### 📱 플랫폼 지원
- **워드프레스**: 완전 자동화 배포
- **네이버 블로그**: API/자동화/수동 다중 전략

## 프로젝트 구조

```
blog-content-automation-platform/
├── src/                          # 소스 코드
│   ├── app/                      # Next.js 앱 디렉토리
│   ├── components/               # 재사용 컴포넌트
│   ├── lib/                      # 유틸리티 및 설정
│   ├── agents/                   # 클라이언트 사이드 에이전트
│   └── types/                    # TypeScript 타입
├── supabase/                     # Supabase 설정
│   ├── functions/                # Edge Functions (에이전트)
│   ├── migrations/               # DB 스키마
│   └── seed.sql                  # 초기 데이터
├── docs/                         # 문서
├── .github/                      # GitHub Actions
└── config/                       # 설정 파일
```

## 시작하기

### 환경 설정
```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local

# Supabase 설정
npx supabase init
npx supabase start
```

### 개발 서버 실행
```bash
npm run dev
```

## 환경변수

```env
# Next.js
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI APIs
CLAUDE_API_KEY=your_claude_api_key
OPENAI_API_KEY=your_openai_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key

# 네이버 APIs
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret

# 워드프레스
WORDPRESS_DEFAULT_SITE_URL=your_wordpress_site
WORDPRESS_APPLICATION_PASSWORD=your_app_password
```

## 기여하기

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 라이센스

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 지원

- 문서: [docs/](./docs/)
- 이슈: [GitHub Issues](https://github.com/yourusername/blog-content-automation-platform/issues)
- 토론: [GitHub Discussions](https://github.com/yourusername/blog-content-automation-platform/discussions)