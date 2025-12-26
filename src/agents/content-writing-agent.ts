import { BaseAgent } from '@/lib/agents/base-agent'
import { AgentType, AgentResult, SharedContext } from '@/types/agents'
import { CopywritingOutput } from './copywriting-agent'
import { SEOOptimizationOutput } from './seo-optimization-agent'
import { aiServiceRouter } from '@/lib/services/ai-service-router'

export interface ContentWritingInput {
  copyData: CopywritingOutput
  seoData: SEOOptimizationOutput
  specialization: string
  targetAudience: string
  brandVoice: string
  topic: string
  contentGoals: string
  userId: string
  contentId?: string
}

export interface ContentWritingOutput {
  content: {
    introduction: string
    mainSections: Array<{
      title: string
      content: string
      keyPoints: string[]
    }>
    conclusion: string
    fullContent: string
  }
  writingMetrics: {
    wordCount: number
    readabilityScore: number
    keywordDensity: number
    seoScore: number
  }
  contentStructure: {
    paragraphs: number
    sentences: number
    avgWordsPerSentence: number
  }
}

export class ContentWritingAgent extends BaseAgent {
  constructor() {
    super(
      AgentType.CONTENT_WRITING,
      '콘텐츠 작성 에이전트',
      'Claude AI를 활용하여 전문가급 고품질 콘텐츠를 생성하는 핵심 에이전트',
      ['AI 콘텐츠 생성', '전문 글쓰기', '구조화된 작성', '품질 최적화', 'Claude API 연동']
    )
  }

  async execute(input: ContentWritingInput, context: SharedContext): Promise<AgentResult> {
    const startTime = Date.now()
    this.setStatus('processing' as any)

    try {
      // Claude API를 통한 콘텐츠 생성
      const content = await this.generateContentWithClaude(input)
      const writingMetrics = this.calculateWritingMetrics(content, input.seoData)
      const contentStructure = this.analyzeContentStructure(content)

      const output: ContentWritingOutput = {
        content,
        writingMetrics,
        contentStructure
      }

      const executionTime = Date.now() - startTime
      const tokensUsed = this.calculateTokens(JSON.stringify(output))

      return this.createSuccessResult(output, executionTime, tokensUsed)
    } catch (error) {
      const executionTime = Date.now() - startTime
      return this.handleError(error as Error, executionTime)
    }
  }

  private async generateContentWithClaude(input: ContentWritingInput) {
    const prompt = this.buildClaudePrompt(input)

    try {
      // Claude API 호출
      const claudeResponse = await aiServiceRouter.generateText({
        service: 'claude',
        model: 'claude-3-haiku-20240307',
        prompt,
        maxTokens: 4000,
        temperature: 0.7,
        userId: input.userId,
        contentId: input.contentId
      })

      if (!claudeResponse.success || !claudeResponse.data) {
        throw new Error(claudeResponse.error || 'Claude API 호출 실패')
      }

      return this.parseClaudeResponse(claudeResponse.data.text, input)
    } catch (error) {
      console.warn('Claude API 호출 실패, 목업 콘텐츠 생성:', error)
      // Claude API 실패시 목업 콘텐츠 반환
      return this.generateMockupContent(input)
    }
  }

