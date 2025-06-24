import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

interface Testimonial {
  text: string;
  author: string;
  position: string;
  rating: number;
  image: string;
  location?: string;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<NodeJS.Timeout>();

  // Enhanced auto-scroll with pause on interaction
  useEffect(() => {
    if (isMobile && isAutoScrolling && !isPaused) {
      autoScrollRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % testimonials.length);
      }, 4500); // Slightly longer duration for better reading
    }

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [isMobile, isAutoScrolling, isPaused, testimonials.length]);

  // Enhanced smooth scroll with snap behavior
  useEffect(() => {
    if (isMobile && scrollRef.current) {
      const scrollContainer = scrollRef.current;
      const cardWidth = 280; // Fixed card width for consistency
      const gap = 16; // Gap between cards
      const scrollPosition = currentIndex * (cardWidth + gap);
      
      scrollContainer.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  const handlePrevious = () => {
    setIsPaused(true);
    setCurrentIndex(prev => prev === 0 ? testimonials.length - 1 : prev - 1);
    setTimeout(() => setIsPaused(false), 3000);
  };

  const handleNext = () => {
    setIsPaused(true);
    setCurrentIndex(prev => (prev + 1) % testimonials.length);
    setTimeout(() => setIsPaused(false), 3000);
  };

  const handleDotClick = (index: number) => {
    setIsPaused(true);
    setCurrentIndex(index);
    setTimeout(() => setIsPaused(false), 3000);
  };

  return (
    <section className="py-16 md:py-24 bg-brand-surface/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <svg className="w-full h-full">
          <pattern id="brand-grid-pattern" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="1.5" fill="var(--jemini-turmeric)" opacity="0.3" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#brand-grid-pattern)" />
        </svg>
      </div>
      
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 md:mb-16"
        >
          <Badge className="bg-brand-primary/20 text-brand-primary border-brand-primary/30 px-4 py-1.5 text-sm rounded-full mb-4">
            Guest Experiences
          </Badge>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gradient-primary mb-4 md:mb-6">
            What Our Guests Say
          </h2>
          
          <div className="w-24 h-0.5 bg-gradient-primary mx-auto mb-4 md:mb-6"></div>
          
          <p className="text-brand-text-muted max-w-2xl mx-auto">
            Discover why our guests keep coming back for more authentic flavors and exceptional experiences.
          </p>
        </motion.div>
        
        {/* Mobile: Enhanced Horizontal Scrolling */}
        {isMobile ? (
          <div className="relative">
            {/* Navigation Arrows */}
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-brand-surface/80 backdrop-blur-sm hover:bg-brand-surface text-brand-primary rounded-full p-3 transition-all duration-300 shadow-brand-sm"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={20} />
            </button>
            
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-brand-surface/80 backdrop-blur-sm hover:bg-brand-surface text-brand-primary rounded-full p-3 transition-all duration-300 shadow-brand-sm"
              aria-label="Next testimonial"
            >
              <ChevronRight size={20} />
            </button>

            {/* Horizontal Scroll Container */}
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 px-2"
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setTimeout(() => setIsPaused(false), 3000)}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={cn(
                    "flex-none w-[280px] card-brand p-6 relative snap-center",
                    "transform transition-all duration-300",
                    currentIndex === index ? "scale-105 shadow-brand-lg" : "scale-100"
                  )}
                >
                  {/* Quote Icon */}
                  <div className="absolute -top-3 left-6 w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
                    <Quote className="w-4 h-4 text-brand-text-primary" />
                  </div>

                  {/* Profile Image */}
                  <div className="flex items-center mb-4 pt-2">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-primary/30 mr-3">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.author}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-brand-text-primary">{testimonial.author}</h4>
                      <p className="text-sm text-brand-text-muted">{testimonial.position}</p>
                      {testimonial.location && (
                        <p className="text-xs text-brand-text-muted">{testimonial.location}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex justify-start mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="text-brand-primary fill-current" size={16} />
                    ))}
                  </div>

                  {/* Review Text */}
                  <blockquote className="text-brand-text-secondary leading-relaxed">
                    "{testimonial.text}"
                  </blockquote>
                </motion.div>
              ))}
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-6 gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-300",
                    currentIndex === index 
                      ? "bg-brand-primary w-6" 
                      : "bg-brand-border hover:bg-brand-primary/50"
                  )}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
                  
                  <p className="text-cream text-center italic mb-6 leading-relaxed text-sm">
                    "{testimonial.text}"
                  </p>
                  
                  <div className="text-center">
                    <p className="text-amber-400 font-semibold text-sm">
                      {testimonial.author}
                    </p>
                    <p className="text-cream/60 text-xs">
                      {testimonial.position}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-6 gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsAutoScrolling(false);
                    setTimeout(() => setIsAutoScrolling(true), 5000);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-amber-400 w-6' 
                      : 'bg-amber-400/30 hover:bg-amber-400/50'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Desktop: Grid Layout */
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="bg-black/50 backdrop-blur-sm border border-amber-600/20 hover:border-amber-500/30 transition-all duration-300 rounded-xl p-8 relative"
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.author}
                    className="w-full h-full object-cover" 
                  />
                </div>
                
                <div className="flex justify-center mb-6 pt-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="text-amber-400 fill-current" size={18} />
                  ))}
                </div>
                
                <p className="text-cream text-center italic mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>
                
                <div className="text-center">
                  <p className="text-amber-400 font-semibold">
                    {testimonial.author}
                  </p>
                  <p className="text-cream/60 text-sm">
                    {testimonial.position}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
