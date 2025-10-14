// Design Tokens - Centralized design system constants
// Used throughout the Dashboard V2 components for consistent styling

export const designTokens = {
  // Color Palette
  colors: {
    primary: '#3B82F6', // Blue - Primary actions, links
    success: '#10B981', // Green - Success states, positive indicators
    warning: '#F59E0B', // Orange - Warnings, attention needed
    danger: '#EF4444', // Red - Errors, destructive actions
    muted: '#6B7280', // Gray - Secondary text, disabled states
    border: '#E5E7EB', // Light gray - Borders, dividers
    background: '#F9FAFB', // Very light gray - Page background
    cardBg: '#FFFFFF', // White - Card backgrounds
  },

  // Shadow Utilities (Tailwind classes)
  shadows: {
    sm: 'shadow-sm', // Subtle shadow for cards
    DEFAULT: 'shadow', // Default shadow
    md: 'shadow-md', // Medium shadow for dropdowns
    lg: 'shadow-lg', // Large shadow for modals
    xl: 'shadow-xl', // Extra large shadow
  },

  // Border Radius (Tailwind classes)
  radius: {
    sm: 'rounded-sm', // Small radius (2px)
    DEFAULT: 'rounded', // Default radius (4px)
    md: 'rounded-md', // Medium radius (6px)
    lg: 'rounded-lg', // Large radius (8px)
    xl: 'rounded-xl', // Extra large radius (12px)
    full: 'rounded-full', // Full circle/pill shape
  },

  // Typography Scales (Tailwind classes)
  typography: {
    h1: 'text-3xl font-bold tracking-tight',
    h2: 'text-2xl font-semibold tracking-tight',
    h3: 'text-xl font-semibold',
    h4: 'text-lg font-semibold',
    body: 'text-base',
    small: 'text-sm',
    tiny: 'text-xs',
    muted: 'text-muted-foreground',
  },

  // Spacing Scale (Tailwind values)
  spacing: {
    xs: '0.5rem', // 8px
    sm: '0.75rem', // 12px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
  },

  // Transition Utilities (Tailwind classes)
  transitions: {
    fast: 'transition-all duration-150 ease-in-out',
    DEFAULT: 'transition-all duration-200 ease-in-out',
    slow: 'transition-all duration-300 ease-in-out',
  },

  // Z-index Scale
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    modal: 30,
    popover: 40,
    tooltip: 50,
  },
} as const;

// Utility Functions

/**
 * Get color for status badges
 */
export function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    in_stock: designTokens.colors.success,
    out_of_stock: designTokens.colors.danger,
    excellent: designTokens.colors.success,
    good: designTokens.colors.primary,
    acceptable: designTokens.colors.warning,
    reviewed: designTokens.colors.success,
    not_reviewed: designTokens.colors.muted,
  };
  return statusMap[status.toLowerCase()] || designTokens.colors.muted;
}

/**
 * Get color for mileage rating badges
 */
export function getMileageRatingColor(rating: string): {
  bg: string;
  text: string;
  border: string;
} {
  const colorMap: Record<string, { bg: string; text: string; border: string }> =
    {
      excellent: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
      },
      good: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
      },
      acceptable: {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
      },
    };
  return (
    colorMap[rating.toLowerCase()] || {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
    }
  );
}

/**
 * Get trend indicator color (for stat cards)
 */
export function getTrendColor(value: number): {
  color: string;
  textClass: string;
} {
  if (value > 0) {
    return {
      color: designTokens.colors.success,
      textClass: 'text-green-600',
    };
  } else if (value < 0) {
    return {
      color: designTokens.colors.danger,
      textClass: 'text-red-600',
    };
  }
  return {
    color: designTokens.colors.muted,
    textClass: 'text-gray-600',
  };
}

/**
 * Format price with currency
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Format mileage with commas
 */
export function formatMileage(mileage: number): string {
  return new Intl.NumberFormat('en-US').format(mileage);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
