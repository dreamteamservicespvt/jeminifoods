import { useNotifications } from '../contexts/NotificationContext';
import { 
  sendReservationConfirmation, 
  sendOrderStatusUpdate,
  sendOrderReadyNotification 
} from '../services/whatsappService';

// Notification integration hooks for admin and chef actions

export const useAdminNotifications = () => {
  const { createNotification } = useNotifications();

  // Send reservation confirmation notifications
  const sendReservationConfirmed = async (
    userId: string,
    reservationData: {
      id: string;
      userName: string;
      userPhone: string;
      date: string;
      time: string;
      guests: number;
      tableNumber: string;
    }
  ) => {
    try {
      // Create in-app notification
      await createNotification({
        userId,
        type: 'reservation_confirmed',
        title: '🎉 Reservation Confirmed!',
        message: `Your table for ${reservationData.guests} has been confirmed for ${reservationData.date} at ${reservationData.time}.`,
        read: false,
        actionUrl: '/dashboard?tab=reservations',
        metadata: {
          reservationId: reservationData.id
        }
      });

      // Send WhatsApp notification if enabled
      if (reservationData.userPhone) {
        await sendReservationConfirmation(
          userId,
          reservationData.userPhone,
          {
            userName: reservationData.userName,
            date: reservationData.date,
            time: reservationData.time,
            guests: reservationData.guests.toString(),
            tableNumber: reservationData.tableNumber
          }
        );
      }

      return true;
    } catch (error) {
      console.error('Error sending reservation confirmation:', error);
      return false;
    }
  };

  // Send reservation cancellation notifications
  const sendReservationCancelled = async (
    userId: string,
    reservationData: {
      id: string;
      userName: string;
      userPhone: string;
      date: string;
      time: string;
    }
  ) => {
    try {
      // Create in-app notification
      await createNotification({
        userId,
        type: 'reservation_cancelled',
        title: 'Reservation Cancelled',
        message: `Your reservation for ${reservationData.date} at ${reservationData.time} has been cancelled.`,
        read: false,
        actionUrl: '/reservations',
        metadata: {
          reservationId: reservationData.id
        }
      });

      return true;
    } catch (error) {
      console.error('Error sending reservation cancellation:', error);
      return false;
    }
  };

  // Send chef assignment notification
  const sendChefAssigned = async (
    userId: string,
    orderData: {
      id: string;
      orderId: string;
      chefName: string;
      userName: string;
    }
  ) => {
    try {
      // Create in-app notification
      await createNotification({
        userId,
        type: 'chef_assigned',
        title: '👨‍🍳 Chef Assigned!',
        message: `Chef ${orderData.chefName} has been assigned to prepare your order #${orderData.orderId}.`,
        read: false,
        actionUrl: '/dashboard?tab=preOrders',
        metadata: {
          orderId: orderData.id,
          chefName: orderData.chefName
        }
      });

      return true;
    } catch (error) {
      console.error('Error sending chef assignment notification:', error);
      return false;
    }
  };

  return {
    sendReservationConfirmed,
    sendReservationCancelled,
    sendChefAssigned
  };
};

export const useChefNotifications = () => {
  const { createNotification } = useNotifications();

  // Send order status update notifications
  const sendOrderStatusUpdated = async (
    userId: string,
    orderData: {
      id: string;
      orderId: string;
      status: string;
      userName: string;
      userPhone: string;
      pickupDate: string;
      pickupTime: string;
      chefName: string;
    }
  ) => {
    try {
      // Get status message
      const statusMessages = {
        taken: 'Your order has been assigned to our chef and will be prepared soon.',
        making: 'Your order is now being prepared by our chef. It will be ready soon!',
        ready: 'Your order is ready for pickup! Please come to the restaurant.',
        completed: 'Thank you! Your order has been completed.'
      };

      const statusEmojis = {
        taken: '👨‍🍳',
        making: '🍳',
        ready: '🎉',
        completed: '✅'
      };

      const statusMessage = statusMessages[orderData.status as keyof typeof statusMessages] || 'Your order status has been updated.';
      const statusEmoji = statusEmojis[orderData.status as keyof typeof statusEmojis] || '📦';

      // Create in-app notification
      await createNotification({
        userId,
        type: 'order_status_update',
        title: `${statusEmoji} Order Update`,
        message: `Order #${orderData.orderId} is now ${orderData.status}. ${statusMessage}`,
        read: false,
        actionUrl: '/dashboard?tab=preOrders',
        metadata: {
          orderId: orderData.id,
          status: orderData.status,
          chefName: orderData.chefName
        }
      });

      // Send WhatsApp notification for status updates
      if (orderData.userPhone) {
        await sendOrderStatusUpdate(
          userId,
          orderData.userPhone,
          {
            userName: orderData.userName,
            orderId: orderData.orderId,
            status: orderData.status,
            statusMessage,
            date: orderData.pickupDate,
            time: orderData.pickupTime,
            trackingUrl: `${window.location.origin}/dashboard?tab=preOrders`
          }
        );
      }

      // Special handling for "ready" status
      if (orderData.status === 'ready' && orderData.userPhone) {
        const expiryTime = new Date();
        expiryTime.setHours(expiryTime.getHours() + 2); // 2 hours to collect
        
        await sendOrderReadyNotification(
          userId,
          orderData.userPhone,
          {
            userName: orderData.userName,
            orderId: orderData.orderId,
            expiryTime: expiryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        );
      }

      return true;
    } catch (error) {
      console.error('Error sending order status update:', error);
      return false;
    }
  };

  return {
    sendOrderStatusUpdated
  };
};

// Utility hook for customer notifications
export const useCustomerNotifications = () => {
  const { createNotification } = useNotifications();

  // Welcome notification for new customers
  const sendWelcomeNotification = async (userId: string, userName: string) => {
    try {
      await createNotification({
        userId,
        type: 'general',
        title: '🎉 Welcome to Jemini!',
        message: `Hi ${userName}! Welcome to Jemini Restaurant. We're excited to serve you amazing food!`,
        read: false,
        actionUrl: '/menu'
      });

      return true;
    } catch (error) {
      console.error('Error sending welcome notification:', error);
      return false;
    }
  };

  // Order placement confirmation
  const sendOrderConfirmation = async (
    userId: string, 
    orderData: { 
      orderId: string; 
      total: number; 
      items: number;
      pickupTime: string;
    }
  ) => {
    try {
      await createNotification({
        userId,
        type: 'order_status_update',
        title: '📦 Order Placed Successfully!',
        message: `Your order #${orderData.orderId} with ${orderData.items} items (₹${orderData.total}) has been placed. Pickup time: ${orderData.pickupTime}`,
        read: false,
        actionUrl: '/dashboard?tab=preOrders',
        metadata: {
          orderId: orderData.orderId
        }
      });

      return true;
    } catch (error) {
      console.error('Error sending order confirmation:', error);
      return false;
    }
  };

  return {
    sendWelcomeNotification,
    sendOrderConfirmation
  };
};

export default {
  useAdminNotifications,
  useChefNotifications,
  useCustomerNotifications
};
