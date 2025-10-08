import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Home, 
  ArrowLeft, 
  Search,
  AlertTriangle,
  FileX,
  RefreshCw,
  Navigation,
  Globe
} from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const handleGoHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Card Principal */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-6 p-4 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-full w-24 h-24 flex items-center justify-center">
              <FileX className="h-12 w-12 text-red-500 dark:text-red-400" />
            </div>
            <CardTitle className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
              404
            </CardTitle>
            <CardDescription className="text-xl text-gray-600 dark:text-gray-400">
              Oops! Página não encontrada
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            <div className="space-y-2">
              <p className="text-gray-700 dark:text-gray-300">
                A página que você está procurando não existe ou foi movida.
              </p>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  📍 Tentativa de acesso: <code className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded text-xs">{location.pathname}</code>
                </p>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={handleGoHome}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                <Home className="mr-2 h-5 w-5" />
                Ir para Início
              </Button>
              
              <Button 
                onClick={handleGoBack}
                variant="outline"
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
                size="lg"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Voltar
              </Button>
              
              <Button 
                onClick={handleRefresh}
                variant="outline"
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-green-50 dark:hover:bg-green-950/20 border-gray-200 dark:border-gray-700"
                size="lg"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Recarregar
              </Button>
            </div>

            {/* Sugestões */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                💡 O que você pode fazer:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                  <div className="flex items-center gap-3 mb-2">
                    <Search className="h-5 w-5 text-blue-500" />
                    <span className="font-medium text-blue-800 dark:text-blue-200">Verificar URL</span>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Confira se o endereço foi digitado corretamente
                  </p>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-lg border border-green-200/50 dark:border-green-800/50">
                  <div className="flex items-center gap-3 mb-2">
                    <Navigation className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-800 dark:text-green-200">Usar Navegação</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Use o menu lateral para navegar pelas páginas
                  </p>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                  <div className="flex items-center gap-3 mb-2">
                    <Globe className="h-5 w-5 text-purple-500" />
                    <span className="font-medium text-purple-800 dark:text-purple-200">Página Inicial</span>
                  </div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    Retorne à página inicial do sistema
                  </p>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 rounded-lg border border-orange-200/50 dark:border-orange-800/50">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <span className="font-medium text-orange-800 dark:text-orange-200">Reportar Erro</span>
                  </div>
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    Se o problema persistir, entre em contato
                  </p>
                </div>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                🕐 Erro registrado em: {new Date().toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                ID do erro: 404-{Date.now().toString().slice(-6)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card de Ajuda */}
        <Card className="mt-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Precisa de ajuda?
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Nossa equipe está aqui para ajudar você a encontrar o que precisa
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              >
                Contatar Suporte
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;