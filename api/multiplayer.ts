import type { Request, Response } from 'express';
import { getSupabase } from './supabase.js';

// Ephemeral room state
// In production, use Redis or Supabase Realtime/DB for this.
const rooms = new Map<string, any>();

async function updatePlayerBalance(playerName: string, currency: string, change: number) {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data, error } = await supabase.from("profiles").select("profile_data").eq("player_name", playerName).maybeSingle();
    if (error || !data || !data.profile_data) return;
    let profileData = data.profile_data;
    if (profileData.gameData) profileData = profileData.gameData;
    const current = parseInt(profileData[currency]) || 0;
    profileData[currency] = current + change;
    await supabase.from("profiles").update({ profile_data: data.profile_data }).eq("player_name", playerName);
}

async function getPlayerBalance(playerName: string, currency: string) {
    const supabase = getSupabase();
    if (!supabase) return 0;
    
    const { data, error } = await supabase.from('profiles').select('profile_data').eq('player_name', playerName).maybeSingle();
    if (error || !data || !data.profile_data) {
        console.error(`getPlayerBalance error for ${playerName}:`, error?.message || 'No data');
        return 0;
    }
    
    let gameData = data.profile_data;
    if (data.profile_data.gameData) {
        gameData = data.profile_data.gameData;
    }
    
    return parseInt(gameData[currency]) || 0;
}

