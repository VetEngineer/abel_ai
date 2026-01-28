import { AgentType, AgentStatus, SharedContext, WorkflowStep } from '@/types/agents'
import { BaseAgent } from './base-agent'

export class AgentCoordinator {
  private agents: Map<AgentType, BaseAgent> = new Map()
  private workflow: WorkflowStep[] = []
  private currentStep = 0

  constructor() {
    this.initializeWorkflow()
  }

  // 에이전트 등록
  registerAgent(agent: BaseAgent): void {
    this.agents.set(agent.getInfo().type, agent)
  }

  // 워크플로우 초기화
  private initializeWorkflow(): void {
    this.workflow = [
      {
        agentType: AgentType.TREND_KEYWORD,
        input: null,
        status: AgentStatus.IDLE,
        dependencies: []
      },
      {
        agentType: AgentType.CONTENT_PLANNING,
        input: null,
        status: AgentStatus.IDLE,
        dependencies: [AgentType.TREND_KEYWORD]
      },
      {
        agentType: AgentType.SEO_OPTIMIZATION,
        input: null,
        status: AgentStatus.IDLE,
        dependencies: [AgentType.CONTENT_PLANNING]
      },
      {
        agentType: AgentType.COPYWRITING,
        input: null,
        status: AgentStatus.IDLE,
        dependencies: [AgentType.SEO_OPTIMIZATION]
      },
      {
        agentType: AgentType.CONTENT_WRITING,
        input: null,
        status: AgentStatus.IDLE,
        dependencies: [AgentType.COPYWRITING]
      },
      {
        agentType: AgentType.VISUAL_DESIGN,
        input: null,
        status: AgentStatus.IDLE,
        dependencies: [AgentType.CONTENT_WRITING]
      },
      {
        agentType: AgentType.LOCAL_SEO,
        input: null,
        status: AgentStatus.IDLE,
        dependencies: [AgentType.VISUAL_DESIGN]
      },
      {
        agentType: AgentType.ANSWER_OPTIMIZATION,
        input: null,
        status: AgentStatus.IDLE,
        dependencies: [AgentType.LOCAL_SEO]
      },
      {
        agentType: AgentType.MARKETING_FUNNEL,
        input: null,
        status: AgentStatus.IDLE,
        dependencies: [AgentType.ANSWER_OPTIMIZATION]
      },
      {
        agentType: AgentType.BRAND_SUPERVISION,
        input: null,
        status: AgentStatus.IDLE,
        dependencies: [AgentType.MARKETING_FUNNEL]
      },
      {
        agentType: AgentType.BLOG_DEPLOYMENT,
        input: null,
        status: AgentStatus.IDLE,
        dependencies: [AgentType.BRAND_SUPERVISION]
      }
    ]
  }

  // 전체 워크플로우 실행
  async executeWorkflow(
    initialInput: any,
    context: SharedContext,
    onStepUpdate?: (update: {
      agentType: AgentType
      status: AgentStatus
      stepIndex: number
      executionTime?: number
      tokensUsed?: number
      error?: string
    }) => void
  ): Promise<any> {
    try {
      let currentInput = initialInput
      console.log('워크플로우 시작, 초기 입력:', JSON.stringify(initialInput, null, 2))

      for (const [index, step] of this.workflow.entries()) {
        console.log(`에이전트 실행 시작: ${step.agentType}`)

        // 의존성 확인
        if (!this.areDependenciesMet(step)) {
          const error = `Dependencies not met for ${step.agentType}`
          console.error(error)
          throw new Error(error)
        }

        const agent = this.agents.get(step.agentType)
        if (!agent) {
          const error = `Agent ${step.agentType} not found`
          console.error(error)
          throw new Error(error)
        }

        // 에이전트 실행
        step.status = AgentStatus.PROCESSING
        step.input = currentInput
        onStepUpdate?.({
          agentType: step.agentType,
          status: step.status,
          stepIndex: index
        })

        try {
          const result = await agent.execute(currentInput, context)
          console.log(`에이전트 ${step.agentType} 실행 결과:`, result.success ? '성공' : '실패')

          if (!result.success) {
            step.status = AgentStatus.ERROR
            step.error = result.error
            const error = `Agent ${step.agentType} failed: ${result.error}`
            console.error(error)
            throw new Error(error)
          }

          step.status = AgentStatus.COMPLETED
          step.output = result.data
          currentInput = result.data
          onStepUpdate?.({
            agentType: step.agentType,
            status: step.status,
            stepIndex: index,
            executionTime: result.executionTime,
            tokensUsed: result.tokensUsed
          })

          // 컨텍스트 업데이트 (토큰 제한 고려)
          this.updateContext(context, result.data, step.agentType)
          console.log(`에이전트 ${step.agentType} 완료`)

        } catch (agentError) {
          step.status = AgentStatus.ERROR
          step.error = agentError instanceof Error ? agentError.message : String(agentError)
          onStepUpdate?.({
            agentType: step.agentType,
            status: step.status,
            stepIndex: index,
            error: step.error
          })
          console.error(`에이전트 ${step.agentType} 실행 중 오류:`, agentError)
          throw agentError
        }
      }

      console.log('워크플로우 완료')
      return currentInput
    } catch (error) {
      console.error('Workflow execution failed:', error)
      throw error
    }
  }

