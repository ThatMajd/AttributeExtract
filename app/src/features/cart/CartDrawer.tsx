import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { useCart } from './CartContext';
import { toAbsoluteProductUrl } from '../../lib/traklin/api';

export function CartDrawer({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { items, subtotal, incrementItem, decrementItem, removeItem, clearCart } = useCart();
  const hasMissingPrices = items.some(item => item.product.currentPrice === null);

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        zIndex: 30,
        display: 'flex',
        justifyContent: 'flex-start'
      }}
      onClick={onClose}
    >
      <aside
        style={{
          width: 'min(92vw, 420px)',
          height: '100%',
          backgroundColor: 'var(--color-surface)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={event => event.stopPropagation()}
      >
        <header
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="subtle-pill">
              <ShoppingCart size={16} />
              עגלה
            </div>
            <strong>{items.length} מוצרים שונים</strong>
          </div>
          <button onClick={onClose} aria-label="Close cart">
            <X size={20} />
          </button>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {items.length === 0 ? (
            <div
              style={{
                minHeight: '50vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                color: 'var(--color-text-light)',
                gap: '0.75rem'
              }}
            >
              <ShoppingCart size={30} />
              <strong style={{ color: 'var(--color-text)' }}>העגלה ריקה</strong>
              <span>הוסף מוצרים מהקטלוג כדי לראות אותם כאן.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {items.map(item => (
                <div key={item.productId} className="card" style={{ padding: '0.85rem' }}>
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '12px',
                        backgroundColor: '#fff',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}
                    >
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.title}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>ללא תמונה</span>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link
                        to={`/product/${item.productId}`}
                        state={{ product: item.product, categorySlug: item.product.categorySlug }}
                        onClick={onClose}
                        style={{
                          display: 'block',
                          fontWeight: 600,
                          lineHeight: 1.4,
                          color: 'var(--color-text)'
                        }}
                      >
                        {item.product.title}
                      </Link>
                      <div style={{ marginTop: '0.35rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                        {item.product.currentPrice !== null
                          ? `${item.product.currentPrice.toLocaleString()} ${item.product.currencySign ?? '₪'}`
                          : 'מחיר לא זמין'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                        <div className="quantity-pill">
                          <button onClick={() => decrementItem(item.productId)} aria-label="Decrease quantity">
                            <Minus size={14} />
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => incrementItem(item.productId)} aria-label="Increase quantity">
                            <Plus size={14} />
                          </button>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="icon-button" onClick={() => removeItem(item.productId)} aria-label="Remove item">
                            <Trash2 size={16} />
                          </button>
                          <a
                            href={toAbsoluteProductUrl(item.product.href)}
                            target="_blank"
                            rel="noreferrer"
                            className="icon-button"
                            aria-label="View on Traklin"
                          >
                            פתח
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border)', padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 700 }}>
            <span>סכום ביניים</span>
            <span>{subtotal.toLocaleString()} ₪</span>
          </div>
          {hasMissingPrices && (
            <div style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              חלק מהמוצרים ללא מחיר, ולכן הסכום חלקי בלבד.
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="button-outline" style={{ flex: 1 }} onClick={clearCart} disabled={items.length === 0}>
              רוקן עגלה
            </button>
            <button className="button-primary" style={{ flex: 1 }} disabled>
              Checkout later
            </button>
          </div>
        </footer>
      </aside>
    </div>
  );
}
