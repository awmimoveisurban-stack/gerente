import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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

// ✅ IMPORTAÇÕES PADRONIZADAS
import {
  StandardPageLayout,
  StandardHeader,
  StandardMetricCard,
  StandardGrid,
  useStandardLayout,
  STANDARD_COLORS,
  LAYOUT_CONFIG,
  STANDARD_ANIMATIONS,
} from '@/components/layout/standard-layout';

export default function GerenteEquipe() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profiles, loading, createProfile, updateProfile, deleteProfile, toggleProfileStatus, refetch } = useProfiles();
  
  // ✅ USAR HOOK PADRONIZADO
  const { isRefreshing, handleRefresh } = useStandardLayout();
  
  // Estados
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

  // Filtrar membros baseado na busca
  const membrosFiltrados = useMemo(() => {
    if (!searchTerm) return membrosEquipe;
    return membrosEquipe.filter(membro => 
      membro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      membro.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      membro.cargo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [membrosEquipe, searchTerm]);

  const handleRefreshData = () => handleRefresh(refetch, toast);

  const handleAddMember = () => {
    setShowAddModal(true);
  };

  const handleEditMember = (profile: Profile) => {
    setSelectedProfile(profile);
    setShowEditModal(true);
  };

  const handleToggleStatus = async (profile: Profile) => {
    try {
      await toggleProfileStatus(profile.id);
      toast({
        title: '✅ Status atualizado',
        description: `Membro ${profile.ativo ? 'desativado' : 'ativado'} com sucesso`,
      });
    } catch (error) {
      toast({
        title: '❌ Erro ao atualizar status',
        description: 'Não foi possível alterar o status do membro',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMember = async (profile: Profile) => {
    if (window.confirm(`Tem certeza que deseja excluir ${profile.nome}?`)) {
      try {
        await deleteProfile(profile.id);
        toast({
          title: '✅ Membro excluído',
          description: `${profile.nome} foi removido da equipe`,
        });
      } catch (error) {
        toast({
          title: '❌ Erro ao excluir',
          description: 'Não foi possível excluir o membro',
          variant: 'destructive',
        });
      }
    }
  };

  // ✅ HEADER PADRONIZADO
  const headerActions = (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefreshData}
        disabled={isRefreshing}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        Atualizar
      </Button>
      <Button onClick={handleAddMember} size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Membro
      </Button>
    </>
  );

  const headerBadges = [
    {
      icon: <Users className="h-3 w-3" />,
      text: `${metrics.totalMembros} membros`,
    },
    {
      icon: <Target className="h-3 w-3" />,
      text: `${metrics.membrosAtivos} ativos`,
    },
    {
      icon: <TrendingUp className="h-3 w-3" />,
      text: `${metrics.taxaMediaConversao.toFixed(1)}% conversão`,
    },
  ];

  if (loading) {
    return (
      <StandardPageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Carregando equipe...</span>
          </div>
        </div>
      </StandardPageLayout>
    );
  }

  return (
    <ManagerRoute>
      <StandardPageLayout
        header={
          <StandardHeader
            title="Gestão de Equipe"
            description="👥 Gerencie sua equipe de corretores e acompanhe o desempenho"
            icon={<Building2 className="h-6 w-6 text-white" />}
            badges={headerBadges}
            actions={headerActions}
          />
        }
      >
        {/* ✅ MÉTRICAS DA EQUIPE PADRONIZADAS */}
        <StandardGrid columns="4">
          <StandardMetricCard
            title="Total de Membros"
            value={metrics.totalMembros}
            icon={<Users className="h-6 w-6 text-white" />}
            color={STANDARD_COLORS.info}
          />
          <StandardMetricCard
            title="Membros Ativos"
            value={metrics.membrosAtivos}
            icon={<Target className="h-6 w-6 text-white" />}
            color={STANDARD_COLORS.success}
          />
          <StandardMetricCard
            title="Total de Leads"
            value={metrics.totalLeads}
            icon={<BarChart3 className="h-6 w-6 text-white" />}
            color={STANDARD_COLORS.purple}
          />
          <StandardMetricCard
            title="Valor Vendido"
            value={`R$ ${metrics.valorTotalVendido.toLocaleString()}`}
            icon={<DollarSign className="h-6 w-6 text-white" />}
            color={STANDARD_COLORS.orange}
          />
        </StandardGrid>

        {/* ✅ BUSCA E FILTROS */}
        <motion.div
          initial={STANDARD_ANIMATIONS.pageInitial}
          animate={STANDARD_ANIMATIONS.pageAnimate}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-500" />
                Buscar Membros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, email ou cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ✅ TABELA DE MEMBROS */}
        <motion.div
          initial={STANDARD_ANIMATIONS.pageInitial}
          animate={STANDARD_ANIMATIONS.pageAnimate}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Membros da Equipe
              </CardTitle>
              <CardDescription>
                Gerencie os membros da sua equipe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Membro</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Data Entrada</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {membrosFiltrados.map((membro) => (
                      <TableRow key={membro.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {membro.nome.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold">{membro.nome}</div>
                              <div className="text-sm text-gray-500">{membro.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {membro.email}
                            </div>
                            {membro.telefone && (
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-3 w-3" />
                                {membro.telefone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {membro.cargo}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={membro.status === 'ativo' ? 'default' : 'secondary'}
                            className={membro.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                          >
                            {membro.status === 'ativo' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="font-medium">{membro.performance.leadsTotal}</span> leads
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">{membro.performance.vendasFechadas}</span> vendas
                            </div>
                            <div className="text-sm text-gray-500">
                              {membro.performance.taxaConversao.toFixed(1)}% conversão
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">
                            {new Date(membro.dataEntrada).toLocaleDateString('pt-BR')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditMember(profiles.find(p => p.id === membro.id)!)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(profiles.find(p => p.id === membro.id)!)}>
                                <UserX className="h-4 w-4 mr-2" />
                                {membro.status === 'ativo' ? 'Desativar' : 'Ativar'}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteMember(profiles.find(p => p.id === membro.id)!)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ✅ MODAIS */}
        <AddMemberModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />

        {selectedProfile && (
          <EditMemberModal
            profile={selectedProfile}
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
          />
        )}
      </StandardPageLayout>
    </ManagerRoute>
  );
}
