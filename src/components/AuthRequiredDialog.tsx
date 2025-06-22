import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, X, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuthRequiredDialogProps {
  isOpen: boolean;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onClose: () => void;
  action?: string;
}

export const AuthRequiredDialog: React.FC<AuthRequiredDialogProps> = ({
  isOpen,
  onLoginClick,
  onSignupClick,
  onClose,
  action = "continue"
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-gradient-to-br from-charcoal via-black to-charcoal border border-amber-600/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 via-transparent to-amber-400/5 rounded-2xl" />
          <div className="absolute top-4 left-4 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-4 right-4 w-24 h-24 bg-amber-600/10 rounded-full blur-2xl" />
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-cream/60 hover:text-amber-400 transition-colors z-10"
          >
            <X size={20} />
          </button>

          {/* Content */}
          <div className="relative z-10 text-center">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 bg-gradient-to-br from-amber-600 to-amber-400 rounded-full flex items-center justify-center shadow-lg"
              >
                <Lock className="w-8 h-8 text-black" />
              </motion.div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-serif font-bold text-amber-400 mb-3">
              Authentication Required
            </h2>

            {/* Message */}
            <p className="text-cream/80 mb-8 leading-relaxed">
              Please login or signup to {action}. Join our exclusive community for premium dining experiences.
            </p>

            {/* Buttons */}
            <div className="space-y-3">
              <Button
                onClick={onLoginClick}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-black font-semibold py-3 h-12 transition-all duration-300 group"
              >
                <LogIn className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                Login to Continue
              </Button>

              <Button
                onClick={onSignupClick}
                variant="outline"
                className="w-full border-amber-600/30 text-amber-400 hover:bg-amber-600/10 hover:border-amber-400/50 py-3 h-12 transition-all duration-300 group"
              >
                <UserPlus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Create New Account
              </Button>
            </div>

            {/* Footer note */}
            <div className="mt-6 pt-4 border-t border-amber-600/20">
              <p className="text-cream/60 text-xs flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" />
                Exclusive access to premium features
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
