import { NextRequest, NextResponse } from 'next/server'
import { getMCPSupabaseClient } from '@/lib/supabase/client'
import { adminAuthService } from '@/lib/services/admin-auth'

export async function POST(request: NextRequest) {
    try {
        // 1. 관리자 인증
        const token = request.headers.get('Authorization')?.split('Bearer ')[1]
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const admin = adminAuthService.verifyToken(token)
        if (!admin) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        // 2. 요청 데이터 파싱
        const body = await request.json()
        const { userId, amount, description, transactionType } = body

        if (!userId || !amount || amount === 0) {
            return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
        }

        const supabase = await getMCPSupabaseClient()

        // 3. 현재 크레딧 조회
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('credits')
            .eq('id', userId)
            .single()

        if (fetchError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const currentBalance = user.credits || 0
        const newBalance = currentBalance + amount

        // 4. 트랜잭션 기록 및 유저 크레딧 업데이트 (Transaction 처리)
        // Supabase RPC나 여러 쿼리를 묶어서 처리하면 더 좋지만, 여기선 순차 처리 (에러 핸들링 주의)

        // 4.1. 로그 기록
        const { error: logError } = await supabase
            .from('credit_transactions')
            .insert({
                user_id: userId,
                amount: amount,
                balance_after: newBalance,
                transaction_type: transactionType || 'manual_adjustment',
                description: description || 'Admin manual adjustment',
                created_by: null // 시스템/관리자 ID를 넣을 수 있다면 넣음
            })

        if (logError) {
            console.error('Failed to log credit transaction:', logError)
            return NextResponse.json({ error: 'Failed to record transaction' }, { status: 500 })
        }

        // 4.2. 유저 크레딧 업데이트
        const { error: updateError } = await supabase
            .from('users')
            .update({ credits: newBalance })
            .eq('id', userId)

        if (updateError) {
            console.error('Failed to update user credits:', updateError)
            return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 })
        }

        return NextResponse.json({ success: true, newBalance })

    } catch (error) {
        console.error('Credit adjustment error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
