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
