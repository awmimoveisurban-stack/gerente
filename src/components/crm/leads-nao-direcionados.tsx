import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle,
  Clock,
  User,
  Phone,
  MessageSquare,
  Target,
  Users,
  Timer,
  ArrowRight,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Lead } from '@/hooks/use-leads';

interface LeadsNaoDirecionadosProps {
  leads: Lead[];
  corretores: Array<{ email: string; nome: string }>;
  onLeadAtribuido: () => void;
}

export function LeadsNaoDirecionados({
  leads,
  corretores,
  onLeadAtribuido,
}: LeadsNaoDirecionadosProps) {
  const { toast } = useToast();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedCorretor, setSelectedCorretor] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Filtrar leads não direcionados (sem corretor ou com status 'novo' e sem corretor)
  const leadsNaoDirecionados = leads.filter(
    lead => !lead.corretor || lead.corretor === '' || lead.corretor === null
  );

  // Calcular tempo desde criação
  const getTempoCriacao = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  // Verificar se está próximo do auto-assign (1h30min)
  const isProximoAutoAssign = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    // Auto-assign em 2 horas (120 minutos)
    return diffMinutes >= 90; // Alerta aos 90 minutos
  };

  const handleAssignLead = async () => {
    if (!selectedLead || !selectedCorretor) return;

    setIsAssigning(true);
    try {
      const { error } = await supabase
        .from('leads')
        .update({
          corretor: selectedCorretor,
          status: 'contato_realizado',
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedLead.id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Lead atribuído com sucesso!',
        description: `Lead ${selectedLead.nome} foi atribuído ao corretor.`,
      });

      setSelectedLead(null);
      setSelectedCorretor('');
      onLeadAtribuido();
    } catch (error) {
      console.error('Erro ao atribuir lead:', error);
      toast({
        title: 'Erro ao atribuir lead',
        description: 'Não foi possível atribuir o lead. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  if (leadsNaoDirecionados.length === 0) {
    return (
      <Card className='bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg'>
        <CardHeader className='bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-green-200/50 dark:border-green-800/50'>
          <CardTitle className='text-xl font-bold text-green-800 dark:text-green-200 flex items-center gap-2'>
            <Target className='h-5 w-5' />
            Leads Não Direcionados
          </CardTitle>
          <CardDescription className='text-green-600 dark:text-green-400'>
            Todos os leads foram direcionados com sucesso!
          </CardDescription>
        </CardHeader>
        <CardContent className='p-6'>
          <div className='text-center py-8'>
            <div className='w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Target className='h-8 w-8 text-green-600 dark:text-green-400' />
            </div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
              Excelente trabalho!
            </h3>
            <p className='text-gray-600 dark:text-gray-400'>
              Não há leads aguardando direcionamento no momento.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg'>
      <CardHeader className='bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b border-red-200/50 dark:border-red-800/50'>
        <CardTitle className='text-xl font-bold text-red-800 dark:text-red-200 flex items-center gap-2'>
          <AlertTriangle className='h-5 w-5' />
          Leads Não Direcionados
          <Badge variant='destructive' className='ml-2'>
            {leadsNaoDirecionados.length}
          </Badge>
        </CardTitle>
        <CardDescription className='text-red-600 dark:text-red-400'>
          Leads aguardando direcionamento para corretores
        </CardDescription>
      </CardHeader>
      <CardContent className='p-6'>
        <Alert className='mb-6'>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription>
            <strong>Atente-se:</strong> Leads não direcionados em 2 horas serão
            automaticamente atribuídos seguindo um rodízio.
          </AlertDescription>
        </Alert>

        <div className='grid gap-4'>
          <AnimatePresence>
            {leadsNaoDirecionados.map(lead => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  isProximoAutoAssign(lead.created_at)
                    ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 bg-gray-50 dark:bg-gray-700/50'
                }`}
              >
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
                  <div className='flex items-start sm:items-center gap-3 sm:gap-4 min-w-0'>
                    <Avatar className='h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0'>
                      <AvatarFallback className='bg-blue-500 text-white'>
                        {getInitials(lead.nome || 'Lead')}
                      </AvatarFallback>
                    </Avatar>

                    <div className='flex-1 min-w-0'>
                      <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1'>
                        <h4 className='font-semibold text-gray-900 dark:text-white truncate'>
                          {lead.nome || 'Nome não informado'}
                        </h4>
                        {isProximoAutoAssign(lead.created_at) && (
                          <Badge variant='destructive' className='text-xs flex-shrink-0'>
                            <Timer className='h-3 w-3 mr-1' />
                            Urgente
                          </Badge>
                        )}
                      </div>

                      <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                        <div className='flex items-center gap-1'>
                          <Phone className='h-3 w-3 flex-shrink-0' />
                          <span className='truncate'>{lead.telefone}</span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <Clock className='h-3 w-3 flex-shrink-0' />
                          <span className='truncate'>{getTempoCriacao(lead.created_at)}</span>
                        </div>
                        {lead.score_ia && (
                          <div className='flex items-center gap-1'>
                            <Target className='h-3 w-3 flex-shrink-0' />
                            <span className='truncate'>Score: {lead.score_ia}</span>
                          </div>
                        )}
                      </div>

                      {lead.observacoes && (
                        <div className='flex items-start gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400'>
                          <MessageSquare className='h-3 w-3 flex-shrink-0 mt-0.5' />
                          <span className='line-clamp-2'>{lead.observacoes.substring(0, 100)}...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size='sm'
                        onClick={() => setSelectedLead(lead)}
                        className='bg-blue-600 hover:bg-blue-700'
                      >
                        <Users className='h-4 w-4 mr-2' />
                        Atribuir
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='sm:max-w-md'>
                      <DialogHeader>
                        <DialogTitle>Atribuir Lead</DialogTitle>
                        <DialogDescription>
                          Selecione o corretor para atribuir este lead.
                        </DialogDescription>
                      </DialogHeader>

                      <div className='space-y-4'>
                        <div className='p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                          <h4 className='font-semibold text-gray-900 dark:text-white mb-2'>
                            {selectedLead?.nome}
                          </h4>
                          <p className='text-sm text-gray-600 dark:text-gray-400'>
                            {selectedLead?.telefone}
                          </p>
                          <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                            Criado há{' '}
                            {selectedLead
                              ? getTempoCriacao(selectedLead.created_at)
                              : '0m'}
                          </p>
                        </div>

                        <div className='space-y-2'>
                          <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                            Selecione o Corretor:
                          </label>
                          <Select
                            value={selectedCorretor}
                            onValueChange={setSelectedCorretor}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder='Escolha um corretor' />
                            </SelectTrigger>
                            <SelectContent>
                              {corretores.map(corretor => (
                                <SelectItem
                                  key={corretor.email}
                                  value={corretor.email}
                                >
                                  {corretor.nome} ({corretor.email})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <Button
                          onClick={handleAssignLead}
                          disabled={!selectedCorretor || isAssigning}
                          className='w-full'
                        >
                          {isAssigning ? (
                            'Atribuindo...'
                          ) : (
                            <>
                              <ArrowRight className='h-4 w-4 mr-2' />
                              Atribuir Lead
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}



