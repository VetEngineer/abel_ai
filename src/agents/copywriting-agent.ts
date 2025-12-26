import { BaseAgent } from '@/lib/agents/base-agent'
import { AgentType, AgentResult, SharedContext } from '@/types/agents'
import { SEOOptimizationOutput } from './seo-optimization-agent'

export interface CopywritingInput {
  seoData: SEOOptimizationOutput
  specialization: string
  brandVoice: string
  targetAudience: string
  contentGoals: string
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

  async execute(input: CopywritingInput, context: SharedContext): Promise<AgentResult> {
    const startTime = Date.now()
    this.setStatus('processing' as any)

    try {
      const headlines = this.createHeadlines(input)
      const introHook = this.craftIntroHook(input)
      const callToActions = this.generateCallToActions(input)
      const testimonialFramework = this.buildTestimonialFramework(input)
      const persuasionElements = this.createPersuasionElements(input)

      const output: CopywritingOutput = {
        headlines,
        introHook,
        callToActions,
        testimonialFramework,
        persuasionElements
      }

      const executionTime = Date.now() - startTime
      const tokensUsed = this.calculateTokens(JSON.stringify(output))

      return this.createSuccessResult(output, executionTime, tokensUsed)
    } catch (error) {
      const executionTime = Date.now() - startTime
      return this.handleError(error as Error, executionTime)
    }
  }

  private createHeadlines(input: CopywritingInput) {
    const { seoData, specialization, targetAudience } = input
    const primaryTopic = seoData.headings.h1

    const specializationCredential = this.getSpecializationCredential(specialization)
    const urgencyWord = this.getUrgencyWord(input.contentGoals)
    const benefitWord = this.getBenefitWord(specialization)

    const main = `${specializationCredential}가 알려주는 ${primaryTopic} ${urgencyWord} 가이드`

    const alternative = [
      `${targetAudience}를 위한 ${primaryTopic} 완벽 해결법`,
      `${primaryTopic}, 이제 ${benefitWord}하게 해결하세요`,
      `${specializationCredential} 검증된 ${primaryTopic} 노하우`,
      `${primaryTopic} 실무 적용을 위한 단계별 가이드`,
      `${targetAudience}가 반드시 알아야 할 ${primaryTopic}`
    ]

    const subHeadlines = seoData.headings.h2.map(h2 =>
      this.optimizeSubHeadline(h2, specialization)
    )

    return { main, alternative, subHeadlines }
  }

  private getSpecializationCredential(specialization: string): string {
    const credentials: Record<string, string> = {
      'medical': '의료진',
      'legal': '변호사',
      'tax': '세무사',
      'marketing': '마케팅 전문가',
      'consulting': '컨설턴트',
      'finance': '금융 전문가',
      'education': '교육 전문가',
      'other': '전문가'
    }
    return credentials[specialization] || '전문가'
  }

  private getUrgencyWord(contentGoals: string): string {
    if (contentGoals.includes('신규')) return '필수'
    if (contentGoals.includes('교육')) return '핵심'
    if (contentGoals.includes('홍보')) return '완벽'
    if (contentGoals.includes('유치')) return '즉시'
    return '실무'
  }

  private getBenefitWord(specialization: string): string {
    const benefits: Record<string, string> = {
      'medical': '안전',
      'legal': '확실',
      'tax': '효과적',
      'marketing': '성공적',
      'consulting': '전략적',
      'finance': '안정적',
      'education': '체계적',
      'other': '효율적'
    }
    return benefits[specialization] || '효율적'
  }

  private optimizeSubHeadline(h2: string, specialization: string): string {
    const actionWords = ['확인하세요', '주의하세요', '활용하세요', '적용하세요', '검토하세요']
    const randomAction = actionWords[Math.floor(Math.random() * actionWords.length)]

    if (h2.includes('.')) {
      return h2.replace('.', `,`) + ` ${randomAction}`
    }
    return `${h2}을 ${randomAction}`
  }

