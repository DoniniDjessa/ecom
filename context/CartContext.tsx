'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import { Product } from '@/data/products';

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD'; product: Product }
  | { type: 'REMOVE'; id: string }
  | { type: 'UPDATE_QTY'; id: string; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'LOAD'; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const existing = state.items.find((i) => i.id === action.product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === action.product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { items: [...state.items, { ...action.product, quantity: 1 }] };
    }
    case 'REMOVE':
      return { items: state.items.filter((i) => i.id !== action.id) };
    case 'UPDATE_QTY': {
      if (action.quantity <= 0) {
        return { items: state.items.filter((i) => i.id !== action.id) };
      }
      return {
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, quantity: action.quantity } : i
        ),
      };
    }
    case 'CLEAR':
      return { items: [] };
    case 'LOAD':
      return { items: action.items };
    default:
      return state;
  }
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bling_store_cart');
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[];
        dispatch({ type: 'LOAD', items: parsed });
      }
    } catch {}
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem('bling_store_cart', JSON.stringify(state.items));
  }, [state.items]);

  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = state.items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        totalItems,
        totalPrice,
        addToCart: (p) => dispatch({ type: 'ADD', product: p }),
        removeFromCart: (id) => dispatch({ type: 'REMOVE', id }),
        updateQuantity: (id, qty) =>
          dispatch({ type: 'UPDATE_QTY', id, quantity: qty }),
        clearCart: () => dispatch({ type: 'CLEAR' }),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