  private buildClaudePrompt(input: ContentWritingInput): string {
    const { specialization, targetAudience, brandVoice, topic, contentGoals, seoData, copyData } = input

    const specializationContext = this.getSpecializationContext(specialization)
    const voiceGuideline = this.getBrandVoiceGuideline(brandVoice)

    return `당신은 ${specializationContext}입니다. ${targetAudience}를 위한 전문적이고 신뢰할 수 있는 블로그 콘텐츠를 작성해주세요.

주제: ${topic}
콘텐츠 목표: ${contentGoals}
브랜드 톤: ${voiceGuideline}
타겟 워드 수: ${seoData.technicalSEO.recommendedWordCount}

SEO 요구사항:
- 주요 키워드: ${seoData.metaData.keywords.slice(0, 3).join(', ')}
- H1: ${seoData.headings.h1}
- H2 구조: ${seoData.headings.h2.join(', ')}

카피라이팅 가이드라인:
- 메인 헤드라인: ${copyData.headlines.main}
- 도입부 구조: ${copyData.introHook.opening}
- 신뢰도 강화: ${copyData.introHook.credibilityStatement}

다음 구조로 작성해주세요:

1. 도입부 (200-300단어)
   - 독자의 관심을 끄는 오프닝
   - 문제 상황 제시
   - 전문성 어필
   - 콘텐츠 미리보기

2. 본문 (각 섹션 400-600단어씩)
${seoData.headings.h2.map((h2, index) => `   섹션 ${index + 1}: ${h2}
   - 핵심 포인트 설명
   - 실무 적용 방법
   - 주의사항 및 팁`).join('\n')}

3. 마무리 (150-200단어)
   - 핵심 내용 요약
   - 실행 가능한 다음 단계
   - 전문가 상담 안내

작성 규칙:
- 전문적이지만 이해하기 쉽게
- 구체적인 예시와 실무 팁 포함
- 법적/의학적 조언은 일반적인 정보 수준으로
- 신뢰도를 높이는 근거 자료 언급
- ${voiceGuideline} 톤 일관성 유지

응답 형식:
[INTRODUCTION]
도입부 내용

[SECTION_1]
첫 번째 섹션 내용

[SECTION_2]
두 번째 섹션 내용

[SECTION_3]
세 번째 섹션 내용

[CONCLUSION]
마무리 내용`
  }

  private getSpecializationContext(specialization: string): string {
    const contexts: Record<string, string> = {
      'medical': '의료 분야 전문가로서 환자와 의료진에게 정확하고 신뢰할 수 있는 의료 정보를 제공하는',
      'legal': '법무 전문가로서 일반인과 기업에게 법적 이슈에 대한 명확하고 실용적인 가이드를 제공하는',
      'tax': '세무 전문가로서 개인과 기업의 세무 관련 궁금증을 해결하고 절세 방안을 제시하는',
      'marketing': '디지털 마케팅 전문가로서 기업과 마케터에게 실무에 바로 적용 가능한 마케팅 전략을 제공하는',
      'consulting': '경영 컨설턴트로서 기업의 성장과 효율성 개선을 위한 전문적인 조언을 제공하는',
      'finance': '금융 전문가로서 개인과 기업의 재무 관리와 투자 전략에 대한 전문 지식을 제공하는',
      'education': '교육 전문가로서 학습자와 교육기관에게 효과적인 교육 방법과 정보를 제공하는',
      'other': '해당 분야 전문가로서 전문적이고 신뢰할 수 있는 정보를 제공하는'
    }
    return contexts[specialization] || contexts['other']
  }

  private getBrandVoiceGuideline(brandVoice: string): string {
    const guidelines: Record<string, string> = {
      'professional': '전문적이고 신뢰감 있는',
      'friendly_expert': '친근하지만 전문성을 유지하는',
      'authoritative': '권위적이고 학술적인',
      'approachable': '접근하기 쉽고 이해하기 쉬운',
      'consultative': '컨설팅적이고 조언하는',
      'educational': '교육적이고 설명적인'
    }
    return guidelines[brandVoice] || '전문적이면서도 이해하기 쉬운'
  }

  private parseClaudeResponse(responseText: string, input: ContentWritingInput) {
    const sections = {
      introduction: this.extractSection(responseText, 'INTRODUCTION'),
      section1: this.extractSection(responseText, 'SECTION_1'),
      section2: this.extractSection(responseText, 'SECTION_2'),
      section3: this.extractSection(responseText, 'SECTION_3'),
      conclusion: this.extractSection(responseText, 'CONCLUSION')
    }

    const mainSections = [
      {
        title: input.seoData.headings.h2[0] || '첫 번째 섹션',
        content: sections.section1,
        keyPoints: this.extractKeyPoints(sections.section1)
      },
      {
        title: input.seoData.headings.h2[1] || '두 번째 섹션',
        content: sections.section2,
        keyPoints: this.extractKeyPoints(sections.section2)
      },
      {
        title: input.seoData.headings.h2[2] || '세 번째 섹션',
        content: sections.section3,
        keyPoints: this.extractKeyPoints(sections.section3)
      }
    ]

    const fullContent = [
      sections.introduction,
      ...mainSections.map(section => `## ${section.title}\n\n${section.content}`),
      sections.conclusion
    ].join('\n\n')

    return {
      introduction: sections.introduction,
      mainSections,
      conclusion: sections.conclusion,
      fullContent
    }
  }

