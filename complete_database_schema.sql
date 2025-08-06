-- Complete Supabase Database Schema for SaaS Platform
-- This file contains all necessary tables, indexes, policies, and functions
-- Run this after creating a fresh Supabase project to set up the complete database
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
-- ============================================================================
-- SUBSCRIPTION MANAGEMENT TABLES
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
-- ============================================================================
-- TRAVEL EXPERIENCES TABLES
-- ============================================================================
-- Main experiences table
CREATE TABLE IF NOT EXISTS experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    country VARCHAR(100),
    city VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    start_date DATE,
    end_date DATE,
    duration_days INTEGER,
    budget_amount DECIMAL(10, 2),
    budget_currency VARCHAR(3) DEFAULT 'USD',
    rating INTEGER CHECK (
        rating >= 1
        AND rating <= 5
    ),
    is_public BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    tags TEXT [],
    category VARCHAR(50),
    difficulty_level VARCHAR(20) CHECK (
        difficulty_level IN ('easy', 'moderate', 'challenging', 'extreme')
    ),
    season VARCHAR(20) CHECK (
        season IN (
            'spring',
            'summer',
            'autumn',
            'winter',
            'year_round'
        )
    ),
    group_size INTEGER,
    transportation_methods TEXT [],
    accommodation_types TEXT [],
    highlights TEXT [],
    tips TEXT [],
    warnings TEXT [],
    packing_list TEXT [],
    weather_info JSONB,
    local_customs JSONB,
    language_info JSONB,
    currency_info JSONB,
    visa_requirements TEXT,
    health_requirements TEXT,
    emergency_contacts JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Experience images/media
CREATE TABLE IF NOT EXISTS experience_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    media_type VARCHAR(20) NOT NULL CHECK (
        media_type IN ('image', 'video', 'audio', 'document')
    ),
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    width INTEGER,
    height INTEGER,
    duration_seconds INTEGER,
    -- For video/audio
    caption TEXT,
    alt_text TEXT,
    is_cover BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Experience likes/favorites
CREATE TABLE IF NOT EXISTS experience_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(experience_id, user_id)
);
-- Experience comments
CREATE TABLE IF NOT EXISTS experience_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    parent_comment_id UUID REFERENCES experience_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Experience views tracking
CREATE TABLE IF NOT EXISTS experience_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE
    SET NULL,
        ip_address INET,
        user_agent TEXT,
        referrer TEXT,
        viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ============================================================================
