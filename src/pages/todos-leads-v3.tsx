import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ManagerRoute } from '@/components/layout/auth-middleware';
import { useEvolutionPollingDireto } from '@/hooks/use-evolution-polling-direto';
import { useAutoAssignLeads } from '@/hooks/use-auto-assign-leads';
import { useCorretores } from '@/hooks/use-corretores';
import { LeadsNaoDirecionados } from '@/components/crm/leads-nao-direcionados';
import { MonitorLigacoes } from '@/components/crm/monitor-ligacoes';
import { LeadDetailsModal } from '@/components/crm/lead-details-modal';
import { WhatsAppMessageModal } from '@/components/crm/whatsapp-message-modal';
import { EditLeadModal } from '@/components/crm/edit-lead-modal';
import { LeadCardCompact } from '@/components/crm/lead-card-compact';
import { AddLeadModal } from '@/components/crm/add-lead-modal';
import { usePagination } from '@/hooks/use-pagination';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLeads, type Lead } from '@/hooks/use-leads';
import { useTodosLeadsMetrics } from '@/hooks/use-todos-leads-metrics';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  TrendingUp,
  Target,
  Star,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Send,
  Building2,
  Award,
  Activity,
  DollarSign,
  AlertTriangle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Plus,
  BarChart3,
  Zap,
  Clock,
  MapPin,
  Flame,
  TrendingDown,
  ArrowUpDown,
  Settings,
} from 'lucide-react';

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

