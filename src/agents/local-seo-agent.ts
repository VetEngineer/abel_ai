import { BaseAgent } from '@/lib/agents/base-agent'
import { AgentType, AgentResult, SharedContext } from '@/types/agents'
import { ContentWritingOutput } from './content-writing-agent'

export interface LocalSEOInput {
  contentData: ContentWritingOutput
  specialization: string
  targetAudience: string
  businessLocation?: string
  serviceArea?: string[]
}

export interface LocalSEOOutput {
  localKeywords: {
    cityKeywords: string[]
    regionKeywords: string[]
    serviceAreaKeywords: string[]
    competitorAnalysis: string[]
  }
  googleMyBusiness: {
    optimizationTips: string[]
    categoryRecommendations: string[]
    photoRecommendations: string[]
    reviewStrategy: string[]
  }
  localDirectories: {
    primaryDirectories: string[]
    industryDirectories: string[]
    submissionGuidelines: string[]
  }
  localContent: {
    communityTopics: string[]
    eventMarketing: string[]
    localPartnerships: string[]
    neighborhoodContent: string[]
  }
  citationBuilding: {
    napConsistency: string[]
    citationSources: string[]
    citationAudit: string[]
  }
}

export class LocalSEOAgent extends BaseAgent {
  constructor() {
    super(
      AgentType.LOCAL_SEO,
      '로컬 SEO 에이전트',
      '지역 전문가를 위한 로컬 검색 최적화와 지역 마케팅 전략을 수립하는 전문 에이전트',
      ['지역 SEO', '구글 마이비즈니스', '로컬 키워드', '지역 마케팅', '인용 구축']
    )
  }

  async execute(input: LocalSEOInput, context: SharedContext): Promise<AgentResult> {
    const startTime = Date.now()
    this.setStatus('processing' as any)

    try {
      const localKeywords = this.generateLocalKeywords(input)
      const googleMyBusiness = this.optimizeGoogleMyBusiness(input)
      const localDirectories = this.recommendLocalDirectories(input)
      const localContent = this.planLocalContent(input)
      const citationBuilding = this.buildCitationStrategy(input)

      const output: LocalSEOOutput = {
        localKeywords,
        googleMyBusiness,
        localDirectories,
        localContent,
        citationBuilding
      }

      const executionTime = Date.now() - startTime
      const tokensUsed = this.calculateTokens(JSON.stringify(output))

      return this.createSuccessResult(output, executionTime, tokensUsed)
    } catch (error) {
      const executionTime = Date.now() - startTime
      return this.handleError(error as Error, executionTime)
    }
  }

  private generateLocalKeywords(input: LocalSEOInput) {
    const { specialization, businessLocation, serviceArea, targetAudience } = input

    // 도시별 키워드
    const cityKeywords = this.generateCityKeywords(specialization, businessLocation || '서울')

    // 지역별 키워드
    const regionKeywords = this.generateRegionKeywords(specialization, businessLocation || '서울')

    // 서비스 지역 키워드
    const serviceAreaKeywords = this.generateServiceAreaKeywords(specialization, serviceArea || [])

    // 경쟁사 분석 키워드
    const competitorAnalysis = this.analyzeCompetitorKeywords(specialization, businessLocation || '서울')

    return {
      cityKeywords,
      regionKeywords,
      serviceAreaKeywords,
      competitorAnalysis
    }
  }

  private generateCityKeywords(specialization: string, location: string): string[] {
    const baseTerms = this.getSpecializationTerms(specialization)
    const locationVariations = this.getLocationVariations(location)

    const keywords: string[] = []

    locationVariations.forEach(loc => {
      baseTerms.forEach(term => {
        keywords.push(`${loc} ${term}`)
        keywords.push(`${term} ${loc}`)
        keywords.push(`${loc} 근처 ${term}`)
      })
    })

    return keywords.slice(0, 20) // 상위 20개 키워드 반환
  }

  private generateRegionKeywords(specialization: string, location: string): string[] {
    const regions = this.getRegionalAreas(location)
    const services = this.getSpecializationServices(specialization)

    const keywords: string[] = []

    regions.forEach(region => {
      services.forEach(service => {
        keywords.push(`${region} ${service}`)
        keywords.push(`${service} ${region}`)
      })
    })

    return keywords.slice(0, 15)
  }

  private generateServiceAreaKeywords(specialization: string, serviceAreas: string[]): string[] {
    if (serviceAreas.length === 0) return []

    const services = this.getSpecializationServices(specialization)
    const keywords: string[] = []

    serviceAreas.forEach(area => {
      services.forEach(service => {
        keywords.push(`${area} ${service}`)
        keywords.push(`${area} ${service} 전문`)
        keywords.push(`${area} ${service} 추천`)
      })
    })

    return keywords.slice(0, 25)
  }

  private analyzeCompetitorKeywords(specialization: string, location: string): string[] {
    const competitorTerms = [
      `${location} ${this.getSpecializationTerms(specialization)[0]} 순위`,
      `${location} ${this.getSpecializationTerms(specialization)[0]} 추천`,
      `${location} ${this.getSpecializationTerms(specialization)[0]} 후기`,
      `${location} ${this.getSpecializationTerms(specialization)[0]} 비교`,
      `${location} 유명한 ${this.getSpecializationTerms(specialization)[0]}`
    ]

    return competitorTerms
  }

