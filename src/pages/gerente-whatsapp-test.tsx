import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Wifi, 
  WifiOff, 
  QrCode, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle
} from 'lucide-react';

export default function GerenteWhatsAppTestPage() {
  const { toast } = useToast();
  
  const handleTest = () => {
    toast({
      title: "Teste",
      description: "Botão funcionando!",
    });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-green-200/50 dark:border-gray-700/50">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-xl">
                <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              WhatsApp Business - TESTE
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              📱 Página de teste para verificar se os componentes estão funcionando
            </p>
          </div>
        </div>
      </div>

      {/* Status da Conexão */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-green-200/50 dark:border-green-800/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-green-800 dark:text-green-200 flex items-center gap-2">
                <div className="p-1.5 bg-green-500 rounded-lg">
                  <Wifi className="h-4 w-4 text-white" />
                </div>
                Status da Conexão - TESTE
              </CardTitle>
              <CardDescription className="text-green-600 dark:text-green-400 mt-1">
                🔗 Página de teste para verificar renderização
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="ml-2">Teste</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Controles de Conexão */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full w-fit mx-auto mb-4">
                  <WifiOff className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Página de Teste
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Esta é uma página de teste para verificar se os componentes estão renderizando corretamente.
                </p>
              </div>
              
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={handleTest}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Testar Botão
                </Button>
                
                <Button 
                  variant="outline"
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Botão Teste
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Teste */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">📱 Teste 1</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">123</p>
            </div>
            <div className="p-3 bg-blue-500 rounded-xl">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 p-6 rounded-2xl border border-green-200/50 dark:border-green-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-700 dark:text-green-300">🔗 Teste 2</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">456</p>
            </div>
            <div className="p-3 bg-green-500 rounded-xl">
              <Wifi className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





