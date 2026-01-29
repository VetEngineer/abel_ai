'use client'

import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AuthErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <div className="bg-destructive/10 p-4 rounded-full">
                        <AlertCircle className="w-12 h-12 text-destructive" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">인증 오류 발생</h1>
                    <p className="text-muted-foreground">
                        로그인 처리 중 문제가 발생했습니다. <br />
                        잠시 후 다시 시도하거나 관리자에게 문의해주세요.
                    </p>
                </div>

                <div className="pt-4">
                    <Button asChild className="w-full">
                        <Link href="/login">로그인 페이지로 돌아가기</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
