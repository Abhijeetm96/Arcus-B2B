import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotification } from '../hooks/useNotification';

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
  stock: number;
  minimumOrderQuantity?: number;
  orderMultiple?: number;
  minimumOrderUnit?: string;
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
    stock?: number;
    minimumOrderQuantity?: number;
    orderMultiple?: number;
    minimumOrderUnit?: string;
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
  const { user } = useAuth();
  const { success, warning } = useNotification();
  const customerType = user?.customerType || (user?.role && ['Business', 'Contractor', 'Supplier'].includes(user.role) ? 'BUSINESS' : 'INDIVIDUAL');

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
    success(`Added ${product.name} to cart.`);
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.id === product.id);
      const basePrice = parsePrice(product.price);
      const image = product.images && product.images.length > 0 ? product.images[0] : '/pdp_cpvc_pipe_main.png';
      const categoryTitle = product.categoryTitle || 'Materials';
      const moq = product.minimumOrderQuantity !== undefined ? product.minimumOrderQuantity : 1;
      const mult = product.orderMultiple !== undefined ? product.orderMultiple : 1;
      const minUnit = product.minimumOrderUnit || product.unit || 'Piece';

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        const existingItem = updatedItems[existingItemIndex];
        const stock = product.stock !== undefined ? product.stock : (existingItem.stock !== undefined ? existingItem.stock : 100);
        let newQty = existingItem.qty + qty;
        
        // Enforce stock limit
        if (newQty > stock) {
          warning(`Cannot add more items. Only ${stock} units are available in stock.`);
          newQty = stock;
        }

        // Validate B2B MOQ and multiple rules if B2B
        if (customerType === 'BUSINESS') {
          if (newQty < moq) {
            warning(`Business orders require a minimum of ${moq} ${minUnit}. Setting quantity to ${moq}.`);
            newQty = moq;
          }
          if (mult > 1 && newQty % mult !== 0) {
            const remainder = newQty % mult;
            const adjustedQty = newQty + (mult - remainder);
            if (adjustedQty <= stock) {
              warning(`Quantity must be a multiple of ${mult} for this product. Adjusting to ${adjustedQty}.`);
              newQty = adjustedQty;
            } else {
              const adjustedDown = newQty - remainder;
              warning(`Quantity must be a multiple of ${mult} for this product. Adjusting to ${adjustedDown}.`);
              newQty = adjustedDown;
            }
          }
        }

        const newPrice = getPriceForQty(product.priceTiers || existingItem.priceTiers, basePrice, newQty);
        
        updatedItems[existingItemIndex] = {
          ...existingItem,
          qty: newQty,
          price: newPrice,
          priceTiers: product.priceTiers || existingItem.priceTiers,
          stock,
          minimumOrderQuantity: moq,
          orderMultiple: mult,
          minimumOrderUnit: minUnit
        };
        return updatedItems;
      } else {
        const stock = product.stock !== undefined ? product.stock : 100;
        let finalQty = qty;

        // Enforce B2B MOQ and multiple rules if B2B
        if (customerType === 'BUSINESS') {
          if (finalQty < moq) {
            warning(`Business orders require a minimum of ${moq} ${minUnit}. Setting quantity to ${moq}.`);
            finalQty = moq;
          }
          if (mult > 1 && finalQty % mult !== 0) {
            const remainder = finalQty % mult;
            const adjustedQty = finalQty + (mult - remainder);
            if (adjustedQty <= stock) {
              warning(`Quantity must be a multiple of ${mult} for this product. Adjusting to ${adjustedQty}.`);
              finalQty = adjustedQty;
            } else {
              const adjustedDown = finalQty - remainder;
              warning(`Quantity must be a multiple of ${mult} for this product. Adjusting to ${adjustedDown}.`);
              finalQty = adjustedDown;
            }
          }
        }

        if (finalQty > stock) {
          warning(`Cannot add more items. Only ${stock} units are available in stock.`);
          finalQty = stock;
        }

        const initialPrice = getPriceForQty(product.priceTiers, basePrice, finalQty);
        return [
          ...prevItems,
          {
            id: product.id,
            name: product.name,
            basePrice,
            price: initialPrice,
            unit: product.unit,
            qty: finalQty,
            image,
            categoryTitle,
            priceTiers: product.priceTiers,
            stock,
            minimumOrderQuantity: moq,
            orderMultiple: mult,
            minimumOrderUnit: minUnit
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
          const stock = item.stock !== undefined ? item.stock : 100;
          const moq = item.minimumOrderQuantity !== undefined ? item.minimumOrderQuantity : 1;
          const mult = item.orderMultiple !== undefined ? item.orderMultiple : 1;
          const minUnit = item.minimumOrderUnit || item.unit || 'Piece';
          let finalQty = qty;

          // Check if B2B
          if (customerType === 'BUSINESS') {
            if (finalQty < moq) {
              warning(`Business orders require a minimum of ${moq} ${minUnit}.`);
              finalQty = moq;
            }
            if (mult > 1 && finalQty % mult !== 0) {
              const remainder = finalQty % mult;
              const adjustedQty = finalQty + (mult - remainder);
              if (adjustedQty <= stock) {
                warning(`Quantity must be a multiple of ${mult}. Adjusting to ${adjustedQty}.`);
                finalQty = adjustedQty;
              } else {
                const adjustedDown = finalQty - remainder;
                warning(`Quantity must be a multiple of ${mult}. Adjusting to ${adjustedDown}.`);
                finalQty = adjustedDown;
              }
            }
          }

          if (finalQty > stock) {
            warning(`Cannot update quantity. Only ${stock} units are available in stock.`);
            finalQty = stock;
          }
          const newPrice = getPriceForQty(item.priceTiers, item.basePrice, finalQty);
          return {
            ...item,
            qty: finalQty,
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
