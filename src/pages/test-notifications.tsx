/**
 * 🧪 Página de Teste de Notificações
 * 
 * Página para testar o sistema de notificações
 * Pode ser removida após os testes
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
import { 
  Bell, 
  BellOff, 
  Volume2, 
  VolumeX, 
  Settings,
  TestTube,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { 
  useNotifications, 
  NotificationCenter,
  SafeNotificationIntegration 
} from '@/components/notifications/safe-integration';

export default function TestNotifications() {
  const {
    addNotification,
    requestPermission,
    settings,
    updateSettings,
    stats,
    playSound,
    clearNotifications,
    markAllAsRead,
  } = useNotifications();

  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testBasicNotification = () => {
    try {
      addNotification(
        'system',
        '🧪 Teste Básico',
        'Esta é uma notificação de teste básico',
        'medium'
      );
      addTestResult('✅ Notificação básica criada com sucesso');
    } catch (error) {
      addTestResult(`❌ Erro na notificação básica: ${error}`);
    }
  };

  const testLeadNotification = () => {
    try {
      addNotification(
        'lead',
        '🎯 Lead de Teste',
        'João Silva - Score: 85/100 - Origem: WhatsApp',
        'high',
        { leadId: 'test-123', score: 85 },
        '/todos-leads'
      );
      addTestResult('✅ Notificação de lead criada com sucesso');
    } catch (error) {
      addTestResult(`❌ Erro na notificação de lead: ${error}`);
    }
  };

  const testWhatsAppNotification = () => {
    try {
      addNotification(
        'whatsapp',
        '📱 WhatsApp Conectado',
        'WhatsApp foi conectado com sucesso!',
        'high'
      );
      addTestResult('✅ Notificação WhatsApp criada com sucesso');
    } catch (error) {
      addTestResult(`❌ Erro na notificação WhatsApp: ${error}`);
    }
  };

  const testUrgentNotification = () => {
    try {
      addNotification(
        'alert',
        '🚨 Alerta Urgente',
        'Sistema em manutenção em 5 minutos!',
        'urgent'
      );
      addTestResult('✅ Notificação urgente criada com sucesso');
    } catch (error) {
      addTestResult(`❌ Erro na notificação urgente: ${error}`);
    }
  };

  const testSound = () => {
    try {
      playSound('success');
      addTestResult('✅ Som de sucesso reproduzido');
    } catch (error) {
      addTestResult(`❌ Erro ao reproduzir som: ${error}`);
    }
  };

  const testPermission = async () => {
    try {
      const granted = await requestPermission();
      addTestResult(granted ? '✅ Permissão concedida' : '❌ Permissão negada');
    } catch (error) {
      addTestResult(`❌ Erro ao solicitar permissão: ${error}`);
    }
  };

  const testAllNotifications = () => {
    testBasicNotification();
    setTimeout(() => testLeadNotification(), 500);
    setTimeout(() => testWhatsAppNotification(), 1000);
    setTimeout(() => testUrgentNotification(), 1500);
    addTestResult('🎯 Todos os testes de notificação executados');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <TestTube className="h-8 w-8 text-blue-600" />
              Teste de Notificações
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Página para testar o sistema de notificações
            </p>
          </div>
          
          {/* Componente de Notificações */}
          <NotificationCenter />
        </div>

        {/* Estatísticas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.unread}</div>
                <div className="text-sm text-gray-600">Não Lidas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.byType.lead || 0}
                </div>
                <div className="text-sm text-gray-600">Leads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.byType.whatsapp || 0}
                </div>
                <div className="text-sm text-gray-600">WhatsApp</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span>Notificações de Leads</span>
                </div>
                <Badge variant={settings.leadNotifications ? 'default' : 'secondary'}>
                  {settings.leadNotifications ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span>Notificações WhatsApp</span>
                </div>
                <Badge variant={settings.whatsappNotifications ? 'default' : 'secondary'}>
                  {settings.whatsappNotifications ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  <span>Sons</span>
                </div>
                <Badge variant={settings.soundEnabled ? 'default' : 'secondary'}>
                  {settings.soundEnabled ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span>Notificações Sistema</span>
                </div>
                <Badge variant={settings.systemNotifications ? 'default' : 'secondary'}>
                  {settings.systemNotifications ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Testes de Notificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button onClick={testBasicNotification} variant="outline">
                <CheckCircle className="h-4 w-4 mr-2" />
                Teste Básico
              </Button>
              
              <Button onClick={testLeadNotification} variant="outline">
                <CheckCircle className="h-4 w-4 mr-2" />
                Teste Lead
              </Button>
              
              <Button onClick={testWhatsAppNotification} variant="outline">
                <CheckCircle className="h-4 w-4 mr-2" />
                Teste WhatsApp
              </Button>
              
              <Button onClick={testUrgentNotification} variant="outline">
                <AlertCircle className="h-4 w-4 mr-2" />
                Teste Urgente
              </Button>
            </div>

            <Separator />

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <Button onClick={testSound} variant="secondary">
                <Volume2 className="h-4 w-4 mr-2" />
                Testar Som
              </Button>
              
              <Button onClick={testPermission} variant="secondary">
                <Bell className="h-4 w-4 mr-2" />
                Solicitar Permissão
              </Button>
              
              <Button onClick={testAllNotifications} className="bg-blue-600 hover:bg-blue-700">
                <TestTube className="h-4 w-4 mr-2" />
                Testar Todos
              </Button>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button onClick={markAllAsRead} variant="outline" size="sm">
                Marcar como Lidas
              </Button>
              <Button onClick={clearNotifications} variant="outline" size="sm">
                Limpar Todas
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultados dos Testes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Resultados dos Testes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {testResults.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Nenhum teste executado ainda
                </p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono p-2 bg-gray-50 rounded">
                    {result}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Integração Fixa */}
        <SafeNotificationIntegration position="bottom-right" />
      </div>
    </AppLayout>
  );
}
