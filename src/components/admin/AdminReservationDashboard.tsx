import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, Users, Phone, Mail, User, Check, X, Eye, Edit,
  Filter, Search, Download, RefreshCw, MessageSquare, MapPin, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { collection, onSnapshot, updateDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { showSuccessToast, showErrorToast, showWarningToast } from '@/lib/enhanced-toast-helpers';
import { format } from 'date-fns';
import { generateConfirmationMessage, sendWhatsAppMessage, RESTAURANT_CONTACT } from '@/lib/whatsapp-integration';

interface Reservation {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  partySize: number;
  tableId?: string;
  tableName?: string;
  occasion?: string;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: any;
  userId?: string;
}

const AdminReservationDashboard: React.FC = () => {
  const { adminUser, loading } = useAdminAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load reservations
  useEffect(() => {
    if (!adminUser) return;

    const q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reservationData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reservation[];
      
      setReservations(reservationData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [adminUser]);

  // Filter reservations
  const filteredReservations = reservations.filter(reservation => {
    const matchesFilter = filter === 'all' || reservation.status === filter;
    const matchesSearch = searchTerm === '' || 
      reservation.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.phone.includes(searchTerm);
    
    return matchesFilter && matchesSearch;
  });

  // Update reservation status
  const updateReservationStatus = async (reservationId: string, status: string) => {
    try {
      const reservationRef = doc(db, 'reservations', reservationId);
      await updateDoc(reservationRef, { status });
      
      const reservation = reservations.find(r => r.id === reservationId);
      
      if (status === 'confirmed' && reservation) {
        // Send WhatsApp confirmation
        const whatsappData = {
          customerName: reservation.fullName,
          reservationDate: format(new Date(reservation.date), 'EEEE, MMMM d, yyyy'),
          reservationTime: formatTime(reservation.time),
          partySize: reservation.partySize,
          tableName: reservation.tableName,
          restaurantPhone: RESTAURANT_CONTACT.phone
        };
        
        const confirmationMessage = generateConfirmationMessage(whatsappData);
        console.log('WhatsApp confirmation:', confirmationMessage);
        // In production: integrate with WhatsApp Business API
      }

      showSuccessToast({
        title: "Status Updated",
        message: `Reservation ${status} successfully`,
        duration: 3000
      });
    } catch (error) {
      console.error('Error updating reservation:', error);
      showErrorToast({
        title: "Update Failed",
        message: "Failed to update reservation status",
        duration: 3000
      });
    }
  };

  // Delete reservation
  const deleteReservation = async (reservationId: string) => {
    if (!confirm('Are you sure you want to delete this reservation?')) return;
    
    try {
      await deleteDoc(doc(db, 'reservations', reservationId));
      showSuccessToast({
        title: "Reservation Deleted",
        message: "Reservation has been removed",
        duration: 3000
      });
    } catch (error) {
      console.error('Error deleting reservation:', error);
      showErrorToast({
        title: "Delete Failed",
        message: "Failed to delete reservation",
        duration: 3000
      });
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'confirmed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'completed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!adminUser) {
    return <div className="text-center">Access denied. Admin authentication required.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-black/95 text-cream p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-amber-400 mb-2">
              Reservation Management
            </h1>
            <p className="text-cream/70">
              Manage all restaurant reservations from one dashboard
            </p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <Button 
              size="sm" 
              variant="outline"
              className="border-amber-600/30 text-amber-400"
            >
              <Download size={16} className="mr-2" />
              Export
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="border-amber-600/30 text-amber-400"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="bg-black/40 border-amber-900/30 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cream/50" size={16} />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-700 text-cream"
                />
              </div>
            </div>
            
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-full md:w-[200px] bg-gray-800/50 border-gray-700 text-cream">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reservations</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Reservations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredReservations.map((reservation) => (
            <motion.div
              key={reservation.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-black/40 border-amber-900/30 p-6 hover:border-amber-600/50 transition-colors">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-amber-400 mb-1">
                      {reservation.fullName}
                    </h3>
                    <Badge className={getStatusColor(reservation.status)}>
                      {reservation.status.toUpperCase()}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedReservation(reservation)}
                    className="text-cream/70 hover:text-cream"
                  >
                    <Eye size={16} />
                  </Button>
                </div>

                {/* Reservation Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="text-amber-400" size={14} />
                    <span>{format(new Date(reservation.date), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="text-amber-400" size={14} />
                    <span>{formatTime(reservation.time)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="text-amber-400" size={14} />
                    <span>{reservation.partySize} guests</span>
                  </div>
                  {reservation.tableName && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="text-amber-400" size={14} />
                      <span>{reservation.tableName}</span>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div className="space-y-1 mb-4 text-sm text-cream/70">
                  <div className="flex items-center gap-2">
                    <Mail size={12} />
                    <span className="truncate">{reservation.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={12} />
                    <span>{reservation.phone}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {reservation.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                        className="bg-green-600 hover:bg-green-500 text-black flex-1"
                      >
                        <Check size={14} className="mr-1" />
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                        className="border-red-600/50 text-red-400 hover:bg-red-900/20"
                      >
                        <X size={14} />
                      </Button>
                    </>
                  )}
                  
                  {reservation.status === 'confirmed' && (
                    <Button
                      size="sm"
                      onClick={() => updateReservationStatus(reservation.id, 'completed')}
                      className="bg-purple-600 hover:bg-purple-500 text-black flex-1"
                    >
                      Mark Complete
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredReservations.length === 0 && (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto mb-4 text-cream/30" />
            <h3 className="text-xl font-semibold text-cream/70 mb-2">No Reservations Found</h3>
            <p className="text-cream/50">
              {filter === 'all' 
                ? 'No reservations have been made yet.' 
                : `No ${filter} reservations found.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Reservation Details Modal */}
      <AnimatePresence>
        {selectedReservation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedReservation(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black/90 border border-amber-900/30 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-amber-400">
                  Reservation Details
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedReservation(null)}
                  className="text-cream/70 hover:text-cream"
                >
                  <X size={18} />
                </Button>
              </div>

              {/* Detailed reservation information would go here */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-cream/70 text-sm">Customer Name</label>
                    <p className="text-cream font-medium">{selectedReservation.fullName}</p>
                  </div>
                  <div>
                    <label className="text-cream/70 text-sm">Status</label>
                    <Badge className={getStatusColor(selectedReservation.status)}>
                      {selectedReservation.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {selectedReservation.specialRequests && (
                  <div>
                    <label className="text-cream/70 text-sm">Special Requests</label>
                    <p className="text-cream bg-gray-800/50 p-3 rounded-lg">
                      {selectedReservation.specialRequests}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminReservationDashboard;
