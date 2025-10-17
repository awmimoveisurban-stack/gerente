import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  MessageSquare,
  Copy,
  Phone,
  Calendar,
  Building2,
  DollarSign,
  MapPin,
  Flame,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import type { Lead } from '@/hooks/use-leads';

interface ViewMessageModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onWhatsAppReply?: (lead: Lead) => void;
}

export function ViewMessageModal({
  lead,
  isOpen,
  onClose,
  onWhatsAppReply,
}: ViewMessageModalProps) {
  const [copied, setCopied] = useState(false);

  if (!lead) return null;

  const handleCopyMessage = () => {
    if (lead.mensagem_inicial) {
      navigator.clipboard.writeText(lead.mensagem_inicial);
      setCopied(true);
      toast.success('Mensagem copiada!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppReply = () => {
    if (onWhatsAppReply) {
      onWhatsAppReply(lead);
      onClose();
    }
  };

  const getScoreBadge = () => {
    if (!lead.score) return null;

    if (lead.score >= 80) {
      return (
        <Badge className='bg-red-500 text-white'>
          <Flame className='h-3 w-3 mr-1' />
          QUENTE ({lead.score}/100)
        </Badge>
      );
    }
    if (lead.score >= 50) {
      return (
        <Badge className='bg-yellow-500 text-white'>
          🌡️ MORNO ({lead.score}/100)
        </Badge>
      );
    }
    return (
      <Badge className='bg-blue-500 text-white'>
        ❄️ FRIO ({lead.score}/100)
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-xl'>
            <MessageSquare className='h-6 w-6 text-green-600' />
            Mensagem Original do Cliente
          </DialogTitle>
          <DialogDescription>
            Visualize a mensagem completa enviada pelo WhatsApp
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 mt-4'>
          {/* Informações do Cliente */}
          <Card className='border-green-200 bg-green-50/50'>
            <CardContent className='p-4'>
              <div className='grid grid-cols-2 gap-3 text-sm'>
                <div>
                  <span className='font-semibold text-gray-700'>
                    👤 Cliente:
                  </span>
                  <p className='text-gray-900 font-medium mt-1'>{lead.nome}</p>
                </div>
                <div>
                  <span className='font-semibold text-gray-700'>
                    📞 Telefone:
                  </span>
                  <p className='text-gray-900 font-medium mt-1'>
                    {lead.telefone || 'Não informado'}
                  </p>
                </div>
                <div>
                  <span className='font-semibold text-gray-700'>
                    📅 Recebido:
                  </span>
                  <p className='text-gray-900 font-medium mt-1'>
                    {new Date(lead.created_at).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(lead.created_at).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <span className='font-semibold text-gray-700'>
                    🌐 Origem:
                  </span>
                  <p className='mt-1'>
                    {lead.origem === 'whatsapp_green_api' ? (
                      <Badge className='bg-green-600 text-white'>
                        <MessageSquare className='h-3 w-3 mr-1' />
                        WhatsApp (Green-API)
                      </Badge>
                    ) : lead.origem === 'twilio' ? (
                      <Badge className='bg-blue-600 text-white'>
                        <Phone className='h-3 w-3 mr-1' />
                        Twilio
                      </Badge>
                    ) : (
                      <Badge className='bg-gray-600 text-white'>Manual</Badge>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mensagem Original */}
          {lead.mensagem_inicial ? (
            <Card className='border-blue-200'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between mb-3'>
                  <h3 className='font-semibold text-gray-900 flex items-center gap-2'>
                    <MessageSquare className='h-4 w-4 text-blue-600' />
                    Mensagem Enviada:
                  </h3>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleCopyMessage}
                    className='hover:bg-blue-50'
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className='h-4 w-4 mr-2 text-green-600' />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className='h-4 w-4 mr-2' />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
                <div className='bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500'>
                  <p className='text-gray-800 whitespace-pre-wrap font-medium'>
                    "{lead.mensagem_inicial}"
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className='border-gray-200'>
              <CardContent className='p-6 text-center'>
                <p className='text-gray-500'>Sem mensagem inicial registrada</p>
              </CardContent>
            </Card>
          )}

          {/* Análise da IA */}
          {lead.score && (
            <Card className='border-purple-200 bg-purple-50/50'>
              <CardContent className='p-4'>
                <h3 className='font-semibold text-purple-900 flex items-center gap-2 mb-3'>
                  <Zap className='h-5 w-5 text-purple-600' />
                  Análise Automática da IA
                </h3>
                <div className='grid grid-cols-2 gap-3'>
                  {/* Score */}
                  <div className='col-span-2'>
                    <span className='text-sm font-semibold text-gray-700'>
                      🎯 Score de Qualidade:
                    </span>
                    <div className='mt-2 flex items-center gap-3'>
                      <div
                        className='w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg'
                        style={{
                          background:
                            lead.score >= 80
                              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                              : lead.score >= 50
                                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          color: 'white',
                        }}
                      >
                        {lead.score}
                      </div>
                      {getScoreBadge()}
                    </div>
                  </div>

                  {/* Tipo de Imóvel */}
                  {lead.tipo_imovel && (
                    <div>
                      <span className='text-sm font-semibold text-gray-700'>
                        🏠 Tipo:
                      </span>
                      <div className='mt-1'>
                        <Badge
                          variant='outline'
                          className='bg-emerald-50 text-emerald-700'
                        >
                          <Building2 className='h-3 w-3 mr-1' />
                          {lead.tipo_imovel}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Quartos */}
                  {lead.quartos && (
                    <div>
                      <span className='text-sm font-semibold text-gray-700'>
                        🛏️ Quartos:
                      </span>
                      <div className='mt-1'>
                        <Badge
                          variant='outline'
                          className='bg-blue-50 text-blue-700'
                        >
                          {lead.quartos} quartos
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Região */}
                  {lead.regiao && (
                    <div>
                      <span className='text-sm font-semibold text-gray-700'>
                        📍 Região:
                      </span>
                      <div className='mt-1'>
                        <Badge
                          variant='outline'
                          className='bg-purple-50 text-purple-700'
                        >
                          <MapPin className='h-3 w-3 mr-1' />
                          {lead.regiao}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Orçamento */}
                  {lead.valor_interesse && (
                    <div>
                      <span className='text-sm font-semibold text-gray-700'>
                        💰 Orçamento:
                      </span>
                      <div className='mt-1'>
                        <Badge
                          variant='outline'
                          className='bg-green-50 text-green-700'
                        >
                          <DollarSign className='h-3 w-3 mr-1' />
                          R$ {lead.valor_interesse.toLocaleString('pt-BR')}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ações */}
          <div className='flex gap-3 pt-2'>
            {lead.origem === 'whatsapp_green_api' && onWhatsAppReply && (
              <Button
                className='flex-1 bg-green-600 hover:bg-green-700 text-white'
                onClick={handleWhatsAppReply}
              >
                <MessageSquare className='h-4 w-4 mr-2' />
                Responder no WhatsApp
              </Button>
            )}
            <Button
              variant='outline'
              onClick={onClose}
              className={
                lead.origem === 'whatsapp_green_api' && onWhatsAppReply
                  ? ''
                  : 'flex-1'
              }
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}



