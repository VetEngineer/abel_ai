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
        dependencies: [AgentType.CONTENT_WRITING]
      },
      {
        agentType: AgentType.ANSWER_OPTIMIZATION,
        input: null,
        status: AgentStatus.IDLE,
        dependencies: [AgentType.CONTENT_WRITING]
      },
      {
        agentType: AgentType.MARKETING_FUNNEL,
        input: null,
        status: AgentStatus.IDLE,
        dependencies: [AgentType.CONTENT_WRITING]
      },
      {
        agentType: AgentType.BRAND_SUPERVISION,
        input: null,
        status: AgentStatus.IDLE,
        dependencies: [AgentType.CONTENT_WRITING, AgentType.VISUAL_DESIGN]
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
  async executeWorkflow(initialInput: any, context: SharedContext): Promise<any> {
    try {
      let currentInput = initialInput

      for (const step of this.workflow) {
        // 의존성 확인
        if (!this.areDependenciesMet(step)) {
          throw new Error(`Dependencies not met for ${step.agentType}`)
        }

        const agent = this.agents.get(step.agentType)
        if (!agent) {
          throw new Error(`Agent ${step.agentType} not found`)
        }

        // 에이전트 실행
        step.status = AgentStatus.PROCESSING
        step.input = currentInput

        const result = await agent.execute(currentInput, context)

        if (!result.success) {
          step.status = AgentStatus.ERROR
          throw new Error(`Agent ${step.agentType} failed: ${result.error}`)
        }

        step.status = AgentStatus.COMPLETED
        step.output = result.data
        currentInput = result.data

        // 컨텍스트 업데이트 (토큰 제한 고려)
        this.updateContext(context, result.data, step.agentType)
      }

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
        break
      case AgentType.BRAND_SUPERVISION:
        context.brandTone = output.brandTone || context.brandTone
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
}