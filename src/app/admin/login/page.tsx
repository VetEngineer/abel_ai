'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, Eye, EyeOff, Smartphone } from 'lucide-react'

export default function AdminLoginPage() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mfaRequired, setMfaRequired] = useState(false)
  const [otp, setOtp] = useState('')
  const [tempToken, setTempToken] = useState<string | null>(null)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })

      const data = await response.json()

      if (!response.ok) {
        // MFA 요구 시
        if (data.requireMFA) {
          setMfaRequired(true)
          setTempToken(data.tempToken)
          setLoading(false)
          return
        }
        throw new Error(data.error || '로그인에 실패했습니다.')
      }

      handleLoginSuccess(data.token)

    } catch (error) {
      setError(error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, otp })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '인증 코드가 올바르지 않습니다.')
      }

      handleLoginSuccess(data.token)

    } catch (error) {
      setError(error instanceof Error ? error.message : '인증 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  const handleLoginSuccess = (token: string) => {
    localStorage.setItem('admin_token', token)
    router.push('/admin')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            {mfaRequired ? (
              <Smartphone className="h-6 w-6 text-primary-foreground" />
            ) : (
              <Shield className="h-6 w-6 text-primary-foreground" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {mfaRequired ? '2단계 인증' : '관리자 로그인'}
          </CardTitle>
          <CardDescription>
            {mfaRequired
              ? 'Google Authenticator 앱의 6자리 인증 코드를 입력하세요'
              : 'Abel AI 관리자 패널에 액세스하려면 로그인하세요'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mfaRequired ? (
            <form onSubmit={handleMfaSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">인증 코드</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={6}
                  required
                  className="bg-background text-center text-lg tracking-widest font-mono"
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                {loading ? '인증 확인 중...' : '인증하기'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setMfaRequired(false)
                  setOtp('')
                  setError('')
                }}
              >
                로그인 화면으로 돌아가기
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">사용자명</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="관리자 사용자명을 입력하세요"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  required
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="비밀번호를 입력하세요"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    required
                    className="bg-background pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    로그인 중...
                  </>
                ) : (
                  '로그인'
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="text-sm"
            >
              홈으로 돌아가기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}