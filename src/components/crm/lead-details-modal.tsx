import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge, LeadStatus } from '@/components/crm/status-badge';
import {
  Phone,
  Mail,
  Calendar,
  MapPin,
  DollarSign,
  User,
  Clock,
  MessageCircle,
} from 'lucide-react';
import { WhatsAppMessageModal } from './whatsapp-message-modal';
import { AISuggestionPanel } from './ai-suggestion-panel';
import { supabase } from '@/integrations/supabase/client';
import type { Lead } from '@/hooks/use-leads';

interface LeadDetailsModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

interface Interaction {
  id: string;
  descricao: string;
  tipo: string;
  data_interacao: string;
}

export function LeadDetailsModal({
  lead,
  isOpen,
  onClose,
}: LeadDetailsModalProps) {
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [lastInteraction, setLastInteraction] = useState<Interaction | null>(
    null
  );

  // Buscar última interação quando o modal abrir
  useEffect(() => {
    if (lead && isOpen) {
      fetchLastInteraction();
    }
  }, [lead, isOpen]);

  const fetchLastInteraction = async () => {
    if (!lead) return;

    const { data } = await supabase
      .from('interactions')
      .select('*')
      .eq('lead_id', lead.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setLastInteraction(data);
    }
  };

  if (!lead) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <User className='h-5 w-5' />
                Detalhes do Lead - {lead.nome}
              </div>
              <Button
                size='sm'
                onClick={() => setShowWhatsAppModal(true)}
                className='gap-2 bg-green-600 hover:bg-green-700'
              >
                <MessageCircle className='h-4 w-4' />
                WhatsApp
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Informações Pessoais */}
            <div className='space-y-4'>
              <h3 className='font-semibold text-lg border-b pb-2'>
                Informações Pessoais
              </h3>

              <div className='space-y-3'>
                <div className='flex items-center gap-3'>
                  <User className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <p className='text-sm text-muted-foreground'>Nome</p>
                    <p className='font-medium'>{lead.nome}</p>
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <Phone className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <p className='text-sm text-muted-foreground'>Telefone</p>
                    <p className='font-medium'>{lead.telefone}</p>
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <Mail className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <p className='text-sm text-muted-foreground'>Email</p>
                    <p className='font-medium'>{lead.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações do Negócio */}
            <div className='space-y-4'>
              <h3 className='font-semibold text-lg border-b pb-2'>
                Informações do Negócio
              </h3>

              <div className='space-y-3'>
                <div className='flex items-start gap-3'>
                  <MapPin className='h-4 w-4 text-muted-foreground mt-1' />
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Imóvel de Interesse
                    </p>
                    <p className='font-medium'>{lead.imovel_interesse}</p>
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <DollarSign className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Valor de Interesse
                    </p>
                    <Badge variant='outline' className='font-mono font-medium'>
                      {lead.valor_interesse}
                    </Badge>
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <div className='h-4 w-4' />
                  <div>
                    <p className='text-sm text-muted-foreground'>Status</p>
                    <StatusBadge status={lead.status as LeadStatus} />
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <User className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Corretor Responsável
                    </p>
                    <p className='font-medium'>{lead.corretor}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Painel de IA */}
            {lastInteraction && (
              <div className='col-span-full'>
                <AISuggestionPanel
                  leadId={lead.id}
                  lastInteraction={lastInteraction}
                  onSendSuggestion={message => {
                    // Abrir modal do WhatsApp com a mensagem sugerida
                    setShowWhatsAppModal(true);
                  }}
                />
              </div>
            )}

            {/* Observações */}
            {lead.observacoes && (
              <div className='col-span-full space-y-4'>
                <h3 className='font-semibold text-lg border-b pb-2'>
                  Observações
                </h3>
                <div className='bg-muted/50 p-4 rounded-lg whitespace-pre-wrap text-sm'>
                  {lead.observacoes}
                </div>
              </div>
            )}

            {/* Histórico */}
            <div className='col-span-full space-y-4'>
              <h3 className='font-semibold text-lg border-b pb-2'>Histórico</h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='flex items-center gap-3'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Data de Entrada
                    </p>
                    <p className='font-medium'>
                      {new Date(lead.data_entrada).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <Clock className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Última Interação
                    </p>
                    <p className='font-medium'>
                      {new Date(lead.ultima_interacao).toLocaleDateString(
                        'pt-BR',
                        {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        }
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <WhatsAppMessageModal
        lead={lead}
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
      />
    </>
  );
}
