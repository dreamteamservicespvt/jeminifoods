import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  X, 
  Plus, 
  Minus, 
  Trash2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCart, formatPrice } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useMediaQuery } from '@/hooks/use-media-query';

interface MenuCartProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

const MenuCart: React.FC<MenuCartProps> = ({ isOpen, onClose, onToggle }) => {
  const {
    cart,
    removeFromCart,
    updateCartItemQuantity,
    updateCartItemInstructions,
    clearCart,
    getCartItemCount,
    getCartTotal,
    isCartEmpty
  } = useCart();
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
  const cartRef = useRef<HTMLDivElement>(null);
  const totalItems = getCartItemCount();
  const totalPrice = getCartTotal();
  
  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
  
  // Focus trap
  useEffect(() => {
    if (!isOpen) return;
    
    const cartElement = cartRef.current;
    if (!cartElement) return;
    
    const focusableElements = cartElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    if (firstElement) {
      firstElement.focus();
    }
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };
    
    cartElement.addEventListener('keydown', handleTabKey);
    
    return () => {
      cartElement.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen, cart]);
  
  const handleProceedToCheckout = () => {
    navigate('/pre-orders');
    toast({
      title: "Transferring to checkout",
      description: "Your cart items have been saved",
      duration: 3000,
    });
  };
  
  // If cart is empty and was previously open, close it
  useEffect(() => {
    if (isCartEmpty() && isOpen) {
      onClose();
    }
  }, [cart, isCartEmpty, isOpen, onClose]);
  
  if (isCartEmpty()) {
    return null;
  }
  
  return (
    <>
      {/* Mobile Cart Icon - Fixed button at bottom */}
      {!isOpen && isMobile && (
        <motion.div 
          className="fixed bottom-20 right-4 z-[101]"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <motion.button
            onClick={onToggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative bg-gradient-to-r from-amber-600 to-amber-500 text-black p-4 rounded-full shadow-2xl"
            aria-label="Open cart"
          >
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </motion.button>
        </motion.div>
      )}

      {/* Desktop/Tablet Split Layout */}
      {!isMobile && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={cartRef}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="h-full fixed top-0 right-0 bg-black/95 border-l border-amber-600/30 flex flex-col shadow-xl z-[101]"
              aria-modal="true"
              role="dialog"
              aria-label="Cart"
            >
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-amber-600/20">
                <h3 className="text-xl font-semibold text-amber-400 flex items-center gap-2">
                  <ShoppingCart size={20} /> Your Cart
                  <span className="text-sm text-cream/70">({totalItems})</span>
                </h3>
                <button
                  onClick={onClose}
                  className="text-cream hover:text-amber-400 transition-colors rounded-full p-1 hover:bg-white/10"
                  aria-label="Close cart"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Cart Items - Scrollable */}
              <div className="flex-1 overflow-y-auto py-4 px-4">
                <ul className="space-y-4">
                  {cart.map((item) => (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-3 pb-4 border-b border-amber-600/10"
                    >
                      {/* Item image */}
                      <div className="w-16 h-16 bg-black/70 rounded overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="text-amber-400/40" size={20} />
                          </div>
                        )}
                      </div>
                      
                      {/* Item details */}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium text-cream">{item.name}</h4>
                          <span className="text-amber-400 font-semibold">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                        
                        <div className="text-cream/60 text-sm mt-1">
                          {formatPrice(item.price)} each
                        </div>
                        
                        {/* Quantity controls */}
                        <div className="flex justify-between items-center mt-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-cream hover:bg-amber-600/20 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-cream min-w-[20px] text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-cream hover:bg-amber-600/20 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-cream/50 hover:text-red-400 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        {/* Special instructions */}
                        <div className="mt-2">
                          <Textarea
                            placeholder="Special instructions"
                            value={item.specialInstructions || ''}
                            onChange={(e) => updateCartItemInstructions(item.id, e.target.value)}
                            className="text-xs h-8 py-1 px-2 bg-black/60 placeholder-cream/40 text-cream border-cream/20"
                          />
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Summary and checkout */}
              <div className="border-t border-amber-600/20 px-6 py-4 space-y-4">
                <div className="flex justify-between text-cream">
                  <span>Subtotal</span>
                  <span className="text-amber-400 font-bold">{formatPrice(totalPrice)}</span>
                </div>
                <Button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-black font-bold py-3 shadow-md"
                >
                  Proceed to Checkout
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
                onClick={onClose}
                aria-label="Close cart drawer"
              />

              {/* Mobile Drawer */}
              <motion.div
                ref={cartRef}
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed top-0 right-0 h-full w-full max-w-xs bg-black/95 border-l border-amber-600/30 z-[101] flex flex-col shadow-xl"
                role="dialog"
                aria-modal="true"
                aria-label="Cart"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex justify-between items-center px-4 py-4 border-b border-amber-600/20">
                  <h3 className="text-lg font-semibold text-amber-400 flex items-center gap-2">
                    <ShoppingCart size={18} /> Your Cart
                    <span className="text-xs text-cream/70">({totalItems})</span>
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-cream hover:text-amber-400 transition-colors rounded-full p-1 hover:bg-white/10"
                    aria-label="Close cart"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Cart Items - Scrollable */}
                <div className="flex-1 overflow-y-auto py-2 px-4">
                  <ul className="space-y-3">
                    {cart.map((item) => (
                      <motion.li
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-2 pb-3 border-b border-amber-600/10"
                      >
                        {/* Item image */}
                        <div className="w-14 h-14 bg-black/70 rounded overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingCart className="text-amber-400/40" size={16} />
                            </div>
                          )}
                        </div>
                        
                        {/* Item details */}
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium text-sm text-cream">{item.name}</h4>
                            <span className="text-amber-400 font-semibold text-sm">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                          
                          {/* Quantity controls */}
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                                className="w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-cream hover:bg-amber-600/20 transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-cream text-sm min-w-[16px] text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                                className="w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-cream hover:bg-amber-600/20 transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-cream/50 hover:text-red-400 transition-colors"
                              aria-label="Remove item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          
                          {/* Special instructions */}
                          <div className="mt-1">
                            <Textarea
                              placeholder="Special instructions"
                              value={item.specialInstructions || ''}
                              onChange={(e) => updateCartItemInstructions(item.id, e.target.value)}
                              className="text-xs h-7 py-1 px-2 bg-black/60 placeholder-cream/40 text-cream border-cream/20"
                            />
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Summary and checkout */}
                <div className="border-t border-amber-600/20 px-4 py-4 space-y-3">
                  <div className="flex justify-between text-cream">
                    <span>Subtotal</span>
                    <span className="text-amber-400 font-bold">{formatPrice(totalPrice)}</span>
                  </div>
                  <Button
                    onClick={handleProceedToCheckout}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-black font-bold py-2 text-sm shadow-md"
                  >
                    Proceed to Checkout
                    <ArrowRight size={14} className="ml-1" />
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}
    </>
  );
};

// Cart Toggle Button for the Menu Page header
export const MenuCartToggle: React.FC<{ 
  isOpen: boolean; 
  onToggle: () => void; 
  itemCount: number;
}> = ({ isOpen, onToggle, itemCount }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  if (isMobile || itemCount === 0) return null;
  
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
        isOpen 
          ? "bg-amber-600 text-black" 
          : "bg-black/30 text-cream hover:bg-amber-600/20"
      } border border-amber-600/30`}
    >
      {isOpen ? (
        <>
          <ArrowRight size={16} />
          <span className="hidden sm:inline">Close Cart</span>
        </>
      ) : (
        <>
          <ShoppingCart size={16} />
          <span className="hidden sm:inline">View Cart</span>
          {itemCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </>
      )}
    </motion.button>
  );
};

export default MenuCart;
