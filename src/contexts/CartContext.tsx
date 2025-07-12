import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  featured?: boolean;
  ingredients?: string[];
  specialOffer?: boolean;
  specialOfferText?: string;
  variations?: {
    size: string;
    price: number;
  }[];
  visibility?: boolean;
  videoUrl?: string;
  preparationTime?: number;
  spiceLevel?: number;
  rating?: number;
  reviewCount?: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  specialInstructions?: string;
  selected: boolean; // Add selected property
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: MenuItem, quantity?: number, specialInstructions?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  updateCartItemInstructions: (itemId: string, instructions: string) => void;
  toggleCartItemSelection: (id: string) => void;
  selectAllCartItems: (selected: boolean) => void;
  clearCart: () => void;
  getCartItemCount: () => number;
  getCartTotal: () => number;
  getSelectedCartItems: () => CartItem[];
  getSelectedCartTotal: () => number;
  isCartEmpty: () => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'jemini_restaurant_cart';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    // Load cart from localStorage on mount
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // When loading from storage, ensure all items have the 'selected' property
        return parsedCart.map(item => ({
          ...item, 
          selected: item.selected !== undefined ? item.selected : true
        }));
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
    return [];
  });

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  const addToCart = (item: MenuItem, quantity: number = 1, specialInstructions?: string) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(cartItem => cartItem.id === item.id);
      
      if (existingItemIndex !== -1) {
        // Update existing item
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + quantity,
          specialInstructions: specialInstructions || updatedCart[existingItemIndex].specialInstructions,
          selected: true // Auto-select new items
        };
        return updatedCart;
      } else {
        // Add new item
        return [...prevCart, {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          image: item.image,
          selected: true // New items are selected by default
        }];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const updateCartItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prevCart => 
      prevCart.map(item => 
        item.id === itemId 
          ? { ...item, quantity }
          : item
      )
    );
  };

  const updateCartItemInstructions = (itemId: string, instructions: string) => {
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === itemId 
          ? { ...item, specialInstructions: instructions }
          : item
      )
    );
  };

  const toggleCartItemSelection = (id: string) => {
    setCart(cart.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const selectAllCartItems = (selected: boolean) => {
    setCart(cart.map(item => ({ ...item, selected })));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getSelectedCartItems = () => {
    return cart.filter(item => item.selected);
  };

  const getSelectedCartTotal = () => {
    return getSelectedCartItems().reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const isCartEmpty = () => {
    return cart.length === 0;
  };

  const contextValue: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    updateCartItemInstructions,
    toggleCartItemSelection,
    selectAllCartItems,
    clearCart,
    getCartItemCount,
    getCartTotal,
    getSelectedCartItems,
    getSelectedCartTotal,
    isCartEmpty
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Utility function for consistent price formatting
export const formatPrice = (price: number): string => {
  return price.toLocaleString('en-IN', { 
    style: 'currency', 
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};
