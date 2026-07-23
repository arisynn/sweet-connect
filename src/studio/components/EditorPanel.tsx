import React from 'react';
import { useThemeContext } from '../context/ThemeContext';
import { ImageUpload } from './ImageUpload';

interface EditorPanelProps {
  activeTab: string;
}

export function EditorPanel({ activeTab }: EditorPanelProps) {
  const { theme, updateMetadata, updateColor, updateRootAsset, updateAsset, getAssetUrl } = useThemeContext();

  if (activeTab === 'info') {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Theme ID</label>
          <input 
            type="text" 
            value={theme.metadata.id} 
            onChange={e => updateMetadata('id', e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-pink-500"
            placeholder="my-cool-theme"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Theme Name</label>
          <input 
            type="text" 
            value={theme.metadata.name} 
            onChange={e => updateMetadata('name', e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-pink-500"
            placeholder="My Cool Theme"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Author</label>
          <input 
            type="text" 
            value={theme.metadata.author} 
            onChange={e => updateMetadata('author', e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-pink-500"
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
          <div key={key} className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{key}</label>
            <div className="flex gap-2">
              <div 
                className="w-10 h-10 rounded-lg border border-slate-700 flex-shrink-0"
                style={{ backgroundColor: value }}
              />
              <input 
                type="text" 
                value={value} 
                onChange={e => updateColor(key as any, e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-pink-500 uppercase"
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activeTab === 'background') {
    return (
      <div className="space-y-4">
        <ImageUpload 
          label="Game Background" 
          value={theme.assets.background} 
          onChange={(v) => updateRootAsset('background', v as File)} 
          previewUrl={getAssetUrl(theme.assets.background)}
        />
      </div>
    );
  }
  
  if (activeTab === 'ui') {
    return (
      <div className="space-y-4">
        <ImageUpload 
          label="Game Logo" 
          value={theme.assets.logo} 
          onChange={(v) => updateRootAsset('logo', v as File)} 
          previewUrl={getAssetUrl(theme.assets.logo)}
        />
        
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 mt-6">Game Tiles</h3>
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
    );
  }

  return null;
}
