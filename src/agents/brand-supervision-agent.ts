import { BaseAgent } from '@/lib/agents/base-agent'
import { AgentType, AgentResult, SharedContext } from '@/types/agents'

export interface BrandSupervisionInput {
  contentData: any
  copyData: any
  seoData: any
  visualData: any
  funnelData: any
  specialization: string
  brandVoice: string
  targetAudience: string
  topic: string
  contentGoals: string
}

export interface BrandSupervisionOutput {
  qualityAssessment: {
    overallScore: number
    contentQuality: {
      score: number
      feedback: string[]
      improvements: string[]
    }
    brandConsistency: {
      score: number
      issues: string[]
      recommendations: string[]
    }
    professionalStandards: {
      score: number
      compliance: boolean
      ethicalIssues: string[]
    }
  }
  contentValidation: {
    factualAccuracy: {
      verified: boolean
      sources: string[]
      disclaimers: string[]
    }
    legalCompliance: {
      compliant: boolean
      risks: string[]
      recommendations: string[]
    }
    ethicalStandards: {
      ethical: boolean
      concerns: string[]
      guidelines: string[]
    }
  }
  brandAlignment: {
    voiceConsistency: {
      aligned: boolean
      deviations: string[]
      corrections: string[]
    }
    messagingCoherence: {
      coherent: boolean
      inconsistencies: string[]
      unifications: string[]
    }
    audienceAppropriatenesss: {
      appropriate: boolean
      misalignments: string[]
      adjustments: string[]
    }
  }
  finalRecommendations: {
    criticalIssues: string[]
    improvementActions: Array<{
      priority: 'high' | 'medium' | 'low'
      action: string
      rationale: string
      impact: string
    }>
    approvalStatus: 'approved' | 'conditional' | 'rejected'
    nextSteps: string[]
  }
}

export class BrandSupervisionAgent extends BaseAgent {
  constructor() {
    super(
      AgentType.BRAND_SUPERVISION,
      '브랜드 감독 에이전트',
      '전문성과 신뢰도를 검증하여 브랜드 일관성과 품질을 보장하는 최종 검증 에이전트',
      ['품질 검증', '브랜드 일관성', '전문성 검토', '윤리 준수', '법적 검토']
    )
  }

  async execute(input: any, context: SharedContext): Promise<AgentResult> {
    const startTime = Date.now()
    this.setStatus('processing' as any)

    try {
      // 입력 데이터 정규화 처리
      const normalizedInput = {
        contentData: input?.content ? input : input?.contentData || {},
        copyData: input?.headlines ? input : input?.copyData || {},
        seoData: input?.metaData ? input : input?.seoData || {},
        visualData: input?.colorScheme ? input : input?.visualData || {},
        funnelData: input?.funnelStages ? input : input?.funnelData || {},
        specialization: input?.specialization || context?.platform || 'other',
        brandVoice: input?.brandVoice || context?.brandTone || '전문적인',
        targetAudience: input?.targetAudience || context?.targetAudience || '일반 사용자',
        topic: input?.topic || '전문 서비스',
        contentGoals: input?.contentGoals || context?.contentGoal || 'engagement'
      }

      const qualityAssessment = this.assessOverallQuality(normalizedInput)
      const contentValidation = this.validateContent(normalizedInput)
      const brandAlignment = this.checkBrandAlignment(normalizedInput)
      const finalRecommendations = this.generateFinalRecommendations(
        qualityAssessment,
        contentValidation,
        brandAlignment,
        normalizedInput
      )

      const output: BrandSupervisionOutput = {
        qualityAssessment,
        contentValidation,
        brandAlignment,
        finalRecommendations
      }

      const executionTime = Date.now() - startTime
      const tokensUsed = this.calculateTokens(JSON.stringify(output))

      return this.createSuccessResult(output, executionTime, tokensUsed)
    } catch (error) {
      const executionTime = Date.now() - startTime
      return this.handleError(error as Error, executionTime)
    }
  }

  private assessOverallQuality(input: any) {
    const contentQuality = this.assessContentQuality(input)
    const brandConsistency = this.assessBrandConsistency(input)
    const professionalStandards = this.assessProfessionalStandards(input)

    const overallScore = Math.round(
      (contentQuality.score + brandConsistency.score + professionalStandards.score) / 3
    )

    return {
      overallScore,
      contentQuality,
      brandConsistency,
      professionalStandards
    }
  }

