import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import FourStepReservationFlow from '@/components/reservation/FourStepReservationFlow';
import UserReservationStatus from '@/components/reservation/UserReservationStatus';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { CalendarCheck, ArrowLeft, CalendarPlus, CalendarRange } from 'lucide-react';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { showInfoToast, showSuccessToast } from '@/lib/enhanced-toast-helpers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

/**
 * UnifiedReservationPage
 * 
 * A full-featured reservation page that combines the best elements from both
 * the legacy and new reservation systems into a single, cohesive experience.
 */
const UnifiedReservationPage = () => {
  const { user } = useUserAuth();
  const [hasExistingReservations, setHasExistingReservations] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("new-reservation");
  const [reservationCompleted, setReservationCompleted] = useState(false);
  const [newReservationId, setNewReservationId] = useState<string | null>(null);

  // Check if user has existing reservations
  useEffect(() => {
    const checkUserReservations = async () => {
      if (!user) return;
      
      try {
        const q = query(
          collection(db, 'reservations'),
          where('userId', '==', user.uid)
        );
        
        const snapshot = await getDocs(q);
        setHasExistingReservations(!snapshot.empty);
      } catch (error) {
        console.error("Error checking for existing reservations:", error);
      }
    };
    
    checkUserReservations();
  }, [user]);

  // Show welcome message on page load
  useEffect(() => {
    showInfoToast({
      title: "Welcome to Jemini Reservations",
      message: "Experience our elegant booking system with enhanced features and real-time updates.",
      duration: 6000
    });
  }, []);

  // Handle reservation completion
  const handleReservationComplete = (reservationId: string, details: any) => {
    setNewReservationId(reservationId);
    setReservationCompleted(true);
    setActiveTab("my-reservations");
    
    showSuccessToast({
      title: "Reservation Confirmed",
      message: "Your table has been reserved. We look forward to serving you!",
      duration: 8000
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-amber-950/20 text-cream pb-40">
      {/* Gradient background */}
      <div className="absolute inset-0 w-full h-full -z-10 bg-gradient-to-b from-black via-black to-amber-950/10" />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 w-full h-full -z-10 opacity-5 pattern-texture" />
      
      {/* Top navigation */}
      <div className="max-w-7xl mx-auto pt-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <Link to="/">
            <Button variant="link" className="text-amber-400 hover:text-amber-300 transition-colors p-0 flex items-center gap-2">
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Page header */}
      <div className="max-w-7xl mx-auto pt-6 px-4 sm:px-6 lg:px-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-amber-900/30">
            <CalendarCheck className="text-black" size={32} />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-amber-400 mb-4">
            Reserve Your Table
          </h1>
          
          <p className="max-w-2xl text-cream/80 mb-4 text-lg">
            Experience an unforgettable dining journey at Jemini Foods. 
            Book your table now and let us prepare something exceptional for you.
          </p>
        </motion.div>
      </div>

      {/* Tabs for different reservation functions */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs 
          defaultValue="new-reservation" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-10">
            <TabsTrigger 
              value="new-reservation"
              className="data-[state=active]:bg-amber-900/40 data-[state=active]:text-amber-300"
            >
              <CalendarPlus className="mr-2 h-5 w-5" />
              <span>New Reservation</span>
            </TabsTrigger>
            <TabsTrigger 
              value="my-reservations"
              className="data-[state=active]:bg-amber-900/40 data-[state=active]:text-amber-300"
            >
              <CalendarRange className="mr-2 h-5 w-5" />
              <span>My Reservations</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="new-reservation" className="mt-0">
            {/* Four Step Reservation Flow Component */}
            <div className="bg-black/40 backdrop-blur-sm border border-amber-900/30 rounded-xl p-6 sm:p-8 shadow-xl">
              <FourStepReservationFlow />
            </div>
          </TabsContent>
          
          <TabsContent value="my-reservations" className="mt-0">
            <div className="bg-black/40 backdrop-blur-sm border border-amber-900/30 rounded-xl p-6 sm:p-8 shadow-xl">
              {user ? (
                <UserReservationStatus highlightReservationId={newReservationId} />
              ) : (
                <div className="text-center py-16">
                  <h3 className="text-2xl font-serif text-amber-400 mb-4">Sign In to View Your Reservations</h3>
                  <p className="mb-6 text-cream/80">
                    Please sign in to view and manage your reservations.
                  </p>
                  <Button 
                    variant="default" 
                    className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black"
                    onClick={() => window.location.href = '/login?redirect=/reservations'}
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Toaster for notifications */}
      <Toaster />
    </div>
  );
};

export default UnifiedReservationPage;
