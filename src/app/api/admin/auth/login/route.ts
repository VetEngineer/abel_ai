import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // 환경 변수에서 관리자 계정 정보 가져오기
    const adminUsername = process.env.ADMIN_USERNAME || 'admin_abel'
    const adminPassword = process.env.ADMIN_PASSWORD || 'abel100x'
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key'

    // 자격 증명 확인
    if (username !== adminUsername || password !== adminPassword) {
      return NextResponse.json(
        { error: '사용자명 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      {
        username: adminUsername,
        role: 'admin',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24시간 유효
      },
      jwtSecret
    )

    // 성공 응답
    return NextResponse.json({
      success: true,
      token,
      user: {
        username: adminUsername,
        role: 'admin'
      }
    })

  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}