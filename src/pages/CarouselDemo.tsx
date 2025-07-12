import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CarouselIndicators } from '../components/ui/carousel-indicators';
import Navigation from '../components/Navigation';

const CarouselDemo = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 5;
  
  // Auto-advance demo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % totalSlides);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  const demoImages = [
    'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-cream">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-amber-400 mb-6">
              Elegant Carousel Indicators
            </h1>
            <p className="text-xl text-cream/80 max-w-2xl mx-auto">
              Discover our refined, responsive carousel pagination system with world-class animations and accessibility.
            </p>
          </motion.div>

          {/* Main Demo Section */}
          <div className="mb-16">
            <div className="relative h-96 rounded-2xl overflow-hidden bg-black/20 backdrop-blur-sm border border-cream/10">
              {/* Demo Images */}
              <div className="absolute inset-0">
                {demoImages.map((image, index) => (
                  <motion.div
                    key={index}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: currentSlide === index ? 1 : 0 }}
                    transition={{ duration: 0.7 }}
                  >
                    <img
                      src={image}
                      alt={`Demo slide ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                  </motion.div>
                ))}
              </div>
              
              {/* Content Overlay */}
              <div className="relative z-10 h-full flex items-center justify-center">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <h3 className="text-3xl font-serif font-bold text-white mb-4">
                    Slide {currentSlide + 1}
                  </h3>
                  <p className="text-white/80 text-lg">
                    Experience smooth, elegant transitions
                  </p>
                </motion.div>
              </div>
              
              {/* Elegant Indicators */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <CarouselIndicators
                  total={totalSlides}
                  current={currentSlide}
                  onSelect={setCurrentSlide}
                  variant="elegant"
                  showProgress={true}
                  autoPlayDuration={4000}
                  size="lg"
                />
              </div>
            </div>
          </div>

          {/* Variants Showcase */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Dots Variant */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-black/20 backdrop-blur-sm border border-cream/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-semibold text-amber-400 mb-4">Dots Variant</h3>
              <p className="text-cream/70 mb-6 text-sm">
                Clean, minimal dots with subtle animations
              </p>
              <div className="bg-black/30 rounded-lg p-8 flex justify-center">
                <CarouselIndicators
                  total={5}
                  current={2}
                  onSelect={() => {}}
                  variant="dots"
                  showProgress={false}
                  size="md"
                />
              </div>
            </motion.div>

            {/* Pills Variant */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-black/20 backdrop-blur-sm border border-cream/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-semibold text-amber-400 mb-4">Pills Variant</h3>
              <p className="text-cream/70 mb-6 text-sm">
                Modern elongated indicators with smooth morphing
              </p>
              <div className="bg-black/30 rounded-lg p-8 flex justify-center">
                <CarouselIndicators
                  total={4}
                  current={1}
                  onSelect={() => {}}
                  variant="pills"
                  showProgress={false}
                  size="md"
                />
              </div>
            </motion.div>

            {/* Progress Variant */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-black/20 backdrop-blur-sm border border-cream/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-semibold text-amber-400 mb-4">Progress Variant</h3>
              <p className="text-cream/70 mb-6 text-sm">
                Progress bar with interactive markers
              </p>
              <div className="bg-black/30 rounded-lg p-8 flex justify-center">
                <CarouselIndicators
                  total={6}
                  current={3}
                  onSelect={() => {}}
                  variant="progress"
                  showProgress={false}
                  size="md"
                />
              </div>
            </motion.div>

            {/* Minimal Variant */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-black/20 backdrop-blur-sm border border-cream/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-semibold text-amber-400 mb-4">Minimal Variant</h3>
              <p className="text-cream/70 mb-6 text-sm">
                Ultra-minimal design with position counter
              </p>
              <div className="bg-black/30 rounded-lg p-8 flex justify-center">
                <CarouselIndicators
                  total={4}
                  current={2}
                  onSelect={() => {}}
                  variant="minimal"
                  showProgress={false}
                  size="md"
                />
              </div>
            </motion.div>

            {/* Elegant Variant */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-black/20 backdrop-blur-sm border border-cream/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-semibold text-amber-400 mb-4">Elegant Variant</h3>
              <p className="text-cream/70 mb-6 text-sm">
                Premium design with sophisticated animations
              </p>
              <div className="bg-black/30 rounded-lg p-8 flex justify-center">
                <CarouselIndicators
                  total={3}
                  current={1}
                  onSelect={() => {}}
                  variant="elegant"
                  showProgress={false}
                  size="md"
                />
              </div>
            </motion.div>

            {/* Sizes Demo */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-black/20 backdrop-blur-sm border border-cream/10 rounded-xl p-6"
            >
              <h3 className="text-xl font-semibold text-amber-400 mb-4">Size Options</h3>
              <p className="text-cream/70 mb-6 text-sm">
                Small, medium, and large sizes available
              </p>
              <div className="bg-black/30 rounded-lg p-8 space-y-4">
                <div className="flex justify-center">
                  <CarouselIndicators
                    total={4}
                    current={1}
                    onSelect={() => {}}
                    variant="dots"
                    size="sm"
                  />
                </div>
                <div className="flex justify-center">
                  <CarouselIndicators
                    total={4}
                    current={1}
                    onSelect={() => {}}
                    variant="dots"
                    size="md"
                  />
                </div>
                <div className="flex justify-center">
                  <CarouselIndicators
                    total={4}
                    current={1}
                    onSelect={() => {}}
                    variant="dots"
                    size="lg"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-black/20 backdrop-blur-sm border border-cream/10 rounded-xl p-8"
          >
            <h3 className="text-2xl font-semibold text-amber-400 mb-6 text-center">
              Enhanced Features
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-400/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-amber-400 text-xl">✨</span>
                </div>
                <h4 className="font-semibold text-cream mb-2">Smooth Animations</h4>
                <p className="text-cream/70 text-sm">Fluid transitions with Framer Motion</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-400/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-amber-400 text-xl">📱</span>
                </div>
                <h4 className="font-semibold text-cream mb-2">Responsive Design</h4>
                <p className="text-cream/70 text-sm">Optimized for all screen sizes</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-400/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-amber-400 text-xl">♿</span>
                </div>
                <h4 className="font-semibold text-cream mb-2">Accessible</h4>
                <p className="text-cream/70 text-sm">ARIA labels and keyboard navigation</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-400/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-amber-400 text-xl">⚡</span>
                </div>
                <h4 className="font-semibold text-cream mb-2">Progress Tracking</h4>
                <p className="text-cream/70 text-sm">Optional progress rings and bars</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-400/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-amber-400 text-xl">🎨</span>
                </div>
                <h4 className="font-semibold text-cream mb-2">Customizable</h4>
                <p className="text-cream/70 text-sm">Multiple variants and sizes</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-400/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-amber-400 text-xl">🚀</span>
                </div>
                <h4 className="font-semibold text-cream mb-2">Performance</h4>
                <p className="text-cream/70 text-sm">Optimized animations</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CarouselDemo;
