import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Users,
  Send,
  TestTube
} from 'lucide-react';

const EVOLUTION_URL = 'https://api.urbanautobot.com';
const EVOLUTION_API_KEY = 'cfd9b746ea9e400dc8f4d3e8d57b0180';

export default function TesteCapturaLeads() {
  const { user } = useUnifiedAuth();
  const [whatsappConfig, setWhatsappConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [testPhone, setTestPhone] = useState('');

  useEffect(() => {
    loadWhatsAppConfig();
  }, [user]);

  const loadWhatsAppConfig = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('whatsapp_config')
      .select('*')
      .eq('manager_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Erro ao carregar config:', error);
      return;
    }

    setWhatsappConfig(data?.[0] || null);
  };

  const addTestResult = (test: string, status: 'success' | 'error' | 'warning', message: string, details?: any) => {
    setTestResults(prev => [{
      id: Date.now(),
      test,
      status,
      message,
      details,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev.slice(0, 9)]);
  };

  const testConnectionState = async () => {
    if (!whatsappConfig) {
      addTestResult('Estado da Conexão', 'error', 'Nenhuma configuração WhatsApp encontrada');
      return;
    }

    try {
      const response = await fetch(`${EVOLUTION_URL}/instance/connectionState/${whatsappConfig.evolution_instance_name}`, {
        headers: {
          'apikey': EVOLUTION_API_KEY
        }
      });

      if (response.ok) {
        const data = await response.json();
        const isConnected = data.instance?.state === 'open';
        addTestResult(
          'Estado da Conexão', 
          isConnected ? 'success' : 'warning',
          `Estado: ${data.instance?.state || 'desconhecido'}`,
          data
        );
      } else {
        addTestResult('Estado da Conexão', 'error', `Erro HTTP: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      addTestResult('Estado da Conexão', 'error', `Erro de conexão: ${error.message}`);
    }
  };

  const testFetchMessages = async () => {
    if (!whatsappConfig) {
      addTestResult('Buscar Mensagens', 'error', 'Nenhuma configuração WhatsApp encontrada');
      return;
    }

    try {
      const response = await fetch(`${EVOLUTION_URL}/chat/findMessages/${whatsappConfig.evolution_instance_name}`, {
        method: 'POST',
        headers: {
          'apikey': EVOLUTION_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          where: {
            key: {
              fromMe: false
            }
          },
          limit: 10
        })
      });

      if (response.ok) {
        const data = await response.json();
        const messageRecords = data.messages?.records || [];
        setMessages(messageRecords);
        
        addTestResult(
          'Buscar Mensagens', 
          'success',
          `${messageRecords.length} mensagens encontradas`,
          { total: data.messages?.total || 0, records: messageRecords.length }
        );
      } else {
        addTestResult('Buscar Mensagens', 'error', `Erro HTTP: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      addTestResult('Buscar Mensagens', 'error', `Erro de conexão: ${error.message}`);
    }
  };

  const testCreateLead = async () => {
    if (!testPhone) {
      addTestResult('Criar Lead', 'error', 'Número de telefone não informado');
      return;
    }

    try {
      const leadData = {
        nome: 'Teste Manual',
        telefone: testPhone,
        origem: 'teste_manual',
        status: 'novo',
        observacoes: 'Lead criado via teste manual',
        user_id: user?.id || null,
      };

      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .insert(leadData)
        .select()
        .single();

      if (leadError) {
        addTestResult('Criar Lead', 'error', `Erro ao criar lead: ${leadError.message}`, leadError);
      } else {
        addTestResult('Criar Lead', 'success', `Lead criado com sucesso: ${lead.nome}`, lead);
      }
    } catch (error: any) {
      addTestResult('Criar Lead', 'error', `Erro inesperado: ${error.message}`);
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    await testConnectionState();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testFetchMessages();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (testPhone) {
      await testCreateLead();
    }

    setIsLoading(false);
  };

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
            <TestTube className="h-6 w-6" />
            Teste de Captura de Leads
          </CardTitle>
          <p className="text-sm text-gray-600">
            Teste manual do sistema de captura de leads via WhatsApp
          </p>
        </CardHeader>
        <CardContent>
          {/* Configuração Atual */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Configuração WhatsApp</h3>
            {whatsappConfig ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Instância:</Label>
                  <p className="text-sm">{whatsappConfig.evolution_instance_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status:</Label>
                  <Badge variant={whatsappConfig.status === 'authorized' ? 'default' : 'secondary'}>
                    {whatsappConfig.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Manager ID:</Label>
                  <p className="text-sm font-mono">{whatsappConfig.manager_id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Última Atualização:</Label>
                  <p className="text-sm">{new Date(whatsappConfig.updated_at).toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">Nenhuma configuração WhatsApp encontrada</p>
              </div>
            )}
          </div>

          {/* Teste de Lead Manual */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Teste Manual de Lead</h3>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="testPhone">Número de Telefone para Teste</Label>
                <Input
                  id="testPhone"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="11999999999"
                />
              </div>
              <Button onClick={testCreateLead} disabled={!testPhone}>
                <Send className="h-4 w-4 mr-2" />
                Criar Lead Teste
              </Button>
            </div>
          </div>

          {/* Botões de Teste */}
          <div className="flex gap-4 mb-6">
            <Button onClick={runAllTests} disabled={isLoading} className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Executando...' : 'Executar Todos os Testes'}
            </Button>
            <Button onClick={testConnectionState} variant="outline">
              Testar Conexão
            </Button>
            <Button onClick={testFetchMessages} variant="outline">
              Buscar Mensagens
            </Button>
          </div>

          {/* Resultados dos Testes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resultados dos Testes</h3>
            {testResults.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum teste executado ainda.</p>
            ) : (
              testResults.map((result) => (
                <Card key={result.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <span className="font-medium">{result.test}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(result.status)}
                        <span className="text-xs text-gray-500">{result.timestamp}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                    {result.details && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          Ver detalhes
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Mensagens Encontradas */}
          {messages.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Mensagens Encontradas ({messages.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {messages.map((msg, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{msg.pushName || 'Sem nome'}</p>
                        <p className="text-sm text-gray-600">
                          {msg.message?.conversation || msg.message?.extendedTextMessage?.text || 'Sem texto'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date((msg.messageTimestamp || 0) * 1000).toLocaleString()}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {msg.key?.fromMe ? 'Enviada' : 'Recebida'}
                        </Badge>
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
