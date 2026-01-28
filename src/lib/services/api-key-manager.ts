import crypto from 'crypto'
import { apiKeyStorage, StoredAPIKey } from './api-key-storage'

export interface APIKeyConfig {
  id: string
  service_name: 'claude' | 'openai' | 'gemini' | 'stripe' | 'naver_search' | 'naver_datalab'
  api_key?: string // For Claude, OpenAI, Gemini
  client_id?: string // For Naver APIs
  client_secret?: string // For Naver APIs
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

  // 활성화된 API 키 조회 (메모리 스토리지 우선, 환경변수 대체)
  public async getActiveAPIKey(service: 'claude' | 'openai' | 'gemini' | 'stripe' | 'naver_search' | 'naver_datalab'): Promise<string | null> {
    // 1. 메모리 스토리지에서 활성화된 키 조회
    const storedKey = apiKeyStorage.getActiveKey(service)
    if (storedKey && storedKey.is_active) {
      console.log(`메모리 스토리지에서 ${service} API 키를 사용합니다.`)
      return storedKey.api_key || null
    }

    // 2. 환경 변수에서 대체 조회 (기존 호환성)
    const envKeyMap = {
      'claude': process.env.CLAUDE_API_KEY,
      'openai': process.env.OPENAI_API_KEY,
      'gemini': process.env.GOOGLE_AI_API_KEY,
      'stripe': process.env.STRIPE_SECRET_KEY,
      'naver_search': null, // 네이버는 client_id/secret 구조
      'naver_datalab': null
    }

    const envKey = envKeyMap[service]
    if (envKey) {
      console.log(`환경 변수에서 ${service} API 키를 사용합니다.`)
      return envKey
    }

    console.warn(`${service} API 키를 찾을 수 없습니다.`)
    return null
  }

  // 네이버 API용 클라이언트 정보 조회
  public async getNaverAPICredentials(): Promise<{ clientId: string; clientSecret: string } | null> {
    // 메모리 스토리지에서 네이버 검색 API 키 조회
    const storedKey = apiKeyStorage.getActiveKey('naver_search')
    if (storedKey && storedKey.is_active && storedKey.client_id && storedKey.client_secret) {
      console.log('메모리 스토리지에서 네이버 API 인증정보를 사용합니다.')
      return {
        clientId: storedKey.client_id,
        clientSecret: storedKey.client_secret
      }
    }

    // 환경 변수에서 대체 조회
    if (process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET) {
      console.log('환경 변수에서 네이버 API 인증정보를 사용합니다.')
      return {
        clientId: process.env.NAVER_CLIENT_ID,
        clientSecret: process.env.NAVER_CLIENT_SECRET
      }
    }

    console.warn('네이버 API 인증정보를 찾을 수 없습니다.')
    return null
  }

  // 사용자 토큰 잔액 확인
  public async getUserTokenBalance(userId: string): Promise<number> {
    // Supabase가 설정되지 않은 경우 임시로 무제한 토큰 반환
    if (process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url') {
      console.log(`임시 모드: 사용자 ${userId}에게 무제한 토큰 제공`)
      return 999999
    }

    // 기본값 반환
    console.log(`사용자 ${userId}의 토큰 잔액을 확인할 수 없습니다. 기본값 반환.`)
    return 999999
  }

  // 토큰 사용량 기록
  public async recordTokenUsage(apiKeyId: string, usage: TokenUsage): Promise<boolean> {
    // Supabase가 설정되지 않은 경우 로그만 출력
    if (process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url') {
      console.log(`토큰 사용량 기록 (임시): ${usage.tokens_used} tokens, $${usage.cost_usd.toFixed(4)}`)
      return true
    }

    // 기본적으로 성공 반환
    console.log(`토큰 사용량 기록 스킵: ${usage.tokens_used} tokens, $${usage.cost_usd.toFixed(4)}`)
    return true
  }

  // 토큰 가격 조회
  public async getTokenPrice(service: string, model: string): Promise<{ input: number; output: number; image?: number }> {
    // 기본 가격 설정 (Claude API 실제 가격)
    const defaultPricing = {
      'claude': {
        'claude-3-5-sonnet-20241022': { input: 0.000003, output: 0.000015 },
        'claude-3-sonnet-20240229': { input: 0.000003, output: 0.000015 },
        'claude-3-haiku-20240307': { input: 0.00000025, output: 0.00000125 }
      },
      'openai': {
        'gpt-4o': { input: 0.0000025, output: 0.00001 },
        'gpt-3.5-turbo': { input: 0.0000005, output: 0.0000015 }
      },
      'gemini': {
        'gemini-1.5-pro': { input: 0.0000035, output: 0.0000105 },
        'gemini-nano-banana': { input: 0.000001, output: 0.000002, image: 0.002 }
      }
    }

    const servicePricing = defaultPricing[service as keyof typeof defaultPricing]
    if (servicePricing && servicePricing[model as keyof typeof servicePricing]) {
      return servicePricing[model as keyof typeof servicePricing]
    }

    // 기본값 반환
    return { input: 0.000001, output: 0.000002 }
  }

