import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Search, Star, Heart, Clock, Leaf, Flame, Zap, 
  Award, Gift, X, Plus, Grid3X3, List, 
  ChefHat, Coffee, Utensils,
  Eye, ImageIcon, Timer, Users, ShoppingCart, 
  Minus, Info, Star as StarIcon, RefreshCw, Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { useFavorites } from '../hooks/useFavorites';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useUserAuthOnly } from '../contexts/MultiAuthContext';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  featured?: boolean;
  ingredients?: string[];
  specialOffer?: boolean;
  specialOfferText?: string;
  variations?: {
    size: string;
    price: number;
  }[];
  visibility?: boolean;
  videoUrl?: string;
  preparationTime?: number;
  spiceLevel?: number;
  rating?: number;
  reviewCount?: number;
}

interface CartItem extends MenuItem {
  quantity: number;
  specialInstructions?: string;
}

// Base Category Configuration - will be extended with actual categories from menu items
const baseCategoryConfig = {
  all: { 
    title: 'All Dishes', 
    icon: Utensils, 
    emoji: '🍽️', 
    description: 'Explore our complete culinary collection'
  },
  "chef's specials": { 
    title: "Chef's Specials", 
    icon: Award, 
    emoji: '⭐', 
    description: 'Signature dishes from our master chefs'
  },
};

// Default configurations for common categories
const defaultCategoryMappings: Record<string, any> = {
  appetizers: { 
    title: 'Appetizers', 
    icon: ChefHat, 
    emoji: '🥗', 
    description: 'Perfect beginnings to your culinary journey'
  },
  starters: { 
    title: 'Appetizers', 
    icon: ChefHat, 
    emoji: '🥗', 
    description: 'Perfect beginnings to your culinary journey'
  },
  mains: { 
    title: 'Main Courses', 
    icon: Utensils, 
    emoji: '🍛', 
    description: 'Hearty dishes crafted to perfection'
  },
  'main course': { 
    title: 'Main Courses', 
    icon: Utensils, 
    emoji: '🍛', 
    description: 'Hearty dishes crafted to perfection'
  },
  desserts: { 
    title: 'Sweet Endings', 
    icon: Gift, 
    emoji: '🍰', 
    description: 'Indulgent treats to satisfy your sweet tooth'
  },
  beverages: { 
    title: 'Beverages', 
    icon: Coffee, 
    emoji: '🥤', 
    description: 'Refreshing drinks to complement your meal'
  },
  sides: { 
    title: 'Sides', 
    icon: Utensils, 
    emoji: '🥙', 
    description: 'Perfect accompaniments to your meal'
  },
  specials: { 
    title: 'Specials', 
    icon: Star, 
    emoji: '🌟', 
    description: 'Limited time offerings'
  },
};



