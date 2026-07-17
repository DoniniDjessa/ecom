import Link from 'next/link';
import { FaInstagram, FaTiktok, FaWhatsapp, FaHeart } from 'react-icons/fa';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Sunfall Studio" className={styles.logoImg} />
          <p className={styles.name}>Sunfall Studio</p>
          <p className={styles.tag}>BOUTIQUE PREMIUM</p>
          <p className={styles.desc}>
            Une collection premium de perruques et de vêtements incarnant le luxe dans chaque fibre.
          </p>
          <div className={styles.socials}>
            <a href="https://www.instagram.com/l_tyy_mood" target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://www.tiktok.com/@laety_yy28" target="_blank" rel="noreferrer" aria-label="TikTok"><FaTiktok /></a>
            <a href="https://wa.me/2250545233028" target="_blank" rel="noreferrer" aria-label="WhatsApp"><FaWhatsapp /></a>
          </div>
        </div>

        <div className={styles.col}>
          <h4>Boutique</h4>
          <Link href="/perruques">Perruques</Link>
          <Link href="/vetements">Vêtements</Link>
          <Link href="/tous-les-produits?cat=accessoires">Accessoires</Link>
          <Link href="/tous-les-produits">Tous les produits</Link>
        </div>

        <div className={styles.col}>
          <h4>Aide</h4>
          <Link href="/contactez-nous">Contactez-nous</Link>
          <Link href="/panier">Mon Panier</Link>
          <a href="https://wa.me/2250545233028" target="_blank" rel="noreferrer">WhatsApp</a>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} Sunfall Studio — Fait avec <FaHeart className={styles.heart} /> pour la beauté</p>
      </div>
    </footer>
  );
}
