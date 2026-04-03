export type CategoryConfig = {
  slug: string;
  label: string;
  fkContentId: number;
  iconKey: string;
  sourceUrl: string;
  filters: FilterGroup[];
  priorityGroupNames: string[];
};

export type FilterGroup = {
  groupId: string;
  groupName: string;
  param: "pm" | "pfacg" | "prange";
  options: FilterOption[];
};

export type FilterOption = {
  id: number | string;
  label: string;
  count?: number;
  param: "pm" | "pfacg";
};

export type ProductQueryState = {
  categorySlug: string;
  fkContentId: number;
  page: number;
  sort: string | null;
  brandIds: number[];
  facetIds: number[];
  priceRange: {
    min: number | null;
    max: number | null;
  };
};

export type ProductCardModel = {
  id: string;
  title: string;
  href: string;
  imageUrl: string | null;
  currentPrice: number | null;
  originalPrice: number | null;
  currencySign: string | null;
  badges: string[];
  categorySlug?: string;
  brandName?: string | null;
  sourceCategoryLabel?: string | null;
  snapshotAt?: number;
};

export type ProductResultsPage = {
  currentPage: number;
  hasMore: boolean;
  nextPageUrl: string | null;
  products: ProductCardModel[];
  rawCountText?: string | null;
};

export type CartItem = {
  productId: string;
  quantity: number;
  product: ProductCardModel;
  addedAt: number;
};

export type CartState = {
  items: CartItem[];
};

export type AvailabilityStatus = 'unknown' | 'placeholder';

export type StoreAvailabilityPlaceholder = {
  status: AvailabilityStatus;
  preferredStoreLabel: string;
  message: string;
};

export type ProductRouteState = {
  product?: ProductCardModel;
  categorySlug?: string;
  returnSearch?: string;
};
