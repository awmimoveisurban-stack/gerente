import { memo } from "react";
import { 
  Users, 
  Activity, 
  TrendingUp,
  DollarSign,
  Target,
  Calendar,
  Award,
  Building2
} from "lucide-react";
import { type TodosLeadsMetrics } from "@/hooks/use-todos-leads-metrics";

interface TodosLeadsMetricsProps {
  metrics: TodosLeadsMetrics;
}

export const TodosLeadsMetrics = memo(function TodosLeadsMetrics({
  metrics
}: TodosLeadsMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {/* Total de Leads */}
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30 p-6 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/50 hover:shadow-lg transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">👥 Total de Leads</p>
            <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">{metrics.totalLeads}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              {metrics.leadsRecentes} novos esta semana
            </p>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full" 
                  style={{ width: `${Math.min((metrics.leadsRecentes / 20) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="p-3 bg-emerald-500 rounded-xl">
            <Users className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Leads Ativos */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 hover:shadow-lg transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">🚀 Leads Ativos</p>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">{metrics.leadsAtivos}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              {metrics.leadsInteressados} interessados
            </p>
          </div>
          <div className="p-3 bg-blue-500 rounded-xl">
            <Activity className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Taxa de Conversão */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-800/50 hover:shadow-lg transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">📈 Taxa de Conversão</p>
            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">{metrics.conversionRate}%</p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              {metrics.leadsFechados} fechados
            </p>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(parseFloat(metrics.conversionRate), 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="p-3 bg-purple-500 rounded-xl">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Valor Pipeline */}
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30 p-6 rounded-2xl border border-amber-200/50 dark:border-amber-800/50 hover:shadow-lg transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">💰 Valor Pipeline</p>
            <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 mt-1">
              R$ {(metrics.valorTotalPipeline / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              {metrics.leadsPropostas} propostas
            </p>
          </div>
          <div className="p-3 bg-amber-500 rounded-xl">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
});
