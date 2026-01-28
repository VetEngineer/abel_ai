// 네이버 API 서비스 구현

import {
  NaverAPIResponse,
  NaverAPIError,
  NaverBlogItem,
  NaverNewsItem,
  NaverWebItem,
  NaverTrendRequest,
  NaverTrendResponse,
  SearchParams,
  KeywordAnalysis,
  NaverKeywordInsight,
  TrendSummary
} from '@/types/naver-api'

export class NaverAPIService {
  private clientId: string
  private clientSecret: string
  private baseURL = 'https://openapi.naver.com/v1'

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId
    this.clientSecret = clientSecret
  }

  // 공통 API 호출 메서드
  private async makeRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`)

    // 쿼리 파라미터 추가
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value)
      }
    })

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'X-Naver-Client-Id': this.clientId,
          'X-Naver-Client-Secret': this.clientSecret,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`네이버 API 오류 (${response.status}):`, errorText)

        // 네이버 API 에러 응답 파싱 시도
        try {
          const errorData: NaverAPIError = JSON.parse(errorText)
          throw new Error(`네이버 API 오류: ${errorData.errorMessage} (${errorData.errorCode})`)
        } catch {
          throw new Error(`네이버 API 호출 실패: ${response.status} ${response.statusText}`)
        }
      }

      const data = await response.json()
      return data as T
    } catch (error) {
      console.error('네이버 API 요청 실패:', error)
      throw error
    }
  }

  // 블로그 검색
  public async searchBlogs(params: SearchParams): Promise<NaverAPIResponse<NaverBlogItem>> {
    const queryParams = {
      query: params.query,
      display: (params.display || 10).toString(),
      start: (params.start || 1).toString(),
      sort: params.sort || 'sim'
    }

    return this.makeRequest<NaverAPIResponse<NaverBlogItem>>('/search/blog', queryParams)
  }

  // 뉴스 검색
  public async searchNews(params: SearchParams): Promise<NaverAPIResponse<NaverNewsItem>> {
    const queryParams = {
      query: params.query,
      display: (params.display || 10).toString(),
      start: (params.start || 1).toString(),
      sort: params.sort || 'sim'
    }

    return this.makeRequest<NaverAPIResponse<NaverNewsItem>>('/search/news', queryParams)
  }

  // 웹문서 검색
  public async searchWeb(params: SearchParams): Promise<NaverAPIResponse<NaverWebItem>> {
    const queryParams = {
      query: params.query,
      display: (params.display || 10).toString(),
      start: (params.start || 1).toString(),
      sort: params.sort || 'sim'
    }

    return this.makeRequest<NaverAPIResponse<NaverWebItem>>('/search/webkr', queryParams)
  }

  // 검색어 트렌드 (DataLab API)
  public async getTrends(request: NaverTrendRequest): Promise<NaverTrendResponse> {
    try {
      const response = await fetch(`${this.baseURL}/datalab/search`, {
        method: 'POST',
        headers: {
          'X-Naver-Client-Id': this.clientId,
          'X-Naver-Client-Secret': this.clientSecret,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`네이버 트렌드 API 오류 (${response.status}):`, errorText)
        throw new Error(`네이버 트렌드 API 호출 실패: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('네이버 트렌드 API 요청 실패:', error)
      throw error
    }
  }

  // 키워드 종합 분석
  public async analyzeKeyword(keyword: string): Promise<KeywordAnalysis> {
    try {
      console.log(`키워드 분석 시작: ${keyword}`)

      // 병렬로 여러 API 호출
      const [blogResults, newsResults, webResults] = await Promise.all([
        this.searchBlogs({ query: keyword, display: 100 }),
        this.searchNews({ query: keyword, display: 100 }),
        this.searchWeb({ query: keyword, display: 100 })
      ])

      // 검색량 추정 (전체 결과 수 기반)
      const totalResults = blogResults.total + newsResults.total + webResults.total
      const estimatedSearchVolume = Math.min(Math.max(Math.floor(totalResults / 10), 100), 10000)

      // 경쟁도 계산 (블로그 포스트 수 기반)
      let competition: 'low' | 'medium' | 'high'
      if (blogResults.total < 1000) {
        competition = 'low'
      } else if (blogResults.total < 10000) {
        competition = 'medium'
      } else {
        competition = 'high'
      }

      // 트렌드 방향 분석 (최근 뉴스 기사 수 기반 간단 추정)
      let trend: 'rising' | 'stable' | 'declining'
      if (newsResults.total > 100) {
        trend = 'rising'
      } else if (newsResults.total > 20) {
        trend = 'stable'
      } else {
        trend = 'declining'
      }

      // 관련 키워드 추출 (블로그 제목에서)
      const relatedKeywords = this.extractRelatedKeywords(
        blogResults.items.map(item => item.title),
        keyword
      )

      return {
        keyword,
        searchVolume: estimatedSearchVolume,
        competition,
        trend,
        relatedKeywords
      }

    } catch (error) {
      console.error(`키워드 분석 실패 (${keyword}):`, error)

      // 오류 발생 시 기본값 반환
      return {
        keyword,
        searchVolume: 500,
        competition: 'medium',
        trend: 'stable',
        relatedKeywords: [`${keyword} 가이드`, `${keyword} 방법`, `${keyword} 추천`]
      }
    }
  }

  // 여러 키워드 일괄 분석
  public async analyzeKeywords(keywords: string[]): Promise<KeywordAnalysis[]> {
    const results: KeywordAnalysis[] = []

    // API 호출 제한을 위해 순차적으로 처리 (간격 추가)
    for (const keyword of keywords) {
      try {
        const analysis = await this.analyzeKeyword(keyword)
        results.push(analysis)

        // API 호출 간격 (1초)
        if (keywords.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.error(`키워드 분석 실패: ${keyword}`, error)

        // 실패한 키워드도 기본값으로 추가
        results.push({
          keyword,
          searchVolume: 100,
          competition: 'medium',
          trend: 'stable',
          relatedKeywords: []
        })
      }
    }

    return results
  }

  // 키워드 인사이트 생성
  public async getKeywordInsights(keyword: string): Promise<NaverKeywordInsight> {
    try {
      const [blogResults, newsResults] = await Promise.all([
        this.searchBlogs({ query: keyword, display: 100 }),
        this.searchNews({ query: keyword, display: 100 })
      ])

      // 관련 용어 추출
      const allTitles = [
        ...blogResults.items.map(item => item.title),
        ...newsResults.items.map(item => item.title)
      ]
      const relatedTerms = this.extractRelatedKeywords(allTitles, keyword)

      // 경쟁도 레벨 계산
      let competitionLevel: 'low' | 'medium' | 'high'
      const totalContent = blogResults.total + newsResults.total
      if (totalContent < 5000) {
        competitionLevel = 'low'
      } else if (totalContent < 20000) {
        competitionLevel = 'medium'
      } else {
        competitionLevel = 'high'
      }

      return {
        blogPosts: blogResults.total,
        newsArticles: newsResults.total,
        recentTrend: Math.floor(Math.random() * 100), // 임시: 실제로는 시간 기반 분석
        competitionLevel,
        relatedTerms: relatedTerms.slice(0, 10) // 상위 10개만
      }

    } catch (error) {
      console.error('키워드 인사이트 생성 실패:', error)
      throw error
    }
  }

  // 관련 키워드 추출 (제목 텍스트에서)
  private extractRelatedKeywords(titles: string[], originalKeyword: string): string[] {
    const keywords = new Set<string>()
    const cleanKeyword = originalKeyword.toLowerCase().replace(/[^\w\s가-힣]/g, '')

    titles.forEach(title => {
      // HTML 태그 제거 및 정리
      const cleanTitle = title
        .replace(/<[^>]*>/g, '')
        .replace(/&[^;]+;/g, '')
        .toLowerCase()

      // 원본 키워드 제거
      if (cleanTitle.includes(cleanKeyword)) {
        // 키워드 앞뒤 단어 추출
        const words = cleanTitle.split(/\s+/)
        words.forEach((word, index) => {
          if (word.includes(cleanKeyword)) {
            // 앞뒤 단어 조합 추가
            if (index > 0) {
              keywords.add(`${words[index - 1]} ${cleanKeyword}`)
            }
            if (index < words.length - 1) {
              keywords.add(`${cleanKeyword} ${words[index + 1]}`)
            }
          }
        })
      }
    })

    return Array.from(keywords)
      .filter(k => k.trim().length > cleanKeyword.length + 1)
      .slice(0, 20)
  }

  // API 키 유효성 검증
  public async validateAPIKey(): Promise<boolean> {
    try {
      // 간단한 테스트 검색 수행
      const result = await this.searchBlogs({
        query: '테스트',
        display: 1
      })
      return result.items !== undefined
    } catch (error) {
      console.error('네이버 API 키 검증 실패:', error)
      return false
    }
  }

  // 사용량 통계
  public getUsageStats() {
    return {
      clientId: this.clientId.substring(0, 8) + '...',
      endpoints: {
        blog: '/search/blog',
        news: '/search/news',
        web: '/search/webkr',
        trend: '/datalab/search'
      },
      limits: {
        dailyLimit: 25000,
        perSecondLimit: 10
      }
    }
  }
}

export default NaverAPIService
