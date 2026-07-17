'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FaHome, FaWhatsapp, FaTag } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import styles from './BottomNav.module.css';

type CatLink = { id: string; label: string; href: string };

function niceLabel(raw: string) {
  const cleaned = (raw || '')
    .replace(/^(acheter|voir)\s+/i, '')
    .trim();
  if (!cleaned) return raw;
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
}

export default function BottomNav() {
  const pathname = usePathname();
  const whatsappNumber = '2250545233028';
  const [categories, setCategories] = useState<CatLink[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('ecom-categories')
        .select('id, label, href, sort_order')
        .order('sort_order', { ascending: true });

      setCategories(
        (data || []).slice(0, 3).map((cat) => ({
          id: cat.id,
          label: niceLabel(cat.label || cat.id),
          href: cat.href || `/${cat.id}`,
        }))
      );
    }
    fetchCategories();
  }, []);

  const left = categories.slice(0, 1);
  const right = categories.slice(1, 3);

  return (
    <nav className={styles.bottomNav}>
      <Link href="/" className={`${styles.navItem} ${pathname === '/' ? styles.active : ''}`}>
        <FaHome />
        <span>Accueil</span>
      </Link>

      {left.map((cat) => (
        <Link
          key={cat.id}
          href={cat.href}
          className={`${styles.navItem} ${pathname === cat.href ? styles.active : ''}`}
        >
          <FaTag />
          <span>{cat.label}</span>
        </Link>
      ))}

      <div className={styles.centerItem}>
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.whatsappBtn}
        >
          <FaWhatsapp />
        </a>
      </div>

      {right.map((cat) => (
        <Link
          key={cat.id}
          href={cat.href}
          className={`${styles.navItem} ${pathname === cat.href ? styles.active : ''}`}
        >
          <FaTag />
          <span>{cat.label}</span>
        </Link>
      ))}
    </nav>
  );
}
