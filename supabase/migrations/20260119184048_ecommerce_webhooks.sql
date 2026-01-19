-- Location: supabase/migrations/20260119184048_ecommerce_webhooks.sql
-- Schema Analysis: CRM system with leads, companies, sellers, negotiations tables
-- Integration Type: NEW MODULE - E-commerce webhook endpoints with WhatsApp automation
-- Dependencies: companies, leads, sellers tables

-- 1. TYPES - E-commerce webhook event types
CREATE TYPE public.webhook_event_type AS ENUM (
    'cart_abandoned',
    'payment_failed',
    'sale_completed',
    'checkout_started',
    'payment_pending'
);

CREATE TYPE public.webhook_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'retrying'
);

CREATE TYPE public.whatsapp_message_status AS ENUM (
    'queued',
    'sent',
    'delivered',
    'read',
    'failed'
);

-- 2. CORE TABLES - Webhook configurations and events

-- Webhook endpoint configurations per company
CREATE TABLE public.webhook_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    endpoint_url TEXT NOT NULL,
    secret_key TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    events_enabled public.webhook_event_type[] DEFAULT ARRAY['cart_abandoned', 'payment_failed', 'sale_completed']::public.webhook_event_type[],
    retry_count INTEGER DEFAULT 3,
    timeout_seconds INTEGER DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Webhook event logs
CREATE TABLE public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    event_type public.webhook_event_type NOT NULL,
    status public.webhook_status DEFAULT 'pending'::public.webhook_status,
    payload JSONB NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    customer_name TEXT,
    cart_value DECIMAL(10, 2),
    order_id TEXT,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    error_message TEXT,
    retry_attempts INTEGER DEFAULT 0,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- WhatsApp message automation
CREATE TABLE public.whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_event_id UUID NOT NULL REFERENCES public.webhook_events(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    phone_number TEXT NOT NULL,
    message_template TEXT NOT NULL,
    message_content TEXT NOT NULL,
    status public.whatsapp_message_status DEFAULT 'queued'::public.whatsapp_message_status,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- WhatsApp message templates
CREATE TABLE public.whatsapp_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    event_type public.webhook_event_type NOT NULL,
    template_name TEXT NOT NULL,
    template_content TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, event_type, template_name)
);

-- 3. INDEXES
CREATE INDEX idx_webhook_configs_company_id ON public.webhook_configs(company_id);
CREATE INDEX idx_webhook_events_company_id ON public.webhook_events(company_id);
CREATE INDEX idx_webhook_events_status ON public.webhook_events(status);
CREATE INDEX idx_webhook_events_event_type ON public.webhook_events(event_type);
CREATE INDEX idx_webhook_events_lead_id ON public.webhook_events(lead_id);
CREATE INDEX idx_whatsapp_messages_webhook_event_id ON public.whatsapp_messages(webhook_event_id);
CREATE INDEX idx_whatsapp_messages_status ON public.whatsapp_messages(status);
CREATE INDEX idx_whatsapp_templates_company_id ON public.whatsapp_templates(company_id);

-- 4. FUNCTIONS - Business logic

-- Function to automatically create lead from webhook event
CREATE OR REPLACE FUNCTION public.create_lead_from_webhook_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    new_lead_id UUID;
    seller_id_val UUID;
BEGIN
    -- Only create lead for specific event types and if not already created
    IF NEW.event_type IN ('cart_abandoned', 'payment_failed') AND NEW.lead_id IS NULL THEN
        -- Get a seller from the company (simple round-robin, first available)
        SELECT s.id INTO seller_id_val
        FROM public.sellers s
        WHERE s.company_id = NEW.company_id
        AND s.is_active = true
        LIMIT 1;

        -- Create lead
        INSERT INTO public.leads (
            company_id,
            name,
            email,
            phone,
            lead_source,
            lead_status,
            estimated_value,
            seller_id,
            sla_status
        ) VALUES (
            NEW.company_id,
            COALESCE(NEW.customer_name, 'E-commerce Lead'),
            NEW.customer_email,
            NEW.customer_phone,
            'website'::public.lead_source,
            'new'::public.lead_status,
            NEW.cart_value,
            seller_id_val,
            'on_time'::public.sla_status
        )
        RETURNING id INTO new_lead_id;

        -- Update webhook event with lead_id
        NEW.lead_id := new_lead_id;
    END IF;

    RETURN NEW;
