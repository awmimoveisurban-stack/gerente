import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CorretorRoute } from '@/components/layout/auth-middleware';
import { useSearch } from '@/contexts/search-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
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
import { StatusBadge } from '@/components/crm/status-badge';
import { LeadDetailsModal } from '@/components/crm/lead-details-modal';
import { WhatsAppMessageModal } from '@/components/crm/whatsapp-message-modal';
import { EditLeadModal } from '@/components/crm/edit-lead-modal';
import { CallLeadModal } from '@/components/crm/call-lead-modal';
import { EmailLeadModal } from '@/components/crm/email-lead-modal';
import { ScheduleVisitModal } from '@/components/crm/schedule-visit-modal';
import { AddLeadModal } from '@/components/crm/add-lead-modal';
import { useLeads, type Lead } from '@/hooks/use-leads-v2';
import { useLeadsFilters } from '@/hooks/use-leads-filters';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedAuth } from '@/contexts/unified-auth-context';
import {
  Plus,
  TrendingUp,
  Users,
  Target,
  DollarSign,
  Clock,
  MessageSquare,
  BarChart3,
  Star,
  Zap,
  Activity,
  Award,
  Download,
  FileText,
  Send,
  UserPlus,
  Eye,
  Phone,
  Mail,
  Calendar,
  Edit,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Flame,
  MapPin,
  ArrowUpDown,
  Settings,
  Bell,
  CheckCircle,
  XCircle,
  Clock3,
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

export default function LeadsV3() {
  const { toast } = useToast();
  const { user } = useUnifiedAuth();
  const location = useLocation();
  const { searchTerm, setSearchTerm } = useSearch();
  
  // ✅ USAR HOOK PADRONIZADO
  const { isRefreshing, handleRefresh } = useStandardLayout();

  // Estados dos modais
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showLeadDetailsModal, setShowLeadDetailsModal] = useState(false);
  const [showEditLeadModal, setShowEditLeadModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Hook para leads
  const { leads, loading, createLead, updateLead, deleteLead, refetch } = useLeads();
  const { filters, setFilters, filteredLeads } = useLeadsFilters(leads);

  // ✅ CALCULAR MÉTRICAS PESSOAIS
  const personalMetrics = useMemo(() => {
    const userLeads = leads.filter(lead => lead.user_id === user?.id);
    const totalLeads = userLeads.length;
    const leadsAtivos = userLeads.filter(lead => lead.status === 'ativo').length;
    const leadsConvertidos = userLeads.filter(lead => lead.status === 'convertido').length;
    const taxaConversao = totalLeads > 0 ? (leadsConvertidos / totalLeads) * 100 : 0;
    const scoreMedio = userLeads.reduce((acc, lead) => acc + (lead.score_ia || 0), 0) / totalLeads || 0;
    const valorTotal = userLeads.reduce((acc, lead) => acc + (lead.valor_interesse || 0), 0);

    return {
      totalLeads,
      leadsAtivos,
      leadsConvertidos,
      taxaConversao,
      scoreMedio,
      valorTotal,
    };
  }, [leads, user?.id]);

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

  const handleCallLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowCallModal(true);
  };

  const handleEmailLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowEmailModal(true);
  };

  const handleScheduleVisit = (lead: Lead) => {
    setSelectedLead(lead);
    setShowScheduleModal(true);
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
      text: `${personalMetrics?.taxaConversao?.toFixed(1) || '0.0'}% conversão`,
    },
    {
      icon: <Star className="h-3 w-3" />,
      text: `Score médio: ${personalMetrics?.scoreMedio?.toFixed(0) || '0'}`,
    },
  ];

  if (loading) {
    return (
      <StandardPageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Carregando seus leads...</span>
          </div>
        </div>
      </StandardPageLayout>
    );
  }

  return (
    <CorretorRoute>
      <StandardPageLayout
        header={
          <StandardHeader
            title="Meus Leads"
            description="🎯 Gestão pessoal dos seus leads e oportunidades"
            icon={<Target className="h-6 w-6 text-white" />}
            badges={headerBadges}
            actions={headerActions}
            gradient="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"
          />
        }
      >
        {/* ✅ MÉTRICAS PESSOAIS PADRONIZADAS */}
        <StandardGrid columns="4">
          <StandardMetricCard
            title="Total de Leads"
            value={personalMetrics.totalLeads}
            icon={<Users className="h-6 w-6 text-white" />}
            color={STANDARD_COLORS.info}
          />
          <StandardMetricCard
            title="Leads Ativos"
            value={personalMetrics.leadsAtivos}
            icon={<Target className="h-6 w-6 text-white" />}
            color={STANDARD_COLORS.success}
          />
          <StandardMetricCard
            title="Taxa de Conversão"
            value={`${personalMetrics.taxaConversao.toFixed(1)}%`}
            icon={<TrendingUp className="h-6 w-6 text-white" />}
            color={STANDARD_COLORS.purple}
          />
          <StandardMetricCard
            title="Valor Total"
            value={`R$ ${personalMetrics.valorTotal.toLocaleString()}`}
            icon={<DollarSign className="h-6 w-6 text-white" />}
            color={STANDARD_COLORS.orange}
          />
        </StandardGrid>

        {/* ✅ FILTROS E BUSCA */}
        <motion.div
          initial={STANDARD_ANIMATIONS.pageInitial}
          animate={STANDARD_ANIMATIONS.pageAnimate}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-500" />
                Filtros e Busca
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
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
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger className="w-full md:w-48">
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
                <Select value={filters.origem} onValueChange={(value) => setFilters({ ...filters, origem: value })}>
                  <SelectTrigger className="w-full md:w-48">
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
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ✅ TABELA DE LEADS */}
        <motion.div
          initial={STANDARD_ANIMATIONS.pageInitial}
          animate={STANDARD_ANIMATIONS.pageAnimate}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                Seus Leads
              </CardTitle>
              <CardDescription>
                Gerencie seus leads e acompanhe o progresso
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
                      <TableHead>Score</TableHead>
                      <TableHead>Última Interação</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => (
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
                          <StatusBadge status={lead.status} />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{lead.origem}</Badge>
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
                              onClick={() => handleCallLead(lead)}
                            >
                              <Phone className="h-4 w-4" />
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

            <CallLeadModal
              lead={selectedLead}
              isOpen={showCallModal}
              onClose={() => setShowCallModal(false)}
            />

            <EmailLeadModal
              lead={selectedLead}
              isOpen={showEmailModal}
              onClose={() => setShowEmailModal(false)}
            />

            <ScheduleVisitModal
              lead={selectedLead}
              isOpen={showScheduleModal}
              onClose={() => setShowScheduleModal(false)}
            />
          </>
        )}
      </StandardPageLayout>
    </CorretorRoute>
  );
}
