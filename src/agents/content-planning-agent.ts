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

  async execute(input: any, context: SharedContext): Promise<AgentResult> {
    const startTime = Date.now()
    this.setStatus('processing' as any)

    try {
      // 입력 데이터 정규화 처리
      const keywords = input?.keywords?.keywords || input?.keywords || []
      const targetAudience = input?.targetAudience || context?.targetAudience || '일반 사용자'
      const brandVoice = input?.brandVoice || context?.brandTone || '친근한'
      const contentGoals = input?.contentGoals || ['engagement']

      const primaryKeyword = this.selectPrimaryKeyword(keywords)
      const contentStrategy = this.developContentStrategy(primaryKeyword, targetAudience, brandVoice)
      const structure = this.createContentStructure(primaryKeyword, { keywords })
      const seoStrategy = this.planSEOStrategy(keywords, primaryKeyword)

      const output: ContentPlanningOutput = {
        contentStrategy,
        structure,
        seoStrategy,
        targetAudience,
        contentGoal: Array.isArray(contentGoals) ? contentGoals[0] : contentGoals || 'engagement'
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
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return '기본 키워드'
    }

    const sorted = keywords.sort((a, b) => {
      const scoreA = (a?.searchVolume || 0) * (a?.competition === 'low' ? 1.5 : a?.competition === 'medium' ? 1 : 0.7)
      const scoreB = (b?.searchVolume || 0) * (b?.competition === 'low' ? 1.5 : b?.competition === 'medium' ? 1 : 0.7)
      return scoreB - scoreA
    })
    return sorted[0]?.keyword || keywords[0]?.keyword || '기본 키워드'
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

  private createContentStructure(primaryKeyword: string, keywordData: any) {
    const keywords = keywordData?.keywords || []
    const mainSections = keywords.slice(1, 4).map((kw: any, index: number) => ({
      title: `${index + 1}. ${kw?.keyword || `섹션 ${index + 1}`}의 핵심 포인트`,
      keyPoints: [
        `${kw?.keyword || '해당 주제'}의 주요 특징`,
        `실제 활용 방법`,
        `주의사항 및 팁`
      ],
      targetKeyword: kw?.keyword || `키워드 ${index + 1}`
    }))

    // 섹션이 없는 경우 기본 섹션 생성
    if (mainSections.length === 0) {
      mainSections.push({
        title: `1. ${primaryKeyword}의 기본 개념`,
        keyPoints: [
          `${primaryKeyword}의 주요 특징`,
          `실제 활용 방법`,
          `주의사항 및 팁`
        ],
        targetKeyword: primaryKeyword
      })
    }

    return {
      introduction: `${primaryKeyword}에 대한 포괄적인 이해를 돕는 서론`,
      mainSections,
      conclusion: `${primaryKeyword}에 대한 요약과 실행 가능한 다음 단계`
    }
  }

  private planSEOStrategy(keywords: any[], primaryKeyword: string) {
    const safeKeywords = Array.isArray(keywords) ? keywords : []
    return {
      primaryKeyword,
      secondaryKeywords: safeKeywords.slice(1, 6).map(k => k?.keyword || '').filter(Boolean),
      targetWordCount: Math.max(1500, safeKeywords.length * 300) // 키워드 개수에 따라 조정
    }
  }
}