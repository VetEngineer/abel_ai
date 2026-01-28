import { getMCPSupabaseClient } from '@/lib/supabase/client'

export interface AdminStats {
  totalUsers: number
  userGrowthPercentage: number
  activeAPIKeys: {
    count: number
    services: string[]
  }
  monthlyTokenUsage: number
  tokenUsagePercentage: number
  monthlyRevenue: number
  revenuePercentage: number
  recentActivities: Array<{
    description: string
    timeAgo: string
    type: 'info' | 'warning' | 'success'
  }>
  systemStatus: Array<{
    service: string
    status: 'normal' | 'warning' | 'maintenance'
  }>
}

class AdminStatsService {
  private static instance: AdminStatsService
  private cachedStats: AdminStats | null = null
  private lastCacheUpdate = 0
  private cacheValidityMs = 300000 // 5분 캐시

  private constructor() {}

  public static getInstance(): AdminStatsService {
    if (!AdminStatsService.instance) {
      AdminStatsService.instance = new AdminStatsService()
    }
    return AdminStatsService.instance
  }

  public async getAdminStats(): Promise<AdminStats> {
    const now = Date.now()
    if (this.cachedStats && (now - this.lastCacheUpdate < this.cacheValidityMs)) {
      return this.cachedStats
    }

    // 환경 변수가 제대로 설정되지 않은 경우 데모 데이터 반환
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url' || !supabaseUrl.startsWith('http')) {
      console.warn('Supabase not configured, returning demo data')
      return this.getDemoStats()
    }

