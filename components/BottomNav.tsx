'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaCut, FaTshirt, FaGem, FaWhatsapp } from 'react-icons/fa';
import styles from './BottomNav.module.css';

export default function BottomNav() {
  const pathname = usePathname();
  const whatsappNumber = "2250545233028";

  return (
    <nav className={styles.bottomNav}>
      <Link href="/" className={`${styles.navItem} ${pathname === '/' ? styles.active : ''}`}>
        <FaHome />
        <span>Accueil</span>
      </Link>
      <Link href="/perruques" className={`${styles.navItem} ${pathname === '/perruques' ? styles.active : ''}`}>
        <FaCut />
        <span>Perruques</span>
      </Link>
      
      {/* Central WhatsApp Button */}
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

      <Link href="/vetements" className={`${styles.navItem} ${pathname === '/vetements' ? styles.active : ''}`}>
        <FaTshirt />
        <span>Vêtements</span>
      </Link>
      <Link href="/accessoires" className={`${styles.navItem} ${pathname === '/accessoires' ? styles.active : ''}`}>
        <FaGem />
        <span>Accessoires</span>
      </Link>
    </nav>
  );
}
