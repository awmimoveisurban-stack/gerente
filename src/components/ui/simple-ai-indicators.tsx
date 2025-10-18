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

// 🎯 INDICADOR SIMPLES DE PROBABILIDADE
interface SimpleProbabilityProps {
  probability: number;
  className?: string;
}

export const SimpleProbability: React.FC<SimpleProbabilityProps> = ({
  probability,
  className = ''
}) => {
  const getColor = (prob: number) => {
    if (prob >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (prob >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (prob >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className={cn(
      'px-2 py-1 text-xs rounded-full font-medium border',
      getColor(probability),
      className
    )}>
      {probability}% chance
    </div>
  );
};

// 🎯 INDICADOR SIMPLES DE URGÊNCIA
interface SimpleUrgencyProps {
  urgency: 'alta' | 'media' | 'baixa';
  className?: string;
}

export const SimpleUrgency: React.FC<SimpleUrgencyProps> = ({
  urgency,
  className = ''
}) => {
  const getConfig = (urg: string) => {
    switch (urg) {
      case 'alta':
        return {
          color: 'text-red-600 bg-red-50 border-red-200',
          icon: <Flame className="h-3 w-3" />,
          label: 'Urgente'
        };
      case 'media':
        return {
          color: 'text-orange-600 bg-orange-50 border-orange-200',
          icon: <Timer className="h-3 w-3" />,
          label: 'Normal'
        };
      case 'baixa':
        return {
          color: 'text-green-600 bg-green-50 border-green-200',
          icon: <Clock className="h-3 w-3" />,
          label: 'Baixa'
        };
      default:
        return {
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          icon: <Clock className="h-3 w-3" />,
          label: 'Normal'
        };
    }
  };

  const config = getConfig(urgency);

  return (
    <div className={cn(
      'px-2 py-1 text-xs rounded-full font-medium border flex items-center gap-1',
      config.color,
      className
    )}>
      {config.icon}
      {config.label}
    </div>
  );
};

// 🎯 INDICADOR SIMPLES DE PRÓXIMA AÇÃO
interface SimpleNextActionProps {
  action: 'ligar' | 'whatsapp' | 'email' | 'visita' | 'proposta' | 'aguardar';
  className?: string;
}

export const SimpleNextAction: React.FC<SimpleNextActionProps> = ({
  action,
  className = ''
}) => {
  const getConfig = (act: string) => {
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

  const config = getConfig(action);

  return (
    <div className={cn(
      'px-2 py-1 text-xs rounded-full font-medium border flex items-center gap-1',
      config.color,
      className
    )}>
      {config.icon}
      {config.label}
    </div>
  );
};

// 🎯 INDICADOR SIMPLES DE TEMPO
interface SimpleTimeProps {
  days: number;
  className?: string;
}

export const SimpleTime: React.FC<SimpleTimeProps> = ({
  days,
  className = ''
}) => {
  const getConfig = (d: number) => {
    if (d <= 1) {
      return {
        color: 'text-green-600 bg-green-50 border-green-200',
        label: 'Novo'
      };
    }
    if (d <= 7) {
      return {
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        label: `${d}d`
      };
    }
    if (d <= 30) {
      return {
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        label: `${d}d`
      };
    }
    return {
      color: 'text-red-600 bg-red-50 border-red-200',
      label: `${d}d`
    };
  };

  const config = getConfig(days);

  return (
    <div className={cn(
      'px-2 py-1 text-xs rounded-full font-medium border',
      config.color,
      className
    )}>
      {config.label}
    </div>
  );
};
