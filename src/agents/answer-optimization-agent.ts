import { BaseAgent } from '@/lib/agents/base-agent'
import { AgentType, AgentResult, SharedContext } from '@/types/agents'
import { ContentWritingOutput } from './content-writing-agent'

export interface AnswerOptimizationInput {
  contentData: ContentWritingOutput
  specialization: string
  targetAudience: string
  topic: string
}

export interface AnswerOptimizationOutput {
  faqSections: Array<{
    question: string
    answer: string
    category: string
    keywords: string[]
  }>
  featuredSnippets: {
    howToStructure: {
      title: string
      steps: Array<{
        stepNumber: number
        instruction: string
        details: string
      }>
    }
    definitionBoxes: Array<{
      term: string
      definition: string
      context: string
    }>
    listOptimization: Array<{
      title: string
      items: string[]
      type: 'numbered' | 'bulleted'
    }>
  }
  voiceSearchOptimization: {
    conversationalQueries: string[]
    naturalLanguageAnswers: string[]
    localQuestions: string[]
  }
  knowledgeGraph: {
    entityMarkup: Record<string, any>
    relationshipData: Array<{
      subject: string
      predicate: string
      object: string
    }>
    factualStatements: string[]
  }
}

export class AnswerOptimizationAgent extends BaseAgent {
  constructor() {
    super(
      AgentType.ANSWER_OPTIMIZATION,
      '답변 최적화 에이전트',
      'FAQ 및 전문 지식 Q&A를 최적화하여 검색 결과 상위 노출을 돕는 전문 에이전트',
      ['FAQ 최적화', '피처드 스니펫', '음성 검색', '지식 그래프', '구조화된 답변']
    )
  }

  async execute(input: any, context: SharedContext): Promise<AgentResult> {
    const startTime = Date.now()
    this.setStatus('processing' as any)

    try {
      // 입력 데이터 정규화 처리
      const normalizedInput = {
        contentData: input?.content ? input : input?.contentData || {},
        specialization: input?.specialization || context?.platform || 'other',
        targetAudience: input?.targetAudience || context?.targetAudience || '일반 사용자',
        topic: input?.topic || '전문 서비스'
      }

      const faqSections = this.generateFAQSections(normalizedInput)
      const featuredSnippets = this.optimizeForFeaturedSnippets(normalizedInput)
      const voiceSearchOptimization = this.optimizeForVoiceSearch(normalizedInput)
      const knowledgeGraph = this.prepareKnowledgeGraph(normalizedInput)

      const output: AnswerOptimizationOutput = {
        faqSections,
        featuredSnippets,
        voiceSearchOptimization,
        knowledgeGraph
      }

      const executionTime = Date.now() - startTime
      const tokensUsed = this.calculateTokens(JSON.stringify(output))

      return this.createSuccessResult(output, executionTime, tokensUsed)
    } catch (error) {
      const executionTime = Date.now() - startTime
      return this.handleError(error as Error, executionTime)
    }
  }

  private generateFAQSections(input: AnswerOptimizationInput) {
    const { specialization, targetAudience, topic, contentData } = input

    const commonQuestions = this.getCommonQuestions(specialization, topic)
    const professionalQuestions = this.getProfessionalQuestions(specialization)
    const processQuestions = this.getProcessQuestions(specialization)

    const allQuestions = [...commonQuestions, ...professionalQuestions, ...processQuestions]

    return allQuestions.map(q => ({
      question: q.question,
      answer: this.generateAnswer(q, specialization, targetAudience),
      category: q.category,
      keywords: q.keywords
    }))
  }

