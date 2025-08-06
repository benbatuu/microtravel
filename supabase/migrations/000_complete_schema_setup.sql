-- Complete Supabase Database Schema Setup
-- This migration creates all necessary tables, indexes, policies, and functions
-- for the SaaS platform transformation
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- ============================================================================
-- CORE USER PROFILES TABLE
-- ============================================================================
-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    bio TEXT,
    website VARCHAR(255),
    location VARCHAR(255),
    date_of_birth DATE,
    phone VARCHAR(20),
    -- Subscription related fields
    subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (
        subscription_tier IN ('free', 'explorer', 'traveler', 'enterprise')
    ),
    subscription_status VARCHAR(20) DEFAULT 'active' CHECK (
        subscription_status IN (
            'active',
            'canceled',
            'past_due',
            'unpaid',
            'incomplete'
        )
    ),
    stripe_customer_id VARCHAR(255) UNIQUE,
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    storage_used BIGINT DEFAULT 0,
    -- Admin related fields
    is_admin BOOLEAN DEFAULT FALSE,
    admin_role VARCHAR(20) DEFAULT NULL CHECK (
        admin_role IN ('super_admin', 'admin', 'moderator', 'support')
    ),
    admin_permissions JSONB DEFAULT '[]'::jsonb,
    last_admin_login TIMESTAMP WITH TIME ZONE,
    -- Preferences
    language VARCHAR(10) DEFAULT 'en',
    theme VARCHAR(10) DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    timezone VARCHAR(50) DEFAULT 'UTC',
    email_notifications BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ==
== == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == -- SUBSCRIPTION MANAGEMENT TABLES
-- ============================================================================
-- Subscription tiers configuration
CREATE TABLE IF NOT EXISTS subscription_tiers (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    price_monthly INTEGER NOT NULL,
    -- Price in cents
    price_yearly INTEGER NOT NULL,
    -- Price in cents
    features JSONB NOT NULL,
    limits JSONB NOT NULL,
    stripe_product_id VARCHAR(255),
    stripe_price_id_monthly VARCHAR(255),
    stripe_price_id_yearly VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- User subscriptions tracking
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    tier VARCHAR(20) NOT NULL REFERENCES subscription_tiers(id),
    status VARCHAR(20) NOT NULL CHECK (
        status IN (
            'active',
            'canceled',
            'past_due',
            'unpaid',
            'incomplete',
            'trialing'
        )
    ),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Payment history tracking
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE
    SET NULL,
        stripe_payment_intent_id VARCHAR(255),
        stripe_invoice_id VARCHAR(255),
        amount INTEGER NOT NULL,
        -- Amount in cents
        currency VARCHAR(3) DEFAULT 'usd',
        status VARCHAR(20) NOT NULL CHECK (
            status IN (
                'succeeded',
                'failed',
                'pending',
                'canceled',
                'refunded'
            )
        ),
        description TEXT,
        receipt_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Usage tracking for billing and analytics
CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    feature VARCHAR(50) NOT NULL,
    usage_count INTEGER DEFAULT 1,
    metadata JSONB,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ==
== == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == -- IMAGE METADATA AND STORAGE
-- ============================================================================
-- Comprehensive image metadata table
CREATE TABLE IF NOT EXISTS image_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    width INTEGER,
    height INTEGER,
    storage_path VARCHAR(500) NOT NULL,
    -- Archive functionality
    archived BOOLEAN DEFAULT FALSE,
    archived_at TIMESTAMP WITH TIME ZONE,
    -- Metadata
    tags TEXT [],
    description TEXT,
    location VARCHAR(255),
    camera_make VARCHAR(100),
    camera_model VARCHAR(100),
    camera_settings JSONB,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ============================================================================
-- ADMIN AND MONITORING TABLES
-- ============================================================================
-- Admin sessions for enhanced security
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Admin audit log
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE
    SET NULL,
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50),
        resource_id VARCHAR(255),
        details JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Webhook events tracking
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processing_attempts INTEGER DEFAULT 0,
    last_processing_attempt TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    event_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- System al
