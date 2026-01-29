'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Suspense } from 'react'

function ErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    return (
        <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
                <div className="bg-destructive/10 p-4 rounded-full">
                    <AlertCircle className="w-12 h-12 text-destructive" />
                </div>
            </div>

            <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">인증 오류 발생</h1>
                <p className="text-muted-foreground">
                    로그인 처리 중 문제가 발생했습니다.
                </p>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg text-left">
                        <p className="text-xs font-semibold text-red-900 uppercase tracking-wider mb-1">Error Details</p>
                        <p className="text-sm text-red-700 font-mono break-all">{error}</p>
                    </div>
                )}

                <p className="text-sm text-muted-foreground mt-2">
                    잠시 후 다시 시도하거나 관리자에게 문의해주세요.
                </p>
            </div>

            <div className="pt-4">
                <Button asChild className="w-full">
                    <Link href="/login">
                        로그인 페이지로 돌아가기
                    </Link>
                </Button>
            </div>
        </div>
    )
}

export default function AuthErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <Suspense fallback={<div>Loading...</div>}>
                <ErrorContent />
            </Suspense>
        </div>
    )
}
