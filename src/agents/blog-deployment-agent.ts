import { BaseAgent } from '@/lib/agents/base-agent'
import { AgentType, AgentResult, SharedContext } from '@/types/agents'
import { aiServiceRouter } from '@/lib/services/ai-service-router'

export interface BlogDeploymentInput {
  approvedContent: any
  seoData: any
  visualData: any
  platforms: string[]
  schedulingPreferences?: {
    publishTime?: string
    timezone?: string
    socialMediaDelay?: number
  }
  userId?: string
}

export interface BlogDeploymentOutput {
  deploymentPlan: {
    platforms: Array<{
      platform: string
      status: 'ready' | 'scheduled' | 'published' | 'failed'
      publishTime: string
      customizations: Record<string, any>
    }>
    publishingOrder: string[]
    estimatedCompletionTime: string
  }
  platformOptimizations: Array<{
    platform: string
    optimizations: {
      titleOptimization: string
      descriptionOptimization: string
      imageOptimization: string[]
      tagsAndCategories: string[]
      platformSpecificFeatures: Record<string, any>
    }
  }>
  crossPlatformSyndication: {
    canonicalUrl: string
    socialMediaPosts: Array<{
      platform: string
      postContent: string
      hashtags: string[]
      mentionTargets: string[]
    }>
    newsletterContent: {
      subject: string
      preview: string
      content: string
    }
  }
  analyticsAndTracking: {
    trackingCodes: Record<string, string>
    analyticsEvents: string[]
    performanceMetrics: string[]
    reportingSchedule: string
  }
  seoDeployment: {
    metaTags: Record<string, string>
    structuredData: any
    robotsTxt: string[]
    sitemapUpdate: boolean
  }
  postDeploymentTasks: {
    socialMediaPromotion: string[]
    emailNotifications: string[]
    monitoringTasks: string[]
    followUpActions: string[]
  }
}

export class BlogDeploymentAgent extends BaseAgent {
  constructor() {
    super(
      AgentType.BLOG_DEPLOYMENT,
      '블로그 배포 에이전트',
      '멀티 플랫폼 블로그 배포, SEO 최적화, 소셜미디어 연동을 관리하는 최종 배포 전문 에이전트',
      ['멀티 플랫폼 배포', 'SEO 배포', '소셜미디어 연동', '스케줄링', '성과 추적']
    )
  }

  async execute(input: any, context: SharedContext): Promise<AgentResult> {
    const startTime = Date.now()
    this.setStatus('processing' as any)

    try {
      // 입력 데이터 정규화 처리
      const normalizedInput = {
        approvedContent: input?.qualityAssessment ? input : input?.approvedContent || {},
        seoData: input?.metaData ? input : input?.seoData || {},
        visualData: input?.colorScheme ? input : input?.visualData || {},
        platforms: input?.platforms || ['wordpress', 'naver_blog'],
        schedulingPreferences: input?.schedulingPreferences || {},
        userId: context.userId || 'anonymous'
      }

      // AI를 활용하여 플랫폼별 최적화 및 소셜 미디어 포스트 생성
      const optimizationResult = await this.optimizeWithAI(normalizedInput)

      const deploymentPlan = this.createDeploymentPlan(normalizedInput)
      const analyticsAndTracking = this.setupAnalyticsAndTracking(normalizedInput)
      const seoDeployment = this.prepareSEODeployment(normalizedInput)
      const postDeploymentTasks = this.definePostDeploymentTasks(normalizedInput)

      const output: BlogDeploymentOutput = {
        deploymentPlan,
        platformOptimizations: optimizationResult.platformOptimizations,
        crossPlatformSyndication: {
          canonicalUrl: this.generateCanonicalUrl(normalizedInput),
          ...optimizationResult.syndication
        },
        analyticsAndTracking,
        seoDeployment,
        postDeploymentTasks
      }

      const executionTime = Date.now() - startTime
      const tokensUsed = this.calculateTokens(JSON.stringify(output))

      return this.createSuccessResult(output, executionTime, tokensUsed)
    } catch (error) {
      const executionTime = Date.now() - startTime
      return this.handleError(error as Error, executionTime)
    }
  }

