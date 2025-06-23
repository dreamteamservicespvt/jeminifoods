import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  User, 
  ChefHat, 
  Package, 
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Define order status types and step configuration
export type OrderStatus = 'booked' | 'taken' | 'making' | 'ready' | 'completed' | 'pending';

interface OrderStep {
  key: OrderStatus;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  description: string;
}

interface OrderTimestamps {
  booked?: string;
  taken?: string;
  making?: string;
  ready?: string;
  completed?: string;
}

interface OrderTrackerProps {
  currentStatus: OrderStatus;
  orderId?: string;
  chefName?: string;
  timestamps?: OrderTimestamps;
  isEditable?: boolean;
  onStatusChange?: (newStatus: OrderStatus) => void;
  className?: string;
  showTimestamps?: boolean;
  showDescription?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
}

// Order steps configuration
const ORDER_STEPS: OrderStep[] = [
  {
    key: 'booked',
    label: 'Order Booked',
    shortLabel: 'Booked',
    icon: ShoppingBag,
    description: 'Order received and confirmed'
  },
  {
    key: 'taken',
    label: 'Order Taken',
    shortLabel: 'Taken',
    icon: User,
    description: 'Chef assigned to prepare your order'
  },
  {
    key: 'making',
    label: 'Making Order',
    shortLabel: 'Making',
    icon: ChefHat,
    description: 'Your order is being prepared'
  },
  {
    key: 'ready',
    label: 'Order Ready',
    shortLabel: 'Ready',
    icon: Package,
    description: 'Ready for pickup'
  }
];

