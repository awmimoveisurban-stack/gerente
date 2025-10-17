import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { RefreshCw, User } from 'lucide-react';
import { Lead } from '@/hooks/use-leads';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ReassignLeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  profiles: Array<{ id: string; email: string; full_name: string }>;
  onSuccess?: () => void;
}

export function ReassignLeadModal({
  lead,
  isOpen,
  onClose,
  profiles,
  onSuccess,
}: ReassignLeadModalProps) {
  const { toast } = useToast();
  const [selectedCorretorId, setSelectedCorretorId] = useState<string>('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReassign = async () => {
    if (!lead || !selectedCorretorId) {
      toast({
        title: 'Erro',
        description: 'Selecione um corretor para reatribuir o lead.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Atualizar lead
      const { error } = await supabase
        .from('leads')
        .update({
          atribuido_a: selectedCorretorId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', lead.id);

      if (error) throw error;

      // Registrar interação
      try {
        await supabase.from('lead_interactions').insert({
          lead_id: lead.id,
          user_id: lead.user_id,
          tipo: 'reatribuicao',
          conteudo: reason || 'Lead reatribuído',
          metadata: {
            old_corretor: lead.atribuido_a,
            new_corretor: selectedCorretorId,
            reason: reason,
          },
        });
      } catch (interactionError) {
        console.error('Erro ao registrar interação:', interactionError);
        // Não bloquear o sucesso da reatribuição
      }

      toast({
        title: '✅ Lead Reatribuído',
        description: `${lead.nome} foi reatribuído com sucesso!`,
      });

      // Limpar form
      setSelectedCorretorId('');
      setReason('');

      // Callback de sucesso
      if (onSuccess) onSuccess();

      onClose();
    } catch (error: any) {
      console.error('Erro ao reatribuir lead:', error);
      toast({
        title: '❌ Erro ao Reatribuir',
        description: error.message || 'Ocorreu um erro ao reatribuir o lead.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts
      .map(p => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const getCurrentCorretor = () => {
    if (!lead?.atribuido_a) return null;
    return profiles.find(p => p.id === lead.atribuido_a);
  };

  const currentCorretor = getCurrentCorretor();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <RefreshCw className='h-5 w-5 text-blue-600' />
            Reatribuir Lead
          </DialogTitle>
          <DialogDescription>
            Reatribua o lead <strong>{lead?.nome}</strong> para outro corretor.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {/* Corretor Atual */}
          {currentCorretor && (
            <div className='p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'>
              <Label className='text-xs text-gray-600 dark:text-gray-400 mb-2 block'>
                Corretor Atual
              </Label>
              <div className='flex items-center gap-2'>
                <Avatar className='h-8 w-8'>
                  <AvatarFallback className='bg-gray-600 text-white text-xs'>
                    {getInitials(
                      currentCorretor.full_name || currentCorretor.email
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className='font-medium text-sm text-gray-900 dark:text-white'>
                    {currentCorretor.full_name || currentCorretor.email}
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    {currentCorretor.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Novo Corretor */}
          <div className='space-y-2'>
            <Label htmlFor='corretor'>Novo Corretor *</Label>
            <Select
              value={selectedCorretorId}
              onValueChange={setSelectedCorretorId}
            >
              <SelectTrigger id='corretor'>
                <SelectValue placeholder='Selecione um corretor...' />
              </SelectTrigger>
              <SelectContent>
                {profiles
                  .filter(p => p.id !== lead?.atribuido_a) // Não mostrar corretor atual
                  .map(profile => (
                    <SelectItem key={profile.id} value={profile.id}>
                      <div className='flex items-center gap-2'>
                        <User className='h-4 w-4' />
                        <span>{profile.full_name || profile.email}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Motivo */}
          <div className='space-y-2'>
            <Label htmlFor='reason'>Motivo (opcional)</Label>
            <Textarea
              id='reason'
              placeholder='Ex: Sobrecarga de trabalho, especialidade, região, etc...'
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              className='resize-none'
            />
          </div>

          {/* Info */}
          <div className='bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800'>
            <p className='text-xs text-blue-700 dark:text-blue-300'>
              💡 <strong>Dica:</strong> O corretor anterior ainda poderá
              visualizar o histórico do lead, mas não poderá mais editá-lo.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleReassign}
            disabled={!selectedCorretorId || isSubmitting}
            className='bg-blue-600 hover:bg-blue-700'
          >
            {isSubmitting ? (
              <>
                <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                Reatribuindo...
              </>
            ) : (
              <>
                <RefreshCw className='mr-2 h-4 w-4' />
                Reatribuir Lead
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



