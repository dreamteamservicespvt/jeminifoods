import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Search, Filter, Star, Heart, Clock, Leaf, Flame, Zap, Users, 
  Award, Gift, ShoppingBag, ArrowRight, X, Plus, Grid3X3, List, 
  SlidersHorizontal, ChefHat, Coffee, Utensils, Eye, TrendingUp,
  MapPin, Timer, Sparkles, ThumbsUp, Camera, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { useFavorites } from '../hooks/useFavorites';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  dietary?: string[];
  allergens?: string[];
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

// Enhanced Category Configuration with better icons and descriptions
const categoryConfig = {
  all: { 
    title: 'All Dishes', 
    icon: Utensils, 
    emoji: '🍽️', 
    description: 'Explore our complete culinary collection',
    color: 'from-gray-500 to-gray-600'
  },
  starters: { 
    title: 'Appetizers', 
    icon: ChefHat, 
    emoji: '🥗', 
    description: 'Perfect beginnings to your culinary journey',
    color: 'from-emerald-500 to-teal-600'
  },
  'main course': { 
    title: 'Main Courses', 
    icon: Utensils, 
    emoji: '🍛', 
    description: 'Hearty dishes crafted to perfection',
    color: 'from-amber-500 to-orange-600'
  },
  desserts: { 
    title: 'Sweet Endings', 
    icon: Gift, 
    emoji: '🍰', 
    description: 'Indulgent treats to satisfy your sweet tooth',
    color: 'from-pink-500 to-rose-600'
  },
  beverages: { 
    title: 'Beverages', 
    icon: Coffee, 
    emoji: '🥤', 
    description: 'Refreshing drinks to complement your meal',
    color: 'from-blue-500 to-cyan-600'
  },
  "chef's specials": { 
    title: "Chef's Specials", 
    icon: Award, 
    emoji: '⭐', 
    description: 'Signature dishes from our master chefs',
    color: 'from-purple-500 to-indigo-600'
  },
};

// Enhanced Dietary Tags with better styling
const dietaryTags = {
  vegetarian: {
    icon: Leaf,
    bgColor: 'bg-emerald-500',
    textColor: 'text-white',
    borderColor: 'border-emerald-500'
  },
  vegan: {
    icon: Leaf,
    bgColor: 'bg-green-600',
    textColor: 'text-white',
    borderColor: 'border-green-600'
  },
  'gluten-free': {
    icon: Award,
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
    borderColor: 'border-blue-500'
  },
  spicy: {
    icon: Flame,
    bgColor: 'bg-red-500',
    textColor: 'text-white',
    borderColor: 'border-red-500'
  },
  healthy: {
    icon: Heart,
    bgColor: 'bg-pink-500',
    textColor: 'text-white',
    borderColor: 'border-pink-500'
  },
  quick: {
    icon: Zap,
    bgColor: 'bg-yellow-500',
    textColor: 'text-black',
    borderColor: 'border-yellow-500'
  }
};

