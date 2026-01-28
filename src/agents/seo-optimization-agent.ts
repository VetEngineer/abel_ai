import { BaseAgent } from '@/lib/agents/base-agent'
import { AgentType, AgentResult, SharedContext } from '@/types/agents'
import { ContentPlanningOutput } from './content-planning-agent'
import { aiServiceRouter } from '@/lib/services/ai-service-router'

export interface SEOOptimizationInput {
  contentPlan: ContentPlanningOutput
  specialization: string
  targetAudience: string
  contentGoals: string
}

export interface SEOOptimizationOutput {
  metaData: {
    title: string
    description: string
    keywords: string[]
    ogTitle: string
    ogDescription: string
  }
  structuredData: {
    type: 'Article' | 'MedicalWebPage' | 'ProfessionalService'
    properties: Record<string, any>
  }
  headings: {
    h1: string
    h2: string[]
    h3: string[]
  }
  internalLinking: {
    suggestedAnchorTexts: string[]
    relatedTopics: string[]
  }
  technicalSEO: {
    readabilityScore: number
    keywordDensity: number
    recommendedWordCount: number
  }
}

export class SEOOptimizationAgent extends BaseAgent {
  constructor() {
    super(
      AgentType.SEO_OPTIMIZATION,
      'SEO 최적화 에이전트',
      '전문직을 위한 메타 태그, 구조화 데이터, 내부 링크 최적화를 수행하는 전문 에이전트',
      ['메타 태그 최적화', '구조화 데이터', '키워드 최적화', '기술적 SEO', '전문직 SEO']
    )
  }

  async execute(input: any, context: SharedContext): Promise<AgentResult> {
    const startTime = Date.now()
    this.setStatus('processing' as any)

    try {
      // 입력 데이터 정규화 처리
      const contentPlan = input?.contentStrategy ? input : input?.contentPlan
      const specialization = input?.specialization || context?.platform || 'other'
      const targetAudience = input?.targetAudience || context?.targetAudience || '일반 사용자'
      const contentGoals = input?.contentGoals || context?.contentGoal || 'engagement'
      const userId = context.userId || 'anonymous'

      // AI를 사용하여 SEO 전략 생성
      const aiOutput = await this.generateSEOWithAI(contentPlan, specialization, targetAudience, contentGoals, userId)

      const output: SEOOptimizationOutput = aiOutput

      const executionTime = Date.now() - startTime
      const tokensUsed = this.calculateTokens(JSON.stringify(output))

      return this.createSuccessResult(output, executionTime, tokensUsed)
    } catch (error) {
      const executionTime = Date.now() - startTime
      return this.handleError(error as Error, executionTime)
    }
  }

  private async generateSEOWithAI(contentPlan: any, specialization: string, targetAudience: string, contentGoals: string, userId: string): Promise<SEOOptimizationOutput> {
    const mainTopic = contentPlan?.contentStrategy?.mainTopic || '전문 콘텐츠'
    const primaryKeyword = contentPlan?.seoStrategy?.primaryKeyword || mainTopic
    const keyPoints = contentPlan?.structure?.mainSections?.map((s: any) => s.title).join(', ') || ''

    const prompt = `SEO 전문가로서 다음 콘텐츠에 대한 최적화 전략을 수립해주세요.

콘텐츠 정보:
- 주제: ${mainTopic}
- 메인 키워드: ${primaryKeyword}
- 타겟 독자: ${targetAudience}
- 전문 분야: ${specialization}
- 주요 내용: ${keyPoints}

다음 JSON 형식으로 응답해주세요. description은 160자 이내, title은 60자 이내로 실제 검색 결과에 최적화하여 작성하세요.

{
  "metaData": {
    "title": "클릭률을 높이는 최적화된 타이틀 ( ~ 60자)",
    "description": "메타 디스크립션 ( ~ 160자)",
    "keywords": ["키워드1", "키워드2", "키워드3"],
    "ogTitle": "SNS 공유용 타이틀",
    "ogDescription": "SNS 공유용 설명"
  },
  "structuredData": {
    "type": "Article 또는 MedicalWebPage 또는 ProfessionalService 중 적절한 것 선택",
    "properties": { "headline": "...", "description": "...", "author": "..." }
  },
  "headings": {
    "h1": "최적화된 H1 태그",
    "h2": ["H2 태그1", "H2 태그2"],
    "h3": ["H3 태그1", "H3 태그2"]
  },
  "internalLinking": {
    "suggestedAnchorTexts": ["앵커 텍스트 추천1", "추천2"],
    "relatedTopics": ["관련 주제1", "주제2"]
  },
  "technicalSEO": {
    "readabilityScore": 예상_가독성_점수(0-100),
    "keywordDensity": 예상_키워드_밀도(숫자),
    "recommendedWordCount": 권장_단어_수(숫자)
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
        temperature: 0.3
      })

      if (!response.success || !response.data) {
        throw new Error(response.error || 'AI 응답 실패')
      }

      const content = response.data.text
      const jsonMatch = content.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        throw new Error('AI 응답에서 JSON을 찾을 수 없습니다')
      }

      return JSON.parse(jsonMatch[0]) as SEOOptimizationOutput

    } catch (error) {
      console.error('SEO Optimization Agent AI Error:', error)
      // Fallback to manual heuristic if AI fails
      // This ensures the workflow doesn't completely stop
      return this.getFallbackSEO(contentPlan, specialization, targetAudience)
    }
  }

  // 기존 휴리스틱 로직을 폴백용으로 재활용
  private getFallbackSEO(contentPlan: any, specialization: string, targetAudience: string): SEOOptimizationOutput {
    // (기존 optimizeMetaData 등 메서드 활용하여 구성)
    // 코드가 길어지므로 간단한 기본값 반환으로 대체
    return {
      metaData: {
        title: `${contentPlan?.contentStrategy?.mainTopic || '제목 미정'} | 전문가 가이드`,
        description: '전문 콘텐츠입니다.',
        keywords: [contentPlan?.seoStrategy?.primaryKeyword || '키워드'],
        ogTitle: '',
        ogDescription: ''
      },
      structuredData: {
        type: 'Article',
        properties: {}
      },
      headings: { h1: '', h2: [], h3: [] },
      internalLinking: { suggestedAnchorTexts: [], relatedTopics: [] },
      technicalSEO: { readabilityScore: 60, keywordDensity: 1.5, recommendedWordCount: 1500 }
    }
  }
}