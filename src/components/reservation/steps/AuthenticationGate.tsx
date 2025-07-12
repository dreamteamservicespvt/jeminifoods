import React from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Shield, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface AuthenticationGateProps {
  onLogin: () => void;
}

const AuthenticationGate: React.FC<AuthenticationGateProps> = ({ onLogin }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login?redirect=/reservations');
  };

  const handleSignup = () => {
    navigate('/signup?redirect=/reservations');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-black/95 flex items-center justify-center px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 w-full h-full opacity-5 pattern-texture" />
      
      {/* Authentication Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md"
      >
        <Card className="bg-black/80 backdrop-blur-sm border-amber-900/30 shadow-2xl">
          <div className="p-8 text-center">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <Shield className="text-black" size={32} />
            </motion.div>

            {/* Title */}
            <h2 className="text-2xl font-serif font-bold text-amber-400 mb-3">
              Authentication Required
            </h2>

            {/* Description */}
            <p className="text-cream/80 mb-6 leading-relaxed">
              Please sign in or create an account to make a reservation. 
              This helps us keep track of your bookings and provide better service.
            </p>

            {/* Benefits */}
            <div className="bg-amber-900/20 rounded-lg p-4 mb-6 border border-amber-900/30">
              <h3 className="text-amber-400 font-semibold mb-2 text-sm">Why sign in?</h3>
              <ul className="text-cream/70 text-sm space-y-1 text-left">
                <li>• Track your reservation status</li>
                <li>• Receive confirmation notifications</li>
                <li>• Quick rebooking with saved details</li>
                <li>• Special member offers</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleLogin}
                className="w-full bg-amber-600 hover:bg-amber-500 text-black font-semibold py-3 text-base"
                size="lg"
              >
                <LogIn size={18} className="mr-2" />
                Sign In to Continue
                <ArrowRight size={16} className="ml-2" />
              </Button>

              <Button
                onClick={handleSignup}
                variant="outline"
                className="w-full border-amber-600/30 hover:border-amber-500/70 text-amber-400 hover:text-amber-300 py-3 text-base"
                size="lg"
              >
                <UserPlus size={18} className="mr-2" />
                Create New Account
              </Button>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-amber-900/20">
              <p className="text-cream/60 text-xs">
                Secure authentication powered by Firebase
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AuthenticationGate;
