import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Clock, Star, ArrowRight, ChefHat, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog';

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
  isSpecial?: boolean;
  ingredients?: string[];
  visibility?: boolean;
}

const PreOrderSection = () => {
  const navigate = useNavigate();
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Authentication protection
  const {
    requireAuth,
    showAuthDialog,
    handleLoginRedirect,
    handleSignupRedirect,
    closeAuthDialog
  } = useAuthGuard();

  // Fetch real menu items from database (same as Pre-Orders page)
  useEffect(() => {
    const fetchMenuItems = () => {
      try {
        // Fetch from the same collection as Pre-Orders page
        const menuQuery = query(
          collection(db, "menuItems"),
          limit(6) // Get up to 6 items to have options
        );

        const unsubscribe = onSnapshot(menuQuery, (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            })) as MenuItem[];
            
            // Filter items that are visible and available
            const availableItems = items.filter(item => 
              item.visibility !== false && item.name && item.description && item.price
            );
            
            // Prioritize featured items, then pick others to make 3 total
            const featuredItems = availableItems.filter(item => item.featured);
            const nonFeaturedItems = availableItems.filter(item => !item.featured);
            
            let selectedItems: MenuItem[] = [];
            
            // Add featured items first (up to 3)
            selectedItems.push(...featuredItems.slice(0, 3));
            
            // If we need more items, add non-featured ones
            if (selectedItems.length < 3) {
              const remainingSlots = 3 - selectedItems.length;
              selectedItems.push(...nonFeaturedItems.slice(0, remainingSlots));
            }
            
            // Take only first 3 items
            setFeaturedItems(selectedItems.slice(0, 3));
          } else {
            // No items in database
            setFeaturedItems([]);
          }
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error fetching menu items:", error);
        setFeaturedItems([]);
        setLoading(false);
      }
    };

    const unsubscribe = fetchMenuItems();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Handle pre-order navigation with authentication
  const handlePreOrderClick = (dishId?: string) => {
    if (!requireAuth()) {
      return;
    }
    
    // Navigate to pre-orders page, optionally with dish focus
    if (dishId) {
      navigate(`/preorders?highlight=${dishId}`);
    } else {
      navigate('/preorders');
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.8
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardHoverVariants = {
    rest: { scale: 1, y: 0 },
    hover: {
      scale: 1.02,
      y: -8,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  // Don't render the section if there are no items and not loading
  if (!loading && featuredItems.length === 0) {
    return null;
  }

  return (
    <section className="relative py-24 bg-gradient-to-b from-black/60 via-charcoal/80 to-black/60 overflow-hidden">
      {/* Enhanced Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-amber-600/3 to-transparent rounded-full" />
        
        {/* Enhanced floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/20 rounded-full"
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
        
        {/* Sparkle effects */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute"
            animate={{
              rotate: [0, 360],
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 4
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          >
            <Sparkles className="w-3 h-3 text-amber-400/30" />
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Badge className="bg-gradient-to-r from-amber-600/20 to-amber-500/20 text-amber-400 border-amber-400/30 px-6 py-2 text-sm rounded-full mb-6 shadow-lg">
              ✨ Pre-Order Available ✨
            </Badge>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 mb-6">
            Reserve Your Culinary Journey
          </h2>
          
          <motion.div 
            className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
          />
          
          <p className="text-xl text-cream/90 max-w-3xl mx-auto leading-relaxed mb-4">
            Skip the wait and secure your favorite dishes ahead of time. Our chefs will prepare your selection with the same care and attention to detail.
          </p>
          
          <p className="text-cream/70 max-w-2xl mx-auto">
            Perfect for special occasions, business meetings, or when you simply want to guarantee your preferred dining experience.
          </p>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gradient-to-br from-black/40 to-charcoal/40 border border-amber-600/10 rounded-2xl overflow-hidden h-[600px]">
                  <div className="h-64 bg-charcoal/60" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-charcoal/60 rounded w-3/4" />
                    <div className="h-4 bg-charcoal/40 rounded w-full" />
                    <div className="h-4 bg-charcoal/40 rounded w-2/3" />
                    <div className="flex justify-between items-center mt-6">
                      <div className="h-8 bg-charcoal/60 rounded w-20" />
                      <div className="h-10 bg-charcoal/60 rounded w-24" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : featuredItems.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          >
            {featuredItems.map((item, index) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className="group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <motion.div
                  variants={cardHoverVariants}
                  initial="rest"
                  whileHover="hover"
                  className="bg-gradient-to-br from-black/80 to-charcoal/90 border border-amber-600/20 rounded-2xl overflow-hidden shadow-2xl hover:border-amber-400/40 transition-all duration-500 h-full flex flex-col backdrop-blur-sm"
                >
                  {/* Image Container */}
                  <div className="relative h-64 sm:h-72 overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-charcoal/60 to-black/60 flex items-center justify-center">
                        <ChefHat className="w-16 h-16 text-amber-400/30" />
                      </div>
                    )}
                    
                    {/* Enhanced Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    
                    {/* Featured Badge */}
                    {(item.featured || item.isSpecial) && (
                      <motion.div
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
                        className="absolute top-4 left-4"
                      >
                        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-black px-3 py-1.5 rounded-full text-sm font-bold flex items-center shadow-lg backdrop-blur-sm">
                          <ChefHat className="mr-1" size={14} />
                          {item.featured ? "Featured" : "Chef's Special"}
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Dietary badges */}
                    {item.dietary && item.dietary.length > 0 && (
                      <motion.div 
                        className="absolute top-4 right-4 flex flex-wrap gap-1"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        {item.dietary.slice(0, 2).map((diet) => (
                          <div key={diet} className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium border border-green-400/30">
                            {diet}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 sm:p-8 flex-1 flex flex-col">
                    <div className="flex-1">
                      <h3 className="text-xl sm:text-2xl font-serif font-bold text-amber-400 mb-3 group-hover:text-amber-300 transition-colors">
                        {item.name}
                      </h3>
                      
                      <p className="text-cream/80 text-sm sm:text-base leading-relaxed mb-6 line-clamp-3">
                        {item.description}
                      </p>
                      
                      {/* Ingredients preview */}
                      {item.ingredients && item.ingredients.length > 0 && (
                        <div className="mb-4">
                          <p className="text-cream/60 text-xs mb-1">Key Ingredients:</p>
                          <p className="text-cream/70 text-sm italic">
                            {item.ingredients.slice(0, 3).join(", ")}
                            {item.ingredients.length > 3 && "..."}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Price and Button */}
                    <div className="flex items-center justify-between">                      <div className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-300">
                        ₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={() => handlePreOrderClick(item.id)}
                          className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-black font-bold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group/btn"
                        >
                          <span className="flex items-center">
                            Pre-Order
                            <ShoppingBag className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </span>
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        ) : null}

        {/* Call to Action - only show if we have items or are loading */}
        {(loading || featuredItems.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center"
          >
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-black/60 via-charcoal/60 to-black/60 backdrop-blur-sm border border-amber-600/30 rounded-2xl p-8 sm:p-12 shadow-2xl">
                <motion.h3 
                  className="text-2xl sm:text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 mb-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                >
                  Ready to Elevate Your Dining Experience?
                </motion.h3>
                
                <motion.p 
                  className="text-cream/80 text-lg mb-8 max-w-2xl mx-auto"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                >
                  Browse our complete menu and secure your favorites for pickup. 
                  Enjoy restaurant-quality cuisine at your convenience.
                </motion.p>
                
                <motion.div 
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => handlePreOrderClick()}
                      size="lg"
                      className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-black font-bold px-8 py-4 text-lg rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 group"
                    >
                      <ShoppingBag className="mr-2 w-5 h-5" />
                      Start Pre-Ordering
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="border-2 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black font-bold px-8 py-4 text-lg rounded-lg transition-all duration-300"
                    >
                      <Link to="/menu" className="flex items-center">
                        View Full Menu
                      </Link>
                    </Button>
                  </motion.div>
                </motion.div>
                
                {/* Enhanced Features */}
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 pt-8 border-t border-amber-600/20"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8, staggerChildren: 0.1 }}
                >
                  <motion.div 
                    className="text-center group"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-600/20 to-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:from-amber-600/30 group-hover:to-amber-500/30 transition-all duration-300">
                      <Clock className="w-6 h-6 text-amber-400" />
                    </div>
                    <h4 className="text-cream font-semibold mb-2">Quick Pickup</h4>
                    <p className="text-cream/70 text-sm">Order ready in 15-30 minutes</p>
                  </motion.div>
                  
                  <motion.div 
                    className="text-center group"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-600/20 to-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:from-amber-600/30 group-hover:to-amber-500/30 transition-all duration-300">
                      <ChefHat className="w-6 h-6 text-amber-400" />
                    </div>
                    <h4 className="text-cream font-semibold mb-2">Fresh Preparation</h4>
                    <p className="text-cream/70 text-sm">Made to order by our chefs</p>
                  </motion.div>
                  
                  <motion.div 
                    className="text-center group"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-600/20 to-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:from-amber-600/30 group-hover:to-amber-500/30 transition-all duration-300">
                      <Star className="w-6 h-6 text-amber-400" />
                    </div>
                    <h4 className="text-cream font-semibold mb-2">Premium Quality</h4>
                    <p className="text-cream/70 text-sm">Same restaurant-grade experience</p>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Auth Required Dialog */}
      <AuthRequiredDialog
        isOpen={showAuthDialog}
        onLoginClick={handleLoginRedirect}
        onSignupClick={handleSignupRedirect}
        onClose={closeAuthDialog}
        action="start pre-ordering"
      />
    </section>
  );
};

export default PreOrderSection;
