import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, Users, MapPin, Star, User, Phone, MessageCircle,
  Edit, CheckCircle, MessageSquare, ArrowRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ReservationData } from '../FourStepReservationFlow';

interface ReviewSubmitStepProps {
  data: ReservationData;
  onEdit: (step: number) => void;
}

const occasionLabels: Record<string, string> = {
  birthday: 'Birthday Celebration 🎂',
  anniversary: 'Anniversary 💕',
  business: 'Business Meeting 💼',
  date: 'Romantic Date ❤️',
  family: 'Family Gathering 👨‍👩‍👧‍👦',
  celebration: 'Special Celebration 🎉',
  other: 'Other ✨',
};

const ReviewSubmitStep: React.FC<ReviewSubmitStepProps> = ({ data, onEdit }) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'EEEE, MMMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  return (
    <div className="space-y-8">
      {/* Reservation Summary Header */}
      <Card className="bg-gradient-to-br from-amber-900/20 to-amber-950/30 border-amber-600/50 p-6">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="text-black" size={32} />
          </motion.div>
          <h2 className="text-2xl font-serif font-bold text-amber-400 mb-2">
            Review Your Reservation
          </h2>
          <p className="text-cream/70">
            Please review all details before submitting your reservation request
          </p>
        </div>
      </Card>

      {/* Booking Details */}
      <Card className="bg-black/40 backdrop-blur-sm border-amber-900/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-600/20 rounded-full flex items-center justify-center">
              <Calendar className="text-amber-400" size={16} />
            </div>
            <h3 className="text-lg font-semibold text-amber-400">Booking Details</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(1)}
            className="text-amber-400 hover:text-amber-300 hover:bg-amber-900/20"
          >
            <Edit size={14} className="mr-1" />
            Edit
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-lg">
            <Calendar className="text-amber-400" size={20} />
            <div>
              <p className="text-cream/70 text-sm">Date</p>
              <p className="text-cream font-medium">{formatDate(data.date)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-lg">
            <Clock className="text-amber-400" size={20} />
            <div>
              <p className="text-cream/70 text-sm">Time</p>
              <p className="text-cream font-medium">{formatTime(data.time)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-lg">
            <Users className="text-amber-400" size={20} />
            <div>
              <p className="text-cream/70 text-sm">Party Size</p>
              <p className="text-cream font-medium">
                {data.partySize} {data.partySize === 1 ? 'Guest' : 'Guests'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Table & Occasion */}
      <Card className="bg-black/40 backdrop-blur-sm border-amber-900/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-600/20 rounded-full flex items-center justify-center">
              <MapPin className="text-amber-400" size={16} />
            </div>
            <h3 className="text-lg font-semibold text-amber-400">Table & Occasion</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(2)}
            className="text-amber-400 hover:text-amber-300 hover:bg-amber-900/20"
          >
            <Edit size={14} className="mr-1" />
            Edit
          </Button>
        </div>

        <div className="space-y-4">
          {data.tableId ? (
            <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-lg">
              <MapPin className="text-amber-400" size={20} />
              <div>
                <p className="text-cream/70 text-sm">Selected Table</p>
                <p className="text-cream font-medium">{data.tableName}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-lg border-2 border-dashed border-gray-600">
              <MapPin className="text-cream/50" size={20} />
              <div>
                <p className="text-cream/70 text-sm">Table Selection</p>
                <p className="text-cream/50">No specific table selected</p>
              </div>
            </div>
          )}

          {data.occasion && (
            <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-lg">
              <Star className="text-amber-400" size={20} />
              <div>
                <p className="text-cream/70 text-sm">Special Occasion</p>
                <p className="text-cream font-medium">{occasionLabels[data.occasion] || data.occasion}</p>
              </div>
            </div>
          )}

          {data.specialRequests && (
            <div className="p-4 bg-gray-800/30 rounded-lg">
              <div className="flex items-start gap-3">
                <MessageSquare className="text-amber-400 mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-cream/70 text-sm mb-2">Special Requests</p>
                  <p className="text-cream leading-relaxed">{data.specialRequests}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Contact Information */}
      <Card className="bg-black/40 backdrop-blur-sm border-amber-900/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-600/20 rounded-full flex items-center justify-center">
              <User className="text-amber-400" size={16} />
            </div>
            <h3 className="text-lg font-semibold text-amber-400">Contact Information</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(3)}
            className="text-amber-400 hover:text-amber-300 hover:bg-amber-900/20"
          >
            <Edit size={14} className="mr-1" />
            Edit
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-lg">
            <User className="text-amber-400" size={20} />
            <div>
              <p className="text-cream/70 text-sm">Name</p>
              <p className="text-cream font-medium">{data.fullName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-lg">
            <Phone className="text-amber-400" size={20} />
            <div>
              <p className="text-cream/70 text-sm">Phone & WhatsApp</p>
              <p className="text-cream font-medium">{data.phone}</p>
            </div>
          </div>
        </div>
        
        {/* Communication Method Info */}
        <div className="mt-4 p-4 bg-green-900/20 border border-green-800/30 rounded-lg">
          <div className="flex items-start gap-3">
            <MessageCircle className="text-green-400 mt-1" size={20} />
            <div>
              <p className="text-green-400 font-medium text-sm">WhatsApp & Phone Communication</p>
              <p className="text-green-300/80 text-sm mt-1">
                We'll send confirmations, updates, and reminders via WhatsApp. You can also call us directly for any questions.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Important Information */}
      <Card className="bg-blue-900/20 border-blue-600/30 p-6">
        <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
          <MessageSquare size={20} />
          Important Information
        </h3>
        
        <div className="space-y-3 text-cream/80">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
            <p className="text-sm">
              Your reservation request will be sent to our team for review and confirmation.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
            <p className="text-sm">
              You will receive a confirmation via WhatsApp within 30 minutes.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
            <p className="text-sm">
              Please arrive 15 minutes before your scheduled time.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
            <p className="text-sm">
              For changes or cancellations, please contact us directly via WhatsApp or phone at least 2 hours in advance.
            </p>
          </div>
        </div>
      </Card>

      {/* Final Confirmation */}
      <Card className="bg-green-900/20 border-green-600/30 p-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <CheckCircle className="text-green-400" size={24} />
          <h3 className="text-lg font-semibold text-green-400">Ready to Submit</h3>
        </div>
        <p className="text-cream/80 mb-4">
          By submitting this reservation, you agree to our terms and conditions. 
          Our team will review your request and confirm your booking shortly.
        </p>
        <Badge variant="outline" className="border-green-600/50 text-green-400">
          All information verified
        </Badge>
      </Card>
    </div>
  );
};

export default ReviewSubmitStep;