const Menu = () => {
  const navigate = useNavigate();
  const { user } = useUserAuthOnly();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'name' | 'newest' | 'popular'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  
  // Cart and Details Modal State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showItemDetails, setShowItemDetails] = useState(false);
  
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { isFavorite, addFavorite, removeFavorite, getFavoriteId } = useFavorites();
  const { toast } = useToast();
  
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);

  // Hero background images from menu items
  const heroBackgroundImages = useMemo(() => {
    // Filter menu items that have images
    const itemsWithImages = menuItems
      .filter(item => item.image && item.image.trim() !== '')
      .slice(0, 12); // Limit to 12 images for performance
    
    return itemsWithImages.length > 0 ? itemsWithImages : [];
  }, [menuItems]);

  // Fallback background images when no menu items have images
  const fallbackBackgroundImages = [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
  ];

  // Use menu item images if available, otherwise use fallbacks
  const backgroundImages = heroBackgroundImages.length > 0 ? heroBackgroundImages : 
    fallbackBackgroundImages.map((url, index) => ({ 
      id: `fallback-${index}`, 
      name: 'Culinary Excellence',
      image: url,
      description: 'Discover our exquisite dishes'
    }));

  // Auto-rotate hero background images
  useEffect(() => {
    if (backgroundImages.length <= 1 || isHeroPaused) return;

    const interval = setInterval(() => {
      setHeroImageIndex((prevIndex) => 
        (prevIndex + 1) % backgroundImages.length
      );
    }, 6000); // Change image every 6 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length, isHeroPaused]);

  // Build dynamic category configuration from actual menu items
  const categoryConfig = useMemo(() => {
    const actualCategories = [...new Set(menuItems.map(item => item.category.toLowerCase()))];
    const config: Record<string, any> = { ...baseCategoryConfig };
    
    // Add categories from menu items
    actualCategories.forEach(category => {
      if (!config[category]) {
        // Use default mapping if available, otherwise create a generic one
        config[category] = defaultCategoryMappings[category] || {
          title: category.charAt(0).toUpperCase() + category.slice(1),
          icon: Utensils,
          emoji: '🍽️',
          description: `Delicious ${category} options`
        };
      }
    });
    
    return config;
  }, [menuItems]);

  // Available categories (only those with items + special categories)
  const availableCategories = useMemo(() => {
    const actualCategories = [...new Set(menuItems.map(item => item.category.toLowerCase()))];
    const categories = ['all'];
    
    // Add categories that have items
    actualCategories.forEach(category => {
      if (!categories.includes(category)) {
        categories.push(category);
      }
    });
    
    // Add "chef's specials" if there are featured items
    if (menuItems.some(item => item.featured)) {
      categories.push("chef's specials");
    }
    
    return categories;
  }, [menuItems]);
  
  // Fetch menu items from Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'menuItems'),
      (snapshot) => {
        const items = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as MenuItem))
          .filter(item => item.visibility !== false);
        setMenuItems(items);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching menu items:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter and search logic with real-time search for best UX
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === "chef's specials" && !item.featured) return false;
        if (selectedCategory !== "chef's specials" && item.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      }

      // Real-time search filter for immediate response
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const searchableText = [
          item.name,
          item.description,
          ...(item.ingredients || []),
          item.category
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(query)) return false;
      }

      return true;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Sort items with memoization
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'popular':
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [filteredItems, sortBy]);

  // Enhanced search suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    
    const query = searchQuery.toLowerCase();
    const suggestions = new Set<string>();
    
    menuItems.forEach(item => {
      // Add matching names
      if (item.name.toLowerCase().includes(query)) {
        suggestions.add(item.name);
      }
      // Add matching categories
      if (item.category.toLowerCase().includes(query)) {
        suggestions.add(item.category);
      }
    });
    
    return Array.from(suggestions).slice(0, 5);
  }, [menuItems, searchQuery]);

  // Handle favorite toggle
  const handleToggleFavorite = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isFavorite(item.id, 'menuItem')) {
      const favoriteId = getFavoriteId(item.id, 'menuItem');
      if (favoriteId) {
        removeFavorite(favoriteId);
      }
    } else {
      addFavorite({
        id: item.id,
        type: 'menuItem',
        name: item.name,
        description: item.description,
        imageUrl: item.image || '',
      });
    }
  };

  // Cart functionality
  const addToCart = (item: MenuItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setCart(prevCart => {
      const existingItem = prevCart.find(i => i.id === item.id);
      if (existingItem) {
        return prevCart.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + 1 } 
            : i
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
    
    // Visual feedback
    toast({
      title: `Added to cart`,
      description: item.name,
      duration: 1500,
    });
    
    // Show cart after adding first item
    if (cart.length === 0) {
      setTimeout(() => setShowCart(true), 300);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(i => i.id === id);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(i => 
          i.id === id 
            ? { ...i, quantity: i.quantity - 1 } 
            : i
        );
      } else {
        return prevCart.filter(i => i.id !== id);
      }
    });
  };

  const deleteFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Handle checkout navigation
  const handleProceedToCheckout = () => {
    // Check if cart is empty
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before proceeding to checkout.",
        variant: "destructive",
      });
      return;
    }

    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to proceed with your order.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    // Transfer cart data to localStorage for PreOrders page
    localStorage.setItem('menuCartTransfer', JSON.stringify(cart));
    
    // Navigate to PreOrders page
    navigate('/preorders');
    
    // Show success message
    toast({
      title: "Redirecting to checkout",
      description: "Taking you to complete your order...",
    });
  };

  // Handle view details
  const handleViewDetails = (item: MenuItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedItem(item);
    setShowItemDetails(true);
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
  };

  const getCurrentCategory = () => {
    return categoryConfig[selectedCategory as keyof typeof categoryConfig] || categoryConfig.all;
  };

  const getItemCount = (category: string) => {
    if (category === 'all') return menuItems.length;
    if (category === "chef's specials") return menuItems.filter(item => item.featured).length;
    return menuItems.filter(item => item.category.toLowerCase() === category.toLowerCase()).length;
  };

  const activeFiltersCount = (selectedCategory !== 'all' ? 1 : 0);



  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-cream">
      {/* Enhanced Hero Header with Dynamic Background Slideshow */}
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

        {/* Slideshow indicators - only show if multiple images */}
        {backgroundImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[5] flex space-x-2">
            {backgroundImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setHeroImageIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === heroImageIndex 
                    ? "bg-amber-400 shadow-lg" 
                    : "bg-white/40 hover:bg-white/60"
                )}
                aria-label={`View image ${index + 1}`}
              />
            ))}
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

      {/* Search and Filters */}
      <motion.div 
        className="bg-black/60 backdrop-blur-xl border-b border-cream/10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="container mx-auto px-4 py-6">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cream/60 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for dishes, ingredients, or cuisines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={cn(
                  "w-full pl-12 pr-12 py-4 text-lg bg-black/40 backdrop-blur-sm border-2 rounded-2xl transition-all",
                  "text-cream placeholder:text-cream/50",
                  isSearchFocused 
                    ? "border-amber-500 shadow-xl shadow-amber-500/20" 
                    : "border-cream/20 hover:border-cream/40"
                )}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-cream/60 hover:text-cream p-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            {/* Search Suggestions Dropdown - World-class UX */}
            <AnimatePresence>
              {searchQuery && searchSuggestions.length > 0 && isSearchFocused && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-xl border border-amber-500/30 rounded-xl shadow-2xl shadow-amber-500/20 z-50 overflow-hidden"
                >
                  <div className="p-2 border-b border-amber-500/20">
                    <p className="text-xs text-amber-400 font-medium px-3 py-1">Suggestions</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {searchSuggestions.map((suggestion, index) => (
                      <motion.button
                        key={suggestion}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          setSearchQuery(suggestion);
                          setIsSearchFocused(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-amber-500/10 transition-colors text-cream hover:text-amber-400 flex items-center gap-3 group"
                      >
                        <Search className="w-4 h-4 text-amber-400/60 group-hover:text-amber-400" />
                        <span className="text-sm">{suggestion}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* View Toggle and Stats */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex bg-black/40 rounded-xl p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "rounded-lg",
                    viewMode === 'grid' 
                      ? "bg-amber-500 text-black" 
                      : "text-cream hover:text-amber-400"
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "rounded-lg",
                    viewMode === 'list' 
                      ? "bg-amber-500 text-black" 
                      : "text-cream hover:text-amber-400"
                  )}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-cream/70">
              Showing {sortedItems.length} of {menuItems.length} dishes
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="bg-black/40 backdrop-blur-sm border-t border-cream/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {availableCategories.map((category) => {
                const categoryInfo = categoryConfig[category as keyof typeof categoryConfig];
                const itemCount = getItemCount(category);
                const IconComponent = categoryInfo?.icon || Utensils;
                
                return (
                  <motion.button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "flex items-center gap-3 px-6 py-3 rounded-2xl whitespace-nowrap transition-all font-medium text-sm border-2 min-w-fit touch-manipulation",
                      selectedCategory === category
                        ? "bg-gradient-to-r from-amber-600 to-amber-500 text-black border-amber-400 shadow-xl shadow-amber-600/25"
                        : "bg-black/30 backdrop-blur-sm text-cream border-cream/20 hover:bg-black/50 hover:border-amber-600/40"
                    )}
                  >
                    {isMobile ? (
                      <span className="text-lg">{categoryInfo?.emoji || '🍽️'}</span>
                    ) : (
                      <IconComponent className="w-4 h-4" />
                    )}
                    <span className="capitalize">{categoryInfo?.title || category}</span>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-xs font-semibold",
                        selectedCategory === category
                          ? "bg-black/20 text-black"
                          : "bg-cream/20 text-cream"
                      )}
                    >
                      {itemCount}
                    </Badge>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>


      </motion.div>

      {/* Menu Items */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full"
            />
          </div>
        ) : sortedItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20 px-6"
          >
            {/* Enhanced animated icon */}
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="mb-8"
            >
              <div className="relative inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-amber-600/20 to-amber-400/10 rounded-full border-2 border-amber-600/30">
                <Utensils className="text-amber-400/70" size={56} />
                
                {/* Pulsing rings */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-amber-600/20"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-amber-600/10"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
              </div>
            </motion.div>
            
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-serif font-bold text-amber-400 mb-6"
            >
              No dishes found
            </motion.h3>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-cream/80 max-w-xl mx-auto mb-10 text-lg leading-relaxed"
            >
              {searchQuery ? (
                <>
                  We couldn't find any dishes matching <span className="text-amber-400 font-semibold">"{searchQuery}"</span>.
                  <br />
                  <span className="text-amber-400/80">Try a different search term or explore our categories below.</span>
                </>
              ) : selectedCategory !== 'all' ? (
                <>
                  No dishes are currently available in our <span className="text-amber-400 font-semibold capitalize">
                    {selectedCategory === "chef's specials" ? "Chef's Specials" : selectedCategory}
                  </span> category.
                  <br />
                  <span className="text-amber-400/80">Please check back soon or explore our other delicious options.</span>
                </>
              ) : (
                <>
                  We're currently updating our menu selection.
                  <br />
                  <span className="text-amber-400/80">Please check back in a moment for our amazing dishes.</span>
                </>
              )}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black px-8 py-4 font-semibold rounded-xl shadow-xl hover:shadow-amber-600/30 transition-all duration-300 transform hover:scale-105"
              >
                <Utensils className="w-5 h-5 mr-2" />
                Explore All Dishes
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory("chef's specials");
                  setSearchQuery('');
                }}
                className="border-amber-600/40 text-amber-400 hover:bg-amber-600/10 hover:border-amber-600/60 px-8 py-4 font-semibold rounded-xl transition-all duration-300"
              >
                <Star className="w-5 h-5 mr-2" />
                Try Chef's Specials
              </Button>
            </motion.div>
            
            {/* Popular Search Suggestions */}
            {!searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-8 max-w-2xl mx-auto"
              >
                <p className="text-cream/60 text-sm mb-4">Popular searches:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['Biryani', 'Pasta', 'Pizza', 'Dessert', 'Vegetarian', 'Seafood'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setSearchQuery(suggestion)}
                      className="px-4 py-2 bg-black/20 border border-cream/10 rounded-full text-cream/70 text-sm hover:bg-amber-600/10 hover:border-amber-600/30 hover:text-amber-400 transition-all duration-300 transform hover:scale-105"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            className={cn(
              "grid gap-8 transition-all duration-500",
              viewMode === 'grid' 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-1 max-w-4xl mx-auto"
            )}
            layout
          >
            <AnimatePresence mode="popLayout">
              {sortedItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 40 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -40 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: Math.min(index * 0.1, 0.5),
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ y: -12, scale: 1.03 }}
                  onHoverStart={() => setHoveredItem(item.id)}
                  onHoverEnd={() => setHoveredItem(null)}
                  className={cn(
                    "group relative bg-black/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-cream/10",
                    "hover:border-amber-500/60 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-700 cursor-pointer",
                    viewMode === 'list' && "flex flex-row max-h-48"
                  )}
                >
                  {/* Image Container with Enhanced Overlay */}
                  <div className={cn(
                    "relative overflow-hidden",
                    viewMode === 'grid' ? "aspect-[4/3]" : "w-48 h-48 flex-shrink-0"
                  )}>
                    {item.image ? (
                      <motion.img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.7 }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-900/30 to-orange-900/30 flex items-center justify-center">
                        <motion.span 
                          className="text-6xl opacity-60"
                          animate={{ 
                            rotate: hoveredItem === item.id ? [0, -10, 10, 0] : 0 
                          }}
                          transition={{ duration: 0.6 }}
                        >
                          🍽️
                        </motion.span>
                      </div>
                    )}
                    
                    {/* Enhanced Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* View Details Overlay Button */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500"
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                    >
                      <motion.button
                        onClick={(e) => handleViewDetails(item, e)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 rounded-full font-semibold shadow-xl backdrop-blur-sm transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </motion.button>
                    </motion.div>
                    
                    {/* Animated Favorite Button */}
                    <motion.button
                      onClick={(e) => handleToggleFavorite(item, e)}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.85 }}
                      className={cn(
                        "absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all backdrop-blur-sm border-2 shadow-lg",
                        isFavorite(item.id, 'menuItem')
                          ? "bg-red-500/90 text-white border-red-400 shadow-red-500/30"
                          : "bg-black/60 text-white border-white/30 hover:bg-black/80 hover:border-white/50"
                      )}
                    >
                      <motion.div
                        animate={{
                          scale: isFavorite(item.id, 'menuItem') ? [1, 1.3, 1] : 1
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <Heart className={cn(
                          "w-5 h-5 transition-all",
                          isFavorite(item.id, 'menuItem') && "fill-current"
                        )} />
                      </motion.div>
                    </motion.button>

                    {/* Enhanced Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {item.specialOffer && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm"
                        >
                          <Gift className="w-3 h-3" />
                          <span>Special Offer</span>
                        </motion.div>
                      )}
                      {item.featured && (
                        <motion.div
                          initial={{ scale: 0, rotate: 180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm"
                        >
                          <Star className="w-3 h-3 fill-current" />
                          <span>Chef's Choice</span>
                        </motion.div>
                      )}
                      {item.preparationTime && item.preparationTime <= 15 && (
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm"
                        >
                          <Zap className="w-3 h-3" />
                          <span>Quick Serve</span>
                        </motion.div>
                      )}
                    </div>

                    {/* Enhanced Prep Time */}
                    {item.preparationTime && viewMode === 'grid' && (
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-full text-xs border border-white/20">
                        <Timer className="w-3 h-3" />
                        <span>{item.preparationTime} mins</span>
                      </div>
                    )}

                    {/* Rating Badge */}
                    {item.rating && viewMode === 'grid' && (
                      <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-amber-500/90 backdrop-blur-sm text-black px-3 py-2 rounded-full text-xs font-semibold border border-amber-400/50">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{item.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Content */}
                  <div className={cn(
                    "p-6 flex flex-col",
                    viewMode === 'list' ? "flex-1 justify-between py-6" : "space-y-4"
                  )}>
                    {/* Title and Rating */}
                    <div className={cn(
                      "flex items-start justify-between",
                      viewMode === 'list' ? "space-y-2" : "space-y-3"
                    )}>
                      <div className="flex-1">
                        <h3 className={cn(
                          "font-serif font-bold text-cream line-clamp-2 group-hover:text-amber-400 transition-colors leading-tight",
                          viewMode === 'list' ? "text-lg" : "text-xl"
                        )}>
                          {item.name}
                        </h3>
                        {item.rating && viewMode === 'list' && (
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-amber-400 fill-current" />
                              <span className="text-sm text-amber-400 font-medium">{item.rating.toFixed(1)}</span>
                            </div>
                            {item.reviewCount && (
                              <span className="text-xs text-cream/60">({item.reviewCount} reviews)</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className={cn(
                      "text-cream/80 leading-relaxed",
                      viewMode === 'list' ? "text-sm line-clamp-2" : "text-sm line-clamp-3"
                    )}>
                      {item.description}
                    </p>

                    {/* Spice Level */}
                    {item.spiceLevel && item.spiceLevel > 0 && viewMode === 'grid' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-cream/60 font-medium">Heat Level:</span>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Flame 
                              key={i} 
                              className={cn(
                                "w-3 h-3 transition-all",
                                i < item.spiceLevel! 
                                  ? "text-red-500 fill-current" 
                                  : "text-cream/20"
                              )} 
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Price and Add Button */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-cream/10">
                      <div className="space-y-1">
                        <div className={cn(
                          "font-bold text-amber-400",
                          viewMode === 'list' ? "text-xl" : "text-2xl"
                        )}>
                          ₹{item.price}
                        </div>
                        {item.specialOfferText && (
                          <div className="text-xs text-red-400 font-medium">
                            {item.specialOfferText}
                          </div>
                        )}
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          onClick={(e) => addToCart(item, e)}
                          size={viewMode === 'list' ? "sm" : "default"}
                          className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-amber-400/50"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Mobile Safe Area */}
      <div className="h-16 md:h-0"></div>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <motion.button
              onClick={() => setShowCart(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative bg-gradient-to-r from-amber-600 to-amber-500 text-black p-4 rounded-full shadow-2xl hover:shadow-amber-500/50 transition-all duration-300"
            >
              <ShoppingCart className="w-6 h-6" />
              {getCartItemCount() > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
                >
                  {getCartItemCount()}
                </motion.div>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Modal */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="max-w-md bg-black/95 text-cream border-cream/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-serif">
              <ShoppingCart className="w-5 h-5 text-amber-400" />
              Your Cart ({getCartItemCount()} items)
            </DialogTitle>
          </DialogHeader>
          
          <div className="max-h-96 overflow-y-auto space-y-4">
            {cart.map((item) => (
              <motion.div
                key={item.id}
                layout
                className="flex items-center gap-4 p-4 bg-cream/5 rounded-xl border border-cream/10"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-amber-900/30 flex items-center justify-center">
                      <span className="text-2xl">🍽️</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-cream line-clamp-1">{item.name}</h4>
                  <p className="text-amber-400 font-bold">₹{item.price}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                    className="text-cream hover:text-amber-400 p-2"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addToCart(item)}
                    className="text-cream hover:text-amber-400 p-2"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteFromCart(item.id)}
                    className="text-red-400 hover:text-red-300 p-2 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="border-t border-cream/20 pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-amber-400">₹{calculateTotal()}</span>
            </div>
            <Button 
              onClick={handleProceedToCheckout}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-semibold"
            >
              Proceed to Checkout
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Item Details Modal */}
      <Dialog open={showItemDetails} onOpenChange={setShowItemDetails}>
        <DialogContent className="max-w-2xl bg-black/95 text-cream border-cream/20">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif text-amber-400">
                  {selectedItem.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Image */}
                <div className="aspect-video rounded-xl overflow-hidden">
                  {selectedItem.image ? (
                    <img
                      src={selectedItem.image}
                      alt={selectedItem.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-900/30 to-orange-900/30 flex items-center justify-center">
                      <span className="text-8xl opacity-60">🍽️</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <p className="text-cream/90 leading-relaxed text-lg">
                    {selectedItem.description}
                  </p>

                  {/* Price and Rating */}
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-amber-400">
                      ₹{selectedItem.price}
                    </div>
                    {selectedItem.rating && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <StarIcon className="w-5 h-5 text-amber-400 fill-current" />
                          <span className="text-lg font-semibold text-amber-400">
                            {selectedItem.rating.toFixed(1)}
                          </span>
                        </div>
                        {selectedItem.reviewCount && (
                          <span className="text-sm text-cream/60">
                            ({selectedItem.reviewCount} reviews)
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Prep Time and Spice Level */}
                  <div className="grid grid-cols-2 gap-4">
                    {selectedItem.preparationTime && (
                      <div className="flex items-center gap-2 text-cream/80">
                        <Timer className="w-5 h-5 text-amber-400" />
                        <span>Prep time: {selectedItem.preparationTime} mins</span>
                      </div>
                    )}
                    {selectedItem.spiceLevel && selectedItem.spiceLevel > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-cream/80">Heat Level:</span>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Flame 
                              key={i} 
                              className={cn(
                                "w-4 h-4 transition-all",
                                i < selectedItem.spiceLevel! 
                                  ? "text-red-500 fill-current" 
                                  : "text-cream/20"
                              )} 
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Ingredients */}
                  {selectedItem.ingredients && selectedItem.ingredients.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-cream">Ingredients:</h4>
                      <p className="text-cream/80 text-sm">
                        {selectedItem.ingredients.join(', ')}
                      </p>
                    </div>
                  )}

                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-cream/20">
                  <Button
                    onClick={() => handleToggleFavorite(selectedItem, {} as React.MouseEvent)}
                    variant="outline"
                    className="flex-1 border-cream/20 text-cream hover:bg-cream/10"
                  >
                    <Heart className={cn(
                      "w-4 h-4 mr-2",
                      isFavorite(selectedItem.id, 'menuItem') && "fill-current text-red-500"
                    )} />
                    {isFavorite(selectedItem.id, 'menuItem') ? 'Remove from Favorites' : 'Add to Favorites'}
                  </Button>
                  <Button
                    onClick={() => {
                      addToCart(selectedItem);
                      setShowItemDetails(false);
                    }}
                    className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Cart - ₹{selectedItem.price}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Menu;
