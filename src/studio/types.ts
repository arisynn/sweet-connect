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
  logo?: string | File;
  background?: string | File;
  thumbnail?: string | File;
  tiles: Record<string, string | File>;
  ui: Record<string, string | File>;
}

export interface StudioTheme {
  metadata: ThemeMetadata;
  colors: ThemeColors;
  assets: ThemeAssets;
}
