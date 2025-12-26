'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Bot, Briefcase, Users, Target } from 'lucide-react'

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
      // 먼저 콘텐츠 레코드 생성 (데모 API 사용)
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

      if (!contentResponse.ok) {
        throw new Error(contentData.error || '콘텐츠 생성 실패')
      }

      // 워크플로우 시작 (실제 AI API 사용)
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

      if (!workflowResponse.ok) {
        throw new Error(workflowData.error || '워크플로우 시작 실패')
      }

      onWorkflowCreated(workflowData.workflowId)

      // 폼 초기화
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
      alert('콘텐츠 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          새 콘텐츠 생성
        </CardTitle>
        <CardDescription>
          전문가를 위한 AI 기반 콘텐츠 자동화 시스템
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 콘텐츠 주제 */}
          <div className="space-y-2">
            <label htmlFor="topic" className="text-sm font-medium text-foreground flex items-center gap-2">
              <Target className="w-4 h-4" />
              콘텐츠 주제 *
            </label>
            <Input
              id="topic"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="예: 의료진을 위한 환자 소통 가이드, 법인세 절세 전략, 디지털 마케팅 트렌드"
              required
              className="bg-background"
            />
          </div>

          {/* 전문분야 */}
          <div className="space-y-2">
            <label htmlFor="specialization" className="text-sm font-medium text-foreground flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              전문 분야
            </label>
            <Select value={formData.specialization} onValueChange={(value) => setFormData({ ...formData, specialization: value })}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="귀하의 전문 분야를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="medical">의료 (내과, 외과, 치과, 한의학 등)</SelectItem>
                <SelectItem value="legal">법무 (변호사, 법무사, 행정사)</SelectItem>
                <SelectItem value="tax">세무/회계 (세무사, 회계사, 재무 컨설팅)</SelectItem>
                <SelectItem value="marketing">콘텐츠 마케팅 (디지털 마케터, 브랜드 매니저)</SelectItem>
                <SelectItem value="consulting">컨설팅 (경영, 전략, IT 컨설팅)</SelectItem>
                <SelectItem value="finance">금융 (자산관리, 보험, 투자)</SelectItem>
                <SelectItem value="education">교육 (강사, 교육 기관)</SelectItem>
                <SelectItem value="other">기타 전문직</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 타겟 고객층 */}
          <div className="space-y-2">
            <label htmlFor="targetAudience" className="text-sm font-medium text-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              타겟 고객층
            </label>
            <Input
              id="targetAudience"
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              placeholder="예: 중소기업 CEO, 30-50대 환자, 개인사업자, B2B 의사결정자"
              className="bg-background"
            />
          </div>

          {/* 콘텐츠 목적 */}
          <div className="space-y-2">
            <label htmlFor="contentGoals" className="text-sm font-medium text-foreground">
              콘텐츠 목적 및 목표
            </label>
            <Textarea
              id="contentGoals"
              value={formData.contentGoals}
              onChange={(e) => setFormData({ ...formData, contentGoals: e.target.value })}
              placeholder="예: 신규 고객 유치, 전문성 어필, 서비스 홍보, 고객 교육, 브랜드 인지도 향상"
              className="bg-background min-h-[80px]"
            />
          </div>

          {/* 브랜드 톤앤매너 */}
          <div className="space-y-2">
            <label htmlFor="brandVoice" className="text-sm font-medium text-foreground">
              브랜드 톤앤매너
            </label>
            <Select value={formData.brandVoice} onValueChange={(value) => setFormData({ ...formData, brandVoice: value })}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="브랜드의 커뮤니케이션 스타일을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">전문적이고 신뢰감 있는</SelectItem>
                <SelectItem value="friendly_expert">친근하지만 전문성을 유지하는</SelectItem>
                <SelectItem value="authoritative">권위적이고 학술적인</SelectItem>
                <SelectItem value="approachable">접근하기 쉽고 이해하기 쉬운</SelectItem>
                <SelectItem value="consultative">컨설팅적이고 조언하는</SelectItem>
                <SelectItem value="educational">교육적이고 설명적인</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 제출 버튼 */}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading || !formData.topic}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  AI 에이전트 작업 중...
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4 mr-2" />
                  AI 에이전트로 전문 콘텐츠 생성
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-center">
              <Badge variant="outline" className="text-xs">11개 전문 AI</Badge>
              <span className="text-xs text-muted-foreground">
                전문가급 콘텐츠 자동 생성
              </span>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}