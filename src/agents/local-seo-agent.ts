import { BaseAgent } from '@/lib/agents/base-agent'
import { AgentType, AgentResult, SharedContext } from '@/types/agents'
import { ContentWritingOutput } from './content-writing-agent'
import { aiServiceRouter } from '@/lib/services/ai-service-router'

export interface LocalSEOInput {
  contentData: ContentWritingOutput
  specialization: string
  targetAudience: string
  businessLocation?: string
  serviceArea?: string[]
}

export interface LocalSEOOutput {
  localKeywords: {
    cityKeywords: string[]
    regionKeywords: string[]
    serviceAreaKeywords: string[]
    competitorAnalysis: string[]
  }
  googleMyBusiness: {
    optimizationTips: string[]
    categoryRecommendations: string[]
    photoRecommendations: string[]
    reviewStrategy: string[]
  }
  localDirectories: {
    primaryDirectories: string[]
    industryDirectories: string[]
    submissionGuidelines: string[]
  }
  localContent: {
    communityTopics: string[]
    eventMarketing: string[]
    localPartnerships: string[]
    neighborhoodContent: string[]
  }
  citationBuilding: {
    napConsistency: string[]
    citationSources: string[]
    citationAudit: string[]
  }
}

export class LocalSEOAgent extends BaseAgent {
  constructor() {
    super(
      AgentType.LOCAL_SEO,
      '로컬 SEO 에이전트',
      '지역 전문가를 위한 로컬 검색 최적화와 지역 마케팅 전략을 수립하는 전문 에이전트',
      ['지역 SEO', '구글 마이비즈니스', '로컬 키워드', '지역 마케팅', '인용 구축']
    )
  }

  async execute(input: any, context: SharedContext): Promise<AgentResult> {
    const startTime = Date.now()
    this.setStatus('processing' as any)

    try {
      // 입력 데이터 정규화 처리
      const normalizedInput = {
        contentData: input?.content ? input : input?.contentData || {},
        specialization: input?.specialization || context?.platform || 'other',
        targetAudience: input?.targetAudience || context?.targetAudience || '일반 사용자',
        businessLocation: input?.businessLocation || '서울',
        serviceArea: input?.serviceArea || []
      }
      const userId = context.userId || 'anonymous'

      // AI를 사용하여 로컬 SEO 전략 생성
      const aiOutput = await this.generateLocalSEOWithAI(normalizedInput, userId)

      const output: LocalSEOOutput = aiOutput

      const executionTime = Date.now() - startTime
      const tokensUsed = this.calculateTokens(JSON.stringify(output))

      return this.createSuccessResult(output, executionTime, tokensUsed)
    } catch (error) {
      const executionTime = Date.now() - startTime
      return this.handleError(error as Error, executionTime)
    }
  }

  private async generateLocalSEOWithAI(input: any, userId: string): Promise<LocalSEOOutput> {
    const { specialization, businessLocation, serviceArea, targetAudience } = input
    const serviceAreaStr = serviceArea.length > 0 ? serviceArea.join(', ') : '인근 지역'

    const prompt = `로컬 SEO 전문가로서 다음 비즈니스에 대한 지역 최적화 전략을 수립해주세요.

비즈니스 정보:
- 전문 분야: ${specialization}
- 위치: ${businessLocation}
- 서비스 지역: ${serviceAreaStr}
- 타겟 고객: ${targetAudience}

다음 JSON 형식으로 응답해주세요. 
지역 특성(${businessLocation})을 반영하여 구체적으로 작성해주세요.

{
  "localKeywords": {
    "cityKeywords": ["도시명 포함 키워드 5개"],
    "regionKeywords": ["동/구 포함 세부 키워드 5개"],
    "serviceAreaKeywords": ["서비스 지역 포함 키워드 5개"],
    "competitorAnalysis": ["경쟁사가 사용할법한 키워드 3개"]
  },
  "googleMyBusiness": {
    "optimizationTips": ["GMB 최적화 팁 3개 - 구체적으로"],
    "categoryRecommendations": ["추천 카테고리 2개"],
    "photoRecommendations": ["업로드 추천 사진 유형 3개"],
    "reviewStrategy": ["리뷰 획득 및 관리 전략 3개"]
  },
  "localDirectories": {
    "primaryDirectories": ["등록해야 할 주요 포털/지도 3개"],
    "industryDirectories": ["해당 업종 전문 디렉토리 2개"],
    "submissionGuidelines": ["등록 시 주의사항 2개"]
  },
  "localContent": {
    "communityTopics": ["지역 커뮤니티 타겟 주제 3개"],
    "eventMarketing": ["지역 이벤트 아이디어 2개"],
    "localPartnerships": ["제휴 제안 대상 2개"],
    "neighborhoodContent": ["동네 관련 콘텐츠 아이디어 2개"]
  },
  "citationBuilding": {
    "napConsistency": ["NAP 일관성 관리 팁 2개"],
    "citationSources": ["인용 구축 출처 3개"],
    "citationAudit": ["인용 감사 체크리스트 2개"]
  }
}

응답은 오직 유효한 JSON 포맷이어야 합니다.`

    try {
      const response = await aiServiceRouter.generateText({
        service: 'claude',
        model: 'claude-3-haiku-20240307',
        prompt: prompt,
        userId: userId,
        maxTokens: 2500,
        temperature: 0.5
      })

      if (!response.success || !response.data) {
        throw new Error(response.error || 'AI 응답 실패')
      }

      const content = response.data.text
      const jsonMatch = content.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        throw new Error('AI 응답에서 JSON을 찾을 수 없습니다')
      }

      return JSON.parse(jsonMatch[0]) as LocalSEOOutput

    } catch (error) {
      console.error('Local SEO Agent AI Error:', error)
      // Fallback or re-throw
      // Minimal fallback to prevent crash
      return {
        localKeywords: { cityKeywords: [], regionKeywords: [], serviceAreaKeywords: [], competitorAnalysis: [] },
        googleMyBusiness: { optimizationTips: [], categoryRecommendations: [], photoRecommendations: [], reviewStrategy: [] },
        localDirectories: { primaryDirectories: [], industryDirectories: [], submissionGuidelines: [] },
        localContent: { communityTopics: [], eventMarketing: [], localPartnerships: [], neighborhoodContent: [] },
        citationBuilding: { napConsistency: [], citationSources: [], citationAudit: [] }
      }
    }
  }
}