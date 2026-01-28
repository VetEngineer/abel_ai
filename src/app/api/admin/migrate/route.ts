import { NextRequest, NextResponse } from 'next/server'
import { apiKeyStorage } from '@/lib/services/api-key-storage'

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 API 키 마이그레이션 상태 확인 시작...')

    // 1. 현재 스토리지 상태 확인
    const currentKeys = apiKeyStorage.getAllKeys()
    console.log(`📊 현재 저장된 API 키 개수: ${currentKeys.length}`)

    // 2. 스토리지 통계
    const stats = apiKeyStorage.getStorageStats()

    // 3. 환경변수 검증
    const envStatus = {
      claude: !!process.env.CLAUDE_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      gemini: !!process.env.GOOGLE_AI_API_KEY,
      naver_client_id: !!process.env.NAVER_CLIENT_ID,
      naver_client_secret: !!process.env.NAVER_CLIENT_SECRET
    }

    // 4. API 키 목록 (보안상 일부만 표시)
    const keysList = currentKeys.map(key => ({
      id: key.id,
      service_name: key.service_name,
      api_key_name: key.api_key_name,
      is_active: key.is_active,
      usage_count: key.usage_count,
      current_month_cost: key.current_month_cost,
      has_api_key: !!key.api_key,
      has_client_credentials: !!(key.client_id && key.client_secret),
      created_at: key.created_at
    }))

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      migration_status: {
        total_keys: currentKeys.length,
        active_keys: stats.active,
        inactive_keys: stats.inactive,
        by_service: stats.byService
      },
      environment_variables: envStatus,
      api_keys: keysList,
      message: currentKeys.length > 0
        ? 'API 키가 성공적으로 로드되었습니다.'
        : 'API 키가 아직 설정되지 않았습니다.'
    })

  } catch (error) {
    console.error('❌ 마이그레이션 상태 확인 실패:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 강제 API 키 재로드 시작...')

    // 메모리 스토리지 재초기화 (환경변수 다시 로드)
    const currentKeys = apiKeyStorage.getAllKeys()

    // 테스트용 데이터 추가 (실제 키가 없는 경우에만)
    let addedTestKeys = 0

    if (currentKeys.length === 0) {
      console.log('⚠️  저장된 API 키가 없어서 테스트용 키를 추가합니다...')

      // 테스트용 Claude API 키
      if (!process.env.CLAUDE_API_KEY) {
        apiKeyStorage.upsertKey({
          service_name: 'claude',
          api_key: 'sk-ant-test-demo-key-for-testing-only',
          api_key_name: 'Test Claude Key',
          is_active: false, // 테스트용이므로 비활성
          rate_limit_per_minute: 60,
          monthly_budget_usd: 1000
        })
        addedTestKeys++
      }

      // 테스트용 네이버 API 키
      if (!process.env.NAVER_CLIENT_ID) {
        apiKeyStorage.upsertKey({
          service_name: 'naver_search',
          client_id: 'test-client-id',
          client_secret: 'test-client-secret',
          api_key_name: 'Test Naver Search API',
          is_active: false, // 테스트용이므로 비활성
          rate_limit_per_minute: 1000,
          monthly_budget_usd: 100
        })
        addedTestKeys++
      }
    }

    const finalKeys = apiKeyStorage.getAllKeys()
    const stats = apiKeyStorage.getStorageStats()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: '강제 재로드가 완료되었습니다.',
      migration_result: {
        total_keys_before: currentKeys.length,
        total_keys_after: finalKeys.length,
        added_test_keys: addedTestKeys,
        final_stats: stats
      }
    })

  } catch (error) {
    console.error('❌ 강제 재로드 실패:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}