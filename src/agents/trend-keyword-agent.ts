import { BaseAgent } from '@/lib/agents/base-agent'
import { AgentType, AgentResult, SharedContext } from '@/types/agents'
import { apiKeyManager } from '@/lib/services/api-key-manager'
import { NaverAPIService } from '@/lib/services/naver-api-service'

export interface TrendKeywordInput {
  topic: string
  industry: string
  targetRegion?: string
}

export interface TrendKeywordOutput {
  keywords: Array<{
    keyword: string
    searchVolume: number
    competition: string
    trend: 'rising' | 'stable' | 'declining'
  }>
  relatedTopics: string[]
  seasonality: string[]
}

export class TrendKeywordAgent extends BaseAgent {
  constructor() {
    super(
      AgentType.TREND_KEYWORD,
      '트렌드 키워드 에이전트',
      '네이버 검색 API를 활용하여 트렌드 키워드를 발굴하는 전문 에이전트',
      ['키워드 리서치', '트렌드 분석', '검색량 분석', '경쟁도 평가']
    )
  }

  async execute(input: TrendKeywordInput, context: SharedContext): Promise<AgentResult> {
    const startTime = Date.now()
    this.setStatus('processing' as any)

    try {
      // 네이버 검색 API 호출 (실제 구현에서는 API 키 필요)
      const keywords = await this.fetchTrendingKeywords(input.topic, input.industry)
      const relatedTopics = await this.findRelatedTopics(input.topic)

      const output: TrendKeywordOutput = {
        keywords,
        relatedTopics,
        seasonality: this.analyzeSeasonality(keywords)
      }

      const executionTime = Date.now() - startTime
      const tokensUsed = this.calculateTokens(JSON.stringify(output))

      return this.createSuccessResult(output, executionTime, tokensUsed)
    } catch (error) {
      const executionTime = Date.now() - startTime
      return this.handleError(error as Error, executionTime)
    }
  }

  private async fetchTrendingKeywords(topic: string, industry: string) {
    try {
      // 1. 네이버 API를 사용한 실제 키워드 분석
      const naverResults = await this.analyzeKeywordsWithNaver(topic, industry)
      if (naverResults && naverResults.length > 0) {
        return naverResults
      }

      // 2. 네이버 API 실패 시 Claude AI 키워드 생성
      const claudeApiKey = await apiKeyManager.getActiveAPIKey('claude')
      if (claudeApiKey) {
        console.log('네이버 API 실패, Claude AI로 키워드 생성 시도')
        return await this.generateKeywordsWithAI(topic, industry, claudeApiKey)
      }

      console.warn('모든 API 키가 설정되지 않음. 목업 데이터 사용.')
    } catch (error) {
      console.error('키워드 분석 오류:', error)
    }

    // 오류 시 기본 데이터 반환
    return this.getDefaultKeywords(topic, industry)
  }

  private async analyzeKeywordsWithNaver(topic: string, industry: string) {
    try {
      // 네이버 API 인증정보 조회
      const naverCredentials = await apiKeyManager.getNaverAPICredentials()
      if (!naverCredentials) {
        console.log('네이버 API 인증정보 없음, Claude AI 사용')
        return null
      }

      console.log('네이버 API로 키워드 분석 시작:', topic)
      const naverService = new NaverAPIService(
        naverCredentials.clientId,
        naverCredentials.clientSecret
      )

      // 주요 키워드들로 분석
      const baseKeywords = [
        topic,
        `${topic} 가이드`,
        `${topic} 추천`,
        `${topic} 방법`,
        `${industry} ${topic}`
      ]

      const analysisResults = await naverService.analyzeKeywords(baseKeywords)

      if (analysisResults && analysisResults.length > 0) {
        // 네이버 API 결과를 우리 형식으로 변환
        return analysisResults.map(result => ({
          keyword: result.keyword,
          searchVolume: result.searchVolume,
          competition: result.competition,
          trend: result.trend
        }))
      }

      return null
    } catch (error) {
      console.error('네이버 API 키워드 분석 오류:', error)
      return null
    }
  }

