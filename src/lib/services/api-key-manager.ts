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
    // Supabase가 설정되지 않은 경우 환경 변수에서 직접 가져오기
    const envKeyMap = {
      'claude': process.env.CLAUDE_API_KEY,
      'openai': process.env.OPENAI_API_KEY,
      'gemini': process.env.GOOGLE_AI_API_KEY,
      'stripe': process.env.STRIPE_SECRET_KEY
    }

    const envKey = envKeyMap[service]
    if (envKey) {
      console.log(`환경 변수에서 ${service} API 키를 사용합니다.`)
      return envKey
    }

    // 기본값 반환 (Supabase 설정 시 실제 구현 활성화)
    console.warn(`${service} API 키를 찾을 수 없습니다.`)
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
    // 환경 변수가 제대로 설정되지 않은 경우 데모 데이터 반환
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url' || !supabaseUrl.startsWith('http')) {
      console.warn('Supabase not configured, returning demo API keys')
      return this.getDemoAPIKeys()
    }

    // 데모 데이터 반환
    return this.getDemoAPIKeys()
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