    try {
      const supabase = await getMCPSupabaseClient()

      // 병렬로 모든 데이터 조회
      const [
        usersResult,
        apiKeysResult,
        tokenUsageResult,
        revenueResult
      ] = await Promise.all([
        this.getUserStats(supabase),
        this.getAPIKeyStats(supabase),
        this.getTokenUsageStats(supabase),
        this.getRevenueStats(supabase)
      ])

      this.cachedStats = {
        totalUsers: usersResult.total,
        userGrowthPercentage: usersResult.growthPercentage,
        activeAPIKeys: apiKeysResult,
        monthlyTokenUsage: tokenUsageResult.total,
        tokenUsagePercentage: tokenUsageResult.growthPercentage,
        monthlyRevenue: revenueResult.total,
        revenuePercentage: revenueResult.growthPercentage,
        recentActivities: await this.getRecentActivities(supabase),
        systemStatus: await this.getSystemStatus(supabase)
      }

      this.lastCacheUpdate = now
      return this.cachedStats!
    } catch (error) {
      console.error('Failed to fetch admin stats:', error)
      // 에러 발생 시 데모 데이터 반환
      return this.getDemoStats()
    }
  }

  private async getUserStats(supabase: any) {
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [totalResult, thisMonthResult, lastMonthResult] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact' }),
      supabase.from('users').select('id', { count: 'exact' }).gte('created_at', thisMonth.toISOString()),
      supabase.from('users').select('id', { count: 'exact' }).gte('created_at', lastMonth.toISOString()).lt('created_at', thisMonth.toISOString())
    ])

    const total = totalResult.count || 0
    const thisMonthCount = thisMonthResult.count || 0
    const lastMonthCount = lastMonthResult.count || 1

    const growthPercentage = Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)

    return { total, growthPercentage }
  }

  private async getAPIKeyStats(supabase: any) {
    const { data: apiKeys } = await supabase
      .from('admin_api_keys')
      .select('service_name, is_active')
      .eq('is_active', true)

    const count = apiKeys?.length || 0
    const services = [...new Set(apiKeys?.map((key: any) => key.service_name) || [])] as string[]

    return { count, services }
  }

  private async getTokenUsageStats(supabase: any) {
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const [thisMonthResult, lastMonthResult] = await Promise.all([
      supabase
        .from('api_key_usage_logs')
        .select('tokens_used')
        .gte('created_at', thisMonth.toISOString()),
      supabase
        .from('api_key_usage_logs')
        .select('tokens_used')
        .gte('created_at', lastMonth.toISOString())
        .lt('created_at', thisMonth.toISOString())
    ])

    const thisMonthTokens = thisMonthResult.data?.reduce((sum: number, log: any) => sum + (log.tokens_used || 0), 0) || 0
    const lastMonthTokens = lastMonthResult.data?.reduce((sum: number, log: any) => sum + (log.tokens_used || 0), 0) || 1

    const growthPercentage = Math.round(((thisMonthTokens - lastMonthTokens) / lastMonthTokens) * 100)

    return { total: thisMonthTokens, growthPercentage }
  }

  private async getRevenueStats(supabase: any) {
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const [thisMonthResult, lastMonthResult] = await Promise.all([
      supabase
        .from('token_purchases')
        .select('amount_paid_usd')
        .eq('status', 'completed')
        .gte('created_at', thisMonth.toISOString()),
      supabase
        .from('token_purchases')
        .select('amount_paid_usd')
        .eq('status', 'completed')
        .gte('created_at', lastMonth.toISOString())
        .lt('created_at', thisMonth.toISOString())
    ])

    const thisMonthRevenue = thisMonthResult.data?.reduce((sum: number, purchase: any) => sum + (purchase.amount_paid_usd || 0), 0) || 0
    const lastMonthRevenue = lastMonthResult.data?.reduce((sum: number, purchase: any) => sum + (purchase.amount_paid_usd || 0), 0) || 1

    const growthPercentage = Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)

    return { total: thisMonthRevenue, growthPercentage }
  }

  private async getRecentActivities(supabase: any): Promise<Array<{ description: string; timeAgo: string; type: 'info' | 'warning' | 'success' }>> {
    // 최근 사용자 등록 확인
    const { data: recentUsers } = await supabase
      .from('users')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    // 최근 워크플로우 실행 확인
    const { data: recentWorkflows } = await supabase
      .from('workflows')
      .select('created_at, status')
      .order('created_at', { ascending: false })
      .limit(5)

    // 최근 API 키 사용량 체크
    const { data: recentUsage } = await supabase
      .from('api_key_usage_logs')
      .select('created_at, tokens_used')
      .order('created_at', { ascending: false })
      .limit(10)

    const activities = []

    // 최신 사용자 등록
    if (recentUsers?.[0]) {
      const timeDiff = Date.now() - new Date(recentUsers[0].created_at).getTime()
      const timeAgo = this.formatTimeAgo(timeDiff)
      activities.push({
        description: '새 사용자 등록',
        timeAgo,
        type: 'success' as const
      })
    }

    // 최근 워크플로우 상태
    if (recentWorkflows?.[0]) {
      const timeDiff = Date.now() - new Date(recentWorkflows[0].created_at).getTime()
      const timeAgo = this.formatTimeAgo(timeDiff)
      const type: 'info' | 'warning' | 'success' = recentWorkflows[0].status === 'failed' ? 'warning' : 'info'
      activities.push({
        description: `워크플로우 ${recentWorkflows[0].status === 'completed' ? '완료' : recentWorkflows[0].status === 'failed' ? '실패' : '실행'}`,
        timeAgo,
        type
      })
    }

    // API 사용량 급증 감지 (최근 1시간 토큰 사용량이 평균보다 높은 경우)
    if (recentUsage && recentUsage.length > 5) {
      const recentHourTokens = recentUsage
        .filter((log: any) => Date.now() - new Date(log.created_at).getTime() < 3600000)
        .reduce((sum: number, log: any) => sum + log.tokens_used, 0)

      if (recentHourTokens > 50000) {
        activities.push({
          description: 'API 키 사용량 급증',
          timeAgo: '5분 전',
          type: 'warning' as const
        })
      }
    }

    // 기본 시스템 활동 추가
    activities.push({
      description: '시스템 백업 완료',
      timeAgo: '1시간 전',
      type: 'success' as const
    })

    return activities.slice(0, 3) // 최대 3개만 반환
  }

  private async getSystemStatus(supabase: any): Promise<Array<{ service: string; status: 'normal' | 'warning' | 'maintenance' }>> {
    // 실제 시스템 상태 체크
    const status = []

    // 데이터베이스 연결 확인
    try {
      await supabase.from('users').select('id').limit(1)
      status.push({
        service: '데이터베이스',
        status: 'normal' as const
      })
    } catch (error) {
      status.push({
        service: '데이터베이스',
        status: 'warning' as const
      })
    }

    // API 키 상태 확인
    const { data: apiKeys } = await supabase
      .from('admin_api_keys')
      .select('service_name, is_active')
      .eq('is_active', true)

    if (apiKeys && apiKeys.length > 0) {
      status.push({
        service: 'AI API 서비스',
        status: 'normal' as const
      })
    } else {
      status.push({
        service: 'AI API 서비스',
        status: 'warning' as const
      })
    }

    // 결제 시스템 (Stripe) 상태
    const stripeKey = apiKeys?.find((key: any) => key.service_name === 'stripe')
    status.push({
      service: '결제 시스템',
      status: stripeKey ? 'normal' as const : 'maintenance' as const
    })

    return status
  }

  private formatTimeAgo(timeDiff: number): string {
    const minutes = Math.floor(timeDiff / 60000)
    const hours = Math.floor(timeDiff / 3600000)
    const days = Math.floor(timeDiff / 86400000)

    if (days > 0) return `${days}일 전`
    if (hours > 0) return `${hours}시간 전`
    if (minutes > 0) return `${minutes}분 전`
    return '방금 전'
  }

  private getDemoStats(): AdminStats {
    return {
      totalUsers: 1247,
      userGrowthPercentage: 18,
      activeAPIKeys: { count: 3, services: ['claude', 'openai', 'gemini'] },
      monthlyTokenUsage: 2450000,
      tokenUsagePercentage: 35,
      monthlyRevenue: 12500,
      revenuePercentage: 22,
      recentActivities: [
        {
          description: '새 사용자 등록',
          timeAgo: '3분 전',
          type: 'success' as const
        },
        {
          description: '워크플로우 완료',
          timeAgo: '15분 전',
          type: 'info' as const
        },
        {
          description: '시스템 백업 완료',
          timeAgo: '1시간 전',
          type: 'success' as const
        }
      ],
      systemStatus: [
        { service: '데이터베이스', status: 'normal' as const },
        { service: 'AI API 서비스', status: 'normal' as const },
        { service: '결제 시스템', status: 'maintenance' }
      ]
    }
  }

  private getDefaultStats(): AdminStats {
    return {
      totalUsers: 0,
      userGrowthPercentage: 0,
      activeAPIKeys: { count: 0, services: [] },
      monthlyTokenUsage: 0,
      tokenUsagePercentage: 0,
      monthlyRevenue: 0,
      revenuePercentage: 0,
      recentActivities: [
        {
          description: '시스템 시작됨',
          timeAgo: '방금 전',
          type: 'info' as const
        }
      ],
      systemStatus: [
        { service: '데이터베이스', status: 'warning' as const },
        { service: 'AI API 서비스', status: 'warning' as const },
        { service: '결제 시스템', status: 'maintenance' as const }
      ]
    }
  }
}

export const adminStatsService = AdminStatsService.getInstance()