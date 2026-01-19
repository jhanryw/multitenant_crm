-- Location: supabase/migrations/20260119183053_admin_panel_support.sql
-- Schema Analysis: Existing schema has companies, subscriptions, payment_transactions, subscription_plans, user_profiles
-- Integration Type: Extension - Adding admin role support and RLS policies for admin access
-- Dependencies: user_profiles, companies, subscriptions, payment_transactions

-- 1. Check if admin role already exists in user_profiles role column
-- If not, we need to handle role-based access through raw_user_meta_data instead

-- 2. Create admin role validation function using auth.users metadata (Pattern 6A)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'super_admin' 
         OR au.raw_app_meta_data->>'role' = 'super_admin')
)
$$;

-- 3. Add admin access policies to companies table
-- Drop existing restrictive policies first
DROP POLICY IF EXISTS "Company owners can view their company" ON public.companies;
DROP POLICY IF EXISTS "Company owners can update their company" ON public.companies;

-- Recreate with admin access
CREATE POLICY "users_view_companies"
ON public.companies
FOR SELECT
TO authenticated
USING (
    owner_id = auth.uid() OR public.is_super_admin()
);

CREATE POLICY "users_update_own_companies"
ON public.companies
FOR UPDATE
TO authenticated
USING (
    owner_id = auth.uid() OR public.is_super_admin()
)
WITH CHECK (
    owner_id = auth.uid() OR public.is_super_admin()
);

CREATE POLICY "admin_full_access_companies"
ON public.companies
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- 4. Add admin access policies to subscriptions table
DROP POLICY IF EXISTS "Company members can view their subscriptions" ON public.subscriptions;

CREATE POLICY "users_view_own_subscriptions"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (
    company_id IN (
        SELECT id FROM public.companies WHERE owner_id = auth.uid()
    ) OR public.is_super_admin()
);

CREATE POLICY "admin_manage_subscriptions"
ON public.subscriptions
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- 5. Add admin access policies to payment_transactions table
DROP POLICY IF EXISTS "Company members can view their transactions" ON public.payment_transactions;

CREATE POLICY "users_view_own_transactions"
ON public.payment_transactions
FOR SELECT
TO authenticated
USING (
    company_id IN (
        SELECT id FROM public.companies WHERE owner_id = auth.uid()
    ) OR public.is_super_admin()
);

CREATE POLICY "admin_view_all_transactions"
ON public.payment_transactions
FOR SELECT
TO authenticated
USING (public.is_super_admin());

-- 6. Create helper function for calculating MRR
CREATE OR REPLACE FUNCTION public.calculate_mrr()
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT COALESCE(SUM(s.amount), 0)
FROM public.subscriptions s
WHERE s.status = 'active'
AND s.billing_period = 'monthly'
$$;

-- 7. Create helper function for getting subscription statistics
CREATE OR REPLACE FUNCTION public.get_subscription_stats()
RETURNS TABLE(
    total_companies BIGINT,
    active_subscriptions BIGINT,
    trial_subscriptions BIGINT,
    inactive_subscriptions BIGINT,
    total_mrr NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT
    (SELECT COUNT(*) FROM public.companies)::BIGINT,
    (SELECT COUNT(*) FROM public.subscriptions WHERE status = 'active')::BIGINT,
    (SELECT COUNT(*) FROM public.subscriptions WHERE status = 'trial')::BIGINT,
    (SELECT COUNT(*) FROM public.subscriptions WHERE status IN ('inactive', 'cancelled'))::BIGINT,
    public.calculate_mrr()
$$;

-- 8. Create function to get company details with subscription info
CREATE OR REPLACE FUNCTION public.get_company_details_with_subscriptions()
RETURNS TABLE(
    company_id UUID,
    company_name TEXT,
    company_email TEXT,
    subscription_status TEXT,
    subscription_plan TEXT,
    subscription_amount NUMERIC,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    last_payment_date TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT
    c.id,
    c.name,
    c.email,
    c.subscription_status,
    sp.name,
    s.amount,
    c.is_active,
    c.created_at,
    (
        SELECT pt.created_at 
        FROM public.payment_transactions pt 
        WHERE pt.company_id = c.id 
        ORDER BY pt.created_at DESC 
        LIMIT 1
    )
FROM public.companies c
LEFT JOIN public.subscriptions s ON c.id = s.company_id
LEFT JOIN public.subscription_plans sp ON s.plan_id = sp.id
ORDER BY c.created_at DESC
$$;