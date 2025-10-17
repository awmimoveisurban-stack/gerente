import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardSizeSelector } from './card-size-selector';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  LayoutGrid,
  BarChart3,
  Users,
  RefreshCw,
  Filter,
} from 'lucide-react';

interface KanbanHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddLead: () => void;
  onViewReports: () => void;
  onViewAllLeads: () => void;
  onRefresh: () => void;
  totalLeads: number;
  cardSize: 'default' | 'compact' | 'mini';
  onCardSizeChange: (size: 'default' | 'compact' | 'mini') => void;
  // ✅ FASE 1.3: Filtro por corretor
  selectedCorretorId?: string;
  onCorretorChange?: (corretorId: string) => void;
  profiles?: Array<{ id: string; email: string; full_name: string }>;
}

export const KanbanHeader = memo(function KanbanHeader({
  searchTerm,
  onSearchChange,
  onAddLead,
  onViewReports,
  onViewAllLeads,
  onRefresh,
  totalLeads,
  cardSize,
  onCardSizeChange,
  selectedCorretorId,
  onCorretorChange,
  profiles = [],
}: KanbanHeaderProps) {
  return (
    <div className='bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-purple-200/50 dark:border-gray-700/50'>
      <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4'>
        <div className='flex-1'>
          <h1 className='text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3'>
            <div className='p-2 bg-purple-500 rounded-xl'>
              <LayoutGrid className='h-5 w-5 md:h-6 md:w-6 text-white' />
            </div>
            Quadro Kanban
          </h1>
          <p className='text-gray-600 dark:text-gray-400 mt-2'>
            🎯 Gerencie seus leads visualmente através do funil de vendas
          </p>
          <div className='flex items-center gap-4 mt-3'>
            <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
              <Users className='h-4 w-4' />
              <span>{totalLeads} leads no pipeline</span>
            </div>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-3 w-full lg:w-auto'>
          {/* Barra de Pesquisa */}
          <div className='relative flex-1 lg:flex-none lg:w-64'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <Input
              placeholder='🔍 Buscar leads...'
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              className='pl-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700'
              aria-label='Buscar leads no Kanban'
            />
          </div>

          {/* ✅ FASE 1.3: Filtro por Corretor */}
          {profiles.length > 0 && onCorretorChange && (
            <Select
              value={selectedCorretorId || 'todos'}
              onValueChange={onCorretorChange}
            >
              <SelectTrigger className='w-[200px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm'>
                <Filter className='mr-2 h-4 w-4' />
                <SelectValue placeholder='Filtrar por corretor' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='todos'>👥 Todos os Corretores</SelectItem>
                {profiles.map(profile => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.full_name || profile.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Botões de Ação */}
          <div className='flex gap-2'>
            <CardSizeSelector
              currentSize={cardSize}
              onSizeChange={onCardSizeChange}
            />

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
              onClick={onViewAllLeads}
              className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-green-50 dark:hover:bg-green-950/20'
              aria-label='Ver todos os leads'
              title='Ver todos os leads'
            >
              <Users className='mr-2 h-4 w-4' />
              Todos Leads
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
              className='bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200'
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
