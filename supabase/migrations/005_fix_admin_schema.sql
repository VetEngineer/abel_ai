-- Enable pgcrypto for password hashing if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create admin_accounts table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.admin_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  created_by UUID, -- optional reference
  
  -- MFA Columns (Included in creation)
  totp_secret TEXT,
  is_mfa_enabled BOOLEAN DEFAULT FALSE,
  backup_codes JSONB,
  recovery_email TEXT
);

-- 2. Create admin_sessions table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES public.admin_accounts(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_mfa_at TIMESTAMPTZ
);

-- 3. Create Indexes
CREATE INDEX IF NOT EXISTS idx_admin_accounts_username ON public.admin_accounts(username);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON public.admin_sessions(admin_id);

-- 4. Initial Admin User (Optional: Creates 'admin' / 'password123' if table is empty)
-- Hash for 'password123' is $2a$12$mqL.... (but we use pgcrypto for generation if needed)
-- Instead of hardcoding, we rely on the verification script to create a user, 
-- or you can uncomment below to create a default admin.

-- INSERT INTO public.admin_accounts (username, password_hash, role)
-- VALUES ('admin', crypt('password123', gen_salt('bf', 10)), 'super_admin')
-- ON CONFLICT (username) DO NOTHING;
