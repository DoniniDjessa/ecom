'use client';

import styles from './MarqueeBanner.module.css';

const text = 'BLING STORE ♥ ';
const repeated = text.repeat(10);

export default function MarqueeBanner() {
  return (
    <div className={styles.marquee} aria-hidden="true">
      <div className={styles.track}>
        <span>{repeated}</span>
        <span>{repeated}</span>
      </div>
    </div>
  );
}
