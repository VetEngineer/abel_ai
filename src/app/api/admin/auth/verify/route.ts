import { NextRequest, NextResponse } from 'next/server'
import { extractAdminTokenFromRequest, verifyAdminToken } from '@/lib/middleware/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const token = extractAdminTokenFromRequest(request)

    if (!token) {
      return NextResponse.json(
        { error: '인증 토큰이 없습니다.' },
        { status: 401 }
      )
    }

    const user = verifyAdminToken(token)

    if (!user) {
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        username: user.username,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: '토큰 검증 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}