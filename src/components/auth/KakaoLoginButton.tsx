'use client'

import React from 'react'
import { getBrowserSupabaseClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

// Kakao Logo SVG component
const KakaoLogo = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3C7.58 3 4 5.28 4 8.5C4 10.59 5.42 12.33 7.58 13.25L7 15.62C6.91 16.03 7.39 16.32 7.72 16.07L10.88 13.88C11.24 13.94 11.62 14 12 14C16.42 14 20 11.72 20 8.5C20 5.28 16.42 3 12 3Z" />
    </svg>
)

export function KakaoLoginButton() {
    const [loading, setLoading] = React.useState(false)

    const handleLogin = async () => {
        try {
            setLoading(true)
            const supabase = getBrowserSupabaseClient()

            if (!supabase) {
                alert('Supabase 설정이 완료되지 않았습니다.')
                return
            }

            // Vercel 환경에서 확실한 URL 보장을 위해 환경변수 우선 사용
            const origin = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
            const redirectTo = `${origin}/auth/callback`

            console.log('Starting OAuth with redirect:', redirectTo)

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'kakao',
                options: {
                    redirectTo,
                },
            })

            if (error) throw error
        } catch (error: any) {
            console.error('Kakao login error:', error)
            alert('카카오 로그인 중 오류가 발생했습니다: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-[#FEE500] hover:bg-[#FDD835] text-[#000000] font-medium h-12 flex items-center justify-center gap-2"
        >
            {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <KakaoLogo className="w-5 h-5" />
            )}
            {loading ? '로그인 중...' : '카카오로 시작하기'}
        </Button>
    )
}
