import React from 'react';
import { useThemeContext } from '../context/ThemeContext';

export function PreviewCanvas() {
  const { theme, getAssetUrl } = useThemeContext();

  const bgUrl = getAssetUrl(theme.assets.background);
  const logoUrl = getAssetUrl(theme.assets.logo);

  const cssVars = {
    '--theme-primary': theme.colors.primary,
    '--theme-secondary': theme.colors.secondary,
    '--theme-bg': theme.colors.background,
    '--theme-text': theme.colors.text,
    '--theme-accent': theme.colors.accent,
  } as React.CSSProperties;

  return (
    <div 
      className="relative w-full max-w-sm aspect-[9/19] bg-[var(--theme-bg)] rounded-[2.5rem] shadow-2xl overflow-hidden border-[8px] border-slate-800 transition-colors duration-300"
      style={cssVars}
    >
      {/* Background Image Layer */}
      {bgUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-80"
          style={{ backgroundImage: `url(${bgUrl})` }}
        />
      )}

      {/* Dummy Game Content */}
      <div className="absolute inset-0 flex flex-col z-10 text-[var(--theme-text)]">
        
        {/* Header / Top Bar */}
        <div className="p-6 flex flex-col items-center justify-center gap-4 relative">
           {logoUrl ? (
             <img src={logoUrl} alt="Logo" className="w-48 object-contain drop-shadow-md" />
           ) : (
             <h1 className="text-3xl font-black italic drop-shadow-md" style={{ color: 'var(--theme-primary)' }}>
               {theme.metadata.name || 'Sweet Connect'}
             </h1>
           )}
           
           <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-[var(--theme-bg)] to-transparent opacity-50" />
        </div>

        {/* User Stats Bar */}
        <div className="px-4 pb-4">
          <div 
            className="rounded-xl shadow-sm p-4 flex justify-between items-center border border-white/10 backdrop-blur-sm"
            style={{ backgroundColor: 'color-mix(in srgb, var(--theme-secondary) 20%, transparent)' }}
          >
            <span className="font-bold">Player One</span>
            <span 
              className="px-3 py-1 rounded-full text-xs font-bold shadow-inner"
              style={{ backgroundColor: 'var(--theme-accent)', color: '#fff' }}
            >
              999,999 🪙
            </span>
          </div>
        </div>

        {/* Dummy Board */}
        <div className="flex-1 px-4 overflow-hidden">
          <div className="grid grid-cols-5 gap-2 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
            {Array.from({length: 25}).map((_, i) => {
              // Alternate colors slightly for checkerboard feel
              const isAccent = (i % 3 === 0);
              return (
                <div 
                  key={i} 
                  className="aspect-square rounded-lg shadow-sm flex items-center justify-center transition-transform hover:scale-105"
                  style={{ 
                    backgroundColor: isAccent ? 'var(--theme-primary)' : 'var(--theme-secondary)',
                    opacity: isAccent ? 0.9 : 0.7
                  }}
                >
                  <div className="w-1/2 h-1/2 rounded-full bg-white/30" />
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Dummy Action Bar */}
        <div className="p-6 flex gap-4 justify-center">
          <button 
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform transition active:scale-95"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            <div className="w-6 h-6 bg-white mask-star" />
          </button>
          <button 
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform transition active:scale-95"
            style={{ backgroundColor: 'var(--theme-secondary)' }}
          >
            <div className="w-6 h-6 bg-white mask-gear" />
          </button>
        </div>

      </div>
    </div>
  );
}
