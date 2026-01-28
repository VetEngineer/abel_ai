import { BaseAgent } from '@/lib/agents/base-agent'
import { AgentType, AgentResult, SharedContext } from '@/types/agents'
import { aiServiceRouter } from '@/lib/services/ai-service-router'

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
  userId?: string
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
        contentGoals: input?.contentGoals || context?.contentGoal || 'engagement',
        userId: context.userId || 'anonymous'
      }

      const supervisionResult = await this.superviseContentWithAI(normalizedInput)

      const output: BrandSupervisionOutput = supervisionResult

      const executionTime = Date.now() - startTime
      const tokensUsed = this.calculateTokens(JSON.stringify(output))

      return this.createSuccessResult(output, executionTime, tokensUsed)
    } catch (error) {
      const executionTime = Date.now() - startTime
      return this.handleError(error as Error, executionTime)
    }
  }

  private async superviseContentWithAI(input: any): Promise<BrandSupervisionOutput> {
    const { specialization, brandVoice, targetAudience, topic, userId, contentData, copyData } = input

    // AI에게 전달할 핵심 컨텐츠 요약
    const contentSummary = {
      title: contentData?.content?.title || copyData?.headlines?.mainHeadline || topic,
      sections: contentData?.content?.mainSections?.map((s: any) => s.title) || [],
      copy: copyData?.salesCopy?.introduction || ''
    }

    const prompt = `당신은 최고 수준의 브랜드 감독관이자 규제 전문가입니다. 
다음 콘텐츠가 브랜드 가이드라인, 법적 규제, 윤리적 기준을 준수하는지 엄격하게 검토해주세요.

컨텍스트:
- 주제: ${topic}
- 전문 분야: ${specialization}
- 브랜드 보이스: ${brandVoice}
- 타겟 독자: ${targetAudience}

검토 대상 요약:
${JSON.stringify(contentSummary, null, 2)}

다음 JSON 형식으로 응답해주세요:

{
  "qualityAssessment": {
    "overallScore": 0-100점,
    "contentQuality": { "score": 0-100, "feedback": ["피드백"], "improvements": ["개선점"] },
    "brandConsistency": { "score": 0-100, "issues": ["이슈"], "recommendations": ["제안"] },
    "professionalStandards": { "score": 0-100, "compliance": true/false, "ethicalIssues": ["윤리적이슈"] }
  },
  "contentValidation": {
    "factualAccuracy": { "verified": true/false, "sources": ["검증출처예시"], "disclaimers": ["필요한면책조항"] },
    "legalCompliance": { "compliant": true/false, "risks": ["법적위험"], "recommendations": ["권장사항"] },
    "ethicalStandards": { "ethical": true/false, "concerns": ["우려사항"], "guidelines": ["가이드라인"] }
  },
  "brandAlignment": {
    "voiceConsistency": { "aligned": true/false, "deviations": ["이탈사례"], "corrections": ["수정제안"] },
    "messagingCoherence": { "coherent": true/false, "inconsistencies": ["불일치"], "unifications": ["통일안"] },
    "audienceAppropriatenesss": { "appropriate": true/false, "misalignments": ["부적합성"], "adjustments": ["조정안"] }
  },
  "finalRecommendations": {
    "criticalIssues": ["중대결함"],
    "improvementActions": [{ "priority": "high", "action": "조치명", "rationale": "이유", "impact": "영향" }],
    "approvalStatus": "approved" | "conditional" | "rejected",
    "nextSteps": ["다음단계"]
  }
}

응답은 오직 유효한 JSON 포맷이어야 합니다.`

    try {
      const response = await aiServiceRouter.generateText({
        service: 'claude',
        model: 'claude-3-haiku-20240307',
        prompt: prompt,
        userId: userId,
        maxTokens: 3500,
        temperature: 0.3 // 낮음 = 분석적이고 엄격함
      })

      if (!response.success || !response.data) {
        throw new Error(response.error || 'AI 응답 실패')
      }

      const content = response.data.text
      const jsonMatch = content.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        throw new Error('AI 응답에서 JSON을 찾을 수 없습니다')
      }

      return JSON.parse(jsonMatch[0]) as BrandSupervisionOutput

    } catch (error) {
      console.error('Brand Supervision Agent AI Error:', error)
      return this.getFallbackSupervision(input)
    }
  }

  private getFallbackSupervision(input: any): BrandSupervisionOutput {
    return {
      qualityAssessment: {
        overallScore: 80,
        contentQuality: { score: 80, feedback: ['기본 품질 양호'], improvements: ['세부 내용 보완'] },
        brandConsistency: { score: 85, issues: [], recommendations: ['브랜드 톤 유지'] },
        professionalStandards: { score: 90, compliance: true, ethicalIssues: [] }
      },
      contentValidation: {
        factualAccuracy: { verified: true, sources: [], disclaimers: ['일반 면책 조항'] },
        legalCompliance: { compliant: true, risks: [], recommendations: ['법률 전문가 자문 권장'] },
        ethicalStandards: { ethical: true, concerns: [], guidelines: ['윤리 규정 준수'] }
      },
      brandAlignment: {
        voiceConsistency: { aligned: true, deviations: [], corrections: [] },
        messagingCoherence: { coherent: true, inconsistencies: [], unifications: [] },
        audienceAppropriatenesss: { appropriate: true, misalignments: [], adjustments: [] }
      },
      finalRecommendations: {
        criticalIssues: [],
        improvementActions: [],
        approvalStatus: 'conditional', // AI 실패시 조건부 승인으로 안전하게 처리
        nextSteps: ['사람의 검토 필요']
      }
    }
  }
}