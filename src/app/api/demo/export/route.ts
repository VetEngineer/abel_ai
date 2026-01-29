import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

// 외부에서 접근 가능하도록 export
declare global {
  var demoWorkflows: any
  var demoContents: any
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'
    const workflowId = searchParams.get('workflowId')

    // 글로벌 변수에서 데이터 가져오기
    const workflows = globalThis.demoWorkflows || {}
    const contents = globalThis.demoContents || {}

    let exportData

    if (workflowId) {
      // 특정 워크플로우 데이터 내보내기
      const workflow = workflows[workflowId]
      if (!workflow) {
        return NextResponse.json({ error: '워크플로우를 찾을 수 없습니다.' }, { status: 404 })
      }

      exportData = {
        workflow,
        content: contents[workflow.content_id],
        exportedAt: new Date().toISOString()
      }
    } else {
      // 전체 데이터 내보내기
      exportData = {
        workflows,
        contents,
        summary: {
          totalWorkflows: Object.keys(workflows).length,
          totalContents: Object.keys(contents).length,
          exportedAt: new Date().toISOString()
        }
      }
    }

    if (format === 'json') {
      return NextResponse.json(exportData)
    }

    if (format === 'file') {
      // 파일로 저장
      const exportDir = path.join(process.cwd(), 'exports')

      try {
        await fs.mkdir(exportDir, { recursive: true })

        const filename = `content-export-${Date.now()}.json`
        const filePath = path.join(exportDir, filename)

        await fs.writeFile(filePath, JSON.stringify(exportData, null, 2))

        return NextResponse.json({
          message: '파일로 저장되었습니다.',
          filePath: `/exports/${filename}`,
          localPath: filePath
        })
      } catch (error) {
        return NextResponse.json(
          { error: '파일 저장 중 오류가 발생했습니다.' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ error: '지원하지 않는 형식입니다.' }, { status: 400 })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: '데이터 내보내기 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}