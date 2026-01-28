import crypto from 'crypto'

// Since they were defined inline in the original file, we will keep them inline or stick to original definitions if they weren't moved. 
// I will re-declare them to be safe as I am replacing the file content logic.

import { APIKeyStorage, StoredAPIKey } from './api-key-storage-interface'
import { apiKeyStorage as memoryStorage } from './api-key-storage'
import { supabaseApiKeyStorage } from './supabase-api-key-storage'

// Re-defining interfaces as they were in the original file
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
  // Cache active keys to reduce DB calls (optional, but good for performance)
  // private activeKeyCache: Map<string, string> = new Map() 

  private storage: APIKeyStorage

  private constructor() {
    this.storage = this.selectStorage()
  }

  public static getInstance(): APIKeyManager {
    if (!APIKeyManager.instance) {
      APIKeyManager.instance = new APIKeyManager()
    }
    return APIKeyManager.instance
  }

  private selectStorage(): APIKeyStorage {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && serviceRoleKey && supabaseUrl !== 'your_supabase_project_url') {
      console.log('API Key Manager: Using Supabase Storage')
      return supabaseApiKeyStorage
    }
    console.log('API Key Manager: Using Memory Storage (Fallback)')
    return memoryStorage
  }

  // API 키 암호화
  private encryptAPIKey(apiKey: string): string {
    if (!apiKey) return ''
    try {
      const algorithm = 'aes-256-gcm'
      const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-32-char-key-for-demo-use', 'utf8').slice(0, 32)
      const iv = crypto.randomBytes(16)

      const cipher = crypto.createCipheriv(algorithm, key, iv)
      let encrypted = cipher.update(apiKey, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      const authTag = cipher.getAuthTag().toString('hex')

      return `${iv.toString('hex')}:${authTag}:${encrypted}`
    } catch (e) {
      console.error('Encryption failed', e)
      return apiKey // Fallback (dangerous but prevents data loss in dev) or throw
    }
  }

  // API 키 복호화
  private decryptAPIKey(encryptedKey: string): string {
    if (!encryptedKey) return ''
    // Check if it's already plain text (simple heuristic: no colons or specific prefix)
    // Supabase stored keys should be encrypted. Env keys in memory might be plain.
    if (!encryptedKey.includes(':')) {
      return encryptedKey
    }

    try {
      const parts = encryptedKey.split(':')
      if (parts.length < 3) return encryptedKey // Not our format

      const [ivHex, authTagHex, encrypted] = parts

      const algorithm = 'aes-256-gcm'
      const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-32-char-key-for-demo-use', 'utf8').slice(0, 32)
      const iv = Buffer.from(ivHex, 'hex')
      const authTag = Buffer.from(authTagHex, 'hex')

      const decipher = crypto.createDecipheriv(algorithm, key, iv)
      decipher.setAuthTag(authTag)

      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')

      return decrypted
    } catch (error) {
      //   console.error('Failed to decrypt API key:', error) 
      // If decryption fails, it might be a plain key that just happened to have colons (unlikely)
      // or key mismatch. Return original to be safe? Or empty?
      // For now, return original if decryption fails allows transitioning from plain text DB if that happened.
      return encryptedKey
    }
  }

  // 활성화된 API 키 조회
  public async getActiveAPIKey(service: 'claude' | 'openai' | 'gemini' | 'stripe' | 'naver_search' | 'naver_datalab'): Promise<string | null> {
    // 1. 스토리지에서 활성화된 키 조회
    // Note: Supabase storage implementation doesn't support 'naver_search' yet due to schema constraints.
    // If service is naver, fallback to memoryEnv if not found or if storage is Supabase.

    let storedKey: StoredAPIKey | null = null

    // Naver keys are currently only in memory/env because of DB schema limits
    if (service === 'naver_search' || service === 'naver_datalab') {
      // Force memory storage check for Naver
      storedKey = memoryStorage.getActiveKey(service)
    } else {
      storedKey = await this.storage.getActiveKey(service)
    }

    if (storedKey && storedKey.is_active) {
      // Decrypt if it's an API key service
      if (storedKey.api_key) {
        return this.decryptAPIKey(storedKey.api_key)
      }
    }

    // 2. 환경 변수에서 대체 조회 (기존 호환성)
    const envKeyMap = {
      'claude': process.env.CLAUDE_API_KEY,
      'openai': process.env.OPENAI_API_KEY,
      'gemini': process.env.GOOGLE_AI_API_KEY,
      'stripe': process.env.STRIPE_SECRET_KEY,
      'naver_search': null,
      'naver_datalab': null
    }

    const envKey = envKeyMap[service]
    if (envKey) {
      //   console.log(`환경 변수에서 ${service} API 키를 사용합니다.`)
      return envKey
    }

    // console.warn(`${service} API 키를 찾을 수 없습니다.`)
    return null
  }

  // 네이버 API용 클라이언트 정보 조회
  public async getNaverAPICredentials(): Promise<{ clientId: string; clientSecret: string } | null> {
    // 메모리 스토리지에서 네이버 검색 API 키 조회 (Supabase table doesn't have these columns yet)
    // We explicitly check memoryStorage even if this.storage is Supabase
    const storedKey = memoryStorage.getActiveKey('naver_search')

    if (storedKey && storedKey.is_active && storedKey.client_id && storedKey.client_secret) {
      //   console.log('메모리 스토리지에서 네이버 API 인증정보를 사용합니다.')
      return {
        clientId: storedKey.client_id,
        clientSecret: storedKey.client_secret
      }
    }

    // 환경 변수에서 대체 조회
    if (process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET) {
      //   console.log('환경 변수에서 네이버 API 인증정보를 사용합니다.')
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
      return 999999
    }
    // TODO: Implement actual user token balance check from DB
    return 999999
  }

  // 토큰 사용량 기록
  public async recordTokenUsage(apiKeyId: string, usage: TokenUsage): Promise<boolean> {
    // If we are using Supabase storage, we should insert into api_key_usage_logs
    try {
      await this.storage.logUsage({ ...usage, api_key_id: apiKeyId })
      // console.log(`토큰 사용량 기록 완료: ${usage.tokens_used} tokens`)
      return true
    } catch (e) {
      console.error('Failed to log usage', e)
      return false
    }
  }

  // 토큰 가격 조회
  public async getTokenPrice(service: string, model: string): Promise<{ input: number; output: number; image?: number }> {
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

    return { input: 0.000001, output: 0.000002 }
  }

  // 전체 API 키 목록 조회 (관리자용)
  public async getAllAPIKeys(): Promise<APIKeyConfig[]> {
    try {
      // 1. Get keys from current storage
      const storedKeys = await this.storage.getAllKeys()

      // 2. If storage is Supabase, we also want to see Naver keys from memory if they exist
      let allKeys = storedKeys
      if (this.storage === supabaseApiKeyStorage) {
        const memoryKeys = memoryStorage.getAllKeys().filter(k => k.service_name.startsWith('naver'))
        allKeys = [...storedKeys, ...memoryKeys]
      }

      // 3. Convert to Config format and Decrypt for display? 
      // Usually we don't display full key, but for editing we might need it.
      // Admin might want to see verify key. 
      // Let's decrypt it here.

      const apiKeys: APIKeyConfig[] = allKeys.map(key => ({
        id: key.id,
        service_name: key.service_name,
        api_key: key.api_key ? this.decryptAPIKey(key.api_key) : undefined,
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

      return apiKeys
    } catch (error) {
      console.error('API 키 조회 실패:', error)
      return []
    }
  }

  // API 키 추가/수정 (관리자용)
  public async upsertAPIKey(apiKeyData: Omit<APIKeyConfig, 'id'> & { id?: string }): Promise<APIKeyConfig> {
    try {
      // Determine storage for this key
      let targetStorage = this.storage
      if (apiKeyData.service_name.startsWith('naver')) {
        targetStorage = memoryStorage
      }

      // Encrypt API key if present
      const encryptedApiKey = apiKeyData.api_key ? this.encryptAPIKey(apiKeyData.api_key) : undefined

      const storedKeyData: Omit<StoredAPIKey, 'id' | 'created_at' | 'current_month_cost' | 'usage_count'> & { id?: string } = {
        id: apiKeyData.id,
        service_name: apiKeyData.service_name,
        api_key: encryptedApiKey,
        client_id: apiKeyData.client_id,
        client_secret: apiKeyData.client_secret,
        api_key_name: apiKeyData.api_key_name,
        is_active: apiKeyData.is_active,
        rate_limit_per_minute: apiKeyData.rate_limit_per_minute,
        monthly_budget_usd: apiKeyData.monthly_budget_usd,
        last_used: apiKeyData.last_used
      }

      const savedKey = await targetStorage.upsertKey(storedKeyData)

      const result: APIKeyConfig = {
        id: savedKey.id,
        service_name: savedKey.service_name,
        api_key: apiKeyData.api_key, // Return the original plain text key to the caller
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

  // API 키 삭제
  public async deleteAPIKey(keyId: string): Promise<boolean> {
    try {
      // Try delete from both to be safe or check ID?
      // Since ID format might differ (UUID vs memory ID), we can try current storage first.

      let deleted = await this.storage.deleteKey(keyId)
      if (!deleted && this.storage === supabaseApiKeyStorage) {
        // If not found in Supabase, try Memory (it might be a Naver key)
        deleted = await memoryStorage.deleteKey(keyId)
      }

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

  // API 키 활성화/비활성화
  public async toggleAPIKey(keyId: string, isActive: boolean): Promise<boolean> {
    try {
      let toggled = await this.storage.toggleKey(keyId, isActive)
      if (!toggled && this.storage === supabaseApiKeyStorage) {
        toggled = await memoryStorage.toggleKey(keyId, isActive)
      }

      if (toggled) {
        console.log(`API 키 상태 변경 완료: ${keyId} -> ${isActive ? '활성' : '비활성'}`)
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error(`API 키 상태 변경 실패: ${keyId}`, error)
      return false
    }
  }

  // 사용량 업데이트
  public async updateKeyUsage(keyId: string, cost: number): Promise<void> {
    try {
      // Only useful for memory storage primarily
      await memoryStorage.updateUsage(keyId, cost)
      if (this.storage === supabaseApiKeyStorage) {
        await supabaseApiKeyStorage.updateUsage(keyId, cost)
      }
    } catch (error) {
      console.error(`API 키 사용량 업데이트 실패: ${keyId}`, error)
    }
  }
}

export const apiKeyManager = APIKeyManager.getInstance()