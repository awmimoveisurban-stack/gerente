import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { useUserRoles } from '@/hooks/use-user-roles';
import { toast } from 'sonner';

export interface Lead {
  id: string;
  user_id: string;
  nome: string;
  telefone?: string;
  email?: string;
  imovel_interesse?: string;
  valor_interesse?: number;
  status: string;
  corretor?: string;
  observacoes?: string;
  data_entrada: string;
  ultima_interacao?: string;
  created_at: string;
  updated_at: string;
}

export const useLeadsDebug = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { hasRole, loading: rolesLoading } = useUserRoles();

  const fetchLeads = async () => {
    if (!user || rolesLoading) {
      console.log('⏳ Aguardando usuário ou roles...');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔍 [DEBUG] Fetching leads for user:', user.email);
      console.log('🔍 [DEBUG] User ID:', user.id);
      console.log('🔍 [DEBUG] Is gerente:', hasRole('gerente'));
      console.log('🔍 [DEBUG] Is corretor:', hasRole('corretor'));
      
      // Teste 1: Consulta sem filtros (bypass RLS temporariamente)
      console.log('🧪 [DEBUG] Teste 1: Consulta sem filtros...');
      const { data: allData, error: allError } = await supabase
        .from('leads')
        .select('*')
        .limit(10);
      
      if (allError) {
        console.error('❌ [DEBUG] Erro na consulta sem filtros:', allError);
        setError(`Erro na consulta sem filtros: ${allError.message}`);
        return;
      }
      
      console.log('✅ [DEBUG] Consulta sem filtros OK. Total encontrado:', allData?.length || 0);
      if (allData && allData.length > 0) {
        console.log('📋 [DEBUG] Primeiro lead:', allData[0]);
      }
      
      // Teste 2: Consulta por user_id
      console.log('🧪 [DEBUG] Teste 2: Consulta por user_id...');
      const { data: userData, error: userError } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .limit(10);
      
      if (userError) {
        console.error('❌ [DEBUG] Erro na consulta por user_id:', userError);
      } else {
        console.log('✅ [DEBUG] Consulta por user_id OK. Encontrados:', userData?.length || 0);
      }
      
      // Teste 3: Consulta por corretor (email)
      console.log('🧪 [DEBUG] Teste 3: Consulta por corretor...');
      const { data: corretorData, error: corretorError } = await supabase
        .from('leads')
        .select('*')
        .eq('corretor', user.email)
        .limit(10);
      
      if (corretorError) {
        console.error('❌ [DEBUG] Erro na consulta por corretor:', corretorError);
      } else {
        console.log('✅ [DEBUG] Consulta por corretor OK. Encontrados:', corretorData?.length || 0);
      }
      
      // Determinar qual conjunto de dados usar
      let finalData: Lead[] = [];
      
      if (hasRole('gerente')) {
        finalData = allData || [];
        console.log('👨‍💼 [DEBUG] Usando todos os leads para gerente:', finalData.length);
      } else if (hasRole('corretor')) {
        finalData = corretorData || [];
        console.log('👨‍💼 [DEBUG] Usando leads do corretor:', finalData.length);
      } else {
        finalData = userData || [];
        console.log('👤 [DEBUG] Usando leads do usuário:', finalData.length);
      }
      
      console.log('✅ [DEBUG] Leads finais definidos:', finalData.length);
      setLeads(finalData);
      
    } catch (error) {
      console.error('❌ [DEBUG] Erro geral ao buscar leads:', error);
      setError(`Erro geral: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !rolesLoading) {
      fetchLeads();
    }
  }, [user, rolesLoading]);

  return {
    leads,
    loading,
    error,
    refetch: fetchLeads,
  };
};





