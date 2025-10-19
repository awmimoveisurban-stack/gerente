import { cn } from '@/lib/utils';

// 🎨 SISTEMA DE DESIGN UNIFICADO
// Baseado nas melhores práticas de UX/UI e padrões da dashboard

// 📐 ESPAÇAMENTOS PADRONIZADOS
export const SPACING = {
  // Espaçamentos base (múltiplos de 4px)
  xs: '4px',    // 1rem
  sm: '8px',    // 0.5rem
  md: '16px',   // 1rem
  lg: '24px',   // 1.5rem
  xl: '32px',   // 2rem
  '2xl': '48px', // 3rem
  '3xl': '64px', // 4rem
  
  // Classes Tailwind
  container: 'p-4 md:p-6 lg:p-8',
  section: 'mb-6 md:mb-8 lg:mb-12',
  card: 'p-4 md:p-6',
  button: 'px-4 py-2 md:px-6 md:py-3',
  input: 'px-3 py-2 md:px-4 md:py-3',
} as const;

// 🎨 PALETA DE CORES UNIFICADA
export const COLORS = {
  // Cores primárias (baseadas na dashboard)
  primary: {
    50: '#f0f4ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1', // Principal
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },
  
  // Cores semânticas
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Principal
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Principal
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Principal
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Cores neutras
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
} as const;

// 📱 BREAKPOINTS RESPONSIVOS
export const BREAKPOINTS = {
  mobile: '360px',
  tablet: '768px',
  desktop: '1024px',
  large: '1440px',
  xlarge: '1920px',
} as const;

// 🔤 TIPOGRAFIA PADRONIZADA
export const TYPOGRAPHY = {
  // Tamanhos de fonte
  fontSize: {
    xs: 'text-xs',      // 12px
    sm: 'text-sm',      // 14px
    base: 'text-base',  // 16px
    lg: 'text-lg',      // 18px
    xl: 'text-xl',      // 20px
    '2xl': 'text-2xl',  // 24px
    '3xl': 'text-3xl',  // 30px
    '4xl': 'text-4xl',  // 36px
    '5xl': 'text-5xl',  // 48px
  },
  
  // Pesos de fonte
  fontWeight: {
    light: 'font-light',     // 300
    normal: 'font-normal',   // 400
    medium: 'font-medium',   // 500
    semibold: 'font-semibold', // 600
    bold: 'font-bold',      // 700
    extrabold: 'font-extrabold', // 800
  },
  
  // Altura da linha
  lineHeight: {
    tight: 'leading-tight',   // 1.25
    snug: 'leading-snug',     // 1.375
    normal: 'leading-normal', // 1.5
    relaxed: 'leading-relaxed', // 1.625
    loose: 'leading-loose',   // 2
  },
  
  // Hierarquia tipográfica
  heading: {
    h1: 'text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white',
    h2: 'text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 dark:text-white',
    h3: 'text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white',
    h4: 'text-lg md:text-xl lg:text-2xl font-medium text-gray-900 dark:text-white',
    h5: 'text-base md:text-lg lg:text-xl font-medium text-gray-900 dark:text-white',
    h6: 'text-sm md:text-base lg:text-lg font-medium text-gray-900 dark:text-white',
  },
  
  body: {
    large: 'text-lg text-gray-700 dark:text-gray-300',
    base: 'text-base text-gray-700 dark:text-gray-300',
    small: 'text-sm text-gray-600 dark:text-gray-400',
    xs: 'text-xs text-gray-500 dark:text-gray-500',
  },
} as const;

// 🎴 CONFIGURAÇÕES DE CARD UNIFICADAS
export const CARD_CONFIG = {
  // Bordas
  borderRadius: {
    none: 'rounded-none',
    sm: 'rounded-sm',
    base: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    full: 'rounded-full',
  },
  
  // Sombras
  shadow: {
    none: 'shadow-none',
    sm: 'shadow-sm',
    base: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
  },
  
  // Bordas
  border: {
    none: 'border-0',
    thin: 'border',
    thick: 'border-2',
  },
  
  // Padding
  padding: {
    none: 'p-0',
    sm: 'p-3',
    base: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  },
  
  // Configuração padrão
  default: {
    className: 'rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6',
    hover: 'hover:shadow-xl hover:border-gray-300/50 dark:hover:border-gray-600/50',
    transition: 'transition-all duration-300 ease-out',
  },
} as const;

