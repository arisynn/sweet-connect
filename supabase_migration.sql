-- Create the profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_name TEXT UNIQUE NOT NULL,
    profile_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public access to select based on player_name (for now, since we don't have authenticated users)
-- In a real application with authenticated users, we would restrict this using auth.uid()
CREATE POLICY "Allow public select" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON profiles FOR UPDATE USING (true) WITH CHECK (true);

-- Create an index on player_name for faster lookups
CREATE INDEX profiles_player_name_idx ON profiles(player_name);

-- Create the push_subscriptions table
CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_name TEXT NOT NULL,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (similar to profiles)
CREATE POLICY "Allow public select on push_subscriptions" ON push_subscriptions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on push_subscriptions" ON push_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on push_subscriptions" ON push_subscriptions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete on push_subscriptions" ON push_subscriptions FOR DELETE USING (true);

-- Create an index on player_name
CREATE INDEX push_subscriptions_player_name_idx ON push_subscriptions(player_name);

-- ==============================================================================
-- ALTERNATIVE CRON: Supabase pg_cron + pg_net (Recommended for Vercel Hobby)
-- ==============================================================================
-- To run the hourly push notifications entirely from Supabase without Vercel limits:
-- 1. Enable the pg_net extension in your Supabase Dashboard (Database -> Extensions).
-- 2. Run the following SQL to schedule the job:
--
-- CREATE EXTENSION IF NOT EXISTS pg_net;
-- 
-- SELECT cron.schedule(
--   'invoke-push-affirmations',
--   '0 * * * *', -- Every hour
--   $$
--     SELECT net.http_get(
--         url:='https://YOUR_VERCEL_DOMAIN.vercel.app/api/push?action=cron_affirmations',
--         headers:='{"Content-Type": "application/json"}'::jsonb
--     );
--   $$
-- );
--
-- This completely bypasses Vercel's 1-cron-per-day limit on the Hobby tier.
