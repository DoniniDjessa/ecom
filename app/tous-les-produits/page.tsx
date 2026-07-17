'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';
import styles from './tous-les-produits.module.css';

type CatOption = { label: string; value: string };

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name';

function TousLesProduitsContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('cat') || 'all';

  const [active, setActive] = useState(initialCat);
  const [categories, setCategories] = useState<CatOption[]>([{ label: 'Tous', value: 'all' }]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(500000);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [onlyNew, setOnlyNew] = useState(false);
  const [onlyBestseller, setOnlyBestseller] = useState(false);
  const [onlySale, setOnlySale] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    const cat = searchParams.get('cat');
    if (cat) setActive(cat);
  }, [searchParams]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          supabase.from('ecom-products').select('*').order('created_at', { ascending: false }),
          supabase.from('ecom-categories').select('id, label, sort_order').order('sort_order', { ascending: true }),
        ]);

        if (productsRes.error) throw productsRes.error;
        if (categoriesRes.error) throw categoriesRes.error;

        const mapped = (productsRes.data || []).map((p: any) => ({
          ...p,
          nameFr: p.name_fr || p.name || 'Produit Bling Store',
          image: p.images?.[0] || '/images/placeholder.jpg',
          isBestseller: Boolean(p.is_bestseller),
          isNew: Boolean(p.is_new),
        }));
        setProducts(mapped);

        const catOptions: CatOption[] = [
          { label: 'Tous', value: 'all' },
          ...(categoriesRes.data || []).map((cat) => ({
            label: cat.label || cat.id,
            value: cat.id,
          })),
        ];
        setCategories(catOptions);

        if (mapped.length > 0) {
          const prices = mapped.map((p) => Number(p.price) || 0);
          const max = Math.max(...prices, 50000);
          const rounded = Math.ceil(max / 1000) * 1000 || 500000;
          setPriceMax(rounded);
        }
      } catch (err) {
        console.error('Error loading products page:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const maxPriceBound = useMemo(() => {
    if (products.length === 0) return 500000;
    const max = Math.max(...products.map((p) => Number(p.price) || 0), 0);
    return Math.ceil(max / 1000) * 1000 || 500000;
  }, [products]);

  const activeFiltersCount = [
    search.trim() !== '',
    priceMin > 0,
    priceMax < maxPriceBound,
    onlyNew,
    onlyBestseller,
    onlySale,
    inStockOnly,
    sortBy !== 'newest',
  ].filter(Boolean).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    let list = products.filter((p) => {
      if (active !== 'all' && p.category !== active) return false;

      if (q) {
        const hay = `${p.nameFr || ''} ${p.name || ''} ${p.description || ''} ${p.badge || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      const price = Number(p.price) || 0;
      if (price < priceMin || price > priceMax) return false;

      if (onlyNew && !p.isNew && p.badge !== 'new') return false;
      if (onlyBestseller && !p.isBestseller && p.badge !== 'bestseller') return false;
      if (onlySale && !(Number(p.discount_percent) > 0 || p.badge === 'sale')) return false;
      if (inStockOnly && Number(p.stock_qty || 0) <= 0) return false;

      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'price-asc') return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sortBy === 'price-desc') return (Number(b.price) || 0) - (Number(a.price) || 0);
      if (sortBy === 'name') return String(a.nameFr || a.name || '').localeCompare(String(b.nameFr || b.name || ''), 'fr');
      return 0;
    });

    return list;
  }, [products, active, search, priceMin, priceMax, onlyNew, onlyBestseller, onlySale, inStockOnly, sortBy]);

  const resetFilters = () => {
    setSearch('');
    setPriceMin(0);
    setPriceMax(maxPriceBound);
    setSortBy('newest');
    setOnlyNew(false);
    setOnlyBestseller(false);
    setOnlySale(false);
    setInStockOnly(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="section-title">Tous les Produits</h1>
          <p className="section-subtitle">BOUTIQUE PREMIUM — UNE SÉLECTION CURATÉE</p>

          <div className={styles.filters} role="tablist" aria-label="Catégories">
            {categories.map((f) => (
              <button
                key={f.value}
                role="tab"
                aria-selected={active === f.value}
                className={`${styles.filter} ${active === f.value ? styles.filterActive : ''}`}
                onClick={() => setActive(f.value)}
                id={`filter-${f.value}`}
              >
                {f.label}
                {active === f.value && (
                  <motion.span className={styles.filterBar} layoutId="filterBar" />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        <div className={styles.controls}>
          <div className={styles.searchBar}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="search"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Rechercher"
            />
            {search && (
              <button type="button" className={styles.clearSearch} onClick={() => setSearch('')} aria-label="Effacer">
                <FaTimes />
              </button>
            )}
          </div>

          <button
            type="button"
            className={`${styles.filterToggle} ${showFilters ? styles.filterToggleActive : ''}`}
            onClick={() => setShowFilters((v) => !v)}
          >
            <FaFilter />
            <span>Filtres</span>
            {activeFiltersCount > 0 && <span className={styles.filterBadge}>{activeFiltersCount}</span>}
          </button>
        </div>

        {showFilters && (
          <div className={styles.filterPanel}>
            <div className={styles.filterGrid}>
              <div className={styles.filterGroup}>
                <label htmlFor="sort-by">Trier par</label>
                <select
                  id="sort-by"
                  className={styles.select}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                >
                  <option value="newest">Plus récents</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="name">Nom A–Z</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>
                  Prix min: {priceMin.toLocaleString('fr-FR')} FCFA
                </label>
                <input
                  type="range"
                  min={0}
                  max={maxPriceBound}
                  step={1000}
                  value={priceMin}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setPriceMin(Math.min(next, priceMax));
                  }}
                />
              </div>

              <div className={styles.filterGroup}>
                <label>
                  Prix max: {priceMax.toLocaleString('fr-FR')} FCFA
                </label>
                <input
                  type="range"
                  min={0}
                  max={maxPriceBound}
                  step={1000}
                  value={priceMax}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setPriceMax(Math.max(next, priceMin));
                  }}
                />
              </div>

              <div className={styles.filterGroup}>
                <span className={styles.groupLabel}>Affiner</span>
                <div className={styles.checkRow}>
                  <label>
                    <input type="checkbox" checked={onlyNew} onChange={(e) => setOnlyNew(e.target.checked)} />
                    Nouveautés
                  </label>
                  <label>
                    <input type="checkbox" checked={onlyBestseller} onChange={(e) => setOnlyBestseller(e.target.checked)} />
                    Meilleures ventes
                  </label>
                  <label>
                    <input type="checkbox" checked={onlySale} onChange={(e) => setOnlySale(e.target.checked)} />
                    En promo
                  </label>
                  <label>
                    <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
                    En stock
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.filterActions}>
              <p className={styles.resultCount}>
                {filtered.length} produit{filtered.length !== 1 ? 's' : ''}
              </p>
              <button type="button" className={styles.resetBtn} onClick={resetFilters}>
                Réinitialiser
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className={styles.loading}>Chargement...</div>
        ) : (
          <motion.div
            className={styles.grid}
            key={`${active}-${sortBy}-${search}-${priceMin}-${priceMax}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {filtered.length > 0 ? (
              filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))
            ) : (
              <p className={styles.noProducts}>Aucun produit ne correspond à vos filtres.</p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function TousLesProduits() {
  return (
    <Suspense fallback={<div className={styles.page}><div className={styles.loading}>Chargement...</div></div>}>
      <TousLesProduitsContent />
    </Suspense>
  );
}
