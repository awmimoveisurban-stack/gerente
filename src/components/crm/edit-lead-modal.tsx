import { useState, useEffect } from 'react';
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
import { useLeadsSimple, type Lead } from '@/hooks/use-leads-simple';
import { StatusBadge } from '@/components/crm/status-badge';
import { Loader2, Save, X } from 'lucide-react';

interface EditLeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditLeadModal({ lead, isOpen, onClose, onSuccess }: EditLeadModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    status: '',
    origem: '',
    observacoes: '',
    valor_interesse: '',
    tipo_imovel: '',
    localizacao: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { updateLead } = useLeadsSimple();

  // Preencher formulário quando lead mudar
  useEffect(() => {
    if (lead) {
      setFormData({
        nome: lead.nome || '',
        email: lead.email || '',
        telefone: lead.telefone || '',
        status: lead.status || 'novo',
        origem: lead.origem || 'manual',
        observacoes: lead.observacoes || '',
        valor_interesse: lead.valor_interesse?.toString() || '',
        tipo_imovel: lead.tipo_imovel || '',
        localizacao: lead.localizacao || '',
      });
    }
  }, [lead]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lead) {
      toast({
        title: '❌ Erro',
        description: 'Lead não encontrado para edição.',
        variant: 'destructive',
      });
      return;
    }

    // ✅ Validações básicas
    if (!formData.nome.trim()) {
      toast({
        title: '❌ Nome obrigatório',
        description: 'O nome do lead é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.telefone.trim()) {
      toast({
        title: '❌ Telefone obrigatório',
        description: 'O telefone do lead é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const updateData = {
        nome: formData.nome.trim(),
        email: formData.email.trim() || null,
        telefone: formData.telefone.trim(),
        status: formData.status,
        origem: formData.origem,
        observacoes: formData.observacoes.trim() || null,
        valor_interesse: formData.valor_interesse ? parseFloat(formData.valor_interesse) : null,
        tipo_imovel: formData.tipo_imovel.trim() || null,
        localizacao: formData.localizacao.trim() || null,
      };

      console.log('📝 Dados para atualização:', updateData);
      console.log('🆔 ID do lead:', lead.id);

      const result = await updateLead(lead.id, updateData);
      console.log('✅ Resultado da atualização:', result);

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('❌ Erro detalhado ao atualizar lead:', error);
      toast({
        title: '❌ Erro ao Atualizar',
        description: error.message || 'Não foi possível atualizar o lead. Verifique os dados e tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>✏️ Editar Lead</span>
            <StatusBadge status={formData.status as any} />
          </DialogTitle>
          <DialogDescription>
            Atualize as informações do lead <strong>{lead.nome}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Nome do cliente"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="email@exemplo.com"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                placeholder="(11) 99999-9999"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="novo">🆕 Novo</SelectItem>
                  <SelectItem value="contato_iniciado">📞 Contato Iniciado</SelectItem>
                  <SelectItem value="qualificado">✅ Qualificado</SelectItem>
                  <SelectItem value="proposta_enviada">📋 Proposta Enviada</SelectItem>
                  <SelectItem value="negociacao">🤝 Negociação</SelectItem>
                  <SelectItem value="fechado">🎯 Fechado</SelectItem>
                  <SelectItem value="perdido">❌ Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Informações do Imóvel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo_imovel">Tipo de Imóvel</Label>
              <Select
                value={formData.tipo_imovel}
                onValueChange={(value) => handleInputChange('tipo_imovel', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartamento">🏢 Apartamento</SelectItem>
                  <SelectItem value="casa">🏠 Casa</SelectItem>
                  <SelectItem value="terreno">🏞️ Terreno</SelectItem>
                  <SelectItem value="comercial">🏪 Comercial</SelectItem>
                  <SelectItem value="rural">🚜 Rural</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="localizacao">Localização</Label>
              <Input
                id="localizacao"
                value={formData.localizacao}
                onChange={(e) => handleInputChange('localizacao', e.target.value)}
                placeholder="Bairro, cidade ou região"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor_interesse">Valor de Interesse (R$)</Label>
              <Input
                id="valor_interesse"
                type="number"
                value={formData.valor_interesse}
                onChange={(e) => handleInputChange('valor_interesse', e.target.value)}
                placeholder="500000"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="origem">Origem</Label>
              <Select
                value={formData.origem}
                onValueChange={(value) => handleInputChange('origem', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Como chegou até nós" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                  <SelectItem value="site">🌐 Site</SelectItem>
                  <SelectItem value="indicacao">👥 Indicação</SelectItem>
                  <SelectItem value="manual">✋ Manual</SelectItem>
                  <SelectItem value="facebook">📘 Facebook</SelectItem>
                  <SelectItem value="instagram">📷 Instagram</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              placeholder="Anotações importantes sobre o cliente..."
              rows={4}
              disabled={isLoading}
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.nome.trim() || !formData.telefone.trim()}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}