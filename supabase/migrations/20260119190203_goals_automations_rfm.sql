-- =====================================================
-- Migration: Goals, Automations, RFM Matrix & Enhanced Seller Reports
-- Description: Adds goals management, lead automations, WhatsApp Web sessions, and RFM analysis
-- Timestamp: 20260119190203
-- =====================================================

-- 1. Create ENUM types for new features
CREATE TYPE public.goal_period AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'yearly');
CREATE TYPE public.goal_status AS ENUM ('active', 'completed', 'failed', 'cancelled');
CREATE TYPE public.automation_trigger AS ENUM ('time_based', 'status_change', 'stage_change', 'tag_added', 'inactivity');
CREATE TYPE public.automation_action AS ENUM ('send_message', 'change_status', 'assign_seller', 'add_tag', 'notify_user');
CREATE TYPE public.whatsapp_connection_status AS ENUM ('disconnected', 'qr_pending', 'connected', 'error');
CREATE TYPE public.rfm_segment AS ENUM ('champions', 'loyal_customers', 'potential_loyalist', 'new_customers', 'promising', 'need_attention', 'about_to_sleep', 'at_risk', 'cant_lose', 'hibernating', 'lost');

-- 2. Goals Management Table
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_value NUMERIC NOT NULL,
    current_value NUMERIC DEFAULT 0,
    period public.goal_period NOT NULL DEFAULT 'monthly',
    status public.goal_status NOT NULL DEFAULT 'active',
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT goals_dates_check CHECK (end_date > start_date),
    CONSTRAINT goals_target_positive CHECK (target_value > 0)
);

CREATE INDEX idx_goals_company_id ON public.goals(company_id);
CREATE INDEX idx_goals_seller_id ON public.goals(seller_id);
CREATE INDEX idx_goals_status ON public.goals(status);
CREATE INDEX idx_goals_period ON public.goals(period, end_date);

-- 3. Lead Automations Table
CREATE TABLE IF NOT EXISTS public.lead_automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    trigger_type public.automation_trigger NOT NULL,
    trigger_config JSONB DEFAULT '{}',
    action_type public.automation_action NOT NULL,
    action_config JSONB DEFAULT '{}',
    conditions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_automations_company_id ON public.lead_automations(company_id);
CREATE INDEX idx_automations_active ON public.lead_automations(is_active);
CREATE INDEX idx_automations_trigger ON public.lead_automations(trigger_type);

-- 4. Automation Execution Logs
CREATE TABLE IF NOT EXISTS public.automation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID NOT NULL REFERENCES public.lead_automations(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    execution_details JSONB DEFAULT '{}'
);

CREATE INDEX idx_automation_logs_automation_id ON public.automation_logs(automation_id);
CREATE INDEX idx_automation_logs_lead_id ON public.automation_logs(lead_id);
CREATE INDEX idx_automation_logs_executed_at ON public.automation_logs(executed_at);

-- 5. WhatsApp Web Sessions (for QR code authentication)
CREATE TABLE IF NOT EXISTS public.whatsapp_web_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    session_name TEXT NOT NULL,
    phone_number TEXT,
    qr_code TEXT,
    connection_status public.whatsapp_connection_status DEFAULT 'disconnected',
    session_data JSONB DEFAULT '{}',
    last_connected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_company_session UNIQUE (company_id, session_name)
);

CREATE INDEX idx_whatsapp_sessions_company_id ON public.whatsapp_web_sessions(company_id);
CREATE INDEX idx_whatsapp_sessions_status ON public.whatsapp_web_sessions(connection_status);

-- 6. Seller Performance Metrics (for enhanced reports)
CREATE TABLE IF NOT EXISTS public.seller_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    leads_contacted INTEGER DEFAULT 0,
    leads_converted INTEGER DEFAULT 0,
    response_time_avg_minutes INTEGER,
    open_negotiations_count INTEGER DEFAULT 0,
    open_negotiations_value NUMERIC DEFAULT 0,
    revenue_generated NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_seller_metric_date UNIQUE (seller_id, metric_date)
);

CREATE INDEX idx_seller_metrics_seller_id ON public.seller_metrics(seller_id);
CREATE INDEX idx_seller_metrics_date ON public.seller_metrics(metric_date);
CREATE INDEX idx_seller_metrics_company_id ON public.seller_metrics(company_id);

