import React, { createContext, useContext, useState, ReactNode } from 'react';
import { StudioTheme } from '../types';

interface ThemeContextType {
  theme: StudioTheme;
  updateMetadata: (key: keyof StudioTheme['metadata'], value: string) => void;
  updateColor: (key: keyof StudioTheme['colors'], value: string) => void;
  updateStyle: (key: keyof StudioTheme['styles'], value: string) => void;
  updateAsset: (category: 'tiles' | 'ui' | 'audio', key: string, file: File | string) => void;
  updateRootAsset: (key: 'logo' | 'background' | 'thumbnail' | 'particles', file: File | string) => void;
  getAssetUrl: (fileOrString?: File | string) => string;
}

const defaultTheme: StudioTheme = {
  metadata: {
    id: 'sweet-candy',
    name: 'Sweet Candy',
    author: 'Studio User',
    version: '1.0.0'
  },
  colors: {
    primary: '#f472b6', // pink-400
    secondary: '#a78bfa', // violet-400
    background: '#fdf2f8', // pink-50
    surface: '#ffffff', // white
    text: '#334155', // slate-700
    textInverse: '#ffffff',
    accent: '#fbbf24', // amber-400
  },
  styles: {
    borderRadius: '1.5rem',
    buttonRadius: '9999px',
    shadowSize: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    fontFamily: '"Inter", sans-serif',
  },
  assets: {
    tiles: {},
    ui: {},
    audio: {}
  }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<StudioTheme>(defaultTheme);
  // Store object URLs for File objects to avoid memory leaks and re-creating them
  const [objectUrls, setObjectUrls] = useState<Map<File, string>>(new Map());

  const getAssetUrl = (fileOrString?: File | string): string => {
    if (!fileOrString) return '';
    if (typeof fileOrString === 'string') return fileOrString;
    
    if (objectUrls.has(fileOrString)) {
      return objectUrls.get(fileOrString)!;
    }
    
    const url = URL.createObjectURL(fileOrString);
    setObjectUrls(new Map(objectUrls).set(fileOrString, url));
    return url;
  };

  const updateMetadata = (key: keyof StudioTheme['metadata'], value: string) => {
    setTheme(prev => ({
      ...prev,
      metadata: { ...prev.metadata, [key]: value }
    }));
  };

  const updateColor = (key: keyof StudioTheme['colors'], value: string) => {
    setTheme(prev => ({
      ...prev,
      colors: { ...prev.colors, [key]: value }
    }));
  };
  
  const updateStyle = (key: keyof StudioTheme['styles'], value: string) => {
    setTheme(prev => ({
      ...prev,
      styles: { ...prev.styles, [key]: value }
    }));
  };

  const updateAsset = (category: 'tiles' | 'ui' | 'audio', key: string, file: File | string) => {
    setTheme(prev => ({
      ...prev,
      assets: {
        ...prev.assets,
        [category]: {
          ...prev.assets[category],
          [key]: file
        }
      }
    }));
  };

  const updateRootAsset = (key: 'logo' | 'background' | 'thumbnail' | 'particles', file: File | string) => {
    setTheme(prev => ({
      ...prev,
      assets: {
        ...prev.assets,
        [key]: file
      }
    }));
  };

  return (
    <ThemeContext.Provider value={{ theme, updateMetadata, updateColor, updateStyle, updateAsset, updateRootAsset, getAssetUrl }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeContext must be used within ThemeProvider');
  return context;
};
