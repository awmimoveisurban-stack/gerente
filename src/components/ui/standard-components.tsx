import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DESIGN_SYSTEM } from '@/design-system';

// 🎨 COMPONENTE DE CARD PADRONIZADO
interface StandardCardProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  headerActions?: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
}

export const StandardCard: React.FC<StandardCardProps> = ({
  title,
  description,
  icon: Icon,
  children,
  className,
  variant = 'default',
  color = 'primary',
  headerActions,
  loading = false,
  onClick,
}) => {
  const cardClass = cn(
    DESIGN_SYSTEM.DESIGN_UTILS.createCard(variant),
    DESIGN_SYSTEM.ANIMATIONS.transition.normal,
    onClick && 'cursor-pointer hover:scale-105',
    className
  );

  const CardComponent = onClick ? motion.div : 'div';
  const cardProps = onClick ? {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    onClick,
  } : {};

  return (
    <CardComponent {...cardProps}>
      <Card className={cardClass}>
        {(title || Icon || headerActions) && (
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className={cn(
                    'p-2 rounded-xl',
                    color === 'primary' && 'bg-primary-100 text-primary-600',
                    color === 'success' && 'bg-success-100 text-success-600',
                    color === 'warning' && 'bg-warning-100 text-warning-600',
                    color === 'danger' && 'bg-danger-100 text-danger-600',
                    color === 'info' && 'bg-blue-100 text-blue-600'
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                )}
                <div>
                  {title && (
                    <CardTitle className={cn(
                      DESIGN_SYSTEM.TYPOGRAPHY.heading.h5,
                      'text-gray-900 dark:text-white'
                    )}>
                      {title}
                    </CardTitle>
                  )}
                  {description && (
                    <CardDescription className={cn(
                      DESIGN_SYSTEM.TYPOGRAPHY.body.small,
                      'mt-1'
                    )}>
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
        )}
        <CardContent className={cn(
          title ? 'pt-0' : '',
          loading && 'animate-pulse'
        )}>
          {children}
        </CardContent>
      </Card>
    </CardComponent>
  );
};

// 📊 COMPONENTE DE MÉTRICA PADRONIZADO
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  progress?: number;
  className?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'primary',
  trend,
  progress,
  className,
  onClick,
}) => {
  const CardComponent = onClick ? motion.div : 'div';
  const cardProps = onClick ? {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    onClick,
  } : {};

  return (
    <CardComponent {...cardProps}>
      <Card className={cn(
        DESIGN_SYSTEM.DESIGN_UTILS.createCard('elevated'),
        DESIGN_SYSTEM.ANIMATIONS.transition.normal,
        onClick && 'cursor-pointer hover:shadow-2xl',
        className
      )}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className={cn(
                DESIGN_SYSTEM.TYPOGRAPHY.body.small,
                'text-gray-600 dark:text-gray-400'
              )}>
                {title}
              </p>
              <p className={cn(
                DESIGN_SYSTEM.TYPOGRAPHY.heading.h2,
                'text-gray-900 dark:text-white'
              )}>
                {value}
              </p>
              {subtitle && (
                <p className={cn(
                  DESIGN_SYSTEM.TYPOGRAPHY.body.small,
                  'text-gray-500 dark:text-gray-500'
                )}>
                  {subtitle}
                </p>
              )}
            </div>
            {Icon && (
              <div className={cn(
                'p-3 rounded-xl',
                color === 'primary' && 'bg-primary-100 text-primary-600',
                color === 'success' && 'bg-success-100 text-success-600',
                color === 'warning' && 'bg-warning-100 text-warning-600',
                color === 'danger' && 'bg-danger-100 text-danger-600',
                color === 'info' && 'bg-blue-100 text-blue-600'
              )}>
                <Icon className="h-6 w-6" />
              </div>
            )}
          </div>
          
          {trend && (
            <div className="mt-4 flex items-center gap-2">
              <Badge variant={trend.isPositive ? 'default' : 'destructive'} className="text-xs">
                {trend.isPositive ? '+' : ''}{trend.value}%
              </Badge>
              <span className={cn(
                DESIGN_SYSTEM.TYPOGRAPHY.body.xs,
                'text-gray-500 dark:text-gray-500'
              )}>
                vs mês anterior
              </span>
            </div>
          )}
          
          {progress !== undefined && (
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
    </CardComponent>
  );
};

// 🔘 COMPONENTE DE BOTÃO PADRONIZADO
interface StandardButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  icon?: LucideIcon;
  loading?: boolean;
  fullWidth?: boolean;
}

export const StandardButton: React.FC<StandardButtonProps> = ({
  variant = 'primary',
  size = 'base',
  icon: Icon,
  loading = false,
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}) => {
  return (
    <Button
      className={cn(
        DESIGN_SYSTEM.DESIGN_UTILS.createButton(size, variant),
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      ) : (
        <>
          {Icon && <Icon className="h-4 w-4 mr-2" />}
          {children}
        </>
      )}
    </Button>
  );
};

// 📱 COMPONENTE DE CONTAINER RESPONSIVO
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'base' | 'md' | 'lg' | 'xl';
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  maxWidth = 'full',
  padding = 'base',
}) => {
  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  }[maxWidth];

  const paddingClass = {
    none: 'p-0',
    sm: 'p-3',
    base: 'p-4 md:p-6',
    md: 'p-6 md:p-8',
    lg: 'p-8 md:p-10',
    xl: 'p-10 md:p-12',
  }[padding];

  return (
    <div className={cn(
      'mx-auto',
      maxWidthClass,
      paddingClass,
      className
    )}>
      {children}
    </div>
  );
};

