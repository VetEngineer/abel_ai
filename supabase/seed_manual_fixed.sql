-- 1. 암호화 확장기능 (필수)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. 관리자 계정 삽입 (updated_at 컬럼 제외)
INSERT INTO public.admin_accounts (
  username,
  email,
  password_hash,
  role,
  is_active,
  created_at
) VALUES (
  'admin_abel',
  'admin@abel.ai',
  crypt('abel100x', gen_salt('bf', 12)),
  'super_admin',
  true,
  NOW()
) 
ON CONFLICT (username) 
DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  role = 'super_admin',
  is_active = true;

-- 3. 확인
SELECT id, username, role, is_active FROM public.admin_accounts WHERE username = 'admin_abel';
