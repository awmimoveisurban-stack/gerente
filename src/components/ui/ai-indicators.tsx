import React from 'react';
import { 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  Target, 
  Clock,
  Star,
  Zap,
  Shield,
  Flame,
  Snowflake
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 🎯 INTERFACE PARA INDICADOR DE SCORE IA
interface ScoreIndicatorProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ScoreIndicator: React.FC<ScoreIndicatorProps> = ({
  score,
  size = 'md',
  showLabel = true,
  className = ''
}) => {
  const getScoreConfig = (score: number) => {
    if (score >= 90) {
      return {
        color: 'text-red-600 bg-red-50 border-red-200',
        icon: <Flame className="h-3 w-3" />,
        label: 'Excelente',
        bgGradient: 'from-red-500 to-red-600'
      };
    }
    if (score >= 80) {
      return {
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        icon: <Zap className="h-3 w-3" />,
        label: 'Muito Bom',
        bgGradient: 'from-orange-500 to-orange-600'
      };
    }
    if (score >= 60) {
      return {
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        icon: <Star className="h-3 w-3" />,
        label: 'Bom',
        bgGradient: 'from-yellow-500 to-yellow-600'
      };
    }
    if (score >= 40) {
      return {
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        icon: <Target className="h-3 w-3" />,
        label: 'Regular',
        bgGradient: 'from-blue-500 to-blue-600'
      };
    }
    return {
      color: 'text-gray-600 bg-gray-50 border-gray-200',
      icon: <Snowflake className="h-3 w-3" />,
      label: 'Baixo',
      bgGradient: 'from-gray-500 to-gray-600'
    };
  };

  const config = getScoreConfig(score);
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <div className={cn(
      'flex items-center gap-1 rounded-full font-medium border',
      config.color,
      sizeClasses[size],
      className
    )}>
      <Brain className="h-3 w-3" />
      <span className="font-bold">{score}</span>
      {showLabel && (
        <span className="text-xs opacity-75">
          {config.label}
        </span>
      )}
    </div>
  );
};

// 🎯 INTERFACE PARA INDICADOR DE PRIORIDADE
interface PriorityIndicatorProps {
  priority: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const PriorityIndicator: React.FC<PriorityIndicatorProps> = ({
  priority,
  size = 'md',
  showLabel = true,
  className = ''
}) => {
  const getPriorityConfig = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgente':
        return {
          color: 'text-red-600 bg-red-50 border-red-200',
          icon: <AlertTriangle className="h-3 w-3" />,
          label: 'Urgente',
          pulse: true
        };
      case 'alta':
        return {
          color: 'text-orange-600 bg-orange-50 border-orange-200',
          icon: <TrendingUp className="h-3 w-3" />,
          label: 'Alta',
          pulse: false
        };
      case 'media':
        return {
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          icon: <Target className="h-3 w-3" />,
          label: 'Média',
          pulse: false
        };
      case 'baixa':
        return {
          color: 'text-green-600 bg-green-50 border-green-200',
          icon: <Clock className="h-3 w-3" />,
          label: 'Baixa',
          pulse: false
        };
      default:
        return {
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          icon: <Target className="h-3 w-3" />,
          label: 'Média',
          pulse: false
        };
    }
  };

  const config = getPriorityConfig(priority);
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <div className={cn(
      'flex items-center gap-1 rounded-full font-medium border',
      config.color,
      sizeClasses[size],
      config.pulse && 'animate-pulse',
      className
    )}>
      {config.icon}
      {showLabel && (
        <span className="capitalize font-semibold">
          {config.label}
        </span>
      )}
    </div>
  );
};

// 🎯 INTERFACE PARA INDICADOR DE ORIGEM
interface OriginIndicatorProps {
  origin: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const OriginIndicator: React.FC<OriginIndicatorProps> = ({
  origin,
  size = 'md',
  showLabel = true,
  className = ''
}) => {
  const getOriginConfig = (origin: string) => {
    switch (origin?.toLowerCase()) {
      case 'whatsapp':
        return {
          color: 'text-green-600 bg-green-50 border-green-200',
          icon: <Brain className="h-3 w-3" />, // Usando Brain como placeholder
          label: 'WhatsApp'
        };
      case 'site':
        return {
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          icon: <Shield className="h-3 w-3" />,
          label: 'Site'
        };
      case 'indicacao':
        return {
          color: 'text-purple-600 bg-purple-50 border-purple-200',
          icon: <Star className="h-3 w-3" />,
          label: 'Indicação'
        };
      case 'manual':
        return {
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          icon: <Target className="h-3 w-3" />,
          label: 'Manual'
        };
      default:
        return {
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          icon: <Target className="h-3 w-3" />,
          label: 'Outros'
        };
    }
  };

  const config = getOriginConfig(origin);
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <div className={cn(
      'flex items-center gap-1 rounded-full font-medium border',
      config.color,
      sizeClasses[size],
      className
    )}>
      {config.icon}
      {showLabel && (
        <span className="capitalize">
          {config.label}
        </span>
      )}
    </div>
  );
};

// 🎯 COMPONENTE COMBINADO PARA TODOS OS INDICADORES
interface AILeadIndicatorsProps {
  score?: number;
  priority?: string;
  origin?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AILeadIndicators: React.FC<AILeadIndicatorsProps> = ({
  score,
  priority,
  origin,
  size = 'sm',
  className = ''
}) => {
  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {score !== undefined && (
        <ScoreIndicator score={score} size={size} />
      )}
      {priority && (
        <PriorityIndicator priority={priority} size={size} />
      )}
      {origin && (
        <OriginIndicator origin={origin} size={size} />
      )}
    </div>
  );
};
