-- Admin Management Schema
-- This migration adds the necessary tables and columns for admin functionality

-- Add admin-related columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS admin_role VARCHAR(20) DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS admin_permissions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_admin_login TIMESTAMP;

-- Create admin_sessions table for enhanced admin security
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create admin_audit_log table for tracking admin actions
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(255),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create webhook_events table for monitoring Stripe webhooks
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processing_attempts INTEGER DEFAULT 0,
  last_processing_attempt TIMESTAMP,
  error_message TEXT,
  event_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create system_alerts table for monitoring and notifications
CREATE TABLE IF NOT EXISTS system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create support_tickets table for customer support
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(20) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category VARCHAR(50),
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create support_ticket_messages table for ticket conversations
CREATE TABLE IF NOT EXISTS support_ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  attachments JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_admin_role ON profiles(admin_role);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_is_active ON admin_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_user_id ON admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_event_id ON webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_system_alerts_resolved ON system_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON system_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_system_alerts_created_at ON system_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket_id ON support_ticket_messages(ticket_id);

-- Add triggers for updated_at columns
DROP TRIGGER IF EXISTS update_admin_sessions_updated_at ON admin_sessions;
CREATE TRIGGER update_admin_sessions_updated_at
    BEFORE UPDATE ON admin_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_webhook_events_updated_at ON webhook_events;
CREATE TRIGGER update_webhook_events_updated_at
    BEFORE UPDATE ON webhook_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_alerts_updated_at ON system_alerts;
CREATE TRIGGER update_system_alerts_updated_at
    BEFORE UPDATE ON system_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;

-- Admin sessions policies
CREATE POLICY "Admins can view their own sessions" ON admin_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all admin sessions" ON admin_sessions
    FOR ALL USING (auth.role() = 'service_role');

-- Admin audit log policies (read-only for admins, full access for service role)
CREATE POLICY "Admins can view audit logs" ON admin_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = TRUE
        )
    );

CREATE POLICY "Service role can manage audit logs" ON admin_audit_log
    FOR ALL USING (auth.role() = 'service_role');

-- Webhook events policies (admin access only)
CREATE POLICY "Admins can view webhook events" ON webhook_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = TRUE
        )
    );

CREATE POLICY "Service role can manage webhook events" ON webhook_events
    FOR ALL USING (auth.role() = 'service_role');

-- System alerts policies
CREATE POLICY "Admins can view and update system alerts" ON system_alerts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = TRUE
        )
    );

CREATE POLICY "Service role can manage system alerts" ON system_alerts
    FOR ALL USING (auth.role() = 'service_role');

-- Support tickets policies
CREATE POLICY "Users can view their own tickets" ON support_tickets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets" ON support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view and manage all tickets" ON support_tickets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = TRUE
        )
    );

CREATE POLICY "Service role can manage all tickets" ON support_tickets
    FOR ALL USING (auth.role() = 'service_role');

-- Support ticket messages policies
CREATE POLICY "Users can view messages for their tickets" ON support_ticket_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM support_tickets 
            WHERE support_tickets.id = ticket_id 
            AND support_tickets.user_id = auth.uid()
        )
        AND is_internal = FALSE
    );

CREATE POLICY "Users can create messages for their tickets" ON support_ticket_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM support_tickets 
            WHERE support_tickets.id = ticket_id 
            AND support_tickets.user_id = auth.uid()
        )
        AND sender_id = auth.uid()
        AND is_internal = FALSE
    );

CREATE POLICY "Admins can view and create all ticket messages" ON support_ticket_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = TRUE
        )
    );

CREATE POLICY "Service role can manage all ticket messages" ON support_ticket_messages
    FOR ALL USING (auth.role() = 'service_role');

-- Function to generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
    ticket_num TEXT;
    counter INTEGER;
BEGIN
    -- Get current date in YYYYMMDD format
    ticket_num := 'TK' || TO_CHAR(NOW(), 'YYYYMMDD');
    
    -- Get the count of tickets created today
    SELECT COUNT(*) + 1 INTO counter
    FROM support_tickets
    WHERE DATE(created_at) = CURRENT_DATE;
    
    -- Append counter with zero padding
    ticket_num := ticket_num || LPAD(counter::TEXT, 4, '0');
    
    RETURN ticket_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate ticket numbers
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
        NEW.ticket_number := generate_ticket_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_support_ticket_number ON support_tickets;
CREATE TRIGGER set_support_ticket_number
    BEFORE INSERT ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION set_ticket_number();

-- Create default admin user (this should be updated with actual admin email)
-- Note: This is just a placeholder - in production, admin users should be created manually
INSERT INTO profiles (id, email, full_name, is_admin, admin_role, admin_permissions)
SELECT 
    id,
    email,
    'System Administrator',
    TRUE,
    'super_admin',
    '["user_management", "subscription_management", "system_monitoring", "support_management"]'::jsonb
FROM auth.users 
WHERE email = 'admin@example.com' -- Replace with actual admin email
ON CONFLICT (id) DO UPDATE SET
    is_admin = TRUE,
    admin_role = 'super_admin',
    admin_permissions = '["user_management", "subscription_management", "system_monitoring", "support_management"]'::jsonb;