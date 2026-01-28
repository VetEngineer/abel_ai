// 콘텐츠 관련 타입 정의
export interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string
  seoTitle?: string
  metaDescription?: string
  keywords: string[]
  tags: string[]
  category: string
  status: ContentStatus
  platform: Platform[]
  createdAt: string
  updatedAt: string
  publishedAt?: string
  authorId: string
}

export enum ContentStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  READY_FOR_REVIEW = 'ready_for_review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum Platform {
  WORDPRESS = 'wordpress',
  NAVER_BLOG = 'naver_blog',
  TISTORY = 'tistory',
  BRUNCH = 'brunch'
}

// SEO 최적화 데이터
export interface SEOData {
  primaryKeyword: string
  secondaryKeywords: string[]
  title: string
  metaDescription: string
  headings: {
    h1: string
    h2: string[]
    h3: string[]
  }
  internalLinks: string[]
  externalLinks: string[]
  imageAlt: string[]
  readabilityScore: number
}

// 컨텐츠 기획 데이터
export interface ContentPlan {
  topic: string
  angle: string
  targetKeywords: string[]
  contentStructure: string[]
  estimatedWordCount: number
  targetAudience: string
  contentGoals: string[]
}

// 시각 요소
export interface VisualElement {
  type: 'image' | 'infographic' | 'chart' | 'diagram'
  description: string
  alt: string
  position: number
  generatedUrl?: string
}