'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaInstagram, FaTiktok, FaShoppingBag } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';
import styles from './Header.module.css';

const navLinks = [
  { label: 'Accueil', href: '/' },
  { label: 'Perruques', href: '/perruques' },
  { label: 'Vêtements', href: '/vetements' },
  { label: 'Accessoires', href: '/accessoires' },
  { label: 'Contactez-nous', href: '/contactez-nous' },
];

export default function Header() {
  const { totalItems } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      {/* Top Bar */}
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
            <span className={styles.brandName}>Ltyy Mood</span>
            <span className={styles.brandTag}>HAIR &amp; FASHION</span>
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

      {/* Nav */}
      <nav className={styles.nav}>
        <ul className={`${styles.navList} ${menuOpen ? styles.open : ''}`}>
          {navLinks.map((link) => (
            <li key={link.href}>
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
