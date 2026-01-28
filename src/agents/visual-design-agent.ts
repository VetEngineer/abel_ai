import { BaseAgent } from '@/lib/agents/base-agent'
import { AgentType, AgentResult, SharedContext } from '@/types/agents'
import { ContentWritingOutput } from './content-writing-agent'

export interface VisualDesignInput {
  contentData: ContentWritingOutput
  specialization: string
  brandVoice: string
  targetAudience: string
  topic: string
}

export interface VisualDesignOutput {
  thumbnailDesign: {
    concept: string
    colorScheme: string[]
    typography: string
    layout: string
    elements: string[]
  }
  imageRecommendations: Array<{
    section: string
    imageType: string
    description: string
    alt_text: string
    placement: string
  }>
  brandingGuidelines: {
    primaryColors: string[]
    secondaryColors: string[]
    fontRecommendations: string[]
    logoPlacement: string
    brandElements: string[]
  }
  visualHierarchy: {
    headingStyles: Record<string, string>
    bodyTextStyle: string
    emphasisElements: string[]
    calloutBoxes: string[]
  }
  accessibilityFeatures: {
    colorContrast: string
    imageDescriptions: string[]
    visualStructure: string
  }
}

export class VisualDesignAgent extends BaseAgent {
  constructor() {
    super(
      AgentType.VISUAL_DESIGN,
      '비주얼 디자인 에이전트',
      '전문직 브랜드에 맞는 시각적 요소와 이미지를 기획하는 전문 에이전트',
      ['브랜드 디자인', '썸네일 기획', '색상 조합', '타이포그래피', '접근성 디자인']
    )
  }

  async execute(input: any, context: SharedContext): Promise<AgentResult> {
    const startTime = Date.now()
    this.setStatus('processing' as any)

    try {
      // 입력 데이터 정규화 처리
      const normalizedInput = {
        contentData: input?.content ? input : input?.contentData || { content: { mainSections: [] } },
        specialization: input?.specialization || context?.platform || 'other',
        brandVoice: input?.brandVoice || context?.brandTone || '전문적인',
        targetAudience: input?.targetAudience || context?.targetAudience || '일반 사용자',
        topic: input?.topic || '전문 서비스'
      }

      const thumbnailDesign = this.designThumbnail(normalizedInput)
      const imageRecommendations = this.recommendImages(normalizedInput)
      const brandingGuidelines = this.createBrandingGuidelines(normalizedInput)
      const visualHierarchy = this.establishVisualHierarchy(normalizedInput)
      const accessibilityFeatures = this.ensureAccessibility(normalizedInput)

      const output: VisualDesignOutput = {
        thumbnailDesign,
        imageRecommendations,
        brandingGuidelines,
        visualHierarchy,
        accessibilityFeatures
      }

      const executionTime = Date.now() - startTime
      const tokensUsed = this.calculateTokens(JSON.stringify(output))

      return this.createSuccessResult(output, executionTime, tokensUsed)
    } catch (error) {
      const executionTime = Date.now() - startTime
      return this.handleError(error as Error, executionTime)
    }
  }

  private designThumbnail(input: any) {
    const { specialization, topic, brandVoice } = input

    const concept = this.getThumbnailConcept(specialization, topic)
    const colorScheme = this.getColorScheme(specialization, brandVoice)
    const typography = this.getTypography(specialization, brandVoice)
    const layout = this.getLayoutStyle(specialization)
    const elements = this.getDesignElements(specialization, topic)

    return {
      concept,
      colorScheme,
      typography,
      layout,
      elements
    }
  }

  private getThumbnailConcept(specialization: string, topic: string): string {
    const concepts: Record<string, string> = {
      'medical': `의료진의 전문성과 신뢰감을 강조하는 클린하고 모던한 디자인. ${topic}과 관련된 의료 아이콘과 차분한 색상 활용`,
      'legal': `법무 전문가의 권위와 신뢰성을 나타내는 정형적이고 안정감 있는 디자인. 법전, 저울 등의 상징적 요소 활용`,
      'tax': `세무 전문성을 나타내는 체계적이고 정확한 느낌의 디자인. 계산기, 차트 등 수치 관련 요소 포함`,
      'marketing': `창의적이면서도 전문적인 마케팅 감각을 보여주는 동적인 디자인. 그래프, 트렌드 화살표 등 활용`,
      'consulting': `컨설팅 전문성을 보여주는 비즈니스 감각의 세련된 디자인. 전략적 사고를 나타내는 요소들 활용`,
      'finance': `금융 전문성과 안정성을 나타내는 신뢰감 있는 디자인. 차트, 동전, 그래프 등 재무 관련 요소 활용`,
      'education': `교육적이고 접근하기 쉬운 친근한 디자인. 책, 연필, 졸업모자 등 교육 관련 아이콘 활용`,
      'other': `해당 분야의 전문성을 나타내는 깔끔하고 신뢰감 있는 디자인`
    }

    return concepts[specialization] || concepts['other']
  }

