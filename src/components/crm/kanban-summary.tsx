import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles,
  UserCheck,
  Calendar,
  FileText,
  XCircle,
  CheckCircle,
  Target,
  TrendingUp
} from "lucide-react";

interface ColumnStats {
  id: string;
  title: string;
  count: number;
  leads: any[];
}

interface KanbanSummaryProps {
  columnStats: ColumnStats[];
  totalLeads: number;
}

export const KanbanSummary = memo(function KanbanSummary({
  columnStats,
  totalLeads
}: KanbanSummaryProps) {
  const getColumnIcon = (id: string) => {
    switch (id) {
      case 'novo': return Sparkles;
      case 'contatado': return UserCheck;
      case 'interessado': return UserCheck;
      case 'visita_agendada': return Calendar;
      case 'proposta': return FileText;
      case 'perdido': return XCircle;
      default: return Target;
    }
  };

  const getColumnColor = (id: string) => {
    switch (id) {
      case 'novo': return 'bg-blue-500';
      case 'contatado': return 'bg-purple-500';
      case 'interessado': return 'bg-indigo-500';
      case 'visita_agendada': return 'bg-orange-500';
      case 'proposta': return 'bg-amber-500';
      case 'perdido': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getColumnBgColor = (id: string) => {
    switch (id) {
      case 'novo': return 'bg-blue-50 dark:bg-blue-950/20';
      case 'contatado': return 'bg-purple-50 dark:bg-purple-950/20';
      case 'interessado': return 'bg-indigo-50 dark:bg-indigo-950/20';
      case 'visita_agendada': return 'bg-orange-50 dark:bg-orange-950/20';
      case 'proposta': return 'bg-amber-50 dark:bg-amber-950/20';
      case 'perdido': return 'bg-red-50 dark:bg-red-950/20';
      default: return 'bg-gray-50 dark:bg-gray-950/20';
    }
  };

  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-green-200/50 dark:border-green-800/50">
        <div>
          <CardTitle className="text-xl font-bold text-green-800 dark:text-green-200 flex items-center gap-2">
            <div className="p-1.5 bg-green-500 rounded-lg">
              <Target className="h-4 w-4 text-white" />
            </div>
            Resumo do Pipeline
          </CardTitle>
          <CardDescription className="text-green-600 dark:text-green-400 mt-1">
            📊 Distribuição dos leads por estágio do funil
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {columnStats.map((column) => {
            const Icon = getColumnIcon(column.id);
            const percentage = totalLeads > 0 ? ((column.count / totalLeads) * 100).toFixed(1) : "0";
            
            return (
              <div
                key={column.id}
                className={`${getColumnBgColor(column.id)} p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 ${getColumnColor(column.id)} rounded-lg`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`${getColumnColor(column.id)} text-white text-xs font-medium`}
                  >
                    {column.count}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {column.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {percentage}% do total
                  </p>
                  {column.count > 0 && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                      <div 
                        className={`${getColumnColor(column.id)} h-1.5 rounded-full transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                  Total de Leads no Pipeline
                </h4>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Distribuição equilibrada entre os estágios
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {totalLeads}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                leads ativos
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});





