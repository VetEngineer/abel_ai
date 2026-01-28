'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Home, ArrowLeft, LogOut } from 'lucide-react'
import APIKeyManagement from '@/components/admin/APIKeyManagement'
import UserManagement from '@/components/admin/UserManagement'
import SystemMonitoring from '@/components/admin/SystemMonitoring'
import AdminAccountManagement from '@/components/admin/AdminAccountManagement'
import AdminSecuritySettings from '@/components/admin/AdminSecuritySettings'
import { adminStatsService, type AdminStats } from '@/lib/services/admin-stats-service'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [adminUser, setAdminUser] = useState<{ username: string, role: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    verifyAuth()
  }, [])

  useEffect(() => {
    if (authenticated) {
      loadStats()
    }
  }, [authenticated])

  const verifyAuth = async () => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }

    try {
      const response = await fetch('/api/admin/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        localStorage.removeItem('admin_token')
        router.push('/admin/login')
        return
      }

      const data = await response.json()
      setAdminUser(data.user)
      setAuthenticated(true)
    } catch (error) {
      console.error('Auth verification failed:', error)
      localStorage.removeItem('admin_token')
      router.push('/admin/login')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    router.push('/admin/login')
  }

  const loadStats = async () => {
    try {
      const adminStats = await adminStatsService.getAdminStats()
      setStats(adminStats)
    } catch (error) {
      console.error('Failed to load admin stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">인증 확인 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                홈으로
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                뒤로
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                안녕하세요, <span className="font-medium">{adminUser?.username}</span>님
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                로그아웃
              </Button>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">관리자 패널</h1>
          <p className="text-muted-foreground">
            시스템 설정 및 모니터링을 관리합니다.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="api-keys">API 키 관리</TabsTrigger>
            <TabsTrigger value="admin-accounts">관리자 계정</TabsTrigger>
            <TabsTrigger value="users">사용자 관리</TabsTrigger>
            <TabsTrigger value="monitoring">시스템 모니터링</TabsTrigger>
            <TabsTrigger value="security">보안</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-lg">데이터를 불러오는 중...</div>
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
                      <Badge variant={(stats?.userGrowthPercentage ?? 0) >= 0 ? "secondary" : "destructive"}>
                        {(stats?.userGrowthPercentage ?? 0) >= 0 ? '+' : ''}{stats?.userGrowthPercentage ?? 0}%
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.totalUsers.toLocaleString() || '0'}</div>
                      <p className="text-xs text-muted-foreground">전월 대비</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">활성 API 키</CardTitle>
                      <Badge variant="secondary">{stats?.activeAPIKeys.count || 0}</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.activeAPIKeys.count || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {(stats?.activeAPIKeys?.services?.length ?? 0) > 0
                          ? stats?.activeAPIKeys?.services?.map(s => s.toUpperCase()).join(', ')
                          : '연결된 서비스 없음'
                        }
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">월간 토큰 사용량</CardTitle>
                      <Badge variant={(stats?.tokenUsagePercentage ?? 0) >= 0 ? "secondary" : "destructive"}>
                        {(stats?.tokenUsagePercentage ?? 0) >= 0 ? '+' : ''}{stats?.tokenUsagePercentage ?? 0}%
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats?.monthlyTokenUsage
                          ? stats.monthlyTokenUsage >= 1000000
                            ? `${(stats.monthlyTokenUsage / 1000000).toFixed(1)}M`
                            : stats.monthlyTokenUsage >= 1000
                              ? `${(stats.monthlyTokenUsage / 1000).toFixed(1)}K`
                              : stats.monthlyTokenUsage.toLocaleString()
                          : '0'
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">이번 달</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">월 수익</CardTitle>
                      <Badge variant={(stats?.revenuePercentage ?? 0) >= 0 ? "secondary" : "destructive"}>
                        {(stats?.revenuePercentage ?? 0) >= 0 ? '+' : ''}{stats?.revenuePercentage ?? 0}%
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${(stats?.monthlyRevenue || 0).toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">이번 달</p>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>최근 활동</CardTitle>
                  <CardDescription>시스템의 최근 활동 내역</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                      stats.recentActivities.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{activity.description}</span>
                          <Badge variant={
                            activity.type === 'warning' ? 'destructive' :
                              activity.type === 'success' ? 'secondary' : 'outline'
                          }>
                            {activity.timeAgo}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        최근 활동 내역이 없습니다.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>시스템 상태</CardTitle>
                  <CardDescription>현재 시스템 상태 확인</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.systemStatus && stats.systemStatus.length > 0 ? (
                      stats.systemStatus.map((system, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{system.service}</span>
                          <Badge variant={
                            system.status === 'normal' ? 'secondary' :
                              system.status === 'warning' ? 'destructive' : 'outline'
                          }>
                            {system.status === 'normal' ? '정상' :
                              system.status === 'warning' ? '경고' : '점검 중'}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        시스템 상태 정보를 불러올 수 없습니다.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="api-keys">
            <APIKeyManagement />
          </TabsContent>

          <TabsContent value="admin-accounts">
            <AdminAccountManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>


          <TabsContent value="monitoring">
            <SystemMonitoring />
          </TabsContent>

          <TabsContent value="security">
            <AdminSecuritySettings user={adminUser} onUpdate={verifyAuth} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}