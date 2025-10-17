import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/contexts/unified-auth-context';
import { createLogger } from '@/utils/structured-logger';
import { fetchWithRetry } from '@/utils/fetch-with-retry';

const logger = createLogger('useEvolutionSend');

/**
 * Hook para enviar mensagens via Evolution API
 */
export function useEvolutionSend() {
  const [isSending, setIsSending] = useState(false);
  const { user } = useUnifiedAuth();

  const sendMessage = async (
    phoneNumber: string,
    message: string,
    leadId?: string
  ) => {
    if (!user) {
      logger.error('Usuário não autenticado');
      return { success: false, error: 'Usuário não autenticado' };
    }

    setIsSending(true);

    try {
      logger.info('Iniciando envio de mensagem', {
        phoneNumber: phoneNumber.slice(0, 4) + '****',
        leadId,
      });

      // 1. Buscar configuração Evolution API do manager
      const { data: config, error: configError } = await supabase
        .from('whatsapp_config')
        .select('evolution_instance_name, evolution_instance_token, status')
        .eq('manager_id', user.id)
        .in('status', ['connected', 'authorized']) // ✅ Aceitar ambos status
        .maybeSingle();

      if (configError) {
        logger.error('Erro ao buscar config Evolution', { error: configError });
        toast.error('Erro ao buscar configuração do WhatsApp');
        return { success: false, error: 'Erro ao buscar config' };
      }

      if (!config) {
        logger.warn('Nenhuma instância Evolution conectada');
        toast.error(
          'WhatsApp não conectado. Conecte primeiro na página WhatsApp.'
        );
        return { success: false, error: 'WhatsApp não conectado' };
      }

      // 2. Validar e formatar número
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      if (!cleanPhone || cleanPhone.length < 10) {
        logger.warn('Número de telefone inválido', { cleanPhone });
        toast.error('Número de telefone inválido');
        return { success: false, error: 'Número inválido' };
      }

      // Formatar para padrão WhatsApp (55 + DDD + número)
      const formattedPhone = cleanPhone.startsWith('55')
        ? cleanPhone
        : `55${cleanPhone}`;

      logger.debug('Número formatado', {
        formattedPhone: formattedPhone.slice(0, 4) + '****',
      });

      // 3. Enviar mensagem via Evolution API
      const EVOLUTION_API_URL = 'https://api.urbanautobot.com';
      const endpoint = `${EVOLUTION_API_URL}/message/sendText/${config.evolution_instance_name}`;

      const response = await fetchWithRetry(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: config.evolution_instance_token,
        },
        body: JSON.stringify({
          // ✅ Evolution API v2: number sem @s.whatsapp.net
          number: formattedPhone,
          // ✅ Evolution API v2: text dentro de textMessage
          textMessage: {
            text: message,
          },
        }),
        timeout: 30000, // 30s
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error('Erro ao enviar mensagem', {
          status: response.status,
          error: errorData,
        });
        toast.error(
          `Erro ao enviar: ${errorData.message || response.statusText}`
        );
        return { success: false, error: errorData.message || 'Erro ao enviar' };
      }

      const result = await response.json();
      logger.info('Mensagem enviada com sucesso', {
        messageId: result.key?.id,
      });

      // 4. Registrar interação no banco (fire-and-forget)
      if (leadId) {
        supabase
          .from('lead_interactions')
          .insert({
            lead_id: leadId,
            tipo: 'whatsapp_enviado',
            descricao: message.substring(0, 200),
            corretor_id: user.id,
          })
          .then(({ error }) => {
            if (error) logger.error('Erro ao registrar interação', { error });
          })
          .catch(err => logger.error('Catch ao registrar interação', { err }));
      }

      toast.success('✅ Mensagem enviada com sucesso!');
      return { success: true, data: result };
    } catch (error) {
      logger.error('Erro ao enviar mensagem', { error });
      toast.error('❌ Erro ao enviar mensagem. Tente novamente.');
      return { success: false, error: String(error) };
    } finally {
      setIsSending(false);
    }
  };

  return {
    sendMessage,
    isSending,
  };
}