  private getColorScheme(specialization: string, brandVoice: string): string[] {
    const schemes: Record<string, Record<string, string[]>> = {
      'medical': {
        'professional': ['#2C5282', '#E2E8F0', '#FFFFFF'],
        'friendly_expert': ['#3182CE', '#BEE3F8', '#F7FAFC'],
        'authoritative': ['#1A365D', '#CBD5E0', '#FFFFFF'],
        'approachable': ['#4299E1', '#E6FFFA', '#F0F4F8'],
        'consultative': ['#2D3748', '#4A5568', '#F7FAFC'],
        'educational': ['#3182CE', '#BEE3F8', '#EDF2F7']
      },
      'legal': {
        'professional': ['#1A202C', '#2D3748', '#F7FAFC'],
        'friendly_expert': ['#2D3748', '#718096', '#EDF2F7'],
        'authoritative': ['#000000', '#4A5568', '#FFFFFF'],
        'approachable': ['#4A5568', '#A0AEC0', '#F7FAFC'],
        'consultative': ['#2D3748', '#718096', '#EDF2F7'],
        'educational': ['#4A5568', '#CBD5E0', '#F7FAFC']
      },
      'tax': {
        'professional': ['#2F855A', '#68D391', '#F0FFF4'],
        'friendly_expert': ['#38A169', '#9AE6B4', '#F0FFF4'],
        'authoritative': ['#22543D', '#68D391', '#FFFFFF'],
        'approachable': ['#48BB78', '#C6F6D5', '#F0FFF4'],
        'consultative': ['#2F855A', '#9AE6B4', '#F7FAFC'],
        'educational': ['#38A169', '#C6F6D5', '#EDF2F7']
      },
      'marketing': {
        'professional': ['#E53E3E', '#FC8181', '#FED7D7'],
        'friendly_expert': ['#F56565', '#FEB2B2', '#FFFAFA'],
        'authoritative': ['#C53030', '#FEB2B2', '#FFFFFF'],
        'approachable': ['#FC8181', '#FED7D7', '#FFFAFA'],
        'consultative': ['#E53E3E', '#FEB2B2', '#F7FAFC'],
        'educational': ['#F56565', '#FED7D7', '#EDF2F7']
      }
    }

    const defaultScheme = ['#4A5568', '#CBD5E0', '#F7FAFC']
    return schemes[specialization]?.[brandVoice] || defaultScheme
  }

  private getTypography(specialization: string, brandVoice: string): string {
    const fonts: Record<string, Record<string, string>> = {
      'medical': {
        'professional': 'Inter, Roboto - 클린하고 읽기 쉬운 산세리프',
        'friendly_expert': 'Open Sans, Lato - 친근하면서도 전문적인',
        'authoritative': 'Merriweather, Georgia - 권위적인 세리프',
        'approachable': 'Nunito, Source Sans Pro - 접근하기 쉬운',
        'consultative': 'IBM Plex Sans - 비즈니스 컨설팅',
        'educational': 'Noto Sans KR - 교육적이고 명확한'
      },
      'legal': {
        'professional': 'Times New Roman, Playfair Display - 전통적이고 권위적인',
        'friendly_expert': 'Source Serif Pro - 친근한 세리프',
        'authoritative': 'Crimson Text, Lora - 법적 권위',
        'approachable': 'PT Serif - 접근하기 쉬운 세리프',
        'consultative': 'IBM Plex Serif - 컨설팅 세리프',
        'educational': 'Noto Serif KR - 교육적 세리프'
      }
    }

    const defaultFont = 'Inter, system-ui - 범용적이고 읽기 쉬운'
    return fonts[specialization]?.[brandVoice] || defaultFont
  }

