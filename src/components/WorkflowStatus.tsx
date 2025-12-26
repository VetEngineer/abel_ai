'use client'

import { useState, useEffect } from 'react'

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
  final_result?: {
    content?: {
      title?: string
      introduction?: string
      mainSections?: Array<{
        title: string
        content: string
        keyPoints?: string[]
      }>
      conclusion?: string
      fullContent?: string
    }
    writingMetrics?: {
      wordCount?: number
      readabilityScore?: number
      seoScore?: number
      keywordDensity?: number
    }
  }
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

    // 실행 중인 워크플로우는 주기적으로 업데이트
    const interval = setInterval(() => {
      if (workflow?.status === 'running') {
        fetchWorkflowStatus()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [workflowId, workflow?.status])

  if (loading) {
    return <div className="animate-pulse">워크플로우 상태를 확인하는 중...</div>
  }

  if (!workflow) {
    return <div className="text-red-500">워크플로우를 찾을 수 없습니다.</div>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'running': case 'processing': return 'text-blue-600 bg-blue-100'
      case 'failed': case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const progress = (workflow.current_step / workflow.total_steps) * 100

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">워크플로우 상태</h3>
        {workflow.content && (
          <p className="text-gray-600">콘텐츠: {workflow.content.title}</p>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">진행률</span>
          <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(workflow.status)}`}>
            {workflow.status}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {workflow.current_step} / {workflow.total_steps} 단계 완료
        </p>
      </div>

      {workflow.error_message && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
          <p className="text-red-800 text-sm">오류: {workflow.error_message}</p>
        </div>
      )}

      {workflow.agent_executions && workflow.agent_executions.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">에이전트 실행 상태</h4>
          <div className="space-y-2">
            {workflow.agent_executions.map((execution, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">{execution.agent_type.replace('_', ' ')}</span>
                <div className="flex items-center space-x-2">
                  {execution.execution_time && (
                    <span className="text-xs text-gray-500">{execution.execution_time}ms</span>
                  )}
                  {execution.tokens_used && (
                    <span className="text-xs text-gray-500">{execution.tokens_used} tokens</span>
                  )}
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(execution.status)}`}>
                    {execution.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {workflow.status === 'completed' && workflow.final_result && (
        <div className="mt-6 border-t pt-6">
          <h4 className="text-lg font-semibold mb-4 text-green-600">🎉 콘텐츠 생성 완료!</h4>

          {workflow.final_result.content && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="mb-4">
                <h5 className="font-medium text-lg mb-2">생성된 콘텐츠</h5>
                {workflow.final_result.content.title && (
                  <h6 className="text-xl font-bold mb-3 text-gray-800">
                    {workflow.final_result.content.title}
                  </h6>
                )}
              </div>

              {workflow.final_result.content.introduction && (
                <div className="mb-4">
                  <h6 className="font-medium text-sm text-gray-600 mb-2">도입부</h6>
                  <p className="text-gray-800 leading-relaxed">{workflow.final_result.content.introduction}</p>
                </div>
              )}

              {workflow.final_result.content.mainSections && Array.isArray(workflow.final_result.content.mainSections) && (
                <div className="mb-4">
                  <h6 className="font-medium text-sm text-gray-600 mb-2">주요 섹션</h6>
                  <div className="space-y-4">
                    {workflow.final_result.content.mainSections.map((section: any, index: number) => (
                      <div key={index} className="bg-white p-4 rounded border">
                        <h6 className="font-semibold text-gray-800 mb-2">{section.title}</h6>
                        <p className="text-gray-700 mb-2">{section.content}</p>
                        {section.keyPoints && (
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {section.keyPoints.map((point: string, pointIndex: number) => (
                              <li key={pointIndex}>{point}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {workflow.final_result.content.conclusion && (
                <div className="mb-4">
                  <h6 className="font-medium text-sm text-gray-600 mb-2">결론</h6>
                  <p className="text-gray-800 leading-relaxed">{workflow.final_result.content.conclusion}</p>
                </div>
              )}

              {workflow.final_result.content.fullContent && (
                <div className="mb-4">
                  <h6 className="font-medium text-sm text-gray-600 mb-2">전체 콘텐츠</h6>
                  <div className="bg-white p-4 rounded border max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                      {workflow.final_result.content.fullContent}
                    </pre>
                  </div>
                </div>
              )}

              {workflow.final_result.writingMetrics && (
                <div className="mt-4 pt-4 border-t border-green-300">
                  <h6 className="font-medium text-sm text-gray-600 mb-2">콘텐츠 통계</h6>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {workflow.final_result.writingMetrics.wordCount && (
                      <div className="text-center">
                        <div className="font-semibold text-lg text-green-600">
                          {workflow.final_result.writingMetrics.wordCount.toLocaleString()}
                        </div>
                        <div className="text-gray-500">단어 수</div>
                      </div>
                    )}
                    {workflow.final_result.writingMetrics.readabilityScore && (
                      <div className="text-center">
                        <div className="font-semibold text-lg text-green-600">
                          {workflow.final_result.writingMetrics.readabilityScore}%
                        </div>
                        <div className="text-gray-500">가독성</div>
                      </div>
                    )}
                    {workflow.final_result.writingMetrics.seoScore && (
                      <div className="text-center">
                        <div className="font-semibold text-lg text-green-600">
                          {workflow.final_result.writingMetrics.seoScore}%
                        </div>
                        <div className="text-gray-500">SEO 점수</div>
                      </div>
                    )}
                    {workflow.final_result.writingMetrics.keywordDensity && (
                      <div className="text-center">
                        <div className="font-semibold text-lg text-green-600">
                          {workflow.final_result.writingMetrics.keywordDensity}%
                        </div>
                        <div className="text-gray-500">키워드 밀도</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-green-300 flex flex-wrap gap-2">
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  onClick={() => {
                    const content = workflow.final_result?.content?.fullContent || '콘텐츠를 찾을 수 없습니다.'
                    navigator.clipboard.writeText(content)
                    alert('콘텐츠가 클립보드에 복사되었습니다!')
                  }}
                >
                  📋 복사하기
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    const content = workflow.final_result?.content?.fullContent || '콘텐츠를 찾을 수 없습니다.'
                    const blob = new Blob([content], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `${workflow.content?.title || 'generated-content'}.txt`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                >
                  📁 다운로드
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}