-- IMAGE METADATA AND STORAGE
-- ============================================================================
-- Comprehensive image metadata table
CREATE TABLE IF NOT EXISTS image_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    experience_id UUID REFERENCES experiences(id) ON DELETE CASCADE,
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
    exif_data JSONB,
    -- Processing status
    processing_status VARCHAR(20) DEFAULT 'pending' CHECK (
        processing_status IN ('pending', 'processing', 'completed', 'failed')
    ),
    thumbnail_generated BOOLEAN DEFAULT FALSE,
    optimized_versions JSONB,
    -- Store different size versions
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
-- System alerts and monitoring
CREATE TABLE IF NOT EXISTS system_alerts (
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
        priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
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
-- ============================================================================
-- ANALYTICS AND REPORTING TABLES
-- ============================================================================
-- User activity tracking
CREATE TABLE IF NOT EXISTS user_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Platform analytics
CREATE TABLE IF NOT EXISTS platform_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15, 4) NOT NULL,
    dimensions JSONB,
    date DATE NOT NULL,
    hour INTEGER CHECK (
        hour >= 0
        AND hour <= 23
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(metric_name, date, hour, dimensions)
);
-- ============================================================================
-- INDEXES FOR PERFORMANCE
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
-- Experiences indexes
CREATE INDEX IF NOT EXISTS idx_experiences_user_id ON experiences(user_id);
CREATE INDEX IF NOT EXISTS idx_experiences_is_public ON experiences(is_public);
CREATE INDEX IF NOT EXISTS idx_experiences_is_featured ON experiences(is_featured);
CREATE INDEX IF NOT EXISTS idx_experiences_location ON experiences(location);
CREATE INDEX IF NOT EXISTS idx_experiences_country ON experiences(country);
CREATE INDEX IF NOT EXISTS idx_experiences_category ON experiences(category);
CREATE INDEX IF NOT EXISTS idx_experiences_rating ON experiences(rating);
CREATE INDEX IF NOT EXISTS idx_experiences_created_at ON experiences(created_at);
CREATE INDEX IF NOT EXISTS idx_experiences_tags ON experiences USING GIN(tags);
-- Experience media indexes
CREATE INDEX IF NOT EXISTS idx_experience_media_experience_id ON experience_media(experience_id);
CREATE INDEX IF NOT EXISTS idx_experience_media_user_id ON experience_media(user_id);
CREATE INDEX IF NOT EXISTS idx_experience_media_is_cover ON experience_media(is_cover);
-- Experience likes indexes
CREATE INDEX IF NOT EXISTS idx_experience_likes_experience_id ON experience_likes(experience_id);
CREATE INDEX IF NOT EXISTS idx_experience_likes_user_id ON experience_likes(user_id);
-- Experience comments indexes
CREATE INDEX IF NOT EXISTS idx_experience_comments_experience_id ON experience_comments(experience_id);
CREATE INDEX IF NOT EXISTS idx_experience_comments_user_id ON experience_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_experience_comments_parent_comment_id ON experience_comments(parent_comment_id);
-- Image metadata indexes
CREATE INDEX IF NOT EXISTS idx_image_metadata_user_id ON image_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_image_metadata_experience_id ON image_metadata(experience_id);
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
-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at);
CREATE INDEX IF NOT EXISTS idx_platform_analytics_date ON platform_analytics(date);
CREATE INDEX IF NOT EXISTS idx_platform_analytics_metric_name ON platform_analytics(metric_name);
-- ============================================================================
-- FUNCTIONS AND TRIGGERS
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
CREATE TRIGGER update_experiences_updated_at BEFORE
UPDATE ON experiences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_experience_media_updated_at BEFORE
UPDATE ON experience_media FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_experience_comments_updated_at BEFORE
UPDATE ON experience_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
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
-- Apply storage usage triggers
CREATE TRIGGER trigger_update_storage_on_insert
AFTER
INSERT ON image_metadata FOR EACH ROW EXECUTE FUNCTION update_storage_usage();
CREATE TRIGGER trigger_update_storage_on_delete
AFTER DELETE ON image_metadata FOR EACH ROW EXECUTE FUNCTION update_storage_usage();
CREATE TRIGGER trigger_update_storage_on_media_insert
AFTER
INSERT ON experience_media FOR EACH ROW EXECUTE FUNCTION update_storage_usage();
CREATE TRIGGER trigger_update_storage_on_media_delete
AFTER DELETE ON experience_media FOR EACH ROW EXECUTE FUNCTION update_storage_usage();
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
-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_analytics ENABLE ROW LEVEL SECURITY;
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
-- Experiences policies
CREATE POLICY "Users can view public experiences" ON experiences FOR
SELECT USING (
        is_public = true
        OR auth.uid() = user_id
    );
CREATE POLICY "Users can manage their own experiences" ON experiences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all experiences" ON experiences FOR ALL USING (auth.role() = 'service_role');
-- Experience media policies
CREATE POLICY "Users can view media for accessible experiences" ON experience_media FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM experiences
            WHERE experiences.id = experience_id
                AND (
                    experiences.is_public = true
                    OR experiences.user_id = auth.uid()
                )
        )
    );