  private craftIntroHook(input: CopywritingInput) {
    const { targetAudience, specialization, seoData } = input
    const mainTopic = seoData.headings.h1

    const opening = `${targetAudience}께서 ${mainTopic}에 대해 고민하고 계신가요?`

    const problemStatement = `많은 ${targetAudience}들이 ${mainTopic}에 대해 정확한 정보를 찾지 못해 어려움을 겪고 있습니다. 인터넷상의 부정확한 정보나 일반적인 조언으로는 실제 상황에 적용하기 어려운 것이 현실입니다.`

    const credential = this.getSpecializationCredential(specialization)
    const credibilityStatement = `${credential}로서 수년간의 실무 경험을 바탕으로, ${targetAudience}가 실제로 적용할 수 있는 검증된 방법들을 정리했습니다.`

    const previewStatement = `이 가이드에서는 ${mainTopic}의 핵심 포인트부터 실무 적용 방법까지, 단계별로 상세하게 설명드리겠습니다.`

    return {
      opening,
      problemStatement,
      credibilityStatement,
      previewStatement
    }
  }

  private generateCallToActions(input: CopywritingInput) {
    const { specialization, targetAudience } = input
    const credential = this.getSpecializationCredential(specialization)

    const primary = `${credential}와 직접 상담받기`

    const secondary = [
      '무료 체크리스트 다운로드',
      '관련 서비스 자세히 보기',
      '성공 사례 확인하기',
      '추가 가이드 읽어보기'
    ]

    const consultation = `${targetAudience} 맞춤 상담 신청하기`

    const newsletter = `${specialization} 전문 정보 뉴스레터 구독`

    return {
      primary,
      secondary,
      consultation,
      newsletter
    }
  }

  private buildTestimonialFramework(input: CopywritingInput) {
    const { specialization, targetAudience } = input

    const suggestedQuotes = [
      `"정말 실무에 바로 적용할 수 있는 내용이었습니다."`,
      `"다른 곳에서 찾을 수 없는 전문적인 정보였어요."`,
      `"복잡했던 내용을 이해하기 쉽게 설명해주셨습니다."`,
      `"시행착오를 줄일 수 있어서 정말 도움이 되었습니다."`,
      `"전문가의 노하우를 이렇게 공유해주셔서 감사합니다."`
    ]

    const clientTypes = [
      `${targetAudience}`,
      `${specialization} 분야 종사자`,
      '서비스 이용 고객',
      '온라인 상담 이용자'
    ]

    const credibilityElements = [
      '실제 사례 기반',
      '전문가 검증 완료',
      '업계 표준 준수',
      '지속적인 업데이트'
    ]

    return {
      suggestedQuotes,
      clientTypes,
      credibilityElements
    }
  }

  private createPersuasionElements(input: CopywritingInput) {
    const { specialization, targetAudience, contentGoals } = input

    const urgencyTriggers = [
      '지금 바로 확인하세요',
      '놓치면 안 되는 중요한 정보',
      '시간이 지날수록 더 복잡해집니다',
      '조기 대응이 핵심입니다'
    ]

    const credential = this.getSpecializationCredential(specialization)
    const authoritySignals = [
      `${credential} 실무 경험 기반`,
      '업계 전문 지식 보유',
      '검증된 방법론 적용',
      '지속적인 연구 및 학습'
    ]

    const socialProof = [
      `많은 ${targetAudience}들이 선택`,
      '높은 만족도 달성',
      '성공적인 결과 입증',
      '업계 인정받은 전문성'
    ]

    const benefitStatements = this.generateBenefitStatements(specialization, contentGoals)

    return {
      urgencyTriggers,
      authoritySignals,
      socialProof,
      benefitStatements
    }
  }

  private generateBenefitStatements(specialization: string, contentGoals: string): string[] {
    const baseStatements = [
      '시간과 비용을 절약할 수 있습니다',
      '정확한 정보로 안심할 수 있습니다',
      '실무에 바로 적용 가능합니다',
      '전문가 수준의 지식을 얻을 수 있습니다'
    ]

    const specializedStatements: Record<string, string[]> = {
      'medical': [
        '환자 안전을 보장할 수 있습니다',
        '의료진 신뢰도를 높일 수 있습니다'
      ],
      'legal': [
        '법적 리스크를 최소화할 수 있습니다',
        '확실한 법적 근거를 확보할 수 있습니다'
      ],
      'tax': [
        '세무 부담을 줄일 수 있습니다',
        '세무 조사에 대비할 수 있습니다'
      ],
      'marketing': [
        '마케팅 ROI를 향상시킬 수 있습니다',
        '고객 유치 효과를 극대화할 수 있습니다'
      ]
    }

    return [
      ...baseStatements,
      ...(specializedStatements[specialization] || [])
    ]
  }
}