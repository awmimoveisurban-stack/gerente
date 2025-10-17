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
import { Plus, User, Mail, Phone, Home, FileText, Loader2 } from 'lucide-react';
import { useLeadsSimple } from '@/hooks/use-leads-simple';
import {
  validateName,
  validateEmail,
  validateBrazilianPhone,
  sanitizeName,
  sanitizeEmail,
  sanitizePhoneNumber,
} from '@/utils/validators';

interface AddLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LeadData {
  nome: string;
  email: string;
  telefone: string;
  imovel_interesse: string;
  valor_interesse: string; // armazenado como string no form, convertido ao salvar
  observacoes: string;
  origem: string;
  prioridade: string;
}

export function AddLeadModal({ open, onOpenChange }: AddLeadModalProps) {
  const { toast } = useToast();
  const { createLead } = useLeadsSimple();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadData, setLeadData] = useState<LeadData>({
    nome: '',
    email: '',
    telefone: '',
    imovel_interesse: '',
    valor_interesse: '',
    observacoes: '',
    origem: '',
    prioridade: 'média',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ 1. VALIDAR CAMPOS OBRIGATÓRIOS
    if (!leadData.nome || !leadData.email || !leadData.telefone) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Nome, email e telefone são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    // ✅ 2. VALIDAR NOME
    const nameValidation = validateName(leadData.nome);
    if (!nameValidation.valid) {
      toast({
        title: 'Nome inválido',
        description: nameValidation.error,
        variant: 'destructive',
      });
      return;
    }

    // ✅ 3. VALIDAR EMAIL
    const emailValidation = validateEmail(leadData.email);
    if (!emailValidation.valid) {
      toast({
        title: 'Email inválido',
        description: emailValidation.error,
        variant: 'destructive',
      });
      return;
    }

    // ✅ 4. VALIDAR TELEFONE
    const phoneValidation = validateBrazilianPhone(leadData.telefone);
    if (!phoneValidation.valid) {
      toast({
        title: 'Telefone inválido',
        description: phoneValidation.error,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Helpers para moeda BRL
      const parseCurrencyBRL = (value: string): number | undefined => {
        if (!value) return undefined;
        const digits = value.replace(/\D/g, '');
        if (!digits) return undefined;
        // Converte centavos -> número
        return Number(digits) / 100;
      };

      // ✅ 5. SANITIZAR DADOS antes de enviar
      const sanitizedData = {
        nome: sanitizeName(leadData.nome),
        email: sanitizeEmail(leadData.email),
        telefone: sanitizePhoneNumber(leadData.telefone),
        imovel_interesse: leadData.imovel_interesse.trim(),
        valor_interesse: parseCurrencyBRL(leadData.valor_interesse),
        status: 'novo' as const,
        observacoes: leadData.observacoes.trim(),
        data_entrada: new Date().toISOString(),
        ultima_interacao: new Date().toISOString(),
      };

      await createLead(sanitizedData);

      toast({
        title: '✅ Lead criado com sucesso!',
        description: `${sanitizedData.nome} foi adicionado à sua lista de leads.`,
      });

      // Reset form
      setLeadData({
        nome: '',
        email: '',
        telefone: '',
        imovel_interesse: '',
        valor_interesse: '',
        observacoes: '',
        origem: '',
        prioridade: 'média',
      });

      onOpenChange(false);
    } catch (error: any) {
      // ✅ 6. MENSAGENS DE ERRO ESPECÍFICAS
      let title = 'Erro ao criar lead';
      let description = 'Tente novamente em alguns instantes.';

      if (error.code === '23505') {
        title = 'Lead duplicado';
        description = 'Já existe um lead com este email ou telefone.';
      } else if (error.code === '23503') {
        title = 'Erro de autenticação';
        description = 'Sua sessão expirou. Faça login novamente.';
      } else if (error.message?.includes('duplicate')) {
        title = 'Lead duplicado';
        description = 'Este lead já está cadastrado no sistema.';
      } else if (error.message) {
        description = error.message;
      }

      toast({
        title,
        description,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof LeadData, value: string) => {
    setLeadData(prev => ({ ...prev, [field]: value }));
  };

  // Máscara BRL para valor de interesse
  const formatCurrencyBRL = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    const intVal = BigInt(digits);
    const cents = intVal % 100n;
    const units = intVal / 100n;
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(Number(`${units}.${cents.toString().padStart(2, '0')}`));
    return formatted;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Plus className='h-5 w-5 text-primary' />
            Adicionar Novo Lead
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do novo lead para adicioná-lo ao sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='col-span-2 space-y-2'>
              <Label htmlFor='nome' className='flex items-center gap-2'>
                <User className='h-4 w-4' />
                Nome completo *
              </Label>
              <Input
                id='nome'
                value={leadData.nome}
                onChange={e => handleInputChange('nome', e.target.value)}
                placeholder='João Silva'
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
                value={leadData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                placeholder='joao@email.com'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='telefone' className='flex items-center gap-2'>
                <Phone className='h-4 w-4' />
                Telefone *
              </Label>
              <Input
                id='telefone'
                value={leadData.telefone}
                onChange={e => handleInputChange('telefone', e.target.value)}
                placeholder='(11) 99999-9999'
                required
              />
            </div>

            <div className='col-span-2 space-y-2'>
              <Label htmlFor='imovel' className='flex items-center gap-2'>
                <Home className='h-4 w-4' />
                Imóvel de interesse
              </Label>
              <Input
                id='imovel'
                value={leadData.imovel_interesse}
                onChange={e =>
                  handleInputChange('imovel_interesse', e.target.value)
                }
                placeholder='Apartamento 2 quartos em Copacabana'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='valor_interesse' className='flex items-center gap-2'>
                <span className='sr-only'>Valor de interesse</span>
                <Home className='h-4 w-4' />
                Valor de interesse (R$)
              </Label>
              <Input
                id='valor_interesse'
                type='text'
                inputMode='numeric'
                value={leadData.valor_interesse}
                onChange={e => {
                  const value = e.target.value;
                  const digits = value.replace(/\D/g, '');
                  const masked = formatCurrencyBRL(digits);
                  handleInputChange('valor_interesse', masked);
                }}
                placeholder='R$ 350.000,00'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='origem'>Origem do lead</Label>
              <Select
                value={leadData.origem}
                onValueChange={value => handleInputChange('origem', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Selecione a origem' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='website'>Website</SelectItem>
                  <SelectItem value='facebook'>Facebook</SelectItem>
                  <SelectItem value='instagram'>Instagram</SelectItem>
                  <SelectItem value='google'>Google Ads</SelectItem>
                  <SelectItem value='indicacao'>Indicação</SelectItem>
                  <SelectItem value='outros'>Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='prioridade'>Prioridade</Label>
              <Select
                value={leadData.prioridade}
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
              <Label htmlFor='observacoes' className='flex items-center gap-2'>
                <FileText className='h-4 w-4' />
                Observações
              </Label>
              <Textarea
                id='observacoes'
                value={leadData.observacoes}
                onChange={e => handleInputChange('observacoes', e.target.value)}
                placeholder='Informações adicionais sobre o lead...'
                rows={3}
              />
            </div>
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
              {isSubmitting && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              {isSubmitting ? 'Criando lead...' : 'Criar Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
