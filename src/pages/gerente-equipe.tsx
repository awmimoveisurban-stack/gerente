import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { ManagerRoute } from "@/components/layout/auth-middleware";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useProfiles, type Profile } from "@/hooks/use-profiles";
import { AddMemberModal } from "@/components/crm/add-member-modal";
import { EditMemberModal } from "@/components/crm/edit-member-modal";
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Calendar,
  TrendingUp,
  Target,
  Award,
  UserPlus,
  Settings,
  MoreHorizontal,
  Building2,
  Star,
  Activity,
  DollarSign,
  BarChart3,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  UserX
} from "lucide-react";

export default function GerenteEquipe() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profiles, loading, createProfile, updateProfile, deleteProfile, toggleProfileStatus, refetch } = useProfiles();
  
  // Estados - TODOS os hooks devem estar no topo
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  
  // Usar profiles do Supabase em vez de dados mock
  const membrosEquipe = useMemo(() => profiles
    .filter(profile => profile && profile.id && profile.nome && profile.email)
    .map(profile => ({
      id: profile.id,
      nome: profile.nome || 'Sem nome',
      email: profile.email || 'Sem email',
      cargo: profile.cargo || 'corretor',
      telefone: profile.telefone || undefined,
      dataEntrada: profile.created_at || new Date().toISOString(),
      status: profile.ativo ? 'ativo' as const : 'inativo' as const,
      performance: profile.performance || {
        leadsTotal: 0,
        vendasFechadas: 0,
        taxaConversao: 0,
        valorVendido: 0
      }
    })), [profiles]);

  // Métricas calculadas - useMemo para otimização
  const metrics = useMemo(() => {
    const totalMembros = membrosEquipe.length;
    const membrosAtivos = membrosEquipe.filter(m => m.status === 'ativo').length;
    const totalLeads = membrosEquipe.reduce((sum, m) => sum + m.performance.leadsTotal, 0);
    const totalVendas = membrosEquipe.reduce((sum, m) => sum + m.performance.vendasFechadas, 0);
    const valorTotalVendido = membrosEquipe.reduce((sum, m) => sum + m.performance.valorVendido, 0);
    const taxaMediaConversao = totalLeads > 0 ? (totalVendas / totalLeads) * 100 : 0;
    
    return {
      totalMembros,
      membrosAtivos,
      totalLeads,
      totalVendas,
      valorTotalVendido,
      taxaMediaConversao
    };
  }, [membrosEquipe]);

  // Handlers para ações - useCallback para otimização
  const handleViewReports = useCallback(() => {
    navigate('/gerente-relatorios');
    toast({
      title: "Navegando para Relatórios",
      description: "Redirecionando para a página de relatórios",
    });
  }, [navigate, toast]);

  const handleRefresh = useCallback(async () => {
    await refetch();
    toast({
      title: "Dados Atualizados",
      description: "As informações da equipe foram atualizadas",
    });
  }, [refetch, toast]);

  const handleEditMember = useCallback((member: any) => {
    const profile = profiles.find(p => p.id === member.id);
    if (profile) {
      setSelectedProfile(profile);
      setShowEditModal(true);
    }
  }, [profiles]);

  const handleDeleteMember = useCallback(async (member: any) => {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja remover ${member.nome} da equipe?\n\nEsta ação não pode ser desfeita.`
    );
    
    if (!confirmDelete) return;

    try {
      const profile = profiles.find(p => p.id === member.id);
      if (profile) {
        await deleteProfile(profile.user_id);
      }
    } catch (error) {
      console.error('Erro ao deletar membro:', error);
    }
  }, [profiles, deleteProfile]);

  const handleToggleStatus = useCallback(async (member: any) => {
    try {
      const profile = profiles.find(p => p.id === member.id);
      if (profile) {
        await toggleProfileStatus(profile.id);
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  }, [profiles, toggleProfileStatus]);

  const handleContactMember = useCallback((member: any) => {
    toast({
      title: "Funcionalidade em Desenvolvimento",
      description: `Contato com ${member.nome} será implementado em breve`,
    });
  }, [toast]);

  // Membros filtrados - useMemo para otimização
  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return membrosEquipe;
    
    const term = searchTerm.toLowerCase();
    return membrosEquipe.filter(member =>
      (member.nome && member.nome.toLowerCase().includes(term)) ||
      (member.email && member.email.toLowerCase().includes(term)) ||
      (member.telefone && member.telefone.includes(term))
    );
  }, [membrosEquipe, searchTerm]);

  // Função para obter cor do cargo
  const getCargoColor = useCallback((cargo: string) => {
    return cargo === 'gerente' 
      ? 'bg-purple-100 text-purple-800 border-purple-200' 
      : 'bg-blue-100 text-blue-800 border-blue-200';
  }, []);

  // Função para obter cor do status
  const getStatusColor = useCallback((status: string) => {
    return status === 'ativo'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  }, []);

  // Funções de navegação
  const handleViewTodosLeads = useCallback(() => {
    navigate('/todos-leads');
  }, [navigate]);

  const handleViewRelatorios = useCallback(() => {
    navigate('/relatorios');
  }, [navigate]);

  const handleAddMember = useCallback(() => {
    setShowAddModal(true);
  }, []);

  // Loading state - DEPOIS de todos os hooks
  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6 p-4 md:p-6">
          <div className="animate-pulse">
            <Card className="bg-white/90 dark:bg-gray-800/90">
              <CardHeader>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <ManagerRoute>
      <AppLayout>
        <div className="">
          {/* Sticky Header */}
          <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="px-0 py-4">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-500 rounded-xl">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                      Gestão de Equipe
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                      👥 Gerencie sua equipe de corretores e acompanhe o desempenho
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={handleViewTodosLeads}
                    className="flex-1 lg:flex-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-950/20"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Todos os Leads</span>
                    <span className="sm:hidden">Leads</span>
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={handleViewRelatorios}
                    className="flex-1 lg:flex-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-purple-50 dark:hover:bg-purple-950/20"
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Relatórios</span>
                    <span className="sm:hidden">Reports</span>
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleAddMember}
                    className="flex-1 lg:flex-none bg-violet-600 hover:bg-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Adicionar Membro</span>
                    <span className="sm:hidden">Adicionar</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Barra de Pesquisa e Ações */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Barra de Pesquisa */}
              <div className="relative flex-1 lg:flex-none lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="🔍 Buscar membros da equipe..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700"
                  aria-label="Buscar membros da equipe"
                />
              </div>
              
              {/* Botões de Ação */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefresh}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-950/20"
                  aria-label="Atualizar dados"
                  title="Atualizar dados"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleViewReports} 
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-purple-50 dark:hover:bg-purple-950/20"
                  aria-label="Ver relatórios"
                  title="Ver relatórios"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Relatórios
                </Button>
                
                <Button 
                  onClick={handleAddMember}
                  className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  aria-label="Adicionar novo membro"
                  title="Adicionar novo membro"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Novo Membro
                </Button>
              </div>
            </div>
          </div>

          {/* Métricas Principais */}
          <div className="py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {/* Total de Membros */}
              <div className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950/30 dark:to-violet-900/30 p-6 rounded-2xl border border-violet-200/50 dark:border-violet-800/50 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">👥 Total de Membros</p>
                    <p className="text-3xl font-bold text-violet-900 dark:text-violet-100 mt-1">{metrics.totalMembros}</p>
                    <p className="text-xs text-violet-600 dark:text-violet-400 mt-2 flex items-center gap-1">
                      <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                      {metrics.membrosAtivos} ativos
                    </p>
                  </div>
                  <div className="p-3 bg-violet-500 rounded-xl">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Total de Leads */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">🎯 Total de Leads</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">{metrics.totalLeads}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Média: {metrics.totalMembros > 0 ? Math.round(metrics.totalLeads / metrics.totalMembros) : 0} por membro
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-xl">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Taxa de Conversão */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30 p-6 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/50 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">📈 Taxa de Conversão</p>
                    <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">{metrics.taxaMediaConversao.toFixed(1)}%</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      {metrics.totalVendas} vendas fechadas
                    </p>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(metrics.taxaMediaConversao, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-500 rounded-xl">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Valor Vendido */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30 p-6 rounded-2xl border border-amber-200/50 dark:border-amber-800/50 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">💰 Valor Vendido</p>
                    <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 mt-1">
                      R$ {(metrics.valorTotalVendido / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      Ticket médio: R$ {metrics.totalVendas > 0 ? (metrics.valorTotalVendido / metrics.totalVendas).toLocaleString('pt-BR') : '0'}
                    </p>
                  </div>
                  <div className="p-3 bg-amber-500 rounded-xl">
                    <DollarSign className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabela da Equipe */}
          <div className="py-6">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-b border-violet-200/50 dark:border-violet-800/50">
                <div>
                  <CardTitle className="text-xl font-bold text-violet-800 dark:text-violet-200 flex items-center gap-2">
                    <div className="p-1.5 bg-violet-500 rounded-lg">
                      <Building2 className="h-4 w-4 text-white" />
                    </div>
                    Membros da Equipe ({filteredMembers.length})
                  </CardTitle>
                  <CardDescription className="text-violet-600 dark:text-violet-400 mt-1">
                    👥 Lista completa dos membros da equipe com métricas de performance
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200 dark:border-gray-700">
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">👤 Membro</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">📧 Contato</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">💼 Cargo</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">📊 Performance</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">💰 Vendas</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">📅 Entrada</TableHead>
                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">📈 Status</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">⚡ Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMembers.map((member) => (
                        <TableRow key={member.id} className="border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-gradient-to-br from-violet-400 to-violet-600 text-white font-bold">
                                  {member.nome ? member.nome.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white">{member.nome}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{member.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-blue-500" />
                                <span className="text-gray-700 dark:text-gray-300 text-sm">{member.telefone || "Sem telefone"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3 text-purple-500" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">Email disponível</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={getCargoColor(member.cargo)}
                            >
                              {member.cargo === 'gerente' ? '👨‍💼 Gerente' : '👨‍💼 Corretor'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Leads:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{member.performance.leadsTotal}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Conversão:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{member.performance.taxaConversao.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-emerald-500 h-2 rounded-full" 
                                  style={{ width: `${Math.min(member.performance.taxaConversao, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900 dark:text-white text-sm">
                                R$ {(member.performance.valorVendido / 1000).toFixed(0)}K
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {member.performance.vendasFechadas} vendas
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {member.dataEntrada ? new Date(member.dataEntrada).toLocaleDateString('pt-BR') : 'Data não disponível'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={getStatusColor(member.status)}
                            >
                              {member.status === 'ativo' ? '✅ Ativo' : '❌ Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="hover:bg-blue-50 dark:hover:bg-blue-950/20" 
                                title="Ver detalhes" 
                                onClick={() => handleContactMember(member)}
                                aria-label={`Ver detalhes de ${member.nome}`}
                              >
                                <Eye className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="hover:bg-green-50 dark:hover:bg-green-950/20" 
                                title="Contatar" 
                                onClick={() => handleContactMember(member)}
                                aria-label={`Contatar ${member.nome}`}
                              >
                                <Phone className="h-4 w-4 text-green-500" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                                    aria-label={`Mais opções para ${member.nome}`}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
                                  <DropdownMenuItem onClick={() => handleEditMember(member)} className="hover:bg-blue-50 dark:hover:bg-blue-950/20">
                                    <Settings className="mr-2 h-4 w-4 text-blue-500" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleContactMember(member)} className="hover:bg-green-50 dark:hover:bg-green-950/20">
                                    <Mail className="mr-2 h-4 w-4 text-green-500" />
                                    Enviar Email
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleContactMember(member)} className="hover:bg-purple-50 dark:hover:bg-purple-950/20">
                                    <Calendar className="mr-2 h-4 w-4 text-purple-500" />
                                    Agendar Reunião
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleToggleStatus(member)} className="hover:bg-amber-50 dark:hover:bg-amber-950/20">
                                    <UserX className="mr-2 h-4 w-4 text-amber-500" />
                                    {member.status === 'ativo' ? 'Desativar' : 'Ativar'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteMember(member)} className="hover:bg-red-50 dark:hover:bg-red-950/20">
                                    <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                                    <span className="text-red-600 dark:text-red-400">Excluir</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Modais */}
          <AddMemberModal 
            open={showAddModal}
            onOpenChange={setShowAddModal}
          />
          
          <EditMemberModal 
            profile={selectedProfile}
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedProfile(null);
            }}
          />
        </div>
      </AppLayout>
    </ManagerRoute>
  );
}