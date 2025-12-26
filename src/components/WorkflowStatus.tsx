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
}

export default function WorkflowStatus({ workflowId }: WorkflowStatusProps) {
  const [workflow, setWorkflow] = useState<WorkflowData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWorkflowStatus = async () => {
      try {
        const response = await fetch(`/api/demo/workflows?workflowId=${workflowId}`)
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
    </div>
  )
}