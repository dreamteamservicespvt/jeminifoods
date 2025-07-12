import { toast } from "@/hooks/use-toast";
import { ToastActionElement } from "@/components/ui/toast";
import { format } from "date-fns";

/**
 * Enhanced toast helper functions for Jemini Foods
 * 
 * This version provides standardized toast notifications with consistent styling,
 * dark mode support, and special treatments for reservation and order-related toasts.
 * 
 * All toasts follow the Jemini Foods dark theme and integrate seamlessly with both the
 * reservation system and admin dashboard.
 */

// Basic toast options
interface ToastOptions {
  message: string;
  title?: string;
  duration?: number;
  action?: ToastActionElement;
}

// Reservation specific toast options
interface ReservationToastOptions extends ToastOptions {
  date?: Date | string;
  time?: string;
  guests?: number;
  tableName?: string;
  tableId?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

// Order specific toast options
interface OrderToastOptions extends ToastOptions {
  orderNumber?: string;
  status?: string;
  items?: number;
  amount?: number;
  chefName?: string;
}

/**
 * Shows a success toast notification
 */
export function showSuccessToast({ 
  message, 
  title = "Success", 
  duration = 5000,
  action
}: ToastOptions) {
  return toast({
    title,
    description: message,
    variant: "success",
    duration,
    action,
  });
}

/**
 * Shows an error toast notification
 */
export function showErrorToast({ 
  message, 
  title = "Error", 
  duration = 6000,
  action
}: ToastOptions) {
  return toast({
    title,
    description: message,
    variant: "destructive",
    duration,
    action,
  });
}

/**
 * Shows a warning toast notification
 */
export function showWarningToast({ 
  message, 
  title = "Warning", 
  duration = 5000,
  action
}: ToastOptions) {
  return toast({
    title, 
    description: message,
    variant: "warning",
    duration,
    action,
  });
}

/**
 * Shows an info toast notification
 */
export function showInfoToast({ 
  message, 
  title = "Information", 
  duration = 4500,
  action
}: ToastOptions) {
  return toast({
    title,
    description: message,
    variant: "info",
    duration,
    action,
  });
}

/**
 * Shows a reservation-specific toast notification with formatted details
 */
export function showReservationToast({ 
  message, 
  title = "Reservation Update", 
  duration = 6000,
  date,
  time,
  guests,
  tableName,
  status,
  action
}: ReservationToastOptions) {
  let displayMessage = message;

  // Format date if provided
  if (date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const formattedDate = format(dateObj, 'EEEE, MMMM d');
    displayMessage += `\n${formattedDate}`;
    
    if (time) {
      displayMessage += ` at ${time}`;
    }
  }
  
  // Add guests info if provided
  if (guests) {
    displayMessage += `\n${guests} ${guests === 1 ? 'guest' : 'guests'}`;
  }
  
  // Add table info if provided
  if (tableName) {
    displayMessage += `\nTable: ${tableName}`;
  }
  
  // Set toast variant based on status
  let variant: "default" | "success" | "destructive" | "warning" | "info" = "default";
  
  if (status) {
    switch (status) {
      case "confirmed":
        variant = "success";
        break;
      case "cancelled":
        variant = "destructive";
        break;
      case "pending":
        variant = "warning";
        break;
      case "completed":
        variant = "info";
        break;
      default:
        variant = "default";
    }
  }
  
  return toast({
    title,
    description: displayMessage,
    variant,
    duration,
    action,
  });
}

/**
 * Shows an order-specific toast notification with formatted details
 */
export function showOrderToast({ 
  message, 
  title = "Order Update", 
  duration = 5000,
  orderNumber,
  status,
  items,
  amount,
  chefName,
  action
}: OrderToastOptions) {
  let displayMessage = message;

  // Add order number if provided
  if (orderNumber) {
    displayMessage += `\nOrder #${orderNumber}`;
  }
  
  // Add items info if provided
  if (items) {
    displayMessage += `\n${items} ${items === 1 ? 'item' : 'items'}`;
  }
  
  // Add amount if provided
  if (amount) {
    displayMessage += `\nTotal: $${amount.toFixed(2)}`;
  }
  
  // Add chef info if provided
  if (chefName) {
    displayMessage += `\nChef: ${chefName}`;
  }
  
  // Set toast variant based on status
  let variant: "default" | "success" | "destructive" | "warning" | "info" = "default";
  
  if (status) {
    switch (status) {
      case "completed":
      case "ready":
        variant = "success";
        break;
      case "cancelled":
        variant = "destructive";
        break;
      case "preparing":
        variant = "info";
        break;
      case "new":
      case "pending":
        variant = "warning";
        break;
      default:
        variant = "default";
    }
  }
  
  return toast({
    title,
    description: displayMessage,
    variant,
    duration,
    action,
  });
}

/**
 * Shows a reservation confirmation toast
 */
export function showReservationConfirmationToast({
  date,
  time,
  guests,
  tableName
}: {
  date: Date | string;
  time?: string;
  guests?: number;
  tableName?: string;
}) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return showReservationToast({
    title: "Reservation Confirmed",
    message: "Your table is ready to be served.",
    status: "confirmed",
    date: dateObj,
    time,
    guests,
    tableName,
    duration: 8000
  });
}

