import { BaseAgent } from '@/lib/agents/base-agent'
import { AgentType, AgentResult, SharedContext } from '@/types/agents'
import { TrendKeywordOutput } from './trend-keyword-agent'

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

  async execute(input: ContentPlanningInput, context: SharedContext): Promise<AgentResult> {
    const startTime = Date.now()
    this.setStatus('processing' as any)

    try {
      const primaryKeyword = this.selectPrimaryKeyword(input.keywords.keywords)
      const contentStrategy = this.developContentStrategy(primaryKeyword, input.targetAudience, input.brandVoice)
      const structure = this.createContentStructure(primaryKeyword, input.keywords)
      const seoStrategy = this.planSEOStrategy(input.keywords.keywords, primaryKeyword)

      const output: ContentPlanningOutput = {
        contentStrategy,
        structure,
        seoStrategy,
        targetAudience: input.targetAudience,
        contentGoal: input.contentGoals[0] || 'engagement'
      }

      const executionTime = Date.now() - startTime
      const tokensUsed = this.calculateTokens(JSON.stringify(output))

      return this.createSuccessResult(output, executionTime, tokensUsed)
    } catch (error) {
      const executionTime = Date.now() - startTime
      return this.handleError(error as Error, executionTime)
    }
  }

  private selectPrimaryKeyword(keywords: any[]): string {
    // 검색량과 경쟁도를 고려하여 주요 키워드 선택
    const sorted = keywords.sort((a, b) => {
      const scoreA = a.searchVolume * (a.competition === 'low' ? 1.5 : a.competition === 'medium' ? 1 : 0.7)
      const scoreB = b.searchVolume * (b.competition === 'low' ? 1.5 : b.competition === 'medium' ? 1 : 0.7)
      return scoreB - scoreA
    })
    return sorted[0]?.keyword || keywords[0]?.keyword
  }

  private developContentStrategy(primaryKeyword: string, targetAudience: string, brandVoice: string) {
    return {
      mainTopic: primaryKeyword,
      angle: this.determineContentAngle(primaryKeyword, targetAudience),
      uniqueValue: this.identifyUniqueValue(primaryKeyword, brandVoice)
    }
  }

  private determineContentAngle(keyword: string, audience: string): string {
    const angles = [
      '실용적 가이드',
      '심층 분석',
      '비교 리뷰',
      '단계별 튜토리얼',
      '전문가 인사이트'
    ]

    // 키워드와 타겟 오디언스에 따라 적절한 앵글 선택
    if (keyword.includes('가이드') || keyword.includes('방법')) {
      return '단계별 튜토리얼'
    } else if (keyword.includes('비교') || keyword.includes('추천')) {
      return '비교 리뷰'
    } else if (keyword.includes('분석') || keyword.includes('심화')) {
      return '심층 분석'
    }
    return '실용적 가이드'
  }

  private identifyUniqueValue(keyword: string, brandVoice: string): string {
    return `${brandVoice} 스타일로 ${keyword}에 대한 실용적이고 신뢰할 수 있는 정보 제공`
  }

  private createContentStructure(primaryKeyword: string, keywordData: TrendKeywordOutput) {
    const mainSections = keywordData.keywords.slice(1, 4).map((kw, index) => ({
      title: `${index + 1}. ${kw.keyword}의 핵심 포인트`,
      keyPoints: [
        `${kw.keyword}의 주요 특징`,
        `실제 활용 방법`,
        `주의사항 및 팁`
      ],
      targetKeyword: kw.keyword
    }))

    return {
      introduction: `${primaryKeyword}에 대한 포괄적인 이해를 돕는 서론`,
      mainSections,
      conclusion: `${primaryKeyword}에 대한 요약과 실행 가능한 다음 단계`
    }
  }

  private planSEOStrategy(keywords: any[], primaryKeyword: string) {
    return {
      primaryKeyword,
      secondaryKeywords: keywords.slice(1, 6).map(k => k.keyword),
      targetWordCount: Math.max(1500, keywords.length * 300) // 키워드 개수에 따라 조정
    }
  }
}