// 🔘 CONFIGURAÇÕES DE BOTÃO UNIFICADAS
export const BUTTON_CONFIG = {
  // Tamanhos
  size: {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    base: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  },
  
  // Variantes
  variant: {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-300',
    ghost: 'hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300',
    danger: 'bg-danger-500 hover:bg-danger-600 text-white',
    success: 'bg-success-500 hover:bg-success-600 text-white',
    warning: 'bg-warning-500 hover:bg-warning-600 text-white',
  },
  
  // Configuração padrão
  default: {
    className: 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    focus: 'focus:ring-primary-500',
  },
} as const;

// 📱 CONFIGURAÇÕES RESPONSIVAS
export const RESPONSIVE = {
  // Grid responsivo
  grid: {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  },
  
  // Espaçamento responsivo
  spacing: {
    container: 'p-4 md:p-6 lg:p-8',
    section: 'mb-6 md:mb-8 lg:mb-12',
    card: 'p-4 md:p-6',
    button: 'px-4 py-2 md:px-6 md:py-3',
    input: 'px-3 py-2 md:px-4 md:py-3',
  },
  
  // Texto responsivo
  text: {
    title: 'text-2xl md:text-3xl lg:text-4xl',
    subtitle: 'text-lg md:text-xl',
    body: 'text-sm md:text-base',
    caption: 'text-xs md:text-sm',
  },
  
  // Flexbox responsivo
  flex: {
    col: 'flex flex-col',
    row: 'flex flex-row',
    wrap: 'flex flex-wrap',
    nowrap: 'flex flex-nowrap',
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    start: 'flex items-start',
    end: 'flex items-end',
  },
} as const;

// 🎭 ANIMAÇÕES PADRONIZADAS
export const ANIMATIONS = {
  // Transições
  transition: {
    fast: 'transition-all duration-150 ease-out',
    normal: 'transition-all duration-300 ease-out',
    slow: 'transition-all duration-500 ease-out',
  },
  
  // Hover
  hover: {
    scale: 'hover:scale-105',
    shadow: 'hover:shadow-xl',
    opacity: 'hover:opacity-80',
  },
  
  // Focus
  focus: {
    ring: 'focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    outline: 'focus:outline-none',
  },
} as const;

// 🎨 TEMAS (Dark/Light)
export const THEMES = {
  light: {
    background: 'bg-white',
    surface: 'bg-gray-50',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    border: 'border-gray-200',
  },
  dark: {
    background: 'bg-gray-900',
    surface: 'bg-gray-800',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    border: 'border-gray-700',
  },
} as const;

// 🔧 UTILITÁRIOS DE DESIGN
export const DESIGN_UTILS = {
  // Criar classe de card padronizada
  createCard: (variant: 'default' | 'elevated' | 'outlined' = 'default') => {
    const base = CARD_CONFIG.default.className;
    const variants = {
      default: base,
      elevated: base + ' shadow-xl',
      outlined: base.replace('shadow-lg', 'shadow-none') + ' border-2',
    };
    return variants[variant];
  },
  
  // Criar classe de botão padronizada
  createButton: (size: keyof typeof BUTTON_CONFIG.size = 'base', variant: keyof typeof BUTTON_CONFIG.variant = 'primary') => {
    return cn(
      BUTTON_CONFIG.default.className,
      BUTTON_CONFIG.size[size],
      BUTTON_CONFIG.variant[variant],
      BUTTON_CONFIG.default.focus
    );
  },
  
  // Criar classe responsiva
  createResponsive: (mobile: string, tablet?: string, desktop?: string) => {
    return cn(mobile, tablet && `md:${tablet}`, desktop && `lg:${desktop}`);
  },
  
  // Criar grid responsivo
  createGrid: (cols: keyof typeof RESPONSIVE.grid) => {
    return cn('grid gap-4 md:gap-6', RESPONSIVE.grid[cols]);
  },
} as const;

// 📋 EXPORTAR TODAS AS CONFIGURAÇÕES
export const DESIGN_SYSTEM = {
  SPACING,
  COLORS,
  BREAKPOINTS,
  TYPOGRAPHY,
  CARD_CONFIG,
  BUTTON_CONFIG,
  RESPONSIVE,
  ANIMATIONS,
  THEMES,
  DESIGN_UTILS,
} as const;

export default DESIGN_SYSTEM;

