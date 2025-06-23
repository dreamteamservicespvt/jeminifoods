import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Calendar, Clock, Users, CheckCircle, AlertTriangle, 
  X, ChevronRight, Table as TableIcon 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Reservation {
  id: string;
  name: string;
  date: string;
  time: string;
  guests: number;
  seatingPreference: string;
  tableId?: string;
  tableName?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: any;
}

interface UserReservationStatusProps {
  reservations: Reservation[];
  onViewDetails?: (reservationId: string) => void;
  className?: string;
}

const UserReservationStatus: React.FC<UserReservationStatusProps> = ({
  reservations,
  onViewDetails,
  className = ''
}) => {
  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'EEEE, MMMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  // Get status styling and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { 
          className: 'bg-green-500/20 text-green-400 border-green-500/30',
          icon: <CheckCircle size={14} />
        };
      case 'cancelled':
        return { 
          className: 'bg-red-500/20 text-red-400 border-red-500/30',
          icon: <X size={14} />
        };
      case 'pending':
      default:
        return { 
          className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          icon: <AlertTriangle size={14} />
        };
    }
  };

  if (reservations.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center text-center py-10 ${className}`}>
        <Calendar className="w-12 h-12 text-amber-400/30 mb-2" />
        <h3 className="text-xl font-medium text-amber-400 mb-1">No Reservations</h3>
        <p className="text-cream/60 max-w-sm">You haven't made any reservations yet. Book a table to enjoy our dining experience.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <h3 className="text-2xl font-serif font-bold text-amber-400 mb-4">Your Reservations</h3>
      
      <div className="space-y-4">
        {reservations.map((reservation) => {
          const statusInfo = getStatusInfo(reservation.status);
          
          return (
            <motion.div
              key={reservation.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ x: 5 }}
              className="bg-black/30 border border-amber-600/20 rounded-lg p-5 hover:border-amber-500/40 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-600/20 flex items-center justify-center">
                    <Calendar className="text-amber-400" size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-cream">{formatDisplayDate(reservation.date)}</h4>
                    <div className="flex items-center gap-1 text-cream/60">
                      <Clock size={14} />
                      <span className="text-sm">{reservation.time}</span>
                    </div>
                  </div>
                </div>
                
                <Badge className={`${statusInfo.className} flex items-center gap-1 px-3 py-1.5`}>
                  {statusInfo.icon}
                  <span>{reservation.status === 'pending' ? 'Awaiting Confirmation' : reservation.status}</span>
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mb-4">
                <div className="flex items-center gap-2 text-cream/80">
                  <Users size={16} className="text-amber-400/70" />
                  <span>{reservation.guests} {reservation.guests === 1 ? 'guest' : 'guests'}</span>
                </div>
                
                <div className="flex items-center gap-2 text-cream/80">
                  <TableIcon size={16} className="text-amber-400/70" />
                  <span>{reservation.tableName || reservation.seatingPreference}</span>
                </div>
              </div>
              
              {reservation.status === 'pending' && (
                <div className="mt-4 pt-3 border-t border-amber-600/20">
                  <p className="text-amber-300/80 text-sm flex items-center gap-1">
                    <AlertTriangle size={14} />
                    <span>We'll confirm your reservation shortly via WhatsApp.</span>
                  </p>
                </div>
              )}
              
              {onViewDetails && (
                <div className="mt-4 flex justify-end">
                  <Button
                    type="button"
                    onClick={() => onViewDetails(reservation.id)}
                    variant="outline"
                    className="text-xs border-amber-600/30 text-amber-400 hover:bg-amber-900/20"
                  >
                    <span>View Details</span>
                    <ChevronRight size={14} className="ml-1" />
                  </Button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default UserReservationStatus;