const Menu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDietaryFilters, setSelectedDietaryFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'name' | 'newest' | 'popular'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
  const { isFavorite, addFavorite, removeFavorite, getFavoriteId } = useFavorites();
  
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);

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

  // Get available dietary filters based on menu items
  const getAvailableDietaryFilters = () => {
    const availableFilters = new Set<string>();
    
    menuItems.forEach(item => {
      if (item.dietary) {
        item.dietary.forEach(diet => availableFilters.add(diet));
      }
      if (item.featured) availableFilters.add('popular');
      if (item.specialOffer) availableFilters.add('special');
      if (item.preparationTime && item.preparationTime <= 15) availableFilters.add('quick');
    });
    
    return Array.from(availableFilters).filter(filter => dietaryTags[filter]);
  };

  // Enhanced filter and search logic
  const filteredItems = menuItems.filter(item => {
    // Category filter
    if (selectedCategory !== 'all') {
      if (selectedCategory === "chef's specials" && !item.featured) return false;
      if (selectedCategory !== "chef's specials" && item.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    }

    // Search filter (enhanced to include ingredients and dietary)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchableText = [
        item.name,
        item.description,
        ...(item.ingredients || []),
        ...(item.dietary || []),
        item.category
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(query)) return false;
    }

    // Dietary filters
    if (selectedDietaryFilters.length > 0) {
      return selectedDietaryFilters.every(filter => {
        switch (filter) {
          case 'popular':
            return item.featured;
          case 'special':
            return item.specialOffer;
          case 'quick':
            return item.preparationTime && item.preparationTime <= 15;
          default:
            return item.dietary?.includes(filter);
        }
      });
    }

    return true;
  });

  // Enhanced sort logic
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'popular':
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      case 'newest':
        return b.id.localeCompare(a.id);
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const handleToggleFavorite = async (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const isCurrentlyFavorite = isFavorite(item.id, 'menuItem');
    
    if (isCurrentlyFavorite) {
      const favoriteId = getFavoriteId(item.id, 'menuItem');
      if (favoriteId) {
        await removeFavorite(favoriteId);
      }
    } else {
      await addFavorite({
        id: item.id,
        name: item.name,
        description: item.description,
        imageUrl: item.image,
        type: 'menuItem'
      });
    }
  };

  const toggleDietaryFilter = (filterId: string) => {
    setSelectedDietaryFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedDietaryFilters([]);
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

  const activeFiltersCount = selectedDietaryFilters.length + (selectedCategory !== 'all' ? 1 : 0);

  // Enhanced Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            {/* Header Skeleton */}
            <div className="h-20 bg-black/20 rounded-3xl backdrop-blur-sm"></div>
            
            {/* Search Skeleton */}
            <div className="h-16 bg-black/20 rounded-2xl backdrop-blur-sm"></div>
            
            {/* Category Pills Skeleton */}
            <div className="flex gap-3 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 w-32 bg-black/20 rounded-full flex-shrink-0 backdrop-blur-sm"></div>
              ))}
            </div>
            
            {/* Menu Items Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-black/20 rounded-3xl backdrop-blur-sm overflow-hidden">
                  <div className="h-48 bg-black/30"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-black/30 rounded-lg"></div>
                    <div className="h-4 bg-black/30 rounded w-3/4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-6 w-16 bg-black/30 rounded-lg"></div>
                      <div className="h-10 w-24 bg-black/30 rounded-xl"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-cream">
      {/* Enhanced Header with Motion Effects */}
      <motion.div 
        className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-cream/10"
        style={{ opacity: headerOpacity }}
      >
        <div className="container mx-auto px-4 py-6">
          {/* Header Top */}
          <div className="flex items-center justify-between mb-6">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-serif font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                {getCurrentCategory().title}
              </h1>
              <p className="text-cream/80 mt-2 text-lg hidden md:block">
                {getCurrentCategory().description}
              </p>
            </motion.div>
            
            {/* Desktop Controls */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-2xl p-2 border border-cream/10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-3 rounded-xl transition-all",
                    viewMode === 'grid' 
                      ? "bg-amber-500 text-black shadow-lg" 
                      : "text-cream hover:text-amber-400 hover:bg-cream/5"
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-3 rounded-xl transition-all",
                    viewMode === 'list' 
                      ? "bg-amber-500 text-black shadow-lg" 
                      : "text-cream hover:text-amber-400 hover:bg-cream/5"
                  )}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="border-red-400/50 text-red-400 hover:bg-red-400/10 hover:border-red-400 rounded-xl px-4 py-2"
                >
                  Clear All ({activeFiltersCount})
                </Button>
              )}
            </div>
          </div>

          {/* Enhanced Search Bar */}
          <motion.div 
            className="relative mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cream/60 w-5 h-5 z-10" />
            <Input
              type="text"
              placeholder="Search for dishes, ingredients, or dietary preferences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={cn(
                "pl-12 pr-12 py-4 text-base rounded-2xl bg-black/30 backdrop-blur-sm border-cream/20 text-cream placeholder:text-cream/60",
                "focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 focus:bg-black/40",
                "transition-all duration-300 shadow-lg",
                isSearchFocused && "shadow-2xl shadow-amber-500/10 ring-4 ring-amber-500/20"
              )}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cream/60 hover:text-cream p-2 rounded-lg"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced Category Pills */}
      <div className="bg-black/40 backdrop-blur-sm border-b border-cream/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {Object.keys(categoryConfig).map((category) => {
              const categoryInfo = categoryConfig[category as keyof typeof categoryConfig];
              const itemCount = getItemCount(category);
              const IconComponent = categoryInfo.icon;
              
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
                    <span className="text-lg">{categoryInfo.emoji}</span>
                  ) : (
                    <IconComponent className="w-4 h-4" />
                  )}
                  <span className="capitalize">{category === "chef's specials" ? "Chef's Specials" : category}</span>
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

      {/* Enhanced Filters Section */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-cream/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-cream/70" />
              <span className="text-sm font-medium text-cream">Dietary Preferences</span>
              {selectedDietaryFilters.length > 0 && (
                <Badge className="bg-amber-500 text-black text-xs">
                  {selectedDietaryFilters.length} active
                </Badge>
              )}
            </div>
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="text-amber-400 hover:text-amber-300 text-sm"
              >
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            )}
          </div>
          
          <AnimatePresence>
            <motion.div 
              className={cn(
                "flex gap-2 overflow-x-auto scrollbar-hide transition-all",
                isMobile && !showFilters && "h-0 overflow-hidden opacity-0"
              )}
              initial={isMobile ? { height: 0, opacity: 0 } : {}}
              animate={isMobile ? { height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 } : {}}
              exit={isMobile ? { height: 0, opacity: 0 } : {}}
            >
              {getAvailableDietaryFilters().map((filter) => {
                const isSelected = selectedDietaryFilters.includes(filter);
                const tagInfo = dietaryTags[filter];
                const IconComponent = tagInfo.icon;
                
                return (
                  <motion.button
                    key={filter}
                    onClick={() => toggleDietaryFilter(filter)}
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap touch-manipulation border",
                      isSelected
                        ? `${tagInfo.bgColor} ${tagInfo.textColor} ${tagInfo.borderColor} shadow-lg shadow-current/25`
                        : "bg-black/30 backdrop-blur-sm text-cream border-cream/20 hover:bg-black/50 hover:border-cream/40"
                    )}
                  >
                    <IconComponent className="w-3 h-3" />
                    <span className="capitalize">{filter}</span>
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Results Summary and Sort */}
      <div className="bg-black/10 backdrop-blur-sm border-b border-cream/5">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.p 
              className="text-cream/80 text-sm"
              key={sortedItems.length}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span className="font-semibold text-amber-400">{sortedItems.length}</span> 
              {sortedItems.length === 1 ? ' dish' : ' dishes'} found
              {selectedCategory !== 'all' && (
                <span> in {getCurrentCategory().title}</span>
              )}
            </motion.p>
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm bg-black/30 backdrop-blur-sm border border-cream/20 rounded-xl px-4 py-2 text-cream focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400"
              >
                <option value="name" className="bg-black text-cream">Sort by Name</option>
                <option value="price" className="bg-black text-cream">Sort by Price</option>
                <option value="rating" className="bg-black text-cream">Sort by Rating</option>
                <option value="popular" className="bg-black text-cream">Sort by Popular</option>
                <option value="newest" className="bg-black text-cream">Sort by Newest</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Menu Items */}
      <div className="container mx-auto px-4 py-8">
        {sortedItems.length === 0 ? (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-32 h-32 mx-auto mb-8 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-cream/10">
              <Search className="w-16 h-16 text-cream/40" />
            </div>
            <h3 className="text-2xl font-serif font-semibold text-cream mb-4">No dishes found</h3>
            <p className="text-cream/70 mb-8 max-w-md mx-auto text-lg leading-relaxed">
              We couldn't find any dishes matching your criteria. Try adjusting your filters or search terms.
            </p>
            <Button 
              onClick={clearAllFilters} 
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-medium px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <X className="w-4 h-4 mr-2" />
              Clear all filters
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            className={cn(
              "grid gap-8 transition-all duration-500",
              viewMode === 'grid' 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
                    duration: 0.5, 
                    delay: Math.min(index * 0.1, 0.5),
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onHoverStart={() => setHoveredItem(item.id)}
                  onHoverEnd={() => setHoveredItem(null)}
                  className={cn(
                    "bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden group border border-cream/10",
                    "hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 cursor-pointer",
                    viewMode === 'list' && "flex flex-row max-h-40"
                  )}
                >
                  {/* Enhanced Image Container */}
                  <div className={cn(
                    "relative overflow-hidden",
                    viewMode === 'grid' ? "h-56" : "w-40 h-40 flex-shrink-0"
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
                          transition={{ duration: 0.5 }}
                        >
                          🍽️
                        </motion.span>
                      </div>
                    )}
                    
                    {/* Enhanced Favorite Button */}
                    <motion.button
                      onClick={(e) => handleToggleFavorite(item, e)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={cn(
                        "absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-sm border",
                        isFavorite(item.id, 'menuItem')
                          ? "bg-red-500/90 text-white border-red-400 shadow-lg shadow-red-500/25"
                          : "bg-black/50 text-white border-white/20 hover:bg-black/70 hover:border-white/40"
                      )}
                    >
                      <Heart className={cn(
                        "w-5 h-5 transition-all",
                        isFavorite(item.id, 'menuItem') && "fill-current scale-110"
                      )} />
                    </motion.button>

                    {/* Enhanced Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {item.specialOffer && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg"
                        >
                          <Gift className="w-3 h-3" />
                          <span>Special</span>
                        </motion.div>
                      )}
                      {item.featured && (
                        <motion.div
                          initial={{ scale: 0, rotate: 180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="flex items-center gap-1 bg-amber-500 text-black px-2 py-1 rounded-full text-xs font-semibold shadow-lg"
                        >
                          <Star className="w-3 h-3" />
                          <span>Popular</span>
                        </motion.div>
                      )}
                      {item.preparationTime && item.preparationTime <= 15 && (
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg"
                        >
                          <Zap className="w-3 h-3" />
                          <span>Quick</span>
                        </motion.div>
                      )}
                    </div>

                    {/* Preparation Time */}
                    {item.preparationTime && viewMode === 'grid' && (
                      <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs">
                        <Clock className="w-3 h-3" />
                        <span>{item.preparationTime} min</span>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Content */}
                  <div className={cn(
                    "p-6 flex flex-col",
                    viewMode === 'list' ? "flex-1 justify-between py-4" : "space-y-4"
                  )}>
                    <div className={cn(viewMode === 'list' ? "space-y-1" : "space-y-3")}>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={cn(
                          "font-serif font-bold text-cream line-clamp-2 group-hover:text-amber-400 transition-colors leading-tight",
                          viewMode === 'list' ? "text-lg" : "text-xl"
                        )}>
                          {item.name}
                        </h3>
                        {item.rating && viewMode === 'grid' && (
                          <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-1 rounded-full">
                            <Star className="w-3 h-3 text-amber-400 fill-current" />
                            <span className="text-xs text-amber-400 font-medium">{item.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      
                      <p className={cn(
                        "text-cream/80 leading-relaxed",
                        viewMode === 'list' ? "text-sm line-clamp-2" : "text-sm line-clamp-3"
                      )}>
                        {item.description}
                      </p>

                      {/* Spice Level Indicator */}
                      {item.spiceLevel && item.spiceLevel > 0 && viewMode === 'grid' && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-cream/60">Spice:</span>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Flame 
                                key={i} 
                                className={cn(
                                  "w-3 h-3",
                                  i < item.spiceLevel! 
                                    ? "text-red-500 fill-current" 
                                    : "text-cream/20"
                                )} 
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Dietary Tags */}
                    {item.dietary && item.dietary.length > 0 && viewMode === 'grid' && (
                      <div className="flex flex-wrap gap-2">
                        {item.dietary.slice(0, 3).map((diet) => {
                          const tagInfo = dietaryTags[diet];
                          if (!tagInfo) return null;
                          
                          const IconComponent = tagInfo.icon;
                          return (
                            <Badge
                              key={diet}
                              className={cn(
                                "text-xs font-medium border",
                                `${tagInfo.bgColor}/20 ${tagInfo.textColor.replace('text-white', 'text-cream')} ${tagInfo.borderColor}/30`
                              )}
                            >
                              <IconComponent className="w-3 h-3 mr-1" />
                              {diet}
                            </Badge>
                          );
                        })}
                        {item.dietary.length > 3 && (
                          <Badge variant="outline" className="text-xs text-cream/60 border-cream/20">
                            +{item.dietary.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Enhanced Price and Add Button */}
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div className="space-y-1">
                        <div className={cn(
                          "font-bold text-amber-400",
                          viewMode === 'list' ? "text-lg" : "text-2xl"
                        )}>
                          ₹{item.price}
                        </div>
                        {item.specialOfferText && (
                          <div className="text-xs text-red-400 font-medium">
                            {item.specialOfferText}
                          </div>
                        )}
                        {item.reviewCount && (
                          <div className="text-xs text-cream/60">
                            {item.reviewCount} review{item.reviewCount !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          size={viewMode === 'list' ? "sm" : "default"}
                          className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                        >
                          <Plus className="w-4 h-4 mr-1" />
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
    </div>
  );
};

export default Menu;
