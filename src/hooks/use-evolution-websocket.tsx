import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/structured-logger';
import { toast } from 'sonner';

const logger = createLogger('WebSocket');

const EVOLUTION_URL = 'https://api.urbanautobot.com';
const EVOLUTION_API_KEY = 'cfd9b746ea9e400dc8f4d3e8d57b0180';

// Tentar vários endpoints possíveis
const WS_ENDPOINTS = [
  'wss://api.urbanautobot.com/ws',
  'wss://api.urbanautobot.com/websocket',
  'wss://api.urbanautobot.com',
];

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
 * Hook para receber mensagens em TEMPO REAL via WebSocket
 * Muito mais rápido que polling (0s vs 30s)
 */
export const useEvolutionWebSocket = (
  enabled: boolean = true,
  instanceName?: string
) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const processedMessagesRef = useRef<Set<string>>(new Set());

  const analyzeWithClaude = useCallback(
    async (
      message: string,
      senderName: string
    ): Promise<LeadAnalysis | null> => {
      const apiKey =
        import.meta.env.VITE_ANTHROPIC_API_KEY ||
        'YOUR_CLAUDE_API_KEY_HERE';

      if (!apiKey) return null;

      try {
        const prompt = `Analise esta mensagem de WhatsApp para imobiliária brasileira:

MENSAGEM: "${message}"
REMETENTE: ${senderName}

Extraia em JSON (sem markdown):
{"nome":null,"tipo_imovel":null,"localizacao":null,"valor_estimado":null,"urgencia":"baixa","prioridade":"baixa","score":0,"observacoes":null}

Gírias: "apê"=apartamento, "300k"=300mil, "2q"=2 quartos`;

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

        if (!response.ok) return null;

        const data = await response.json();
        let jsonText = data.content[0].text.trim();

        if (jsonText.startsWith('```')) {
          jsonText = jsonText
            .replace(/```json?\n?/g, '')
            .replace(/```\n?$/g, '')
            .trim();
        }

        const analysis: LeadAnalysis = JSON.parse(jsonText);
        logger.info('🤖 IA: Score ' + analysis.score);

        return analysis;
      } catch (error: any) {
        logger.error('Erro IA', { error: error.message });
        return null;
      }
    },
    []
  );

  const processMessage = useCallback(
    async (messageData: any, managerId: string) => {
      try {
        // Extrair dados da mensagem
        const messageText =
          messageData.message?.conversation ||
          messageData.message?.extendedTextMessage?.text ||
          messageData.text ||
          '';

        if (!messageText) return;

        const phoneNumber = (
          messageData.key?.remoteJid ||
          messageData.from ||
          ''
        )
          .replace('@s.whatsapp.net', '')
          .replace('@c.us', '');

        if (!phoneNumber) return;

        // Evitar duplicatas
        const messageId = `${phoneNumber}_${messageData.messageTimestamp || Date.now()}`;

        if (processedMessagesRef.current.has(messageId)) {
          return;
        }

        // Verificar se lead já existe
        const { data: existingLead } = await supabase
          .from('leads')
          .select('id')
          .eq('telefone', phoneNumber)
          .maybeSingle();

        if (existingLead) {
          processedMessagesRef.current.add(messageId);
          logger.debug('Lead já existe', { phoneNumber });
          return;
        }

        const senderName = messageData.pushName || phoneNumber;

        logger.info('💬 Nova mensagem em TEMPO REAL', { from: senderName });

        // 🤖 ANALISAR COM CLAUDE AI
        const analysis = await analyzeWithClaude(messageText, senderName);

        // Preparar dados do lead
        const leadData: any = {
          nome: analysis?.nome || senderName,
          telefone: phoneNumber,
          mensagem_inicial: messageText,
          origem: 'whatsapp_websocket_realtime',
          status: 'novo',
          manager_id: managerId,
          atribuido_a: managerId,
          data_contato: new Date().toISOString(),
        };

        if (analysis) {
          if (analysis.tipo_imovel) leadData.interesse = analysis.tipo_imovel;
          if (analysis.localizacao) leadData.cidade = analysis.localizacao;
          if (analysis.valor_estimado)
            leadData.orcamento = analysis.valor_estimado;
          if (analysis.observacoes) {
            leadData.observacoes = `[IA Score: ${analysis.score}/100 | Prioridade: ${analysis.prioridade}]\n${analysis.observacoes}`;
          }
        }

        // Criar lead
        const { data: lead, error: leadError } = await supabase
          .from('leads')
          .insert(leadData)
          .select()
          .single();

        if (!leadError && lead) {
          processedMessagesRef.current.add(messageId);
          logger.info('✅ Lead criado em TEMPO REAL', {
            id: lead.id,
            score: analysis?.score,
          });

          toast.success(`⚡ Lead criado INSTANTANEAMENTE!`, {
            description: `${senderName} - Score: ${analysis?.score || 0}/100 - Tempo real!`,
          });
        }
      } catch (error: any) {
        logger.error('Erro ao processar mensagem', { error: error.message });
      }
    },
    [analyzeWithClaude]
  );

  const connectWebSocket = useCallback(
    async (endpoint: string, instance: string, managerId: string) => {
      try {
        logger.info('🔌 Tentando conectar WebSocket', { endpoint });

        const ws = new WebSocket(endpoint);

        ws.onopen = () => {
          logger.info('✅ WebSocket CONECTADO!', { endpoint });
          reconnectAttemptsRef.current = 0;

          // Tentar autenticar (formato pode variar)
          try {
            ws.send(
              JSON.stringify({
                action: 'authenticate',
                apikey: EVOLUTION_API_KEY,
                instance: instance,
              })
            );

            logger.debug('🔑 Autenticação enviada');
          } catch (e) {
            logger.warn('Autenticação não necessária ou formato diferente');
          }
        };

        ws.onmessage = async event => {
          try {
            const data = JSON.parse(event.data);
            logger.debug('📨 Evento WebSocket', {
              type: data.event || data.type,
            });

            // Verificar se é mensagem recebida (vários formatos possíveis)
            const isMessageEvent =
              data.event === 'MESSAGES_UPSERT' ||
              data.event === 'message.received' ||
              data.event === 'messages.upsert' ||
              data.type === 'message';

            if (isMessageEvent) {
              const messageData = data.data || data.message || data;

              // Verificar se não é mensagem nossa
              if (messageData.key?.fromMe) {
                logger.debug('Mensagem enviada por nós, ignorando');
                return;
              }

              logger.info('⚡ MENSAGEM RECEBIDA EM TEMPO REAL!');

              // Processar mensagem com IA
              await processMessage(messageData, managerId);
            }
          } catch (error: any) {
            logger.error('Erro ao processar evento WebSocket', {
              error: error.message,
            });
          }
        };

        ws.onerror = error => {
          logger.error('❌ Erro WebSocket', { endpoint, error });
        };

        ws.onclose = () => {
          logger.warn('🔌 WebSocket desconectado', { endpoint });

          // Tentar reconectar (máximo 5 tentativas)
          if (enabled && reconnectAttemptsRef.current < 5) {
            reconnectAttemptsRef.current++;
            const delay = Math.min(
              1000 * Math.pow(2, reconnectAttemptsRef.current),
              30000
            );

            logger.info('🔄 Reconectando em ' + delay / 1000 + 's', {
              attempt: reconnectAttemptsRef.current,
            });

            reconnectTimeoutRef.current = setTimeout(() => {
              connectWebSocket(endpoint, instance, managerId);
            }, delay);
          }
        };

        wsRef.current = ws;
        return true;
      } catch (error: any) {
        logger.error('Erro ao criar WebSocket', { error: error.message });
        return false;
      }
    },
    [enabled, processMessage]
  );

  useEffect(() => {
    if (!enabled || !instanceName) {
      logger.debug('WebSocket desabilitado ou sem instância');
      return;
    }

    // Buscar dados da instância
    const initWebSocket = async () => {
      try {
        const { data: config } = await supabase
          .from('whatsapp_config')
          .select('*')
          .in('status', ['authorized', 'connected'])
          .is('deleted_at', null)
          .maybeSingle();

        if (!config) {
          logger.warn('Nenhuma instância ativa no banco');
          return;
        }

        logger.info('🎯 Iniciando WebSocket em tempo real', {
          instance: config.evolution_instance_name,
        });

        // Tentar conectar nos endpoints possíveis
        let connected = false;

        for (const endpoint of WS_ENDPOINTS) {
          if (connected) break;

          logger.debug('Tentando endpoint', { endpoint });
          connected = await connectWebSocket(
            endpoint,
            config.evolution_instance_name,
            config.manager_id
          );

          if (connected) {
            logger.info('✅ WebSocket conectado com sucesso!', { endpoint });
            break;
          }

          await new Promise(r => setTimeout(r, 1000));
        }

        if (!connected) {
          logger.error('❌ Nenhum endpoint WebSocket funcionou');
          logger.info('💡 Fallback: Use polling em vez de WebSocket');
        }
      } catch (error: any) {
        logger.error('Erro ao iniciar WebSocket', { error: error.message });
      }
    };

    initWebSocket();

    // Cleanup
    return () => {
      if (wsRef.current) {
        logger.info('🔌 Fechando WebSocket');
        wsRef.current.close();
        wsRef.current = null;
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [enabled, instanceName, connectWebSocket]);

  return null;
};



