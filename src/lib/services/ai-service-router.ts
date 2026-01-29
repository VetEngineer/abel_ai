import { apiKeyManager } from './api-key-manager'

export interface AIRequest {
  service: 'claude' | 'openai' | 'gemini'
  model: string
  prompt: string
  maxTokens?: number
  temperature?: number
  userId: string
  contentId?: string
}

export interface AIResponse {
  success: boolean
  data?: {
    text: string
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  error?: string
  cost: number
  executionTime: number
}

export interface ImageGenerationRequest {
  prompt: string
  model: 'gemini-nano-banana' | 'gemini-nano-banana-pro'
  size?: '512x512' | '1024x1024'
  userId: string
  contentId?: string
}

export interface ImageGenerationResponse {
  success: boolean
  data?: {
    imageUrl: string
    imageBuffer?: Buffer
  }
  error?: string
  cost: number
  executionTime: number
}

class AIServiceRouter {
  private static instance: AIServiceRouter

  private constructor() { }

  public static getInstance(): AIServiceRouter {
    if (!AIServiceRouter.instance) {
      AIServiceRouter.instance = new AIServiceRouter()
    }
    return AIServiceRouter.instance
  }

  // 텍스트 생성 요청 처리
  public async generateText(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now()

    try {
      // 사용자 토큰 잔액 확인
      const balance = await apiKeyManager.getUserTokenBalance(request.userId)
      if (balance <= 0) {
        return {
          success: false,
          error: '토큰 잔액이 부족합니다.',
          cost: 0,
          executionTime: Date.now() - startTime
        }
      }

      // API 키 조회
      const apiKey = await apiKeyManager.getActiveAPIKey(request.service)
      if (!apiKey) {
        return {
          success: false,
          error: `${request.service} API 키가 설정되지 않았습니다.`,
          cost: 0,
          executionTime: Date.now() - startTime
        }
      }

      // 서비스별 API 호출
      let response: AIResponse

      // [Option B] Real Execution Model Mapping
      // 사용자가 요청한 가상 모델명을 실제 작동하는 API 모델명으로 매핑합니다. (2026 스펙 기준)
      let realModel = request.model

      if (request.model === 'claude-opus-4.5') realModel = 'claude-opus-4-5-20251101'
      if (request.model === 'gpt-5.2-xhigh') realModel = 'gpt-5.2'
      if (request.model === 'gemini-nano-banana-pro') realModel = 'gemini-nano-banana-pro'

      // 요청 객체 업데이트
      const effectiveRequest = { ...request, model: realModel }

      try {
        // [Option B] 1차 시도: 매핑된 최신 모델 ID로 호출
        switch (request.service) {
          case 'claude':
            response = await this.callClaudeAPI(apiKey, effectiveRequest)
            break
          case 'openai':
            response = await this.callOpenAIAPI(apiKey, effectiveRequest)
            break
          case 'gemini':
            response = await this.callGeminiAPI(apiKey, effectiveRequest)
            break
          default:
            throw new Error(`Unsupported service: ${request.service}`)
        }
      } catch (error: any) {
        // [Fallback Strategy]
        // 1차 시도 실패 시 (404 Not Found, 400 Bad Request 등), 안정적인 레거시 모델로 재시도
        console.warn(`Primary model (${realModel}) failed. Attempting fallback... Error:`, error.message)

        let fallbackModel = ''
        // 모델명에 따른 적절한 대체 모델 선정
        if (request.service === 'claude') fallbackModel = 'claude-3-opus-20240229'
        if (request.service === 'openai') fallbackModel = 'gpt-4-turbo'
        if (request.service === 'gemini') fallbackModel = 'gemini-1.5-pro-latest'

        // 대체 모델이 존재하고, 원래 요청 모델과 다를 경우에만 재시도
        if (fallbackModel && fallbackModel !== realModel) {
          console.log(`Fallback to: ${fallbackModel}`)
          const fallbackRequest = { ...request, model: fallbackModel }

          switch (request.service) {
            case 'claude':
              response = await this.callClaudeAPI(apiKey, fallbackRequest)
              break
            case 'openai':
              response = await this.callOpenAIAPI(apiKey, fallbackRequest)
              break
            case 'gemini':
              response = await this.callGeminiAPI(apiKey, fallbackRequest)
              break
            default:
              throw error
          }
        } else {
          // 대체 불가능하면 에러 전파
          throw error
        }
      }

      // 사용량 기록
      if (response.success && response.data) {
        await this.recordUsage(request, response, 'text_generation')
      }

      response.executionTime = Date.now() - startTime
      return response

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        cost: 0,
        executionTime: Date.now() - startTime
      }
    }
  }

  // 이미지 생성 요청 처리
  public async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const startTime = Date.now()

