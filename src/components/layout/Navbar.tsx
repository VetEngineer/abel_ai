'use client'

import { useState } from 'react'
import { Bot, Menu, Play, LogIn, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useRouter } from 'next/navigation'
import { getBrowserSupabaseClient } from '@/lib/supabase/client'

interface NavbarProps {
  onShowDemo: (show: boolean) => void
  session?: any
}

export default function Navbar({ onShowDemo, session }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleDemoClick = () => {
    if (!session) {
      router.push('/login')
      return
    }
    onShowDemo(true)
    setIsOpen(false)
  }

  const handleLinkClick = () => {
    onShowDemo(false)
    setIsOpen(false)
  }

  const handleLoginClick = () => {
    router.push('/login')
    setIsOpen(false)
  }

  const handleLogoutClick = async () => {
    const supabase = getBrowserSupabaseClient()
    if (supabase) {
      await supabase.auth.signOut()
      router.refresh()
      window.location.reload()
    }
    setIsOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div
              className="flex-shrink-0 flex items-center cursor-pointer group"
              onClick={() => onShowDemo(false)}
            >
              <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <span className="ml-2 text-xl font-bold tracking-tight">BlogAI</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              기능
            </a>
            <a href="#agents" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              에이전트
            </a>
            <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              FAQ
            </a>

            {session ? (
              <Button variant="ghost" size="sm" onClick={handleLogoutClick} className="text-muted-foreground">
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={handleLoginClick} className="text-muted-foreground">
                <LogIn className="w-4 h-4 mr-2" />
                로그인
              </Button>
            )}

            <Button size="sm" onClick={handleDemoClick} className="btn-primary-enhanced rounded-full px-5">
              <Play className="w-3.5 h-3.5 mr-2 fill-current" />
              데모 시작
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="px-2 hover:bg-transparent">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%] sm:w-[350px]">
                <SheetHeader className="text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <Bot className="h-6 w-6 text-primary" />
                    <span>BlogAI</span>
                  </SheetTitle>
                  <SheetDescription>
                    AI 기반 블로그 자동화 플랫폼
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-8 space-y-2">
                  <a
                    href="#features"
                    className="flex items-center w-full p-4 text-lg font-semibold rounded-xl hover:bg-muted transition-colors"
                    onClick={handleLinkClick}
                  >
                    주요 기능
                  </a>
                  <a
                    href="#agents"
                    className="flex items-center w-full p-4 text-lg font-semibold rounded-xl hover:bg-muted transition-colors"
                    onClick={handleLinkClick}
                  >
                    AI 에이전트
                  </a>
                  <a
                    href="#faq"
                    className="flex items-center w-full p-4 text-lg font-semibold rounded-xl hover:bg-muted transition-colors"
                    onClick={handleLinkClick}
                  >
                    자주 묻는 질문
                  </a>
                  <Separator className="my-4" />
                  <div className="space-y-3 pt-2">
                    {session ? (
                      <Button variant="outline" onClick={handleLogoutClick} className="w-full h-12 justify-start px-4 text-base rounded-xl">
                        <LogOut className="w-4 h-4 mr-2" />
                        로그아웃
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={handleLoginClick} className="w-full h-12 justify-start px-4 text-base rounded-xl">
                        <LogIn className="w-4 h-4 mr-2" />
                        로그인
                      </Button>
                    )}

                    <Button onClick={handleDemoClick} className="w-full h-12 text-base rounded-xl btn-primary-enhanced">
                      <Play className="w-4 h-4 mr-2 fill-current" />
                      데모 시작하기
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}