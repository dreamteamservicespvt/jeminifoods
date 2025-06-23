import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Image, Video, Film, X, PlayCircle, Eye, Calendar, Tag,
  ChevronLeft, ChevronRight, Play, Pause, Download, ExternalLink,
  SlidersHorizontal, Filter, ChevronDown, Heart
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from 'use-debounce';
import { useInView } from 'react-intersection-observer';
import { useDebouncedCallback } from 'use-debounce';
import { collection, onSnapshot, query, orderBy, where, limit, getDocs, startAfter, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GalleryItem, MediaCategory, GalleryFilter, CATEGORY_LABELS } from '../types/gallery';
import { useFavorites } from '../hooks/useFavorites';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FavoriteButton from '../components/favorites/FavoriteButton';
import '../styles/gallery-animations.css';

// Define the missing MediaType enum
enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video'
}

const ITEMS_PER_PAGE = 12;

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { favorites, loading: favoritesLoading, isFavorite, addFavorite, removeFavorite, getFavoriteId } = useFavorites();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { ref: inViewRef, inView: isLoadMoreVisible } = useInView();
  
  // Use the ref callback to connect both refs
  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      // Set the loadMoreRef manually
      loadMoreRef.current = node;
      // Set the inViewRef
      inViewRef(node);
    },
    [inViewRef]
  );
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);  const videoRef = useRef<HTMLVideoElement>(null);
    // Filters
  const [filters, setFilters] = useState<GalleryFilter>({
    category: 'all',
    searchQuery: '',
    sortBy: 'recent',
    sortDirection: 'desc'
  });

  // UI state for modern filters
  const [showSearch, setShowSearch] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);

  // Check if any filters are active
  const hasActiveFilters = filters.category !== 'all' || filters.searchQuery !== '' || filters.sortBy !== 'recent';

  // Skeleton placeholder items
  const skeletonItems = Array(ITEMS_PER_PAGE).fill(0);

  // Handle search with debounce
  const handleSearch = useDebouncedCallback((value: string) => {
    setFilters({...filters, searchQuery: value});
    resetGallery();
  }, 500);

  // Reset gallery for new filters
  const resetGallery = () => {
    setGalleryItems([]);
    setLastVisible(null);
    setHasMore(true);
    setIsLoading(true);
  };

  // Change category
  const changeCategory = (category: MediaCategory) => {
    setFilters({...filters, category});
    resetGallery();
  };

  // Change sort method
  const changeSortMethod = (sortBy: 'recent' | 'views' | 'type') => {
    const sortDirection = 
      sortBy === filters.sortBy && filters.sortDirection === 'desc' 
        ? 'asc' 
        : 'desc';
    
    setFilters({...filters, sortBy, sortDirection});
    resetGallery();
  };

  // Load gallery items
  useEffect(() => {
    if (isLoading || isLoadingMore) {
      let galleryQuery = query(
        collection(db, 'gallery'),
        orderBy(getOrderByField(), filters.sortDirection === 'desc' ? 'desc' : 'asc'),
        limit(ITEMS_PER_PAGE)
      );
      
      // Apply category filter
      if (filters.category !== 'all') {
        galleryQuery = query(
          galleryQuery,
          where('category', '==', filters.category)
        );
      }
      
      // Apply search if provided
      if (filters.searchQuery) {
        // This is a simple implementation - for more advanced search
        // you might want to use Algolia or a similar service
        galleryQuery = query(
          galleryQuery,
          where('tags', 'array-contains', filters.searchQuery.toLowerCase())
        );
      }
      
      // Apply pagination
      if (lastVisible && isLoadingMore) {
        galleryQuery = query(
          galleryQuery,
          startAfter(lastVisible)
        );
      }
      
      // Get data
      getDocs(galleryQuery).then((snapshot) => {
        if (snapshot.empty) {
          setHasMore(false);
        } else {
          // Get the last visible document
          setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
          
          // Get the items
          const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as GalleryItem[];
          
          // Update state based on whether we're loading more or initial load
          setGalleryItems(prev => isLoadingMore ? [...prev, ...items] : items);
        }
        
        setIsLoading(false);
        setIsLoadingMore(false);
      }).catch(error => {
        console.error("Error fetching gallery items:", error);
        setIsLoading(false);
        setIsLoadingMore(false);
      });
    }
  }, [isLoading, isLoadingMore, filters]);

  // Intersection observer for infinite loading
  useEffect(() => {
    if (isLoadMoreVisible && !isLoading && !isLoadingMore && hasMore) {
      setIsLoadingMore(true);
    }
  }, [isLoadMoreVisible, isLoading, isLoadingMore, hasMore]);

  // Auto-slideshow for lightbox
  useEffect(() => {
    if (isPlaying && selectedImage && galleryItems.length > 1) {
      const interval = setInterval(() => {
        handleNext();
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [isPlaying, selectedImage, activeImageIndex]);

  // Helper to get the field to order by based on sort selection
  function getOrderByField() {
    switch (filters.sortBy) {
      case 'recent': return 'uploadedAt';
      case 'views': return 'views';
      case 'type': return 'type';
      default: return 'uploadedAt';
    }
  }

  // Open lightbox for an image
  const openLightbox = async (item: GalleryItem, index: number) => {
    setSelectedImage(item);
    setActiveImageIndex(index);
    
    // Increment view count
    try {
      await updateDoc(doc(db, 'gallery', item.id), {
        views: increment(1)
      });
    } catch (error) {
      console.error("Error updating view count:", error);
    }
  };

  // Handle next image in lightbox
  const handleNext = () => {
    if (galleryItems.length > 1) {
      const nextIndex = (activeImageIndex + 1) % galleryItems.length;
      setActiveImageIndex(nextIndex);
      setSelectedImage(galleryItems[nextIndex]);
    }
  };

  // Handle previous image in lightbox
  const handlePrev = () => {
    if (galleryItems.length > 1) {
      const prevIndex = (activeImageIndex - 1 + galleryItems.length) % galleryItems.length;
      setActiveImageIndex(prevIndex);
      setSelectedImage(galleryItems[prevIndex]);
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      
      switch (e.key) {
        case 'ArrowRight':
          handleNext();
          break;
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'Escape':
          setSelectedImage(null);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, activeImageIndex, galleryItems]);

  // Toggle play/pause for videos and slideshow
  const togglePlayPause = () => {
    if (selectedImage?.type === 'video' && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Share the current image
  const shareImage = () => {
    if (selectedImage && navigator.share) {
      navigator.share({        title: selectedImage.title || 'Jemini Foods Gallery',
        text: selectedImage.description || 'Check out this amazing image from Jemini Foods!',
        url: selectedImage.url
      }).catch(error => console.log('Error sharing', error));
    }
  };

  // Download the current image
  const downloadImage = () => {
    if (selectedImage) {
      const link = document.createElement('a');
      link.href = selectedImage.url;
      link.download = selectedImage.title || 'jemini-foods-image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };  // Empty state component
  const EmptyGalleryState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-24 h-24 rounded-full bg-amber-600/10 flex items-center justify-center mb-6">
        <Image size={40} className="text-amber-400/50" />
      </div>
      <h3 className="text-2xl font-semibold text-amber-400 mb-2">No Images Found</h3>
      <p className="text-cream/70 text-center max-w-md mb-6">
        {filters.category !== 'all' || filters.searchQuery 
          ? 'Try adjusting your filters or search terms to find what you\'re looking for.'
          : 'Gallery images will appear here once they\'re uploaded.'}
      </p>
      <Button
        variant="outline"
        className="border-amber-600/30 text-amber-400"
        onClick={() => setFilters({
          category: 'all',
          searchQuery: '',
          sortBy: 'recent',
          sortDirection: 'desc'
        })}
      >
        Clear Filters
      </Button>
    </motion.div>
  );

  const displayItems = galleryItems;
  return (
    <div className="min-h-screen bg-charcoal pt-20 overflow-x-hidden custom-scrollbar">
      {/* Enhanced Hero Section with Parallax and Animation */}      <div className="relative h-[50vh] md:h-[60vh] lg:h-[65vh] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.div 
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 5 }}
            className="w-full h-full"
          >
            {/* Dynamic hero background using first gallery item if available */}
            {galleryItems.length > 0 && galleryItems[0].type === 'image' ? (
              <img 
                src={galleryItems[0].url}
                alt="Gallery featured image"
                className="w-full h-full object-cover brightness-125 contrast-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-900/30 via-charcoal to-black/80" />
            )}
          </motion.div>
          
          {/* Enhanced Dynamic lighting effects */}
          <motion.div 
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
            className="absolute inset-0 bg-gradient-to-r from-amber-900/40 via-transparent to-amber-900/40"
          ></motion.div>
          
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-charcoal/50 to-charcoal"></div>
          
          {/* Enhanced Floating particles */}
          <div className="absolute inset-0 opacity-40">
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50"
                initial={{ 
                  x: `${Math.random() * 100}%`, 
                  y: `${Math.random() * 100}%`,
                  opacity: 0 
                }}
                animate={{ 
                  y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: Math.random() * 8 + 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 5
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="text-center px-4 sm:px-6 max-w-5xl relative z-10"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 1, type: "spring" }}
              className="mb-8"
            >
              <motion.h1 
                className="hero-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-amber-400 mb-6"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
              >
                Culinary Gallery
              </motion.h1>
              
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="w-32 sm:w-48 lg:w-64 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"
              ></motion.div>
            </motion.div>
            
            <motion.p 
              className="hero-subtitle text-lg sm:text-xl lg:text-2xl text-cream/90 max-w-4xl mx-auto leading-relaxed glass-effect p-4 sm:p-6 rounded-2xl"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              Step into our world of culinary artistry and elegant ambiance.
              Each image tells a story of passion, precision, and the pursuit of perfection.
            </motion.p>
          </motion.div>
        </div>
      </div>      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12 -mt-10 max-w-7xl">        
        {/* Modern Pinterest-Style Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-black/40 backdrop-blur-md border border-amber-600/20 rounded-2xl p-4 sm:p-5 mb-8 shadow-2xl"
        >
          {/* Mobile-optimized filter layout */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Category Pills - Horizontal Instagram-Style Scroll */}
            <div className="order-2 sm:order-1 sm:flex-1">
              <div className="relative">
                <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-2 pt-1">
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`
                        filter-button flex-shrink-0 min-w-[66px] px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 whitespace-nowrap
                        ${filters.category === key 
                          ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 border border-amber-400' 
                          : 'bg-charcoal/50 text-amber-400 border border-amber-600/30 hover:border-amber-400/50'
                        }
                      `}
                      onClick={() => changeCategory(key as MediaCategory)}
                    >
                      {label}
                    </motion.button>
                  ))}
                </div>
                
                {/* Gradient fade indicators for scrolling */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/40 to-transparent pointer-events-none" />
              </div>
            </div>
            
            {/* Advanced Filters + Search - Compact Layout */}
            <div className="order-1 sm:order-2 flex items-center gap-2 self-end">
              {/* Compact Search Button - Expands on click */}
              <motion.div 
                className="relative"
                animate={{ width: showSearch ? 220 : 44 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                {showSearch ? (
                  <div className="relative w-full flex items-center">
                    <Input
                      placeholder="Search gallery..."
                      className="pl-10 pr-8 py-2 bg-charcoal/80 border-amber-600/30 text-cream rounded-full h-11 w-full focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                      onChange={(e) => handleSearch(e.target.value)}
                      autoFocus
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400/70 pointer-events-none" size={16} />
                    <button 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/70 hover:text-amber-400"
                      onClick={() => {
                        setShowSearch(false);
                        if (filters.searchQuery) {
                          handleSearch('');
                        }
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-11 w-11 border-amber-600/30 bg-charcoal/60 hover:bg-amber-600/20 text-amber-400"
                    onClick={() => setShowSearch(true)}
                  >
                    <Search size={18} />
                  </Button>
                )}
              </motion.div>
              
              {/* Filter + Sort Dropdown Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline" 
                    size="icon"
                    className={`
                      rounded-full h-11 w-11 transition-all duration-300 flex items-center justify-center
                      ${hasActiveFilters 
                        ? 'bg-amber-600 text-black border-amber-400 shadow-lg shadow-amber-500/25' 
                        : 'bg-charcoal/60 text-amber-400 border-amber-600/30 hover:bg-amber-600/20'
                      }
                    `}
                  >
                    <SlidersHorizontal size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-60 bg-charcoal/95 backdrop-blur-xl border-amber-600/30 text-cream p-2 rounded-xl"
                  align="end"
                >
                  <div className="px-2 pb-2 text-sm font-medium text-amber-400">Sort Gallery By</div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`rounded-lg justify-start ${filters.sortBy === 'recent' ? 'bg-amber-600/20 text-amber-400' : 'text-cream/80'}`}
                      onClick={() => changeSortMethod('recent')}
                    >
                      <Calendar size={15} className="mr-2" /> Recent
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`rounded-lg justify-start ${filters.sortBy === 'views' ? 'bg-amber-600/20 text-amber-400' : 'text-cream/80'}`}
                      onClick={() => changeSortMethod('views')}
                    >
                      <Eye size={15} className="mr-2" /> Popular
                    </Button>
                  </div>
                  
                  {hasActiveFilters && (
                    <>
                      <div className="border-t border-amber-600/20 my-2"></div>
                      <div className="px-2 py-1 text-xs text-amber-400/80 font-medium">ACTIVE FILTERS</div>
                      <div className="flex flex-wrap gap-2 px-2 mb-3">
                        {filters.category !== 'all' && (
                          <Badge 
                            variant="outline" 
                            className="bg-amber-600/20 text-amber-400 border-amber-400/50 text-xs cursor-pointer hover:bg-amber-600/30"
                            onClick={() => changeCategory('all')}
                          >
                            {CATEGORY_LABELS[filters.category]} <X size={12} className="ml-1" />
                          </Badge>
                        )}
                        
                        {filters.searchQuery && (
                          <Badge 
                            variant="outline" 
                            className="bg-amber-600/20 text-amber-400 border-amber-400/50 text-xs cursor-pointer hover:bg-amber-600/30"
                            onClick={() => handleSearch('')}
                          >
                            "{filters.searchQuery}" <X size={12} className="ml-1" />
                          </Badge>
                        )}
                        
                        {filters.sortBy !== 'recent' && (
                          <Badge 
                            variant="outline" 
                            className="bg-amber-600/20 text-amber-400 border-amber-400/50 text-xs cursor-pointer hover:bg-amber-600/30"
                            onClick={() => changeSortMethod('recent')}
                          >
                            {filters.sortBy === 'views' ? 'Popular' : 'Type'} <X size={12} className="ml-1" />
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-center text-amber-400 hover:bg-amber-600/10 hover:text-amber-300"
                        onClick={() => {
                          setFilters({
                            category: 'all',
                            searchQuery: '',
                            sortBy: 'recent',
                            sortDirection: 'desc'
                          });
                          resetGallery();
                          setShowSearch(false);
                        }}
                      >
                        <X size={14} className="mr-2" /> Reset All Filters
                      </Button>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.div>{/* Enhanced Gallery Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {isLoading && skeletonItems.map((_, index) => (
            <motion.div 
              key={`skeleton-${index}`} 
              className="relative aspect-[4/3] group"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Skeleton className="w-full h-full rounded-2xl bg-charcoal/50 border border-amber-600/10" />
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 to-transparent rounded-2xl" />
            </motion.div>
          ))}
          
          {!isLoading && displayItems.length === 0 && <EmptyGalleryState />}
          
          <AnimatePresence mode="popLayout">            {!isLoading && displayItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                layout
                className="relative aspect-[4/3] group cursor-pointer"                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >                <div 
                  className="
                    w-full h-full overflow-hidden rounded-2xl border border-amber-600/20 
                    group-hover:border-amber-400/50 group-hover:shadow-2xl group-hover:shadow-amber-600/25
                    transition-all duration-500 bg-black/20 backdrop-blur-sm
                    relative
                  "
                  onClick={() => openLightbox(item, index)}
                >
                  {/* Favorite Button */}
                  <FavoriteButton 
                    itemId={item.id}
                    itemType="gallery"
                    itemData={{
                      name: item.title || 'Gallery image',
                      description: item.description,
                      imageUrl: item.url
                    }}
                  />
                  {/* Image/Video Container */}
                  <div className="relative w-full h-full overflow-hidden">
                    {item.type === 'video' ? (
                      <>
                        <video 
                          src={item.url} 
                          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                          muted
                          loop
                          playsInline
                          onMouseOver={(e) => e.currentTarget.play()}
                          onMouseOut={(e) => e.currentTarget.pause()}
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black shadow-lg">
                            <PlayCircle size={32} />
                          </div>
                        </div>
                      </>
                    ) : (
                      <img 
                        src={item.url} 
                        alt={item.title || 'Gallery image'} 
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                  </div>
                </div>
                
                {/* Enhanced Overlay with Info */}
                <motion.div 
                  className="
                    absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent 
                    opacity-0 group-hover:opacity-100 transition-all duration-300 
                    flex flex-col justify-end p-4 sm:p-6 rounded-2xl
                  "
                  initial={false}
                >
                  {item.title && (
                    <motion.h3 
                      className="text-lg sm:text-xl font-semibold text-amber-400 mb-2 truncate"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {item.title}
                    </motion.h3>
                  )}
                  
                  <motion.div 
                    className="flex flex-wrap gap-2 mb-3"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Badge 
                      variant="outline" 
                      className="bg-black/60 text-amber-400 border-amber-400/50 text-xs backdrop-blur-sm"
                    >
                      {CATEGORY_LABELS[item.category as MediaCategory]}
                    </Badge>
                    
                    {item.type === 'video' && (
                      <Badge variant="outline" className="bg-black/60 text-blue-400 border-blue-400/50 text-xs backdrop-blur-sm">
                        <Film size={12} className="mr-1" />
                        Video
                      </Badge>
                    )}
                    
                    {item.featured && (
                      <Badge variant="outline" className="bg-black/60 text-purple-400 border-purple-400/50 text-xs backdrop-blur-sm">
                        ⭐ Featured
                      </Badge>
                    )}
                  </motion.div>
                  
                  {/* Tags and Views */}
                  <motion.div 
                    className="flex items-center justify-between text-xs"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex items-center gap-1 text-cream/70 truncate flex-1">
                        <Tag size={12} className="text-cream/50 flex-shrink-0" />
                        <span className="truncate">
                          {item.tags.slice(0, 2).join(', ')}
                          {item.tags.length > 2 && '...'}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1 text-cream/60 ml-2">
                      <Eye size={12} />
                      <span>{item.views || 0}</span>
                    </div>                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
          {/* Enhanced Load More Section */}        <motion.div 
          ref={setRefs} 
          className="flex justify-center mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {isLoadingMore && (
            <motion.div 
              className="flex items-center gap-3 text-amber-400 bg-black/30 backdrop-blur-sm rounded-full px-6 py-3 border border-amber-600/20"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <div className="w-5 h-5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>
              <span className="font-medium">Loading more amazing content...</span>
            </motion.div>
          )}
          
          {!isLoading && !isLoadingMore && !hasMore && galleryItems.length > 0 && (
            <motion.div 
              className="text-center py-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-16 h-16 rounded-full bg-amber-600/10 flex items-center justify-center mx-auto mb-4">
                <Image size={24} className="text-amber-400/50" />
              </div>
              <p className="text-cream/70 font-medium">You've reached the end of our gallery</p>
              <p className="text-cream/50 text-sm mt-1">Check back later for new content!</p>
            </motion.div>
          )}
        </motion.div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
              onClick={() => setSelectedImage(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 25 }}
                className="relative max-w-6xl max-h-[90vh] w-full"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Navigation Controls */}
                {galleryItems.length > 1 && (
                  <>
                    <button
                      onClick={handlePrev}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-cream rounded-full p-3 transition-colors"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    
                    <button
                      onClick={handleNext}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-cream rounded-full p-3 transition-colors"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
                
                {/* Close Button */}
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 z-10 bg-black/40 hover:bg-black/60 text-cream rounded-full p-2 transition-colors"
                >
                  <X size={24} />
                </button>
                
                {/* Media Container */}
                <div className="flex justify-center items-center h-full max-h-[calc(90vh-8rem)] overflow-hidden">
                  {selectedImage.type === 'video' ? (
                    <video
                      ref={videoRef}
                      src={selectedImage.url}
                      className="max-w-full max-h-full object-contain"
                      controls
                      autoPlay
                    />
                  ) : (
                    <img
                      src={selectedImage.url}
                      alt={selectedImage.title || 'Gallery image'}
                      className="max-w-full max-h-full object-contain"
                    />
                  )}
                </div>
                
                {/* Info Panel */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                  <div className="max-w-3xl mx-auto">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <Badge className="bg-amber-600 text-black">
                        {CATEGORY_LABELS[selectedImage.category as MediaCategory]}
                      </Badge>
                      
                      {selectedImage.type === 'video' && (
                        <Badge className="bg-blue-600 text-white">
                          Video
                        </Badge>
                      )}
                      
                      {selectedImage.featured && (
                        <Badge className="bg-purple-600 text-white">
                          Featured
                        </Badge>
                      )}
                      
                      <div className="text-cream/60 text-sm flex items-center gap-1 ml-auto">
                        <Eye size={14} />
                        {selectedImage.views || 0} views
                      </div>
                    </div>
                    
                    {selectedImage.title && (
                      <h3 className="text-2xl font-semibold text-amber-400 mb-2">
                        {selectedImage.title}
                      </h3>
                    )}
                    
                    {selectedImage.description && (
                      <p className="text-cream mb-4">
                        {selectedImage.description}
                      </p>
                    )}
                    
                    {/* Tags */}
                    {selectedImage.tags && selectedImage.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
                        <Tag size={14} className="text-cream/70" />
                        {selectedImage.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-cream/70 border-cream/30">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Action Controls */}
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-amber-600/30 text-amber-400"
                          onClick={togglePlayPause}
                        >
                          {selectedImage.type === 'video' ? (
                            videoRef.current?.paused ? <Play size={16} className="mr-2" /> : <Pause size={16} className="mr-2" />
                          ) : (
                            isPlaying ? <Pause size={16} className="mr-2" /> : <Play size={16} className="mr-2" />
                          )}
                          {selectedImage.type === 'video' ? 'Play/Pause' : (isPlaying ? 'Pause Slideshow' : 'Start Slideshow')}
                        </Button>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-amber-600/30 text-amber-400"
                          onClick={downloadImage}
                        >
                          <Download size={16} className="mr-2" /> Download
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-amber-600/30 text-amber-400"
                          onClick={() => window.open(selectedImage.url, '_blank')}
                        >
                          <ExternalLink size={16} className="mr-2" /> Open Original
                        </Button>
                        
                        {navigator.share && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-amber-600/30 text-amber-400"
                            onClick={shareImage}
                          >
                            Share
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Gallery;