  private async optimizeWithAI(input: any): Promise<{ platformOptimizations: any[], syndication: any }> {
    const { platforms, userId, approvedContent, seoData } = input
    const title = approvedContent?.content?.title || seoData?.metaData?.title || '제목 없음'
    const description = seoData?.metaData?.description || '설명 없음'

    const prompt = `당신은 멀티 플랫폼 콘텐츠 배포 전문가입니다. 
다음 콘텐츠를 각 플랫폼의 특성(사용자 층, 노출 알고리즘, 포맷 제한)에 맞춰 최적화해주세요.

콘텐츠 정보:
- 제목: ${title}
- 설명: ${description}
- 배포 플랫폼 목록: ${platforms.join(', ')}

다음 JSON 형식으로 응답해주세요:

{
  "platformOptimizations": [
    {
      "platform": "플랫폼명 (목록에 있는 것만)",
      "optimizations": {
        "titleOptimization": "플랫폼 맞춤 최적화 제목",
        "descriptionOptimization": "플랫폼 맞춤 설명",
        "imageOptimization": ["이미지 가이드 1"],
        "tagsAndCategories": ["태그1", "태그2"],
        "platformSpecificFeatures": { "feature": "value" }
      }
    }
  ],
  "syndication": {
    "socialMediaPosts": [
      {
        "platform": "SNS 플랫폼 (Twitter, Facebook, LinkedIn)",
        "postContent": "SNS 포스팅 문구",
        "hashtags": ["#해시태그"],
        "mentionTargets": ["@계정"]
      }
    ],
    "newsletterContent": {
      "subject": "뉴스레터 제목",
      "preview": "미리보기 텍스트",
      "content": "뉴스레터 인사말 및 도입부"
    }
  }
}

응답은 오직 유효한 JSON 포맷이어야 합니다.`

    try {
      const response = await aiServiceRouter.generateText({
        service: 'claude',
        model: 'claude-3-haiku-20240307',
        prompt: prompt,
        userId: userId,
        maxTokens: 3000,
        temperature: 0.7
      })

      if (!response.success || !response.data) {
        throw new Error(response.error || 'AI 응답 실패')
      }

      const content = response.data.text
      const jsonMatch = content.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        throw new Error('AI 응답에서 JSON을 찾을 수 없습니다')
      }

      return JSON.parse(jsonMatch[0])

    } catch (error) {
      console.error('Blog Deployment Agent AI Error:', error)
      return this.getFallbackOptimization(input)
    }
  }

  private getFallbackOptimization(input: any): { platformOptimizations: any[], syndication: any } {
    return {
      platformOptimizations: input.platforms.map((p: string) => ({
        platform: p,
        optimizations: {
          titleOptimization: input.approvedContent?.content?.title || '제목',
          descriptionOptimization: input.seoData?.metaData?.description || '설명',
          imageOptimization: [],
          tagsAndCategories: [],
          platformSpecificFeatures: {}
        }
      })),
      syndication: {
        socialMediaPosts: [],
        newsletterContent: { subject: '', preview: '', content: '' }
      }
    }
  }

  private createDeploymentPlan(input: any) {
    const { platforms, schedulingPreferences } = input
    const currentTime = new Date()

    // 플랫폼별 배포 계획 수립
    const platformPlans = platforms.map((platform: any, index: number) => {
      const publishTime = this.calculatePublishTime(
        currentTime,
        schedulingPreferences,
        platform,
        index
      )

      return {
        platform,
        status: 'ready' as const,
        publishTime: publishTime.toISOString(),
        customizations: {} // AI 최적화에서 처리됨
      }
    })

    // 발행 순서 결정 (주 플랫폼 우선)
    const publishingOrder = platforms

    // 완료 예상 시간
    const estimatedCompletionTime = new Date(Date.now() + 3600000).toISOString() // 1시간 후

    return {
      platforms: platformPlans,
      publishingOrder,
      estimatedCompletionTime
    }
  }

  private calculatePublishTime(
    baseTime: Date,
    preferences: any,
    platform: string,
    index: number
  ): Date {
    let publishTime = new Date(baseTime)
    // 5분 간격으로 시차 두기
    publishTime.setMinutes(publishTime.getMinutes() + (index * 5))
    return publishTime
  }

  private setupAnalyticsAndTracking(input: any) {
    return {
      trackingCodes: { "google_analytics": "GA-DEMO" },
      analyticsEvents: ["page_view", "click"],
      performanceMetrics: ["views", "visitors"],
      reportingSchedule: 'weekly'
    }
  }

  private prepareSEODeployment(input: any) {
    return {
      metaTags: { "robots": "index, follow" },
      structuredData: {},
      robotsTxt: ["User-agent: *", "Allow: /"],
      sitemapUpdate: true
    }
  }

  private definePostDeploymentTasks(input: any) {
    return {
      socialMediaPromotion: ["SNS 공유"],
      emailNotifications: ["발행 알림"],
      monitoringTasks: ["인덱싱 확인"],
      followUpActions: ["댓글 모니터링"]
    }
  }

  private generateCanonicalUrl(input: any): string {
    const title = input.approvedContent?.content?.title || 'article'
    const slug = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
    return `https://example.com/${slug}`
  }
}