import { AgentType, AgentStatus, AgentResult, SharedContext } from '@/types/agents'

export abstract class BaseAgent {
  protected id: string
  protected type: AgentType
  protected name: string
  protected description: string
  protected skills: string[]
  protected status: AgentStatus = AgentStatus.IDLE

  constructor(
    type: AgentType,
    name: string,
    description: string,
    skills: string[]
  ) {
    this.id = `${type}_${Date.now()}`
    this.type = type
    this.name = name
    this.description = description
    this.skills = skills
  }

  // 추상 메서드 - 각 에이전트가 구현해야 함
  abstract execute(input: any, context: SharedContext): Promise<AgentResult>

  // 상태 관리
  protected setStatus(status: AgentStatus): void {
    this.status = status
  }

  public getStatus(): AgentStatus {
    return this.status
  }

  public getInfo() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      description: this.description,
      skills: this.skills,
      status: this.status
    }
  }

  // 토큰 사용량 계산 (대략적)
  protected calculateTokens(text: string): number {
    return Math.ceil(text.length / 4) // 대략적인 토큰 계산
  }

  // 에러 처리
  protected handleError(error: Error, executionTime: number): AgentResult {
    this.setStatus(AgentStatus.ERROR)
    return {
      agentId: this.id,
      agentType: this.type,
      success: false,
      data: null,
      error: error.message,
      executionTime
    }
  }

  // 성공 결과 반환
  protected createSuccessResult(data: any, executionTime: number, tokensUsed?: number): AgentResult {
    this.setStatus(AgentStatus.COMPLETED)
    return {
      agentId: this.id,
      agentType: this.type,
      success: true,
      data,
      executionTime,
      tokensUsed
    }
  }
}