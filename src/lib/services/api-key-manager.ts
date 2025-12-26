import { getMCPSupabaseClient } from '@/lib/supabase/client'
import crypto from 'crypto'

export interface APIKeyConfig {
  id: string
  service_name: 'claude' | 'openai' | 'gemini' | 'stripe'
  api_key: string
  api_key_name: string
  is_active: boolean
  rate_limit_per_minute: number
  monthly_budget_usd: number
  current_month_cost: number
  usage_count: number
  last_used?: string
}

export interface TokenUsage {
  user_id: string
  content_id?: string
  tokens_used: number
  cost_usd: number
  request_type: 'text_generation' | 'image_generation' | 'embedding'
  model_name: string
  prompt_tokens?: number
  completion_tokens?: number
  success: boolean
  error_message?: string
  response_time_ms: number
}

class APIKeyManager {
  private static instance: APIKeyManager
  private apiKeys: Map<string, APIKeyConfig[]> = new Map()
  private lastCacheUpdate = 0
  private cacheValidityMs = 60000 // 1분 캐시

  private constructor() {}

  public static getInstance(): APIKeyManager {
    if (!APIKeyManager.instance) {
      APIKeyManager.instance = new APIKeyManager()
    }
    return APIKeyManager.instance
  }

  // API 키 암호화
  private encryptAPIKey(apiKey: string): string {
    const algorithm = 'aes-256-gcm'
    const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-32-char-key-for-demo-use', 'utf8').slice(0, 32)
    const iv = crypto.randomBytes(16)

    const cipher = crypto.createCipher(algorithm, key)
    let encrypted = cipher.update(apiKey, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    return `${iv.toString('hex')}:${encrypted}`
  }

  // API 키 복호화
  private decryptAPIKey(encryptedKey: string): string {
    try {
      const algorithm = 'aes-256-gcm'
      const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-32-char-key-for-demo-use', 'utf8').slice(0, 32)

      const [ivHex, encrypted] = encryptedKey.split(':')
      const iv = Buffer.from(ivHex, 'hex')

      const decipher = crypto.createDecipher(algorithm, key)
      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')

      return decrypted
    } catch (error) {
      console.error('Failed to decrypt API key:', error)
      return ''
    }
  }

  // 활성화된 API 키 조회 (캐시 활용)
  public async getActiveAPIKey(service: 'claude' | 'openai' | 'gemini' | 'stripe'): Promise<string | null> {
    await this.refreshCacheIfNeeded()

    const serviceKeys = this.apiKeys.get(service)
    if (!serviceKeys || serviceKeys.length === 0) {
      return null
    }

    // 가장 적게 사용된 활성 키를 선택 (로드밸런싱)
    const activeKey = serviceKeys
      .filter(key => key.is_active)
      .sort((a, b) => a.usage_count - b.usage_count)[0]

    return activeKey ? this.decryptAPIKey(activeKey.api_key) : null
  }

  // 캐시 갱신
  private async refreshCacheIfNeeded() {
    const now = Date.now()
    if (now - this.lastCacheUpdate < this.cacheValidityMs) {
      return
    }

    try {
      const supabase = await getMCPSupabaseClient()
      const { data: apiKeys, error } = await supabase
        .from('admin_api_keys')
        .select('*')
        .eq('is_active', true)
        .order('usage_count', { ascending: true })

      if (error) {
        console.error('Failed to fetch API keys:', error)
        return
      }

      // 서비스별로 그룹화
      this.apiKeys.clear()
      apiKeys?.forEach((key: APIKeyConfig) => {
        const existing = this.apiKeys.get(key.service_name) || []
        existing.push(key)
        this.apiKeys.set(key.service_name, existing)
      })

      this.lastCacheUpdate = now
    } catch (error) {
      console.error('Error refreshing API key cache:', error)
    }
  }

  // API 키 추가/업데이트 (관리자용)
  public async upsertAPIKey(config: Omit<APIKeyConfig, 'id'> & { id?: string }): Promise<boolean> {
    try {
      const supabase = await getMCPSupabaseClient()
      const encryptedKey = this.encryptAPIKey(config.api_key)

      const data = {
        ...config,
        api_key: encryptedKey
      }

      let result
      if (config.id) {
        // 업데이트
        result = await supabase
          .from('admin_api_keys')
          .update(data)
          .eq('id', config.id)
      } else {
        // 새로 추가
        result = await supabase
          .from('admin_api_keys')
          .insert([data])
      }

      if (result.error) {
        console.error('Failed to upsert API key:', result.error)
        return false
      }

      // 캐시 무효화
      this.lastCacheUpdate = 0
      return true
    } catch (error) {
      console.error('Error upserting API key:', error)
      return false
    }
  }

  // API 키 삭제 (관리자용)
  public async deleteAPIKey(keyId: string): Promise<boolean> {
    try {
      const supabase = await getMCPSupabaseClient()
      const { error } = await supabase
        .from('admin_api_keys')
        .delete()
        .eq('id', keyId)

      if (error) {
        console.error('Failed to delete API key:', error)
        return false
      }

      // 캐시 무효화
      this.lastCacheUpdate = 0
      return true
    } catch (error) {
      console.error('Error deleting API key:', error)
      return false
    }
  }

  // 토큰 사용량 기록
  public async recordTokenUsage(apiKeyId: string, usage: TokenUsage): Promise<boolean> {
    try {
      const supabase = await getMCPSupabaseClient()
      const { error } = await supabase
        .from('api_key_usage_logs')
        .insert([{
          api_key_id: apiKeyId,
          ...usage
        }])

      if (error) {
        console.error('Failed to record token usage:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error recording token usage:', error)
      return false
    }
  }

  // 사용자 토큰 잔액 확인
  public async getUserTokenBalance(userId: string): Promise<number> {
    try {
      const supabase = await getMCPSupabaseClient()
      const { data, error } = await supabase
        .from('users')
        .select('token_balance')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Failed to get user token balance:', error)
        return 0
      }

      return data?.token_balance || 0
    } catch (error) {
      console.error('Error getting user token balance:', error)
      return 0
    }
  }

  // 토큰 가격 조회
  public async getTokenPrice(service: string, model: string): Promise<{ input: number; output: number; image?: number }> {
    try {
      const supabase = await getMCPSupabaseClient()
      const { data, error } = await supabase
        .from('token_pricing')
        .select('*')
        .eq('service_name', service)
        .eq('model_name', model)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        // 기본값 반환
        return { input: 0.000001, output: 0.000002 }
      }

      return {
        input: data.input_token_cost || 0,
        output: data.output_token_cost || 0,
        image: data.image_generation_cost || 0
      }
    } catch (error) {
      console.error('Error getting token price:', error)
      return { input: 0.000001, output: 0.000002 }
    }
  }

