-- Supabase 데이터베이스 스키마 설정 스크립트
-- 이 스크립트를 Supabase 대시보드의 SQL 편집기에서 실행하세요.

-- 1. admin_role 열거형 생성
CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'moderator');

-- 2. 관리자 계정 테이블 생성
CREATE TABLE admin_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255),
    password_hash TEXT NOT NULL,
    role admin_role DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES admin_accounts(id)
);

-- 3. 관리자 세션 테이블 생성
CREATE TABLE admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES admin_accounts(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. 인덱스 생성
CREATE INDEX idx_admin_accounts_username ON admin_accounts(username);
CREATE INDEX idx_admin_accounts_email ON admin_accounts(email);
CREATE INDEX idx_admin_accounts_active ON admin_accounts(is_active);
CREATE INDEX idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_expires ON admin_sessions(expires_at);

-- 5. 트리거 함수: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. 트리거 적용
CREATE TRIGGER update_admin_accounts_updated_at
    BEFORE UPDATE ON admin_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. RLS (Row Level Security) 활성화
ALTER TABLE admin_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- 8. RLS 정책 생성 (기본적으로 모든 작업을 허용 - 서버측에서 제어)
CREATE POLICY "관리자 계정 전체 액세스" ON admin_accounts
    FOR ALL USING (true);

CREATE POLICY "관리자 세션 전체 액세스" ON admin_sessions
    FOR ALL USING (true);

-- 9. 초기 슈퍼 관리자 계정 생성 (비밀번호는 bcrypt로 해시됨)
-- 기본 사용자명: admin_abel
-- 기본 비밀번호: abel100x
-- 실제 운영에서는 이 계정을 삭제하고 새로 생성하세요!
INSERT INTO admin_accounts (
    username,
    email,
    password_hash,
    role,
    is_active
) VALUES (
    'admin_abel',
    'admin@example.com',
    '$2a$12$LQhZZK.x4Wj.A8QpTzjFOeR5K6p7vQ8p7a9/ZfH4xJvGsZf8Ld9yO', -- abel100x 해시값 (실제로는 서버에서 생성)
    'super_admin',
    true
) ON CONFLICT (username) DO NOTHING;

-- 10. 만료된 세션 자동 정리 함수
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM admin_sessions WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- 11. 정기적 세션 정리를 위한 cron job (pg_cron 확장이 필요)
-- Supabase에서는 Edge Functions나 웹훅을 사용하여 구현
-- SELECT cron.schedule('cleanup-sessions', '0 */6 * * *', 'SELECT cleanup_expired_sessions();');

COMMENT ON TABLE admin_accounts IS '시스템 관리자 계정 테이블';
COMMENT ON TABLE admin_sessions IS '관리자 로그인 세션 테이블';
COMMENT ON COLUMN admin_accounts.password_hash IS 'bcrypt로 해시된 비밀번호';
COMMENT ON COLUMN admin_sessions.session_token IS 'JWT 토큰 또는 세션 식별자';