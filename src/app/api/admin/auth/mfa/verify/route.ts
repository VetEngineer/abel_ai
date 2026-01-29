import { NextRequest, NextResponse } from 'next/server'
import { adminAuthService } from '@/lib/services/admin-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    try {
        const { tempToken, otp } = await request.json()

        if (!tempToken || !otp) {
            return NextResponse.json({ error: '인증 정보가 부족합니다.' }, { status: 400 })
        }

        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown'

        const userAgent = request.headers.get('user-agent') || 'unknown'

        const result = await adminAuthService.verifyMFAAndLogin(tempToken, otp, ipAddress, userAgent)

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 401 })
        }

        // 성공 응답 (쿠키 설정 등)
        const response = NextResponse.json({
            success: true,
            user: {
                id: result.user!.id,
                username: result.user!.username,
                email: result.user!.email,
                role: result.user!.role
            },
            token: result.token,
            message: '로그인이 성공했습니다.'
        })

        // HTTP-Only 쿠키로 JWT 토큰 설정
        response.cookies.set('admin-token', result.token!, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 // 24시간
        })

        return response

    } catch (error) {
        console.error('MFA 검증 오류:', error)
        return NextResponse.json({ error: 'MFA 검증 중 오류가 발생했습니다.' }, { status: 500 })
    }
}
