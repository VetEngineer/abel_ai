import { NextRequest, NextResponse } from 'next/server'
import { getMCPSupabaseClient } from '@/lib/supabase/client'
import { adminAuthService } from '@/lib/services/admin-auth'

export async function GET(request: NextRequest) {
  try {
    // 환경변수 상태 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const envStatus = {
      supabase_url: {
        configured: Boolean(supabaseUrl && supabaseUrl !== 'your_supabase_project_url'),
        value: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'Not set',
        valid: Boolean(supabaseUrl?.startsWith('https://'))
      },
      service_key: {
        configured: Boolean(supabaseServiceKey && supabaseServiceKey !== 'your_supabase_service_role_key'),
        value: supabaseServiceKey ? `${supabaseServiceKey.substring(0, 20)}...` : 'Not set'
      },
      anon_key: {
        configured: Boolean(supabaseAnonKey && supabaseAnonKey !== 'your_supabase_anon_key'),
        value: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'Not set'
      }
    }

    const isSupabaseConfigured = envStatus.supabase_url.configured &&
                                envStatus.service_key.configured &&
                                envStatus.anon_key.configured

    let connectionTest = {
      success: false,
      error: null as string | null,
      tables_exist: false,
      can_create_account: false
    }

    // Supabase 연결 테스트
    if (isSupabaseConfigured) {
      try {
        const supabase = await getMCPSupabaseClient()

        // 테이블 존재 확인
        const { data, error: tableError } = await supabase
          .from('admin_accounts')
          .select('count')
          .limit(1)

        if (!tableError) {
          connectionTest.tables_exist = true
          connectionTest.success = true

          // 계정 생성 테스트 (dry run)
          try {
            const testResult = await adminAuthService.getAllAdminAccounts()
            connectionTest.can_create_account = testResult.success
          } catch (err) {
            connectionTest.can_create_account = false
          }
        } else {
          connectionTest.error = `테이블 접근 오류: ${tableError.message}`
        }

      } catch (error) {
        connectionTest.error = error instanceof Error ? error.message : '연결 오류'
      }
    }

    // 현재 인증 방식 확인
    const authMode = isSupabaseConfigured && connectionTest.success ? 'supabase' : 'environment'

    // 환경변수 기반 관리자 정보
    const envAdminStatus = {
      username: process.env.ADMIN_USERNAME || 'Not set',
      password_set: Boolean(process.env.ADMIN_PASSWORD),
      jwt_secret_set: Boolean(process.env.JWT_SECRET)
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      supabase_status: {
        configured: isSupabaseConfigured,
        environment_variables: envStatus,
        connection_test: connectionTest
      },
      current_auth_mode: authMode,
      environment_admin: envAdminStatus,
      recommendations: getRecommendations(isSupabaseConfigured, connectionTest, envAdminStatus)
    })

  } catch (error) {
    console.error('Supabase 상태 확인 오류:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}

function getRecommendations(isSupabaseConfigured: boolean, connectionTest: any, envAdminStatus: any) {
  const recommendations = []

  if (!isSupabaseConfigured) {
    recommendations.push({
      priority: 'high',
      action: 'Supabase 프로젝트 설정',
      description: 'Supabase 프로젝트를 생성하고 환경변수를 설정하세요.',
      steps: [
        '1. https://supabase.com 에서 새 프로젝트 생성',
        '2. 프로젝트 설정에서 API 키 복사',
        '3. .env.local 파일의 Supabase 환경변수 업데이트',
        '4. src/scripts/supabase-setup.sql 스크립트를 Supabase SQL 편집기에서 실행'
      ]
    })
  }

  if (isSupabaseConfigured && !connectionTest.tables_exist) {
    recommendations.push({
      priority: 'high',
      action: '데이터베이스 스키마 생성',
      description: 'Supabase에서 관리자 계정 테이블을 생성해야 합니다.',
      steps: [
        '1. Supabase 대시보드의 SQL Editor로 이동',
        '2. src/scripts/supabase-setup.sql 파일의 내용을 복사하여 실행',
        '3. 테이블과 함수가 정상적으로 생성되었는지 확인'
      ]
    })
  }

  if (isSupabaseConfigured && connectionTest.success) {
    recommendations.push({
      priority: 'medium',
      action: 'Supabase로 마이그레이션',
      description: '환경변수 기반 관리자 계정을 Supabase로 마이그레이션할 수 있습니다.',
      steps: [
        '1. 관리자 패널의 "관리자 계정" 탭으로 이동',
        '2. 새 관리자 계정 생성',
        '3. 기존 환경변수 계정 사용 중단',
        '4. .env.local에서 ADMIN_USERNAME, ADMIN_PASSWORD 제거 (선택사항)'
      ]
    })
  }

  if (!envAdminStatus.jwt_secret_set || process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production') {
    recommendations.push({
      priority: 'high',
      action: 'JWT 시크릿 보안 강화',
      description: '강력한 JWT 시크릿을 설정하세요.',
      steps: [
        '1. 32자 이상의 랜덤 문자열 생성',
        '2. .env.local의 JWT_SECRET 값 업데이트',
        '3. 서버 재시작'
      ]
    })
  }

  return recommendations
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === 'test_env_login') {
      // 환경변수 기반 로그인 테스트
      const username = process.env.ADMIN_USERNAME
      const password = process.env.ADMIN_PASSWORD

      if (!username || !password) {
        return NextResponse.json({
          success: false,
          error: '환경변수에 관리자 계정이 설정되지 않았습니다.'
        })
      }

      const result = await adminAuthService.login(username, password, 'test', 'test-agent')

      return NextResponse.json({
        success: result.success,
        message: result.success ? '환경변수 기반 로그인 테스트 성공' : result.error
      })
    }

    return NextResponse.json({
      success: false,
      error: '지원하지 않는 액션입니다.'
    }, { status: 400 })

  } catch (error) {
    console.error('Supabase 테스트 액션 오류:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}