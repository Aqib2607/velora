/**
 * Velora Premium Theme System
 * Advanced dark/light themes with glassmorphism support
 */

export const premiumTheme = {
  light: {
    // Background layers
    background: {
      primary: '#ffffff',
      secondary: '#fafafa',
      tertiary: '#f5f5f5',
      elevated: '#ffffff',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    
    // Surface colors
    surface: {
      base: '#ffffff',
      elevated: '#ffffff',
      sunken: '#f5f5f5',
      overlay: 'rgba(255, 255, 255, 0.95)',
    },
    
    // Text colors
    text: {
      primary: '#0a0a0a',
      secondary: '#525252',
      tertiary: '#737373',
      quaternary: '#a3a3a3',
      inverse: '#ffffff',
      link: '#a855f7',
      linkHover: '#9333ea',
    },
    
    // Border colors
    border: {
      subtle: '#f5f5f5',
      DEFAULT: '#e5e5e5',
      strong: '#d4d4d4',
      brand: '#a855f7',
    },
    
    // Interactive states
    interactive: {
      hover: 'rgba(0, 0, 0, 0.05)',
      active: 'rgba(0, 0, 0, 0.1)',
      disabled: '#f5f5f5',
      focus: 'rgba(168, 85, 247, 0.1)',
    },
    
    // Brand colors
    brand: {
      primary: '#a855f7',
      primaryHover: '#9333ea',
      primaryActive: '#7e22ce',
      secondary: '#c084fc',
      tertiary: '#e9d5ff',
    },
    
    // Semantic colors
    semantic: {
      success: '#10b981',
      successBg: '#d1fae5',
      warning: '#f59e0b',
      warningBg: '#fef3c7',
      error: '#ef4444',
      errorBg: '#fee2e2',
      info: '#3b82f6',
      infoBg: '#dbeafe',
    },
    
    // Glass effects
    glass: {
      background: 'rgba(255, 255, 255, 0.7)',
      border: 'rgba(255, 255, 255, 0.18)',
      shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    },
    
    // Gradients
    gradient: {
      brand: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
      subtle: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
      mesh: 'radial-gradient(at 40% 20%, hsla(270, 100%, 70%, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(240, 100%, 70%, 0.15) 0px, transparent 50%)',
    },
  },
  
  dark: {
    // Background layers
    background: {
      primary: '#0a0a0a',
      secondary: '#171717',
      tertiary: '#262626',
      elevated: '#171717',
      overlay: 'rgba(0, 0, 0, 0.8)',
    },
    
    // Surface colors
    surface: {
      base: '#0a0a0a',
      elevated: '#171717',
      sunken: '#000000',
      overlay: 'rgba(0, 0, 0, 0.95)',
    },
    
    // Text colors
    text: {
      primary: '#fafafa',
      secondary: '#d4d4d4',
      tertiary: '#a3a3a3',
      quaternary: '#737373',
      inverse: '#0a0a0a',
      link: '#c084fc',
      linkHover: '#d8b4fe',
    },
    
    // Border colors
    border: {
      subtle: '#262626',
      DEFAULT: '#404040',
      strong: '#525252',
      brand: '#a855f7',
    },
    
    // Interactive states
    interactive: {
      hover: 'rgba(255, 255, 255, 0.05)',
      active: 'rgba(255, 255, 255, 0.1)',
      disabled: '#262626',
      focus: 'rgba(168, 85, 247, 0.2)',
    },
    
    // Brand colors
    brand: {
      primary: '#a855f7',
      primaryHover: '#c084fc',
      primaryActive: '#d8b4fe',
      secondary: '#9333ea',
      tertiary: '#7e22ce',
    },
    
    // Semantic colors
    semantic: {
      success: '#10b981',
      successBg: '#064e3b',
      warning: '#f59e0b',
      warningBg: '#78350f',
      error: '#ef4444',
      errorBg: '#7f1d1d',
      info: '#3b82f6',
      infoBg: '#1e3a8a',
    },
    
    // Glass effects
    glass: {
      background: 'rgba(0, 0, 0, 0.4)',
      border: 'rgba(255, 255, 255, 0.1)',
      shadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    },
    
    // Gradients
    gradient: {
      brand: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
      subtle: 'linear-gradient(135deg, #262626 0%, #171717 100%)',
      mesh: 'radial-gradient(at 40% 20%, hsla(270, 100%, 70%, 0.2) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(240, 100%, 70%, 0.2) 0px, transparent 50%)',
    },
  },
} as const;

// Theme utilities
export const getThemeValue = (theme: 'light' | 'dark', path: string) => {
  const keys = path.split('.');
  let value: unknown = premiumTheme[theme];
  
  for (const key of keys) {
    value = (value as Record<string, unknown>)?.[key];
  }
  
  return value;
};

export default premiumTheme;
