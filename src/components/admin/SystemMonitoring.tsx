'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SystemMonitoring() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>시스템 모니터링</CardTitle>
        <CardDescription>
          시스템 성능과 상태를 실시간으로 모니터링합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">시스템 모니터링 기능이 곧 추가될 예정입니다.</p>
      </CardContent>
    </Card>
  )
}