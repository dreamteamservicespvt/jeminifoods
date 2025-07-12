import React from 'react';
import { motion } from 'framer-motion';
import ProgressiveReservationFlow from '@/components/reservation/ProgressiveReservationFlow';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { Toaster } from '@/components/ui/toaster';
import { showInfoToast } from '@/lib/enhanced-toast-helpers';
import UserReservationStatus from '@/components/reservation/UserReservationStatus';
import { Button } from '@/components/ui/button';
import { CalendarCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const NewReservations = () => {
  const { user } = useUserAuth();

  // Show information about the page when component loads
  React.useEffect(() => {
    showInfoToast({
      title: "Reservation System",
      message: "Our new booking system saves your preferences and allows you to track your reservations.",
      duration: 6000
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-black/95 text-cream pb-40">
      {/* Gradient background */}
      <div className="absolute inset-0 w-full h-full -z-10 bg-gradient-to-b from-black via-black to-amber-950/10" />

      {/* Background Pattern */}
      <div className="absolute inset-0 w-full h-full -z-10 opacity-5 pattern-texture" />

      {/* Top navigation */}
      <div className="max-w-7xl mx-auto pt-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <Link to="/">
            <Button variant="link" className="text-amber-400 hover:text-amber-300 transition-colors p-0 flex items-center gap-2">
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </Button>
          </Link>
          
          {user && (
            <Button variant="outline" className="border-amber-600/30 hover:border-amber-500/70 text-amber-400">
              View My Reservations
            </Button>
          )}
        </div>
      </div>

      {/* Page header */}
      <div className="max-w-7xl mx-auto pt-6 px-4 sm:px-6 lg:px-8 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <CalendarCheck className="text-black" size={32} />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-amber-400 mb-4">
            Reserve Your Table
          </h1>
          
          <p className="max-w-2xl text-cream/80 mb-4 text-lg">
            Experience an unforgettable dining experience at Jemini Foods. 
            Book your table now and let us prepare something exceptional for you.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <span className="bg-black/30 border border-amber-600/20 px-4 py-2 rounded-full text-amber-400/80 text-sm">
              Fine Dining
            </span>
            <span className="bg-black/30 border border-amber-600/20 px-4 py-2 rounded-full text-amber-400/80 text-sm">
              Award Winning
            </span>
            <span className="bg-black/30 border border-amber-600/20 px-4 py-2 rounded-full text-amber-400/80 text-sm">
              Expert Sommeliers
            </span>
          </div>
        </motion.div>
      </div>

      {/* Main reservation form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProgressiveReservationFlow 
          onReservationComplete={(reservationId, details) => {
            console.log("Reservation complete:", reservationId, details);
            // Could add any additional actions here
          }} 
        />
      </div>
      
      {/* Show existing reservations for logged in users */}
      {user && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-5xl mx-auto mt-20 px-4 sm:px-6 lg:px-8"
        >
          <h2 className="text-2xl font-serif font-bold text-amber-400 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 bg-amber-400/20 rounded-full flex items-center justify-center">
              <CalendarCheck size={20} className="text-amber-400" />
            </span>
            Your Existing Reservations
          </h2>
          
          <UserReservationStatus userId={user.uid} />
        </motion.div>
      )}
      
      {/* Toast container */}
      <Toaster />
    </div>
  );
};

export default NewReservations;
