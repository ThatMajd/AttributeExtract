import { useEffect, useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ExternalLink, FileText, Minus, PackageSearch, Plus, ShieldCheck, ShoppingCart } from 'lucide-react';
import { getProductSnapshot, saveProductSnapshot } from '../../lib/traklin/productCache';
import { getCategoryBySlug } from '../../lib/traklin/config';
import { fetchProductDetail, toAbsoluteProductUrl } from '../../lib/traklin/api';
import { useCart } from '../cart/CartContext';
import type { ProductCardModel, ProductDetailSection, ProductRouteState } from '../../lib/traklin/types';
import { ProductAvailabilitySection } from './ProductAvailabilitySection';

export function ProductDetailPage() {
  const { productId = '' } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state || {}) as ProductRouteState;
  const { addItem, incrementItem, decrementItem, getItemQuantity } = useCart();

  const product = useMemo<ProductCardModel | undefined>(() => {
    if (routeState.product?.id === productId) {
      return routeState.product;
    }

    return getProductSnapshot(productId);
  }, [productId, routeState.product]);

  const category = getCategoryBySlug(routeState.categorySlug || product?.categorySlug || '');
  const quantity = getItemQuantity(productId);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [resolvedProductId, setResolvedProductId] = useState<string | null>(null);
  const [detailTitle, setDetailTitle] = useState<string | null>(null);
  const [detailBrandName, setDetailBrandName] = useState<string | null>(null);
  const [importerName, setImporterName] = useState<string | null>(null);
  const [sku, setSku] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [detailSections, setDetailSections] = useState<ProductDetailSection[]>([]);
  const [shortDescription, setShortDescription] = useState<string | null>(null);
  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({
    description: true,
    technical_spec: false,
    warranty: false,
    important_info: false
  });

  useEffect(() => {
    if (product) {
      saveProductSnapshot(product);
    }
  }, [product]);

  useEffect(() => {
    let isCancelled = false;

    async function loadProductDetail() {
      if (!product?.href) {
        setResolvedProductId(null);
        setDetailTitle(null);
        setDetailBrandName(null);
        setImporterName(null);
        setSku(null);
        setGalleryImages(product?.imageUrl ? [product.imageUrl] : []);
        setSelectedImageUrl(product?.imageUrl ?? null);
        setDetailSections([]);
        setShortDescription(null);
        setDetailError(null);
        return;
      }

      try {
        setDetailLoading(true);
        setDetailError(null);
        const detail = await fetchProductDetail(product.href);

        if (isCancelled) {
          return;
        }

        setResolvedProductId(detail.resolvedProductId);
        setDetailTitle(detail.title);
        setDetailBrandName(detail.brandName);
        setImporterName(detail.importerName);
        setSku(detail.sku);
        setGalleryImages(detail.galleryImages);
        setSelectedImageUrl(detail.imageUrl || detail.galleryImages[0] || product.imageUrl || null);
        setDetailSections(detail.sections);
        setShortDescription(detail.shortDescription);
      } catch {
        if (isCancelled) {
          return;
        }

        setResolvedProductId(null);
        setDetailTitle(null);
        setDetailBrandName(null);
        setImporterName(null);
        setSku(null);
        setGalleryImages(product.imageUrl ? [product.imageUrl] : []);
        setSelectedImageUrl(product.imageUrl ?? null);
        setDetailSections([]);
        setShortDescription(null);
        setDetailError('לא הצלחנו לטעון את פרטי המוצר המלאים כרגע.');
      } finally {
        if (!isCancelled) {
          setDetailLoading(false);
        }
      }
    }

    void loadProductDetail();

    return () => {
      isCancelled = true;
    };
  }, [product]);

  useEffect(() => {
    setOpenPanels({
      description: true,
      technical_spec: false,
      warranty: false,
      important_info: false
    });
  }, [productId]);

  if (!product) {
    return (
      <div className="container" style={{ padding: '1.5rem 1rem 3rem' }}>
        <div className="detail-shell">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <button className="button-outline" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} />
              חזרה
            </button>
            <div className="subtle-pill">פרטי מוצר</div>
          </div>

          <div className="detail-card" style={{ textAlign: 'center', padding: '2rem 1.25rem' }}>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>פרטי המוצר לא זמינים כרגע</h1>
            <p style={{ color: 'var(--color-text-light)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              ניתן לפתוח את הקטלוג מחדש כדי להגיע למוצר, או לחזור לדף הבית. פרטי המוצר המלאים יישמרו אוטומטית לאחר ביקור מהרשימה.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="button-outline" onClick={() => navigate(-1)}>חזור</button>
              <Link className="button-primary" to="/">חזרה לדף הבית</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const absoluteUrl = toAbsoluteProductUrl(product.href);
  const displayTitle = detailTitle || product.title;
  const displayBrandName = detailBrandName || product.brandName || null;
  const displayImageUrl = selectedImageUrl || galleryImages[0] || product.imageUrl || null;
  const availabilityProductId = resolvedProductId || product.id;

  return (
    <div className="container" style={{ padding: '1.25rem 1rem 3rem' }}>
      <div className="detail-shell">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="button-outline" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            חזרה
          </button>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {category && <div className="subtle-pill">{category.label}</div>}
            <div className="subtle-pill">מידע מתוך תוצאות החיפוש</div>
          </div>
        </div>

        <section className="detail-card">
          <div className="detail-hero">
            <div className="detail-image-panel">
              {displayImageUrl ? (
                <img src={displayImageUrl} alt={displayTitle} className="detail-image" />
              ) : (
                <div style={{ color: 'var(--color-text-light)' }}>ללא תמונה</div>
              )}
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                {displayBrandName && (
                  <div className="detail-eyebrow">{displayBrandName}</div>
                )}
                <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', lineHeight: 1.2, marginTop: '0.35rem' }}>
                  {displayTitle}
                </h1>
              </div>

              {(importerName || sku || resolvedProductId) && (
                <div className="detail-meta-grid">
                  {importerName && (
                    <div className="detail-meta-card">
                      <span className="detail-meta-label">יבואן</span>
                      <strong>{importerName}</strong>
                    </div>
                  )}
                  {sku && (
                    <div className="detail-meta-card">
                      <span className="detail-meta-label">מק"ט</span>
                      <strong>{sku}</strong>
                    </div>
                  )}
                  {resolvedProductId && (
                    <div className="detail-meta-card">
                      <span className="detail-meta-label">מזהה מוצר</span>
                      <strong>{resolvedProductId}</strong>
                    </div>
                  )}
                </div>
              )}

              {galleryImages.length > 1 && (
                <div className="detail-gallery-strip" aria-label="גלריית תמונות מוצר">
                  {galleryImages.map(imageUrl => (
                    <button
                      key={imageUrl}
                      type="button"
                      className={`detail-gallery-thumb ${imageUrl === displayImageUrl ? 'is-active' : ''}`}
                      onClick={() => setSelectedImageUrl(imageUrl)}
                    >
                      <img src={imageUrl} alt={displayTitle} />
                    </button>
                  ))}
                </div>
              )}

              {product.badges.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {product.badges.map((badge, index) => (
                    <span key={`${badge}-${index}`} className="subtle-pill">{badge}</span>
                  ))}
                </div>
              )}

              <div className="price-panel">
                {product.originalPrice && product.originalPrice !== product.currentPrice && (
                  <div className="price-strike">
                    {product.originalPrice.toLocaleString()} {product.currencySign ?? '₪'}
                  </div>
                )}
                <div className="price-hero">
                  {product.currentPrice !== null
                    ? `${product.currentPrice.toLocaleString()} ${product.currencySign ?? '₪'}`
                    : 'מחיר לא זמין'}
                </div>
                <div className="price-note">המחיר מוצג מתוך נתוני רשימת המוצרים, לצד תוכן מפורט שנשלף מדף המוצר.</div>
              </div>

              <div className="detail-actions">
                {quantity > 0 ? (
                  <div className="quantity-pill large">
                    <button onClick={() => decrementItem(product.id)} aria-label="Decrease quantity">
                      <Minus size={16} />
                    </button>
                    <span>{quantity}</span>
                    <button onClick={() => incrementItem(product.id)} aria-label="Increase quantity">
                      <Plus size={16} />
                    </button>
                  </div>
                ) : (
                  <button className="button-primary" onClick={() => addItem(product)}>
                    <ShoppingCart size={18} />
                    הוסף לעגלה
                  </button>
                )}
                <a className="button-outline" href={absoluteUrl} target="_blank" rel="noreferrer">
                  <ExternalLink size={18} />
                  פתח ב-Traklin
                </a>
              </div>
            </div>
          </div>
        </section>

        {detailLoading ? (
          <section className="detail-card">
            <div className="availability-state">
              <div className="spinner" />
              <span>טוענים תוכן מפורט מדף המוצר...</span>
            </div>
          </section>
        ) : detailError ? (
          <section className="detail-card">
            <div className="availability-state error">
              <span>{detailError}</span>
            </div>
          </section>
        ) : (
          <>
            {shortDescription && (
              <section className="detail-card">
                <button
                  type="button"
                  className={`detail-section-toggle ${openPanels.description ? 'is-open' : ''}`}
                  onClick={() => togglePanel('description', setOpenPanels)}
                  aria-expanded={openPanels.description}
                >
                  <span className="section-heading">
                    <FileText size={18} />
                    <h2>תיאור מוצר</h2>
                  </span>
                  <ChevronDown size={18} />
                </button>
                {openPanels.description && (
                  <div
                    className="detail-rich-text"
                    dangerouslySetInnerHTML={{ __html: ensureParagraphs(shortDescription) }}
                  />
                )}
              </section>
            )}

            {detailSections
              .filter(section => section.id !== 'description' || !shortDescription)
              .map(section => (
                <section key={section.id} className="detail-card">
                  <button
                    type="button"
                    className={`detail-section-toggle ${openPanels[section.id] ? 'is-open' : ''}`}
                    onClick={() => togglePanel(section.id, setOpenPanels)}
                    aria-expanded={!!openPanels[section.id]}
                  >
                    <span className="section-heading">
                      {getSectionIcon(section.id)}
                      <h2>{section.title}</h2>
                    </span>
                    <ChevronDown size={18} />
                  </button>
                  {openPanels[section.id] && (
                    <div
                      className="detail-rich-text"
                      dangerouslySetInnerHTML={{ __html: section.html }}
                    />
                  )}
                </section>
              ))}
          </>
        )}

        <ProductAvailabilitySection productId={availabilityProductId} />
      </div>
    </div>
  );
}

function getSectionIcon(sectionId: ProductDetailSection['id']) {
  switch (sectionId) {
    case 'technical_spec':
      return <PackageSearch size={18} />;
    case 'warranty':
      return <ShieldCheck size={18} />;
    case 'important_info':
      return <ExternalLink size={18} />;
    default:
      return <FileText size={18} />;
  }
}

function ensureParagraphs(text: string) {
  return text
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => `<p>${line}</p>`)
    .join('');
}

function togglePanel(
  panelId: string,
  setOpenPanels: Dispatch<SetStateAction<Record<string, boolean>>>
) {
  setOpenPanels(prev => ({
    ...prev,
    [panelId]: !prev[panelId]
  }));
}
