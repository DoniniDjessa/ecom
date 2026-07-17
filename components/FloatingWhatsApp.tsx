'use client';

import { FaWhatsapp } from 'react-icons/fa';
import styles from './FloatingButtons.module.css';

export function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/2250545233028"
      target="_blank"
      rel="noreferrer"
      className={styles.whatsapp}
      aria-label="Chat WhatsApp"
      id="floating-whatsapp"
    >
      <FaWhatsapp />
    </a>
  );
}
