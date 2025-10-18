import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// 🎨 PALETA DE CORES PADRONIZADA
export const STANDARD_CARD_COLORS = {
  primary: '#6366F1',      // Indigo mais moderno
  secondary: '#6B7280',    // Cinza neutro
  success: '#10B981',      // Verde
  warning: '#F59E0B',      // Amarelo
  danger: '#EF4444',       // Vermelho
  info: '#3B82F6',         // Azul
  purple: '#8B5CF6',       // Roxo
  teal: '#14B8A6',         // Teal
  orange: '#F97316',       // Laranja
  background: '#F9FAFB',   // Fundo claro
  darkBackground: '#111827', // Fundo escuro
};

// 🎭 ANIMAÇÕES PADRONIZADAS
export const STANDARD_CARD_ANIMATIONS = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.98 },
};

// 📐 CONFIGURAÇÕES DE CARD PADRONIZADAS
export const STANDARD_CARD_CONFIG = {
  borderRadius: 'rounded-2xl',
  shadow: 'shadow-lg',
  border: 'border border-gray-200/50 dark:border-gray-700/50',
  padding: 'p-6',
  headerPadding: 'pb-4',
  contentPadding: 'pt-0',
  transition: 'transition-all duration-300 ease-out',
  hoverShadow: 'hover:shadow-xl',
  hoverBorder: 'hover:border-gray-300/50 dark:hover:border-gray-600/50',
};

// 🎯 INTERFACE PARA CARD DE MÉTRICA PADRONIZADO (BASEADO NA IMAGEM)
interface StandardMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: keyof typeof STANDARD_CARD_COLORS;
  trend?: {
    value: number;
    isPositive: boolean;
    period?: string;
  };
  progress?: number;
  className?: string;
  onClick?: () => void;
  loading?: boolean;
}

