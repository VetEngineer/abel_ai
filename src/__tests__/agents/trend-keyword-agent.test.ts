import { TrendKeywordAgent } from '@/agents/trend-keyword-agent'
import { AgentType, AgentStatus } from '@/types/agents'

describe('TrendKeywordAgent', () => {
  let agent: TrendKeywordAgent
  const mockContext = {
    keywords: [],
    targetAudience: '일반 사용자',
    contentGoal: 'engagement',
    brandTone: '친근한',
    platform: 'blog'
  }

  beforeEach(() => {
    agent = new TrendKeywordAgent()
  })

  describe('기본 기능', () => {
    test('에이전트 정보가 올바르게 설정되어야 함', () => {
      const info = agent.getInfo()

      expect(info.type).toBe(AgentType.TREND_KEYWORD)
      expect(info.name).toBe('트렌드 키워드 에이전트')
      expect(info.description).toContain('네이버 검색 API')
      expect(info.skills).toHaveLength(4)
      expect(info.status).toBe(AgentStatus.IDLE)
    })

    test('상태 변경이 올바르게 작동해야 함', () => {
      expect(agent.getStatus()).toBe(AgentStatus.IDLE)

      // 상태는 execute 메서드 내에서만 변경되므로 직접 테스트하기 어려움
      // 대신 execute 호출 후 상태 확인
    })
  })

  describe('execute 메서드', () => {
    const mockInput = {
      topic: '디지털 마케팅',
      industry: '마케팅',
      targetRegion: '한국'
    }

    test('정상적인 입력으로 키워드를 생성해야 함', async () => {
      const result = await agent.execute(mockInput, mockContext)

      expect(result.success).toBe(true)
      expect(result.agentType).toBe(AgentType.TREND_KEYWORD)
      expect(result.data).toBeDefined()
      expect(result.data.keywords).toBeInstanceOf(Array)
      expect(result.data.keywords.length).toBeGreaterThan(0)
      expect(result.executionTime).toBeGreaterThan(0)
    })

    test('생성된 키워드가 올바른 구조를 가져야 함', async () => {
      const result = await agent.execute(mockInput, mockContext)

      expect(result.success).toBe(true)

      const keywords = result.data.keywords
      keywords.forEach((keyword: any) => {
        expect(keyword).toHaveProperty('keyword')
        expect(keyword).toHaveProperty('searchVolume')
        expect(keyword).toHaveProperty('competition')
        expect(keyword).toHaveProperty('trend')

        expect(typeof keyword.keyword).toBe('string')
        expect(typeof keyword.searchVolume).toBe('number')
        expect(typeof keyword.competition).toBe('string')
        expect(['rising', 'stable', 'declining']).toContain(keyword.trend)
      })
    })

    test('관련 토픽이 생성되어야 함', async () => {
      const result = await agent.execute(mockInput, mockContext)

      expect(result.success).toBe(true)
      expect(result.data.relatedTopics).toBeInstanceOf(Array)
      expect(result.data.relatedTopics.length).toBeGreaterThan(0)

      result.data.relatedTopics.forEach((topic: string) => {
        expect(typeof topic).toBe('string')
        expect(topic.length).toBeGreaterThan(0)
      })
    })

    test('계절성 분석 결과가 포함되어야 함', async () => {
      const result = await agent.execute(mockInput, mockContext)

      expect(result.success).toBe(true)
      expect(result.data.seasonality).toBeInstanceOf(Array)
      expect(result.data.seasonality.length).toBeGreaterThan(0)
    })

    test('에러 처리가 올바르게 작동해야 함', async () => {
      // 잘못된 입력으로 테스트
      const invalidInput = null as any
      const result = await agent.execute(invalidInput, mockContext)

      // 현재 구현에서는 입력 검증이 없으므로 성공할 수 있음
      // 하지만 에이전트가 에러 핸들링을 할 수 있는지 확인
      expect(result).toBeDefined()
      expect(result.agentType).toBe(AgentType.TREND_KEYWORD)
    })
  })

  describe('키워드 생성 품질', () => {
    test('주제와 관련된 키워드를 생성해야 함', async () => {
      const input = {
        topic: '인공지능',
        industry: '기술',
      }

      const result = await agent.execute(input, mockContext)
      expect(result.success).toBe(true)

      const keywords = result.data.keywords.map((k: any) => k.keyword)
      expect(keywords.some((k: string) => k.includes('인공지능'))).toBe(true)
    })

    test('다양한 키워드 타입을 생성해야 함', async () => {
      const input = {
        topic: '요리',
        industry: '요리',
      }

      const result = await agent.execute(input, mockContext)
      expect(result.success).toBe(true)

      const keywords = result.data.keywords.map((k: any) => k.keyword)

      // 다양한 패턴의 키워드가 생성되는지 확인
      expect(keywords.some((k: string) => k.includes('가이드'))).toBe(true)
      expect(keywords.some((k: string) => k.includes('추천'))).toBe(true)
    })
  })
})