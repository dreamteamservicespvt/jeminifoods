import { useNotifications } from '../contexts/NotificationContext';
import { showSuccessToast, showInfoToast } from '@/lib/enhanced-toast-helpers';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  updateDoc, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Enhanced hooks for working with chef/order notifications and toasts
 * throughout the Jemini Foods system
 */

// For chef actions on orders
export const useChefNotifications = () => {
  const { createNotification } = useNotifications();

  // Send chef assigned notification
  const notifyChefAssigned = async (
    userId: string,
    orderData: {
      id: string;
      orderId: string;
      chefName: string;
      estimatedTime?: string;
    }
  ) => {
    try {
      // Create in-app notification
      await createNotification({
        userId,
        type: 'chef_assigned',
        title: '👨‍🍳 Chef Assigned',
        message: `${orderData.chefName} will be preparing your order${orderData.estimatedTime ? ` (est. time: ${orderData.estimatedTime})` : ''}.`,
        read: false,
        actionUrl: '/my-orders',
        metadata: {
          orderId: orderData.orderId
        }
      });

      // Show toast notification
      showInfoToast({
        title: "Chef Assigned",
        message: `Chef ${orderData.chefName} has been assigned to this order`,
        duration: 5000,
      });

      return true;
    } catch (error) {
      console.error('Error sending chef assignment notification:', error);
      return false;
    }
  };

  // Update order status
  const notifyOrderStatusUpdate = async (
    userId: string,
    orderData: {
      id: string;
      orderId: string;
      status: string;
      estimatedTime?: string;
    }
  ) => {
    try {
      let title = '';
      let message = '';
      let toastTitle = '';
      let toastMessage = '';

      switch (orderData.status) {
        case 'preparing':
          title = '👨‍🍳 Order Being Prepared';
          message = `Your order is now being prepared${orderData.estimatedTime ? ` (est. time: ${orderData.estimatedTime})` : ''}.`;
          toastTitle = "Order Status Updated";
          toastMessage = "The order is being prepared by the chef";
          break;
        case 'ready':
          title = '✅ Order Ready';
          message = `Your order is ready for pickup!`;
          toastTitle = "Order Status Updated";
          toastMessage = "The order is ready for pickup";
          break;
        case 'completed':
          title = '🎉 Order Completed';
          message = `Your order has been successfully completed. Enjoy!`;
          toastTitle = "Order Status Updated";
          toastMessage = "The order has been marked as completed";
          break;
        case 'cancelled':
          title = '❌ Order Cancelled';
          message = `Your order has been cancelled.`;
          toastTitle = "Order Status Updated";
          toastMessage = "The order has been cancelled";
          break;
        default:
          title = '🔄 Order Status Update';
          message = `Your order status has been updated to ${orderData.status}.`;
          toastTitle = "Order Status Updated";
          toastMessage = `Order status changed to: ${orderData.status}`;
      }
      
      // Create in-app notification
      await createNotification({
        userId,
        type: 'order_status_update',
        title,
        message,
        read: false,
        actionUrl: '/my-orders',
        metadata: {
          orderId: orderData.orderId
        }
      });

      // Show toast notification
      showSuccessToast({
        title: toastTitle,
        message: toastMessage,
        duration: 5000,
      });
      
      return true;
    } catch (error) {
      console.error('Error sending order status notification:', error);
      return false;
    }
  };

  return {
    notifyChefAssigned,
    notifyOrderStatusUpdate
  };
};

// For order management
export const useOrderManagement = () => {
  const { notifyOrderStatusUpdate } = useChefNotifications();
  
  // Update order status
  const updateOrderStatus = async (orderId: string, status: string, userId?: string) => {
    try {
      // Get order data
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (!orderDoc.exists()) {
        throw new Error('Order not found');
      }
      
      const orderData = orderDoc.data();
      
      // Update order status in database
      await updateDoc(orderRef, {
        status,
        updatedAt: serverTimestamp()
      });
      
      // Send notification if we have userId
      if (userId || orderData.userId) {
        await notifyOrderStatusUpdate(
          userId || orderData.userId,
          {
            id: orderId,
            orderId,
            status
          }
        );
      }
      
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  };
  
  return {
    updateOrderStatus
  };
};