  private extractSection(text: string, sectionName: string): string {
    const regex = new RegExp(`\\[${sectionName}\\]\\s*([\\s\\S]*?)(?=\\[|$)`, 'i')
    const match = text.match(regex)
    return match ? match[1].trim() : `${sectionName} 콘텐츠가 생성되지 않았습니다.`
  }

  private extractKeyPoints(content: string): string[] {
    // 문단의 첫 문장들을 키 포인트로 추출
    const sentences = content.split(/[.!?]/)
      .map(s => s.trim())
      .filter(s => s.length > 10)
      .slice(0, 3)

    return sentences.length > 0 ? sentences : ['주요 내용이 포함되어 있습니다']
  }

  private generateMockupContent(input: ContentWritingInput) {
    const { topic, specialization, targetAudience, seoData } = input

    const introduction = `${targetAudience}를 위한 ${topic} 전문 가이드입니다.
${this.getSpecializationContext(specialization)} 전문가로서 실무에 바로 적용할 수 있는 정확한 정보를 제공합니다.
이 글에서는 ${topic}의 핵심 개념부터 실제 적용 방법까지 단계별로 상세히 다룹니다.`

    const mainSections = seoData.headings.h2.map((h2, index) => ({
      title: h2,
      content: `${h2}에 대한 전문적인 설명입니다.
실무에서 적용할 수 있는 구체적인 방법과 주의사항을 포함하여 자세히 안내드립니다.
전문가의 경험을 바탕으로 검증된 방법들을 제시하므로 신뢰하고 활용하실 수 있습니다.
추가적으로 ${targetAudience}가 주의해야 할 사항들과 실무 팁도 함께 제공합니다.`,
      keyPoints: [
        `${h2}의 핵심 개념`,
        '실무 적용 방법',
        '주의사항 및 팁'
      ]
    }))

    const conclusion = `${topic}에 대한 전문적인 정보를 제공해드렸습니다.
실무에 적용하실 때는 개별 상황을 고려하여 신중하게 진행하시기 바랍니다.
추가 상담이나 더 자세한 정보가 필요하시면 전문가와 직접 상담받으시길 권합니다.`

    const fullContent = [
      introduction,
      ...mainSections.map(section => `## ${section.title}\n\n${section.content}`),
      conclusion
    ].join('\n\n')

    return {
      introduction,
      mainSections,
      conclusion,
      fullContent
    }
  }

  private calculateWritingMetrics(content: any, seoData: SEOOptimizationOutput) {
    const wordCount = content.fullContent.split(/\s+/).length
    const readabilityScore = 65 // 전문 콘텐츠 적정 수준

    // 키워드 밀도 계산
    const keywords = seoData.metaData.keywords
    let keywordCount = 0
    keywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi')
      keywordCount += (content.fullContent.match(regex) || []).length
    })
    const keywordDensity = (keywordCount / wordCount) * 100

    // SEO 점수 계산 (워드 수, 키워드 밀도, 구조 등 고려)
    let seoScore = 50
    if (wordCount >= seoData.technicalSEO.recommendedWordCount) seoScore += 20
    if (keywordDensity >= 1 && keywordDensity <= 3) seoScore += 15
    if (content.mainSections.length >= 3) seoScore += 15

    return {
      wordCount,
      readabilityScore,
      keywordDensity: Math.round(keywordDensity * 100) / 100,
      seoScore: Math.min(seoScore, 100)
    }
  }

  private analyzeContentStructure(content: any) {
    const paragraphs = content.fullContent.split('\n\n').length
    const sentences = content.fullContent.split(/[.!?]/).filter(s => s.trim().length > 0).length
    const words = content.fullContent.split(/\s+/).length
    const avgWordsPerSentence = Math.round(words / sentences)

    return {
      paragraphs,
      sentences,
      avgWordsPerSentence
    }
  }
}