export default function TodosLeadsV3() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // ✅ USAR HOOK PADRONIZADO
  const { isRefreshing, handleRefresh } = useStandardLayout();

  // Estados dos modais
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showLeadDetailsModal, setShowLeadDetailsModal] = useState(false);
  const [showEditLeadModal, setShowEditLeadModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Estados de filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [origemFilter, setOrigemFilter] = useState('all');
  const [corretorFilter, setCorretorFilter] = useState('all');

  // Hooks
  const { leads, loading, refetch } = useLeads();
  const { metrics } = useTodosLeadsMetrics(leads);
  const { corretores } = useCorretores();
  const { currentPage, totalPages, paginatedData, goToPage } = usePagination(leads, 10);

  // ✅ FILTRAR LEADS
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = !searchTerm || 
        lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.telefone?.includes(searchTerm) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesOrigem = origemFilter === 'all' || lead.origem === origemFilter;
      const matchesCorretor = corretorFilter === 'all' || lead.corretor === corretorFilter;

      return matchesSearch && matchesStatus && matchesOrigem && matchesCorretor;
    });
  }, [leads, searchTerm, statusFilter, origemFilter, corretorFilter]);

  const handleRefreshData = () => handleRefresh(refetch, toast);

  const handleAddLead = () => {
    setShowAddLeadModal(true);
  };

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowLeadDetailsModal(true);
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowEditLeadModal(true);
  };

  const handleWhatsAppLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowWhatsAppModal(true);
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
      <Button onClick={handleAddLead} size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Novo Lead
      </Button>
    </>
  );

  const headerBadges = [
    {
      icon: <Users className="h-3 w-3" />,
      text: `${filteredLeads.length} leads filtrados`,
    },
    {
      icon: <Target className="h-3 w-3" />,
      text: `${metrics?.taxaConversao?.toFixed(1) || '0.0'}% conversão`,
    },
    {
      icon: <DollarSign className="h-3 w-3" />,
      text: `R$ ${metrics?.valorTotal?.toLocaleString() || '0'}`,
    },
  ];

  if (loading) {
    return (
      <StandardPageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Carregando todos os leads...</span>
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
            title="Todos os Leads"
            description="🎯 Gestão completa de todos os leads da equipe"
            icon={<Users className="h-6 w-6 text-white" />}
            badges={headerBadges}
            actions={headerActions}
          />
        }
      >
        {/* ✅ MÉTRICAS GLOBAIS PADRONIZADAS */}
        <StandardGrid columns="4">
          <StandardMetricCard
            title="Total de Leads"
            value={metrics?.totalLeads || 0}
            icon={<Users className="h-6 w-6 text-white" />}
            color={STANDARD_COLORS.info}
          />
          <StandardMetricCard
            title="Leads Ativos"
            value={metrics?.leadsAtivos || 0}
            icon={<Target className="h-6 w-6 text-white" />}
            color={STANDARD_COLORS.success}
          />
          <StandardMetricCard
            title="Taxa de Conversão"
            value={`${metrics?.taxaConversao?.toFixed(1) || '0.0'}%`}
            icon={<TrendingUp className="h-6 w-6 text-white" />}
            color={STANDARD_COLORS.purple}
          />
          <StandardMetricCard
            title="Valor Total"
            value={`R$ ${metrics?.valorTotal?.toLocaleString() || '0'}`}
            icon={<DollarSign className="h-6 w-6 text-white" />}
            color={STANDARD_COLORS.orange}
          />
        </StandardGrid>

        {/* ✅ COMPONENTES ESPECÍFICOS PARA GERENTE */}
        <motion.div
          initial={STANDARD_ANIMATIONS.pageInitial}
          animate={STANDARD_ANIMATIONS.pageAnimate}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <LeadsNaoDirecionados />
          <MonitorLigacoes />
        </motion.div>

        {/* ✅ FILTROS E BUSCA */}
        <motion.div
          initial={STANDARD_ANIMATIONS.pageInitial}
          animate={STANDARD_ANIMATIONS.pageAnimate}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-500" />
                Filtros e Busca
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar por nome, telefone ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="novo">Novo</SelectItem>
                    <SelectItem value="contato">Em Contato</SelectItem>
                    <SelectItem value="proposta">Proposta Enviada</SelectItem>
                    <SelectItem value="negociacao">Em Negociação</SelectItem>
                    <SelectItem value="fechado">Fechado</SelectItem>
                    <SelectItem value="perdido">Perdido</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={origemFilter} onValueChange={setOrigemFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Origem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Origens</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="site">Site</SelectItem>
                    <SelectItem value="indicacao">Indicação</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={corretorFilter} onValueChange={setCorretorFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Corretor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Corretores</SelectItem>
                    {corretores.map((corretor) => (
                      <SelectItem key={corretor.id} value={corretor.email}>
                        {corretor.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ✅ TABELA DE LEADS */}
        <motion.div
          initial={STANDARD_ANIMATIONS.pageInitial}
          animate={STANDARD_ANIMATIONS.pageAnimate}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Todos os Leads
              </CardTitle>
              <CardDescription>
                Gerencie todos os leads da equipe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Origem</TableHead>
                      <TableHead>Corretor</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Última Interação</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((lead) => (
                      <TableRow key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{lead.nome}</div>
                            {lead.email && (
                              <div className="text-sm text-gray-500">{lead.email}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {lead.telefone && (
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-3 w-3" />
                                {lead.telefone}
                              </div>
                            )}
                            {lead.email && (
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="h-3 w-3" />
                                {lead.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{lead.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{lead.origem}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {lead.corretor?.charAt(0).toUpperCase() || 'N'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{lead.corretor || 'Não atribuído'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-semibold">{lead.score_ia || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">
                            {lead.ultima_interacao ? 
                              new Date(lead.ultima_interacao).toLocaleDateString('pt-BR') : 
                              'Nunca'
                            }
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewLead(lead)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleWhatsAppLead(lead)}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditLead(lead)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* ✅ PAGINAÇÃO */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => goToPage(currentPage - 1)}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => goToPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => goToPage(currentPage + 1)}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ✅ MODAIS */}
        <AddLeadModal
          open={showAddLeadModal}
          onOpenChange={setShowAddLeadModal}
        />

        {selectedLead && (
          <>
            <LeadDetailsModal
              lead={selectedLead}
              isOpen={showLeadDetailsModal}
              onClose={() => setShowLeadDetailsModal(false)}
            />

            <EditLeadModal
              lead={selectedLead}
              isOpen={showEditLeadModal}
              onClose={() => setShowEditLeadModal(false)}
            />

            <WhatsAppMessageModal
              lead={selectedLead}
              isOpen={showWhatsAppModal}
              onClose={() => setShowWhatsAppModal(false)}
            />
          </>
        )}
      </StandardPageLayout>
    </ManagerRoute>
  );
}