  // 의존성 확인
  private areDependenciesMet(step: WorkflowStep): boolean {
    if (step.dependencies.length === 0) return true

    return step.dependencies.every(depType => {
      const depStep = this.workflow.find(s => s.agentType === depType)
      return depStep?.status === AgentStatus.COMPLETED
    })
  }

  // 컨텍스트 업데이트 (250 토큰 제한)
  private updateContext(context: SharedContext, output: any, agentType: AgentType): void {
    switch (agentType) {
      case AgentType.TREND_KEYWORD:
        context.keywords = output.keywords?.slice(0, 10) || []
        break
      case AgentType.CONTENT_PLANNING:
        context.targetAudience = output.targetAudience || context.targetAudience
        context.contentGoal = output.contentGoal || context.contentGoal
        context.platform = output.specialization || context.platform
        break
      case AgentType.SEO_OPTIMIZATION:
        // SEO 에이전트는 컨텍스트에 추가 정보 제공하지 않음 (크기 제한)
        break
      case AgentType.COPYWRITING:
        // 카피라이팅은 컨텍스트에 브랜드 톤 정보 제공 가능하나 크기 제한으로 생략
        break
      case AgentType.CONTENT_WRITING:
        // 콘텐츠는 너무 클 수 있어 컨텍스트에 추가하지 않음
        break
      case AgentType.VISUAL_DESIGN:
        // 비주얼 정보는 컨텍스트에 추가하지 않음
        break
      case AgentType.LOCAL_SEO:
        // 로컬 SEO 정보는 컨텍스트에 추가하지 않음
        break
      case AgentType.ANSWER_OPTIMIZATION:
        // FAQ 정보는 컨텍스트에 추가하지 않음
        break
      case AgentType.MARKETING_FUNNEL:
        // 마케팅 퍼널 정보는 컨텍스트에 추가하지 않음
        break
      case AgentType.BRAND_SUPERVISION:
        context.brandTone = output.brandAlignment?.voiceConsistency?.aligned ? context.brandTone : '검토필요'
        break
      case AgentType.BLOG_DEPLOYMENT:
        // 배포 정보는 컨텍스트에 추가하지 않음
        break
    }

    // 컨텍스트 크기 제한 (대략 250 토큰)
    const contextSize = JSON.stringify(context).length
    if (contextSize > 1000) { // 대략적인 토큰 제한
      // 우선순위에 따라 컨텍스트 축소
      context.keywords = context.keywords.slice(0, 5)
    }
  }

  // 워크플로우 상태 조회
  getWorkflowStatus() {
    return this.workflow.map(step => ({
      agentType: step.agentType,
      status: step.status,
      hasOutput: !!step.output
    }))
  }

  getWorkflowSteps() {
    return this.workflow.map(step => ({
      agentType: step.agentType,
      status: step.status,
      hasOutput: !!step.output,
      output: step.output,
      error: step.error
    }))
  }
}
