'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { FaInstagram, FaTiktok, FaFacebookF } from 'react-icons/fa';
import styles from './SocialSection.module.css';

type SocialPreview = {
  img: string;
  visible: boolean;
};

export default function SocialSection() {
  const [previews, setPreviews] = useState<Record<string, SocialPreview>>({
    ig: { img: '', visible: true },
    tt: { img: '', visible: true },
    fb: { img: '', visible: true },
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function fetchPreviews() {
      const { data } = await supabase.from('ecom-settings').select('*');
      const map: Record<string, string> = {};
      data?.forEach(s => { map[s.key] = s.value; });
      setPreviews({
        ig: {
          img: map.ig_preview || '',
          visible: map.ig_visible !== 'false',
        },
        tt: {
          img: map.tt_preview || '',
          visible: map.tt_visible !== 'false',
        },
        fb: {
          img: map.fb_preview || '',
          visible: map.fb_visible !== 'false',
        },
      });
      setLoaded(true);
    }
    fetchPreviews();
  }, []);

  const socials = [
    {
      id: 'ig',
      name: 'Instagram',
      handle: '@blingstore',
      url: 'https://www.instagram.com/l_tyy_mood',
      icon: <FaInstagram />,
      img: previews.ig.img,
      visible: previews.ig.visible,
    },
    {
      id: 'tt',
      name: 'TikTok',
      handle: '@blingstore',
      url: 'https://www.tiktok.com/@laety_yy28',
      icon: <FaTiktok />,
      img: previews.tt.img,
      visible: previews.tt.visible,
    },
    {
      id: 'fb',
      name: 'Facebook',
      handle: 'Sunfall Studio',
      url: 'https://www.facebook.com/',
      icon: <FaFacebookF />,
      img: previews.fb.img,
      visible: previews.fb.visible,
    },
  ].filter((s) => s.visible);

  if (loaded && socials.length === 0) return null;

  return (
    <section className={styles.section}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="section-title">Rejoignez la Communauté</h2>
        <p className="section-subtitle">Suivez-nous sur les réseaux (@blingstore)</p>
      </motion.div>

      <div className={styles.container}>
        {socials.map((social, i) => (
          <motion.div
            key={social.id}
            className={styles.mockupWrapper}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
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
