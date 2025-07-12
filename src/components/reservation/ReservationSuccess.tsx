import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Clock, Users, MapPin, MessageSquare, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReservationData } from '@/components/reservation/FourStepReservationFlow';
import { format } from 'date-fns';
import { generateConfirmationMessage, sendWhatsAppMessage } from '@/lib/whatsapp-integration';

interface ReservationSuccessProps {
  reservationData: ReservationData;
  reservationId: string;
  onClose: () => void;
  onViewDashboard: () => void;
}

const ReservationSuccess: React.FC<ReservationSuccessProps> = ({
  reservationData,
  reservationId,
  onClose,
  onViewDashboard
}) => {
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const checkMarkVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.2
      }
    }
  };

  // Generate formatted date and time
  const formattedDate = reservationData.date ? format(new Date(reservationData.date), 'EEEE, MMMM d, yyyy') : '';
  const formattedTime = reservationData.time || '';

  // Handle WhatsApp sharing
  const handleWhatsAppShare = () => {
    const message = generateConfirmationMessage({
      customerName: reservationData.fullName,
      reservationDate: formattedDate,
      reservationTime: formattedTime,
      partySize: reservationData.partySize,
      tableName: reservationData.tableName,
      restaurantPhone: "+91 9876543210" // Replace with actual restaurant phone
    });

    sendWhatsAppMessage(reservationData.phone, message);
  };

  // Handle sharing
  const handleShare = async () => {
    const shareData = {
      title: 'Jemini Foods Reservation',
      text: `I've made a reservation at Jemini Foods for ${formattedDate} at ${formattedTime}!`,
      url: window.location.origin
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
    }
  };

  // Handle download confirmation
  const handleDownload = () => {
    const confirmationText = `
JEMINI FOODS RESERVATION CONFIRMATION

Reservation ID: ${reservationId}
Name: ${reservationData.fullName}
Date: ${formattedDate}
Time: ${formattedTime}
Party Size: ${reservationData.partySize} ${reservationData.partySize === 1 ? 'guest' : 'guests'}
${reservationData.tableName ? `Table: ${reservationData.tableName}` : ''}
Phone: ${reservationData.phone}

${reservationData.occasion ? `Occasion: ${reservationData.occasion}` : ''}
${reservationData.specialRequests ? `Special Requests: ${reservationData.specialRequests}` : ''}

Status: Pending Confirmation

Thank you for choosing Jemini Foods!
We will contact you via WhatsApp or phone to confirm your reservation.

Address: [Restaurant Address]
Phone: [Restaurant Phone]
WhatsApp: [Restaurant WhatsApp]
    `;

    const element = document.createElement('a');
    const file = new Blob([confirmationText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `jemini_reservation_${reservationId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <Card className="bg-black/90 backdrop-blur-sm border-green-500/30 shadow-2xl">
          <div className="p-8 text-center">
            {/* Success Icon */}
            <motion.div
              variants={checkMarkVariants}
              initial="hidden"
              animate="visible"
              className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <CheckCircle className="text-white" size={48} />
            </motion.div>

            {/* Success Message */}
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl font-serif font-bold text-green-400 mb-3">
                Reservation Confirmed!
              </h2>
              <p className="text-cream/80 mb-6 leading-relaxed">
                Your table has been successfully reserved. We'll contact you soon to confirm the details.
              </p>
            </motion.div>

            {/* Reservation Details */}
            <motion.div variants={itemVariants} className="space-y-4 mb-8">
              <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-green-400 font-semibold">Reservation Details</h3>
                  <Badge variant="outline" className="border-green-500/30 text-green-400">
                    ID: {reservationId.slice(-6).toUpperCase()}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm text-cream/80">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-green-400" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-green-400" />
                    <span>{formattedTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-green-400" />
                    <span>{reservationData.partySize} {reservationData.partySize === 1 ? 'guest' : 'guests'}</span>
                  </div>
                  {reservationData.tableName && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-green-400" />
                      <span>{reservationData.tableName}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={itemVariants} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleWhatsAppShare}
                  variant="outline"
                  className="border-green-500/30 hover:border-green-400/50 text-green-400 hover:text-green-300"
                  size="sm"
                >
                  <MessageSquare size={16} className="mr-2" />
                  WhatsApp
                </Button>
                
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="border-green-500/30 hover:border-green-400/50 text-green-400 hover:text-green-300"
                  size="sm"
                >
                  <Download size={16} className="mr-2" />
                  Download
                </Button>
              </div>

              <Button
                onClick={onViewDashboard}
                className="w-full bg-green-600 hover:bg-green-500 text-black font-semibold"
              >
                View My Reservations
              </Button>

              <Button
                onClick={onClose}
                variant="ghost"
                className="w-full text-cream/60 hover:text-cream/80"
              >
                Close
              </Button>
            </motion.div>

            {/* Footer */}
            <motion.div variants={itemVariants} className="mt-6 pt-4 border-t border-green-500/20">
              <p className="text-cream/60 text-xs">
                You will receive a WhatsApp confirmation message shortly
              </p>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ReservationSuccess;
