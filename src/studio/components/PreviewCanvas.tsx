import React, { useState } from 'react';
import { useThemeContext } from '../context/ThemeContext';
import { Settings, User, Trophy, ShoppingCart, Play, Maximize2 } from 'lucide-react';

export function PreviewCanvas() {
  const { theme, getAssetUrl } = useThemeContext();
  const [currentScreen, setCurrentScreen] = useState<'menu' | 'gameplay' | 'shop'>('menu');

  const bgUrl = getAssetUrl(theme.assets.background);
  const logoUrl = getAssetUrl(theme.assets.logo);
  const particleUrl = getAssetUrl(theme.assets.particles);

  const cssVars = {
    '--theme-primary': theme.colors.primary,
    '--theme-secondary': theme.colors.secondary,
    '--theme-bg': theme.colors.background,
    '--theme-surface': theme.colors.surface,
    '--theme-text': theme.colors.text,
    '--theme-text-inverse': theme.colors.textInverse,
    '--theme-accent': theme.colors.accent,
    '--theme-radius': theme.styles.borderRadius,
    '--theme-button-radius': theme.styles.buttonRadius,
    '--theme-shadow': theme.styles.shadowSize,
    fontFamily: theme.styles.fontFamily,
  } as React.CSSProperties;

  return (
    <div className="flex flex-col items-center gap-6 w-full h-full">
      {/* Screen Selector */}
      <div className="flex gap-2 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-sm border border-slate-200">
        <button 
          onClick={() => setCurrentScreen('menu')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${currentScreen === 'menu' ? 'bg-pink-500 text-white shadow-md shadow-pink-200' : 'text-slate-500 hover:bg-pink-50'}`}
        >
          Main Menu
        </button>
        <button 
          onClick={() => setCurrentScreen('gameplay')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${currentScreen === 'gameplay' ? 'bg-pink-500 text-white shadow-md shadow-pink-200' : 'text-slate-500 hover:bg-pink-50'}`}
        >
          Gameplay
        </button>
        <button 
          onClick={() => setCurrentScreen('shop')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${currentScreen === 'shop' ? 'bg-pink-500 text-white shadow-md shadow-pink-200' : 'text-slate-500 hover:bg-pink-50'}`}
        >
          Shop
        </button>
      </div>

      {/* Device Frame */}
      <div 
        className="relative w-full max-w-[320px] aspect-[9/19.5] bg-[var(--theme-bg)] rounded-[3rem] shadow-2xl overflow-hidden border-[12px] border-slate-900 transition-all duration-300 transform scale-100 ring-4 ring-pink-100"
        style={cssVars}
      >
        {/* Background Layer */}
        {bgUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-500"
            style={{ backgroundImage: `url(${bgUrl})` }}
          />
        )}

        {/* Particle Layer (Fake) */}
        {particleUrl && (
          <div 
            className="absolute inset-0 bg-[length:100px_100px] opacity-40 animate-pulse pointer-events-none"
            style={{ backgroundImage: `url(${particleUrl})` }}
          />
        )}

        {/* Content Layer */}
        <div className="absolute inset-0 flex flex-col z-10 text-[var(--theme-text)]">
          {currentScreen === 'menu' && <MainMenuPreview logoUrl={logoUrl} />}
          {currentScreen === 'gameplay' && <GameplayPreview />}
          {currentScreen === 'shop' && <ShopPreview />}
        </div>
      </div>
    </div>
  );
}

function MainMenuPreview({ logoUrl }: { logoUrl: string }) {
  const { theme, getAssetUrl } = useThemeContext();
  const coinUrl = getAssetUrl(theme.assets.ui['coin']);
  
  return (
    <div className="flex flex-col h-full justify-between p-6">
      <div className="flex justify-between items-center mt-8">
        <div className="bg-[var(--theme-surface)] rounded-[var(--theme-button-radius)] px-4 py-2 flex items-center gap-2 shadow-[var(--theme-shadow)]">
           <User className="w-4 h-4 text-[var(--theme-primary)]" />
           <span className="font-bold text-xs">Player</span>
        </div>
        <div className="bg-[var(--theme-surface)] rounded-[var(--theme-button-radius)] px-4 py-2 flex items-center gap-2 shadow-[var(--theme-shadow)]">
           {coinUrl ? <img src={coinUrl} className="w-4 h-4" alt="coin" /> : <span className="text-[var(--theme-accent)] font-bold">🪙</span>}
           <span className="font-bold text-xs">999</span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 gap-8">
         {logoUrl ? (
           <img src={logoUrl} alt="Logo" className="w-48 object-contain drop-shadow-xl animate-bounce" style={{ animationDuration: '3s' }} />
         ) : (
           <h1 className="text-4xl font-black italic drop-shadow-lg text-center" style={{ color: 'var(--theme-primary)', textShadow: '2px 4px 0px var(--theme-secondary)' }}>
             {theme.metadata.name || 'Game Title'}
           </h1>
         )}

         <button 
           className="px-10 py-5 rounded-[var(--theme-button-radius)] font-black text-xl shadow-[var(--theme-shadow)] transform transition active:scale-95 flex items-center gap-2"
           style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }}
         >
           <Play className="w-6 h-6 fill-current" /> PLAY
         </button>
      </div>

      <div className="flex justify-center gap-4 pb-4">
        {[Trophy, ShoppingCart, Settings].map((Icon, i) => (
          <button 
            key={i}
            className="w-14 h-14 rounded-[var(--theme-radius)] flex items-center justify-center shadow-[var(--theme-shadow)] transform transition active:scale-95 bg-[var(--theme-surface)] text-[var(--theme-primary)]"
          >
            <Icon className="w-6 h-6" />
          </button>
        ))}
      </div>
    </div>
  );
}

function GameplayPreview() {
  const { theme, getAssetUrl } = useThemeContext();
  const tiles = [
    getAssetUrl(theme.assets.tiles['tile1']),
    getAssetUrl(theme.assets.tiles['tile2']),
    getAssetUrl(theme.assets.tiles['tile3']),
    getAssetUrl(theme.assets.tiles['tile4']),
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 mt-6 flex justify-between items-center">
        <button className="w-10 h-10 rounded-[var(--theme-button-radius)] bg-[var(--theme-surface)] shadow-[var(--theme-shadow)] flex items-center justify-center font-bold text-lg">
          II
        </button>
        <div className="bg-[var(--theme-surface)] shadow-[var(--theme-shadow)] px-6 py-2 rounded-[var(--theme-radius)] flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase opacity-50">Score</span>
          <span className="text-xl font-black text-[var(--theme-primary)]">12,450</span>
        </div>
      </div>

      <div className="flex-1 px-4 flex flex-col justify-center">
        <div 
          className="grid grid-cols-5 gap-2 p-3 bg-[var(--theme-surface)]/80 backdrop-blur-md shadow-[var(--theme-shadow)]"
          style={{ borderRadius: 'var(--theme-radius)' }}
        >
          {Array.from({length: 30}).map((_, i) => {
            const tileIdx = i % 4;
            const tileImg = tiles[tileIdx];
            return (
              <div 
                key={i} 
                className="aspect-square flex items-center justify-center shadow-sm transform hover:scale-105"
                style={{ borderRadius: 'calc(var(--theme-radius) / 2)' }}
              >
                {tileImg ? (
                  <img src={tileImg} className="w-full h-full object-cover rounded-md" alt="" />
                ) : (
                  <div 
                    className="w-[80%] h-[80%] rounded-full opacity-80"
                    style={{ backgroundColor: tileIdx === 0 ? 'var(--theme-primary)' : tileIdx === 1 ? 'var(--theme-secondary)' : tileIdx === 2 ? 'var(--theme-accent)' : '#fff' }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="p-6">
        <div className="h-2 w-full bg-[var(--theme-surface)] rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-[var(--theme-accent)] w-[60%]" />
        </div>
      </div>
    </div>
  );
}

function ShopPreview() {
  const { theme, getAssetUrl } = useThemeContext();
  const chestUrl = getAssetUrl(theme.assets.ui['chest']);
  const coinUrl = getAssetUrl(theme.assets.ui['coin']);
  
  return (
    <div className="flex flex-col h-full bg-[var(--theme-bg)]/90 backdrop-blur-sm">
      <div className="p-6 mt-6 flex justify-between items-center border-b border-[var(--theme-surface)]">
        <h2 className="text-2xl font-black text-[var(--theme-primary)]">Store</h2>
        <div className="bg-[var(--theme-surface)] rounded-[var(--theme-button-radius)] px-4 py-2 flex items-center gap-2 shadow-[var(--theme-shadow)]">
           {coinUrl ? <img src={coinUrl} className="w-4 h-4" alt="coin" /> : <span className="text-[var(--theme-accent)] font-bold">🪙</span>}
           <span className="font-bold text-xs">999</span>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
        {/* Banner */}
        <div className="w-full h-32 rounded-[var(--theme-radius)] bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] shadow-[var(--theme-shadow)] p-4 flex items-center justify-between text-[var(--theme-text-inverse)]">
           <div>
             <h3 className="font-black text-xl">Special Offer!</h3>
             <p className="text-xs font-medium opacity-80">Get x10 Draw Tickets</p>
           </div>
           {chestUrl ? <img src={chestUrl} className="w-16 h-16 object-contain" alt="chest" /> : <div className="text-4xl">🎁</div>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div 
              key={i}
              className="bg-[var(--theme-surface)] p-4 rounded-[var(--theme-radius)] shadow-[var(--theme-shadow)] flex flex-col items-center gap-3 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[var(--theme-bg)] flex items-center justify-center">
                {chestUrl ? <img src={chestUrl} className="w-10 h-10 object-contain" alt="chest" /> : <div className="text-2xl">📦</div>}
              </div>
              <div>
                <h4 className="font-bold text-sm">Bundle {i}</h4>
                <button 
                  className="mt-2 px-4 py-2 rounded-[var(--theme-button-radius)] bg-[var(--theme-primary)] text-[var(--theme-text-inverse)] text-xs font-bold w-full flex justify-center gap-1"
                >
                  {coinUrl ? <img src={coinUrl} className="w-3 h-3" alt="coin" /> : '🪙'} 100
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
