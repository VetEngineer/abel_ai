import { NextRequest, NextResponse } from 'next/server'
import { apiKeyManager } from '@/lib/services/api-key-manager'

export async function GET(request: NextRequest) {
  try {
    const apiKeys = await apiKeyManager.getAllAPIKeys()
    return NextResponse.json({ apiKeys })
  } catch (error) {
    console.error('API 키 조회 오류:', error)
    return NextResponse.json(
      { error: 'API 키 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      service_name,
      api_key_name,
      api_key,
      monthly_budget_usd,
      rate_limit_per_minute
    } = await request.json()

    if (!service_name || !api_key_name || !api_key) {
      return NextResponse.json(
        { error: '필수 입력값이 누락되었습니다.' },
        { status: 400 }
      )
    }

    const config = {
      service_name,
      api_key,
      api_key_name,
      is_active: true,
      rate_limit_per_minute: rate_limit_per_minute || 60,
      monthly_budget_usd: monthly_budget_usd || 1000,
      current_month_cost: 0,
      usage_count: 0
    }

    const success = await apiKeyManager.upsertAPIKey(config)

    if (success) {
      return NextResponse.json({ message: 'API 키가 추가되었습니다.' })
    } else {
      return NextResponse.json(
        { error: 'API 키 추가에 실패했습니다.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('API 키 추가 오류:', error)
    return NextResponse.json(
      { error: 'API 키 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}