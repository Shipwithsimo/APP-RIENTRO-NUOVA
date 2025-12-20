-- Cleanup script: Remove duplicate constraints if they exist
-- Run this FIRST if you got the "constraint already exists" error

-- Drop duplicate foreign key constraints if they exist
ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_user_id_fkey;
ALTER TABLE public.journeys DROP CONSTRAINT IF EXISTS journeys_user_id_fkey;
ALTER TABLE public.saved_places DROP CONSTRAINT IF EXISTS saved_places_user_id_fkey;

-- Note: The foreign keys are already defined inline in the table definitions,
-- so we don't need to recreate them. The inline definitions are sufficient.

