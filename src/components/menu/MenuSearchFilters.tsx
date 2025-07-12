import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { MenuCartToggle } from '../MenuCart';

interface MenuSearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (focused: boolean) => void;
  searchSuggestions: string[];
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  sortedItemsLength: number;
  totalItemsLength: number;
  showCart: boolean;
  toggleCart: () => void;
  cartItemCount: number;
  availableCategories: string[];
  categoryConfig: Record<string, any>;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  getItemCount: (category: string) => number;
}

export const MenuSearchFilters: React.FC<MenuSearchFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  isSearchFocused,
  setIsSearchFocused,
  searchSuggestions,
  viewMode,
  setViewMode,
  sortedItemsLength,
  totalItemsLength,
  showCart,
  toggleCart,
  cartItemCount,
  availableCategories,
  categoryConfig,
  selectedCategory,
  setSelectedCategory,
  getItemCount
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <motion.div 
      className="bg-black/60 backdrop-blur-xl border-b border-cream/10 sticky top-0 z-40"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex justify-between items-center mb-4">
          {/* Search and filter controls */}
          <div className="flex-grow max-w-2xl">
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-4 sm:mb-6">
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-cream/60 w-4 h-4 sm:w-5 sm:h-5" />
                <Input
                  type="text"
                  placeholder={isMobile ? "Search dishes..." : "Search dishes, ingredients..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={cn(
                    "w-full pl-12 pr-12 text-lg bg-black/40 backdrop-blur-sm border-2 rounded-2xl transition-all touch-manipulation",
                    "text-cream placeholder:text-cream/50",
                    isMobile ? "py-3 text-base" : "py-4",
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
                    className={cn(
                      "absolute right-2 top-1/2 transform -translate-y-1/2 text-cream/60 hover:text-cream rounded-lg touch-manipulation",
                      isMobile ? "p-1.5 min-h-[36px] min-w-[36px]" : "p-2"
                    )}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              {/* Search Suggestions Dropdown */}
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 sm:gap-4">
              <div className="flex items-center gap-4">
                <div className="flex bg-black/40 rounded-xl p-1 backdrop-blur-sm">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "rounded-lg px-3 py-2 touch-manipulation min-h-[36px] transition-all",
                      viewMode === 'grid' 
                        ? "bg-amber-500 text-black shadow-lg" 
                        : "text-cream hover:text-amber-400 hover:bg-amber-400/10"
                    )}
                  >
                    <Grid3X3 className="w-4 h-4" />
                    <span className="ml-2 text-xs hidden sm:inline">Grid</span>
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "rounded-lg px-3 py-2 touch-manipulation min-h-[36px] transition-all",
                      viewMode === 'list' 
                        ? "bg-amber-500 text-black shadow-lg" 
                        : "text-cream hover:text-amber-400 hover:bg-amber-400/10"
                    )}
                  >
                    <List className="w-4 h-4" />
                    <span className="ml-2 text-xs hidden sm:inline">List</span>
                  </Button>
                </div>
              </div>
              
              <div className="text-xs sm:text-sm text-cream/70 order-first sm:order-last">
                Showing {sortedItemsLength} of {totalItemsLength} dishes
              </div>
            </div>
          </div>
          
          {/* Cart Toggle Button */}
          <div className="ml-4">
            <MenuCartToggle 
              isOpen={showCart} 
              onToggle={toggleCart}
              itemCount={cartItemCount} 
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="bg-black/40 backdrop-blur-sm border-t border-cream/10">
          <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
            <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1">
              {availableCategories.map((category) => {
                const categoryInfo = categoryConfig[category as keyof typeof categoryConfig];
                const itemCount = getItemCount(category);
                const IconComponent = categoryInfo?.icon;
                
                return (
                  <motion.button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl whitespace-nowrap transition-all font-medium border-2 min-w-fit touch-manipulation flex-shrink-0 min-h-[40px]",
                      "text-xs sm:text-sm",
                      selectedCategory === category
                        ? "bg-gradient-to-r from-amber-600 to-amber-500 text-black border-amber-400 shadow-xl shadow-amber-600/25"
                        : "bg-black/30 backdrop-blur-sm text-cream border-cream/20 hover:bg-black/50 hover:border-amber-600/40"
                    )}
                  >
                    {isMobile ? (
                      <span className="text-sm sm:text-lg">{categoryInfo?.emoji || '🍽️'}</span>
                    ) : (
                      <IconComponent className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                    <span className="capitalize">{categoryInfo?.title || category}</span>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-xs font-semibold px-1.5 py-0.5 sm:px-2 sm:py-1",
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
      </div>
    </motion.div>
  );
};
