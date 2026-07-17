'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  const [content, setContent] = useState<any>({
    title: 'Nouveaux arrivages de Perruques Fashion & Glams',
    subtitle: 'Collection Printemps 2026',
    image_left: '',
    image_right: ''
  });

  useEffect(() => {
    async function fetchHero() {
      const { data } = await supabase.from('ecom-settings').select('*');
      if (data) {
        const heroData: any = {};
        data.forEach(s => {
          if (s.key.startsWith('hero_')) heroData[s.key.replace('hero_', '')] = s.value;
        });
        if (Object.keys(heroData).length > 0) {
          setContent(prev => ({ ...prev, ...heroData }));
        }
      }
    }
    fetchHero();
  }, []);

  return (
    <section className={styles.hero} id="hero">
      {/* Background gradient overlay */}
      <div className={styles.overlay} />

      {/* Background image */}
      <div
        className={styles.bgImages}
        style={{ backgroundImage: content.image_left ? `url(${content.image_left})` : undefined }}
      />


      {/* Content */}
      <div className={styles.content}>
        <motion.p
          className={styles.eyebrow}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {content.subtitle}
        </motion.p>

        <motion.h1
          className={styles.headline}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {content.title}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Link href="/perruques" className={styles.shopBtn}>
            Acheter maintenant
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
