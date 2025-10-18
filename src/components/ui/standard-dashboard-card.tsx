import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

// 🎨 CORES EXATAS BASEADAS NAS IMAGENS DO DASHBOARD
export const DASHBOARD_COLORS = {
  // Cores principais dos cards (exatas das imagens)
  primary: '#A088D7',      // Roxo claro (Total de Leads)
  success: '#66D9B1',      // Verde claro (Leads Fechados) 
  warning: '#F59E0B',      // Laranja (Taxa de Conversão)
  info: '#3B82F6',         // Azul (Corretores Ativos)
  
  // Cores de texto (exatas das imagens)
  textPrimary: '#1F2937',  // Cinza escuro para títulos
  textSecondary: '#6B7280', // Cinza médio para subtítulos
  textLight: '#9CA3AF',    // Cinza claro para descrições
  
  // Cores de fundo (exatas das imagens)
  background: '#FFFFFF',   // Branco principal
  headerBackground: '#F8F9FC', // Roxo muito claro do header
  
  // Cores de borda (exatas das imagens)
  borderPrimary: '#E5E7EB',   // Cinza claro para bordas
  borderPurple: '#E5E7EB',    // Bordas roxas dos cards (mais sutil)
  borderGreen: '#E5E7EB',     // Bordas verdes dos cards (mais sutil)
  borderOrange: '#E5E7EB',    // Bordas laranja dos cards (mais sutil)
  borderBlue: '#E5E7EB',      // Bordas azuis dos cards (mais sutil)
  
  // Cores de trend (exatas das imagens)
  trendPositive: '#10B981',   // Verde para trends positivos
  trendNegative: '#EF4444',   // Vermelho para trends negativos
};

// 🎭 ANIMAÇÕES BASEADAS NAS IMAGENS
export const DASHBOARD_ANIMATIONS = {
  // Entrada da página
  pageInitial: { opacity: 0, y: -20 },
  pageAnimate: { opacity: 1, y: 0 },
  
  // Hover dos cards
  cardHover: { scale: 1.02, y: -2 },
  cardTap: { scale: 0.98 },
  
  // Entrada dos cards
  cardInitial: { opacity: 0, x: -20 },
  cardAnimate: { opacity: 1, x: 0 },
  
  // Delays escalonados
  cardDelay: (index: number) => 0.1 + (index * 0.1),
};

// 📊 INTERFACE DO CARD BASEADA NAS IMAGENS
interface StandardDashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
  icon: React.ComponentType<{ className?: string }>;
  color?: 'primary' | 'success' | 'warning' | 'info' | 'purple' | 'teal' | 'orange';
  borderColor?: string;
  className?: string;
}

// 🎨 MAPEAMENTO DE CORES EXATO DAS IMAGENS
const COLOR_MAPPING = {
  primary: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
    border: 'border-gray-200', // Bordas sutis como nas imagens
  },
  success: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    border: 'border-gray-200',
  },
  warning: {
    bg: 'bg-orange-100',
    text: 'text-orange-600',
    border: 'border-gray-200',
  },
  info: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    border: 'border-gray-200',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
    border: 'border-gray-200',
  },
  teal: {
    bg: 'bg-teal-100',
    text: 'text-teal-600',
    border: 'border-gray-200',
  },
  orange: {
    bg: 'bg-orange-100',
    text: 'text-orange-600',
    border: 'border-gray-200',
  },
};

// ✅ COMPONENTE PRINCIPAL EXATO DAS IMAGENS
export const StandardDashboardCard: React.FC<StandardDashboardCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  color = 'primary',
  borderColor,
  className = '',
}) => {
  const colorClasses = COLOR_MAPPING[color];
  const finalBorderColor = borderColor || colorClasses.border;

  return (
    <motion.div
      whileHover={DASHBOARD_ANIMATIONS.cardHover}
      whileTap={DASHBOARD_ANIMATIONS.cardTap}
      className={`relative h-full ${className}`}
    >
      <Card className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 h-full ${finalBorderColor} rounded-2xl`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {/* Título do card - tamanho exato das imagens */}
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {title}
              </p>
              
              {/* Valor principal - tamanho exato das imagens */}
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {value}
              </p>
              
              {/* Subtítulo - tamanho exato das imagens */}
              {subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {subtitle}
                </p>
              )}
              
              {/* Trend indicator - tamanho exato das imagens */}
              {trend && (
                <div className="flex items-center mt-2">
                  {trend.positive ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={`text-xs ${
                    trend.positive 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {trend.positive ? '+' : ''}{trend.value}% {trend.label}
                  </span>
                </div>
              )}
            </div>
            
            {/* Ícone - tamanho exato das imagens */}
            <div className={`p-3 rounded-xl ${colorClasses.bg}`}>
              <Icon className={`h-8 w-8 ${colorClasses.text}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// 🎯 COMPONENTE DE GRID EXATO DAS IMAGENS
interface StandardDashboardGridProps {
  children: React.ReactNode;
  columns?: '2' | '3' | '4' | '6';
  className?: string;
}

export const StandardDashboardGrid: React.FC<StandardDashboardGridProps> = ({
  children,
  columns = '4',
  className = '',
}) => {
  const gridClasses = {
    '2': 'grid-cols-1 md:grid-cols-2',
    '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4', // Exato das imagens
    '6': 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-6 ${className}`}>
      {children}
    </div>
  );
};

// 🎨 COMPONENTE DE CONTAINER EXATO DAS IMAGENS
interface StandardDashboardContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const StandardDashboardContainer: React.FC<StandardDashboardContainerProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-8 p-4 md:p-6 ${className}`}>
      {children}
    </div>
  );
};

// 📊 HOOK PARA ANIMAÇÕES ESCALONADAS
export const useDashboardAnimations = (itemCount: number) => {
  return {
    container: {
      initial: DASHBOARD_ANIMATIONS.pageInitial,
      animate: DASHBOARD_ANIMATIONS.pageAnimate,
      transition: { delay: 0.1 },
    },
    cards: Array.from({ length: itemCount }, (_, index) => ({
      initial: DASHBOARD_ANIMATIONS.cardInitial,
      animate: DASHBOARD_ANIMATIONS.cardAnimate,
      transition: { delay: DASHBOARD_ANIMATIONS.cardDelay(index) },
    })),
  };
};
