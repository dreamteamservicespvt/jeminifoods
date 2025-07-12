import { useMemo } from 'react';
import { MenuItem } from '../contexts/CartContext';
import { Utensils, Award, ChefHat, Gift, Coffee, Star } from 'lucide-react';

// Base Category Configuration - will be extended with actual categories from menu items
const baseCategoryConfig = {
  all: { 
    title: 'All Dishes', 
    icon: Utensils, 
    emoji: '🍽️', 
    description: 'Explore our complete culinary collection'
  },
  "chef's specials": { 
    title: "Chef's Specials", 
    icon: Award, 
    emoji: '⭐', 
    description: 'Signature dishes from our master chefs'
  },
};

// Default configurations for common categories
const defaultCategoryMappings: Record<string, any> = {
  appetizers: { 
    title: 'Appetizers', 
    icon: ChefHat, 
    emoji: '🥗', 
    description: 'Perfect beginnings to your culinary journey'
  },
  starters: { 
    title: 'Appetizers', 
    icon: ChefHat, 
    emoji: '🥗', 
    description: 'Perfect beginnings to your culinary journey'
  },
  mains: { 
    title: 'Main Courses', 
    icon: Utensils, 
    emoji: '🍛', 
    description: 'Hearty dishes crafted to perfection'
  },
  'main course': { 
    title: 'Main Courses', 
    icon: Utensils, 
    emoji: '🍛', 
    description: 'Hearty dishes crafted to perfection'
  },
  desserts: { 
    title: 'Sweet Endings', 
    icon: Gift, 
    emoji: '🍰', 
    description: 'Indulgent treats to satisfy your sweet tooth'
  },
  beverages: { 
    title: 'Beverages', 
    icon: Coffee, 
    emoji: '🥤', 
    description: 'Refreshing drinks to complement your meal'
  },
  sides: { 
    title: 'Sides', 
    icon: Utensils, 
    emoji: '🥙', 
    description: 'Perfect accompaniments to your meal'
  },
  specials: { 
    title: 'Specials', 
    icon: Star, 
    emoji: '🌟', 
    description: 'Limited time offerings'
  },
};

export const useMenuCategories = (menuItems: MenuItem[]) => {
  // Build dynamic category configuration from actual menu items
  const categoryConfig = useMemo(() => {
    const actualCategories = [...new Set(menuItems.map(item => item.category.toLowerCase()))];
    const config: Record<string, any> = { ...baseCategoryConfig };
    
    // Add categories from menu items
    actualCategories.forEach(category => {
      if (!config[category]) {
        // Use default mapping if available, otherwise create a generic one
        config[category] = defaultCategoryMappings[category] || {
          title: category.charAt(0).toUpperCase() + category.slice(1),
          icon: Utensils,
          emoji: '🍽️',
          description: `Delicious ${category} options`
        };
      }
    });
    
    return config;
  }, [menuItems]);

  // Available categories (only those with items + special categories)
  const availableCategories = useMemo(() => {
    const actualCategories = [...new Set(menuItems.map(item => item.category.toLowerCase()))];
    const categories = ['all'];
    
    // Add categories that have items
    actualCategories.forEach(category => {
      if (!categories.includes(category)) {
        categories.push(category);
      }
    });
    
    // Add "chef's specials" if there are featured items
    if (menuItems.some(item => item.featured)) {
      categories.push("chef's specials");
    }
    
    return categories;
  }, [menuItems]);

  const getCurrentCategory = (selectedCategory: string) => {
    return categoryConfig[selectedCategory as keyof typeof categoryConfig] || categoryConfig.all;
  };

  const getItemCount = (category: string) => {
    if (category === 'all') return menuItems.length;
    if (category === "chef's specials") return menuItems.filter(item => item.featured).length;
    return menuItems.filter(item => item.category.toLowerCase() === category.toLowerCase()).length;
  };

  return {
    categoryConfig,
    availableCategories,
    getCurrentCategory,
    getItemCount
  };
};
