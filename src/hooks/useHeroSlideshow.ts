import { useState, useEffect, useMemo } from 'react';
import { MenuItem } from '../contexts/CartContext';

export const useHeroSlideshow = (menuItems: MenuItem[]) => {
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);

  // Hero background images from menu items
  const heroBackgroundImages = useMemo(() => {
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

  return {
    heroImageIndex,
    setHeroImageIndex,
    isHeroPaused,
    setIsHeroPaused,
    backgroundImages,
    heroBackgroundImages,
    fallbackBackgroundImages
  };
};
