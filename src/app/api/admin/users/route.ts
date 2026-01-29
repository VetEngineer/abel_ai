import { NextRequest, NextResponse } from 'next/server'
import { getMCPSupabaseClient } from '@/lib/supabase/client'
import { adminAuthService } from '@/lib/services/admin-auth'

export async function GET(request: NextRequest) {
    try {
        // 1. 관리자 인증 토큰 확인
        const token = request.headers.get('Authorization')?.split('Bearer ')[1]
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const admin = adminAuthService.verifyToken(token)
        if (!admin) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        // 2. Supabase 클라이언트 생성
        const supabase = await getMCPSupabaseClient()

        // 3. 사용자 목록 조회 (public.users 테이블)
        // 실제 운영 환경에서는 auth.users와 조인하거나 동기화된 데이터를 사용해야 할 수 있음
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Failed to fetch users:', error)
            return NextResponse.json({ error: '사용자 목록을 불러오지 못했습니다.' }, { status: 500 })
        }

        // 4. 데이터 가공 및 반환
        return NextResponse.json({
            success: true,
            users: users || []
        })

    } catch (error) {
        console.error('Admin users API error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
