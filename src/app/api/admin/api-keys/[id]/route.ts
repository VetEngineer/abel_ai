import { NextRequest, NextResponse } from 'next/server'
import { apiKeyManager } from '@/lib/services/api-key-manager'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { is_active } = await request.json()
    const keyId = params.id

    // 임시로 성공 응답 반환 (실제 구현에서는 DB 업데이트)
    console.log(`API 키 ${keyId} 상태를 ${is_active ? '활성화' : '비활성화'}로 변경`)

    return NextResponse.json({
      message: `API 키가 ${is_active ? '활성화' : '비활성화'}되었습니다.`
    })
  } catch (error) {
    console.error('API 키 상태 변경 오류:', error)
    return NextResponse.json(
      { error: 'API 키 상태 변경에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const keyId = params.id
    const success = await apiKeyManager.deleteAPIKey(keyId)

    if (success) {
      return NextResponse.json({ message: 'API 키가 삭제되었습니다.' })
    } else {
      return NextResponse.json(
        { error: 'API 키 삭제에 실패했습니다.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('API 키 삭제 오류:', error)
    return NextResponse.json(
      { error: 'API 키 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}