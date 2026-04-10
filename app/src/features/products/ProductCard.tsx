import { useNavigate } from 'react-router-dom';
import { ExternalLink, ShoppingCart } from 'lucide-react';
import type { ProductCardModel } from '../../lib/traklin/types';
import { saveProductSnapshot } from '../../lib/traklin/productCache';
import { useCart } from '../cart/CartContext';

export function ProductCard({
  product,
  returnSearch
}: {
  product: ProductCardModel;
  returnSearch?: string;
}) {
  const navigate = useNavigate();
  const { addItem, getItemQuantity } = useCart();
  const quantity = getItemQuantity(product.id);

  const openProduct = () => {
    saveProductSnapshot(product);
    navigate(`/product/${product.id}`, {
      state: {
        product,
        categorySlug: product.categorySlug,
        returnSearch
      }
    });
  };

  return (
    <div className="card product-card" onClick={openProduct} style={{
      display: 'flex',
      flexDirection: 'column',
      cursor: 'pointer',
      height: '100%'
    }}>
      <div style={{
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '180px',
        backgroundColor: '#fff'
      }}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.title} style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }} />
        ) : (
          <div style={{ color: 'var(--color-text-light)' }}>ללא תמונה</div>
        )}
      </div>
      <div style={{
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        gap: '0.5rem',
        borderTop: '1px solid var(--color-border)'
      }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 500, margin: 0, lineHeight: 1.4 }}>
          {product.title}
        </h3>

        <div className="product-meta-row">
          <span className="subtle-link">
            פרטים נוספים
            <ExternalLink size={14} />
          </span>
        </div>
        
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {product.originalPrice && product.originalPrice !== product.currentPrice && (
            <div style={{ textDecoration: 'line-through', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>
              {product.originalPrice.toLocaleString()} {product.currencySign}
            </div>
          )}
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            {product.currentPrice ? `${product.currentPrice.toLocaleString()} ${product.currencySign}` : 'מחיר לא זמין'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              className="button-primary"
              style={{ flex: 1, padding: '0.7rem 0.9rem' }}
              onClick={event => {
                event.stopPropagation();
                addItem(product);
              }}
            >
              <ShoppingCart size={16} />
              הוסף לעגלה
            </button>
            {quantity > 0 && <span className="subtle-pill">בעגלה x{quantity}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
