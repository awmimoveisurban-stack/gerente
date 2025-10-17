import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/structured-logger';
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';

const logger = createLogger('WebSocketIO');

const EVOLUTION_URL = 'https://api.urbanautobot.com';

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
 * Hook para receber mensagens em TEMPO REAL via Socket.IO
 * Delay: 0-3 segundos (vs 30s do polling)
 */
export const useEvolutionWebSocketIO = (
  enabled: boolean = true,
  instanceName?: string
) => {
  const socketRef = useRef<Socket | null>(null);
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

Gírias BR: "apê"=apartamento, "300k"=300mil, "2q"=2 quartos`;

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
        logger.info('🤖 IA Score: ' + analysis.score);

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
        // Extrair texto
        const messageText =
          messageData.message?.conversation ||
          messageData.message?.extendedTextMessage?.text ||
          messageData.text ||
          '';

        if (!messageText) return;

        // Extrair telefone
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

        if (processedMessagesRef.current.has(messageId)) return;

        // Verificar se lead já existe
        const { data: existingLead } = await supabase
          .from('leads')
          .select('id')
          .eq('telefone', phoneNumber)
          .maybeSingle();

        if (existingLead) {
          processedMessagesRef.current.add(messageId);
          return;
        }

        const senderName = messageData.pushName || phoneNumber;

        logger.info('⚡ MENSAGEM TEMPO REAL', { from: senderName });

        // 🤖 ANALISAR COM CLAUDE AI
        const analysis = await analyzeWithClaude(messageText, senderName);

        // Preparar dados do lead
        const leadData: any = {
          nome: analysis?.nome || senderName,
          telefone: phoneNumber,
          mensagem_inicial: messageText,
          origem: 'whatsapp_websocket_socketio',
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
          logger.info('✅ Lead TEMPO REAL criado', {
            id: lead.id,
            score: analysis?.score,
          });

          toast.success(`⚡ Lead criado EM TEMPO REAL!`, {
            description: `${senderName} - Score: ${analysis?.score || 0}/100 - Instantâneo!`,
            duration: 5000,
          });
        }
      } catch (error: any) {
        logger.error('Erro ao processar', { error: error.message });
      }
    },
    [analyzeWithClaude]
  );

  useEffect(() => {
    if (!enabled || !instanceName) {
      logger.debug('WebSocket desabilitado');
      return;
    }

    const initSocket = async () => {
      try {
        // Buscar config da instância
        const { data: config } = await supabase
          .from('whatsapp_config')
          .select('*')
          .in('status', ['authorized', 'connected'])
          .is('deleted_at', null)
          .maybeSingle();

        if (!config) {
          logger.warn('Nenhuma instância no banco');
          return;
        }

        logger.info('🔌 Iniciando WebSocket com Socket.IO', {
          instance: config.evolution_instance_name,
        });

        // Conectar com Socket.IO
        const socketUrl = `${EVOLUTION_URL}/${config.evolution_instance_name}`;

        logger.debug('Conectando em', { url: socketUrl });

        const socket = io(socketUrl, {
          transports: ['websocket'],
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
          logger.info('✅ WEBSOCKET CONECTADO COM SOCKET.IO!');
          toast.success('⚡ WebSocket conectado!', {
            description: 'Mensagens serão recebidas em tempo real!',
          });
        });

        socket.on('MESSAGES_UPSERT', async data => {
          logger.debug('📨 Evento MESSAGES_UPSERT', { data });

          // Verificar se não é mensagem enviada por nós
          if (data.key?.fromMe) return;

          logger.info('⚡ MENSAGEM RECEBIDA EM TEMPO REAL!');
          await processMessage(data, config.manager_id);
        });

        socket.on('MESSAGES_UPDATE', async data => {
          logger.debug('📝 Evento MESSAGES_UPDATE', { data });
        });

        socket.on('CONNECTION_UPDATE', data => {
          logger.info('🔄 Status atualizado', { status: data.state });
        });

        socket.on('disconnect', reason => {
          logger.warn('🔌 WebSocket desconectado', { reason });
        });

        socket.on('error', error => {
          logger.error('❌ Erro WebSocket', { error });
        });

        socket.on('connect_error', error => {
          logger.error('❌ Erro ao conectar', { error: error.message });
        });

        socketRef.current = socket;
      } catch (error: any) {
        logger.error('Erro ao iniciar Socket.IO', { error: error.message });
      }
    };

    initSocket();

    // Cleanup
    return () => {
      if (socketRef.current) {
        logger.info('🔌 Fechando Socket.IO');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [enabled, instanceName, processMessage]);

  return null;
};