END;
$func$;

-- Function to trigger WhatsApp message based on event type
CREATE OR REPLACE FUNCTION public.trigger_whatsapp_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    template_record RECORD;
    message_content_val TEXT;
BEGIN
    -- Get active template for this event type
    SELECT * INTO template_record
    FROM public.whatsapp_templates
    WHERE company_id = NEW.company_id
    AND event_type = NEW.event_type
    AND is_active = true
    LIMIT 1;

    -- If template exists, create WhatsApp message
    IF template_record.id IS NOT NULL AND NEW.customer_phone IS NOT NULL THEN
        -- Simple variable replacement (in production, use proper templating)
        message_content_val := template_record.template_content;
        message_content_val := REPLACE(message_content_val, '{{customer_name}}', COALESCE(NEW.customer_name, 'Customer'));
        message_content_val := REPLACE(message_content_val, '{{cart_value}}', COALESCE(NEW.cart_value::TEXT, '0'));
        message_content_val := REPLACE(message_content_val, '{{order_id}}', COALESCE(NEW.order_id, 'N/A'));

        -- Create WhatsApp message
        INSERT INTO public.whatsapp_messages (
            webhook_event_id,
            company_id,
            lead_id,
            phone_number,
            message_template,
            message_content,
            status
        ) VALUES (
            NEW.id,
            NEW.company_id,
            NEW.lead_id,
            NEW.customer_phone,
            template_record.template_name,
            message_content_val,
            'queued'::public.whatsapp_message_status
        );
    END IF;

    RETURN NEW;
END;
$func$;

-- Function to update webhook event status
CREATE OR REPLACE FUNCTION public.update_webhook_event_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $func$
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    IF NEW.status = 'completed'::public.webhook_status AND OLD.status != 'completed'::public.webhook_status THEN
        NEW.processed_at := CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$func$;

-- 5. TRIGGERS
CREATE TRIGGER on_webhook_event_create_lead
    BEFORE INSERT ON public.webhook_events
    FOR EACH ROW
    EXECUTE FUNCTION public.create_lead_from_webhook_event();

CREATE TRIGGER on_webhook_event_trigger_whatsapp
    AFTER INSERT ON public.webhook_events
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_whatsapp_message();

CREATE TRIGGER on_webhook_event_update
    BEFORE UPDATE ON public.webhook_events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_webhook_event_timestamp();

CREATE TRIGGER on_webhook_config_update
    BEFORE UPDATE ON public.webhook_configs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_whatsapp_message_update
    BEFORE UPDATE ON public.whatsapp_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_whatsapp_template_update
    BEFORE UPDATE ON public.whatsapp_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 6. RLS SETUP
ALTER TABLE public.webhook_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES - Company-scoped access

CREATE POLICY "company_users_manage_webhook_configs"
ON public.webhook_configs
FOR ALL
TO authenticated
USING (
    company_id IN (
        SELECT company_id FROM public.user_profiles
        WHERE id = auth.uid()
    )
)
WITH CHECK (
    company_id IN (
        SELECT company_id FROM public.user_profiles
        WHERE id = auth.uid()
    )
);

CREATE POLICY "company_users_view_webhook_events"
ON public.webhook_events
FOR SELECT
TO authenticated
USING (
    company_id IN (
        SELECT company_id FROM public.user_profiles
        WHERE id = auth.uid()
    )
);

