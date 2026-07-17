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

        {/* Loader Image with light sweep */}
        <div className={styles.imageWrap}>
          <div className={styles.imageContainer}>
            <Image 
              src="/load.png" 
              alt="Loading" 
              width={160} 
              height={160} 
              className={styles.loaderImage}
              priority
            />
            {/* Light sweep overlay */}
            <div className={styles.sweep} aria-hidden="true" />
          </div>
          
          {/* Progress bar directly below image */}
          <div className={styles.progressTrack}>
            <div className={styles.progressBar} />
          </div>
        </div>

        {/* Brand Name below image */}
        <div className={styles.brand}>
          <span className={styles.brandMain}>Ltyy Mood</span>
          <span className={styles.brandSub}>HAIR &amp; FASHION</span>
        </div>

      </div>
    </div>
  );
}
