'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { FaInstagram, FaTiktok } from 'react-icons/fa';
import styles from './SocialSection.module.css';

export default function SocialSection() {
  const [previews, setPreviews] = useState<any>({ instagram: '', tiktok: '' });

  useEffect(() => {
    async function fetchPreviews() {
      const { data } = await supabase.from('lty_settings').select('*');
      const map: any = {};
      data?.forEach(s => map[s.key] = s.value);
      setPreviews({
        instagram: map.ig_preview || '',
        tiktok: map.tt_preview || ''
      });
    }
    fetchPreviews();
  }, []);

  const socials = [
    { 
      id: 'ig', 
      name: 'Instagram', 
      handle: '@l_tyy_mood', 
      url: 'https://www.instagram.com/l_tyy_mood',
      icon: <FaInstagram />,
      img: previews.instagram
    },
    { 
      id: 'tt', 
      name: 'TikTok', 
      handle: '@laety_yy28', 
      url: 'https://www.tiktok.com/@laety_yy28',
      icon: <FaTiktok />,
      img: previews.tiktok
    }
  ];

  return (
    <section className={styles.section}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="section-title">Rejoignez la Communauté</h2>
        <p className="section-subtitle">Suivez-nous sur les réseaux (@ltyymood)</p>
      </motion.div>

      <div className={styles.container}>
        {socials.map((social, i) => (
          <motion.div 
            key={social.id}
            className={styles.mockupWrapper}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
          >
            <div className={styles.phoneFrame}>
              <div className={styles.screen}>
                {social.img ? (
                  <img src={social.img} alt={social.name} className={styles.previewImg} />
                ) : (
                  <div className={styles.placeholder}>Aperçu bientôt...</div>
                )}
              </div>
            </div>
            <div className={styles.info}>
              <div className={styles.iconBox}>{social.icon}</div>
              <a href={social.url} target="_blank" rel="noopener noreferrer" className={styles.socialBtn}>
                Voir {social.name}
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
