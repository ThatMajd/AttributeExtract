import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getCategoryBySlug } from '../../lib/traklin/config';
import { fetchProducts } from '../../lib/traklin/api';
import type { ProductQueryState, ProductResultsPage } from '../../lib/traklin/types';
import { ProductCard } from './ProductCard';
import { FilterSheet } from '../filters/FilterSheet';
import { SortSheet } from '../filters/SortSheet';
import { saveManyProductSnapshots } from '../../lib/traklin/productCache';
import { SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const category = getCategoryBySlug(slug || '');

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [results, setResults] = useState<ProductResultsPage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Deserialize query from URL
  const query: ProductQueryState = React.useMemo(() => {
    return {
      categorySlug: slug || '',
      fkContentId: category?.fkContentId || 0,
      page: Number(searchParams.get('page')) || 1,
      sort: searchParams.get('st'),
      brandIds: searchParams.get('pm')?.split(',').filter(Boolean).map(Number) || [],
      facetIds: searchParams.get('pfacg')?.split(',').filter(Boolean).map(Number) || [],
      priceRange: {
        min: searchParams.has('min') ? Number(searchParams.get('min')) : null,
        max: searchParams.has('max') ? Number(searchParams.get('max')) : null,
      }
    };
  }, [searchParams, slug, category]);

  const loadData = useCallback(async (q: ProductQueryState, append = false) => {
    if (!category) return;
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      const data = await fetchProducts(q);
      const enrichedProducts = data.products.map(product => ({
        ...product,
        categorySlug: category.slug,
        sourceCategoryLabel: category.label
      }));

      saveManyProductSnapshots(enrichedProducts);

      setResults(prev => append && prev ? {
        ...data,
        products: [...prev.products, ...enrichedProducts]
      } : {
        ...data,
        products: enrichedProducts
      });

    } catch (err) {
      setError('שגיאה בטעינת הנתונים. אנא נסה שוב.');
    } finally {
      if (!append) setLoading(false);
      else setLoadingMore(false);
    }
  }, [category]);

  useEffect(() => {
    loadData(query, false);
  }, [searchParams, slug]); // Reload entirely if URL changes

  if (!category) {
    return <div className="container" style={{ padding: '2rem' }}>קטגוריה לא נמצאה</div>;
  }

  const updateURL = (newQuery: Partial<ProductQueryState>) => {
    const q = { ...query, ...newQuery };
    const p = new URLSearchParams();
    
    if (q.page > 1) p.set('page', String(q.page));
    if (q.sort) p.set('st', q.sort);
    if (q.brandIds.length > 0) p.set('pm', q.brandIds.join(','));
    if (q.facetIds.length > 0) p.set('pfacg', q.facetIds.join(','));
    if (q.priceRange.min !== null) p.set('min', String(q.priceRange.min));
    if (q.priceRange.max !== null) p.set('max', String(q.priceRange.max));
    
    setSearchParams(p);
  };

  const handleApplyFilters = (newQ: Partial<ProductQueryState>) => {
    // any filter change resets page to 1
    newQ.page = 1;
    updateURL(newQ);
    setIsFilterOpen(false);
  };

  const handleLoadMore = () => {
    if (results?.hasMore && !loadingMore) {
      updateURL({ page: query.page + 1 });
    }
  };

  const removeChip = (type: string, val: number | string) => {
    if (type === 'pm') {
      updateURL({ brandIds: query.brandIds.filter(id => id !== val), page: 1 });
    } else if (type === 'pfacg') {
      updateURL({ facetIds: query.facetIds.filter(id => id !== val), page: 1 });
    } else if (type === 'prange') {
      updateURL({ priceRange: { min: null, max: null }, page: 1 });
    }
  };

  const clearAllFilters = () => {
    updateURL({ brandIds: [], facetIds: [], priceRange: { min: null, max: null }, page: 1 });
  };

  // Build chips list
  const activeChips = [];
  query.brandIds.forEach(id => {
    const opt = category.filters.find(f => f.param === 'pm')?.options.find(o => Number(o.id) === id);
    if (opt) activeChips.push({ type: 'pm', val: id, label: opt.label });
  });
  query.facetIds.forEach(id => {
    const opt = category.filters.flatMap(f => f.options).find(o => Number(o.id) === id);
    if (opt) activeChips.push({ type: 'pfacg', val: id, label: opt.label });
  });
  if (query.priceRange.min !== null || query.priceRange.max !== null) {
    const l = `מחיר: ${query.priceRange.min || 0} - ${query.priceRange.max || '...'} ₪`;
    activeChips.push({ type: 'prange', val: 'range', label: l });
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', direction: 'rtl' }}>
      
      {/* Sticky header area */}
      <div style={{ position: 'sticky', top: '70px', zIndex: 5, backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ padding: '0.5rem 1rem' }}>
          <h1 style={{ fontSize: '1.25rem', marginBottom: '1rem', marginTop: '0.5rem' }}>{category.label} {results?.rawCountText && <span style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', fontWeight: 400 }}>({results.rawCountText})</span>}</h1>
          
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: activeChips.length > 0 ? '1rem' : '0.5rem' }}>
            <button className="button-outline" onClick={() => setIsFilterOpen(true)} style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', flex: 1 }}>
              <SlidersHorizontal size={18} />
              סינון {activeChips.length > 0 && `(${activeChips.length})`}
            </button>
            <button className="button-outline" onClick={() => setIsSortOpen(true)} style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', flex: 1 }}>
              <ArrowUpDown size={18} />
              מיון
            </button>
          </div>

          {activeChips.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {activeChips.map((chip, i) => (
                <div key={i} className="chip">
                  <span>{chip.label}</span>
                  <button onClick={() => removeChip(chip.type, chip.val)} aria-label={`Remove ${chip.label}`}>
                    <X size={14} />
                  </button>
                </div>
              ))}
              <div className="chip" style={{ backgroundColor: 'var(--color-outline-dim)', borderColor: 'var(--color-outline)' }}>
                 <button onClick={clearAllFilters} style={{ color: 'var(--color-primary)' }}>נקה הכל</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container" style={{ padding: '1rem' }}>
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '1rem'
          }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="skeleton" style={{ height: '240px', borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'red' }}>
            <p>{error}</p>
            <button className="button-primary" style={{ marginTop: '1rem' }} onClick={() => loadData(query, false)}>נסה שוב</button>
          </div>
        ) : results?.products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <h2 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>לא נמצאו מוצרים</h2>
            <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem' }}>נסה להסיר חלק מהסינונים</p>
            {activeChips.length > 0 && (
              <button className="button-outline" onClick={clearAllFilters}>נקה הכל</button>
            )}
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '1rem' // Adjusted spacing rhythm
            }}>
              {results?.products.map(p => (
                <ProductCard key={p.id} product={p} returnSearch={searchParams.toString()} />
              ))}
            </div>

            {results?.hasMore && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', marginBottom: '2rem' }}>
                <button 
                  className="button-primary" 
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  style={{ width: '100%', maxWidth: '300px' }}
                >
                  {loadingMore ? <div className="spinner" /> : 'טען עוד מוצרים'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {isFilterOpen && (
        <FilterSheet 
          config={category} 
          query={query} 
          onApply={handleApplyFilters} 
          onClose={() => setIsFilterOpen(false)} 
        />
      )}
      
      {isSortOpen && (
        <SortSheet 
          currentSort={query.sort} 
          onApply={(st) => updateURL({ sort: st, page: 1 })} 
          onClose={() => setIsSortOpen(false)} 
        />
      )}
    </div>
  );
}
