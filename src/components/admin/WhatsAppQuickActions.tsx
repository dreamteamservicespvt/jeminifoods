import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, Send, Phone, Edit, Eye, Copy, 
  CheckCircle, AlertCircle, Clock, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { WhatsAppTemplate, Reservation } from '@/types/reservation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { showSuccessToast, showErrorToast } from '@/lib/enhanced-toast-helpers';

interface WhatsAppQuickActionsProps {
  reservation: Reservation;
  onMessageSent?: () => void;
}

interface MessagePreview {
  title: string;
  content: string;
  phoneNumber: string;
}

const WhatsAppQuickActions: React.FC<WhatsAppQuickActionsProps> = ({ 
  reservation, 
  onMessageSent 
}) => {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [messagePreview, setMessagePreview] = useState<MessagePreview | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load WhatsApp templates
  const loadTemplates = async () => {
    try {
      setLoading(true);
      const templatesSnapshot = await getDocs(collection(db, 'whatsappTemplates'));
      const templatesData = templatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WhatsAppTemplate[];
      
      setTemplates(templatesData.filter(t => t.isActive));
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format reservation data for template placeholders
  const getReservationData = () => {
    const reservationDate = new Date(reservation.date);
    const formattedDate = reservationDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const formattedTime = reservation.time || 'TBD';
    
    return {
      customerName: reservation.name,
      date: formattedDate,
      time: formattedTime,
      guests: reservation.guests.toString(),
      tableName: reservation.tableName || 'To be assigned',
      restaurantPhone: '+91 98765 43210', // Replace with actual restaurant phone
      customMessage: customMessage
    };
  };

  // Generate message from template
  const generateMessage = (template: WhatsAppTemplate): string => {
    let message = template.message;
    const data = getReservationData();
    
    // Replace placeholders
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      message = message.replace(placeholder, value);
    });

    // Handle conditional blocks (simple implementation)
    if (reservation.tableName) {
      message = message.replace(/{{#tableName}}(.*?){{\/tableName}}/g, '$1');
    } else {
      message = message.replace(/{{#tableName}}(.*?){{\/tableName}}/g, '');
    }

    return message;
  };

  // Preview message
  const previewMessage = (template: WhatsAppTemplate) => {
    const content = generateMessage(template);
    setMessagePreview({
      title: template.title,
      content,
      phoneNumber: reservation.phone
    });
    setShowPreviewDialog(true);
  };

  // Send WhatsApp message
  const sendWhatsAppMessage = async (template?: WhatsAppTemplate, customMsg?: string) => {
    setIsSending(true);
    
    try {
      let message = '';
      let title = '';
      
      if (template) {
        message = generateMessage(template);
        title = template.title;
      } else if (customMsg) {
        message = customMsg;
        title = 'Custom Message';
      }

      // Create WhatsApp URL
      const whatsappUrl = `https://wa.me/${reservation.phone.replace(/\D/g, '')}`
        + `?text=${encodeURIComponent(`${title}\n\n${message}`)}`;
      
      // Open WhatsApp
      window.open(whatsappUrl, '_blank');
      
      // Log the action (you can extend this to save to database)
      console.log('WhatsApp message sent:', {
        reservationId: reservation.id,
        customerName: reservation.name,
        phone: reservation.phone,
        template: template?.name || 'Custom',
        message
      });

      showSuccessToast({
        title: 'WhatsApp Opened',
        message: 'Message prepared and WhatsApp opened. Send the message to complete.'
      });

      onMessageSent?.();
      setShowPreviewDialog(false);
      setShowCustomDialog(false);
      
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      showErrorToast({
        title: 'Error',
        message: 'Failed to open WhatsApp. Please try again.'
      });
    } finally {
      setIsSending(false);
    }
  };

  // Copy message to clipboard
  const copyMessage = async (message: string) => {
    try {
      await navigator.clipboard.writeText(message);
      showSuccessToast({
        title: 'Copied!',
        message: 'Message copied to clipboard'
      });
    } catch (error) {
      showErrorToast({
        title: 'Error',
        message: 'Failed to copy message'
      });
    }
  };

  // Get template type badge color
  const getTypeColor = (type: WhatsAppTemplate['type']) => {
    switch (type) {
      case 'confirmation': return 'bg-green-600';
      case 'reminder': return 'bg-blue-600';
      case 'cancellation': return 'bg-red-600';
      case 'no-show': return 'bg-orange-600';
      case 'custom': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  if (loading) {
    return (
      <Card className="bg-black/40 backdrop-blur-sm border-gray-800 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-green-400" />
          <span className="ml-2 text-cream/60">Loading templates...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Actions Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-green-400" size={20} />
          <h3 className="text-lg font-semibold text-cream">WhatsApp Quick Actions</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowCustomDialog(true)}
            className="text-cream hover:text-cream/80"
          >
            <Edit size={14} className="mr-1" />
            Custom
          </Button>
          
          <a
            href={`tel:${reservation.phone}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm flex items-center gap-1 transition-colors"
          >
            <Phone size={14} />
            Call
          </a>
        </div>
      </div>

      {/* Template Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {templates.map((template) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-green-600/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-cream text-sm">{template.name}</h4>
                <Badge 
                  variant="secondary" 
                  className={`${getTypeColor(template.type)} text-white text-xs mt-1`}
                >
                  {template.type}
                </Badge>
              </div>
            </div>

            <p className="text-cream/60 text-xs mb-4 line-clamp-2">
              {template.title}
            </p>

            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => previewMessage(template)}
                className="flex-1 text-xs"
              >
                <Eye size={12} className="mr-1" />
                Preview
              </Button>
              
              <Button
                size="sm"
                onClick={() => sendWhatsAppMessage(template)}
                disabled={isSending}
                className="bg-green-600 hover:bg-green-700 text-white text-xs"
              >
                <Send size={12} />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {templates.length === 0 && (
        <Card className="bg-black/40 backdrop-blur-sm border-gray-800 p-8 text-center">
          <MessageSquare size={32} className="text-gray-500 mx-auto mb-3" />
          <h4 className="text-cream font-medium mb-2">No Templates Available</h4>
          <p className="text-cream/60 text-sm">
            Create WhatsApp templates to enable quick messaging
          </p>
        </Card>
      )}

      {/* Custom Message Dialog */}
      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogContent className="bg-black/90 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-cream">Send Custom Message</DialogTitle>
            <DialogDescription className="text-cream/60">
              Write a custom WhatsApp message for {reservation.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="customMessage" className="text-cream">Message</Label>
              <Textarea
                id="customMessage"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={6}
                className="bg-gray-800/50 border-gray-700 text-cream"
              />
            </div>

            <div className="bg-gray-900/50 rounded-lg p-3">
              <p className="text-cream/60 text-sm">
                <strong>Customer:</strong> {reservation.name}<br />
                <strong>Phone:</strong> {reservation.phone}<br />
                <strong>Reservation:</strong> {reservation.date} at {reservation.time}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowCustomDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => sendWhatsAppMessage(undefined, customMessage)}
              disabled={!customMessage.trim() || isSending}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSending ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : (
                <Send size={16} className="mr-2" />
              )}
              Send Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="bg-black/90 border-gray-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-cream flex items-center gap-2">
              <MessageSquare size={20} className="text-green-400" />
              Message Preview
            </DialogTitle>
          </DialogHeader>

          {messagePreview && (
            <div className="space-y-4">
              <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <MessageSquare size={16} className="text-black" />
                  </div>
                  <div>
                    <p className="text-green-400 font-medium text-sm">Jemini Restaurant</p>
                    <p className="text-green-300/60 text-xs">To: {reservation.name}</p>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-amber-400 font-medium text-sm mb-2">{messagePreview.title}</p>
                  <p className="text-cream text-sm leading-relaxed whitespace-pre-line">
                    {messagePreview.content}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => copyMessage(`${messagePreview.title}\n\n${messagePreview.content}`)}
                  className="flex-1"
                >
                  <Copy size={16} className="mr-2" />
                  Copy
                </Button>
                
                <Button
                  onClick={() => sendWhatsAppMessage(selectedTemplate)}
                  disabled={isSending}
                  className="bg-green-600 hover:bg-green-700 flex-1"
                >
                  {isSending ? (
                    <Loader2 size={16} className="animate-spin mr-2" />
                  ) : (
                    <Send size={16} className="mr-2" />
                  )}
                  Send
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WhatsAppQuickActions;
