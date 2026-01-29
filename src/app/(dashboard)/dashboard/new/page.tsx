'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ContentCreationForm from '@/components/ContentCreationForm'

export default function NewProjectPage() {
    const router = useRouter()
    // 실제 유저의 경우 API에서 프로젝트를 생성하므로, 여기서는 임시 ID나 더미를 전달
    // 단, ContentCreationForm이 projectId를 필수로 요구하므로 임시 UUID 생성
    const tempProjectId = 'temp-' + Date.now()

    const handleWorkflowCreated = (workflowId: string) => {
        // 워크플로우 생성이 완료되면(API 호출 성공),
        // 해당 워크플로우의 상세 페이지나 프로젝트 목록으로 이동
        // 하지만 현재 API 응답에는 realProjectId가 포함되지 않을 수 있음 (route.ts 수정 필요 가능성)
        // 일단 프로젝트 목록으로 이동
        router.push('/dashboard/projects')
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">새 프로젝트 생성</h1>
                <p className="text-muted-foreground mt-1">
                    AI 에이전트를 사용하여 새로운 블로그 콘텐츠를 기획하고 작성합니다.
                </p>
            </div>

            <div className="grid gap-6">
                <Card className="border-none shadow-md card-enhanced">
                    <CardHeader>
                        <CardTitle>콘텐츠 설정</CardTitle>
                        <CardDescription>
                            생성할 콘텐츠의 주제와 타겟, 브랜드 톤을 설정해주세요.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ContentCreationForm
                            projectId={tempProjectId}
                            onWorkflowCreated={handleWorkflowCreated}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
