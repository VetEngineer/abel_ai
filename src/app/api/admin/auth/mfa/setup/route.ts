import { NextRequest, NextResponse } from 'next/server'
import { adminAuthService } from '@/lib/services/admin-auth'

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization')
        console.log('[MFA Setup] Auth header:', authHeader ? 'present' : 'missing')

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: '인증되지 않은 접근입니다.' }, { status: 401 })
        }

        const token = authHeader.split(' ')[1]
        console.log('[MFA Setup] Verifying token...')
        const user = adminAuthService.verifyToken(token)

        if (!user) {
            console.log('[MFA Setup] Token verification failed')
            return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 })
        }

        console.log('[MFA Setup] User verified:', user.username, 'ID:', user.id)
        console.log('[MFA Setup] Generating MFA setup...')

        const { secret, qrCode } = await adminAuthService.generateMFASetup(user.id, user.email || user.username)

        console.log('[MFA Setup] Success, secret generated')
        return NextResponse.json({
            success: true,
            secret,
            qrCode
        })

    } catch (error) {
        console.error('[MFA Setup] ERROR:', error)
        console.error('[MFA Setup] Error name:', (error as Error).name)
        console.error('[MFA Setup] Error message:', (error as Error).message)
        console.error('[MFA Setup] Error stack:', (error as Error).stack)
        return NextResponse.json({ error: 'MFA 설정 중 오류가 발생했습니다.' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: '인증되지 않은 접근입니다.' }, { status: 401 })
        }

        const token = authHeader.split(' ')[1]
        const user = adminAuthService.verifyToken(token)

        if (!user) {
            return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 })
        }

        const { token: mfaToken, secret } = await request.json()

        if (!mfaToken || !secret) {
            return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 })
        }

        const success = await adminAuthService.enableMFA(user.id, mfaToken, secret)

        if (!success) {
            return NextResponse.json({ error: '잘못된 OTP 코드입니다.' }, { status: 400 })
        }

        return NextResponse.json({
            success: true,
            message: 'MFA가 성공적으로 활성화되었습니다.'
        })

    } catch (error) {
        console.error('MFA 활성화 오류:', error)
        return NextResponse.json({ error: 'MFA 활성화 중 오류가 발생했습니다.' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: '인증되지 않은 접근입니다.' }, { status: 401 })
        }

        const token = authHeader.split(' ')[1]
        const user = adminAuthService.verifyToken(token)

        if (!user) {
            return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 })
        }

        await adminAuthService.disableMFA(user.id)

        return NextResponse.json({
            success: true,
            message: 'MFA가 성공적으로 비활성화되었습니다.'
        })

    } catch (error) {
        console.error('MFA 비활성화 오류:', error)
        return NextResponse.json({ error: 'MFA 비활성화 중 오류가 발생했습니다.' }, { status: 500 })
    }
}
