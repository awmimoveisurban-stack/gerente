import { useEffect, useRef } from 'react';
import { createLogger } from '@/utils/structured-logger';

const logger = createLogger('EvolutionPolling');

const POLLING_INTERVAL = 30000; // 30 segundos
const SUPABASE_URL = 'https://bxtuynqauqasigcbocbm.supabase.co';

/**
 * Hook para executar polling automático de mensagens do WhatsApp
 * Busca mensagens a cada 30s e cria leads qualificados pela IA
 */
export const useEvolutionPolling = (enabled: boolean = true) => {
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      logger.info('Polling desabilitado');
      return;
    }

    logger.info('Iniciando polling automático', {
      interval: `${POLLING_INTERVAL / 1000}s`,
    });

    // Executar polling
    const executarPolling = async () => {
      // Evitar múltiplas execuções simultâneas
      if (isPollingRef.current) {
        logger.debug('Polling já em execução, pulando...');
        return;
      }

      // Pausar se aba não estiver visível (economia de recursos)
      if (document.hidden) {
        logger.debug('Aba oculta, pulando polling');
        return;
      }

      isPollingRef.current = true;

      try {
        logger.debug('🔄 Executando polling...');

        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/evolution-polling-ia`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          logger.warn('Erro no polling', { status: response.status });
          return;
        }

        const data = await response.json();

        if (data.totalLeads > 0) {
          logger.info('✅ Polling concluído', {
            leadsCreated: data.totalLeads,
            results: data.results,
          });
        } else {
          logger.debug('Polling concluído - sem mensagens novas');
        }
      } catch (error: any) {
        logger.error('Erro no polling', { error: error.message });
      } finally {
        isPollingRef.current = false;
      }
    };

    // Executar imediatamente
    executarPolling();

    // Depois executar a cada 30s
    pollingIntervalRef.current = setInterval(executarPolling, POLLING_INTERVAL);

    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        logger.info('Polling automático parado');
      }
    };
  }, [enabled]);

  return null;
};



