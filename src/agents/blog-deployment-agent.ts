import { BaseAgent } from '@/lib/agents/base-agent'
import { AgentType, AgentResult, SharedContext } from '@/types/agents'

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

  async execute(input: BlogDeploymentInput, context: SharedContext): Promise<AgentResult> {
    const startTime = Date.now()
    this.setStatus('processing' as any)

    try {
      const deploymentPlan = this.createDeploymentPlan(input)
      const platformOptimizations = this.optimizeForPlatforms(input)
      const crossPlatformSyndication = this.setupCrossPlatformSyndication(input)
      const analyticsAndTracking = this.setupAnalyticsAndTracking(input)
      const seoDeployment = this.prepareSEODeployment(input)
      const postDeploymentTasks = this.definePostDeploymentTasks(input)

      const output: BlogDeploymentOutput = {
        deploymentPlan,
        platformOptimizations,
        crossPlatformSyndication,
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

  private createDeploymentPlan(input: BlogDeploymentInput) {
    const { platforms, schedulingPreferences } = input
    const currentTime = new Date()

    // 플랫폼별 배포 계획 수립
    const platformPlans = platforms.map((platform, index) => {
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
        customizations: this.getPlatformCustomizations(platform, input)
      }
    })

    // 발행 순서 결정 (주 플랫폼 우선)
    const publishingOrder = this.determinePlatformOrder(platforms)

    // 완료 예상 시간
    const estimatedCompletionTime = this.calculateCompletionTime(platformPlans)

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

    // 사용자 선호 시간 적용
    if (preferences?.publishTime) {
      const [hours, minutes] = preferences.publishTime.split(':').map(Number)
      publishTime.setHours(hours, minutes, 0, 0)
    }

    // 플랫폼별 지연 시간 적용
    const platformDelay = this.getPlatformDelay(platform, index)
    publishTime.setMinutes(publishTime.getMinutes() + platformDelay)

    return publishTime
  }

  private getPlatformDelay(platform: string, index: number): number {
    const delays: Record<string, number> = {
      'wordpress': 0, // 메인 플랫폼
      'naver_blog': 5,
      'tistory': 10,
      'brunch': 15,
      'facebook': 20,
      'linkedin': 25,
      'twitter': 30
    }

    return delays[platform] || (index * 5)
  }

  private getPlatformCustomizations(platform: string, input: BlogDeploymentInput) {
    const customizations: Record<string, any> = {}

    switch (platform) {
      case 'wordpress':
        customizations.post_status = 'publish'
        customizations.comment_status = 'open'
        customizations.ping_status = 'open'
        customizations.featured_image = true
        break

      case 'naver_blog':
        customizations.open_yn = 'Y'
        customizations.comment_yn = 'Y'
        customizations.tag_yn = 'Y'
        customizations.category_no = this.getNaverCategory(input)
        break

      case 'tistory':
        customizations.visibility = '3' // 공개
        customizations.category = this.getTistoryCategory(input)
        customizations.tag = true
        break

      case 'brunch':
        customizations.publish_status = 'published'
        customizations.allow_comment = true
        customizations.series_id = null
        break

      case 'facebook':
        customizations.published = true
        customizations.scheduled_publish_time = null
        customizations.targeting = this.getFacebookTargeting(input)
        break

      case 'linkedin':
        customizations.visibility_code = 'anyone'
        customizations.comment_permissions = 'ALL'
        break

      default:
        customizations.status = 'published'
    }

    return customizations
  }

  private getNaverCategory(input: BlogDeploymentInput): string {
    // 네이버 블로그 카테고리 매핑
    const categoryMap: Record<string, string> = {
      'medical': '건강정보',
      'legal': '법률정보',
      'tax': '경제정보',
      'marketing': '비즈니스',
      'consulting': '비즈니스',
      'finance': '경제정보',
      'education': '교육정보',
      'other': '일반정보'
    }

    // 실제로는 사용자 설정이나 입력에서 가져와야 함
    return categoryMap['other'] || '일반정보'
  }

  private getTistoryCategory(input: BlogDeploymentInput): string {
    return '전문정보' // 기본 카테고리
  }

  private getFacebookTargeting(input: BlogDeploymentInput): Record<string, any> {
    return {
      age_min: 25,
      age_max: 65,
      locales: ['ko_KR'],
      interests: ['비즈니스', '전문서비스']
    }
  }

  private determinePlatformOrder(platforms: string[]): string[] {
    // 우선순위 기반 정렬
    const priority: Record<string, number> = {
      'wordpress': 1,
      'naver_blog': 2,
      'tistory': 3,
      'brunch': 4,
      'linkedin': 5,
      'facebook': 6,
      'twitter': 7
    }

    return platforms.sort((a, b) => (priority[a] || 999) - (priority[b] || 999))
  }

  private calculateCompletionTime(platformPlans: any[]): string {
    if (platformPlans.length === 0) return new Date().toISOString()

    const latestTime = platformPlans.reduce((latest, plan) => {
      const planTime = new Date(plan.publishTime)
      return planTime > latest ? planTime : latest
    }, new Date(platformPlans[0].publishTime))

    // 마지막 플랫폼 배포 후 5분 추가
    latestTime.setMinutes(latestTime.getMinutes() + 5)
    return latestTime.toISOString()
  }

  private optimizeForPlatforms(input: BlogDeploymentInput) {
    return input.platforms.map(platform => ({
      platform,
      optimizations: this.getPlatformOptimization(platform, input)
    }))
  }

  private getPlatformOptimization(platform: string, input: BlogDeploymentInput) {
    const baseTitle = input.approvedContent?.content?.title || input.seoData?.metaData?.title || '제목'
    const baseDescription = input.seoData?.metaData?.description || '설명'

    switch (platform) {
      case 'wordpress':
        return {
          titleOptimization: this.optimizeWordPressTitle(baseTitle),
          descriptionOptimization: this.optimizeWordPressDescription(baseDescription),
          imageOptimization: this.getWordPressImages(input),
          tagsAndCategories: this.getWordPressTags(input),
          platformSpecificFeatures: {
            featured_image: true,
            yoast_seo: true,
            custom_fields: true
          }
        }

      case 'naver_blog':
        return {
          titleOptimization: this.optimizeNaverTitle(baseTitle),
          descriptionOptimization: this.optimizeNaverDescription(baseDescription),
          imageOptimization: this.getNaverImages(input),
          tagsAndCategories: this.getNaverTags(input),
          platformSpecificFeatures: {
            smart_editor: true,
            mobile_optimization: true,
            naver_search_optimization: true
          }
        }

      case 'tistory':
        return {
          titleOptimization: this.optimizeTistoryTitle(baseTitle),
          descriptionOptimization: baseDescription,
          imageOptimization: this.getTistoryImages(input),
          tagsAndCategories: this.getTistoryTags(input),
          platformSpecificFeatures: {
            markdown_support: true,
            custom_css: true,
            google_analytics: true
          }
        }

      case 'brunch':
        return {
          titleOptimization: this.optimizeBrunchTitle(baseTitle),
          descriptionOptimization: this.optimizeBrunchDescription(baseDescription),
          imageOptimization: this.getBrunchImages(input),
          tagsAndCategories: this.getBrunchTags(input),
          platformSpecificFeatures: {
            series_support: true,
            high_quality_images: true,
            typography_focus: true
          }
        }

      case 'linkedin':
        return {
          titleOptimization: this.optimizeLinkedInTitle(baseTitle),
          descriptionOptimization: this.optimizeLinkedInDescription(baseDescription),
          imageOptimization: this.getLinkedInImages(input),
          tagsAndCategories: this.getLinkedInTags(input),
          platformSpecificFeatures: {
            professional_network: true,
            business_content: true,
            hashtag_optimization: true
          }
        }

      default:
        return {
          titleOptimization: baseTitle,
          descriptionOptimization: baseDescription,
          imageOptimization: [],
          tagsAndCategories: [],
          platformSpecificFeatures: {}
        }
    }
  }

  private optimizeWordPressTitle(title: string): string {
    return title.length > 60 ? title.slice(0, 57) + '...' : title
  }

  private optimizeWordPressDescription(description: string): string {
    return description.length > 160 ? description.slice(0, 157) + '...' : description
  }

  private optimizeNaverTitle(title: string): string {
    // 네이버 블로그 제목 최적화 (한글 기준 30자 내외)
    return title.length > 30 ? title.slice(0, 27) + '...' : title
  }

  private optimizeNaverDescription(description: string): string {
    // 네이버 블로그 설명 최적화
    return description.length > 100 ? description.slice(0, 97) + '...' : description
  }

  private optimizeTistoryTitle(title: string): string {
    return title.length > 50 ? title.slice(0, 47) + '...' : title
  }

  private optimizeBrunchTitle(title: string): string {
    // 브런치는 감성적이고 임팩트 있는 제목 선호
    return `${title} | 전문가 가이드`
  }

  private optimizeBrunchDescription(description: string): string {
    return `${description.slice(0, 80)}... 자세한 내용은 본문에서 확인하세요.`
  }

  private optimizeLinkedInTitle(title: string): string {
    // 링크드인 비즈니스 톤으로 최적화
    return `Professional Insight: ${title}`
  }

  private optimizeLinkedInDescription(description: string): string {
    return `${description} #ProfessionalAdvice #BusinessGrowth`
  }

  private getWordPressImages(input: BlogDeploymentInput): string[] {
    return [
      'featured-image-optimized.jpg',
      'content-image-1.jpg',
      'content-image-2.jpg'
    ]
  }

  private getNaverImages(input: BlogDeploymentInput): string[] {
    return [
      'naver-thumbnail.jpg',
      'naver-content-1.jpg',
      'naver-content-2.jpg'
    ]
  }

  private getTistoryImages(input: BlogDeploymentInput): string[] {
    return [
      'tistory-header.jpg',
      'tistory-content.jpg'
    ]
  }

  private getBrunchImages(input: BlogDeploymentInput): string[] {
    return [
      'brunch-cover-high-res.jpg',
      'brunch-content-artistic.jpg'
    ]
  }

  private getLinkedInImages(input: BlogDeploymentInput): string[] {
    return [
      'linkedin-professional.jpg',
      'linkedin-infographic.jpg'
    ]
  }

  private getWordPressTags(input: BlogDeploymentInput): string[] {
    return ['전문가', '가이드', '실무', '컨설팅']
  }

  private getNaverTags(input: BlogDeploymentInput): string[] {
    return ['전문정보', '실무팁', '가이드', '상담']
  }

  private getTistoryTags(input: BlogDeploymentInput): string[] {
    return ['전문가', '실무', '가이드']
  }

  private getBrunchTags(input: BlogDeploymentInput): string[] {
    return ['전문가인사이트', '실무가이드', '전문지식']
  }

  private getLinkedInTags(input: BlogDeploymentInput): string[] {
    return ['ProfessionalAdvice', 'BusinessGrowth', 'Industry', 'Consulting']
  }

  private setupCrossPlatformSyndication(input: BlogDeploymentInput) {
    const canonicalUrl = this.generateCanonicalUrl(input)
    const socialMediaPosts = this.generateSocialMediaPosts(input)
    const newsletterContent = this.generateNewsletterContent(input)

    return {
      canonicalUrl,
      socialMediaPosts,
      newsletterContent
    }
  }

  private generateCanonicalUrl(input: BlogDeploymentInput): string {
    // 주 플랫폼을 canonical URL로 설정
    const mainPlatform = input.platforms[0] || 'wordpress'
    const slug = this.generateSlug(input.approvedContent?.content?.title || 'article')
    return `https://your-domain.com/${slug}`
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w가-힣 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50)
  }

  private generateSocialMediaPosts(input: BlogDeploymentInput) {
    const title = input.approvedContent?.content?.title || '새 글'
    const description = input.seoData?.metaData?.description || ''

    return [
      {
        platform: 'facebook',
        postContent: `${title}\n\n${description.slice(0, 100)}...\n\n자세한 내용은 링크에서 확인하세요!`,
        hashtags: ['전문가', '가이드', '실무팁'],
        mentionTargets: []
      },
      {
        platform: 'twitter',
        postContent: `${title}\n\n${description.slice(0, 80)}...\n\n#전문가가이드 #실무팁`,
        hashtags: ['전문가가이드', '실무팁', '비즈니스'],
        mentionTargets: []
      },
      {
        platform: 'linkedin',
        postContent: `New professional insight: ${title}\n\n${description}\n\n#ProfessionalAdvice #BusinessGrowth`,
        hashtags: ['ProfessionalAdvice', 'BusinessGrowth', 'Industry'],
        mentionTargets: []
      }
    ]
  }

  private generateNewsletterContent(input: BlogDeploymentInput) {
    const title = input.approvedContent?.content?.title || '새로운 전문가 가이드'
    const description = input.seoData?.metaData?.description || ''

    return {
      subject: `[전문가 가이드] ${title}`,
      preview: description.slice(0, 50) + '...',
      content: `
안녕하세요!

새로운 전문가 가이드가 준비되었습니다.

📌 ${title}

${description}

자세한 내용은 아래 링크에서 확인하실 수 있습니다.

[전체 내용 보기 →]

감사합니다.
      `.trim()
    }
  }

  private setupAnalyticsAndTracking(input: BlogDeploymentInput) {
    const trackingCodes = this.generateTrackingCodes(input.platforms)
    const analyticsEvents = this.defineAnalyticsEvents()
    const performanceMetrics = this.definePerformanceMetrics()
    const reportingSchedule = 'weekly'

    return {
      trackingCodes,
      analyticsEvents,
      performanceMetrics,
      reportingSchedule
    }
  }

  private generateTrackingCodes(platforms: string[]): Record<string, string> {
    const codes: Record<string, string> = {}

    platforms.forEach(platform => {
      switch (platform) {
        case 'wordpress':
          codes.google_analytics = 'GA4-XXXXXXXXX'
          codes.google_tag_manager = 'GTM-XXXXXXX'
          break
        case 'naver_blog':
          codes.naver_analytics = 'NA-XXXXXXX'
          break
        case 'facebook':
          codes.facebook_pixel = 'XXXXXXXXX'
          break
        default:
          codes[`${platform}_tracking`] = 'XXXXXXX'
      }
    })

    return codes
  }

  private defineAnalyticsEvents(): string[] {
    return [
      'page_view',
      'content_engagement',
      'scroll_depth',
      'time_on_page',
      'social_share',
      'contact_form_view',
      'contact_form_submit',
      'newsletter_signup',
      'download_guide',
      'external_link_click'
    ]
  }

  private definePerformanceMetrics(): string[] {
    return [
      'page_views',
      'unique_visitors',
      'bounce_rate',
      'average_session_duration',
      'social_media_engagement',
      'lead_generation',
      'conversion_rate',
      'search_engine_ranking',
      'organic_traffic_growth',
      'referral_traffic'
    ]
  }

  private prepareSEODeployment(input: BlogDeploymentInput) {
    const metaTags = this.generateMetaTags(input)
    const structuredData = input.seoData?.structuredData || {}
    const robotsTxt = this.generateRobotsTxt()
    const sitemapUpdate = true

    return {
      metaTags,
      structuredData,
      robotsTxt,
      sitemapUpdate
    }
  }

  private generateMetaTags(input: BlogDeploymentInput): Record<string, string> {
    const seoData = input.seoData?.metaData || {}

    return {
      'title': seoData.title || '제목',
      'description': seoData.description || '설명',
      'keywords': seoData.keywords?.join(', ') || '',
      'og:title': seoData.ogTitle || seoData.title || '제목',
      'og:description': seoData.ogDescription || seoData.description || '설명',
      'og:type': 'article',
      'og:image': '/images/og-image.jpg',
      'twitter:card': 'summary_large_image',
      'twitter:title': seoData.title || '제목',
      'twitter:description': seoData.description || '설명',
      'robots': 'index, follow',
      'canonical': this.generateCanonicalUrl(input)
    }
  }

  private generateRobotsTxt(): string[] {
    return [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin/',
      'Disallow: /private/',
      'Sitemap: https://your-domain.com/sitemap.xml'
    ]
  }

  private definePostDeploymentTasks(input: BlogDeploymentInput) {
    const socialMediaPromotion = this.defineSocialMediaPromotion(input)
    const emailNotifications = this.defineEmailNotifications()
    const monitoringTasks = this.defineMonitoringTasks()
    const followUpActions = this.defineFollowUpActions()

    return {
      socialMediaPromotion,
      emailNotifications,
      monitoringTasks,
      followUpActions
    }
  }

  private defineSocialMediaPromotion(input: BlogDeploymentInput): string[] {
    return [
      '페이스북 페이지에 게시물 발행',
      '링크드인 프로필에 전문가 콘텐츠로 공유',
      '트위터에 핵심 포인트와 함께 링크 공유',
      '인스타그램 스토리에 비주얼과 함께 홍보',
      '관련 온라인 커뮤니티에 유용한 정보로 공유',
      '이메일 뉴스레터를 통한 구독자 알림'
    ]
  }

  private defineEmailNotifications(): string[] {
    return [
      '관리자에게 배포 완료 알림',
      '작성자에게 발행 완료 통지',
      'SEO 팀에 색인 요청 알림',
      '마케팅 팀에 홍보 준비 완료 통지',
      '구독자에게 새 글 알림 발송'
    ]
  }

  private defineMonitoringTasks(): string[] {
    return [
      '검색엔진 색인 상태 확인',
      '소셜미디어 반응 모니터링',
      '댓글 및 피드백 확인',
      '트래픽 유입량 추적',
      'SEO 순위 변동 모니터링',
      '기술적 오류 발생 여부 확인',
      '로딩 속도 및 성능 체크'
    ]
  }

  private defineFollowUpActions(): string[] {
    return [
      '첫 24시간 성과 리포트 작성',
      '독자 피드백 수집 및 분석',
      '검색 랭킹 변화 분석',
      '소셜미디어 참여도 분석',
      '리드 생성 효과 측정',
      '다음 콘텐츠 주제 아이디어 수집',
      '성과 기반 개선사항 도출'
    ]
  }
}