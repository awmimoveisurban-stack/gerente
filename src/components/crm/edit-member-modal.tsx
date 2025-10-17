import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useProfiles, type Profile } from '@/hooks/use-profiles';
import { User, Mail, Phone, Briefcase } from 'lucide-react';

interface EditMemberModalProps {
  profile: Profile | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditMemberModal({
  profile,
  isOpen,
  onClose,
}: EditMemberModalProps) {
  const { toast } = useToast();
  const { updateProfile } = useProfiles();
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        nome: profile.nome,
        telefone: profile.telefone,
        email: profile.email,
        cargo: profile.cargo,
        ativo: profile.ativo,
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile || !formData.nome || !formData.email) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await updateProfile(profile.user_id, formData);
      onClose();
    } catch (error) {
      // Toast já foi mostrado pelo hook
      console.error('Erro ao atualizar membro:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Editar Membro - {profile.nome}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-2'>
            <Label htmlFor='nome' className='flex items-center gap-2'>
              <User className='h-4 w-4' />
              Nome *
            </Label>
            <Input
              id='nome'
              value={formData.nome || ''}
              onChange={e =>
                setFormData(prev => ({ ...prev, nome: e.target.value }))
              }
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email' className='flex items-center gap-2'>
              <Mail className='h-4 w-4' />
              Email *
            </Label>
            <Input
              id='email'
              type='email'
              value={formData.email || ''}
              onChange={e =>
                setFormData(prev => ({ ...prev, email: e.target.value }))
              }
              required
              disabled
              className='bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
            />
            <p className='text-xs text-gray-500'>
              O email não pode ser alterado após a criação
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='telefone' className='flex items-center gap-2'>
              <Phone className='h-4 w-4' />
              Telefone
            </Label>
            <Input
              id='telefone'
              value={formData.telefone || ''}
              onChange={e =>
                setFormData(prev => ({ ...prev, telefone: e.target.value }))
              }
              placeholder='(11) 99999-9999'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='cargo' className='flex items-center gap-2'>
              <Briefcase className='h-4 w-4' />
              Cargo *
            </Label>
            <Select
              value={formData.cargo || ''}
              onValueChange={(value: 'corretor' | 'gerente') =>
                setFormData(prev => ({ ...prev, cargo: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Selecione o cargo' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='corretor'>Corretor</SelectItem>
                <SelectItem value='gerente'>Gerente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
