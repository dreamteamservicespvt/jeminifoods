import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// WhatsApp Message Types
export type WhatsAppMessageType = 
  | 'reservation_confirmed'
  | 'reservation_cancelled'
  | 'order_status_update'
  | 'order_ready'
  | 'welcome_message';

export interface WhatsAppMessage {
  id?: string;
  userId: string;
  phoneNumber: string;
  messageType: WhatsAppMessageType;
  templateName: string;
  templateParams: Record<string, string>;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  timestamp: any;
  retryCount: number;
  errorMessage?: string;
}

export interface WhatsAppTemplate {
  type: WhatsAppMessageType;
  name: string;
  template: string;
  requiredParams: string[];
}

// WhatsApp Message Templates
const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    type: 'reservation_confirmed',
    name: 'reservation_confirmation',
    template: `🎉 Hello {{userName}}! 

Your reservation at *Jemini Restaurant* has been confirmed!

📅 *Date:* {{date}}
🕐 *Time:* {{time}}
👥 *Guests:* {{guests}}
📍 *Table:* {{tableNumber}}

We're excited to serve you! Please arrive 10 minutes early.

For any changes, call us at (555) 123-4567.

Thank you for choosing Jemini! 🍽️✨`,
    requiredParams: ['userName', 'date', 'time', 'guests', 'tableNumber']
  },
  {
    type: 'reservation_cancelled',
    name: 'reservation_cancellation',
    template: `Hello {{userName}},

Your reservation at *Jemini Restaurant* for {{date}} at {{time}} has been cancelled as requested.

We hope to see you again soon! To make a new reservation, visit our website or call (555) 123-4567.

Thank you! 🙏`,
    requiredParams: ['userName', 'date', 'time']
  },
  {
    type: 'order_status_update',
    name: 'order_update',
    template: `🍳 Order Update - Jemini Restaurant

Hi {{userName}}! Your order #{{orderId}} is now *{{status}}*.

{{statusMessage}}

📅 Pickup: {{pickupDate}} at {{pickupTime}}

Track your order: {{trackingUrl}}

Thank you! 🙏`,
    requiredParams: ['userName', 'orderId', 'status', 'statusMessage', 'pickupDate', 'pickupTime', 'trackingUrl']
  },
  {
    type: 'order_ready',
    name: 'order_ready',
    template: `🎉 Your order is ready for pickup!

Hi {{userName}}! Your order #{{orderId}} is freshly prepared and ready for pickup.

📍 *Pickup Location:* Jemini Restaurant
🕐 *Please collect by:* {{expiryTime}}

Show this message or your order ID at the counter.

Thank you for choosing Jemini! 🍽️✨`,
    requiredParams: ['userName', 'orderId', 'expiryTime']
  },
  {
    type: 'welcome_message',
    name: 'welcome',
    template: `🎉 Welcome to Jemini Restaurant!

Hi {{userName}}! Thank you for joining our family.

✨ Explore our exquisite menu
📱 Track your orders in real-time
🎯 Make reservations instantly

Visit our app: {{appUrl}}

We can't wait to serve you! 🍽️`,
    requiredParams: ['userName', 'appUrl']
  }
];

// WhatsApp Service Configuration
interface WhatsAppConfig {
  provider: 'twilio' | 'meta' | '360dialog';
  apiKey: string;
  apiSecret?: string;
  phoneNumberId?: string;
  accessToken?: string;
  webhookUrl?: string;
}

class WhatsAppService {
  private config: WhatsAppConfig | null = null;
  private baseUrl: string = '';

  constructor() {
    this.initializeConfig();
  }

  private initializeConfig() {
    // Initialize with environment variables
    const provider = (import.meta.env.VITE_WHATSAPP_PROVIDER || 'twilio') as WhatsAppConfig['provider'];
    
    this.config = {
      provider,
      apiKey: import.meta.env.VITE_WHATSAPP_API_KEY || '',
      apiSecret: import.meta.env.VITE_WHATSAPP_API_SECRET || '',
      phoneNumberId: import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID || '',
      accessToken: import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN || '',
      webhookUrl: import.meta.env.VITE_WHATSAPP_WEBHOOK_URL || ''
    };

    // Set base URL based on provider
    switch (provider) {
      case 'twilio':
        this.baseUrl = 'https://api.twilio.com/2010-04-01';
        break;
      case 'meta':
        this.baseUrl = 'https://graph.facebook.com/v18.0';
        break;
      case '360dialog':
        this.baseUrl = 'https://waba.360dialog.io/v1';
        break;
    }
  }

  // Get template by type
  private getTemplate(type: WhatsAppMessageType): WhatsAppTemplate | null {
    return WHATSAPP_TEMPLATES.find(template => template.type === type) || null;
  }

