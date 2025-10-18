import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { useUnifiedAuth } from '@/contexts/unified-auth-context';
import { useUserRoles } from '@/hooks/use-user-roles';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Mail,
  Phone,
  Building2,
  Shield,
  Save,
  Key,
  UserCog,
  Award,
  TrendingUp,
  Target,
} from 'lucide-react';

export default function Profile() {
  const { user } = useUnifiedAuth();
  const { hasRole } = useUserRoles();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    nome: '',
    email: user?.email || '',
    telefone: '',
    empresa: '',
    cargo: '',
  });

  const [senhas, setSenhas] = useState({
    atual: '',
    nova: '',
    confirmar: '',
  });

  const [stats, setStats] = useState({
    totalLeads: 0,
    leadsConvertidos: 0,
    taxaConversao: 0,
    valorTotal: 0,
  });

  // Carregar perfil do usuário
  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (!error && data) {
          setProfile({
            nome: data.nome || '',
            email: user.email || '',
            telefone: data.telefone || '',
            empresa: data.empresa || '',
            cargo: data.cargo || '',
          });
        }
      } catch (error: any) {
        console.error('Erro ao carregar perfil:', error);
      }
    };

    const loadStats = async () => {
      try {
        // Total de leads
        let query = supabase
          .from('leads')
          .select('id, status, orcamento', { count: 'exact' });

        if (hasRole('corretor')) {
          query = query.eq('corretor', user.email);
        }

        const { count, data } = await query;

        // Leads convertidos
        const convertidos =
          data?.filter(l => l.status === 'fechado').length || 0;

        // Valor total (orcamento de leads fechados)
        const valor =
          data
            ?.filter(l => l.status === 'fechado' && l.orcamento)
            .reduce((sum, l) => sum + (Number(l.orcamento) || 0), 0) || 0;

        setStats({
          totalLeads: count || 0,
          leadsConvertidos: convertidos,
          taxaConversao: count ? Math.round((convertidos / count) * 100) : 0,
          valorTotal: valor,
        });
      } catch (error: any) {
        console.error('Erro ao carregar stats:', error);
      }
    };

    loadProfile();
    loadStats();
  }, [user, hasRole]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        nome: profile.nome,
        telefone: profile.telefone,
        empresa: profile.empresa,
        cargo: profile.cargo,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: '✅ Perfil atualizado!',
        description: 'Suas informações foram salvas com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: '❌ Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!senhas.nova || senhas.nova.length < 6) {
      toast({
        title: '⚠️ Senha inválida',
        description: 'A senha deve ter no mínimo 6 caracteres',
        variant: 'destructive',
      });
      return;
    }

    if (senhas.nova !== senhas.confirmar) {
      toast({
        title: '⚠️ Senhas não conferem',
        description: 'A nova senha e a confirmação devem ser iguais',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: senhas.nova,
      });

      if (error) throw error;

      toast({
        title: '✅ Senha alterada!',
        description: 'Sua senha foi atualizada com sucesso.',
      });

      setSenhas({ atual: '', nova: '', confirmar: '' });
    } catch (error: any) {
      toast({
        title: '❌ Erro ao alterar senha',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isGerente = hasRole('gerente');
  const isCorretor = hasRole('corretor');

  return (
    <AppLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3'>
              <UserCog className='h-8 w-8 text-blue-600' />
              Meu Perfil
            </h1>
            <p className='text-gray-600 dark:text-gray-400 mt-1'>
              Gerencie suas informações pessoais e configurações
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Coluna Esquerda - Perfil e Senha */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Informações Pessoais */}
            <Card>
              <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'>
                <CardTitle className='flex items-center gap-2'>
                  <User className='h-5 w-5 text-blue-600' />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>
                  Atualize seus dados cadastrais
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4 pt-6'>
                <div className='flex items-center justify-center mb-6'>
                  <Avatar className='h-24 w-24 border-4 border-blue-200'>
                    <AvatarFallback className='bg-gradient-to-br from-blue-400 to-blue-600 text-white text-3xl font-bold'>
                      {profile.nome
                        ? profile.nome.charAt(0).toUpperCase()
                        : user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='nome'>Nome Completo</Label>
                    <Input
                      id='nome'
                      value={profile.nome}
                      onChange={e =>
                        setProfile({ ...profile, nome: e.target.value })
                      }
                      placeholder='Seu nome completo'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='email'>Email</Label>
                    <Input
                      id='email'
                      type='email'
                      value={profile.email}
                      disabled
                      className='bg-gray-100 dark:bg-gray-800'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='telefone'>Telefone</Label>
                    <Input
                      id='telefone'
                      type='tel'
                      value={profile.telefone}
                      onChange={e =>
                        setProfile({ ...profile, telefone: e.target.value })
                      }
                      placeholder='(62) 99999-9999'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='cargo'>Cargo</Label>
                    <Input
                      id='cargo'
                      value={profile.cargo}
                      onChange={e =>
                        setProfile({ ...profile, cargo: e.target.value })
                      }
                      placeholder='Ex: Gerente de Vendas'
                    />
                  </div>

                  <div className='space-y-2 md:col-span-2'>
                    <Label htmlFor='empresa'>Empresa/Imobiliária</Label>
                    <Input
                      id='empresa'
                      value={profile.empresa}
                      onChange={e =>
                        setProfile({ ...profile, empresa: e.target.value })
                      }
                      placeholder='Nome da sua imobiliária'
                    />
                  </div>
                </div>

                <div className='flex justify-end pt-4'>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  >
                    <Save className='mr-2 h-4 w-4' />
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Alterar Senha */}
            <Card>
              <CardHeader className='bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'>
                <CardTitle className='flex items-center gap-2'>
                  <Key className='h-5 w-5 text-purple-600' />
                  Segurança
                </CardTitle>
                <CardDescription>Altere sua senha de acesso</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4 pt-6'>
                <div className='space-y-2'>
                  <Label htmlFor='senha-nova'>Nova Senha</Label>
                  <Input
                    id='senha-nova'
                    type='password'
                    value={senhas.nova}
                    onChange={e =>
                      setSenhas({ ...senhas, nova: e.target.value })
                    }
                    placeholder='Mínimo 6 caracteres'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='senha-confirmar'>Confirmar Nova Senha</Label>
                  <Input
                    id='senha-confirmar'
                    type='password'
                    value={senhas.confirmar}
                    onChange={e =>
                      setSenhas({ ...senhas, confirmar: e.target.value })
                    }
                    placeholder='Digite a senha novamente'
                  />
                </div>

                <div className='flex justify-end pt-4'>
                  <Button
                    onClick={handleChangePassword}
                    disabled={loading || !senhas.nova}
                    variant='outline'
                    className='border-purple-300 text-purple-700 hover:bg-purple-50'
                  >
                    <Key className='mr-2 h-4 w-4' />
                    {loading ? 'Alterando...' : 'Alterar Senha'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Direita - Info e Stats */}
          <div className='space-y-6'>
            {/* Informações da Conta */}
            <Card>
              <CardHeader className='bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20'>
                <CardTitle className='flex items-center gap-2'>
                  <Shield className='h-5 w-5 text-emerald-600' />
                  Informações da Conta
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4 pt-6'>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600 dark:text-gray-400'>
                      Email:
                    </span>
                    <span className='text-sm font-medium text-gray-900 dark:text-white'>
                      {user?.email}
                    </span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600 dark:text-gray-400'>
                      Perfil:
                    </span>
                    <div className='flex gap-2'>
                      {isGerente && (
                        <Badge className='bg-gradient-to-r from-purple-500 to-pink-500'>
                          👨‍💼 Gerente
                        </Badge>
                      )}
                      {isCorretor && (
                        <Badge className='bg-gradient-to-r from-blue-500 to-cyan-500'>
                          👤 Corretor
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600 dark:text-gray-400'>
                      ID:
                    </span>
                    <span className='text-xs font-mono text-gray-500 dark:text-gray-400'>
                      {user?.id.substring(0, 8)}...
                    </span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600 dark:text-gray-400'>
                      Criado em:
                    </span>
                    <span className='text-sm text-gray-900 dark:text-white'>
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString('pt-BR')
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card>
              <CardHeader className='bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20'>
                <CardTitle className='flex items-center gap-2'>
                  <Award className='h-5 w-5 text-orange-600' />
                  Minhas Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4 pt-6'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg'>
                    <Target className='h-6 w-6 text-blue-600 mx-auto mb-2' />
                    <div className='text-2xl font-bold text-blue-600'>
                      {stats.totalLeads}
                    </div>
                    <div className='text-xs text-gray-600 dark:text-gray-400'>
                      Total Leads
                    </div>
                  </div>

                  <div className='text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg'>
                    <TrendingUp className='h-6 w-6 text-green-600 mx-auto mb-2' />
                    <div className='text-2xl font-bold text-green-600'>
                      {stats.leadsConvertidos}
                    </div>
                    <div className='text-xs text-gray-600 dark:text-gray-400'>
                      Convertidos
                    </div>
                  </div>

                  <div className='text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg'>
                    <Award className='h-6 w-6 text-purple-600 mx-auto mb-2' />
                    <div className='text-2xl font-bold text-purple-600'>
                      {stats.taxaConversao}%
                    </div>
                    <div className='text-xs text-gray-600 dark:text-gray-400'>
                      Taxa Conversão
                    </div>
                  </div>

                  <div className='text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg col-span-2'>
                    <div className='text-xl font-bold text-orange-600'>
                      R$ {stats.valorTotal.toLocaleString('pt-BR')}
                    </div>
                    <div className='text-xs text-gray-600 dark:text-gray-400'>
                      Valor Total Convertido
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