  private getSpecializationTerms(specialization: string): string[] {
    const terms: Record<string, string[]> = {
      'medical': ['병원', '의원', '클리닉', '의료진', '전문의'],
      'legal': ['변호사', '로펌', '법무법인', '법률사무소', '법무'],
      'tax': ['세무사', '세무법인', '세무사무소', '세무회계', '회계사'],
      'marketing': ['마케팅', '광고대행사', '디지털마케팅', '마케팅컨설팅', '브랜드'],
      'consulting': ['컨설팅', '컨설팅펌', '경영컨설팅', '전략컨설팅', '컨설턴트'],
      'finance': ['금융', '투자', '자산관리', '금융컨설팅', '재무'],
      'education': ['학원', '교육', '과외', '교육기관', '학습'],
      'other': ['전문서비스', '전문가', '컨설팅', '서비스', '전문']
    }

    return terms[specialization] || terms['other']
  }

  private getLocationVariations(location: string): string[] {
    const variations = [location]

    // 서울의 경우 구별 세분화
    if (location === '서울') {
      variations.push('강남구', '서초구', '종로구', '중구', '용산구', '성동구', '광진구', '동대문구')
    } else if (location === '부산') {
      variations.push('해운대구', '부산진구', '동래구', '남구', '중구', '서구', '사하구')
    } else if (location === '대구') {
      variations.push('중구', '동구', '서구', '남구', '북구', '수성구', '달서구')
    }

    return variations.slice(0, 8)
  }

  private getRegionalAreas(location: string): string[] {
    const areas: Record<string, string[]> = {
      '서울': ['강남', '강북', '강서', '강동', '마포', '영등포', '송파', '관악'],
      '부산': ['해운대', '센텀시티', '서면', '남포동', '광안리', '연산동', '사상'],
      '대구': ['중앙로', '동성로', '수성구', '달서구', '북구', '동구'],
      '인천': ['송도', '부평', '계양', '연수구', '남동구', '서구'],
      '대전': ['유성구', '서구', '중구', '동구', '대덕구'],
      '광주': ['서구', '남구', '북구', '광산구', '동구'],
      '울산': ['남구', '중구', '동구', '북구', '울주군']
    }

    return areas[location] || [location, `${location} 시내`, `${location} 중심가`]
  }

  private getSpecializationServices(specialization: string): string[] {
    const services: Record<string, string[]> = {
      'medical': ['진료', '치료', '검진', '상담', '수술', '재활', '응급처치'],
      'legal': ['법률상담', '소송', '계약검토', '법무자문', '등기', '형사변호', '민사소송'],
      'tax': ['세무신고', '절세상담', '세무조사', '부가세신고', '소득세신고', '법인세신고'],
      'marketing': ['마케팅전략', '광고제작', 'SNS마케팅', 'SEO', '브랜딩', '온라인마케팅'],
      'consulting': ['경영컨설팅', '전략수립', '프로세스개선', 'HR컨설팅', 'IT컨설팅'],
      'finance': ['투자상담', '자산관리', '보험상담', '대출상담', '재무설계', '세금절약'],
      'education': ['개인수업', '그룹수업', '온라인강의', '시험준비', '진학상담', '학습컨설팅'],
      'other': ['전문상담', '서비스', '컨설팅', '자문', '솔루션']
    }

    return services[specialization] || services['other']
  }

  private optimizeGoogleMyBusiness(input: LocalSEOInput) {
    const { specialization, targetAudience } = input

    const optimizationTips = [
      '완전하고 정확한 비즈니스 정보 입력',
      '정기적인 게시물 업로드 (주 2-3회)',
      '고객 리뷰에 신속하고 전문적인 답변',
      '비즈니스 시간 정확히 업데이트',
      '전화번호, 주소, 웹사이트 일관성 유지',
      '서비스 지역 명확히 설정',
      'FAQ 섹션 충실히 작성'
    ]

    const categoryRecommendations = this.getGMBCategories(specialization)

    const photoRecommendations = [
      '고품질 전문가 프로필 사진',
      '사무실/클리닉 내부 사진',
      '팀 구성원 소개 사진',
      '서비스 과정 사진',
      '자격증 및 인증서 사진',
      '고객과의 상담 장면 (동의 하에)',
      '로고 및 간판 사진'
    ]

    const reviewStrategy = [
      '만족한 고객에게 정중한 리뷰 요청',
      '리뷰 응답 템플릿 준비',
      '부정적 리뷰에 대한 전문적 대응 방안',
      '리뷰 모니터링 정기 스케줄 설정',
      '우수 리뷰 하이라이트 활용',
      '리뷰 응답률 100% 목표'
    ]

    return {
      optimizationTips,
      categoryRecommendations,
      photoRecommendations,
      reviewStrategy
    }
  }

