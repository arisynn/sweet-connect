// ===================== REACT HOOKS =====================
const { useState, useEffect, useCallback, useRef, useMemo } = React;

// ===================== BOARD DIMENSIONS =====================
const ROWS = 16;
const COLS = 10;

// ===================== SHOP CONFIGURATION =====================
const SHOP_ITEMS = [];

const THEME_BADGE_TEXT = "Eksklusif";

// ===================== THEMES =====================
let THEMES = {};

// We can add a function to inject the custom theme if needed
function getFallbackThemes() {
    return {
        sweets: { 
            name: 'Dessert (Basic)', price: 0, currency: 'coins', type: 'standar',
            data: ['🍰','🧁','🍩','🍪','🍫','🍬','🍭','🍮','🍯','🍨','🍧','🍦','🥧','🎂','🥐','🥞','🧇','🧋'],
            colors: { bg: '#fdf2f8', border: '#fbcfe8', text: '#ec4899', accent: '#ec4899', buttonActive: '#e11d48' }
        },
        custom: {
            name: 'Tema Pribadi', type: 'reward',
            data: [], // Users can fill this in
            backgroundOptions: [
                { bg: '#fdf4ff', border: '#f0abfc', text: '#db2777', accent: '#f472b6', buttonActive: '#be185d' }
            ],
            colors: { bg: '#fdf4ff', border: '#f0abfc', text: '#db2777', accent: '#f472b6', buttonActive: '#be185d' }
        }
    };
}

// ===================== BACKEND CONFIG =====================
const PROFILE_API_URL = "/api/profile";