  private assessContentQuality(input: any) {
    const { contentData, specialization, targetAudience } = input
    let score = 85 // 기본 점수

    const feedback: string[] = []
    const improvements: string[] = []

    // 콘텐츠 길이 확인
    if (contentData?.content?.fullContent) {
      const wordCount = contentData.content.fullContent.split(' ').length
      if (wordCount < 1000) {
        score -= 10
        improvements.push('콘텐츠 길이를 1000단어 이상으로 확장하여 전문성 강화')
      } else {
        feedback.push('적절한 콘텐츠 길이로 작성됨')
      }
    }

    // 전문용어 적절성 확인
    const hasSpecializedTerms = this.checkSpecializedTerms(contentData, specialization)
    if (hasSpecializedTerms) {
      feedback.push('전문 분야에 적합한 용어 사용')
      score += 5
    } else {
      improvements.push('전문 분야 특화 용어를 더 적극적으로 활용')
      score -= 5
    }

    // 구조화 정도 확인
    if (contentData?.content?.mainSections?.length >= 3) {
      feedback.push('논리적인 구조로 잘 구성됨')
    } else {
      improvements.push('콘텐츠 구조를 더 체계적으로 구성 필요')
      score -= 10
    }

    // 타겟 오디언스 적합성
    const isAudienceAppropriate = this.checkAudienceAppropriateness(contentData, targetAudience)
    if (isAudienceAppropriate) {
      feedback.push('타겟 오디언스에 적합한 내용과 톤')
    } else {
      improvements.push('타겟 오디언스의 수준과 니즈에 더 맞춘 내용 필요')
      score -= 15
    }

    return {
      score: Math.max(score, 0),
      feedback,
      improvements
    }
  }

  private assessBrandConsistency(input: any) {
    const { brandVoice, specialization } = input
    let score = 90

    const issues: string[] = []
    const recommendations: string[] = []

    // 브랜드 보이스 일관성 확인
    const voiceConsistency = this.checkVoiceConsistency(input)
    if (!voiceConsistency) {
      score -= 20
      issues.push('브랜드 보이스가 일관되지 않음')
      recommendations.push(`${brandVoice} 톤을 전체 콘텐츠에 일관되게 적용`)
    }

    // 전문 분야 일관성 확인
    const specializationConsistency = this.checkSpecializationConsistency(input)
    if (!specializationConsistency) {
      score -= 15
      issues.push('전문 분야 특성이 일관되게 반영되지 않음')
      recommendations.push(`${specialization} 전문 분야의 특성을 모든 요소에 반영`)
    }

    // 시각적 일관성 확인
    if (input.visualData) {
      const visualConsistency = this.checkVisualConsistency(input)
      if (!visualConsistency) {
        score -= 10
        issues.push('시각적 요소의 일관성 부족')
        recommendations.push('브랜드 가이드라인에 따른 시각적 통일성 확보')
      }
    }

    return {
      score: Math.max(score, 0),
      issues,
      recommendations
    }
  }

  private assessProfessionalStandards(input: any) {
    const { specialization } = input
    let score = 95

    const ethicalIssues: string[] = []
    let compliance = true

    // 전문 분야별 윤리 기준 확인
    const ethicalCompliance = this.checkEthicalCompliance(input)
    if (!ethicalCompliance.compliant) {
      score -= 30
      compliance = false
      ethicalIssues.push(...ethicalCompliance.issues)
    }

    // 과대광고 확인
    const hasOverstatement = this.checkOverstatement(input)
    if (hasOverstatement) {
      score -= 20
      ethicalIssues.push('과대광고 또는 확정적 표현 사용')
    }

    // 법적 면책 조항 확인
    const hasProperDisclaimer = this.checkDisclaimer(input)
    if (!hasProperDisclaimer) {
      score -= 15
      ethicalIssues.push('적절한 면책 조항 부재')
    }

    // 전문가 자격 명시 확인
    const hasCredentials = this.checkCredentialMention(input)
    if (!hasCredentials) {
      score -= 10
      ethicalIssues.push('전문가 자격 및 한계 명시 필요')
    }

    return {
      score: Math.max(score, 0),
      compliance,
      ethicalIssues
    }
  }

  private checkSpecializedTerms(contentData: any, specialization: string): boolean {
    if (!contentData?.content?.fullContent) return false

    const content = contentData.content.fullContent.toLowerCase()
    const specializedTerms: Record<string, string[]> = {
      'medical': ['진료', '치료', '진단', '환자', '증상', '처방', '의료진'],
      'legal': ['법률', '소송', '계약', '법적', '권리', '의무', '판례'],
      'tax': ['세무', '신고', '절세', '공제', '세금', '과세', '감면'],
      'marketing': ['마케팅', '광고', '브랜드', '캠페인', 'roi', '타겟', '전략'],
      'consulting': ['컨설팅', '전략', '분석', '개선', '최적화', '프로세스'],
      'finance': ['투자', '금융', '자산', '수익', '포트폴리오', '위험'],
      'education': ['교육', '학습', '강의', '커리큘럼', '평가', '지도'],
      'other': ['전문', '서비스', '상담', '솔루션']
    }

    const terms = specializedTerms[specialization] || specializedTerms['other']
    return terms.some(term => content.includes(term))
  }

