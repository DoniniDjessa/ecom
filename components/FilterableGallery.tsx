'use client';

import { useState, useEffect, useMemo } from 'react';
import { Product, products as staticProducts } from '@/data/products';
import { supabase } from '@/lib/supabase';
import ProductCard from './ProductCard';
import styles from './FilterableGallery.module.css';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

interface Props {
  category: string;
  title: string;
  subtitle: string;
}

export default function FilterableGallery({ category, title, subtitle }: Props) {
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [category]);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('ecom-products')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching from Supabase:', error);
      setDbProducts([]);
    } else {
      const mapped = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        nameFr: p.name_fr || p.name || 'Produit Bling Store',
        price: p.price,
        category: p.category,
        image: p.images?.[0] || '/images/placeholder.jpg',
        images: p.images,
        badge: p.badge as any,
        description: p.description,
        isBestseller: p.is_bestseller,
        isNew: p.is_new,
      }));
      setDbProducts(mapped);
    }
    setLoading(false);
  }

  const allProducts = useMemo(() => {
    const staticItems = staticProducts.filter(p => p.category === category);
    // Combine static and dynamic (dynamic first)
    return [...dbProducts, ...staticItems];
  }, [dbProducts, category]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      const matchesSearch = p.nameFr.toLowerCase().includes(search.toLowerCase()) || 
                           p.name.toLowerCase().includes(search.toLowerCase());
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchesSearch && matchesPrice;
    });
  }, [allProducts, search, priceRange]);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h2 className="section-title">{title}</h2>
        <p className="section-subtitle">{subtitle}</p>
      </header>

      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <FaSearch className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
          {search && <FaTimes className={styles.clearSearch} onClick={() => setSearch('')} />}
        </div>
        
        <button className={styles.filterToggle} onClick={() => setShowFilters(!showFilters)}>
          <FaFilter /> <span>{showFilters ? 'Fermer' : 'Filtres'}</span>
        </button>
      </div>

      {showFilters && (
        <div className={styles.filterPanel}>
          <div className={styles.filterGroup}>
            <label>Prix max: {priceRange[1].toLocaleString()} FCFA</label>
            <input 
              type="range" 
              min="0" 
              max="500000" 
              step="500" 
              value={priceRange[1]} 
              onChange={e => setPriceRange([0, Number(e.target.value)])} 
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Chargement...</div>
      ) : (
        <>
          {filteredProducts.length > 0 ? (
            <div className={styles.grid}>
              {filteredProducts.map((p, i) => (
                <ProductCard key={`${p.id}-${category}`} product={p} index={i} />
              ))}
            </div>
          ) : (
            <div className={styles.noResults}>
              Aucun produit ne correspond à votre recherche.
            </div>
          )}
        </>
      )}
    </div>
  );
}
