import type { ProductQueryState, ProductResultsPage, ProductCardModel } from './types';

export async function fetchProducts(query: ProductQueryState): Promise<ProductResultsPage> {
  const params = new URLSearchParams();
  params.append('fk_content_id', query.fkContentId.toString());
  params.append('page_number', query.page.toString());
  params.append('vs', '0');
  params.append('t', Date.now().toString());

  if (query.brandIds.length > 0) {
    params.append('pm', query.brandIds.join(','));
  }
  if (query.facetIds.length > 0) {
    params.append('pfacg', query.facetIds.join(','));
  }
  if (query.priceRange.min !== null || query.priceRange.max !== null) {
    const min = query.priceRange.min === null ? '' : query.priceRange.min;
    const max = query.priceRange.max === null ? '' : query.priceRange.max;
    params.append('prange', `${min},${max}`);
  }
  if (query.sort) {
    params.append('st', query.sort);
  }

  const response = await fetch(`/ajax/category_contents.ashx?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch from Traklin API');
  }

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    // some responses could have malformed JSON or wrap it weirdly
    console.warn("JSON Parse Error, trying fallback", err);
    throw err;
  }

  return normalizeResponse(data, query.page);
}

function normalizeResponse(data: any, requestedPage: number): ProductResultsPage {
  const contents = data.Contents || [];
  
  const products: ProductCardModel[] = contents.map((item: any) => ({
    id: item.Pk_content_id?.toString() || Math.random().toString(),
    title: decodeHTMLEntities(item.Name || ''),
    href: item.Url || '',
    imageUrl: item.Img_src || null,
    currentPrice: parsePrice(item.Price),
    originalPrice: parsePrice(item.List_price),
    currencySign: decodeHTMLEntities(item.Currency_sign || '₪'),
    badges: item.Badges || [],
    brandName: decodeHTMLEntities(item.Manufacturer_name || item.Manufacturer || '') || null
  }));

  const hasMore = !!data.Next_data_json_url;

  return {
    currentPage: typeof data.Current_page_number === 'number' ? data.Current_page_number : requestedPage,
    hasMore,
    nextPageUrl: data.Next_data_json_url || null,
    products,
    rawCountText: data.CountText || null
  };
}

function parsePrice(val: any): number | null {
  if (!val) return null;
  if (typeof val === 'number') return val;
  const str = String(val).replace(/,/g, '').replace(/[^\d.]/g, '');
  if (!str) return null;
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

function decodeHTMLEntities(text: string): string {
  if (!text) return '';
  return text.replace(/&#(?:x([\da-f]+)|(\d+));/ig, (_, hex, dec) => {
    return String.fromCharCode(dec ? parseInt(dec, 10) : parseInt(hex, 16));
  }).replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

export function toAbsoluteProductUrl(href: string) {
  if (!href) {
    return 'https://www.traklin.co.il';
  }

  if (href.startsWith('http')) {
    return href;
  }

  return `https://www.traklin.co.il${href.startsWith('/') ? href : `/${href}`}`;
}
