import { useMemo } from 'react';
import { MenuItem } from '../contexts/CartContext';

interface UseMenuFiltersProps {
  menuItems: MenuItem[];
  selectedCategory: string;
  searchQuery: string;
  sortBy: 'price' | 'rating' | 'name' | 'newest' | 'popular';
}

export const useMenuFilters = ({ 
  menuItems, 
  selectedCategory, 
  searchQuery, 
  sortBy 
}: UseMenuFiltersProps) => {
  // Filter items based on category and search
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === "chef's specials" && !item.featured) return false;
        if (selectedCategory !== "chef's specials" && item.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      }

      // Real-time search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const searchableText = [
          item.name,
          item.description,
          ...(item.ingredients || []),
          item.category
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(query)) return false;
      }

      return true;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Sort items
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'popular':
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [filteredItems, sortBy]);

  // Search suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    
    const query = searchQuery.toLowerCase();
    const suggestions = new Set<string>();
    
    menuItems.forEach(item => {
      // Add matching names
      if (item.name.toLowerCase().includes(query)) {
        suggestions.add(item.name);
      }
      // Add matching categories
      if (item.category.toLowerCase().includes(query)) {
        suggestions.add(item.category);
      }
    });
    
    return Array.from(suggestions).slice(0, 5);
  }, [menuItems, searchQuery]);

  return {
    filteredItems,
    sortedItems,
    searchSuggestions
  };
};