  private getLayoutStyle(specialization: string): string {
    const layouts: Record<string, string> = {
      'medical': '중앙 정렬, 대칭적 레이아웃으로 안정감과 신뢰감 강조',
      'legal': '격식을 갖춘 전통적인 레이아웃, 좌상단 로고 배치',
      'tax': '체계적이고 정리된 그리드 레이아웃, 숫자와 차트 강조',
      'marketing': '역동적이고 비대칭적 레이아웃, 시선을 끄는 요소 배치',
      'consulting': '깔끔하고 미니멀한 비즈니스 레이아웃',
      'finance': '안정적이고 보수적인 레이아웃, 데이터 시각화 포함',
      'education': '친근하고 접근하기 쉬운 레이아웃, 아이콘과 일러스트 활용',
      'other': '클린하고 전문적인 표준 레이아웃'
    }

    return layouts[specialization] || layouts['other']
  }

  private getDesignElements(specialization: string, topic: string): string[] {
    const elements: Record<string, string[]> = {
      'medical': [
        '의료 아이콘 (청진기, 십자가, 하트)',
        '차분한 그라데이션',
        '깔끔한 라인',
        '의료진 실루엣',
        `${topic} 관련 의료 기호`
      ],
      'legal': [
        '법률 아이콘 (저울, 법전, 망치)',
        '직선적인 디자인',
        '격식 있는 경계선',
        '법률 문서 모티프',
        '권위를 상징하는 요소'
      ],
      'tax': [
        '계산기, 차트, 그래프 아이콘',
        '수치 데이터 시각화',
        '체크리스트 요소',
        '세금 관련 기호',
        '정확성을 나타내는 요소'
      ],
      'marketing': [
        '화살표, 그래프, 트렌드 라인',
        'SNS 아이콘',
        '창의적인 형태',
        '브랜딩 요소',
        '성장을 나타내는 시각적 요소'
      ]
    }

    return elements[specialization] || [
      '전문성을 나타내는 아이콘',
      '깔끔한 선과 도형',
      '브랜드 컬러 적용',
      '가독성 높은 텍스트',
      '신뢰감 주는 디자인 요소'
    ]
  }

  private recommendImages(input: any) {
    const { contentData, specialization, topic } = input

    const recommendations: Array<{
      section: string
      imageType: string
      description: string
      alt_text: string
      placement: string
    }> = []

    // 썸네일 이미지
    recommendations.push({
      section: 'thumbnail',
      imageType: 'hero_image',
      description: this.getHeroImageDescription(specialization, topic),
      alt_text: `${topic} 전문가 가이드 썸네일`,
      placement: 'top_center'
    })

    // 각 섹션별 이미지 추천
    const mainSections = contentData?.content?.mainSections || []
    mainSections.forEach((section: any, index: number) => {
      const sectionTitle = section?.title || `섹션 ${index + 1}`
      recommendations.push({
        section: sectionTitle,
        imageType: this.getSectionImageType(sectionTitle, specialization),
        description: this.getSectionImageDescription(sectionTitle, specialization),
        alt_text: `${sectionTitle} 관련 이미지`,
        placement: index % 2 === 0 ? 'left_align' : 'right_align'
      })
    })

    return recommendations
  }

  private getHeroImageDescription(specialization: string, topic: string): string {
    const descriptions: Record<string, string> = {
      'medical': `의료진이 환자를 상담하는 모습 또는 의료 장비와 ${topic} 관련 시각적 요소`,
      'legal': `법률 서적과 저울, 또는 변호사가 상담하는 프로페셔널한 오피스 환경`,
      'tax': `세무 서류와 계산기, 또는 세무사가 업무하는 모습`,
      'marketing': `마케팅 데이터 분석 화면 또는 창의적인 마케팅 컨셉 이미지`,
      'consulting': `비즈니스 미팅 또는 전략 수립 과정을 보여주는 이미지`,
      'finance': `금융 차트와 데이터 분석 화면 또는 재무 상담 장면`,
      'education': `교육 환경 또는 학습 자료를 활용하는 모습`,
      'other': `해당 분야의 전문적인 업무 환경을 보여주는 이미지`
    }

    return descriptions[specialization] || descriptions['other']
  }

  private getSectionImageType(sectionTitle: string, specialization: string): string {
    if (sectionTitle.includes('방법') || sectionTitle.includes('단계')) {
      return 'infographic'
    } else if (sectionTitle.includes('비교') || sectionTitle.includes('차이')) {
      return 'comparison_chart'
    } else if (sectionTitle.includes('주의') || sectionTitle.includes('팁')) {
      return 'icon_illustration'
    } else {
      return 'conceptual_image'
    }
  }

