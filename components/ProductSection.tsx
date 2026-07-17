'use client';

import ProductCard from './ProductCard';
import { Product } from '@/data/products';
import { motion } from 'framer-motion';
import styles from './ProductSection.module.css';

interface Props {
  title: string;
  subtitle: string;
  products: Product[];
  id?: string;
  viewAllHref?: string;
  layout?: 'grid' | 'scroll';
}

export default function ProductSection({ title, subtitle, products, id, viewAllHref, layout = 'grid' }: Props) {
  return (
    <section className={styles.section} id={id}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="section-title">{title}</h2>
        <p className="section-subtitle">{subtitle}</p>
      </motion.div>

      <div className={`${styles.grid} ${layout === 'scroll' ? styles.scrollGrid : ''}`}>
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>

      {viewAllHref && (
        <div className={styles.footer}>
          <a href={viewAllHref} className={styles.viewMoreBtn}>
            Voir tous les produits
          </a>
        </div>
      )}
    </section>
  );
}
