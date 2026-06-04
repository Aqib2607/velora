/**
 * Velora Premium Design System V2
 * European Fintech Aesthetic — Inspired by Wero, Stripe, Linear, Vercel
 * Enterprise-grade design tokens for world-class commerce
 */

export const designTokens = {
  // ── Premium Color System ──────────────────────────────────
  colors: {
    // Brand Identity — Violet-Indigo
    brand: {
      50: '#f5f0ff',
      100: '#ede5ff',
      200: '#ddd0ff',
      300: '#c4abff',
      400: '#a57aff',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
      950: '#2e1065',
    },
    
    // Neutral Palette (Premium Blue-Gray)
    neutral: {
      0: '#ffffff',
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
    
    // Semantic Colors
    success: {
      light: '#34d399',
      DEFAULT: '#10b981',
      dark: '#059669',
    },
    warning: {
      light: '#fbbf24',
      DEFAULT: '#f59e0b',
      dark: '#d97706',
    },
    error: {
      light: '#f87171',
      DEFAULT: '#ef4444',
      dark: '#dc2626',
    },
    info: {
      light: '#60a5fa',
      DEFAULT: '#3b82f6',
      dark: '#2563eb',
    },
  },

  // ── Premium Typography System V2 ─────────────────────────
  typography: {
    fonts: {
      display: 'Outfit, Inter, -apple-system, sans-serif',
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"JetBrains Mono", "Fira Code", Consolas, monospace',
    },
    
    sizes: {
      // Display Scale (Outfit font)
      hero: 'clamp(3rem, 6vw, 6rem)',         // 48-96px
      display: 'clamp(2.5rem, 4.5vw, 4rem)',  // 40-64px
      title: 'clamp(1.875rem, 3vw, 2.75rem)', // 30-44px
      subtitle: 'clamp(1.25rem, 2vw, 1.5rem)', // 20-24px
      
      // Body Scale (Inter font)
      'body-lg': '1.25rem',  // 20px
      body: '1.125rem',      // 18px
      sm: '0.9375rem',       // 15px
      xs: '0.8125rem',       // 13px
      xxs: '0.6875rem',      // 11px
    },
    
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    
    lineHeights: {
      hero: 1.05,
      display: 1.1,
      title: 1.15,
      tight: 1.2,
      snug: 1.375,
      normal: 1.6,
      relaxed: 1.7,
      loose: 2,
    },
    
    letterSpacing: {
      tightest: '-0.04em',
      tighter: '-0.03em',
      tight: '-0.02em',
      snug: '-0.01em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
      caps: '0.15em',
    },
  },

  // ── Premium Spacing Scale V2 ──────────────────────────────
  spacing: {
    // Standard
    0: '0',
    px: '1px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
    40: '10rem',
    48: '12rem',
    56: '14rem',
    64: '16rem',
    
    // Premium Section Spacing
    section: '7.5rem',       // 120px
    'section-lg': '11.25rem', // 180px
    'section-xl': '15rem',    // 240px
    
    // Component Spacing
    'component-sm': '1.5rem', // 24px
    component: '2rem',        // 32px
    'component-lg': '3rem',   // 48px
  },

  // ── Premium Border Radius V2 ─────────────────────────────
  radius: {
    none: '0',
    sm: '0.375rem',    // 6px
    DEFAULT: '0.5rem', // 8px
    md: '0.75rem',     // 12px
    lg: '0.875rem',    // 14px
    xl: '1rem',        // 16px
    '2xl': '1.25rem',  // 20px
    '3xl': '1.5rem',   // 24px
    '4xl': '2rem',     // 32px
    '5xl': '2.5rem',   // 40px
    full: '9999px',
  },

  // ── Premium Elevation System V2 ──────────────────────────
  elevation: {
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
    DEFAULT: '0 4px 24px -4px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
    md: '0 8px 32px -6px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.06)',
    lg: '0 12px 40px -8px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.2)',
    '2xl': '0 50px 100px -20px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 1px 2px rgba(0, 0, 0, 0.06)',
    
    // Premium Glass Shadows
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.12)',
    glassHover: '0 16px 48px 0 rgba(31, 38, 135, 0.18)',
    
    // Glow Shadows
    glow: '0 0 40px rgba(124, 58, 237, 0.15)',
    glowStrong: '0 0 60px rgba(124, 58, 237, 0.25)',
  },

  // ── Glassmorphism Effects V2 ─────────────────────────────
  glass: {
    light: {
      background: 'rgba(255, 255, 255, 0.65)',
      border: 'rgba(255, 255, 255, 0.25)',
      blur: '20px',
    },
    medium: {
      background: 'rgba(255, 255, 255, 0.5)',
      border: 'rgba(255, 255, 255, 0.2)',
      blur: '24px',
    },
    heavy: {
      background: 'rgba(255, 255, 255, 0.85)',
      border: 'rgba(255, 255, 255, 0.4)',
      blur: '32px',
    },
    dark: {
      background: 'rgba(15, 18, 35, 0.6)',
      border: 'rgba(255, 255, 255, 0.08)',
      blur: '24px',
    },
    darkHeavy: {
      background: 'rgba(15, 18, 35, 0.8)',
      border: 'rgba(255, 255, 255, 0.15)',
      blur: '40px',
    },
  },

  // ── Premium Gradients V2 ─────────────────────────────────
  gradients: {
    // Brand
    brand: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
    brandV2: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 35%, #3b82f6 65%, #06b6d4 100%)',
    brandSubtle: 'linear-gradient(135deg, #f5f0ff 0%, #ede5ff 100%)',
    brandDark: 'linear-gradient(135deg, #6d28d9 0%, #3730a3 100%)',
    
    // Hero
    hero: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    heroV2: 'linear-gradient(145deg, #8b5cf6 0%, #6366f1 25%, #3b82f6 50%, #06b6d4 75%, #14b8a6 100%)',
    
    // Aurora
    aurora: 'linear-gradient(135deg, hsla(270, 100%, 70%, 0.4) 0%, hsla(250, 100%, 65%, 0.3) 20%, hsla(230, 100%, 65%, 0.3) 40%, hsla(200, 100%, 65%, 0.3) 60%, hsla(180, 100%, 65%, 0.3) 80%, hsla(160, 100%, 70%, 0.2) 100%)',
    
    // Glass
    glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    glassDark: 'linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%)',
    
    // Mesh
    mesh: 'radial-gradient(at 20% 20%, hsla(270, 100%, 70%, 0.25) 0px, transparent 50%), radial-gradient(at 80% 10%, hsla(240, 100%, 70%, 0.2) 0px, transparent 50%), radial-gradient(at 0% 80%, hsla(200, 100%, 70%, 0.2) 0px, transparent 50%), radial-gradient(at 90% 70%, hsla(300, 100%, 70%, 0.15) 0px, transparent 50%)',
    
    // Surfaces
    surface: 'linear-gradient(180deg, hsl(220, 20%, 98%) 0%, hsl(220, 20%, 96%) 50%, hsl(220, 20%, 98%) 100%)',
    surfaceDark: 'linear-gradient(180deg, hsl(228, 30%, 5%) 0%, hsl(228, 25%, 8%) 50%, hsl(228, 30%, 5%) 100%)',
  },

  // ── Breakpoints ──────────────────────────────────────────
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    '3xl': '1600px',
  },

  // ── Z-Index Scale ────────────────────────────────────────
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
    toast: 1700,
  },

  // ── Transitions V2 ──────────────────────────────────────
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: '300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    slow: '500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    slower: '700ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    
    // Premium Easing
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth_ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    premium: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
} as const;

export default designTokens;