// Status color configuration
const STATUS_COLORS = {
  completed: {
    bg: 'bg-green-500',
    text: 'text-green-600',
    border: 'border-green-500',
    light: 'bg-green-50',
    glow: 'shadow-green-500/20'
  },
  current: {
    bg: 'bg-amber-500',
    text: 'text-amber-600',
    border: 'border-amber-500',
    light: 'bg-amber-50',
    glow: 'shadow-amber-500/30'
  },
  upcoming: {
    bg: 'bg-gray-300',
    text: 'text-gray-400',
    border: 'border-gray-300',
    light: 'bg-gray-50',
    glow: 'shadow-gray-300/10'
  },
  clickable: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    border: 'border-blue-300',
    light: 'bg-blue-50',
    glow: 'shadow-blue-300/20'
  }
};

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  currentStatus,
  orderId,
  chefName,
  timestamps,
  isEditable = false,
  onStatusChange,
  className,
  showTimestamps = true,
  showDescription = true,
  variant = 'default'
}) => {
  const [hoveredStep, setHoveredStep] = useState<OrderStatus | null>(null);

  // Get current step index
  const currentIndex = ORDER_STEPS.findIndex(step => step.key === currentStatus);
  const validCurrentIndex = Math.max(0, currentIndex);

  // Handle step click for editable mode
  const handleStepClick = (stepKey: OrderStatus, stepIndex: number) => {
    if (!isEditable || !onStatusChange) return;
    
    // Only allow clicking on next step or current step
    if (stepIndex <= validCurrentIndex + 1 && stepIndex >= validCurrentIndex) {
      onStatusChange(stepKey);
    }
  };

  // Get step status type
  const getStepStatus = (stepIndex: number): keyof typeof STATUS_COLORS => {
    if (stepIndex < validCurrentIndex) return 'completed';
    if (stepIndex === validCurrentIndex) return 'current';
    if (isEditable && stepIndex === validCurrentIndex + 1) return 'clickable';
    return 'upcoming';
  };

  // Compact variant for mobile or tight spaces
  if (variant === 'compact') {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex items-center justify-between">
          {ORDER_STEPS.map((step, index) => {
            const stepStatus = getStepStatus(index);
            const colors = STATUS_COLORS[stepStatus];
            const Icon = step.icon;
            const isClickable = isEditable && stepStatus === 'clickable';

            return (
              <React.Fragment key={step.key}>
                <motion.button
                  className={cn(
                    "relative flex flex-col items-center p-2 rounded-lg transition-all duration-200",
                    isClickable && "cursor-pointer hover:bg-blue-50",
                    !isClickable && "cursor-default"
                  )}
                  onClick={() => handleStepClick(step.key, index)}
                  disabled={!isClickable}
                  whileHover={isClickable ? { scale: 1.05 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    colors.bg,
                    colors.border,
                    stepStatus === 'current' && `shadow-lg ${colors.glow} animate-pulse`
                  )}>
                    {stepStatus === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <Icon className={cn(
                        "w-4 h-4",
                        stepStatus === 'current' ? "text-white" : colors.text
                      )} />
                    )}
                  </div>
                  <span className={cn(
                    "text-xs mt-1 font-medium",
                    colors.text
                  )}>
                    {step.shortLabel}
                  </span>
                </motion.button>
                
                {index < ORDER_STEPS.length - 1 && (
                  <div className={cn(
                    "flex-1 h-0.5 mx-2 transition-all duration-300",
                    index < validCurrentIndex ? "bg-green-500" : "bg-gray-200"
                  )} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  // Minimal variant - just progress bar
  if (variant === 'minimal') {
    const progressPercentage = ((validCurrentIndex + 1) / ORDER_STEPS.length) * 100;
    
    return (
      <div className={cn("w-full", className)}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {ORDER_STEPS[validCurrentIndex]?.label || 'Order Status'}
          </span>
          <span className="text-xs text-gray-500">
            {validCurrentIndex + 1} of {ORDER_STEPS.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-amber-500 to-green-500 h-2 rounded-full transition-all duration-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    );
  }

  // Default full variant
  return (
    <div className={cn("w-full p-4 bg-white rounded-lg border border-gray-200", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Order Progress</h3>
          {orderId && (
            <p className="text-sm text-gray-500">#{orderId}</p>
          )}
        </div>
        {chefName && (
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">Assigned Chef</p>
            <p className="text-xs text-gray-500">{chefName}</p>
          </div>
        )}
      </div>

      {/* Progress Steps */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-amber-500 transition-all duration-500"
            initial={{ width: 0 }}
            animate={{ 
              width: `${(validCurrentIndex / (ORDER_STEPS.length - 1)) * 100}%` 
            }}
          />
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-4">
          {ORDER_STEPS.map((step, index) => {
            const stepStatus = getStepStatus(index);
            const colors = STATUS_COLORS[stepStatus];
            const Icon = step.icon;
            const isClickable = isEditable && (stepStatus === 'clickable' || stepStatus === 'current');
            const isHovered = hoveredStep === step.key;

            return (
              <motion.div
                key={step.key}
                className="relative"
                onHoverStart={() => setHoveredStep(step.key)}
                onHoverEnd={() => setHoveredStep(null)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.button
                  className={cn(
                    "w-full p-3 rounded-lg border-2 transition-all duration-200",
                    colors.light,
                    colors.border,
                    isClickable && "cursor-pointer hover:shadow-md",
                    !isClickable && "cursor-default",
                    stepStatus === 'current' && `shadow-lg ${colors.glow}`,
                    isHovered && isClickable && "scale-105"
                  )}
                  onClick={() => handleStepClick(step.key, index)}
                  disabled={!isClickable}
                  whileHover={isClickable ? { scale: 1.02 } : {}}
                  whileTap={isClickable ? { scale: 0.98 } : {}}
                >
                  {/* Step Icon */}
                  <div className={cn(
                    "w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center transition-all duration-300",
                    colors.bg,
                    stepStatus === 'current' && "animate-pulse"
                  )}>
                    {stepStatus === 'completed' ? (
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    ) : stepStatus === 'current' ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </motion.div>
                    ) : (
                      <Icon className={cn("w-6 h-6", colors.text)} />
                    )}
                  </div>

                  {/* Step Label */}
                  <h4 className={cn(
                    "font-semibold text-sm mb-1",
                    colors.text
                  )}>
                    {step.label}
                  </h4>

                  {/* Step Description */}
                  {showDescription && (
                    <p className="text-xs text-gray-500 mb-2">
                      {step.description}
                    </p>
                  )}

                  {/* Timestamp */}
                  {showTimestamps && timestamps?.[step.key] && (
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{timestamps[step.key]}</span>
                    </div>
                  )}

                  {/* Clickable Indicator */}
                  {isClickable && stepStatus === 'clickable' && (
                    <motion.div
                      className="absolute -top-1 -right-1"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    </motion.div>
                  )}
                </motion.button>

                {/* Hover Tooltip for Editable Steps */}
                <AnimatePresence>
                  {isHovered && isClickable && stepStatus === 'clickable' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-10"
                    >
                      <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        Click to update status
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Current Status Info */}
      <motion.div
        className="mt-6 p-3 bg-gray-50 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-3 h-3 rounded-full",
            STATUS_COLORS[getStepStatus(validCurrentIndex)].bg
          )} />
          <span className="text-sm font-medium text-gray-700">
            Current Status: {ORDER_STEPS[validCurrentIndex]?.label || 'Unknown'}
          </span>
        </div>
        {showDescription && (
          <p className="text-xs text-gray-500 mt-1 ml-5">
            {ORDER_STEPS[validCurrentIndex]?.description || 'Status information unavailable'}
          </p>
        )}
      </motion.div>

      {/* Admin/Chef Instructions */}
      {isEditable && (
        <motion.div
          className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Admin/Chef Mode Active
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Click on the next step to update the order status. The customer will be notified automatically.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default OrderTracker;
