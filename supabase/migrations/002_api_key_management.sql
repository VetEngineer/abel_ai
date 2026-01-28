-- 관리자 API 키 관리 시스템

-- 관리자 API 키 테이블
CREATE TABLE admin_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name TEXT NOT NULL CHECK (service_name IN ('claude', 'openai', 'gemini', 'stripe')),
  api_key TEXT NOT NULL, -- 암호화된 키
  api_key_name TEXT, -- 키 식별용 이름
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  rate_limit_per_minute INTEGER DEFAULT 60,
  monthly_budget_usd DECIMAL(10,2),
  current_month_cost DECIMAL(10,2) DEFAULT 0
);

-- API 키 사용 로그
CREATE TABLE api_key_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_key_id UUID REFERENCES admin_api_keys(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content_id UUID REFERENCES content(id),
  tokens_used INTEGER,
  cost_usd DECIMAL(10,4),
  request_type TEXT, -- 'text_generation', 'image_generation', 'embedding'
  model_name TEXT, -- 'claude-3-sonnet', 'gpt-4', 'gemini-pro'
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 토큰 가격 설정 테이블
CREATE TABLE token_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name TEXT NOT NULL,
  model_name TEXT NOT NULL,
  input_token_cost DECIMAL(10,8), -- USD per token
  output_token_cost DECIMAL(10,8), -- USD per token
  image_generation_cost DECIMAL(10,4), -- USD per image
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_name, model_name)
);

-- 사용자 토큰 계정 확장
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_balance INTEGER DEFAULT 10000;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'pro', 'enterprise'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_tokens_used INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_cost_usd DECIMAL(10,2) DEFAULT 0;

-- 구독 플랜 정의
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  tokens_included INTEGER NOT NULL,
  price_usd DECIMAL(10,2) NOT NULL,
  features JSONB DEFAULT '[]',
  max_projects INTEGER DEFAULT 1,
  max_platforms INTEGER DEFAULT 1,
  priority_support BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 토큰 구매 내역
CREATE TABLE token_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tokens_purchased INTEGER NOT NULL,
  amount_paid_usd DECIMAL(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'stripe',
  payment_id TEXT, -- Stripe payment intent ID
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_admin_api_keys_service_active ON admin_api_keys(service_name, is_active);
CREATE INDEX idx_api_key_usage_logs_user_date ON api_key_usage_logs(user_id, created_at);
CREATE INDEX idx_api_key_usage_logs_api_key ON api_key_usage_logs(api_key_id);
CREATE INDEX idx_token_pricing_active ON token_pricing(service_name, model_name, is_active);
CREATE INDEX idx_users_subscription ON users(subscription_plan, subscription_expires_at);

-- 기본 토큰 가격 설정 삽입
INSERT INTO token_pricing (service_name, model_name, input_token_cost, output_token_cost, image_generation_cost) VALUES
('claude', 'claude-3-haiku', 0.00000025, 0.00000125, NULL),
('claude', 'claude-3-sonnet', 0.000003, 0.000015, NULL),
('claude', 'claude-3-opus', 0.000015, 0.000075, NULL),
('openai', 'gpt-3.5-turbo', 0.000001, 0.000002, NULL),
('openai', 'gpt-4', 0.00003, 0.00006, NULL),
('openai', 'gpt-4-turbo', 0.00001, 0.00003, NULL),
('gemini', 'gemini-pro', 0.0000005, 0.0000015, NULL),
('gemini', 'gemini-nano-banana', NULL, NULL, 0.002);

-- 기본 구독 플랜 설정
INSERT INTO subscription_plans (plan_name, display_name, tokens_included, price_usd, features, max_projects, max_platforms) VALUES
('free', 'Free', 10000, 0, '["Basic AI Models", "1 Platform Connection"]', 1, 1),
('basic', 'Basic', 100000, 29, '["All AI Models", "3 Platform Connections", "Word Export"]', 3, 3),
('pro', 'Pro', 500000, 99, '["Priority Support", "Analytics Dashboard", "API Access"]', 10, 5),
('enterprise', 'Enterprise', 2000000, 299, '["Custom Branding", "Team Collaboration", "Dedicated Support"]', 99, 10);

-- 트리거: API 키 사용시 업데이트
CREATE OR REPLACE FUNCTION update_api_key_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE admin_api_keys
  SET
    last_used = NEW.created_at,
    usage_count = usage_count + 1,
    current_month_cost = COALESCE(current_month_cost, 0) + COALESCE(NEW.cost_usd, 0)
  WHERE id = NEW.api_key_id;

  -- 사용자 토큰 차감
  UPDATE users
  SET
    token_balance = GREATEST(0, token_balance - COALESCE(NEW.tokens_used, 0)),
    total_tokens_used = total_tokens_used + COALESCE(NEW.tokens_used, 0),
    total_cost_usd = total_cost_usd + COALESCE(NEW.cost_usd, 0)
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_api_key_usage
  AFTER INSERT ON api_key_usage_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_api_key_usage();

-- 월별 비용 초기화 함수 (매월 1일 실행용)
CREATE OR REPLACE FUNCTION reset_monthly_costs()
RETURNS void AS $$
BEGIN
  UPDATE admin_api_keys SET current_month_cost = 0;
END;
$$ LANGUAGE plpgsql;