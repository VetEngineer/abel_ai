'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function UserManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>사용자 관리</CardTitle>
        <CardDescription>
          시스템 사용자를 관리하고 권한을 설정합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">사용자 관리 기능이 곧 추가될 예정입니다.</p>
      </CardContent>
    </Card>
  )
}