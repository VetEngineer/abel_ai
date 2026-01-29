import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams, origin: requestOrigin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    // 환경 변수에서 기본 URL 가져오기 (가장 확실한 방법)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)

    // 환경 변수가 없으면 request의 origin 사용 (localhost 등)
    const origin = siteUrl || requestOrigin

    if (code) {
        const supabase = createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
