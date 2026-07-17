'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { FaShoppingBag, FaArrowLeft, FaWhatsapp } from 'react-icons/fa';
import styles from './ProduitDetail.module.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('ecom-products')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Error fetching product:', error);
        setLoading(false);
        return;
      }

      setProduct({
        id: data.id,
        name: data.name,
        nameFr: data.name_fr || data.name || 'Produit Bling Store',
        price: data.price,
        category: data.category,
        image: data.images?.[0] || '/images/placeholder.jpg',
        images: data.images || [],
        badge: data.badge,
        description: data.description,
        stock_qty: data.stock_qty,
        discount_percent: data.discount_percent
      });
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const isOutOfStock = product?.stock_qty !== undefined && product.stock_qty <= 0;

  if (loading) return <div className={styles.loading}>Chargement...</div>;
  if (!product) return <div className={styles.error}>Produit introuvable.</div>;

  return (
    <div className={styles.pageContainer}>
      <button onClick={() => router.back()} className={styles.backBtn}>
        <FaArrowLeft /> <span>Retour</span>
      </button>

      <div className={styles.layout}>
        {/* Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainImgWrap}>
            <Image 
              src={product.images?.[activeImg] || product.image} 
              alt={product.nameFr} 
              fill 
              className={styles.mainImg}
              style={{ objectFit: 'cover' }}
            />
            {isOutOfStock && <span className={styles.outOfStockBadge}>Rupture de Stock</span>}
          </div>
          {product.images && product.images.length > 1 && (
            <div className={styles.thumbnails}>
              {product.images.map((img, i) => (
                <div 
                  key={i} 
                  className={`${styles.thumbWrap} ${activeImg === i ? styles.activeThumb : ''}`}
                  onClick={() => setActiveImg(i)}
                >
                  <Image src={img} alt="" fill style={{ objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className={styles.info}>
          <span className={styles.category}>{product.category}</span>
          <h1 className={styles.title}>{product.nameFr}</h1>
          <div className={styles.priceRow}>
            {product.discount_percent && product.discount_percent > 0 ? (
              <>
                <span className={styles.price}>
                  {(product.price * (1 - product.discount_percent / 100)).toLocaleString()} FCFA
                </span>
                <span className={styles.oldPrice}>
                  {product.price.toLocaleString()} FCFA
                </span>
              </>
            ) : (
              <p className={styles.price}>{product.price.toLocaleString()} FCFA</p>
            )}
          </div>
          
          <div className={styles.stockStatus}>
            {isOutOfStock ? (
              <span className={styles.outOfStockText}>● Indisponible</span>
            ) : (
              <span className={styles.inStockText}>● En stock ({product.stock_qty} restants)</span>
            )}
          </div>

          <div className={styles.description}>
            <h3>Description</h3>
            <p>{product.description || "Aucune description disponible pour ce produit."}</p>
          </div>

          <div className={styles.actions}>
            <button 
              className={`${styles.addBtn} ${added ? styles.added : ''}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <FaShoppingBag />
              <span>{added ? 'Ajouté au panier !' : isOutOfStock ? 'Épuisé' : 'Ajouter au Panier'}</span>
            </button>
            <a 
              href={`https://wa.me/2250545233028?text=Bonjour, je suis intéressé par le produit: ${product.nameFr}`}
              className={styles.waBtn}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp />
              <span>Commander via WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
