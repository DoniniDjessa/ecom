'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaInstagram, FaTiktok, FaShoppingBag } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import styles from './Header.module.css';

type NavLink = { label: string; href: string };

function niceLabel(raw: string) {
  const cleaned = (raw || '')
    .replace(/^(acheter|voir)\s+/i, '')
    .trim();
  if (!cleaned) return raw;
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
}

export default function Header() {
  const { totalItems } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navLinks, setNavLinks] = useState<NavLink[]>([
    { label: 'Accueil', href: '/' },
    { label: 'Contactez-nous', href: '/contactez-nous' },
  ]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('ecom-categories')
        .select('id, label, href, sort_order')
        .order('sort_order', { ascending: true });

      const categoryLinks = (data || []).map((cat) => ({
        label: niceLabel(cat.label || cat.id),
        href: cat.href || `/${cat.id}`,
      }));

      setNavLinks([
        { label: 'Accueil', href: '/' },
        ...categoryLinks,
        { label: 'Contactez-nous', href: '/contactez-nous' },
      ]);
    }
    fetchCategories();
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.topBar}>
        <div className={styles.socials}>
          <a
            href="https://www.instagram.com/l_tyy_mood"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className={styles.socialLink}
          >
            <FaInstagram />
          </a>
          <a
            href="https://www.tiktok.com/@laety_yy28"
            target="_blank"
            rel="noreferrer"
            aria-label="TikTok"
            className={styles.socialLink}
          >
            <FaTiktok />
          </a>
        </div>
        <div className={styles.brandWrap}>
          <Link href="/" className={styles.brand}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Sunfall Studio" className={styles.brandLogo} />
            <span className={styles.brandText}>
              <span className={styles.brandName}>Sunfall Studio</span>
              <span className={styles.brandTag}>BOUTIQUE PREMIUM</span>
            </span>
          </Link>
        </div>
        <div className={styles.actions}>
          <Link href="/panier" className={styles.cartBtn} aria-label="Panier">
            <FaShoppingBag />
            {totalItems > 0 && (
              <span className={styles.badge}>{totalItems}</span>
            )}
          </Link>
          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      <nav className={styles.nav}>
        <ul className={`${styles.navList} ${menuOpen ? styles.open : ''}`}>
          {navLinks.map((link) => (
            <li key={`${link.href}-${link.label}`}>
              <Link
                href={link.href}
                className={styles.navLink}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
