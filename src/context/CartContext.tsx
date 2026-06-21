import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number; // current unit price based on qty and tiers
  basePrice: number; // standard single unit price
  unit: string;
  qty: number;
  image: string;
  categoryTitle: string;
  priceTiers?: { min: number; max: number; price: number; save: number }[];
}

export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: {
    id: string;
    name: string;
    price: string | number;
    unit: string;
    images?: string[];
    categoryTitle?: string;
    priceTiers?: { min: number; max: number; price: number; save: number }[];
  }, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const parsePrice = (priceStr: string | number): number => {
  if (typeof priceStr === 'number') return priceStr;
  return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('arcus-cart-items');
    return saved ? JSON.parse(saved) : [];
  });

  // Keep localStorage in sync and trigger events
  useEffect(() => {
    localStorage.setItem('arcus-cart-items', JSON.stringify(cartItems));
    
    // Sync simulated count (sum of quantities)
    const count = cartItems.reduce((acc, item) => acc + item.qty, 0);
    localStorage.setItem('arcus-cart-count', String(count));
    
    // Dispatch event for components that still listen to simulated cart count
    window.dispatchEvent(new Event('arcus-cart-updated'));
  }, [cartItems]);

  const getPriceForQty = (priceTiers: any[] | undefined, basePrice: number, qty: number): number => {
    if (!priceTiers || priceTiers.length === 0) return basePrice;
    const tier = priceTiers.find((t) => qty >= t.min && qty <= (t.max === 999999 ? Infinity : t.max));
    return tier ? tier.price : basePrice;
  };

  const addToCart = (product: any, qty: number = 1) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.id === product.id);
      const basePrice = parsePrice(product.price);
      const image = product.images && product.images.length > 0 ? product.images[0] : '/pdp_cpvc_pipe_main.png';
      const categoryTitle = product.categoryTitle || 'Materials';

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        const existingItem = updatedItems[existingItemIndex];
        const newQty = existingItem.qty + qty;
        const newPrice = getPriceForQty(product.priceTiers || existingItem.priceTiers, basePrice, newQty);
        
        updatedItems[existingItemIndex] = {
          ...existingItem,
          qty: newQty,
          price: newPrice,
          priceTiers: product.priceTiers || existingItem.priceTiers
        };
        return updatedItems;
      } else {
        const initialPrice = getPriceForQty(product.priceTiers, basePrice, qty);
        return [
          ...prevItems,
          {
            id: product.id,
            name: product.name,
            basePrice,
            price: initialPrice,
            unit: product.unit,
            qty,
            image,
            categoryTitle,
            priceTiers: product.priceTiers
          }
        ];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === productId) {
          const newPrice = getPriceForQty(item.priceTiers, item.basePrice, qty);
          return {
            ...item,
            qty,
            price: newPrice
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        cartCount,
        cartTotal
      }}
    >
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
