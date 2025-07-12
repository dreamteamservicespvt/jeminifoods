import React from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, Eye, Timer, Star, Gift, Zap, Plus, Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { MenuItem, formatPrice } from '../../contexts/CartContext';

interface MenuItemCardProps {
  item: MenuItem;
  index: number;
  viewMode: 'grid' | 'list';
  hoveredItem: string | null;
  setHoveredItem: (id: string | null) => void;
  isFavorite: (id: string, type: 'menuItem' | 'gallery') => boolean;
  onToggleFavorite: (item: MenuItem, e: React.MouseEvent) => void;
  onViewDetails: (item: MenuItem, e?: React.MouseEvent) => void;
  onAddToCart: (item: MenuItem, e?: React.MouseEvent) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  index,
  viewMode,
  hoveredItem,
  setHoveredItem,
  isFavorite,
  onToggleFavorite,
  onViewDetails,
  onAddToCart
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
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
        viewMode === 'list' && "flex flex-row gap-3 sm:gap-4 max-h-none",
        viewMode === 'list' && isMobile && "rounded-2xl p-3 gap-3"
      )}
      onClick={() => onViewDetails(item)}
    >
      {/* Image Container with Enhanced Overlay */}
      <div className={cn(
        "relative overflow-hidden",
        viewMode === 'grid' 
          ? "aspect-[4/3]" 
          : isMobile 
            ? "w-24 h-24 rounded-2xl flex-shrink-0"
            : "w-full h-48 sm:w-48 sm:h-48 flex-shrink-0"
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
          className={cn(
            "absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500",
            viewMode === 'list' && isMobile && "hidden" // Hide on mobile list view for cleaner look
          )}
          initial={{ scale: 0.8, opacity: 0 }}
          whileHover={{ scale: 1, opacity: 1 }}
        >
          <motion.button
            onClick={(e) => onViewDetails(item, e)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={cn(
              "flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold shadow-xl backdrop-blur-sm transition-all rounded-full",
              viewMode === 'list' ? "px-4 py-2 text-sm" : "px-6 py-3"
            )}
          >
            <Eye className={cn(viewMode === 'list' ? "w-3 h-3" : "w-4 h-4")} />
            <span className={viewMode === 'list' ? "hidden lg:inline" : ""}>View Details</span>
          </motion.button>
        </motion.div>
        
        {/* Animated Favorite Button */}
        <motion.button
          onClick={(e) => onToggleFavorite(item, e)}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          className={cn(
            "absolute rounded-full flex items-center justify-center transition-all backdrop-blur-sm border-2 shadow-lg",
            viewMode === 'list' && isMobile 
              ? "top-1 right-1 w-6 h-6 border-1" 
              : viewMode === 'list' 
                ? "top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-12 sm:h-12"
                : "top-2 right-2 sm:top-4 sm:right-4 w-12 h-12",
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
              "transition-all",
              viewMode === 'list' && isMobile 
                ? "w-3 h-3" 
                : viewMode === 'list' 
                  ? "w-3 h-3 sm:w-5 sm:h-5" 
                  : "w-5 h-5",
              isFavorite(item.id, 'menuItem') && "fill-current"
            )} />
          </motion.div>
        </motion.button>

        {/* Enhanced Badges */}
        <div className={cn(
          "absolute flex gap-1",
          viewMode === 'list' && isMobile 
            ? "top-1 left-1 flex-col scale-75 origin-top-left" 
            : viewMode === 'list' 
              ? "top-2 left-2 sm:top-4 sm:left-4 flex-col gap-1 sm:gap-2 scale-75 sm:scale-100 origin-top-left"
              : "top-2 left-2 sm:top-4 sm:left-4 flex-col gap-1 sm:gap-2"
        )}>
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

        {/* Mobile List View - Quick Info */}
        {viewMode === 'list' && isMobile && (
          <div className="absolute bottom-1 left-1 flex items-center gap-1">
            {item.preparationTime && (
              <div className="flex items-center gap-1 bg-black/80 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-full text-xs">
                <Timer className="w-2 h-2" />
                <span>{item.preparationTime}m</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Content */}
      <div className={cn(
        "flex flex-col",
        viewMode === 'list' && isMobile 
          ? "flex-1 justify-between py-2 px-1 min-w-0" 
          : viewMode === 'list' 
            ? "flex-1 justify-between py-4 sm:py-6 p-4 sm:p-6" 
            : "p-4 sm:p-6 space-y-4"
      )}>
        {/* Title and Rating */}
        <div className={cn(
          "flex items-start justify-between",
          viewMode === 'list' && isMobile 
            ? "mb-1" 
            : viewMode === 'list' 
              ? "space-y-1 sm:space-y-2" 
              : "space-y-3"
        )}>
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-serif font-bold text-cream line-clamp-2 group-hover:text-amber-400 transition-colors leading-tight",
              viewMode === 'list' && isMobile 
                ? "text-sm line-clamp-1" 
                : viewMode === 'list' 
                  ? "text-base sm:text-lg" 
                  : "text-xl"
            )}>
              {item.name}
            </h3>
            {item.rating && viewMode === 'list' && !isMobile && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400 fill-current" />
                  <span className="text-xs sm:text-sm text-amber-400 font-medium">{item.rating.toFixed(1)}</span>
                </div>
                {item.reviewCount && (
                  <span className="text-xs text-cream/60 hidden sm:inline">({item.reviewCount} reviews)</span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Description */}
        <p className={cn(
          "text-cream/80 leading-relaxed",
          viewMode === 'list' && isMobile 
            ? "text-xs line-clamp-1 mt-1" 
            : viewMode === 'list' 
              ? "text-xs sm:text-sm line-clamp-2 mt-2" 
              : "text-sm line-clamp-3"
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
        <div className={cn(
          "flex items-center justify-between mt-auto border-t border-cream/10",
          viewMode === 'list' && isMobile 
            ? "pt-2 mt-2" 
            : "pt-3 sm:pt-4"
        )}>
          <div className="space-y-1">
            <div className={cn(
              "font-bold text-amber-400",
              viewMode === 'list' && isMobile 
                ? "text-sm" 
                : viewMode === 'list' 
                  ? "text-lg sm:text-xl" 
                  : "text-2xl"
            )}>
              {formatPrice(item.price)}
            </div>
            {item.specialOfferText && !isMobile && (
              <div className="text-xs text-red-400 font-medium hidden sm:block">
                {item.specialOfferText}
              </div>
            )}
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0"
          >
            <Button 
              onClick={(e) => onAddToCart(item, e)}
              size={viewMode === 'list' ? "sm" : "default"}
              className={cn(
                "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-amber-400/50 touch-manipulation",
                viewMode === 'list' && isMobile 
                  ? "px-2 py-1 text-xs min-h-[32px] min-w-[60px]" 
                  : viewMode === 'list' && "px-3 py-2 text-xs sm:text-sm"
              )}
            >
              <Plus className={cn(
                "mr-1 sm:mr-2", 
                viewMode === 'list' && isMobile 
                  ? "w-3 h-3" 
                  : viewMode === 'list' 
                    ? "w-3 h-3 sm:w-4 sm:h-4" 
                    : "w-4 h-4"
              )} />
              <span className={cn(
                viewMode === 'list' && isMobile 
                  ? "inline" 
                  : "hidden sm:inline"
              )}>
                {viewMode === 'list' && isMobile ? "Add" : "Add to Cart"}
              </span>
              <span className={cn(
                viewMode === 'list' && isMobile 
                  ? "hidden" 
                  : "sm:hidden"
              )}>Add</span>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
