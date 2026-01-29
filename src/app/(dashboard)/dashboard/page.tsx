'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, FileText, TrendingUp, Clock } from 'lucide-react'

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
                    <p className="text-muted-foreground mt-1">블로그 자동화 프로젝트 현황을 한눈에 확인하세요.</p>
                </div>
                <Button asChild className="btn-primary-enhanced">
                    <Link href="/dashboard/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        새 프로젝트 생성
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">총 프로젝트</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">지난 달 대비 +0%</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">발행된 포스트</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">지난 30일 동안</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">토큰 절감 효과</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0%</div>
                        <p className="text-xs text-muted-foreground">평균 처리 시간 -0%</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>최근 프로젝트</CardTitle>
                        <CardDescription>최근 생성된 5개의 프로젝트입니다.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-48 text-muted-foreground">
                            아직 생성된 프로젝트가 없습니다.
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>빠른 시작</CardTitle>
                        <CardDescription>자주 사용하는 기능으로 바로 이동하세요.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <Button variant="outline" className="w-full justify-start h-12" asChild>
                            <Link href="/dashboard/new">
                                <PlusCircle className="mr-2 h-5 w-5 text-primary" />
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold">새 블로그 글 작성</span>
                                    <span className="text-xs font-normal text-muted-foreground">AI 에이전트로 새 콘텐츠 생성</span>
                                </div>
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start h-12" asChild>
                            <Link href="/dashboard/projects">
                                <FileText className="mr-2 h-5 w-5 text-blue-500" />
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold">작성 내역 확인</span>
                                    <span className="text-xs font-normal text-muted-foreground">과거 프로젝트 목록 조회</span>
                                </div>
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
