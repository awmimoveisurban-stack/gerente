import { memo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Plus,
  LayoutGrid,
  BarChart3,
  Users,
  Calendar,
  Phone,
  MessageSquare,
  Target,
  FileText,
  TrendingUp,
} from 'lucide-react';

interface QuickActionsProps {
  onAddLead: () => void;
  onViewKanban: () => void;
  onViewReports: () => void;
  onViewAllLeads: () => void;
  onScheduleVisit: () => void;
  onMakeCall: () => void;
  onSendMessage: () => void;
  onCreateTask: () => void;
  onSendProposal: () => void;
  onViewAnalytics: () => void;
}

export const QuickActions = memo(function QuickActions({
  onAddLead,
  onViewKanban,
  onViewReports,
  onViewAllLeads,
  onScheduleVisit,
  onMakeCall,
  onSendMessage,
  onCreateTask,
  onSendProposal,
  onViewAnalytics,
}: QuickActionsProps) {
  return (
    <Card className='bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg'>
      <CardHeader className='bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-b border-orange-200/50 dark:border-orange-800/50'>
        <div>
          <CardTitle className='text-xl font-bold text-orange-800 dark:text-orange-200 flex items-center gap-2'>
            <div className='p-1.5 bg-orange-500 rounded-lg'>
              <Target className='h-4 w-4 text-white' />
            </div>
            Ações Rápidas
          </CardTitle>
          <CardDescription className='text-orange-600 dark:text-orange-400 mt-1'>
            ⚡ Acesso rápido às principais funcionalidades
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className='p-6'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
          {/* Adicionar Lead */}
          <Button
            onClick={onAddLead}
            className='h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200'
            aria-label='Adicionar novo lead'
          >
            <Plus className='h-6 w-6' />
            <span className='text-sm font-medium'>Novo Lead</span>
          </Button>

          {/* Ver Kanban */}
          <Button
            onClick={onViewKanban}
            variant='outline'
            className='h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-900/40 dark:hover:to-purple-800/40 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 shadow-lg hover:shadow-xl transition-all duration-200'
            aria-label='Ver quadro Kanban'
          >
            <LayoutGrid className='h-6 w-6' />
            <span className='text-sm font-medium'>Kanban</span>
          </Button>

          {/* Relatórios */}
          <Button
            onClick={onViewReports}
            variant='outline'
            className='h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 hover:from-green-100 hover:to-green-200 dark:hover:from-green-900/40 dark:hover:to-green-800/40 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 shadow-lg hover:shadow-xl transition-all duration-200'
            aria-label='Ver relatórios'
          >
            <BarChart3 className='h-6 w-6' />
            <span className='text-sm font-medium'>Relatórios</span>
          </Button>

          {/* Todos os Leads */}
          <Button
            onClick={onViewAllLeads}
            variant='outline'
            className='h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/30 hover:from-indigo-100 hover:to-indigo-200 dark:hover:from-indigo-900/40 dark:hover:to-indigo-800/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-200 shadow-lg hover:shadow-xl transition-all duration-200'
            aria-label='Ver todos os leads'
          >
            <Users className='h-6 w-6' />
            <span className='text-sm font-medium'>Todos Leads</span>
          </Button>

          {/* Analytics */}
          <Button
            onClick={onViewAnalytics}
            variant='outline'
            className='h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/30 dark:to-teal-900/30 hover:from-teal-100 hover:to-teal-200 dark:hover:from-teal-900/40 dark:hover:to-teal-800/40 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:text-teal-800 dark:hover:text-teal-200 shadow-lg hover:shadow-xl transition-all duration-200'
            aria-label='Ver analytics'
          >
            <TrendingUp className='h-6 w-6' />
            <span className='text-sm font-medium'>Analytics</span>
          </Button>

          {/* Agendar Visita */}
          <Button
            onClick={onScheduleVisit}
            variant='outline'
            className='h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30 hover:from-amber-100 hover:to-amber-200 dark:hover:from-amber-900/40 dark:hover:to-amber-800/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 shadow-lg hover:shadow-xl transition-all duration-200'
            aria-label='Agendar visita'
          >
            <Calendar className='h-6 w-6' />
            <span className='text-sm font-medium'>Agendar Visita</span>
          </Button>

          {/* Fazer Ligação */}
          <Button
            onClick={onMakeCall}
            variant='outline'
            className='h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30 hover:from-emerald-100 hover:to-emerald-200 dark:hover:from-emerald-900/40 dark:hover:to-emerald-800/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 shadow-lg hover:shadow-xl transition-all duration-200'
            aria-label='Fazer ligação'
          >
            <Phone className='h-6 w-6' />
            <span className='text-sm font-medium'>Fazer Ligação</span>
          </Button>

          {/* Enviar Mensagem */}
          <Button
            onClick={onSendMessage}
            variant='outline'
            className='h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 hover:from-green-100 hover:to-green-200 dark:hover:from-green-900/40 dark:hover:to-green-800/40 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 shadow-lg hover:shadow-xl transition-all duration-200'
            aria-label='Enviar mensagem'
          >
            <MessageSquare className='h-6 w-6' />
            <span className='text-sm font-medium'>Enviar Mensagem</span>
          </Button>

          {/* Criar Tarefa */}
          <Button
            onClick={onCreateTask}
            variant='outline'
            className='h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/30 hover:from-pink-100 hover:to-pink-200 dark:hover:from-pink-900/40 dark:hover:to-pink-800/40 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300 hover:text-pink-800 dark:hover:text-pink-200 shadow-lg hover:shadow-xl transition-all duration-200'
            aria-label='Criar tarefa'
          >
            <FileText className='h-6 w-6' />
            <span className='text-sm font-medium'>Criar Tarefa</span>
          </Button>

          {/* Enviar Proposta */}
          <Button
            onClick={onSendProposal}
            variant='outline'
            className='h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/30 dark:to-rose-900/30 hover:from-rose-100 hover:to-rose-200 dark:hover:from-rose-900/40 dark:hover:to-rose-800/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:text-rose-800 dark:hover:text-rose-200 shadow-lg hover:shadow-xl transition-all duration-200'
            aria-label='Enviar proposta'
          >
            <Target className='h-6 w-6' />
            <span className='text-sm font-medium'>Enviar Proposta</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