  // 전체 API 키 목록 조회 (관리자용)
  public async getAllAPIKeys(): Promise<APIKeyConfig[]> {
    // 환경 변수가 제대로 설정되지 않은 경우 데모 데이터 반환
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url' || !supabaseUrl.startsWith('http')) {
      console.warn('Supabase not configured, returning demo API keys')
      return this.getDemoAPIKeys()
    }

    try {
      const supabase = await getMCPSupabaseClient()
      const { data, error } = await supabase
        .from('admin_api_keys')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to get all API keys:', error)
        return this.getDemoAPIKeys()
      }

      // 복호화하지 않고 마스킹된 버전 반환
      return data?.map((key: any) => ({
        ...key,
        api_key: key.api_key.replace(/./g, '*').slice(0, 20) + '...'
      })) || this.getDemoAPIKeys()
    } catch (error) {
      console.error('Error getting all API keys:', error)
      return this.getDemoAPIKeys()
    }
  }

  private getDemoAPIKeys(): APIKeyConfig[] {
    return [
      {
        id: 'demo-1',
        service_name: 'claude',
        api_key: 'sk-ant-*********************....',
        api_key_name: 'Claude Production Key',
        is_active: true,
        rate_limit_per_minute: 60,
        monthly_budget_usd: 1000,
        current_month_cost: 245.67,
        usage_count: 1234,
        last_used: '2024-12-26T08:30:00Z'
      },
      {
        id: 'demo-2',
        service_name: 'openai',
        api_key: 'sk-*********************....',
        api_key_name: 'OpenAI GPT-4 Key',
        is_active: true,
        rate_limit_per_minute: 100,
        monthly_budget_usd: 800,
        current_month_cost: 156.89,
        usage_count: 856,
        last_used: '2024-12-26T09:15:00Z'
      },
      {
        id: 'demo-3',
        service_name: 'gemini',
        api_key: 'AIza*********************....',
        api_key_name: 'Gemini Pro Key',
        is_active: false,
        rate_limit_per_minute: 60,
        monthly_budget_usd: 500,
        current_month_cost: 0,
        usage_count: 0,
        last_used: undefined
      }
    ]
  }
}

export const apiKeyManager = APIKeyManager.getInstance()