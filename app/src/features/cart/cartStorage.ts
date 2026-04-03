import type { CartState } from '../../lib/traklin/types';

export const CART_STORAGE_KEY = 'traklin.cart.v1';

const EMPTY_CART: CartState = { items: [] };

export function loadCart(): CartState {
  if (typeof window === 'undefined') {
    return EMPTY_CART;
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return EMPTY_CART;
    }

    const parsed = JSON.parse(raw) as Partial<CartState>;
    if (!parsed || !Array.isArray(parsed.items)) {
      return EMPTY_CART;
    }

    return {
      items: parsed.items.filter(Boolean)
    };
  } catch {
    return EMPTY_CART;
  }
}

export function saveCart(state: CartState) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
}
