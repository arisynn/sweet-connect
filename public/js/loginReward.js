window.LOGIN_REWARDS_POOL = [
    [
        { day: 1, reward: { coins: 200 } },
        { day: 2, reward: { hints: 1, shuffles: 1 } },
        { day: 3, reward: { gems: 5, gacha_vouchers: 1 } },
        { day: 4, reward: { coins: 500 } },
        { day: 5, reward: { hp: 2 } },
        { day: 6, reward: { gacha_vouchers: 2 } },
        { day: 7, reward: { gems: 15, gacha_vouchers: 3, candy: 5, theme: 'custom' } }
    ],
    [
        { day: 1, reward: { hints: 2 } },
        { day: 2, reward: { coins: 300 } },
        { day: 3, reward: { gems: 5, gacha_vouchers: 1 } },
        { day: 4, reward: { shuffles: 2 } },
        { day: 5, reward: { hp: 2 } },
        { day: 6, reward: { gacha_vouchers: 2 } },
        { day: 7, reward: { gems: 20, gacha_vouchers: 2, candy: 5, theme: 'custom' } }
    ],
    [
        { day: 1, reward: { shuffles: 2 } },
        { day: 2, reward: { coins: 300 } },
        { day: 3, reward: { gems: 5, gacha_vouchers: 1 } },
        { day: 4, reward: { hints: 2 } },
        { day: 5, reward: { coins: 800 } },
        { day: 6, reward: { gacha_vouchers: 2 } },
        { day: 7, reward: { gems: 10, gacha_vouchers: 5, candy: 5, theme: 'custom' } }
    ]
];

window.getLoginRewardConfig = function(profile) {
    let weekCycle = profile.loginRewardCycle || 0;
    return window.LOGIN_REWARDS_POOL[weekCycle % window.LOGIN_REWARDS_POOL.length];
};

window.checkLoginRewardStatus = function(profile) {
    const today = new Date().toDateString();
    let loginData = profile.loginReward || { date: null, dayCount: 0 };
    
    let canClaim = false;
    
    if (loginData.date !== today) {
        canClaim = true;
    }
    
    return { canClaim, currentDay: loginData.dayCount, data: loginData };
};
