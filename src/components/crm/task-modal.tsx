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
import { CheckSquare, Calendar, Clock, AlertCircle, User } from 'lucide-react';
import { useTasks } from '@/hooks/use-tasks';
import { useLeads } from '@/hooks/use-leads';

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskTitle?: string;
}

interface TaskData {
  titulo: string;
  descricao: string;
  dataVencimento: string;
  horaVencimento: string;
  prioridade: string;
  categoria: string;
  leadRelacionado: string;
}

// Mock leads para associação
// Leads will be loaded from the useLeads hook

export function TaskModal({ open, onOpenChange, taskTitle }: TaskModalProps) {
  const { toast } = useToast();
  const { createTask } = useTasks();
  const { leads } = useLeads();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskData, setTaskData] = useState<TaskData>({
    titulo: taskTitle || '',
    descricao: '',
    dataVencimento: '',
    horaVencimento: '',
    prioridade: 'média',
    categoria: '',
    leadRelacionado: 'none',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskData.titulo || !taskData.dataVencimento) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Título e data de vencimento são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const dataVencimento = taskData.horaVencimento
        ? new Date(
            `${taskData.dataVencimento}T${taskData.horaVencimento}`
          ).toISOString()
        : new Date(taskData.dataVencimento).toISOString();

      await createTask({
        titulo: taskData.titulo,
        descricao: taskData.descricao,
        status: 'pendente',
        prioridade: taskData.prioridade,
        data_vencimento: dataVencimento,
        lead_id:
          taskData.leadRelacionado !== 'none'
            ? taskData.leadRelacionado
            : undefined,
      });

      const dataFormatada = new Date(
        taskData.dataVencimento
      ).toLocaleDateString('pt-BR');

      toast({
        title: 'Tarefa criada!',
        description: `"${taskData.titulo}" foi agendada para ${dataFormatada}.`,
      });

      // Reset form
      setTaskData({
        titulo: '',
        descricao: '',
        dataVencimento: '',
        horaVencimento: '',
        prioridade: 'média',
        categoria: '',
        leadRelacionado: 'none',
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro ao criar tarefa',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof TaskData, value: string) => {
    setTaskData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <CheckSquare className='h-5 w-5 text-primary' />
            Nova Tarefa
          </DialogTitle>
          <DialogDescription>
            Crie uma nova tarefa para organizar sua agenda e acompanhar
            atividades.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='col-span-2 space-y-2'>
              <Label htmlFor='titulo' className='flex items-center gap-2'>
                <CheckSquare className='h-4 w-4' />
                Título da tarefa *
              </Label>
              <Input
                id='titulo'
                value={taskData.titulo}
                onChange={e => handleInputChange('titulo', e.target.value)}
                placeholder='Ex: Ligar para cliente sobre proposta'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='data' className='flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                Data de vencimento *
              </Label>
              <Input
                id='data'
                type='date'
                value={taskData.dataVencimento}
                onChange={e =>
                  handleInputChange('dataVencimento', e.target.value)
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
                value={taskData.horaVencimento}
                onChange={e =>
                  handleInputChange('horaVencimento', e.target.value)
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='prioridade' className='flex items-center gap-2'>
                <AlertCircle className='h-4 w-4' />
                Prioridade
              </Label>
              <Select
                value={taskData.prioridade}
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

            <div className='space-y-2'>
              <Label htmlFor='categoria'>Categoria</Label>
              <Select
                value={taskData.categoria}
                onValueChange={value => handleInputChange('categoria', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Selecione a categoria' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='prospeccao'>Prospecção</SelectItem>
                  <SelectItem value='followup'>Follow-up</SelectItem>
                  <SelectItem value='proposta'>Proposta</SelectItem>
                  <SelectItem value='contrato'>Contrato</SelectItem>
                  <SelectItem value='visita'>Visita</SelectItem>
                  <SelectItem value='administrativo'>Administrativo</SelectItem>
                  <SelectItem value='outros'>Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='col-span-2 space-y-2'>
              <Label htmlFor='lead' className='flex items-center gap-2'>
                <User className='h-4 w-4' />
                Lead relacionado
              </Label>
              <Select
                value={taskData.leadRelacionado}
                onValueChange={value =>
                  handleInputChange('leadRelacionado', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Associar a um lead' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='none'>Nenhum lead específico</SelectItem>
                  {leads.map(lead => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='col-span-2 space-y-2'>
              <Label htmlFor='descricao'>Descrição</Label>
              <Textarea
                id='descricao'
                value={taskData.descricao}
                onChange={e => handleInputChange('descricao', e.target.value)}
                placeholder='Detalhes sobre a tarefa, objetivos, observações...'
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
              {isSubmitting ? 'Criando...' : 'Criar Tarefa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