  private checkAudienceAppropriateness(contentData: any, targetAudience: string): boolean {
    // 타겟 오디언스 적합성 기본 체크
    // 실제 구현에서는 더 정교한 분석 필요
    return true
  }

  private checkVoiceConsistency(input: any): boolean {
    // 브랜드 보이스 일관성 체크
    // 실제 구현에서는 각 에이전트 결과물의 톤 분석 필요
    return true
  }

  private checkSpecializationConsistency(input: any): boolean {
    // 전문 분야 일관성 체크
    return true
  }

  private checkVisualConsistency(input: any): boolean {
    // 시각적 일관성 체크
    return true
  }

  private validateContent(input: any) {
    const factualAccuracy = this.checkFactualAccuracy(input)
    const legalCompliance = this.checkLegalCompliance(input)
    const ethicalStandards = this.checkEthicalStandards(input)

    return {
      factualAccuracy,
      legalCompliance,
      ethicalStandards
    }
  }

  private checkFactualAccuracy(input: any) {
    const sources = this.getRecommendedSources(input.specialization)
    const disclaimers = this.getRequiredDisclaimers(input.specialization)

    return {
      verified: true, // 기본적으로 true, 실제로는 사실 확인 로직 필요
      sources,
      disclaimers
    }
  }

  private checkLegalCompliance(input: any) {
    const risks = this.identifyLegalRisks(input)
    const recommendations = this.getLegalRecommendations(input.specialization)

    return {
      compliant: risks.length === 0,
      risks,
      recommendations
    }
  }

  private checkEthicalStandards(input: any) {
    const ethicalCheck = this.checkEthicalCompliance(input)

    return {
      ethical: ethicalCheck.compliant,
      concerns: ethicalCheck.issues,
      guidelines: this.getEthicalGuidelines(input.specialization)
    }
  }

  private checkEthicalCompliance(input: any): { compliant: boolean; issues: string[] } {
    const issues: string[] = []

    // 과대광고 검출
    if (this.checkOverstatement(input)) {
      issues.push('과대광고 또는 확정적 표현 감지')
    }

    // 전문가 자격 명시 확인
    if (!this.checkCredentialMention(input)) {
      issues.push('전문가 자격 및 한계 명시 부족')
    }

    // 면책조항 확인
    if (!this.checkDisclaimer(input)) {
      issues.push('적절한 면책조항 부재')
    }

    return {
      compliant: issues.length === 0,
      issues
    }
  }

  private checkOverstatement(input: any): boolean {
    // 과대광고 표현 검출 로직
    const problematicPhrases = [
      '100% 보장', '완전한 치료', '무조건 성공', '절대적', '최고의 결과',
      '즉시 해결', '모든 문제 해결', '완벽한', '영구적 해결'
    ]

    const content = input.contentData?.content?.fullContent?.toLowerCase() || ''
    return problematicPhrases.some(phrase => content.includes(phrase.toLowerCase()))
  }

  private checkCredentialMention(input: any): boolean {
    // 전문가 자격 명시 확인
    const credentialPhrases = [
      '전문가', '자격', '경험', '상담', '면허', '인증'
    ]

    const content = input.contentData?.content?.fullContent?.toLowerCase() || ''
    return credentialPhrases.some(phrase => content.includes(phrase))
  }

  private checkDisclaimer(input: any): boolean {
    // 면책조항 존재 확인
    const disclaimerPhrases = [
      '개별', '상황', '전문가 상담', '의사와 상의', '법률 전문가', '세무사 상담'
    ]

    const content = input.contentData?.content?.fullContent?.toLowerCase() || ''
    return disclaimerPhrases.some(phrase => content.includes(phrase))
  }

  private getRecommendedSources(specialization: string): string[] {
    const sources: Record<string, string[]> = {
      'medical': ['의학회 가이드라인', '식약처 자료', '보건복지부 공고', '대한의사협회'],
      'legal': ['판례', '법령', '대한변호사협회', '법제처'],
      'tax': ['국세청', '세법', '세무사회', '기획재정부'],
      'marketing': ['공정거래위원회', '방송통신위원회', '한국광고자율심의기구'],
      'consulting': ['중소벤처기업부', '산업통상자원부', '한국경영컨설팅협회'],
      'finance': ['금융감독원', '한국은행', '금융투자협회'],
      'education': ['교육부', '한국교육개발원', '교육청'],
      'other': ['관련 정부기관', '업계 협회', '공신력 있는 기관']
    }
    return sources[specialization] || sources['other']
  }

