-- 직접 Supabase SQL Editor에서 실행하여 관리자 계정을 생성하세요.
-- 비밀번호 'abel100x'는 bcrypt 해시로 변환되어 저장됩니다.

-- 1. 암호화 확장기능 활성화 (필수)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. 관리자 계정 삽입
INSERT INTO public.admin_accounts (
  username,
  email,
  password_hash, -- bcrypt 해시 (rounds=12)
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  'admin_abel',                  -- 사용자명
  'admin@abel.ai',               -- 이메일 (임의)
  crypt('abel100x', gen_salt('bf', 12)), -- 비밀번호: abel100x
  'super_admin',                 -- 역할
  true,                          -- 활성 상태
  NOW(),
  NOW()
) 
ON CONFLICT (username) 
DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  role = 'super_admin',
  is_active = true;

-- 3. 확인
SELECT id, username, role, is_active FROM public.admin_accounts WHERE username = 'admin_abel';
