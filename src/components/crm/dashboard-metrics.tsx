import { memo } from "react";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Activity, 
  Award, 
  DollarSign,
  TrendingUp,
  Target
} from "lucide-react";
import { type DashboardMetrics } from "@/hooks/use-dashboard-metrics";

interface DashboardMetricsProps {
  metrics: DashboardMetrics;
}

export const DashboardMetrics = memo(function DashboardMetrics({
  metrics
}: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {/* Total de Leads */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 hover:shadow-lg transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">👥 Total de Leads</p>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">{metrics.totalLeads}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Meta: {metrics.metaMensal} este mês
            </p>
            <div className="mt-2">
              <Progress value={metrics.progressoMeta} className="h-2" />
            </div>
          </div>
          <div className="p-3 bg-blue-500 rounded-xl">
            <Users className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Leads Ativos */}
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30 p-6 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/50 hover:shadow-lg transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">🚀 Leads Ativos</p>
            <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">{metrics.leadsAtivos}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              {metrics.leadsInteressados} interessados
            </p>
          </div>
          <div className="p-3 bg-emerald-500 rounded-xl">
            <Activity className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Leads Fechados */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-800/50 hover:shadow-lg transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">✅ Leads Fechados</p>
            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">{metrics.leadsFechados}</p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              {metrics.leadsPropostas} propostas
            </p>
          </div>
          <div className="p-3 bg-purple-500 rounded-xl">
            <Award className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Valor Pipeline */}
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30 p-6 rounded-2xl border border-amber-200/50 dark:border-amber-800/50 hover:shadow-lg transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">💰 Valor Pipeline</p>
            <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 mt-1">
              R$ {(metrics.valorTotalLeads / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              {metrics.leadsAtivos} leads ativos
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





