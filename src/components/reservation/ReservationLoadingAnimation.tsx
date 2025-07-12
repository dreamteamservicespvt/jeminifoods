import React from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Clock, Users, Utensils } from 'lucide-react';

interface ReservationLoadingAnimationProps {
  message?: string;
  subMessage?: string;
}

const ReservationLoadingAnimation: React.FC<ReservationLoadingAnimationProps> = ({ 
  message = "Processing your reservation...", 
  subMessage = "Please wait while we confirm your booking"
}) => {
  const iconVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 10 
      }
    }
  };

  const pulseVariants = {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 1.2, 1],
      transition: { 
        duration: 1.5, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }
    }
  };

  const textVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 0.3, 
        duration: 0.5 
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="text-center">
        {/* Animated Icons */}
        <div className="relative mb-8">
          {/* Central reservation icon */}
          <motion.div
            variants={pulseVariants}
            initial="initial"
            animate="animate"
            className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center mx-auto shadow-lg"
          >
            <CalendarCheck className="text-black" size={40} />
          </motion.div>

          {/* Orbiting icons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            transition={{ delay: 0.5, duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-32 h-32 mx-auto"
          >
            <motion.div
              variants={iconVariants}
              initial="initial"
              animate="animate"
              className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-amber-900/40 rounded-full flex items-center justify-center"
            >
              <Clock className="text-amber-400" size={16} />
            </motion.div>
            
            <motion.div
              variants={iconVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.2 }}
              className="absolute top-1/2 right-0 transform -translate-y-1/2 w-8 h-8 bg-amber-900/40 rounded-full flex items-center justify-center"
            >
              <Users className="text-amber-400" size={16} />
            </motion.div>
            
            <motion.div
              variants={iconVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.4 }}
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-amber-900/40 rounded-full flex items-center justify-center"
            >
              <Utensils className="text-amber-400" size={16} />
            </motion.div>
          </motion.div>
        </div>

        {/* Loading Text */}
        <motion.div
          variants={textVariants}
          initial="initial"
          animate="animate"
        >
          <h3 className="text-2xl font-serif font-bold text-amber-400 mb-2">
            {message}
          </h3>
          <p className="text-cream/70 text-sm">
            {subMessage}
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.6, duration: 3, ease: "easeInOut" }}
          className="w-32 h-1 bg-amber-600 rounded-full mx-auto mt-6 shadow-lg"
        />

        {/* Animated Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex justify-center mt-4 space-x-1"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-2 h-2 bg-amber-400 rounded-full"
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ReservationLoadingAnimation;