  private getSectionImageDescription(sectionTitle: string, specialization: string): string {
    return `${sectionTitle}의 내용을 시각적으로 설명하는 ${specialization} 전문 분야에 적합한 이미지`
  }

  private createBrandingGuidelines(input: any) {
    const { specialization, brandVoice } = input

    const primaryColors = this.getColorScheme(specialization, brandVoice).slice(0, 2)
    const secondaryColors = this.getColorScheme(specialization, brandVoice).slice(2)

    const fontRecommendations = [
      this.getTypography(specialization, brandVoice),
      'Noto Sans KR - 한글 텍스트용',
      'Inter - 영문 텍스트용'
    ]

    const logoPlacement = this.getLogoPlacement(specialization)
    const brandElements = this.getBrandElements(specialization)

    return {
      primaryColors,
      secondaryColors,
      fontRecommendations,
      logoPlacement,
      brandElements
    }
  }

  private getLogoPlacement(specialization: string): string {
    const placements: Record<string, string> = {
      'medical': '좌상단 또는 중앙상단, 신뢰감을 주는 안정적인 위치',
      'legal': '좌상단, 전통적이고 격식 있는 위치',
      'tax': '좌상단, 체계적이고 정리된 느낌',
      'marketing': '창의적인 위치, 우상단 또는 중앙',
      'consulting': '좌상단, 비즈니스 표준',
      'finance': '좌상단, 보수적이고 안정적인 위치',
      'education': '중앙상단, 친근하고 접근하기 쉬운 위치',
      'other': '좌상단, 표준 비즈니스 위치'
    }

    return placements[specialization] || placements['other']
  }

  private getBrandElements(specialization: string): string[] {
    const elements: Record<string, string[]> = {
      'medical': ['의료 인증 마크', '전문의 자격 표시', '병원/클리닉 로고'],
      'legal': ['변호사 자격 인증', '법무법인 로고', '법률 관련 인장'],
      'tax': ['세무사 자격 인증', '세무법인 로고', '공인 마크'],
      'marketing': ['에이전시 로고', '인증 배지', '수상 경력'],
      'consulting': ['컨설팅펌 로고', '자격 인증', 'ISO 인증'],
      'finance': ['금융 라이선스', '펀드 인증', '금융 협회 로고'],
      'education': ['교육기관 인증', '강사 자격', '교육 프로그램 로고'],
      'other': ['전문 자격 인증', '업계 협회 로고', '품질 인증 마크']
    }

    return elements[specialization] || elements['other']
  }

  private establishVisualHierarchy(input: any) {
    const { specialization, brandVoice } = input

    const headingStyles: Record<string, string> = {
      'h1': `큰 제목 - ${this.getTypography(specialization, brandVoice)}, 굵게, 대형 크기`,
      'h2': '중제목 - 중간 굵기, 중형 크기, 섹션 구분용',
      'h3': '소제목 - 일반 굵기, 소형 크기, 세부 항목용'
    }

    const bodyTextStyle = '본문 - 읽기 쉬운 크기와 줄간격, 충분한 대비'

    const emphasisElements = [
      '중요 정보 하이라이트 박스',
      '주의사항 경고 박스',
      '핵심 포인트 강조',
      '전문가 팁 콜아웃'
    ]

    const calloutBoxes = [
      '전문가 조언 박스',
      'FAQ 섹션',
      '체크리스트 박스',
      '요약 정리 박스'
    ]

    return {
      headingStyles,
      bodyTextStyle,
      emphasisElements,
      calloutBoxes
    }
  }

  private ensureAccessibility(input: any) {
    const colorContrast = 'WCAG 2.1 AA 기준 준수 - 최소 4.5:1 대비율 보장'

    const imageDescriptions = [
      '모든 이미지에 대체 텍스트 제공',
      '복잡한 차트나 그래프는 상세 설명 추가',
      '장식적 이미지는 빈 alt 속성 사용',
      '의미 있는 이미지는 내용 설명 포함'
    ]

    const visualStructure = '명확한 제목 구조(H1-H6), 논리적 읽기 순서, 키보드 네비게이션 지원'

    return {
      colorContrast,
      imageDescriptions,
      visualStructure
    }
  }
}