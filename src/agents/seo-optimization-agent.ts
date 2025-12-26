import { BaseAgent } from '@/lib/agents/base-agent'
import { AgentType, AgentResult, SharedContext } from '@/types/agents'
import { ContentPlanningOutput } from './content-planning-agent'

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

  async execute(input: SEOOptimizationInput, context: SharedContext): Promise<AgentResult> {
    const startTime = Date.now()
    this.setStatus('processing' as any)

    try {
      const metaData = this.optimizeMetaData(input)
      const structuredData = this.createStructuredData(input)
      const headings = this.optimizeHeadings(input.contentPlan)
      const internalLinking = this.planInternalLinking(input)
      const technicalSEO = this.analyzeTechnicalSEO(input.contentPlan)

      const output: SEOOptimizationOutput = {
        metaData,
        structuredData,
        headings,
        internalLinking,
        technicalSEO
      }

      const executionTime = Date.now() - startTime
      const tokensUsed = this.calculateTokens(JSON.stringify(output))

      return this.createSuccessResult(output, executionTime, tokensUsed)
    } catch (error) {
      const executionTime = Date.now() - startTime
      return this.handleError(error as Error, executionTime)
    }
  }

  private optimizeMetaData(input: SEOOptimizationInput) {
    const { contentPlan, specialization, targetAudience } = input
    const primaryKeyword = contentPlan.seoStrategy.primaryKeyword

    // 전문직별 타이틀 최적화
    const specializationPrefix = this.getSpecializationPrefix(specialization)
    const title = `${specializationPrefix} ${primaryKeyword} | 전문가 가이드`

    const description = `${targetAudience}를 위한 ${primaryKeyword} 전문 정보. ${specializationPrefix}가 직접 작성한 신뢰할 수 있는 가이드로 실무에 바로 적용 가능한 노하우를 제공합니다.`

    return {
      title: title.slice(0, 60), // 구글 권장 길이
      description: description.slice(0, 160), // 구글 권장 길이
      keywords: [
        primaryKeyword,
        ...contentPlan.seoStrategy.secondaryKeywords.slice(0, 8),
        specialization,
        targetAudience
      ],
      ogTitle: title.slice(0, 60),
      ogDescription: description.slice(0, 160)
    }
  }

  private getSpecializationPrefix(specialization: string): string {
    const prefixes: Record<string, string> = {
      'medical': '의료진',
      'legal': '법무 전문가',
      'tax': '세무사',
      'marketing': '마케팅 전문가',
      'consulting': '컨설팅 전문가',
      'finance': '금융 전문가',
      'education': '교육 전문가',
      'other': '전문가'
    }
    return prefixes[specialization] || '전문가'
  }

  private createStructuredData(input: SEOOptimizationInput) {
    const { specialization, contentPlan } = input

    // 전문분야별 구조화 데이터 타입 결정
    let type: 'Article' | 'MedicalWebPage' | 'ProfessionalService' = 'Article'
    if (specialization === 'medical') {
      type = 'MedicalWebPage'
    } else if (['legal', 'tax', 'consulting', 'finance'].includes(specialization)) {
      type = 'ProfessionalService'
    }

    const baseProperties = {
      headline: contentPlan.contentStrategy.mainTopic,
      description: contentPlan.contentStrategy.uniqueValue,
      keywords: contentPlan.seoStrategy.secondaryKeywords.join(', '),
      wordCount: contentPlan.seoStrategy.targetWordCount,
      author: {
        '@type': 'Organization',
        name: this.getSpecializationPrefix(specialization)
      },
      publisher: {
        '@type': 'Organization',
        name: 'Blog Content Automation Platform'
      }
    }

    // 전문분야별 특화 속성 추가
    const specializedProperties = this.getSpecializedProperties(specialization, contentPlan)

    return {
      type,
      properties: {
        ...baseProperties,
        ...specializedProperties
      }
    }
  }

  private getSpecializedProperties(specialization: string, contentPlan: ContentPlanningOutput) {
    const specialized: Record<string, any> = {}

    if (specialization === 'medical') {
      specialized.medicalSpecialty = '일반의학'
      specialized.medicalAudience = ['환자', '의료진']
    } else if (specialization === 'legal') {
      specialized.serviceType = '법무 상담'
      specialized.areaServed = '대한민국'
    } else if (specialization === 'tax') {
      specialized.serviceType = '세무 컨설팅'
      specialized.priceRange = '상담 문의'
    } else if (specialization === 'marketing') {
      specialized.serviceType = '디지털 마케팅'
      specialized.audience = contentPlan.targetAudience
    }

    return specialized
  }

  private optimizeHeadings(contentPlan: ContentPlanningOutput) {
    const h1 = contentPlan.contentStrategy.mainTopic

    const h2 = contentPlan.structure.mainSections.map(section => section.title)

    const h3 = contentPlan.structure.mainSections.flatMap(section =>
      section.keyPoints.map(point => point)
    )

    return { h1, h2, h3 }
  }

  private planInternalLinking(input: SEOOptimizationInput) {
    const { contentPlan, specialization } = input

    const suggestedAnchorTexts = [
      `${specialization} 전문 정보`,
      '관련 서비스 안내',
      '추가 가이드',
      '전문가 상담 문의'
    ]

    const relatedTopics = contentPlan.structure.mainSections
      .map(section => section.targetKeyword)
      .concat([
        `${specialization} 기본 정보`,
        `${contentPlan.targetAudience} 가이드`,
        '자주 묻는 질문'
      ])

    return {
      suggestedAnchorTexts,
      relatedTopics
    }
  }

  private analyzeTechnicalSEO(contentPlan: ContentPlanningOutput) {
    const targetWordCount = contentPlan.seoStrategy.targetWordCount
    const keywordCount = contentPlan.seoStrategy.secondaryKeywords.length

    // 키워드 밀도 계산 (권장: 1-3%)
    const keywordDensity = Math.min((keywordCount / targetWordCount) * 100, 2.5)

    // 가독성 점수 (전문 콘텐츠는 중간 난이도)
    const readabilityScore = 65 // 일반적인 전문 콘텐츠 수준

    return {
      readabilityScore,
      keywordDensity,
      recommendedWordCount: Math.max(targetWordCount, 1500) // 전문 콘텐츠 최소 길이
    }
  }
}