// 📊 COMPONENTE DE GRID RESPONSIVO
interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'base' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = 4,
  gap = 'base',
  className,
}) => {
  const gapClass = {
    sm: 'gap-2',
    base: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-10',
  }[gap];

  return (
    <div className={cn(
      DESIGN_SYSTEM.DESIGN_UTILS.createGrid(cols),
      gapClass,
      className
    )}>
      {children}
    </div>
  );
};

// 📋 COMPONENTE DE HEADER PADRONIZADO
interface StandardHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badges?: Array<{
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    icon?: LucideIcon;
  }>;
  actions?: React.ReactNode;
  className?: string;
}

export const StandardHeader: React.FC<StandardHeaderProps> = ({
  title,
  description,
  icon: Icon,
  badges = [],
  actions,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800',
        'rounded-3xl p-6 md:p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg',
        className
      )}
    >
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 bg-white/20 rounded-xl">
                <Icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              </div>
            )}
            <div>
              <h1 className={cn(
                DESIGN_SYSTEM.TYPOGRAPHY.heading.h1,
                'text-gray-900 dark:text-white'
              )}>
                {title}
              </h1>
              {description && (
                <p className={cn(
                  DESIGN_SYSTEM.TYPOGRAPHY.body.large,
                  'text-gray-600 dark:text-gray-400 mt-2'
                )}>
                  {description}
                </p>
              )}
            </div>
          </div>
          
          {badges.length > 0 && (
            <div className="flex flex-wrap items-center gap-4">
              {badges.map((badge, index) => (
                <Badge key={index} variant={badge.variant || 'outline'} className="bg-white/50">
                  {badge.icon && <badge.icon className="h-3 w-3 mr-1" />}
                  <span>{badge.text}</span>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// 📱 COMPONENTE DE PÁGINA PADRONIZADA
interface StandardPageProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
  container?: boolean;
}

export const StandardPage: React.FC<StandardPageProps> = ({
  children,
  header,
  className,
  container = true,
}) => {
  const content = (
    <div className={cn(
      'space-y-6 md:space-y-8',
      className
    )}>
      {header}
      {children}
    </div>
  );

  return container ? (
    <ResponsiveContainer padding="base">
      {content}
    </ResponsiveContainer>
  ) : content;
};