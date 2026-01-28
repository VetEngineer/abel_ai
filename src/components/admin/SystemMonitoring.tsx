import Link from 'next/link'
import RealTimeLog from '@/components/admin/RealTimeLog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SystemMonitoring() {
  return (
    <div className="space-y-6">
      <Card className="card-enhanced border-none shadow-md bg-muted/20">
        <CardHeader>
          <CardTitle>시스템 모니터링</CardTitle>
          <CardDescription>
            시스템의 실시간 로그와 상태를 모니터링합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RealTimeLog />
        </CardContent>
      </Card>
    </div>
  )
}