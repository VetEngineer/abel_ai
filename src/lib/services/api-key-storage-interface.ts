export interface StoredAPIKey {
    id: string
    service_name: 'claude' | 'openai' | 'gemini' | 'stripe' | 'naver_search' | 'naver_datalab'
    api_key?: string
    client_id?: string
    client_secret?: string
    api_key_name: string
    is_active: boolean
    rate_limit_per_minute: number
    monthly_budget_usd: number
    current_month_cost: number
    usage_count: number
    last_used?: string
    created_at: string
}

export interface APIKeyStorage {
    getAllKeys(): Promise<StoredAPIKey[]> | StoredAPIKey[]
    getActiveKey(service: StoredAPIKey['service_name']): Promise<StoredAPIKey | null> | StoredAPIKey | null
    upsertKey(keyData: Omit<StoredAPIKey, 'id' | 'created_at' | 'current_month_cost' | 'usage_count'> & { id?: string }): Promise<StoredAPIKey> | StoredAPIKey
    deleteKey(id: string): Promise<boolean> | boolean
    getKey(id: string): Promise<StoredAPIKey | null> | StoredAPIKey | null
    toggleKey(id: string, isActive: boolean): Promise<boolean> | boolean
    updateUsage(id: string, cost: number): Promise<void> | void
    logUsage(usage: any): Promise<void> | void // usage type should be TokenUsage but to avoid circular imports we use any or define it here
}
