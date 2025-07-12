import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CarouselIndicatorsProps {
  total: number;
  current: number;
  onSelect: (index: number) => void;
  variant?: 'dots' | 'pills' | 'progress' | 'minimal' | 'elegant';
  className?: string;
  showProgress?: boolean;
  autoPlayDuration?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const CarouselIndicators: React.FC<CarouselIndicatorsProps> = ({
  total,
  current,
  onSelect,
  variant = 'dots',
  className,
  showProgress = false,
  autoPlayDuration = 6000,
  size = 'md'
}) => {
  if (total <= 1) return null;

  const sizeClasses = {
    sm: { dot: 'w-1.5 h-1.5', activeDot: 'w-2 h-2', pill: 'w-6 h-1.5', activePill: 'w-8 h-1.5' },
    md: { dot: 'w-2 h-2', activeDot: 'w-3 h-3', pill: 'w-8 h-2', activePill: 'w-10 h-2' },
    lg: { dot: 'w-3 h-3', activeDot: 'w-4 h-4', pill: 'w-10 h-2.5', activePill: 'w-12 h-2.5' }
  };

  const sizes = sizeClasses[size];

  // Elegant variant - premium design with sophisticated animations
  if (variant === 'elegant') {
    return (
      <div className={cn("flex items-center justify-center gap-2", className)}>
        {Array.from({ length: total }).map((_, index) => (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className="group relative p-2 focus:outline-none focus:ring-2 focus:ring-amber-400/50 rounded-full transition-all duration-300"
            aria-label={`Go to slide ${index + 1}`}
          >
            {/* Main indicator with premium styling */}
            <motion.div
              className={cn(
                "relative rounded-full transition-all duration-700 ease-out",
                current === index
                  ? `${sizes.activeDot} bg-gradient-to-r from-amber-400 to-amber-500 shadow-lg shadow-amber-400/30`
                  : `${sizes.dot} bg-white/20 group-hover:bg-white/40`
              )}
              initial={false}
              animate={{
                scale: current === index ? 1.15 : 1,
                rotate: current === index ? 0 : 0,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
            
            {/* Animated ring for active indicator */}
            {current === index && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-amber-400/40"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.8, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: sizes.activeDot.split(' ')[0],
                  height: sizes.activeDot.split(' ')[1]
                }}
              />
            )}

            {/* Progress ring animation */}
            {showProgress && current === index && (
              <svg
                className="absolute inset-0 w-full h-full"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '32px',
                  height: '32px'
                }}
              >
                <motion.circle
                  cx="16"
                  cy="16"
                  r="14"
                  fill="none"
                  stroke="rgba(251, 191, 36, 0.3)"
                  strokeWidth="2"
                  strokeDasharray="87.96"
                  strokeDashoffset="87.96"
                  animate={{ strokeDashoffset: 0 }}
                  transition={{
                    duration: autoPlayDuration / 1000,
                    ease: "linear"
                  }}
                  key={`progress-${index}-${current}`}
                />
              </svg>
            )}
          </button>
        ))}
      </div>
    );
  }

  // Refined dots variant
  if (variant === 'dots') {
    return (
      <div className={cn("flex items-center justify-center gap-3", className)}>
        {Array.from({ length: total }).map((_, index) => (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className="group relative p-1.5 focus:outline-none transition-all duration-300"
            aria-label={`Go to slide ${index + 1}`}
          >
            <motion.div
              className={cn(
                "relative rounded-full transition-all duration-500 ease-out",
                current === index
                  ? `${sizes.activeDot} bg-amber-400 shadow-sm shadow-amber-400/50`
                  : `${sizes.dot} bg-white/30 group-hover:bg-white/50`
              )}
              initial={false}
              animate={{
                scale: current === index ? 1.1 : 1,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
            
            {/* Subtle glow for active indicator */}
            {current === index && (
              <motion.div
                className={cn(
                  "absolute rounded-full bg-amber-400/20 blur-sm",
                  sizes.activeDot
                )}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.8 }}
                transition={{ duration: 0.4 }}
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            )}
          </button>
        ))}
      </div>
    );
  }

  // Minimalist dot/short-line variant for Menu hero (replaces pills)
  if (variant === 'pills') {
    // Responsive sizing
    const dotBase = {
      mobile: 'w-3 h-3', // 12px
      desktop: 'w-4 h-4', // 16px
    };
    const activeBase = {
      mobile: 'w-4 h-3', // 16px x 12px
      desktop: 'w-5 h-4', // 20px x 16px
    };
    return (
      <div
        className={cn(
          "flex items-center justify-center gap-2 sm:gap-2 md:gap-2 lg:gap-2",
          "w-full max-w-xs sm:max-w-sm md:max-w-md px-2 my-2",
          className
        )}
        role="tablist"
        aria-label="Carousel pagination"
        style={{ minHeight: '24px' }}
      >
        {Array.from({ length: total }).map((_, index) => (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className={cn(
              "group relative focus:outline-none transition-all duration-300",
              "rounded-full flex items-center justify-center",
              "focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            )}
            aria-label={`Slide ${index + 1} of ${total}`}
            aria-current={current === index ? "true" : undefined}
            role="tab"
            tabIndex={0}
            style={{ minWidth: 0, minHeight: 0 }}
          >
            {/* Minimalist dot/short-line indicator */}
            <motion.div
              className={cn(
                "transition-all duration-400 ease-out",
                // Responsive sizing
                "sm:w-4 sm:h-4 w-3 h-3",
                current === index
                  ? "bg-[#FFC107] shadow-sm shadow-[#FFC107]/20"
                  : "bg-[#888] opacity-30"
              )}
              style={{
                borderRadius: '9999px',
                // Short line for active, dot for inactive
                width: current === index ? (window.innerWidth <= 480 ? 16 : 20) : (window.innerWidth <= 480 ? 12 : 16),
                height: window.innerWidth <= 480 ? 12 : 16,
                boxShadow: current === index ? '0 2px 8px 0 #FFC10722' : undefined,
                transition: 'all 0.35s cubic-bezier(.4,0,.2,1)',
              }}
              initial={false}
              animate={{
                opacity: current === index ? 1 : 0.3,
                scale: current === index ? 1.1 : 1,
              }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          </button>
        ))}
      </div>
    );
  }

  // Progress variant - single progress bar with markers
  if (variant === 'progress') {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <div className="relative w-32 h-1 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-amber-400 rounded-full"
            initial={false}
            animate={{
              width: `${((current + 1) / total) * 100}%`
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          
          {/* Progress markers */}
          {Array.from({ length: total }).map((_, index) => (
            <button
              key={index}
              onClick={() => onSelect(index)}
              className="absolute top-1/2 w-3 h-3 -mt-1.5 bg-white/40 rounded-full border-2 border-slate-800 transition-all duration-300 hover:scale-110 focus:outline-none"
              style={{ left: `${(index / (total - 1)) * 100}%`, transform: 'translateX(-50%)' }}
              aria-label={`Go to slide ${index + 1}`}
            >
              {current === index && (
                <motion.div
                  className="w-full h-full bg-amber-400 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </button>
          ))}
        </div>
        
        <div className="text-white/60 text-sm font-light">
          {current + 1} / {total}
        </div>
      </div>
    );
  }

  // Minimal variant - just current position
  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, index) => (
            <button
              key={index}
              onClick={() => onSelect(index)}
              className="focus:outline-none transition-all duration-300"
              aria-label={`Go to slide ${index + 1}`}
            >
              <motion.div
                className={cn(
                  "w-1 rounded-full transition-all duration-300",
                  current === index
                    ? "bg-amber-400 h-4"
                    : "bg-white/20 hover:bg-white/40 h-2"
                )}
                initial={false}
                animate={{
                  height: current === index ? 16 : 8,
                  opacity: current === index ? 1 : 0.4
                }}
                transition={{ duration: 0.3 }}
              />
            </button>
          ))}
        </div>
        
        <motion.div
          className="text-white/70 text-xs font-mono"
          key={current}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {String(current + 1).padStart(2, '0')}
        </motion.div>
      </div>
    );
  }

  return null;
};

export default CarouselIndicators;
