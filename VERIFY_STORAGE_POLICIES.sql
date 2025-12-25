-- Verify that storage policies were created successfully
-- Run this to see all policies on storage.objects

SELECT 
  policyname as "Policy Name",
  cmd as "Operation",
  qual as "Condition"
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%proposals%' OR policyname LIKE '%authenticated%'
ORDER BY policyname;

