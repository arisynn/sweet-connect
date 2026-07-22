// ===================== GACHA CONFIG & RARITY =====================
const GACHA_PRIZES_COIN = [
    { id: 'gem10', name: '10 Gem', type: 'item', item: 'gems', val: 10, desc: 'Jackpot Gem (Jarang)!', iconName: 'IconGem' },
    { id: 'gem5', name: '5 Gem', type: 'item', item: 'gems', val: 5, desc: 'Mantap dapat banyak Gem!', iconName: 'IconGem' },
    { id: 'gem3', name: '3 Gem', type: 'item', item: 'gems', val: 3, desc: 'Mantap dapat Gem!', iconName: 'IconGem' },
    { id: 'gem1', name: '1 Gem', type: 'item', item: 'gems', val: 1, desc: 'Lumayan dapat Gem.', iconName: 'IconGem' },
    { id: 'c1000', name: '1.000 Koin', type: 'item', item: 'coins', val: 1000, desc: 'Balik modal dan untung!', iconName: 'IconCoin' },
    { id: 'c500', name: '500 Koin', type: 'item', item: 'coins', val: 500, desc: 'Balik modal!', iconName: 'IconCoin' },
    { id: 'c200', name: '200 Koin', type: 'item', item: 'coins', val: 200, desc: 'Koin balikan.', iconName: 'IconCoin' },
    { id: 'c100', name: '100 Koin', type: 'item', item: 'coins', val: 100, desc: 'Koin hiburan.', iconName: 'IconCoin' },
    { id: 'hint5', name: '+5 Hint', type: 'item', item: 'hints', val: 5, desc: 'Cheat legal dari sistem.', iconName: 'IconSearch' },
    { id: 'shuffle5', name: '+5 Shuffle', type: 'item', item: 'shuffles', val: 5, desc: 'Anti mentok-mentok club.', iconName: 'IconRefresh' },
    { id: 'hp1', name: '+1 Nyawa', type: 'item', item: 'hp', val: 1, desc: 'Cadangan nyawa ekstra.', iconName: 'IconHeart' },
];

const GACHA_RARITY = {
    coin: [
        { id: 'gem10', chance: 3.0 },
        { id: 'gem5', chance: 11.0 },
        { id: 'gem3', chance: 26.0 },
        { id: 'gem1', chance: 46.0 },
        { id: 'c1000', chance: 48.0 },
        { id: 'c500', chance: 53.0 },
        { id: 'c200', chance: 63.0 },
        { id: 'c100', chance: 73.0 },
        { id: 'hint5', chance: 82.0 },
        { id: 'shuffle5', chance: 91.0 },
        { id: 'hp1', chance: 100.0 },
    ]
};

let getPrizeByRarity = (poolType) => {
    const rand = Math.random() * 100;
    const rarityConfig = GACHA_RARITY['coin'];
    const prizePool = GACHA_PRIZES_COIN;
    
    for (const item of rarityConfig) {
        if (rand < item.chance) {
            return prizePool.find(p => p.id === item.id) || prizePool[prizePool.length - 1];
        }
    }
    return prizePool[prizePool.length - 1];
};


// GACHA THEME
const GACHA_PRIZES_THEME = [
    { id: 'rb_50', name: '50 Permen Pelangi', type: 'item', item: 'rainbow_candy', val: 50, desc: 'Jackpot Gacha Tema!', iconName: 'IconStar' },
    { id: 'rb_25', name: '25 Permen Pelangi', type: 'item', item: 'rainbow_candy', val: 25, desc: 'Banyak Permen Pelangi!', iconName: 'IconStar' },
    { id: 'rb_10', name: '10 Permen Pelangi', type: 'item', item: 'rainbow_candy', val: 10, desc: 'Lumayan buat nabung Tema.', iconName: 'IconStar' },
    { id: 'rb_5', name: '5 Permen Pelangi', type: 'item', item: 'rainbow_candy', val: 5, desc: 'Permen Pelangi biasa.', iconName: 'IconStar' },
    { id: 't_coin500', name: '500 Koin', type: 'item', item: 'coins', val: 500, desc: 'Bonus Koin!', iconName: 'IconCoin' },
    { id: 't_hint1', name: '+1 Hint', type: 'item', item: 'hints', val: 1, desc: 'Bantuan Hint ekstra.', iconName: 'IconSearch' },
    { id: 't_shuffle1', name: '+1 Shuffle', type: 'item', item: 'shuffles', val: 1, desc: 'Bantuan Shuffle ekstra.', iconName: 'IconRefresh' },
    { id: 't_hp1', name: '+1 Nyawa', type: 'item', item: 'hp', val: 1, desc: 'Nyawa ekstra.', iconName: 'IconHeart' }
];

GACHA_RARITY.theme = [
    { id: 'rb_50', chance: 2.0 },
    { id: 'rb_25', chance: 10.0 },
    { id: 'rb_10', chance: 35.0 },
    { id: 'rb_5', chance: 70.0 },
    { id: 't_coin500', chance: 80.0 },
    { id: 't_hint1', chance: 90.0 },
    { id: 't_shuffle1', chance: 95.0 },
    { id: 't_hp1', chance: 100.0 }
];

const originalGetPrizeByRarity = getPrizeByRarity;
getPrizeByRarity = (poolType) => {
    const rand = Math.random() * 100;
    const rarityConfig = GACHA_RARITY[poolType];
    const prizePool = poolType === 'theme' ? GACHA_PRIZES_THEME : GACHA_PRIZES_COIN;
    
    for (const item of rarityConfig) {
        if (rand < item.chance) {
            return prizePool.find(p => p.id === item.id) || prizePool[prizePool.length - 1];
        }
    }
    return prizePool[prizePool.length - 1];
};
