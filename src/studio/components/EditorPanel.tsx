import React from 'react';
import { useThemeContext } from '../context/ThemeContext';
import { ImageUpload } from './ImageUpload';

interface EditorPanelProps {
  activeTab: string;
}

export function EditorPanel({ activeTab }: EditorPanelProps) {
  const { theme, updateMetadata, updateColor, updateStyle, updateRootAsset, updateAsset, getAssetUrl } = useThemeContext();

  if (activeTab === 'info') {
    return (
      <div className="space-y-5">
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Theme ID</label>
          <input 
            type="text" 
            value={theme.metadata.id} 
            onChange={e => updateMetadata('id', e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all font-medium"
            placeholder="my-cool-theme"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Theme Name</label>
          <input 
            type="text" 
            value={theme.metadata.name} 
            onChange={e => updateMetadata('name', e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all font-medium"
            placeholder="My Cool Theme"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Author</label>
          <input 
            type="text" 
            value={theme.metadata.author} 
            onChange={e => updateMetadata('author', e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all font-medium"
          />
        </div>
        <ImageUpload 
          label="Thumbnail (Preview Image)" 
          value={theme.assets.thumbnail} 
          onChange={(v) => updateRootAsset('thumbnail', v as File)} 
          previewUrl={getAssetUrl(theme.assets.thumbnail)}
        />
      </div>
    );
  }

  if (activeTab === 'colors') {
    return (
      <div className="space-y-4">
        {Object.entries(theme.colors).map(([key, value]) => (
          <div key={key} className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{key}</label>
            <div className="flex gap-2 relative group">
              <div 
                className="w-12 h-12 rounded-xl border-2 border-white shadow-md flex-shrink-0 relative overflow-hidden"
                style={{ backgroundColor: value }}
              >
                 <input 
                   type="color" 
                   value={value} 
                   onChange={e => updateColor(key as any, e.target.value)}
                   className="absolute -top-2 -left-2 w-16 h-16 opacity-0 cursor-pointer"
                 />
              </div>
              <input 
                type="text" 
                value={value} 
                onChange={e => updateColor(key as any, e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all font-medium uppercase"
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activeTab === 'styles') {
    return (
      <div className="space-y-5">
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Font Family</label>
          <select 
            value={theme.styles.fontFamily} 
            onChange={e => updateStyle('fontFamily', e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all font-medium appearance-none"
          >
             <option value='"Inter", sans-serif'>Inter (Modern)</option>
             <option value='"Space Mono", monospace'>Space Mono (Retro)</option>
             <option value='"Comic Sans MS", cursive, sans-serif'>Comic Sans (Playful)</option>
             <option value='"Georgia", serif'>Georgia (Elegant)</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Container Radius</label>
          <input 
            type="text" 
            value={theme.styles.borderRadius} 
            onChange={e => updateStyle('borderRadius', e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all font-medium"
            placeholder="1rem, 24px, etc."
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Button Radius</label>
          <input 
            type="text" 
            value={theme.styles.buttonRadius} 
            onChange={e => updateStyle('buttonRadius', e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all font-medium"
            placeholder="9999px, 8px, etc."
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Shadow Size</label>
          <select 
            value={theme.styles.shadowSize} 
            onChange={e => updateStyle('shadowSize', e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all font-medium appearance-none"
          >
             <option value="none">None (Flat)</option>
             <option value="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)">Small</option>
             <option value="0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)">Medium</option>
             <option value="0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)">Large</option>
             <option value="0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)">Extra Large (Premium)</option>
          </select>
        </div>
      </div>
    );
  }

  if (activeTab === 'background') {
    return (
      <div className="space-y-6">
        <ImageUpload 
          label="Game Background" 
          value={theme.assets.background} 
          onChange={(v) => updateRootAsset('background', v as File)} 
          previewUrl={getAssetUrl(theme.assets.background)}
        />
        <ImageUpload 
          label="Particle Effect" 
          value={theme.assets.particles} 
          onChange={(v) => updateRootAsset('particles', v as File)} 
          previewUrl={getAssetUrl(theme.assets.particles)}
        />
      </div>
    );
  }
  
  if (activeTab === 'ui') {
    return (
      <div className="space-y-6">
        <ImageUpload 
          label="Game Logo" 
          value={theme.assets.logo} 
          onChange={(v) => updateRootAsset('logo', v as File)} 
          previewUrl={getAssetUrl(theme.assets.logo)}
        />
        
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mt-6 mb-4">Game Tiles</h3>
          <div className="grid grid-cols-2 gap-4">
            <ImageUpload 
              label="Tile 1" 
              value={theme.assets.tiles['tile1']} 
              onChange={(v) => updateAsset('tiles', 'tile1', v as File)} 
              previewUrl={getAssetUrl(theme.assets.tiles['tile1'])}
            />
            <ImageUpload 
              label="Tile 2" 
              value={theme.assets.tiles['tile2']} 
              onChange={(v) => updateAsset('tiles', 'tile2', v as File)} 
              previewUrl={getAssetUrl(theme.assets.tiles['tile2'])}
            />
            <ImageUpload 
              label="Tile 3" 
              value={theme.assets.tiles['tile3']} 
              onChange={(v) => updateAsset('tiles', 'tile3', v as File)} 
              previewUrl={getAssetUrl(theme.assets.tiles['tile3'])}
            />
            <ImageUpload 
              label="Tile 4" 
              value={theme.assets.tiles['tile4']} 
              onChange={(v) => updateAsset('tiles', 'tile4', v as File)} 
              previewUrl={getAssetUrl(theme.assets.tiles['tile4'])}
            />
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mt-6 mb-4">UI Icons</h3>
          <div className="grid grid-cols-2 gap-4">
            <ImageUpload 
              label="Coin / Currency" 
              value={theme.assets.ui['coin']} 
              onChange={(v) => updateAsset('ui', 'coin', v as File)} 
              previewUrl={getAssetUrl(theme.assets.ui['coin'])}
            />
            <ImageUpload 
              label="Chest" 
              value={theme.assets.ui['chest']} 
              onChange={(v) => updateAsset('ui', 'chest', v as File)} 
              previewUrl={getAssetUrl(theme.assets.ui['chest'])}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
