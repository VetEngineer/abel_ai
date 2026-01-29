import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams, origin: requestOrigin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    // Debugging Logs
    console.log('--- OAuth Callback Debug ---')
    console.log('Request URL:', request.url)
    console.log('Request Origin:', requestOrigin)
    console.log('Env NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL)
    console.log('Env VERCEL_URL:', process.env.VERCEL_URL)

    // Header-based origin detection (Most robust on Vercel)
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const headerOrigin = host ? `${protocol}://${host}` : null
    console.log('Header Origin:', headerOrigin)

    // Priority: Env Site URL > Vercel URL > Header Origin > Request Origin
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)

    const origin = siteUrl || headerOrigin || requestOrigin
    console.log('Final Redirect Origin:', origin)
    console.log('---------------------------')

    if (code) {
        const supabase = createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`)
        } else {
            console.error('Auth Exchange Error:', error)
        }
    }

    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
