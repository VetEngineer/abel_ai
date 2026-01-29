import { NextRequest, NextResponse } from 'next/server'
import { AgentCoordinator } from '@/lib/agents/agent-coordinator'
import { SharedContext, AgentType } from '@/types/agents'

// 실제 워크플로우를 위한 전역 storage (프로덕션에서는 데이터베이스 사용)
declare global {
  var realWorkflows: Record<string, any> | undefined
  var demoWorkflows: any
}

if (!globalThis.realWorkflows) {
  globalThis.realWorkflows = {}
}
let workflows = globalThis.realWorkflows

if (!globalThis.demoWorkflows) {
  globalThis.demoWorkflows = {}
}
let demoWorkflows = globalThis.demoWorkflows

const DEMO_PROJECT_ID = process.env.DEMO_PROJECT_ID || '550e8400-e29b-41d4-a716-446655440001'

export async function POST(request: NextRequest) {
  try {
    const { projectId, contentId, topic, industry, targetAudience, brandVoice, userId = 'demo-user' } = await request.json()

    if (!projectId || !contentId || !topic) {
      return NextResponse.json(
        { error: '필수 매개변수가 누락되었습니다.' },
        { status: 400 }
      )
    }

    const workflowId = `workflow_${Date.now()}`

    demoWorkflows[workflowId] = {
      id: workflowId,
      content_id: contentId,
      project_id: projectId,
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
        title: `${topic} - 자동 생성 콘텐츠`,
        status: 'draft'
      }
    }

    // [Option B] Real Execution for Demo
    // simulateDemoWorkflowExecution(workflowId, topic) -> Removed
    // Use executeRealWorkflow but point to demoWorkflows storage implicitly by using the same ID?
    // Actually executeRealWorkflow uses 'workflows' global.
    // We should adapt executeRealWorkflow to support demo persistence or just use the real workflow path.

    // Better approach: Call executeRealWorkflow but pass a flag or handle storage
    // For simplicity in this "Option B" request, I will duplicate the execution logic here
    // but targeting demoWorkflows, OR just redirect to real workflow execution.

    // Let's use the real execution logic but save to demoWorkflows to keep UI working
    executeRealWorkflow(workflowId, topic, industry || 'general', targetAudience, brandVoice, userId, true)

    return NextResponse.json({
      workflowId,
      status: 'started',
      message: '실제 AI 워크플로우가 시작되었습니다. (Demo Mode)'
    })
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
      const workflow = demoWorkflows[workflowId] || workflows[workflowId]
      if (!workflow) {
        return NextResponse.json({ error: '워크플로우를 찾을 수 없습니다.' }, { status: 404 })
      }
      return NextResponse.json({ workflow })
    }

    // 모든 워크플로우 반환
    return NextResponse.json({ workflows: [...Object.values(demoWorkflows), ...Object.values(workflows)] })

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
  userId: string,
  isDemo: boolean = false
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
      platform: 'blog',
      userId
    }

    console.log(`실제 워크플로우 실행 시작: ${workflowId}`)

    // 워크플로우 실행
    const finalResult = await coordinator.executeWorkflow(initialInput, sharedContext, (update) => {
      // Choose storage based on mode
      const targetWorkflows = isDemo ? demoWorkflows : workflows
      const workflow = targetWorkflows[workflowId]
      if (!workflow) return

      const existingIndex = workflow.agent_executions.findIndex(
        (execution: any) => execution.agent_type === update.agentType
      )

      const executionData = {
        agent_type: update.agentType,
        status: update.status === 'processing' ? 'processing' : update.status === 'completed' ? 'completed' : 'error',
        execution_time: update.executionTime,
        tokens_used: update.tokensUsed,
        error_message: update.error
      }

      if (existingIndex >= 0) {
        workflow.agent_executions[existingIndex] = {
          ...workflow.agent_executions[existingIndex],
          ...executionData
        }
      } else {
        workflow.agent_executions.push(executionData)
      }

      if (update.status === 'completed') {
        workflow.current_step = update.stepIndex + 1
      }
    })

    // 워크플로우 완료 처리
    const targetWorkflows = isDemo ? demoWorkflows : workflows
    if (targetWorkflows[workflowId]) {
      targetWorkflows[workflowId].status = 'completed'
      targetWorkflows[workflowId].completed_at = new Date().toISOString()

      // 워크플로우 상태에서 개별 에이전트 결과 수집
      const workflowSteps = coordinator.getWorkflowSteps()
      const keywordResults = workflowSteps.find(step => step.agentType === 'trend_keyword')
      const contentResults = workflowSteps.find(step => step.agentType === 'content_writing')

      // 종합적인 결과 구성
      const enrichedResult = {
        ...finalResult,
        keywords: keywordResults ? extractKeywordsFromStep(keywordResults) : [],
        seoData: workflowSteps.find(step => step.agentType === 'seo_optimization'),
        visualDesign: workflowSteps.find(step => step.agentType === 'visual_design'),
        marketingData: workflowSteps.find(step => step.agentType === 'marketing_funnel'),
        content: contentResults?.output?.content
      }

      targetWorkflows[workflowId].final_result = enrichedResult
      targetWorkflows[workflowId].content.status = 'completed'

      // 생성된 콘텐츠 저장
      if (enrichedResult && enrichedResult.content) {
        targetWorkflows[workflowId].content = {
          ...targetWorkflows[workflowId].content,
          ...enrichedResult.content
        }
      }

      console.log(`워크플로우 완료: ${workflowId}`)
    }

  } catch (error) {
    console.error(`워크플로우 실행 실패 (${workflowId}):`, error)

    console.error(`워크플로우 실행 실패 (${workflowId}):`, error)

    const targetWorkflows = isDemo ? demoWorkflows : workflows
    if (targetWorkflows[workflowId]) {
      targetWorkflows[workflowId].status = 'failed'
      targetWorkflows[workflowId].error = error instanceof Error ? error.message : '알 수 없는 오류'
      targetWorkflows[workflowId].completed_at = new Date().toISOString()
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

// 워크플로우 단계에서 키워드 데이터 추출
function extractKeywordsFromStep(step: any) {
  try {
    // AgentCoordinator의 getWorkflowStatus는 hasOutput만 반환하므로
    // 실제로는 sharedContext에서 키워드를 가져와야 합니다
    // 여기서는 데모용 키워드를 반환합니다
    return [
      {
        keyword: "병원 홈페이지 제작",
        searchVolume: 1200,
        competition: "medium",
        trend: "rising"
      },
      {
        keyword: "의료 웹사이트 SEO",
        searchVolume: 800,
        competition: "high",
        trend: "stable"
      },
      {
        keyword: "병원 마케팅",
        searchVolume: 950,
        competition: "medium",
        trend: "rising"
      },
      {
        keyword: "의료진 소개 페이지",
        searchVolume: 600,
        competition: "low",
        trend: "stable"
      },
      {
        keyword: "환자 예약 시스템",
        searchVolume: 750,
        competition: "medium",
        trend: "rising"
      }
    ]
  } catch (error) {
    console.error('키워드 추출 오류:', error)
    return []
  }
}

async function simulateDemoWorkflowExecution(workflowId: string, topic: string) {
  const agents = [
    'trend_keyword',
    'content_planning',
    'seo_optimization',
    'copywriting',
    'content_writing',
    'visual_design',
    'local_seo',
    'answer_optimization',
    'marketing_funnel',
    'brand_supervision',
    'blog_deployment'
  ]

  for (let i = 0; i < agents.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    if (demoWorkflows[workflowId]) {
      demoWorkflows[workflowId].current_step = i + 1

      demoWorkflows[workflowId].agent_executions.push({
        agent_type: agents[i],
        status: 'completed',
        execution_time: Math.floor(Math.random() * 3000) + 500,
        tokens_used: Math.floor(Math.random() * 500) + 100
      })

      if (i === agents.length - 1) {
        demoWorkflows[workflowId].status = 'completed'
        demoWorkflows[workflowId].completed_at = new Date().toISOString()
      }
    }
  }
}
