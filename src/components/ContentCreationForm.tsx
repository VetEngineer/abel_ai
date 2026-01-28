'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Bot, Briefcase, Users, Target, Sparkles, MessageSquare, ArrowRight } from 'lucide-react'

interface ContentCreationFormProps {
  projectId: string
  onWorkflowCreated: (workflowId: string) => void
}

export default function ContentCreationForm({ projectId, onWorkflowCreated }: ContentCreationFormProps) {
  const [formData, setFormData] = useState({
    topic: '',
    industry: '',
    targetAudience: '',
    brandVoice: '',
    contentGoals: '',
    specialization: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const contentResponse = await fetch('/api/demo/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          title: `${formData.topic} - 자동 생성 콘텐츠`,
          status: 'draft'
        })
      })

      const contentData = await contentResponse.json()

      if (!contentResponse.ok) throw new Error(contentData.error || '콘텐츠 생성 실패')

      const workflowResponse = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          contentId: contentData.id,
          ...formData
        })
      })

      const workflowData = await workflowResponse.json()

      if (!workflowResponse.ok) throw new Error(workflowData.error || '워크플로우 시작 실패')

      onWorkflowCreated(workflowData.workflowId)
      setFormData({
        topic: '',
        industry: '',
        targetAudience: '',
        brandVoice: '',
        contentGoals: '',
        specialization: ''
      })

    } catch (error) {
      console.error('Content creation error:', error)
      alert('오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="card-enhanced border-none shadow-lg overflow-hidden">
      <div className="bg-primary/5 p-6 border-b border-primary/10">
        <CardHeader className="p-0">
          <CardTitle className="flex items-center gap-2 text-2xl text-primary">
            <Sparkles className="w-6 h-6" />
            콘텐츠 생성 설정
          </CardTitle>
          <CardDescription className="text-base mt-2">
            AI 에이전트에게 지시할 핵심 정보를 입력해주세요.
          </CardDescription>
        </CardHeader>
      </div>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 핵심 정보 섹션 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4" /> 핵심 정보
            </h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <label htmlFor="topic" className="text-sm font-medium text-foreground">
                  콘텐츠 주제 <span className="text-destructive">*</span>
                </label>
                <Input
                  id="topic"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="예: 2024년 디지털 마케팅 트렌드 분석"
                  required
                  className="input-enhanced h-12 text-lg"
                />
                <p className="text-xs text-muted-foreground">구체적일수록 더 정확한 콘텐츠가 생성됩니다.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="specialization" className="text-sm font-medium text-foreground">
                    전문 분야
                  </label>
                  <Select value={formData.specialization} onValueChange={(value) => setFormData({ ...formData, specialization: value })}>
                    <SelectTrigger className="input-enhanced">
                      <SelectValue placeholder="분야 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medical">의료/건강</SelectItem>
                      <SelectItem value="legal">법률/특허</SelectItem>
                      <SelectItem value="tax">세무/회계</SelectItem>
                      <SelectItem value="marketing">마케팅/브랜딩</SelectItem>
                      <SelectItem value="consulting">비즈니스 컨설팅</SelectItem>
                      <SelectItem value="finance">금융/투자</SelectItem>
                      <SelectItem value="education">교육/학문</SelectItem>
                      <SelectItem value="it">IT/테크</SelectItem>
                      <SelectItem value="other">기타 전문직</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="targetAudience" className="text-sm font-medium text-foreground">
                    타겟 독자
                  </label>
                  <Input
                    id="targetAudience"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    placeholder="예: 30대 직장인, 스타트업 CEO"
                    className="input-enhanced"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 스타일 및 목표 섹션 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> 스타일 및 목표
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <label htmlFor="brandVoice" className="text-sm font-medium text-foreground">
                  브랜드 톤앤매너
                </label>
                <Select value={formData.brandVoice} onValueChange={(value) => setFormData({ ...formData, brandVoice: value })}>
                  <SelectTrigger className="input-enhanced">
                    <SelectValue placeholder="스타일 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">전문적이고 신뢰감 있는</SelectItem>
                    <SelectItem value="friendly_expert">친근한 전문가 스타일</SelectItem>
                    <SelectItem value="authoritative">권위있고 무게감 있는</SelectItem>
                    <SelectItem value="approachable">쉽고 대중적인</SelectItem>
                    <SelectItem value="storytelling">스토리텔링 중심의</SelectItem>
                    <SelectItem value="witty">위트있고 트렌디한</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="contentGoals" className="text-sm font-medium text-foreground">
                  주요 목표
                </label>
                <Input
                  id="contentGoals"
                  value={formData.contentGoals}
                  onChange={(e) => setFormData({ ...formData, contentGoals: e.target.value })}
                  placeholder="예: 상담 문의 유도, 정보 전달"
                  className="input-enhanced"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading || !formData.topic}
              className="w-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all btn-primary-enhanced group"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  11개 에이전트 호출 중...
                </>
              ) : (
                <>
                  <Bot className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                  콘텐츠 생성 시작
                  <ArrowRight className="w-5 h-5 ml-2 opacity-70 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-3">
              평균 소요 시간: 1-2분 | 예상 토큰 절감: 75%
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
