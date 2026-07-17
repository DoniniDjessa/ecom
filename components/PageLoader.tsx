'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './PageLoader.module.css';

export default function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => setVisible(false), 600);
    }, 2400);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className={`${styles.loader} ${fading ? styles.fadeOut : ''}`}>
      <div className={styles.inner}>

        {/* Logo with light sweep */}
        <div className={styles.imageWrap}>
          <div className={styles.imageContainer}>
            <Image 
              src="/logo.png" 
              alt="Bling Store" 
              width={160} 
              height={160} 
              className={styles.loaderImage}
              priority
            />
            <div className={styles.sweep} aria-hidden="true" />
          </div>
          
          <div className={styles.progressTrack}>
            <div className={styles.progressBar} />
          </div>
        </div>

        <div className={styles.brand}>
          <span className={styles.brandMain}>Bling Store</span>
          <span className={styles.brandSub}>BOUTIQUE PREMIUM</span>
        </div>

      </div>
    </div>
  );
}
