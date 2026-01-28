'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Loader2, AlertCircle, FileText, Download, Copy, TrendingUp, Search, PenTool, Eye, Globe, Target, Users, Shield, Smartphone } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

interface WorkflowStatusProps {
  workflowId: string
}

interface WorkflowData {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  current_step: number
  total_steps: number
  error_message?: string
  content?: {
    title: string
    status: string
  }
  agent_executions?: Array<{
    agent_type: string
    status: string
    execution_time?: number
    tokens_used?: number
    error_message?: string
  }>
  final_result?: any
}

const AGENT_ICONS: Record<string, any> = {
  'trend_keyword': TrendingUp,
  'content_planning': FileText,
  'seo_optimization': Search,
  'copywriting': PenTool,
  'content_writing': FileText,
  'visual_design': Eye,
  'local_seo': Globe,
  'answer_optimization': Target,
  'marketing_funnel': Users,
  'brand_supervision': Shield,
  'blog_deployment': Smartphone
}

const AGENT_NAMES: Record<string, string> = {
  'trend_keyword': '트렌드 키워드',
  'content_planning': '콘텐츠 기획',
  'seo_optimization': 'SEO 최적화',
  'copywriting': '카피라이팅',
  'content_writing': '콘텐츠 작성',
  'visual_design': '시각 디자인',
  'local_seo': '로컬 SEO',
  'answer_optimization': '답변 최적화',
  'marketing_funnel': '마케팅 퍼널',
  'brand_supervision': '브랜드 감독',
  'blog_deployment': '블로그 배포'
}

export default function WorkflowStatus({ workflowId }: WorkflowStatusProps) {
  const [workflow, setWorkflow] = useState<WorkflowData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWorkflowStatus = async () => {
      try {
        const response = await fetch(`/api/workflows?workflowId=${workflowId}`)
        const data = await response.json()
        setWorkflow(data.workflow)
      } catch (error) {
        console.error('Failed to fetch workflow status:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkflowStatus()

    const interval = setInterval(() => {
      if (workflow?.status === 'running') {
        fetchWorkflowStatus()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [workflowId, workflow?.status])

  if (loading) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">워크플로우 상태를 불러오는 중...</p>
        </CardContent>
      </Card>
    )
  }

  if (!workflow) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="flex items-center gap-2 py-6 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p>워크플로우 정보를 찾을 수 없습니다.</p>
        </CardContent>
      </Card>
    )
  }

  const progress = (workflow.current_step / workflow.total_steps) * 100
  const isCompleted = workflow.status === 'completed'
  const isFailed = workflow.status === 'failed'

  return (
    <div className="space-y-6">
      <Card className="card-enhanced border-t-4 border-t-primary">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                {isCompleted ? <CheckCircle2 className="text-green-500 h-5 w-5" /> : 
                 isFailed ? <AlertCircle className="text-destructive h-5 w-5" /> :
                 <Loader2 className="animate-spin text-primary h-5 w-5" />}
                {isCompleted ? "콘텐츠 생성 완료" : isFailed ? "오류 발생" : "AI 에이전트 작업 중"}
              </CardTitle>
              <CardDescription className="mt-1">
                {workflow.content?.title || "제목 없음"}
              </CardDescription>
            </div>
            <Badge variant={isCompleted ? "default" : isFailed ? "destructive" : "secondary"} className="text-xs">
              {workflow.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>진행률 ({Math.round(progress)}%)</span>
              <span>{workflow.current_step} / {workflow.total_steps} 단계</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">에이전트 실행 파이프라인</h4>
            <div className="relative border-l-2 border-muted ml-3 space-y-6 pb-2">
              {workflow.agent_executions?.map((execution, index) => {
                const AgentIcon = AGENT_ICONS[execution.agent_type] || FileText
                const isCurrent = execution.status === 'processing'
                const isDone = execution.status === 'completed'
                const isError = execution.status === 'error'

                return (
                  <div key={index} className={`relative pl-6 transition-all duration-300 ${isCurrent ? 'scale-[1.02] origin-left' : ''}`}>
                    <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 flex items-center justify-center
                      ${isDone ? 'bg-primary border-primary' : 
                        isCurrent ? 'bg-primary/20 border-primary' : 
                        isError ? 'bg-destructive border-destructive' :
                        'bg-background border-muted'}`} 
                    >
                      {isCurrent && <span className="absolute h-2 w-2 rounded-full bg-primary animate-ping" />}
                    </div>
                    
                    <div className={`flex items-start justify-between p-3 rounded-lg border 
                      ${isCurrent ? 'bg-primary/5 border-primary/50 shadow-[0_0_12px_-2px_hsl(var(--primary)/0.25)]' : 
                        isDone ? 'bg-background border-border/50' : 
                        isError ? 'bg-destructive/5 border-destructive/30' :
                        'bg-muted/30 border-border/30'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-md transition-colors
                          ${isCurrent ? 'bg-primary/20 text-primary' : 
                            isDone ? 'bg-primary/10 text-primary/70' :
                            isError ? 'bg-destructive/10 text-destructive' :
                            'bg-muted text-muted-foreground'}`}>
                          <AgentIcon className={`h-4 w-4 ${isCurrent ? 'animate-pulse' : ''}`} />
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${isCurrent ? 'text-primary' : isDone ? 'text-foreground' : ''}`}>
                            {AGENT_NAMES[execution.agent_type] || execution.agent_type}
                          </p>
                          <p className={`text-xs ${isError ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {isCurrent ? '⏳ 작업 수행 중...' : isDone ? '✓ 완료됨' : isError ? '✕ 오류 발생' : '대기 중'}
                          </p>
                        </div>
                      </div>
                      
                      {isDone && (
                        <div className="text-right text-[10px] text-muted-foreground">
                          <div>{execution.execution_time}ms</div>
                          <div>{execution.tokens_used} tokens</div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {isCompleted && workflow.final_result && (
        <Card className="border-green-100 bg-green-50/30">
          <CardHeader>
            <CardTitle className="text-lg">결과물 미리보기</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-sm max-w-none bg-white p-6 rounded-lg border shadow-sm">
              <h1 className="text-2xl font-bold mb-4">{workflow.final_result.content?.title}</h1>
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {workflow.final_result.content?.fullContent?.substring(0, 500)}...
              </div>
              <div className="mt-4 pt-4 border-t flex justify-center">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  전체 내용 보기
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button className="flex-1 btn-primary-enhanced" onClick={() => {
                 const content = workflow.final_result?.content?.fullContent || ''
                 navigator.clipboard.writeText(content)
                 alert('복사되었습니다!')
              }}>
                <Copy className="w-4 h-4 mr-2" />
                복사하기
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => {
                const content = workflow.final_result?.content?.fullContent || ''
                const blob = new Blob([content], { type: 'text/plain' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${workflow.content?.title || 'content'}.txt`
                a.click()
              }}>
                <Download className="w-4 h-4 mr-2" />
                다운로드
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
