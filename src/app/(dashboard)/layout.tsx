'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getBrowserSupabaseClient } from '@/lib/supabase/client'
import {
    LayoutDashboard,
    FileText,
    PlusCircle,
    Settings,
    LogOut,
    Menu,
    X,
    CreditCard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [credits, setCredits] = useState<number>(0)
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = getBrowserSupabaseClient()
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                router.push('/login')
                return
            }

            setUser(session.user)

            // Fetch credits specifically from public.users table if possible
            // This might require a separate API call or Supabase select if the user data isn't fully in session metadata
            fetchUserCredits(session.user.id)
        }

        checkAuth()
    }, [router])

    const fetchUserCredits = async (userId: string) => {
        const supabase = getBrowserSupabaseClient()
        // public.users 테이블에서 credits 조회
        const { data, error } = await supabase
            .from('users')
            .select('credits')
            .eq('id', userId)
            .single()

        if (data) {
            setCredits(data.credits)
        }
    }

    const handleLogout = async () => {
        const supabase = getBrowserSupabaseClient()
        await supabase.auth.signOut()
        router.push('/')
    }

    const navigation = [
        { name: '대시보드', href: '/dashboard', icon: LayoutDashboard },
        { name: '프로젝트 목록', href: '/dashboard/projects', icon: FileText },
        { name: '새 프로젝트', href: '/dashboard/new', icon: PlusCircle },
        { name: '설정', href: '/dashboard/settings', icon: Settings },
    ]

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-slate-900 text-white">
            <div className="p-6">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <span className="text-primary">Blog</span>AI
                </h1>
            </div>

            <div className="flex-1 px-4 space-y-2">
                {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    )
                })}
            </div>

            <div className="p-4 border-t border-slate-800">
                <div className="bg-slate-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400 font-medium">보유 크레딧</span>
                        <CreditCard className="w-3 h-3 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {credits.toLocaleString()} <span className="text-xs font-normal text-slate-400">CR</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full text-xs h-7 bg-slate-700 border-slate-600 hover:bg-slate-600 border-none text-white">
                        충전하기
                    </Button>
                </div>

                <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9 border border-slate-700">
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback>{user?.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-white">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-white hover:bg-slate-800">
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b">
                <span className="font-bold text-lg">BlogAI</span>
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="w-6 h-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64 border-r-0">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>

            <div className="flex h-screen overflow-hidden">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 z-50">
                    <SidebarContent />
                </aside>

                {/* Main Content */}
                <main className="flex-1 lg:pl-64 flex flex-col min-h-0 overflow-auto">
                    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
