'use client'

import { Bot } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface FooterProps {
  onShowDemo: (show: boolean) => void
}

export default function Footer({ onShowDemo }: FooterProps) {
  return (
    <footer className="border-t bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold">BlogAI</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              11개의 전문 AI 에이전트가 협업하여 고품질의 블로그 콘텐츠를 자동으로 생성하고 배포합니다.
              전문가를 위한 가장 효율적인 콘텐츠 자동화 솔루션을 만나보세요.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-4 uppercase tracking-wider">플랫폼</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-primary transition-colors">주요 기능</a></li>
              <li><a href="#agents" className="hover:text-primary transition-colors">AI 에이전트</a></li>
              <li><a href="#pricing" className="hover:text-primary transition-colors">요금제</a></li>
              <li><a href="#faq" className="hover:text-primary transition-colors">자주 묻는 질문</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-4 uppercase tracking-wider">리소스</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">

              <li><button onClick={() => onShowDemo(true)} className="hover:text-primary transition-colors">데모 체험하기</button></li>
              <li><a href="#" className="hover:text-primary transition-colors">문서 (준비중)</a></li>
            </ul>
          </div>
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Built with Next.js, Supabase, and Advanced AI Models (Claude, OpenAI, Google Gemini)
          </p>
          <p className="text-xs text-muted-foreground">
            © 2024 BlogAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
