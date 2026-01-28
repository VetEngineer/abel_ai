import Link from 'next/link'
import { KakaoLoginButton } from '@/components/auth/KakaoLoginButton'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl font-bold tracking-tight">로그인</CardTitle>
                    <CardDescription>
                        서비스 이용을 위해 로그인이 필요합니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <KakaoLoginButton />
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pt-4 border-t mt-4">
                    <p className="text-sm text-gray-500 text-center">
                        블로그 자동화 관리자이신가요?
                    </p>
                    <Link
                        href="/admin/login"
                        className="text-sm font-medium text-gray-600 hover:text-gray-900 underline underline-offset-4 transition-colors text-center"
                    >
                        관리자 로그인하기
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}
