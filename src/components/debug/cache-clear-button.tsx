import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Trash2,
  RefreshCw,
  Database,
  Users,
  BarChart3,
  Bell,
} from 'lucide-react';
import {
  clearAllCache,
  clearLeadsCache,
  clearDashboardCache,
  clearUserRolesCache,
  clearCache,
} from '@/utils/clear-cache';
import { useToast } from '@/hooks/use-toast';

interface CacheClearButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showLabel?: boolean;
  showOptions?: boolean;
}

export function CacheClearButton({
  variant = 'outline',
  size = 'sm',
  showLabel = true,
  showOptions = false,
}: CacheClearButtonProps) {
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      const result = clearAllCache();
      toast({
        title: '✅ Cache Limpo',
        description: `${result.cleared} chaves removidas com sucesso!`,
      });
    } catch (error) {
      toast({
        title: '❌ Erro ao Limpar Cache',
        description: 'Não foi possível limpar o cache.',
        variant: 'destructive',
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearLeads = async () => {
    setIsClearing(true);
    try {
      const result = clearLeadsCache();
      toast({
        title: '✅ Cache de Leads Limpo',
        description: `${result.cleared} chaves de leads removidas!`,
      });
    } catch (error) {
      toast({
        title: '❌ Erro ao Limpar Cache de Leads',
        description: 'Não foi possível limpar o cache de leads.',
        variant: 'destructive',
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearDashboard = async () => {
    setIsClearing(true);
    try {
      const result = clearDashboardCache();
      toast({
        title: '✅ Cache de Dashboard Limpo',
        description: `${result.cleared} chaves de dashboard removidas!`,
      });
    } catch (error) {
      toast({
        title: '❌ Erro ao Limpar Cache de Dashboard',
        description: 'Não foi possível limpar o cache de dashboard.',
        variant: 'destructive',
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearRoles = async () => {
    setIsClearing(true);
    try {
      const result = clearUserRolesCache();
      toast({
        title: '✅ Cache de Roles Limpo',
        description: `${result.cleared} chaves de roles removidas!`,
      });
    } catch (error) {
      toast({
        title: '❌ Erro ao Limpar Cache de Roles',
        description: 'Não foi possível limpar o cache de roles.',
        variant: 'destructive',
      });
    } finally {
      setIsClearing(false);
    }
  };

  if (showOptions) {
    return (
      <div className='flex flex-col gap-2'>
        <Button
          variant={variant}
          size={size}
          onClick={handleClearAll}
          disabled={isClearing}
          className='w-full'
        >
          <Trash2 className='h-4 w-4 mr-2' />
          {showLabel && 'Limpar Todo Cache'}
        </Button>

        <div className='grid grid-cols-2 gap-1'>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleClearLeads}
            disabled={isClearing}
            className='text-xs'
          >
            <Database className='h-3 w-3 mr-1' />
            Leads
          </Button>

          <Button
            variant='ghost'
            size='sm'
            onClick={handleClearDashboard}
            disabled={isClearing}
            className='text-xs'
          >
            <BarChart3 className='h-3 w-3 mr-1' />
            Dashboard
          </Button>

          <Button
            variant='ghost'
            size='sm'
            onClick={handleClearRoles}
            disabled={isClearing}
            className='text-xs'
          >
            <Users className='h-3 w-3 mr-1' />
            Roles
          </Button>

          <Button
            variant='ghost'
            size='sm'
            onClick={() => window.location.reload()}
            className='text-xs'
          >
            <RefreshCw className='h-3 w-3 mr-1' />
            Reload
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClearAll}
      disabled={isClearing}
    >
      <Trash2 className={`h-4 w-4 ${showLabel ? 'mr-2' : ''}`} />
      {showLabel && (isClearing ? 'Limpando...' : 'Limpar Cache')}
    </Button>
  );
}



