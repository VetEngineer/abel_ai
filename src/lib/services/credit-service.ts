
import { getMCPSupabaseClient } from '@/lib/supabase/client'
import { SupabaseClient } from '@supabase/supabase-js'

export class CreditService {
    private supabase: SupabaseClient | null = null

    async getClient() {
        if (!this.supabase) {
            this.supabase = await getMCPSupabaseClient()
        }
        if (!this.supabase) throw new Error('Supabase client initialization failed')
        return this.supabase
    }

    // 사용자 크레딧 잔액 조회
    async getBalance(userId: string): Promise<number> {
        const client = await this.getClient()
        const { data, error } = await client
            .from('users')
            .select('credits')
            .eq('id', userId)
            .single()

        if (error) {
            console.error('Failed to fetch credit balance:', error)
            return 0
        }

        return data?.credits || 0
    }

    // 크레딧 차감 (트랜잭션 포함)
    async deductCredits(userId: string, amount: number, description: string): Promise<{ success: boolean; newBalance?: number; error?: string }> {
        const client = await this.getClient()

        // 1. 현재 잔액 확인
        const currentBalance = await this.getBalance(userId)

        if (currentBalance < amount) {
            return { success: false, error: 'Insufficient credits' }
        }

        const newBalance = currentBalance - amount

        // 2. 트랜잭션 기록 및 차감 (순차 처리)
        // 실제 운영 환경에서는 RPC를 사용하여 원자성(Atomicity)을 보장하는 것이 좋습니다.

        // 로그 기록
        const { error: logError } = await client
            .from('credit_transactions')
            .insert({
                user_id: userId,
                amount: -amount,
                balance_after: newBalance,
                transaction_type: 'usage',
                description: description
            })

        if (logError) {
            console.error('Failed to log credit usage:', logError)
            // 로그 실패해도 차감은 진행해야 할지 결정 필요. 여기서는 보수적으로 중단.
            return { success: false, error: 'Transaction log failed' }
        }

        // 잔액 업데이트
        const { error: updateError } = await client
            .from('users')
            .update({ credits: newBalance })
            .eq('id', userId)

        if (updateError) {
            console.error('Failed to update user balance:', updateError)
            // 심각한 불일치 발생 가능성. 롤백 필요하지만 여기선 에러 반환.
            return { success: false, error: 'Balance update failed' }
        }

        return { success: true, newBalance }
    }

    // 크레딧 환불 (실패 시 등)
    async refundCredits(userId: string, amount: number, description: string): Promise<boolean> {
        const client = await this.getClient()
        const currentBalance = await this.getBalance(userId)
        const newBalance = currentBalance + amount

        await client.from('credit_transactions').insert({
            user_id: userId,
            amount: amount,
            balance_after: newBalance,
            transaction_type: 'refund',
            description: description
        })

        await client.from('users').update({ credits: newBalance }).eq('id', userId)

        return true
    }
}

export const creditService = new CreditService()
