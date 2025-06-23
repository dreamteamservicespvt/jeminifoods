import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useFavorites } from '../../hooks/useFavorites';

interface FavoriteButtonProps {
  itemId: string;
  itemType: 'menuItem' | 'gallery';
  itemData: {
    name: string;
    description?: string;
    imageUrl?: string;
  };
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ itemId, itemType, itemData, className = '' }) => {
  const { isFavorite, addFavorite, removeFavorite, getFavoriteId } = useFavorites();
  
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const isCurrentlyFavorite = isFavorite(itemId, itemType);
    
    if (isCurrentlyFavorite) {
      const favoriteId = getFavoriteId(itemId, itemType);
      if (favoriteId) {
        await removeFavorite(favoriteId);
      }
    } else {
      await addFavorite({
        id: itemId,
        name: itemData.name,
        description: itemData.description || '',
        imageUrl: itemData.imageUrl || '',
        type: itemType
      });
    }
  };
  
  const isFav = isFavorite(itemId, itemType);
  
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleToggleFavorite}
      className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center ${
        isFav 
          ? 'bg-red-500 text-white' 
          : 'bg-black/50 backdrop-blur-sm text-white hover:bg-black/70'
      } ${className}`}
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={`w-5 h-5 ${isFav ? 'fill-white' : ''}`} />
    </motion.button>
  );
};

export default FavoriteButton;
