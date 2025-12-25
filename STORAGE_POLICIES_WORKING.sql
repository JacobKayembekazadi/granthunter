-- ============================================
-- Storage Policies for 'proposals' Bucket
-- ============================================
-- Make sure the bucket is named exactly "proposals" (lowercase)
-- Run this ENTIRE file at once in Supabase SQL Editor

-- Step 1: Enable RLS on storage.objects
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects'
  ) THEN
    RAISE NOTICE 'storage.objects table does not exist';
  ELSE
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Step 2: Drop existing policies if they exist (prevents conflicts)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
  DROP POLICY IF EXISTS "Allow users to view their organization's files" ON storage.objects;
  DROP POLICY IF EXISTS "Allow users to update their organization's files" ON storage.objects;
  DROP POLICY IF EXISTS "Allow users to delete their organization's files" ON storage.objects;
END $$;

-- Step 3: Create the policies
-- Policy: Allow authenticated uploads
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'proposals' 
    AND auth.role() = 'authenticated'
  );

-- Policy: Allow users to view files
CREATE POLICY "Allow users to view their organization's files" ON storage.objects
  FOR SELECT 
  USING (
    bucket_id = 'proposals' 
    AND auth.role() = 'authenticated'
  );

-- Policy: Allow users to update files
CREATE POLICY "Allow users to update their organization's files" ON storage.objects
  FOR UPDATE 
  USING (
    bucket_id = 'proposals' 
    AND auth.role() = 'authenticated'
  );

-- Policy: Allow users to delete files
CREATE POLICY "Allow users to delete their organization's files" ON storage.objects
  FOR DELETE 
  USING (
    bucket_id = 'proposals' 
    AND auth.role() = 'authenticated'
  );

