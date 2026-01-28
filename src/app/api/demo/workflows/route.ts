import { NextRequest, NextResponse } from 'next/server'

// 데모용 워크플로우 API (실제 데이터베이스 없이 작동)
// 글로벌 변수로 데이터 공유
if (!globalThis.demoWorkflows) {
  globalThis.demoWorkflows = {}
}
let demoWorkflows = globalThis.demoWorkflows

export async function POST(request: NextRequest) {
  try {
    const { projectId, contentId, topic, industry, targetAudience, brandVoice } = await request.json()

    if (!projectId || !contentId || !topic) {
      return NextResponse.json(
        { error: '필수 매개변수가 누락되었습니다.' },
        { status: 400 }
      )
    }

    const workflowId = `workflow_${Date.now()}`

    // 데모 워크플로우 생성
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

    // 백그라운드에서 데모 워크플로우 시뮬레이션
    simulateWorkflowExecution(workflowId, topic)

    return NextResponse.json({
      workflowId,
      status: 'started',
      message: '워크플로우가 시작되었습니다.'
    })

  } catch (error) {
    console.error('Demo workflow creation error:', error)
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
      const workflow = demoWorkflows[workflowId]
      if (!workflow) {
        return NextResponse.json({ error: '워크플로우를 찾을 수 없습니다.' }, { status: 404 })
      }
      return NextResponse.json({ workflow })
    }

    // 모든 워크플로우 반환
    return NextResponse.json({ workflows: Object.values(demoWorkflows) })

  } catch (error) {
    console.error('Demo workflow query error:', error)
    return NextResponse.json(
      { error: '워크플로우 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

async function simulateWorkflowExecution(workflowId: string, topic: string) {
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
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000)) // 1-3초 대기

    if (demoWorkflows[workflowId]) {
      demoWorkflows[workflowId].current_step = i + 1

      // 에이전트 실행 기록 추가
      demoWorkflows[workflowId].agent_executions.push({
        agent_type: agents[i],
        status: 'completed',
        execution_time: Math.floor(Math.random() * 3000) + 500,
        tokens_used: Math.floor(Math.random() * 500) + 100
      })

      // 마지막 단계면 완료 처리
      if (i === agents.length - 1) {
        demoWorkflows[workflowId].status = 'completed'
        demoWorkflows[workflowId].completed_at = new Date().toISOString()
      }
    }
  }
}