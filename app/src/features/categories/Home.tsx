import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../../lib/traklin/config';
import { Tv, Monitor, Fan, ChefHat, Microwave, Refrigerator, WashingMachine, Scissors, Headphones, Gamepad2, Hammer } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  tv: <Tv size={32} />,
  display: <Monitor size={32} />,
  fan: <Fan size={32} />,
  oven: <ChefHat size={32} />, // using ChefHat as oven proxy for lucide
  microwave: <Microwave size={32} />,
  refrigerator: <Refrigerator size={32} />,
  washer: <WashingMachine size={32} />,
  hairdryer: <Scissors size={32} />, // fallback proxy
  headphones: <Headphones size={32} />,
  gamecontroller: <Gamepad2 size={32} />,
  hammer: <Hammer size={32} />
};

export function Home() {
  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-primary)' }}>Categories</h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '1rem',
        direction: 'rtl'
      }}>
        {categories.map((cat) => (
          <Link key={cat.slug} to={`/category/${cat.slug}`} className="card" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem 1rem',
            textAlign: 'center',
            height: '140px'
          }}>
            <div className="icon-wrapper" style={{ marginBottom: '0.5rem' }}>
              {iconMap[cat.iconKey] || <Tv size={32} />}
            </div>
            <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{cat.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
