'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation' // Correct hook for App Router params? No, useParams.
import { getBrowserSupabaseClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft, Calendar, FileText, Globe } from 'lucide-react'
import WorkflowStatus from '@/components/WorkflowStatus'

interface ProjectDetail {
    id: string
    name: string
    description: string
    created_at: string
    content?: {
        id: string
        title: string
        status: string
        content?: string
    }[]
    workflows?: {
        id: string
        status: string
    }[]
}

export default function ProjectDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [project, setProject] = useState<ProjectDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [latestWorkflowId, setLatestWorkflowId] = useState<string | null>(null)

    useEffect(() => {
        if (params.id) {
            fetchProject(params.id as string)
        }
    }, [params.id])

    const fetchProject = async (id: string) => {
        try {
            const supabase = getBrowserSupabaseClient()

            const { data, error } = await supabase
                .from('projects')
                .select(`
          *,
          content (*),
          workflows (*)
        `)
                .eq('id', id)
                .single()

            if (error) throw error

            setProject(data)

            // 가장 최근 워크플로우 ID 찾기
            if (data.workflows && data.workflows.length > 0) {
                // created_at 기준 정렬 로직이 필요할 수 있음
                const sorted = data.workflows.sort((a: any, b: any) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )
                setLatestWorkflowId(sorted[0].id)
            }
        } catch (error) {
            console.error('Failed to fetch project:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>
    }

    if (!project) {
        return <div className="p-20 text-center">프로젝트를 찾을 수 없습니다.</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{project.name}</h1>
                    <p className="text-muted-foreground text-sm">{project.description}</p>
                </div>
                <div className="ml-auto">
                    <Badge variant="outline">{project.content?.[0]?.status || 'Draft'}</Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* 콘텐츠 내용 미리보기 (완료된 경우) */}
                    {project.content?.[0]?.content ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="w-5 h-5" /> 생성된 콘텐츠
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose max-w-none dark:prose-invert bg-muted/30 p-6 rounded-lg max-h-[600px] overflow-y-auto">
                                    <div dangerouslySetInnerHTML={{ __html: project.content[0].content }} />
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-10 border rounded-lg bg-muted/10">
                            <p className="text-muted-foreground">콘텐츠가 생성 중이거나 없습니다.</p>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">상세 정보</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">생성일</span>
                                <span>{new Date(project.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">플랫폼</span>
                                <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Blog</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 워크플로우 상태 컴포넌트 재사용 */}
                    {latestWorkflowId && (
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm px-1">진행 상황</h3>
                            <WorkflowStatus workflowId={latestWorkflowId} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
