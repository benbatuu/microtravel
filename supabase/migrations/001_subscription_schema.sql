-- Subscription Management Schema Extensions
-- This migration adds the necessary tables and columns for SaaS subscription management

-- Extend existing profiles table with subscription-related fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS storage_used BIGINT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Create subscriptions table for detailed subscription tracking
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('free', 'explorer', 'traveler', 'enterprise')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'incomplete')),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create payment history table for tracking all payment events
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR(255),
  amount INTEGER NOT NULL, -- Amount in cents
  currency VARCHAR(3) DEFAULT 'usd',
  status VARCHAR(20) NOT NULL CHECK (status IN ('succeeded', 'failed', 'pending', 'canceled')),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create usage tracking table for monitoring feature usage
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature VARCHAR(50) NOT NULL,
  usage_count INTEGER DEFAULT 1,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_date ON usage_tracking(date);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Policies for subscriptions table
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscriptions" ON subscriptions
    FOR ALL USING (auth.role() = 'service_role');

-- Policies for payment_history table
CREATE POLICY "Users can view their own payment history" ON payment_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all payment history" ON payment_history
    FOR ALL USING (auth.role() = 'service_role');

-- Policies for usage_tracking table
CREATE POLICY "Users can view their own usage tracking" ON usage_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all usage tracking" ON usage_tracking
    FOR ALL USING (auth.role() = 'service_role');

-- Insert default subscription tiers configuration (for reference)
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  price_monthly INTEGER NOT NULL, -- Price in cents
  price_yearly INTEGER NOT NULL, -- Price in cents
  features JSONB NOT NULL,
  limits JSONB NOT NULL,
  stripe_product_id VARCHAR(255),
  stripe_price_id_monthly VARCHAR(255),
  stripe_price_id_yearly VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default tier configurations
INSERT INTO subscription_tiers (id, name, price_monthly, price_yearly, features, limits, stripe_product_id) VALUES
('free', 'Free', 0, 0, 
 '["Basic experience sharing", "5 experiences", "Community support"]'::jsonb,
 '{"experiences": 5, "storage": 52428800, "exports": 1}'::jsonb, -- 50MB in bytes
 'prod_free'),
('explorer', 'Explorer', 999, 9990, 
 '["Advanced features", "50 experiences", "Email support", "Export capabilities"]'::jsonb,
 '{"experiences": 50, "storage": 524288000, "exports": 10}'::jsonb, -- 500MB in bytes
 'prod_explorer'),
('traveler', 'Traveler', 1999, 19990,
 '["Premium features", "Unlimited experiences", "Priority support", "Advanced analytics"]'::jsonb,
 '{"experiences": -1, "storage": 5368709120, "exports": -1}'::jsonb, -- 5GB in bytes
 'prod_traveler'),
('enterprise', 'Enterprise', 4999, 49990,
 '["All features", "Custom limits", "Dedicated support", "API access", "White-label options"]'::jsonb,
 '{"experiences": -1, "storage": -1, "exports": -1}'::jsonb,
 'prod_enterprise')
ON CONFLICT (id) DO NOTHING;

-- Add RLS and triggers for subscription_tiers
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view subscription tiers" ON subscription_tiers
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage subscription tiers" ON subscription_tiers
    FOR ALL USING (auth.role() = 'service_role');

DROP TRIGGER IF EXISTS update_subscription_tiers_updated_at ON subscription_tiers;
CREATE TRIGGER update_subscription_tiers_updated_at
    BEFORE UPDATE ON subscription_tiers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();