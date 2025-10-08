import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

import type { Lead } from "@/hooks/use-leads";

interface EmailLeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

const emailTemplates = {
  primeiro_contato: {
    subject: "Obrigado pelo seu interesse - {{nome}}",
    body: `Olá {{nome}},

Obrigado por demonstrar interesse em nossos imóveis!

Vi que você tem interesse em: {{imovel_interesse}}

Gostaria de agendar uma conversa para entender melhor suas necessidades e apresentar as melhores opções disponíveis.

Quando seria um bom horário para conversarmos?

Atenciosamente,
{{corretor}}`
  },
  seguimento: {
    subject: "Continuamos aqui para ajudar - {{nome}}",
    body: `Olá {{nome}},

Espero que esteja bem! 

Entrei em contato recentemente sobre seu interesse em imóveis e gostaria de saber como posso ajudá-lo(a) hoje.

Temos algumas novidades que podem ser do seu interesse.

Posso ligar para conversarmos melhor?

Atenciosamente,
{{corretor}}`
  },
  proposta: {
    subject: "Proposta personalizada para você - {{nome}}",
    body: `Olá {{nome}},

Conforme nossa última conversa, preparei uma proposta personalizada para seu perfil.

Anexei os detalhes da proposta e gostaria de agendar uma reunião para apresentá-la pessoalmente.

Quando teria disponibilidade para nos encontrarmos?

Atenciosamente,
{{corretor}}`
  }
};

export function EmailLeadModal({ lead, isOpen, onClose }: EmailLeadModalProps) {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [body, setBody] = useState<string>("");

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    if (template && lead) {
      const templateData = emailTemplates[template as keyof typeof emailTemplates];
      setSubject(templateData.subject.replace('{{nome}}', lead.nome));
      setBody(templateData.body
        .replace(/{{nome}}/g, lead.nome)
        .replace(/{{imovel_interesse}}/g, lead.imovel_interesse)
        .replace(/{{corretor}}/g, 'João Silva')
      );
    }
  };

  const handleSendEmail = () => {
    if (!subject || !body) {
      toast({
        title: "Erro",
        description: "Preencha o assunto e o conteúdo do email.",
        variant: "destructive",
      });
      return;
    }

    // Simular envio do email
    toast({
      title: "Email enviado",
      description: `Email enviado com sucesso para ${lead?.nome}`,
    });
    
    // Reset e fechar modal
    setSelectedTemplate("");
    setSubject("");
    setBody("");
    onClose();
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Enviar Email para {lead.nome}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações do destinatário */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="font-medium">{lead.nome}</p>
            <p className="text-sm text-muted-foreground">{lead.email}</p>
          </div>

          {/* Seletor de template */}
          <div className="space-y-2">
            <Label htmlFor="template">Template de Email</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um template ou escreva do zero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primeiro_contato">Primeiro Contato</SelectItem>
                <SelectItem value="seguimento">Seguimento</SelectItem>
                <SelectItem value="proposta">Proposta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assunto do email */}
          <div className="space-y-2">
            <Label htmlFor="subject">Assunto *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Digite o assunto do email..."
            />
          </div>

          {/* Conteúdo do email */}
          <div className="space-y-2">
            <Label htmlFor="body">Conteúdo *</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Digite o conteúdo do email..."
              rows={12}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSendEmail}>
            <Send className="mr-2 h-4 w-4" />
            Enviar Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}