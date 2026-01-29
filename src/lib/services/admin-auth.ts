import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { TOTP } from 'otplib'
import { generateSecret, generateURI, verify } from 'otplib'
import QRCode from 'qrcode'
import { getMCPSupabaseClient, AdminAccount, AdminSession } from '@/lib/supabase/client'

// TOTP 인스턴스 생성
const totp = new TOTP()

export interface AuthUser {
  id: string
  username: string
  email: string | null
  role: 'super_admin' | 'admin' | 'moderator'
  isActive: boolean
  isMfaEnabled?: boolean
}

export interface LoginResult {
  success: boolean
  user?: AuthUser
  token?: string
  error?: string
  requireMFA?: boolean
  tempToken?: string
}

export interface CreateAdminAccountData {
  username: string
  email?: string
  password: string
  role?: 'super_admin' | 'admin' | 'moderator'
  createdBy?: string
}

class AdminAuthService {
  private static instance: AdminAuthService
  private jwtSecret: string

  private constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret-change-in-production'
  }

  public static getInstance(): AdminAuthService {
    if (!AdminAuthService.instance) {
      AdminAuthService.instance = new AdminAuthService()
    }
    return AdminAuthService.instance
  }

  // 비밀번호 해싱
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
  }

  // 비밀번호 검증
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  // JWT 토큰 생성
  generateToken(user: AuthUser): string {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      this.jwtSecret,
      { expiresIn: '24h' }
    )
  }

  // JWT 토큰 검증
  verifyToken(token: string): AuthUser | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any
      return {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email || null,
        role: decoded.role,
        isActive: true,
        isMfaEnabled: false
      }
    } catch (error) {
      console.error('JWT 토큰 검증 실패:', error)
      return null
    }
  }

  // MFA 시크릿 생성
  async generateMFASetup(userId: string, email: string) {
    const secret = generateSecret()
    const otpauth = generateURI({ secret, issuer: 'BlogAutomationAdmin', label: email })
    const qrCode = await QRCode.toDataURL(otpauth)

    return { secret, qrCode }
  }

  // MFA 활성화 (검증 포함)
  async enableMFA(userId: string, token: string, secret: string): Promise<boolean> {
    const result = await verify({ token, secret })
    if (!result.valid) return false

    // DB에 시크릿 저장 및 활성화
    const supabase = await getMCPSupabaseClient()
    await supabase.from('admin_accounts')
      .update({
        totp_secret: secret,
        is_mfa_enabled: true
      })
      .eq('id', userId)

    return true
  }

  // MFA 비활성화
  async disableMFA(userId: string): Promise<void> {
    const supabase = await getMCPSupabaseClient()
    await supabase.from('admin_accounts')
      .update({
        totp_secret: null,
        is_mfa_enabled: false
      })
      .eq('id', userId)
  }

  // MFA 토큰 검증
  async verifyMFAToken(userId: string, token: string): Promise<boolean> {
    const supabase = await getMCPSupabaseClient()
    const { data: admin } = await supabase
      .from('admin_accounts')
      .select('totp_secret')
      .eq('id', userId)
      .single()

    if (!admin || !admin.totp_secret) return false

    const result = await verify({ token, secret: admin.totp_secret })
    return result.valid
  }

  // 로그인 시도
  async login(username: string, password: string, ipAddress?: string, userAgent?: string): Promise<LoginResult> {
    try {
      // Supabase 설정 확인
      if (!this.isSupabaseAvailable()) {
        return this.fallbackLogin(username, password)
      }

      const supabase = await getMCPSupabaseClient()
      let { data: admin, error } = await supabase
        .from('admin_accounts')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .single()

      if (error || !admin) {
        // DB에 계정이 없지만, 환경변수와 일치하는 경우 -> 초기 계정 자동 생성 (Auto-Seeding)
        const envUsername = process.env.ADMIN_USERNAME
        const envPassword = process.env.ADMIN_PASSWORD

        if (envUsername && envPassword && username === envUsername && password === envPassword) {
          console.log('초기 관리자 계정 자동 생성 중...', username)
          const createResult = await this.createAdminAccount({
            username: envUsername,
            password: envPassword,
            role: 'super_admin'
          })

          if (createResult.success && createResult.admin) {
            // 생성된 계정으로 로그인 진행
            admin = createResult.admin
          } else {
            return { success: false, error: '초기 관리자 계정 생성에 실패했습니다.' }
          }
        } else {
          return { success: false, error: '사용자명 또는 비밀번호가 올바르지 않습니다.' }
        }
      }

      // 비밀번호 검증
      const isPasswordValid = await this.verifyPassword(password, admin.password_hash)
      if (!isPasswordValid) {
        return { success: false, error: '사용자명 또는 비밀번호가 올바르지 않습니다.' }
      }

      // MFA 확인
      if (admin.is_mfa_enabled) {
        // 임시 토큰 생성 (MFA 검증용, 짧은 만료 시간)
        const tempToken = jwt.sign(
          { id: admin.id, type: 'mfa_pending' },
          this.jwtSecret,
          { expiresIn: '5m' }
        )
        return {
          success: false,
          requireMFA: true,
          tempToken: tempToken
        }
      }

      return this.finalizeLogin(admin, ipAddress, userAgent)

    } catch (error) {
      console.error('로그인 처리 오류:', error)
      return { success: false, error: '로그인 처리 중 오류가 발생했습니다.' }
    }
  }

  // MFA 검증 후 최종 로그인 처리
  async verifyMFAAndLogin(tempToken: string, otp: string, ipAddress?: string, userAgent?: string): Promise<LoginResult> {
    try {
      const decoded = jwt.verify(tempToken, this.jwtSecret) as any
      if (decoded.type !== 'mfa_pending') throw new Error('Invalid token type')

      const userId = decoded.id
      const isValid = await this.verifyMFAToken(userId, otp)

      if (!isValid) {
        return { success: false, error: 'OTP 코드가 올바르지 않습니다.' }
      }

      // 관리자 정보 조회
      const supabase = await getMCPSupabaseClient()
      const { data: admin } = await supabase.from('admin_accounts').select('*').eq('id', userId).single()

      return this.finalizeLogin(admin, ipAddress, userAgent)

    } catch (error) {
      return { success: false, error: '인증 세션이 만료되었거나 유효하지 않습니다.' }
    }
  }

  // 로그인 성공 공통 처리
  private async finalizeLogin(admin: any, ipAddress?: string, userAgent?: string): Promise<LoginResult> {
    const supabase = await getMCPSupabaseClient()
    await supabase
      .from('admin_accounts')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', admin.id)

    const user: AuthUser = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      isActive: admin.is_active,
      isMfaEnabled: admin.is_mfa_enabled
    }

    const token = this.generateToken(user)

    try {
      await this.createSession(admin.id, token, ipAddress, userAgent)
    } catch (sessionError) {
      console.warn('세션 저장 실패:', sessionError)
    }

    return { success: true, user, token }
  }

  // Supabase 대체 로그인 (환경변수 기반)
  private async fallbackLogin(username: string, password: string): Promise<LoginResult> {
    console.log('Supabase 미설정, 환경변수 기반 로그인 시도')

    const envUsername = process.env.ADMIN_USERNAME
    const envPassword = process.env.ADMIN_PASSWORD

    if (!envUsername || !envPassword) {
      return { success: false, error: '관리자 계정이 설정되지 않았습니다.' }
    }

    if (username === envUsername && password === envPassword) {
      const user: AuthUser = {
        id: 'env-admin',
        username: envUsername,
        email: null,
        role: 'super_admin',
        isActive: true,
        isMfaEnabled: false
      }

      const token = this.generateToken(user)

      console.log('환경변수 기반 로그인 성공:', username)
      return { success: true, user, token }
    }

    return { success: false, error: '사용자명 또는 비밀번호가 올바르지 않습니다.' }
  }

  // 관리자 계정 생성
  async createAdminAccount(data: CreateAdminAccountData): Promise<{ success: boolean; admin?: AdminAccount; error?: string }> {
    try {
      if (!this.isSupabaseAvailable()) {
        return { success: false, error: 'Supabase가 설정되지 않았습니다.' }
      }

      const supabase = await getMCPSupabaseClient()

      // 사용자명 중복 확인
      const { data: existing } = await supabase
        .from('admin_accounts')
        .select('id')
        .eq('username', data.username)
        .single()

      if (existing) {
        return { success: false, error: '이미 존재하는 사용자명입니다.' }
      }

      // 비밀번호 해싱
      const passwordHash = await this.hashPassword(data.password)

      // 계정 생성
      const { data: admin, error } = await supabase
        .from('admin_accounts')
        .insert({
          username: data.username,
          email: data.email || null,
          password_hash: passwordHash,
          role: data.role || 'admin',
          is_active: true,
          created_by: data.createdBy || null
        })
        .select()
        .single()

      if (error) {
        console.error('관리자 계정 생성 오류:', error)
        return { success: false, error: '계정 생성에 실패했습니다.' }
      }

      console.log('관리자 계정 생성 성공:', data.username)
      return { success: true, admin }

    } catch (error) {
      console.error('관리자 계정 생성 처리 오류:', error)
      return { success: false, error: '계정 생성 처리 중 오류가 발생했습니다.' }
    }
  }

  // 세션 생성
  private async createSession(adminId: string, token: string, ipAddress?: string, userAgent?: string): Promise<void> {
    try {
      const supabase = await getMCPSupabaseClient()

      // 만료 시간 (24시간 후)
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24)

      await supabase
        .from('admin_sessions')
        .insert({
          admin_id: adminId,
          session_token: token,
          expires_at: expiresAt.toISOString(),
          ip_address: ipAddress,
          user_agent: userAgent
        })

      // 이전 세션 정리 (선택적)
      await this.cleanupExpiredSessions()

    } catch (error) {
      console.error('세션 생성 오류:', error)
      throw error
    }
  }

  // 만료된 세션 정리
  private async cleanupExpiredSessions(): Promise<void> {
    try {
      const supabase = await getMCPSupabaseClient()

      await supabase
        .from('admin_sessions')
        .delete()
        .lt('expires_at', new Date().toISOString())

    } catch (error) {
      console.warn('만료된 세션 정리 실패:', error)
      // 정리 실패는 중요하지 않으므로 에러를 던지지 않음
    }
  }

  // Supabase 사용 가능성 확인
  private isSupabaseAvailable(): boolean {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    return Boolean(
      supabaseUrl &&
      supabaseServiceKey &&
      supabaseUrl !== 'your_supabase_project_url' &&
      supabaseServiceKey !== 'your_supabase_service_role_key'
    )
  }

  // 모든 관리자 계정 조회
  async getAllAdminAccounts(): Promise<{ success: boolean; accounts?: AdminAccount[]; error?: string }> {
    try {
      if (!this.isSupabaseAvailable()) {
        return { success: false, error: 'Supabase가 설정되지 않았습니다.' }
      }

      const supabase = await getMCPSupabaseClient()

      const { data: accounts, error } = await supabase
        .from('admin_accounts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('관리자 계정 조회 오류:', error)
        return { success: false, error: '계정 조회에 실패했습니다.' }
      }

      return { success: true, accounts }

    } catch (error) {
      console.error('관리자 계정 조회 처리 오류:', error)
      return { success: false, error: '계정 조회 처리 중 오류가 발생했습니다.' }
    }
  }
}

export const adminAuthService = AdminAuthService.getInstance()