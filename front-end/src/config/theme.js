/**
 * Theme Configuration
 * Centralized theme variables and design system
 */

export const THEME = {
  // Monochromatic Color Palette
  COLORS: {
    // Primary colors
    PRIMARY: '#000000',
    SECONDARY: '#333333',
    TERTIARY: '#757575',
    
    // Grayscale
    WHITE: '#ffffff',
    LIGHT_GRAY: '#e0e0e0',
    MEDIUM_GRAY: '#9ca3af',
    DARK_GRAY: '#4b5563',
    
    // Semantic colors
    SUCCESS: '#10b981',
    ERROR: '#ef4444',
    WARNING: '#f59e0b',
    INFO: '#3b82f6',
    
    // Background colors
    BG_PRIMARY: '#ffffff',
    BG_SECONDARY: '#f9fafb',
    BG_TERTIARY: '#f3f4f6',
  },

  // Typography
  TYPOGRAPHY: {
    FONT_FAMILY: {
      PRIMARY: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      MONOSPACE: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", Consolas, "Courier New", monospace',
    },
    
    FONT_SIZES: {
      XS: '0.75rem',    // 12px
      SM: '0.875rem',   // 14px
      BASE: '1rem',     // 16px
      LG: '1.125rem',   // 18px
      XL: '1.25rem',    // 20px
      '2XL': '1.5rem',  // 24px
      '3XL': '2rem',    // 32px
      '4XL': '2.5rem',  // 40px
    },
    
    FONT_WEIGHTS: {
      LIGHT: '300',
      NORMAL: '400',
      MEDIUM: '500',
      SEMIBOLD: '600',
      BOLD: '700',
    },
  },

  // Spacing
  SPACING: {
    XS: '0.25rem',   // 4px
    SM: '0.5rem',    // 8px
    MD: '1rem',      // 16px
    LG: '1.5rem',    // 24px
    XL: '2rem',      // 32px
    '2XL': '3rem',   // 48px
    '3XL': '4rem',   // 64px
  },

  // Border radius
  BORDER_RADIUS: {
    NONE: '0',
    SM: '0.25rem',   // 4px
    MD: '0.375rem',  // 6px
    LG: '0.5rem',    // 8px
    XL: '0.75rem',   // 12px
    FULL: '9999px',
  },

  // Shadows
  SHADOWS: {
    SM: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    MD: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    LG: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    XL: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },

  // Breakpoints for responsive design
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px',
  },

  // Z-index layers
  Z_INDEX: {
    DROPDOWN: 1000,
    MODAL: 1050,
    POPOVER: 1100,
    TOOLTIP: 1150,
    NOTIFICATION: 1200,
  },

  // Animation durations
  TRANSITIONS: {
    FAST: '150ms',
    DEFAULT: '300ms',
    SLOW: '500ms',
  },
};

export default THEME;