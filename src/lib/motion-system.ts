/**
 * Velora Premium Motion System
 * Physics-based animations inspired by Framer, Linear, and Apple
 */

export const motionSystem = {
  // Animation Durations
  duration: {
    instant: 0,
    fast: 150,
    base: 200,
    moderate: 300,
    slow: 500,
    slower: 700,
    slowest: 1000,
  },

  // Premium Easing Functions
  easing: {
    // Standard easings
    linear: [0, 0, 1, 1],
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    
    // Premium easings
    spring: [0.68, -0.55, 0.265, 1.55],
    smooth: [0.25, 0.46, 0.45, 0.94],
    snappy: [0.4, 0, 0.6, 1],
    
    // Apple-inspired
    appleEaseInOut: [0.42, 0, 0.58, 1],
    appleEaseOut: [0.25, 0.1, 0.25, 1],
    
    // Framer-inspired
    framerEaseOut: [0.16, 1, 0.3, 1],
    framerEaseInOut: [0.87, 0, 0.13, 1],
  },

  // Framer Motion Variants
  variants: {
    // Fade animations
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    
    fadeInUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
    },
    
    fadeInDown: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
    
    // Scale animations
    scaleIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
    
    scaleInCenter: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.8 },
    },
    
    // Slide animations
    slideInLeft: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
    },
    
    slideInRight: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
    },
    
    // Modal animations
    modalOverlay: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    
    modalContent: {
      initial: { opacity: 0, scale: 0.95, y: 20 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.95, y: 20 },
    },
    
    // Drawer animations
    drawerLeft: {
      initial: { x: '-100%' },
      animate: { x: 0 },
      exit: { x: '-100%' },
    },
    
    drawerRight: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '100%' },
    },
    
    // Stagger children
    staggerContainer: {
      animate: {
        transition: {
          staggerChildren: 0.1,
        },
      },
    },
    
    staggerItem: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
    },
  },

  // Transition Presets
  transitions: {
    fast: {
      duration: 0.15,
      ease: [0, 0, 0.2, 1],
    },
    
    base: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
    
    smooth: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
    
    spring: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
    
    springBouncy: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
    
    springGentle: {
      type: 'spring',
      stiffness: 200,
      damping: 35,
    },
  },

  // Hover Effects
  hover: {
    lift: {
      y: -4,
      transition: { duration: 0.2, ease: [0, 0, 0.2, 1] },
    },
    
    scale: {
      scale: 1.05,
      transition: { duration: 0.2, ease: [0, 0, 0.2, 1] },
    },
    
    scaleSubtle: {
      scale: 1.02,
      transition: { duration: 0.2, ease: [0, 0, 0.2, 1] },
    },
    
    glow: {
      boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
      transition: { duration: 0.3 },
    },
  },

  // Tap Effects
  tap: {
    scale: {
      scale: 0.95,
    },
    
    scaleSubtle: {
      scale: 0.98,
    },
  },

  // Page Transitions
  pageTransitions: {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3 },
    },
    
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
    },
    
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.05 },
      transition: { duration: 0.3 },
    },
  },

  // Skeleton Loading
  skeleton: {
    pulse: {
      animate: {
        opacity: [0.5, 1, 0.5],
      },
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    
    shimmer: {
      animate: {
        backgroundPosition: ['200% 0', '-200% 0'],
      },
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  },

  // Microinteractions
  microinteractions: {
    buttonPress: {
      whileTap: { scale: 0.95 },
      transition: { duration: 0.1 },
    },
    
    cardHover: {
      whileHover: { 
        y: -4,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
      transition: { duration: 0.2 },
    },
    
    iconBounce: {
      whileHover: { scale: 1.1 },
      whileTap: { scale: 0.9 },
      transition: { type: 'spring', stiffness: 400, damping: 17 },
    },
  },

  // Gesture Configurations
  gestures: {
    drag: {
      drag: true,
      dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
      dragElastic: 0.2,
    },
    
    swipe: {
      drag: 'x',
      dragConstraints: { left: 0, right: 0 },
      dragElastic: 0.5,
    },
  },
} as const;

// CSS Keyframes for non-Framer Motion usage
export const cssKeyframes = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  
  fadeInUp: `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  
  scaleIn: `
    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `,
  
  shimmer: `
    @keyframes shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }
  `,
  
  pulse: `
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  `,
  
  spin: `
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `,
  
  bounce: `
    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }
  `,
  
  float: `
    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-10px);
      }
    }
  `,
} as const;

export default motionSystem;