erts
and monitoring CREATE TABLE IF NOT EXISTS system_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (
        severity IN ('low', 'medium', 'high', 'critical')
    ),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE
    SET NULL,
        resolved_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Support tickets
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE
    SET NULL,
        subject VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (
            status IN ('open', 'in_progress', 'resolved', 'closed')
        ),
        priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (
            priority IN ('low', 'medium', 'high', 'urgent')
        ),
        assigned_to UUID REFERENCES auth.users(id) ON DELETE
    SET NULL,
        category VARCHAR(50),
        tags TEXT [],
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Support ticket messages
CREATE TABLE IF NOT EXISTS support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE
    SET NULL,
        message TEXT NOT NULL,
        is_internal BOOLEAN DEFAULT FALSE,
        attachments JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ===
== == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == = -- INDEXES FOR PERFORMANCE
-- ============================================================================
-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier ON subscriptions(tier);
-- Payment history indexes
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON payment_history(created_at);
-- Usage tracking indexes
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_date ON usage_tracking(date);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_feature ON usage_tracking(feature);
-- Image metadata indexes
CREATE INDEX IF NOT EXISTS idx_image_metadata_user_id ON image_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_image_metadata_archived ON image_metadata(user_id, archived);
CREATE INDEX IF NOT EXISTS idx_image_metadata_tags ON image_metadata USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_image_metadata_upload_date ON image_metadata(upload_date);
-- Admin and monitoring indexes
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_user_id ON admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_system_alerts_resolved ON system_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON system_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
-- ======
== == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == -- FUNCTIONS AND TRIGGERS
-- ============================================================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';
-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE
UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_tiers_updated_at BEFORE
UPDATE ON subscription_tiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE
UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_image_metadata_updated_at BEFORE
UPDATE ON image_metadata FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_sessions_updated_at BEFORE
UPDATE ON admin_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhook_events_updated_at BEFORE
UPDATE ON webhook_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_alerts_updated_at BEFORE
UPDATE ON system_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE
UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Function to update storage usage
CREATE OR REPLACE FUNCTION update_storage_usage() RETURNS TRIGGER AS $$ BEGIN IF TG_OP = 'INSERT' THEN
UPDATE profiles
SET storage_used = storage_used + NEW.size_bytes,
    updated_at = NOW()
WHERE id = NEW.user_id;
RETURN NEW;
ELSIF TG_OP = 'DELETE' THEN
UPDATE profiles
SET storage_used = GREATEST(0, storage_used - OLD.size_bytes),
    updated_at = NOW()
WHERE id = OLD.user_id;
RETURN OLD;
END IF;
RETURN NULL;
END;
$$ LANGUAGE plpgsql;
- - Apply storage usage triggers CREATE TRIGGER trigger_update_storage_on_insert
AFTER
INSERT ON image_metadata FOR EACH ROW EXECUTE FUNCTION update_storage_usage();
CREATE TRIGGER trigger_update_storage_on_delete
AFTER DELETE ON image_metadata FOR EACH ROW EXECUTE FUNCTION update_storage_usage();
-- Function to generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number() RETURNS TEXT AS $$
DECLARE ticket_num TEXT;
counter INTEGER;
BEGIN ticket_num := 'TK' || TO_CHAR(NOW(), 'YYYYMMDD');
SELECT COUNT(*) + 1 INTO counter
FROM support_tickets
WHERE DATE(created_at) = CURRENT_DATE;
ticket_num := ticket_num || LPAD(counter::TEXT, 4, '0');
RETURN ticket_num;
END;
$$ LANGUAGE plpgsql;
-- Function to set ticket number
CREATE OR REPLACE FUNCTION set_ticket_number() RETURNS TRIGGER AS $$ BEGIN IF NEW.ticket_number IS NULL
    OR NEW.ticket_number = '' THEN NEW.ticket_number := generate_ticket_number();
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER set_support_ticket_number BEFORE
INSERT ON support_tickets FOR EACH ROW EXECUTE FUNCTION set_ticket_number();
-- Function to get user storage quota
CREATE OR REPLACE FUNCTION get_user_storage_quota(user_uuid UUID) RETURNS TABLE (
        used_bytes BIGINT,
        limit_bytes BIGINT,
        percentage NUMERIC,
        can_upload BOOLEAN,
        tier TEXT
    ) AS $$
