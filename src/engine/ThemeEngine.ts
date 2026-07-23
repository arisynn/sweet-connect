/**
 * Theme Engine
 * 
 * This is a lightweight library that acts as the bridge between
 * Sweet Connect (the game) and Theme Packages exported from Sweet Studio.
 * 
 * Responsibilities:
 * - Parsing Theme Package JSON.
 * - Loading and injecting custom fonts.
 * - Applying CSS variable overrides for colors.
 * - Providing asset path resolutions (with fallbacks).
 */

export interface ThemeMetadata {
  id: string;
  name: string;
  author: string;
  version: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
}

export interface ThemeAssets {
  logo?: string;
  background?: string;
  particles?: string;
  tiles: Record<string, string>;
  ui: Record<string, string>;
}

export interface ThemePackage {
  metadata: ThemeMetadata;
  colors: ThemeColors;
  assets: ThemeAssets;
}

export class ThemeEngine {
  private currentTheme: ThemePackage | null = null;
  private defaultAssetsPath: string = '/assets/';

  constructor(defaultAssetsPath?: string) {
    if (defaultAssetsPath) {
      this.defaultAssetsPath = defaultAssetsPath;
    }
  }

  /**
   * Loads a theme package and applies its configuration globally.
   */
  public loadTheme(theme: ThemePackage) {
    this.currentTheme = theme;
    this.applyColors(theme.colors);
    // Fonts and other CSS injections can be added here
    console.log(`[ThemeEngine] Loaded theme: ${theme.metadata.name} v${theme.metadata.version}`);
  }

  /**
   * Resolves an asset path. Falls back to default if the theme doesn't provide it.
   */
  public getAsset(category: keyof ThemeAssets, key?: string): string {
    if (!this.currentTheme) {
      return this.getDefaultAssetPath(category, key);
    }

    const categoryAssets = this.currentTheme.assets[category];
    
    if (typeof categoryAssets === 'string' && !key) {
       return categoryAssets;
    }

    if (key && categoryAssets && typeof categoryAssets === 'object') {
      const specificAsset = (categoryAssets as Record<string, string>)[key];
      if (specificAsset) return specificAsset;
    }

    return this.getDefaultAssetPath(category, key);
  }

  private applyColors(colors: ThemeColors) {
    const root = document.documentElement;
    if (colors.primary) root.style.setProperty('--theme-primary', colors.primary);
    if (colors.secondary) root.style.setProperty('--theme-secondary', colors.secondary);
    if (colors.background) root.style.setProperty('--theme-bg', colors.background);
    if (colors.text) root.style.setProperty('--theme-text', colors.text);
    if (colors.accent) root.style.setProperty('--theme-accent', colors.accent);
  }

  private getDefaultAssetPath(category: string, key?: string): string {
    // Basic fallback logic (can be expanded based on game structure)
    if (key) {
      return `${this.defaultAssetsPath}${category}/${key}.png`;
    }
    return `${this.defaultAssetsPath}${category}.png`;
  }
}

// Singleton instance for global use
export const themeEngine = new ThemeEngine();
