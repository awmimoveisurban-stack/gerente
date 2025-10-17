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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useProfiles } from '@/hooks/use-profiles';
import { UserPlus, User, Mail, Phone, Briefcase, Lock } from 'lucide-react';

interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MemberData {
  nome: string;
  email: string;
  telefone: string;
  login_nome: string;
  senha: string;
  cargo: 'corretor' | 'gerente';
}

export function AddMemberModal({ open, onOpenChange }: AddMemberModalProps) {
  const { toast } = useToast();
  const { createProfile } = useProfiles();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [memberData, setMemberData] = useState<MemberData>({
    nome: '',
    email: '',
    telefone: '',
    login_nome: '',
    senha: '',
    cargo: 'corretor',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!memberData.nome) {
      toast({
        title: 'Nome obrigatório',
        description: 'O nome do membro é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    // ✅ Validações específicas para corretores
    if (memberData.cargo === 'corretor') {
      if (!memberData.login_nome || memberData.login_nome.trim() === '') {
        toast({
          title: 'Nome de login obrigatório',
          description: 'O nome de login é obrigatório para corretores.',
          variant: 'destructive',
        });
        return;
      }

      if (!memberData.email || memberData.email.trim() === '') {
        toast({
          title: 'Email obrigatório',
          description: 'O email é obrigatório para corretores.',
          variant: 'destructive',
        });
        return;
      }

      if (!memberData.senha || memberData.senha.trim() === '' || memberData.senha.length < 4) {
        toast({
          title: 'Senha obrigatória',
          description: 'A senha deve ter pelo menos 4 caracteres.',
          variant: 'destructive',
        });
        return;
      }
    }

    // ✅ Validação de email para todos os usuários
    if (memberData.email && !memberData.email.includes('@')) {
      toast({
        title: 'Email inválido',
        description: 'Por favor, forneça um email válido.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createProfile({
        nome: memberData.nome,
        email: memberData.email || '',
        telefone: memberData.telefone,
        login_nome: memberData.login_nome,
        senha: memberData.senha,
        cargo: memberData.cargo,
      });

      // Reset form
      setMemberData({
        nome: '',
        email: '',
        telefone: '',
        login_nome: '',
        senha: '',
        cargo: 'corretor',
      });

      onOpenChange(false);
    } catch (error) {
      // Toast já foi mostrado pelo hook
      console.error('Erro ao criar membro:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof MemberData, value: string) => {
    setMemberData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <UserPlus className='h-5 w-5 text-primary' />
            Adicionar Membro à Equipe
          </DialogTitle>
          <DialogDescription>
            Adicione um novo membro à equipe. Para corretores, nome de login, email e senha são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='nome' className='flex items-center gap-2'>
              <User className='h-4 w-4' />
              Nome completo *
            </Label>
            <Input
              id='nome'
              value={memberData.nome}
              onChange={e => handleInputChange('nome', e.target.value)}
              placeholder='Ex: João Silva'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email' className='flex items-center gap-2'>
              <Mail className='h-4 w-4' />
              Email {memberData.cargo === 'corretor' ? '*' : '(opcional)'}
            </Label>
            <Input
              id='email'
              type='email'
              value={memberData.email}
              onChange={e => handleInputChange('email', e.target.value)}
              placeholder='Ex: joao@imobiliaria.com'
              required={memberData.cargo === 'corretor'}
            />
            {memberData.cargo === 'corretor' && (
              <p className='text-xs text-gray-500'>
                Email obrigatório para corretores
              </p>
            )}
          </div>

          {/* Campos específicos para corretores */}
          {memberData.cargo === 'corretor' && (
            <>
              <div className='space-y-2'>
                <Label htmlFor='login_nome' className='flex items-center gap-2'>
                  <User className='h-4 w-4' />
                  Nome de Login *
                </Label>
                <Input
                  id='login_nome'
                  value={memberData.login_nome}
                  onChange={e => handleInputChange('login_nome', e.target.value)}
                  placeholder='Ex: joao.silva'
                  required
                />
                <p className='text-xs text-gray-500'>
                  Nome usado para fazer login no sistema
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='senha' className='flex items-center gap-2'>
                  <Lock className='h-4 w-4' />
                  Senha *
                </Label>
                <Input
                  id='senha'
                  type='password'
                  value={memberData.senha}
                  onChange={e => handleInputChange('senha', e.target.value)}
                  placeholder='Mínimo 4 caracteres'
                  minLength={4}
                  required
                />
                <p className='text-xs text-gray-500'>
                  Senha para acessar o sistema
                </p>
              </div>
            </>
          )}

          <div className='space-y-2'>
            <Label htmlFor='telefone' className='flex items-center gap-2'>
              <Phone className='h-4 w-4' />
              Telefone
            </Label>
            <Input
              id='telefone'
              value={memberData.telefone}
              onChange={e => handleInputChange('telefone', e.target.value)}
              placeholder='(11) 99999-9999'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='cargo' className='flex items-center gap-2'>
              <Briefcase className='h-4 w-4' />
              Cargo *
            </Label>
            <Select
              value={memberData.cargo}
              onValueChange={(value: 'corretor' | 'gerente') =>
                handleInputChange('cargo', value)
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
            <p className='text-xs text-gray-500'>
              {memberData.cargo === 'corretor' 
                ? '✅ Corretor fará login com nome de usuário, email e senha'
                : '⚠️ Gerente precisará fazer login com email/senha'
              }
            </p>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Adicionando...' : 'Adicionar Membro'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

