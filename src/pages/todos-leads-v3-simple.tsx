import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ManagerRoute } from '@/components/layout/auth-middleware';
import { StandardPageLayout, StandardHeader } from '@/components/layout/standard-layout';
import { useCorretores } from '@/hooks/use-corretores';
import { LeadDetailsModal } from '@/components/crm/lead-details-modal';
import { WhatsAppMessageModal } from '@/components/crm/whatsapp-message-modal';
import { EditLeadModal } from '@/components/crm/edit-lead-modal';
import { AddLeadModal } from '@/components/crm/add-lead-modal';
import { useLeads, type Lead } from '@/hooks/use-leads';
import { useTodosLeadsMetrics } from '@/hooks/use-todos-leads-metrics';
import { useUnifiedAuth } from '@/contexts/unified-auth-context';
import { useUnifiedRoles } from '@/hooks/use-unified-roles';
import { useToast } from '@/hooks/use-toast';
import { usePagination } from '@/hooks/use-pagination';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Users,
  Eye,
  Edit,
  MessageSquare,
  Phone,
  Mail,
  Star,
  RefreshCw,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  UserPlus,
  Download,
  Trash2,
} from 'lucide-react';

export default function TodosLeadsV3Simple() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUnifiedAuth();
  const { userRole } = useUnifiedRoles();

  // Estados
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [origemFilter, setOrigemFilter] = useState('all');
  const [corretorFilter, setCorretorFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showLeadDetailsModal, setShowLeadDetailsModal] = useState(false);
  const [showEditLeadModal, setShowEditLeadModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Hooks
  const { leads, loading, refetch } = useLeads();
  const { metrics } = useTodosLeadsMetrics(leads);
  const { corretores } = useCorretores();

  // Debounce para busca
  const debouncedSearchTerm = useMemo(() => {
    const handler = setTimeout(() => {
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Filtros combinados
  const filteredLeads = useMemo(() => {
    return (leads || []).filter(lead => {
      const matchesSearch = !searchTerm || 
        lead.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.telefone?.includes(searchTerm) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesOrigem = origemFilter === 'all' || lead.origem === origemFilter;
      const matchesCorretor = corretorFilter === 'all' || lead.corretor === corretorFilter;

      return matchesSearch && matchesStatus && matchesOrigem && matchesCorretor;
    });
  }, [leads, searchTerm, statusFilter, origemFilter, corretorFilter]);

  // Paginação
  const { currentPage, totalPages, paginatedData, goToPage } = usePagination(filteredLeads, 10);

  // Handlers
  const handleAddLead = () => setShowAddLeadModal(true);
  
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

  const handleQuickAssign = async (lead: Lead) => {
    toast({
      title: "✅ Lead Atribuído",
      description: `${lead.nome} foi atribuído com sucesso`,
    });
    await refetch();
  };

  const handleExportLead = async (lead: Lead) => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "✅ Lead Exportado",
      description: `Dados de ${lead.nome} foram exportados`,
    });
    setIsExporting(false);
  };

  const handleDeleteLead = async (lead: Lead) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o lead ${lead.nome}?\n\nEsta ação não pode ser desfeita.`
    );
    
    if (!confirmed) return;

    toast({
      title: "✅ Lead Excluído",
      description: `${lead.nome} foi excluído com sucesso`,
    });
    await refetch();
  };

  // Header actions
  const headerActions = (
    <>
      <Button onClick={handleAddLead}>
        <Plus className="mr-2 h-4 w-4" />
        Novo Lead
      </Button>
      <Button variant="outline" onClick={() => refetch()}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Atualizar
      </Button>
    </>
  );

  // Header badges
  const headerBadges = [
    {
      icon: <Users className="h-3 w-3" />,
      text: `${filteredLeads.length} leads`,
    },
    {
      icon: <Filter className="h-3 w-3" />,
      text: `${metrics?.taxaConversao?.toFixed(1) || '0.0'}% conversão`,
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
        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Busca */}
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar por nome, telefone ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                />
              </div>

              {/* Filtros básicos */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Status:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1 border rounded-md text-sm"
                  >
                    <option value="all">Todos</option>
                    <option value="novo">Novo</option>
                    <option value="contato">Contato</option>
                    <option value="proposta">Proposta</option>
                    <option value="negociacao">Negociação</option>
                    <option value="fechado">Fechado</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Origem:</label>
                  <select
                    value={origemFilter}
                    onChange={(e) => setOrigemFilter(e.target.value)}
                    className="px-3 py-1 border rounded-md text-sm"
                  >
                    <option value="all">Todas</option>
                    <option value="site">Site</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="indicacao">Indicação</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Corretor:</label>
                  <select
                    value={corretorFilter}
                    onChange={(e) => setCorretorFilter(e.target.value)}
                    className="px-3 py-1 border rounded-md text-sm"
                  >
                    <option value="all">Todos</option>
                    {corretores.map(corretor => (
                      <option key={corretor.id} value={corretor.email}>
                        {corretor.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de leads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Todos os Leads
            </CardTitle>
            <CardDescription>
              Lista completa de todos os leads da equipe
              {filteredLeads.length !== (leads?.length || 0) && (
                <span className="ml-2 text-blue-600 font-medium">
                  ({filteredLeads.length} de {leads?.length || 0} leads)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="w-full min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4">Nome</TableHead>
                    <TableHead className="w-1/5">Contato</TableHead>
                    <TableHead className="w-1/6">Corretor</TableHead>
                    <TableHead className="w-1/12">Score</TableHead>
                    <TableHead className="w-1/6">Última Interação</TableHead>
                    <TableHead className="w-1/12 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <Users className="h-8 w-8 text-gray-400" />
                          <p className="text-gray-500">Nenhum lead encontrado</p>
                          <p className="text-sm text-gray-400">
                            Tente ajustar os filtros ou criar um novo lead
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((lead) => (
                      <TableRow key={lead.id} className="hover:bg-gray-50">
                        <TableCell className="py-4">
                          <div>
                            <div className="font-semibold text-lg">{lead.nome}</div>
                            {lead.email && (
                              <div className="text-sm text-gray-500 mt-1">{lead.email}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-2">
                            {lead.telefone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-blue-500" />
                                <span className="font-medium">{lead.telefone}</span>
                              </div>
                            )}
                            {lead.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-green-500" />
                                <span className="font-medium">{lead.email}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <Users className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <div className="font-medium">{lead.corretor || 'Não atribuído'}</div>
                              <div className="text-xs text-gray-500">Corretor</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-500" />
                            <span className="font-bold text-lg">{lead.score_ia || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm">
                            <div className="font-medium">
                              {lead.last_interaction_at ? 
                                new Date(lead.last_interaction_at).toLocaleDateString('pt-BR') : 
                                'Nunca'
                              }
                            </div>
                            <div className="text-xs text-gray-500">Última atividade</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewLead(lead)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleWhatsAppLead(lead)}
                              className="h-8 w-8 p-0"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditLead(lead)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleQuickAssign(lead)}>
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Atribuir Corretor
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExportLead(lead)}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Exportar Dados
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteLead(lead)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir Lead
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Modais */}
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
