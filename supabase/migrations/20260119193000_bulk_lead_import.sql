-- Location: supabase/migrations/20260119193000_bulk_lead_import.sql
-- Schema Analysis: Extending existing CRM schema with bulk import functionality
-- Integration Type: Addition - New table and function for bulk lead import
-- Dependencies: leads, companies, sellers, tags, lead_automations

-- 1. Create ENUM type for import status
CREATE TYPE public.import_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'partially_completed');

-- 2. Create lead_import_jobs table to track bulk imports
CREATE TABLE public.lead_import_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    total_rows INTEGER NOT NULL DEFAULT 0,
    successful_rows INTEGER NOT NULL DEFAULT 0,
    failed_rows INTEGER NOT NULL DEFAULT 0,
    status public.import_status DEFAULT 'pending'::public.import_status,
    error_details JSONB,
    automation_id UUID REFERENCES public.lead_automations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

-- 3. Create indexes for performance
CREATE INDEX idx_import_jobs_company_id ON public.lead_import_jobs(company_id);
CREATE INDEX idx_import_jobs_user_id ON public.lead_import_jobs(user_id);
CREATE INDEX idx_import_jobs_status ON public.lead_import_jobs(status);
CREATE INDEX idx_import_jobs_created_at ON public.lead_import_jobs(created_at DESC);

-- 4. Create function to validate and bulk insert leads
CREATE OR REPLACE FUNCTION public.bulk_import_leads(
    p_company_id UUID,
    p_user_id UUID,
    p_leads JSONB,
    p_automation_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    v_import_job_id UUID;
    v_lead JSONB;
    v_inserted_count INTEGER := 0;
    v_failed_count INTEGER := 0;
    v_errors JSONB := '[]'::JSONB;
    v_lead_id UUID;
    v_seller_id UUID;
    v_lead_source public.lead_source;
    v_sector public.sector_type;
BEGIN
    -- Create import job
    INSERT INTO public.lead_import_jobs (company_id, user_id, total_rows, filename, automation_id, status)
    VALUES (p_company_id, p_user_id, jsonb_array_length(p_leads), 'import.csv', p_automation_id, 'processing'::public.import_status)
    RETURNING id INTO v_import_job_id;

    -- Process each lead
    FOR v_lead IN SELECT * FROM jsonb_array_elements(p_leads)
    LOOP
        BEGIN
            -- Validate and get seller_id if email provided
            v_seller_id := NULL;
            IF v_lead->>'seller_email' IS NOT NULL THEN
                SELECT s.id INTO v_seller_id
                FROM public.sellers s
                WHERE s.email = v_lead->>'seller_email'
                AND s.company_id = p_company_id
                LIMIT 1;
            END IF;

            -- Validate and cast lead_source
            v_lead_source := CASE v_lead->>'lead_source'
                WHEN 'website' THEN 'website'::public.lead_source
                WHEN 'referral' THEN 'referral'::public.lead_source
                WHEN 'social_media' THEN 'social_media'::public.lead_source
                WHEN 'email_campaign' THEN 'email_campaign'::public.lead_source
                WHEN 'phone' THEN 'phone'::public.lead_source
                ELSE 'other'::public.lead_source
            END;

            -- Validate and cast sector
            v_sector := CASE v_lead->>'sector'
                WHEN 'retail' THEN 'retail'::public.sector_type
                WHEN 'technology' THEN 'technology'::public.sector_type
                WHEN 'healthcare' THEN 'healthcare'::public.sector_type
                WHEN 'finance' THEN 'finance'::public.sector_type
                WHEN 'manufacturing' THEN 'manufacturing'::public.sector_type
                WHEN 'services' THEN 'services'::public.sector_type
                ELSE 'other'::public.sector_type
            END;

            -- Insert lead
            INSERT INTO public.leads (
                company_id,
                name,
                email,
                phone,
                company_name,
                position,
                lead_source,
                sector,
                estimated_value,
                seller_id
            ) VALUES (
                p_company_id,
                v_lead->>'name',
                v_lead->>'email',
                v_lead->>'phone',
                v_lead->>'company_name',
                v_lead->>'position',
                v_lead_source,
                v_sector,
                COALESCE((v_lead->>'estimated_value')::NUMERIC, 0),
                v_seller_id
            ) RETURNING id INTO v_lead_id;

            -- Handle tags if provided
            IF v_lead->>'tags' IS NOT NULL THEN
                INSERT INTO public.lead_tags (lead_id, tag_id)
                SELECT v_lead_id, t.id
                FROM public.tags t
                WHERE t.name = ANY(string_to_array(v_lead->>'tags', ','))
                AND t.company_id = p_company_id
                ON CONFLICT DO NOTHING;
            END IF;

            v_inserted_count := v_inserted_count + 1;

        EXCEPTION WHEN OTHERS THEN
            v_failed_count := v_failed_count + 1;
            v_errors := v_errors || jsonb_build_object(
                'row', v_failed_count + v_inserted_count,
                'name', v_lead->>'name',
                'error', SQLERRM
            );
        END;
    END LOOP;

    -- Update import job with results
    UPDATE public.lead_import_jobs
    SET 
        successful_rows = v_inserted_count,
        failed_rows = v_failed_count,
        status = CASE 
            WHEN v_failed_count = 0 THEN 'completed'::public.import_status
            WHEN v_inserted_count = 0 THEN 'failed'::public.import_status
            ELSE 'partially_completed'::public.import_status
        END,
        error_details = v_errors,
        completed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = v_import_job_id;

    -- Return summary
    RETURN jsonb_build_object(
        'import_job_id', v_import_job_id,
        'total_rows', jsonb_array_length(p_leads),
        'successful_rows', v_inserted_count,
        'failed_rows', v_failed_count,
        'errors', v_errors
    );
END;
$func$;

-- 5. Enable RLS
ALTER TABLE public.lead_import_jobs ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies - Pattern 2: Simple User Ownership
CREATE POLICY "company_users_manage_import_jobs"
ON public.lead_import_jobs
FOR ALL
TO authenticated
USING (company_id IN (
    SELECT up.company_id
    FROM public.user_profiles up
    WHERE up.id = auth.uid()
))
WITH CHECK (company_id IN (
    SELECT up.company_id
    FROM public.user_profiles up
    WHERE up.id = auth.uid()
));

-- 7. Create trigger for updated_at
CREATE TRIGGER update_import_jobs_updated_at
    BEFORE UPDATE ON public.lead_import_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();