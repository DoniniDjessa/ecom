'use client';

import styles from './contact.module.css';
import { FaInstagram, FaTiktok, FaWhatsapp, FaMapMarkerAlt } from 'react-icons/fa';


export default function ContactPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className="section-title">Contactez-nous</h1>
          <p className="section-subtitle">NOUS SOMMES LÀ POUR VOUS AIDER</p>
        </div>

        <div className={styles.layout}>
          {/* Contact Info */}
          <div className={styles.info}>
            <h2>Restons Connectés</h2>
            <p>
              Une question sur votre commande, une demande personnalisée ou simplement
              envie d&apos;en savoir plus ? Contactez-nous, nous répondons rapidement.
            </p>

            <div className={styles.channels}>
              <a
                href="https://wa.me/2250545233028"
                className={styles.channel}
                target="_blank"
                rel="noreferrer"
              >
                <span className={styles.channelIcon} style={{ background: '#25d366', color: 'white' }}>
                  <FaWhatsapp />
                </span>
                <div>
                  <strong>WhatsApp</strong>
                  <span>+225 05 45 23 30 28</span>
                </div>
              </a>

              <a
                href="https://www.instagram.com/l_tyy_mood"
                className={styles.channel}
                target="_blank"
                rel="noreferrer"
              >
                <span className={styles.channelIcon} style={{ background: 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', color: 'white' }}>
                  <FaInstagram />
                </span>
                <div>
                  <strong>Instagram</strong>
                  <span>@l_tyy_mood</span>
                </div>
              </a>

              <a
                href="https://www.tiktok.com/@laety_yy28"
                className={styles.channel}
                target="_blank"
                rel="noreferrer"
              >
                <span className={styles.channelIcon} style={{ background: '#010101', color: 'white' }}>
                  <FaTiktok />
                </span>
                <div>
                  <strong>TikTok</strong>
                  <span>@laety_yy28</span>
                </div>
              </a>

              <div className={styles.channel}>
                <span className={styles.channelIcon} style={{ background: 'var(--gold)', color: 'white' }}>
                  <FaMapMarkerAlt />
                </span>
                <div>
                  <strong>Localisation</strong>
                  <span>Abidjan, Côte d&apos;Ivoire</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <h2>Envoyez un Message</h2>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="contact-name">Nom</label>
                <input id="contact-name" type="text" placeholder="Votre nom" required />
              </div>
              <div className={styles.field}>
                <label htmlFor="contact-email">Email</label>
                <input id="contact-email" type="email" placeholder="votre@email.com" required />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="contact-subject">Sujet</label>
              <input id="contact-subject" type="text" placeholder="Ex: Question commande" />
            </div>

            <div className={styles.field}>
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                rows={5}
                placeholder="Écrivez votre message ici..."
                required
              />
            </div>

            <button type="submit" className="btn-primary" id="submit-contact">
              Envoyer le message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
