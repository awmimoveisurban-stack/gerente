import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCorretorPerformance,
  type LeadInteraction,
} from '@/hooks/use-corretor-performance';
import { toast } from 'sonner';
import {
  Clock,
  MessageSquare,
  Phone,
  Mail,
  User,
  TrendingUp,
  Check,
  X,
  Calendar,
  DollarSign,
  FileText,
  Plus,
  RefreshCw,
  Sparkles,
  Send,
  AlertCircle,
} from 'lucide-react';

interface LeadTimelineModalProps {
  leadId: string | null;
  leadNome?: string;
  isOpen: boolean;
  onClose: () => void;
}

// Mapeamento de ícones por tipo de interação
const tipoIconMap: Record<string, React.ReactNode> = {
  lead_criado: <Sparkles className='h-4 w-4 text-green-500' />,
  lead_atribuido: <User className='h-4 w-4 text-blue-500' />,
  mensagem_enviada: <MessageSquare className='h-4 w-4 text-blue-500' />,
  mensagem_recebida: <MessageSquare className='h-4 w-4 text-green-500' />,
  status_alterado: <TrendingUp className='h-4 w-4 text-purple-500' />,
  observacao_adicionada: <FileText className='h-4 w-4 text-gray-500' />,
  whatsapp_respondido: <Phone className='h-4 w-4 text-green-500' />,
  ligacao_realizada: <Phone className='h-4 w-4 text-blue-500' />,
  email_enviado: <Mail className='h-4 w-4 text-blue-500' />,
  visita_agendada: <Calendar className='h-4 w-4 text-orange-500' />,
  proposta_enviada: <DollarSign className='h-4 w-4 text-green-500' />,
  negociacao_iniciada: <TrendingUp className='h-4 w-4 text-yellow-500' />,
  lead_convertido: <Check className='h-4 w-4 text-green-600' />,
  lead_perdido: <X className='h-4 w-4 text-red-600' />,
};

// Mapeamento de cores por tipo
const tipoColorMap: Record<string, string> = {
  lead_criado: 'bg-green-100 border-green-300',
  lead_atribuido: 'bg-blue-100 border-blue-300',
  mensagem_enviada: 'bg-blue-100 border-blue-300',
  mensagem_recebida: 'bg-green-100 border-green-300',
  status_alterado: 'bg-purple-100 border-purple-300',
  observacao_adicionada: 'bg-gray-100 border-gray-300',
  whatsapp_respondido: 'bg-green-100 border-green-300',
  ligacao_realizada: 'bg-blue-100 border-blue-300',
  email_enviado: 'bg-blue-100 border-blue-300',
  visita_agendada: 'bg-orange-100 border-orange-300',
  proposta_enviada: 'bg-green-100 border-green-300',
  negociacao_iniciada: 'bg-yellow-100 border-yellow-300',
  lead_convertido: 'bg-green-200 border-green-400',
  lead_perdido: 'bg-red-100 border-red-300',
};