export default async function handler(req: Request, res: Response) {
    res.setHeader('Access-Control-Allow-Credentials', "true");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action } = req.query;

    try {
        if (action === 'create') {
            const { host, level, theme } = req.body;
            const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
            rooms.set(roomId, {
                id: roomId,
                host,
                mode: 'Friendly Match',
                wager: null,
                players: [{ name: host, level, ready: false, theme }]
            });
            return res.json(rooms.get(roomId));
        }

        if (action === 'join') {
            const { roomId, name, level, theme } = req.body;
            const room = rooms.get(roomId);
            if (!room) return res.status(404).json({ error: 'Room not found' });
            if (room.players.length >= 2 && !room.players.find((p: any) => p.name === name)) return res.status(400).json({ error: 'Room is full' });
            
            const existingPlayer = room.players.find((p: any) => p.name === name);
            if (existingPlayer) {
                existingPlayer.level = level;
                existingPlayer.theme = theme;
                existingPlayer.ready = false;
            } else {
                room.players.push({ name, level, ready: false, theme });
            }
            room.players.forEach((p: any) => p.ready = false);
            return res.json(room);
        }
        
        if (action === 'leave') {
            const { roomId, name } = req.body;
            const room = rooms.get(roomId);
            if (room) {
                room.players = room.players.filter((p: any) => p.name !== name);
                if (room.players.length === 0) rooms.delete(roomId);
                else {
                    if (room.host === name) room.host = room.players[0].name;
                    room.players.forEach((p: any) => p.ready = false);
                }
            }
            return res.json({ success: true });
        }

        if (action === 'sync') {
            const { roomId, name, level, theme, progress } = req.query;
            const room = rooms.get(roomId as string);
            if (!room) return res.status(404).json({ error: 'Room not found' });
            
            if (name && room.players) {
                const p = room.players.find((p: any) => p.name === name);
                if (p) {
                    if (level) p.level = Number(level);
                    if (theme) p.theme = theme as string;
                    if (progress) p.progress = Number(progress);
                }
            }
            return res.json(room);
        }
        
        if (action === "complete") {
            const { roomId, name } = req.body;
            const room = rooms.get(roomId);
            if (room && room.status === "ACTIVE" && !room.winner) {
                room.winner = name;
                room.status = "COMPLETED";
                if (room.mode === "Match Berhadiah" && room.wager) {
                    const amount = room.wager.amount;
                    const curr = room.wager.currency;
                    // Winner gets both wagers (their own wager back + the loser's wager)
                    await updatePlayerBalance(name, curr, amount * 2);
                    room.payoutProcessed = true;
                }
            }
            return res.json(room || { error: "Not found" });
        }

        if (action === 'ready') {
            const { roomId, name, ready } = req.body;
            const room = rooms.get(roomId);
            if (room) {
                const p = room.players.find((p: any) => p.name === name);
                if (p) p.ready = ready;
            }
            return res.json(room);
        }

        if (action === 'change_mode') {
            const { roomId, host, mode } = req.body;
            const room = rooms.get(roomId);
            if (!room || room.host !== host) return res.status(403).json({ error: 'Not host' });
            room.mode = mode;
            if (mode === 'Friendly Match') {
                room.wager = null;
            }
            return res.json(room);
        }

        if (action === 'propose_wager') {
            const { roomId, host, currency, amount } = req.body;
            
            if (typeof amount !== 'number' || amount <= 0 || isNaN(amount) || !Number.isInteger(amount)) {
                return res.status(400).json({ error: 'Nominal taruhan tidak valid.' });
            }
            if (currency !== 'coins' && currency !== 'gems') {
                return res.status(400).json({ error: 'Currency tidak valid.' });
            }

            const room = rooms.get(roomId);
            if (!room || room.host !== host) return res.status(403).json({ error: 'Not host' });
            
            const balance = await getPlayerBalance(host, currency);
            if (balance < amount) {
                return res.status(400).json({ error: `${currency === 'coins' ? 'Coin' : 'Gem'} kamu tidak cukup untuk taruhan ini.` });
            }
            
            room.mode = 'Match Berhadiah';
            room.wager = {
                currency,
                amount,
                hostAgreed: true,
                memberAgreed: false,
                version: Date.now()
            };
            return res.json(room);
        }

        if (action === 'accept_wager') {
            const { roomId, name, version } = req.body;
            const room = rooms.get(roomId);
            if (!room || !room.wager || room.wager.version !== version) return res.status(400).json({ error: 'Wager expired' });
            
            const balance = await getPlayerBalance(name, room.wager.currency);
            if (balance < room.wager.amount) {
                return res.status(400).json({ error: `${room.wager.currency} kamu tidak cukup untuk menerima pertandingan ini.` });
            }
            
            room.wager.memberAgreed = true;
            return res.json(room);
        }
        
        if (action === 'reject_wager') {
            const { roomId, version } = req.body;
            const room = rooms.get(roomId);
            if (room && room.wager && room.wager.version === version) {
                room.wager = null;
                room.mode = 'Friendly Match';
            }
            return res.json(room);
        }

        if (action === 'start_match') {
            const { roomId, host, board } = req.body;
            const room = rooms.get(roomId);
            if (!room || room.host !== host) return res.status(403).json({ error: 'Invalid room' });
            if (room.status === 'STARTING' || room.status === 'ACTIVE') return res.json({ success: true, room });
            if (room.players.length < 2 || !room.players.every((p: any) => p.ready)) return res.status(400).json({ error: 'Not all ready' });
            
            if (room.mode === 'Match Berhadiah') {
                if (!room.wager || !room.wager.hostAgreed || !room.wager.memberAgreed) {
                    return res.status(400).json({ error: 'Wager not agreed by both players' });
                }
                
                const member = room.players.find((p: any) => p.name !== room.host)?.name;
                
                if (!room.wagerLocked) {
                    const hostBalance = await getPlayerBalance(room.host, room.wager.currency);
                    const memberBalance = await getPlayerBalance(member, room.wager.currency);
                    
                    if (hostBalance < room.wager.amount || memberBalance < room.wager.amount) {
                        return res.status(400).json({ error: 'Saldo salah satu pemain tidak mencukupi saat ini.' });
                    }
                    
                    await updatePlayerBalance(room.host, room.wager.currency, -room.wager.amount);
                    await updatePlayerBalance(member, room.wager.currency, -room.wager.amount);
                    room.wagerLocked = true;
                }
            }
            
            room.status = 'STARTING';
            room.players.forEach((p: any) => {
                p.progress = 0;
                p.readyForGame = false;
            });
            if (board) room.board = board;
            room.winner = null;
            
            // Timeout if players don't both ready up for game
            setTimeout(async () => {
                const currentRoom = rooms.get(roomId);
                if (currentRoom && currentRoom.status === 'STARTING') {
                    currentRoom.status = 'LOBBY';
                    // refund wager if it was locked
                    if (currentRoom.mode === 'Match Berhadiah' && currentRoom.wagerLocked) {
                        const memberName = currentRoom.players.find((p: any) => p.name !== currentRoom.host)?.name;
                        await updatePlayerBalance(currentRoom.host, currentRoom.wager.currency, currentRoom.wager.amount);
                        await updatePlayerBalance(memberName, currentRoom.wager.currency, currentRoom.wager.amount);
                        currentRoom.wagerLocked = false;
                    }
                    currentRoom.players.forEach((p: any) => p.ready = false);
                }
            }, 15000);
            
            return res.json({ success: true, room });
        }

        if (action === 'ready_for_game') {
            const { roomId, name } = req.body;
            const room = rooms.get(roomId);
            if (!room) return res.status(404).json({ error: 'Room not found' });
            
            const player = room.players.find((p: any) => p.name === name);
            if (player) {
                player.readyForGame = true;
            }

            // Check if all players are ready for game
            if (room.status === 'STARTING' && room.players.length === 2 && room.players.every((p: any) => p.readyForGame)) {
                room.status = 'ACTIVE';
                room.startAt = Date.now() + 4000; // 4 seconds for countdown (3, 2, 1, GO)
            }
            
            return res.json({ success: true, room });
        }
        
        res.status(404).json({ error: 'Not found' });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
}
