import type { Request, Response } from 'express';
import { getSupabase } from './supabase.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'profiles_db.json');

const readDB = () => {
    try {
        if (fs.existsSync(dbPath)) {
            return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        }
    } catch (e) {
        console.error('Error reading DB:', e);
    }
    return {};
};

const writeDB = (data: any) => {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Error writing DB:', e);
    }
};

export default async function handler(req: Request, res: Response) {
    res.setHeader('Access-Control-Allow-Credentials', "true");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const name = req.query.name as string;
    
    if (!name || Array.isArray(name)) {
        return res.status(400).json({ error: "Invalid name parameter" });
    }

    if (req.method === 'GET') {
        try {
            const supabase = getSupabase();
            if (!supabase) {
                const db = readDB();
                const key = `sc_prof2_${name}`;
                const profileData = db[key] ?? null;
                return res.status(200).json({ result: profileData ? JSON.stringify(profileData) : null });
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('profile_data')
                .eq('player_name', name)
                .maybeSingle();

            if (error) {
                if (error.code === 'PGRST205' || error.message.includes('schema cache')) {
                    console.warn("Supabase: Table 'profiles' not found. Please run supabase_migration.sql in your Supabase SQL Editor. Falling back to local storage.");
                } else {
                    console.warn("Supabase error (falling back to local):", error.message);
                }
                throw error;
            }

            if (data) {
                res.status(200).json({ result: JSON.stringify(data.profile_data) });
            } else {
                // Not found in Supabase, check local DB
                const db = readDB();
                const key = `sc_prof2_${name}`;
                const localProfileData = db[key];
                
                if (localProfileData) {
                    // Auto-migrate to cloud
                    console.log(`Migrating local profile for ${name} to Supabase...`);
                    const { error: upsertError } = await supabase
                        .from('profiles')
                        .upsert(
                            { player_name: name, profile_data: localProfileData, updated_at: new Date().toISOString() },
                            { onConflict: 'player_name' }
                        );
                        
                    if (upsertError) {
                        console.error("Failed to migrate local profile to Supabase:", upsertError.message);
                    }
                    res.status(200).json({ result: JSON.stringify(localProfileData) });
                } else {
                    res.status(200).json({ result: null });
                }
            }
        } catch (error: any) {
            if (error.code !== 'PGRST205' && !error?.message?.includes('schema cache')) {
                console.warn("Error fetching profile, using fallback:", error.message);
            }
            // Fallback to local file
            const db = readDB();
            const key = `sc_prof2_${name}`;
            const profileData = db[key] ?? null;
            return res.status(200).json({ result: profileData ? JSON.stringify(profileData) : null });
        }
    } else if (req.method === 'POST') {
        try {
            let profileData = req.body;
            if (typeof profileData === 'string') {
                try { profileData = JSON.parse(profileData); } catch(e) {}
            }
            if (!profileData || typeof profileData !== 'object' || Object.keys(profileData).length === 0) { 
                return res.status(400).json({ error: "Invalid profile data format" });
            }

            const supabase = getSupabase();
            if (!supabase) {
                const db = readDB();
                const key = `sc_prof2_${name}`;
                db[key] = req.body;
                writeDB(db);
                return res.status(200).json({ result: "OK" });
            }

            const { error } = await supabase
                .from('profiles')
                .upsert(
                    { player_name: name, profile_data: profileData, updated_at: new Date().toISOString() },
                    { onConflict: 'player_name' }
                );

            if (error) {
                if (error.code === 'PGRST205' || error.message.includes('schema cache')) {
                    console.warn("Supabase: Table 'profiles' not found. Please run supabase_migration.sql in your Supabase SQL Editor. Falling back to local storage.");
                } else {
                    console.warn("Supabase error (falling back to local):", error.message);
                }
                throw error;
            }

            res.status(200).json({ result: "OK" });
        } catch (error: any) {
            if (error.code !== 'PGRST205' && !error?.message?.includes('schema cache')) {
                console.warn("Error saving profile, using fallback:", error.message);
            }
            // Fallback to local file
            const db = readDB();
            const key = `sc_prof2_${name}`;
            db[key] = req.body;
            writeDB(db);
            return res.status(200).json({ result: "OK" });
        }
    } else {
        res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
}
