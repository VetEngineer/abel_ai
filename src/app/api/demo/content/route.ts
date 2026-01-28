import { NextRequest, NextResponse } from 'next/server'

// 데모용 콘텐츠 API
// 글로벌 변수로 데이터 공유
if (!globalThis.demoContents) {
  globalThis.demoContents = {}
}
let demoContents = globalThis.demoContents

export async function POST(request: NextRequest) {
  try {
    const { projectId, title, excerpt, status = 'draft' } = await request.json()

    if (!projectId || !title) {
      return NextResponse.json(
        { error: '프로젝트 ID와 제목이 필요합니다.' },
        { status: 400 }
      )
    }

    // 데모 콘텐츠 생성
    const contentId = `content_${Date.now()}`
    const demoContent = {
      id: contentId,
      project_id: projectId,
      title,
      excerpt: excerpt || `${title}에 대한 자동 생성된 요약입니다.`,
      status,
      keywords: [],
      tags: [],
      platforms: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // 글로벌 저장소에 저장
    demoContents[contentId] = demoContent

    return NextResponse.json(demoContent)

  } catch (error) {
    console.error('Demo content creation error:', error)
    return NextResponse.json(
      { error: '콘텐츠 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}