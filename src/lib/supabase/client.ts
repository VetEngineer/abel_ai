import { createClient } from '@supabase/supabase-js'

// MCP 기반 Supabase 클라이언트
let mcpSupabaseClient: any = null

// MCP를 통한 Supabase 연결 함수
export async function getMCPSupabaseClient() {
  if (mcpSupabaseClient) {
    return mcpSupabaseClient
  }

  // 프로덕션에서는 MCP 연결 사용
  if (typeof window === 'undefined' && process.env.NODE_ENV !== 'development') {
    try {
      // MCP Supabase 연결 시도
      // 실제 MCP 연결은 여기서 구현됩니다
      console.log('MCP Supabase connection would be established here')

      // 임시로 기존 방식 사용 (MCP 연결이 준비되면 교체)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo_service_key'

      mcpSupabaseClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      return mcpSupabaseClient
    } catch (error) {
      console.error('Failed to connect to MCP Supabase:', error)
      throw new Error('Database connection failed')
    }
  }

  // 개발 환경에서는 기존 방식 사용
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo_service_key'

  mcpSupabaseClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  return mcpSupabaseClient
}

// 클라이언트 사이드용 (브라우저)
export const getBrowserSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo_anon_key'

  return createClient(supabaseUrl, supabaseAnonKey)
}

// 기존 호환성을 위한 export
export const supabase = getBrowserSupabaseClient()

// 서버사이드에서 사용할 클라이언트 (MCP 기반)
export const createServiceSupabaseClient = getMCPSupabaseClient