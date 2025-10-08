import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  FileText,
  Lightbulb
} from "lucide-react";

interface EmptyLeadsStateProps {
  hasFilters: boolean;
  onAddLead: () => void;
  onResetFilters: () => void;
}

export const EmptyLeadsState = memo(function EmptyLeadsState({
  hasFilters,
  onAddLead,
  onResetFilters
}: EmptyLeadsStateProps) {
  if (hasFilters) {
    return (
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <CardContent className="p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center mb-6">
            <Search className="h-12 w-12 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            🔍 Nenhum lead encontrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Não encontramos leads que correspondam aos filtros aplicados. 
            Tente ajustar os critérios de busca ou limpar os filtros.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={onResetFilters}
              variant="outline"
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-950/20"
            >
              <Filter className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
            <Button 
              onClick={onAddLead}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Lead
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
      <CardContent className="p-12 text-center">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center mb-6">
          <Users className="h-12 w-12 text-blue-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          📝 Você ainda não tem leads
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          Comece adicionando seu primeiro lead para acompanhar oportunidades de venda 
          e gerenciar seu pipeline de negócios.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={onAddLead}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Primeiro Lead
          </Button>
        </div>
        
        {/* Dicas para começar */}
        <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
          <div className="flex items-center justify-center mb-4">
            <Lightbulb className="h-6 w-6 text-blue-500 mr-2" />
            <h4 className="font-semibold text-blue-800 dark:text-blue-200">Dicas para começar:</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h5 className="font-medium text-blue-800 dark:text-blue-200">Adicione Leads</h5>
                <p className="text-sm text-blue-600 dark:text-blue-300">Capture informações de contato e interesse</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h5 className="font-medium text-blue-800 dark:text-blue-200">Acompanhe Status</h5>
                <p className="text-sm text-blue-600 dark:text-blue-300">Monitore o progresso de cada oportunidade</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h5 className="font-medium text-blue-800 dark:text-blue-200">Feche Vendas</h5>
                <p className="text-sm text-blue-600 dark:text-blue-300">Converta leads em clientes satisfeitos</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});





