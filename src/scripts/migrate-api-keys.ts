#!/usr/bin/env ts-node

/**
 * API 키 마이그레이션 스크립트
 * 환경변수의 API 키들을 메모리 스토리지로 마이그레이션하고 검증
 */

import { apiKeyStorage } from '@/lib/services/api-key-storage'

async function migrateAPIKeys() {
  console.log('🚀 API 키 마이그레이션 시작...\n')

  try {
    // 1. 현재 스토리지 상태 확인
    const currentKeys = apiKeyStorage.getAllKeys()
    console.log(`📊 현재 저장된 API 키 개수: ${currentKeys.length}`)

    if (currentKeys.length > 0) {
      console.log('\n📋 현재 저장된 API 키 목록:')
      currentKeys.forEach(key => {
        const hiddenApiKey = key.api_key ? `${key.api_key.substring(0, 10)}...` : 'N/A'
        const clientId = key.client_id ? `${key.client_id.substring(0, 8)}...` : 'N/A'

        console.log(`  - ${key.service_name}: ${key.api_key_name} (${key.is_active ? '✅ 활성' : '❌ 비활성'})`)
        if (key.service_name.includes('naver')) {
          console.log(`    클라이언트 ID: ${clientId}`)
        } else {
          console.log(`    API 키: ${hiddenApiKey}`)
        }
      })
    }

    // 2. 스토리지 통계 출력
    const stats = apiKeyStorage.getStorageStats()
    console.log('\n📈 스토리지 통계:')
    console.log(`  - 전체: ${stats.total}개`)
    console.log(`  - 활성: ${stats.active}개`)
    console.log(`  - 비활성: ${stats.inactive}개`)
    console.log(`  - 서비스별:`)
    Object.entries(stats.byService).forEach(([service, count]) => {
      console.log(`    • ${service}: ${count}개`)
    })

    // 3. 환경변수 검증
    console.log('\n🔍 환경변수 검증:')
    const envChecks = [
      { name: 'CLAUDE_API_KEY', value: process.env.CLAUDE_API_KEY, service: 'claude' },
      { name: 'OPENAI_API_KEY', value: process.env.OPENAI_API_KEY, service: 'openai' },
      { name: 'GOOGLE_AI_API_KEY', value: process.env.GOOGLE_AI_API_KEY, service: 'gemini' },
      { name: 'NAVER_CLIENT_ID', value: process.env.NAVER_CLIENT_ID, service: 'naver_search' },
      { name: 'NAVER_CLIENT_SECRET', value: process.env.NAVER_CLIENT_SECRET, service: 'naver_search' }
    ]

    envChecks.forEach(check => {
      const status = check.value ? '✅ 설정됨' : '❌ 미설정'
      const preview = check.value ? `${check.value.substring(0, 12)}...` : 'N/A'
      console.log(`  - ${check.name}: ${status} ${preview !== 'N/A' ? `(${preview})` : ''}`)
    })

    // 4. 테스트 API 키 추가 (실제 키가 없는 경우)
    if (currentKeys.length === 0) {
      console.log('\n⚠️  저장된 API 키가 없어서 테스트용 키를 추가합니다...')

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
        console.log('  ✅ 테스트용 Claude API 키 추가됨')
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
        console.log('  ✅ 테스트용 네이버 API 키 추가됨')
      }
    }

    // 5. 최종 상태 확인
    const finalKeys = apiKeyStorage.getAllKeys()
    console.log(`\n✅ 마이그레이션 완료! 최종 API 키 개수: ${finalKeys.length}개`)

    return {
      success: true,
      totalKeys: finalKeys.length,
      activeKeys: finalKeys.filter(k => k.is_active).length
    }

  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  migrateAPIKeys()
    .then(result => {
      if (result.success) {
        console.log('\n🎉 API 키 마이그레이션이 성공적으로 완료되었습니다!')
        process.exit(0)
      } else {
        console.error('\n💥 API 키 마이그레이션이 실패했습니다:', result.error)
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('💥 예상치 못한 오류:', error)
      process.exit(1)
    })
}

export { migrateAPIKeys }