    try {
      // 사용자 토큰 잔액 확인
      const balance = await apiKeyManager.getUserTokenBalance(request.userId)
      if (balance <= 0) {
        return {
          success: false,
          error: '토큰 잔액이 부족합니다.',
          cost: 0,
          executionTime: Date.now() - startTime
        }
      }

      // Gemini API 키 조회
      const apiKey = await apiKeyManager.getActiveAPIKey('gemini')
      if (!apiKey) {
        return {
          success: false,
          error: 'Gemini API 키가 설정되지 않았습니다.',
          cost: 0,
          executionTime: Date.now() - startTime
        }
      }

      // Gemini Nano Banana API 호출
      const response = await this.callGeminiImageAPI(apiKey, request)

      // 사용량 기록
      if (response.success) {
        await this.recordImageUsage(request, response)
      }

      response.executionTime = Date.now() - startTime
      return response

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        cost: 0,
        executionTime: Date.now() - startTime
      }
    }
  }

  // Claude API 호출
  private async callClaudeAPI(apiKey: string, request: AIRequest): Promise<AIResponse> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: request.model,
        max_tokens: request.maxTokens || 4000,
        temperature: request.temperature || 0.7,
        messages: [{
          role: 'user',
          content: request.prompt
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const pricing = await apiKeyManager.getTokenPrice('claude', request.model)

    const promptTokens = data.usage?.input_tokens || 0
    const completionTokens = data.usage?.output_tokens || 0
    const cost = (promptTokens * pricing.input) + (completionTokens * pricing.output)

    return {
      success: true,
      data: {
        text: data.content[0]?.text || '',
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens
      },
      cost,
      executionTime: 0
    }
  }

  // OpenAI API 호출
  private async callOpenAIAPI(apiKey: string, request: AIRequest): Promise<AIResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: request.model,
        messages: [{
          role: 'user',
          content: request.prompt
        }],
        max_tokens: request.maxTokens || 4000,
        temperature: request.temperature || 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const pricing = await apiKeyManager.getTokenPrice('openai', request.model)

    const promptTokens = data.usage?.prompt_tokens || 0
    const completionTokens = data.usage?.completion_tokens || 0
    const cost = (promptTokens * pricing.input) + (completionTokens * pricing.output)

    return {
      success: true,
      data: {
        text: data.choices[0]?.message?.content || '',
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens
      },
      cost,
      executionTime: 0
    }
  }

  // Gemini API 호출
  private async callGeminiAPI(apiKey: string, request: AIRequest): Promise<AIResponse> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${request.model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: request.prompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: request.maxTokens || 4000,
          temperature: request.temperature || 0.7
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const pricing = await apiKeyManager.getTokenPrice('gemini', request.model)

    // Gemini는 토큰 카운트를 직접 제공하지 않으므로 대략적으로 계산
    const text = data.candidates[0]?.content?.parts[0]?.text || ''
    const approximateTokens = Math.ceil(text.length / 4)
    const promptTokens = Math.ceil(request.prompt.length / 4)
    const cost = (promptTokens * pricing.input) + (approximateTokens * pricing.output)

    return {
      success: true,
      data: {
        text,
        promptTokens,
        completionTokens: approximateTokens,
        totalTokens: promptTokens + approximateTokens
      },
      cost,
      executionTime: 0
    }
  }

  // Gemini 이미지 생성 API 호출 (Nano Banana)
  private async callGeminiImageAPI(apiKey: string, request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    // 실제 Gemini Nano Banana API 엔드포인트로 교체 필요
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-nano-banana:generateImage?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: request.prompt,
        size: request.size || '1024x1024'
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini Image API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const pricing = await apiKeyManager.getTokenPrice('gemini', 'gemini-nano-banana')

    return {
      success: true,
      data: {
        imageUrl: data.imageUrl || '',
        imageBuffer: data.imageBuffer ? Buffer.from(data.imageBuffer, 'base64') : undefined
      },
      cost: pricing.image || 0.002,
      executionTime: 0
    }
  }

  // 사용량 기록
  private async recordUsage(request: AIRequest, response: AIResponse, requestType: string) {
    if (!response.data) return

    const usage = {
      user_id: request.userId,
      content_id: request.contentId,
      tokens_used: response.data.totalTokens,
      cost_usd: response.cost,
      request_type: requestType as any,
      model_name: request.model,
      prompt_tokens: response.data.promptTokens,
      completion_tokens: response.data.completionTokens,
      success: true,
      response_time_ms: response.executionTime
    }

    // API 키 ID는 실제로는 현재 사용된 키를 추적해야 함
    await apiKeyManager.recordTokenUsage('temp-key-id', usage)
  }

  // 이미지 생성 사용량 기록
  private async recordImageUsage(request: ImageGenerationRequest, response: ImageGenerationResponse) {
    const usage = {
      user_id: request.userId,
      content_id: request.contentId,
      tokens_used: 1, // 이미지 생성은 1개 단위
      cost_usd: response.cost,
      request_type: 'image_generation' as any,
      model_name: request.model,
      success: true,
      response_time_ms: response.executionTime
    }

    await apiKeyManager.recordTokenUsage('temp-key-id', usage)
  }
}

export const aiServiceRouter = AIServiceRouter.getInstance()