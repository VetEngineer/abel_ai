'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Search, UserCog, Mail, Calendar, CreditCard, Plus, Minus } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface User {
  id: string
  email: string
  name: string
  subscription_tier: string
  created_at: string
  last_login_at?: string
  status?: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [creditAmount, setCreditAmount] = useState<number>(0)
  const [creditDescription, setCreditDescription] = useState('')
  const [creditDialogOpen, setCreditDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to fetch users')

      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('사용자 목록 조회 실패:', error)
      toast({
        title: "오류",
        description: "사용자 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAdjustCredits = async () => {
    if (!selectedUser || creditAmount === 0) return

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/users/credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: creditAmount,
          description: creditDescription || '관리자 수동 조정',
          transactionType: 'manual_adjustment'
        })
      })

      if (!response.ok) throw new Error('Failed to adjust credits')

      toast({ title: '성공', description: '크레딧이 조정되었습니다.' })
      setCreditDialogOpen(false)
      fetchUsers() // Refresh list
    } catch (error) {
      toast({ title: '오류', description: '크레딧 조정 실패', variant: 'destructive' })
    }
  }

  const openCreditDialog = (user: User) => {
    setSelectedUser(user)
    setCreditAmount(0)
    setCreditDescription('')
    setCreditDialogOpen(true)
  }

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTierBadgeColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'pro': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'enterprise': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'basic': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Card className="card-enhanced border-none shadow-md">
      <CardHeader className="bg-primary/5 pb-6 border-b border-primary/10">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl text-primary flex items-center gap-2">
              <span className="text-2xl">👥</span> 사용자 관리
            </CardTitle>
            <CardDescription className="mt-1 text-base">
              서비스 가입 사용자를 조회하고 관리합니다.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="이름 또는 이메일 검색..."
                className="pl-9 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={fetchUsers} variant="outline" size="icon">
              <UserCog className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-md border-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="pl-6">사용자 정보</TableHead>
                <TableHead>구독 등급</TableHead>
                <TableHead>크레딧</TableHead>
                <TableHead>가입일</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right pr-6">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    데이터를 불러오는 중...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    검색 결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user: any) => (
                  <TableRow key={user.id} className="hover:bg-muted/5 transition-colors">
                    <TableCell className="pl-6">
                      <div className="flex flex-col">
                        <span className="font-medium text-base">{user.name}</span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {user.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getTierBadgeColor(user.subscription_tier)}>
                        {user.subscription_tier || 'Free'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono font-medium">{user.credits?.toLocaleString() || 0} CR</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(user.created_at).toLocaleDateString('ko-KR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'banned' ? 'destructive' : 'secondary'}>
                        {user.status === 'banned' ? '정지됨' : '활동 중'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6 space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openCreditDialog(user)}>
                        <CreditCard className="w-3.5 h-3.5 mr-1" /> 크레딧
                      </Button>
                      <Button variant="ghost" size="sm">상세보기</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={creditDialogOpen} onOpenChange={setCreditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>크레딧 조정: {selectedUser?.name}</DialogTitle>
            <DialogDescription>
              사용자에게 크레딧을 추가하거나 차감합니다. (현재: {selectedUser?.credits || 0} CR)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>조정 금액 (+/-)</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setCreditAmount(prev => prev - 100)}><Minus className="h-4 w-4" /></Button>
                <Input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Number(e.target.value))}
                  className="text-center"
                />
                <Button variant="outline" size="icon" onClick={() => setCreditAmount(prev => prev + 100)}><Plus className="h-4 w-4" /></Button>
              </div>
              <p className="text-xs text-muted-foreground">양수는 지급, 음수는 차감입니다.</p>
            </div>
            <div className="grid gap-2">
              <Label>사유 (로그 기록용)</Label>
              <Input
                value={creditDescription}
                onChange={(e) => setCreditDescription(e.target.value)}
                placeholder="예: 1월 프로모션 지급"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreditDialogOpen(false)}>취소</Button>
            <Button onClick={handleAdjustCredits}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>

  )
}