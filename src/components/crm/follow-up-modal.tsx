import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLeads } from '@/hooks/use-leads';
import { Phone, Calendar, User, MessageSquare, Clock } from 'lucide-react';

interface FollowUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadName?: string;
}

interface FollowUpData {
  leadId: string;
  tipo: string;
  dataAgendada: string;
  horaAgendada: string;
  observacoes: string;
  prioridade: string;
}

export function FollowUpModal({
  open,
  onOpenChange,
  leadName,
}: FollowUpModalProps) {
  const { toast } = useToast();
  const { leads } = useLeads();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [followUpData, setFollowUpData] = useState<FollowUpData>({
    leadId: '',
    tipo: '',
    dataAgendada: '',
    horaAgendada: '',
    observacoes: '',
    prioridade: 'média',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !followUpData.leadId ||
      !followUpData.tipo ||
      !followUpData.dataAgendada
    ) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Lead, tipo de follow-up e data são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simular agendamento do follow-up
      await new Promise(resolve => setTimeout(resolve, 1000));

      const selectedLead = leads.find(lead => lead.id === followUpData.leadId);
      const dataFormatada = new Date(
        followUpData.dataAgendada
      ).toLocaleDateString('pt-BR');

      toast({
        title: 'Follow-up agendado!',
        description: `${followUpData.tipo} com ${selectedLead?.nome} agendado para ${dataFormatada}.`,
      });

      // Reset form
      setFollowUpData({
        leadId: '',
        tipo: '',
        dataAgendada: '',
        horaAgendada: '',
        observacoes: '',
        prioridade: 'média',
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro ao agendar follow-up',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FollowUpData, value: string) => {
    setFollowUpData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Phone className='h-5 w-5 text-primary' />
            Agendar Follow-up
          </DialogTitle>
          <DialogDescription>
            Agende um contato de follow-up com um lead para manter o
            relacionamento ativo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='col-span-2 space-y-2'>
              <Label htmlFor='lead' className='flex items-center gap-2'>
                <User className='h-4 w-4' />
                Selecionar Lead *
              </Label>
              <Select
                value={followUpData.leadId}
                onValueChange={value => handleInputChange('leadId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Escolha um lead' />
                </SelectTrigger>
                <SelectContent>
                  {leads.map(lead => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='col-span-2 space-y-2'>
              <Label htmlFor='tipo' className='flex items-center gap-2'>
                <MessageSquare className='h-4 w-4' />
                Tipo de Follow-up *
              </Label>
              <Select
                value={followUpData.tipo}
                onValueChange={value => handleInputChange('tipo', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Selecione o tipo' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ligacao'>Ligação telefônica</SelectItem>
                  <SelectItem value='whatsapp'>Mensagem WhatsApp</SelectItem>
                  <SelectItem value='email'>Email de acompanhamento</SelectItem>
                  <SelectItem value='reuniao'>Reunião presencial</SelectItem>
                  <SelectItem value='videochamada'>Videochamada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='data' className='flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                Data *
              </Label>
              <Input
                id='data'
                type='date'
                value={followUpData.dataAgendada}
                onChange={e =>
                  handleInputChange('dataAgendada', e.target.value)
                }
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='hora' className='flex items-center gap-2'>
                <Clock className='h-4 w-4' />
                Horário
              </Label>
              <Input
                id='hora'
                type='time'
                value={followUpData.horaAgendada}
                onChange={e =>
                  handleInputChange('horaAgendada', e.target.value)
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='prioridade'>Prioridade</Label>
              <Select
                value={followUpData.prioridade}
                onValueChange={value => handleInputChange('prioridade', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Selecione a prioridade' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='baixa'>Baixa</SelectItem>
                  <SelectItem value='média'>Média</SelectItem>
                  <SelectItem value='alta'>Alta</SelectItem>
                  <SelectItem value='urgente'>Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='col-span-2 space-y-2'>
              <Label htmlFor='observacoes'>Observações</Label>
              <Textarea
                id='observacoes'
                value={followUpData.observacoes}
                onChange={e => handleInputChange('observacoes', e.target.value)}
                placeholder='Assuntos a abordar, lembretes especiais...'
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Agendando...' : 'Agendar Follow-up'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
