import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { NotificationsPanel } from './notifications-panel';
import { useNotifications } from '@/hooks/use-notifications';

interface NotificationsButtonProps {
  onViewLead?: (leadId: string) => void;
}

export function NotificationsButton({ onViewLead }: NotificationsButtonProps) {
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='outline' size='icon' className='relative'>
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <Badge
              variant='destructive'
              className='absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse'
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[500px] p-0' align='end'>
        <NotificationsPanel onViewLead={onViewLead} />
      </PopoverContent>
    </Popover>
  );
}



