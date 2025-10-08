import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  TrendingUp,
  Users,
  Target,
  Award,
  Star,
  Zap
} from "lucide-react";

interface WeeklyPerformanceProps {
  weeklyMetrics: {
    leadsSemana: number;
    metaSemanal: number;
    progressoSemanal: number;
    leadsInteressadosSemana: number;
    leadsVisitasSemana: number;
  };
  performanceMetrics: {
    ranking: number;
    performance: string;
    pontos: number;
    nivel: string;
  };
}

export const WeeklyPerformance = memo(function WeeklyPerformance({
  weeklyMetrics,
  performanceMetrics
}: WeeklyPerformanceProps) {
  const getRankingBadgeColor = (ranking: number) => {
    switch (ranking) {
      case 1: return "bg-yellow-500 text-yellow-900";
      case 2: return "bg-gray-400 text-gray-900";
      case 3: return "bg-amber-600 text-amber-900";
      default: return "bg-blue-500 text-blue-900";
    }
  };

  const getNivelBadgeColor = (nivel: string) => {
    switch (nivel) {
      case "Expert": return "bg-purple-500 text-purple-100";
      case "Avançado": return "bg-blue-500 text-blue-100";
      case "Intermediário": return "bg-green-500 text-green-100";
      case "Iniciante": return "bg-yellow-500 text-yellow-100";
      default: return "bg-gray-500 text-gray-100";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Performance Semanal */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b border-emerald-200/50 dark:border-emerald-800/50">
          <div>
            <CardTitle className="text-xl font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500 rounded-lg">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              Performance Semanal
            </CardTitle>
            <CardDescription className="text-emerald-600 dark:text-emerald-400 mt-1">
              📊 Seu progresso nesta semana
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-emerald-800 dark:text-emerald-200">Meta Semanal</span>
                <span className="font-bold text-lg text-emerald-900 dark:text-emerald-100">
                  {weeklyMetrics.leadsSemana}/{weeklyMetrics.metaSemanal}
                </span>
              </div>
              <Progress value={weeklyMetrics.progressoSemanal} className="h-3" />
              <p className="text-sm text-emerald-600 dark:text-emerald-300 mt-2">
                {weeklyMetrics.progressoSemanal.toFixed(1)}% da meta semanal
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-950/20 dark:to-blue-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Interessados</span>
                </div>
                <span className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  {weeklyMetrics.leadsInteressadosSemana}
                </span>
              </div>

              <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-50 dark:from-purple-950/20 dark:to-purple-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Visitas</span>
                </div>
                <span className="text-xl font-bold text-purple-900 dark:text-purple-100">
                  {weeklyMetrics.leadsVisitasSemana}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ranking e Gamificação */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-b border-purple-200/50 dark:border-purple-800/50">
          <div>
            <CardTitle className="text-xl font-bold text-purple-800 dark:text-purple-200 flex items-center gap-2">
              <div className="p-1.5 bg-purple-500 rounded-lg">
                <Award className="h-4 w-4 text-white" />
              </div>
              Ranking & Gamificação
            </CardTitle>
            <CardDescription className="text-purple-600 dark:text-purple-400 mt-1">
              🏆 Sua posição e conquistas
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 rounded-xl border border-yellow-200/50 dark:border-yellow-800/50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getRankingBadgeColor(performanceMetrics.ranking)}`}>
                  {performanceMetrics.ranking}º
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Posição no Ranking</h3>
                  <p className="text-sm text-yellow-600 dark:text-yellow-300">Entre todos os corretores</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  {performanceMetrics.pontos}
                </div>
                <div className="text-xs text-yellow-600 dark:text-yellow-300">pontos</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gradient-to-br from-green-50 to-green-50 dark:from-green-950/20 dark:to-green-950/20 rounded-xl border border-green-200/50 dark:border-green-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">Performance</span>
                </div>
                <span className="text-xl font-bold text-green-900 dark:text-green-100">
                  {performanceMetrics.performance}
                </span>
              </div>

              <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-950/20 dark:to-blue-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Nível</span>
                </div>
                <Badge className={`text-xs font-medium ${getNivelBadgeColor(performanceMetrics.nivel)}`}>
                  {performanceMetrics.nivel}
                </Badge>
              </div>
            </div>

            <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-50 dark:from-purple-950/20 dark:to-purple-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  Continue assim! Você está no caminho certo para o topo! 🚀
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});





