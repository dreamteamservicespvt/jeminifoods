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

const Gallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-cream">
      {/* Navigation */}
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-black/80 to-black/40 mb-8 pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-transparent"></div>
        <div className="container mx-auto px-6 py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-serif font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent mb-6">
              Culinary Gallery
            </h1>
            <p className="text-xl text-cream/80 mb-8 leading-relaxed">
              Explore a curated collection of our finest culinary creations, from signature dishes to behind-the-scenes moments that capture the essence of fine dining excellence.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/30 px-4 py-2">
                {loading ? 'Loading...' : `${galleryItems.length} High-Quality Images`}
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 px-4 py-2">
                Multiple Categories
              </Badge>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="container mx-auto px-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(categories).map(([key, category]) => (
              <motion.button
                key={key}
                onClick={() => setSelectedCategory(key)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                  selectedCategory === key
                    ? "bg-amber-500 text-black border-amber-400"
                    : "bg-black/30 text-cream border-cream/20 hover:border-amber-400/50 hover:bg-black/50"
                )}
              >
                {category.title}
                <Badge 
                  className={cn(
                    "ml-2 text-xs",
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

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full p-1 border border-cream/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={cn(
                "rounded-full px-3",
                viewMode === 'grid' 
                  ? "bg-amber-500 text-black" 
                  : "text-cream hover:text-amber-400"
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('masonry')}
              className={cn(
                "rounded-full px-3",
                viewMode === 'masonry' 
                  ? "bg-amber-500 text-black" 
                  : "text-cream hover:text-amber-400"
              )}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          // Loading state
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="aspect-[4/3] bg-charcoal/30 rounded-2xl animate-pulse" />
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
          // Empty state
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-amber-400/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-cream mb-2">No Images Found</h3>
            <p className="text-cream/70 mb-4">
              {selectedCategory === 'all' 
                ? 'The gallery is currently empty. Please check back later.'
                : `No images found in the ${categories[selectedCategory]?.title || selectedCategory} category.`
              }
            </p>
            {selectedCategory !== 'all' && (
              <Button
                onClick={() => setSelectedCategory('all')}
                variant="outline"
                className="border-amber-400/30 text-amber-400"
              >
                View All Images
              </Button>
            )}
          </div>
        ) : (
          // Gallery Grid
          <motion.div 
            layout
            className={cn(
              "grid gap-6",
              viewMode === 'grid' 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
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
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group relative overflow-hidden rounded-2xl bg-black/20 backdrop-blur-sm border border-cream/10 hover:border-amber-400/50 transition-all duration-300 cursor-pointer"
                  style={{
                    height: viewMode === 'masonry' 
                      ? index % 3 === 0 ? '400px' : index % 2 === 0 ? '350px' : '300px'
                      : '320px'
                  }}
                  onClick={() => handleImageClick(image)}
                >
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
                      />
                    )}
                  </div>

                  {/* Featured badge */}
                  {image.featured && (
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-purple-600 text-white border-purple-400/30">
                        Featured
                      </Badge>
                    </div>
                  )}

                  {/* View count */}
                  {image.views && image.views > 0 && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className="bg-black/60 text-cream/80 border-none text-xs">
                        {image.views} views
                      </Badge>
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-lg font-semibold text-cream mb-2">{image.title || 'Untitled'}</h3>
                      <p className="text-cream/70 text-sm mb-4 line-clamp-2">{image.description || 'No description available'}</p>
                      
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
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16 p-8 bg-black/30 rounded-2xl border border-amber-600/20"
        >
          <h3 className="text-2xl font-serif font-bold text-amber-400 mb-4">
            Experience These Dishes in Person
          </h3>
          <p className="text-cream/70 mb-6 max-w-2xl mx-auto">
            Each image tells a story of culinary passion and artistry. Reserve your table today and taste the perfection you see.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild
              className="bg-amber-600 hover:bg-amber-700 text-black font-medium px-8 py-3"
            >
              <Link to="/reservations">
                Make a Reservation
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button 
              asChild
              variant="outline"
              className="border-amber-600/30 text-amber-400 hover:bg-amber-600/10 px-8 py-3"
            >
              <Link to="/menu">
                View Our Menu
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-[80vh] bg-black/80 rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedImage.type === 'video' ? (
                <video 
                  src={selectedImage.url} 
                  className="w-full h-auto max-h-[60vh] object-contain"
                  controls
                  autoPlay
                  loop
                />
              ) : (
                <img 
                  src={selectedImage.url} 
                  alt={selectedImage.title || 'Gallery image'}
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-cream mb-2">
                      {selectedImage.title || 'Untitled'}
                    </h3>
                    <p className="text-cream/70 mb-4">{selectedImage.description || 'No description available'}</p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/30 capitalize">
                        {CATEGORY_LABELS[selectedImage.category as MediaCategory] || selectedImage.category || 'Uncategorized'}
                      </Badge>
                      {selectedImage.featured && (
                        <Badge className="bg-purple-600 text-white border-purple-400/30">
                          Featured
                        </Badge>
                      )}
                      {selectedImage.views && selectedImage.views > 0 && (
                        <Badge className="bg-black/60 text-cream/80 border-none">
                          {selectedImage.views} views
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedImage(null)}
                    className="text-cream hover:text-amber-400"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-600/30 text-amber-400 hover:bg-amber-600/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-600/30 text-amber-400 hover:bg-amber-600/10"
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
