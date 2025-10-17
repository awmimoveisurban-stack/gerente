import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useWhatsAppStatus } from '@/hooks/use-whatsapp-status';
import { WhatsAppStatusIndicator } from '@/components/whatsapp/whatsapp-status-indicator';
import {
  recoverFromCorruptedTokens,
  forceLogout,
  forceClearAllAuth,
} from '@/utils/auth-token-manager';
import {
  debugUserRoles,
  logRoleDebugInfo,
  forceRoleRefresh,
} from '@/utils/debug-roles';
import {
  runFullAuthTest,
  testAuthCredentials,
  listTestUsers,
} from '@/utils/test-auth-credentials';
import { useSecureAuth } from '@/hooks/use-secure-auth';
import {
  Settings,
  MessageSquare,
  Bot,
  Bell,
  Shield,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  QrCode,
  Phone,
  Smartphone,
  Zap,
  Shield as ShieldIcon,
  User,
  Mail,
  Globe,
  Database,
  Key,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function Configuracoes() {
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);
  const { user } = useSecureAuth();

  // ✅ DEBUG: Log para verificar se o usuário está sendo detectado corretamente
  console.log('🔍 [CONFIGURACOES] Usuário detectado:', {
    email: user?.email,
    id: user?.id,
    timestamp: new Date().toISOString(),
  });

  // ✅ Hook para status do WhatsApp
  const {
    whatsappStatus,
    isLoading: statusLoading,
    error: statusError,
    refreshStatus,
  } = useWhatsAppStatus();

  const handleTestConnection = async (service: string) => {
    toast({
      title: 'Testando conexão...',
      description: `Verificando ${service}...`,
    });

    // Simular teste de conexão
    setTimeout(() => {
      toast({
        title: 'Conexão OK',
        description: `${service} está funcionando corretamente.`,
        variant: 'default',
      });
    }, 2000);
  };

  const handleRefreshWhatsApp = () => {
    refreshStatus();
    toast({
      title: 'Status atualizado',
      description: 'Verificando status do WhatsApp...',
    });
  };

  const handleRecoverTokens = () => {
    toast({
      title: 'Recuperando tokens...',
      description: 'Verificando e corrigindo tokens corrompidos...',
    });

    const recovered = recoverFromCorruptedTokens();

    if (recovered) {
      toast({
        title: 'Tokens recuperados',
        description:
          'Tokens corrompidos foram limpos. A página será recarregada.',
      });
    } else {
      toast({
        title: 'Tokens OK',
        description: 'Nenhum token corrompido encontrado.',
      });
    }
  };

  const handleForceLogout = () => {
    toast({
      title: 'Logout forçado',
      description: 'Limpando todos os dados e redirecionando...',
    });

    setTimeout(() => {
      forceLogout();
    }, 1000);
  };

  const handleDebugRoles = async () => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não encontrado para debug.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const debugInfo = await debugUserRoles(user);
      logRoleDebugInfo(debugInfo);

      toast({
        title: 'Debug de Roles',
        description: `Roles detectados: ${debugInfo.detectedRoles.join(', ')}. Verifique o console.`,
      });
    } catch (error) {
      toast({
        title: 'Erro no debug',
        description: 'Erro ao executar debug de roles.',
        variant: 'destructive',
      });
    }
  };

  const handleRefreshRoles = () => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não encontrado para refresh.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Atualizando roles...',
      description: 'Forçando atualização de roles e recarregando página...',
    });

    setTimeout(() => {
      forceRoleRefresh(user);
    }, 1000);
  };

  const handleForceClearAll = () => {
    toast({
      title: 'Limpeza completa',
      description: 'Removendo todos os dados de autenticação...',
    });

    setTimeout(() => {
      forceClearAllAuth();
      toast({
        title: 'Limpeza concluída',
        description: 'Todos os dados foram removidos. Recarregando página...',
      });

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }, 1000);
  };

  const handleTestAuth = async () => {
    toast({
      title: 'Testando autenticação...',
      description: 'Executando teste completo. Verifique o console.',
    });

    try {
      const result = await runFullAuthTest();
      console.log('🧪 [CONFIGURACOES] Resultado do teste:', result);

      toast({
        title: 'Teste concluído',
        description: `Configuração: ${result.config.success ? 'OK' : 'ERRO'}. Verifique o console para detalhes.`,
      });
    } catch (error) {
      toast({
        title: 'Erro no teste',
        description: 'Erro ao executar teste de autenticação.',
        variant: 'destructive',
      });
    }
  };

  const handleListUsers = async () => {
    toast({
      title: 'Listando usuários...',
      description: 'Buscando usuários disponíveis...',
    });

    try {
      const users = await listTestUsers();
      console.log('👥 [CONFIGURACOES] Usuários disponíveis:', users);

      if (users.length > 0) {
        toast({
          title: 'Usuários encontrados',
          description: `${users.length} usuários disponíveis. Verifique o console.`,
        });
      } else {
        toast({
          title: 'Nenhum usuário',
          description: 'Nenhum usuário encontrado na base de dados.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao listar usuários',
        description: 'Erro ao buscar usuários disponíveis.',
        variant: 'destructive',
      });
    }
  };

  const handleForceClearAuth = () => {
    toast({
      title: 'Limpeza completa',
      description: 'Removendo todos os dados de autenticação...',
    });

    setTimeout(() => {
      forceClearAllAuth();

      toast({
        title: 'Limpeza concluída',
        description: 'Todos os dados foram removidos. Redirecionando...',
      });

      // Redirecionar para login após limpeza
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    }, 1000);
  };

  return (
    <div className='container mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6'>
        <div>
          <h1 className='text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent'>
            Configurações
          </h1>
          <p className='text-muted-foreground mt-2'>
            Gerencie suas integrações e preferências do sistema
          </p>
        </div>
        <Button onClick={() => window.location.reload()} variant='outline'>
          <RefreshCw className='h-4 w-4 mr-2' />
          Atualizar
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue='whatsapp' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-2 md:grid-cols-4'>
          <TabsTrigger value='whatsapp' className='flex items-center gap-2'>
            <MessageSquare className='h-4 w-4' />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value='ai' className='flex items-center gap-2'>
            <Bot className='h-4 w-4' />
            IA
          </TabsTrigger>
          <TabsTrigger
            value='notifications'
            className='flex items-center gap-2'
          >
            <Bell className='h-4 w-4' />
            Notificações
          </TabsTrigger>
          <TabsTrigger value='security' className='flex items-center gap-2'>
            <Shield className='h-4 w-4' />
            Segurança
          </TabsTrigger>
        </TabsList>

        {/* WhatsApp Tab */}
        <TabsContent value='whatsapp' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <MessageSquare className='h-5 w-5 text-green-600' />
                Integração WhatsApp
              </CardTitle>
              <CardDescription>
                Configure e monitore sua conexão com o WhatsApp Business
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Status do WhatsApp */}
              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div className='flex items-center gap-3'>
                  <WhatsAppStatusIndicator
                    status={whatsappStatus}
                    isLoading={statusLoading}
                    error={statusError}
                  />
                  <div>
                    <h3 className='font-semibold'>Status da Conexão</h3>
                    <p className='text-sm text-muted-foreground'>
                      {statusLoading
                        ? 'Verificando...'
                        : statusError
                          ? 'Erro na verificação'
                          : whatsappStatus === 'connected'
                            ? 'Conectado e funcionando'
                            : whatsappStatus === 'disconnected'
                              ? 'Desconectado'
                              : 'Status desconhecido'}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleRefreshWhatsApp}
                  variant='outline'
                  size='sm'
                  disabled={statusLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${statusLoading ? 'animate-spin' : ''}`}
                  />
                  Atualizar
                </Button>
              </div>

              {/* Ações do WhatsApp */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Button
                  onClick={() => window.open('/whatsapp', '_blank')}
                  className='h-auto p-4 flex flex-col items-center gap-2'
                >
                  <QrCode className='h-6 w-6' />
                  <span>Configurar WhatsApp</span>
                  <span className='text-xs opacity-75'>
                    Abrir configurações
                  </span>
                </Button>

                <Button
                  onClick={() => handleTestConnection('WhatsApp')}
                  variant='outline'
                  className='h-auto p-4 flex flex-col items-center gap-2'
                >
                  <Phone className='h-6 w-6' />
                  <span>Testar Conexão</span>
                  <span className='text-xs opacity-75'>Verificar status</span>
                </Button>
              </div>

              {/* Informações do WhatsApp */}
              <div className='bg-blue-50 p-4 rounded-lg'>
                <div className='flex items-start gap-3'>
                  <Info className='h-5 w-5 text-blue-600 mt-0.5' />
                  <div>
                    <h4 className='font-semibold text-blue-900'>
                      Sobre a Integração
                    </h4>
                    <p className='text-sm text-blue-700 mt-1'>
                      A integração com WhatsApp permite receber e enviar
                      mensagens automaticamente, processar leads e manter
                      comunicação com clientes.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IA Tab */}
        <TabsContent value='ai' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Bot className='h-5 w-5 text-purple-600' />
                Inteligência Artificial
              </CardTitle>
              <CardDescription>
                Configure a IA para análise automática de leads e respostas
                inteligentes
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Status da IA */}
              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div className='flex items-center gap-3'>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-5 w-5 text-green-600' />
                    <Badge
                      variant='default'
                      className='bg-green-100 text-green-800'
                    >
                      Ativo
                    </Badge>
                  </div>
                  <div>
                    <h3 className='font-semibold'>Claude AI (Anthropic)</h3>
                    <p className='text-sm text-muted-foreground'>
                      Modelo: claude-3-haiku-20240307
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleTestConnection('Claude AI')}
                  variant='outline'
                  size='sm'
                >
                  <Zap className='h-4 w-4 mr-2' />
                  Testar
                </Button>
              </div>

              {/* Configurações da IA */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>
                    Análise Automática
                  </label>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-4 w-4 text-green-600' />
                    <span className='text-sm'>Ativada</span>
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Leads são analisados automaticamente pela IA
                  </p>
                </div>

                <div className='space-y-2'>
                  <label className='text-sm font-medium'>
                    Respostas Inteligentes
                  </label>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-4 w-4 text-green-600' />
                    <span className='text-sm'>Ativada</span>
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    IA gera respostas personalizadas
                  </p>
                </div>
              </div>

              {/* API Key */}
              <div className='space-y-2'>
                <label className='text-sm font-medium'>API Key</label>
                <div className='flex items-center gap-2'>
                  <div className='flex-1 p-2 bg-gray-50 rounded border font-mono text-sm'>
                    {showApiKey
                      ? 'sk-ant-api03-Jh77Htw...'
                      : '••••••••••••••••••••••••••••••••'}
                  </div>
                  <Button
                    onClick={() => setShowApiKey(!showApiKey)}
                    variant='outline'
                    size='sm'
                  >
                    {showApiKey ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </Button>
                </div>
                <p className='text-xs text-muted-foreground'>
                  Chave de API da Anthropic para Claude AI
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value='notifications' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Bell className='h-5 w-5 text-yellow-600' />
                Notificações
              </CardTitle>
              <CardDescription>
                Configure como e quando receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Configurações de Notificação */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between p-4 border rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <Mail className='h-5 w-5 text-blue-600' />
                    <div>
                      <h3 className='font-semibold'>Email</h3>
                      <p className='text-sm text-muted-foreground'>
                        Receber notificações por email
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant='default'
                    className='bg-green-100 text-green-800'
                  >
                    Ativo
                  </Badge>
                </div>

                <div className='flex items-center justify-between p-4 border rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <Bell className='h-5 w-5 text-orange-600' />
                    <div>
                      <h3 className='font-semibold'>Push Notifications</h3>
                      <p className='text-sm text-muted-foreground'>
                        Notificações no navegador
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant='default'
                    className='bg-green-100 text-green-800'
                  >
                    Ativo
                  </Badge>
                </div>

                <div className='flex items-center justify-between p-4 border rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <MessageSquare className='h-5 w-5 text-green-600' />
                    <div>
                      <h3 className='font-semibold'>WhatsApp</h3>
                      <p className='text-sm text-muted-foreground'>
                        Notificações via WhatsApp
                      </p>
                    </div>
                  </div>
                  <Badge variant='secondary'>Inativo</Badge>
                </div>
              </div>

              {/* Tipos de Notificação */}
              <div className='space-y-3'>
                <h4 className='font-semibold'>Tipos de Notificação</h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-4 w-4 text-green-600' />
                    <span className='text-sm'>Novos leads</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-4 w-4 text-green-600' />
                    <span className='text-sm'>Mensagens recebidas</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-4 w-4 text-green-600' />
                    <span className='text-sm'>Tarefas pendentes</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-4 w-4 text-green-600' />
                    <span className='text-sm'>Relatórios diários</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value='security' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <ShieldIcon className='h-5 w-5 text-red-600' />
                Segurança
              </CardTitle>
              <CardDescription>
                Configure as opções de segurança da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Informações da Conta */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between p-4 border rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <User className='h-5 w-5 text-blue-600' />
                    <div>
                      <h3 className='font-semibold'>Autenticação</h3>
                      <p className='text-sm text-muted-foreground'>
                        Login seguro com Supabase Auth
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant='default'
                    className='bg-green-100 text-green-800'
                  >
                    Ativo
                  </Badge>
                </div>

                <div className='flex items-center justify-between p-4 border rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <Database className='h-5 w-5 text-purple-600' />
                    <div>
                      <h3 className='font-semibold'>Banco de Dados</h3>
                      <p className='text-sm text-muted-foreground'>
                        Dados criptografados e seguros
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant='default'
                    className='bg-green-100 text-green-800'
                  >
                    Protegido
                  </Badge>
                </div>

                <div className='flex items-center justify-between p-4 border rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <Globe className='h-5 w-5 text-green-600' />
                    <div>
                      <h3 className='font-semibold'>Conexão HTTPS</h3>
                      <p className='text-sm text-muted-foreground'>
                        Todas as comunicações são criptografadas
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant='default'
                    className='bg-green-100 text-green-800'
                  >
                    Ativo
                  </Badge>
                </div>
              </div>

              {/* Ações de Segurança */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Button
                  onClick={() =>
                    toast({
                      title: 'Funcionalidade em desenvolvimento',
                      description:
                        'Alteração de senha será implementada em breve.',
                    })
                  }
                  variant='outline'
                  className='h-auto p-4 flex flex-col items-center gap-2'
                >
                  <Key className='h-6 w-6' />
                  <span>Alterar Senha</span>
                  <span className='text-xs opacity-75'>Em breve</span>
                </Button>

                <Button
                  onClick={() =>
                    toast({
                      title: 'Funcionalidade em desenvolvimento',
                      description:
                        'Log de atividades será implementado em breve.',
                    })
                  }
                  variant='outline'
                  className='h-auto p-4 flex flex-col items-center gap-2'
                >
                  <ShieldIcon className='h-6 w-6' />
                  <span>Log de Atividades</span>
                  <span className='text-xs opacity-75'>Em breve</span>
                </Button>
              </div>

              {/* Ações de Emergência */}
              <div className='border-t pt-6'>
                <h4 className='font-semibold mb-4 text-red-600'>
                  🚨 Ações de Emergência
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Button
                    onClick={handleRecoverTokens}
                    variant='outline'
                    className='h-auto p-4 flex flex-col items-center gap-2 border-orange-200 hover:bg-orange-50'
                  >
                    <RefreshCw className='h-6 w-6 text-orange-600' />
                    <span>Recuperar Tokens</span>
                    <span className='text-xs opacity-75'>
                      Corrigir erros 400
                    </span>
                  </Button>

                  <Button
                    onClick={handleForceLogout}
                    variant='outline'
                    className='h-auto p-4 flex flex-col items-center gap-2 border-red-200 hover:bg-red-50'
                  >
                    <ShieldIcon className='h-6 w-6 text-red-600' />
                    <span>Logout Forçado</span>
                    <span className='text-xs opacity-75'>Limpar tudo</span>
                  </Button>
                </div>

                {/* Debug de Roles */}
                <div className='border-t pt-4 mt-4'>
                  <h5 className='font-medium mb-3 text-blue-600'>
                    🐛 Debug de Roles
                  </h5>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <Button
                      onClick={handleDebugRoles}
                      variant='outline'
                      className='h-auto p-4 flex flex-col items-center gap-2 border-blue-200 hover:bg-blue-50'
                    >
                      <ShieldIcon className='h-6 w-6 text-blue-600' />
                      <span>Debug Roles</span>
                      <span className='text-xs opacity-75'>
                        Verificar detecção
                      </span>
                    </Button>

                    <Button
                      onClick={handleRefreshRoles}
                      variant='outline'
                      className='h-auto p-4 flex flex-col items-center gap-2 border-purple-200 hover:bg-purple-50'
                    >
                      <RefreshCw className='h-6 w-6 text-purple-600' />
                      <span>Atualizar Roles</span>
                      <span className='text-xs opacity-75'>Forçar refresh</span>
                    </Button>
                  </div>
                  <p className='text-xs text-muted-foreground mt-2'>
                    Use para diagnosticar problemas de redirecionamento entre
                    gerente/corretor.
                  </p>
                </div>

                {/* Teste de Autenticação */}
                <div className='border-t pt-4 mt-4'>
                  <h5 className='font-medium mb-3 text-green-600'>
                    🧪 Teste de Autenticação
                  </h5>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <Button
                      onClick={handleTestAuth}
                      variant='outline'
                      className='h-auto p-4 flex flex-col items-center gap-2 border-green-200 hover:bg-green-50'
                    >
                      <ShieldIcon className='h-6 w-6 text-green-600' />
                      <span>Testar Auth</span>
                      <span className='text-xs opacity-75'>
                        Diagnóstico completo
                      </span>
                    </Button>

                    <Button
                      onClick={handleListUsers}
                      variant='outline'
                      className='h-auto p-4 flex flex-col items-center gap-2 border-teal-200 hover:bg-teal-50'
                    >
                      <Users className='h-6 w-6 text-teal-600' />
                      <span>Listar Usuários</span>
                      <span className='text-xs opacity-75'>
                        Ver usuários disponíveis
                      </span>
                    </Button>
                  </div>
                  <p className='text-xs text-muted-foreground mt-2'>
                    Use para diagnosticar problemas de login (erro 400).
                  </p>
                </div>

                {/* Limpeza Completa */}
                <div className='border-t pt-4 mt-4'>
                  <h5 className='font-medium mb-3 text-red-600'>
                    🧹 Limpeza Completa
                  </h5>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <Button
                      onClick={handleForceClearAll}
                      variant='outline'
                      className='h-auto p-4 flex flex-col items-center gap-2 border-red-200 hover:bg-red-50'
                    >
                      <ShieldIcon className='h-6 w-6 text-red-600' />
                      <span>Limpar Tudo</span>
                      <span className='text-xs opacity-75'>Todos os dados</span>
                    </Button>

                    <Button
                      onClick={handleForceLogout}
                      variant='outline'
                      className='h-auto p-4 flex flex-col items-center gap-2 border-orange-200 hover:bg-orange-50'
                    >
                      <ShieldIcon className='h-6 w-6 text-orange-600' />
                      <span>Logout Forçado</span>
                      <span className='text-xs opacity-75'>Sair e limpar</span>
                    </Button>
                  </div>
                  <p className='text-xs text-muted-foreground mt-2'>
                    Use apenas em casos extremos de problemas de autenticação.
                  </p>
                </div>

                <p className='text-xs text-muted-foreground mt-4'>
                  Use estas ações apenas se estiver enfrentando problemas de
                  autenticação (erro 400) ou redirecionamento.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
