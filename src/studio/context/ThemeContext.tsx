import React, { createContext, useContext, useState, ReactNode } from 'react';
import { StudioTheme } from '../types';

interface ThemeContextType {
  theme: StudioTheme;
  updateMetadata: (key: keyof StudioTheme['metadata'], value: string) => void;
  updateColor: (key: keyof StudioTheme['colors'], value: string) => void;
  updateAsset: (category: 'tiles' | 'ui', key: string, file: File | string) => void;
  updateRootAsset: (key: 'logo' | 'background' | 'thumbnail', file: File | string) => void;
  getAssetUrl: (fileOrString?: File | string) => string;
}

const defaultTheme: StudioTheme = {
  metadata: {
    id: 'my-new-theme',
    name: 'My New Theme',
    author: 'Studio User',
    version: '1.0.0'
  },
  colors: {
    primary: '#ec4899', // pink-500
    secondary: '#8b5cf6', // violet-500
    background: '#0f172a', // slate-900
    text: '#f8fafc', // slate-50
    accent: '#f59e0b', // amber-500
  },
  assets: {
    tiles: {},
    ui: {}
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

  const updateAsset = (category: 'tiles' | 'ui', key: string, file: File | string) => {
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

  const updateRootAsset = (key: 'logo' | 'background' | 'thumbnail', file: File | string) => {
    setTheme(prev => ({
      ...prev,
      assets: {
        ...prev.assets,
        [key]: file
      }
    }));
  };

  return (
    <ThemeContext.Provider value={{ theme, updateMetadata, updateColor, updateAsset, updateRootAsset, getAssetUrl }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeContext must be used within ThemeProvider');
  return context;
};
