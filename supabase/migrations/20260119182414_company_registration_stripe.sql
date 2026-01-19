-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- SUBSCRIPTION PLANS TABLE
-- =============================================
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'BRL',
    billing_period TEXT CHECK (billing_period IN ('monthly', 'yearly', 'lifetime')),
    features JSONB,
    max_users INTEGER,
    max_leads INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    stripe_price_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- USER PROFILES TABLE
-- =============================================
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'manager', 'seller')),
    company_id UUID,
    stripe_customer_id TEXT UNIQUE,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- COMPANIES TABLE
-- =============================================
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    legal_name TEXT,
    document_number TEXT UNIQUE, -- CNPJ
    email TEXT,
    phone TEXT,
    website TEXT,
    industry TEXT,
    size TEXT CHECK (size IN ('small', 'medium', 'large', 'enterprise')),
    address JSONB,
    logo_url TEXT,
    subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'suspended', 'expired')),
    trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SUBSCRIPTIONS TABLE
-- =============================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled', 'suspended', 'expired')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'succeeded', 'failed', 'cancelled')),
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    payment_intent_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'BRL',
    billing_period TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PAYMENT TRANSACTIONS TABLE
-- =============================================
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id),
    payment_intent_id TEXT,
    stripe_charge_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'BRL',
    status TEXT NOT NULL,
    transaction_type TEXT DEFAULT 'subscription' CHECK (transaction_type IN ('subscription', 'upgrade', 'renewal', 'refund')),
    payment_method TEXT,
    gateway TEXT DEFAULT 'stripe',
    gateway_transaction_id TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_user_profiles_company ON user_profiles(company_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_companies_owner ON companies(owner_id);
CREATE INDEX idx_companies_status ON companies(subscription_status);
CREATE INDEX idx_subscriptions_company ON subscriptions(company_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_payment_transactions_subscription ON payment_transactions(subscription_id);
CREATE INDEX idx_payment_transactions_company ON payment_transactions(company_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile" 
    ON user_profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON user_profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON user_profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Companies Policies
CREATE POLICY "Company owners can view their company" 
    ON companies FOR SELECT 
    USING (
        owner_id = auth.uid() OR 
        id IN (SELECT company_id FROM user_profiles WHERE id = auth.uid())
    );

CREATE POLICY "Company owners can update their company" 
    ON companies FOR UPDATE 
    USING (owner_id = auth.uid());

CREATE POLICY "Anyone can insert companies during registration" 
    ON companies FOR INSERT 
    WITH CHECK (true);

-- Subscriptions Policies
CREATE POLICY "Company members can view their subscriptions" 
    ON subscriptions FOR SELECT 
    USING (
        company_id IN (
            SELECT company_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- Payment Transactions Policies
CREATE POLICY "Company members can view their transactions" 
    ON payment_transactions FOR SELECT 
    USING (
        company_id IN (
            SELECT company_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- Subscription Plans (Public Read)
CREATE POLICY "Anyone can view active plans" 
    ON subscription_plans FOR SELECT 
    USING (is_active = true);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update company ownership
CREATE OR REPLACE FUNCTION link_user_to_company(user_uuid UUID, comp_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE user_profiles 
    SET company_id = comp_id 
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle subscription status changes
CREATE OR REPLACE FUNCTION update_company_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE companies 
    SET subscription_status = NEW.status,
        updated_at = NOW()
    WHERE id = NEW.company_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscription_status_change
AFTER UPDATE OF status ON subscriptions
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION update_company_subscription_status();

-- =============================================
-- SEED DATA - SUBSCRIPTION PLANS
-- =============================================
INSERT INTO subscription_plans (name, description, price, currency, billing_period, features, max_users, max_leads, stripe_price_id) VALUES
('Starter', 'Perfect for small teams getting started', 99.00, 'BRL', 'monthly', 
 '{"crm": true, "leads": "500/month", "users": 3, "integrations": "basic", "support": "email"}', 
 3, 500, null),

('Professional', 'Best for growing businesses', 299.00, 'BRL', 'monthly',
 '{"crm": true, "leads": "2000/month", "users": 10, "integrations": "advanced", "support": "priority", "analytics": true}',
 10, 2000, null),

('Enterprise', 'For large organizations', 999.00, 'BRL', 'monthly',
 '{"crm": true, "leads": "unlimited", "users": "unlimited", "integrations": "custom", "support": "24/7", "analytics": true, "custom_features": true}',
 null, null, null);

-- =============================================
-- UPDATED AT TRIGGERS
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at 
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at 
BEFORE UPDATE ON companies
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at 
BEFORE UPDATE ON subscription_plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();