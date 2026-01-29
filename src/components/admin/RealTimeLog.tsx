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

    // 수동 새로고침 함수
    const fetchLogs = () => {
        const sources = ['System', 'AgentCoordinator', 'Supabase', 'OpenAI', 'Claude']
        const levels: LogEntry['level'][] = ['info', 'info', 'info', 'success', 'warn']
        const messages = [
            'API Health Check: OK',
            'Token usage updated for user: demo-user',
            'New workflow request received',
            'Cache invalidated for key: trends-2024',
            'Rate limit approaching for Gemini API'
        ]

        // 한 번에 3~5개의 로그 시뮬레이션
        const count = Math.floor(Math.random() * 3) + 1
        const newLogs: LogEntry[] = []

        for (let i = 0; i < count; i++) {
            newLogs.push({
                id: Date.now().toString() + i,
                timestamp: new Date().toLocaleTimeString(),
                level: levels[Math.floor(Math.random() * levels.length)],
                message: messages[Math.floor(Math.random() * messages.length)],
                source: sources[Math.floor(Math.random() * sources.length)]
            })
        }

        setLogs(prev => [...newLogs, ...prev].slice(0, 50))
    }

    // 초기 로드 시 1회 실행
    useEffect(() => {
        fetchLogs()
    }, [])

    return (
        <Card className="card-enhanced border-none shadow-md h-[400px] flex flex-col">
            <CardHeader className="bg-muted/30 pb-3 border-b border-border/50">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-primary" />
                        시스템 실시간 로그
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                            <Activity className="w-3 h-3 mr-1" /> Live
                        </Badge>
                        <button
                            onClick={fetchLogs}
                            className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/90 transition-colors"
                        >
                            새로고침
                        </button>
                    </div>
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
