import type {
  AvailabilityStatus,
  ProductAvailabilityResponse,
  ProductBranchAvailability,
  ProductCardModel,
  ProductDetailModel,
  ProductDetailSection,
  ProductDetailSectionId,
  ProductQueryState,
  ProductResultsPage
} from './types';

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

export async function fetchProductAvailability(productId: string): Promise<ProductAvailabilityResponse> {
  const body = new URLSearchParams();
  body.append('action', 'get_prod_stock');
  body.append('pk_product_id', productId);

  const response = await fetch('/ajax/product_stock.ashx', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    body: body.toString()
  });

  if (!response.ok) {
    throw new Error('Failed to fetch product availability');
  }

  const html = await response.text();

  return {
    productId,
    branches: parseProductAvailabilityHtml(html)
  };
}

export async function fetchProductDetail(productUrl: string): Promise<ProductDetailModel> {
  const proxiedUrl = toTraklinProxyPath(productUrl);
  const response = await fetch(proxiedUrl, {
    headers: {
      Accept: 'text/html, application/xhtml+xml'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch product detail page');
  }

  const html = await response.text();
  return parseProductDetailHtml(html, productUrl);
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

export function parseProductDetailHtml(html: string, sourceUrl: string): ProductDetailModel {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const title = cleanText(doc.querySelector('#h1')?.textContent) || cleanText(doc.title) || 'פרטי מוצר';
  const brandName = readBrandName(doc);
  const importerName = extractLabeledValue(doc, 'יבואן');
  const sku = extractLabeledValue(doc, 'מק"ט');
  const resolvedProductId = cleanText(doc.querySelector('#hdn_fk_product_id')?.getAttribute('value')) || null;
  const imageUrl = toAbsoluteProductUrl(
    doc.querySelector<HTMLImageElement>('#prod_main_img')?.getAttribute('src') || ''
  ) || null;
  const galleryImages = extractGalleryImages(doc, imageUrl);
  const shortDescription = extractSectionText(doc, '#divShortDescription');
  const sections = extractDetailSections(doc);

  return {
    sourceUrl,
    resolvedProductId,
    title,
    brandName,
    importerName,
    sku,
    imageUrl,
    galleryImages,
    shortDescription,
    sections,
    fetchedAt: Date.now()
  };
}

function parseProductAvailabilityHtml(html: string): ProductBranchAvailability[] {
  if (!html || !html.includes('branch_name')) {
    return [];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const items = Array.from(doc.querySelectorAll('li'));

  return items.flatMap(item => {
    const onclick = item.getAttribute('onclick') ?? '';
    const branchIdMatch = onclick.match(/ShowBranchInfo\((\d+)\)/);
    const branchName = item.querySelector('.branch_name')?.textContent?.trim() ?? '';

    if (!branchIdMatch || !branchName) {
      return [];
    }

    const icons = Array.from(item.querySelectorAll('em'));

    return [
      {
        branchId: Number(branchIdMatch[1]),
        branchName,
        pickupImmediate: readAvailabilityStatus(icons, 'icn_in_stock', 'icn_out_of_stock'),
        displayAvailable: readAvailabilityStatus(icons, 'icn_stock_search_on', 'icn_stock_search_off'),
        pickupOrderable: readAvailabilityStatus(icons, 'icn_pick_up_on', 'icn_pick_up_off')
      }
    ];
  });
}

function extractGalleryImages(doc: Document, mainImageUrl: string | null): string[] {
  const seen = new Set<string>();
  const galleryCandidates = [
    ...(mainImageUrl ? [mainImageUrl] : []),
    ...Array.from(doc.querySelectorAll<HTMLImageElement>('#product_gallery img'))
      .map(img => img.getAttribute('src') || ''),
    ...Array.from(doc.querySelectorAll<HTMLElement>('#product_gallery .t_prod_img_wrap'))
      .map(node => {
        const onclick = node.getAttribute('onclick') || '';
        const match = onclick.match(/SetGalleryBigImg\(this,'([^']+)'\)/);
        return match?.[1] || '';
      })
  ];

  return galleryCandidates.flatMap(candidate => {
    const absoluteUrl = toAbsoluteProductUrl(candidate);
    if (!absoluteUrl || seen.has(absoluteUrl)) {
      return [];
    }

    seen.add(absoluteUrl);
    return [absoluteUrl];
  });
}

function extractDetailSections(doc: Document): ProductDetailSection[] {
  const sections: Array<{ id: ProductDetailSectionId; selector: string; fallbackTitle: string }> = [
    { id: 'description', selector: '#divShortDescription', fallbackTitle: 'תיאור מוצר' },
    { id: 'technical_spec', selector: '#divFullDescription', fallbackTitle: 'מפרט טכני מלא' },
    { id: 'warranty', selector: '#divTermsAndWarranty', fallbackTitle: 'תנאים ואחריות' },
    { id: 'important_info', selector: '#divAsterisks', fallbackTitle: 'מידע חשוב' }
  ];

  return sections.flatMap(section => {
    const node = doc.querySelector(section.selector);
    const html = normalizeSectionHtml(node);

    if (!html) {
      return [];
    }

    const title =
      cleanText(node?.closest('section')?.querySelector('.section_header')?.textContent) ||
      section.fallbackTitle;

    return [{ id: section.id, title, html }];
  });
}

function extractSectionText(doc: Document, selector: string): string | null {
  const html = normalizeSectionHtml(doc.querySelector(selector));
  if (!html) {
    return null;
  }

  const node = document.createElement('div');
  node.innerHTML = html;
  return cleanText(node.textContent) || null;
}

function normalizeSectionHtml(node: Element | null): string {
  if (!node) {
    return '';
  }

  const clone = node.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('script, style, noscript').forEach(element => element.remove());

  clone.querySelectorAll('*').forEach(element => {
    for (const attr of Array.from(element.attributes)) {
      const name = attr.name.toLowerCase();
      if (name === 'href' || name === 'target' || name === 'rel') {
        continue;
      }
      element.removeAttribute(attr.name);
    }
  });

  clone.querySelectorAll('a[href]').forEach(anchor => {
    const href = anchor.getAttribute('href') || '';
    anchor.setAttribute('href', toAbsoluteProductUrl(href));
    anchor.setAttribute('rel', 'noreferrer');
    anchor.setAttribute('target', '_blank');
  });

  clone.querySelectorAll('div, p, span, strong, em, h1, h2, h3, h4, h5, h6').forEach(element => {
    if (element.tagName === 'DIV' && element.children.length === 0) {
      const text = cleanText(element.textContent);
      if (text) {
        element.outerHTML = `<p>${escapeHtml(text)}</p>`;
      }
    }
  });

  const html = clone.innerHTML
    .replace(/<p>\s*(?:&nbsp;|\u00a0|\s)*<\/p>/gi, '')
    .replace(/<h[1-6]>\s*(?:&nbsp;|\u00a0|\s)*<\/h[1-6]>/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return html;
}

function readBrandName(doc: Document): string | null {
  const brandLink = cleanText(doc.querySelector('.prod_gline_info a')?.textContent);
  if (brandLink) {
    return brandLink;
  }

  const altText = cleanText(doc.querySelector('.manufacturer_img_wrap img')?.getAttribute('alt'));
  if (!altText) {
    return null;
  }

  return altText.replace(/\s+logo$/i, '').trim() || null;
}

function extractLabeledValue(doc: Document, label: string): string | null {
  const wrap = doc.querySelector('.prod_gline_info > div');
  if (!wrap) {
    return null;
  }

  const text = cleanText(wrap.textContent);
  if (!text) {
    return null;
  }

  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = text.match(new RegExp(`${escapedLabel}\\s*:?\\s*([^\\n]+?)(?=(?:מותג|יבואן|מק\"ט|מק״ט)\\s*:|$)`));
  return cleanText(match?.[1]) || null;
}

function readAvailabilityStatus(
  icons: Element[],
  positiveClassName: string,
  negativeClassName: string
): AvailabilityStatus {
  if (icons.some(icon => icon.classList.contains(positiveClassName))) {
    return 'available';
  }

  if (icons.some(icon => icon.classList.contains(negativeClassName))) {
    return 'unavailable';
  }

  return 'unknown';
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

function cleanText(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  return decodeHTMLEntities(value)
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toTraklinProxyPath(url: string) {
  if (!url) {
    throw new Error('Missing product URL');
  }

  if (url.startsWith('http')) {
    const parsed = new URL(url);
    return `/traklin-page${parsed.pathname}${parsed.search}`;
  }

  return `/traklin-page${url.startsWith('/') ? url : `/${url}`}`;
}

export function toAbsoluteProductUrl(href: string) {
  if (!href) {
    return '';
  }

  if (href.startsWith('http')) {
    return href;
  }

  return `https://www.traklin.co.il${href.startsWith('/') ? href : `/${href}`}`;
}
