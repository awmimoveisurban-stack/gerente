import { memo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, Calendar, Target, RotateCcw } from 'lucide-react';

interface LeadsFiltersProps {
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (term: string) => void;
  onStatusChange: (status: string) => void;
  onResetFilters: () => void;
  getStatusCount: (status: string) => number;
}

export const LeadsFilters = memo(function LeadsFilters({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusChange,
  onResetFilters,
  getStatusCount,
}: LeadsFiltersProps) {
  return (
    <Card className='bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg'>
      <CardHeader className='bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200/50 dark:border-gray-700/50'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2'>
              <div className='p-1.5 bg-blue-500 rounded-lg'>
                <Filter className='h-4 w-4 text-white' />
              </div>
              Filtros e Busca
            </CardTitle>
            <CardDescription className='text-gray-600 dark:text-gray-400 mt-1'>
              🔍 Encontre rapidamente os leads que você procura
            </CardDescription>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={onResetFilters}
            className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-blue-50 dark:hover:bg-blue-950/20'
            aria-label='Limpar filtros'
            title='Limpar filtros'
          >
            <RotateCcw className='mr-2 h-4 w-4' />
            Limpar
          </Button>
        </div>
      </CardHeader>
      <CardContent className='p-6'>
        <div className='flex flex-col md:flex-row gap-4'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <Input
              placeholder='🔍 Buscar por nome, email ou telefone...'
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              className='pl-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700'
              aria-label='Buscar leads'
            />
          </div>
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className='w-48 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700'>
              <SelectValue placeholder='Filtrar por status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='todos'>
                🎯 Todos ({getStatusCount('todos')})
              </SelectItem>
              <SelectItem value='novo'>
                🆕 Novo ({getStatusCount('novo')})
              </SelectItem>
              <SelectItem value='contatado'>
                📞 Contatado ({getStatusCount('contatado')})
              </SelectItem>
              <SelectItem value='interessado'>
                ⭐ Interessado ({getStatusCount('interessado')})
              </SelectItem>
              <SelectItem value='visita_agendada'>
                🏠 Visita ({getStatusCount('visita_agendada')})
              </SelectItem>
              <SelectItem value='proposta'>
                📋 Proposta ({getStatusCount('proposta')})
              </SelectItem>
              <SelectItem value='fechado'>
                ✅ Fechado ({getStatusCount('fechado')})
              </SelectItem>
              <SelectItem value='perdido'>
                ❌ Perdido ({getStatusCount('perdido')})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
});
