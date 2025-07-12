import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Grid, List, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

interface MobileMenuHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  categories: string[];
  categoryConfig: Record<string, any>;
  handleCategoryChange: (category: string) => void;
  selectedDietary: string | null;
  handleDietaryChange: (dietary: string) => void;
  getAvailableDietaryFilters: () => string[];
  dietaryTags: Record<string, any>;
  filteredItems: MenuItem[];
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

const MobileMenuHeader: React.FC<MobileMenuHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  categories,
  categoryConfig,
  handleCategoryChange,
  selectedDietary,
  handleDietaryChange,
  getAvailableDietaryFilters,
  dietaryTags,
  filteredItems,
  viewMode,
  setViewMode,
  showFilters,
  setShowFilters
}) => {
  const getCurrentCategory = () => {
    return categoryConfig[selectedCategory as keyof typeof categoryConfig] || categoryConfig.all;
  };

  const getItemCount = (category: string) => {
    if (category === 'all') return filteredItems.length;
    if (category === "chef's specials") {
      return filteredItems.filter(item => item.featured).length;
    }
    return filteredItems.filter(item => 
      item.category.toLowerCase() === category.toLowerCase()
    ).length;
  };

  return (
    <div className="md:hidden space-y-4">
      {/* Mobile Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cream/60 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search delicious dishes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-3 bg-black/30 backdrop-blur-sm border-cream/20 text-cream placeholder:text-cream/60 rounded-xl focus:border-amber-400 focus:ring-amber-400/20"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-cream/60 hover:text-cream p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Mobile Category Pills - Horizontal Scroll */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 pb-2 min-w-max">
          {categories.map((category) => {
            const categoryInfo = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.all;
            const itemCount = getItemCount(category);
            
            return (
              <motion.button
                key={category}
                onClick={() => handleCategoryChange(category)}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 border touch-manipulation min-h-[40px]",
                  selectedCategory === category
                    ? "bg-amber-500 text-black border-amber-400 shadow-lg"
                    : "bg-black/30 backdrop-blur-sm text-cream border-cream/20 hover:bg-amber-400/10 hover:border-amber-400/40"
                )}
              >
                <categoryInfo.icon className="w-4 h-4" />
                <span className="capitalize">{category}</span>
                <Badge variant="secondary" className="bg-cream/20 text-cream text-xs">
                  {itemCount}
                </Badge>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Mobile Controls Row */}
      <div className="flex items-center justify-between gap-3">
        {/* Filter Toggle Button */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 border touch-manipulation",
            showFilters
              ? "bg-amber-500 text-black border-amber-400 shadow-lg"
              : "bg-black/30 backdrop-blur-sm text-cream border-cream/20 hover:bg-amber-400/10 hover:border-amber-400/40"
          )}
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {selectedDietary && (
            <Badge variant="secondary" className="bg-amber-200 text-black text-xs">
              1
            </Badge>
          )}
          <ChevronDown className={cn(
            "w-4 h-4 transition-transform",
            showFilters && "rotate-180"
          )} />
        </Button>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-black/30 backdrop-blur-sm rounded-xl border border-cream/20 p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 rounded-lg transition-all touch-manipulation",
              viewMode === 'grid'
                ? "bg-amber-500 text-black shadow-lg"
                : "text-cream hover:text-amber-400 hover:bg-amber-400/10"
            )}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 rounded-lg transition-all touch-manipulation",
              viewMode === 'list'
                ? "bg-amber-500 text-black shadow-lg"
                : "text-cream hover:text-amber-400 hover:bg-amber-400/10"
            )}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Dietary Filters - Expandable */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-cream/10">
              <h3 className="text-sm font-medium text-cream mb-3">Dietary Preferences</h3>
              <div className="flex flex-wrap gap-2">
                {getAvailableDietaryFilters().map((dietary) => {
                  const isSelected = selectedDietary === dietary;
                  const tagInfo = dietaryTags[dietary];
                  
                  return (
                    <motion.button
                      key={dietary}
                      onClick={() => handleDietaryChange(dietary)}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 border touch-manipulation min-h-[36px]",
                        isSelected
                          ? `${tagInfo.bgColor} ${tagInfo.textColor} border-current shadow-lg`
                          : "bg-black/30 backdrop-blur-sm text-cream border-cream/20 hover:border-cream/40 hover:bg-cream/5"
                      )}
                    >
                      <tagInfo.icon className="w-3 h-3" />
                      <span className="capitalize">{dietary}</span>
                    </motion.button>
                  );
                })}
              </div>
              
              {/* Clear Filters */}
              {selectedDietary && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDietaryChange(selectedDietary)}
                  className="mt-3 text-cream/60 hover:text-cream text-xs"
                >
                  Clear filter
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className="text-center">
        <p className="text-cream/80 text-sm">
          Showing {filteredItems.length} {filteredItems.length === 1 ? 'dish' : 'dishes'}
          {selectedCategory !== 'all' && (
            <span> in {getCurrentCategory().title}</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default MobileMenuHeader;
