-- User Management System Migration
-- 사용자 관리 시스템을 위한 테이블 생성

-- 관리자 사용자 테이블
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 일반 사용자 프로필 테이블 (Supabase Auth와 연동)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  avatar_url TEXT,
  industry VARCHAR(50), -- medical, legal, tax, marketing, etc.
  business_size VARCHAR(20), -- individual, small, medium, large
  phone VARCHAR(20),
  company_name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 사용자별 콘텐츠 생성 할당량 테이블
CREATE TABLE user_quotas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  quota_type VARCHAR(20) DEFAULT 'monthly', -- daily, weekly, monthly, yearly
  content_generation_limit INTEGER DEFAULT 5,
  ai_tokens_limit INTEGER DEFAULT 100000,
  current_usage INTEGER DEFAULT 0,
  current_tokens_used INTEGER DEFAULT 0,
  reset_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 month'),
  is_unlimited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, quota_type)
);

-- 콘텐츠 생성 사용 내역 테이블
CREATE TABLE content_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  workflow_id VARCHAR(100),
  content_title VARCHAR(255),
  content_type VARCHAR(50) DEFAULT 'blog_post',
  specialization VARCHAR(50),
  target_audience VARCHAR(100),
  tokens_used INTEGER DEFAULT 0,
  generation_time_ms INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 사용자 활동 로그 테이블
CREATE TABLE user_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- login, content_generation, quota_update, etc.
  activity_details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 관리자 초기 계정 생성 (admin_abel/abel100x)
INSERT INTO admin_users (username, password_hash, email, full_name, role)
VALUES (
  'admin_abel',
  crypt('abel100x', gen_salt('bf')), -- bcrypt 해시 생성
  'admin@abel.ai',
  'Abel Administrator',
  'super_admin'
);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 프로필만 조회/수정 가능
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 사용자는 자신의 할당량 정보만 조회 가능
CREATE POLICY "Users can view their own quota" ON user_quotas
  FOR SELECT USING (user_id = auth.uid());

-- 사용자는 자신의 사용 내역만 조회 가능
CREATE POLICY "Users can view their own usage" ON content_usage
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own usage" ON content_usage
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 사용자는 자신의 활동 로그만 조회 가능
CREATE POLICY "Users can view their own activity logs" ON user_activity_logs
  FOR SELECT USING (user_id = auth.uid());

-- 관리자 전용 정책 (서비스 역할로 모든 데이터 접근 가능)
-- 관리자 패널에서는 service role을 사용하여 모든 데이터에 접근

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_industry ON user_profiles(industry);
CREATE INDEX idx_user_quotas_user_id ON user_quotas(user_id);
CREATE INDEX idx_user_quotas_reset_date ON user_quotas(reset_date);
CREATE INDEX idx_content_usage_user_id ON content_usage(user_id);
CREATE INDEX idx_content_usage_created_at ON content_usage(created_at);
CREATE INDEX idx_content_usage_status ON content_usage(status);
CREATE INDEX idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_activity_type ON user_activity_logs(activity_type);
CREATE INDEX idx_user_activity_logs_created_at ON user_activity_logs(created_at);

-- 트리거 함수 생성 (자동 타임스탬프 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 업데이트 트리거 적용
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_quotas_updated_at BEFORE UPDATE ON user_quotas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 새 사용자 등록시 기본 할당량 자동 생성 함수
CREATE OR REPLACE FUNCTION create_default_user_quota()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_quotas (user_id, quota_type, content_generation_limit, ai_tokens_limit)
  VALUES (NEW.id, 'monthly', 5, 100000); -- 월 5회 무료 생성, 10만 토큰

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 사용자 프로필 생성시 기본 할당량 자동 생성 트리거
CREATE TRIGGER create_user_quota_trigger
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_quota();

-- 할당량 초기화 함수 (스케줄러에서 사용)
CREATE OR REPLACE FUNCTION reset_monthly_quotas()
RETURNS void AS $$
BEGIN
  UPDATE user_quotas
  SET
    current_usage = 0,
    current_tokens_used = 0,
    reset_date = reset_date + INTERVAL '1 month'
  WHERE
    quota_type = 'monthly'
    AND reset_date <= NOW()
    AND is_unlimited = false;
END;
$$ LANGUAGE plpgsql;

-- 사용량 업데이트 함수
CREATE OR REPLACE FUNCTION update_user_usage(
  p_user_id UUID,
  p_tokens_used INTEGER,
  p_content_count INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  quota_record RECORD;
BEGIN
  -- 현재 할당량 조회
  SELECT * INTO quota_record
  FROM user_quotas
  WHERE user_id = p_user_id AND quota_type = 'monthly';

  -- 할당량 체크
  IF quota_record.is_unlimited = false THEN
    IF (quota_record.current_usage + p_content_count) > quota_record.content_generation_limit THEN
      RETURN false; -- 할당량 초과
    END IF;

    IF (quota_record.current_tokens_used + p_tokens_used) > quota_record.ai_tokens_limit THEN
      RETURN false; -- 토큰 한도 초과
    END IF;
  END IF;

  -- 사용량 업데이트
  UPDATE user_quotas
  SET
    current_usage = current_usage + p_content_count,
    current_tokens_used = current_tokens_used + p_tokens_used,
    updated_at = NOW()
  WHERE user_id = p_user_id AND quota_type = 'monthly';

  RETURN true;
END;
$$ LANGUAGE plpgsql;