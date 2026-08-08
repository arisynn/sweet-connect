

const useGachaEngine = ({ profile, onOpenComplete, AudioEngine, THEMES, gachaMode }) => {
    const [opening, setOpening] = useState(false);
    const [wonPrize, setWonPrize] = useState(null);
    const [wonPrizesList, setWonPrizesList] = useState(null);
    const [gachaState, setGachaState] = useState('idle');

    const getIconComponent = (iconName) => {
        const iconProps = { className: "w-full h-full p-1.5 drop-shadow-md" };
        switch (iconName) {
            case 'IconCoin': return <IconCoin {...iconProps} />;
            case 'IconSearch': return <IconSearch {...iconProps} />;
            case 'IconRefresh': return <IconRefresh {...iconProps} />;
            case 'IconGem': return <IconGem {...iconProps} />;
            case 'IconStar': return <IconRainbowCandy {...iconProps} />;
            default: return <IconGift {...iconProps} />;
        }
    };

    const currentPrizesCoin = [
        { id: 'c1000', label: '1000', type: 'item', item: 'coins', val: 1000, desc: 'Jackpot Koin!', iconName: 'IconCoin' },
        { id: 'gem50', label: '50', type: 'item', item: 'gems', val: 50, desc: 'Super Jackpot Gem!', iconName: 'IconGem' },
        { id: 'hint5', label: '5', type: 'item', item: 'hints', val: 5, desc: 'Banyak Hint!', iconName: 'IconSearch' },
        { id: 'shuffle5', label: '5', type: 'item', item: 'shuffles', val: 5, desc: 'Banyak Shuffle!', iconName: 'IconRefresh' },

        { id: 'c500', label: '500', type: 'item', item: 'coins', val: 500, desc: 'Balik modal!', iconName: 'IconCoin' },
        { id: 'gem25', label: '25', type: 'item', item: 'gems', val: 25, desc: 'Jackpot Gem!', iconName: 'IconGem' },
        { id: 'hint3', label: '3', type: 'item', item: 'hints', val: 3, desc: 'Lumayan Hint!', iconName: 'IconSearch' },
        { id: 'shuffle3', label: '3', type: 'item', item: 'shuffles', val: 3, desc: 'Lumayan Shuffle!', iconName: 'IconRefresh' },

        { id: 'c200', label: '200', type: 'item', item: 'coins', val: 200, desc: 'Koin balikan.', iconName: 'IconCoin' },
        { id: 'gem10', label: '10', type: 'item', item: 'gems', val: 10, desc: 'Banyak Gem!', iconName: 'IconGem' },
        { id: 'hint2', label: '2', type: 'item', item: 'hints', val: 2, desc: 'Ekstra Hint.', iconName: 'IconSearch' },
        { id: 'shuffle2', label: '2', type: 'item', item: 'shuffles', val: 2, desc: 'Ekstra Shuffle.', iconName: 'IconRefresh' },

        { id: 'c100', label: '100', type: 'item', item: 'coins', val: 100, desc: 'Koin hiburan.', iconName: 'IconCoin' },
        { id: 'gem5', label: '5', type: 'item', item: 'gems', val: 5, desc: 'Mantap dapat Gem!', iconName: 'IconGem' },
        { id: 'hint1', label: '1', type: 'item', item: 'hints', val: 1, desc: 'Satu Hint.', iconName: 'IconSearch' },
        { id: 'shuffle1', label: '1', type: 'item', item: 'shuffles', val: 1, desc: 'Satu Shuffle.', iconName: 'IconRefresh' },

        { id: 'c50', label: '50', type: 'item', item: 'coins', val: 50, desc: 'Koin kecil.', iconName: 'IconCoin' },
        { id: 'gem1', label: '1', type: 'item', item: 'gems', val: 1, desc: 'Satu Gem.', iconName: 'IconGem' },
        { id: 'hint1_2', label: '1', type: 'item', item: 'hints', val: 1, desc: 'Satu Hint.', iconName: 'IconSearch' },
        { id: 'shuffle1_2', label: '1', type: 'item', item: 'shuffles', val: 1, desc: 'Satu Shuffle.', iconName: 'IconRefresh' },
    ].map(p => ({ 
        ...p, 
        icon: getIconComponent(p.iconName), 
        name: p.item === 'coins' ? `${p.val} Koin` : p.item === 'gems' ? `${p.val} Gem` : p.item === 'hints' ? `${p.val} Hint` : `${p.val} Shuffle` 
    }));

    const currentPrizesTheme = (typeof GACHA_PRIZES_THEME !== 'undefined' ? GACHA_PRIZES_THEME : []).map(p => ({
        ...p, icon: getIconComponent(p.iconName)
    }));

    const activePrizes = gachaMode === 'item' ? currentPrizesCoin : currentPrizesTheme;

    const processReward = (times, firstPrize, costType, cost, poolType, customPrizes = null) => {
        const updatedProfile = { ...profile, [costType]: (profile[costType] || 0) - cost };

        const getRandomFnWrapped = () => {
            const raw = getPrizeByRarity(poolType);
            return { ...raw, icon: getIconComponent(raw.iconName) };
        };

        if (times === 1) {
            let actualPrize = customPrizes ? { ...customPrizes[0] } : { ...firstPrize };
            if (!updatedProfile.statistics) updatedProfile.statistics = {};

            if (firstPrize.item === 'hp') {
                if (updatedProfile.hp >= 5) {
                    actualPrize = { ...firstPrize, name: `${firstPrize.val * 100} Koin (Konversi HP)`, item: 'coins', val: firstPrize.val * 100, icon: <IconCoin className="w-full h-full p-1.5 drop-shadow-md"/>, desc: 'HP penuh, dikonversi jadi Koin!' };
                    updatedProfile.coins += actualPrize.val;
                } else {
                    let hpToAdd = firstPrize.val;
                    if (updatedProfile.hp + hpToAdd > 5) {
                        const excess = (updatedProfile.hp + hpToAdd) - 5;
                        hpToAdd = 5 - updatedProfile.hp;
                        updatedProfile.coins += (excess * 100);
                        actualPrize.desc = `Sebagian dikonversi ke Koin (+${excess*100}) karena HP maksimal 5.`;
                    }
                    updatedProfile.hp += hpToAdd;
                }
            }
            else if (firstPrize.item === 'coins') {
                updatedProfile.coins += firstPrize.val;
            }
            else if (firstPrize.item === 'gems') {
                updatedProfile.gems = (updatedProfile.gems || 0) + firstPrize.val;
            }
            else if (firstPrize.item === 'hints') updatedProfile.hints = Math.min(99, (updatedProfile.hints || 0) + firstPrize.val);
            else if (firstPrize.item === 'shuffles') updatedProfile.shuffles = Math.min(99, (updatedProfile.shuffles || 0) + firstPrize.val);
            else if (firstPrize.item === 'rainbow_candy') {
                updatedProfile.rainbow_candy = (updatedProfile.rainbow_candy || 0) + firstPrize.val;
            }
            
            setWonPrize(actualPrize);
            onOpenComplete(updatedProfile, 1); 
        } else {
            let totalKoin = 0;
            let totalGem = 0;
            let totalHP = 0;
            let totalHints = 0;
            let totalShuffles = 0;
            let totalRainbow = 0;
            
            const resultsList = [];
            
            for (let i = 0; i < 10; i++) {
                let p = customPrizes ? customPrizes[i] : (i === 0 ? firstPrize : getRandomFnWrapped());
                let actualPrize = { ...p };
                
                if (p.item === 'coins') {
                    totalKoin += p.val;
                } else if (p.item === 'gems') {
                    totalGem += p.val;
                } else if (p.item === 'hp') {
                    totalHP += p.val;
                } else if (p.item === 'hints') {
                    totalHints += p.val;
                } else if (p.item === 'shuffles') {
                    totalShuffles += p.val;
                } else if (p.item === 'rainbow_candy') {
                    totalRainbow += p.val;
                }
                
                resultsList.push(actualPrize);
            }
            
            if (totalHP > 0) {
                if (updatedProfile.hp >= 5) {
                    totalKoin += totalHP * 100;
                } else {
                    let hpToAdd = totalHP;
                    if (updatedProfile.hp + totalHP > 5) {
                        const excess = (updatedProfile.hp + totalHP) - 5;
                        hpToAdd = 5 - updatedProfile.hp;
                        totalKoin += (excess * 100);
                    }
                    updatedProfile.hp += hpToAdd;
                }
            }
            
            if (totalKoin > 0) updatedProfile.coins += totalKoin;
            if (totalGem > 0) updatedProfile.gems = (updatedProfile.gems || 0) + totalGem;
            if (totalHints > 0) updatedProfile.hints = Math.min(99, (updatedProfile.hints || 0) + totalHints);
            if (totalShuffles > 0) updatedProfile.shuffles = Math.min(99, (updatedProfile.shuffles || 0) + totalShuffles);
            if (totalRainbow > 0) updatedProfile.rainbow_candy = (updatedProfile.rainbow_candy || 0) + totalRainbow;

            if (!updatedProfile.statistics) updatedProfile.statistics = {};
            
            setWonPrizesList({
                items: resultsList,
                summary: {
                    coins: totalKoin,
                    gems: totalGem,
                    hints: totalHints,
                    shuffles: totalShuffles,
                    rainbow: totalRainbow
                }
            });
            onOpenComplete(updatedProfile, 10);
        }
    };

    const spinGacha = (times) => {
        const poolType = gachaMode === 'item' ? 'coin' : 'theme';
        const vouchers = profile.gacha_vouchers || 0;
        const canUseVoucher = gachaMode === 'item' && vouchers >= times;
        const costType = canUseVoucher ? 'gacha_vouchers' : (gachaMode === 'item' ? 'coins' : 'gems');
        const cost = canUseVoucher ? times : (gachaMode === 'item' ? (times === 1 ? 500 : 4500) : (times === 1 ? 50 : 450));

        if ((profile[costType] || 0) < cost || opening) return;
        setOpening(true); 
        setGachaState('shaking');
        if (AudioEngine) AudioEngine.spin();

        const rawFinalPrize = getPrizeByRarity(poolType);
        const finalPrize = { ...rawFinalPrize, icon: getIconComponent(rawFinalPrize.iconName) };
        
        setTimeout(() => {
            setGachaState('open');
            if (AudioEngine) AudioEngine.uiReward();
            
            setTimeout(() => {
                setOpening(false);
                setGachaState('idle');
                processReward(times, finalPrize, costType, cost, poolType);
            }, 800);
        }, 1500);
    };

    const exchangeTheme = (themeKey, price) => {
        if ((profile.rainbow_candy || 0) < price) return;
        const updatedProfile = { ...profile, rainbow_candy: profile.rainbow_candy - price };
        updatedProfile.unlockedThemes = [...(updatedProfile.unlockedThemes || []), themeKey];
        updatedProfile.newThemes = [...(updatedProfile.newThemes || []), themeKey];
        onOpenComplete(updatedProfile, 0); // using 0 to just save profile silently
        window.Dialog.showSuccess("Berhasil", `Berhasil menukar Tema ${THEMES[themeKey].name}!`);
    };

    return {
        opening, setOpening,
        wonPrize, setWonPrize,
        wonPrizesList, setWonPrizesList,
        gachaState,
        currentPrizesCoin,
        currentPrizesTheme,
        activePrizes,
        processReward,
        spinGacha,
        exchangeTheme,
        getIconComponent
    };
};
