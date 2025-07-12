import React from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { CarouselIndicators } from '@/components/ui/carousel-indicators';

interface MenuHeroProps {
  backgroundImages: Array<{
    id: string;
    name: string;
    image: string;
    description?: string;
  }>;
  heroImageIndex: number;
  setHeroImageIndex: (index: number) => void;
  isHeroPaused: boolean;
  setIsHeroPaused: (paused: boolean) => void;
  heroBackgroundImages: any[];
  fallbackBackgroundImages: string[];
}

export const MenuHero: React.FC<MenuHeroProps> = ({
  backgroundImages,
  heroImageIndex,
  setHeroImageIndex,
  isHeroPaused,
  setIsHeroPaused,
  heroBackgroundImages,
  fallbackBackgroundImages
}) => {
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);

  return (
    <motion.div 
      className="relative h-[40vh] md:h-[50vh] overflow-hidden"
      style={{ opacity: headerOpacity }}
      onMouseEnter={() => setIsHeroPaused(true)}
      onMouseLeave={() => setIsHeroPaused(false)}
    >
      {/* Dynamic Background Images Slideshow */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          {backgroundImages.length > 0 && (
            <motion.div
              key={`hero-bg-${heroImageIndex}`}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 animate-pulse opacity-30 z-[1]" />
              <img
                src={backgroundImages[heroImageIndex]?.image}
                alt={backgroundImages[heroImageIndex]?.name || 'Culinary Excellence'}
                className="w-full h-full object-cover object-center transition-transform duration-1000 hover:scale-105"
                loading="eager"
                onError={(e) => {
                  // Fallback to next image if current one fails to load
                  const target = e.target as HTMLImageElement;
                  if (target.src !== fallbackBackgroundImages[0]) {
                    target.src = fallbackBackgroundImages[0];
                  }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Enhanced overlay gradients for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/80 z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60 z-[1]" />
      </div>

      {/* Subtle pattern overlay for texture */}
      <div className="absolute inset-0 z-[2] opacity-5" 
           style={{
             backgroundImage: 'radial-gradient(circle, rgba(245, 158, 11, 0.3) 1px, transparent 1px)',
             backgroundSize: '20px 20px'
           }} 
      />

      {/* Elegant slideshow indicators - only show if multiple images */}
      {backgroundImages.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[5] w-full flex justify-center">
          <CarouselIndicators
            total={backgroundImages.length}
            current={heroImageIndex}
            onSelect={setHeroImageIndex}
            variant="pills"
            showProgress={false}
            size="md"
            className="max-w-xs sm:max-w-sm md:max-w-md w-auto px-2"
            aria-label="Menu hero image pagination"
          />
        </div>
      )}
      
      <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white drop-shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Culinary 
            <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent"> Excellence</span>
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-cream/95 max-w-2xl mx-auto leading-relaxed drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Discover our carefully crafted dishes, each a masterpiece of flavor and artistry
          </motion.p>
          
          {/* Subtle indicator for dynamic backgrounds */}
          {heroBackgroundImages.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-2 mt-4 text-xs text-cream/60"
            >
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <span>Featuring our signature dishes</span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
