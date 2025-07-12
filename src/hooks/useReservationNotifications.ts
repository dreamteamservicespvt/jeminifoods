import { useNotifications } from '../contexts/NotificationContext';
import { showSuccessToast, showWarningToast, showInfoToast } from '@/lib/enhanced-toast-helpers';
import { 
  addDoc, 
  collection, 
  serverTimestamp, 
  updateDoc, 
  doc,
  getDoc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Enhanced hooks for working with reservations, notifications, and toasts
 * throughout the Jemini Foods reservation system.
 */

// For user-facing notifications about their reservations
export const useUserReservationNotifications = () => {
  const { createNotification } = useNotifications();

  // Notify the user their reservation was confirmed
  const notifyReservationConfirmed = async (
    userId: string,
    reservationId: string,
    date: string,
    time: string,
    tableName?: string
  ) => {
    try {
      // Show toast notification
      showSuccessToast({
        title: "Reservation Confirmed",
        message: `Your table is ready for ${date} at ${time}${tableName ? ` (${tableName})` : ''}`,
        duration: 6000,
      });
  
      // Create in-app notification
      await createNotification({
        userId,
        type: 'reservation_confirmed',
        title: '🎉 Reservation Confirmed!',
        message: `Your table has been confirmed for ${date} at ${time}.`,
        read: false,
        actionUrl: '/reservations?tab=my-reservations',
        metadata: {
          reservationId
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error creating reservation notification:', error);
      return false;
    }
  };

  // Notify the user their reservation was cancelled
  const notifyReservationCancelled = async (
    userId: string,
    reservationId: string,
    date: string,
    time: string
  ) => {
    try {
      // Show toast notification
      showWarningToast({
        title: "Reservation Cancelled",
        message: `Your reservation for ${date} at ${time} has been cancelled.`,
        duration: 6000,
      });
  
      // Create in-app notification
      await createNotification({
        userId,
        type: 'reservation_cancelled',
        title: 'Reservation Cancelled',
        message: `Your reservation for ${date} at ${time} has been cancelled.`,
        read: false,
        actionUrl: '/reservations',
        metadata: {
          reservationId
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error creating cancellation notification:', error);
      return false;
    }
  };

  // Notify user about upcoming reservations
  const notifyUpcomingReservation = async (
    userId: string,
    reservationId: string,
    date: string,
    time: string,
    hoursRemaining: number
  ) => {
    try {
      // Show toast notification if app is open
      showInfoToast({
        title: "Upcoming Reservation",
        message: `You have a reservation ${hoursRemaining <= 3 ? 'in ' + hoursRemaining + ' hours' : 'tomorrow'} at ${time}.`,
        duration: 8000,
      });
      
      // Create in-app notification
      await createNotification({
        userId,
        type: 'general',
        title: '⏰ Upcoming Reservation',
        message: `You have a reservation ${hoursRemaining <= 3 ? 'in ' + hoursRemaining + ' hours' : 'tomorrow'} at ${time}.`,
        read: false,
        actionUrl: '/reservations?tab=my-reservations',
        metadata: {
          reservationId
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error creating upcoming reservation notification:', error);
      return false;
    }
  };

  return {
    notifyReservationConfirmed,
    notifyReservationCancelled,
    notifyUpcomingReservation
  };
};

// For admin-facing reservation management
export const useAdminReservationNotifications = () => {
  const { createNotification } = useNotifications();
  const { notifyReservationConfirmed, notifyReservationCancelled } = useUserReservationNotifications();

  // Send reservation confirmation as admin
  const sendReservationConfirmation = async (reservationId: string) => {
    try {
      // Get reservation details
      const reservationRef = doc(db, 'reservations', reservationId);
      const reservationSnap = await getDoc(reservationRef);
      
      if (!reservationSnap.exists()) {
        throw new Error('Reservation not found');
      }
      
      const reservationData = reservationSnap.data();
      
      // Update reservation status
      await updateDoc(reservationRef, { 
        status: 'confirmed',
        updatedAt: serverTimestamp()
      });
      
      // Create notification for user
      if (reservationData.userId) {
        await notifyReservationConfirmed(
          reservationData.userId,
          reservationId,
          reservationData.date,
          reservationData.time,
          reservationData.tableName
        );
      }
      
      // Show success toast for admin
      showSuccessToast({
        title: "Reservation Confirmed",
        message: `${reservationData.name}'s reservation has been confirmed`,
        duration: 4000
      });
      
      return true;
    } catch (error) {
      console.error('Error confirming reservation:', error);
      showWarningToast({
        title: "Failed to Confirm",
        message: "There was a problem confirming this reservation",
        duration: 4000
      });
      return false;
    }
  };

  // Send reservation cancellation as admin
  const sendReservationCancellation = async (reservationId: string, reason: string = "") => {
    try {
      // Get reservation details
      const reservationRef = doc(db, 'reservations', reservationId);
      const reservationSnap = await getDoc(reservationRef);
      
      if (!reservationSnap.exists()) {
        throw new Error('Reservation not found');
      }
      
      const reservationData = reservationSnap.data();
      
      // Update reservation status
      await updateDoc(reservationRef, { 
        status: 'cancelled',
        cancellationReason: reason || 'Cancelled by administration',
        updatedAt: serverTimestamp()
      });
      
      // Create notification for user
      if (reservationData.userId) {
        await notifyReservationCancelled(
          reservationData.userId,
          reservationId,
          reservationData.date,
          reservationData.time
        );
      }
      
      // Show success toast for admin
      showInfoToast({
        title: "Reservation Cancelled",
        message: `${reservationData.name}'s reservation has been cancelled`,
        duration: 4000
      });
      
      return true;
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      showWarningToast({
        title: "Failed to Cancel",
        message: "There was a problem cancelling this reservation",
        duration: 4000
      });
      return false;
    }
  };

  return {
    sendReservationConfirmation,
    sendReservationCancellation
  };
};
