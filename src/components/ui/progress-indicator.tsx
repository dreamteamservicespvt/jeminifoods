import React from 'react';
import { motion } from 'framer-motion';

interface ProgressIndicatorProps {
  steps: number;
  currentStep: number;
  labels: string[];
  className?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  labels,
  className = ''
}) => {
  const progressPercentage = (currentStep / (steps - 1)) * 100;

  return (
    <div className={`w-full ${className}`}>
      {/* Progress bar */}
      <div className="relative mb-4">
        <div className="w-full h-2 bg-gray-700/40 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
        
        {/* Step indicators */}
        <div className="absolute top-0 w-full flex justify-between transform -translate-y-1/2">
          {Array.from({ length: steps }).map((_, index) => (
            <motion.div
              key={index}
              className={`w-4 h-4 rounded-full border-2 ${
                index <= currentStep
                  ? 'bg-amber-400 border-amber-400'
                  : 'bg-gray-700 border-gray-600'
              }`}
              initial={{ scale: 0.8 }}
              animate={{ scale: index === currentStep ? 1.2 : 1 }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>
      </div>
      
      {/* Labels */}
      <div className="flex justify-between text-xs">
        {labels.map((label, index) => (
          <span
            key={index}
            className={`${
              index <= currentStep ? 'text-amber-400' : 'text-gray-500'
            } transition-colors duration-300`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;
