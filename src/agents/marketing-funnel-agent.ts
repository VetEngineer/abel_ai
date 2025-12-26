import { BaseAgent } from '@/lib/agents/base-agent'
import { AgentType, AgentResult, SharedContext } from '@/types/agents'
import { ContentWritingOutput } from './content-writing-agent'
import { CopywritingOutput } from './copywriting-agent'

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

  async execute(input: MarketingFunnelInput, context: SharedContext): Promise<AgentResult> {
    const startTime = Date.now()
    this.setStatus('processing' as any)

    try {
      const funnelStages = this.designFunnelStages(input)
      const customerJourney = this.mapCustomerJourney(input)
      const leadNurturing = this.createLeadNurturingStrategy(input)
      const conversionOptimization = this.optimizeConversions(input)

      const output: MarketingFunnelOutput = {
        funnelStages,
        customerJourney,
        leadNurturing,
        conversionOptimization
      }

      const executionTime = Date.now() - startTime
      const tokensUsed = this.calculateTokens(JSON.stringify(output))

      return this.createSuccessResult(output, executionTime, tokensUsed)
    } catch (error) {
      const executionTime = Date.now() - startTime
      return this.handleError(error as Error, executionTime)
    }
  }

  private designFunnelStages(input: MarketingFunnelInput) {
    const { specialization, targetAudience, contentGoals, copyData } = input

    const awareness = {
      content: this.createAwarenessContent(specialization, targetAudience),
      cta: '전문가 정보 더 보기',
      touchpoints: this.getAwarenessTouchpoints(specialization)
    }

    const interest = {
      content: this.createInterestContent(specialization, targetAudience),
      cta: copyData.callToActions.secondary[0] || '무료 가이드 다운로드',
      leadMagnets: this.createLeadMagnets(specialization)
    }

    const consideration = {
      content: this.createConsiderationContent(specialization, targetAudience),
      cta: '무료 상담 신청하기',
      trustBuilders: this.createTrustBuilders(specialization)
    }

    const conversion = {
      content: this.createConversionContent(specialization, targetAudience),
      cta: copyData.callToActions.primary,
      conversionOptimizers: this.createConversionOptimizers(specialization)
    }

    const retention = {
      content: this.createRetentionContent(specialization, targetAudience),
      cta: '지속적인 전문 서비스 받기',
      loyaltyPrograms: this.createLoyaltyPrograms(specialization)
    }

    return {
      awareness,
      interest,
      consideration,
      conversion,
      retention
    }
  }

  private createAwarenessContent(specialization: string, targetAudience: string): string {
    return `${targetAudience}께서 ${specialization} 관련 정보를 찾고 계신다면, 정확하고 신뢰할 수 있는 전문 정보를 제공하는 것이 중요합니다.

온라인상의 일반적인 정보와 달리, 실무 경험을 바탕으로 한 전문가의 조언은 실제 상황에서 큰 도움이 됩니다.

${this.getSpecializationValue(specialization)} 분야의 복잡한 내용들을 이해하기 쉽게 설명하고, 실용적인 해결책을 제시해드립니다.`
  }

  private createInterestContent(specialization: string, targetAudience: string): string {
    return `${targetAudience}의 구체적인 고민과 니즈를 해결하기 위해 체계적으로 정리된 전문 자료를 준비했습니다.

실무에서 자주 접하는 사례들을 바탕으로 작성된 가이드로, 즉시 적용 가능한 실용적인 정보들을 담고 있습니다.

${this.getSpecializationCredential(specialization)}의 검증된 노하우를 통해 시행착오를 줄이고 효과적인 결과를 얻으실 수 있습니다.`
  }

  private createConsiderationContent(specialization: string, targetAudience: string): string {
    return `전문가와의 직접 상담을 통해 개별 상황에 맞는 맞춤형 조언을 받아보세요.

일반적인 정보만으로는 해결하기 어려운 복잡한 상황들을 ${this.getSpecializationCredential(specialization)}의 실무 경험을 통해 정확하게 분석하고 해결방안을 제시해드립니다.

지금까지 ${this.getClientSuccessExample(specialization)}의 성공 사례를 통해 검증된 전문성을 확인하실 수 있습니다.`
  }

  private createConversionContent(specialization: string, targetAudience: string): string {
    return `더 이상 혼자 고민하지 마시고, 전문가의 도움을 받아 확실한 해결책을 찾아보세요.

${targetAudience}를 위한 특별한 상담 프로그램을 통해 개별 맞춤형 솔루션을 제공해드립니다.

지금 신청하시면 ${this.getConversionIncentive(specialization)}의 혜택도 함께 받으실 수 있습니다.`
  }

  private createRetentionContent(specialization: string, targetAudience: string): string {
    return `지속적인 관리와 업데이트된 정보 제공을 통해 ${targetAudience}의 성공을 함께 만들어가겠습니다.

${specialization} 분야의 변화하는 법규와 트렌드를 지속적으로 모니터링하여 최신 정보를 제공하고,

정기적인 점검과 피드백을 통해 항상 최적의 상태를 유지할 수 있도록 지원해드립니다.`
  }

  private getSpecializationValue(specialization: string): string {
    const values: Record<string, string> = {
      'medical': '환자의 건강과 안전을 최우선으로 고려하는 의료',
      'legal': '복잡한 법적 문제를 명확하게 해결하는 법무',
      'tax': '최적의 절세 효과를 제공하는 세무',
      'marketing': '실질적인 성과를 창출하는 마케팅',
      'consulting': '데이터 기반의 전략적 컨설팅',
      'finance': '안정적이고 수익성 높은 금융',
      'education': '개인별 맞춤형 교육',
      'other': '전문적이고 실용적인'
    }
    return values[specialization] || values['other']
  }

  private getSpecializationCredential(specialization: string): string {
    const credentials: Record<string, string> = {
      'medical': '의료진',
      'legal': '법무 전문가',
      'tax': '세무 전문가',
      'marketing': '마케팅 전문가',
      'consulting': '컨설팅 전문가',
      'finance': '금융 전문가',
      'education': '교육 전문가',
      'other': '해당 분야 전문가'
    }
    return credentials[specialization] || credentials['other']
  }

  private getClientSuccessExample(specialization: string): string {
    const examples: Record<string, string> = {
      'medical': '수많은 환자분들',
      'legal': '다양한 법적 분쟁 해결',
      'tax': '기업과 개인 고객의 절세 성공',
      'marketing': '고객사의 매출 증대',
      'consulting': '기업 성과 개선',
      'finance': '고객의 자산 증대',
      'education': '수강생들의 목표 달성',
      'other': '고객들의 문제 해결'
    }
    return examples[specialization] || examples['other']
  }

  private getConversionIncentive(specialization: string): string {
    const incentives: Record<string, string> = {
      'medical': '우선 진료 예약 및 건강 체크리스트 제공',
      'legal': '초기 상담 할인 및 법률 가이드북 증정',
      'tax': '세무 진단 서비스 및 절세 체크리스트 제공',
      'marketing': '마케팅 진단 분석 및 전략 수립 지원',
      'consulting': '비즈니스 진단 리포트 및 개선안 제시',
      'finance': '재무 상태 분석 및 투자 가이드 제공',
      'education': '학습 진단 테스트 및 맞춤 커리큘럼 설계',
      'other': '전문 진단 및 맞춤 가이드 제공'
    }
    return incentives[specialization] || incentives['other']
  }

  private getAwarenessTouchpoints(specialization: string): string[] {
    const touchpoints: Record<string, string[]> = {
      'medical': ['의료 정보 블로그', '건강 관련 SNS', '온라인 건강 커뮤니티', '의료진 추천'],
      'legal': ['법률 정보 사이트', '법무 관련 포럼', '사업자 커뮤니티', '언론 기사'],
      'tax': ['세무 정보 블로그', '사업자 모임', '회계 관련 세미나', '세무서 공지'],
      'marketing': ['마케팅 블로그', 'SNS 마케팅 그룹', '온라인 광고', '업계 네트워킹'],
      'consulting': ['비즈니스 블로그', '경영진 네트워크', '산업 보고서', '전문가 강연'],
      'finance': ['금융 뉴스', '투자 커뮤니티', '재테크 블로그', '금융 세미나'],
      'education': ['교육 관련 블로그', '학부모 커뮤니티', '교육 정보 사이트', '학원 추천'],
      'other': ['전문 정보 사이트', '업계 커뮤니티', '전문가 네트워크', '관련 세미나']
    }
    return touchpoints[specialization] || touchpoints['other']
  }

  private createLeadMagnets(specialization: string): string[] {
    const magnets: Record<string, string[]> = {
      'medical': ['건강 체크리스트', '응급처치 가이드', '예방관리 매뉴얼', '건강검진 체크리스트'],
      'legal': ['법률 체크리스트', '계약서 검토 가이드', '법적 절차 매뉴얼', '권리구제 방법'],
      'tax': ['절세 체크리스트', '세무신고 가이드', '공제항목 정리표', '세무조사 대비법'],
      'marketing': ['마케팅 전략 템플릿', 'ROI 계산기', '경쟁사 분석표', 'SNS 마케팅 가이드'],
      'consulting': ['비즈니스 진단표', '경영 개선 체크리스트', '전략 수립 템플릿', '성과 측정 도구'],
      'finance': ['투자 가이드북', '재무 진단표', '자산 관리 체크리스트', '투자 계획서 템플릿'],
      'education': ['학습 계획표', '진도 체크리스트', '학습법 가이드', '성적 향상 전략'],
      'other': ['전문 가이드북', '체크리스트', '진단표', '실무 매뉴얼']
    }
    return magnets[specialization] || magnets['other']
  }

  private createTrustBuilders(specialization: string): string[] {
    const builders: Record<string, string[]> = {
      'medical': ['의료진 자격증', '임상 경험', '환자 후기', '의료기관 인증'],
      'legal': ['변호사 자격', '승소 사례', '고객 추천서', '법무법인 인증'],
      'tax': ['세무사 자격', '세무 성공사례', '고객 만족도', '세무법인 인증'],
      'marketing': ['마케팅 성과 사례', '고객사 포트폴리오', '업계 수상 경력', '인증 마케터'],
      'consulting': ['컨설팅 자격증', '프로젝트 성공사례', '고객 추천', '컨설팅펌 인증'],
      'finance': ['금융 라이선스', '투자 성과', '고객 신뢰도', '금융기관 인증'],
      'education': ['교육 자격증', '지도 경험', '학생 성과', '교육기관 인증'],
      'other': ['전문 자격증', '실무 경험', '고객 후기', '업계 인증']
    }
    return builders[specialization] || builders['other']
  }

  private createConversionOptimizers(specialization: string): string[] {
    const optimizers = [
      '무료 상담 제공',
      '만족 보장 정책',
      '투명한 비용 구조',
      '즉시 연락 가능',
      '개인정보 보안 보장',
      '유연한 일정 조정',
      '체계적인 서비스 프로세스'
    ]

    const specialized: Record<string, string[]> = {
      'medical': ['응급 상황 대응', '의료진 직접 상담'],
      'legal': ['법적 보장', '비밀 유지 서약'],
      'tax': ['세무 결과 보장', '세무조사 지원'],
      'marketing': ['성과 기반 과금', '마케팅 결과 보고서'],
      'consulting': ['성과 보장', '지속적 사후 관리'],
      'finance': ['투자 안전성 보장', '포트폴리오 관리'],
      'education': ['학습 성과 보장', '개인별 맞춤 지도']
    }

    return [...optimizers, ...(specialized[specialization] || [])]
  }

  private createLoyaltyPrograms(specialization: string): string[] {
    const programs: Record<string, string[]> = {
      'medical': ['정기 건강검진 할인', '건강 상담 우선권', '의료진 직통 연락', '건강정보 뉴스레터'],
      'legal': ['정기 법률 점검', '우선 상담 서비스', '법률 정보 업데이트', '특별 할인 혜택'],
      'tax': ['연간 세무 관리', '세무 상담 할인', '세법 변경 알림', '절세 정보 제공'],
      'marketing': ['마케팅 성과 리포트', '전략 업데이트', '트렌드 정보 제공', '캠페인 우선 지원'],
      'consulting': ['정기 경영 점검', '전략 업데이트', '산업 동향 리포트', '우선 컨설팅'],
      'finance': ['포트폴리오 정기 점검', '투자 정보 제공', '금융 상품 우선 안내', '자산 관리 서비스'],
      'education': ['학습 진도 관리', '개인별 피드백', '학습 자료 제공', '진로 상담'],
      'other': ['정기 서비스 점검', '전문 정보 제공', '우선 상담 혜택', '특별 할인']
    }
    return programs[specialization] || programs['other']
  }

  private mapCustomerJourney(input: MarketingFunnelInput) {
    const { specialization, targetAudience } = input

    return [
      {
        stage: '문제 인식',
        customerMindset: `${specialization} 관련 문제나 필요 인식`,
        contentType: '교육적 콘텐츠',
        expectedActions: ['정보 검색', '블로그 읽기', '커뮤니티 참여'],
        metrics: ['페이지 조회수', '체류 시간', '바운스율']
      },
      {
        stage: '정보 수집',
        customerMindset: '해결방법과 전문가 정보 탐색',
        contentType: '전문가 가이드',
        expectedActions: ['가이드 다운로드', '뉴스레터 구독', '소셜 팔로우'],
        metrics: ['리드 생성', '다운로드 수', '구독률']
      },
      {
        stage: '대안 비교',
        customerMindset: '여러 전문가/서비스 비교 검토',
        contentType: '사례 연구 및 후기',
        expectedActions: ['후기 확인', '상담 문의', '서비스 비교'],
        metrics: ['문의 전환율', '상담 신청', '비교 페이지 조회']
      },
      {
        stage: '결정',
        customerMindset: '최종 전문가/서비스 선택',
        contentType: '상담 및 맞춤 제안',
        expectedActions: ['상담 예약', '서비스 신청', '계약 체결'],
        metrics: ['전환율', '계약 체결율', '매출']
      },
      {
        stage: '이용 후 평가',
        customerMindset: '서비스 만족도 평가 및 재이용 고려',
        contentType: '사후 관리 및 추가 서비스',
        expectedActions: ['후기 작성', '재이용', '추천'],
        metrics: ['만족도', '재구매율', '추천지수(NPS)']
      }
    ]
  }

  private createLeadNurturingStrategy(input: MarketingFunnelInput) {
    const { specialization, targetAudience } = input

    const emailSequence = this.createEmailSequence(specialization, targetAudience)
    const contentSeries = this.createContentSeries(specialization)
    const followUpStrategy = this.createFollowUpStrategy(specialization)

    return {
      emailSequence,
      contentSeries,
      followUpStrategy
    }
  }

  private createEmailSequence(specialization: string, targetAudience: string) {
    return [
      {
        day: 0,
        subject: `${targetAudience}님, 전문가 가이드를 받아보세요`,
        content: `가입해주셔서 감사합니다. ${specialization} 전문 정보를 정기적으로 공유해드리겠습니다.`,
        cta: '첫 번째 가이드 확인하기'
      },
      {
        day: 3,
        subject: `실무에 바로 적용 가능한 ${specialization} 팁`,
        content: `실제 사례를 바탕으로 한 실용적인 조언을 공유합니다.`,
        cta: '전문가 조언 더 보기'
      },
      {
        day: 7,
        subject: `${targetAudience}가 자주 묻는 질문 TOP 5`,
        content: `가장 많이 받는 질문들과 전문가 답변을 정리했습니다.`,
        cta: 'FAQ 전체보기'
      },
      {
        day: 14,
        subject: `무료 상담으로 개인별 맞춤 조언 받으세요`,
        content: `일반적인 정보를 넘어 개별 상황에 맞는 전문 조언을 받아보세요.`,
        cta: '무료 상담 신청하기'
      },
      {
        day: 21,
        subject: `성공 사례: ${targetAudience}의 문제 해결 스토리`,
        content: `실제 고객의 성공 사례를 통해 해결 과정을 확인해보세요.`,
        cta: '성공 사례 더 보기'
      }
    ]
  }

  private createContentSeries(specialization: string): string[] {
    const series: Record<string, string[]> = {
      'medical': [
        '건강 관리 기초 시리즈',
        '질병 예방 가이드 시리즈',
        '응급상황 대처법 시리즈',
        '정기검진 가이드 시리즈'
      ],
      'legal': [
        '법률 기초 지식 시리즈',
        '계약서 작성 가이드',
        '분쟁 해결 방법 시리즈',
        '권리 보호 가이드'
      ],
      'tax': [
        '세무 기초 시리즈',
        '절세 전략 가이드',
        '세무신고 완벽 가이드',
        '세무조사 대비 시리즈'
      ],
      'marketing': [
        '마케팅 전략 수립 가이드',
        'ROI 최적화 시리즈',
        '디지털 마케팅 실무',
        '브랜딩 전략 가이드'
      ]
    }
    return series[specialization] || ['전문 기초 시리즈', '실무 가이드', '고급 전략', '사례 연구']
  }

  private createFollowUpStrategy(specialization: string): string[] {
    return [
      '개인별 관심 주제 태깅 및 맞춤 콘텐츠 제공',
      '행동 기반 자동 이메일 트리거 설정',
      '정기적인 전화/메시지 팔로업',
      '특별 이벤트 및 세미나 우선 안내',
      '고객 세분화를 통한 차별화된 접근',
      '리타겟팅 광고를 통한 재접촉',
      '추천 프로그램 및 인센티브 제공'
    ]
  }

  private optimizeConversions(input: MarketingFunnelInput) {
    const { specialization } = input

    const landingPageElements = [
      '명확하고 간결한 헤드라인',
      '전문성을 보여주는 자격증/경력',
      '고객 후기 및 사례 연구',
      '명확한 서비스 설명',
      '투명한 가격 정보',
      '연락처 정보 명시',
      '보안 및 개인정보 보호 안내',
      '모바일 최적화 디자인'
    ]

    const formOptimization = [
      '필수 항목 최소화 (이름, 연락처, 문의사항)',
      '단계별 양식 작성 (긴 양식의 경우)',
      '실시간 유효성 검사',
      '자동 완성 기능',
      '명확한 제출 버튼 텍스트',
      '개인정보 처리방침 동의',
      '양식 작성 진행률 표시'
    ]

    const urgencyTactics = this.getUrgencyTactics(specialization)

    const socialProof = [
      '고객 수 및 만족도 통계',
      '실시간 상담 문의 알림',
      '언론 보도 및 수상 경력',
      '업계 인증 및 자격',
      '고객 후기 및 평점',
      '소셜미디어 팔로워 수',
      '전문가 추천서'
    ]

    return {
      landingPageElements,
      formOptimization,
      urgencyTactics,
      socialProof
    }
  }

  private getUrgencyTactics(specialization: string): string[] {
    const tactics: Record<string, string[]> = {
      'medical': ['건강 문제는 조기 발견이 중요', '지금 바로 검진 예약하세요'],
      'legal': ['법적 시효 내 신속한 대응이 필요', '무료 상담 기간 한정'],
      'tax': ['세무신고 마감일 임박', '절세 기회를 놓치지 마세요'],
      'marketing': ['시장 기회는 빠르게 변합니다', '경쟁사보다 앞서가세요'],
      'consulting': ['비즈니스 기회는 지금입니다', '시장 변화에 즉시 대응하세요'],
      'finance': ['투자 기회는 타이밍이 중요', '금리 변동 전 상담받으세요'],
      'education': ['새 학기 준비는 지금', '조기 등록 할인 혜택'],
      'other': ['제한된 시간 내 결정하세요', '지금이 기회입니다']
    }
    return tactics[specialization] || tactics['other']
  }
}