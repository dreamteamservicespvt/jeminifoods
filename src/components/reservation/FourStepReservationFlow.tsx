import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { Calendar, Clock, Users, Phone, Mail, User, MapPin, Eye, ArrowRight, ArrowLeft, Check, X, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccessToast, showErrorToast, showWarningToast } from '@/lib/enhanced-toast-helpers';
import { validateBookingDetails, validateContactInfo, validateCompleteReservation } from '@/lib/reservation-validation';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import BookingDetailsStep from '@/components/reservation/steps/BookingDetailsStep';
import TableSelectionStep from '@/components/reservation/steps/TableSelectionStep';
import ContactInfoStep from '@/components/reservation/steps/ContactInfoStep';
import ReviewSubmitStep from '@/components/reservation/steps/ReviewSubmitStep';
import AuthenticationGate from '@/components/reservation/steps/AuthenticationGate';
import ReservationLoadingAnimation from '@/components/reservation/ReservationLoadingAnimation';
import ReservationSuccess from '@/components/reservation/ReservationSuccess';

// Reservation data interface
export interface ReservationData {
  // Step 1: Booking Details
  date: string;
  time: string;
  partySize: number;
  
  // Step 2: Table & Occasion
  tableId?: string;
  tableName?: string;
  occasion?: string;
  specialRequests?: string;
  
  // Step 3: Contact Info
  fullName: string;
  phone: string;
  
  // Additional metadata
  userId?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt?: any;
}

const STEP_TITLES = [
  'Booking Details',
  'Table & Occasion',
  'Contact Information',
  'Review & Submit'
];

const STEP_DESCRIPTIONS = [
  'Select your preferred date, time, and party size',
  'Choose your table and let us know about any special occasions',
  'Provide your contact details for confirmation',
  'Review your reservation details and submit'
];

