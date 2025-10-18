import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedAuth } from '@/contexts/unified-auth-context';

// =====================================================
// TIPOS E INTERFACES
// =====================================================

export interface AuditLogEntry {
  id: string;
  lead_id: string;
  action: 'create' | 'update' | 'delete' | 'assign' | 'status_change' | 
          'conversation_add' | 'conversation_update' | 'conversation_delete' |
          'import' | 'export' | 'merge' | 'duplicate_found';
  old_values: Record<string, any>;
  new_values: Record<string, any>;
  user_id?: string;
  user_email?: string;
  user_nome?: string;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface AuditFilters {
  action?: string;
  user_id?: string;
  dateFrom?: string;
  dateTo?: string;
  lead_id?: string;
}

export interface AuditStats {
  total: number;
  porAcao: Record<string, number>;
  porUsuario: Record<string, number>;
  ultimaAcao?: string;
  acoesHoje: number;
  acoesEstaSemana: number;
}

// =====================================================
// HOOK PRINCIPAL
// =====================================================

export const useLeadAudit = (leadId?: string) => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUnifiedAuth();

  // =====================================================
  // BUSCAR LOGS DE AUDITORIA DE UM LEAD
  // =====================================================
  const fetchAuditLogs = useCallback(async (
    targetLeadId?: string,
    filters?: AuditFilters
  ) => {
    try {
      setLoading(true);
      const leadIdToUse = targetLeadId || leadId;
      
      if (!leadIdToUse) {
        setAuditLogs([]);
        return;
      }

      let query = supabase
        .from('lead_audit_log')
        .select(`
          *,
          user:profiles!lead_audit_log_user_id_fkey(nome, email)
        `)
        .eq('lead_id', leadIdToUse)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters?.action) {
        query = query.eq('action', filters.action);
      }
      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar logs de auditoria:', error);
        throw new Error('Erro ao carregar histórico de auditoria');
      }

      // Processar dados para incluir nome do usuário
      const processedLogs = (data || []).map(log => ({
        ...log,
        user_nome: log.user?.nome || 'Sistema',
        user_email: log.user?.email || log.user_email,
      }));

      setAuditLogs(processedLogs);
      
      // Calcular estatísticas
      setStats(calculateStats(processedLogs));

    } catch (error) {
      console.error('Erro ao buscar logs de auditoria:', error);
      toast({
        title: '❌ Erro ao Carregar Auditoria',
        description: 'Não foi possível carregar o histórico de auditoria',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [leadId, toast]);

  // =====================================================
  // BUSCAR TODOS OS LOGS DE AUDITORIA (para gerentes)
  // =====================================================
  const fetchAllAuditLogs = useCallback(async (filters?: AuditFilters) => {
    try {
      setLoading(true);

      let query = supabase
        .from('lead_audit_log')
        .select(`
          *,
          user:profiles!lead_audit_log_user_id_fkey(nome, email),
          lead:leads!lead_audit_log_lead_id_fkey(nome, telefone, email)
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters?.action) {
        query = query.eq('action', filters.action);
      }
      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters?.lead_id) {
        query = query.eq('lead_id', filters.lead_id);
      }
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error('Erro ao carregar logs de auditoria');
      }

      const processedLogs = (data || []).map(log => ({
        ...log,
        user_nome: log.user?.nome || 'Sistema',
        user_email: log.user?.email || log.user_email,
      }));

      setAuditLogs(processedLogs);
      setStats(calculateStats(processedLogs));

    } catch (error) {
      console.error('Erro ao buscar todos os logs de auditoria:', error);
      toast({
        title: '❌ Erro ao Carregar Auditoria',
        description: 'Não foi possível carregar os logs de auditoria',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // =====================================================
  // REGISTRAR AÇÃO DE AUDITORIA MANUAL
  // =====================================================
  const logAuditAction = useCallback(async (
    targetLeadId: string,
    action: AuditLogEntry['action'],
    oldValues: Record<string, any> = {},
    newValues: Record<string, any> = {},
    metadata: Record<string, any> = {}
  ) => {
    try {
      const auditPayload = {
        lead_id: targetLeadId,
        action,
        old_values: oldValues,
        new_values: newValues,
        user_id: user?.id || null,
        user_email: user?.email || null,
        ip_address: null, // Será preenchido pela aplicação se necessário
        user_agent: null, // Será preenchido pela aplicação se necessário
        session_id: null, // Será preenchido pela aplicação se necessário
        metadata: {
          ...metadata,
          source: 'manual',
          timestamp: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
      };

      const { data: auditLog, error } = await supabase
        .from('lead_audit_log')
        .insert(auditPayload)
        .select(`
          *,
          user:profiles!lead_audit_log_user_id_fkey(nome, email)
        `)
        .single();

      if (error) {
        throw new Error(`Erro ao registrar auditoria: ${error.message}`);
      }

      // Atualizar lista local se for o mesmo lead
      if (targetLeadId === leadId) {
        const processedLog = {
          ...auditLog,
          user_nome: auditLog.user?.nome || 'Sistema',
          user_email: auditLog.user?.email || auditLog.user_email,
        };

        setAuditLogs(prev => [processedLog, ...prev]);
        setStats(calculateStats([processedLog, ...auditLogs]));
      }

      return auditLog;

    } catch (error) {
      console.error('Erro ao registrar auditoria:', error);
      toast({
        title: '❌ Erro ao Registrar Auditoria',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
      throw error;
    }
  }, [user, leadId, auditLogs, toast]);

  // =====================================================
  // CALCULAR ESTATÍSTICAS DE AUDITORIA (OTIMIZADO COM useMemo)
  // =====================================================
  const calculateStats = useMemo(() => {
    return (logsList: AuditLogEntry[]) => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const stats: AuditStats = {
        total: logsList.length,
        porAcao: {},
        porUsuario: {},
        ultimaAcao: logsList[0]?.created_at,
        acoesHoje: 0,
        acoesEstaSemana: 0,
      };

      logsList.forEach(log => {
        // Contar por ação
        stats.porAcao[log.action] = (stats.porAcao[log.action] || 0) + 1;
        
        // Contar por usuário
        const userName = log.user_nome || 'Sistema';
        stats.porUsuario[userName] = (stats.porUsuario[userName] || 0) + 1;
        
        // Contar ações por período
        const logDate = new Date(log.created_at);
        if (logDate >= today) {
          stats.acoesHoje++;
        }
        if (logDate >= weekAgo) {
          stats.acoesEstaSemana++;
        }
      });

      return stats;
    };
  }, []);

  // =====================================================
  // BUSCAR LOGS POR FILTROS
  // =====================================================
  const searchAuditLogs = useCallback(async (filters: AuditFilters) => {
    await fetchAuditLogs(leadId, filters);
  }, [fetchAuditLogs, leadId]);

  // =====================================================
  // EXPORTAR LOGS DE AUDITORIA
  // =====================================================
  const exportAuditLogs = useCallback(async (filters?: AuditFilters) => {
    try {
      let query = supabase
        .from('lead_audit_log')
        .select(`
          *,
          user:profiles!lead_audit_log_user_id_fkey(nome, email),
          lead:leads!lead_audit_log_lead_id_fkey(nome, telefone, email)
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters?.action) {
        query = query.eq('action', filters.action);
      }
      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters?.lead_id) {
        query = query.eq('lead_id', filters.lead_id);
      }
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error('Erro ao exportar logs de auditoria');
      }

      // Converter para CSV
      const csvContent = [
        ['Data', 'Ação', 'Lead', 'Usuário', 'Email', 'Valores Antigos', 'Valores Novos', 'Metadados'],
        ...(data || []).map(log => [
          new Date(log.created_at).toLocaleString('pt-BR'),
          log.action,
          log.lead?.nome || log.lead?.telefone || 'N/A',
          log.user?.nome || 'Sistema',
          log.user?.email || log.user_email || 'N/A',
          JSON.stringify(log.old_values),
          JSON.stringify(log.new_values),
          JSON.stringify(log.metadata)
        ])
      ].map(row => row.join(',')).join('\n');

      // Download do arquivo
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: '✅ Logs Exportados',
        description: 'Logs de auditoria exportados com sucesso',
      });

    } catch (error) {
      console.error('Erro ao exportar logs:', error);
      toast({
        title: '❌ Erro ao Exportar',
        description: 'Não foi possível exportar os logs de auditoria',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // =====================================================
  // EFFECTS
  // =====================================================
  useEffect(() => {
    if (leadId) {
      fetchAuditLogs();
    }
  }, [leadId, fetchAuditLogs]);

  // =====================================================
  // RETORNO
  // =====================================================
  return {
    // Dados
    auditLogs,
    stats,
    loading,
    
    // Ações
    fetchAuditLogs,
    fetchAllAuditLogs,
    logAuditAction,
    searchAuditLogs,
    exportAuditLogs,
    
    // Utilitários
    calculateStats,
  };
};