  // 전체 API 키 목록 조회 (관리자용)
  public async getAllAPIKeys(): Promise<APIKeyConfig[]> {
    try {
      // 메모리 스토리지에서 모든 키 조회
      const storedKeys = apiKeyStorage.getAllKeys()

      // StoredAPIKey를 APIKeyConfig 형식으로 변환
      const apiKeys: APIKeyConfig[] = storedKeys.map(key => ({
        id: key.id,
        service_name: key.service_name,
        api_key: key.api_key,
        client_id: key.client_id,
        client_secret: key.client_secret,
        api_key_name: key.api_key_name,
        is_active: key.is_active,
        rate_limit_per_minute: key.rate_limit_per_minute,
        monthly_budget_usd: key.monthly_budget_usd,
        current_month_cost: key.current_month_cost,
        usage_count: key.usage_count,
        last_used: key.last_used
      }))

      console.log(`메모리 스토리지에서 ${apiKeys.length}개 API 키 조회`)
      return apiKeys
    } catch (error) {
      console.error('API 키 조회 실패:', error)
      return this.getDemoAPIKeys()
    }
  }

  // API 키 추가/수정 (관리자용)
  public async upsertAPIKey(apiKeyData: Omit<APIKeyConfig, 'id'> & { id?: string }): Promise<APIKeyConfig> {
    try {
      // APIKeyConfig를 StoredAPIKey 형식으로 변환
      const storedKeyData: Omit<StoredAPIKey, 'id' | 'created_at' | 'current_month_cost' | 'usage_count'> & { id?: string } = {
        id: apiKeyData.id,
        service_name: apiKeyData.service_name,
        api_key: apiKeyData.api_key,
        client_id: apiKeyData.client_id,
        client_secret: apiKeyData.client_secret,
        api_key_name: apiKeyData.api_key_name,
        is_active: apiKeyData.is_active,
        rate_limit_per_minute: apiKeyData.rate_limit_per_minute,
        monthly_budget_usd: apiKeyData.monthly_budget_usd,
        last_used: apiKeyData.last_used
      }

      // 메모리 스토리지에 저장
      const savedKey = apiKeyStorage.upsertKey(storedKeyData)

      // StoredAPIKey를 APIKeyConfig로 변환하여 반환
      const result: APIKeyConfig = {
        id: savedKey.id,
        service_name: savedKey.service_name,
        api_key: savedKey.api_key,
        client_id: savedKey.client_id,
        client_secret: savedKey.client_secret,
        api_key_name: savedKey.api_key_name,
        is_active: savedKey.is_active,
        rate_limit_per_minute: savedKey.rate_limit_per_minute,
        monthly_budget_usd: savedKey.monthly_budget_usd,
        current_month_cost: savedKey.current_month_cost,
        usage_count: savedKey.usage_count,
        last_used: savedKey.last_used
      }

      console.log(`API 키 저장 완료: ${result.service_name} - ${result.api_key_name}`)
      return result
    } catch (error) {
      console.error('API 키 저장 실패:', error)
      throw error
    }
  }

  // API 키 삭제 (관리자용)
  public async deleteAPIKey(keyId: string): Promise<boolean> {
    try {
      // 메모리 스토리지에서 삭제
      const deleted = apiKeyStorage.deleteKey(keyId)

      if (deleted) {
        console.log(`API 키 삭제 완료: ${keyId}`)
        return true
      } else {
        console.warn(`삭제할 API 키를 찾을 수 없습니다: ${keyId}`)
        return false
      }
    } catch (error) {
      console.error(`API 키 삭제 실패: ${keyId}`, error)
      return false
    }
  }

  // API 키 활성화/비활성화 (관리자용)
  public async toggleAPIKey(keyId: string, isActive: boolean): Promise<boolean> {
    try {
      const toggled = apiKeyStorage.toggleKey(keyId, isActive)

      if (toggled) {
        console.log(`API 키 상태 변경 완료: ${keyId} -> ${isActive ? '활성' : '비활성'}`)
        return true
      } else {
        console.warn(`상태를 변경할 API 키를 찾을 수 없습니다: ${keyId}`)
        return false
      }
    } catch (error) {
      console.error(`API 키 상태 변경 실패: ${keyId}`, error)
      return false
    }
  }

  // 사용량 업데이트 (관리자용)
  public async updateKeyUsage(keyId: string, cost: number): Promise<void> {
    try {
      apiKeyStorage.updateUsage(keyId, cost)
      console.log(`API 키 사용량 업데이트 완료: ${keyId} (+$${cost.toFixed(4)})`)
    } catch (error) {
      console.error(`API 키 사용량 업데이트 실패: ${keyId}`, error)
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
      },
      {
        id: 'demo-4',
        service_name: 'naver_search',
        client_id: 'YOUR_NAVER_CLIENT_ID',
        client_secret: 'YOUR_NAVER_CLIENT_SECRET',
        api_key_name: 'Naver Search API',
        is_active: true,
        rate_limit_per_minute: 1000,
        monthly_budget_usd: 100,
        current_month_cost: 12.34,
        usage_count: 567,
        last_used: '2024-12-26T10:00:00Z'
      },
      {
        id: 'demo-5',
        service_name: 'naver_datalab',
        client_id: 'YOUR_NAVER_CLIENT_ID',
        client_secret: 'YOUR_NAVER_CLIENT_SECRET',
        api_key_name: 'Naver DataLab API',
        is_active: true,
        rate_limit_per_minute: 100,
        monthly_budget_usd: 50,
        current_month_cost: 5.67,
        usage_count: 89,
        last_used: '2024-12-26T09:45:00Z'
      }
    ]
  }
}

export const apiKeyManager = APIKeyManager.getInstance()