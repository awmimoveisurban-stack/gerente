/**
 * 🔔 Teste de Notificações
 * 
 * Página para testar o sistema de notificações
 * 
 * @version 1.0.0
 * @author Sistema URBAN CRM
 */

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/hooks/use-notifications';
import { useSafeLeadIntegration } from '@/components/notifications/safe-integration';
import { Bell, TestTube, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function TestNotifications() {
  const { 
    notifications, 
    settings, 
    permission, 
    stats,
    requestPermission,
    addNotification,
    notifyNewLead,
    notifyWhatsAppStatus,
    notifySystemAlert,
    updateSettings
  } = useNotifications();

  const { notifyLeadCreated } = useSafeLeadIntegration();

  const [testResults, setTestResults] = useState<Array<{
    test: string;
    status: 'success' | 'error' | 'pending';
    message: string;
    timestamp: number;
  }>>([]);

  const addTestResult = (test: string, status: 'success' | 'error' | 'pending', message: string) => {
    setTestResults(prev => [{
      test,
      status,
      message,
      timestamp: Date.now()
    }, ...prev.slice(0, 9)]);
  };

  const testBasicNotification = () => {
    try {
      addNotification(
        'system',
        '🧪 Teste Básico',
        'Esta é uma notificação de teste básica',
        'medium'
      );
      addTestResult('Notificação Básica', 'success', 'Notificação criada com sucesso');
    } catch (error) {
      addTestResult('Notificação Básica', 'error', `Erro: ${error}`);
    }
  };

  const testLeadNotification = () => {
    try {
      const mockLead = {
        id: 'test-lead-123',
        nome: 'João Silva Teste',
        score_ia: 85,
        telefone: '(11) 99999-9999',
        origem: 'teste',
        prioridade: 'alta'
      };
      
      // Testar diretamente o hook de notificações
      notifyNewLead(mockLead);
      addTestResult('Notificação de Lead', 'success', 'Lead mock criado e notificado');
    } catch (error) {
      addTestResult('Notificação de Lead', 'error', `Erro: ${error}`);
    }
  };

  const testWhatsAppNotification = () => {
    try {
      notifyWhatsAppStatus('authorized', 'WhatsApp conectado com sucesso');
      addTestResult('Notificação WhatsApp', 'success', 'Status WhatsApp notificado');
    } catch (error) {
      addTestResult('Notificação WhatsApp', 'error', `Erro: ${error}`);
    }
  };

  const testSystemAlert = () => {
    try {
      notifySystemAlert('⚠️ Alerta do Sistema', 'Este é um alerta de teste do sistema', 'high');
      addTestResult('Alerta do Sistema', 'success', 'Alerta criado com sucesso');
    } catch (error) {
      addTestResult('Alerta do Sistema', 'error', `Erro: ${error}`);
    }
  };

  const testBrowserPermission = async () => {
    try {
      const granted = await requestPermission();
      if (granted) {
        addTestResult('Permissão Browser', 'success', 'Permissão concedida');
      } else {
        addTestResult('Permissão Browser', 'error', 'Permissão negada ou não suportada');
      }
    } catch (error) {
      addTestResult('Permissão Browser', 'error', `Erro: ${error}`);
    }
  };

  const testAllNotifications = () => {
    testBasicNotification();
    setTimeout(() => testLeadNotification(), 500);
    setTimeout(() => testWhatsAppNotification(), 1000);
    setTimeout(() => testSystemAlert(), 1500);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">🔔 Teste de Notificações</h1>
            <p className="text-gray-600">Teste o sistema de notificações do URBAN CRM</p>
          </div>
          <Badge variant="outline" className="text-sm">
            <Bell className="h-4 w-4 mr-1" />
            {stats.unread} não lidas
          </Badge>
        </div>

        {/* Status do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900">Permissão Browser</h4>
                <p className="text-sm text-blue-700">
                  {permission === 'granted' ? '✅ Concedida' : 
                   permission === 'denied' ? '❌ Negada' : '⚠️ Não solicitada'}
                </p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900">Configurações</h4>
                <p className="text-sm text-green-700">
                  Leads: {settings.leadNotifications ? '✅' : '❌'} | 
                  Som: {settings.soundEnabled ? '✅' : '❌'}
                </p>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900">Estatísticas</h4>
                <p className="text-sm text-purple-700">
                  Total: {stats.total} | Não lidas: {stats.unread}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testes */}
        <Card>
          <CardHeader>
            <CardTitle>Testes de Notificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Button onClick={testBasicNotification} variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Teste Básico
              </Button>
              
              <Button onClick={testLeadNotification} variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Teste Lead
              </Button>
              
              <Button onClick={testWhatsAppNotification} variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Teste WhatsApp
              </Button>
              
              <Button onClick={testSystemAlert} variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Teste Alerta
              </Button>
              
              <Button onClick={testBrowserPermission} variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Solicitar Permissão
              </Button>
              
              <Button onClick={testAllNotifications} className="bg-blue-600 hover:bg-blue-700">
                <TestTube className="h-4 w-4 mr-2" />
                Testar Tudo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultados dos Testes */}
        <Card>
          <CardHeader>
            <CardTitle>Resultados dos Testes</CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nenhum teste executado ainda
              </p>
            ) : (
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <h4 className="font-medium">{result.test}</h4>
                      <p className="text-sm text-gray-600">{result.message}</p>
                    </div>
                    <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                      {result.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notificações Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Notificações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nenhuma notificação ainda
              </p>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{notification.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {notification.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {(() => {
                        try {
                          const date = new Date(notification.timestamp);
                          if (isNaN(date.getTime())) {
                            return 'Agora mesmo';
                          }
                          return date.toLocaleString('pt-BR');
                        } catch (error) {
                          console.warn('Erro ao formatar data:', error);
                          return 'Agora mesmo';
                        }
                      })()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
