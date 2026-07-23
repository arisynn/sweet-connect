-- =====================================================================================
-- SWEET CONNECT: SAVE ENGINE V2 MIGRATION
-- Execute this script in your Supabase SQL Editor.
-- =====================================================================================

-- 1. Create robust Logging Table
CREATE TABLE IF NOT EXISTS save_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_name TEXT NOT NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast lookup by player
CREATE INDEX IF NOT EXISTS save_logs_player_idx ON save_logs(player_name);

-- 2. Create Active Devices Table (For tracking multiple devices per user)
CREATE TABLE IF NOT EXISTS active_devices (
    device_id TEXT PRIMARY KEY,
    player_name TEXT NOT NULL,
    last_session_id TEXT,
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for player
CREATE INDEX IF NOT EXISTS active_devices_player_idx ON active_devices(player_name);

-- Note: We retain the 'profiles' table with 'profile_data' JSONB. 
-- The new Save Engine V2 architecture now enforces schema validation, 
-- optimistic locking, revision control, and checksum hashing 
-- natively within the JSONB payload envelope instead of requiring multi-table joins.
