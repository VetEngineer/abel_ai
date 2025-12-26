import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

export interface AdminUser {
  username: string
  role: string
  iat: number
  exp: number
}

export function verifyAdminToken(token: string): AdminUser | null {
  try {
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key'
    const decoded = jwt.verify(token, jwtSecret) as AdminUser

    // 토큰 만료 확인
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return decoded
  } catch (error) {
    console.error('JWT verification error:', error)
    return null
  }
}

export function extractAdminTokenFromRequest(request: NextRequest): string | null {
  // Authorization 헤더에서 토큰 추출
  const authHeader = request.headers.get('Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // 쿠키에서 토큰 추출
  const cookieToken = request.cookies.get('admin_token')?.value
  if (cookieToken) {
    return cookieToken
  }

  return null
}

export function requireAdminAuth(request: NextRequest): { authorized: boolean; user?: AdminUser; error?: string } {
  const token = extractAdminTokenFromRequest(request)

  if (!token) {
    return { authorized: false, error: '인증 토큰이 없습니다.' }
  }

  const user = verifyAdminToken(token)

  if (!user) {
    return { authorized: false, error: '유효하지 않은 토큰입니다.' }
  }

  return { authorized: true, user }
}