import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Calendar, Clock, Users, Phone, Mail, User, Check, X, Eye } from 'lucide-react';
import { useAdminReservationNotifications } from '../../hooks/useReservationNotifications';
import { showSuccessToast, showErrorToast, showWarningToast } from '@/lib/enhanced-toast-helpers';
import { useToast } from '@/hooks/use-toast';

interface Reservation {
  id: string;
  name: string;
  email: string;
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
  
  const { toast } = useToast();
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
      await updateDoc(doc(db, 'reservations', id), { status });
      
      const reservation = reservations.find(r => r.id === id);
      if (!reservation) return;

      if (status === 'confirmed') {
        // Send confirmation notifications
        const success = await sendReservationConfirmation(reservation.id);

        if (success) {
          showSuccessToast({
            title: "Reservation Confirmed",
            message: `${reservation.name}'s reservation confirmed and notifications sent.`,
          });
        } else {
          showWarningToast({
            title: "Reservation Confirmed",
            message: "Reservation confirmed but some notifications failed to send.",
          });
        }

        // Legacy email fallback
        try {
          await fetch("/api/sendEmail", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: reservation.email,
              subject: "Your Reservation is Confirmed!",
              text: `Hello ${reservation.name},\n\nYour reservation for ${reservation.date} at ${reservation.time} has been confirmed by Jemini Foods.\n\nGuests: ${reservation.guests}\n${reservation.specialRequests ? `Special Requests: ${reservation.specialRequests}\n` : ""}\nWe look forward to serving you!\n\nThank you!`
            })
          });
        } catch (e) {
          console.error("Failed to send confirmation email:", e);
        }
      } else if (status === 'cancelled') {
        // Send cancellation notifications
        const success = await sendReservationCancellation(reservation.id);

        if (success) {
          showSuccessToast({
            title: "Reservation Cancelled",
            message: `${reservation.name}'s reservation cancelled and notifications sent.`,
          });
        } else {
          showWarningToast({
            title: "Reservation Cancelled", 
            message: "Reservation cancelled but some notifications failed to send.",
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
      await deleteDoc(doc(db, 'reservations', id));
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
    const message = encodeURIComponent(
      `Hello ${reservation.name},\n\nThis is Jemini Foods. We are reaching out to confirm your reservation for ${reservation.date} at ${reservation.time}.\n\nReservation details:\nGuests: ${reservation.guests}\n${reservation.specialRequests ? `Special Requests: ${reservation.specialRequests}\n` : ""}If you have any changes or questions, please let us know. Kindly reply to confirm your reservation.\n\nThank you!`
    );
    // Remove non-digit characters and ensure it starts with country code
    const cleaned = reservation.phone.replace(/[^\d+]/g, '');
    return `https://wa.me/${cleaned}?text=${message}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-amber-400">Reservation Management</h2>
        
        <div className="flex space-x-2">
          {['all', 'pending', 'confirmed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 text-sm font-semibold transition-colors capitalize ${
                filter === status
                  ? 'bg-amber-600 text-black'
                  : 'bg-charcoal border border-amber-600/30 text-cream hover:border-amber-400'
              }`}
            >
              {status} ({status === 'all' ? reservations.length : reservations.filter(r => r.status === status).length})
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Reservations List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredReservations.map((reservation) => (
            <div
              key={reservation.id}
              className="bg-black/30 border border-amber-600/20 p-6 hover:border-amber-600/40 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-amber-400 mb-2">
                    {reservation.name}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-cream">
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} />
                      <span>{reservation.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock size={16} />
                      <span>{reservation.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users size={16} />
                      <span>{reservation.guests} guests</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone size={16} />
                      <span>{reservation.phone}</span>
                      {/* Call and WhatsApp buttons */}
                      <a
                        href={`tel:${reservation.phone}`}
                        title="Call"
                        className="ml-2 bg-green-700 hover:bg-green-800 text-white px-2 py-1 rounded flex items-center"
                        style={{ fontSize: 12 }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Call
                      </a>
                      <a
                        href={getWhatsAppLink(reservation)}
                        title="WhatsApp"
                        className="ml-1 bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded flex items-center"
                        style={{ fontSize: 12 }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                    {reservation.status}
                  </span>
                  <button
                    onClick={() => setSelectedReservation(reservation)}
                    className="text-amber-400 hover:text-amber-300"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>

              <div className="flex space-x-2">
                {reservation.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm transition-colors flex items-center space-x-1"
                    >
                      <Check size={14} />
                      <span>Confirm</span>
                    </button>
                    <button
                      onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm transition-colors flex items-center space-x-1"
                    >
                      <X size={14} />
                      <span>Cancel</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => deleteReservation(reservation.id)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {filteredReservations.length === 0 && (
            <div className="text-center py-12 text-cream">
              <p className="text-lg">No reservations found for this filter.</p>
            </div>
          )}
        </div>

        {/* Reservation Details */}
        <div className="lg:col-span-1">
          {selectedReservation ? (
            <div className="bg-black/30 border border-amber-600/20 p-6 sticky top-6">
              <h3 className="text-xl font-bold text-amber-400 mb-6">Reservation Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-amber-400 font-semibold mb-1">
                    <User size={16} className="inline mr-2" />
                    Guest Name
                  </label>
                  <p className="text-cream">{selectedReservation.name}</p>
                </div>

                <div>
                  <label className="block text-amber-400 font-semibold mb-1">
                    <Mail size={16} className="inline mr-2" />
                    Email
                  </label>
                  <p className="text-cream">{selectedReservation.email}</p>
                </div>

                <div>
                  <label className="block text-amber-400 font-semibold mb-1">
                    <Phone size={16} className="inline mr-2" />
                    Phone
                  </label>
                  <div className="flex items-center gap-2">
                    <p className="text-cream">{selectedReservation.phone}</p>
                    <a
                      href={`tel:${selectedReservation.phone}`}
                      title="Call"
                      className="bg-green-700 hover:bg-green-800 text-white px-2 py-1 rounded flex items-center"
                      style={{ fontSize: 12 }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Call
                    </a>
                    <a
                      href={getWhatsAppLink(selectedReservation)}
                      title="WhatsApp"
                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded flex items-center"
                      style={{ fontSize: 12 }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-amber-400 font-semibold mb-1">
                      <Calendar size={16} className="inline mr-2" />
                      Date
                    </label>
                    <p className="text-cream">{selectedReservation.date}</p>
                  </div>
                  <div>
                    <label className="block text-amber-400 font-semibold mb-1">
                      <Clock size={16} className="inline mr-2" />
                      Time
                    </label>
                    <p className="text-cream">{selectedReservation.time}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-amber-400 font-semibold mb-1">
                    <Users size={16} className="inline mr-2" />
                    Number of Guests
                  </label>
                  <p className="text-cream">{selectedReservation.guests}</p>
                </div>

                {selectedReservation.specialRequests && (
                  <div>
                    <label className="block text-amber-400 font-semibold mb-1">
                      Special Requests
                    </label>
                    <p className="text-cream bg-charcoal/50 p-3 border border-amber-600/20">
                      {selectedReservation.specialRequests}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-amber-400 font-semibold mb-1">
                    Status
                  </label>
                  <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedReservation.status)}`}>
                    {selectedReservation.status}
                  </span>
                </div>

                <div>
                  <label className="block text-amber-400 font-semibold mb-1">
                    Submitted
                  </label>
                  <p className="text-cream">
                    {selectedReservation.createdAt?.toDate().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-black/30 border border-amber-600/20 p-6 text-center text-cream">
              <p>Select a reservation to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationManager;
