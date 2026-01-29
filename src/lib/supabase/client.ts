import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

// 데이터베이스 타입 정의
export interface Database {
  public: {
    Tables: {
      admin_accounts: {
        Row: {
          id: string
          username: string
          email: string | null
          password_hash: string
          role: 'super_admin' | 'admin' | 'moderator'
          is_active: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          username: string
          email?: string | null
          password_hash: string
          role?: 'super_admin' | 'admin' | 'moderator'
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          username?: string
          email?: string | null
          password_hash?: string
          role?: 'super_admin' | 'admin' | 'moderator'
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      admin_sessions: {
        Row: {
          id: string
          admin_id: string
          session_token: string
          expires_at: string
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          session_token: string
          expires_at: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          session_token?: string
          expires_at?: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      admin_role: 'super_admin' | 'admin' | 'moderator'
    }
  }
}

export type AdminAccount = Database['public']['Tables']['admin_accounts']['Row']
export type AdminSession = Database['public']['Tables']['admin_sessions']['Row']

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
let browserClient: any = null

export const getBrowserSupabaseClient = () => {
  if (browserClient) return browserClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo_anon_key'

  // Supabase가 제대로 설정되지 않은 경우 null 반환
  if (!supabaseUrl.startsWith('http') || supabaseUrl === 'your_supabase_project_url') {
    console.warn('Supabase가 설정되지 않았습니다. Supabase 기능을 비활성화합니다.')
    return null
  }

  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return browserClient
}

// 기존 호환성을 위한 export (지연 로딩)
export let supabase: any = null

// 지연 초기화
try {
  supabase = getBrowserSupabaseClient()
} catch (error) {
  console.warn('Supabase 초기화 실패:', error)
  supabase = null
}

// 서버사이드에서 사용할 클라이언트 (MCP 기반)
export const createServiceSupabaseClient = getMCPSupabaseClient