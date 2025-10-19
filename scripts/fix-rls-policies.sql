-- Fix RLS Policies to Allow Reading Data
-- Run this in your Supabase SQL Editor

-- Enable RLS on tables (if not already enabled)
ALTER TABLE cauti_surveillance ENABLE ROW LEVEL SECURITY;
ALTER TABLE clabsi_surveillance ENABLE ROW LEVEL SECURITY;
ALTER TABLE mdr_surveillance ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON cauti_surveillance;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON clabsi_surveillance;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON mdr_surveillance;

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON cauti_surveillance;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON clabsi_surveillance;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON mdr_surveillance;

DROP POLICY IF EXISTS "Enable update for authenticated users" ON cauti_surveillance;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON clabsi_surveillance;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON mdr_surveillance;

-- CAUTI Surveillance Policies
CREATE POLICY "Enable read access for all users"
ON cauti_surveillance FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON cauti_surveillance FOR INSERT
WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Enable update for authenticated users"
ON cauti_surveillance FOR UPDATE
USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- CLABSI Surveillance Policies
CREATE POLICY "Enable read access for all users"
ON clabsi_surveillance FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON clabsi_surveillance FOR INSERT
WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Enable update for authenticated users"
ON clabsi_surveillance FOR UPDATE
USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- MDR Surveillance Policies
CREATE POLICY "Enable read access for all users"
ON mdr_surveillance FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON mdr_surveillance FOR INSERT
WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Enable update for authenticated users"
ON mdr_surveillance FOR UPDATE
USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