  private getCommonQuestions(specialization: string, topic: string) {
    const questions: Record<string, Array<{question: string, category: string, keywords: string[]}>> = {
      'medical': [
        {
          question: `${topic}은 무엇인가요?`,
          category: '기본정보',
          keywords: [topic, '정의', '의미', '설명']
        },
        {
          question: `${topic}의 증상은 어떤 것들이 있나요?`,
          category: '증상',
          keywords: [topic, '증상', '징후', '신호']
        },
        {
          question: `${topic} 치료 방법은 무엇인가요?`,
          category: '치료',
          keywords: [topic, '치료', '방법', '처방']
        },
        {
          question: `${topic} 예방법이 있나요?`,
          category: '예방',
          keywords: [topic, '예방', '관리', '주의사항']
        }
      ],
      'legal': [
        {
          question: `${topic}에 대한 법적 근거는 무엇인가요?`,
          category: '법률근거',
          keywords: [topic, '법률', '근거', '조항']
        },
        {
          question: `${topic} 관련 절차는 어떻게 되나요?`,
          category: '절차',
          keywords: [topic, '절차', '과정', '단계']
        },
        {
          question: `${topic} 비용은 얼마나 드나요?`,
          category: '비용',
          keywords: [topic, '비용', '수수료', '가격']
        },
        {
          question: `${topic} 준비서류는 무엇인가요?`,
          category: '서류',
          keywords: [topic, '서류', '서류', '준비물']
        }
      ],
      'tax': [
        {
          question: `${topic}의 세금 혜택이 있나요?`,
          category: '세금혜택',
          keywords: [topic, '세금', '혜택', '절세']
        },
        {
          question: `${topic} 신고는 언제 해야 하나요?`,
          category: '신고시기',
          keywords: [topic, '신고', '기한', '일정']
        },
        {
          question: `${topic} 계산 방법은 어떻게 되나요?`,
          category: '계산방법',
          keywords: [topic, '계산', '산출', '방법']
        },
        {
          question: `${topic} 관련 서류는 무엇인가요?`,
          category: '필요서류',
          keywords: [topic, '서류', '준비물', '증빙']
        }
      ],
      'marketing': [
        {
          question: `${topic} 전략은 어떻게 수립하나요?`,
          category: '전략',
          keywords: [topic, '전략', '기획', '수립']
        },
        {
          question: `${topic}의 효과 측정 방법은?`,
          category: '효과측정',
          keywords: [topic, '효과', '측정', 'KPI']
        },
        {
          question: `${topic} 비용 대비 효과는?`,
          category: 'ROI',
          keywords: [topic, 'ROI', '효과', '투자']
        },
        {
          question: `${topic} 최신 트렌드는?`,
          category: '트렌드',
          keywords: [topic, '트렌드', '최신', '동향']
        }
      ]
    }

    return questions[specialization]?.slice(0, 4) || [
      {
        question: `${topic}이란 무엇인가요?`,
        category: '기본정보',
        keywords: [topic, '정의', '개념']
      }
    ]
  }

  private getProfessionalQuestions(specialization: string) {
    const questions: Record<string, Array<{question: string, category: string, keywords: string[]}>> = {
      'medical': [
        {
          question: '언제 전문의를 찾아야 하나요?',
          category: '전문진료',
          keywords: ['전문의', '진료시기', '병원']
        },
        {
          question: '검사 결과는 어떻게 해석하나요?',
          category: '검사해석',
          keywords: ['검사결과', '해석', '수치']
        }
      ],
      'legal': [
        {
          question: '변호사 선임이 꼭 필요한가요?',
          category: '변호사선임',
          keywords: ['변호사', '선임', '필요성']
        },
        {
          question: '법정 대리인이 필요한 경우는?',
          category: '법정대리',
          keywords: ['법정대리인', '대리', '필요']
        }
      ],
      'tax': [
        {
          question: '세무조사 대비 방법은?',
          category: '세무조사',
          keywords: ['세무조사', '대비', '준비']
        },
        {
          question: '세무사 상담은 언제 받아야 하나요?',
          category: '전문상담',
          keywords: ['세무사', '상담', '시기']
        }
      ],
      'marketing': [
        {
          question: '마케팅 예산 배분은 어떻게?',
          category: '예산배분',
          keywords: ['마케팅', '예산', '배분']
        },
        {
          question: '마케팅 대행사 선택 기준은?',
          category: '대행사선택',
          keywords: ['대행사', '선택', '기준']
        }
      ]
    }

    return questions[specialization] || []
  }

  private getProcessQuestions(specialization: string) {
    const questions: Record<string, Array<{question: string, category: string, keywords: string[]}>> = {
      'medical': [
        {
          question: '진료 예약은 어떻게 하나요?',
          category: '예약절차',
          keywords: ['진료예약', '예약', '절차']
        },
        {
          question: '응급상황에는 어떻게 대처하나요?',
          category: '응급처치',
          keywords: ['응급상황', '응급처치', '대처']
        }
      ],
      'legal': [
        {
          question: '법률 상담 절차는 어떻게 되나요?',
          category: '상담절차',
          keywords: ['법률상담', '상담절차', '과정']
        },
        {
          question: '소송 진행 과정은?',
          category: '소송절차',
          keywords: ['소송', '진행과정', '절차']
        }
      ],
      'tax': [
        {
          question: '세무신고 절차는 어떻게 되나요?',
          category: '신고절차',
          keywords: ['세무신고', '신고절차', '과정']
        },
        {
          question: '세무 상담은 어떻게 진행되나요?',
          category: '상담과정',
          keywords: ['세무상담', '상담과정', '절차']
        }
      ],
      'marketing': [
        {
          question: '마케팅 프로젝트 진행 과정은?',
          category: '프로젝트진행',
          keywords: ['마케팅', '프로젝트', '진행과정']
        },
        {
          question: '마케팅 성과 리포트는 언제 받나요?',
          category: '성과보고',
          keywords: ['성과리포트', '보고', '일정']
        }
      ]
    }

    return questions[specialization] || []
  }

