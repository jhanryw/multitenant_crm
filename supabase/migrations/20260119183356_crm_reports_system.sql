-- Location: supabase/migrations/20260119183356_crm_reports_system.sql
-- Schema Analysis: Existing schema has companies, user_profiles, subscriptions, and CRM enum types
-- Integration Type: PARTIAL_EXISTS - Extending existing CRM schema with reports functionality
-- Dependencies: user_profiles (for seller assignments), existing enum types

-- 1. Types - Safe creation with IF NOT EXISTS logic
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_status') THEN
        CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'qualified', 'negotiating', 'won', 'lost');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_source') THEN
        CREATE TYPE public.lead_source AS ENUM ('website', 'referral', 'social_media', 'email_campaign', 'phone', 'other');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sector_type') THEN
        CREATE TYPE public.sector_type AS ENUM ('retail', 'technology', 'healthcare', 'finance', 'manufacturing', 'services', 'other');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'negotiation_status') THEN
        CREATE TYPE public.negotiation_status AS ENUM ('open', 'pending', 'closed_won', 'closed_lost');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sla_status') THEN
        CREATE TYPE public.sla_status AS ENUM ('on_time', 'warning', 'overdue');
    END IF;
END $$;

-- 2. Core Tables - Safe creation with IF NOT EXISTS
CREATE TABLE IF NOT EXISTS public.sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    target_monthly DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#1fc2a9',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company_name TEXT,
    position TEXT,
    lead_status public.lead_status DEFAULT 'new'::public.lead_status,
    lead_source public.lead_source DEFAULT 'other'::public.lead_source,
    sector public.sector_type DEFAULT 'other'::public.sector_type,
    estimated_value DECIMAL(12,2) DEFAULT 0,
    sla_deadline TIMESTAMPTZ,
    sla_status public.sla_status DEFAULT 'on_time'::public.sla_status,
    converted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.lead_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lead_id, tag_id)
);

