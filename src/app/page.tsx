'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  Bot,
  Zap,
  Smartphone,
  Users,
  TrendingUp,
  FileText,
  Search,
  PenTool,
  Eye,
  Globe,
  Target,
  Shield,
  Menu,
  ChevronRight,
  Play,
  Settings
} from 'lucide-react'
import ContentCreationForm from '@/components/ContentCreationForm'
import WorkflowStatus from '@/components/WorkflowStatus'
import DataExporter from '@/components/DataExporter'

export default function Home() {
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null)
  const [showDemo, setShowDemo] = useState(false)

  // 데모용 프로젝트 ID (실제로는 사용자 인증 후 프로젝트 선택)
  const demoProjectId = '550e8400-e29b-41d4-a716-446655440001'

  const handleWorkflowCreated = (workflowId: string) => {
    setCurrentWorkflowId(workflowId)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Bot className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold">BlogAI</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                기능
              </a>
              <a href="#agents" className="text-muted-foreground hover:text-foreground transition-colors">
                에이전트
              </a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                요금제
              </a>
              <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </a>
              <Button variant="outline" asChild>
                <a href="/admin">관리자 패널</a>
              </Button>
              <Button onClick={() => setShowDemo(true)}>
                <Play className="w-4 h-4 mr-2" />
                데모 시작
              </Button>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>BlogAI</SheetTitle>
                    <SheetDescription>
                      AI 기반 블로그 콘텐츠 자동화 플랫폼
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    <a href="#features" className="block py-2 text-lg">기능</a>
                    <a href="#agents" className="block py-2 text-lg">에이전트</a>
                    <a href="#pricing" className="block py-2 text-lg">요금제</a>
                    <a href="#faq" className="block py-2 text-lg">FAQ</a>
                    <Separator />
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/admin">관리자 패널</a>
                    </Button>
                    <Button onClick={() => setShowDemo(true)} className="w-full">
                      <Play className="w-4 h-4 mr-2" />
                      데모 시작
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {showDemo ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <Button
                variant="outline"
                onClick={() => setShowDemo(false)}
                className="mb-4"
              >
                ← 메인으로 돌아가기
              </Button>
              <h1 className="text-3xl font-bold mb-4">AI 블로그 콘텐츠 생성 데모</h1>
              <p className="text-muted-foreground">
                아래 폼을 통해 실제 AI 에이전트들이 블로그 콘텐츠를 생성하는 과정을 확인해보세요.
              </p>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ContentCreationForm
                  projectId={demoProjectId}
                  onWorkflowCreated={handleWorkflowCreated}
                />

                {currentWorkflowId && (
                  <WorkflowStatus workflowId={currentWorkflowId} />
                )}

                {!currentWorkflowId && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="w-5 h-5" />
                        워크플로우 상태
                      </CardTitle>
                      <CardDescription>
                        좌측 폼에서 콘텐츠 생성을 시작하면 11개 에이전트의 작업 상태를 실시간으로 확인할 수 있습니다.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mt-4 space-y-4">
                        <div className="text-sm font-medium">실행 예정 에이전트:</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {[
                            { icon: TrendingUp, name: "트렌드 키워드" },
                            { icon: FileText, name: "콘텐츠 기획" },
                            { icon: Search, name: "SEO 최적화" },
                            { icon: PenTool, name: "카피라이팅" },
                            { icon: FileText, name: "콘텐츠 작성" },
                            { icon: Eye, name: "시각 디자인" },
                            { icon: Globe, name: "로컬 SEO" },
                            { icon: Target, name: "답변 최적화" },
                            { icon: Users, name: "마케팅 퍼널" },
                            { icon: Shield, name: "브랜드 감독" },
                            { icon: Smartphone, name: "블로그 배포" }
                          ].map((agent, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 rounded-lg border">
                              <agent.icon className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{index + 1}. {agent.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <DataExporter />
            </div>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <section className="relative overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="pt-20 pb-16 text-center lg:pt-32">
                  <div className="mx-auto max-w-4xl">
                    <Badge variant="outline" className="mb-4">
                      <Zap className="w-4 h-4 mr-1" />
                      AI 기반 자동화 플랫폼
                    </Badge>
                    <h1 className="mx-auto max-w-4xl font-display text-5xl font-medium tracking-tight text-foreground sm:text-7xl">
                      블로그 콘텐츠를{' '}
                      <span className="relative whitespace-nowrap text-primary">
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 418 42"
                          className="absolute left-0 top-2/3 h-[0.58em] w-full fill-primary/30"
                          preserveAspectRatio="none"
                        >
                          <path d="m203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z" />
                        </svg>
                        <span className="relative">자동화</span>
                      </span>{' '}
                      하세요
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-muted-foreground">
                      11개의 전문 AI 에이전트가 키워드 분석부터 블로그 배포까지 모든 과정을 자동으로 처리합니다.
                      토큰 사용량을 60-75% 절약하면서도 고품질 콘텐츠를 생성합니다.
                    </p>
                    <div className="mt-10 flex justify-center gap-x-6">
                      <Button size="lg" onClick={() => setShowDemo(true)}>
                        <Play className="w-4 h-4 mr-2" />
                        무료로 시작하기
                      </Button>
                      <Button variant="outline" size="lg" asChild>
                        <a href="#features">
                          자세히 보기
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Background Pattern */}
              <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute left-[50%] top-0 ml-[-38rem] h-[25rem] w-[81.25rem] dark:[mask-image:linear-gradient(white,transparent)]">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-60 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] dark:from-primary/10 dark:to-accent/10 dark:opacity-100">
                  </div>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 sm:py-32">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    강력한 AI 자동화 기능
                  </h2>
                  <p className="mt-6 text-lg leading-8 text-muted-foreground">
                    블로그 콘텐츠 제작의 모든 단계를 자동화하여 시간을 절약하고 품질을 향상시킵니다.
                  </p>
                </div>

                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                  <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                    <Card className="flex flex-col">
                      <CardHeader>
                        <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                          <Bot className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <CardTitle>11개 전문 에이전트</CardTitle>
                        <CardDescription>
                          트렌드 키워드부터 배포까지 전체 콘텐츠 제작 프로세스를 자동화
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            트렌드 키워드 분석
                          </li>
                          <li className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            콘텐츠 기획 및 구조화
                          </li>
                          <li className="flex items-center gap-2">
                            <Search className="w-4 h-4 text-primary" />
                            SEO 최적화
                          </li>
                          <li className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-primary" />
                            다중 플랫폼 배포
                          </li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="flex flex-col">
                      <CardHeader>
                        <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                          <Zap className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <CardTitle>토큰 최적화</CardTitle>
                        <CardDescription>
                          60-75% 토큰 사용량 절약으로 효율적인 AI 활용
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" />
                            에이전트별 핵심 스킬 압축
                          </li>
                          <li className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" />
                            컨텍스트 공유 최소화 (250 토큰)
                          </li>
                          <li className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-primary" />
                            구조화된 데이터 교환
                          </li>
                          <li className="flex items-center gap-2">
                            <Settings className="w-4 h-4 text-primary" />
                            지능적 워크플로우 관리
                          </li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="flex flex-col">
                      <CardHeader>
                        <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                          <Smartphone className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <CardTitle>다중 플랫폼</CardTitle>
                        <CardDescription>
                          워드프레스, 네이버 블로그 등 다양한 플랫폼 지원
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-primary" />
                            워드프레스 완전 자동화
                          </li>
                          <li className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            네이버 블로그 API 연동
                          </li>
                          <li className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            티스토리, 브런치 지원
                          </li>
                          <li className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-primary" />
                            실시간 배포 상태 확인
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </section>

            {/* Agents Section */}
            <section id="agents" className="py-24 sm:py-32 bg-muted/50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    11개 전문 AI 에이전트
                  </h2>
                  <p className="mt-6 text-lg leading-8 text-muted-foreground">
                    각 에이전트는 특정 영역에 최적화되어 최고 품질의 결과물을 생성합니다.
                  </p>
                </div>

                <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 xl:grid-cols-4">
                  {[
                    { icon: TrendingUp, name: "트렌드 키워드", desc: "실시간 키워드 트렌드 분석" },
                    { icon: FileText, name: "콘텐츠 기획", desc: "구조화된 콘텐츠 계획 수립" },
                    { icon: Search, name: "SEO 최적화", desc: "검색엔진 최적화 전략" },
                    { icon: PenTool, name: "카피라이팅", desc: "매력적인 카피 작성" },
                    { icon: FileText, name: "콘텐츠 작성", desc: "고품질 블로그 글 생성" },
                    { icon: Eye, name: "시각 디자인", desc: "이미지 및 레이아웃 설계" },
                    { icon: Globe, name: "로컬 SEO", desc: "지역 기반 SEO 최적화" },
                    { icon: Target, name: "답변 최적화", desc: "사용자 질문 최적화" },
                    { icon: Users, name: "마케팅 퍼널", desc: "고객 여정 설계" },
                    { icon: Shield, name: "브랜드 감독", desc: "브랜드 일관성 관리" },
                    { icon: Smartphone, name: "블로그 배포", desc: "다중 플랫폼 자동 배포" }
                  ].map((agent, index) => (
                    <Card key={index} className="text-center">
                      <CardHeader>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                          <agent.icon className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{agent.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-24 sm:py-32">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    자주 묻는 질문
                  </h2>
                  <p className="mt-6 text-lg leading-8 text-muted-foreground">
                    BlogAI에 대해 궁금한 점들을 확인해보세요.
                  </p>
                </div>

                <div className="mt-16">
                  <Accordion type="single" collapsible className="w-full space-y-4">
                    <AccordionItem value="item-1" className="border rounded-lg px-6">
                      <AccordionTrigger className="text-left">
                        AI 에이전트는 어떻게 작동하나요?
                      </AccordionTrigger>
                      <AccordionContent>
                        11개의 전문 AI 에이전트가 순차적으로 실행되어 키워드 분석부터 콘텐츠 작성, SEO 최적화, 브랜드 감독,
                        그리고 최종 블로그 배포까지 모든 과정을 자동으로 처리합니다. 각 에이전트는 250 토큰 이하의
                        구조화된 데이터만 공유하여 효율성을 극대화합니다.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2" className="border rounded-lg px-6">
                      <AccordionTrigger className="text-left">
                        토큰 사용량이 정말 60-75% 절약되나요?
                      </AccordionTrigger>
                      <AccordionContent>
                        네, 맞습니다. 기존 방식은 전체 컨텍스트를 매번 전달하지만,
                        저희는 에이전트별로 핵심 스킬만 압축하고 구조화된 데이터만 공유합니다.
                        이를 통해 평균적으로 60-75%의 토큰 사용량을 절약할 수 있습니다.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3" className="border rounded-lg px-6">
                      <AccordionTrigger className="text-left">
                        어떤 블로그 플랫폼을 지원하나요?
                      </AccordionTrigger>
                      <AccordionContent>
                        현재 워드프레스, 네이버 블로그, 티스토리, 브런치를 지원합니다.
                        각 플랫폼의 API를 통해 자동으로 콘텐츠를 배포하며,
                        플랫폼별 최적화된 형식으로 콘텐츠를 조정합니다.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-4" className="border rounded-lg px-6">
                      <AccordionTrigger className="text-left">
                        콘텐츠 품질은 어떻게 보장하나요?
                      </AccordionTrigger>
                      <AccordionContent>
                        브랜드 감독 에이전트가 모든 콘텐츠의 브랜드 일관성과 품질을 검토합니다.
                        또한 SEO 최적화, 카피라이팅, 답변 최적화 에이전트들이
                        각각의 전문 영역에서 콘텐츠를 개선하여 높은 품질을 보장합니다.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-5" className="border rounded-lg px-6">
                      <AccordionTrigger className="text-left">
                        설정은 어떻게 하나요?
                      </AccordionTrigger>
                      <AccordionContent>
                        관리자 패널에서 AI API 키를 설정하고, 프로젝트를 생성한 후
                        브랜드 정보와 타겟 오디언스를 입력하면 됩니다.
                        플랫폼 연동은 각 플랫폼의 API 키 또는 인증 정보만 입력하면 자동으로 설정됩니다.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 sm:py-32 bg-primary">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                  <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                    지금 시작해보세요
                  </h2>
                  <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-foreground/80">
                    AI 기반 블로그 자동화로 콘텐츠 제작 시간을 단축하고 품질을 향상시키세요.
                  </p>
                  <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Button
                      size="lg"
                      variant="secondary"
                      onClick={() => setShowDemo(true)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      무료 데모 체험
                    </Button>
                    <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                      <a href="/admin">
                        <Settings className="w-4 h-4 mr-2" />
                        관리자 패널
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center">
                <Bot className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold">BlogAI</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                AI 기반 블로그 콘텐츠 자동화 플랫폼으로
                효율적이고 고품질의 블로그 운영을 시작하세요.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-4">플랫폼</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">기능</a></li>
                <li><a href="#agents" className="hover:text-foreground">AI 에이전트</a></li>
                <li><a href="#pricing" className="hover:text-foreground">요금제</a></li>
                <li><a href="#faq" className="hover:text-foreground">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-4">지원</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/admin" className="hover:text-foreground">관리자 패널</a></li>
                <li><button onClick={() => setShowDemo(true)} className="hover:text-foreground">데모</button></li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col sm:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Built with Next.js, Supabase, and AI Models (Claude, OpenAI, Google AI)
            </p>
            <p className="text-sm text-muted-foreground mt-2 sm:mt-0">
              © 2024 BlogAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}