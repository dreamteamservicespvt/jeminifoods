import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Calendar, Clock, Users, Phone, User, Check, X, Eye } from 'lucide-react';
import { useAdminReservationNotifications } from '../../hooks/useReservationNotifications';
import { showSuccessToast, showErrorToast, showWarningToast } from '@/lib/enhanced-toast-helpers';

interface Reservation {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: any;
  userId?: string;
  tableId?: string;
}

const ReservationManager = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  
  const { sendReservationConfirmation, sendReservationCancellation } = useAdminReservationNotifications();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'reservations'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reservation[];
      
      // Sort by creation date, newest first
      items.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
      setReservations(items);
    });

    return unsubscribe;
  }, []);
  
  const updateReservationStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    try {
      // Get the reservation
      const reservation = reservations.find(r => r.id === id);
      if (!reservation) return;

      if (status === 'confirmed') {
        // Send confirmation notifications
        const success = await sendReservationConfirmation(id);

        if (!success) {
          showWarningToast({
            title: "Partial Success",
            message: "Reservation confirmed but notifications may have failed.",
          });
        }
      } else if (status === 'cancelled') {
        // Send cancellation notifications
        const success = await sendReservationCancellation(id);
        
        if (!success) {
          showWarningToast({
            title: "Partial Success",
            message: "Reservation cancelled but notifications may have failed.",
          });
        }
      }
    } catch (error) {
      console.error("Error updating reservation:", error);
      showErrorToast({
        title: "Error",
        message: "Failed to update reservation status.",
      });
    }
  };

  const deleteReservation = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this reservation?')) {
      try {
        await deleteDoc(doc(db, 'reservations', id));
        showSuccessToast({
          title: "Success",
          message: "Reservation deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting reservation:", error);
        showErrorToast({
          title: "Error",
          message: "Failed to delete reservation",
        });
      }
    }
  };

  const filteredReservations = filter === 'all' 
    ? reservations 
    : reservations.filter(res => res.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-400 bg-green-400/10';
      case 'cancelled': return 'text-red-400 bg-red-400/10';
      default: return 'text-amber-400 bg-amber-400/10';
    }
  };

  // Helper to generate WhatsApp link
  const getWhatsAppLink = (reservation: Reservation) => {
    // Create professional message for confirming reservation
    const message = `Hello ${reservation.name}, this is Jemini Foods regarding your reservation for ${reservation.date} at ${reservation.time}. Is there anything specific we can help you with before your arrival?`;
    
    // Format the phone number and encode the message
    const phone = reservation.phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="bg-black/80 min-h-screen text-cream p-6">
      <h1 className="text-3xl font-serif font-medium text-amber-400 mb-6">Reservation Management</h1>
      
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button 
          onClick={() => setFilter('all')} 
          className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-amber-700 text-white' : 'bg-black/40 hover:bg-amber-800/30 border border-amber-700/50'}`}
        >
          All ({reservations.length})
        </button>
        <button 
          onClick={() => setFilter('pending')} 
          className={`px-4 py-2 rounded-md ${filter === 'pending' ? 'bg-amber-700 text-white' : 'bg-black/40 hover:bg-amber-800/30 border border-amber-700/50'}`}
        >
          Pending ({reservations.filter(r => r.status === 'pending').length})
        </button>
        <button 
          onClick={() => setFilter('confirmed')} 
          className={`px-4 py-2 rounded-md ${filter === 'confirmed' ? 'bg-amber-700 text-white' : 'bg-black/40 hover:bg-amber-800/30 border border-amber-700/50'}`}
        >
          Confirmed ({reservations.filter(r => r.status === 'confirmed').length})
        </button>
        <button 
          onClick={() => setFilter('cancelled')} 
          className={`px-4 py-2 rounded-md ${filter === 'cancelled' ? 'bg-amber-700 text-white' : 'bg-black/40 hover:bg-amber-800/30 border border-amber-700/50'}`}
        >
          Cancelled ({reservations.filter(r => r.status === 'cancelled').length})
        </button>
      </div>
      
      {/* Reservation list */}
      <div className="space-y-4">
        {filteredReservations.length === 0 ? (
          <div className="text-center py-8 bg-black/40 rounded-lg border border-amber-900/30">
            <p className="text-cream/70">No reservations found</p>
          </div>
        ) : (
          filteredReservations.map((reservation) => (
            <div 
              key={reservation.id} 
              className="bg-black/40 border border-amber-900/30 rounded-lg p-5"
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  {/* Status badge */}
                  <span className={`inline-block px-3 py-1 text-xs rounded-full mb-2 ${getStatusColor(reservation.status)}`}>
                    {reservation.status.toUpperCase()}
                  </span>
                  
                  <h3 className="text-xl font-serif text-amber-400 mb-2">
                    {reservation.name}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <div className="flex items-center gap-2 text-cream">
                      <Calendar size={16} className="text-amber-500" />
                      {reservation.date}
                    </div>
                    
                    <div className="flex items-center gap-2 text-cream">
                      <Clock size={16} className="text-amber-500" />
                      {reservation.time}
                    </div>
                    
                    <div className="flex items-center gap-2 text-cream">
                      <Users size={16} className="text-amber-500" />
                      {reservation.guests} {reservation.guests === 1 ? 'guest' : 'guests'}
                    </div>
                    
                    <div className="flex items-center gap-2 text-cream">
                      <Phone size={16} className="text-amber-500" />
                      {reservation.phone}
                    </div>
                    
                    <div className="flex items-center gap-2 text-cream">
                      <User size={16} className="text-amber-500" />
                      {reservation.userId ? 'Registered user' : 'Guest'}
                    </div>
                  </div>
                  
                  {/* Special requests */}
                  {reservation.specialRequests && (
                    <div className="mt-3 bg-black/20 p-3 rounded border border-amber-900/30">
                      <p className="text-xs font-medium text-amber-400 mb-1">Special Requests:</p>
                      <p className="text-sm text-cream">{reservation.specialRequests}</p>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex flex-row md:flex-col gap-2">
                  {reservation.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                        className="bg-green-700/80 hover:bg-green-600/80 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm"
                      >
                        <Check size={16} /> Confirm
                      </button>
                      
                      <button
                        onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                        className="bg-red-700/80 hover:bg-red-600/80 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm"
                      >
                        <X size={16} /> Cancel
                      </button>
                    </>
                  )}
                  
                  {/* WhatsApp contact button */}
                  <a
                    href={getWhatsAppLink(reservation)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600/80 hover:bg-green-500/80 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                    </svg>
                    Message
                  </a>
                  
                  {/* View details button */}
                  <button
                    onClick={() => setSelectedReservation(reservation)}
                    className="bg-amber-700/80 hover:bg-amber-600/80 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm"
                  >
                    <Eye size={16} /> Details
                  </button>
                  
                  {/* Delete button */}
                  <button
                    onClick={() => deleteReservation(reservation.id)}
                    className="bg-black hover:bg-gray-900 text-red-400 border border-red-900/50 px-4 py-2 rounded-md flex items-center gap-2 text-sm"
                  >
                    <X size={16} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reservation detail modal */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full border border-amber-900/50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-serif text-amber-400">Reservation Details</h3>
              <button 
                onClick={() => setSelectedReservation(null)}
                className="text-cream hover:text-amber-400"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Details here */}
              <div className="bg-black/30 p-4 rounded-lg">
                <h4 className="font-medium text-amber-400 mb-2">Customer Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-cream/70">Name</p>
                    <p className="text-cream">{selectedReservation.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-cream/70">Phone</p>
                    <p className="text-cream">{selectedReservation.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-cream/70">User Type</p>
                    <p className="text-cream">{selectedReservation.userId ? 'Registered User' : 'Guest'}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/30 p-4 rounded-lg">
                <h4 className="font-medium text-amber-400 mb-2">Reservation Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-cream/70">Date</p>
                    <p className="text-cream">{selectedReservation.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-cream/70">Time</p>
                    <p className="text-cream">{selectedReservation.time}</p>
                  </div>
                  <div>
                    <p className="text-xs text-cream/70">Guests</p>
                    <p className="text-cream">{selectedReservation.guests}</p>
                  </div>
                  <div>
                    <p className="text-xs text-cream/70">Status</p>
                    <p className={`${getStatusColor(selectedReservation.status)} inline-block px-2 py-1 rounded text-sm`}>
                      {selectedReservation.status.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
              
              {selectedReservation.specialRequests && (
                <div className="bg-black/30 p-4 rounded-lg">
                  <h4 className="font-medium text-amber-400 mb-2">Special Requests</h4>
                  <p className="text-cream">{selectedReservation.specialRequests}</p>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6">
                {selectedReservation.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        updateReservationStatus(selectedReservation.id, 'confirmed');
                        setSelectedReservation(null);
                      }}
                      className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                    >
                      Confirm Reservation
                    </button>
                    
                    <button
                      onClick={() => {
                        updateReservationStatus(selectedReservation.id, 'cancelled');
                        setSelectedReservation(null);
                      }}
                      className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                    >
                      Cancel Reservation
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="bg-transparent border border-amber-600/50 hover:border-amber-500 text-amber-400 px-4 py-2 rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationManager;
