import { BaseAgent } from '@/lib/agents/base-agent'
import { AgentType, AgentResult, SharedContext } from '@/types/agents'
import { ContentWritingOutput } from './content-writing-agent'
import { CopywritingOutput } from './copywriting-agent'
import { aiServiceRouter } from '@/lib/services/ai-service-router'

export interface MarketingFunnelInput {
  contentData: ContentWritingOutput
  copyData: CopywritingOutput
  specialization: string
  targetAudience: string
  contentGoals: string
}

export interface MarketingFunnelOutput {
  funnelStages: {
    awareness: {
      content: string
      cta: string
      touchpoints: string[]
    }
    interest: {
      content: string
      cta: string
      leadMagnets: string[]
    }
    consideration: {
      content: string
      cta: string
      trustBuilders: string[]
    }
    conversion: {
      content: string
      cta: string
      conversionOptimizers: string[]
    }
    retention: {
      content: string
      cta: string
      loyaltyPrograms: string[]
    }
  }
  customerJourney: Array<{
    stage: string
    customerMindset: string
    contentType: string
    expectedActions: string[]
    metrics: string[]
  }>
  leadNurturing: {
    emailSequence: Array<{
      day: number
      subject: string
      content: string
      cta: string
    }>
    contentSeries: string[]
    followUpStrategy: string[]
  }
  conversionOptimization: {
    landingPageElements: string[]
    formOptimization: string[]
    urgencyTactics: string[]
    socialProof: string[]
  }
}

export class MarketingFunnelAgent extends BaseAgent {
  constructor() {
    super(
      AgentType.MARKETING_FUNNEL,
      '마케팅 퍼널 에이전트',
      '전문직 고객 여정 및 CTA를 설계하여 리드 생성과 고객 전환을 최적화하는 전문 에이전트',
      ['고객 여정 설계', 'CTA 최적화', '리드 너처링', '전환 최적화', '퍼널 분석']
    )
  }

  async execute(input: any, context: SharedContext): Promise<AgentResult> {
    const startTime = Date.now()
    this.setStatus('processing' as any)

    try {
      // 입력 데이터 정규화 처리
      const normalizedInput = {
        contentData: input?.content ? input : input?.contentData || {},
        copyData: input?.headlines ? input : input?.copyData || {
          callToActions: {
            primary: '전문가 상담받기',
            secondary: ['무료 가이드 다운로드']
          }
        },
        specialization: input?.specialization || context?.platform || 'other',
        targetAudience: input?.targetAudience || context?.targetAudience || '일반 사용자',
        contentGoals: input?.contentGoals || context?.contentGoal || 'engagement',
        userId: context.userId || 'anonymous'
      }

      const funnelStrategy = await this.generateFunnelWithAI(normalizedInput)

      const output: MarketingFunnelOutput = funnelStrategy

      const executionTime = Date.now() - startTime
      const tokensUsed = this.calculateTokens(JSON.stringify(output))

      return this.createSuccessResult(output, executionTime, tokensUsed)
    } catch (error) {
      const executionTime = Date.now() - startTime
      return this.handleError(error as Error, executionTime)
    }
  }

  private async generateFunnelWithAI(input: any): Promise<MarketingFunnelOutput> {
    const { specialization, targetAudience, contentGoals, userId } = input

    const prompt = `당신은 전문 마케팅 전략가입니다. 다음 타겟과 목표에 맞는 마케팅 퍼널 및 전환 전략을 수립해주세요.

컨텍스트:
- 전문 분야: ${specialization}
- 타겟 독자: ${targetAudience}
- 콘텐츠 목표: ${contentGoals}

다음 JSON 형식으로 응답해주세요:

{
  "funnelStages": {
    "awareness": { "content": "인지 단계 전략", "cta": "문구", "touchpoints": ["접점1", "접점2"] },
    "interest": { "content": "흥미 단계 전략", "cta": "문구", "leadMagnets": ["자료1", "자료2"] },
    "consideration": { "content": "고려 단계 전략", "cta": "문구", "trustBuilders": ["신뢰요소1"] },
    "conversion": { "content": "전환 단계 전략", "cta": "문구", "conversionOptimizers": ["최적화요소1"] },
    "retention": { "content": "유지 단계 전략", "cta": "문구", "loyaltyPrograms": ["프로그램1"] }
  },
  "customerJourney": [
    {
      "stage": "단계명",
      "customerMindset": "고객 심리",
      "contentType": "콘텐츠 유형",
      "expectedActions": ["행동1"],
      "metrics": ["지표1"]
    }
  ],
  "leadNurturing": {
    "emailSequence": [
      { "day": 0, "subject": "제목", "content": "내용 요약", "cta": "버튼" }
    ],
    "contentSeries": ["시리즈1"],
    "followUpStrategy": ["전략1"]
  },
  "conversionOptimization": {
    "landingPageElements": ["요소1"],
    "formOptimization": ["최적화1"],
    "urgencyTactics": ["전술1"],
    "socialProof": ["소셜프루프1"]
  }
}

응답은 오직 유효한 JSON 포맷이어야 합니다.`

    try {
      const response = await aiServiceRouter.generateText({
        service: 'openai',
        model: 'gpt-5.2-xhigh',
        prompt: prompt,
        userId: userId,
        maxTokens: 3500,
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

      return JSON.parse(jsonMatch[0]) as MarketingFunnelOutput

    } catch (error) {
      console.error('Marketing Funnel Agent AI Error:', error)
      return this.getFallbackFunnel(input)
    }
  }

  private getFallbackFunnel(input: any): MarketingFunnelOutput {
    const { specialization, targetAudience } = input
    return {
      funnelStages: {
        awareness: { content: `${targetAudience} 대상 인지 제고`, cta: '자세히 보기', touchpoints: ['블로그', 'SNS'] },
        interest: { content: '관심 유도', cta: '가이드 다운로드', leadMagnets: ['체크리스트'] },
        consideration: { content: '전문성 입증', cta: '상담 신청', trustBuilders: ['자격증', '후기'] },
        conversion: { content: '서비스 제안', cta: '지금 시작하기', conversionOptimizers: ['한정 혜택'] },
        retention: { content: '지속 관리', cta: '채널 추가', loyaltyPrograms: ['정기 정보'] }
      },
      customerJourney: [],
      leadNurturing: { emailSequence: [], contentSeries: [], followUpStrategy: [] },
      conversionOptimization: { landingPageElements: [], formOptimization: [], urgencyTactics: [], socialProof: [] }
    }
  }
}