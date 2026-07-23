import type { Request, Response } from 'express';
import { getSupabase } from './supabase.js';

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

    const supabase = getSupabase();
    if (!supabase) {
        return res.status(500).json({ error: "Supabase configuration is missing. Cloud storage is unavailable." });
    }

    if (req.method === 'GET') {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('profile_data')
                .eq('player_name', name)
                .maybeSingle();

            if (error) {
                console.error("Supabase GET error:", error.message);
                throw error;
            }

            if (data) {
                res.status(200).json({ result: JSON.stringify(data.profile_data) });
            } else {
                res.status(200).json({ result: null });
            }
        } catch (error: any) {
            console.error("Error fetching profile:", error.message);
            return res.status(500).json({ error: "Failed to fetch profile from cloud database" });
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

            // OPTIMISTIC CONCURRENCY CONTROL (Conflict Resolver Backend)
            // Only apply this logic if the incoming payload is using V2 Engine format.
            if (profileData._engine && profileData._engine.revision) {
                const incomingRev = profileData._engine.revision;
                
                // Fetch current cloud data to compare
                const { data: currentData, error: fetchError } = await supabase
                    .from('profiles')
                    .select('profile_data')
                    .eq('player_name', name)
                    .maybeSingle();

                if (!fetchError && currentData && currentData.profile_data) {
                    const cloudProfile = currentData.profile_data;
                    
                    if (cloudProfile._engine && cloudProfile._engine.revision) {
                        const cloudRev = cloudProfile._engine.revision;
                        
                        // If incoming revision is older or equal (and not initial save), reject with 409
                        if (incomingRev <= cloudRev) {
                            console.log(`[SaveEngine] Conflict detected for ${name}. Cloud: ${cloudRev}, Incoming: ${incomingRev}`);
                            return res.status(409).json({ 
                                error: "CONFLICT", 
                                cloudData: cloudProfile 
                            });
                        }
                    }
                }
            }

            // No conflict, proceed with Upsert
            const { error } = await supabase
                .from('profiles')
                .upsert(
                    { player_name: name, profile_data: profileData, updated_at: new Date().toISOString() },
                    { onConflict: 'player_name' }
                );

            if (error) {
                console.error("Supabase POST error:", error.message);
                throw error;
            }

            res.status(200).json({ result: "OK" });

        } catch (error: any) {
            console.error("Error saving profile:", error.message);
            return res.status(500).json({ error: "Failed to save profile to cloud database" });
        }
    } else {
        res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
}
