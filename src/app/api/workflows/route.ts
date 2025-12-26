import { NextRequest, NextResponse } from 'next/server'
import { AgentCoordinator } from '@/lib/agents/agent-coordinator'
import { SharedContext, AgentType } from '@/types/agents'

// 실제 워크플로우를 위한 전역 storage (프로덕션에서는 데이터베이스 사용)
declare global {
  var realWorkflows: Record<string, any> | undefined
}

if (!globalThis.realWorkflows) {
  globalThis.realWorkflows = {}
}
let workflows = globalThis.realWorkflows

export async function POST(request: NextRequest) {
  try {
    const { projectId, contentId, topic, industry, targetAudience, brandVoice, userId = 'demo-user' } = await request.json()

    if (!projectId || !contentId || !topic) {
      return NextResponse.json(
        { error: '필수 매개변수가 누락되었습니다.' },
        { status: 400 }
      )
    }

    const workflowId = `real_workflow_${Date.now()}`

    // 초기 워크플로우 상태 설정
    workflows[workflowId] = {
      id: workflowId,
      content_id: contentId,
      project_id: projectId,
      user_id: userId,
      status: 'running',
      current_step: 0,
      total_steps: 11,
      shared_context: {
        keywords: [],
        targetAudience: targetAudience || '일반 사용자',
        contentGoal: 'engagement',
        brandTone: brandVoice || '친근한',
        platform: 'blog'
      },
      agent_executions: [],
      created_at: new Date().toISOString(),
      content: {
        title: `${topic} - AI 생성 콘텐츠`,
        status: 'generating'
      },
      topic,
      industry
    }

    // 백그라운드에서 실제 워크플로우 실행
    executeRealWorkflow(workflowId, topic, industry, targetAudience, brandVoice, userId)

    return NextResponse.json({
      workflowId,
      status: 'started',
      message: '실제 AI 워크플로우가 시작되었습니다.'
    })

  } catch (error) {
    console.error('Real workflow creation error:', error)
    return NextResponse.json(
      { error: '워크플로우 실행 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workflowId = searchParams.get('workflowId')

    if (workflowId) {
      const workflow = workflows[workflowId]
      if (!workflow) {
        return NextResponse.json({ error: '워크플로우를 찾을 수 없습니다.' }, { status: 404 })
      }
      return NextResponse.json({ workflow })
    }

    // 모든 워크플로우 반환
    return NextResponse.json({ workflows: Object.values(workflows) })

  } catch (error) {
    console.error('Real workflow query error:', error)
    return NextResponse.json(
      { error: '워크플로우 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

async function executeRealWorkflow(
  workflowId: string,
  topic: string,
  industry: string,
  targetAudience: string,
  brandVoice: string,
  userId: string
) {
  try {
    // 실제 에이전트 coordinator 인스턴스 생성
    const coordinator = new AgentCoordinator()

    // 모든 에이전트를 동적으로 import하고 등록
    await registerAllAgents(coordinator)

    // 초기 입력 데이터 구성
    const initialInput = {
      topic,
      industry,
      targetAudience,
      brandVoice,
      userId,
      contentId: workflows[workflowId]?.content_id
    }

    // 공유 컨텍스트 설정
    const sharedContext: SharedContext = {
      keywords: [],
      targetAudience,
      contentGoal: 'engagement',
      brandTone: brandVoice,
      platform: 'blog'
    }

    console.log(`실제 워크플로우 실행 시작: ${workflowId}`)

    // 워크플로우 실행
    const finalResult = await coordinator.executeWorkflow(initialInput, sharedContext)

    // 워크플로우 완료 처리
    if (workflows[workflowId]) {
      workflows[workflowId].status = 'completed'
      workflows[workflowId].completed_at = new Date().toISOString()
      workflows[workflowId].final_result = finalResult
      workflows[workflowId].content.status = 'completed'

      // 생성된 콘텐츠 저장
      if (finalResult && finalResult.content) {
        workflows[workflowId].content = {
          ...workflows[workflowId].content,
          ...finalResult.content
        }
      }

      console.log(`워크플로우 완료: ${workflowId}`)
    }

  } catch (error) {
    console.error(`워크플로우 실행 실패 (${workflowId}):`, error)

    if (workflows[workflowId]) {
      workflows[workflowId].status = 'failed'
      workflows[workflowId].error = error instanceof Error ? error.message : '알 수 없는 오류'
      workflows[workflowId].completed_at = new Date().toISOString()
    }
  }
}

async function registerAllAgents(coordinator: AgentCoordinator) {
  try {
    // 동적으로 모든 에이전트 import
    const { TrendKeywordAgent } = await import('@/agents/trend-keyword-agent')
    const { ContentPlanningAgent } = await import('@/agents/content-planning-agent')
    const { SEOOptimizationAgent } = await import('@/agents/seo-optimization-agent')
    const { CopywritingAgent } = await import('@/agents/copywriting-agent')
    const { ContentWritingAgent } = await import('@/agents/content-writing-agent')
    const { VisualDesignAgent } = await import('@/agents/visual-design-agent')
    const { LocalSEOAgent } = await import('@/agents/local-seo-agent')
    const { AnswerOptimizationAgent } = await import('@/agents/answer-optimization-agent')
    const { MarketingFunnelAgent } = await import('@/agents/marketing-funnel-agent')
    const { BrandSupervisionAgent } = await import('@/agents/brand-supervision-agent')
    const { BlogDeploymentAgent } = await import('@/agents/blog-deployment-agent')

    // 에이전트 인스턴스 생성 및 등록
    coordinator.registerAgent(new TrendKeywordAgent())
    coordinator.registerAgent(new ContentPlanningAgent())
    coordinator.registerAgent(new SEOOptimizationAgent())
    coordinator.registerAgent(new CopywritingAgent())
    coordinator.registerAgent(new ContentWritingAgent())
    coordinator.registerAgent(new VisualDesignAgent())
    coordinator.registerAgent(new LocalSEOAgent())
    coordinator.registerAgent(new AnswerOptimizationAgent())
    coordinator.registerAgent(new MarketingFunnelAgent())
    coordinator.registerAgent(new BrandSupervisionAgent())
    coordinator.registerAgent(new BlogDeploymentAgent())

    console.log('모든 AI 에이전트가 등록되었습니다.')
  } catch (error) {
    console.error('에이전트 등록 실패:', error)
    throw error
  }
}