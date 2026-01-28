'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Terminal, Activity, AlertCircle, CheckCircle2 } from 'lucide-react'

interface LogEntry {
    id: string
    timestamp: string
    level: 'info' | 'warn' | 'error' | 'success'
    message: string
    source: string
}

export default function RealTimeLog() {
    const [logs, setLogs] = useState<LogEntry[]>([])

    // 데모용 더미 로그 생성기
    useEffect(() => {
        const addLog = () => {
            const sources = ['System', 'AgentCoordinator', 'Supabase', 'OpenAI', 'Claude']
            const levels: LogEntry['level'][] = ['info', 'info', 'info', 'success', 'warn']
            const messages = [
                'API Health Check: OK',
                'Token usage updated for user: demo-user',
                'New workflow request received',
                'Cache invalidated for key: trends-2024',
                'Rate limit approaching for Gemini API'
            ]

            const newLog: LogEntry = {
                id: Date.now().toString(),
                timestamp: new Date().toLocaleTimeString(),
                level: levels[Math.floor(Math.random() * levels.length)],
                message: messages[Math.floor(Math.random() * messages.length)],
                source: sources[Math.floor(Math.random() * sources.length)]
            }

            setLogs(prev => [newLog, ...prev].slice(0, 50)) // 최근 50개만 유지
        }

        const interval = setInterval(addLog, 3000)
        return () => clearInterval(interval)
    }, [])

    return (
        <Card className="card-enhanced border-none shadow-md h-[400px] flex flex-col">
            <CardHeader className="bg-muted/30 pb-3 border-b border-border/50">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-primary" />
                        시스템 실시간 로그
                    </CardTitle>
                    <Badge variant="outline" className="animate-pulse bg-green-100 text-green-700 border-green-200">
                        <Activity className="w-3 h-3 mr-1" /> Live
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
                <div className="h-full p-4 overflow-y-auto scrollbar-thin">
                    <div className="space-y-3">
                        {logs.map((log) => (
                            <div key={log.id} className="flex items-start gap-3 text-sm font-mono border-b border-border/40 pb-2 last:border-0 hover:bg-muted/20 p-1 rounded">
                                <span className="text-muted-foreground min-w-[80px] text-xs pt-0.5">{log.timestamp}</span>
                                <Badge
                                    variant="outline"
                                    className={`min-w-[70px] justify-center text-[10px] h-5 px-1
                    ${log.level === 'info' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            log.level === 'warn' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                log.level === 'error' ? 'bg-red-50 text-red-700 border-red-200' :
                                                    'bg-green-50 text-green-700 border-green-200'
                                        }`}
                                >
                                    {log.level.toUpperCase()}
                                </Badge>
                                <div className="flex-1 break-all">
                                    <span className="font-bold text-foreground/80 mr-2">[{log.source}]</span>
                                    <span className="text-muted-foreground">{log.message}</span>
                                </div>
                            </div>
                        ))}
                        {logs.length === 0 && (
                            <div className="text-center text-muted-foreground py-10">
                                로그 수집 대기 중...
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
