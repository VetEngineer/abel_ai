import { ContentPlanningAgent } from '@/agents/content-planning-agent'
import { AgentType, AgentStatus } from '@/types/agents'

describe('ContentPlanningAgent', () => {
  let agent: ContentPlanningAgent
  const mockContext = {
    keywords: [],
    targetAudience: '일반 사용자',
    contentGoal: 'engagement',
    brandTone: '친근한',
    platform: 'blog'
  }

  beforeEach(() => {
    agent = new ContentPlanningAgent()
  })

  describe('기본 기능', () => {
    test('에이전트 정보가 올바르게 설정되어야 함', () => {
      const info = agent.getInfo()

      expect(info.type).toBe(AgentType.CONTENT_PLANNING)
      expect(info.name).toBe('콘텐츠 기획 에이전트')
      expect(info.description).toContain('전략적 콘텐츠 구조')
      expect(info.skills).toHaveLength(4)
      expect(info.status).toBe(AgentStatus.IDLE)
    })
  })

  describe('execute 메서드', () => {
    test('키워드 배열이 있는 경우 올바르게 처리해야 함', async () => {
      const mockInput = {
        keywords: [
          {
            keyword: '디지털 마케팅',
            searchVolume: 1200,
            competition: 'medium',
            trend: 'rising'
          },
          {
            keyword: '소셜 미디어',
            searchVolume: 800,
            competition: 'high',
            trend: 'stable'
          }
        ],
        targetAudience: '마케터',
        brandVoice: '전문적인'
      }

      const result = await agent.execute(mockInput, mockContext)

      expect(result.success).toBe(true)
      expect(result.agentType).toBe(AgentType.CONTENT_PLANNING)
      expect(result.data).toBeDefined()
    })

    test('키워드가 없거나 잘못된 형식인 경우도 처리해야 함', async () => {
      const mockInput = {
        keywords: null,
        targetAudience: '일반인',
        brandVoice: '친근한'
      }

      const result = await agent.execute(mockInput, mockContext)

      expect(result.success).toBe(true)
      expect(result.data.contentStrategy.mainTopic).toBe('기본 키워드')
    })

    test('중첩된 키워드 구조를 처리해야 함', async () => {
      const mockInput = {
        keywords: {
          keywords: [
            {
              keyword: '건강 관리',
              searchVolume: 1500,
              competition: 'low',
              trend: 'rising'
            }
          ]
        },
        targetAudience: '30-40대',
        brandVoice: '신뢰할 수 있는'
      }

      const result = await agent.execute(mockInput, mockContext)

      expect(result.success).toBe(true)
      expect(result.data.contentStrategy.mainTopic).toBe('건강 관리')
    })

    test('빈 배열 키워드를 처리해야 함', async () => {
      const mockInput = {
        keywords: [],
        targetAudience: '학생',
        brandVoice: '교육적인'
      }

      const result = await agent.execute(mockInput, mockContext)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.contentStrategy.mainTopic).toBe('기본 키워드')
    })

    test('컨텍스트에서 값을 가져와야 함', async () => {
      const mockInput = {}
      const contextWithData = {
        ...mockContext,
        targetAudience: '전문가',
        brandTone: '권위적인'
      }

      const result = await agent.execute(mockInput, contextWithData)

      expect(result.success).toBe(true)
      expect(result.data.targetAudience).toBe('전문가')
    })
  })

  describe('콘텐츠 전략 생성', () => {
    test('올바른 구조의 콘텐츠 전략을 생성해야 함', async () => {
      const mockInput = {
        keywords: [
          {
            keyword: '재테크',
            searchVolume: 2000,
            competition: 'medium',
            trend: 'rising'
          }
        ],
        targetAudience: '20-30대',
        brandVoice: '친근하지만 전문적인'
      }

      const result = await agent.execute(mockInput, mockContext)

      expect(result.success).toBe(true)
      expect(result.data.contentStrategy).toBeDefined()
      expect(result.data.contentStrategy).toHaveProperty('mainTopic')
      expect(result.data.contentStrategy).toHaveProperty('angle')
      expect(result.data.contentStrategy).toHaveProperty('uniqueValue')

      expect(typeof result.data.contentStrategy.mainTopic).toBe('string')
      expect(typeof result.data.contentStrategy.angle).toBe('string')
      expect(typeof result.data.contentStrategy.uniqueValue).toBe('string')
    })

    test('콘텐츠 구조를 생성해야 함', async () => {
      const mockInput = {
        keywords: [
          {
            keyword: '스마트폰 카메라',
            searchVolume: 1000,
            competition: 'low',
            trend: 'stable'
          },
          {
            keyword: '사진 촬영 기법',
            searchVolume: 500,
            competition: 'medium',
            trend: 'rising'
          }
        ],
        targetAudience: '사진 초보자',
        brandVoice: '교육적인'
      }

      const result = await agent.execute(mockInput, mockContext)

      expect(result.success).toBe(true)
      expect(result.data.structure).toBeDefined()
      expect(result.data.structure).toHaveProperty('introduction')
      expect(result.data.structure).toHaveProperty('mainSections')
      expect(result.data.structure).toHaveProperty('conclusion')

      expect(Array.isArray(result.data.structure.mainSections)).toBe(true)

      if (result.data.structure.mainSections.length > 0) {
        const section = result.data.structure.mainSections[0]
        expect(section).toHaveProperty('title')
        expect(section).toHaveProperty('keyPoints')
        expect(section).toHaveProperty('targetKeyword')
        expect(Array.isArray(section.keyPoints)).toBe(true)
      }
    })

    test('SEO 전략을 생성해야 함', async () => {
      const mockInput = {
        keywords: [
          {
            keyword: '온라인 쇼핑',
            searchVolume: 3000,
            competition: 'high',
            trend: 'rising'
          },
          {
            keyword: '배송',
            searchVolume: 1200,
            competition: 'medium',
            trend: 'stable'
          }
        ],
        targetAudience: '온라인 구매자',
        brandVoice: '실용적인'
      }

      const result = await agent.execute(mockInput, mockContext)

      expect(result.success).toBe(true)
      expect(result.data.seoStrategy).toBeDefined()
      expect(result.data.seoStrategy).toHaveProperty('primaryKeyword')
      expect(result.data.seoStrategy).toHaveProperty('secondaryKeywords')
      expect(result.data.seoStrategy).toHaveProperty('targetWordCount')

      expect(typeof result.data.seoStrategy.primaryKeyword).toBe('string')
      expect(Array.isArray(result.data.seoStrategy.secondaryKeywords)).toBe(true)
      expect(typeof result.data.seoStrategy.targetWordCount).toBe('number')
      expect(result.data.seoStrategy.targetWordCount).toBeGreaterThan(1000)
    })
  })

  describe('키워드 선택 로직', () => {
    test('검색량과 경쟁도를 고려한 키워드 선택해야 함', async () => {
      const mockInput = {
        keywords: [
          {
            keyword: '저경쟁 높은검색',
            searchVolume: 2000,
            competition: 'low',
            trend: 'rising'
          },
          {
            keyword: '고경쟁 높은검색',
            searchVolume: 2000,
            competition: 'high',
            trend: 'rising'
          }
        ],
        targetAudience: '테스터',
        brandVoice: '테스트'
      }

      const result = await agent.execute(mockInput, mockContext)

      expect(result.success).toBe(true)
      // 낮은 경쟁도 키워드가 우선 선택되어야 함
      expect(result.data.seoStrategy.primaryKeyword).toBe('저경쟁 높은검색')
    })

    test('빈 키워드 배열에 대해 기본값을 제공해야 함', async () => {
      const mockInput = {
        keywords: [],
        targetAudience: '테스터',
        brandVoice: '테스트'
      }

      const result = await agent.execute(mockInput, mockContext)

      expect(result.success).toBe(true)
      expect(result.data.seoStrategy.primaryKeyword).toBe('기본 키워드')
      expect(result.data.structure.mainSections).toHaveLength(1)
    })
  })
})