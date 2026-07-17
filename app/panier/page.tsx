'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FaTrash, FaMinus, FaPlus, FaWhatsapp, FaShoppingBag, FaTimes, FaCheckCircle } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './panier.module.css';

interface OrderForm {
  name: string;
  phone: string;
  location: string;
}

export default function PanierPage() {
  const { items, totalItems, totalPrice, removeFromCart, updateQuantity, clearCart } = useCart();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState<OrderForm>({ name: '', phone: '', location: '' });
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<OrderForm>>({});

  const buildWhatsAppMessage = () => {
    if (items.length === 0) return '#';
    const lines = items.map(
      (i) => `• ${i.nameFr} ×${i.quantity} — ${(i.price * i.quantity).toLocaleString()} FCFA`
    );
    const msg = [
      '🛍 *Commande Bling Store*',
      '',
      ...lines,
      '',
      `*Total : ${totalPrice.toLocaleString()} FCFA*`,
    ].join('\n');
    return `https://wa.me/2250545233028?text=${encodeURIComponent(msg)}`;
  };

  const validateForm = () => {
    const errors: Partial<OrderForm> = {};
    if (!orderForm.name.trim()) errors.name = 'Requis';
    if (!orderForm.phone.trim()) errors.phone = 'Requis';
    if (!orderForm.location.trim()) errors.location = 'Requis';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      const { error } = await supabase
        .from('ecom-orders')
        .insert([{
          customer_name: orderForm.name,
          customer_phone: orderForm.phone,
          delivery_location: orderForm.location,
          total_price: totalPrice,
          items: items.map(i => ({ id: i.id, name: i.nameFr, qty: i.quantity, price: i.price, image: i.image, images: i.images || [i.image] })),
          status: 'pending'
        }]);

      if (error) throw error;
      
      setOrderSubmitted(true);
      setTimeout(() => clearCart(), 500); 
    } catch (err) {
      console.error('Order error:', err);
      alert('Erreur lors de la validation de la commande. Veuillez réessayer.');
    }
  };

  const handleWhatsAppOrder = async () => {
    // 1. Save to DB first
    try {
      await supabase
        .from('ecom-orders')
        .insert([{
          customer_name: 'Client WhatsApp',
          customer_phone: 'WhatsApp',
          delivery_location: 'Contact via WhatsApp',
          total_price: totalPrice,
          items: items.map(i => ({ id: i.id, name: i.nameFr, qty: i.quantity, price: i.price, image: i.image })),
          status: 'pending'
        }]);
    } catch (err) {
      console.error('WhatsApp order save error:', err);
    }

    // 2. Open WhatsApp
    const url = buildWhatsAppMessage();
    window.open(url, '_blank');
    
    // 3. UI states
    setOrderSubmitted(true);
    setOrderForm({ name: 'Client WhatsApp', phone: 'WhatsApp', location: 'Non spécifié' });
    setShowOrderModal(true);
    setTimeout(() => clearCart(), 1500); // 1.5s delay to let success modal show
  };

  useEffect(() => {
    let timer: any;
    if (orderSubmitted) {
      timer = setTimeout(() => {
        closeModal();
      }, 8000);
    }
    return () => clearTimeout(timer);
  }, [orderSubmitted]);

  const closeModal = () => {
    setShowOrderModal(false);
    setOrderSubmitted(false);
    setOrderForm({ name: '', phone: '', location: '' });
    setFormErrors({});
  };

  return (
    <div className={styles.page}>
      {items.length === 0 && !orderSubmitted ? (
        <div className={styles.empty}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={styles.emptyInner}
          >
            <FaShoppingBag className={styles.emptyIcon} />
            <h1>Votre panier est vide</h1>
            <p>Découvrez nos collections et ajoutez vos favoris.</p>
            <Link href="/tous-les-produits" className="btn-primary">
              Voir tous les produits
            </Link>
          </motion.div>
        </div>
      ) : (
        <div className={styles.container}>
          {/* Header */}
          <motion.div
            className={styles.pageHeader}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1>Mon Panier</h1>
            <span className={styles.count}>{totalItems} article{totalItems > 1 ? 's' : ''}</span>
          </motion.div>

          <div className={styles.layout}>
            {/* Items */}
            <div className={styles.items}>
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    className={styles.item}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ duration: 0.3 }}
                    layout
                  >
                    <div className={styles.itemImg}>
                      <Image
                        src={item.image}
                        alt={item.nameFr}
                        fill
                        style={{ objectFit: 'cover', objectPosition: 'top' }}
                        sizes="100px"
                      />
                    </div>
                    <div className={styles.itemInfo}>
                      <p className={styles.itemName}>{item.nameFr}</p>
                      <p className={styles.itemCategory}>{item.category}</p>
                      <p className={styles.itemPrice}>{item.price.toLocaleString()} FCFA / unité</p>
                    </div>
                    <div className={styles.itemControls}>
                      <div className={styles.qty}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Diminuer"
                          id={`qty-minus-${item.id}`}
                        >
                          <FaMinus />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Augmenter"
                          id={`qty-plus-${item.id}`}
                        >
                          <FaPlus />
                        </button>
                      </div>
                      <p className={styles.itemTotal}>
                        {(item.price * item.quantity).toLocaleString()} FCFA
                      </p>
                      <button
                        className={styles.remove}
                        onClick={() => removeFromCart(item.id)}
                        aria-label="Supprimer"
                        id={`remove-${item.id}`}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <button className={styles.clearBtn} onClick={clearCart}>
                Vider le panier
              </button>
            </div>

            {/* Summary */}
            <motion.div
              className={styles.summary}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2>Récapitulatif</h2>

              <div className={styles.summaryRows}>
                {items.map((i) => (
                  <div key={i.id} className={styles.summaryRow}>
                    <span>{i.nameFr} ×{i.quantity}</span>
                    <span>{(i.price * i.quantity).toLocaleString()} FCFA</span>
                  </div>
                ))}
              </div>

              <div className={styles.divider} />

              <div className={styles.total}>
                <span>Total</span>
                <span className={styles.totalPrice}>{totalPrice.toLocaleString()} FCFA</span>
              </div>

              {/* Standard order button */}
              <button
                className={styles.standardBtn}
                onClick={() => setShowOrderModal(true)}
                id="passer-commande"
              >
                <FaShoppingBag />
                Passer Commande
              </button>

              {/* WhatsApp order */}
              <button
                className={styles.waBtn}
                onClick={handleWhatsAppOrder}
                id="commander-whatsapp"
              >
                <FaWhatsapp />
                Commander via WhatsApp
              </button>

              <Link href="/tous-les-produits" className={styles.continueBtn}>
                ← Continuer mes achats
              </Link>
            </motion.div>
          </div>
        </div>
      )}

      {/* Order Modal */}
      <AnimatePresence>
        {showOrderModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className={styles.modalClose} onClick={closeModal} aria-label="Fermer">
                <FaTimes />
              </button>

              {orderSubmitted ? (
                <motion.div
                  className={styles.orderSuccess}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <FaCheckCircle className={styles.successIcon} />
                  <h3>Commande reçue !</h3>
                  <p>
                    Merci <strong>{orderForm.name}</strong>. Nous vous contacterons
                    au <strong>{orderForm.phone}</strong> pour confirmer votre livraison à{' '}
                    <strong>{orderForm.location}</strong>.
                  </p>
                  <button className={styles.successCloseBtn} onClick={closeModal}>
                    Parfait, merci !
                  </button>
                </motion.div>
              ) : (
                <>
                  <h3 className={styles.modalTitle}>Informations de livraison</h3>
                  <p className={styles.modalSubtitle}>
                    Remplissez vos coordonnées pour finaliser votre commande.
                  </p>

                  {/* Mini order summary */}
                  <div className={styles.modalSummary}>
                    {items.map((i) => (
                      <div key={i.id} className={styles.modalItem}>
                        <span>{i.nameFr} ×{i.quantity}</span>
                        <span>{(i.price * i.quantity).toLocaleString()} FCFA</span>
                      </div>
                    ))}
                    <div className={styles.modalTotal}>
                      <strong>Total</strong>
                      <strong>{totalPrice.toLocaleString()} FCFA</strong>
                    </div>
                  </div>

                  <form className={styles.orderForm} onSubmit={handleOrderSubmit} noValidate>
                    <div className={styles.formField}>
                      <label htmlFor="order-name">Nom complet</label>
                      <input
                        id="order-name"
                        type="text"
                        placeholder="ex: Marie Kouassi"
                        value={orderForm.name}
                        onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
                        className={formErrors.name ? styles.inputError : ''}
                      />
                      {formErrors.name && <span className={styles.errorMsg}>{formErrors.name}</span>}
                    </div>

                    <div className={styles.formField}>
                      <label htmlFor="order-phone">Numéro de téléphone</label>
                      <input
                        id="order-phone"
                        type="tel"
                        placeholder="ex: +225 07 00 00 00 00"
                        value={orderForm.phone}
                        onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                        className={formErrors.phone ? styles.inputError : ''}
                      />
                      {formErrors.phone && <span className={styles.errorMsg}>{formErrors.phone}</span>}
                    </div>

                    <div className={styles.formField}>
                      <label htmlFor="order-location">Lieu de livraison</label>
                      <input
                        id="order-location"
                        type="text"
                        placeholder="ex: Cocody, Abidjan"
                        value={orderForm.location}
                        onChange={(e) => setOrderForm({ ...orderForm, location: e.target.value })}
                        className={formErrors.location ? styles.inputError : ''}
                      />
                      {formErrors.location && <span className={styles.errorMsg}>{formErrors.location}</span>}
                    </div>

                    <button type="submit" className={styles.submitOrderBtn} id="confirmer-commande">
                      Confirmer la commande
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
