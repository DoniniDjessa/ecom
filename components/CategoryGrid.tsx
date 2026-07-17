'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import styles from './CategoryGrid.module.css';

export default function CategoryGrid() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('lty_categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (data) setCategories(data);
      setLoading(false);
    }
    fetchCategories();
  }, []);

  if (loading) return null;

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            className={styles.card}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
          >
            <Link href={cat.href || '#'} className={styles.cardLink}>
              <div
                className={styles.cardImg}
                style={{ backgroundImage: `url(${cat.image})` }}
              />
              <div className={styles.cardOverlay} style={{ background: cat.color || 'rgba(0,0,0,0.5)' }}>
                <p className={styles.cardSub}>{cat.subtitle}</p>
                <p className={styles.cardLabel}>{cat.label}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
