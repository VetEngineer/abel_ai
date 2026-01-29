'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getBrowserSupabaseClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { FileText, PlusCircle, ArrowRight, Loader2, Calendar, Layout } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Project {
    id: string
    name: string
    description: string
    created_at: string
    status?: string // Optional, depends on schema
    content?: {
        id: string
        status: string
    }[]
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        try {
            const supabase = getBrowserSupabaseClient()
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) return

            // 프로젝트와 관련된 콘텐츠 상태를 함께 가져오면 좋지만,
            // 일단 프로젝트 목록만 가져옵니다.
            const { data, error } = await supabase
                .from('projects')
                .select(`
          *,
          content (
            id,
            status
          )
        `)
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })

            if (error) throw error

            setProjects(data || [])
        } catch (error) {
            console.error('Failed to fetch projects:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
            case 'published':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">완료</Badge>
            case 'in_progress':
            case 'running':
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">진행 중</Badge>
            case 'failed':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">실패</Badge>
            default:
                return <Badge variant="secondary">대기</Badge>
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">프로젝트 목록</h1>
                    <p className="text-muted-foreground mt-1">
                        생성된 블로그 콘텐츠 프로젝트를 관리합니다.
                    </p>
                </div>
                <Button asChild className="btn-primary-enhanced">
                    <Link href="/dashboard/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        새 프로젝트 생성
                    </Link>
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-6 w-[40%]">프로젝트 명</TableHead>
                                <TableHead>마지막 상태</TableHead>
                                <TableHead>생성일</TableHead>
                                <TableHead className="text-right pr-6">관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {projects.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-40 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <Layout className="w-10 h-10 mb-2 opacity-20" />
                                            <p className="mb-4">아직 생성된 프로젝트가 없습니다.</p>
                                            <Button variant="outline" asChild size="sm">
                                                <Link href="/dashboard/new">첫 번째 글 작성하기</Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                projects.map((project) => {
                                    // 가장 최근 콘텐츠 상태 확인
                                    const lastContent = project.content?.[0]
                                    const status = lastContent?.status || 'draft'

                                    return (
                                        <TableRow key={project.id} className="group hover:bg-muted/5">
                                            <TableCell className="pl-6">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-base group-hover:text-primary transition-colors">
                                                        {project.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                                                        {project.description}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(status)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                                    {format(new Date(project.created_at), 'yyyy.MM.dd', { locale: ko })}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/dashboard/projects/${project.id}`}>
                                                        상세보기 <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