CREATE POLICY "company_users_view_whatsapp_messages"
ON public.whatsapp_messages
FOR SELECT
TO authenticated
USING (
    company_id IN (
        SELECT company_id FROM public.user_profiles
        WHERE id = auth.uid()
    )
);

CREATE POLICY "company_users_manage_whatsapp_templates"
ON public.whatsapp_templates
FOR ALL
TO authenticated
USING (
    company_id IN (
        SELECT company_id FROM public.user_profiles
        WHERE id = auth.uid()
    )
)
WITH CHECK (
    company_id IN (
        SELECT company_id FROM public.user_profiles
        WHERE id = auth.uid()
    )
);

-- 8. MOCK DATA - Sample webhook configurations and templates
DO $$
DECLARE
    company_id_val UUID;
BEGIN
    -- Get first company
    SELECT id INTO company_id_val FROM public.companies LIMIT 1;

    IF company_id_val IS NOT NULL THEN
        -- Create webhook configuration
        INSERT INTO public.webhook_configs (
            company_id,
            endpoint_url,
            secret_key,
            is_active,
            events_enabled
        ) VALUES (
            company_id_val,
            'https://api.example.com/webhooks/ecommerce',
            'sk_test_' || substr(md5(random()::text), 1, 32),
            true,
            ARRAY['cart_abandoned', 'payment_failed', 'sale_completed']::public.webhook_event_type[]
        );

        -- Create WhatsApp message templates
        INSERT INTO public.whatsapp_templates (
            company_id,
            event_type,
            template_name,
            template_content,
            variables,
            is_active
        ) VALUES
        (
            company_id_val,
            'cart_abandoned'::public.webhook_event_type,
            'cart_recovery',
            'Hi {{customer_name}}! We noticed you left items worth ${{cart_value}} in your cart. Complete your purchase now and get 10% off with code COMEBACK10!',
            '["customer_name", "cart_value"]'::JSONB,
            true
        ),
        (
            company_id_val,
            'payment_failed'::public.webhook_event_type,
            'payment_retry',
            'Hello {{customer_name}}, your payment for order {{order_id}} could not be processed. Please update your payment method to complete your purchase.',
            '["customer_name", "order_id"]'::JSONB,
            true
        ),
        (
            company_id_val,
            'sale_completed'::public.webhook_event_type,
            'order_confirmation',
            'Thank you {{customer_name}}! Your order {{order_id}} for ${{cart_value}} has been confirmed. We will send tracking details soon.',
            '["customer_name", "order_id", "cart_value"]'::JSONB,
            true
        );

        -- Create sample webhook events
        INSERT INTO public.webhook_events (
            company_id,
            event_type,
            status,
            payload,
            customer_email,
            customer_phone,
            customer_name,
            cart_value,
            order_id
        ) VALUES
        (
            company_id_val,
            'cart_abandoned'::public.webhook_event_type,
            'completed'::public.webhook_status,
            '{"cart_id": "cart_123", "items": [{"id": "prod_1", "name": "Product A", "price": 49.99}]}'::JSONB,
            'customer1@example.com',
            '+1234567890',
            'John Doe',
            49.99,
            NULL
        ),
        (
            company_id_val,
            'payment_failed'::public.webhook_event_type,
            'completed'::public.webhook_status,
            '{"order_id": "order_456", "error": "insufficient_funds"}'::JSONB,
            'customer2@example.com',
            '+1234567891',
            'Jane Smith',
            89.99,
            'order_456'
        );
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON TABLE public.webhook_configs IS 'E-commerce webhook endpoint configurations per company';
COMMENT ON TABLE public.webhook_events IS 'Logs of all webhook events received from e-commerce platforms';
COMMENT ON TABLE public.whatsapp_messages IS 'WhatsApp messages triggered by webhook events';
COMMENT ON TABLE public.whatsapp_templates IS 'WhatsApp message templates for different event types';