import { getMCPSupabaseClient } from '@/lib/supabase/client'
import { APIKeyStorage, StoredAPIKey } from './api-key-storage-interface'

export class SupabaseAPIKeyStorage implements APIKeyStorage {
    private static instance: SupabaseAPIKeyStorage

    private constructor() { }

    public static getInstance(): SupabaseAPIKeyStorage {
        if (!SupabaseAPIKeyStorage.instance) {
            SupabaseAPIKeyStorage.instance = new SupabaseAPIKeyStorage()
        }
        return SupabaseAPIKeyStorage.instance
    }

    async getAllKeys(): Promise<StoredAPIKey[]> {
        const supabase = await getMCPSupabaseClient()
        const { data, error } = await supabase
            .from('admin_api_keys')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Supabase getKeys error:', error)
            return []
        }

        return data.map((row: any) => this.mapRowToStoredKey(row))
    }

    async getActiveKey(service: StoredAPIKey['service_name']): Promise<StoredAPIKey | null> {
        const supabase = await getMCPSupabaseClient()
        const { data, error } = await supabase
            .from('admin_api_keys')
            .select('*')
            .eq('service_name', service)
            .eq('is_active', true)
            .single()

        if (error || !data) {
            return null
        }

        return this.mapRowToStoredKey(data)
    }

    async upsertKey(keyData: Omit<StoredAPIKey, 'id' | 'created_at' | 'current_month_cost' | 'usage_count'> & { id?: string }): Promise<StoredAPIKey> {
        const supabase = await getMCPSupabaseClient()

        // Convert to row format
        const rowData: any = {
            service_name: keyData.service_name,
            api_key: keyData.api_key || '', // Encrypted key expected here
            api_key_name: keyData.api_key_name,
            is_active: keyData.is_active,
            rate_limit_per_minute: keyData.rate_limit_per_minute,
            monthly_budget_usd: keyData.monthly_budget_usd,
            // last_used: keyData.last_used // Optional in update
        }

        if (keyData.id) {
            rowData.id = keyData.id
            rowData.updated_at = new Date().toISOString()
        }

        // Since upsert in supabase-js needs all required columns or match on PK
        const { data, error } = await supabase
            .from('admin_api_keys')
            .upsert(rowData)
            .select()
            .single()

        if (error) {
            console.error('Supabase upsertKey error:', error)
            throw new Error(`Failed to save API key: ${error.message}`)
        }

        return this.mapRowToStoredKey(data)
    }

    async deleteKey(id: string): Promise<boolean> {
        const supabase = await getMCPSupabaseClient()
        const { error } = await supabase
            .from('admin_api_keys')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Supabase deleteKey error:', error)
            return false
        }
        return true
    }

    async getKey(id: string): Promise<StoredAPIKey | null> {
        const supabase = await getMCPSupabaseClient()
        const { data, error } = await supabase
            .from('admin_api_keys')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !data) {
            return null
        }

        return this.mapRowToStoredKey(data)
    }

    async toggleKey(id: string, isActive: boolean): Promise<boolean> {
        const supabase = await getMCPSupabaseClient()
        const { error } = await supabase
            .from('admin_api_keys')
            .update({ is_active: isActive, updated_at: new Date().toISOString() })
            .eq('id', id)

        if (error) {
            console.error('Supabase toggleKey error:', error)
            return false
        }
        return true
    }

    async updateUsage(id: string, cost: number): Promise<void> {
        // This might be better handled by a database trigger or RPC, but implementing simple update here
        // Note: The trigger 'trigger_update_api_key_usage' in migration already handles this 
        // when inserting into api_key_usage_logs.
        // So this might not be needed strictly if we log usages properly.
        // However, for manual updates:

        // We won't implement manual update here to avoid conflict with trigger. 
        // Usage should be tracked by inserting logs.
        console.log('Supabase storage relies on usage logs trigger for stats update.')
    }

    async logUsage(usage: any): Promise<void> {
        const supabase = await getMCPSupabaseClient()

        // Need to find api_key_id if not provided or if we only have Key string.
        // Usage typically provides user_id, cost, tokens, etc.
        // We assume usage object matches api_key_usage_logs structure roughly.

        /*
        usage object from TokenUsage interface:
         user_id: string
         content_id?: string
         tokens_used: number
         cost_usd: number
         request_type: 'text_generation' | ...
         model_name: string
         prompt_tokens?: number
         completion_tokens?: number
         success: boolean
         error_message?: string
         response_time_ms: number
        */

        // We need api_key_id to link it. 
        // For now, if we don't have it (e.g. usage doesn't pass it), we might fail FK constraint.
        // APIKeyManager.recordTokenUsage takes (apiKeyId, usage).
        // Wait, APIKeyManager.recordTokenUsage signature: (apiKeyId: string, usage: TokenUsage)
        // So I should change logUsage signature to (apiKeyId: string, usage: any)?
        // The interface said logUsage(usage: any). I should probably change interface to logUsage(id: string, usage: any).
        // But I can validly pass { ...usage, api_key_id: id } to logUsage if I keep it as one arg.

        // Let's assume usage passed here HAS api_key_id or we handle it.
        // Actually, let's update interface to logUsage(apiKeyId: string, usage: any) is cleaner.
        // But strictly following current interface string:

        const { api_key_id, ...rest } = usage

        if (!api_key_id) {
            console.warn('logUsage called without api_key_id')
            return
        }

        const { error } = await supabase
            .from('api_key_usage_logs')
            .insert({
                api_key_id: api_key_id,
                user_id: rest.user_id,
                content_id: rest.content_id,
                tokens_used: rest.tokens_used,
                cost_usd: rest.cost_usd,
                request_type: rest.request_type,
                model_name: rest.model_name,
                prompt_tokens: rest.prompt_tokens,
                completion_tokens: rest.completion_tokens,
                success: rest.success,
                error_message: rest.error_message,
                response_time_ms: rest.response_time_ms
            })

        if (error) {
            console.error('Supabase logUsage error:', error)
        }
    }

    private mapRowToStoredKey(row: any): StoredAPIKey {
        return {
            id: row.id,
            service_name: row.service_name,
            api_key: row.api_key, // Encrypted
            api_key_name: row.api_key_name,
            is_active: row.is_active,
            rate_limit_per_minute: row.rate_limit_per_minute,
            monthly_budget_usd: row.monthly_budget_usd,
            current_month_cost: row.current_month_cost,
            usage_count: row.usage_count,
            last_used: row.last_used,
            created_at: row.created_at,
            // client_id/secret not supported in this table schema
        }
    }
}

export const supabaseApiKeyStorage = SupabaseAPIKeyStorage.getInstance()
