import { BaseAgent } from '@/lib/agents/base-agent'
import { AgentType, AgentResult, SharedContext } from '@/types/agents'
import { ContentWritingOutput } from './content-writing-agent'
import { aiServiceRouter } from '@/lib/services/ai-service-router'

export interface VisualDesignInput {
  contentData: ContentWritingOutput
  specialization: string
  brandVoice: string
  targetAudience: string
  topic: string
  userId?: string
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
        topic: input?.topic || '전문 서비스',
        userId: context.userId || 'anonymous'
      }

      // 1. AI를 사용하여 비주얼 디자인 전략 생성
      const designStrategy = await this.generateDesignStrategyWithAI(normalizedInput)

      // 2. 썸네일 이미지 생성 (AI Prompt 활용)
      // designStrategy.thumbnailDesign.concept가 프롬프트 역할을 함
      const thumbnailImage = await this.generateThumbnailImage(designStrategy.thumbnailDesign.concept, normalizedInput.userId)

      // 3. 결과 조합
      const output: VisualDesignOutput = {
        ...designStrategy,
        thumbnailDesign: {
          ...designStrategy.thumbnailDesign,
          concept: `${designStrategy.thumbnailDesign.concept}\n\n[Generated Image]: ${thumbnailImage}`
        }
      }

      const executionTime = Date.now() - startTime
      const tokensUsed = this.calculateTokens(JSON.stringify(output))

      return this.createSuccessResult(output, executionTime, tokensUsed)
    } catch (error) {
      const executionTime = Date.now() - startTime
      return this.handleError(error as Error, executionTime)
    }
  }

  private async generateDesignStrategyWithAI(input: any): Promise<VisualDesignOutput> {
    const { contentData, specialization, brandVoice, targetAudience, topic, userId } = input

    const prompt = `당신은 수석 비주얼 디자이너입니다. 다음 콘텐츠를 위한 시각적 전략을 수립해주세요.

컨텍스트:
- 주제: ${topic}
- 전문 분야: ${specialization}
- 브랜드 보이스: ${brandVoice}
- 타겟 독자: ${targetAudience}

다음 JSON 형식으로 응답해주세요:

{
  "thumbnailDesign": {
    "concept": "썸네일 디자인 컨셉 및 AI 이미지 생성 프롬프트 (영문으로 작성, 상세하고 묘사적으로)",
    "colorScheme": ["#Hex", "#Hex", "#Hex"],
    "typography": "폰트 추천 및 스타일",
    "layout": "레이아웃 구조",
    "elements": ["주요 시각 요소 1", "요소 2"]
  },
  "imageRecommendations": [
    {
      "section": "섹션명",
      "imageType": "이미지 유형 (일러스트/사진/차트)",
      "description": "이미지 상세 묘사",
      "alt_text": "SEO 최적화된 대체 텍스트",
      "placement": "배치 위치"
    }
  ],
  "brandingGuidelines": {
    "primaryColors": ["메인 컬러 1", "메인 컬러 2"],
    "secondaryColors": ["보조 컬러 1", "보조 컬러 2"],
    "fontRecommendations": ["제목용 폰트", "본문용 폰트"],
    "logoPlacement": "로고 배치 가이드",
    "brandElements": ["브랜드 그래픽 요소"]
  },
  "visualHierarchy": {
    "headingStyles": {"h1": "스타일", "h2": "스타일"},
    "bodyTextStyle": "본문 스타일 가이드",
    "emphasisElements": ["강조 스타일 1"],
    "calloutBoxes": ["박스 스타일 1"]
  },
  "accessibilityFeatures": {
    "colorContrast": "대비 기준",
    "imageDescriptions": ["접근성 가이드"],
    "visualStructure": "구조 가이드"
  }
}

응답은 오직 유효한 JSON 포맷이어야 합니다.`

    try {
      const response = await aiServiceRouter.generateText({
        service: 'claude',
        model: 'claude-3-haiku-20240307',
        prompt: prompt,
        userId: userId,
        maxTokens: 3000,
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

      return JSON.parse(jsonMatch[0]) as VisualDesignOutput

    } catch (error) {
      console.error('Visual Design Agent AI Error:', error)
      return this.getFallbackDesign(input)
    }
  }

  private async generateThumbnailImage(prompt: string, userId: string): Promise<string> {
    try {
      const response = await aiServiceRouter.generateImage({
        prompt: prompt,
        model: 'gemini-nano-banana-pro',
        size: '1024x1024',
        userId: userId
      })

      if (response.success && response.data?.imageUrl) {
        return response.data.imageUrl
      }
      return '이미지 생성 실패'
    } catch (error) {
      console.error('Image Generation Error:', error)
      return '이미지 생성 오류'
    }
  }

  private getFallbackDesign(input: any): VisualDesignOutput {
    const { topic, specialization } = input
    return {
      thumbnailDesign: {
        concept: `${topic} - ${specialization} 전문 썸네일`,
        colorScheme: ['#000000', '#FFFFFF'],
        typography: 'Sans-serif',
        layout: 'Center',
        elements: []
      },
      imageRecommendations: [],
      brandingGuidelines: {
        primaryColors: [], secondaryColors: [], fontRecommendations: [], logoPlacement: '', brandElements: []
      },
      visualHierarchy: { headingStyles: {}, bodyTextStyle: '', emphasisElements: [], calloutBoxes: [] },
      accessibilityFeatures: { colorContrast: '', imageDescriptions: [], visualStructure: '' }
    }
  }
}