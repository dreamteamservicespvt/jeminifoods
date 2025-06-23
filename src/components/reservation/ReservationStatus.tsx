import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, XCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface ReservationStatusProps {
  status: 'pending' | 'confirmed' | 'cancelled';
  date: string;
  time: string;
  tableId?: string;
  tableName?: string;
  partySize: number;
}

const ReservationStatus: React.FC<ReservationStatusProps> = ({
  status,
  date,
  time,
  tableId,
  tableName,
  partySize
}) => {
  // Format display date
  const formatDisplayDate = (dateStr: string) => {
    try {
      const dateObj = new Date(dateStr);
      return format(dateObj, 'EEEE, MMMM d, yyyy');
    } catch {
      return dateStr;
    }
  };
  
  // Get status-based styling
  const getStatusStyles = () => {
    switch(status) {
      case 'confirmed':
        return {
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/40',
          iconColor: 'text-green-500',
          icon: CheckCircle,
          title: 'Reservation Confirmed',
          description: 'Your table has been reserved. We look forward to serving you!'
        };
      case 'cancelled':
        return {
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/40',
          iconColor: 'text-red-500',
          icon: XCircle,
          title: 'Reservation Cancelled',
          description: 'This reservation has been cancelled.'
        };
      default:
        return {
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/40',
          iconColor: 'text-amber-500',
          icon: AlertCircle,
          title: 'Awaiting Confirmation',
          description: 'Your reservation is pending confirmation by our staff.'
        };
    }
  };
  
  const statusStyles = getStatusStyles();
  const StatusIcon = statusStyles.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border ${statusStyles.borderColor} ${statusStyles.bgColor} p-5 shadow-sm`}
    >
      <div className="flex items-start">
        {/* Icon */}
        <div className="mr-4">
          <div className={`w-10 h-10 rounded-full ${statusStyles.bgColor} border ${statusStyles.borderColor} flex items-center justify-center`}>
            <StatusIcon size={20} className={statusStyles.iconColor} />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <h3 className={`font-semibold mb-1 ${statusStyles.iconColor}`}>{statusStyles.title}</h3>
          <p className="text-cream/70 text-sm mb-3">{statusStyles.description}</p>
          
          {/* Reservation details */}
          <div className="space-y-1 mt-4">
            <div className="flex items-center text-sm text-cream/80">
              <Calendar size={14} className="mr-2" />
              <span>{formatDisplayDate(date)}</span>
            </div>
            
            <div className="flex items-center text-sm text-cream/80">
              <Clock size={14} className="mr-2" />
              <span>{time}</span>
            </div>
            
            {tableName && (
              <div className="flex items-center text-sm text-cream/80">
                <div className="w-3.5 h-3.5 rounded-sm bg-amber-600 mr-2.5"></div>
                <span>{tableName}</span>
              </div>
            )}
            
            <div className="flex items-center text-sm text-cream/80">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-cream/30 mr-2.5 flex items-center justify-center">
                <span className="text-[8px] font-bold">{partySize}</span>
              </div>
              <span>{partySize === 1 ? '1 Guest' : `${partySize} Guests`}</span>
            </div>
          </div>
          
          {/* Additional information */}
          {status === 'pending' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 text-xs bg-black/40 border border-amber-500/20 p-3 rounded text-cream/60"
            >
              <p>We'll review your reservation and send a confirmation soon. You may receive a call or WhatsApp message for confirmation.</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ReservationStatus;
