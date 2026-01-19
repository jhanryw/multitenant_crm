-- Location: supabase/migrations/20260119194000_affiliate_system.sql
-- Schema Analysis: Existing CRM with companies, sellers, leads, subscriptions
-- Integration Type: NEW MODULE - Affiliate system with commission tracking
-- Dependencies: companies, sellers, user_profiles, subscriptions, payment_transactions

-- ============================================================================
-- AFFILIATE MANAGEMENT SYSTEM MIGRATION
-- ============================================================================

-- 1. CUSTOM TYPES
-- ============================================================================

CREATE TYPE public.affiliate_status AS ENUM (
    'pending',
    'active',
    'suspended',
    'terminated'
);

CREATE TYPE public.commission_status AS ENUM (
    'pending',
    'approved',
    'paid',
    'rejected'
);

CREATE TYPE public.referral_status AS ENUM (
    'active',
    'converted',
    'expired',
    'invalid'
);

-- 2. CORE TABLES
-- ============================================================================

-- Affiliates table
CREATE TABLE public.affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    affiliate_code TEXT NOT NULL UNIQUE,
    status public.affiliate_status DEFAULT 'pending'::public.affiliate_status,
    commission_rate DECIMAL(5,2) DEFAULT 10.00 CHECK (commission_rate >= 0 AND commission_rate <= 100),
    total_referrals INTEGER DEFAULT 0,
    successful_conversions INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    pending_earnings DECIMAL(10,2) DEFAULT 0,
    paid_earnings DECIMAL(10,2) DEFAULT 0,
    payment_method TEXT,
    payment_details JSONB,
    notes TEXT,
    approved_at TIMESTAMPTZ,
    suspended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Referral links tracking
CREATE TABLE public.referral_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL UNIQUE,
    campaign_name TEXT,
    target_url TEXT,
    clicks_count INTEGER DEFAULT 0,
    conversions_count INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    status public.referral_status DEFAULT 'active'::public.referral_status,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Commission records
CREATE TABLE public.affiliate_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    payment_transaction_id UUID REFERENCES public.payment_transactions(id) ON DELETE SET NULL,
    referral_link_id UUID REFERENCES public.referral_links(id) ON DELETE SET NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    base_amount DECIMAL(10,2) NOT NULL,
    status public.commission_status DEFAULT 'pending'::public.commission_status,
    currency TEXT DEFAULT 'BRL',
    approved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    rejection_reason TEXT,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Commission payment history
CREATE TABLE public.affiliate_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'BRL',
    payment_method TEXT NOT NULL,
    payment_reference TEXT,
    commission_ids UUID[] NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_affiliates_company_id ON public.affiliates(company_id);
CREATE INDEX idx_affiliates_user_id ON public.affiliates(user_id);
CREATE INDEX idx_affiliates_status ON public.affiliates(status);
CREATE INDEX idx_affiliates_code ON public.affiliates(affiliate_code);

CREATE INDEX idx_referral_links_affiliate_id ON public.referral_links(affiliate_id);
CREATE INDEX idx_referral_links_code ON public.referral_links(referral_code);
CREATE INDEX idx_referral_links_status ON public.referral_links(status);

CREATE INDEX idx_affiliate_commissions_affiliate_id ON public.affiliate_commissions(affiliate_id);
CREATE INDEX idx_affiliate_commissions_company_id ON public.affiliate_commissions(company_id);
CREATE INDEX idx_affiliate_commissions_status ON public.affiliate_commissions(status);
CREATE INDEX idx_affiliate_commissions_subscription_id ON public.affiliate_commissions(subscription_id);

CREATE INDEX idx_affiliate_payouts_affiliate_id ON public.affiliate_payouts(affiliate_id);
CREATE INDEX idx_affiliate_payouts_status ON public.affiliate_payouts(status);

-- 4. FUNCTIONS (BEFORE RLS POLICIES)
-- ============================================================================

-- Function to generate unique affiliate code
CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $func$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        new_code := 'AFF-' || UPPER(substring(md5(random()::text) from 1 for 8));
        
        SELECT EXISTS (
            SELECT 1 FROM public.affiliates WHERE affiliate_code = new_code
        ) INTO code_exists;
        
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    RETURN new_code;
END;
$func$;

-- Function to calculate commission
CREATE OR REPLACE FUNCTION public.calculate_affiliate_commission(
    p_affiliate_id UUID,
    p_amount DECIMAL
)
RETURNS DECIMAL
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $func$
    SELECT (p_amount * commission_rate / 100)::DECIMAL(10,2)
    FROM public.affiliates
    WHERE id = p_affiliate_id;
$func$;

