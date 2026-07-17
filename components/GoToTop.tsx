'use client';

import { useEffect, useState } from 'react';
import { FaChevronUp } from 'react-icons/fa';
import styles from './FloatingButtons.module.css';

export function GoToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <button
      onClick={scrollTop}
      className={`${styles.goTop} ${visible ? styles.goTopVisible : ''}`}
      aria-label="Retour en haut"
      id="go-to-top"
    >
      <FaChevronUp />
    </button>
  );
}
