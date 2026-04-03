import { useState } from 'react';
import type { CategoryConfig, ProductQueryState } from '../../lib/traklin/types';
import { X, ChevronDown, ChevronUp, Check } from 'lucide-react';

export function FilterSheet({
  config,
  query,
  onApply,
  onClose
}: {
  config: CategoryConfig;
  query: ProductQueryState;
  onApply: (newQuery: Partial<ProductQueryState>) => void;
  onClose: () => void;
}) {
  const [localQuery, setLocalQuery] = useState<ProductQueryState>(query);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const toggleAccordion = (groupId: string) => {
    setOpenAccordion(openAccordion === groupId ? null : groupId);
  };

  const toggleBrand = (id: number) => {
    setLocalQuery(prev => ({
      ...prev,
      brandIds: prev.brandIds.includes(id) 
        ? prev.brandIds.filter(b => b !== id)
        : [...prev.brandIds, id]
    }));
  };

  const toggleFacet = (id: number) => {
    setLocalQuery(prev => ({
      ...prev,
      facetIds: prev.facetIds.includes(id) 
        ? prev.facetIds.filter(f => f !== id)
        : [...prev.facetIds, id]
    }));
  };

  const handleApply = () => {
    onApply(localQuery);
  };

  const handleReset = () => {
    setLocalQuery(prev => ({
      ...prev,
      brandIds: [],
      facetIds: [],
      priceRange: { min: null, max: null }
    }));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'var(--color-surface)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      direction: 'rtl'
    }}>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--color-primary)' }}>סינון</h2>
        <button onClick={onClose} style={{ color: 'var(--color-text)' }}>
          <X size={24} />
        </button>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {config.filters.map(group => {
          const isOpen = openAccordion === group.groupId;
          
          let selectedCount = 0;
          if (group.param === 'pm') {
            selectedCount = group.options.filter(o => localQuery.brandIds.includes(Number(o.id))).length;
          } else if (group.param === 'pfacg') {
            selectedCount = group.options.filter(o => localQuery.facetIds.includes(Number(o.id))).length;
          } else if (group.param === 'prange') {
            if (localQuery.priceRange.min !== null || localQuery.priceRange.max !== null) selectedCount = 1;
          }

          if (group.options.length === 0 && group.param !== 'prange') return null;

          return (
            <div key={group.groupId} style={{ borderBottom: '1px solid var(--color-border)' }}>
              <button
                onClick={() => toggleAccordion(group.groupId)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 0',
                  color: 'var(--color-text)',
                  fontWeight: 500
                }}
              >
                <span>
                  {group.groupName} {selectedCount > 0 && <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>({selectedCount})</span>}
                </span>
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {isOpen && (
                <div style={{ paddingBottom: '1rem' }}>
                  {group.param === 'prange' ? (
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <input 
                        type="number" 
                        placeholder="ממחיר"
                        value={localQuery.priceRange.min || ''}
                        onChange={e => setLocalQuery(prev => ({ ...prev, priceRange: { ...prev.priceRange, min: e.target.value ? Number(e.target.value) : null } }))}
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                      />
                      <span>-</span>
                      <input 
                        type="number" 
                        placeholder="עד מחיר"
                        value={localQuery.priceRange.max || ''}
                        onChange={e => setLocalQuery(prev => ({ ...prev, priceRange: { ...prev.priceRange, max: e.target.value ? Number(e.target.value) : null } }))}
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                      />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {group.options.map(opt => {
                        const optId = Number(opt.id);
                        const isSelected = group.param === 'pm' ? localQuery.brandIds.includes(optId) : localQuery.facetIds.includes(optId);
                        
                        return (
                          <label 
                            key={opt.id} 
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                            onClick={(e) => {
                              e.preventDefault();
                              if (group.param === 'pm') toggleBrand(optId);
                              else if (group.param === 'pfacg') toggleFacet(optId);
                            }}
                          >
                            <div style={{
                              width: '20px', height: '20px', 
                              border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                              backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                              borderRadius: '4px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              {isSelected && <Check size={14} color="white" />}
                            </div>
                            <span style={{ fontSize: '0.9rem' }}>{opt.label}</span>
                            {opt.count !== undefined && <span style={{ color: 'var(--color-text-light)', fontSize: '0.8rem', marginRight: 'auto' }}>({opt.count})</span>}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <footer style={{
        padding: '1rem',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        gap: '1rem',
        backgroundColor: 'var(--color-surface)'
      }}>
        <button className="button-primary" style={{ flex: 1 }} onClick={handleApply}>
          החל סינון
        </button>
        <button className="button-outline" onClick={handleReset}>
          נקה הכל
        </button>
      </footer>
    </div>
  );
}