  private getGMBCategories(specialization: string): string[] {
    const categories: Record<string, string[]> = {
      'medical': ['의료진', '병원', '클리닉', '전문의', '의원'],
      'legal': ['변호사', '법률 서비스', '법무법인', '법률 상담'],
      'tax': ['세무사', '회계 서비스', '세무 컨설턴트', '부기 서비스'],
      'marketing': ['마케팅 컨설턴트', '광고 대행사', '디지털 마케팅 서비스'],
      'consulting': ['비즈니스 컨설턴트', '경영 컨설팅 서비스', '전략 컨설턴트'],
      'finance': ['재정 컨설턴트', '투자 서비스', '보험 중개인'],
      'education': ['교육 서비스', '개인 교습', '학습 센터', '교육 컨설턴트'],
      'other': ['전문 서비스', '컨설팅', '비즈니스 서비스']
    }

    return categories[specialization] || categories['other']
  }

  private recommendLocalDirectories(input: LocalSEOInput) {
    const primaryDirectories = [
      '네이버 플레이스',
      '다음 플레이스',
      '구글 마이비즈니스',
      '옐로페이지',
      '114114.co.kr',
      '플레이스플랫',
      '포털 지역정보'
    ]

    const industryDirectories = this.getIndustryDirectories(input.specialization)

    const submissionGuidelines = [
      'NAP 정보 (이름, 주소, 전화번호) 일관성 유지',
      '카테고리 정확히 선택',
      '상세한 비즈니스 설명 작성',
      '고품질 사진 업로드',
      '영업시간 정확히 입력',
      '웹사이트 및 SNS 링크 추가',
      '정기적인 정보 업데이트'
    ]

    return {
      primaryDirectories,
      industryDirectories,
      submissionGuidelines
    }
  }

  private getIndustryDirectories(specialization: string): string[] {
    const directories: Record<string, string[]> = {
      'medical': ['굿닥', '닥터나우', '병원정보', '메디컬투데이', '헬스조선'],
      'legal': ['대한변호사협회', '로톡', '변호사닷컴', '법률신문'],
      'tax': ['세무사협회', '세무닷컴', '세무정보센터', '국세청 홈택스'],
      'marketing': ['마케팅협회', '광고대행사협회', '디지털마케팅협회'],
      'consulting': ['한국경영컨설팅협회', '컨설팅코리아', '전문가네트워크'],
      'finance': ['금융감독원', '코스콤', '금융투자협회', '생보협회'],
      'education': ['학원협회', '교육청', '사설교육기관정보', '온라인교육플랫폼'],
      'other': ['전문서비스협회', '비즈니스디렉토리', '업종별 협회']
    }

    return directories[specialization] || directories['other']
  }

  private planLocalContent(input: LocalSEOInput) {
    const { specialization, businessLocation, targetAudience } = input
    const location = businessLocation || '서울'

    const communityTopics = [
      `${location} 지역 ${this.getSpecializationTerms(specialization)[0]} 동향`,
      `${location} ${targetAudience}를 위한 지역 정보`,
      `${location} 지역 성공 사례 및 후기`,
      `${location} 근처 편의시설 및 교통정보`,
      `${location} 지역 특성에 맞는 서비스 소개`
    ]

    const eventMarketing = [
      '지역 세미나 및 워크숍 개최',
      '무료 상담 이벤트',
      '지역 커뮤니티 참여',
      '건강검진/법률상담 등 무료 서비스',
      '지역 축제 및 행사 참여',
      '교육 프로그램 제공'
    ]

    const localPartnerships = [
      '지역 기업과의 제휴',
      '동네 상권 연합 참여',
      '지역 언론사와 협력',
      '커뮤니티 센터 파트너십',
      '지역 단체 및 협회 가입',
      '이웃 전문가와의 네트워킹'
    ]

    const neighborhoodContent = [
      `${location} 지역 가이드 시리즈`,
      '동네 맛집 및 카페 소개',
      '지역 교통 및 주차 정보',
      '학군 정보 및 교육 환경',
      '부동산 시장 동향 (해당시)',
      '지역 문화시설 소개'
    ]

    return {
      communityTopics,
      eventMarketing,
      localPartnerships,
      neighborhoodContent
    }
  }

  private buildCitationStrategy(input: LocalSEOInput) {
    const napConsistency = [
      '모든 플랫폼에서 동일한 비즈니스명 사용',
      '주소 표기법 통일 (도로명 주소 우선)',
      '전화번호 형식 일관성 유지',
      '영문 표기시 일관된 형식 사용',
      '약칭 및 줄임말 통일',
      '정기적인 정보 업데이트 체크'
    ]

    const citationSources = [
      '포털사이트 (네이버, 다음, 구글)',
      '지역 디렉토리',
      '업종별 전문 사이트',
      '소셜 미디어 플랫폼',
      '리뷰 사이트',
      '정부 및 공공기관 사이트',
      '지역 신문 및 매체'
    ]

    const citationAudit = [
      '기존 인용 현황 조사',
      '부정확한 정보 수정 작업',
      '누락된 플랫폼 추가',
      '중복 리스팅 정리',
      '경쟁사 인용 분석',
      '월간 인용 모니터링'
    ]

    return {
      napConsistency,
      citationSources,
      citationAudit
    }
  }
}