-- Function to update affiliate statistics
CREATE OR REPLACE FUNCTION public.update_affiliate_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update total referrals
        UPDATE public.affiliates
        SET total_referrals = total_referrals + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.affiliate_id;
        
        -- Update referral link stats
        IF NEW.referral_link_id IS NOT NULL THEN
            UPDATE public.referral_links
            SET conversions_count = conversions_count + 1,
                conversion_rate = (conversions_count + 1)::DECIMAL / NULLIF(clicks_count, 0) * 100
            WHERE id = NEW.referral_link_id;
        END IF;
        
        -- Update earnings based on commission status
        IF NEW.status = 'pending' THEN
            UPDATE public.affiliates
            SET pending_earnings = pending_earnings + NEW.commission_amount,
                total_earnings = total_earnings + NEW.commission_amount
            WHERE id = NEW.affiliate_id;
        ELSIF NEW.status = 'approved' THEN
            UPDATE public.affiliates
            SET successful_conversions = successful_conversions + 1
            WHERE id = NEW.affiliate_id;
        ELSIF NEW.status = 'paid' THEN
            UPDATE public.affiliates
            SET paid_earnings = paid_earnings + NEW.commission_amount,
                pending_earnings = pending_earnings - NEW.commission_amount
            WHERE id = NEW.affiliate_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Update earnings when status changes
        IF OLD.status != NEW.status THEN
            IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
                UPDATE public.affiliates
                SET successful_conversions = successful_conversions + 1
                WHERE id = NEW.affiliate_id;
            ELSIF NEW.status = 'paid' AND OLD.status = 'approved' THEN
                UPDATE public.affiliates
                SET paid_earnings = paid_earnings + NEW.commission_amount,
                    pending_earnings = pending_earnings - NEW.commission_amount
                WHERE id = NEW.affiliate_id;
            ELSIF NEW.status = 'rejected' AND OLD.status IN ('pending', 'approved') THEN
                UPDATE public.affiliates
                SET total_earnings = total_earnings - NEW.commission_amount,
                    pending_earnings = pending_earnings - NEW.commission_amount
                WHERE id = NEW.affiliate_id;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$func$;

-- Function to track Stripe payment commissions
CREATE OR REPLACE FUNCTION public.track_stripe_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    v_affiliate_id UUID;
    v_commission_rate DECIMAL;
    v_commission_amount DECIMAL;
BEGIN
    -- Check if this is a successful subscription payment
    IF NEW.status = 'succeeded' AND NEW.transaction_type = 'payment' AND NEW.subscription_id IS NOT NULL THEN
        -- Find affiliate by subscription metadata (set when subscription created with referral)
        SELECT metadata->>'affiliate_id' INTO v_affiliate_id
        FROM public.subscriptions
        WHERE id = NEW.subscription_id
        AND metadata->>'affiliate_id' IS NOT NULL;
        
        IF v_affiliate_id IS NOT NULL THEN
            -- Get affiliate commission rate
            SELECT commission_rate INTO v_commission_rate
            FROM public.affiliates
            WHERE id = v_affiliate_id::UUID
            AND status = 'active';
            
            IF v_commission_rate IS NOT NULL THEN
                -- Calculate commission
                v_commission_amount := (NEW.amount * v_commission_rate / 100)::DECIMAL(10,2);
                
                -- Create commission record
                INSERT INTO public.affiliate_commissions (
                    affiliate_id,
                    company_id,
                    subscription_id,
                    payment_transaction_id,
                    commission_amount,
                    commission_rate,
                    base_amount,
                    currency,
                    status,
                    metadata
                ) VALUES (
                    v_affiliate_id::UUID,
                    (SELECT company_id FROM public.subscriptions WHERE id = NEW.subscription_id),
                    NEW.subscription_id,
                    NEW.id,
                    v_commission_amount,
                    v_commission_rate,
                    NEW.amount,
                    NEW.currency,
                    'pending',
                    jsonb_build_object(
                        'stripe_charge_id', NEW.stripe_charge_id,
                        'payment_intent_id', NEW.payment_intent_id,
                        'auto_tracked', true
                    )
                );
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$func$;

-- 5. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES
-- ============================================================================

-- Affiliates policies - Pattern 6 (Role-Based Access)
CREATE OR REPLACE FUNCTION public.is_company_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $func$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid()
    AND up.role IN ('admin', 'gerente')
)
$func$;

CREATE POLICY "company_admins_view_all_affiliates"
ON public.affiliates
FOR SELECT
TO authenticated
USING (
    company_id IN (
        SELECT company_id FROM public.user_profiles
        WHERE id = auth.uid()
    )
    AND public.is_company_admin()
);

CREATE POLICY "company_admins_manage_affiliates"
ON public.affiliates
FOR ALL
TO authenticated
USING (
    company_id IN (
        SELECT company_id FROM public.user_profiles
        WHERE id = auth.uid()
    )
    AND public.is_company_admin()
)
WITH CHECK (
    company_id IN (
        SELECT company_id FROM public.user_profiles
        WHERE id = auth.uid()
    )
    AND public.is_company_admin()
);