  // Format message with template parameters
  private formatMessage(template: string, params: Record<string, string>): string {
    let message = template;
    
    Object.entries(params).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      message = message.replace(new RegExp(placeholder, 'g'), value);
    });

    return message;
  }

  // Send WhatsApp message via Twilio
  private async sendViaTwilio(phoneNumber: string, message: string): Promise<boolean> {
    if (!this.config?.apiKey || !this.config?.apiSecret) {
      throw new Error('Twilio credentials not configured');
    }

    try {
      const accountSid = this.config.apiKey;
      const authToken = this.config.apiSecret;
      const fromNumber = 'whatsapp:+14155238886'; // Twilio sandbox number

      const response = await fetch(`${this.baseUrl}/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: `whatsapp:${phoneNumber}`,
          Body: message
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Twilio WhatsApp send error:', error);
      return false;
    }
  }

  // Send WhatsApp message via Meta Business API
  private async sendViaMeta(phoneNumber: string, message: string): Promise<boolean> {
    if (!this.config?.accessToken || !this.config?.phoneNumberId) {
      throw new Error('Meta WhatsApp credentials not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/${this.config.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.accessToken}`
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneNumber.replace(/^\+/, ''),
          type: 'text',
          text: { body: message }
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Meta WhatsApp send error:', error);
      return false;
    }
  }

  // Send WhatsApp message via 360Dialog
  private async sendVia360Dialog(phoneNumber: string, message: string): Promise<boolean> {
    if (!this.config?.apiKey) {
      throw new Error('360Dialog credentials not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'D360-API-KEY': this.config.apiKey
        },
        body: JSON.stringify({
          to: phoneNumber.replace(/^\+/, ''),
          type: 'text',
          text: { body: message }
        })
      });

      return response.ok;
    } catch (error) {
      console.error('360Dialog WhatsApp send error:', error);
      return false;
    }
  }

  // Main method to send WhatsApp message
  public async sendMessage(
    userId: string,
    phoneNumber: string,
    messageType: WhatsAppMessageType,
    templateParams: Record<string, string>
  ): Promise<string | null> {
    try {
      // Get template
      const template = this.getTemplate(messageType);
      if (!template) {
        throw new Error(`Template not found for type: ${messageType}`);
      }

      // Validate required parameters
      const missingParams = template.requiredParams.filter(param => !templateParams[param]);
      if (missingParams.length > 0) {
        throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
      }

      // Format message
      const message = this.formatMessage(template.template, templateParams);

      // Create message record in database
      const messageDoc = await addDoc(collection(db, 'whatsappMessages'), {
        userId,
        phoneNumber,
        messageType,
        templateName: template.name,
        templateParams,
        message,
        status: 'pending',
        timestamp: serverTimestamp(),
        retryCount: 0
      } as Omit<WhatsAppMessage, 'id'>);

      // Send message based on provider
      let success = false;
      
      if (!this.config) {
        throw new Error('WhatsApp service not configured');
      }

      switch (this.config.provider) {
        case 'twilio':
          success = await this.sendViaTwilio(phoneNumber, message);
          break;
        case 'meta':
          success = await this.sendViaMeta(phoneNumber, message);
          break;
        case '360dialog':
          success = await this.sendVia360Dialog(phoneNumber, message);
          break;
        default:
          throw new Error(`Unsupported provider: ${this.config.provider}`);
      }

      // Update message status
      await updateDoc(doc(db, 'whatsappMessages', messageDoc.id), {
        status: success ? 'sent' : 'failed',
        errorMessage: success ? undefined : 'Failed to send message'
      });

      return success ? messageDoc.id : null;
    } catch (error) {
      console.error('WhatsApp send error:', error);
      return null;
    }
  }

  // Retry failed messages
  public async retryFailedMessage(messageId: string): Promise<boolean> {
    try {
      // Implementation for retry logic
      // This would fetch the message from database and attempt to send again
      return true;
    } catch (error) {
      console.error('WhatsApp retry error:', error);
      return false;
    }
  }

  // Get message status
  public async getMessageStatus(messageId: string): Promise<string | null> {
    try {
      // Implementation to check message delivery status
      return 'delivered';
    } catch (error) {
      console.error('WhatsApp status check error:', error);
      return null;
    }
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService();

// Helper functions for common use cases
export const sendReservationConfirmation = async (
  userId: string,
  phoneNumber: string,
  reservationData: {
    userName: string;
    date: string;
    time: string;
    guests: string;
    tableNumber: string;
  }
) => {
  return await whatsappService.sendMessage(
    userId,
    phoneNumber,
    'reservation_confirmed',
    reservationData
  );
};

export const sendOrderStatusUpdate = async (
  userId: string,
  phoneNumber: string,
  orderData: {
    userName: string;
    orderId: string;
    status: string;
    statusMessage: string;
    pickupDate: string;
    pickupTime: string;
    trackingUrl: string;
  }
) => {
  return await whatsappService.sendMessage(
    userId,
    phoneNumber,
    'order_status_update',
    orderData
  );
};

export const sendOrderReadyNotification = async (
  userId: string,
  phoneNumber: string,
  orderData: {
    userName: string;
    orderId: string;
    expiryTime: string;
  }
) => {
  return await whatsappService.sendMessage(
    userId,
    phoneNumber,
    'order_ready',
    orderData
  );
};

export default whatsappService;
