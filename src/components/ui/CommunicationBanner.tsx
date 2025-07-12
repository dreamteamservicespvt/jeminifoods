import React from 'react';
import { MessageSquare, Phone, Info, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * CommunicationBanner Component
 * 
 * Displays information about available communication methods
 * and WhatsApp/call preferences to users
 */
const CommunicationBanner: React.FC = () => {
  const whatsappNumber = "+1-555-JEMINI"; // Replace with actual business number
  
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Hi, I'd like to make a reservation at Jemini Foods.");
    window.open(`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const handleCallClick = () => {
    window.open(`tel:${whatsappNumber}`, '_self');
  };

  return (
    <div className="space-y-4">
      {/* Main Communication Banner */}
      <Alert className="bg-gradient-to-r from-green-900/20 to-amber-900/20 border-green-600/30">
        <MessageSquare className="h-5 w-5 text-green-400" />
        <AlertDescription className="text-cream">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Stay Connected with Jemini Foods</span>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-green-600/20 text-green-300 border-green-600/30">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  WhatsApp
                </Badge>
                <Badge variant="outline" className="bg-blue-600/20 text-blue-300 border-blue-600/30">
                  <Phone className="w-3 h-3 mr-1" />
                  Call
                </Badge>
              </div>
            </div>
            <p className="text-sm text-cream/80">
              We'll contact you via WhatsApp or phone for reservation confirmations, updates, and important notifications.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          onClick={handleWhatsAppClick}
          className="bg-gradient-to-r from-green-900/30 to-green-800/30 border border-green-600/30 rounded-lg p-4 cursor-pointer hover:from-green-800/40 hover:to-green-700/40 transition-all duration-300 group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center group-hover:bg-green-600/30 transition-colors">
              <MessageSquare className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="font-medium text-cream">WhatsApp</h3>
              <p className="text-sm text-cream/70">Quick reservation inquiries</p>
            </div>
          </div>
        </div>

        <div 
          onClick={handleCallClick}
          className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 border border-blue-600/30 rounded-lg p-4 cursor-pointer hover:from-blue-800/40 hover:to-blue-700/40 transition-all duration-300 group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
              <Phone className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-cream">Call Us</h3>
              <p className="text-sm text-cream/70">Speak directly with our team</p>
            </div>
          </div>
        </div>
      </div>

      {/* Communication Features */}
      <div className="bg-black/30 border border-amber-600/20 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Info className="w-5 h-5 text-amber-400" />
          <h3 className="font-medium text-amber-400">Communication Features</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-cream/80">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <span>Instant reservation confirmations via WhatsApp</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <span>Real-time updates and notifications</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <span>Personal call support for special requests</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <span>Secure and private communication</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { CommunicationBanner };
export default CommunicationBanner;
