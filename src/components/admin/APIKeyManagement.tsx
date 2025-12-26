'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface APIKey {
  id: string
  service_name: 'claude' | 'openai' | 'gemini' | 'stripe'
  api_key_name: string
  is_active: boolean
  usage_count: number
  current_month_cost: number
  monthly_budget_usd: number
  last_used?: string
  created_at: string
}

export default function APIKeyManagement() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newKey, setNewKey] = useState({
    service_name: 'claude' as const,
    api_key_name: '',
    api_key: '',
    monthly_budget_usd: 1000,
    rate_limit_per_minute: 60
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchAPIKeys()
  }, [])

  const fetchAPIKeys = async () => {
    try {
      const response = await fetch('/api/admin/api-keys')
      const data = await response.json()
      setApiKeys(data.apiKeys || [])
    } catch (error) {
      console.error('API 키 조회 실패:', error)
      toast({
        title: "오류",
        description: "API 키 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddAPIKey = async () => {
    if (!newKey.api_key_name || !newKey.api_key) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newKey),
      })

      if (response.ok) {
        toast({
          title: "성공",
          description: "API 키가 추가되었습니다.",
        })
        setIsAddDialogOpen(false)
        setNewKey({
          service_name: 'claude',
          api_key_name: '',
          api_key: '',
          monthly_budget_usd: 1000,
          rate_limit_per_minute: 60
        })
        fetchAPIKeys()
      } else {
        throw new Error('API 키 추가 실패')
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "API 키 추가에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const toggleAPIKey = async (keyId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/api-keys/${keyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !isActive }),
      })

      if (response.ok) {
        toast({
          title: "성공",
          description: `API 키가 ${!isActive ? '활성화' : '비활성화'}되었습니다.`,
        })
        fetchAPIKeys()
      } else {
        throw new Error('상태 변경 실패')
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "API 키 상태 변경에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const deleteAPIKey = async (keyId: string) => {
    if (!confirm('정말로 이 API 키를 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/api-keys/${keyId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: "성공",
          description: "API 키가 삭제되었습니다.",
        })
        fetchAPIKeys()
      } else {
        throw new Error('삭제 실패')
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "API 키 삭제에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const getServiceBadgeColor = (service: string) => {
    switch (service) {
      case 'claude': return 'bg-purple-100 text-purple-800'
      case 'openai': return 'bg-green-100 text-green-800'
      case 'gemini': return 'bg-blue-100 text-blue-800'
      case 'stripe': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
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
              <CardTitle>API 키 관리</CardTitle>
              <CardDescription>
                외부 서비스 API 키를 관리하고 사용량을 모니터링합니다.
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>새 API 키 추가</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>새 API 키 추가</DialogTitle>
                  <DialogDescription>
                    새로운 외부 서비스 API 키를 추가합니다.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="service">서비스</label>
                    <Select
                      value={newKey.service_name}
                      onValueChange={(value: any) =>
                        setNewKey({ ...newKey, service_name: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="서비스 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="claude">Claude (Anthropic)</SelectItem>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="gemini">Gemini (Google)</SelectItem>
                        <SelectItem value="stripe">Stripe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="name">키 이름</label>
                    <Input
                      id="name"
                      value={newKey.api_key_name}
                      onChange={(e) =>
                        setNewKey({ ...newKey, api_key_name: e.target.value })
                      }
                      placeholder="예: Claude Production Key"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="key">API 키</label>
                    <Textarea
                      id="key"
                      value={newKey.api_key}
                      onChange={(e) =>
                        setNewKey({ ...newKey, api_key: e.target.value })
                      }
                      placeholder="API 키를 입력하세요"
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="budget">월 예산 (USD)</label>
                    <Input
                      id="budget"
                      type="number"
                      value={newKey.monthly_budget_usd}
                      onChange={(e) =>
                        setNewKey({ ...newKey, monthly_budget_usd: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="rate-limit">분당 요청 제한</label>
                    <Input
                      id="rate-limit"
                      type="number"
                      value={newKey.rate_limit_per_minute}
                      onChange={(e) =>
                        setNewKey({ ...newKey, rate_limit_per_minute: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    취소
                  </Button>
                  <Button onClick={handleAddAPIKey}>추가</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>서비스</TableHead>
                <TableHead>키 이름</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>사용 횟수</TableHead>
                <TableHead>월 비용</TableHead>
                <TableHead>월 예산</TableHead>
                <TableHead>마지막 사용</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell>
                    <Badge className={getServiceBadgeColor(key.service_name)}>
                      {key.service_name.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{key.api_key_name}</TableCell>
                  <TableCell>
                    <Badge variant={key.is_active ? "default" : "secondary"}>
                      {key.is_active ? '활성' : '비활성'}
                    </Badge>
                  </TableCell>
                  <TableCell>{key.usage_count.toLocaleString()}</TableCell>
                  <TableCell>${key.current_month_cost.toFixed(2)}</TableCell>
                  <TableCell>${key.monthly_budget_usd.toFixed(2)}</TableCell>
                  <TableCell>
                    {key.last_used
                      ? new Date(key.last_used).toLocaleDateString('ko-KR')
                      : '사용 안됨'
                    }
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAPIKey(key.id, key.is_active)}
                    >
                      {key.is_active ? '비활성화' : '활성화'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteAPIKey(key.id)}
                    >
                      삭제
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {apiKeys.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              등록된 API 키가 없습니다.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}