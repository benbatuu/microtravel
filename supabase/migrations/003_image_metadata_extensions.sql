-- Add additional columns to image_metadata table for extended functionality
ALTER TABLE image_metadata 
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS camera_make TEXT,
ADD COLUMN IF NOT EXISTS camera_model TEXT,
ADD COLUMN IF NOT EXISTS camera_settings JSONB;

-- Create index for archived images
CREATE INDEX IF NOT EXISTS idx_image_metadata_archived ON image_metadata(user_id, archived);

-- Create index for tags (GIN index for array operations)
CREATE INDEX IF NOT EXISTS idx_image_metadata_tags ON image_metadata USING GIN(tags);

-- Create index for location searches
CREATE INDEX IF NOT EXISTS idx_image_metadata_location ON image_metadata(location);

-- Create function to update storage usage when images are deleted
CREATE OR REPLACE FUNCTION update_storage_usage_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Decrease storage usage when image is deleted
    UPDATE profiles 
    SET storage_used = GREATEST(0, storage_used - OLD.size_bytes),
        updated_at = NOW()
    WHERE id = OLD.user_id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for storage usage updates on delete
DROP TRIGGER IF EXISTS trigger_update_storage_on_delete ON image_metadata;
CREATE TRIGGER trigger_update_storage_on_delete
    AFTER DELETE ON image_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_storage_usage_on_delete();

-- Create function to update storage usage when images are inserted
CREATE OR REPLACE FUNCTION update_storage_usage_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Increase storage usage when image is inserted
    UPDATE profiles 
    SET storage_used = storage_used + NEW.size_bytes,
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for storage usage updates on insert
DROP TRIGGER IF EXISTS trigger_update_storage_on_insert ON image_metadata;
CREATE TRIGGER trigger_update_storage_on_insert
    AFTER INSERT ON image_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_storage_usage_on_insert();

-- Create view for image statistics
CREATE OR REPLACE VIEW user_image_stats AS
SELECT 
    user_id,
    COUNT(*) as total_images,
    COUNT(*) FILTER (WHERE archived = false) as active_images,
    COUNT(*) FILTER (WHERE archived = true) as archived_images,
    SUM(size_bytes) as total_size_bytes,
    SUM(size_bytes) FILTER (WHERE archived = false) as active_size_bytes,
    SUM(size_bytes) FILTER (WHERE archived = true) as archived_size_bytes,
    COUNT(DISTINCT mime_type) as unique_file_types,
    COUNT(*) FILTER (WHERE upload_date > NOW() - INTERVAL '7 days') as recent_uploads,
    COUNT(*) FILTER (WHERE upload_date > NOW() - INTERVAL '30 days') as monthly_uploads,
    MIN(upload_date) as first_upload,
    MAX(upload_date) as last_upload
FROM image_metadata
GROUP BY user_id;

-- Create function to get user's storage quota info
CREATE OR REPLACE FUNCTION get_user_storage_quota(user_uuid UUID)
RETURNS TABLE (
    used_bytes BIGINT,
    limit_bytes BIGINT,
    percentage NUMERIC,
    can_upload BOOLEAN,
    tier TEXT
) AS $$
DECLARE
    user_profile RECORD;
    tier_limits RECORD;
BEGIN
    -- Get user profile
    SELECT subscription_tier, storage_used INTO user_profile
    FROM profiles WHERE id = user_uuid;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT 0::BIGINT, 0::BIGINT, 100::NUMERIC, FALSE, 'unknown'::TEXT;
        RETURN;
    END IF;
    
    -- Define tier limits (in bytes)
    CASE user_profile.subscription_tier
        WHEN 'free' THEN
            tier_limits := ROW(52428800); -- 50MB
        WHEN 'explorer' THEN
            tier_limits := ROW(524288000); -- 500MB
        WHEN 'traveler' THEN
            tier_limits := ROW(5368709120); -- 5GB
        WHEN 'enterprise' THEN
            tier_limits := ROW(-1); -- Unlimited
        ELSE
            tier_limits := ROW(52428800); -- Default to free
    END CASE;
    
    -- Calculate values
    IF tier_limits.f1 = -1 THEN
        -- Unlimited
        RETURN QUERY SELECT 
            user_profile.storage_used,
            -1::BIGINT,
            0::NUMERIC,
            TRUE,
            user_profile.subscription_tier;
    ELSE
        -- Limited
        RETURN QUERY SELECT 
            user_profile.storage_used,
            tier_limits.f1::BIGINT,
            CASE 
                WHEN tier_limits.f1 > 0 THEN 
                    ROUND((user_profile.storage_used::NUMERIC / tier_limits.f1::NUMERIC) * 100, 2)
                ELSE 100::NUMERIC
            END,
            user_profile.storage_used < tier_limits.f1,
            user_profile.subscription_tier;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_storage_quota(UUID) TO authenticated;

-- Create function to clean up orphaned images (images without metadata)
CREATE OR REPLACE FUNCTION cleanup_orphaned_images()
RETURNS INTEGER AS $$
DECLARE
    cleanup_count INTEGER := 0;
BEGIN
    -- This would typically be run as a scheduled job
    -- For now, just return 0 as a placeholder
    RETURN cleanup_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for new columns
-- Users can update their own image metadata including new fields
DROP POLICY IF EXISTS "Users can update own image metadata" ON image_metadata;
CREATE POLICY "Users can update own image metadata" ON image_metadata
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for archived images
CREATE POLICY "Users can view own archived images" ON image_metadata
    FOR SELECT USING (auth.uid() = user_id AND archived = true);

-- Update storage bucket policies to handle archive folder
CREATE POLICY "Users can access archive folder" ON storage.objects
    FOR ALL USING (
        bucket_id = 'images' AND 
        auth.uid()::text = (storage.foldername(name))[1] AND
        (storage.foldername(name))[2] = 'archive'
    );