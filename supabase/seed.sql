-- Seed data for development and testing

-- Insert sample user
INSERT INTO users (id, email, name, subscription_tier) VALUES
(
  '550e8400-e29b-41d4-a716-446655440000',
  'demo@example.com',
  'Demo User',
  'pro'
);

-- Insert sample project
INSERT INTO projects (id, user_id, name, description, brand_voice, target_audience, industry) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  '테크 블로그 프로젝트',
  'IT 기술 트렌드와 개발 가이드를 다루는 블로그',
  '친근하고 전문적인',
  '주니어-시니어 개발자',
  'IT/Technology'
);

-- Insert sample keywords
INSERT INTO keywords (project_id, keyword, search_volume, competition, trend, industry) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Next.js 가이드',
  1200,
  'medium',
  'rising',
  'IT'
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  'React 최적화',
  800,
  'high',
  'stable',
  'IT'
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  'TypeScript 튜토리얼',
  950,
  'low',
  'rising',
  'IT'
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Supabase 연동',
  600,
  'medium',
  'rising',
  'IT'
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  'AI 개발',
  1500,
  'high',
  'rising',
  'IT'
);

-- Insert sample content
INSERT INTO content (
  id,
  project_id,
  title,
  excerpt,
  keywords,
  tags,
  category,
  status
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440001',
  'Next.js 13 완벽 가이드: 최신 기능과 베스트 프랙티스',
  'Next.js 13의 새로운 기능들과 실제 프로덕션에서 활용할 수 있는 베스트 프랙티스를 상세하게 알아봅니다.',
  ARRAY['Next.js', 'React', 'TypeScript', 'SSR', 'App Router'],
  ARRAY['웹개발', 'JavaScript', 'React'],
  '개발 가이드',
  'draft'
);

-- Insert sample workflow
INSERT INTO workflows (
  content_id,
  project_id,
  status,
  current_step,
  shared_context
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440001',
  'pending',
  0,
  '{"keywords": ["Next.js", "React", "SSR"], "targetAudience": "개발자", "contentGoal": "교육", "brandTone": "친근하고 전문적인", "platform": "blog"}'::jsonb
);