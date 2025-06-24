import React from 'react';
import { OrderTracker, type OrderStatus } from '@/components/ui/OrderTracker';

interface PreOrderStepTrackerProps {
  status: 'pending' | 'booked' | 'taken' | 'making' | 'ready' | 'completed';
  className?: string;
  orderId?: string;
  chefName?: string;
  timestamps?: {
    pending?: string;
    booked?: string;
    taken?: string;
    making?: string;
    ready?: string;
  };
  isEditable?: boolean;
  onStatusChange?: (newStatus: OrderStatus) => void;
}

export const PreOrderStepTracker: React.FC<PreOrderStepTrackerProps> = ({
  status,
  className,
  orderId,
  chefName,
  timestamps,
  isEditable = false,
  onStatusChange,
}) => {
  // Map the status to ensure compatibility
  const mappedStatus: OrderStatus = status === 'completed' ? 'ready' : (status === 'pending' ? 'booked' : status);

  return (
    <OrderTracker
      currentStatus={mappedStatus}
      orderId={orderId}
      chefName={chefName}
      timestamps={timestamps}
      isEditable={isEditable}
      onStatusChange={onStatusChange}
      className={className}
      variant="compact"
      showTimestamps={!!timestamps}
      showDescription={false}
    />
  );
};

export default PreOrderStepTracker;
