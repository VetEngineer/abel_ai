// 네이버 API 관련 타입 정의

// 네이버 API 공통 응답 구조
export interface NaverAPIResponse<T> {
  lastBuildDate: string
  total: number
  start: number
  display: number
  items: T[]
}

// 네이버 API 에러 응답
export interface NaverAPIError {
  errorMessage: string
  errorCode: string
}

// 블로그 검색 API 응답 아이템
export interface NaverBlogItem {
  title: string
  link: string
  description: string
  bloggername: string
  bloggerlink: string
  postdate: string
}

// 뉴스 검색 API 응답 아이템
export interface NaverNewsItem {
  title: string
  originallink: string
  link: string
  description: string
  pubDate: string
}

// 웹문서 검색 API 응답 아이템
export interface NaverWebItem {
  title: string
  link: string
  description: string
}

// 검색어 트렌드 API (DataLab) 요청
export interface NaverTrendRequest {
  startDate: string // YYYY-MM-DD
  endDate: string   // YYYY-MM-DD
  timeUnit: 'date' | 'week' | 'month'
  keywordGroups: Array<{
    groupName: string
    keywords: string[]
  }>
  device?: 'pc' | 'mo' | ''
  ages?: string[]
  gender?: 'm' | 'f' | ''
}

// 검색어 트렌드 API 응답
export interface NaverTrendResponse {
  startDate: string
  endDate: string
  timeUnit: string
  results: Array<{
    title: string
    keywords: string[]
    data: Array<{
      period: string
      ratio: number
    }>
  }>
}

// 네이버 API 설정 인터페이스
export interface NaverAPIConfig {
  clientId: string
  clientSecret: string
  baseURL?: string
}

// 검색 API 공통 매개변수
export interface SearchParams {
  query: string
  display?: number  // 한 번에 표시할 검색 결과 개수 (기본값: 10, 최대: 100)
  start?: number    // 검색 시작 위치 (기본값: 1, 최대: 1000)
  sort?: 'sim' | 'date' // 정렬 옵션 (sim: 정확도, date: 날짜)
}

// 블로그 검색 특화 매개변수
export interface BlogSearchParams extends SearchParams {
  // 블로그 검색은 기본 SearchParams와 동일
}

// 뉴스 검색 특화 매개변수
export interface NewsSearchParams extends SearchParams {
  // 뉴스 검색은 기본 SearchParams와 동일
}

// 키워드 분석 결과
export interface KeywordAnalysis {
  keyword: string
  searchVolume: number
  competition: 'low' | 'medium' | 'high'
  trend: 'rising' | 'stable' | 'declining'
  relatedKeywords: string[]
  seasonality?: SeasonalityData[]
}

// 계절성 데이터
export interface SeasonalityData {
  month: number
  relativeVolume: number // 1-100 범위
}

// 네이버 API 응답을 키워드 분석으로 변환하는 유틸리티 타입
export interface NaverKeywordInsight {
  blogPosts: number      // 블로그 포스트 수
  newsArticles: number   // 뉴스 기사 수
  recentTrend: number    // 최근 트렌드 점수
  competitionLevel: 'low' | 'medium' | 'high'
  relatedTerms: string[]
}

// 트렌드 데이터 요약
export interface TrendSummary {
  keyword: string
  averageVolume: number
  peakPeriod: string
  trendDirection: 'rising' | 'stable' | 'declining'
  volatility: number // 변동성 점수 (0-100)
}