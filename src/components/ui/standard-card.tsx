/**
 * 🎨 CARD PADRONIZADO DO SISTEMA
 * 
 * Componente de card unificado para manter consistência visual
 * em todas as páginas (Dashboard, Relatórios, Kanban, Equipe, WhatsApp)
 */

import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StandardCardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  variant?: 'default' | 'gradient' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function StandardCard({
  children,
  title,
  description,
  icon,
  className,
  headerClassName,
  contentClassName,
  variant = 'default',
  size = 'md'
}: StandardCardProps) {
  const baseClasses = "bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all duration-200";
  
  const variantClasses = {
    default: baseClasses,
    gradient: "bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-gray-800/95 dark:to-gray-900/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all duration-200",
    outline: "bg-transparent border-2 border-gray-200/50 dark:border-gray-700/50 shadow-none hover:shadow-sm transition-all duration-200"
  };

  const sizeClasses = {
    sm: "rounded-lg",
    md: "rounded-xl", 
    lg: "rounded-2xl"
  };

  const paddingClasses = {
    sm: "p-3 lg:p-4",
    md: "p-4 lg:p-6",
    lg: "p-6 lg:p-8"
  };

  return (
    <Card className={cn(
      variantClasses[variant],
      sizeClasses[size],
      className
    )}>
      {(title || description || icon) && (
        <CardHeader className={cn(
          "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200/50 dark:border-gray-700/50",
          paddingClasses[size],
          headerClassName
        )}>
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-1.5 bg-primary/10 rounded-lg flex-shrink-0">
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {title && (
                <CardTitle className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                  {title}
                </CardTitle>
              )}
              {description && (
                <CardDescription className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(
        paddingClasses[size],
        contentClassName
      )}>
        {children}
      </CardContent>
    </Card>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  color?: 'violet' | 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'emerald';
  trend?: {
    value: string;
    isPositive: boolean;
  };
  progress?: number;
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color = 'blue',
  trend,
  progress,
  className
}: MetricCardProps) {
  const colorClasses = {
    violet: {
      bg: 'from-violet-50 to-violet-100 dark:from-violet-950/30 dark:to-violet-900/30',
      border: 'border-violet-200/50 dark:border-violet-800/50',
      text: 'text-violet-700 dark:text-violet-300',
      value: 'text-violet-900 dark:text-violet-100',
      subtitle: 'text-violet-600 dark:text-violet-400',
      icon: 'bg-violet-500',
      dot: 'bg-violet-500'
    },
    blue: {
      bg: 'from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30',
      border: 'border-blue-200/50 dark:border-blue-800/50',
      text: 'text-blue-700 dark:text-blue-300',
      value: 'text-blue-900 dark:text-blue-100',
      subtitle: 'text-blue-600 dark:text-blue-400',
      icon: 'bg-blue-500',
      dot: 'bg-blue-500'
    },
    green: {
      bg: 'from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30',
      border: 'border-green-200/50 dark:border-green-800/50',
      text: 'text-green-700 dark:text-green-300',
      value: 'text-green-900 dark:text-green-100',
      subtitle: 'text-green-600 dark:text-green-400',
      icon: 'bg-green-500',
      dot: 'bg-green-500'
    },
    amber: {
      bg: 'from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30',
      border: 'border-amber-200/50 dark:border-amber-800/50',
      text: 'text-amber-700 dark:text-amber-300',
      value: 'text-amber-900 dark:text-amber-100',
      subtitle: 'text-amber-600 dark:text-amber-400',
      icon: 'bg-amber-500',
      dot: 'bg-amber-500'
    },
    red: {
      bg: 'from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30',
      border: 'border-red-200/50 dark:border-red-800/50',
      text: 'text-red-700 dark:text-red-300',
      value: 'text-red-900 dark:text-red-100',
      subtitle: 'text-red-600 dark:text-red-400',
      icon: 'bg-red-500',
      dot: 'bg-red-500'
    },
    purple: {
      bg: 'from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30',
      border: 'border-purple-200/50 dark:border-purple-800/50',
      text: 'text-purple-700 dark:text-purple-300',
      value: 'text-purple-900 dark:text-purple-100',
      subtitle: 'text-purple-600 dark:text-purple-400',
      icon: 'bg-purple-500',
      dot: 'bg-purple-500'
    },
    emerald: {
      bg: 'from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30',
      border: 'border-emerald-200/50 dark:border-emerald-800/50',
      text: 'text-emerald-700 dark:text-emerald-300',
      value: 'text-emerald-900 dark:text-emerald-100',
      subtitle: 'text-emerald-600 dark:text-emerald-400',
      icon: 'bg-emerald-500',
      dot: 'bg-emerald-500'
    }
  };

  const colors = colorClasses[color];

  return (
    <div className={cn(
      "bg-gradient-to-br p-4 lg:p-6 rounded-xl border hover:shadow-md transition-all duration-200",
      colors.bg,
      colors.border,
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className={cn("text-xs lg:text-sm font-semibold", colors.text)}>
            {title}
          </p>
          <p className={cn("text-2xl lg:text-3xl font-bold mt-1", colors.value)}>
            {value}
          </p>
          {subtitle && (
            <p className={cn("text-xs mt-2 flex items-center gap-1", colors.subtitle)}>
              <span className={cn("w-2 h-2 rounded-full", colors.dot)}></span>
              {subtitle}
            </p>
          )}
          {trend && (
            <p className={cn(
              "text-xs mt-2 flex items-center gap-1",
              trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            )}>
              <span className={cn(
                "w-2 h-2 rounded-full",
                trend.isPositive ? "bg-green-500" : "bg-red-500"
              )}></span>
              {trend.value}
            </p>
          )}
          {progress !== undefined && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={cn("h-2 rounded-full transition-all duration-300", colors.icon)}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        <div className={cn("p-2 lg:p-3 rounded-xl flex-shrink-0 ml-3", colors.icon)}>
          <div className="text-white">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ActionCardProps {
  title: string;
  description?: string;
  icon: ReactNode;
  action: ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function ActionCard({
  title,
  description,
  icon,
  action,
  className,
  variant = 'default'
}: ActionCardProps) {
  const variantClasses = {
    default: "bg-white/95 dark:bg-gray-800/95 border-gray-200/50 dark:border-gray-700/50",
    success: "bg-green-50/80 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/50",
    warning: "bg-amber-50/80 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-800/50",
    error: "bg-red-50/80 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/50"
  };

  return (
    <Card className={cn(
      "backdrop-blur-sm border shadow-sm hover:shadow-md transition-all duration-200",
      variantClasses[variant],
      className
    )}>
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">
                {title}
              </h3>
              {description && (
                <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 ml-3">
            {action}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



