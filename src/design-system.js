/* ===================================================
   TEAM 1 — DESIGN SYSTEM & TOKEN REFERENCE
   ===================================================
   
   This file is the single source of truth for all design tokens.
   Every team MUST reference these values. Do NOT hardcode colors,
   spacing, or typography elsewhere.

   DESIGN HANDOFF NOTES:
   - colors: Brand palette for light & dark themes
   - typography: Font families, sizes, weights, line heights
   - spacing: Consistent spacing scale (4px base)
   - radius: Border radius for cards (12px) and pills (99px)
   - shadows: Elevation levels for cards, modals, nav
   - animation: Duration & easing for all micro-interactions
   - breakpoints: Mobile-first responsive design
   - accessibility: WCAG 2.1 AA compliance rules

   ACCESSIBILITY RULES (WCAG 2.1 AA):
   - Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text
   - Focus rings: 2px solid #FF4500, offset 2px on all interactive elements
   - ARIA labels: Required on all icon-only buttons
   - Keyboard navigation: All interactive elements must be reachable via Tab
   - Screen reader: Use sr-only class for visually hidden labels
   - Motion: Respect prefers-reduced-motion media query
   =================================================== */

const designSystem = {
  colors: {
    light: {
      bg: '#F5F2EE',
      bgSecondary: '#E8E4DF',
      bgTertiary: '#F0ECE7',
      text: '#0D0D0D',
      textSecondary: '#5A5651',
      accent: '#FF4500',
      accentHover: '#CC3700',
      border: '#E8E4DF',
      cardBg: '#FFFFFF',
      success: '#16A34A',
      error: '#DC2626',
      warning: '#F59E0B',
    },
    dark: {
      bg: '#0D0D0D',
      bgSecondary: '#1A1A1A',
      bgTertiary: '#2A2A2A',
      text: '#F5F2EE',
      textSecondary: '#9CA3AF',
      accent: '#FF4500',
      accentHover: '#CC3700',
      border: '#2A2A2A',
      cardBg: '#1A1A1A',
      success: '#22C55E',
      error: '#EF4444',
      warning: '#FBBF24',
    },
  },

  typography: {
    heading: {
      family: '"Bebas Neue", sans-serif',
      weights: [400],
      sizes: {
        hero: '5rem',       // 80px — hero section
        h1: '3.5rem',       // 56px
        h2: '2.5rem',       // 40px
        h3: '1.75rem',      // 28px
        h4: '1.25rem',      // 20px
      },
      letterSpacing: '0.02em',
      lineHeight: 1.1,
    },
    body: {
      family: '"DM Sans", sans-serif',
      weights: [400, 500, 700],
      sizes: {
        lg: '1.125rem',     // 18px
        base: '1rem',       // 16px
        sm: '0.875rem',     // 14px
        xs: '0.75rem',      // 12px
      },
      lineHeight: 1.6,
    },
    mono: {
      family: '"Space Mono", monospace',
      weights: [400, 700],
      usage: 'Prices, tags, technical info',
    },
  },

  spacing: {
    unit: 4,
    scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128],
  },

  radius: {
    card: '12px',
    pill: '99px',
    sm: '6px',
    md: '8px',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 12px rgba(0,0,0,0.08)',
    lg: '0 8px 24px rgba(0,0,0,0.12)',
    xl: '0 16px 48px rgba(0,0,0,0.16)',
    card: '0 2px 8px rgba(0,0,0,0.06)',
    cardHover: '0 8px 24px rgba(0,0,0,0.12)',
    nav: '0 1px 3px rgba(0,0,0,0.05)',
    modal: '0 16px 48px rgba(0,0,0,0.2)',
  },

  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      page: '600ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  components: {
    button: {
      primary: 'bg-brand-orange text-white hover:bg-brand-orange-hover rounded-pill px-6 py-3 font-medium transition-all duration-300 hover:-translate-y-0.5',
      secondary: 'border-2 border-brand-black dark:border-brand-offwhite text-brand-black dark:text-brand-offwhite rounded-pill px-6 py-3 font-medium hover:bg-brand-black hover:text-white dark:hover:bg-brand-offwhite dark:hover:text-brand-black transition-all duration-300',
      ghost: 'text-brand-gray hover:text-brand-black dark:hover:text-brand-offwhite transition-colors duration-300',
      icon: 'p-2 rounded-full hover:bg-brand-gray-light dark:hover:bg-brand-gray/20 transition-colors duration-300',
    },
    card: {
      base: 'bg-white dark:bg-[#1A1A1A] rounded-card overflow-hidden transition-all duration-300',
      hover: 'hover:shadow-lg hover:-translate-y-1',
    },
    badge: {
      newDrop: 'bg-brand-orange text-white text-xs font-mono font-bold px-2.5 py-1 rounded-pill uppercase tracking-wider',
      sale: 'bg-brand-black dark:bg-brand-offwhite text-white dark:text-brand-black text-xs font-mono font-bold px-2.5 py-1 rounded-pill uppercase tracking-wider',
      limited: 'border border-brand-orange text-brand-orange text-xs font-mono font-bold px-2.5 py-1 rounded-pill uppercase tracking-wider',
    },
    input: 'w-full px-4 py-3 bg-white dark:bg-[#1A1A1A] border border-brand-gray-light dark:border-[#2A2A2A] rounded-card text-brand-black dark:text-brand-offwhite placeholder:text-brand-gray focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all duration-300',
    modal: {
      overlay: 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50',
      content: 'bg-white dark:bg-[#1A1A1A] rounded-card shadow-xl max-w-lg w-full mx-4 p-6',
    },
  },

  accessibility: {
    focusRing: '2px solid #FF4500, offset 2px',
    minContrastNormal: 4.5,
    minContrastLarge: 3.0,
    ariaLabels: 'Required on all icon-only buttons and links',
    keyboardNav: 'Tab for focus, Enter/Space for activation, Escape for dismiss',
    srOnly: 'sr-only class for screen-reader-only text',
  },
};

export default designSystem;
