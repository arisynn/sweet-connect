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
  surface: string;
  text: string;
  textInverse: string;
  accent: string;
}

export interface ThemeStyles {
  borderRadius: string;
  buttonRadius: string;
  shadowSize: string;
  fontFamily: string;
}

export interface ThemeAssets {
  logo?: string | File;
  background?: string | File;
  thumbnail?: string | File;
  tiles: Record<string, string | File>;
  ui: Record<string, string | File>;
  audio: Record<string, string | File>;
  particles?: string | File;
}

export interface StudioTheme {
  metadata: ThemeMetadata;
  colors: ThemeColors;
  styles: ThemeStyles;
  assets: ThemeAssets;
}
