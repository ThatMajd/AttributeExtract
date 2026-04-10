import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../features/cart/CartContext';
import { CartDrawer } from '../features/cart/CartDrawer';

export function AppShell() {
  const { itemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: '80px' }}>
      <header style={{ 
        backgroundColor: 'var(--color-primary)', 
        color: 'white', 
        padding: 'var(--spacing-4) 0',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: 'var(--shadow-md)'
      }}>
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            padding: '0 1rem'
          }}
        >
          <Link
            to="/"
            style={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: 'clamp(1rem, 4vw, 1.25rem)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              minWidth: 0,
              flex: '1 1 auto',
              justifyContent: 'flex-end',
              whiteSpace: 'nowrap'
            }}
          >
            <span style={{ color: 'var(--color-outline)' }}>⚡</span>
            Traklin Mobile
          </Link>
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              color: 'white',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              border: '1px solid rgba(255,255,255,0.18)',
              padding: '0.55rem 0.85rem',
              borderRadius: '999px',
              backgroundColor: 'rgba(255,255,255,0.08)'
            }}
            aria-label="Open cart"
          >
            <ShoppingCart size={18} />
            <span>עגלה</span>
            <span className="cart-badge">{itemCount}</span>
          </button>
        </div>
      </header>

      <main style={{ flex: 1, padding: 'var(--spacing-4) 0' }}>
        <Outlet />
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
