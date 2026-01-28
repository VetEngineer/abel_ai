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
      client_id,
      client_secret,
      monthly_budget_usd,
      rate_limit_per_minute
    } = await request.json()

    // 기본 유효성 검증
    if (!service_name || !api_key_name) {
      return NextResponse.json(
        { error: '서비스명과 키 이름은 필수입니다.' },
        { status: 400 }
      )
    }

    // 네이버 API인 경우 클라이언트 정보 필수
    const isNaverAPI = service_name === 'naver_search' || service_name === 'naver_datalab'
    if (isNaverAPI) {
      if (!client_id || !client_secret) {
        return NextResponse.json(
          { error: '네이버 API는 클라이언트 ID와 시크릿이 필수입니다.' },
          { status: 400 }
        )
      }
    } else {
      // 일반 API인 경우 API 키 필수
      if (!api_key) {
        return NextResponse.json(
          { error: 'API 키는 필수입니다.' },
          { status: 400 }
        )
      }
    }

    const config = {
      service_name,
      api_key: isNaverAPI ? undefined : api_key,
      client_id: isNaverAPI ? client_id : undefined,
      client_secret: isNaverAPI ? client_secret : undefined,
      api_key_name,
      is_active: true,
      rate_limit_per_minute: rate_limit_per_minute || (isNaverAPI ? 1000 : 60),
      monthly_budget_usd: monthly_budget_usd || (isNaverAPI ? 100 : 1000),
      current_month_cost: 0,
      usage_count: 0
    }

    const result = await apiKeyManager.upsertAPIKey(config)

    if (result) {
      return NextResponse.json({
        message: 'API 키가 추가되었습니다.',
        apiKey: result
      })
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