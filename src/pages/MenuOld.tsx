import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Filter, Star, Utensils, ChevronRight, Gift, Clock, Coffee, 
         Leaf, Flame, Search, ChevronsDown, Sparkles, Salad, Heart, 
         ShoppingBag, Eye, ArrowUpRight, Zap, Plus, Users, Award, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useInView } from 'react-intersection-observer';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { useFavorites } from '../hooks/useFavorites';
import FavoriteButton from '../components/favorites/FavoriteButton';
import MobileMenuHeader from '@/components/menu/MobileMenuHeader';
import { formatPrice } from '../contexts/CartContext';

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
}

// Function to toggle favorite status
const MenuItemFavoriteToggle = ({ item }: { item: MenuItem }) => {
  const { isFavorite, addFavorite, removeFavorite, getFavoriteId } = useFavorites();
  
  const handleToggleFavorite = async (e: React.MouseEvent) => {
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
  
  const isFav = isFavorite(item.id, 'menuItem');
  
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleToggleFavorite}
      className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center ${
        isFav 
          ? 'bg-red-500 text-white' 
          : 'bg-black/50 backdrop-blur-sm text-white hover:bg-black/70'
      }`}
    >
      <Heart className={`w-5 h-5 ${isFav ? 'fill-white' : ''}`} />
    </motion.button>
  );
}

// Enhanced category config with beautiful descriptions and gradients
const categoryConfig = {
  all: {
    title: "All Dishes",
    description: "Discover our complete culinary collection",
    icon: <Utensils className="w-5 h-5" />,
    gradient: "from-amber-500 to-orange-500",
    count: 0
  },
  starters: {
    title: "Starters",
    description: "Elegant beginnings to awaken your palate",
    icon: <Salad className="w-5 h-5" />,
    gradient: "from-emerald-500 to-teal-500",
    count: 0
  },  "main course": {
    title: "Main Course",
    description: "Masterfully crafted signature dishes",
    icon: <Utensils className="w-5 h-5" />,
    gradient: "from-red-500 to-pink-500", 
    count: 0
  },
  desserts: {
    title: "Desserts",
    description: "Sweet symphonies to complete your journey",
    icon: <Gift className="w-5 h-5" />,
    gradient: "from-purple-500 to-violet-500",
    count: 0
  },
  beverages: {
    title: "Beverages",
    description: "Crafted drinks and signature cocktails",
    icon: <Coffee className="w-5 h-5" />,
    gradient: "from-blue-500 to-cyan-500",
    count: 0
  },
  "chef's specials": {
    title: "Chef's Specials",
    description: "Exclusive creations from our master chef",
    icon: <Sparkles className="w-5 h-5" />,
    gradient: "from-amber-400 to-yellow-500",
    count: 0
  }
};

// Enhanced dietary tags with beautiful styling
const dietaryTags = {
  vegan: { 
    icon: <Leaf className="w-3 h-3" />, 
    label: "Vegan", 
    color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50",
    hoverColor: "hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
  },
  vegetarian: { 
    icon: <Leaf className="w-3 h-3" />, 
    label: "Vegetarian", 
    color: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/50",
    hoverColor: "hover:bg-green-200 dark:hover:bg-green-900/50"
  },
  "gluten-free": { 
    icon: <Star className="w-3 h-3" />, 
    label: "Gluten Free", 
    color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50",
    hoverColor: "hover:bg-amber-200 dark:hover:bg-amber-900/50"
  },
  spicy: { 
    icon: <Flame className="w-3 h-3" />, 
    label: "Spicy", 
    color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50",
    hoverColor: "hover:bg-red-200 dark:hover:bg-red-900/50"
  },
  "limited-time": { 
    icon: <Clock className="w-3 h-3" />, 
    label: "Limited Time", 
    color: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700/50",
    hoverColor: "hover:bg-purple-200 dark:hover:bg-purple-900/50"
  },
  "low-calorie": {
    icon: <Heart className="w-3 h-3" />,
    label: "Low Calorie",
    color: "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700/50",
    hoverColor: "hover:bg-pink-200 dark:hover:bg-pink-900/50"
  }
};

const Menu = () => {  // State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDietary, setSelectedDietary] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(['all']);
  const [loading, setLoading] = useState(true);  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [scrolledPast, setScrolledPast] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Refs
  const heroRef = useRef<HTMLDivElement>(null);
  const filterBarRef = useRef<HTMLDivElement>(null);
  
  // Responsive media query
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Scroll animations
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.9]);
  const heroY = useTransform(scrollY, [0, 300], [0, -50]);
  
  // Intersection observers for filter bar
  const [filterBarRef2, filterBarInView] = useInView({
    threshold: 0
  });
  
  // Load menu items from Firebase
  useEffect(() => {
    // Modify the query to avoid the composite index requirement
    // We'll fetch all visible items first, then sort them in memory
    const menuQuery = query(
      collection(db, 'menuItems'),
      where('visibility', '!=', false)
    );
    
    const unsubscribe = onSnapshot(menuQuery, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuItem[];
      
      // Sort items in memory instead of using orderBy in the query
      const sortedItems = items.sort((a, b) => {
        // First sort by category
        const categoryCompare = a.category.localeCompare(b.category);
        if (categoryCompare !== 0) return categoryCompare;
        
        // Then sort by name
        return a.name.localeCompare(b.name);
      });
      
      setMenuItems(sortedItems);
      
      // Extract unique categories including "all" and "chef's specials"
      const categorySet = new Set(items.map(item => item.category.toLowerCase()));
      const uniqueCategories = ['all', ...Array.from(categorySet)];
      
      // If there are featured items, add chef's specials
      if (items.some(item => item.featured)) {
        uniqueCategories.push("chef's specials");
      }
      
      setCategories(uniqueCategories);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Filter menu items when selection changes
  useEffect(() => {
    let result = [...menuItems];
    
    // Apply category filter
    if (selectedCategory === "chef's specials") {
      result = result.filter(item => item.featured);
    } else if (selectedCategory !== 'all') {
      result = result.filter(item => 
        item.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Apply dietary filter
    if (selectedDietary) {
      result = result.filter(item => 
        item.dietary?.some(tag => 
          tag.toLowerCase() === selectedDietary.toLowerCase()
        )
      );
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query) ||
        item.ingredients?.some(ingredient => 
          ingredient.toLowerCase().includes(query)
        )
      );
    }
    
    setFilteredItems(result);
  }, [selectedCategory, selectedDietary, searchQuery, menuItems]);

  // Listen to scroll events to make filter bar sticky
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const { bottom } = heroRef.current.getBoundingClientRect();
        setScrolledPast(bottom <= 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle filter selection
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setExpandedItem(null);
  };
  
  const handleDietaryChange = (tag: string) => {
    setSelectedDietary(selectedDietary === tag ? null : tag);
    setExpandedItem(null);
  };

  // Handle item expansion for detail view
  const toggleItemExpansion = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  // Get current category config
  const getCurrentCategory = () => {
    return categoryConfig[selectedCategory as keyof typeof categoryConfig] || 
           categoryConfig.all;
  };
    // Render dietary tags for menu items - enhanced for mobile
  const renderDietaryTags = (dietaryArray?: string[]) => {
    if (!dietaryArray || dietaryArray.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {dietaryArray.map(tag => {
          const dietaryInfo = dietaryTags[tag.toLowerCase() as keyof typeof dietaryTags];
          if (!dietaryInfo) return null;
          
          return (
            <Badge 
              key={tag}
              variant="outline"
              className={cn(
                isMobile 
                  ? "text-[10px] px-1.5 py-0 h-4 font-normal" 
                  : "text-xs px-2 py-0 h-5 font-normal", 
                dietaryInfo.color
              )}
            >
              {dietaryInfo.icon}
              <span className="ml-1">{dietaryInfo.label}</span>
            </Badge>
          );
        })}
      </div>
    );
  };

  // Get the available dietary filters from the current filtered items
  const getAvailableDietaryFilters = () => {
    const allTags = new Set<string>();
    
    menuItems.forEach(item => {
      if (item.dietary) {
        item.dietary.forEach(tag => allTags.add(tag.toLowerCase()));
      }
    });
    
    return Array.from(allTags);
  };
  // Render loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal">
        {/* Hero Skeleton */}
        <div className="relative h-[80vh] md:h-[90vh] bg-black flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-charcoal"></div>
          <div className="container mx-auto px-4 sm:px-6 z-10 text-center">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="space-y-6"
            >
              <Skeleton className="h-20 w-96 mx-auto bg-amber-600/10 rounded-xl" />
              <Skeleton className="h-1 w-48 mx-auto bg-amber-600/20" />
              <Skeleton className="h-6 w-[500px] mx-auto bg-amber-600/10 rounded-lg" />
              <Skeleton className="h-12 w-48 mx-auto bg-amber-600/10 rounded-full" />
            </motion.div>
          </div>
        </div>
        
        {/* Filter Bar Skeleton */}
        <div className="py-8 bg-charcoal/95">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="space-y-6">
              <Skeleton className="h-10 w-64 bg-amber-600/10 rounded-xl" />
              <div className="flex flex-wrap gap-3">
                {Array(6).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-40 bg-amber-600/10 rounded-2xl" />
                ))}
              </div>
              <Skeleton className="h-12 w-full max-w-md bg-amber-600/10 rounded-xl" />
            </div>
          </div>
        </div>
        
        {/* Grid Skeleton */}
        <div className="container mx-auto px-4 sm:px-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {Array(12).fill(0).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-black/30 rounded-2xl overflow-hidden border border-amber-600/10"
              >
                <Skeleton className="h-48 sm:h-56 w-full bg-amber-600/10" />
                <div className="p-4 sm:p-6 space-y-3">
                  <Skeleton className="h-6 w-3/4 bg-amber-600/10 rounded-lg" />
                  <Skeleton className="h-4 w-full bg-amber-600/10 rounded" />
                  <Skeleton className="h-4 w-2/3 bg-amber-600/10 rounded" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-5 w-16 bg-amber-600/10 rounded-full" />
                    <Skeleton className="h-5 w-20 bg-amber-600/10 rounded-full" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-charcoal overflow-x-hidden">
      {/* Hero Section with Parallax */}
      <motion.div 
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="relative h-[80vh] md:h-[90vh] bg-black flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Exquisite fine dining cuisine"
            className="w-full h-full object-cover object-center opacity-60"
            style={{ objectPosition: 'center center' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-charcoal/90"></div>
          
          {/* Floating particles animation */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-amber-400/30 rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 10,
                }}
                animate={{
                  y: -10,
                  x: Math.random() * window.innerWidth,
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600/20 backdrop-blur-sm rounded-full border border-amber-400/30 mb-6">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-sm font-medium">Michelin Recommended</span>
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-amber-400 mb-6 leading-tight"
          >
            Culinary
            <br />
            <span className="text-cream italic">Excellence</span>
          </motion.h1>
          
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "200px" }}
            transition={{ duration: 1.2, delay: 0.8 }}
            className="h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"
          />
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-lg sm:text-xl md:text-2xl text-cream/90 max-w-4xl mx-auto leading-relaxed mb-12"
          >
            Experience a symphony of flavors crafted with passion, precision, and the finest ingredients sourced from around the world
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              onClick={() => {
                const filterElement = filterBarRef.current;
                if (filterElement) {
                  filterElement.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-amber-600 hover:bg-amber-700 text-black px-8 py-4 text-lg font-semibold group rounded-full transition-all duration-300 shadow-lg hover:shadow-amber-600/25"
            >
              Explore Our Menu
              <ChevronsDown className="ml-2 w-5 h-5 group-hover:animate-bounce" />
            </Button>
            
            <div className="flex items-center gap-4 text-cream/70 text-sm">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>180+ Dishes</span>
              </div>
              <div className="w-1 h-1 bg-cream/30 rounded-full"></div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>Chef's Specials</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>      {/* Filter Bar - reduced vertical spacing for mobile */}
      <div 
        ref={filterBarRef}
        className="py-3 md:py-8 bg-charcoal/95 backdrop-blur-sm relative z-20 border-t border-amber-600/10"
      >
        {/* Sticky Filter Bar */}
        <div 
          ref={filterBarRef2}
          className={cn(
            "transition-all duration-300",
            scrolledPast && !filterBarInView ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >          <div 
            className={cn(
              "fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-amber-600/20 py-2 px-3 sm:px-6 z-50 transition-transform duration-300 shadow-lg",
              scrolledPast && !filterBarInView ? "translate-y-0" : "-translate-y-full"
            )}
          >
            <div className="container mx-auto flex justify-between items-center">
              <h2 className="text-amber-400 font-serif text-lg sm:text-xl hidden md:block">
                {getCurrentCategory().title}
              </h2>
              
              {/* Mobile & Desktop Category Pills - modernized */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 max-w-[75vw] sm:max-w-[70vw] md:max-w-none">
                {categories.map((category) => {
                  const categoryInfo = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.all;
                  
                  return (
                    <motion.button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "px-3 sm:px-4 py-1.5 whitespace-nowrap text-xs sm:text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-1.5",
                        selectedCategory === category
                          ? "bg-amber-600 text-black shadow-sm"
                          : "bg-black/40 text-cream/90 border border-cream/10 hover:bg-amber-600/20 hover:border-amber-600/40"
                      )}
                    >
                      <span className="text-xs sm:text-sm">{categoryInfo.icon}</span>
                      <span className="font-medium">
                        {categoryInfo.title}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
              
              {/* Search Input - Desktop Only */}
              <div className="relative w-48 hidden lg:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" size={16} />
                <Input
                  type="text"
                  placeholder="Search dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-black/30 border-amber-600/30 text-cream rounded-full h-9 focus:ring-1 focus:ring-amber-400 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6">
          {/* Category Filter Pills - Main */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-amber-400 mb-4 text-center md:text-left">
              {getCurrentCategory().title}
            </h2>            {/* Mobile Header Component */}
            <MobileMenuHeader
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              categories={categories}
              categoryConfig={categoryConfig}
              handleCategoryChange={handleCategoryChange}
              selectedDietary={selectedDietary}
              handleDietaryChange={handleDietaryChange}
              getAvailableDietaryFilters={getAvailableDietaryFilters}
              dietaryTags={dietaryTags}
              filteredItems={filteredItems}
              viewMode={viewMode}
              setViewMode={setViewMode}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
            />
            
            <p className="text-cream/80 text-center md:text-left mb-4 max-w-2xl hidden md:block text-sm md:text-base">
              {getCurrentCategory().description}
            </p>
            
            {/* Desktop view - original category cards layout */}
            <div className="hidden md:flex flex-wrap justify-center md:justify-start gap-3 mb-6">
              {categories.map((category) => {
                const categoryInfo = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.all;
                const itemCount = category === 'all' ? menuItems.length :
                  category === "chef's specials" ? menuItems.filter(item => item.featured).length :
                  menuItems.filter(item => item.category.toLowerCase() === category.toLowerCase()).length;
                
                return (
                  <motion.button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "group relative px-4 sm:px-6 py-3 sm:py-4 rounded-2xl transition-all duration-300 flex items-center gap-3 border-2 min-w-[140px] sm:min-w-[160px]",
                      selectedCategory === category
                        ? "bg-gradient-to-r from-amber-600 to-amber-500 text-black border-amber-400 shadow-xl shadow-amber-600/25"
                        : "bg-black/30 backdrop-blur-sm text-cream border-cream/20 hover:bg-black/50 hover:border-amber-600/40"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-full transition-all duration-300",
                      selectedCategory === category 
                        ? "bg-black/10" 
                        : "bg-amber-600/20 group-hover:bg-amber-600/30"
                    )}>
                      {React.cloneElement(categoryInfo.icon, {
                        className: cn(
                          "w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300",
                          selectedCategory === category ? "text-black" : "text-amber-400"
                        )
                      })}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm sm:text-base capitalize">
                        {categoryInfo.title}
                      </div>
                      <div className={cn(
                        "text-xs opacity-75",
                        selectedCategory === category ? "text-black/70" : "text-cream/60"
                      )}>
                        {itemCount} items
                      </div>
                    </div>
                    
                    {selectedCategory === category && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-500 rounded-2xl -z-10"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
          
          {/* Search and Dietary Filters */}          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start lg:items-center mb-6">            {/* Enhanced Search Bar - Desktop only */}
            <div className="relative flex-1 max-w-lg hidden md:block">
              <motion.div
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-400"
                animate={{ 
                  scale: searchQuery ? 1.1 : 1,
                  rotate: searchQuery ? 90 : 0 
                }}
                transition={{ duration: 0.2 }}
              >
                <Search size={20} />
              </motion.div>
              <Input
                type="text"
                placeholder="Search dishes, ingredients, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 pr-12 py-4 bg-black/40 backdrop-blur-md border-amber-600/40 text-cream rounded-2xl focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/60 placeholder:text-cream/50 transition-all duration-300 text-base"
              />
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="h-9 w-9 p-0 text-cream/60 hover:text-cream hover:bg-amber-600/20 rounded-full transition-all duration-200"
                  >
                    <motion.div
                      whileHover={{ rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      Ã—
                    </motion.div>
                  </Button>
                </motion.div>
              )}
            </div>
            {/* Dietary Filter Pills - Only show if dietary options are available */}
            {getAvailableDietaryFilters().length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-amber-400 text-sm font-medium flex items-center gap-2 mr-2">
                  <Filter size={16} />
                  Dietary:
                </span>
                
                {getAvailableDietaryFilters().map(tag => {
                  const dietaryInfo = dietaryTags[tag as keyof typeof dietaryTags];
                  if (!dietaryInfo) return null;
                  
                  return (
                    <motion.button
                      key={tag}
                      onClick={() => handleDietaryChange(tag)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap",
                        selectedDietary === tag
                          ? "bg-amber-600 text-black border-amber-600 shadow-md"
                          : "bg-black/20 border-cream/20 text-cream/80 hover:bg-black/40 hover:border-amber-600/40"
                      )}
                    >
                      {React.cloneElement(dietaryInfo.icon, {
                        className: "w-3 h-3"
                      })}
                      <span>{dietaryInfo.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
            {/* Results Summary - Desktop only */}
          <div className="hidden md:flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 py-4 px-4 bg-black/20 backdrop-blur-sm rounded-xl border border-amber-600/10">
            <div className="text-cream/80">
              <span className="text-lg font-semibold text-amber-400">{filteredItems.length}</span>
              <span className="ml-2">
                {filteredItems.length === 1 ? 'dish' : 'dishes'} found
              </span>
              {(selectedCategory !== 'all' || selectedDietary || searchQuery) && (
                <span className="text-cream/60 text-sm ml-2">
                  â€¢ Filtered results
                </span>
              )}
            </div>
            
            {(selectedCategory !== 'all' || selectedDietary || searchQuery) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedDietary(null);
                  setSearchQuery('');
                }}
                className="bg-transparent border-amber-600/30 text-amber-400 hover:bg-amber-600/10 hover:border-amber-600/50"
              >
                Clear all filters
              </Button>
            )}
          </div>
            {/* Mobile Clear Filters button - redesigned for better visibility and touch target */}
          {(selectedCategory !== 'all' || selectedDietary || searchQuery) && (
            <div className="md:hidden mb-5">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedDietary(null);
                  setSearchQuery('');
                }}
                className="flex items-center justify-center gap-2 bg-amber-600/10 border border-amber-600/20 text-amber-400 font-medium py-2 px-4 h-10 rounded-lg w-full shadow-sm"
              >
                <X size={16} />
                Clear all filters
              </motion.button>
            </div>
          )}
        </div>
      </div>        {/* Menu Items Grid - optimized spacing for mobile */}
      <div className="container mx-auto px-3 sm:px-6 pb-16 md:pb-20">        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedCategory}-${selectedDietary}-${searchQuery}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
              duration: 0.3, 
              type: "spring", 
              stiffness: 300, 
              damping: 25 
            }}
          >            {filteredItems.length > 0 ? (
              <div className={cn(
                "gap-3 sm:gap-4 md:gap-6 lg:gap-8",
                isMobile && viewMode === 'list' 
                  ? "space-y-3" 
                  : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
              )}>
                {filteredItems.map((item, index) => {
                  const isExpanded = expandedItem === item.id;
                  
                  return (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      index={index}
                      isExpanded={isExpanded}
                      onExpand={() => toggleItemExpansion(item.id)}
                      renderDietaryTags={renderDietaryTags}
                      isMobile={isMobile}
                      viewMode={isMobile ? viewMode : 'grid'}
                    />
                  );
                })}              </div>
            ) : (
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
                  We couldn't find any menu items matching your current filters.
                  <br />
                  <span className="text-amber-400/80">Try adjusting your search or explore our other categories.</span>
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                  <Button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedDietary(null);
                      setSearchQuery('');
                    }}
                    className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black px-8 py-4 font-semibold rounded-xl shadow-xl hover:shadow-amber-600/30 transition-all duration-300 transform hover:scale-105"
                  >
                    <Utensils className="w-5 h-5 mr-2" />
                    View All Items
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategory("chef's specials");
                      setSelectedDietary(null);
                      setSearchQuery('');
                    }}
                    className="bg-transparent border-amber-600/30 text-amber-400 hover:bg-amber-600/10 hover:border-amber-600/50 px-8 py-3 rounded-xl"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Chef's Specials                  </Button>
                </motion.div>
                
                {/* Popular suggestions */}
                <div className="mt-12 max-w-2xl mx-auto">
                  <p className="text-cream/60 text-sm mb-4">Popular searches:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Biryani', 'Pasta', 'Dessert', 'Vegan', 'Seafood'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setSearchQuery(suggestion)}
                        className="px-3 py-1.5 bg-black/20 border border-cream/10 rounded-full text-cream/70 text-sm hover:bg-amber-600/10 hover:border-amber-600/30 hover:text-amber-400 transition-all duration-300"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Menu Item Card Component
interface MenuItemCardProps {
  item: MenuItem;
  index: number;
  isExpanded: boolean;
  onExpand: () => void;
  renderDietaryTags: (dietary?: string[]) => JSX.Element | null;
  isMobile: boolean;
  viewMode?: 'grid' | 'list';
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ 
  item, index, isExpanded, onExpand, renderDietaryTags, isMobile, viewMode = 'grid'
}) => {
  const [cardRef, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // List view for mobile
  if (isMobile && viewMode === 'list') {
    return (
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, x: -30 }}
        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
        transition={{ 
          duration: 0.4, 
          delay: Math.min(index * 0.05, 0.3),
          type: "spring",
          stiffness: 200,
          damping: 25
        }}
        className="group relative bg-black/40 backdrop-blur-sm border border-amber-600/20 rounded-2xl overflow-hidden hover:border-amber-600/40 transition-all duration-300"
      >
        <div className="flex items-center gap-4 p-4">
          {/* Image */}
          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative bg-black/60">
            {item.image ? (
              <>
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-amber-400/10 animate-pulse" />
                )}
                <img 
                  src={item.image} 
                  alt={item.name}
                  onLoad={() => setImageLoaded(true)}
                  className={cn(
                    "w-full h-full object-cover transition-all duration-300",
                    imageLoaded ? "opacity-100" : "opacity-0"
                  )}
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Utensils className="text-amber-400/40" size={24} />
              </div>
            )}
            
            {/* Badges */}
            {(item.featured || item.specialOffer) && (
              <div className="absolute -top-1 -right-1">
                {item.featured && (
                  <div className="bg-amber-600 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    â˜…
                  </div>
                )}
                {item.specialOffer && (
                  <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    !
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-amber-400 text-sm leading-tight truncate">
                  {item.name}
                </h3>
                <p className="text-cream/70 text-xs mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
                
                {/* Dietary tags - compact */}
                {item.dietary && item.dietary.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {item.dietary.slice(0, 2).map(tag => {
                      const dietaryInfo = dietaryTags[tag.toLowerCase() as keyof typeof dietaryTags];
                      if (!dietaryInfo) return null;
                      
                      return (
                        <Badge 
                          key={tag}
                          variant="outline"
                          className="text-[9px] px-1.5 py-0 h-4 bg-black/20 border-amber-600/30 text-amber-400"
                        >
                          {React.cloneElement(dietaryInfo.icon, { className: "w-2.5 h-2.5" })}
                        </Badge>
                      );
                    })}
                    {item.dietary.length > 2 && (
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-black/20 border-cream/20 text-cream/60">
                        +{item.dietary.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Price and Actions */}
              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <div className="text-amber-400 font-bold text-base">
                    {formatPrice(item.price)}
                  </div>
                  {item.variations && item.variations.length > 1 && (
                    <div className="text-cream/60 text-xs">
                      from {formatPrice(Math.min(...item.variations.map(v => v.price)))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <FavoriteButton 
                    itemId={item.id}
                    itemType="menuItem"
                    itemData={{
                      name: item.name,
                      description: item.description,
                      imageUrl: item.image
                    }}
                    className="w-7 h-7 text-xs"
                  />
                  
                  <Button
                    size="sm"
                    onClick={() => onExpand()}
                    className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-600/40 rounded-lg w-7 h-7 p-0"
                  >
                    <Eye size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view (default for desktop and mobile grid mode)
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 60, scale: 0.9 }}
      transition={{ 
        duration: 0.6, 
        delay: Math.min(index * 0.1, 0.8),
        type: "spring",
        stiffness: 100,
        damping: 20
      }}
      whileHover={!isMobile && !isExpanded ? { 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.3, type: "spring", stiffness: 400 } 
      } : {}}      
      layout
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}      
      className={cn(
        "group relative bg-gradient-to-br from-black/70 via-black/50 to-black/70 backdrop-blur-lg",
        "border border-amber-600/30 overflow-hidden",
        "transition-all duration-300 ease-out cursor-pointer",
        "hover:border-amber-600/50 hover:shadow-xl hover:shadow-amber-600/20",
        "active:scale-[0.98] touch-manipulation",
        "focus:outline-none focus:ring-2 focus:ring-amber-400/50",
        isMobile ? "rounded-2xl" : "rounded-3xl", 
        isExpanded && "col-span-full lg:col-span-2 xl:col-span-3 row-span-2"
      )}      onClick={() => !isExpanded && onExpand()}
    >
      {/* Premium Badge */}
      {item.featured && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute top-4 left-4 z-20"
        >
          <div className="bg-gradient-to-r from-amber-600 to-yellow-500 text-black px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
            <Sparkles className="w-3 h-3" />
            Chef's Special
          </div>
        </motion.div>
      )}
        
      {/* Special Offer Badge */}
      {item.specialOffer && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="absolute top-4 right-4 z-20"
        >
          <div className="bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
            <Zap className="w-3 h-3" />
            Limited Time
          </div>
        </motion.div>
      )}
      
      {/* Favorite Button */}
      <FavoriteButton 
        itemId={item.id}
        itemType="menuItem"
        itemData={{
          name: item.name,
          description: item.description,
          imageUrl: item.image
        }}
        className={item.featured || item.specialOffer ? "top-14 right-3" : ""}
      />      

      {/* Image Section */}
      <div className={cn(
        "relative overflow-hidden",
        isExpanded ? "h-80 sm:h-96" : isMobile ? "h-48" : "h-52 sm:h-64"
      )}>
        {item.image ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-amber-400/10 animate-pulse" />
            )}
            
            <motion.img 
              src={item.image} 
              alt={item.name}
              layoutId={`image-${item.id}`}
              onLoad={() => setImageLoaded(true)}
              className={cn(
                "w-full h-full object-cover transition-all duration-500",
                imageLoaded ? "opacity-100" : "opacity-0",
                isHovered && !isExpanded && "scale-105"
              )}
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-charcoal/80 to-black/60 flex items-center justify-center">
            <div className="text-center">
              <Utensils className="text-amber-400/40 mx-auto mb-2" size={isExpanded ? 64 : isMobile ? 40 : 48} />
              <p className="text-amber-400/60 text-sm font-medium">{item.name}</p>
            </div>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
        
        {/* Price display */}
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={cn(
              "backdrop-blur-md border border-amber-600/30",
              isMobile ? "bg-black/80 rounded-xl px-3 py-2" : "bg-black/90 rounded-2xl px-4 py-3"
            )}
          >
            {item.variations ? (
              <div className="flex justify-between items-center">
                <div>
                  <div className={cn("text-amber-400 font-bold", isMobile ? "text-lg" : "text-xl")}>
                    {formatPrice(item.variations[0].price)}
                  </div>
                  <div className="text-cream/60 text-xs font-medium">
                    {item.variations[0].size}
                  </div>
                </div>
                {item.variations.length > 1 && (
                  <div className="text-right">
                    <div className="text-cream/80 text-xs">from</div>
                    <div className="text-amber-300 font-semibold text-sm">
                      {formatPrice(Math.min(...item.variations.map(v => v.price)))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div className={cn("text-amber-400 font-bold", isMobile ? "text-lg" : "text-xl")}>
                  {formatPrice(item.price)}
                </div>
                <div className="text-cream/60 text-xs font-medium">
                  per serving
                </div>
              </div>
            )}
          </motion.div>        
        </div>          

        {/* Expand Button */}
        <motion.div
          className={cn(
            "absolute z-10",
            isMobile ? "bottom-3 right-3" : "bottom-4 right-4"
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
            className={cn(
              "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400", 
              "text-black border-none rounded-full shadow-xl backdrop-blur-sm transition-all duration-300 p-0",
              isMobile ? "w-10 h-10" : "w-12 h-12"
            )}
          >
            {isExpanded ? (
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 45 }}
                transition={{ duration: 0.2 }}
              >
                <Plus className={cn(isMobile ? "w-4 h-4" : "w-5 h-5")} />
              </motion.div>
            ) : (
              <Eye className={cn(isMobile ? "w-4 h-4" : "w-5 h-5")} />
            )}
          </Button>
        </motion.div>
      </div>
        
      {/* Content Section */}
      <div className={cn(
        isMobile ? "p-4" : "p-5 sm:p-6",
        isExpanded && "pb-8"
      )}>
        <div className={cn("mb-3", isMobile ? "mt-1" : "")}>
          <motion.h3 
            layoutId={`title-${item.id}`}
            className={cn(
              "font-bold text-amber-400 transition-colors leading-tight mb-2",
              isExpanded 
                ? "text-2xl sm:text-3xl" 
                : isMobile 
                  ? "text-base" 
                  : "text-lg sm:text-xl"
            )}
          >
            {item.name}
          </motion.h3>
          
          <motion.p 
            layoutId={`desc-${item.id}`}
            className={cn(
              "leading-relaxed",
              isExpanded 
                ? "text-base text-cream/90" 
                : isMobile
                  ? "text-xs text-cream/80 line-clamp-2"
                  : "text-sm text-cream/90 line-clamp-2"
            )}
          >
            {item.description}
          </motion.p>
            
          <motion.div className="mt-2">
            <Badge 
              variant="outline" 
              className={cn(
                "bg-amber-600/10 border-amber-600/30 text-amber-400 px-2",
                isMobile ? "text-[10px] py-0.5" : "text-xs py-1"
              )}
            >
              {item.category}
            </Badge>
          </motion.div>
        </div>
        
        <motion.div layoutId={`tags-${item.id}`} className="mb-4">
          {renderDietaryTags(item.dietary)}
        </motion.div>
        
        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-6"
            >
              {item.ingredients && item.ingredients.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-black/30 rounded-xl p-4 border border-amber-600/10"
                >
                  <h4 className="text-amber-400 font-semibold mb-3 flex items-center gap-2">
                    <Leaf className="w-4 h-4" />
                    Key Ingredients
                  </h4>
                  <p className="text-cream/80 text-sm leading-relaxed">
                    {item.ingredients.join(', ')}
                  </p>
                </motion.div>
              )}
              
              {item.variations && item.variations.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-black/30 rounded-xl p-4 border border-amber-600/10"
                >
                  <h4 className="text-amber-400 font-semibold mb-3">Size Options</h4>
                  <div className="space-y-2">
                    {item.variations.map((variation, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-black/20 rounded-lg">
                        <span className="text-cream/80 text-sm">{variation.size}</span>
                        <span className="text-amber-400 font-semibold">{formatPrice(variation.price)}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Menu;
