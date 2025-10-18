import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  DollarSign,
  MapPin,
  Smile,
  Frown,
  Meh,
  Flame,
  Snowflake,
  Timer,
  User,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 🎯 INTERFACE PARA INDICADOR DE PROBABILIDADE
interface ProbabilityIndicatorProps {
  probability: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ProbabilityIndicator: React.FC<ProbabilityIndicatorProps> = ({
  probability,
  size = 'sm',
  showLabel = true,
  className = ''
}) => {
  const getProbabilityConfig = (prob: number) => {
    if (prob >= 80) {
      return {
        color: 'text-green-600 bg-green-50 border-green-200',
        icon: <TrendingUp className="h-3 w-3" />,
        label: 'Alta',
        bgGradient: 'from-green-500 to-green-600'
      };
    }
    if (prob >= 60) {
      return {
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        icon: <Target className="h-3 w-3" />,
        label: 'Média',
        bgGradient: 'from-blue-500 to-blue-600'
      };
    }
    if (prob >= 40) {
      return {
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        icon: <Clock className="h-3 w-3" />,
        label: 'Baixa',
        bgGradient: 'from-yellow-500 to-yellow-600'
      };
    }
    return {
      color: 'text-gray-600 bg-gray-50 border-gray-200',
      icon: <Snowflake className="h-3 w-3" />,
      label: 'Muito Baixa',
      bgGradient: 'from-gray-500 to-gray-600'
    };
  };

  const config = getProbabilityConfig(probability);
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
      <span className="font-bold">{probability}%</span>
      {showLabel && (
        <span className="text-xs opacity-75">
          {config.label}
        </span>
      )}
    </div>
  );
};

