'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Shield, ShieldAlert, CheckCircle, Smartphone } from 'lucide-react'

export default function AdminSecuritySettings({ user, onUpdate }: { user: any, onUpdate?: () => void }) {
    const [isSetupMode, setIsSetupMode] = useState(false)
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [secret, setSecret] = useState<string | null>(null)
    const [otpCode, setOtpCode] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const isMfaEnabled = user?.isMfaEnabled

    const startSetup = async () => {
        setLoading(true)
        setError(null)
        try {
            const token = localStorage.getItem('admin_token')
            const res = await fetch('/api/admin/auth/mfa/setup', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()

            if (data.success) {
                setQrCode(data.qrCode)
                setSecret(data.secret)
                setIsSetupMode(true)
            } else {
                setError(data.error)
            }
        } catch (err) {
            setError('MFA 설정 시작 실패')
        } finally {
            setLoading(false)
        }
    }

    const confirmSetup = async () => {
        if (!otpCode) return
        setLoading(true)
        setError(null)

        try {
            const token = localStorage.getItem('admin_token')
            const res = await fetch('/api/admin/auth/mfa/setup', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ token: otpCode, secret })
            })

            const data = await res.json()

            if (data.success) {
                setSuccessMsg('MFA가 성공적으로 활성화되었습니다.')
                setIsSetupMode(false)
                setQrCode(null)
                setSecret(null)
                setOtpCode('')
                if (onUpdate) onUpdate()
            } else {
                setError(data.error)
            }
        } catch (err) {
            setError('MFA 활성화 실패')
        } finally {
            setLoading(false)
        }
    }

    const disableMFA = async () => {
        if (!confirm('정말로 MFA를 비활성화하시겠습니까? 계정 보안이 취약해질 수 있습니다.')) return

        setLoading(true)
        try {
            const token = localStorage.getItem('admin_token')
            const res = await fetch('/api/admin/auth/mfa/setup', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                setSuccessMsg('MFA가 비활성화되었습니다.')
                if (onUpdate) onUpdate()
            } else {
                setError(data.error)
            }
        } catch (err) {
            setError('MFA 비활성화 실패')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        다중 요소 인증 (MFA)
                    </CardTitle>
                    <CardDescription>
                        계정 보안을 강화하기 위해 Google Authenticator 등의 앱을 사용하여 2단계 인증을 설정합니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <ShieldAlert className="h-4 w-4" />
                            <AlertTitle>오류</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {successMsg && (
                        <Alert className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertTitle>성공</AlertTitle>
                            <AlertDescription>{successMsg}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${isMfaEnabled ? 'bg-green-100' : 'bg-slate-200'}`}>
                                <Smartphone className={`h-6 w-6 ${isMfaEnabled ? 'text-green-600' : 'text-slate-500'}`} />
                            </div>
                            <div>
                                <div className="font-medium">
                                    {isMfaEnabled ? 'MFA가 활성화됨' : 'MFA가 비활성화됨'}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {isMfaEnabled ? '계정이 안전하게 보호되고 있습니다.' : '보안을 위해 MFA를 활성화하는 것이 좋습니다.'}
                                </div>
                            </div>
                        </div>

                        {!isMfaEnabled && !isSetupMode && (
                            <Button onClick={startSetup} disabled={loading}>
                                설정하기
                            </Button>
                        )}

                        {isMfaEnabled && (
                            <Button variant="outline" onClick={disableMFA} disabled={loading} className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50">
                                비활성화
                            </Button>
                        )}
                    </div>

                    {isSetupMode && qrCode && (
                        <div className="mt-6 border-t pt-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="flex flex-col items-center justify-center space-y-4">
                                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                                        <img src={qrCode} alt="MFA QR Code" className="w-48 h-48" />
                                    </div>
                                    <p className="text-sm text-center text-muted-foreground">
                                        Google Authenticator 앱으로<br />위 QR 코드를 스캔하세요.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label>인증 코드 확인</Label>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            앱에 표시된 6자리 숫자를 입력하세요.
                                        </p>
                                        <div className="flex gap-2">
                                            <Input
                                                value={otpCode}
                                                onChange={(e) => setOtpCode(e.target.value)}
                                                placeholder="000000"
                                                maxLength={6}
                                                className="text-center text-lg tracking-widest font-mono"
                                            />
                                            <Button onClick={confirmSetup} disabled={loading || otpCode.length !== 6}>
                                                확인
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="bg-yellow-50 p-3 rounded text-xs text-yellow-800 border border-yellow-200">
                                        주의: 이 화면을 벗어나면 설정이 취소됩니다.
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setIsSetupMode(false)}>
                                        취소
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
