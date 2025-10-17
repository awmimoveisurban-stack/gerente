import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/structured-logger';
import { toast } from 'sonner';

const logger = createLogger('AutoAssignLeads');

/**
 * Hook para redirecionamento automático de leads após 2 horas
 * Executa verificação a cada 5 minutos
 */
export const useAutoAssignLeads = (enabled: boolean = true) => {
  const AUTO_ASSIGN_DELAY_HOURS = 2; // 2 horas
  const CHECK_INTERVAL_MINUTES = 5; // Verificar a cada 5 minutos

  const autoAssignLeads = useCallback(async () => {
    try {
      logger.info('🔄 Verificando leads para auto-atribuição...');

      // Buscar leads não direcionados criados há mais de 2 horas
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - AUTO_ASSIGN_DELAY_HOURS);

      const { data: leadsToAssign, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .or('corretor.is.null,corretor.eq.')
        .lt('created_at', cutoffTime.toISOString())
        .eq('status', 'novo')
        .limit(50); // Limitar para não sobrecarregar

      if (fetchError) {
        logger.error(
          '❌ Erro ao buscar leads para auto-atribuição:',
          fetchError
        );
        return;
      }

      if (!leadsToAssign || leadsToAssign.length === 0) {
        logger.debug('✅ Nenhum lead para auto-atribuição');
        return;
      }

      logger.info(
        `📋 Encontrados ${leadsToAssign.length} leads para auto-atribuição`
      );

      // Buscar corretores ativos
      const { data: corretores, error: corretoresError } = await supabase
        .from('user_roles')
        .select('user_id, profiles(nome, email)')
        .eq('role', 'corretor');

      if (corretoresError) {
        logger.error('❌ Erro ao buscar corretores:', corretoresError);
        return;
      }

      if (!corretores || corretores.length === 0) {
        logger.warn('⚠️ Nenhum corretor encontrado para auto-atribuição');
        toast.error('Nenhum corretor disponível para auto-atribuição de leads');
        return;
      }

      // Implementar rodízio simples (round-robin)
      let corretorIndex = 0;
      const totalCorretores = corretores.length;

      for (const lead of leadsToAssign) {
        const corretor = corretores[corretorIndex];

        try {
          const { error: updateError } = await supabase
            .from('leads')
            .update({
              corretor: corretor.profiles.email,
              status: 'contato_realizado',
              updated_at: new Date().toISOString(),
            })
            .eq('id', lead.id);

          if (updateError) {
            logger.error(
              `❌ Erro ao auto-atribuir lead ${lead.id}:`,
              updateError
            );
            continue;
          }

          logger.info(
            `✅ Lead ${lead.nome} auto-atribuído para ${corretor.profiles.nome}`
          );

          // Avançar para próximo corretor (rodízio)
          corretorIndex = (corretorIndex + 1) % totalCorretores;
        } catch (error) {
          logger.error(`❌ Erro ao processar lead ${lead.id}:`, error);
        }
      }

      if (leadsToAssign.length > 0) {
        toast.success(
          `🎯 ${leadsToAssign.length} leads foram automaticamente atribuídos aos corretores!`,
          {
            description:
              'Leads não direcionados em 2 horas são automaticamente distribuídos.',
          }
        );
      }
    } catch (error) {
      logger.error('❌ Erro geral na auto-atribuição:', error);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      logger.debug('Auto-atribuição desabilitada');
      return;
    }

    // Executar imediatamente
    autoAssignLeads();

    // Configurar intervalo para verificação periódica
    const interval = setInterval(
      autoAssignLeads,
      CHECK_INTERVAL_MINUTES * 60 * 1000
    );

    logger.info(
      `🔄 Auto-atribuição iniciada (verificação a cada ${CHECK_INTERVAL_MINUTES} minutos)`
    );

    return () => {
      clearInterval(interval);
      logger.info('🛑 Auto-atribuição parada');
    };
  }, [enabled, autoAssignLeads]);

  return {
    autoAssignLeads,
  };
};