// 🎯 INTERFACE PARA INDICADOR DE URGÊNCIA
interface UrgencyIndicatorProps {
  urgency: 'alta' | 'media' | 'baixa';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const UrgencyIndicator: React.FC<UrgencyIndicatorProps> = ({
  urgency,
  size = 'sm',
  showLabel = true,
  className = ''
}) => {
  const getUrgencyConfig = (urg: string) => {
    switch (urg) {
      case 'alta':
        return {
          color: 'text-red-600 bg-red-50 border-red-200',
          icon: <Flame className="h-3 w-3" />,
          label: 'Urgente',
          pulse: true
        };
      case 'media':
        return {
          color: 'text-orange-600 bg-orange-50 border-orange-200',
          icon: <Timer className="h-3 w-3" />,
          label: 'Moderada',
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
          icon: <Clock className="h-3 w-3" />,
          label: 'Normal',
          pulse: false
        };
    }
  };

  const config = getUrgencyConfig(urgency);
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

// 🎯 INTERFACE PARA INDICADOR DE PRÓXIMA AÇÃO
interface NextActionIndicatorProps {
  action: 'ligar' | 'whatsapp' | 'email' | 'visita' | 'proposta' | 'aguardar';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const NextActionIndicator: React.FC<NextActionIndicatorProps> = ({
  action,
  size = 'sm',
  showLabel = true,
  className = ''
}) => {
  const getActionConfig = (act: string) => {
    switch (act) {
      case 'ligar':
        return {
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          icon: <Phone className="h-3 w-3" />,
          label: 'Ligar'
        };
      case 'whatsapp':
        return {
          color: 'text-green-600 bg-green-50 border-green-200',
          icon: <MessageSquare className="h-3 w-3" />,
          label: 'WhatsApp'
        };
      case 'email':
        return {
          color: 'text-purple-600 bg-purple-50 border-purple-200',
          icon: <Mail className="h-3 w-3" />,
          label: 'Email'
        };
      case 'visita':
        return {
          color: 'text-orange-600 bg-orange-50 border-orange-200',
          icon: <Calendar className="h-3 w-3" />,
          label: 'Visita'
        };
      case 'proposta':
        return {
          color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
          icon: <DollarSign className="h-3 w-3" />,
          label: 'Proposta'
        };
      case 'aguardar':
        return {
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          icon: <Clock className="h-3 w-3" />,
          label: 'Aguardar'
        };
      default:
        return {
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          icon: <Target className="h-3 w-3" />,
          label: 'Avaliar'
        };
    }
  };

  const config = getActionConfig(action);
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

// 🎯 INTERFACE PARA INDICADOR DE TEMPO NO PIPELINE
interface TimeInPipelineIndicatorProps {
  days: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const TimeInPipelineIndicator: React.FC<TimeInPipelineIndicatorProps> = ({
  days,
  size = 'sm',
  showLabel = true,
  className = ''
}) => {
  const getTimeConfig = (d: number) => {
    if (d <= 1) {
      return {
        color: 'text-green-600 bg-green-50 border-green-200',
        icon: <Zap className="h-3 w-3" />,
        label: 'Novo'
      };
    }
    if (d <= 7) {
      return {
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        icon: <Clock className="h-3 w-3" />,
        label: 'Recente'
      };
    }
    if (d <= 30) {
      return {
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        icon: <Timer className="h-3 w-3" />,
        label: 'Moderado'
      };
    }
    return {
      color: 'text-red-600 bg-red-50 border-red-200',
      icon: <AlertTriangle className="h-3 w-3" />,
      label: 'Antigo'
    };
  };

  const config = getTimeConfig(days);
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
      <span className="font-bold">{days}d</span>
      {showLabel && (
        <span className="text-xs opacity-75">
          {config.label}
        </span>
      )}
    </div>
  );
};

// 🎯 INTERFACE PARA INDICADOR DE CANAL PREFERIDO
interface PreferredChannelIndicatorProps {
  channel: 'whatsapp' | 'telefone' | 'email' | 'site' | 'presencial';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const PreferredChannelIndicator: React.FC<PreferredChannelIndicatorProps> = ({
  channel,
  size = 'sm',
  showLabel = true,
  className = ''
}) => {
  const getChannelConfig = (ch: string) => {
    switch (ch) {
      case 'whatsapp':
        return {
          color: 'text-green-600 bg-green-50 border-green-200',
          icon: <MessageSquare className="h-3 w-3" />,
          label: 'WhatsApp'
        };
      case 'telefone':
        return {
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          icon: <Phone className="h-3 w-3" />,
          label: 'Telefone'
        };
      case 'email':
        return {
          color: 'text-purple-600 bg-purple-50 border-purple-200',
          icon: <Mail className="h-3 w-3" />,
          label: 'Email'
        };
      case 'site':
        return {
          color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
          icon: <Building2 className="h-3 w-3" />,
          label: 'Site'
        };
      case 'presencial':
        return {
          color: 'text-orange-600 bg-orange-50 border-orange-200',
          icon: <User className="h-3 w-3" />,
          label: 'Presencial'
        };
      default:
        return {
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          icon: <Target className="h-3 w-3" />,
          label: 'Indefinido'
        };
    }
  };

  const config = getChannelConfig(channel);
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

// 🎯 INTERFACE PARA INDICADOR DE SENTIMENTO
interface SentimentIndicatorProps {
  sentiment: 'positivo' | 'neutro' | 'negativo';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const SentimentIndicator: React.FC<SentimentIndicatorProps> = ({
  sentiment,
  size = 'sm',
  showLabel = true,
  className = ''
}) => {
  const getSentimentConfig = (sent: string) => {
    switch (sent) {
      case 'positivo':
        return {
          color: 'text-green-600 bg-green-50 border-green-200',
          icon: <Smile className="h-3 w-3" />,
          label: 'Positivo'
        };
      case 'neutro':
        return {
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          icon: <Meh className="h-3 w-3" />,
          label: 'Neutro'
        };
      case 'negativo':
        return {
          color: 'text-red-600 bg-red-50 border-red-200',
          icon: <Frown className="h-3 w-3" />,
          label: 'Negativo'
        };
      default:
        return {
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          icon: <Meh className="h-3 w-3" />,
          label: 'Neutro'
        };
    }
  };

  const config = getSentimentConfig(sentiment);
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

// 🎯 INTERFACE PARA INDICADOR DE FAIXA DE PREÇO
interface BudgetRangeIndicatorProps {
  range: 'baixo' | 'medio' | 'alto' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const BudgetRangeIndicator: React.FC<BudgetRangeIndicatorProps> = ({
  range,
  size = 'sm',
  showLabel = true,
  className = ''
}) => {
  const getRangeConfig = (r: string) => {
    switch (r) {
      case 'baixo':
        return {
          color: 'text-green-600 bg-green-50 border-green-200',
          icon: <DollarSign className="h-3 w-3" />,
          label: 'Até R$ 500k'
        };
      case 'medio':
        return {
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          icon: <DollarSign className="h-3 w-3" />,
          label: 'R$ 500k - 1M'
        };
      case 'alto':
        return {
          color: 'text-purple-600 bg-purple-50 border-purple-200',
          icon: <DollarSign className="h-3 w-3" />,
          label: 'R$ 1M - 2M'
        };
      case 'premium':
        return {
          color: 'text-red-600 bg-red-50 border-red-200',
          icon: <DollarSign className="h-3 w-3" />,
          label: 'Acima de R$ 2M'
        };
      default:
        return {
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          icon: <DollarSign className="h-3 w-3" />,
          label: 'Não informado'
        };
    }
  };

  const config = getRangeConfig(range);
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
        <span className="text-xs">
          {config.label}
        </span>
      )}
    </div>
  );
};
