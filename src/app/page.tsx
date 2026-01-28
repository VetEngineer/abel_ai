'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
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
  ChevronRight,
  Play,
  Settings
} from 'lucide-react'
import ContentCreationForm from '@/components/ContentCreationForm'
import WorkflowStatus from '@/components/WorkflowStatus'
import DataExporter from '@/components/DataExporter'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function Home() {
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null)
  const [showDemo, setShowDemo] = useState(false)

  const demoProjectId = '550e8400-e29b-41d4-a716-446655440001'

  const handleWorkflowCreated = (workflowId: string) => {
    setCurrentWorkflowId(workflowId)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onShowDemo={setShowDemo} />

      <main className="flex-grow">
        {showDemo ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-10">
              <Button
                variant="ghost"
                onClick={() => setShowDemo(false)}
                className="mb-4 group"
              >
                <ChevronRight className="w-4 h-4 mr-1 rotate-180 transition-transform group-hover:-translate-x-1" />
                메인으로 돌아가기
              </Button>
              <h1 className="text-4xl font-extrabold tracking-tight mb-4">AI 블로그 콘텐츠 생성 데모</h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                전문가용 AI 에이전트들이 키워드 분석부터 배포까지 협업하는 과정을 실시간으로 확인해보세요.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              <ContentCreationForm
                projectId={demoProjectId}
                onWorkflowCreated={handleWorkflowCreated}
              />

              <div className="space-y-6">
                {currentWorkflowId ? (
                  <WorkflowStatus workflowId={currentWorkflowId} />
                ) : (
                  <Card className="border-dashed bg-muted/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-primary" />
                        워크플로우 대기 중
                      </CardTitle>
                      <CardDescription>
                        왼쪽의 폼을 작성하고 생성을 시작하면 11개 전문 에이전트가 순차적으로 실행됩니다.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
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
                          <div key={index} className="flex items-center gap-2 p-2.5 rounded-md border bg-background/50 text-sm">
                            <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-secondary text-[10px] font-bold">
                              {index + 1}
                            </span>
                            <agent.icon className="w-4 h-4 text-primary" />
                            <span>{agent.name}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                {currentWorkflowId && <DataExporter />}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center">
                  <Badge variant="secondary" className="mb-6 px-4 py-1 text-sm font-semibold rounded-full border-primary/20 bg-primary/5 text-primary">
                    <Zap className="w-3.5 h-3.5 mr-1.5 fill-primary" />
                    Next-Gen Blog Automation
                  </Badge>
                  <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-8 leading-[1.1]">
                    블로그 콘텐츠의 미래,<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                      AI 에이전트 자동화
                    </span>
                  </h1>
                  <p className="mx-auto mt-6 max-w-2xl text-xl text-muted-foreground leading-relaxed">
                    단순한 텍스트 생성을 넘어, 11개의 전문 AI 에이전트가 
                    브랜드 전략부터 SEO 최적화, 다중 플랫폼 배포까지 완벽하게 처리합니다.
                  </p>
                  <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
                    <Button size="lg" onClick={() => setShowDemo(true)} className="btn-primary-enhanced h-14 px-8 text-lg">
                      <Play className="w-5 h-5 mr-2 fill-current" />
                      무료 데모 시작하기
                    </Button>
                    <Button variant="outline" size="lg" asChild className="h-14 px-8 text-lg">
                      <a href="#features">
                        핵심 기능 살펴보기
                        <ChevronRight className="w-5 h-5 ml-1" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Background Decoration */}
              <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] opacity-30 blur-[120px] bg-gradient-to-b from-primary/40 to-accent/20 rounded-full" />
              </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-muted/30">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">전문가를 위한 독보적인 기능</h2>
                  <p className="text-lg text-muted-foreground">시간은 줄이고, 품질은 높이는 BlogAI만의 자동화 기술력을 경험해보세요.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      icon: Bot,
                      title: "11개 전문 에이전트",
                      desc: "키워드 분석부터 배포까지, 각 분야의 전문 AI가 협업하여 고품질 결과물을 만듭니다.",
                      items: ["트렌드 분석", "SEO 최적화", "브랜드 감수", "자동 배포"]
                    },
                    {
                      icon: Zap,
                      title: "75% 토큰 최적화",
                      desc: "지능적인 컨텍스트 관리로 비용은 낮추고 처리 속도는 혁신적으로 높였습니다.",
                      items: ["압축형 스킬", "구조화 데이터", "비용 절감", "빠른 응답"]
                    },
                    {
                      icon: Globe,
                      title: "다중 플랫폼 배포",
                      desc: "워드프레스, 네이버 블로그 등 다양한 플랫폼에 맞춤형 포맷으로 동시 발행이 가능합니다.",
                      items: ["워드프레스", "네이버 블로그", "티스토리", "브런치"]
                    }
                  ].map((feature, i) => (
                    <Card key={i} className="card-enhanced border-none shadow-lg">
                      <CardHeader>
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                          <feature.icon className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle>{feature.title}</CardTitle>
                        <CardDescription className="text-base">{feature.desc}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="grid grid-cols-2 gap-2">
                          {feature.items.map((item, j) => (
                            <li key={j} className="flex items-center text-sm text-muted-foreground">
                              <Badge variant="outline" className="mr-2 h-1.5 w-1.5 rounded-full p-0 bg-primary border-none" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-24">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center mb-12">자주 묻는 질문</h2>
                <Accordion type="single" collapsible className="space-y-4">
                  {[
                    { q: "AI 에이전트는 어떻게 작동하나요?", a: "11개의 에이전트가 파이프라인 형태로 연결되어 있습니다. 첫 번째 에이전트의 출력이 다음 에이전트의 입력이 되며, 각 단계마다 특화된 AI 모델이 최적의 결과물을 생성합니다." },
                    { q: "기존 AI 글쓰기 도구와 무엇이 다른가요?", a: "단순히 글만 쓰는 것이 아니라, 시장 트렌드를 분석하고 검색 엔진에 최적화하며 브랜드 가이드라인까지 준수하는 '전문가팀'의 역할을 수행한다는 점이 다릅니다." },
                    { q: "기업용으로 커스터마이징이 가능한가요?", a: "네, 기업 고유의 브랜드 보이스와 타겟 오디언스 데이터를 학습시켜 맞춤형 에이전트 워크플로우를 구성할 수 있습니다." }
                  ].map((item, i) => (
                    <AccordionItem key={i} value={`faq-${i}`} className="border rounded-xl px-6 bg-card">
                      <AccordionTrigger className="text-lg font-semibold hover:no-underline">{item.q}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed text-base">{item.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-primary rounded-3xl p-10 md:p-16 text-center text-primary-foreground relative overflow-hidden shadow-2xl">
                  <div className="relative z-10">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">지금 바로 무료로 시작하세요</h2>
                    <p className="text-lg md:text-xl opacity-90 mb-10 max-w-2xl mx-auto">
                      AI 에이전트와 함께라면 블로그 운영이 즐거워집니다. 
                      번거로운 작업은 AI에게 맡기고 전략에 더 집중하세요.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <Button size="lg" variant="secondary" onClick={() => setShowDemo(true)} className="h-14 px-10 text-lg font-bold">
                        데모 체험하기
                      </Button>
                      <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary h-14 px-10 text-lg" asChild>
                        <a href="/admin">관리자 설정</a>
                      </Button>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-background/10 rounded-full blur-3xl" />
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer onShowDemo={setShowDemo} />
    </div>
  )
}