/**
 * Format reservation details into a human-readable string
 */
export function formatReservationDetails(details: {
  date?: Date | string;
  time?: string;
  guests?: number;
  name?: string;
  tableId?: string;
  tableName?: string;
}): string {
  const dateStr = details.date ? 
    (typeof details.date === 'string' ? 
      details.date : 
      format(details.date, 'MMM dd, yyyy')) 
    : '';
    
  let formatted = '';
  
  if (dateStr) formatted += `${dateStr}`;
  if (details.time) formatted += `${formatted ? ' at ' : ''}${details.time}`;
  if (details.guests) formatted += `${formatted ? ' • ' : ''}${details.guests} guest${details.guests !== 1 ? 's' : ''}`;
  if (details.tableName) formatted += `${formatted ? ' • ' : ''}Table: ${details.tableName}`;
  
  return formatted || 'No details available';
}

/**
 * Format order details into a human-readable string
 */
export function formatOrderDetails(details: {
  orderNumber?: string;
  status?: string;
  items?: number;
  amount?: number;
  date?: Date | string;
}): string {
  let formatted = '';
  
  if (details.orderNumber) formatted += `Order #${details.orderNumber}`;
  if (details.status) formatted += `${formatted ? ' • ' : ''}${details.status.charAt(0).toUpperCase() + details.status.slice(1)}`;
  if (details.items) formatted += `${formatted ? ' • ' : ''}${details.items} item${details.items !== 1 ? 's' : ''}`;
  if (details.amount) formatted += `${formatted ? ' • ' : ''}$${details.amount.toFixed(2)}`;
  
  if (details.date) {
    const dateObj = typeof details.date === 'string' ? new Date(details.date) : details.date;
    const dateStr = format(dateObj, 'MMM dd, yyyy');
    formatted += `${formatted ? ' • ' : ''}${dateStr}`;
  }
  
  return formatted || 'No details available';
}

/**
 * General purpose toast function that allows specifying the type
 */
export function showToast({ 
  type = "default",
  message,
  title,
  duration = 5000,
  action
}: {
  type: "success" | "error" | "warning" | "info" | "reservation" | "order" | "default";
} & ToastOptions) {
  switch (type) {
    case "success":
      return showSuccessToast({ message, title, duration, action });
    case "error":
      return showErrorToast({ message, title, duration, action });
    case "warning":
      return showWarningToast({ message, title, duration, action });
    case "info":
      return showInfoToast({ message, title, duration, action });
    case "reservation":
      return showReservationToast({ message, title, duration, action });
    case "order":
      return showOrderToast({ message, title, duration, action });
    default:
      return toast({
        title,
        description: message,
        duration,
        action,
      });
  }
}

/**
 * Generate a WhatsApp message link for reservation details
 */
export function generateWhatsAppLink(reservationDetails: {
  id?: string;
  name?: string;
  date?: Date | string;
  time?: string;
  guests?: number;
  tableName?: string;
  status?: string;
  phone?: string;
  reservationId?: string;
}): string {
  // Restaurant's WhatsApp number (would typically come from an environment variable or config)
  const restaurantPhone = "+12345678901"; // Replace with actual number
  
  // Format the reservation details
  const dateStr = reservationDetails.date ? 
    (typeof reservationDetails.date === 'string' ? 
      reservationDetails.date : 
      format(reservationDetails.date, 'MMM dd, yyyy'))
    : '';
  
  // Use id or reservationId (for backward compatibility)
  const id = reservationDetails.id || reservationDetails.reservationId || 'N/A';
  
  // Create a message template
  let message = `Hello Jemini Foods! I'd like to inquire about my reservation:\n`;
  message += `Reservation #: ${id}\n`;
  message += `Name: ${reservationDetails.name || 'N/A'}\n`;
  message += `Date: ${dateStr}\n`;
  message += `Time: ${reservationDetails.time || 'N/A'}\n`;
  message += `Guests: ${reservationDetails.guests || 'N/A'}\n`;
  if (reservationDetails.tableName) message += `Table: ${reservationDetails.tableName}\n`;
  message += `Status: ${reservationDetails.status || 'Pending'}\n\n`;
  message += `I have a question about this reservation.`;
  
  // Encode for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Create WhatsApp link - use customer's phone if available, otherwise restaurant's
  const phone = reservationDetails.phone?.replace(/\D/g, '') || restaurantPhone;
  return `https://wa.me/${phone}?text=${encodedMessage}`;
}

/**
 * Open a WhatsApp chat for reservation inquiry
 */
export function openWhatsAppReservationChat(details: {
  reservationId?: string;
  name?: string;
  date?: Date | string;
  time?: string;
  guests?: number;
  tableName?: string;
  phone?: string;
}): void {
  const url = generateWhatsAppLink(details);
  window.open(url, '_blank', 'noopener,noreferrer');
}