  private getRequiredDisclaimers(specialization: string): string[] {
    const disclaimers: Record<string, string[]> = {
      'medical': [
        '본 정보는 참고용이며 의학적 조언을 대체하지 않습니다',
        '개별 진단과 치료는 의료진과 상담하시기 바랍니다'
      ],
      'legal': [
        '본 내용은 일반적 정보이며 법률적 조언을 대체하지 않습니다',
        '구체적 사안은 전문 변호사와 상담하시기 바랍니다'
      ],
      'tax': [
        '세무 처리는 개별 상황에 따라 다를 수 있습니다',
        '정확한 세무 처리는 세무 전문가와 상담하시기 바랍니다'
      ],
      'marketing': [
        '마케팅 결과는 다양한 요인에 따라 달라질 수 있습니다',
        '개별 비즈니스 상황에 맞는 전략 수립이 필요합니다'
      ]
    }
    return disclaimers[specialization] || [
      '본 정보는 일반적 참고사항입니다',
      '개별 상황에 맞는 전문가 상담을 권합니다'
    ]
  }

  private identifyLegalRisks(input: any): string[] {
    const risks: string[] = []

    // 과대광고 위험
    if (this.checkOverstatement(input)) {
      risks.push('과대광고로 인한 공정거래법 위반 위험')
    }

    // 의료광고 규제 (의료 분야)
    if (input.specialization === 'medical' && this.checkMedicalAdvertisingViolation(input)) {
      risks.push('의료법상 의료광고 규제 위반 위험')
    }

    // 법률서비스 광고 규제 (법무 분야)
    if (input.specialization === 'legal' && this.checkLegalAdvertisingViolation(input)) {
      risks.push('변호사법상 광고 규제 위반 위험')
    }

    return risks
  }

  private checkMedicalAdvertisingViolation(input: any): boolean {
    // 의료광고 규제 위반 체크
    const violationPhrases = [
      '완치', '최고의 치료', '즉시 치료', '부작용 없는'
    ]
    const content = input.contentData?.content?.fullContent?.toLowerCase() || ''
    return violationPhrases.some(phrase => content.includes(phrase.toLowerCase()))
  }

  private checkLegalAdvertisingViolation(input: any): boolean {
    // 법률서비스 광고 규제 위반 체크
    const violationPhrases = [
      '무조건 승소', '100% 성공', '확실한 승리'
    ]
    const content = input.contentData?.content?.fullContent?.toLowerCase() || ''
    return violationPhrases.some(phrase => content.includes(phrase.toLowerCase()))
  }

  private getLegalRecommendations(specialization: string): string[] {
    const recommendations: Record<string, string[]> = {
      'medical': [
        '의료법에 따른 의료광고 규제 준수',
        '의료진 자격 및 면허 정보 명시',
        '치료 효과에 대한 과장 표현 지양'
      ],
      'legal': [
        '변호사법에 따른 광고 규제 준수',
        '변호사 자격 정보 명시',
        '법률 서비스 결과에 대한 보장 표현 지양'
      ],
      'tax': [
        '세무사법에 따른 업무 범위 준수',
        '세무사 자격 정보 명시',
        '세무 결과에 대한 확정적 표현 지양'
      ]
    }
    return recommendations[specialization] || [
      '관련 법규 및 업계 규정 준수',
      '전문가 자격 정보 명시',
      '서비스 결과에 대한 과장 표현 지양'
    ]
  }

  private getEthicalGuidelines(specialization: string): string[] {
    const guidelines: Record<string, string[]> = {
      'medical': [
        '환자 안전을 최우선으로 고려',
        '의료 윤리 및 히포크라테스 선서 준수',
        '정확하고 검증된 의학 정보만 제공'
      ],
      'legal': [
        '법률 전문가로서의 직업 윤리 준수',
        '의뢰인의 이익을 최우선으로 고려',
        '법적 정확성과 신뢰성 확보'
      ],
      'tax': [
        '세무 전문가로서의 윤리 의식',
        '납세자의 합법적 이익 보호',
        '정확한 세무 정보 제공'
      ]
    }
    return guidelines[specialization] || [
      '전문가로서의 윤리 의식 준수',
      '고객의 이익을 우선 고려',
      '정확하고 신뢰할 수 있는 정보 제공'
    ]
  }

