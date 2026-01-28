// Supabase 데이터베이스 타입 정의
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          subscription_tier: 'free' | 'pro' | 'enterprise'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          website_url: string | null
          brand_voice: string | null
          target_audience: string | null
          industry: string | null
          settings: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          website_url?: string | null
          brand_voice?: string | null
          target_audience?: string | null
          industry?: string | null
          settings?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          website_url?: string | null
          brand_voice?: string | null
          target_audience?: string | null
          industry?: string | null
          settings?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
      content: {
        Row: {
          id: string
          project_id: string
          title: string
          content: string | null
          excerpt: string | null
          seo_title: string | null
          meta_description: string | null
          keywords: string[]
          tags: string[]
          category: string | null
          status: 'draft' | 'in_progress' | 'ready_for_review' | 'approved' | 'published' | 'archived'
          platforms: string[]
          scheduled_at: string | null
          published_at: string | null
          seo_data: Record<string, any>
          visual_elements: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          content?: string | null
          excerpt?: string | null
          seo_title?: string | null
          meta_description?: string | null
          keywords?: string[]
          tags?: string[]
          category?: string | null
          status?: 'draft' | 'in_progress' | 'ready_for_review' | 'approved' | 'published' | 'archived'
          platforms?: string[]
          scheduled_at?: string | null
          published_at?: string | null
          seo_data?: Record<string, any>
          visual_elements?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          content?: string | null
          excerpt?: string | null
          seo_title?: string | null
          meta_description?: string | null
          keywords?: string[]
          tags?: string[]
          category?: string | null
          status?: 'draft' | 'in_progress' | 'ready_for_review' | 'approved' | 'published' | 'archived'
          platforms?: string[]
          scheduled_at?: string | null
          published_at?: string | null
          seo_data?: Record<string, any>
          visual_elements?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
      agent_executions: {
        Row: {
          id: string
          content_id: string | null
          project_id: string
          agent_type: string
          status: 'idle' | 'processing' | 'completed' | 'error'
          input: Record<string, any> | null
          output: Record<string, any> | null
          error_message: string | null
          execution_time: number | null
          tokens_used: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content_id?: string | null
          project_id: string
          agent_type: string
          status?: 'idle' | 'processing' | 'completed' | 'error'
          input?: Record<string, any> | null
          output?: Record<string, any> | null
          error_message?: string | null
          execution_time?: number | null
          tokens_used?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content_id?: string | null
          project_id?: string
          agent_type?: string
          status?: 'idle' | 'processing' | 'completed' | 'error'
          input?: Record<string, any> | null
          output?: Record<string, any> | null
          error_message?: string | null
          execution_time?: number | null
          tokens_used?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      workflows: {
        Row: {
          id: string
          content_id: string
          project_id: string
          status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
          current_step: number
          total_steps: number
          shared_context: Record<string, any>
          error_message: string | null
          started_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content_id: string
          project_id: string
          status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
          current_step?: number
          total_steps?: number
          shared_context?: Record<string, any>
          error_message?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content_id?: string
          project_id?: string
          status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
          current_step?: number
          total_steps?: number
          shared_context?: Record<string, any>
          error_message?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      keywords: {
        Row: {
          id: string
          project_id: string
          keyword: string
          search_volume: number | null
          competition: 'low' | 'medium' | 'high' | null
          trend: 'rising' | 'stable' | 'declining' | null
          industry: string | null
          region: string
          last_updated: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          keyword: string
          search_volume?: number | null
          competition?: 'low' | 'medium' | 'high' | null
          trend?: 'rising' | 'stable' | 'declining' | null
          industry?: string | null
          region?: string
          last_updated?: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          keyword?: string
          search_volume?: number | null
          competition?: 'low' | 'medium' | 'high' | null
          trend?: 'rising' | 'stable' | 'declining' | null
          industry?: string | null
          region?: string
          last_updated?: string
          created_at?: string
        }
      }
      platform_connections: {
        Row: {
          id: string
          project_id: string
          platform: 'wordpress' | 'naver_blog' | 'tistory' | 'brunch'
          connection_data: Record<string, any>
          is_active: boolean
          last_sync: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          platform: 'wordpress' | 'naver_blog' | 'tistory' | 'brunch'
          connection_data: Record<string, any>
          is_active?: boolean
          last_sync?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          platform?: 'wordpress' | 'naver_blog' | 'tistory' | 'brunch'
          connection_data?: Record<string, any>
          is_active?: boolean
          last_sync?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      publication_logs: {
        Row: {
          id: string
          content_id: string
          platform: string
          platform_post_id: string | null
          status: 'pending' | 'success' | 'failed'
          error_message: string | null
          published_url: string | null
          published_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          content_id: string
          platform: string
          platform_post_id?: string | null
          status?: 'pending' | 'success' | 'failed'
          error_message?: string | null
          published_url?: string | null
          published_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          content_id?: string
          platform?: string
          platform_post_id?: string | null
          status?: 'pending' | 'success' | 'failed'
          error_message?: string | null
          published_url?: string | null
          published_at?: string | null
          created_at?: string
        }
      }
    }
  }
}