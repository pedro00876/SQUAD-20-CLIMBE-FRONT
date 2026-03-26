/**
 * Centralized asset configuration
 * Following TypeScript best practices for asset management
 */
export const ASSETS = {
  logos: {
    // Standard logo (Dark/Preta) - best for light backgrounds
    main: '/Marca Climbe-01.png',
    // Alternative logo (Light/Branca) - best for dark backgrounds
    alt: '/Marca Climbe-02.png',
    // Shortcut aliases for clarity in different contexts
    dark: '/Marca Climbe-01.png',
    light: '/Marca Climbe-02.png',
  }
} as const;

export type AssetLogos = typeof ASSETS.logos;
