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

export type ProductDetailSectionId =
  | 'description'
  | 'technical_spec'
  | 'warranty'
  | 'important_info';

export type ProductDetailSection = {
  id: ProductDetailSectionId;
  title: string;
  html: string;
};

export type ProductDetailModel = {
  sourceUrl: string;
  resolvedProductId: string | null;
  title: string;
  brandName: string | null;
  importerName: string | null;
  sku: string | null;
  imageUrl: string | null;
  galleryImages: string[];
  shortDescription: string | null;
  sections: ProductDetailSection[];
  fetchedAt: number;
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

export type AvailabilityStatus = 'available' | 'unavailable' | 'unknown';

export type BranchCatalogEntry = {
  id: number;
  name: string;
  city: string;
  showOnMap: boolean;
  lat?: number;
  lng?: number;
};

export type ProductBranchAvailability = {
  branchId: number;
  branchName: string;
  pickupImmediate: AvailabilityStatus;
  displayAvailable: AvailabilityStatus;
  pickupOrderable: AvailabilityStatus;
};

export type ProductAvailabilityResponse = {
  productId: string;
  branches: ProductBranchAvailability[];
};

export type PreferredBranchState = {
  preferredBranchId: number;
  updatedAt: number;
};

export type ProductRouteState = {
  product?: ProductCardModel;
  categorySlug?: string;
  returnSearch?: string;
};
