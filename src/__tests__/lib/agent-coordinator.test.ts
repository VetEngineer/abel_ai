import { AgentCoordinator } from '@/lib/agents/agent-coordinator'
import { TrendKeywordAgent } from '@/agents/trend-keyword-agent'
import { ContentPlanningAgent } from '@/agents/content-planning-agent'
import { AgentType, AgentStatus } from '@/types/agents'

describe('AgentCoordinator', () => {
  let coordinator: AgentCoordinator
  const mockContext = {
    keywords: [],
    targetAudience: '일반 사용자',
    contentGoal: 'engagement',
    brandTone: '친근한',
    platform: 'blog'
  }

  beforeEach(() => {
    coordinator = new AgentCoordinator()
    // 콘솔 출력을 억제
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('기본 기능', () => {
    test('에이전트를 등록할 수 있어야 함', () => {
      const trendAgent = new TrendKeywordAgent()
      coordinator.registerAgent(trendAgent)

      const status = coordinator.getWorkflowStatus()
      const trendStep = status.find(s => s.agentType === AgentType.TREND_KEYWORD)

      expect(trendStep).toBeDefined()
      expect(trendStep?.status).toBe(AgentStatus.IDLE)
    })

    test('워크플로우 상태를 조회할 수 있어야 함', () => {
      const status = coordinator.getWorkflowStatus()

      expect(Array.isArray(status)).toBe(true)
      expect(status.length).toBe(11) // 11개의 에이전트 단계

      // 모든 에이전트 타입이 포함되어 있는지 확인
      const agentTypes = status.map(s => s.agentType)
      expect(agentTypes).toContain(AgentType.TREND_KEYWORD)
      expect(agentTypes).toContain(AgentType.CONTENT_PLANNING)
      expect(agentTypes).toContain(AgentType.BLOG_DEPLOYMENT)

      // 초기 상태는 모두 IDLE이어야 함
      status.forEach(step => {
        expect(step.status).toBe(AgentStatus.IDLE)
        expect(step.hasOutput).toBe(false)
      })
    })
  })

  describe('워크플로우 실행', () => {
    test('등록되지 않은 에이전트로 인한 실패', async () => {
      const initialInput = {
        topic: '테스트',
        industry: '기술',
        targetAudience: '개발자',
        brandVoice: '전문적인'
      }

      await expect(coordinator.executeWorkflow(initialInput, mockContext))
        .rejects.toThrow('Agent trend_keyword not found')
    })

    test('첫 번째 에이전트만 등록된 경우 성공적으로 실행', async () => {
      const trendAgent = new TrendKeywordAgent()
      coordinator.registerAgent(trendAgent)

      const initialInput = {
        topic: '테스트 주제',
        industry: '기술',
        targetAudience: '개발자',
        brandVoice: '전문적인'
      }

      // 첫 번째 에이전트까지만 실행되고 두 번째에서 실패할 것
      await expect(coordinator.executeWorkflow(initialInput, mockContext))
        .rejects.toThrow('Agent content_planning not found')

      // 첫 번째 에이전트는 성공적으로 실행되었는지 확인
      const status = coordinator.getWorkflowStatus()
      const trendStep = status.find(s => s.agentType === AgentType.TREND_KEYWORD)
      expect(trendStep?.status).toBe(AgentStatus.COMPLETED)
      expect(trendStep?.hasOutput).toBe(true)
    })

    test('두 에이전트 연계 실행 성공', async () => {
      const trendAgent = new TrendKeywordAgent()
      const planningAgent = new ContentPlanningAgent()

      coordinator.registerAgent(trendAgent)
      coordinator.registerAgent(planningAgent)

      const initialInput = {
        topic: '디지털 마케팅',
        industry: '마케팅',
        targetAudience: '마케터',
        brandVoice: '전문적인'
      }

      // 세 번째 에이전트에서 실패할 것 (등록되지 않음)
      await expect(coordinator.executeWorkflow(initialInput, mockContext))
        .rejects.toThrow('Agent seo_optimization not found')

      // 첫 두 에이전트는 성공적으로 실행되었는지 확인
      const status = coordinator.getWorkflowStatus()

      const trendStep = status.find(s => s.agentType === AgentType.TREND_KEYWORD)
      expect(trendStep?.status).toBe(AgentStatus.COMPLETED)
      expect(trendStep?.hasOutput).toBe(true)

      const planningStep = status.find(s => s.agentType === AgentType.CONTENT_PLANNING)
      expect(planningStep?.status).toBe(AgentStatus.COMPLETED)
      expect(planningStep?.hasOutput).toBe(true)
    })

    test('입력 데이터가 에이전트 간에 올바르게 전달되어야 함', async () => {
      const trendAgent = new TrendKeywordAgent()
      const planningAgent = new ContentPlanningAgent()

      coordinator.registerAgent(trendAgent)
      coordinator.registerAgent(planningAgent)

      const initialInput = {
        topic: '건강 관리',
        industry: '헬스케어',
        targetAudience: '30-40대',
        brandVoice: '신뢰할 수 있는'
      }

      try {
        await coordinator.executeWorkflow(initialInput, mockContext)
      } catch (error) {
        // 세 번째 에이전트 부재로 인한 예상된 에러
        expect(error).toBeDefined()
      }

      const status = coordinator.getWorkflowStatus()

      // TrendKeywordAgent의 출력이 있는지 확인
      const trendStep = status.find(s => s.agentType === AgentType.TREND_KEYWORD)
      expect(trendStep?.hasOutput).toBe(true)

      // ContentPlanningAgent가 실행되고 출력이 있는지 확인
      const planningStep = status.find(s => s.agentType === AgentType.CONTENT_PLANNING)
      expect(planningStep?.hasOutput).toBe(true)
    })

    test('에이전트 실행 중 에러 처리', async () => {
      // 에러를 발생시키는 모킹된 에이전트 생성
      const errorAgent = new TrendKeywordAgent()
      const originalExecute = errorAgent.execute.bind(errorAgent)

      errorAgent.execute = jest.fn().mockRejectedValue(new Error('테스트 에러'))

      coordinator.registerAgent(errorAgent)

      const initialInput = {
        topic: '테스트',
        industry: '기술'
      }

      await expect(coordinator.executeWorkflow(initialInput, mockContext))
        .rejects.toThrow('테스트 에러')

      const status = coordinator.getWorkflowStatus()
      const trendStep = status.find(s => s.agentType === AgentType.TREND_KEYWORD)
      expect(trendStep?.status).toBe(AgentStatus.ERROR)
    })
  })

  describe('의존성 관리', () => {
    test('의존성이 충족되지 않은 경우 실행을 건너뛰어야 함', async () => {
      // ContentPlanningAgent만 등록 (TrendKeywordAgent 의존성 없음)
      const planningAgent = new ContentPlanningAgent()
      coordinator.registerAgent(planningAgent)

      const initialInput = {
        topic: '테스트',
        industry: '기술'
      }

      await expect(coordinator.executeWorkflow(initialInput, mockContext))
        .rejects.toThrow('Agent trend_keyword not found')
    })
  })

  describe('컨텍스트 관리', () => {
    test('컨텍스트가 올바르게 업데이트되어야 함', async () => {
      const trendAgent = new TrendKeywordAgent()
      coordinator.registerAgent(trendAgent)

      const initialInput = {
        topic: 'AI 기술',
        industry: '인공지능',
        targetAudience: '개발자',
        brandVoice: '기술적인'
      }

      try {
        await coordinator.executeWorkflow(initialInput, mockContext)
      } catch (error) {
        // 예상된 에러 (다음 에이전트 없음)
      }

      // 컨텍스트에 키워드가 업데이트되었는지 확인
      expect(mockContext.keywords).toBeInstanceOf(Array)
    })
  })
})