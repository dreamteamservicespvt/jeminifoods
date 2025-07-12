import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface WhatsAppTemplateData {
  id: string;
  name: string;
  type: 'confirmation' | 'reminder' | 'cancellation' | 'no-show' | 'custom';
  title: string;
  message: string;
  isActive: boolean;
  placeholders: string[];
  createdAt: any;
  updatedAt?: any;
}

export interface WhatsAppMessageData {
  id?: string;
  reservationId?: string;
  phone: string;
  message: string;
  templateId?: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: any;
  createdAt: any;
  sentBy: string; // Admin user ID
}

export interface ReservationData {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  specialRequests?: string;
  status: string;
}

/**
 * Comprehensive WhatsApp Service for Admin Features
 */
class ComprehensiveWhatsAppService {
  /**
   * Get all active WhatsApp templates
   */
  async getTemplates(): Promise<WhatsAppTemplateData[]> {
    try {
      const templatesQuery = query(
        collection(db, 'whatsapp_templates'),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(templatesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WhatsAppTemplateData[];
    } catch (error) {
      console.error('Error fetching WhatsApp templates:', error);
      return [];
    }
  }

  /**
   * Get a specific template by ID
   */
  async getTemplate(templateId: string): Promise<WhatsAppTemplateData | null> {
    try {
      const templateDoc = await getDoc(doc(db, 'whatsapp_templates', templateId));
      if (templateDoc.exists()) {
        return {
          id: templateDoc.id,
          ...templateDoc.data()
        } as WhatsAppTemplateData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching WhatsApp template:', error);
      return null;
    }
  }

  /**
   * Replace placeholders in a message template
   */
  replacePlaceholders(template: string, data: ReservationData): string {
    let message = template;
    
    // Replace common placeholders
    message = message.replace(/{name}/g, data.name || '');
    message = message.replace(/{phone}/g, data.phone || '');
    message = message.replace(/{date}/g, data.date || '');
    message = message.replace(/{time}/g, data.time || '');
    message = message.replace(/{guests}/g, data.guests?.toString() || '');
    message = message.replace(/{specialRequests}/g, data.specialRequests || '');
    message = message.replace(/{status}/g, data.status || '');
    message = message.replace(/{reservationId}/g, data.id || '');
    
    // Replace current date and business info
    message = message.replace(/{currentDate}/g, new Date().toLocaleDateString());
    message = message.replace(/{businessName}/g, 'Jemini Foods');
    message = message.replace(/{businessPhone}/g, '+1-555-JEMINI');
    
    return message;
  }

  /**
   * Generate WhatsApp link for sending messages
   */
  generateWhatsAppLink(phone: string, message: string): string {
    // Clean phone number (remove non-digits)
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Ensure phone number has country code
    const formattedPhone = cleanPhone.startsWith('1') ? cleanPhone : `1${cleanPhone}`;
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Generate WhatsApp Web/App link
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  }

  /**
   * Send a WhatsApp message using a template
   */
  async sendTemplateMessage(
    reservationData: ReservationData,
    templateId: string,
    adminUserId: string
  ): Promise<{ success: boolean; link?: string; error?: string }> {
    try {
      const template = await this.getTemplate(templateId);
      if (!template) {
        return { success: false, error: 'Template not found' };
      }

      const message = this.replacePlaceholders(template.message, reservationData);
      const whatsappLink = this.generateWhatsAppLink(reservationData.phone, message);

      // Log the message attempt
      await this.logMessage({
        reservationId: reservationData.id,
        phone: reservationData.phone,
        message,
        templateId,
        status: 'pending',
        createdAt: new Date(),
        sentBy: adminUserId
      });

      // Open WhatsApp link
      window.open(whatsappLink, '_blank');

      return { success: true, link: whatsappLink };
    } catch (error) {
      console.error('Error sending template message:', error);
      return { success: false, error: 'Failed to send message' };
    }
  }

  /**
   * Send a custom WhatsApp message
   */
  async sendCustomMessage(
    phone: string,
    message: string,
    adminUserId: string,
    reservationId?: string
  ): Promise<{ success: boolean; link?: string; error?: string }> {
    try {
      const whatsappLink = this.generateWhatsAppLink(phone, message);

      // Log the message attempt
      await this.logMessage({
        reservationId,
        phone,
        message,
        status: 'pending',
        createdAt: new Date(),
        sentBy: adminUserId
      });

      // Open WhatsApp link
      window.open(whatsappLink, '_blank');

      return { success: true, link: whatsappLink };
    } catch (error) {
      console.error('Error sending custom message:', error);
      return { success: false, error: 'Failed to send message' };
    }
  }

  /**
   * Log WhatsApp message to Firestore
   */
  private async logMessage(messageData: Omit<WhatsAppMessageData, 'id'>): Promise<void> {
    try {
      await addDoc(collection(db, 'whatsapp_messages'), {
        ...messageData,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging WhatsApp message:', error);
    }
  }

  /**
   * Quick message generators for common scenarios
   */
  generateQuickMessage(type: 'greeting' | 'thanks' | 'followup', name?: string): string {
    const messages = {
      greeting: `Hi${name ? ` ${name}` : ''}! 👋

Thank you for your interest in Jemini Foods! We're here to help you with your reservation.

How can we assist you today?`,
      
      thanks: `Thank you${name ? ` ${name}` : ''}! 🙏

We appreciate your business and look forward to providing you with an exceptional dining experience.

If you have any questions, please don't hesitate to reach out!`,
      
      followup: `Hi${name ? ` ${name}` : ''}! 

We wanted to follow up on your recent inquiry about dining with us at Jemini Foods.

Are you still interested in making a reservation? We'd be happy to help!

Please let us know how we can assist you. 😊`
    };

    return messages[type];
  }

  /**
   * Get default templates for different message types
   */
  getDefaultTemplates(): Partial<WhatsAppTemplateData>[] {
    return [
      {
        name: 'Reservation Confirmation',
        type: 'confirmation',
        title: 'Reservation Confirmed',
        message: `🎉 Great news, {name}!

Your reservation at {businessName} has been CONFIRMED!

📅 Date: {date}
🕐 Time: {time}
👥 Guests: {guests}
📞 Contact: {phone}

📝 Special Requests: {specialRequests}

We're excited to welcome you for an unforgettable dining experience!

For any changes, please call us at {businessPhone}.

See you soon! ✨`,
        placeholders: ['name', 'date', 'time', 'guests', 'phone', 'specialRequests', 'businessName', 'businessPhone'],
        isActive: true
      },
      {
        name: 'Reservation Reminder',
        type: 'reminder',
        title: 'Reservation Reminder',
        message: `⏰ Friendly Reminder, {name}!

Your reservation at {businessName} is coming up:

📅 Date: {date}
🕐 Time: {time}
👥 Guests: {guests}

We're looking forward to serving you an exceptional meal!

If you need to make any changes, please call us at {businessPhone}.

Thank you! 🍽️`,
        placeholders: ['name', 'date', 'time', 'guests', 'businessName', 'businessPhone'],
        isActive: true
      },
      {
        name: 'Reservation Cancellation',
        type: 'cancellation',
        title: 'Reservation Cancelled',
        message: `❌ Reservation Cancelled

Hi {name},

Your reservation at {businessName} for {date} at {time} has been cancelled.

We understand that plans can change. We'd love to welcome you another time!

To make a new reservation, please call us at {businessPhone} or visit our website.

Thank you for your understanding. 🙏`,
        placeholders: ['name', 'date', 'time', 'businessName', 'businessPhone'],
        isActive: true
      },
      {
        name: 'No-Show Follow-up',
        type: 'no-show',
        title: 'We Missed You',
        message: `😔 We Missed You, {name}!

We had a table reserved for you today at {time}, but we noticed you weren't able to make it.

We hope everything is okay! We'd love to have you dine with us soon.

To make a new reservation, please call us at {businessPhone}.

Looking forward to serving you! 🍽️`,
        placeholders: ['name', 'time', 'businessPhone'],
        isActive: true
      }
    ];
  }
}

// Export singleton instance
export const comprehensiveWhatsAppService = new ComprehensiveWhatsAppService();
export default comprehensiveWhatsAppService;
