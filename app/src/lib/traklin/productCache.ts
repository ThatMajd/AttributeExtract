import type { ProductCardModel } from './types';

export const PRODUCT_CACHE_KEY = 'traklin.product-cache.v1';
const MAX_CACHED_PRODUCTS = 150;

type ProductCacheMap = Record<string, ProductCardModel>;

function loadCache(): ProductCacheMap {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(PRODUCT_CACHE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as ProductCacheMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveCache(cache: ProductCacheMap) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify(cache));
}

function trimCache(cache: ProductCacheMap): ProductCacheMap {
  const entries = Object.entries(cache).sort(([, a], [, b]) => {
    return (b.snapshotAt ?? 0) - (a.snapshotAt ?? 0);
  });

  return Object.fromEntries(entries.slice(0, MAX_CACHED_PRODUCTS));
}

export function saveProductSnapshot(product: ProductCardModel) {
  const cache = loadCache();
  cache[product.id] = {
    ...product,
    snapshotAt: Date.now()
  };
  saveCache(trimCache(cache));
}

export function saveManyProductSnapshots(products: ProductCardModel[]) {
  const cache = loadCache();
  const timestamp = Date.now();

  products.forEach(product => {
    cache[product.id] = {
      ...product,
      snapshotAt: timestamp
    };
  });

  saveCache(trimCache(cache));
}

export function getProductSnapshot(productId: string) {
  return loadCache()[productId];
}
