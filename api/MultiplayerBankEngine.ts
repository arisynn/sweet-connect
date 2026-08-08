import { getSupabase } from './supabase.js';

export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';

export interface WagerOffer {
    offerId: string;
    roomId: string;
    hostId: string;
    guestId: string;
    amount: number;
    currency: string;
    status: OfferStatus;
    createdAt: number;
    expiresAt: number;
}

export interface BankTransaction {
    hostContribution: number;
    guestContribution: number;
    totalBank: number;
    currency: string;
}

const activeOffers = new Map<string, WagerOffer>();
const roomBanks = new Map<string, BankTransaction>();

function generateId() {
    return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export const MultiplayerBankEngine = {
    createOffer: async (roomId: string, hostId: string, guestId: string, amount: number, currency: string): Promise<WagerOffer> => {
        // Validate host balance
        const supabase = getSupabase();
        if (supabase) {
            const { data } = await supabase.from('profiles').select('profile_data').eq('player_name', hostId).maybeSingle();
            let pData = data?.profile_data;
            if (typeof pData === 'string') {
                try { pData = JSON.parse(pData); } catch(e){}
            }
            const balance = pData?.gameData?.[currency] || 0;
            if (balance < amount) {
                throw new Error("INSUFFICIENT_BALANCE: Saldo tidak mencukupi.");
            }
        }
        
        const offerId = 'offer_' + generateId();
        const offer: WagerOffer = {
            offerId,
            roomId,
            hostId,
            guestId,
            amount,
            currency,
            status: 'PENDING',
            createdAt: Date.now(),
            expiresAt: Date.now() + 30000 // 30s expiry
        };
        activeOffers.set(offerId, offer);
        
        return offer;
    },

    getOffer: (offerId: string): WagerOffer | undefined => {
        const offer = activeOffers.get(offerId);
        if (offer && offer.status === 'PENDING' && offer.expiresAt < Date.now()) {
            offer.status = 'EXPIRED';
        }
        return offer;
    },
    
    getActiveOfferForRoom: (roomId: string): WagerOffer | undefined => {
        for (const offer of activeOffers.values()) {
            if (offer.roomId === roomId && offer.status === 'PENDING') {
                if (offer.expiresAt < Date.now()) {
                    offer.status = 'EXPIRED';
                } else {
                    return offer;
                }
            }
        }
        return undefined;
    },

    acceptOffer: async (offerId: string, guestId: string): Promise<WagerOffer> => {
        const offer = MultiplayerBankEngine.getOffer(offerId);
        if (!offer) throw new Error("Offer tidak ditemukan.");
        if (offer.status === 'EXPIRED') throw new Error("OFFER_EXPIRED: Tawaran sudah kedaluwarsa.");
        if (offer.status !== 'PENDING') throw new Error("OFFER_ALREADY_PROCESSED: Tawaran sudah diproses.");
        if (offer.guestId !== guestId) throw new Error("Akses ditolak.");
        
        // Validate guest balance
        const supabase = getSupabase();
        if (supabase) {
            const { data } = await supabase.from('profiles').select('profile_data').eq('player_name', guestId).maybeSingle();
            let pData = data?.profile_data;
            if (typeof pData === 'string') {
                try { pData = JSON.parse(pData); } catch(e){}
            }
            const balance = pData?.gameData?.[offer.currency] || 0;
            if (balance < offer.amount) {
                throw new Error("INSUFFICIENT_BALANCE: Saldo tidak mencukupi.");
            }
        }
        
        offer.status = 'ACCEPTED';
        return offer;
    },

    rejectOffer: (offerId: string, guestId: string): WagerOffer => {
        const offer = MultiplayerBankEngine.getOffer(offerId);
        if (!offer) throw new Error("Offer tidak ditemukan.");
        if (offer.status === 'EXPIRED') throw new Error("OFFER_EXPIRED: Tawaran sudah kedaluwarsa.");
        if (offer.status !== 'PENDING') throw new Error("OFFER_ALREADY_PROCESSED: Tawaran sudah diproses.");
        if (offer.guestId !== guestId) throw new Error("Akses ditolak.");
        
        offer.status = 'REJECTED';
        return offer;
    },

    cancelOffer: (offerId: string, hostId: string): WagerOffer => {
        const offer = MultiplayerBankEngine.getOffer(offerId);
        if (!offer) throw new Error("Offer tidak ditemukan.");
        if (offer.status !== 'PENDING') throw new Error("OFFER_ALREADY_PROCESSED: Tawaran tidak bisa dibatalkan.");
        if (offer.hostId !== hostId) throw new Error("Akses ditolak.");
        
        offer.status = 'CANCELLED';
        return offer;
    },
    
    cancelRoomOffers: (roomId: string) => {
        for (const offer of activeOffers.values()) {
            if (offer.roomId === roomId && offer.status === 'PENDING') {
                offer.status = 'CANCELLED';
            }
        }
    },

    setupBank: async (offer: WagerOffer, updatePlayerBalanceFn: (name: string, currency: string, change: number) => Promise<number>): Promise<{ bank: BankTransaction, newBalances: Record<string, number> }> => {
        if (offer.status !== 'ACCEPTED') throw new Error("Offer must be accepted to setup bank.");
        
        const newBalances: Record<string, number> = {};
        
        try {
            newBalances[offer.hostId] = await updatePlayerBalanceFn(offer.hostId, offer.currency, -offer.amount);
        } catch (e) {
            throw new Error('TRANSACTION_FAILED: Transaksi taruhan gagal. Tidak ada saldo yang terpotong.');
        }
        
        try {
            newBalances[offer.guestId] = await updatePlayerBalanceFn(offer.guestId, offer.currency, -offer.amount);
        } catch (e) {
            // Revert host
            newBalances[offer.hostId] = await updatePlayerBalanceFn(offer.hostId, offer.currency, offer.amount);
            throw new Error('TRANSACTION_FAILED: Transaksi taruhan gagal. Tidak ada saldo yang terpotong.');
        }
        
        const bank: BankTransaction = {
            hostContribution: offer.amount,
            guestContribution: offer.amount,
            totalBank: offer.amount * 2,
            currency: offer.currency
        };
        roomBanks.set(offer.roomId, bank);
        return { bank, newBalances };
    },
    
    getBank: (roomId: string): BankTransaction | undefined => {
        return roomBanks.get(roomId);
    },

    clearBank: (roomId: string) => {
        roomBanks.delete(roomId);
    }
};
