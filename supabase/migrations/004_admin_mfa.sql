-- Admin MFA Support

-- Add MFA columns to admin_accounts
ALTER TABLE public.admin_accounts
ADD COLUMN IF NOT EXISTS totp_secret TEXT,
ADD COLUMN IF NOT EXISTS is_mfa_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS backup_codes JSONB,
ADD COLUMN IF NOT EXISTS recovery_email TEXT;

-- Add MFA tracking to sessions
ALTER TABLE public.admin_sessions
ADD COLUMN IF NOT EXISTS last_mfa_at TIMESTAMPTZ;

-- Add comments
COMMENT ON COLUMN public.admin_accounts.totp_secret IS 'Encrypted TOTP secret';
COMMENT ON COLUMN public.admin_accounts.is_mfa_enabled IS 'Whether MFA is enabled for this account';
