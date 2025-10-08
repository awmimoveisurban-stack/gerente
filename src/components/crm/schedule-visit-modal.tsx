import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useVisits } from "@/hooks/use-visits";
import type { Lead } from "@/hooks/use-leads";

interface ScheduleVisitModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ScheduleVisitModal({ lead, isOpen, onClose }: ScheduleVisitModalProps) {
  const { toast } = useToast();
  const { createVisit } = useVisits();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleScheduleVisit = async () => {
    if (!date || !time || !address || !lead) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios (data, horário e endereço).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const dataVisita = new Date(`${date.toISOString().split('T')[0]}T${time}`);
      
      await createVisit({
        lead_id: lead.id,
        data_visita: dataVisita.toISOString(),
        endereco: address,
        observacoes: notes,
        status: "agendada",
      });
      
      toast({
        title: "Visita agendada",
        description: `Visita agendada com ${lead?.nome} para ${format(date, 'dd/MM/yyyy', { locale: ptBR })} às ${time}`,
      });
      
      // Reset e fechar modal
      setDate(undefined);
      setTime("");
      setAddress("");
      setNotes("");
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao agendar visita",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!lead) return null;

  // Gerar horários disponíveis
  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Agendar Visita - {lead.nome}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações do cliente */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="font-medium">{lead.nome}</p>
            <p className="text-sm text-muted-foreground">{lead.telefone} • {lead.email}</p>
            <p className="text-sm text-muted-foreground mt-1">
              <strong>Interesse:</strong> {lead.imovel_interesse}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Data */}
            <div className="space-y-2">
              <Label>Data da Visita *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Horário */}
            <div className="space-y-2">
              <Label htmlFor="time">Horário *</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o horário" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {slot}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-2">
            <Label htmlFor="address">Endereço da Visita *</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Digite o endereço completo do imóvel..."
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informações adicionais sobre a visita, instruções especiais, etc..."
              rows={4}
            />
          </div>

          {/* Resumo da visita */}
          {date && time && (
            <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
              <h4 className="font-medium mb-2">Resumo da Visita</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Cliente:</strong> {lead.nome}</p>
                <p><strong>Data:</strong> {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                <p><strong>Horário:</strong> {time}</p>
                {address && <p><strong>Local:</strong> {address}</p>}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleScheduleVisit} disabled={isSubmitting}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {isSubmitting ? "Agendando..." : "Agendar Visita"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}