import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { CartItem, CartState, ProductCardModel } from '../../lib/traklin/types';
import { loadCart, saveCart } from './cartStorage';

type CartAction =
  | { type: 'ADD_ITEM'; product: ProductCardModel }
  | { type: 'INCREMENT_ITEM'; productId: string }
  | { type: 'DECREMENT_ITEM'; productId: string }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'CLEAR_CART' }
  | { type: 'HYDRATE_CART'; state: CartState };

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: ProductCardModel) => void;
  incrementItem: (productId: string) => void;
  decrementItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
};

const CartContext = createContext<CartContextValue | null>(null);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE_CART':
      return action.state;
    case 'ADD_ITEM': {
      const existing = state.items.find(item => item.productId === action.product.id);
      if (existing) {
        return {
          items: state.items.map(item =>
            item.productId === action.product.id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                  product: { ...item.product, ...action.product }
                }
              : item
          )
        };
      }

      return {
        items: [
          ...state.items,
          {
            productId: action.product.id,
            quantity: 1,
            product: action.product,
            addedAt: Date.now()
          }
        ]
      };
    }
    case 'INCREMENT_ITEM':
      return {
        items: state.items.map(item =>
          item.productId === action.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      };
    case 'DECREMENT_ITEM':
      return {
        items: state.items
          .map(item =>
            item.productId === action.productId
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          .filter(item => item.quantity > 0)
      };
    case 'REMOVE_ITEM':
      return {
        items: state.items.filter(item => item.productId !== action.productId)
      };
    case 'CLEAR_CART':
      return { items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, () => loadCart());

  useEffect(() => {
    saveCart(state);
  }, [state]);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = state.items.reduce((sum, item) => {
      if (item.product.currentPrice === null) {
        return sum;
      }
      return sum + item.product.currentPrice * item.quantity;
    }, 0);

    return {
      items: state.items,
      itemCount: state.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      addItem: product => dispatch({ type: 'ADD_ITEM', product }),
      incrementItem: productId => dispatch({ type: 'INCREMENT_ITEM', productId }),
      decrementItem: productId => dispatch({ type: 'DECREMENT_ITEM', productId }),
      removeItem: productId => dispatch({ type: 'REMOVE_ITEM', productId }),
      clearCart: () => dispatch({ type: 'CLEAR_CART' }),
      getItemQuantity: productId =>
        state.items.find(item => item.productId === productId)?.quantity ?? 0
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
