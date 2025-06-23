import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFavorites } from '@/hooks/useFavorites';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FavoriteButtonProps {
  item: {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    type: 'menuItem' | 'gallery';
  };
  isFavorite?: boolean;
  favoriteId?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  item,
  isFavorite = false,
  favoriteId,
  size = 'md',
  className = ''
}) => {
  const { addFavorite, removeFavorite } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
  
  const handleToggleFavorite = async () => {
    setIsAnimating(true);
    
    try {
      if (isFavorite && favoriteId) {
        await removeFavorite(favoriteId);
      } else {
        await addFavorite(item);
      }
    } finally {
      // Ensure animation plays even if there's an error
      setTimeout(() => setIsAnimating(false), 500);
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            onClick={handleToggleFavorite}
            className={`${sizeClasses[size]} rounded-full flex items-center justify-center ${
              isFavorite 
                ? 'bg-purple-500/90 text-white' 
                : 'bg-black/60 text-white/70 hover:bg-purple-500/70 hover:text-white'
            } ${className}`}
            whileTap={{ scale: 0.85 }}
            animate={
              isAnimating 
                ? { scale: [1, 1.5, 1], rotate: [0, 15, -15, 0] } 
                : {}
            }
            transition={{ duration: 0.5 }}
          >
            <Heart className={`${iconSizes[size]} ${isFavorite ? 'fill-white' : ''}`} />
          </motion.button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isFavorite ? 'Remove from favorites' : 'Add to favorites'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FavoriteButton;
