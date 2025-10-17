import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { createTestCorretores, clearTestData } from '@/utils/create-test-corretores';
import { createTestGerente, checkGerenteExists } from '@/utils/create-test-gerente';
import { createTestLeads, clearTestLeads } from '@/utils/create-test-leads';
import { debugProfilesTable, createGerenteWithWorkingStructure } from '@/utils/debug-database';
import { createSimpleGerente } from '@/utils/simple-auth-test';
import { createUltraSimpleGerente, verifyGerenteExists } from '@/utils/ultra-simple-gerente';
import { 
  Users, 
  Database, 
  Trash2, 
  Plus, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  UserPlus,
  RefreshCw,
  Shield,
  Zap,
  Bug,
  Navigation
} from 'lucide-react';

export default function AdminTestData() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();

  const handleCreateTestData = async () => {
    setLoading(true);
    try {
      console.log('🚀 Iniciando criação de dados de teste...');
      
      // Primeiro, criar o gerente se não existir
      const gerenteExists = await checkGerenteExists();
      if (!gerenteExists) {
        console.log('📝 Criando gerente de teste...');
        const gerenteResult = await createTestGerente();
        if (gerenteResult.success) {
          toast({
            title: '✅ Gerente Criado',
            description: `Gerente criado: ${gerenteResult.login_nome} / ${gerenteResult.senha}`,
          });
        }
      } else {
        console.log('✅ Gerente já existe');
      }
      
      // Depois criar os corretores
      const testResults = await createTestCorretores();
      setResults(testResults);
      
      const successCount = testResults.filter(r => r.success).length;
      const errorCount = testResults.filter(r => !r.success).length;
      
      toast({
        title: '✅ Dados de Teste Criados',
        description: `${successCount} corretores criados com sucesso${errorCount > 0 ? `, ${errorCount} com erro` : ''}`,
      });
    } catch (error) {
      console.error('❌ Erro ao criar dados de teste:', error);
      toast({
        title: '❌ Erro ao Criar Dados',
        description: 'Não foi possível criar os dados de teste.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLeads = async () => {
    setLoading(true);
    try {
      console.log('🚀 Criando leads de teste...');
      
      const leadsResult = await createTestLeads();
      if (leadsResult.success) {
        toast({
          title: '✅ Leads Criados',
          description: `${leadsResult.summary.success} leads criados com sucesso${leadsResult.summary.errors > 0 ? `, ${leadsResult.summary.errors} com erro` : ''}`,
        });
      } else {
        toast({
          title: '❌ Erro ao Criar Leads',
          description: leadsResult.error || 'Não foi possível criar os leads de teste.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Erro ao criar leads:', error);
      toast({
        title: '❌ Erro ao Criar Leads',
        description: 'Não foi possível criar os leads de teste.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDebugDatabase = async () => {
    setLoading(true);
    try {
      console.log('🔍 Iniciando debug da estrutura da tabela...');
      
      const debugResult = await debugProfilesTable();
      
      if (debugResult.success) {
        toast({
          title: '✅ Debug Concluído',
          description: `Estrutura funcionando: ${debugResult.workingStructure?.name}`,
        });
      } else {
        toast({
          title: '❌ Debug Falhou',
          description: 'Não foi possível determinar a estrutura da tabela.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Erro no debug:', error);
      toast({
        title: '❌ Erro no Debug',
        description: 'Erro inesperado durante o debug.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUltraSimpleGerente = async () => {
    setLoading(true);
    try {
      console.log('🚀 Criando gerente ultra-simples...');
      
      const gerenteResult = await createUltraSimpleGerente();
      if (gerenteResult.success) {
        toast({
          title: '✅ Gerente Ultra-Simples Criado',
          description: `Gerente criado com sucesso usando: ${gerenteResult.approach}!`,
        });
      } else {
        toast({
          title: '❌ Erro ao Criar Gerente',
          description: gerenteResult.error || 'Não foi possível criar o gerente.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Erro ao criar gerente ultra-simples:', error);
      toast({
        title: '❌ Erro ao Criar Gerente',
        description: 'Não foi possível criar o gerente ultra-simples.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyGerente = async () => {
    setLoading(true);
    try {
      console.log('🔍 Verificando gerente...');
      
      const verifyResult = await verifyGerenteExists();
      if (verifyResult.exists) {
        toast({
          title: '✅ Gerente Encontrado',
          description: `Gerente existe e está ativo: ${verifyResult.data?.nome}`,
        });
      } else {
        toast({
          title: '❌ Gerente Não Encontrado',
          description: verifyResult.error || 'Gerente não existe no banco de dados.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Erro ao verificar gerente:', error);
      toast({
        title: '❌ Erro na Verificação',
        description: 'Erro inesperado ao verificar gerente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSimpleGerente = async () => {
    setLoading(true);
    try {
      console.log('🚀 Criando gerente simples...');
      
      const gerenteResult = await createSimpleGerente();
      if (gerenteResult.success) {
        toast({
          title: '✅ Gerente Simples Criado',
          description: `Gerente criado com sucesso! Agora você pode fazer login.`,
        });
      } else {
        toast({
          title: '❌ Erro ao Criar Gerente',
          description: gerenteResult.error?.message || 'Não foi possível criar o gerente.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Erro ao criar gerente simples:', error);
      toast({
        title: '❌ Erro ao Criar Gerente',
        description: 'Não foi possível criar o gerente simples.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGerenteWithDebug = async () => {
    setLoading(true);
    try {
      console.log('🚀 Criando gerente com debug...');
      
      const gerenteExists = await checkGerenteExists();
      if (gerenteExists) {
        toast({
          title: 'ℹ️ Gerente já existe',
          description: 'O gerente de teste já foi criado anteriormente.',
        });
        return;
      }

      const gerenteResult = await createGerenteWithWorkingStructure();
      if (gerenteResult.success) {
        toast({
          title: '✅ Gerente Criado',
          description: `Gerente criado com sucesso usando estrutura otimizada!`,
        });
      } else {
        toast({
          title: '❌ Erro ao Criar Gerente',
          description: gerenteResult.error?.message || 'Não foi possível criar o gerente de teste.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Erro ao criar gerente:', error);
      toast({
        title: '❌ Erro ao Criar Gerente',
        description: 'Não foi possível criar o gerente de teste.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGerente = async () => {
    setLoading(true);
    try {
      console.log('🚀 Criando gerente de teste...');
      
      const gerenteExists = await checkGerenteExists();
      if (gerenteExists) {
        toast({
          title: 'ℹ️ Gerente já existe',
          description: 'O gerente de teste já foi criado anteriormente.',
        });
        return;
      }

      const gerenteResult = await createTestGerente();
      if (gerenteResult.success) {
        toast({
          title: '✅ Gerente Criado',
          description: `Gerente criado com sucesso! Login: ${gerenteResult.login_nome} / Senha: ${gerenteResult.senha}`,
        });
      } else {
        toast({
          title: '❌ Erro ao Criar Gerente',
          description: 'Não foi possível criar o gerente de teste.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Erro ao criar gerente:', error);
      toast({
        title: '❌ Erro ao Criar Gerente',
        description: 'Não foi possível criar o gerente de teste.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearTestData = async () => {
    const confirmClear = window.confirm(
      '⚠️ Tem certeza que deseja limpar todos os dados de teste?\n\nEsta ação não pode ser desfeita e removerá:\n- Todos os corretores de teste\n- Todos os leads de teste\n- Todos os roles de teste'
    );
    
    if (!confirmClear) return;

    setLoading(true);
    try {
      console.log('🧹 Iniciando limpeza de dados de teste...');
      await clearTestData();
      setResults([]);
      
      toast({
        title: '✅ Dados Limpos',
        description: 'Todos os dados de teste foram removidos com sucesso!',
      });
    } catch (error) {
      console.error('❌ Erro ao limpar dados de teste:', error);
      toast({
        title: '❌ Erro ao Limpar Dados',
        description: 'Não foi possível limpar os dados de teste.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                🧪 Administração de Dados de Teste
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gerencie dados fictícios para testar o sistema de corretores
              </p>
            </motion.div>
          </div>

          {/* Cards de Ação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Criar Dados de Teste */}
            <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-green-600" />
                  Criar Dados de Teste
                </CardTitle>
                <CardDescription>
                  Cria corretores fictícios com credenciais e leads de exemplo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                      Serão criados:
                    </h4>
                    <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                      <li>• 5 corretores fictícios</li>
                      <li>• Credenciais de login para cada um</li>
                      <li>• Leads de exemplo para teste</li>
                      <li>• Roles e permissões configurados</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <Button 
                      onClick={handleCreateUltraSimpleGerente}
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <UserPlus className="mr-2 h-4 w-4" />
                      )}
                      {loading ? 'Criando...' : '🚀 Criar Gerente Ultra-Simples (MÁXIMO)'}
                    </Button>
                    
                    <Button 
                      onClick={handleVerifyGerente}
                      disabled={loading}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Database className="mr-2 h-4 w-4" />
                      )}
                      {loading ? 'Verificando...' : '🔍 Verificar se Gerente Existe'}
                    </Button>
                    
                    <Button 
                      onClick={handleCreateSimpleGerente}
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <UserPlus className="mr-2 h-4 w-4" />
                      )}
                      {loading ? 'Criando...' : '✅ Criar Gerente Simples'}
                    </Button>
                    
                    <Button 
                      onClick={handleDebugDatabase}
                      disabled={loading}
                      className="w-full bg-yellow-600 hover:bg-yellow-700"
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Database className="mr-2 h-4 w-4" />
                      )}
                      {loading ? 'Debugando...' : '🔍 Debug Estrutura da Tabela'}
                    </Button>
                    
                    <Button 
                      onClick={handleCreateGerenteWithDebug}
                      disabled={loading}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <UserPlus className="mr-2 h-4 w-4" />
                      )}
                      {loading ? 'Criando...' : 'Criar Gerente (Com Debug)'}
                    </Button>
                    
                    <Button 
                      onClick={handleCreateGerente}
                      disabled={loading}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <UserPlus className="mr-2 h-4 w-4" />
                      )}
                      {loading ? 'Criando...' : 'Criar Gerente (Método Original)'}
                    </Button>
                    
                    <Button 
                      onClick={handleCreateLeads}
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="mr-2 h-4 w-4" />
                      )}
                      {loading ? 'Criando...' : 'Criar Leads de Teste'}
                    </Button>
                    
                    <Button 
                      onClick={handleCreateTestData}
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="mr-2 h-4 w-4" />
                      )}
                      {loading ? 'Criando Dados...' : 'Criar Todos os Dados de Teste'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Limpar Dados de Teste */}
            <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-600" />
                  Limpar Dados de Teste
                </CardTitle>
                <CardDescription>
                  Remove todos os dados fictícios do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">
                      Será removido:
                    </h4>
                    <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                      <li>• Todos os corretores de teste</li>
                      <li>• Todos os leads de teste</li>
                      <li>• Todos os roles de teste</li>
                      <li>• Dados relacionados</li>
                    </ul>
                  </div>
                  
                  <Button 
                    onClick={handleClearTestData}
                    disabled={loading}
                    variant="destructive"
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    {loading ? 'Limpando...' : 'Limpar Dados de Teste'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resultados */}
          {results.length > 0 && (
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  Resultados da Operação
                </CardTitle>
                <CardDescription>
                  Status da criação dos corretores de teste
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border ${
                        result.success 
                          ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
                          : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {result.success ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          )}
                          <div>
                            <p className={`font-medium ${
                              result.success 
                                ? 'text-green-800 dark:text-green-300' 
                                : 'text-red-800 dark:text-red-300'
                            }`}>
                              {result.nome}
                            </p>
                            {result.success && (
                              <p className="text-sm text-green-600 dark:text-green-400">
                                Login: {result.login_nome} | Senha: {result.senha}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant={result.success ? "default" : "destructive"}>
                          {result.success ? 'Sucesso' : 'Erro'}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informações de Teste */}
          <Card className="mt-8 bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Credenciais de Teste
              </CardTitle>
              <CardDescription>
                Use estas credenciais para testar o login de gerentes e corretores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Gerente */}
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border-2 border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">
                    🏢 Admin Gerente
                  </h4>
                  <div className="text-sm text-red-700 dark:text-red-400 space-y-1">
                    <p><strong>Login:</strong> admin</p>
                    <p><strong>Email:</strong> cursos360.click@gmail.com</p>
                    <p><strong>Senha:</strong> Ac@130204@</p>
                    <div className="flex items-center gap-2">
                      <span><strong>Role:</strong></span>
                      <Badge variant="destructive">Gerente</Badge>
                    </div>
                  </div>
                </div>

                {/* Corretores */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                    João Silva Santos
                  </h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    <strong>Login:</strong> joao.silva<br />
                    <strong>Email:</strong> joao.silva@imobiliaria.com<br />
                    <strong>Senha:</strong> 1234
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                    Maria Oliveira Costa
                  </h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    <strong>Login:</strong> maria.oliveira<br />
                    <strong>Email:</strong> maria.oliveira@imobiliaria.com<br />
                    <strong>Senha:</strong> 1234
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                    Pedro Rodrigues Lima
                  </h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    <strong>Login:</strong> pedro.rodrigues<br />
                    <strong>Email:</strong> pedro.rodrigues@imobiliaria.com<br />
                    <strong>Senha:</strong> 1234
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                    Ana Paula Ferreira
                  </h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    <strong>Login:</strong> ana.paula<br />
                    <strong>Email:</strong> ana.paula@imobiliaria.com<br />
                    <strong>Senha:</strong> 1234
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                    Carlos Eduardo Santos
                  </h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    <strong>Login:</strong> carlos.eduardo<br />
                    <strong>Email:</strong> carlos.eduardo@imobiliaria.com<br />
                    <strong>Senha:</strong> 1234
                  </p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                  💡 Como Testar:
                </h4>
                <ol className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1 list-decimal list-inside">
                  <li><strong>🚀 SOLUÇÃO MAIS DEFINITIVA:</strong> Use "Sistema Forçado Offline (DEFINITIVO)" - NUNCA acessa o banco</li>
                  <li><strong>🐛 SE HOUVER PROBLEMA DE CONTEXTO:</strong> Use "Debug Contexto do Usuário" para diagnosticar</li>
                  <li><strong>🧭 SE HOUVER PROBLEMA DE NAVEGAÇÃO:</strong> Use "Debug de Navegação" para monitorar mudanças</li>
                  <li><strong>💡 ALTERNATIVA:</strong> Use "Sistema de Autenticação Offline" (não depende do banco)</li>
                  <li><strong>SOLUÇÃO MÁXIMA:</strong> Use "Criar Gerente Ultra-Simples (MÁXIMO)" primeiro</li>
                  <li><strong>Verificar:</strong> Use "Verificar se Gerente Existe" para confirmar criação</li>
                  <li><strong>Se houver erro 406/400:</strong> Use "Debug Estrutura da Tabela" para diagnóstico</li>
                  <li>Use "Criar Leads de Teste" para gerar leads vinculados ao gerente</li>
                  <li>Use "Criar Todos os Dados de Teste" para gerar corretores e mais leads</li>
                  <li>Use os botões abaixo para testar login de gerente e corretores</li>
                  <li>Use as credenciais listadas acima (cursos360.click@gmail.com/qualquer senha para gerente)</li>
                  <li>Teste as funcionalidades de leads, edição, equipe, etc.</li>
                  <li>Use "Limpar Dados de Teste" quando terminar</li>
                </ol>
              </div>
              
              <div className="mt-4 space-y-3">
                <Button
                  onClick={() => window.open('/offline-auth-test', '_blank')}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  🚀 Sistema de Autenticação Offline
                </Button>
                
                <Button
                  onClick={() => window.open('/force-offline-test', '_blank')}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  ⚡ Sistema Forçado Offline (DEFINITIVO)
                </Button>
                
                <Button
                  onClick={() => window.open('/user-context-debug', '_blank')}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <Bug className="mr-2 h-4 w-4" />
                  🐛 Debug Contexto do Usuário
                </Button>
                
        <Button
          onClick={() => window.open('/navigation-debug', '_blank')}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          <Navigation className="mr-2 h-4 w-4" />
          🧭 Debug de Navegação
        </Button>
        <Button
          onClick={() => window.open('/auth-test-unified', '_blank')}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <Shield className="mr-2 h-4 w-4" />
          🔐 Sistema Unificado (NOVO)
        </Button>
        <Button
          onClick={() => window.open('/test-navigation', '_blank')}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          <User className="mr-2 h-4 w-4" />
          🧪 Teste de Navegação
        </Button>
                
                <Button
                  onClick={() => window.open('/auth-v2', '_blank')}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Testar Login de Gerente (Normal)
                </Button>
                
                <Button
                  onClick={() => window.open('/corretor-login', '_blank')}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Testar Login de Corretor
                </Button>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Abre as páginas de login em nova aba
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
