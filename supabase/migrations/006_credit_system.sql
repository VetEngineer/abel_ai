-- 1. 유저 테이블에 크레딧 컬럼 추가
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0;

-- 2. 크레딧 트랜잭션 테이블 생성
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- 변동량 (+ 또는 -)
  balance_after INTEGER NOT NULL, -- 변동 후 잔액
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('manual_adjustment', 'subscription_renewal', 'usage', 'purchase', 'refund', 'bonus')),
  description TEXT,
  created_by UUID, -- 수동 조정한 관리자 ID (시스템인 경우 null)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at);

-- 4. RLS 정책 (옵션: 실제 운영 시 필요)
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- 사용자는 본인의 트랜잭션만 조회 가능
CREATE POLICY "Users can view their own credit transactions" 
ON public.credit_transactions FOR SELECT 
USING (auth.uid() = user_id);

-- 관리자는 모든 트랜잭션 조회 가능 (service_role 키 사용 시 자동 우회되므로 생략 가능하나 명시적으로 추가 가능)
-- (Supabase 관리자/Service Role은 항상 모든 권한을 가짐)