  private checkBrandAlignment(input: any) {
    const voiceConsistency = this.analyzeVoiceConsistency(input)
    const messagingCoherence = this.analyzeMessagingCoherence(input)
    const audienceAppropriatenesss = this.analyzeAudienceAppropriateness(input)

    return {
      voiceConsistency,
      messagingCoherence,
      audienceAppropriatenesss
    }
  }

  private analyzeVoiceConsistency(input: any) {
    const deviations: string[] = []
    const corrections: string[] = []

    // 브랜드 보이스 분석 로직
    if (!this.checkVoiceConsistency(input)) {
      deviations.push(`${input.brandVoice} 톤과 일치하지 않는 표현 발견`)
      corrections.push(`모든 콘텐츠를 ${input.brandVoice} 톤으로 통일`)
    }

    return {
      aligned: deviations.length === 0,
      deviations,
      corrections
    }
  }

  private analyzeMessagingCoherence(input: any) {
    const inconsistencies: string[] = []
    const unifications: string[] = []

    // 메시징 일관성 분석
    // 실제 구현에서는 각 에이전트 결과의 메시지 일관성 확인

    return {
      coherent: inconsistencies.length === 0,
      inconsistencies,
      unifications
    }
  }

  private analyzeAudienceAppropriateness(input: any) {
    const misalignments: string[] = []
    const adjustments: string[] = []

    // 타겟 오디언스 적합성 분석
    if (!this.checkAudienceAppropriateness(input.contentData, input.targetAudience)) {
      misalignments.push(`${input.targetAudience}에 부적합한 내용 또는 표현`)
      adjustments.push(`${input.targetAudience} 특성에 맞게 내용 및 표현 수정`)
    }

    return {
      appropriate: misalignments.length === 0,
      misalignments,
      adjustments
    }
  }

  private generateFinalRecommendations(
    qualityAssessment: any,
    contentValidation: any,
    brandAlignment: any,
    input: any
  ) {
    const criticalIssues: string[] = []
    const improvementActions: Array<{
      priority: 'high' | 'medium' | 'low'
      action: string
      rationale: string
      impact: string
    }> = []

    // 크리티컬 이슈 식별
    if (!contentValidation.legalCompliance.compliant) {
      criticalIssues.push('법적 컴플라이언스 위반')
    }
    if (!contentValidation.ethicalStandards.ethical) {
      criticalIssues.push('윤리 기준 위반')
    }
    if (qualityAssessment.overallScore < 60) {
      criticalIssues.push('전체 품질 점수 미달')
    }

    // 개선 액션 생성
    if (qualityAssessment.contentQuality.score < 80) {
      improvementActions.push({
        priority: 'high',
        action: '콘텐츠 품질 개선',
        rationale: '전문성과 신뢰도 확보를 위해 필요',
        impact: '브랜드 신뢰도 및 고객 만족도 향상'
      })
    }

    if (!brandAlignment.voiceConsistency.aligned) {
      improvementActions.push({
        priority: 'medium',
        action: '브랜드 보이스 통일',
        rationale: '일관된 브랜드 경험 제공을 위해 필요',
        impact: '브랜드 인지도 및 일관성 향상'
      })
    }

    // 승인 상태 결정
    let approvalStatus: 'approved' | 'conditional' | 'rejected' = 'approved'
    if (criticalIssues.length > 0) {
      approvalStatus = 'rejected'
    } else if (qualityAssessment.overallScore < 80 || improvementActions.length > 2) {
      approvalStatus = 'conditional'
    }

    // 다음 단계 정의
    const nextSteps = this.defineNextSteps(approvalStatus, criticalIssues, improvementActions)

    return {
      criticalIssues,
      improvementActions,
      approvalStatus,
      nextSteps
    }
  }

  private defineNextSteps(
    approvalStatus: 'approved' | 'conditional' | 'rejected',
    criticalIssues: string[],
    improvementActions: any[]
  ): string[] {
    if (approvalStatus === 'approved') {
      return [
        '최종 검토 완료',
        '배포 에이전트로 전달',
        '배포 진행'
      ]
    } else if (approvalStatus === 'conditional') {
      return [
        '지적사항 수정 후 재검토',
        '개선 액션 우선순위별 실행',
        '수정된 콘텐츠 재검증'
      ]
    } else {
      return [
        '크리티컬 이슈 해결 필수',
        '전체 콘텐츠 재검토',
        '법무/윤리 검토 재실시',
        '품질 기준 충족 후 재제출'
      ]
    }
  }
}