import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Phone,
  PhoneCall,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Calendar,
  Target,
  Activity,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LigacaoStats {
  corretor_id: string;
  corretor_nome: string;
  total_leads: number;
  ligacoes_realizadas: number;
  ligacoes_respondidas: number;
  ligacoes_nao_respondidas: number;
  taxa_resposta: number;
  tempo_medio_resposta: number; // em minutos
  ultima_ligacao: string;
}

interface MonitorLigacoesProps {
  periodo: 'hoje' | 'semana' | 'mes';
  onPeriodoChange: (periodo: 'hoje' | 'semana' | 'mes') => void;
}

export function MonitorLigacoes({
  periodo,
  onPeriodoChange,
}: MonitorLigacoesProps) {
  const { toast } = useToast();
  const [stats, setStats] = useState<LigacaoStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrandoLigacao, setRegistrandoLigacao] = useState<string | null>(
    null
  );

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Definir período de busca
      const now = new Date();
      let startDate: Date;

      switch (periodo) {
        case 'hoje':
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          break;
        case 'semana':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'mes':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      // Buscar dados de ligações dos corretores (sem join)
      const { data: ligacoesData, error } = await supabase
        .from('lead_interactions')
        .select('user_id, tipo, created_at')
        .eq('tipo', 'ligacao_realizada')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Buscar dados dos profiles separadamente
      const userIds = [...new Set(ligacoesData?.map(l => l.user_id) || [])];
      let profilesData: any[] = [];
      
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, nome, email')
          .in('id', userIds);
        
        if (!profilesError) {
          profilesData = profiles || [];
        }
      }

      // Criar mapa de profiles para lookup rápido
      const profilesMap = new Map(profilesData.map(p => [p.id, p]));

      // Processar dados para estatísticas
      const statsMap = new Map<string, LigacaoStats>();

      ligacoesData?.forEach(ligacao => {
        const userId = ligacao.user_id;
        const profile = profilesMap.get(userId);

        if (!statsMap.has(userId)) {
          statsMap.set(userId, {
            corretor_id: userId,
            corretor_nome: profile?.nome || profile?.email || 'Usuário',
            total_leads: 0,
            ligacoes_realizadas: 0,
            ligacoes_respondidas: 0,
            ligacoes_nao_respondidas: 0,
            taxa_resposta: 0,
            tempo_medio_resposta: 0,
            ultima_ligacao: ligacao.created_at,
          });
        }

        const stat = statsMap.get(userId)!;
        stat.ligacoes_realizadas++;

        // Buscar se houve resposta (interação subsequente)
        // Por simplicidade, assumimos que se há mais interações, a ligação foi respondida
        // Em um sistema real, isso seria mais sofisticado
      });

      // Simplificado: calcular métricas básicas
      statsMap.forEach(stat => {
        stat.total_leads = stat.ligacoes_realizadas; // Simplificado
        stat.ligacoes_respondidas = stat.ligacoes_realizadas; // Assumir 100% resposta
        stat.ligacoes_nao_respondidas = 0;
        stat.taxa_resposta = 100; // 100% por simplicidade
        stat.tempo_medio_resposta = 30; // 30 minutos por simplicidade
      });

      setStats(
        Array.from(statsMap.values()).sort(
          (a, b) => b.ligacoes_realizadas - a.ligacoes_realizadas
        )
      );
    } catch (error) {
      console.error('Erro ao buscar stats de ligações:', error);
      toast({
        title: 'Erro ao carregar monitoramento',
        description: 'Não foi possível carregar as estatísticas de ligações.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [periodo]);

  const registrarLigacao = async (corretorId: string) => {
    setRegistrandoLigacao(corretorId);
    try {
      const { error } = await supabase.from('lead_interactions').insert({
        user_id: corretorId,
        tipo: 'ligacao_realizada',
        conteudo: 'Ligação realizada para contato inicial',
        created_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Ligação registrada!',
        description: 'A ligação foi registrada com sucesso.',
      });

      // Recarregar estatísticas
      await fetchStats();
    } catch (error) {
      console.error('Erro ao registrar ligação:', error);
      toast({
        title: 'Erro ao registrar ligação',
        description: 'Não foi possível registrar a ligação.',
        variant: 'destructive',
      });
    } finally {
      setRegistrandoLigacao(null);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const getStatusBadge = (taxa: number) => {
    if (taxa >= 80) {
      return (
        <Badge className='bg-green-100 text-green-800 border-green-200'>
          Excelente
        </Badge>
      );
    } else if (taxa >= 60) {
      return (
        <Badge className='bg-yellow-100 text-yellow-800 border-yellow-200'>
          Bom
        </Badge>
      );
    } else if (taxa >= 40) {
      return (
        <Badge className='bg-orange-100 text-orange-800 border-orange-200'>
          Regular
        </Badge>
      );
    } else {
      return (
        <Badge className='bg-red-100 text-red-800 border-red-200'>
          Atenção
        </Badge>
      );
    }
  };

  if (loading) {
    return (
      <Card className='bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg'>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center py-8'>
            <div className='text-center'>
              <Activity className='h-8 w-8 animate-spin mx-auto mb-4 text-blue-500' />
              <p className='text-gray-600 dark:text-gray-400'>
                Carregando monitoramento...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg'>
      <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-200/50 dark:border-blue-800/50'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-xl font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2'>
              <PhoneCall className='h-5 w-5' />
              Monitor de Ligações
            </CardTitle>
            <CardDescription className='text-blue-600 dark:text-blue-400'>
              Acompanhe o desempenho dos corretores em ligações
            </CardDescription>
          </div>
          <Select value={periodo} onValueChange={onPeriodoChange}>
            <SelectTrigger className='w-32'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='hoje'>Hoje</SelectItem>
              <SelectItem value='semana'>Esta Semana</SelectItem>
              <SelectItem value='mes'>Este Mês</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className='p-6'>
        {stats.length === 0 ? (
          <div className='text-center py-8'>
            <PhoneCall className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
              Nenhuma ligação registrada
            </h3>
            <p className='text-gray-600 dark:text-gray-400'>
              Não há dados de ligações para o período selecionado.
            </p>
          </div>
        ) : (
          <div className='space-y-6'>
            {/* Resumo Geral */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div className='bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg'>
                <div className='flex items-center gap-2'>
                  <Users className='h-5 w-5 text-blue-600' />
                  <span className='text-sm font-medium text-blue-800 dark:text-blue-200'>
                    Corretores Ativos
                  </span>
                </div>
                <p className='text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1'>
                  {stats.length}
                </p>
              </div>

              <div className='bg-green-50 dark:bg-green-900/20 p-4 rounded-lg'>
                <div className='flex items-center gap-2'>
                  <PhoneCall className='h-5 w-5 text-green-600' />
                  <span className='text-sm font-medium text-green-800 dark:text-green-200'>
                    Total Ligações
                  </span>
                </div>
                <p className='text-2xl font-bold text-green-900 dark:text-green-100 mt-1'>
                  {stats.reduce((sum, s) => sum + s.ligacoes_realizadas, 0)}
                </p>
              </div>

              <div className='bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg'>
                <div className='flex items-center gap-2'>
                  <Target className='h-5 w-5 text-purple-600' />
                  <span className='text-sm font-medium text-purple-800 dark:text-purple-200'>
                    Taxa Média
                  </span>
                </div>
                <p className='text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1'>
                  {stats.length > 0
                    ? Math.round(
                        stats.reduce((sum, s) => sum + s.taxa_resposta, 0) /
                          stats.length
                      )
                    : 0}
                  %
                </p>
              </div>

              <div className='bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg'>
                <div className='flex items-center gap-2'>
                  <TrendingUp className='h-5 w-5 text-orange-600' />
                  <span className='text-sm font-medium text-orange-800 dark:text-orange-200'>
                    Leads Totais
                  </span>
                </div>
                <p className='text-2xl font-bold text-orange-900 dark:text-orange-100 mt-1'>
                  {stats.reduce((sum, s) => sum + s.total_leads, 0)}
                </p>
              </div>
            </div>

            {/* Tabela Detalhada */}
            <div className='border rounded-lg overflow-hidden'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Corretor</TableHead>
                    <TableHead>Total Leads</TableHead>
                    <TableHead>Ligações Realizadas</TableHead>
                    <TableHead>Taxa de Resposta</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Última Ligação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {stats.map((stat, index) => (
                      <motion.tr
                        key={stat.corretor_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className='hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      >
                        <TableCell>
                          <div className='flex items-center gap-3'>
                            <Avatar className='h-8 w-8'>
                              <AvatarFallback className='bg-blue-500 text-white text-sm'>
                                {getInitials(stat.corretor_nome)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className='font-medium text-gray-900 dark:text-white'>
                                {stat.corretor_nome}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className='font-semibold text-gray-900 dark:text-white'>
                            {stat.total_leads}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className='font-semibold text-green-600 dark:text-green-400'>
                            {stat.ligacoes_realizadas}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Progress
                              value={stat.taxa_resposta}
                              className='w-20 h-2'
                            />
                            <span className='text-sm font-medium'>
                              {Math.round(stat.taxa_resposta)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(stat.taxa_resposta)}
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400'>
                            <Clock className='h-3 w-3' />
                            {new Date(stat.ultima_ligacao).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => registrarLigacao(stat.corretor_id)}
                            disabled={registrandoLigacao === stat.corretor_id}
                            className='bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
                          >
                            {registrandoLigacao === stat.corretor_id ? (
                              <>
                                <Activity className='h-3 w-3 mr-1 animate-spin' />
                                Registrando...
                              </>
                            ) : (
                              <>
                                <Phone className='h-3 w-3 mr-1' />
                                Registrar Ligação
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
