import { X } from 'lucide-react';

const SORT_OPTIONS = [
  { id: '1', label: 'פופולריות' },
  { id: '2', label: 'מחיר מהנמוך לגבוה' },
  { id: '3', label: 'מחיר מהגבוה לנמוך' },
  { id: '4', label: 'רלוונטיות' }
];

export function SortSheet({
  currentSort,
  onApply,
  onClose
}: {
  currentSort: string | null;
  onApply: (sort: string | null) => void;
  onClose: () => void;
}) {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end'
    }}>
      <div style={{
        backgroundColor: 'var(--color-surface)',
        borderTopLeftRadius: 'var(--radius-xl)',
        borderTopRightRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        direction: 'rtl'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>מיון לפי</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => { onApply(opt.id); onClose(); }}
              style={{
                width: '100%',
                padding: '1rem',
                textAlign: 'right',
                borderRadius: '8px',
                backgroundColor: currentSort === opt.id ? 'var(--color-outline-dim)' : 'transparent',
                fontWeight: currentSort === opt.id ? 'bold' : 'normal',
                color: currentSort === opt.id ? 'var(--color-primary)' : 'var(--color-text)'
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
