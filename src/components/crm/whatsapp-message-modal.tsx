import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MessageCircle, Loader2, Send, Sparkles } from "lucide-react";
import type { Lead } from "@/hooks/use-leads";
import { useEvolutionSend } from "@/hooks/use-evolution-send";

interface WhatsAppMessageModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

const messageTemplates = {
  primeiro_contato: {
    name: "Primeiro Contato",
    content: "Olá {{nome}}! 👋\n\nSou da equipe de vendas e vi seu interesse em {{imovel_interesse}}.\n\nGostaria de agendar uma conversa para te mostrar mais detalhes sobre este imóvel?\n\nEstou à disposição!"
  },
  seguimento: {
    name: "Follow-up",
    content: "Oi {{nome}}! 😊\n\nTudo bem? Estou entrando em contato para saber se ainda tem interesse em {{imovel_interesse}}.\n\nTemos novidades que podem te interessar!\n\nPodemos conversar?"
  },
  agendamento_visita: {
    name: "Agendamento de Visita",
    content: "Olá {{nome}}! 🏡\n\nConfirmo o agendamento da visita ao imóvel:\n📍 {{imovel_interesse}}\n\nEstou ansioso para te mostrar este imóvel incrível!\n\nQualquer dúvida, estou por aqui!"
  },
  proposta: {
    name: "Envio de Proposta",
    content: "Oi {{nome}}! 📄\n\nConforme conversamos, segue a proposta para {{imovel_interesse}}.\n\nValor: {{valor_interesse}}\n\nEstou à disposição para esclarecer qualquer dúvida!\n\nVamos fechar negócio? 🤝"
  }
};

export function WhatsAppMessageModal({ lead, isOpen, onClose }: WhatsAppMessageModalProps) {
  const { sendMessage: sendEvolutionMessage, isSending } = useEvolutionSend();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [message, setMessage] = useState("");

  const handleTemplateChange = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    if (templateKey && lead) {
      let templateContent = messageTemplates[templateKey as keyof typeof messageTemplates].content;
      templateContent = templateContent
        .replace(/\{\{nome\}\}/g, lead.nome)
        .replace(/\{\{imovel_interesse\}\}/g, lead.imovel_interesse || "")
        .replace(/\{\{valor_interesse\}\}/g, lead.valor_interesse?.toString() || "");
      setMessage(templateContent);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !lead) {
      toast.error("Por favor, escreva uma mensagem");
      return;
    }

    if (!lead.telefone) {
      toast.error("Este lead não possui número de telefone cadastrado");
      return;
    }

    try {
      // Limpar o telefone (remover caracteres especiais)
      const phoneNumber = lead.telefone.replace(/\D/g, '');
      
      // Enviar via Evolution API
      const result = await sendEvolutionMessage(phoneNumber, message, lead.id);

      if (result.success) {
        setMessage("");
        setSelectedTemplate("");
        onClose();
      } else {
        throw new Error(result.error || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      toast.error(error instanceof Error ? error.message : "Erro ao enviar mensagem");
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            Enviar Mensagem WhatsApp
            <Badge className="bg-green-500 text-white ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              Green-API
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações do Lead */}
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{lead.nome}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{lead.telefone}</p>
                {lead.origem === 'whatsapp_green_api' && (
                  <Badge className="mt-2 bg-green-500 text-white text-xs">
                    Lead do WhatsApp
                  </Badge>
                )}
              </div>
              {lead.score && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {lead.score}
                  </div>
                  <div className="text-xs text-gray-500">Score IA</div>
                </div>
              )}
            </div>
          </div>

          {/* Seleção de Template */}
          <div className="space-y-2">
            <Label>Template de Mensagem</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(messageTemplates).map(([key, template]) => (
                  <SelectItem key={key} value={key}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campo de Mensagem */}
          <div className="space-y-2">
            <Label>Mensagem</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem aqui..."
              className="min-h-[200px]"
            />
            <p className="text-xs text-muted-foreground">
              {message.length} caracteres
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSendMessage} 
            disabled={isSending || !message.trim()}
            className="bg-green-600 hover:bg-green-700 gap-2 focus:ring-2 focus:ring-green-500"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando via WhatsApp...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Enviar Mensagem
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
