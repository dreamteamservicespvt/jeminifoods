import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  Check,
  Square,
  CheckSquare,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useCart, formatPrice } from '../contexts/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserAuthOnly } from '../contexts/MultiAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useMediaQuery } from '@/hooks/use-media-query';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const {
    cart,
    removeFromCart,
    updateCartItemQuantity,
    updateCartItemInstructions,
    toggleCartItemSelection,
    selectAllCartItems,
    clearCart,
    getCartItemCount,
    getSelectedCartItems,
    getSelectedCartTotal,
    isCartEmpty
  } = useCart();
  const [editingInstructions, setEditingInstructions] = useState<string | null>(null);
  const [tempInstructions, setTempInstructions] = useState('');
  const selectedItems = getSelectedCartItems();
  const selectedTotal = getSelectedCartTotal();
  const allSelected = cart.length > 0 && selectedItems.length === cart.length;
  const someSelected = selectedItems.length > 0 && selectedItems.length < cart.length;
  // Trap focus and close on ESC
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
            aria-label="Close cart drawer"
            tabIndex={-1}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full sm:w-96 bg-black/95 border-l border-amber-600/30 z-50 flex flex-col shadow-xl"
            role="dialog"
            aria-modal="true"
            tabIndex={0}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-amber-600/20">
              <h3 className="text-xl font-semibold text-amber-400 flex items-center gap-2">
                <ShoppingCart size={20} /> Your Cart
              </h3>
              <button
                onClick={onClose}
                className="text-cream hover:text-amber-400 transition-colors"
                aria-label="Close cart drawer"
              >
                <X size={24} />
              </button>
            </div>
            {/* Cart Content */}
            <div className="flex-1 overflow-y-auto py-4 px-6">
              {isCartEmpty() ? (
                <div className="text-center text-cream/70 py-12">
                  <ShoppingCart className="mx-auto mb-4" size={32} />
                  <p>Your cart is empty</p>
                  <p className="text-sm mt-2">Add items from our menu to get started.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {cart.map((item) => (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-3 pb-4 border-b border-amber-600/10"
                    >
                      {/* Item image */}
                      <div className="w-16 h-16 bg-charcoal/70 rounded overflow-hidden flex-shrink-0">
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
                              className="w-7 h-7 rounded-full bg-charcoal flex items-center justify-center text-cream hover:bg-amber-600/20 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-cream min-w-[20px] text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-full bg-charcoal flex items-center justify-center text-cream hover:bg-amber-600/20 transition-colors"
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
                            onChange={e => updateCartItemInstructions(item.id, e.target.value)}
                            className="text-xs h-8 py-1 px-2 bg-charcoal/60 placeholder-cream/40 text-cream border-cream/20"
                          />
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
            {/* Checkout Section */}
            <div className="border-t border-amber-600/20 px-6 py-4 space-y-4">
              <div className="flex justify-between text-cream text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(selectedTotal)}</span>
              </div>
              <Button
                onClick={() => {/* handle checkout logic here, or pass as prop */}}
                disabled={isCartEmpty()}
                className="w-full bg-amber-600 hover:bg-amber-700 text-black font-bold py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ArrowRight size={18} />
                Proceed to Checkout
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const PersistentCartIcon: React.FC = () => {
  const [showCart, setShowCart] = useState(false);
  const { getCartItemCount } = useCart();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const location = useLocation(); // Get current location
  
  // Hide on the /menu page since it uses its own cart component
  if (location.pathname === '/menu' || getCartItemCount() === 0) {
    return null;
  }

  return (
    <>
      {/* Fixed Cart Icon */}
      <motion.div
        className={`fixed ${isMobile ? 'bottom-20 right-4' : 'bottom-8 right-8'} z-50`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <motion.button
          onClick={() => setShowCart(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative bg-gradient-to-r from-amber-600 to-amber-500 text-black p-4 rounded-full shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 min-w-[64px] min-h-[64px] flex items-center justify-center"
        >
          <ShoppingCart className="w-6 h-6" />
          {getCartItemCount() > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center min-w-[24px]"
            >
              {getCartItemCount()}
            </motion.div>
          )}
        </motion.button>
      </motion.div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={showCart} onClose={() => setShowCart(false)} />
    </>
  );
};
