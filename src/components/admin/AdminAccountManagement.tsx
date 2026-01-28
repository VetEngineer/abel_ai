'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface AdminAccount {
  id: string
  username: string
  email: string | null
  role: 'super_admin' | 'admin' | 'moderator'
  is_active: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export default function AdminAccountManagement() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newAccount, setNewAccount] = useState({
    username: '',
    email: '',
    password: '',
    role: 'admin' as const
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/admin/accounts')

      if (response.status === 401) {
        toast({
          title: "인증 오류",
          description: "관리자 로그인이 필요합니다.",
          variant: "destructive",
        })
        return
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '계정 조회 실패')
      }

      setAccounts(data.accounts || [])
    } catch (error) {
      console.error('관리자 계정 조회 실패:', error)
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "계정 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddAccount = async () => {
    if (!newAccount.username || !newAccount.password) {
      toast({
        title: "입력 오류",
        description: "사용자명과 비밀번호를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    if (newAccount.password.length < 8) {
      toast({
        title: "비밀번호 오류",
        description: "비밀번호는 8자 이상이어야 합니다.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch('/api/admin/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAccount),
      })

      const data = await response.json()

      if (response.status === 401) {
        toast({
          title: "인증 오류",
          description: "관리자 로그인이 필요합니다.",
          variant: "destructive",
        })
        return
      }

      if (response.status === 403) {
        toast({
          title: "권한 오류",
          description: "슈퍼 관리자만 계정을 생성할 수 있습니다.",
          variant: "destructive",
        })
        return
      }

      if (!response.ok) {
        throw new Error(data.error || '계정 생성 실패')
      }

      toast({
        title: "성공",
        description: "관리자 계정이 생성되었습니다.",
      })
      setIsAddDialogOpen(false)
      setNewAccount({
        username: '',
        email: '',
        password: '',
        role: 'admin'
      })
      fetchAccounts()

    } catch (error) {
      console.error('관리자 계정 생성 실패:', error)
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "계정 생성에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800'
      case 'admin': return 'bg-blue-100 text-blue-800'
      case 'moderator': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin': return '슈퍼 관리자'
      case 'admin': return '관리자'
      case 'moderator': return '운영자'
      default: return role
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">로딩 중...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>관리자 계정 관리</CardTitle>
              <CardDescription>
                시스템 관리자 계정을 관리하고 권한을 설정합니다.
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>새 관리자 계정 추가</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>새 관리자 계정 추가</DialogTitle>
                  <DialogDescription>
                    새로운 관리자 계정을 생성합니다. (슈퍼 관리자 권한 필요)
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="username">사용자명</label>
                    <Input
                      id="username"
                      value={newAccount.username}
                      onChange={(e) =>
                        setNewAccount({ ...newAccount, username: e.target.value })
                      }
                      placeholder="사용자명을 입력하세요"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="email">이메일 (선택사항)</label>
                    <Input
                      id="email"
                      type="email"
                      value={newAccount.email}
                      onChange={(e) =>
                        setNewAccount({ ...newAccount, email: e.target.value })
                      }
                      placeholder="이메일을 입력하세요"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="password">비밀번호</label>
                    <Input
                      id="password"
                      type="password"
                      value={newAccount.password}
                      onChange={(e) =>
                        setNewAccount({ ...newAccount, password: e.target.value })
                      }
                      placeholder="8자 이상의 비밀번호를 입력하세요"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="role">권한</label>
                    <Select
                      value={newAccount.role}
                      onValueChange={(value: any) =>
                        setNewAccount({ ...newAccount, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="권한 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">관리자</SelectItem>
                        <SelectItem value="moderator">운영자</SelectItem>
                        <SelectItem value="super_admin">슈퍼 관리자</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    취소
                  </Button>
                  <Button onClick={handleAddAccount}>추가</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>사용자명</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>권한</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>마지막 로그인</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.username}</TableCell>
                  <TableCell>{account.email || '-'}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(account.role)}>
                      {getRoleDisplayName(account.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={account.is_active ? "default" : "secondary"}>
                      {account.is_active ? '활성' : '비활성'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {account.last_login_at
                      ? new Date(account.last_login_at).toLocaleDateString('ko-KR')
                      : '로그인 없음'
                    }
                  </TableCell>
                  <TableCell>
                    {new Date(account.created_at).toLocaleDateString('ko-KR')}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // TODO: 계정 상태 토글 구현
                        toast({
                          title: "구현 예정",
                          description: "계정 상태 변경 기능은 곧 구현될 예정입니다.",
                        })
                      }}
                    >
                      {account.is_active ? '비활성화' : '활성화'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        // TODO: 계정 삭제 구현
                        toast({
                          title: "구현 예정",
                          description: "계정 삭제 기능은 곧 구현될 예정입니다.",
                        })
                      }}
                    >
                      삭제
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {accounts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>등록된 관리자 계정이 없습니다.</p>
              <p className="text-sm mt-2">
                현재 환경변수 기반 관리자 계정만 사용 중입니다.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}