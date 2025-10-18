import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWhatsAppStatus } from '@/hooks/use-whatsapp-status';
import { useEvolutionPollingDireto } from '@/hooks/use-evolution-polling-direto';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/contexts/unified-auth-context';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  MessageSquare, 
  Database,
  Clock,
  Users
} from 'lucide-react';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export default function DiagnosticoLeads() {
  const { user } = useUnifiedAuth();
  const { whatsappStatus, isLoading, refreshStatus } = useWhatsAppStatus();
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);

  // Ativar polling para teste
  useEvolutionPollingDireto(true);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    try {
      // 1. Verificar autenticação
      if (!user) {
        results.push({
          name: 'Autenticação',
          status: 'error',
          message: 'Usuário não autenticado'
        });
      } else {
        results.push({
          name: 'Autenticação',
          status: 'success',
          message: `Usuário autenticado: ${user.email}`,
          details: { userId: user.id }
        });
      }

      // 2. Verificar configuração WhatsApp
      const { data: whatsappConfig, error: configError } = await supabase
        .from('whatsapp_config')
        .select('*')
        .eq('manager_id', user?.id)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (configError) {
        results.push({
          name: 'Configuração WhatsApp',
          status: 'error',
          message: `Erro ao buscar config: ${configError.message}`,
          details: configError
        });
      } else if (!whatsappConfig || whatsappConfig.length === 0) {
        results.push({
          name: 'Configuração WhatsApp',
          status: 'warning',
          message: 'Nenhuma configuração WhatsApp encontrada'
        });
      } else {
        const config = whatsappConfig[0];
        results.push({
          name: 'Configuração WhatsApp',
          status: config.status === 'authorized' ? 'success' : 'warning',
          message: `Status: ${config.status} | Instância: ${config.evolution_instance_name}`,
          details: config
        });
      }

      // 3. Verificar status Evolution API
      if (whatsappConfig && whatsappConfig.length > 0) {
        const config = whatsappConfig[0];
        try {
          const response = await fetch(`https://api.urbanautobot.com/instance/connectionState/${config.evolution_instance_name}`, {
            headers: {
              'apikey': 'cfd9b746ea9e400dc8f4d3e8d57b0180'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            results.push({
              name: 'Evolution API',
              status: data.instance?.state === 'open' ? 'success' : 'warning',
              message: `Estado da instância: ${data.instance?.state || 'desconhecido'}`,
              details: data
            });
          } else {
            results.push({
              name: 'Evolution API',
              status: 'error',
              message: `Erro na API: ${response.status} ${response.statusText}`
            });
          }
        } catch (apiError: any) {
          results.push({
            name: 'Evolution API',
            status: 'error',
            message: `Erro de conexão: ${apiError.message}`
          });
        }
      }

      // 4. Verificar leads recentes (buscar por user_id OU manager_id)
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .or(`user_id.eq.${user?.id},manager_id.eq.${user?.id}`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (leadsError) {
        results.push({
          name: 'Leads Recentes',
          status: 'error',
          message: `Erro ao buscar leads: ${leadsError.message}`,
          details: leadsError
        });
      } else {
        setRecentLeads(leads || []);
        results.push({
          name: 'Leads Recentes',
          status: 'success',
          message: `${leads?.length || 0} leads encontrados`,
          details: { count: leads?.length || 0 }
        });
      }

      // 5. Verificar mensagens recentes da Evolution API
      if (whatsappConfig && whatsappConfig.length > 0) {
        const config = whatsappConfig[0];
        try {
          const response = await fetch(`https://api.urbanautobot.com/chat/findMessages/${config.evolution_instance_name}`, {
            method: 'POST',
            headers: {
              'apikey': 'cfd9b746ea9e400dc8f4d3e8d57b0180',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              where: {
                key: {
                  fromMe: false
                }
              },
              limit: 5
            })
          });

          if (response.ok) {
            const data = await response.json();
            results.push({
              name: 'Mensagens WhatsApp',
              status: 'success',
              message: `${data.length || 0} mensagens recentes encontradas`,
              details: { messageCount: data.length || 0 }
            });
          } else {
            results.push({
              name: 'Mensagens WhatsApp',
              status: 'warning',
              message: `Erro ao buscar mensagens: ${response.status}`
            });
          }
        } catch (msgError: any) {
          results.push({
            name: 'Mensagens WhatsApp',
            status: 'error',
            message: `Erro de conexão: ${msgError.message}`
          });
        }
      }

    } catch (error: any) {
      results.push({
        name: 'Diagnóstico Geral',
        status: 'error',
        message: `Erro inesperado: ${error.message}`
      });
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">OK</Badge>;
      case 'error':
        return <Badge variant="destructive">ERRO</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">ATENÇÃO</Badge>;
      default:
        return <Badge variant="outline">DESCONHECIDO</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Diagnóstico do Sistema de Captura de Leads
          </CardTitle>
          <p className="text-sm text-gray-600">
            Verificação completa do sistema de captura de leads via WhatsApp
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button 
              onClick={runDiagnostics} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? 'Executando...' : 'Executar Diagnóstico'}
            </Button>
            <Button 
              onClick={refreshStatus} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar Status WhatsApp
            </Button>
          </div>

          {/* Status Atual */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Status Atual do WhatsApp</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                <span>Status:</span>
                <Badge variant={whatsappStatus.status === 'authorized' ? 'default' : 'secondary'}>
                  {whatsappStatus.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className={`h-5 w-5 ${whatsappStatus.isOnline ? 'text-green-600' : 'text-red-600'}`} />
                <span>Online:</span>
                <Badge variant={whatsappStatus.isOnline ? 'default' : 'destructive'}>
                  {whatsappStatus.isOnline ? 'Sim' : 'Não'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>Carregando:</span>
                <Badge variant={isLoading ? 'secondary' : 'default'}>
                  {isLoading ? 'Sim' : 'Não'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Resultados do Diagnóstico */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resultados do Diagnóstico</h3>
            {diagnostics.map((diagnostic, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(diagnostic.status)}
                      <span className="font-medium">{diagnostic.name}</span>
                    </div>
                    {getStatusBadge(diagnostic.status)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{diagnostic.message}</p>
                  {diagnostic.details && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                        Ver detalhes
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                        {JSON.stringify(diagnostic.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Leads Recentes */}
          {recentLeads.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Leads Recentes ({recentLeads.length})
              </h3>
              <div className="space-y-2">
                {recentLeads.map((lead) => (
                  <Card key={lead.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{lead.nome}</p>
                        <p className="text-sm text-gray-600">{lead.telefone}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{lead.status}</Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(lead.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
