import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/structured-logger';
import { toast } from 'sonner';
import { SimpleAIAnalyzer } from '@/utils/simple-ai-analyzer';
import { useSafeLeadIntegration } from '@/components/notifications/safe-integration';

const logger = createLogger('PollingDireto');

const EVOLUTION_URL = 'https://api.urbanautobot.com';
const EVOLUTION_API_KEY = 'cfd9b746ea9e400dc8f4d3e8d57b0180';
const POLLING_INTERVAL = 30000; // 30 segundos

interface LeadAnalysis {
  nome: string | null;
  tipo_imovel: string | null;
  localizacao: string | null;
  valor_estimado: number | null;
  urgencia: 'baixa' | 'media' | 'alta';
  prioridade: 'baixa' | 'media' | 'alta';
  score: number;
  observacoes: string | null;
}

/**
 * Polling direto do frontend (sem Edge Function)
 * Busca mensagens e qualifica com Claude AI
 */
export const useEvolutionPollingDireto = (enabled: boolean = true) => {
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);
  const processedMessagesRef = useRef<Set<string>>(new Set());
  const lastTimestampRef = useRef<number>(0); // ✅ MELHORIA #1: Armazenar último timestamp
  
  // ✅ INTEGRAÇÃO SEGURA DE NOTIFICAÇÕES
  const { notifyLeadCreated } = useSafeLeadIntegration();

  const analyzeWithClaude = useCallback(
    async (
      message: string,
      senderName: string
    ): Promise<LeadAnalysis | null> => {
      const apiKey =
        import.meta.env.VITE_ANTHROPIC_API_KEY ||
        'YOUR_CLAUDE_API_KEY_HERE';

      if (!apiKey) {
        logger.warn('ANTHROPIC_API_KEY não configurada');
        return null;
      }

      try {
        const prompt = `Você é um assistente de qualificação de leads para imobiliária brasileira.

Analise esta mensagem de WhatsApp:

MENSAGEM: "${message}"
REMETENTE: ${senderName}

Extraia (retorne null se não houver):
1. nome: Nome completo
2. tipo_imovel: Tipo desejado (ex: "Apartamento 2 quartos")
3. localizacao: Região/bairro
4. valor_estimado: Valor em reais (só número)
5. urgencia: "baixa", "media" ou "alta"
6. prioridade: "baixa", "media" ou "alta"
7. score: 0-100
8. observacoes: Resumo

Gírias BR: "apê"=apartamento, "300k"=300mil

Responda APENAS JSON:
{"nome":null,"tipo_imovel":null,"localizacao":null,"valor_estimado":null,"urgencia":"baixa","prioridade":"baixa","score":0,"observacoes":null}`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 400,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (!response.ok) {
          logger.error('Erro na Claude API', { status: response.status });
          return null;
        }

        const data = await response.json();
        let jsonText = data.content[0].text.trim();

        if (jsonText.startsWith('```')) {
          jsonText = jsonText
            .replace(/```json?\n?/g, '')
            .replace(/```\n?$/g, '')
            .trim();
        }

        const analysis: LeadAnalysis = JSON.parse(jsonText);
        logger.info('🤖 Análise IA concluída', {
          score: analysis.score,
          prioridade: analysis.prioridade,
        });

        return analysis;
      } catch (error: any) {
        logger.error('Erro ao analisar', { error: error.message });
        return null;
      }
    },
    []
  );

  const executarPolling = useCallback(async () => {
    if (isPollingRef.current || document.hidden || !enabled) {
      return;
    }

    isPollingRef.current = true;

    try {
      logger.debug('🔄 Buscando mensagens...');

      // Buscar instâncias ativas (aceitar 'authorized' OU 'connected')
      const { data: configs, error: configError } = await supabase
        .from('whatsapp_config')
        .select('*')
        .in('status', ['authorized', 'connected'])
        .is('deleted_at', null);

      if (configError) {
        logger.error('Erro ao buscar configs', { error: configError.message });
        return;
      }

      if (!configs || configs.length === 0) {
        logger.debug('Nenhuma instância ativa', {
          buscando: 'status IN (authorized, connected) AND deleted_at IS NULL',
        });
        return;
      }

      let totalLeads = 0;

      for (const config of configs) {
        try {
          // ✅ MELHORIA #1: Carregar último timestamp do localStorage
          const storageKey = `last_polling_timestamp_${config.evolution_instance_name}`;
          const savedTimestamp = localStorage.getItem(storageKey);
          if (savedTimestamp && lastTimestampRef.current === 0) {
            lastTimestampRef.current = parseInt(savedTimestamp, 10);
          }

          // ✅ MELHORIA #1: Buscar APENAS mensagens MAIS RECENTES que o último timestamp
          const requestBody: any = { limit: 20 };

          // Se temos um timestamp, buscar só mensagens mais novas
          if (lastTimestampRef.current > 0) {
            logger.debug(
              `🕐 Buscando mensagens após timestamp: ${new Date(lastTimestampRef.current * 1000).toLocaleString()}`
            );
          }

          // Buscar mensagens (Evolution API v2: POST /chat/findMessages)
          const response = await fetch(
            `${EVOLUTION_URL}/chat/findMessages/${config.evolution_instance_name}`,
            {
              method: 'POST',
              headers: {
                apikey: EVOLUTION_API_KEY,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
            }
          );

          if (!response.ok) continue;

          const data = await response.json();

          // Evolution API v2 retorna: { messages: { records: [...] } }
          const messages = data.messages?.records || [];

          if (!Array.isArray(messages) || messages.length === 0) {
            logger.debug(`📨 0 mensagem(ns)`);
            continue;
          }

          // ✅ MELHORIA #1: Filtrar mensagens mais recentes que o último timestamp
          const recentMessages = messages.filter((msg: any) => {
            const msgTimestamp = msg.messageTimestamp || 0;
            return msgTimestamp > lastTimestampRef.current;
          });

          if (recentMessages.length === 0 && lastTimestampRef.current > 0) {
            logger.debug(
              `✅ Nenhuma mensagem nova (última: ${new Date(lastTimestampRef.current * 1000).toLocaleString()})`
            );
            continue;
          }

          logger.info(
            `📨 ${recentMessages.length} mensagem(ns) NOVAS de ${messages.length} total - API: ${data.messages?.total || 0}`
          );

          let maxTimestamp = lastTimestampRef.current;

          for (const msg of recentMessages) {
            try {
              if (msg.key?.fromMe) continue;

              const messageText =
                msg.message?.conversation ||
                msg.message?.extendedTextMessage?.text ||
                '';

              if (!messageText) continue;

              const phoneNumber = (msg.key?.remoteJid || '')
                .replace('@s.whatsapp.net', '')
                .replace('@c.us', '');

              if (!phoneNumber) continue;

              // Criar ID único para evitar duplicatas
              const messageId = `${phoneNumber}_${msg.messageTimestamp || Date.now()}`;

              if (processedMessagesRef.current.has(messageId)) {
                continue;
              }

              // ✅ MELHORIA #1: Atualizar maxTimestamp
              const msgTimestamp = msg.messageTimestamp || 0;
              if (msgTimestamp > maxTimestamp) {
                maxTimestamp = msgTimestamp;
              }

              // Verificar se lead já existe
              const { data: existingLead } = await supabase
                .from('leads')
                .select('id')
                .eq('telefone', phoneNumber)
                .maybeSingle();

              if (existingLead) {
                processedMessagesRef.current.add(messageId);
                continue;
              }

              const senderName = msg.pushName || phoneNumber;

              logger.info(`💬 Nova mensagem: ${senderName}`);

              // 🤖 ANÁLISE IA SIMPLIFICADA (sem APIs externas!)
              const aiAnalysis = SimpleAIAnalyzer.analyze(
                messageText,
                senderName
              );

              logger.info(
                `🤖 IA Simples: Score ${aiAnalysis.score}/100 | Prioridade: ${aiAnalysis.prioridade}`
              );

              // ✅ CRIAR LEAD COM IA SIMPLES
              const isUuid = (val?: string) =>
                !!val && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
              
              const leadData: any = {
                nome: senderName,
                telefone: phoneNumber,
                origem: 'whatsapp',
                status: 'novo',
                score_ia: aiAnalysis.score, // ✅ Score 0-100
                interesse: aiAnalysis.tipo_imovel || null,
                cidade: aiAnalysis.localizacao || null,
                orcamento: aiAnalysis.valor_estimado || null,
                prioridade: aiAnalysis.prioridade,
                observacoes: `[IA Score: ${aiAnalysis.score}/100 | Prioridade: ${aiAnalysis.prioridade}]\n${aiAnalysis.observacoes}\n\nMensagem: ${messageText}`,
                user_id: isUuid(config.manager_id) ? config.manager_id : null, // ✅ CORREÇÃO: Usar null se não for UUID válido
                manager_id: config.manager_id || null,
                atribuido_a: config.manager_id || null,
              };

              // Criar lead
              logger.info('📤 Tentando INSERT', { leadData });

              const { data: lead, error: leadError } = await supabase
                .from('leads')
                .insert(leadData)
                .select()
                .single();

              if (leadError) {
                logger.error('❌ ERRO 400 DETALHADO', {
                  message: leadError.message,
                  code: leadError.code,
                  details: leadError.details,
                  hint: leadError.hint,
                  leadData,
                });
              } else if (lead) {
                logger.info('✅ Lead criado com IA!', {
                  id: lead.id,
                  nome: lead.nome,
                  score: aiAnalysis.score,
                  prioridade: aiAnalysis.prioridade,
                });
                
                // ✅ NOTIFICAÇÃO DE LEAD CRIADO VIA WHATSAPP (SEGURO)
                notifyLeadCreated(lead);
                
                processedMessagesRef.current.add(messageId);
                totalLeads++;

                // Toast com informações da IA
                const tipoEmoji = aiAnalysis.tipo_imovel ? '🏠' : '💬';
                const urgenciaEmoji =
                  aiAnalysis.urgencia === 'alta'
                    ? '🔥'
                    : aiAnalysis.urgencia === 'media'
                      ? '⚠️'
                      : 'ℹ️';

                toast.success(`${tipoEmoji} Novo lead qualificado pela IA!`, {
                  description: `${urgenciaEmoji} ${senderName} | Score: ${aiAnalysis.score}/100 | ${aiAnalysis.prioridade.toUpperCase()}`,
                });
              }
            } catch (msgError: any) {
              logger.error('Erro ao processar mensagem', {
                error: msgError.message,
              });
            }
          }

          // ✅ MELHORIA #1: Salvar último timestamp após processar com sucesso
          if (maxTimestamp > lastTimestampRef.current) {
            lastTimestampRef.current = maxTimestamp;
            localStorage.setItem(storageKey, maxTimestamp.toString());
            logger.debug(
              `💾 Timestamp salvo: ${new Date(maxTimestamp * 1000).toLocaleString()}`
            );
          }
        } catch (instanceError: any) {
          logger.error('Erro na instância', { error: instanceError.message });
        }
      }

      if (totalLeads > 0) {
        logger.info(`✅ Polling: ${totalLeads} lead(s) criado(s)`);
      }
    } catch (error: any) {
      logger.error('Erro no polling', { error: error.message });
    } finally {
      isPollingRef.current = false;
    }
  }, [enabled, analyzeWithClaude]);

  useEffect(() => {
    if (!enabled) return;

    logger.info('🔄 Polling direto ativado', {
      interval: `${POLLING_INTERVAL / 1000}s`,
    });

    // Executar imediatamente
    executarPolling();

    // Depois a cada 30s
    pollingIntervalRef.current = setInterval(executarPolling, POLLING_INTERVAL);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        logger.info('Polling direto parado');
      }
    };
  }, [enabled, executarPolling]);

  return null;
};
