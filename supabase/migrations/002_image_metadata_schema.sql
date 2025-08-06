-- Create image metadata table for tracking uploaded images
CREATE TABLE IF NOT EXISTS image_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    width INTEGER,
    height INTEGER,
    experience_id UUID, -- References experiences table if exists
    storage_path VARCHAR(500) NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_image_metadata_user_id ON image_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_image_metadata_experience_id ON image_metadata(experience_id);
CREATE INDEX IF NOT EXISTS idx_image_metadata_upload_date ON image_metadata(upload_date);
CREATE INDEX IF NOT EXISTS idx_image_metadata_storage_path ON image_metadata(storage_path);

-- Create RLS policies for image metadata
ALTER TABLE image_metadata ENABLE ROW LEVEL SECURITY;

-- Users can only see their own image metadata
CREATE POLICY "Users can view own image metadata" ON image_metadata
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own image metadata
CREATE POLICY "Users can insert own image metadata" ON image_metadata
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own image metadata
CREATE POLICY "Users can update own image metadata" ON image_metadata
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own image metadata
CREATE POLICY "Users can delete own image metadata" ON image_metadata
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for image_metadata table
CREATE TRIGGER update_image_metadata_updated_at
    BEFORE UPDATE ON image_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for images bucket
CREATE POLICY "Users can upload their own images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own images" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow public access to images (for viewing)
CREATE POLICY "Public can view images" ON storage.objects
    FOR SELECT USING (bucket_id = 'images');