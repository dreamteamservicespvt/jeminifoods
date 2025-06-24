import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Download, Heart, Share2, Grid3X3, List, ArrowRight, Loader2, AlertCircle, Play, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { GalleryItem, MediaCategory, CATEGORY_LABELS } from '../types/gallery';
import { useGalleryData } from '../hooks/useGalleryData';
import { useFavorites } from '../hooks/useFavorites';
import Navigation from '../components/Navigation';

// World-class mobile Gallery styles with hero enhancements
const mobileGalleryStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .bg-dots {
    background-image: radial-gradient(circle, rgba(245, 158, 11, 0.1) 1px, transparent 1px);
    background-size: 20px 20px;
  }
  
  @media (max-width: 640px) {
    .mobile-gallery-container {
      padding-left: 1rem;
      padding-right: 1rem;
    }
    
    .mobile-touch-feedback:active {
      transform: scale(0.97);
      transition: transform 0.1s ease;
    }
    
    .mobile-gallery-grid {
      gap: 0.5rem;
    }
    
    .mobile-gallery-grid.flex {
      gap: 0.75rem;
    }
    
    .mobile-image-card {
      border-radius: 0.875rem;
      height: 180px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .mobile-image-card:active {
      transform: scale(0.98);
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    
    .mobile-list-item {
      width: 100%;
      display: flex;
      align-items: stretch;
      min-height: 120px;
      background: rgba(0,0,0,0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.875rem;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .mobile-list-item:hover {
      border-color: rgba(245, 158, 11, 0.5);
      box-shadow: 0 4px 20px rgba(245, 158, 11, 0.15);
    }
    
    .mobile-list-image {
      width: 140px;
      height: 120px;
      flex-shrink: 0;
      border-radius: 0.75rem;
    }
    
    .mobile-list-content {
      flex: 1;
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    
    .mobile-overlay {
      background: linear-gradient(to top, 
        rgba(0,0,0,0.95) 0%, 
        rgba(0,0,0,0.7) 40%, 
        rgba(0,0,0,0.2) 70%, 
        transparent 100%);
    }
    
    .mobile-badge {
      backdrop-filter: blur(12px);
      background: rgba(0,0,0,0.8);
      border: 1px solid rgba(255,194,70,0.3);
    }
    
    .mobile-hero-text {
      font-size: 2rem;
      line-height: 1.1;
    }
    
    .mobile-category-scroll {
      scroll-snap-type: x mandatory;
      scroll-behavior: smooth;
    }
    
    .mobile-category-item {
      scroll-snap-align: start;
      flex-shrink: 0;
    }
  }
  
  @media (max-width: 380px) {
    .mobile-image-card {
      height: 160px;
    }
    
    .mobile-hero-text {
      font-size: 1.75rem;
    }
    
    .mobile-list-image {
      width: 120px;
      height: 110px;
    }
    
    .mobile-list-item {
      min-height: 110px;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = mobileGalleryStyles;
  if (!document.head.querySelector('[data-gallery-mobile-styles]')) {
    styleElement.setAttribute('data-gallery-mobile-styles', '');
    document.head.appendChild(styleElement);
  }
}

const Gallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});
  const [heroImageIndex, setHeroImageIndex] = useState(0);

  // Fetch gallery data from Firestore
  const { galleryItems, loading, error, refreshData, trackImageView } = useGalleryData(true);
  
  // Favorites functionality
  const { favorites, addFavorite, removeFavorite, isFavorite, getFavoriteId } = useFavorites();

  // Handle favorite toggle
  const handleFavoriteToggle = async (image: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const isCurrentlyFavorite = isFavorite(image.id, 'gallery');
    
    if (isCurrentlyFavorite) {
      const favoriteId = getFavoriteId(image.id, 'gallery');
      if (favoriteId) {
        await removeFavorite(favoriteId);
      }
    } else {
      await addFavorite({
        id: image.id,
        name: image.title || 'Gallery Image',
        description: image.description || '',
        imageUrl: image.url,
        type: 'gallery'
      });
    }
  };

  // Hero background image rotation
  const heroBackgroundImages = useMemo(() => {
    // Filter only images (not videos) for hero background
    return galleryItems
      .filter(item => item.type === 'image' && item.url)
      .slice(0, 10); // Limit to 10 images for performance
  }, [galleryItems]);

  // Fallback background images when gallery is empty
  const fallbackBackgroundImages = [
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
  ];

  // Use gallery images if available, otherwise use fallbacks
  const backgroundImages = heroBackgroundImages.length > 0 ? heroBackgroundImages : 
    fallbackBackgroundImages.map((url, index) => ({ 
      id: `fallback-${index}`, 
      url, 
      title: 'Gallery Preview',
      type: 'image' as const
    }));

  // Auto-rotate hero background images
  useEffect(() => {
    if (backgroundImages.length <= 1) return;

    const interval = setInterval(() => {
      setHeroImageIndex((prevIndex) => 
        (prevIndex + 1) % backgroundImages.length
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Handle share functionality
  const handleShare = async (image: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: image.title || 'Gallery Image',
          text: image.description || 'Check out this amazing image from our gallery!',
          url: window.location.href
        });
      } else {
        // Fallback: copy URL to clipboard
        await navigator.clipboard.writeText(`${window.location.origin}/gallery?view=${image.id}`);
        // Could add a toast notification here
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Calculate categories based on actual data
  const categories = useMemo(() => {
    const baseCats = {
      all: { title: 'All Images', count: galleryItems.length }
    };

    // Add categories that actually exist in the data
    galleryItems.forEach(item => {
      if (item.category && item.category !== 'all') {
        const categoryKey = item.category as MediaCategory;
        if (!baseCats[categoryKey as keyof typeof baseCats]) {
          baseCats[categoryKey as keyof typeof baseCats] = {
            title: CATEGORY_LABELS[categoryKey] || categoryKey,
            count: 0
          };
        }
      }
    });

    // Count items per category
    Object.keys(baseCats).forEach(key => {
      if (key !== 'all') {
        baseCats[key as keyof typeof baseCats].count = galleryItems.filter(
          item => item.category === key
        ).length;
      }
    });

    return baseCats;
  }, [galleryItems]);

  const filteredImages = useMemo(() => {
    return selectedCategory === 'all' 
      ? galleryItems 
      : galleryItems.filter(item => item.category === selectedCategory);
  }, [galleryItems, selectedCategory]);

  const handleImageLoad = (id: string) => {
    setImageLoading(prev => ({ ...prev, [id]: false }));
  };

  const handleImageError = (id: string) => {
    setImageLoading(prev => ({ ...prev, [id]: false }));
  };

  // Handle image click and track view
  const handleImageClick = async (item: GalleryItem) => {
    setSelectedImage(item);
    // Track view count (increment in Firestore)
    try {
      await trackImageView(item.id);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      
      if (e.key === 'Escape') {
        setSelectedImage(null);
      } else if (e.key === 'ArrowRight') {
        const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
        const nextImage = filteredImages[currentIndex + 1] || filteredImages[0];
        if (nextImage) {
          setSelectedImage(nextImage);
          trackImageView(nextImage.id);
        }
      } else if (e.key === 'ArrowLeft') {
        const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
        const prevImage = filteredImages[currentIndex - 1] || filteredImages[filteredImages.length - 1];
        if (prevImage) {
          setSelectedImage(prevImage);
          trackImageView(prevImage.id);
        }
      }
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedImage, filteredImages, trackImageView]);

  // Inject CSS for mobile navigation fix
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Mobile bottom navigation spacing fix */
      @media (max-width: 768px) {
        .gallery-page-container {
          padding-bottom: calc(4rem + env(safe-area-inset-bottom, 0px)) !important;
        }
        
        /* Ensure no space below mobile nav */
        .mobile-nav-flush {
          bottom: 0 !important;
          margin-bottom: 0 !important;
          padding-bottom: env(safe-area-inset-bottom, 0px) !important;
        }
        
        /* Remove any default body margins/padding on mobile */
        body {
          margin-bottom: 0 !important;
          padding-bottom: 0 !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-cream gallery-page-container">
      {/* Navigation */}
      <Navigation />
      
      {/* Enhanced Hero Section with Dynamic Background Images */}
      <div className="relative overflow-hidden mb-6 sm:mb-8 pt-20 min-h-[60vh] sm:min-h-[70vh]">
        {/* Dynamic Background Images Slideshow */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            {backgroundImages.length > 0 && (
              <motion.div
                key={`hero-bg-${heroImageIndex}`}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full"
              >
                <img
                  src={backgroundImages[heroImageIndex]?.url}
                  alt={backgroundImages[heroImageIndex]?.title || 'Gallery background'}
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Enhanced overlay gradients for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40"></div>
        </div>

        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 z-[1] bg-dots opacity-10"></div>
        
        {/* Hero Content */}
        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 relative z-10 flex items-center min-h-[60vh] sm:min-h-[70vh]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto w-full"
          >
            <motion.h1 
              className="mobile-hero-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-black bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent mb-4 sm:mb-6"
              style={{
                textShadow: '0 0 30px rgba(245, 158, 11, 0.5), 0 0 60px rgba(245, 158, 11, 0.3)',
                WebkitTextStroke: '1px rgba(245, 158, 11, 0.3)'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Culinary Gallery
            </motion.h1>
            
            <motion.p 
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-white mb-6 sm:mb-8 md:mb-10 leading-relaxed px-2 font-semibold"
              style={{
                textShadow: '0 2px 20px rgba(0, 0, 0, 0.9), 0 4px 40px rgba(0, 0, 0, 0.7)',
                WebkitTextStroke: '0.5px rgba(255, 255, 255, 0.1)'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Explore a curated collection of our finest culinary creations, from signature dishes to behind-the-scenes moments that capture the essence of fine dining excellence.
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Badge className="mobile-badge bg-amber-500/30 text-amber-200 border-amber-400/50 px-3 sm:px-4 py-2 text-xs sm:text-sm backdrop-blur-sm">
                {loading ? 'Loading...' : `${galleryItems.length} High-Quality Images`}
              </Badge>
              <Badge className="mobile-badge bg-blue-500/30 text-blue-200 border-blue-400/50 px-3 sm:px-4 py-2 text-xs sm:text-sm backdrop-blur-sm">
                Multiple Categories
              </Badge>
              {heroBackgroundImages.length > 0 && (
                <Badge className="mobile-badge bg-purple-500/30 text-purple-200 border-purple-400/50 px-3 sm:px-4 py-2 text-xs sm:text-sm backdrop-blur-sm">
                  🎨 Live Gallery Backgrounds
                </Badge>
              )}
            </motion.div>

            {/* Image counter and navigation dots */}
            {backgroundImages.length > 1 && (
              <motion.div 
                className="flex justify-center items-center gap-4 mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <div className="flex gap-2">
                  {backgroundImages.slice(0, 5).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setHeroImageIndex(index)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300 hover:scale-125",
                        heroImageIndex === index
                          ? "bg-amber-400 w-8 shadow-lg shadow-amber-400/50"
                          : "bg-cream/30 hover:bg-cream/50"
                      )}
                      aria-label={`View background image ${index + 1}`}
                    />
                  ))}
                  {backgroundImages.length > 5 && (
                    <span className="text-cream/50 text-xs ml-2">
                      +{backgroundImages.length - 5} more
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="container mx-auto px-4 sm:px-6 mb-6 sm:mb-8">
        <div className="flex flex-col gap-4 mb-6">
          {/* Category Filters - Mobile optimized horizontal scroll */}
          <div className="w-full">
            <div className="mobile-category-scroll flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {Object.entries(categories).map(([key, category]) => (
                <motion.button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "mobile-category-item mobile-touch-feedback flex-shrink-0 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all border backdrop-blur-sm",
                    selectedCategory === key
                      ? "bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-400/25"
                      : "bg-black/40 text-cream border-cream/20 hover:border-amber-400/50 hover:bg-black/60"
                  )}
                >
                  <span className="whitespace-nowrap">{category.title}</span>
                  <Badge 
                    className={cn(
                      "ml-1 sm:ml-2 text-xs",
                      selectedCategory === key
                        ? "bg-black/20 text-black"
                        : "bg-cream/20 text-cream"
                    )}
                  >
                    {category.count}
                  </Badge>
                </motion.button>
              ))}
            </div>
          </div>

          {/* View Mode Toggle - Mobile positioned below filters */}
          <div className="flex justify-center sm:justify-end">
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full p-1 border border-cream/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={cn(
                  "rounded-full px-2 sm:px-3",
                  viewMode === 'grid' 
                    ? "bg-amber-500 text-black" 
                    : "text-cream hover:text-amber-400"
                )}
              >
                <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('masonry')}
                className={cn(
                  "rounded-full px-2 sm:px-3",
                  viewMode === 'masonry' 
                    ? "bg-amber-500 text-black" 
                    : "text-cream hover:text-amber-400"
                )}
              >
                <List className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          // Enhanced loading state - optimized for mobile
          <div className="mobile-gallery-grid grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div 
                key={index} 
                className="mobile-image-card aspect-[4/3] bg-charcoal/40 rounded-xl sm:rounded-2xl animate-pulse"
                style={{ height: window.innerWidth < 640 ? '180px' : '280px' }}
              >
                <div className="w-full h-full bg-gradient-to-br from-charcoal/30 to-charcoal/60 rounded-xl sm:rounded-2xl"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-cream mb-2">Failed to Load Gallery</h3>
            <p className="text-cream/70 mb-4">{error}</p>
            <Button
              onClick={refreshData}
              className="bg-amber-600 hover:bg-amber-700 text-black"
            >
              Try Again
            </Button>
          </div>
        ) : filteredImages.length === 0 ? (
          // Enhanced empty state
          <div className="text-center py-12 sm:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-md mx-auto"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-amber-500/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400/60" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-cream mb-2">No Images Found</h3>
              <p className="text-sm sm:text-base text-cream/70 mb-4 px-4">
                {selectedCategory === 'all' 
                  ? 'The gallery is currently empty. New images will appear here soon!'
                  : `No images found in the ${categories[selectedCategory]?.title || selectedCategory} category.`
                }
              </p>
              {selectedCategory !== 'all' && (
                <Button
                  onClick={() => setSelectedCategory('all')}
                  variant="outline"
                  className="border-amber-400/30 text-amber-400 hover:bg-amber-400/10"
                >
                  View All Images
                </Button>
              )}
            </motion.div>
          </div>
        ) : (
          // Enhanced Gallery Grid with world-class mobile optimization
          <motion.div 
            layout
            className={cn(
              "mobile-gallery-grid gap-2 sm:gap-6",
              viewMode === 'grid' 
                ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4" 
                : "flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3",
              viewMode === 'masonry' && "auto-rows-max"
            )}
          >
            <AnimatePresence mode="popLayout">
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4, delay: index * 0.03 }}
                  className={cn(
                    "mobile-touch-feedback group relative overflow-hidden bg-black/20 backdrop-blur-sm border border-cream/10 hover:border-amber-400/50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-amber-400/10",
                    viewMode === 'grid' 
                      ? "mobile-image-card rounded-xl sm:rounded-2xl" 
                      : "mobile-list-item rounded-xl"
                  )}
                  style={viewMode === 'grid' ? {
                    height: window.innerWidth < 640 ? '180px' : '280px'
                  } : viewMode === 'masonry' && window.innerWidth >= 640 ? {
                    height: index % 3 === 0 ? '280px' : index % 2 === 0 ? '240px' : '200px'
                  } : {}}
                  onClick={() => handleImageClick(image)}
                >
                  {viewMode === 'masonry' && window.innerWidth < 640 ? (
                    // Mobile List View Layout
                    <>
                      {/* Image Section */}
                      <div className="mobile-list-image relative overflow-hidden flex-shrink-0">
                        <img 
                          src={image.url} 
                          alt={image.title || 'Gallery image'}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onLoad={() => handleImageLoad(image.id)}
                          onError={() => handleImageError(image.id)}
                          loading="lazy"
                          decoding="async"
                        />
                        
                        {/* Featured badge */}
                        {image.featured && (
                          <div className="absolute top-1 left-1 z-10">
                            <Badge className="bg-purple-600/80 text-white text-xs px-1 py-0.5">
                              ⭐
                            </Badge>
                          </div>
                        )}
                        
                        {/* View count */}
                        {image.views && image.views > 0 && (
                          <div className="absolute top-1 right-1 z-10">
                            <Badge className="bg-black/80 text-cream/90 text-xs px-1 py-0.5">
                              👁 {image.views}
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      {/* Content Section */}
                      <div className="mobile-list-content flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-cream mb-1 line-clamp-1">
                            {image.title || 'Untitled'}
                          </h3>
                          <p className="text-xs text-cream/70 mb-2 line-clamp-2">
                            {image.description || 'No description available'}
                          </p>
                          <Badge className="bg-amber-500/30 text-amber-300 border-amber-400/40 text-xs capitalize px-2 py-0.5">
                            {CATEGORY_LABELS[image.category as MediaCategory] || image.category || 'Food'}
                          </Badge>
                        </div>
                        
                        <div className="flex gap-1 mt-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-cream hover:text-amber-400 p-1 h-7 w-7 backdrop-blur-sm bg-black/40 rounded-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImage(image);
                            }}
                          >
                            <ZoomIn className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={cn(
                              "p-1 h-7 w-7 backdrop-blur-sm bg-black/40 rounded-md transition-colors",
                              isFavorite(image.id, 'gallery')
                                ? "text-red-500 hover:text-red-400"
                                : "text-cream hover:text-red-400"
                            )}
                            onClick={(e) => handleFavoriteToggle(image, e)}
                          >
                            {isFavorite(image.id, 'gallery') ? (
                              <HeartHandshake className="w-3 h-3 fill-current" />
                            ) : (
                              <Heart className="w-3 h-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-cream hover:text-amber-400 p-1 h-7 w-7 backdrop-blur-sm bg-black/40 rounded-md"
                            onClick={(e) => handleShare(image, e)}
                          >
                            <Share2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    // Grid View Layout (default and desktop masonry)
                    <>
                      {/* Image/Video */}
                      <div className="relative w-full h-full overflow-hidden">
                        {imageLoading[image.id] !== false && (
                          <div className="absolute inset-0 bg-black/30 animate-pulse flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                          </div>
                        )}
                        
                        {image.type === 'video' ? (
                          <div className="relative w-full h-full">
                            <video
                              src={image.url}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              muted
                              loop
                              playsInline
                              onMouseOver={(e) => e.currentTarget.play()}
                              onMouseOut={(e) => e.currentTarget.pause()}
                              onLoadStart={() => handleImageLoad(image.id)}
                              onError={() => handleImageError(image.id)}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                              <Play className="w-12 h-12 text-white opacity-80" />
                            </div>
                          </div>
                        ) : (
                          <img 
                            src={image.url} 
                            alt={image.title || 'Gallery image'}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onLoad={() => handleImageLoad(image.id)}
                            onError={() => handleImageError(image.id)}
                            loading="lazy"
                            decoding="async"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                          />
                        )}
                      </div>

                      {/* Enhanced featured badge */}
                      {image.featured && (
                        <div className="absolute top-2 left-2 z-10">
                          <Badge className="mobile-badge bg-purple-600/80 text-white border-purple-400/50 text-xs px-2 py-1 backdrop-blur-sm">
                            ⭐ Featured
                          </Badge>
                        </div>
                      )}

                      {/* Enhanced view count */}
                      {image.views && image.views > 0 && (
                        <div className="absolute top-2 right-2 z-10">
                          <Badge className="mobile-badge bg-black/80 text-cream/90 border-none text-xs px-2 py-1 backdrop-blur-sm">
                            👁 {image.views}
                          </Badge>
                        </div>
                      )}

                      {/* Enhanced mobile-optimized overlay */}
                      <div className="mobile-overlay absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4">
                          {/* Enhanced mobile content */}
                          <div className="block sm:hidden">
                            <h3 className="text-sm font-semibold text-cream mb-1 truncate">
                              {image.title || 'Untitled'}
                            </h3>
                            <div className="flex justify-between items-center">
                              <Badge className="mobile-badge bg-amber-500/30 text-amber-300 border-amber-400/40 text-xs capitalize px-2 py-1">
                                {CATEGORY_LABELS[image.category as MediaCategory] || image.category || 'Food'}
                              </Badge>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-cream hover:text-amber-400 p-1 h-7 w-7 backdrop-blur-sm bg-black/40 rounded-md"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImage(image);
                                  }}
                                >
                                  <ZoomIn className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className={cn(
                                    "p-1 h-7 w-7 backdrop-blur-sm bg-black/40 rounded-md transition-colors",
                                    isFavorite(image.id, 'gallery')
                                      ? "text-red-500 hover:text-red-400"
                                      : "text-cream hover:text-red-400"
                                  )}
                                  onClick={(e) => handleFavoriteToggle(image, e)}
                                >
                                  {isFavorite(image.id, 'gallery') ? (
                                    <HeartHandshake className="w-3 h-3 fill-current" />
                                  ) : (
                                    <Heart className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Content for desktop - full details */}
                          <div className="hidden sm:block">
                            <h3 className="text-lg font-semibold text-cream mb-2">
                              {image.title || 'Untitled'}
                            </h3>
                            <p className="text-cream/70 text-sm mb-4 line-clamp-2">
                              {image.description || 'No description available'}
                            </p>
                            
                            {/* Action Buttons */}
                            <div className="flex justify-between items-center">
                              <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/30 capitalize">
                                {CATEGORY_LABELS[image.category as MediaCategory] || image.category || 'Uncategorized'}
                              </Badge>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-cream hover:text-amber-400 p-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImage(image);
                                  }}
                                >
                                  <ZoomIn className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className={cn(
                                    "p-2 transition-colors",
                                    isFavorite(image.id, 'gallery')
                                      ? "text-red-500 hover:text-red-400"
                                      : "text-cream hover:text-red-400"
                                  )}
                                  onClick={(e) => handleFavoriteToggle(image, e)}
                                >
                                  {isFavorite(image.id, 'gallery') ? (
                                    <HeartHandshake className="w-4 h-4 fill-current" />
                                  ) : (
                                    <Heart className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Enhanced Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12 sm:mt-16 p-6 sm:p-8 bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm rounded-2xl border border-amber-600/20 shadow-2xl shadow-black/30"
        >
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-amber-400 mb-3 sm:mb-4">
            Experience These Dishes in Person
          </h3>
          <p className="text-sm sm:text-base text-cream/70 mb-4 sm:mb-6 max-w-2xl mx-auto leading-relaxed">
            Each image tells a story of culinary passion and artistry. Reserve your table today and taste the perfection you see.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Button 
              asChild
              className="bg-amber-600 hover:bg-amber-700 text-black font-medium px-6 sm:px-8 py-3 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-400/25"
            >
              <Link to="/reservations">
                Make a Reservation
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button 
              asChild
              variant="outline"
              className="border-amber-600/30 text-amber-400 hover:bg-amber-600/10 px-6 sm:px-8 py-3 transition-all duration-300 transform hover:scale-105"
            >
              <Link to="/menu">
                View Our Menu
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/98 z-50 flex items-center justify-center p-2 sm:p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-full max-w-4xl max-h-[90vh] bg-black/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-amber-400/20"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedImage.type === 'video' ? (
                <video 
                  src={selectedImage.url} 
                  className="w-full h-auto max-h-[50vh] sm:max-h-[60vh] object-contain"
                  controls
                  autoPlay
                  loop
                  playsInline
                />
              ) : (
                <img 
                  src={selectedImage.url} 
                  alt={selectedImage.title || 'Gallery image'}
                  className="w-full h-auto max-h-[50vh] sm:max-h-[60vh] object-contain"
                  loading="eager"
                />
              )}
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-cream mb-2 truncate">
                      {selectedImage.title || 'Untitled'}
                    </h3>
                    <p className="text-sm sm:text-base text-cream/70 mb-4 line-clamp-3">
                      {selectedImage.description || 'No description available'}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className="mobile-badge bg-amber-500/20 text-amber-300 border-amber-400/30 capitalize">
                        {CATEGORY_LABELS[selectedImage.category as MediaCategory] || selectedImage.category || 'Uncategorized'}
                      </Badge>
                      {selectedImage.featured && (
                        <Badge className="mobile-badge bg-purple-600/20 text-purple-300 border-purple-400/30">
                          ⭐ Featured
                        </Badge>
                      )}
                      {selectedImage.views && selectedImage.views > 0 && (
                        <Badge className="mobile-badge bg-black/60 text-cream/80 border-none">
                          👁 {selectedImage.views} views
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedImage(null)}
                    className="text-cream hover:text-amber-400 p-2 backdrop-blur-sm bg-black/40 rounded-full"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Button>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-600/30 text-amber-400 hover:bg-amber-600/10 flex-1 sm:flex-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Download functionality could be implemented here
                      window.open(selectedImage.url, '_blank');
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Download</span>
                    <span className="sm:hidden">Save</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-600/30 text-amber-400 hover:bg-amber-600/10 flex-1 sm:flex-none"
                    onClick={(e) => selectedImage && handleShare(selectedImage, e)}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
