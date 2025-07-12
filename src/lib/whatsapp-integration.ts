/**
 * WhatsApp Integration for Reservation Confirmations
 * Generates WhatsApp links and message templates for reservation communications
 */

export interface WhatsAppMessageData {
  customerName: string;
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  tableName?: string;
  restaurantPhone: string;
}

/**
 * Generate WhatsApp confirmation message
 */
export const generateConfirmationMessage = (data: WhatsAppMessageData): string => {
  const message = `Hi ${data.customerName}! 

🎉 Your reservation at Jemini Foods is CONFIRMED!

📅 Date: ${data.reservationDate}
🕒 Time: ${data.reservationTime}
👥 Party Size: ${data.partySize} ${data.partySize === 1 ? 'guest' : 'guests'}
${data.tableName ? `🪑 Table: ${data.tableName}` : ''}

📍 Location: Jemini Foods Restaurant
⏰ Please arrive 15 minutes early

For any changes, reply to this message or call us.

Looking forward to serving you! ✨`;

  return message;
};

/**
 * Generate WhatsApp reminder message (sent 2 hours before reservation)
 */
export const generateReminderMessage = (data: WhatsAppMessageData): string => {
  const message = `🔔 Reservation Reminder

Hi ${data.customerName}! Your table at Jemini Foods is reserved for today.

🕒 Time: ${data.reservationTime}
👥 Party Size: ${data.partySize} ${data.partySize === 1 ? 'guest' : 'guests'}

See you soon! 🍽️`;

  return message;
};

/**
 * Generate WhatsApp link for sending messages
 */
export const generateWhatsAppLink = (phoneNumber: string, message: string): string => {
  // Remove non-digits and format phone number
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Add country code if not present (assuming India +91)
  const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  
  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
};

/**
 * Open WhatsApp with pre-filled message
 */
export const sendWhatsAppMessage = (phoneNumber: string, message: string): void => {
  const whatsappUrl = generateWhatsAppLink(phoneNumber, message);
  window.open(whatsappUrl, '_blank');
};

/**
 * Send confirmation WhatsApp message
 */
export const sendConfirmationWhatsApp = (data: WhatsAppMessageData): void => {
  const message = generateConfirmationMessage(data);
  sendWhatsAppMessage(data.restaurantPhone, message);
};

/**
 * Send reminder WhatsApp message
 */
export const sendReminderWhatsApp = (data: WhatsAppMessageData): void => {
  const message = generateReminderMessage(data);
  sendWhatsAppMessage(data.restaurantPhone, message);
};

/**
 * Schedule reminder for 2 hours before reservation
 * Note: This would typically be handled by a backend service
 */
export const scheduleReminderMessage = (reservationDateTime: Date, data: WhatsAppMessageData): void => {
  const reminderTime = new Date(reservationDateTime.getTime() - (2 * 60 * 60 * 1000)); // 2 hours before
  const now = new Date();
  
  if (reminderTime > now) {
    const timeUntilReminder = reminderTime.getTime() - now.getTime();
    
    // For demo purposes - in production, this should be handled by a backend service
    setTimeout(() => {
      console.log('Sending WhatsApp reminder:', generateReminderMessage(data));
      // In production: call backend API to send WhatsApp message
    }, timeUntilReminder);
    
    console.log(`Reminder scheduled for: ${reminderTime.toLocaleString()}`);
  }
};

/**
 * Default restaurant contact information
 * Update these values with actual restaurant details
 */
export const RESTAURANT_CONTACT = {
  phone: '+911234567890', // Update with actual restaurant WhatsApp number
  name: 'Jemini Foods Restaurant',
  address: 'Your Restaurant Address Here'
};

/**
 * Message templates for different scenarios
 */
export const MESSAGE_TEMPLATES = {
  confirmation: generateConfirmationMessage,
  reminder: generateReminderMessage,
  cancellation: (data: WhatsAppMessageData) => 
    `Hi ${data.customerName}, your reservation at Jemini Foods for ${data.reservationDate} at ${data.reservationTime} has been cancelled. We hope to serve you soon!`,
  modification: (data: WhatsAppMessageData) => 
    `Hi ${data.customerName}, your reservation at Jemini Foods has been updated: ${data.reservationDate} at ${data.reservationTime} for ${data.partySize} guests.`
};
