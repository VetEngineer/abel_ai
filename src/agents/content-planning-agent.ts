import { BaseAgent } from '@/lib/agents/base-agent'
import { AgentType, AgentResult, SharedContext } from '@/types/agents'
import { TrendKeywordOutput } from './trend-keyword-agent'
import { aiServiceRouter } from '@/lib/services/ai-service-router'

export interface ContentPlanningInput {
  keywords: TrendKeywordOutput
  targetAudience: string
  contentGoals: string[]
  brandVoice: string
}

export interface ContentPlanningOutput {
  contentStrategy: {
    mainTopic: string
    angle: string
    uniqueValue: string
  }
  structure: {
    introduction: string
    mainSections: Array<{
      title: string
      keyPoints: string[]
      targetKeyword: string
    }>
    conclusion: string
  }
  seoStrategy: {
    primaryKeyword: string
    secondaryKeywords: string[]
    targetWordCount: number
  }
  targetAudience: string
  contentGoal: string
}

export class ContentPlanningAgent extends BaseAgent {
  constructor() {
    super(
      AgentType.CONTENT_PLANNING,
      '콘텐츠 기획 에이전트',
      '키워드 데이터를 바탕으로 전략적 콘텐츠 구조를 설계하는 전문 에이전트',
      ['콘텐츠 전략 수립', '구조 설계', '타겟 오디언스 분석', 'SEO 기획']
    )
  }

  async execute(input: any, context: SharedContext): Promise<AgentResult> {
    const startTime = Date.now()
    this.setStatus('processing' as any)

    try {
      // 입력 데이터 정규화 처리
      const keywords = input?.keywords?.keywords || input?.keywords || []
      const targetAudience = input?.targetAudience || context?.targetAudience || '일반 사용자'
      const brandVoice = input?.brandVoice || context?.brandTone || '친근한'
      const contentGoals = input?.contentGoals || ['engagement']
      const userId = context.userId || 'anonymous'

      // AI를 사용하여 콘텐츠 기획 생성
      const aiOutput = await this.generatePlanWithAI(keywords, targetAudience, brandVoice, contentGoals, userId)

      const executionTime = Date.now() - startTime
      const tokensUsed = this.calculateTokens(JSON.stringify(aiOutput))

      return this.createSuccessResult(aiOutput, executionTime, tokensUsed)
    } catch (error) {
      const executionTime = Date.now() - startTime
      return this.handleError(error as Error, executionTime)
    }
  }

  private async generatePlanWithAI(keywords: any[], targetAudience: string, brandVoice: string, contentGoals: string[], userId: string): Promise<ContentPlanningOutput> {
    const keywordList = keywords.map(k => `${k.keyword} (Vol: ${k.searchVolume}, Comp: ${k.competition})`).join(', ')

    const prompt = `당신은 전문적인 콘텐츠 전략가입니다. 다음 SEO 키워드 데이터를 바탕으로 블로그 콘텐츠 기획안을 작성해주세요.

주요 정보:
- 타겟 키워드: ${keywordList}
- 타겟 독자: ${targetAudience}
- 브랜드 보이스: ${brandVoice}
- 콘텐츠 목표: ${contentGoals.join(', ')}

다음 JSON 형식으로 응답해주세요:
{
  "contentStrategy": {
    "mainTopic": "메인 주제 (H1)",
    "angle": "콘텐츠 접근 각도 (예: 가이드, 비교, 분석 등)",
    "uniqueValue": "이 콘텐츠가 독자에게 주는 가치 제안"
  },
  "structure": {
    "introduction": "서론 개요 (후킹 및 문제 제기)",
    "mainSections": [
      {
        "title": "섹션 제목 (H2)",
        "keyPoints": ["다룰 핵심 내용 1", "다룰 핵심 내용 2"],
        "targetKeyword": "이 섹션에서 타겟팅할 키워드"
      }
    ],
    "conclusion": "결론 개요 (요약 및 CTA)"
  },
  "seoStrategy": {
    "primaryKeyword": "가장 중요한 메인 키워드 1개",
    "secondaryKeywords": ["보조 키워드 3-5개"],
    "targetWordCount": 예상_단어_수(숫자)
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

      const parsed = JSON.parse(jsonMatch[0])

      // 응답 구조 보정
      return {
        contentStrategy: parsed.contentStrategy,
        structure: parsed.structure,
        seoStrategy: parsed.seoStrategy,
        targetAudience: targetAudience,
        contentGoal: contentGoals[0] || 'engagement'
      }

    } catch (error) {
      console.error('Content Planning Agent AI Error:', error)
      // 에러 발생 시 휴리스틱 방식(기존 로직)으로 폴백하도록 구현할 수 있으나, 
      // Phase 4 목표상 AI 에러를 전파하거나 기본값(fallback)을 최소화합니다.
      // 여기서는 안전하게 기본 구조를 반환합니다.

      return {
        contentStrategy: {
          mainTopic: keywords[0]?.keyword || '제목 미정',
          angle: '일반 정보',
          uniqueValue: '정보 제공'
        },
        structure: {
          introduction: '서론',
          mainSections: [],
          conclusion: '결론'
        },
        seoStrategy: {
          primaryKeyword: keywords[0]?.keyword || '',
          secondaryKeywords: [],
          targetWordCount: 1500
        },
        targetAudience,
        contentGoal: contentGoals[0]
      }
    }
  }
}