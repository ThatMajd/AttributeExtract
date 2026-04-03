import { useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, MapPinned, Minus, PackageCheck, Plus, ShoppingCart } from 'lucide-react';
import { getProductSnapshot, saveProductSnapshot } from '../../lib/traklin/productCache';
import { getCategoryBySlug } from '../../lib/traklin/config';
import { toAbsoluteProductUrl } from '../../lib/traklin/api';
import { useCart } from '../cart/CartContext';
import type { ProductCardModel, ProductRouteState, StoreAvailabilityPlaceholder } from '../../lib/traklin/types';

const availabilityPlaceholder: StoreAvailabilityPlaceholder = {
  status: 'placeholder',
  preferredStoreLabel: 'סניף מועדף',
  message: 'חיווי מלאי ומפת סניפים יחוברו בשלב הבא.'
};

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

  useEffect(() => {
    if (product) {
      saveProductSnapshot(product);
    }
  }, [product]);

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
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.title} className="detail-image" />
              ) : (
                <div style={{ color: 'var(--color-text-light)' }}>ללא תמונה</div>
              )}
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                {product.brandName && (
                  <div className="detail-eyebrow">{product.brandName}</div>
                )}
                <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', lineHeight: 1.2, marginTop: '0.35rem' }}>
                  {product.title}
                </h1>
              </div>

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
                <div className="price-note">התצוגה נשענת על נתוני רשימת המוצרים השמורים באפליקציה.</div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
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

        <section className="detail-grid">
          <div className="detail-card">
            <div className="section-heading">
              <PackageCheck size={18} />
              <h2>זמינות בסניף</h2>
            </div>
            <div className="availability-card">
              <div className="availability-row">
                <span className="availability-label">סניף נבחר</span>
                <strong>{availabilityPlaceholder.preferredStoreLabel}</strong>
              </div>
              <div className="availability-row">
                <span className="availability-label">סטטוס</span>
                <span className="availability-tag">Placeholder</span>
              </div>
              <p style={{ color: 'var(--color-text-light)', lineHeight: 1.6 }}>
                {availabilityPlaceholder.message}
              </p>
            </div>
          </div>

          <div className="detail-card">
            <div className="section-heading">
              <MapPinned size={18} />
              <h2>מפת זמינות</h2>
            </div>
            <div className="map-placeholder">
              <div className="map-grid" />
              <div className="map-content">
                <strong>Map placeholder</strong>
                <span>כאן תוצג מפת הסניפים והזמינות של המוצר.</span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <span className="map-legend neutral">Unknown</span>
                  <span className="map-legend muted">Unavailable</span>
                  <span className="map-legend accent">Available</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
