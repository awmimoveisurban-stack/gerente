import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AppLayout } from '@/components/layout/app-layout';
import { 
  StandardMetricCard, 
  StandardContentCard, 
  StandardStatCard,
  StandardGrid,
  StandardContainer,
  STANDARD_CARD_COLORS,
  STANDARD_CARD_ANIMATIONS 
} from '@/components/ui/standard-card';
// ✅ NOVOS COMPONENTES BASEADOS NAS IMAGENS
import {
  StandardDashboardCard,
  StandardDashboardGrid,
  StandardDashboardContainer,
  DASHBOARD_COLORS,
  DASHBOARD_ANIMATIONS,
  useDashboardAnimations,
} from '@/components/ui/standard-dashboard-card';

// 🎨 PALETA DE CORES PADRONIZADA (re-exportada do standard-card)
export const STANDARD_COLORS = STANDARD_CARD_COLORS;

// ✅ RE-EXPORTAR NOVOS COMPONENTES BASEADOS NAS IMAGENS
export {
  StandardDashboardCard,
  StandardDashboardGrid,
  StandardDashboardContainer,
  DASHBOARD_COLORS,
  DASHBOARD_ANIMATIONS,
  useDashboardAnimations,
};

// 🎯 CONFIGURAÇÕES DE LAYOUT PADRONIZADAS
export const LAYOUT_CONFIG = {
  containerPadding: 'space-y-8',
  headerGradient: 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800',
  headerBorder: 'border border-blue-200/50 dark:border-gray-700/50',
  headerShadow: 'shadow-lg',
  headerRadius: 'rounded-3xl',
  headerPadding: 'p-8',
  gridResponsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
  cardSpacing: 'space-y-6',
  buttonSpacing: 'gap-3',
};

// 🎭 ANIMAÇÕES PADRONIZADAS
export const STANDARD_ANIMATIONS = {
  pageInitial: { opacity: 0, y: -20 },
  pageAnimate: { opacity: 1, y: 0 },
  cardHover: { scale: 1.02, transition: { duration: 0.2 } },
  cardTap: { scale: 0.98 },
};

// 📱 BREAKPOINTS RESPONSIVOS
export const RESPONSIVE_BREAKPOINTS = {
  mobile: '360px',
  tablet: '768px',
  desktop: '1024px',
  large: '1440px',
};

// 🎨 COMPONENTE DE HEADER PADRONIZADO
interface StandardHeaderProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  badges?: Array<{
    icon: React.ReactNode;
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  }>;
  actions?: React.ReactNode;
  gradient?: string;
}

export const StandardHeader: React.FC<StandardHeaderProps> = ({
  title,
  description,
  icon,
  badges = [],
  actions,
  gradient = LAYOUT_CONFIG.headerGradient,
}) => {
  return (
    <motion.div
      initial={STANDARD_ANIMATIONS.pageInitial}
      animate={STANDARD_ANIMATIONS.pageAnimate}
      className={`${gradient} ${LAYOUT_CONFIG.headerRadius} ${LAYOUT_CONFIG.headerPadding} ${LAYOUT_CONFIG.headerBorder} ${LAYOUT_CONFIG.headerShadow}`}
    >
      <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6'>
        <div className='space-y-3'>
          <div className='flex items-center gap-3'>
            {icon && (
              <div className='p-2 bg-white/20 rounded-xl'>
                {icon}
              </div>
            )}
            <div>
              <h1 className='text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
                {title}
              </h1>
              <p className='text-gray-600 dark:text-gray-400 mt-2 text-lg'>
                {description}
              </p>
            </div>
          </div>
          
          {badges.length > 0 && (
            <div className='flex flex-wrap items-center gap-4'>
              {badges.map((badge, index) => (
                <Badge key={index} variant={badge.variant || 'outline'} className='bg-white/50'>
                  {badge.icon}
                  <span className='ml-1'>{badge.text}</span>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {actions && (
          <div className={`flex flex-wrap ${LAYOUT_CONFIG.buttonSpacing}`}>
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// 📊 COMPONENTE DE CARD MÉTRICA PADRONIZADO (re-exportado do standard-card)
export { StandardMetricCard } from '@/components/ui/standard-card';

// 🎯 COMPONENTE DE GRID PADRONIZADO
interface StandardGridProps {
  children: React.ReactNode;
  columns?: '1' | '2' | '3' | '4';
  gap?: '4' | '6' | '8';
}

export const StandardGrid: React.FC<StandardGridProps> = ({
  children,
  columns = '4',
  gap = '6',
}) => {
  const gridClass = `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-${gap}`;
  
  return (
    <div className={gridClass}>
      {children}
    </div>
  );
};

// 📱 COMPONENTE DE LAYOUT PADRONIZADO
interface StandardPageLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
}

export const StandardPageLayout: React.FC<StandardPageLayoutProps> = ({
  children,
  header,
  className = '',
}) => {
  return (
    <AppLayout>
      <div className={`${LAYOUT_CONFIG.containerPadding} ${className}`}>
        {header}
        {children}
      </div>
    </AppLayout>
  );
};

// 🔧 HOOK PARA PADRONIZAÇÃO
export const useStandardLayout = () => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [hoveredCard, setHoveredCard] = React.useState<string | null>(null);

  const handleRefresh = async (refetchFn: () => Promise<void>, toast: any) => {
    setIsRefreshing(true);
    try {
      await refetchFn();
      toast({
        title: '✅ Dados Atualizados',
        description: 'Informações atualizadas com sucesso!',
      });
    } catch (error) {
      toast({
        title: '❌ Erro ao Atualizar',
        description: 'Não foi possível atualizar os dados.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    isRefreshing,
    hoveredCard,
    setHoveredCard,
    handleRefresh,
  };
};

// 📋 UTILITÁRIOS DE RESPONSIVIDADE
export const RESPONSIVE_UTILS = {
  // Classes para diferentes tamanhos de tela
  mobile: 'sm:hidden',
  tablet: 'hidden sm:block md:hidden',
  desktop: 'hidden md:block lg:hidden',
  large: 'hidden lg:block',
  
  // Grid responsivo
  grid1: 'grid-cols-1',
  grid2: 'grid-cols-1 md:grid-cols-2',
  grid3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  grid4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  
  // Espaçamento responsivo
  spacing: {
    mobile: 'p-4',
    tablet: 'p-6',
    desktop: 'p-8',
  },
  
  // Texto responsivo
  text: {
    title: 'text-2xl md:text-3xl lg:text-4xl',
    subtitle: 'text-lg md:text-xl',
    body: 'text-sm md:text-base',
  },
};

export default {
  STANDARD_COLORS,
  LAYOUT_CONFIG,
  STANDARD_ANIMATIONS,
  RESPONSIVE_BREAKPOINTS,
  StandardHeader,
  StandardMetricCard,
  StandardGrid,
  StandardPageLayout,
  useStandardLayout,
  RESPONSIVE_UTILS,
};
