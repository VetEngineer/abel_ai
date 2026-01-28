import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // 로그아웃 처리 (쿠키 삭제)
    const response = NextResponse.json({
      success: true,
      message: '로그아웃되었습니다.'
    })

    // 관리자 토큰 쿠키 삭제
    response.cookies.set('admin-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0 // 즉시 만료
    })

    return response

  } catch (error) {
    console.error('로그아웃 API 오류:', error)
    return NextResponse.json(
      { error: '로그아웃 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}