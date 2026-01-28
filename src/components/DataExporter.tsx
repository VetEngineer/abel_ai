'use client'

import { useState } from 'react'
import {
  Download,
  Database,
  FileJson,
  HardDrive,
  ChevronDown,
  ChevronUp,
  History,
  CheckCircle2,
  Clock,
  Loader2,
  Table
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'

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
      alert('데이터를 불러오는 중 오류가 발생했습니다.')
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
    <Card className="card-enhanced overflow-hidden">
      <CardHeader className="bg-muted/30 pb-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl">데이터 관리 및 내보내기</CardTitle>
              <CardDescription>생성된 모든 콘텐츠 데이터와 워크플로우 이력을 관리합니다.</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={exportAllData} 
            disabled={loading}
            variant="secondary"
            className="flex-1 min-w-[140px]"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <History className="w-4 h-4 mr-2" />}
            이력 불러오기
          </Button>

          <Button 
            onClick={downloadJSON} 
            disabled={!exportData || loading}
            variant="outline"
            className="flex-1 min-w-[140px] border-primary/20 hover:bg-primary/5 hover:text-primary"
          >
            <FileJson className="w-4 h-4 mr-2" />
            JSON 다운로드
          </Button>

          <Button 
            onClick={saveToFile} 
            disabled={loading}
            className="flex-1 min-w-[140px] btn-primary-enhanced"
          >
            <HardDrive className="w-4 h-4 mr-2" />
            서버에 영구 저장
          </Button>
        </div>

        {exportData ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
            <Separator />
            
            {/* 데이터 요약 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border bg-card shadow-sm">
                <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">총 워크플로우</div>
                <div className="text-2xl font-bold text-primary">{exportData.summary?.totalWorkflows || 0}</div>
              </div>
              <div className="p-4 rounded-xl border bg-card shadow-sm">
                <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">생성된 콘텐츠</div>
                <div className="text-2xl font-bold text-primary">{exportData.summary?.totalContents || 0}</div>
              </div>
              <div className="p-4 rounded-xl border bg-card shadow-sm">
                <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">최근 내보내기</div>
                <div className="text-sm font-medium mt-1 truncate">
                   {exportData.summary?.exportedAt ? new Date(exportData.summary.exportedAt).toLocaleTimeString() : '-'}
                </div>
              </div>
            </div>

            {/* 워크플로우 목록 */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <Table className="w-4 h-4" /> 최근 워크플로우 목록
              </h4>
              <div className="rounded-lg border bg-background overflow-hidden">
                <div className="max-h-60 overflow-y-auto divide-y">
                  {Object.values(exportData.workflows || {}).length > 0 ? (
                    Object.values(exportData.workflows || {}).map((workflow: any) => (
                      <div key={workflow.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate">{workflow.content?.title || '제목 없음'}</div>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {new Date(workflow.created_at).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                           <Badge variant={workflow.status === 'completed' ? 'default' : 'secondary'} className="text-[10px] h-5">
                            {workflow.status === 'completed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {workflow.status}
                          </Badge>
                          <div className="text-[10px] text-muted-foreground font-medium">
                            {workflow.current_step}/{workflow.total_steps}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-sm text-muted-foreground">내역이 없습니다.</div>
                  )}
                </div>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="raw-data" className="border-none">
                <AccordionTrigger className="text-xs text-muted-foreground hover:no-underline py-2">
                  데이터 원본 보기 (Raw Data)
                </AccordionTrigger>
                <AccordionContent>
                  <pre className="bg-muted p-4 rounded-lg text-[10px] font-mono overflow-auto max-h-60 border">
                    {JSON.stringify(exportData, null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ) : (
          <div className="py-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
             <Database className="w-12 h-12 mb-3 opacity-20" />
             <p className="text-sm font-medium">관리할 데이터를 불러와주세요.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