  private generateAnswer(question: any, specialization: string, targetAudience: string): string {
    const credentialPhrase = this.getCredentialPhrase(specialization)
    const professionalTone = this.getProfessionalTone(specialization)

    return `${question.question.replace('?', '')}에 대해 ${credentialPhrase}로서 답변드리겠습니다.

${professionalTone} 이 질문은 ${targetAudience}께서 자주 궁금해하시는 내용입니다.

구체적인 답변과 실무 적용 방법을 포함하여 상세히 설명드리겠습니다. 개별적인 상황에 따라 차이가 있을 수 있으므로, 정확한 판단을 위해서는 전문가와 직접 상담받으시길 권합니다.

추가 궁금한 사항이 있으시면 언제든 문의해주세요.`
  }

  private getCredentialPhrase(specialization: string): string {
    const phrases: Record<string, string> = {
      'medical': '의료 전문가',
      'legal': '법무 전문가',
      'tax': '세무 전문가',
      'marketing': '마케팅 전문가',
      'consulting': '컨설팅 전문가',
      'finance': '금융 전문가',
      'education': '교육 전문가',
      'other': '해당 분야 전문가'
    }
    return phrases[specialization] || phrases['other']
  }

  private getProfessionalTone(specialization: string): string {
    const tones: Record<string, string> = {
      'medical': '환자의 건강과 안전을 최우선으로 고려하여',
      'legal': '법적 정확성과 실무 경험을 바탕으로',
      'tax': '세법의 정확한 해석과 절세 효과를 고려하여',
      'marketing': '시장 동향과 실무 경험을 바탕으로',
      'consulting': '데이터와 전략적 사고를 기반으로',
      'finance': '금융 시장의 안정성과 수익성을 고려하여',
      'education': '학습 효과와 교육 목표를 중심으로',
      'other': '전문적 지식과 실무 경험을 바탕으로'
    }
    return tones[specialization] || tones['other']
  }

  private optimizeForFeaturedSnippets(input: any) {
    const { topic, specialization, contentData } = input

    // How-to 구조 최적화
    const mainSections = contentData?.content?.mainSections || [
      { title: '기본 개념 이해', keyPoints: ['핵심 개념 파악'] },
      { title: '실무 적용 방법', keyPoints: ['단계별 진행'] },
      { title: '주의사항 확인', keyPoints: ['위험 요소 검토'] }
    ]

    const howToStructure = {
      title: `${topic} 단계별 가이드`,
      steps: mainSections.slice(0, 5).map((section: any, index: number) => ({
        stepNumber: index + 1,
        instruction: section.title,
        details: (section.keyPoints || ['상세 내용']).join('. ') + '.'
      }))
    }

    // 정의 박스 최적화
    const definitionBoxes = this.createDefinitionBoxes(topic, specialization)

    // 리스트 최적화
    const listOptimization = this.optimizeLists(contentData, specialization)

    return {
      howToStructure,
      definitionBoxes,
      listOptimization
    }
  }

  private createDefinitionBoxes(topic: string, specialization: string) {
    const definitions: Array<{term: string, definition: string, context: string}> = []

    // 주요 용어 정의
    definitions.push({
      term: topic,
      definition: `${topic}은 ${specialization} 분야에서 중요한 개념으로, 실무에서 자주 활용되는 전문 용어입니다.`,
      context: `${specialization} 전문가들이 실무에서 사용하는 정확한 정의`
    })

    // 관련 용어 정의
    const relatedTerms = this.getRelatedTerms(specialization)
    relatedTerms.forEach(term => {
      definitions.push({
        term,
        definition: `${term}은 ${specialization} 분야에서 ${topic}와 밀접한 관련이 있는 개념입니다.`,
        context: `${topic}를 이해하는데 필수적인 관련 용어`
      })
    })

    return definitions.slice(0, 3)
  }

