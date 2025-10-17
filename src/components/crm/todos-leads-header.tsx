import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  Search,
  Download,
  BarChart3,
  Plus,
  Filter,
  RefreshCw,
} from 'lucide-react';

interface TodosLeadsHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onExportLeads: () => void;
  onViewReports: () => void;
  onAddLead: () => void;
  onRefresh: () => void;
  totalLeads: number;
}

export const TodosLeadsHeader = memo(function TodosLeadsHeader({
  searchTerm,
  onSearchChange,
  onExportLeads,
  onViewReports,
  onAddLead,
  onRefresh,
  totalLeads,
}: TodosLeadsHeaderProps) {
  return (
    <div className='bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-emerald-200/50 dark:border-gray-700/50'>
      <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4'>
        <div className='flex-1'>
          <h1 className='text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3'>
            <div className='p-2 bg-emerald-500 rounded-xl'>
              <Users className='h-5 w-5 md:h-6 md:w-6 text-white' />
            </div>
            Todos os Leads
          </h1>
          <p className='text-gray-600 dark:text-gray-400 mt-2'>
            🎯 Gerencie todos os leads da equipe com visão completa do pipeline
          </p>
          <div className='flex items-center gap-4 mt-3'>
            <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
              <Users className='h-4 w-4' />
              <span>{totalLeads} leads no sistema</span>
            </div>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-3 w-full lg:w-auto'>
          {/* Barra de Pesquisa */}
          <div className='relative flex-1 lg:flex-none lg:w-80'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <Input
              placeholder='🔍 Buscar leads, corretores...'
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              className='pl-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700'
              aria-label='Buscar leads'
            />
          </div>

          {/* Botões de Ação */}
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={onRefresh}
              className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-950/20'
              aria-label='Atualizar dados'
              title='Atualizar dados'
            >
              <RefreshCw className='h-4 w-4' />
            </Button>

            <Button
              variant='outline'
              onClick={onExportLeads}
              className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-green-50 dark:hover:bg-green-950/20'
              aria-label='Exportar leads'
              title='Exportar leads'
            >
              <Download className='mr-2 h-4 w-4' />
              Exportar
            </Button>

            <Button
              variant='outline'
              onClick={onViewReports}
              className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-purple-50 dark:hover:bg-purple-950/20'
              aria-label='Ver relatórios'
              title='Ver relatórios'
            >
              <BarChart3 className='mr-2 h-4 w-4' />
              Relatórios
            </Button>

            <Button
              onClick={onAddLead}
              className='bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200'
              aria-label='Adicionar novo lead'
              title='Adicionar novo lead'
            >
              <Plus className='mr-2 h-4 w-4' />
              Novo Lead
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
