import type { Request, Response } from 'express';
import { getSupabase } from './supabase.js';
import webpush from 'web-push';

let lastGlobalCronExecution = 0;

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

    // Set VAPID details if not set already
    try {
        if (!webpush.generateVAPIDKeys) {
            // just to check if webpush is loaded properly
        }
        const vapidPublicKey = process.env.VITE_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY;
        const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
        const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';
        
        if (vapidPublicKey && vapidPrivateKey) {
            webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
        }
    } catch (e) {
        console.error("Error setting VAPID details", e);
    }

    if (req.method === 'POST') {
        const { action } = req.body;

        if (action === 'subscribe') {
            const { playerName, subscription } = req.body;
            console.log(`[Push] Subscribe requested for player: ${playerName}`);
            
            if (!playerName || !subscription || !subscription.endpoint) {
                console.error("[Push] Invalid subscription data received", req.body);
                return res.status(400).json({ error: "Invalid subscription data" });
            }

            const keys = subscription.keys || {};
            const p256dh = keys.p256dh || '';
            const auth = keys.auth || '';

            try {
                const supabase = getSupabase();
                if (!supabase) {
                    console.warn("[Push] Supabase not initialized, mocking subscription save");
                    return res.status(200).json({ success: true, mocked: true });
                }

                console.log(`[Push] Upserting subscription for ${playerName} to Supabase...`);
                const { error } = await supabase
                    .from('push_subscriptions')
                    .upsert(
                        { 
                            player_name: playerName, 
                            endpoint: subscription.endpoint,
                            p256dh: p256dh,
                            auth: auth,
                            updated_at: new Date().toISOString() 
                        },
                        { onConflict: 'endpoint' }
                    );

                if (error) {
                    console.error("[Push] Supabase error saving subscription:", error);
                    throw error;
                }

                console.log(`[Push] Subscription saved successfully for ${playerName}`);
                return res.status(200).json({ success: true });
            } catch (error: any) {
                console.error("[Push] Error saving subscription:", error);
                return res.status(500).json({ error: "Failed to save subscription" });
            }
        } else if (action === 'sendNotification') {
            // This endpoint is for testing or triggered internally.
            const { playerName, category } = req.body;
            
            try {
                const supabase = getSupabase();
                if (!supabase) {
                    return res.status(200).json({ success: true, mocked: true });
                }

                // Get user's profile to check preferences
                const { data: profileObj, error: profileErr } = await supabase
                    .from('profiles')
                    .select('profile_data')
                    .eq('player_name', playerName)
                    .maybeSingle();

                if (profileErr) throw profileErr;

                const prefs = profileObj?.profile_data?.notificationPrefs || {
                    dailyReward: true,
                    dailyMission: true,
                    weeklyMission: true,
                    chestReady: true,
                    comeBack: true
                };

                let userTimezone = profileObj?.profile_data?.timezone;
                let currentHour = new Date().getHours();
                if (userTimezone) {
                    try {
                        const formatter = new Intl.DateTimeFormat('en-US', {
                            hour: 'numeric',
                            hour12: false,
                            timeZone: userTimezone
                        });
                        const hourStr = formatter.format(new Date());
                        currentHour = parseInt(hourStr, 10);
                        if (currentHour === 24) currentHour = 0;
                    } catch (e) {
                        // fallback to server time if timezone is invalid
                    }
                }

                const getTimeCategory = (hour: number) => {
                    if (hour >= 5 && hour < 11) return 'morning';
                    if (hour >= 11 && hour < 15) return 'afternoon';
                    if (hour >= 15 && hour < 18) return 'evening';
                    if (hour >= 18 && hour < 22) return 'night';
                    return 'lateNight';
                };

                const timeCategory = getTimeCategory(currentHour);
                
                const todayStr = new Date().toISOString().split('T')[0];
                let affSentToday = prefs.affSentToday || 0;
                let affLastDate = prefs.affLastDate || '';
                let affLastCategory = prefs.affLastCategory || '';
                
                if (affLastDate !== todayStr) {
                    affSentToday = 0;
                    affLastDate = todayStr;
                    affLastCategory = '';
                }

                // Check preference for the requested category
                let allowSend = false;
                let title = 'Sweet Connect';
                let body = 'Halo!';

                const fs = await import('fs/promises');
                const path = await import('path');
                let affirmations = ["Semoga harimu menyenangkan."];
                try {
                    const affData = await fs.readFile(path.join(process.cwd(), `${timeCategory}.json`), 'utf-8');
                    affirmations = JSON.parse(affData);
                } catch (e) {
                    console.error(`Could not read ${timeCategory}.json`, e);
                }

                let randomAff = affirmations[Math.floor(Math.random() * affirmations.length)];
                
                // Prevent duplicate consecutive affirmations
                if (affirmations.length > 1 && prefs.lastAffirmationSent === randomAff) {
                    let newAff = randomAff;
                    while (newAff === prefs.lastAffirmationSent) {
                        newAff = affirmations[Math.floor(Math.random() * affirmations.length)];
                    }
                    randomAff = newAff;
                }

                let greeting = "";
                if (timeCategory === 'morning') greeting = "Selamat pagi!";
                else if (timeCategory === 'afternoon') greeting = "Selamat siang!";
                else if (timeCategory === 'evening') greeting = "Selamat sore!";
                else if (timeCategory === 'night') greeting = "Selamat malam!";
                else greeting = "Masih bangun?";

                const pd = profileObj?.profile_data || {};
                
                // Get the current date in the user's timezone
                const userDate = new Date(new Date().toLocaleString('en-US', { timeZone: userTimezone || 'UTC' }));
                const userDateString = userDate.toDateString(); // Matches new Date().toDateString() format on client
                
                const pad = (n: number) => String(n).padStart(2, '0');
                const userDateYMD = `${userDate.getFullYear()}-${pad(userDate.getMonth() + 1)}-${pad(userDate.getDate())}`;

                switch (category) {
                    case 'dailyReward':
                        if (prefs.dailyReward) {
                            const lastDaily = pd.loginReward?.date;
                            if (lastDaily !== userDateString) {
                                allowSend = true;
                                title = 'Hadiah Harian Siap!';
                                body = `${greeting} Hadiah harianmu sudah siap diklaim. ${randomAff}`;
                            } else {
                                console.log(`[Push] User ${playerName} already claimed dailyReward today (${lastDaily}), skipping.`);
                            }
                        }
                        break;
                    case 'dailyMission':
                        if (prefs.dailyMission) {
                            const dMissions = pd.dailyMissions;
                            
                            if (dMissions?.date !== userDateYMD) {
                                // New missions available
                                allowSend = true;
                                title = 'Misi Harian Baru';
                                body = `${greeting} Misi harian baru sudah menunggumu. ${randomAff}`;
                            } else if (!dMissions?.allClaimed) {
                                // Have incomplete or unclaimed missions
                                allowSend = true;
                                title = 'Misi Harian Belum Selesai';
                                body = `${greeting} Jangan lupa selesaikan misi harianmu hari ini! ${randomAff}`;
                            } else {
                                console.log(`[Push] User ${playerName} already completed daily missions, skipping.`);
                            }
                        }
                        break;
                    case 'weeklyMission':
                        if (prefs.weeklyMission) {
                            const wMissions = pd.weeklyMissions;
                            if (wMissions && !wMissions.allClaimed) {
                                allowSend = true;
                                title = 'Misi Mingguan Menunggu';
                                body = `${greeting} Ada misi mingguan yang belum kamu selesaikan nih. ${randomAff}`;
                            } else {
                                console.log(`[Push] User ${playerName} already completed weekly missions, skipping.`);
                            }
                        }
                        break;
                    case 'chestReady':
                        if (prefs.chestReady) {
                            const slots = pd.chestSlots || [];
                            const now = Date.now();
                            const hasReadyChest = slots.some((c: any) => c && c.unlockTime <= now);
                            if (hasReadyChest) {
                                allowSend = true;
                                title = 'Peti Siap Dibuka!';
                                body = `${greeting} Peti hadiahmu sudah siap dibuka. ${randomAff}`;
                            } else {
                                console.log(`[Push] User ${playerName} has no ready chests, skipping.`);
                            }
                        }
                        break;
                    case 'comeBack':
                        if (prefs.comeBack) {
                            const lastUpdate = pd.lastUpdated || Date.now();
                            const hoursSinceLastActive = (Date.now() - lastUpdate) / (1000 * 60 * 60);
                            
                            if (hoursSinceLastActive >= 24 && hoursSinceLastActive <= 72) {
                                allowSend = true;
                                title = 'Kangen Main Sweet Connect?';
                                body = `${greeting} Sweet Connect merindukanmu. Yuk main sebentar. ${randomAff}`;
                            } else {
                                console.log(`[Push] User ${playerName} active recently or too long ago (${hoursSinceLastActive}h), skipping comeBack.`);
                            }
                        }
                        break;
                    case 'affirmation':
                        if (prefs.affirmation !== false) {
                            // Smart scheduling rules:
                            // 1. Max 2 affirmations per day
                            // 2. Do not send if we already sent one for this timeCategory today
                            // 3. 50% chance to skip even if eligible, to make it feel organic (unless it's the first one of the day)
                            const isFirstToday = affSentToday === 0;
                            const hitChance = isFirstToday ? true : (Math.random() > 0.5);
                            
                            if (affLastCategory !== timeCategory && affSentToday < 2 && hitChance) {
                                allowSend = true;
                                title = greeting;
                                body = randomAff;
                                
                                affSentToday++;
                                affLastCategory = timeCategory;
                            }
                        }
                        break;
                    default:
                        allowSend = true;
                        body = randomAff;
                }

                if (!allowSend) {
                    return res.status(200).json({ success: false, reason: 'User disabled or smart scheduling skipped' });
                }

                // Update profile with the new preferences state
                if (profileObj?.profile_data) {
                    const updatedPrefs = { 
                        ...prefs, 
                        lastAffirmationSent: randomAff,
                        affSentToday,
                        affLastDate,
                        affLastCategory
                    };
                    const updatedProfile = { ...profileObj.profile_data, notificationPrefs: updatedPrefs };
                    await supabase.from('profiles').update({ profile_data: updatedProfile }).eq('player_name', playerName);
                }

                const payload = {
                    title,
                    body,
                    icon: '/logo.png',
                    badge: '/logo.png',
                    url: '/'
                };

                const { data: subscriptions, error } = await supabase
                    .from('push_subscriptions')
                    .select('*')
                    .eq('player_name', playerName);

                if (error) throw error;

                if (!subscriptions || subscriptions.length === 0) {
                    return res.status(404).json({ error: "No subscriptions found for player" });
                }

                const results = await Promise.all(subscriptions.map(async (sub) => {
                    const pushSubscription = {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.p256dh,
                            auth: sub.auth
                        }
                    };

                    try {
                        await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
                        return { success: true, endpoint: sub.endpoint };
                    } catch (err: any) {
                        if (err.statusCode === 404 || err.statusCode === 410 || err.statusCode === 400 || err.statusCode === 401 || err.statusCode === 403) {
                            // Subscription has expired or is no longer valid, delete it
                            console.log('Subscription has expired or is no longer valid: ', err.statusCode);
                            await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
                        } else {
                            console.error('Error sending push notification: ', err);
                        }
                        return { success: false, endpoint: sub.endpoint, error: err.message };
                    }
                }));

                return res.status(200).json({ success: true, results });

            } catch (error: any) {
                console.error("Error sending notification:", error);
                return res.status(500).json({ error: "Failed to send notification", details: error.message || error.toString(), stack: error.stack });
            }
        }
        
        return res.status(400).json({ error: "Invalid action" });

    } else if (req.method === 'GET') {
        const action = req.query.action;
        
        if (action === 'cron_affirmations') {
            const now = Date.now();
            // Cegah eksekusi lebih dari 1x setiap 30 menit per container (Membantu mengurangi spam dari client)
            if (now - lastGlobalCronExecution < 1800000) {
                return res.status(200).json({ success: true, reason: 'rate_limited', players: 0, sent: 0 });
            }
            lastGlobalCronExecution = now;

            try {
                const supabase = getSupabase();
                if (!supabase) return res.status(500).json({ error: 'Supabase not initialized' });
                
                const { data: subs, error: subErr } = await supabase.from('push_subscriptions').select('player_name').order('updated_at', { ascending: false });
                if (subErr || !subs) return res.status(500).json({ error: 'DB Error' });
                
                const playerNames = [...new Set(subs.map(s => s.player_name))];
                let successCount = 0;
                
                // This would ideally be a queued job in a real system.
                // We'll just call our own API internally or do it directly.
                // But doing it directly inside this process might take too long for Vercel functions (10s limit on free).
                // However, since it's a small app, we'll process it directly.
                
                // Since processNotification logic is tied to POST /sendNotification,
                // let's just make fetch calls to our own endpoint.
                
                const protocol = req.headers['x-forwarded-proto'] || 'http';
                const host = req.headers.host;
                const baseUrl = protocol + '://' + host;
                
                for (const player of playerNames) {
                    try {
                        await fetch(baseUrl + '/api/push', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'sendNotification', playerName: player, category: 'affirmation' })
                        });
                        successCount++;
                    } catch(e) {}
                }
                
                return res.status(200).json({ success: true, players: playerNames.length, sent: successCount });
            } catch(e) {
                if (e instanceof Error) {
                    return res.status(500).json({ error: e.message });
                } else {
                    return res.status(500).json({ error: String(e) });
                }
            }
        }

        // Return public VAPID key

        const vapidPublicKey = process.env.VITE_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY;
        if (vapidPublicKey) {
            return res.status(200).json({ publicKey: vapidPublicKey });
        }
        return res.status(500).json({ error: "VAPID keys not configured" });
    }

    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