  private getRelatedTerms(specialization: string): string[] {
    const terms: Record<string, string[]> = {
      'medical': ['진단', '치료', '예방', '관리'],
      'legal': ['법률', '절차', '권리', '의무'],
      'tax': ['신고', '절세', '공제', '감면'],
      'marketing': ['전략', '캠페인', 'ROI', '타겟'],
      'consulting': ['분석', '전략', '실행', '평가'],
      'finance': ['투자', '수익', '위험', '관리'],
      'education': ['학습', '교육', '평가', '개발'],
      'other': ['개념', '방법', '절차', '결과']
    }
    return terms[specialization] || terms['other']
  }

  private optimizeLists(contentData: any, specialization: string) {
    const lists: Array<{title: string, items: string[], type: 'numbered' | 'bulleted'}> = []

    const mainSections = contentData?.content?.mainSections || [
      { title: '기본 개념', keyPoints: ['핵심 내용'] },
      { title: '실무 적용', keyPoints: ['적용 방법'] },
      { title: '주의사항', keyPoints: ['위험 요소'] }
    ]

    // 주요 포인트 리스트
    lists.push({
      title: '핵심 포인트',
      items: mainSections.map((section: any) =>
        (section.keyPoints && section.keyPoints[0]) || section.title
      ),
      type: 'bulleted'
    })

    // 단계별 리스트
    lists.push({
      title: '단계별 진행 과정',
      items: mainSections.map((section: any, index: number) =>
        `${index + 1}단계: ${section.title}`
      ),
      type: 'numbered'
    })

    // 전문가 체크리스트
    lists.push({
      title: `${specialization} 전문가 체크리스트`,
      items: [
        '전문 지식 확인',
        '관련 법규 검토',
        '실무 적용 가능성 평가',
        '위험 요소 분석',
        '최종 검증'
      ],
      type: 'numbered'
    })

    return lists
  }

  private optimizeForVoiceSearch(input: AnswerOptimizationInput) {
    const { topic, specialization, targetAudience } = input

    const conversationalQueries = [
      `${topic}에 대해 알려줘`,
      `${topic} 어떻게 하는지 알고 싶어`,
      `${topic} 관련해서 전문가 조언 좀`,
      `${topic} 때문에 걱정인데 어떡하지`,
      `${specialization} 전문가한테 ${topic} 상담받고 싶어`
    ]

    const naturalLanguageAnswers = conversationalQueries.map(query =>
      `${query}에 대한 답변: ${specialization} 전문가로서 ${targetAudience}께 ${topic}에 대해 자세히 설명드리겠습니다.`
    )

    const localQuestions = [
      `우리 동네 ${specialization} 전문가 찾고 있어`,
      `근처에 ${topic} 상담받을 곳 있나`,
      `지역에서 믿을만한 ${specialization} 추천해줘`,
      `우리 지역 ${topic} 전문가 어디가 좋아`
    ]

    return {
      conversationalQueries,
      naturalLanguageAnswers,
      localQuestions
    }
  }

  private prepareKnowledgeGraph(input: AnswerOptimizationInput) {
    const { topic, specialization, targetAudience } = input

    // 엔티티 마크업
    const entityMarkup = {
      '@context': 'https://schema.org',
      '@type': this.getSchemaType(specialization),
      'name': topic,
      'description': `${specialization} 분야의 ${topic}에 대한 전문 정보`,
      'provider': {
        '@type': 'Organization',
        'name': `${specialization} 전문가`
      }
    }

    // 관계 데이터
    const relationshipData = [
      {
        subject: topic,
        predicate: 'isPartOf',
        object: specialization
      },
      {
        subject: topic,
        predicate: 'targetAudience',
        object: targetAudience
      },
      {
        subject: specialization,
        predicate: 'provides',
        object: `${topic} 서비스`
      }
    ]

    // 사실적 진술
    const factualStatements = [
      `${topic}은 ${specialization} 분야의 중요한 개념입니다`,
      `${targetAudience}에게 ${topic}은 필수적인 정보입니다`,
      `${specialization} 전문가는 ${topic}에 대한 정확한 조언을 제공합니다`,
      `${topic} 관련 상담은 전문가와 함께 하는 것이 안전합니다`
    ]

    return {
      entityMarkup,
      relationshipData,
      factualStatements
    }
  }

  private getSchemaType(specialization: string): string {
    const types: Record<string, string> = {
      'medical': 'MedicalWebPage',
      'legal': 'LegalService',
      'tax': 'FinancialService',
      'marketing': 'ProfessionalService',
      'consulting': 'ProfessionalService',
      'finance': 'FinancialService',
      'education': 'EducationalOrganization',
      'other': 'Service'
    }
    return types[specialization] || 'Article'
  }
}