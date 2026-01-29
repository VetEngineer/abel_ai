'use client'

import React from 'react'
import Link from 'next/link'
import { KakaoLoginButton } from '@/components/auth/KakaoLoginButton'
import { Bot, ArrowRight } from 'lucide-react'

export default function LoginPage() {
    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* Left Column: Branding / Marketing */}
            <div className="hidden lg:flex flex-col justify-between bg-zinc-900 text-white p-12 lg:p-16 relative overflow-hidden">
                <div className="z-10">
                    <div className="flex items-center gap-2 mb-8">
                        <Bot className="w-8 h-8 text-primary" />
                        <span className="text-2xl font-bold tracking-tight">BlogAI</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-6">
                        블로그 콘텐츠 자동화의<br />
                        새로운 기준
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-md leading-relaxed">
                        11개의 전문 AI 에이전트가 당신의 블로그 운영을
                        기획부터 배포까지 완벽하게 지원합니다.
                    </p>
                </div>

                <div className="z-10 text-sm text-zinc-500">
                    © 2024 BlogAI Platform. All rights reserved.
                </div>

                {/* Background Decoration */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl opacity-30" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl opacity-30" />
            </div>

            {/* Right Column: Login Form */}
            <div className="flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-[400px] space-y-10">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">로그인</h2>
                        <p className="text-zinc-500">
                            서비스 이용을 위해 계정으로 로그인해 주세요.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <KakaoLoginButton />

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-zinc-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-zinc-400">Secure Access</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <Link
                            href="/admin/login"
                            className="group flex items-center justify-between p-4 rounded-lg border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 transition-all duration-200"
                        >
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-zinc-900">관리자 계정</p>
                                <p className="text-xs text-zinc-500">플랫폼 관리자용 로그인</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
