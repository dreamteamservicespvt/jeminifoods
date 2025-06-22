import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { ChevronDown, Calendar, Utensils } from 'lucide-react';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  scrollIndicator?: boolean;
  backgroundImagesSrc: string[];
}

const HeroSection = ({
  title,
  subtitle,
  primaryButtonText,
  primaryButtonLink = '/',
  secondaryButtonText,
  secondaryButtonLink = '/',
  scrollIndicator = false,
  backgroundImagesSrc,
}: HeroSectionProps) => {
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  
  // Auto rotate background images
  useEffect(() => {
    if (backgroundImagesSrc.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentBackgroundIndex((prev) => (prev + 1) % backgroundImagesSrc.length);
    }, 6000); // Change image every 6 seconds
    
    return () => clearInterval(interval);
  }, [backgroundImagesSrc.length]);
  
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Background Image with Enhanced Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence>
          {backgroundImagesSrc.map((src, i) => (
            currentBackgroundIndex === i && (
              <motion.div
                key={`bg-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
                className="absolute inset-0"
              >
                <img
                  src={src}
                  alt={`Hero background ${i+1}`}
                  className="w-full h-full object-cover"
                  onError={() => console.error(`Failed to load image: ${src}`)}
                />
                {/* Enhanced overlay with multiple layers for better text visibility */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent"></div>
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </div>
    
      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-6 md:px-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-amber-400 mb-6"
          >
            {title}
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "200px" }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-0.5 bg-amber-400/60 mx-auto mb-8"
          />
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl md:text-2xl text-cream max-w-2xl mx-auto mb-8"
          >
            {subtitle}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            {/* Enhanced Call To Action Buttons with advanced UI/UX */}
            <div className="flex flex-col sm:flex-row sm:justify-center gap-6 mt-10">
              {primaryButtonText && (
                <Button
                  className="group relative bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold px-8 py-6 text-base sm:text-lg overflow-hidden transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-amber-500/25 rounded-lg"
                  size="lg"
                  asChild
                >
                  <Link to={primaryButtonLink} className="flex items-center justify-center">
                    <span className="z-10 flex items-center">
                      <Calendar className="mr-2 h-5 w-5 transition-transform duration-500 group-hover:rotate-12" />
                      {primaryButtonText}
                      <motion.span
                        className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                      >
                        &rarr;
                      </motion.span>
                    </span>
                    {/* Animated shine effect */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-amber-400/0 via-amber-400/30 to-amber-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    {/* Bottom border animation */}
                    <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full bg-amber-300 transition-all duration-700 delay-100"></div>
                  </Link>
                </Button>
              )}
              
              {secondaryButtonText && (
                <Button
                  variant="outline"
                  className="group relative border-2 border-amber-400 text-amber-400 hover:bg-amber-400/10 font-bold px-8 py-6 text-base sm:text-lg overflow-hidden transform transition-all duration-300 hover:scale-105 rounded-lg"
                  size="lg"
                  asChild
                >
                  <Link to={secondaryButtonLink} className="flex items-center justify-center">
                    <span className="z-10 flex items-center">
                      <Utensils className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                      {secondaryButtonText}
                      <motion.span
                        className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                      >
                        &rarr;
                      </motion.span>
                    </span>
                    {/* Animated border glow */}
                    <div className="absolute inset-0 border-2 border-amber-400/0 group-hover:border-amber-400/50 rounded-lg transition-all duration-700 scale-105 group-hover:scale-110 opacity-0 group-hover:opacity-100"></div>
                    {/* Moving gradient background */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-amber-400/0 via-amber-400/10 to-amber-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Enhanced Scroll indicator with animation */}
      {scrollIndicator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center cursor-pointer z-10 group"
          onClick={scrollToContent}
        >
          <span className="text-cream text-sm mb-2 group-hover:text-amber-400 transition-colors duration-300">
            Discover More
          </span>
          <div className="relative h-8 overflow-hidden">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
              className="text-amber-400 group-hover:text-amber-300 transition-colors duration-300"
            >
              <ChevronDown size={24} />
            </motion.div>
          </div>
        </motion.div>
      )}
      
      {/* Enhanced background patterns */}
      <div className="absolute inset-0 z-[1] pointer-events-none opacity-30">
        <div className="absolute inset-0 bg-dots"></div>
        
        {/* Subtle floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-amber-400/30"
              animate={{
                y: [0, -15, 0],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