export const StandardMetricCard: React.FC<StandardMetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'primary',
  trend,
  progress,
  className,
  onClick,
  loading = false,
}) => {
  const cardColor = STANDARD_CARD_COLORS[color] || STANDARD_CARD_COLORS.primary;
  
  const CardComponent = onClick ? motion.div : 'div';
  const cardProps = onClick ? {
    whileHover: STANDARD_CARD_ANIMATIONS.hover,
    whileTap: STANDARD_CARD_ANIMATIONS.tap,
    onClick,
    className: 'cursor-pointer',
  } : {};

  return (
    <CardComponent {...cardProps}>
      <Card 
        className={cn(
          'h-full transition-all duration-300 ease-out',
          'border-2', // Borda mais espessa como na imagem
          onClick && 'hover:shadow-xl hover:scale-105',
          className
        )}
        style={{ borderColor: `${cardColor}40` }} // Borda colorida sutil
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between h-full">
            {/* CONTEÚDO PRINCIPAL (ESQUERDA) */}
            <div className="flex-1 space-y-3">
              {/* TÍTULO */}
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {title}
              </p>
              
              {/* MÉTRICA PRINCIPAL */}
              {loading ? (
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ) : (
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {value}
                </div>
              )}
              
              {/* DESCRIÇÃO */}
              {subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
              
              {/* TREND INDICATOR */}
              {trend && (
                <div className="flex items-center gap-1">
                  <div className={cn(
                    'flex items-center gap-1 text-sm font-medium',
                    trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  )}>
                    <div className={cn(
                      'w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent',
                      trend.isPositive ? 'border-b-green-600' : 'border-b-red-600'
                    )} />
                    <span>
                      {trend.isPositive ? '+' : ''}{trend.value}%
                    </span>
                  </div>
                  {trend.period && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {trend.period}
                    </span>
                  )}
                </div>
              )}
              
              {/* PROGRESS BAR */}
              {progress !== undefined && (
                <Progress 
                  value={progress} 
                  className="h-2 mt-2"
                  style={{ 
                    '--progress-background': `${cardColor}20`,
                    '--progress-foreground': cardColor,
                  } as React.CSSProperties}
                />
              )}
            </div>
            
            {/* ÍCONE (DIREITA) */}
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center ml-4"
              style={{ backgroundColor: `${cardColor}15` }}
            >
              {React.createElement(Icon, {
                className: "h-8 w-8",
                style: { color: cardColor }
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </CardComponent>
  );
};

// 🎯 INTERFACE PARA CARD DE CONTEÚDO PADRONIZADO
interface StandardContentCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  color?: keyof typeof STANDARD_CARD_COLORS;
  className?: string;
  headerActions?: React.ReactNode;
  loading?: boolean;
}

export const StandardContentCard: React.FC<StandardContentCardProps> = ({
  title,
  description,
  children,
  icon: Icon,
  color = 'primary',
  className,
  headerActions,
  loading = false,
}) => {
  const cardColor = STANDARD_CARD_COLORS[color] || STANDARD_CARD_COLORS.primary;

  return (
    <Card 
      className={cn(
        STANDARD_CARD_CONFIG.borderRadius,
        STANDARD_CARD_CONFIG.shadow,
        STANDARD_CARD_CONFIG.border,
        STANDARD_CARD_CONFIG.transition,
      className
      )}
    >
      <CardHeader className={cn(STANDARD_CARD_CONFIG.headerPadding)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div 
                className="p-2 rounded-xl"
                style={{ backgroundColor: `${cardColor}20` }}
              >
                {React.createElement(Icon, {
                  className: "h-5 w-5",
                  style: { color: cardColor }
                })}
            </div>
            )}
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                {title}
              </CardTitle>
              {description && (
                <CardDescription className="text-sm text-muted-foreground mt-1">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
          {headerActions && (
            <div className="flex items-center gap-2">
              {headerActions}
          </div>
          )}
        </div>
      </CardHeader>
      <CardContent className={cn(STANDARD_CARD_CONFIG.contentPadding)}>
        {loading ? (
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};

// 🎯 INTERFACE PARA CARD DE ESTATÍSTICA PADRONIZADO
interface StandardStatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
    period?: string;
  };
  icon: LucideIcon;
  color?: keyof typeof STANDARD_CARD_COLORS;
  className?: string;
  onClick?: () => void;
}

export const StandardStatCard: React.FC<StandardStatCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color = 'primary',
  className,
  onClick,
}) => {
  const cardColor = STANDARD_CARD_COLORS[color] || STANDARD_CARD_COLORS.primary;
  
  const CardComponent = onClick ? motion.div : 'div';
  const cardProps = onClick ? {
    whileHover: STANDARD_CARD_ANIMATIONS.hover,
    whileTap: STANDARD_CARD_ANIMATIONS.tap,
    onClick,
    className: 'cursor-pointer',
  } : {};

  return (
    <CardComponent {...cardProps}>
      <Card 
        className={cn(
          STANDARD_CARD_CONFIG.borderRadius,
          STANDARD_CARD_CONFIG.shadow,
          STANDARD_CARD_CONFIG.border,
          STANDARD_CARD_CONFIG.transition,
          onClick && STANDARD_CARD_CONFIG.hoverShadow,
          onClick && STANDARD_CARD_CONFIG.hoverBorder,
          className
        )}
      >
        <CardContent className={cn(STANDARD_CARD_CONFIG.padding)}>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <div className="text-2xl font-bold text-foreground">
                {value}
              </div>
              {change && (
                <div className="flex items-center gap-1">
                  <span className={cn(
                    'text-xs font-medium',
                    change.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  )}>
                    {change.isPositive ? '+' : ''}{change.value}%
                  </span>
                  {change.period && (
                    <span className="text-xs text-muted-foreground">
                      {change.period}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div 
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${cardColor}20` }}
            >
              {React.createElement(Icon, {
                className: "h-6 w-6",
                style: { color: cardColor }
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </CardComponent>
  );
};

// 🎯 COMPONENTE DE GRID PADRONIZADO
interface StandardGridProps {
  children: React.ReactNode;
  columns?: '1' | '2' | '3' | '4' | '5' | '6';
  className?: string;
}

export const StandardGrid: React.FC<StandardGridProps> = ({
  children,
  columns = '4',
  className,
}) => {
  const gridClasses = {
    '1': 'grid grid-cols-1',
    '2': 'grid grid-cols-1 md:grid-cols-2',
    '3': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    '4': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    '5': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    '6': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };

  return (
    <div className={cn(gridClasses[columns], 'gap-6', className)}>
      {children}
    </div>
  );
};

// 🎯 COMPONENTE DE CONTAINER PADRONIZADO
interface StandardContainerProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

export const StandardContainer: React.FC<StandardContainerProps> = ({
  children,
  className,
  spacing = 'md',
}) => {
  const spacingClasses = {
    sm: 'space-y-4',
    md: 'space-y-6',
    lg: 'space-y-8',
  };

  return (
    <div className={cn(spacingClasses[spacing], className)}>
      {children}
    </div>
  );
};