  private async findRelatedTopics(topic: string): Promise<string[]> {
    try {
      // 네이버 API를 사용한 관련 토픽 발굴
      const naverCredentials = await apiKeyManager.getNaverAPICredentials()
      if (naverCredentials) {
        console.log('네이버 API로 관련 토픽 분석 시작:', topic)
        const naverService = new NaverAPIService(
          naverCredentials.clientId,
          naverCredentials.clientSecret
        )

        // 블로그 검색으로 관련 키워드 발굴
        const blogResults = await naverService.searchBlogs({
          query: topic,
          display: 50
        })

        if (blogResults && blogResults.items.length > 0) {
          // 블로그 제목에서 관련 키워드 추출
          const relatedKeywords = naverService['extractRelatedKeywords'](
            blogResults.items.map(item => item.title),
            topic
          )

          if (relatedKeywords.length > 0) {
            return relatedKeywords.slice(0, 10) // 상위 10개만 반환
          }
        }
      }
    } catch (error) {
      console.error('네이버 API 관련 토픽 분석 오류:', error)
    }

    // 기본 관련 토픽 반환
    return [
      `${topic} 팁`,
      `${topic} 방법`,
      `${topic} 후기`,
      `${topic} 장점`,
      `${topic} 단점`,
      `${topic} 비교`,
      `${topic} 추천`,
      `${topic} 순위`
    ]
  }

  private analyzeSeasonality(keywords: any[]): string[] {
    // 계절성 분석 로직
    return ['연중', '여름', '겨울']
  }

  private async generateKeywordsWithAI(topic: string, industry: string, apiKey: string) {
    const prompt = `다음 주제에 대한 효과적인 SEO 키워드 5개를 생성해주세요:

주제: ${topic}
산업: ${industry}

각 키워드에 대해 다음 정보를 JSON 배열 형식으로 제공해주세요:
- keyword: 키워드 내용
- searchVolume: 예상 월간 검색량 (100-10000 범위의 숫자)
- competition: 경쟁도 ("low", "medium", "high" 중 하나)
- trend: 트렌드 ("rising", "stable", "declining" 중 하나)

응답은 반드시 유효한 JSON 배열 형태로만 해주세요.`

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      })

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`)
      }

      const result = await response.json()
      const content = result.content?.[0]?.text

      if (content) {
        try {
          // JSON 응답에서 배열 추출
          const jsonMatch = content.match(/\[[\s\S]*?\]/)
          if (jsonMatch) {
            const keywords = JSON.parse(jsonMatch[0])
            if (Array.isArray(keywords) && keywords.length > 0) {
              return keywords
            }
          }
        } catch (parseError) {
          console.warn('AI 응답 JSON 파싱 실패:', parseError)
        }
      }
    } catch (error) {
      console.error('Claude API 호출 오류:', error)
    }

    // 오류 시 기본 데이터 반환
    return this.getDefaultKeywords(topic, industry)
  }

  private getDefaultKeywords(topic: string, industry: string) {
    return [
      {
        keyword: `${topic} 가이드`,
        searchVolume: 1200,
        competition: 'medium',
        trend: 'rising' as const
      },
      {
        keyword: `${topic} 추천`,
        searchVolume: 800,
        competition: 'high',
        trend: 'stable' as const
      },
      {
        keyword: `${topic} 비교`,
        searchVolume: 600,
        competition: 'low',
        trend: 'rising' as const
      },
      {
        keyword: `${industry} ${topic}`,
        searchVolume: 950,
        competition: 'medium',
        trend: 'stable' as const
      },
      {
        keyword: `${topic} 순위`,
        searchVolume: 750,
        competition: 'medium',
        trend: 'declining' as const
      }
    ]
  }
}