window.useShopManager = ({ profile, setProfile, playerName, hp, setHp }) => {
    const handleBuyHpInGame = () => {
        if (hp >= 5) {
            window.Dialog.showToast("Nyawa kamu sudah penuh (Maksimal 5).", "info");
            return;
        }
        
        const hpNeeded = 5 - hp;
        const costPerHp = 15;
        const totalCost = hpNeeded * costPerHp;

        window.Dialog.showConfirm("Isi Penuh Nyawa", `Isi penuh Nyawa (+${hpNeeded}) seharga ${totalCost} Gem?`, "Beli", "Batal", async () => {
            if ((profile.gems || 0) < totalCost) {
                window.Dialog.showToast(`Gem tidak cukup! Butuh ${totalCost} Gem.`, "error");
                return;
            }
            setHp(5);
            const newProfile = { ...profile, gems: profile.gems - totalCost, hp: 5, lastHpRegenTime: null };
            setProfile(newProfile);
            await window.saveProfile(playerName, newProfile);
            window.Dialog.showToast("Nyawa sudah terisi penuh!", "success");
        });
    };
    
    const handleBuyStore = async (item, qty = 1) => {
        let newProfile = { ...profile };

        const actualId = item.itemId || item.id;
        if (actualId === 'hp' && profile.hp + qty > 5) { window.Dialog.showInfo("Penuh", `Nyawa kamu akan melebihi maksimal 5 (Beli: ${qty}, Punya: ${profile.hp})!`); return; }
        
        const totalPrice = (item.price || 0) * qty;

        if (item.currency === 'gems') {
            if ((profile.gems || 0) < totalPrice) { window.Dialog.showError("Gagal", "Gem kamu tidak cukup!"); return; }
            newProfile.gems = (profile.gems || 0) - totalPrice;
        } else {
            if (profile.coins < totalPrice) { window.Dialog.showError("Gagal", "Koin kamu tidak cukup!"); return; }
            newProfile.coins -= totalPrice;
        }
        
        if (item.type === 'tema') {
            newProfile.unlockedThemes = [...newProfile.unlockedThemes, item.id];
            newProfile.newThemes = [...(newProfile.newThemes || []), item.id];
            
            // Simpan cache asset ke LocalStorage untuk premium theme
            const themeDataObj = THEMES[item.id];
            if (themeDataObj && themeDataObj.type === 'premium') {
                try {
                    const cacheArr = [];
                    for (let i = 0; i < themeDataObj.data.length; i++) {
                        const url = themeDataObj.data[i];
                        if (url.startsWith('http') || url.startsWith('/')) {
                            // Coba fetch dan simpan base64
                            const resp = await fetch(url);
                            const blob = await resp.blob();
                            const reader = new FileReader();
                            const base64 = await new Promise((resolve) => {
                                reader.onloadend = () => resolve(reader.result);
                                reader.readAsDataURL(blob);
                            });
                            cacheArr.push(base64);
                        } else {
                            cacheArr.push(url); // emoji dll
                        }
                    }
                    localStorage.setItem(`pkmnThemeAssets_${item.id}`, JSON.stringify(cacheArr));
                    // Update the global THEMES object to use the base64 cache
                    THEMES[item.id].data = cacheArr;
                } catch (e) {
                    console.error("Gagal mendownload asset tema ke cache", e);
                }
            }

            // Setup preferred background logic if selected
            if (item.selectedBgIndex !== undefined && THEMES[item.id]) {
                const bgOpt = THEMES[item.id].backgroundOptions?.[item.selectedBgIndex];
                if (bgOpt) {
                    // Update global THEMES objects in memory so it applies immediately
                    THEMES[item.id].colors = {
                        ...THEMES[item.id].colors,
                        bg: bgOpt.bg,
                        border: bgOpt.border,
                        text: bgOpt.text,
                        accent: bgOpt.accent,
                        buttonActive: bgOpt.buttonActive
                    };
                }
            }
        }
        else if (item.type === 'item') {
            if (actualId === 'hp') newProfile.hp = Math.min(5, newProfile.hp + qty);
            if (actualId === 'hints') newProfile.hints = Math.min(99, newProfile.hints + (3 * qty));
            if (actualId === 'shuffles') newProfile.shuffles = Math.min(99, newProfile.shuffles + (3 * qty));
        }
        else if (item.type === 'item_bulk') {
            if (item.itemId === 'hp') newProfile.hp = Math.min(5, newProfile.hp + (item.val * qty));
            if (item.itemId === 'hints') newProfile.hints = Math.min(99, newProfile.hints + (item.val * qty));
            if (item.itemId === 'shuffles') newProfile.shuffles = Math.min(99, newProfile.shuffles + (item.val * qty));
            if (item.itemId === 'gems') newProfile.gems = (newProfile.gems || 0) + (item.val * qty);
            if (item.itemId === 'coins') newProfile.coins = newProfile.coins + (item.val * qty);
        }
        else if (item.type === 'item_special') {
            const rewards = ['hints', 'shuffles', 'gems', 'coins'];
            const rewardType = rewards[Math.floor(Math.random() * rewards.length)];
            let baseQty = 0; let label = '';
            if (rewardType === 'hints') { baseQty = 10; label = 'Hint'; }
            if (rewardType === 'shuffles') { baseQty = 10; label = 'Shuffle'; }
            if (rewardType === 'gems') { baseQty = 5; label = 'Gem'; }
            if (rewardType === 'coins') { baseQty = 2000; label = 'Koin'; }
            newProfile[rewardType] = (newProfile[rewardType] || 0) + (baseQty * qty);
            window.Dialog.showSuccess("Gacha Hoki!", `Kamu mendapatkan ${(baseQty * qty)} ${label}!`);
        }
        else if (item.type === 'flex') newProfile.flexCrown = true;
        
        if (item.type === 'theme') {
            newProfile = window.updateStatistics(newProfile, { themesBoughtDelta: 1 });
        } else if (item.type === 'item' || item.type === 'item_bulk' || item.type === 'item_special') {
            newProfile = window.updateStatistics(newProfile, { powerupsBoughtDelta: qty });
        }
        
        setProfile(newProfile); await window.saveProfile(playerName, newProfile);
        if (item.type !== 'item_special') window.Dialog.showSuccess("Berhasil", `Berhasil membeli ${qty}x ${item.name}!`);
    };

    const handleSellStore = async (actionType, qty) => {
        let newProfile = { ...profile };
        
        if (actionType === 'sell_hint') {
            if ((profile.hints || 0) < qty) { window.Dialog.showError("Gagal", "Hint kamu tidak cukup!"); return; }
            newProfile.hints = (profile.hints || 0) - qty;
            newProfile.coins = (newProfile.coins || 0) + Math.floor((50 * qty) * 0.9);
        } else if (actionType === 'sell_shuffle') {
            if ((profile.shuffles || 0) < qty) { window.Dialog.showError("Gagal", "Shuffle kamu tidak cukup!"); return; }
            newProfile.shuffles = (profile.shuffles || 0) - qty;
            newProfile.coins = (newProfile.coins || 0) + Math.floor((50 * qty) * 0.9);
        } else if (actionType === 'exchange_nyawa') {
            if ((profile.hp || 0) <= qty) { window.Dialog.showError("Gagal", "Nyawa kamu tidak cukup! Sisakan minimal 1."); return; }
            const tax = 50 * qty;
            if ((profile.coins || 0) < tax) { window.Dialog.showError("Gagal", `Koin kamu tidak cukup untuk bayar pajak! Butuh ${tax} Koin.`); return; }
            newProfile.hp = (profile.hp || 0) - qty;
            newProfile.coins = (profile.coins || 0) - tax;
            newProfile.gems = (newProfile.gems || 0) + qty;
            if (!newProfile.statistics) newProfile.statistics = {};
            newProfile.statistics.totalTicketsEarned = (newProfile.statistics.totalTicketsEarned || 0) + qty;
        }
        setProfile(newProfile); await window.saveProfile(playerName, newProfile);
        window.Dialog.showSuccess("Berhasil", "Transaksi sukses!");
    };

    return { handleBuyHpInGame, handleBuyStore, handleSellStore };
};