const FourStepReservationFlow: React.FC = () => {
  const { user, isAuthenticated } = useUserAuth();
  const navigate = useNavigate();
  
  // Flow state
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(!isAuthenticated);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedReservationId, setSubmittedReservationId] = useState<string | null>(null);
  
  // Reservation data
  const [reservationData, setReservationData] = useState<ReservationData>({
    date: '',
    time: '',
    partySize: 2,
    fullName: '',
    phone: '',
    status: 'pending'
  });

  // Update auth gate when authentication changes
  useEffect(() => {
    setShowAuthGate(!isAuthenticated);
    if (isAuthenticated && user) {
      // Pre-fill user data if available
      setReservationData(prev => ({
        ...prev,
        fullName: user.displayName || '',
        userId: user.uid
      }));
    }
  }, [isAuthenticated, user]);

  // Handle step navigation
  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step);
    }
  };

  // Update reservation data
  const updateReservationData = (updates: Partial<ReservationData>) => {
    setReservationData(prev => ({ ...prev, ...updates }));
  };

  // Validate step data (without side effects for rendering)
  const validateStepData = (step: number): { isValid: boolean; errors: string[]; warnings: string[] } => {
    switch (step) {
      case 1:
        return validateBookingDetails(reservationData);
      case 2:
        return { isValid: true, errors: [], warnings: [] }; // Table selection is optional
      case 3:
        return validateContactInfo(reservationData);
      case 4:
        return validateCompleteReservation(reservationData);
      default:
        return { isValid: false, errors: ['Invalid step'], warnings: [] };
    }
  };

  // Validate step with toast notifications (for user interactions)
  const validateStepWithFeedback = (step: number): boolean => {
    const validation = validateStepData(step);
    
    if (!validation.isValid) {
      const errorMessages = {
        1: "Booking Details Required",
        2: "Selection Required", 
        3: "Contact Information Required",
        4: "Incomplete Information"
      };
      
      showErrorToast({
        title: errorMessages[step as keyof typeof errorMessages] || "Validation Error",
        message: validation.errors[0],
        duration: 4000
      });
    }
    
    // Show warnings if any
    if (validation.warnings.length > 0) {
      showWarningToast({
        title: "Please Note",
        message: validation.warnings[0],
        duration: 5000
      });
    }
    
    return validation.isValid;
  };

  // Handle step progression
  const handleNext = () => {
    if (validateStepWithFeedback(currentStep)) {
      nextStep();
      showSuccessToast({
        title: "Step Completed",
        message: `${STEP_TITLES[currentStep - 1]} saved successfully`,
        duration: 2000
      });
    } else {
      showWarningToast({
        title: "Missing Information",
        message: "Please complete all required fields before continuing",
        duration: 3000
      });
    }
  };

  // Submit reservation
  const handleSubmit = async () => {
    const validation = validateCompleteReservation(reservationData);
    
    if (!validation.isValid) {
      showErrorToast({
        title: "Incomplete Information",
        message: validation.errors[0],
        duration: 4000
      });
      return;
    }

    // Show warnings if any before submitting
    if (validation.warnings.length > 0) {
      showWarningToast({
        title: "Please Note",
        message: validation.warnings[0],
        duration: 5000
      });
    }

    setIsSubmitting(true);
    
    try {
      const reservationDoc = {
        ...reservationData,
        createdAt: serverTimestamp(),
        userId: user?.uid,
        status: 'pending'
      };

      const docRef = await addDoc(collection(db, 'reservations'), reservationDoc);
      
      // Store the reservation ID and show success
      setSubmittedReservationId(docRef.id);
      setShowSuccess(true);

      showSuccessToast({
        title: "Reservation Submitted!",
        message: "Your reservation has been sent for approval. We'll notify you once confirmed.",
        duration: 5000
      });

    } catch (error) {
      console.error('Error submitting reservation:', error);
      showErrorToast({
        title: "Submission Failed",
        message: "Failed to submit reservation. Please try again.",
        duration: 4000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Authentication gate component
  if (showAuthGate) {
    return <AuthenticationGate onLogin={() => setShowAuthGate(false)} />;
  }

  // Show loading animation when submitting
  if (isSubmitting) {
    return (
      <ReservationLoadingAnimation 
        message="Submitting Your Reservation"
        subMessage="Please wait while we process your booking details"
      />
    );
  }

  // Show success component after successful submission
  if (showSuccess && submittedReservationId) {
    return (
      <ReservationSuccess
        reservationData={reservationData}
        reservationId={submittedReservationId}
        onClose={() => {
          setShowSuccess(false);
          setCurrentStep(1);
          // Reset form data
          setReservationData({
            date: '',
            time: '',
            partySize: 2,
            fullName: user?.displayName || '',
            phone: '',
            status: 'pending',
            userId: user?.uid
          });
        }}
        onViewDashboard={() => {
          navigate('/dashboard');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-black/95 text-cream">
      {/* Progress Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-sm border-b border-amber-900/20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Step Indicators */}
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                    step < currentStep
                      ? 'bg-green-600 text-black'
                      : step === currentStep
                      ? 'bg-amber-600 text-black'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {step < currentStep ? <Check size={16} /> : step}
                </motion.div>
                {step < 4 && (
                  <div 
                    className={`w-8 h-0.5 mx-2 transition-all duration-300 ${
                      step < currentStep ? 'bg-green-600' : 'bg-gray-800'
                    }`} 
                  />
                )}
              </div>
            ))}
          </div>

          {/* Current Step Info */}
          <div className="text-center">
            <h2 className="text-2xl font-serif font-bold text-amber-400 mb-2">
              {STEP_TITLES[currentStep - 1]}
            </h2>
            <p className="text-cream/70 text-sm">
              {STEP_DESCRIPTIONS[currentStep - 1]}
            </p>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {currentStep === 1 && (
              <BookingDetailsStep
                data={reservationData}
                onUpdate={updateReservationData}
              />
            )}
            {currentStep === 2 && (
              <TableSelectionStep
                data={reservationData}
                onUpdate={updateReservationData}
              />
            )}
            {currentStep === 3 && (
              <ContactInfoStep
                data={reservationData}
                onUpdate={updateReservationData}
              />
            )}
            {currentStep === 4 && (
              <ReviewSubmitStep
                data={reservationData}
                onEdit={goToStep}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-amber-900/20">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="text-amber-400 hover:text-amber-300 disabled:opacity-50"
          >
            <ArrowLeft size={16} className="mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-cream/60">
              Step {currentStep} of 4
            </span>
          </div>

          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              className="bg-amber-600 hover:bg-amber-500 text-black font-semibold"
              disabled={!validateStepData(currentStep).isValid}
            >
              Continue
              <ArrowRight size={16} className="ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !validateStepData(4).isValid}
              className="bg-green-600 hover:bg-green-500 text-black font-semibold"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-black border-t-transparent rounded-full mr-2"
                  />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Reservation
                  <Check size={16} className="ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FourStepReservationFlow;