-- 7. RFM Analysis Table (Recency, Frequency, Monetary)
CREATE TABLE IF NOT EXISTS public.lead_rfm_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    recency_score INTEGER CHECK (recency_score BETWEEN 1 AND 5),
    frequency_score INTEGER CHECK (frequency_score BETWEEN 1 AND 5),
    monetary_score INTEGER CHECK (monetary_score BETWEEN 1 AND 5),
    rfm_segment public.rfm_segment,
    last_interaction_date TIMESTAMP WITH TIME ZONE,
    interaction_count INTEGER DEFAULT 0,
    total_value NUMERIC DEFAULT 0,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_lead_rfm UNIQUE (lead_id)
);

CREATE INDEX idx_rfm_lead_id ON public.lead_rfm_scores(lead_id);
CREATE INDEX idx_rfm_company_id ON public.lead_rfm_scores(company_id);
CREATE INDEX idx_rfm_segment ON public.lead_rfm_scores(rfm_segment);
CREATE INDEX idx_rfm_calculated_at ON public.lead_rfm_scores(calculated_at);

-- 8. Create RLS Policies

-- Goals policies
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company_users_manage_goals"
    ON public.goals
    FOR ALL
    USING (
        company_id IN (
            SELECT up.company_id 
            FROM public.user_profiles up 
            WHERE up.id = auth.uid()
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT up.company_id 
            FROM public.user_profiles up 
            WHERE up.id = auth.uid()
        )
    );

-- Automations policies
ALTER TABLE public.lead_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company_users_manage_automations"
    ON public.lead_automations
    FOR ALL
    USING (
        company_id IN (
            SELECT up.company_id 
            FROM public.user_profiles up 
            WHERE up.id = auth.uid()
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT up.company_id 
            FROM public.user_profiles up 
            WHERE up.id = auth.uid()
        )
    );

-- Automation logs policies
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company_users_view_automation_logs"
    ON public.automation_logs
    FOR SELECT
    USING (
        automation_id IN (
            SELECT id FROM public.lead_automations 
            WHERE company_id IN (
                SELECT up.company_id 
                FROM public.user_profiles up 
                WHERE up.id = auth.uid()
            )
        )
    );

-- WhatsApp Web sessions policies
ALTER TABLE public.whatsapp_web_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company_users_manage_whatsapp_sessions"
    ON public.whatsapp_web_sessions
    FOR ALL
    USING (
        company_id IN (
            SELECT up.company_id 
            FROM public.user_profiles up 
            WHERE up.id = auth.uid()
        )
    )
    WITH CHECK (
        company_id IN (
            SELECT up.company_id 
            FROM public.user_profiles up 
            WHERE up.id = auth.uid()
        )
    );

-- Seller metrics policies
ALTER TABLE public.seller_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company_users_view_seller_metrics"
    ON public.seller_metrics
    FOR SELECT
    USING (
        company_id IN (
            SELECT up.company_id 
            FROM public.user_profiles up 
            WHERE up.id = auth.uid()
        )
    );

-- RFM scores policies
ALTER TABLE public.lead_rfm_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company_users_view_rfm_scores"
    ON public.lead_rfm_scores
    FOR SELECT
    USING (
        company_id IN (
            SELECT up.company_id 
            FROM public.user_profiles up 
            WHERE up.id = auth.uid()
        )
    );

-- 9. Create triggers for updated_at columns
CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON public.goals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_automations_updated_at
    BEFORE UPDATE ON public.lead_automations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_whatsapp_sessions_updated_at
    BEFORE UPDATE ON public.whatsapp_web_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Create function to calculate RFM scores
