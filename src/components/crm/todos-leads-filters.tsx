import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Filter, 
  RefreshCcw,
  Users,
  Target
} from "lucide-react";

interface TodosLeadsFiltersProps {
  statusFilter: string;
  corretorFilter: string;
  onStatusChange: (status: string) => void;
  onCorretorChange: (corretor: string) => void;
  onResetFilters: () => void;
  getStatusCount: (status: string) => number;
  getCorretorCount: (corretor: string) => number;
  corretores: string[];
}

export const TodosLeadsFilters = memo(function TodosLeadsFilters({
  statusFilter,
  corretorFilter,
  onStatusChange,
  onCorretorChange,
  onResetFilters,
  getStatusCount,
  getCorretorCount,
  corretores
}: TodosLeadsFiltersProps) {
  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-200/50 dark:border-blue-800/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <div className="p-1.5 bg-blue-500 rounded-lg">
                <Filter className="h-4 w-4 text-white" />
              </div>
              Filtros Avançados
            </CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-400 mt-1">
              🎯 Filtre leads por status e corretor para análise detalhada
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onResetFilters}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-950/20"
            aria-label="Resetar filtros"
            title="Resetar filtros"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Resetar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Filtro por Status */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Status do Lead
              </label>
            </div>
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Selecionar status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">
                  🎯 Todos ({getStatusCount("todos")})
                </SelectItem>
                <SelectItem value="novo">
                  🆕 Novo ({getStatusCount("novo")})
                </SelectItem>
                <SelectItem value="contatado">
                  📞 Contatado ({getStatusCount("contatado")})
                </SelectItem>
                <SelectItem value="interessado">
                  ⭐ Interessado ({getStatusCount("interessado")})
                </SelectItem>
                <SelectItem value="visita_agendada">
                  🏠 Visita ({getStatusCount("visita_agendada")})
                </SelectItem>
                <SelectItem value="proposta">
                  📋 Proposta ({getStatusCount("proposta")})
                </SelectItem>
                <SelectItem value="fechado">
                  ✅ Fechado ({getStatusCount("fechado")})
                </SelectItem>
                <SelectItem value="perdido">
                  ❌ Perdido ({getStatusCount("perdido")})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Corretor */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Corretor Responsável
              </label>
            </div>
            <Select value={corretorFilter} onValueChange={onCorretorChange}>
              <SelectTrigger className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Selecionar corretor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">
                  👥 Todos os Corretores ({getCorretorCount("todos")})
                </SelectItem>
                {corretores.map((corretor) => (
                  <SelectItem key={corretor} value={corretor}>
                    👤 {corretor} ({getCorretorCount(corretor)})
                  </SelectItem>
                ))}
                <SelectItem value="Sem corretor">
                  ❓ Sem Corretor ({getCorretorCount("Sem corretor")})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});





