import React from 'react';
import { motion } from 'framer-motion';
import { Utensils, Star, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MenuEmptyStateProps {
  searchQuery: string;
  selectedCategory: string;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
}

export const MenuEmptyState: React.FC<MenuEmptyStateProps> = ({
  searchQuery,
  selectedCategory,
  setSearchQuery,
  setSelectedCategory
}) => {
  return (
    <motion.div 
      className="text-center py-20"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Enhanced animated icon */}
      <motion.div
        animate={{ 
          rotate: [0, 5, -5, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="mb-8"
      >
        <div className="relative inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-amber-600/20 to-amber-400/10 rounded-full border-2 border-amber-600/30">
          <Utensils className="text-amber-400/70" size={56} />
          
          {/* Pulsing rings */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-amber-600/20"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-amber-600/10"
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </div>
      </motion.div>
      
      <motion.h3 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl md:text-4xl font-serif font-bold text-amber-400 mb-6"
      >
        No dishes found
      </motion.h3>
      
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-cream/80 max-w-xl mx-auto mb-10 text-lg leading-relaxed"
      >
        {searchQuery ? (
          <>
            We couldn't find any dishes matching <span className="text-amber-400 font-semibold">"{searchQuery}"</span>.
            <br />
            <span className="text-amber-400/80">Try a different search term or explore our categories below.</span>
          </>
        ) : selectedCategory !== 'all' ? (
          <>
            No dishes are currently available in our <span className="text-amber-400 font-semibold capitalize">
              {selectedCategory === "chef's specials" ? "Chef's Specials" : selectedCategory}
            </span> category.
            <br />
            <span className="text-amber-400/80">Please check back soon or explore our other delicious options.</span>
          </>
        ) : (
          <>
            We're currently updating our menu selection.
            <br />
            <span className="text-amber-400/80">Please check back in a moment for our amazing dishes.</span>
          </>
        )}
      </motion.p>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
      >
        <Button
          onClick={() => {
            setSearchQuery('');
            setSelectedCategory('all');
          }}
          className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black px-8 py-4 font-semibold rounded-xl shadow-xl hover:shadow-amber-600/30 transition-all duration-300 transform hover:scale-105"
        >
          <Utensils className="w-5 h-5 mr-2" />
          Explore All Dishes
        </Button>
        
        <Button
          variant="outline"
          onClick={() => {
            setSelectedCategory("chef's specials");
            setSearchQuery('');
          }}
          className="border-amber-600/40 text-amber-400 hover:bg-amber-600/10 hover:border-amber-600/60 px-8 py-4 font-semibold rounded-xl transition-all duration-300"
        >
          <Star className="w-5 h-5 mr-2" />
          Try Chef's Specials
        </Button>
      </motion.div>
      
      {/* Popular Search Suggestions */}
      {!searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 max-w-2xl mx-auto"
        >
          <p className="text-cream/60 text-sm mb-4">Popular searches:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Biryani', 'Pasta', 'Pizza', 'Dessert', 'Vegetarian', 'Seafood'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setSearchQuery(suggestion)}
                className="px-4 py-2 bg-black/20 border border-cream/10 rounded-full text-cream/70 text-sm hover:bg-amber-600/10 hover:border-amber-600/30 hover:text-amber-400 transition-all duration-300 transform hover:scale-105"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