-- Affiliates can view their own data - Pattern 2 (Simple User Ownership)
CREATE POLICY "affiliates_view_own_data"
ON public.affiliates
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Referral links policies
CREATE POLICY "affiliates_manage_own_links"
ON public.referral_links
FOR ALL
TO authenticated
USING (
    affiliate_id IN (
        SELECT id FROM public.affiliates WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    affiliate_id IN (
        SELECT id FROM public.affiliates WHERE user_id = auth.uid()
    )
);

CREATE POLICY "company_admins_view_all_referral_links"
ON public.referral_links
FOR SELECT
TO authenticated
USING (
    affiliate_id IN (
        SELECT a.id FROM public.affiliates a
        JOIN public.user_profiles up ON a.company_id = up.company_id
        WHERE up.id = auth.uid() AND up.role IN ('admin', 'gerente')
    )
);

-- Commission policies
CREATE POLICY "affiliates_view_own_commissions"
ON public.affiliate_commissions
FOR SELECT
TO authenticated
USING (
    affiliate_id IN (
        SELECT id FROM public.affiliates WHERE user_id = auth.uid()
    )
);

CREATE POLICY "company_admins_manage_commissions"
ON public.affiliate_commissions
FOR ALL
TO authenticated
USING (
    company_id IN (
        SELECT company_id FROM public.user_profiles
        WHERE id = auth.uid()
    )
    AND public.is_company_admin()
)
WITH CHECK (
    company_id IN (
        SELECT company_id FROM public.user_profiles
        WHERE id = auth.uid()
    )
    AND public.is_company_admin()
);

-- Payout policies
CREATE POLICY "affiliates_view_own_payouts"
ON public.affiliate_payouts
FOR SELECT
TO authenticated
USING (
    affiliate_id IN (
        SELECT id FROM public.affiliates WHERE user_id = auth.uid()
    )
);

CREATE POLICY "company_admins_manage_payouts"
ON public.affiliate_payouts
FOR ALL
TO authenticated
USING (
    affiliate_id IN (
        SELECT a.id FROM public.affiliates a
        JOIN public.user_profiles up ON a.company_id = up.company_id
        WHERE up.id = auth.uid() AND up.role IN ('admin', 'gerente')
    )
)
WITH CHECK (
    affiliate_id IN (
        SELECT a.id FROM public.affiliates a
        JOIN public.user_profiles up ON a.company_id = up.company_id
        WHERE up.id = auth.uid() AND up.role IN ('admin', 'gerente')
    )
);

-- 7. TRIGGERS
-- ============================================================================

-- Function to set affiliate code before insert
CREATE OR REPLACE FUNCTION public.set_affiliate_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $func$
BEGIN
    IF NEW.affiliate_code IS NULL THEN
        NEW.affiliate_code := public.generate_affiliate_code();
    END IF;
    RETURN NEW;
END;
$func$;

-- Trigger to auto-generate affiliate code
CREATE TRIGGER set_affiliate_code_trigger
BEFORE INSERT ON public.affiliates
FOR EACH ROW
EXECUTE FUNCTION public.set_affiliate_code();

-- Trigger to update affiliate statistics
CREATE TRIGGER update_affiliate_stats_trigger
AFTER INSERT OR UPDATE ON public.affiliate_commissions
FOR EACH ROW
EXECUTE FUNCTION public.update_affiliate_stats();

-- Trigger to track Stripe commissions automatically
CREATE TRIGGER track_stripe_commission_trigger
AFTER INSERT OR UPDATE ON public.payment_transactions
FOR EACH ROW
EXECUTE FUNCTION public.track_stripe_commission();

-- Trigger to update timestamps
CREATE TRIGGER update_affiliates_timestamp
BEFORE UPDATE ON public.affiliates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_affiliate_commissions_timestamp
BEFORE UPDATE ON public.affiliate_commissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 8. MOCK DATA (OPTIONAL - For testing)
-- ============================================================================

DO $$
DECLARE
    admin_user_id UUID;
    test_company_id UUID;
    test_affiliate_id UUID;
    test_referral_link_id UUID;
BEGIN
    -- Get first admin user and company for testing
    SELECT id INTO admin_user_id FROM public.user_profiles WHERE role = 'admin' LIMIT 1;
    SELECT id INTO test_company_id FROM public.companies LIMIT 1;
    
    IF admin_user_id IS NOT NULL AND test_company_id IS NOT NULL THEN
        -- Create test affiliate
        INSERT INTO public.affiliates (
            user_id,
            company_id,
            affiliate_code,
            status,
            commission_rate
        ) VALUES (
            admin_user_id,
            test_company_id,
            public.generate_affiliate_code(),
            'active',
            15.00
        ) RETURNING id INTO test_affiliate_id;
        
        -- Create test referral link
        INSERT INTO public.referral_links (
            affiliate_id,
            referral_code,
            campaign_name,
            target_url
        ) VALUES (
            test_affiliate_id,
            'REF-' || UPPER(substring(md5(random()::text) from 1 for 8)),
            'Launch Campaign',
            'https://app.example.com/register'
        ) RETURNING id INTO test_referral_link_id;
        
        RAISE NOTICE 'Mock affiliate data created successfully';
    ELSE
        RAISE NOTICE 'No admin user or company found. Skipping mock data.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating mock data: %', SQLERRM;
END $$;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================