CREATE OR REPLACE FUNCTION public.calculate_rfm_scores(p_company_id UUID)
RETURNS TABLE (
    lead_id UUID,
    recency_score INTEGER,
    frequency_score INTEGER,
    monetary_score INTEGER,
    rfm_segment public.rfm_segment
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH lead_metrics AS (
        SELECT 
            l.id,
            EXTRACT(DAY FROM NOW() - MAX(l.updated_at)) AS days_since_last_contact,
            COUNT(DISTINCT n.id) AS interaction_count,
            COALESCE(SUM(n.value), 0) AS total_value
        FROM public.leads l
        LEFT JOIN public.negotiations n ON n.lead_id = l.id
        WHERE l.company_id = p_company_id
        GROUP BY l.id
    ),
    rfm_percentiles AS (
        SELECT 
            id,
            NTILE(5) OVER (ORDER BY days_since_last_contact DESC) AS r_score,
            NTILE(5) OVER (ORDER BY interaction_count) AS f_score,
            NTILE(5) OVER (ORDER BY total_value) AS m_score
        FROM lead_metrics
    )
    SELECT 
        rp.id AS lead_id,
        rp.r_score AS recency_score,
        rp.f_score AS frequency_score,
        rp.m_score AS monetary_score,
        CASE
            WHEN rp.r_score >= 4 AND rp.f_score >= 4 AND rp.m_score >= 4 THEN 'champions'::public.rfm_segment
            WHEN rp.r_score >= 3 AND rp.f_score >= 4 AND rp.m_score >= 3 THEN 'loyal_customers'::public.rfm_segment
            WHEN rp.r_score >= 3 AND rp.f_score >= 2 AND rp.m_score >= 2 THEN 'potential_loyalist'::public.rfm_segment
            WHEN rp.r_score >= 4 AND rp.f_score <= 2 THEN 'new_customers'::public.rfm_segment
            WHEN rp.r_score >= 3 AND rp.f_score <= 2 THEN 'promising'::public.rfm_segment
            WHEN rp.r_score = 3 AND rp.f_score = 3 THEN 'need_attention'::public.rfm_segment
            WHEN rp.r_score = 2 AND rp.f_score >= 2 THEN 'about_to_sleep'::public.rfm_segment
            WHEN rp.r_score = 2 AND rp.f_score <= 2 AND rp.m_score >= 3 THEN 'at_risk'::public.rfm_segment
            WHEN rp.r_score <= 2 AND rp.f_score >= 4 AND rp.m_score >= 4 THEN 'cant_lose'::public.rfm_segment
            WHEN rp.r_score <= 2 AND rp.f_score <= 2 THEN 'hibernating'::public.rfm_segment
            ELSE 'lost'::public.rfm_segment
        END AS rfm_segment
    FROM rfm_percentiles rp;
END;
$$;

-- 11. Create function to get seller detailed reports
CREATE OR REPLACE FUNCTION public.get_seller_detailed_report(
    p_seller_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    metric_name TEXT,
    metric_value NUMERIC,
    comparison_period NUMERIC,
    percentage_change NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_period_days INTEGER;
BEGIN
    v_period_days := p_end_date - p_start_date;
    
    RETURN QUERY
    WITH current_period AS (
        SELECT 
            COUNT(DISTINCT l.id) FILTER (WHERE l.created_at BETWEEN p_start_date AND p_end_date) AS leads_contacted,
            AVG(EXTRACT(EPOCH FROM (l.updated_at - l.created_at))/60) FILTER (WHERE l.created_at BETWEEN p_start_date AND p_end_date) AS avg_response_time,
            COUNT(DISTINCT n.id) FILTER (WHERE n.negotiation_status = 'open' AND n.created_at BETWEEN p_start_date AND p_end_date) AS open_negotiations,
            COALESCE(SUM(n.value) FILTER (WHERE n.negotiation_status = 'open' AND n.created_at BETWEEN p_start_date AND p_end_date), 0) AS open_value,
            COALESCE(SUM(r.amount) FILTER (WHERE r.revenue_date BETWEEN p_start_date AND p_end_date), 0) AS revenue
        FROM public.leads l
        LEFT JOIN public.negotiations n ON n.lead_id = l.id AND n.seller_id = p_seller_id
        LEFT JOIN public.revenue_records r ON r.lead_id = l.id AND r.seller_id = p_seller_id
        WHERE l.seller_id = p_seller_id
    ),
    previous_period AS (
        SELECT 
            COUNT(DISTINCT l.id) FILTER (WHERE l.created_at BETWEEN (p_start_date - v_period_days) AND p_start_date) AS leads_contacted,
            AVG(EXTRACT(EPOCH FROM (l.updated_at - l.created_at))/60) FILTER (WHERE l.created_at BETWEEN (p_start_date - v_period_days) AND p_start_date) AS avg_response_time,
            COUNT(DISTINCT n.id) FILTER (WHERE n.negotiation_status = 'open' AND n.created_at BETWEEN (p_start_date - v_period_days) AND p_start_date) AS open_negotiations,
            COALESCE(SUM(n.value) FILTER (WHERE n.negotiation_status = 'open' AND n.created_at BETWEEN (p_start_date - v_period_days) AND p_start_date), 0) AS open_value,
            COALESCE(SUM(r.amount) FILTER (WHERE r.revenue_date BETWEEN (p_start_date - v_period_days) AND p_start_date), 0) AS revenue
        FROM public.leads l
        LEFT JOIN public.negotiations n ON n.lead_id = l.id AND n.seller_id = p_seller_id
        LEFT JOIN public.revenue_records r ON r.lead_id = l.id AND r.seller_id = p_seller_id
        WHERE l.seller_id = p_seller_id
    )
    SELECT 
        'Leads Contacted'::TEXT,
        cp.leads_contacted::NUMERIC,
        pp.leads_contacted::NUMERIC,
        CASE WHEN pp.leads_contacted > 0 THEN ((cp.leads_contacted - pp.leads_contacted)::NUMERIC / pp.leads_contacted * 100) ELSE 0 END
    FROM current_period cp, previous_period pp
    UNION ALL
    SELECT 
        'Avg Response Time (min)'::TEXT,
        cp.avg_response_time::NUMERIC,
        pp.avg_response_time::NUMERIC,
        CASE WHEN pp.avg_response_time > 0 THEN ((cp.avg_response_time - pp.avg_response_time) / pp.avg_response_time * 100) ELSE 0 END
    FROM current_period cp, previous_period pp
    UNION ALL
    SELECT 
        'Open Negotiations'::TEXT,
        cp.open_negotiations::NUMERIC,
        pp.open_negotiations::NUMERIC,
        CASE WHEN pp.open_negotiations > 0 THEN ((cp.open_negotiations - pp.open_negotiations)::NUMERIC / pp.open_negotiations * 100) ELSE 0 END
    FROM current_period cp, previous_period pp
    UNION ALL
    SELECT 
        'Open Negotiations Value'::TEXT,
        cp.open_value::NUMERIC,
        pp.open_value::NUMERIC,
        CASE WHEN pp.open_value > 0 THEN ((cp.open_value - pp.open_value) / pp.open_value * 100) ELSE 0 END
    FROM current_period cp, previous_period pp
    UNION ALL
    SELECT 
        'Revenue Generated'::TEXT,
        cp.revenue::NUMERIC,
        pp.revenue::NUMERIC,
        CASE WHEN pp.revenue > 0 THEN ((cp.revenue - pp.revenue) / pp.revenue * 100) ELSE 0 END
    FROM current_period cp, previous_period pp;
END;
$$;

-- 12. Create function to get revenue by channel
CREATE OR REPLACE FUNCTION public.get_revenue_by_channel(
    p_company_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    channel TEXT,
    revenue NUMERIC,
    lead_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.lead_source::TEXT AS channel,
        COALESCE(SUM(r.amount), 0) AS revenue,
        COUNT(DISTINCT l.id) AS lead_count
    FROM public.leads l
    LEFT JOIN public.revenue_records r ON r.lead_id = l.id
    WHERE l.company_id = p_company_id
        AND r.revenue_date BETWEEN p_start_date AND p_end_date
    GROUP BY l.lead_source
    ORDER BY revenue DESC;
END;
$$;

COMMENT ON TABLE public.goals IS 'Stores sales goals for sellers and teams';
COMMENT ON TABLE public.lead_automations IS 'Configurable automation rules for lead management';
COMMENT ON TABLE public.automation_logs IS 'Execution history of automation rules';
COMMENT ON TABLE public.whatsapp_web_sessions IS 'WhatsApp Web.js session management for QR code authentication';
COMMENT ON TABLE public.seller_metrics IS 'Daily aggregated performance metrics for sellers';
COMMENT ON TABLE public.lead_rfm_scores IS 'RFM (Recency, Frequency, Monetary) analysis for leads';