DECLARE user_profile RECORD;
tier_limits RECORD;
BEGIN
SELECT subscription_tier,
    storage_used INTO user_profile
FROM profiles
WHERE id = user_uuid;
IF NOT FOUND THEN RETURN QUERY
SELECT 0::BIGINT,
    0::BIGINT,
    100::NUMERIC,
    FALSE,
    'unknown'::TEXT;
RETURN;
END IF;
SELECT limits->>'storage' INTO tier_limits
FROM subscription_tiers
WHERE id = user_profile.subscription_tier;
IF tier_limits IS NULL
OR tier_limits::BIGINT = -1 THEN RETURN QUERY
SELECT user_profile.storage_used,
    -1::BIGINT,
    0::NUMERIC,
    TRUE,
    user_profile.subscription_tier;
ELSE RETURN QUERY
SELECT user_profile.storage_used,
    tier_limits::BIGINT,
    CASE
        WHEN tier_limits::BIGINT > 0 THEN ROUND(
            (
                user_profile.storage_used::NUMERIC / tier_limits::BIGINT
            ) * 100,
            2
        )
        ELSE 100::NUMERIC
    END,
    user_profile.storage_used < tier_limits::BIGINT,
    user_profile.subscription_tier;
END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
- - == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == -- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;
-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles FOR
SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR
UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role can manage all profiles" ON profiles FOR ALL USING (auth.role() = 'service_role');
-- Subscription tiers policies (public read)
CREATE POLICY "Anyone can view subscription tiers" ON subscription_tiers FOR
SELECT USING (true);
CREATE POLICY "Service role can manage subscription tiers" ON subscription_tiers FOR ALL USING (auth.role() = 'service_role');
-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON subscriptions FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all subscriptions" ON subscriptions FOR ALL USING (auth.role() = 'service_role');
-- Payment history policies
CREATE POLICY "Users can view their own payment history" ON payment_history FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all payment history" ON payment_history FOR ALL USING (auth.role() = 'service_role');
-- Usage tracking policies
CREATE POLICY "Users can view their own usage tracking" ON usage_tracking FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all usage tracking" ON usage_tracking FOR ALL USING (auth.role() = 'service_role');
- - Image metadata policies CREATE POLICY "Users can view their own image metadata" ON image_metadata FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own image metadata" ON image_metadata FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own image metadata" ON image_metadata FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own image metadata" ON image_metadata FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all image metadata" ON image_metadata FOR ALL USING (auth.role() = 'service_role');
-- Admin sessions policies
CREATE POLICY "Admins can view their own sessions" ON admin_sessions FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all admin sessions" ON admin_sessions FOR ALL USING (auth.role() = 'service_role');
-- Admin audit log policies
CREATE POLICY "Admins can view audit logs" ON admin_audit_log FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE profiles.id = auth.uid()
                AND profiles.is_admin = TRUE
        )
    );
CREATE POLICY "Service role can manage audit logs" ON admin_audit_log FOR ALL USING (auth.role() = 'service_role');
-- Webhook events policies
CREATE POLICY "Admins can view webhook events" ON webhook_events FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE profiles.id = auth.uid()
                AND profiles.is_admin = TRUE
        )
    );
