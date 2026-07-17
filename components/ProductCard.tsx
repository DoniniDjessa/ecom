'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FaShoppingBag, FaHeart } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import styles from './ProductCard.module.css';

interface Props {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.article
      className={styles.card}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/produits/${product.id}`} className={styles.linkWrapper}>
        <div className={styles.imgWrap}>
          <Image
            src={product.image}
            alt={product.nameFr}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={styles.img}
            style={{ objectFit: 'cover', objectPosition: 'top' }}
          />

          {(product.stock_qty !== undefined && product.stock_qty <= 0) ? (
            <span className={`${styles.badge} ${styles.outOfStock}`}>
              Rupture de Stock
            </span>
          ) : (product.discount_percent && product.discount_percent > 0) ? (
            <span className={`${styles.badge} ${styles.sale}`}>
              -{product.discount_percent}% OFF
            </span>
          ) : product.badge && (
            <span className={`${styles.badge} ${styles[product.badge]}`}>
              {product.badge === 'bestseller' ? '★ Meilleure Vente' : product.badge === 'new' ? 'Nouveau' : 'Promo'}
            </span>
          )}

          <button
            className={`${styles.like} ${liked ? styles.liked : ''}`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }}
            aria-label="Ajouter aux favoris"
          >
            <FaHeart />
          </button>

          <div className={styles.quickAdd}>
            <button
              className={`${styles.addBtn} ${added ? styles.addedState : ''}`}
              onClick={handleAdd}
              disabled={product.stock_qty !== undefined && product.stock_qty <= 0}
              id={`add-to-cart-${product.id}`}
            >
              {added ? '✓ Ajouté' : (
                <>
                  <FaShoppingBag />
                  <span>Ajouter</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className={styles.info}>
          <p className={styles.name}>{product.nameFr}</p>
          <div className={styles.priceRow}>
            {product.discount_percent && product.discount_percent > 0 ? (
              <>
                <span className={styles.price}>
                  {(product.price * (1 - product.discount_percent / 100)).toLocaleString()} CFA
                </span>
                <span className={styles.oldPrice}>
                  {product.price.toLocaleString()} CFA
                </span>
              </>
            ) : (
              <span className={styles.price}>{product.price.toLocaleString()} CFA</span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
