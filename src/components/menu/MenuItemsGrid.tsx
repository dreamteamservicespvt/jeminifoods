import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { MenuItem } from '../../contexts/CartContext';
import { MenuItemCard } from './MenuItemCard';
import { MenuEmptyState } from './MenuEmptyState';

interface MenuItemsGridProps {
  loading: boolean;
  sortedItems: MenuItem[];
  viewMode: 'grid' | 'list';
  hoveredItem: string | null;
  setHoveredItem: (id: string | null) => void;
  isFavorite: (id: string, type: 'menuItem' | 'gallery') => boolean;
  onToggleFavorite: (item: MenuItem, e: React.MouseEvent) => void;
  onViewDetails: (item: MenuItem, e?: React.MouseEvent) => void;
  onAddToCart: (item: MenuItem, e?: React.MouseEvent) => void;
  searchQuery: string;
  selectedCategory: string;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
}

export const MenuItemsGrid: React.FC<MenuItemsGridProps> = ({
  loading,
  sortedItems,
  viewMode,
  hoveredItem,
  setHoveredItem,
  isFavorite,
  onToggleFavorite,
  onViewDetails,
  onAddToCart,
  searchQuery,
  selectedCategory,
  setSearchQuery,
  setSelectedCategory
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (sortedItems.length === 0) {
    return (
      <MenuEmptyState
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        setSearchQuery={setSearchQuery}
        setSelectedCategory={setSelectedCategory}
      />
    );
  }

  return (
    <div className={cn(
      "grid gap-4 sm:gap-6 lg:gap-8 transition-all duration-500",
      viewMode === 'grid' 
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
        : "grid-cols-1 max-w-5xl mx-auto",
      viewMode === 'list' && isMobile && "gap-3"
    )}>
      <AnimatePresence mode="popLayout">
        {sortedItems.map((item, index) => (
          <MenuItemCard
            key={item.id}
            item={item}
            index={index}
            viewMode={viewMode}
            hoveredItem={hoveredItem}
            setHoveredItem={setHoveredItem}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
            onViewDetails={onViewDetails}
            onAddToCart={onAddToCart}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
