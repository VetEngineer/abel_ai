'use client'

import { useState } from 'react'

export default function DataExporter() {
  const [exportData, setExportData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const exportAllData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/demo/export')
      const data = await response.json()
      setExportData(data)
    } catch (error) {
      console.error('Export error:', error)
      alert('데이터 내보내기 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const saveToFile = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/demo/export?format=file')
      const data = await response.json()

      if (data.message) {
        alert(`${data.message}\n파일 위치: ${data.localPath}`)
      }
    } catch (error) {
      console.error('File save error:', error)
      alert('파일 저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const downloadJSON = () => {
    if (!exportData) return

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `blog-content-export-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">📂 생성된 콘텐츠 관리</h2>

      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={exportAllData}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? '로딩...' : '📊 데이터 보기'}
          </button>

          <button
            onClick={downloadJSON}
            disabled={!exportData || loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            💾 JSON 다운로드
          </button>

          <button
            onClick={saveToFile}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400"
          >
            📁 서버에 저장
          </button>
        </div>

        {exportData && (
          <div className="mt-6">
            <h3 className="font-medium mb-2">생성된 콘텐츠 요약:</h3>
            <div className="bg-gray-50 p-4 rounded text-sm">
              <p><strong>전체 워크플로우:</strong> {exportData.summary?.totalWorkflows || 0}개</p>
              <p><strong>생성된 콘텐츠:</strong> {exportData.summary?.totalContents || 0}개</p>
              <p><strong>내보낸 시간:</strong> {exportData.summary?.exportedAt}</p>
            </div>

            <div className="mt-4">
              <h4 className="font-medium mb-2">워크플로우 목록:</h4>
              <div className="max-h-40 overflow-y-auto">
                {Object.values(exportData.workflows || {}).map((workflow: any) => (
                  <div key={workflow.id} className="border-b py-2 text-sm">
                    <div className="font-medium">{workflow.content?.title || 'Unknown'}</div>
                    <div className="text-gray-600">
                      상태: {workflow.status} |
                      진행률: {workflow.current_step}/{workflow.total_steps} |
                      생성: {new Date(workflow.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <details className="mt-4">
              <summary className="cursor-pointer font-medium text-blue-600">
                🔍 전체 데이터 보기 (개발자용)
              </summary>
              <pre className="mt-2 bg-gray-100 p-4 rounded text-xs overflow-auto max-h-60">
                {JSON.stringify(exportData, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}