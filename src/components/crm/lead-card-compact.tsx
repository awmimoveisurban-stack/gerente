import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Calendar, Eye, MoreVertical } from "lucide-react";
import { Lead } from "@/hooks/use-leads";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LeadCardCompactProps {
  lead: Lead;
  onViewDetails: (lead: Lead) => void;
  onCall: (lead: Lead) => void;
  onEmail: (lead: Lead) => void;
  onScheduleVisit: (lead: Lead) => void;
}

export function LeadCardCompact({ lead, onViewDetails, onCall, onEmail, onScheduleVisit }: LeadCardCompactProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 ${
        isDragging ? 'shadow-lg ring-2 ring-primary scale-105' : 'hover:scale-[1.01]'
      }`}
    >
      <CardContent className="p-2.5 space-y-1.5">
        {/* Header - Nome e Menu */}
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm">{lead.nome}</h3>
            {lead.email && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{lead.email}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewDetails(lead); }}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCall(lead); }}>
                <Phone className="mr-2 h-4 w-4" />
                Ligar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEmail(lead); }}>
                <Mail className="mr-2 h-4 w-4" />
                Enviar Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onScheduleVisit(lead); }}>
                <Calendar className="mr-2 h-4 w-4" />
                Agendar Visita
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Contact Info */}
        {lead.telefone && (
          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded p-1">
            <Phone className="h-3 w-3 text-blue-500" />
            <span className="truncate font-medium">{lead.telefone}</span>
          </div>
        )}

        {/* Property Interest - Compacto */}
        {lead.imovel_interesse && (
          <div className="text-xs bg-blue-50 dark:bg-blue-950/20 rounded p-1.5 border border-blue-200/50 dark:border-blue-800/50">
            <span className="font-medium text-blue-700 dark:text-blue-300">🏠 </span>
            <span className="text-blue-600 dark:text-blue-400 truncate">
              {lead.imovel_interesse}
            </span>
          </div>
        )}

        {/* Value e Data em linha */}
        <div className="flex items-center justify-between text-xs">
          {lead.valor_interesse && (
            <Badge variant="outline" className="font-mono bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 px-1.5 py-0.5 text-xs">
              💰 R$ {lead.valor_interesse.toLocaleString('pt-BR')}
            </Badge>
          )}
          <span className="text-gray-500 dark:text-gray-400">
            {lead.ultima_interacao 
              ? new Date(lead.ultima_interacao).toLocaleDateString('pt-BR')
              : new Date(lead.data_entrada).toLocaleDateString('pt-BR')
            }
          </span>
        </div>
      </CardContent>
    </Card>
  );
}





