// 메모리 기반 API 키 스토리지 시스템

import { APIKeyStorage, StoredAPIKey } from './api-key-storage-interface'

// 전역 메모리 스토리지
declare global {
  var apiKeyStorage: Map<string, StoredAPIKey> | undefined
}

if (!globalThis.apiKeyStorage) {
  globalThis.apiKeyStorage = new Map<string, StoredAPIKey>()
}

const storage = globalThis.apiKeyStorage

export class MemoryAPIKeyStorage implements APIKeyStorage {
  private static instance: MemoryAPIKeyStorage
  private storage: Map<string, StoredAPIKey>

  private constructor() {
    this.storage = storage
    this.initializeFromEnv()
  }

  public static getInstance(): MemoryAPIKeyStorage {
    if (!MemoryAPIKeyStorage.instance) {
      MemoryAPIKeyStorage.instance = new MemoryAPIKeyStorage()
    }
    return MemoryAPIKeyStorage.instance
  }

  // 환경 변수에서 초기 API 키 로드
  private initializeFromEnv(): void {
    console.log('메모리 스토리지 초기화 시작...')

    // Claude API 키
    if (process.env.CLAUDE_API_KEY && !this.storage.has('env_claude')) {
      this.storage.set('env_claude', {
        id: 'env_claude',
        service_name: 'claude',
        api_key: process.env.CLAUDE_API_KEY,
        api_key_name: 'Environment Claude Key',
        is_active: true,
        rate_limit_per_minute: 60,
        monthly_budget_usd: 1000,
        current_month_cost: 0,
        usage_count: 0,
        created_at: new Date().toISOString()
      })
      console.log('Claude API 키가 환경 변수에서 로드되었습니다.')
    }

    // OpenAI API 키
    if (process.env.OPENAI_API_KEY && !this.storage.has('env_openai')) {
      this.storage.set('env_openai', {
        id: 'env_openai',
        service_name: 'openai',
        api_key: process.env.OPENAI_API_KEY,
        api_key_name: 'Environment OpenAI Key',
        is_active: true,
        rate_limit_per_minute: 100,
        monthly_budget_usd: 800,
        current_month_cost: 0,
        usage_count: 0,
        created_at: new Date().toISOString()
      })
      console.log('OpenAI API 키가 환경 변수에서 로드되었습니다.')
    }

    // Gemini API 키
    if (process.env.GOOGLE_AI_API_KEY && !this.storage.has('env_gemini')) {
      this.storage.set('env_gemini', {
        id: 'env_gemini',
        service_name: 'gemini',
        api_key: process.env.GOOGLE_AI_API_KEY,
        api_key_name: 'Environment Gemini Key',
        is_active: true,
        rate_limit_per_minute: 60,
        monthly_budget_usd: 500,
        current_month_cost: 0,
        usage_count: 0,
        created_at: new Date().toISOString()
      })
      console.log('Gemini API 키가 환경 변수에서 로드되었습니다.')
    }

    // 네이버 검색 API 키
    if (process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET && !this.storage.has('env_naver_search')) {
      this.storage.set('env_naver_search', {
        id: 'env_naver_search',
        service_name: 'naver_search',
        client_id: process.env.NAVER_CLIENT_ID,
        client_secret: process.env.NAVER_CLIENT_SECRET,
        api_key_name: 'Environment Naver Search Key',
        is_active: true,
        rate_limit_per_minute: 1000,
        monthly_budget_usd: 100,
        current_month_cost: 0,
        usage_count: 0,
        created_at: new Date().toISOString()
      })
      console.log('네이버 검색 API 키가 환경 변수에서 로드되었습니다.')
    }

    console.log(`총 ${this.storage.size}개의 API 키가 로드되었습니다.`)
  }

  // 모든 API 키 조회
  public getAllKeys(): StoredAPIKey[] {
    return Array.from(this.storage.values())
  }

  // 서비스별 활성 API 키 조회
  public getActiveKey(service: StoredAPIKey['service_name']): StoredAPIKey | null {
    for (const key of this.storage.values()) {
      if (key.service_name === service && key.is_active) {
        return key
      }
    }
    return null
  }

  // API 키 추가/수정
  public upsertKey(keyData: Omit<StoredAPIKey, 'id' | 'created_at' | 'current_month_cost' | 'usage_count'> & { id?: string }): StoredAPIKey {
    const id = keyData.id || `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const existingKey = this.storage.get(id)

    const newKey: StoredAPIKey = {
      id,
      ...keyData,
      current_month_cost: existingKey?.current_month_cost || 0,
      usage_count: existingKey?.usage_count || 0,
      created_at: existingKey?.created_at || new Date().toISOString()
    }

    this.storage.set(id, newKey)
    console.log(`API 키 저장됨: ${newKey.service_name} - ${newKey.api_key_name}`)

    return newKey
  }

  // API 키 삭제
  public deleteKey(id: string): boolean {
    const deleted = this.storage.delete(id)
    if (deleted) {
      console.log(`API 키 삭제됨: ${id}`)
    }
    return deleted
  }

  // API 키 조회 (ID별)
  public getKey(id: string): StoredAPIKey | null {
    return this.storage.get(id) || null
  }

  // API 키 활성화/비활성화
  public toggleKey(id: string, isActive: boolean): boolean {
    const key = this.storage.get(id)
    if (key) {
      key.is_active = isActive
      this.storage.set(id, key)
      console.log(`API 키 상태 변경됨: ${id} -> ${isActive ? '활성' : '비활성'}`)
      return true
    }
    return false
  }

  // 사용량 업데이트
  public updateUsage(id: string, cost: number): Promise<void> | void {
    const key = this.storage.get(id)
    if (key) {
      key.usage_count += 1
      key.current_month_cost += cost
      key.last_used = new Date().toISOString()
      this.storage.set(id, key)
    }
  }

  public logUsage(usage: any): Promise<void> | void {
    // Memory storage doesn't keep logs persistently usually, 
    // but we could just console log it.
    console.log(`Memory Storage Log: Key ${usage.api_key_id} used ${usage.tokens_used} tokens ($${usage.cost_usd})`)
  }

  // 스토리지 상태 조회 (디버깅용)
  public getStorageStats() {
    const keys = this.getAllKeys()
    const stats = {
      total: keys.length,
      active: keys.filter(k => k.is_active).length,
      inactive: keys.filter(k => !k.is_active).length,
      byService: {} as Record<string, number>
    }

    keys.forEach(key => {
      stats.byService[key.service_name] = (stats.byService[key.service_name] || 0) + 1
    })

    return stats
  }
}

export const apiKeyStorage = MemoryAPIKeyStorage.getInstance()