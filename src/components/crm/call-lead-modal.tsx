import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Phone, PhoneCall } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

import type { Lead } from '@/hooks/use-leads';

interface CallLeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CallLeadModal({ lead, isOpen, onClose }: CallLeadModalProps) {
  const { toast } = useToast();
  const [callResult, setCallResult] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isCallStarted, setIsCallStarted] = useState(false);

  const handleStartCall = () => {
    setIsCallStarted(true);
    // Simular início da ligação
    toast({
      title: 'Ligação iniciada',
      description: `Discando para ${lead?.nome} - ${lead?.telefone}`,
    });
  };

  const handleEndCall = () => {
    if (!callResult) {
      toast({
        title: 'Erro',
        description: 'Selecione o resultado da ligação.',
        variant: 'destructive',
      });
      return;
    }

    // Salvar resultado da ligação
    toast({
      title: 'Ligação registrada',
      description: 'O resultado da ligação foi salvo com sucesso.',
    });

    // Reset e fechar modal
    setCallResult('');
    setNotes('');
    setIsCallStarted(false);
    onClose();
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Phone className='h-5 w-5' />
            Ligar para {lead.nome}
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Informações do contato */}
          <div className='bg-muted/50 p-4 rounded-lg'>
            <div className='flex items-center gap-3 mb-2'>
              <PhoneCall className='h-4 w-4 text-muted-foreground' />
              <span className='font-medium'>{lead.telefone}</span>
            </div>
            <p className='text-sm text-muted-foreground'>{lead.email}</p>
          </div>

          {/* Controle da ligação */}
          {!isCallStarted ? (
            <div className='text-center'>
              <Button
                onClick={handleStartCall}
                size='lg'
                className='w-full bg-green-600 hover:bg-green-700'
              >
                <Phone className='mr-2 h-5 w-5' />
                Iniciar Ligação
              </Button>
            </div>
          ) : (
            <div className='space-y-4'>
              <div className='text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg'>
                <div className='animate-pulse text-green-600 dark:text-green-400'>
                  <PhoneCall className='h-8 w-8 mx-auto mb-2' />
                  <p className='font-medium'>Ligação em andamento...</p>
                  <p className='text-sm text-muted-foreground'>
                    {lead.telefone}
                  </p>
                </div>
              </div>

              {/* Resultado da ligação */}
              <div className='space-y-2'>
                <Label htmlFor='callResult'>Resultado da Ligação *</Label>
                <Select value={callResult} onValueChange={setCallResult}>
                  <SelectTrigger>
                    <SelectValue placeholder='Selecione o resultado' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='atendeu'>Atendeu</SelectItem>
                    <SelectItem value='nao-atendeu'>Não atendeu</SelectItem>
                    <SelectItem value='ocupado'>Ocupado</SelectItem>
                    <SelectItem value='caixa-postal'>Caixa postal</SelectItem>
                    <SelectItem value='numero-incorreto'>
                      Número incorreto
                    </SelectItem>
                    <SelectItem value='interessado'>
                      Interessado - Agendar reunião
                    </SelectItem>
                    <SelectItem value='nao-interessado'>
                      Não interessado
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notas */}
              <div className='space-y-2'>
                <Label htmlFor='notes'>Observações</Label>
                <Textarea
                  id='notes'
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder='Descreva o que foi conversado na ligação...'
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        {isCallStarted && (
          <DialogFooter>
            <Button variant='outline' onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleEndCall}
              className='bg-red-600 hover:bg-red-700'
            >
              <Phone className='mr-2 h-4 w-4' />
              Encerrar Ligação
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
