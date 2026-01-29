import { BaseAgent } from '@/lib/agents/base-agent'
import { AgentType, AgentResult, SharedContext } from '@/types/agents'
import { SEOOptimizationOutput } from './seo-optimization-agent'
import { aiServiceRouter } from '@/lib/services/ai-service-router'

export interface CopywritingInput {
  seoData: SEOOptimizationOutput
  specialization: string
  brandVoice: string
  targetAudience: string
  contentGoals: string
  existingReviews?: string[] // Added existing reviews field
}

export interface CopywritingOutput {
  headlines: {
    main: string
    alternative: string[]
    subHeadlines: string[]
  }
  introHook: {
    opening: string
    problemStatement: string
    credibilityStatement: string
    previewStatement: string
  }
  callToActions: {
    primary: string
    secondary: string[]
    consultation: string
    newsletter: string
  }
  testimonialFramework: {
    suggestedQuotes: string[]
    clientTypes: string[]
    credibilityElements: string[]
  }
  persuasionElements: {
    urgencyTriggers: string[]
    authoritySignals: string[]
    socialProof: string[]
    benefitStatements: string[]
  }
}

export class CopywritingAgent extends BaseAgent {
  constructor() {
    super(
      AgentType.COPYWRITING,
      '카피라이팅 에이전트',
      '전문가 신뢰도를 기반으로 한 고성과 카피와 제목을 생성하는 전문 에이전트',
      ['헤드라인 최적화', '설득적 카피', 'CTA 최적화', '전문가 신뢰도', '고객 심리 분석']
    )
  }

  async execute(input: any, context: SharedContext): Promise<AgentResult> {
    const startTime = Date.now()
    this.setStatus('processing' as any)

    try {
      // 입력 데이터 정규화 처리
      const seoData = input?.metaData ? input : input?.seoData || {}
      const specialization = input?.specialization || context?.platform || 'other'
      const brandVoice = input?.brandVoice || context?.brandTone || '전문적인'
      const targetAudience = input?.targetAudience || context?.targetAudience || '일반 사용자'
      const contentGoals = input?.contentGoals || context?.contentGoal || 'engagement'
      const existingReviews = input?.existingReviews || [] // Extract existing reviews
      const userId = context.userId || 'anonymous'

      // AI를 사용하여 카피라이팅 생성
      const aiOutput = await this.generateCopyWithAI({
        seoData, specialization, brandVoice, targetAudience, contentGoals, existingReviews
      }, userId)

      const output: CopywritingOutput = aiOutput

      const executionTime = Date.now() - startTime
      const tokensUsed = this.calculateTokens(JSON.stringify(output))

      return this.createSuccessResult(output, executionTime, tokensUsed)
    } catch (error) {
      const executionTime = Date.now() - startTime
      return this.handleError(error as Error, executionTime)
    }
  }

  private async generateCopyWithAI(input: any, userId: string): Promise<CopywritingOutput> {
    const { seoData, specialization, brandVoice, targetAudience, contentGoals } = input
    const primaryTopic = seoData?.headings?.h1 || '전문 주제'
    const keywords = (seoData?.metaData?.keywords || []).slice(0, 5).join(', ')

    const prompt = `전문 카피라이터로서 다음 콘텐츠를 위한 세일즈 카피와 헤드라인을 작성해주세요.

컨텍스트:
- 주제: ${primaryTopic}
- 키워드: ${keywords}
- 타겟 독자: ${targetAudience}
- 브랜드 보이스: ${brandVoice}
- 전문 분야: ${specialization}
- 목표: ${contentGoals}

다음 JSON 형식으로 응답해주세요. 독자의 호기심을 자극하고 행동을 유도할 수 있는 매력적인 문구를 작성하세요.
testimonialFramework는 가상의 고객 후기를 포함해야 합니다.

{
  "headlines": {
    "main": "메인 헤드라인 (30자 내외, 강력한 훅)",
    "alternative": ["대안 헤드라인 1", "대안 헤드라인 2", "대안 헤드라인 3"],
    "subHeadlines": ["소제목 아이디어 1", "소제목 아이디어 2"]
  },
  "introHook": {
    "opening": "독자의 공감을 이끌어내는 오프닝 문구",
    "problemStatement": "독자가 겪고 있을 문제점 명시",
    "credibilityStatement": "전문가로서의 신뢰성 입증 문구",
    "previewStatement": "이 글에서 얻을 수 있는 가치 예고"
  },
  "callToActions": {
    "primary": "메인 행동 유도 (예: 상담 신청)",
    "secondary": ["보조 행동 유도 1", "보조 행동 유도 2"],
    "consultation": "상담 권유 문구",
    "newsletter": "뉴스레터 구독 권유 문구"
  },
  "testimonialFramework": {
    "suggestedQuotes": ["기존 후기를 각색한 추천사 1 (창작 금지)", "기존 후기를 각색한 추천사 2 (창작 금지)"],
    "clientTypes": ["예상 고객 유형 1", "예상 고객 유형 2"],
    "credibilityElements": ["신뢰도 요소 1", "요소 2"]
  },
  "persuasionElements": {
    "urgencyTriggers": ["긴급성 유발 문구 1", "문구 2"],
    "authoritySignals": ["권위 입증 요소 1", "요소 2"],
    "socialProof": ["사회적 증거 문구 1", "요소 2"],
    "benefitStatements": ["핵심 이점 1", "이점 2"]
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
        temperature: 0.7
      })

      if (!response.success || !response.data) {
        throw new Error(response.error || 'AI 응답 실패')
      }

      const content = response.data.text
      const jsonMatch = content.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        throw new Error('AI 응답에서 JSON을 찾을 수 없습니다')
      }

      return JSON.parse(jsonMatch[0]) as CopywritingOutput

    } catch (error) {
      console.error('Copywriting Agent AI Error:', error)
      // Fallback to manual heuristic if AI fails
      return this.getFallbackCopy(input)
    }
  }

  private getFallbackCopy(input: any): CopywritingOutput {
    const { seoData, specialization, targetAudience } = input
    // Minimal fallback
    return {
      headlines: {
        main: `${specialization} 전문가가 알려주는 ${seoData?.headings?.h1 || '가이드'}`,
        alternative: [],
        subHeadlines: []
      },
      introHook: {
        opening: `${targetAudience} 여러분 안녕하세요.`,
        problemStatement: '문제 해결이 필요하신가요?',
        credibilityStatement: '저희가 도와드립니다.',
        previewStatement: '이 글을 통해 해결책을 알아보세요.'
      },
      callToActions: {
        primary: '지금 상담하기',
        secondary: [],
        consultation: '문의하기',
        newsletter: '구독하기'
      },
      testimonialFramework: { suggestedQuotes: [], clientTypes: [], credibilityElements: [] },
      persuasionElements: { urgencyTriggers: [], authoritySignals: [], socialProof: [], benefitStatements: [] }
    }
  }
}