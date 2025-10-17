import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationsPanel } from '@/components/notifications/notifications-panel';
import { LeadDetailsModal } from '@/components/crm/lead-details-modal';
import { useLeads } from '@/hooks/use-leads';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { leads } = useLeads();
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleViewLead = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      setSelectedLead(lead);
      setShowDetailsModal(true);
    }
  };

  return (
    <>
      <div className='space-y-6 p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
              🔔 Central de Notificações
            </h1>
            <p className='text-gray-600 dark:text-gray-400 mt-1'>
              Acompanhe todas as suas notificações e alertas
            </p>
          </div>
        </div>

        <NotificationsPanel onViewLead={handleViewLead} />
      </div>

      <LeadDetailsModal
        lead={selectedLead}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedLead(null);
        }}
      />
    </>
  );
}