CREATE POLICY "Users can manage their own experience media" ON experience_media FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all experience media" ON experience_media FOR ALL USING (auth.role() = 'service_role');
-- Experience likes policies
CREATE POLICY "Users can view likes for accessible experiences" ON experience_likes FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM experiences
            WHERE experiences.id = experience_id
                AND (
                    experiences.is_public = true
                    OR experiences.user_id = auth.uid()
                )
        )
    );
CREATE POLICY "Users can manage their own likes" ON experience_likes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all likes" ON experience_likes FOR ALL USING (auth.role() = 'service_role');
-- Experience comments policies
CREATE POLICY "Users can view comments for accessible experiences" ON experience_comments FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM experiences
            WHERE experiences.id = experience_id
                AND (
                    experiences.is_public = true
                    OR experiences.user_id = auth.uid()
                )
        )
    );
CREATE POLICY "Users can manage their own comments" ON experience_comments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all comments" ON experience_comments FOR ALL USING (auth.role() = 'service_role');
-- Image metadata policies
CREATE POLICY "Users can view their own image metadata" ON image_metadata FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own image metadata" ON image_metadata FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all image metadata" ON image_metadata FOR ALL USING (auth.role() = 'service_role');
-- Admin policies (admin access only)
CREATE POLICY "Admins can view admin sessions" ON admin_sessions FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE profiles.id = auth.uid()
                AND profiles.is_admin = TRUE
        )
    );
CREATE POLICY "Service role can manage admin sessions" ON admin_sessions FOR ALL USING (auth.role() = 'service_role');
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
-- Support ticket policies
CREATE POLICY "Users can view their own tickets" ON support_tickets FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create tickets" ON support_tickets FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all tickets" ON support_tickets FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE profiles.id = auth.uid()
            AND profiles.is_admin = TRUE
    )
);
CREATE POLICY "Service role can manage all tickets" ON support_tickets FOR ALL USING (auth.role() = 'service_role');
-- ============================================================================
-- STORAGE BUCKETS AND POLICIES
-- ============================================================================
-- Create storage buckets
INSERT INTO storage.buckets (
        id,
        name,
        public,
        file_size_limit,
        allowed_mime_types
    )
VALUES (
        'images',
        'images',
        true,
        10485760,
        ARRAY ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    ),
    (
        'videos',
        'videos',
        true,
        104857600,
        ARRAY ['video/mp4', 'video/webm', 'video/quicktime']
    ),
    (
        'documents',
        'documents',
        false,
        10485760,
        ARRAY ['application/pdf', 'text/plain', 'application/msword']
    ),
    (
        'avatars',
        'avatars',
        true,
        2097152,
        ARRAY ['image/jpeg', 'image/png', 'image/webp']
    ) ON CONFLICT (id) DO NOTHING;
-- Storage policies for images bucket (drop existing policies first to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Users can manage their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
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
CREATE POLICY "Public can view images" ON storage.objects FOR
SELECT USING (bucket_id = 'images');
-- Similar policies for other buckets...
CREATE POLICY "Users can manage their own avatars" ON storage.objects FOR ALL USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name)) [1]
);
CREATE POLICY "Public can view avatars" ON storage.objects FOR
SELECT USING (bucket_id = 'avatars');
-- ============================================================================
-- DEFAULT DATA
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
        '["Basic experience sharing", "5 experiences", "Community support", "50MB storage"]'::jsonb,
        '{"experiences": 5, "storage": 52428800, "exports": 1, "comments": 10, "likes": 50}'::jsonb
    ),
    (
        'explorer',
        'Explorer',
        'Great for active travelers who want more features',
        999,
        9990,
        '["Advanced features", "50 experiences", "Email support", "Export capabilities", "500MB storage", "Priority listing"]'::jsonb,
        '{"experiences": 50, "storage": 524288000, "exports": 10, "comments": 100, "likes": 500}'::jsonb
    ),
    (
        'traveler',
        'Traveler',
        'Perfect for travel enthusiasts and content creators',
        1999,
        19990,
        '["Premium features", "Unlimited experiences", "Priority support", "Advanced analytics", "5GB storage", "Custom branding"]'::jsonb,
        '{"experiences": -1, "storage": 5368709120, "exports": -1, "comments": -1, "likes": -1}'::jsonb
    ),
    (
        'enterprise',
        'Enterprise',
        'For travel businesses and organizations',
        4999,
        49990,
        '["All features", "Custom limits", "Dedicated support", "API access", "White-label options", "Unlimited storage", "Team management"]'::jsonb,
        '{"experiences": -1, "storage": -1, "exports": -1, "comments": -1, "likes": -1, "team_members": 50}'::jsonb
    ) ON CONFLICT (id) DO
UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    features = EXCLUDED.features,
    limits = EXCLUDED.limits;
-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_user_storage_quota(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_ticket_number() TO authenticated;
-- ============================================================================
-- VIEWS FOR ANALYTICS AND REPORTING
-- ============================================================================
-- User statistics view
CREATE OR REPLACE VIEW user_stats AS
SELECT p.id,
    p.email,
    p.full_name,
    p.subscription_tier,
    p.subscription_status,
    p.storage_used,
    p.created_at as user_since,
    COUNT(DISTINCT e.id) as total_experiences,
    COUNT(DISTINCT el.id) as total_likes_received,
    COUNT(DISTINCT ec.id) as total_comments_received,
    COUNT(DISTINCT ev.id) as total_views,
    COALESCE(SUM(ph.amount), 0) as total_revenue_cents
FROM profiles p
    LEFT JOIN experiences e ON p.id = e.user_id
    LEFT JOIN experience_likes el ON e.id = el.experience_id
    LEFT JOIN experience_comments ec ON e.id = ec.experience_id
    LEFT JOIN experience_views ev ON e.id = ev.experience_id
    LEFT JOIN payment_history ph ON p.id = ph.user_id
    AND ph.status = 'succeeded'
GROUP BY p.id,
    p.email,
    p.full_name,
    p.subscription_tier,
    p.subscription_status,
    p.storage_used,
    p.created_at;
-- Experience statistics view
CREATE OR REPLACE VIEW experience_stats AS
SELECT e.id,
    e.title,
    e.user_id,
    e.location,
    e.country,
    e.is_public,
    e.is_featured,
    e.rating,
    e.created_at,
    COUNT(DISTINCT el.id) as total_likes,
    COUNT(DISTINCT ec.id) as total_comments,
    COUNT(DISTINCT ev.id) as total_views,
    COUNT(DISTINCT em.id) as total_media
FROM experiences e
    LEFT JOIN experience_likes el ON e.id = el.experience_id
    LEFT JOIN experience_comments ec ON e.id = ec.experience_id
    LEFT JOIN experience_views ev ON e.id = ev.experience_id
    LEFT JOIN experience_media em ON e.id = em.experience_id
GROUP BY e.id,
    e.title,
    e.user_id,
    e.location,
    e.country,
    e.is_public,
    e.is_featured,
    e.rating,
    e.created_at;
-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
-- Log completion
DO $$ BEGIN RAISE NOTICE 'Database schema setup completed successfully!';
RAISE NOTICE 'Created tables: profiles, subscription_tiers, subscriptions, payment_history, usage_tracking, experiences, experience_media, experience_likes, experience_comments, experience_views, image_metadata, admin_sessions, admin_audit_log, webhook_events, system_alerts, support_tickets, support_ticket_messages, user_activity, platform_analytics';
RAISE NOTICE 'Created storage buckets: images, videos, documents, avatars';
RAISE NOTICE 'Created functions: update_updated_at_column, update_storage_usage, generate_ticket_number, set_ticket_number, get_user_storage_quota';
RAISE NOTICE 'Created views: user_stats, experience_stats';
RAISE NOTICE 'Applied RLS policies and indexes for optimal performance';
RAISE NOTICE 'Inserted default subscription tiers: free, explorer, traveler, enterprise';
END $$;