CREATE POLICY "Service role can manage webhook events" ON webhook_events FOR ALL USING (auth.role() = 'service_role');
-- System alerts policies
CREATE POLICY "Admins can view and update system alerts" ON system_alerts FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE profiles.id = auth.uid()
            AND profiles.is_admin = TRUE
    )
);
CREATE POLICY "Service role can manage system alerts" ON system_alerts FOR ALL USING (auth.role() = 'service_role');
-- Suppor
t tickets policies CREATE POLICY "Users can view their own tickets" ON support_tickets FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create tickets" ON support_tickets FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view and manage all tickets" ON support_tickets FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE profiles.id = auth.uid()
            AND profiles.is_admin = TRUE
    )
);
CREATE POLICY "Service role can manage all tickets" ON support_tickets FOR ALL USING (auth.role() = 'service_role');
-- Support ticket messages policies
CREATE POLICY "Users can view messages for their tickets" ON support_ticket_messages FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM support_tickets
            WHERE support_tickets.id = ticket_id
                AND support_tickets.user_id = auth.uid()
        )
        AND is_internal = FALSE
    );
CREATE POLICY "Users can create messages for their tickets" ON support_ticket_messages FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM support_tickets
            WHERE support_tickets.id = ticket_id
                AND support_tickets.user_id = auth.uid()
        )
        AND sender_id = auth.uid()
        AND is_internal = FALSE
    );
CREATE POLICY "Admins can view and create all ticket messages" ON support_ticket_messages FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE profiles.id = auth.uid()
            AND profiles.is_admin = TRUE
    )
);
CREATE POLICY "Service role can manage all ticket messages" ON support_ticket_messages FOR ALL USING (auth.role() = 'service_role');
-- ========
== == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == == -- STORAGE BUCKET SETUP
-- ============================================================================
-- Create storage bucket for images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true) ON CONFLICT (id) DO NOTHING;
-- Create storage policies for images bucket
CREATE POLICY "Users can upload their own images" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'images'
        AND auth.uid()::text = (storage.foldername(name)) [1]
    );
CREATE POLICY "Users can view their own images" ON storage.objects FOR
SELECT USING (
        bucket_id = 'images'
        AND auth.uid()::text = (storage.foldername(name)) [1]
    );
CREATE POLICY "Users can update their own images" ON storage.objects FOR
UPDATE USING (
        bucket_id = 'images'
        AND auth.uid()::text = (storage.foldername(name)) [1]
    );
CREATE POLICY "Users can delete their own images" ON storage.objects FOR DELETE USING (
    bucket_id = 'images'
    AND auth.uid()::text = (storage.foldername(name)) [1]
);
-- Allow public access to images (for viewing)
CREATE POLICY "Public can view images" ON storage.objects FOR
SELECT USING (bucket_id = 'images');
-- ============================================================================
-- DEFAULT DATA SETUP
-- ============================================================================
-- Insert default subscription tiers
INSERT INTO subscription_tiers (
        id,
        name,
        description,
        price_monthly,
        price_yearly,
        features,
        limits
    )
VALUES (
        'free',
        'Free',
        'Perfect for getting started with travel sharing',
        0,
        0,
        '["Basic experience sharing", "5 experiences", "Community support"]'::jsonb,
        '{"experiences": 5, "storage": 52428800, "exports": 1}'::jsonb
    ),
    (
        'explorer',
        'Explorer',
        'For active travelers who want more features',
        999,
        9990,
        '["Advanced features", "50 experiences", "Email support", "Export capabilities"]'::jsonb,
        '{"experiences": 50, "storage": 524288000, "exports": 10}'::jsonb
    ),
    (
        'traveler',
        'Traveler',
        'For serious travelers and content creators',
        1999,
        19990,
        '["Premium features", "Unlimited experiences", "Priority support", "Advanced analytics"]'::jsonb,
        '{"experiences": -1, "storage": 5368709120, "exports": -1}'::jsonb
    ),
    (
        'enterprise',
        'Enterprise',
        'For travel businesses and organizations',
        4999,
        49990,
        '["All features", "Custom limits", "Dedicated support", "API access", "White-label options"]'::jsonb,
        '{"experiences": -1, "storage": -1, "exports": -1}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;
-- Grant execute permission on functions
GRANT EXECUTE ON FUNCTION get_user_storage_quota(UUID) TO authenticated;
-- Migration completed successfully
SELECT 'Database schema setup completed successfully' as status;