export function LeadTimelineModal({
  leadId,
  leadNome,
  isOpen,
  onClose,
}: LeadTimelineModalProps) {
  const { fetchLeadInteractions, addInteraction } = useCorretorPerformance();
  const [interactions, setInteractions] = useState<LeadInteraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [novaInteracao, setNovaInteracao] = useState({
    tipo: 'observacao_adicionada',
    conteudo: '',
  });

  // Carregar interações ao abrir o modal
  useEffect(() => {
    if (isOpen && leadId) {
      loadInteractions();
    }
  }, [isOpen, leadId]);

  const loadInteractions = async () => {
    if (!leadId) return;

    setLoading(true);
    try {
      const data = await fetchLeadInteractions(leadId);
      setInteractions(data);
    } catch (error) {
      console.error('Erro ao carregar timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInteraction = async () => {
    if (!leadId || !novaInteracao.conteudo.trim()) {
      toast.error('Preencha o conteúdo da interação');
      return;
    }

    const success = await addInteraction(
      leadId,
      novaInteracao.tipo,
      novaInteracao.conteudo
    );

    if (success) {
      setNovaInteracao({ tipo: 'observacao_adicionada', conteudo: '' });
      setShowAddForm(false);
      loadInteractions();
    }
  };

  const formatarTempo = (dataStr: string) => {
    const data = new Date(dataStr);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);

    const formatarHora = (d: Date) => {
      return d.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const formatarData = (d: Date) => {
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    };

    if (data.toDateString() === hoje.toDateString()) {
      return `Hoje às ${formatarHora(data)}`;
    } else if (data.toDateString() === ontem.toDateString()) {
      return `Ontem às ${formatarHora(data)}`;
    } else {
      return `${formatarData(data)} às ${formatarHora(data)}`;
    }
  };

  const formatarTipoInteracao = (tipo: string) => {
    return tipo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[700px] max-h-[80vh] p-0'>
        <DialogHeader className='p-6 pb-4'>
          <DialogTitle className='flex items-center gap-2 text-xl font-bold'>
            <Clock className='h-6 w-6 text-blue-600' />
            Timeline do Lead
          </DialogTitle>
          <DialogDescription>
            {leadNome && `Lead: ${leadNome} • `}
            Histórico completo de todas as interações
          </DialogDescription>
        </DialogHeader>

        <div className='px-6 pb-6 overflow-y-auto max-h-[calc(80vh-200px)]'>
          {/* Botão Adicionar Interação */}
          {!showAddForm && (
            <Button
              onClick={() => setShowAddForm(true)}
              className='w-full mb-4'
              variant='outline'
            >
              <Plus className='h-4 w-4 mr-2' />
              Adicionar Interação
            </Button>
          )}

          {/* Formulário de Nova Interação */}
          {showAddForm && (
            <div className='mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
              <h3 className='font-semibold mb-3 flex items-center gap-2'>
                <Plus className='h-4 w-4' />
                Nova Interação
              </h3>
              <div className='space-y-3'>
                <Select
                  value={novaInteracao.tipo}
                  onValueChange={value =>
                    setNovaInteracao({ ...novaInteracao, tipo: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Tipo de interação' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='observacao_adicionada'>
                      📝 Observação
                    </SelectItem>
                    <SelectItem value='mensagem_enviada'>
                      💬 Mensagem Enviada
                    </SelectItem>
                    <SelectItem value='whatsapp_respondido'>
                      📱 WhatsApp Respondido
                    </SelectItem>
                    <SelectItem value='ligacao_realizada'>
                      📞 Ligação Realizada
                    </SelectItem>
                    <SelectItem value='email_enviado'>
                      ✉️ Email Enviado
                    </SelectItem>
                    <SelectItem value='visita_agendada'>
                      📅 Visita Agendada
                    </SelectItem>
                    <SelectItem value='proposta_enviada'>
                      💰 Proposta Enviada
                    </SelectItem>
                    <SelectItem value='negociacao_iniciada'>
                      🤝 Negociação Iniciada
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Textarea
                  placeholder='Descreva a interação...'
                  value={novaInteracao.conteudo}
                  onChange={e =>
                    setNovaInteracao({
                      ...novaInteracao,
                      conteudo: e.target.value,
                    })
                  }
                  rows={3}
                />

                <div className='flex gap-2 justify-end'>
                  <Button variant='ghost' onClick={() => setShowAddForm(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddInteraction}>
                    <Send className='h-4 w-4 mr-2' />
                    Salvar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className='text-center py-12'>
              <RefreshCw className='h-8 w-8 animate-spin text-blue-600 mx-auto mb-3' />
              <p className='text-gray-600'>Carregando timeline...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && interactions.length === 0 && (
            <div className='text-center py-12'>
              <AlertCircle className='h-12 w-12 text-gray-300 mx-auto mb-3' />
              <p className='text-gray-600 mb-2'>Nenhuma interação registrada</p>
              <p className='text-sm text-gray-500'>
                Adicione uma interação para começar o histórico
              </p>
            </div>
          )}

          {/* Timeline */}
          {!loading && interactions.length > 0 && (
            <div className='relative'>
              {/* Linha vertical da timeline */}
              <div className='absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200'></div>

              {/* Itens da timeline */}
              <div className='space-y-4'>
                {interactions.map((interaction, index) => (
                  <div key={interaction.id} className='relative pl-12'>
                    {/* Círculo indicador */}
                    <div className='absolute left-0 top-1 w-8 h-8 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center'>
                      {tipoIconMap[interaction.tipo] || (
                        <FileText className='h-4 w-4 text-gray-500' />
                      )}
                    </div>

                    {/* Conteúdo da interação */}
                    <div
                      className={`p-4 rounded-lg border ${tipoColorMap[interaction.tipo] || 'bg-gray-100 border-gray-300'}`}
                    >
                      <div className='flex items-start justify-between mb-2'>
                        <div>
                          <Badge variant='outline' className='mb-1'>
                            {formatarTipoInteracao(interaction.tipo)}
                          </Badge>
                          <p className='text-xs text-gray-600 flex items-center gap-1'>
                            <Clock className='h-3 w-3' />
                            {formatarTempo(interaction.created_at)}
                          </p>
                        </div>
                        {index === 0 && (
                          <Badge variant='default' className='bg-blue-600'>
                            Mais Recente
                          </Badge>
                        )}
                      </div>

                      {interaction.conteudo && (
                        <p className='text-sm text-gray-800 whitespace-pre-wrap mt-2'>
                          {interaction.conteudo}
                        </p>
                      )}

                      {/* Metadata adicional */}
                      {interaction.metadata &&
                        Object.keys(interaction.metadata).length > 0 && (
                          <div className='mt-2 pt-2 border-t border-gray-300'>
                            <p className='text-xs text-gray-600'>
                              {JSON.stringify(interaction.metadata, null, 2)}
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className='flex justify-between items-center p-6 pt-0 border-t'>
          <p className='text-sm text-gray-500'>
            {interactions.length}{' '}
            {interactions.length === 1
              ? 'interação registrada'
              : 'interações registradas'}
          </p>
          <div className='flex gap-2'>
            <Button
              variant='ghost'
              onClick={loadInteractions}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
              />
              Atualizar
            </Button>
            <Button onClick={onClose}>Fechar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}