CREATE TABLE IF NOT EXISTS public.negotiations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    value DECIMAL(12,2) DEFAULT 0,
    negotiation_status public.negotiation_status DEFAULT 'open'::public.negotiation_status,
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.revenue_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'BRL',
    revenue_date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Indexes - Safe creation with IF NOT EXISTS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sellers_company_id') THEN
        CREATE INDEX idx_sellers_company_id ON public.sellers(company_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sellers_user_id') THEN
        CREATE INDEX idx_sellers_user_id ON public.sellers(user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tags_company_id') THEN
        CREATE INDEX idx_tags_company_id ON public.tags(company_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_leads_company_id') THEN
        CREATE INDEX idx_leads_company_id ON public.leads(company_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_leads_seller_id') THEN
        CREATE INDEX idx_leads_seller_id ON public.leads(seller_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_leads_status') THEN
        CREATE INDEX idx_leads_status ON public.leads(lead_status);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_leads_sla_status') THEN
        CREATE INDEX idx_leads_sla_status ON public.leads(sla_status);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_lead_tags_lead_id') THEN
        CREATE INDEX idx_lead_tags_lead_id ON public.lead_tags(lead_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_lead_tags_tag_id') THEN
        CREATE INDEX idx_lead_tags_tag_id ON public.lead_tags(tag_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_negotiations_company_id') THEN
        CREATE INDEX idx_negotiations_company_id ON public.negotiations(company_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_negotiations_lead_id') THEN
        CREATE INDEX idx_negotiations_lead_id ON public.negotiations(lead_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_negotiations_status') THEN
        CREATE INDEX idx_negotiations_status ON public.negotiations(negotiation_status);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_revenue_records_company_id') THEN
        CREATE INDEX idx_revenue_records_company_id ON public.revenue_records(company_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_revenue_records_seller_id') THEN
        CREATE INDEX idx_revenue_records_seller_id ON public.revenue_records(seller_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_revenue_records_date') THEN
        CREATE INDEX idx_revenue_records_date ON public.revenue_records(revenue_date);
    END IF;
END $$;

-- 4. Functions (BEFORE RLS policies)
CREATE OR REPLACE FUNCTION public.calculate_sla_averages(p_company_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS TABLE(
    total_leads BIGINT,
    on_time_leads BIGINT,
    warning_leads BIGINT,
    overdue_leads BIGINT,
    average_response_time NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT
        COUNT(*)::BIGINT as total_leads,
        COUNT(*) FILTER (WHERE l.sla_status = 'on_time')::BIGINT as on_time_leads,
        COUNT(*) FILTER (WHERE l.sla_status = 'warning')::BIGINT as warning_leads,
        COUNT(*) FILTER (WHERE l.sla_status = 'overdue')::BIGINT as overdue_leads,
        AVG(EXTRACT(EPOCH FROM (l.updated_at - l.created_at)) / 3600)::NUMERIC as average_response_time
    FROM public.leads l
    WHERE l.company_id = p_company_id
    AND l.created_at::DATE BETWEEN p_start_date AND p_end_date;
$$;

CREATE OR REPLACE FUNCTION public.calculate_revenue_by_seller(p_company_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS TABLE(
    seller_id UUID,
    seller_name TEXT,
    total_revenue NUMERIC,
    lead_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT
        s.id as seller_id,
        s.name as seller_name,
        COALESCE(SUM(rr.amount), 0)::NUMERIC as total_revenue,
        COUNT(DISTINCT l.id)::BIGINT as lead_count
    FROM public.sellers s
    LEFT JOIN public.revenue_records rr ON s.id = rr.seller_id
        AND rr.revenue_date BETWEEN p_start_date AND p_end_date
    LEFT JOIN public.leads l ON s.id = l.seller_id
        AND l.created_at::DATE BETWEEN p_start_date AND p_end_date
    WHERE s.company_id = p_company_id
    GROUP BY s.id, s.name
    ORDER BY total_revenue DESC;
$$;

CREATE OR REPLACE FUNCTION public.calculate_revenue_by_tags(p_company_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS TABLE(
    tag_id UUID,
    tag_name TEXT,
    total_revenue NUMERIC,
    lead_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT
        t.id as tag_id,
        t.name as tag_name,
        COALESCE(SUM(rr.amount), 0)::NUMERIC as total_revenue,
        COUNT(DISTINCT l.id)::BIGINT as lead_count
    FROM public.tags t
    LEFT JOIN public.lead_tags lt ON t.id = lt.tag_id
    LEFT JOIN public.leads l ON lt.lead_id = l.id
        AND l.created_at::DATE BETWEEN p_start_date AND p_end_date
    LEFT JOIN public.revenue_records rr ON l.id = rr.lead_id
        AND rr.revenue_date BETWEEN p_start_date AND p_end_date
    WHERE t.company_id = p_company_id
    GROUP BY t.id, t.name
    ORDER BY total_revenue DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_open_negotiations_value(p_company_id UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT COALESCE(SUM(n.value), 0)
    FROM public.negotiations n
    WHERE n.company_id = p_company_id
    AND n.negotiation_status = 'open';
$$;

CREATE OR REPLACE FUNCTION public.get_period_lead_activity(p_company_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS TABLE(
    new_leads BIGINT,
    converted_leads BIGINT,
    lost_leads BIGINT,
    conversion_rate NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT
        COUNT(*) FILTER (WHERE l.created_at::DATE BETWEEN p_start_date AND p_end_date)::BIGINT as new_leads,
        COUNT(*) FILTER (WHERE l.lead_status = 'won' AND l.converted_at::DATE BETWEEN p_start_date AND p_end_date)::BIGINT as converted_leads,
        COUNT(*) FILTER (WHERE l.lead_status = 'lost' AND l.updated_at::DATE BETWEEN p_start_date AND p_end_date)::BIGINT as lost_leads,
        CASE 
            WHEN COUNT(*) FILTER (WHERE l.created_at::DATE BETWEEN p_start_date AND p_end_date) > 0
            THEN (COUNT(*) FILTER (WHERE l.lead_status = 'won' AND l.converted_at::DATE BETWEEN p_start_date AND p_end_date)::NUMERIC / 
                  COUNT(*) FILTER (WHERE l.created_at::DATE BETWEEN p_start_date AND p_end_date)::NUMERIC * 100)
            ELSE 0
        END as conversion_rate
    FROM public.leads l
    WHERE l.company_id = p_company_id;
$$;

-- 5. Enable RLS
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.negotiations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_records ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies - Safe creation with DROP IF EXISTS
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "company_users_manage_sellers" ON public.sellers;
    DROP POLICY IF EXISTS "company_users_manage_tags" ON public.tags;
    DROP POLICY IF EXISTS "company_users_manage_leads" ON public.leads;
    DROP POLICY IF EXISTS "company_users_manage_lead_tags" ON public.lead_tags;
    DROP POLICY IF EXISTS "company_users_manage_negotiations" ON public.negotiations;
    DROP POLICY IF EXISTS "company_users_manage_revenue_records" ON public.revenue_records;
END $$;

CREATE POLICY "company_users_manage_sellers"
ON public.sellers
FOR ALL
TO authenticated
USING (
    company_id IN (
        SELECT up.company_id FROM public.user_profiles up 
        WHERE up.id = auth.uid()
    )
)
WITH CHECK (
    company_id IN (
        SELECT up.company_id FROM public.user_profiles up 
        WHERE up.id = auth.uid()
    )
);

CREATE POLICY "company_users_manage_tags"
ON public.tags
FOR ALL
TO authenticated
USING (
    company_id IN (
        SELECT up.company_id FROM public.user_profiles up 
        WHERE up.id = auth.uid()
    )
)
WITH CHECK (
    company_id IN (
        SELECT up.company_id FROM public.user_profiles up 
        WHERE up.id = auth.uid()
    )
);

CREATE POLICY "company_users_manage_leads"
ON public.leads
FOR ALL
TO authenticated
USING (
    company_id IN (
        SELECT up.company_id FROM public.user_profiles up 
        WHERE up.id = auth.uid()
    )
)
WITH CHECK (
    company_id IN (
        SELECT up.company_id FROM public.user_profiles up 
        WHERE up.id = auth.uid()
    )
);

CREATE POLICY "company_users_manage_lead_tags"
ON public.lead_tags
FOR ALL
TO authenticated
USING (
    lead_id IN (
        SELECT l.id FROM public.leads l
        JOIN public.user_profiles up ON l.company_id = up.company_id
        WHERE up.id = auth.uid()
    )
)
WITH CHECK (
    lead_id IN (
        SELECT l.id FROM public.leads l
        JOIN public.user_profiles up ON l.company_id = up.company_id
        WHERE up.id = auth.uid()
    )
);

CREATE POLICY "company_users_manage_negotiations"
ON public.negotiations
FOR ALL
TO authenticated
USING (
    company_id IN (
        SELECT up.company_id FROM public.user_profiles up 
        WHERE up.id = auth.uid()
    )
)
WITH CHECK (
    company_id IN (
        SELECT up.company_id FROM public.user_profiles up 
        WHERE up.id = auth.uid()
    )
);

CREATE POLICY "company_users_manage_revenue_records"
ON public.revenue_records
FOR ALL
TO authenticated
USING (
    company_id IN (
        SELECT up.company_id FROM public.user_profiles up 
        WHERE up.id = auth.uid()
    )
)
WITH CHECK (
    company_id IN (
        SELECT up.company_id FROM public.user_profiles up 
        WHERE up.id = auth.uid()
    )
);

-- 7. Triggers - Safe creation with DROP IF EXISTS
DO $$
BEGIN
    DROP TRIGGER IF EXISTS update_sellers_updated_at ON public.sellers;
    DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
    DROP TRIGGER IF EXISTS update_negotiations_updated_at ON public.negotiations;
END $$;

CREATE TRIGGER update_sellers_updated_at
    BEFORE UPDATE ON public.sellers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_negotiations_updated_at
    BEFORE UPDATE ON public.negotiations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Mock Data - Only insert if tables are empty
DO $$
DECLARE
    v_company_id UUID;
    v_seller1_id UUID := gen_random_uuid();
    v_seller2_id UUID := gen_random_uuid();
    v_tag1_id UUID := gen_random_uuid();
    v_tag2_id UUID := gen_random_uuid();
    v_tag3_id UUID := gen_random_uuid();
    v_lead1_id UUID := gen_random_uuid();
    v_lead2_id UUID := gen_random_uuid();
    v_lead3_id UUID := gen_random_uuid();
    v_lead4_id UUID := gen_random_uuid();
    v_nego1_id UUID := gen_random_uuid();
    v_nego2_id UUID := gen_random_uuid();
    v_seller_count INTEGER;
BEGIN
    -- Check if sellers table already has data
    SELECT COUNT(*) INTO v_seller_count FROM public.sellers;
    
    -- Only insert mock data if sellers table is empty
    IF v_seller_count = 0 THEN
        -- Get first company
        SELECT id INTO v_company_id FROM public.companies LIMIT 1;
        
        IF v_company_id IS NOT NULL THEN
            -- Insert sellers
            INSERT INTO public.sellers (id, company_id, name, email, phone, target_monthly) VALUES
                (v_seller1_id, v_company_id, 'Carlos Silva', 'carlos.silva@example.com', '+55 11 98765-4321', 50000.00),
                (v_seller2_id, v_company_id, 'Ana Santos', 'ana.santos@example.com', '+55 21 97654-3210', 45000.00);
            
            -- Insert tags
            INSERT INTO public.tags (id, company_id, name, color) VALUES
                (v_tag1_id, v_company_id, 'Premium', '#107c65'),
                (v_tag2_id, v_company_id, 'Enterprise', '#1fc2a9'),
                (v_tag3_id, v_company_id, 'Hot Lead', '#ff6b6b');
            
            -- Insert leads
            INSERT INTO public.leads (id, company_id, seller_id, name, email, phone, company_name, position, lead_status, lead_source, sector, estimated_value, sla_deadline, sla_status) VALUES
                (v_lead1_id, v_company_id, v_seller1_id, 'João Oliveira', 'joao@techcorp.com', '+55 11 99999-1111', 'TechCorp Brasil', 'CTO', 'negotiating', 'website', 'technology', 75000.00, CURRENT_TIMESTAMP + INTERVAL '5 days', 'on_time'),
                (v_lead2_id, v_company_id, v_seller2_id, 'Maria Costa', 'maria@retail.com', '+55 21 88888-2222', 'Retail Solutions', 'Director', 'qualified', 'referral', 'retail', 120000.00, CURRENT_TIMESTAMP + INTERVAL '2 days', 'warning'),
                (v_lead3_id, v_company_id, v_seller1_id, 'Pedro Almeida', 'pedro@finance.com', '+55 31 77777-3333', 'Finance Plus', 'Manager', 'won', 'email_campaign', 'finance', 95000.00, CURRENT_TIMESTAMP - INTERVAL '10 days', 'on_time'),
                (v_lead4_id, v_company_id, v_seller2_id, 'Laura Fernandes', 'laura@health.com', '+55 41 66666-4444', 'HealthCare Inc', 'CEO', 'contacted', 'social_media', 'healthcare', 200000.00, CURRENT_TIMESTAMP + INTERVAL '7 days', 'on_time');
            
            -- Link leads to tags
            INSERT INTO public.lead_tags (lead_id, tag_id) VALUES
                (v_lead1_id, v_tag1_id),
                (v_lead2_id, v_tag2_id),
                (v_lead2_id, v_tag3_id),
                (v_lead3_id, v_tag1_id),
                (v_lead4_id, v_tag2_id),
                (v_lead4_id, v_tag3_id);
            
            -- Insert negotiations
            INSERT INTO public.negotiations (id, lead_id, seller_id, company_id, title, description, value, negotiation_status) VALUES
                (v_nego1_id, v_lead1_id, v_seller1_id, v_company_id, 'Enterprise Plan - TechCorp', 'Annual contract negotiation for enterprise plan with custom features', 75000.00, 'open'),
                (v_nego2_id, v_lead2_id, v_seller2_id, v_company_id, 'Retail Suite Implementation', 'Full implementation of retail management suite', 120000.00, 'open');
            
            -- Insert revenue records
            INSERT INTO public.revenue_records (company_id, seller_id, lead_id, amount, revenue_date, description) VALUES
                (v_company_id, v_seller1_id, v_lead3_id, 95000.00, CURRENT_DATE - INTERVAL '5 days', 'Finance Plus - Closed Deal'),
                (v_company_id, v_seller1_id, NULL, 25000.00, CURRENT_DATE - INTERVAL '15 days', 'Additional Services - Previous Client'),
                (v_company_id, v_seller2_id, NULL, 38000.00, CURRENT_DATE - INTERVAL '20 days', 'Consulting Services'),
                (v_company_id, v_seller1_id, NULL, 42000.00, CURRENT_DATE - INTERVAL '25 days', 'Custom Development'),
                (v_company_id, v_seller2_id, NULL, 55000.00, CURRENT_DATE - INTERVAL '30 days', 'Support Contract Renewal');
        END IF;
    END IF;
END $$;