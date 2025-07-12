import React from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, Timer, Star as StarIcon, Plus, Flame
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuItem, formatPrice } from '../../contexts/CartContext';

interface MenuItemDetailsModalProps {
  showItemDetails: boolean;
  setShowItemDetails: (show: boolean) => void;
  selectedItem: MenuItem | null;
  isFavorite: (id: string, type: 'menuItem' | 'gallery') => boolean;
  onToggleFavorite: (item: MenuItem, e: React.MouseEvent) => void;
  onAddToCart: (item: MenuItem) => void;
}

export const MenuItemDetailsModal: React.FC<MenuItemDetailsModalProps> = ({
  showItemDetails,
  setShowItemDetails,
  selectedItem,
  isFavorite,
  onToggleFavorite,
  onAddToCart
}) => {
  if (!selectedItem) return null;

  return (
    <Dialog open={showItemDetails} onOpenChange={setShowItemDetails}>
      <DialogContent className="max-w-2xl bg-black/95 text-cream border-cream/20">
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
                {formatPrice(selectedItem.price)}
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
              onClick={() => onToggleFavorite(selectedItem, {} as React.MouseEvent)}
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
                onAddToCart(selectedItem);
                setShowItemDetails(false);
              }}
              className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to Cart - {formatPrice(selectedItem.price)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
