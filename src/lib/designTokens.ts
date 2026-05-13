/**
 * Phase 12: UI/UX Consistency & Polish
 * Design system, accessibility, responsive design, animations
 */

export const DESIGN_SYSTEM = {
  colors: {
    primary: '#6366F1',
    secondary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    background: '#FFFFFF',
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
      muted: '#9CA3AF'
    }
  },
  
  typography: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },
  
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px'
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },
  
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
};

export const ANIMATIONS = {
  fadeIn: {
    animation: 'fadeIn 0.3s ease-in',
    '@keyframes fadeIn': {
      from: { opacity: 0 },
      to: { opacity: 1 }
    }
  },
  
  slideUp: {
    animation: 'slideUp 0.4s ease-out',
    '@keyframes slideUp': {
      from: { transform: 'translateY(20px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 }
    }
  },
  
  slideLeft: {
    animation: 'slideLeft 0.3s ease-out',
    '@keyframes slideLeft': {
      from: { transform: 'translateX(20px)', opacity: 0 },
      to: { transform: 'translateX(0)', opacity: 1 }
    }
  },
  
  pulse: {
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    '@keyframes pulse': {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 }
    }
  },
  
  spin: {
    animation: 'spin 1s linear infinite',
    '@keyframes spin': {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' }
    }
  }
};

export const ACCESSIBILITY = {
  focusStyles: {
    outline: '2px solid #6366F1',
    outlineOffset: '2px'
  },
  
  contrastRatios: {
    normalText: 4.5,
    largeText: 3.0
  },
  
  motionPreference: {
    prefersReducedMotion: '@media (prefers-reduced-motion: reduce)',
    reducedMotionStyles: {
      animation: 'none',
      transition: 'none'
    }
  }
};

export const RESPONSIVE_LAYOUT = {
  container: {
    xs: '100%',
    sm: '540px',
    md: '720px',
    lg: '960px',
    xl: '1140px',
    '2xl': '1320px'
  },
  
  grid: {
    columns: {
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xl: 5,
      '2xl': 6
    },
    gap: {
      xs: '0.5rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem'
    }
  }
};

export const COMPONENT_VARIANTS = {
  button: {
    primary: {
      background: '#6366F1',
      color: '#FFFFFF',
      hover: '#4F46E5'
    },
    secondary: {
      background: '#E5E7EB',
      color: '#1F2937',
      hover: '#D1D5DB'
    },
    danger: {
      background: '#EF4444',
      color: '#FFFFFF',
      hover: '#DC2626'
    }
  },
  
  card: {
    padding: '1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #E5E7EB'
  },
  
  input: {
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    border: '1px solid #D1D5DB',
    fontSize: '1rem',
    fontFamily: 'inherit'
  },
  
  modal: {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000
    },
    content: {
      backgroundColor: '#FFFFFF',
      borderRadius: '0.5rem',
      maxHeight: '90vh',
      overflow: 'auto',
      maxWidth: '500px'
    }
  }
};

export const PERFORMANCE_BUDGET = {
  pageLoadTime: '3s',
  firstContentfulPaint: '1.5s',
  largestContentfulPaint: '2.5s',
  cumulativeLayoutShift: 0.1,
  firstInputDelay: '100ms',
  timeToInteractive: '3.5s'
};

export const A11Y_CHECKLIST = [
  'Color contrast ratio >= 4.5:1 for normal text',
  'Keyboard navigation support',
  'ARIA labels for interactive elements',
  'Focus indicators visible',
  'Alt text for all images',
  'Semantic HTML structure',
  'Form labels associated with inputs',
  'Error messages clear and associated',
  'Reduced motion support',
  'Text resizing support (up to 200%)'
];

// Tailwind CSS utility classes integration
export const TAILWIND_CUSTOM_CONFIG = {
  extend: {
    colors: {
      velora: {
        50: '#F8F4FF',
        100: '#F3ECFF',
        200: '#E9D5FF',
        300: '#DDB5FF',
        400: '#C084FC',
        500: '#A855F7',
        600: '#9333EA',
        700: '#7E22CE',
        800: '#6B21A8',
        900: '#581C87'
      }
    },
    animation: {
      fadeIn: 'fadeIn 0.3s ease-in',
      slideUp: 'slideUp 0.4s ease-out',
      slideLeft: 'slideLeft 0.3s ease-out'
    }
  }
};

// Design tokens export
export const DESIGN_TOKENS = {
  ...DESIGN_SYSTEM,
  animations: ANIMATIONS,
  accessibility: ACCESSIBILITY,
  responsive: RESPONSIVE_LAYOUT,
  components: COMPONENT_VARIANTS,
  performance: PERFORMANCE_BUDGET
};

export default DESIGN_TOKENS;
