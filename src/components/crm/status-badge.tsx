import { cn } from "@/lib/utils";

export type LeadStatus = "Novo" | "Em Atendimento" | "Visita" | "Proposta" | "Fechado" | "Perdido";

interface StatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

const statusMap: Record<LeadStatus, string> = {
  "Novo": "crm-status-novo",
  "Em Atendimento": "crm-status-atendimento",
  "Visita": "crm-status-visita",
  "Proposta": "crm-status-proposta",
  "Fechado": "crm-status-fechado",
  "Perdido": "crm-status-perdido",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn("crm-status-badge", statusMap[status], className)}>
      {status}
    </span>
  );
}