import { NextRequest, NextResponse } from 'next/server'
import { adminAuthService } from '@/lib/services/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // 입력값 검증
    if (!username || !password) {
      return NextResponse.json(
        { error: '사용자명과 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 클라이언트 정보 수집
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     request.ip ||
                     'unknown'

    const userAgent = request.headers.get('user-agent') || 'unknown'

    // 로그인 시도 (Supabase 또는 환경변수 기반)
    const result = await adminAuthService.login(username, password, ipAddress, userAgent)

    if (!result.success) {
      console.log(`로그인 실패: ${username} from ${ipAddress}`)
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      )
    }

    console.log(`로그인 성공: ${username} from ${ipAddress}`)

    // 성공 응답 (토큰을 쿠키에 설정)
    const response = NextResponse.json({
      success: true,
      user: {
        id: result.user!.id,
        username: result.user!.username,
        email: result.user!.email,
        role: result.user!.role
      },
      message: '로그인이 성공했습니다.'
    })

    // HTTP-Only 쿠키로 JWT 토큰 설정
    response.cookies.set('admin-token', result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24시간 (초 단위)
    })

    return response

  } catch (error) {
    console.error('로그인 API 오류:', error)
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
