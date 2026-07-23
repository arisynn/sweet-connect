window.InventoryEngine = {
    hasTheme: (profile, themeId) => {
        return profile.unlockedThemes.includes(themeId);
    },
    unlockTheme: (profile, themeId) => {
        if (!profile.unlockedThemes.includes(themeId)) {
            profile.unlockedThemes.push(themeId);
            return true;
        }
        return false;
    },
    setActiveTheme: (profile, themeId) => {
        if (window.InventoryEngine.hasTheme(profile, themeId)) {
            profile.activeTheme = themeId;
            return true;
        }
        return false;
    }
};
