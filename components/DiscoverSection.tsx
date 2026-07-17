'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { products } from '@/data/products';
import styles from './DiscoverSection.module.css';

// Show a curated mix of 6 items
const curated = products.slice(0, 6);

export default function DiscoverSection() {
  return (
    <section className={styles.section} id="discover">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="section-title">Découvrez Plus de Styles</h2>
        <p className="section-subtitle">Une sélection curatée pour chaque mood</p>
      </motion.div>

      <div className={styles.grid}>
        {curated.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>

      <motion.div
        className={styles.cta}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Link
          href="/tous-les-produits"
          className={styles.ctaBtn}
          id="voir-tous-les-produits"
        >
          VOIR TOUS LES PRODUITS (ALL PRODUCTS)
        </Link>
      </motion.div>
    </section>
  );
}
