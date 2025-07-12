import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Calendar, Clock, Users, CheckCircle, AlertTriangle, 
  X, ChevronRight, Table as TableIcon, Loader2 
} from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { generateWhatsAppLink } from '@/lib/enhanced-toast-helpers';
import { useUserAuth } from '@/contexts/UserAuthContext';

interface Reservation {
  id: string;
  name: string;
  date: string;
  time: string;
  guests: number;
  seatingPreference: string;
  tableId?: string;
  tableName?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: any;
}

interface UserReservationStatusProps {
  userId?: string;
  onViewDetails?: (reservationId: string) => void;
  className?: string;
  highlightReservationId?: string | null;
}

const UserReservationStatus: React.FC<UserReservationStatusProps> = ({
  userId,
  onViewDetails,
  className,
  highlightReservationId
}) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get current user from context if userId not provided
  const { user } = useUserAuth();
  
  // Use provided userId or fallback to current user
  const effectiveUserId = userId || (user?.uid);

  // Fetch reservations for the current user
  useEffect(() => {
    if (!effectiveUserId) return;

    setLoading(true);
    setError(null);
    
    const reservationsRef = collection(db, 'reservations');
    const userReservationsQuery = query(
      reservationsRef,
      where('userId', '==', effectiveUserId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      userReservationsQuery,
      (snapshot) => {
        const reservationList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Reservation[];
        
        setReservations(reservationList);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching reservations:', err);
        setError('Failed to load reservations. Please try again.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [effectiveUserId]);
  
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
          icon: <CheckCircle size={16} className="text-green-400" />
        };
      case 'cancelled':
        return { 
          className: 'bg-red-500/20 text-red-400 border-red-500/30',
          icon: <X size={16} className="text-red-400" />
        };
      case 'completed':
        return { 
          className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          icon: <CheckCircle size={16} className="text-blue-400" />
        };
      default:
        return { 
          className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
          icon: <AlertTriangle size={16} className="text-yellow-400" />
        };
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={cn("bg-black/20 border border-amber-600/20 rounded-xl p-6 text-center", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-amber-400 mx-auto mb-2" />
        <p className="text-cream/70">Loading your reservations...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("bg-black/20 border border-red-600/20 rounded-xl p-6 text-center", className)}>
        <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
        <p className="text-red-400 mb-2">Error</p>
        <p className="text-cream/70">{error}</p>
      </div>
    );
  }

  // Empty state
  if (reservations.length === 0) {
    return (
      <div className={cn("bg-black/20 border border-amber-600/20 rounded-xl p-8 text-center", className)}>
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-amber-800/20 flex items-center justify-center">
          <Calendar className="h-8 w-8 text-amber-500/70" />
        </div>
        <h3 className="text-xl font-serif text-amber-400 mb-2">No Reservations Yet</h3>
        <p className="text-cream/70 max-w-md mx-auto mb-4">
          You haven't made any reservations yet. When you book a table, your reservations will appear here.
        </p>
        <Button className="bg-amber-600 hover:bg-amber-700 text-black">
          Make Your First Reservation
        </Button>
      </div>
    );
  }

  // Display reservations
  return (
    <div className={cn("space-y-4", className)}>
      <AnimatePresence>
        {reservations.map((reservation) => {
          const { className: statusClass, icon: statusIcon } = getStatusInfo(reservation.status);
          const isHighlighted = highlightReservationId === reservation.id;
          
          return (
            <motion.div
              key={reservation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: isHighlighted ? [1, 1.03, 1] : 1,
                transition: isHighlighted ? { 
                  scale: { duration: 0.5, repeat: 3, repeatType: "reverse" } 
                } : undefined
              }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "bg-black/40 border rounded-xl p-5 transition-all",
                isHighlighted 
                  ? "border-amber-400/70 shadow-md shadow-amber-500/20 glow-amber-sm" 
                  : "border-amber-600/20 hover:border-amber-500/30"
              )}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left column - reservation details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={statusClass}>
                      <span className="flex items-center gap-1">
                        {statusIcon}
                        {reservation.status ? reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1) : 'Pending'}
                      </span>
                    </Badge>
                    {reservation.tableId && (
                      <Badge variant="outline" className="bg-amber-800/20 border-amber-600/30 text-amber-400">
                        <TableIcon size={12} className="mr-1" />
                        {reservation.tableName || `Table ${reservation.tableId.slice(0, 4)}`}
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-serif text-amber-400 mb-2">
                    Reservation for {reservation.guests || 1} {(reservation.guests || 1) === 1 ? 'Guest' : 'Guests'}
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-cream/80">
                      <Calendar size={16} className="text-amber-400/70" />
                      {reservation.date ? formatDisplayDate(reservation.date) : 'Date not specified'}
                    </div>
                    <div className="flex items-center gap-2 text-cream/80">
                      <Clock size={16} className="text-amber-400/70" />
                      {reservation.time || 'Time not specified'}
                    </div>
                    <div className="flex items-center gap-2 text-cream/80">
                      <Users size={16} className="text-amber-400/70" />
                      {reservation.seatingPreference 
                        ? `${reservation.seatingPreference.charAt(0).toUpperCase()}${reservation.seatingPreference.slice(1)} Seating`
                        : 'Standard Seating'
                      }
                    </div>
                  </div>
                </div>
                
                {/* Right column - actions */}
                <div className="flex flex-col space-y-2 min-w-[120px]">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails && onViewDetails(reservation.id)}
                    className="w-full border-amber-600/30 hover:border-amber-400/50 text-amber-400"
                  >
                    <span className="flex items-center gap-1">
                      Details
                      <ChevronRight size={16} />
                    </span>
                  </Button>
                  
                  {reservation.status === 'confirmed' && (
                    <Button 
                      variant="outline"
                      size="sm"
                      className="w-full border-green-600/30 bg-green-950/20 hover:bg-green-950/40 hover:border-green-400/50 text-green-400"
                      onClick={() => {
                        const whatsAppLink = generateWhatsAppLink({
                          id: reservation.id,
                          name: reservation.name,
                          date: reservation.date,
                          time: reservation.time,
                          guests: reservation.guests,
                          tableName: reservation.tableName,
                          status: reservation.status
                        });
                        window.open(whatsAppLink, '_blank');
                      }}
                    >
                      Contact
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default UserReservationStatus;
