import { NextRequest, NextResponse } from 'next/server'
import { adminAuthService } from '@/lib/services/admin-auth'

// 인증 미들웨어
function authenticateAdmin(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value

  if (!token) {
    return null
  }

  const user = adminAuthService.verifyToken(token)
  return user
}

// 모든 관리자 계정 조회
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const currentUser = authenticateAdmin(request)
    if (!currentUser) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    // 권한 확인 (super_admin 또는 admin만 가능)
    if (currentUser.role !== 'super_admin' && currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    const result = await adminAuthService.getAllAdminAccounts()

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    // 비밀번호 해시는 제외하고 반환
    const accounts = result.accounts?.map(account => ({
      id: account.id,
      username: account.username,
      email: account.email,
      role: account.role,
      is_active: account.is_active,
      last_login_at: account.last_login_at,
      created_at: account.created_at,
      updated_at: account.updated_at,
      created_by: account.created_by
    }))

    return NextResponse.json({
      success: true,
      accounts
    })

  } catch (error) {
    console.error('관리자 계정 조회 API 오류:', error)
    return NextResponse.json(
      { error: '계정 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 새 관리자 계정 생성
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const currentUser = authenticateAdmin(request)
    if (!currentUser) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    // 권한 확인 (super_admin만 가능)
    if (currentUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: '슈퍼 관리자만 계정을 생성할 수 있습니다.' },
        { status: 403 }
      )
    }

    const { username, email, password, role } = await request.json()

    // 입력값 검증
    if (!username || !password) {
      return NextResponse.json(
        { error: '사용자명과 비밀번호는 필수입니다.' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: '비밀번호는 8자 이상이어야 합니다.' },
        { status: 400 }
      )
    }

    const result = await adminAuthService.createAdminAccount({
      username,
      email,
      password,
      role: role || 'admin',
      createdBy: currentUser.id
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // 생성된 계정 정보 반환 (비밀번호 해시 제외)
    const newAccount = result.admin
    const accountInfo = {
      id: newAccount!.id,
      username: newAccount!.username,
      email: newAccount!.email,
      role: newAccount!.role,
      is_active: newAccount!.is_active,
      created_at: newAccount!.created_at,
      created_by: newAccount!.created_by
    }

    return NextResponse.json({
      success: true,
      account: accountInfo,
      message: '관리자 계정이 생성되었습니다.'
    })

  } catch (error) {
    console.error('관리자 계정 생성 API 오류:', error)
    return NextResponse.json(
      { error: '계정 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}