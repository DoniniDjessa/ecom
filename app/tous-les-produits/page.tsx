'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';
import styles from './tous-les-produits.module.css';

type Category = 'all' | 'perruques' | 'vetements' | 'accessoires';

const filters: { label: string; value: Category }[] = [
  { label: 'Tous', value: 'all' },
  { label: 'Perruques', value: 'perruques' },
  { label: 'Vêtements', value: 'vetements' },
  { label: 'Accessoires', value: 'accessoires' },
];

export default function TousLesProduits() {
  const [active, setActive] = useState<Category>('all');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('lty_products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        const mapped = (data || []).map((p: any) => ({
          ...p,
          nameFr: p.name_fr || p.name || 'Produit Ltyy Mood',
          image: p.images?.[0] || '/images/placeholder.jpg'
        }));
        setProducts(mapped);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filtered = useMemo(() =>
    active === 'all' ? products : products.filter((p) => p.category === active),
    [active, products]
  );

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
          <p className="section-subtitle">HAIR & FASHION — UNE SÉLECTION CURATÉE</p>

          <div className={styles.filters} role="tablist" aria-label="Catégories">
            {filters.map((f) => (
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

        {loading ? (
          <div className={styles.loading}>Chargement...</div>
        ) : (
          <motion.div
            className={styles.grid}
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {filtered.length > 0 ? (
              filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))
            ) : (
              <p className={styles.noProducts}>Aucun produit trouvé dans cette catégorie.</p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
