// 에이전트 타입 정의
export enum AgentType {
  TREND_KEYWORD = 'trend_keyword',
  CONTENT_PLANNING = 'content_planning',
  SEO_OPTIMIZATION = 'seo_optimization',
  COPYWRITING = 'copywriting',
  CONTENT_WRITING = 'content_writing',
  VISUAL_DESIGN = 'visual_design',
  LOCAL_SEO = 'local_seo',
  ANSWER_OPTIMIZATION = 'answer_optimization',
  MARKETING_FUNNEL = 'marketing_funnel',
  BRAND_SUPERVISION = 'brand_supervision',
  BLOG_DEPLOYMENT = 'blog_deployment'
}

// 에이전트 상태
export enum AgentStatus {
  IDLE = 'idle',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error'
}

// 에이전트 기본 인터페이스
export interface BaseAgent {
  id: string
  type: AgentType
  name: string
  description: string
  skills: string[]
  status: AgentStatus
  createdAt: string
  updatedAt: string
}

// 에이전트 실행 결과
export interface AgentResult {
  agentId: string
  agentType: AgentType
  success: boolean
  data: any
  error?: string
  executionTime: number
  tokensUsed?: number
}

// 컨텍스트 공유 데이터 (250 토큰 제한)
export interface SharedContext {
  keywords: string[]
  targetAudience: string
  contentGoal: string
  brandTone: string
  platform: string
}

// 워크플로우 단계
export interface WorkflowStep {
  agentType: AgentType
  input: any
  output?: any
  status: AgentStatus
  dependencies: AgentType[]
}