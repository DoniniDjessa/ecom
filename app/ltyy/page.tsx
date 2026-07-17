'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './admin.module.css';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import { FaChartBar, FaShoppingBag, FaBoxOpen, FaTrash, FaEdit, FaPlus, FaSignOutAlt, FaEye, FaExternalLinkAlt, FaInstagram } from 'react-icons/fa';

const BUCKET_NAME = 'lty-bucket';
const ACCESS_CODE = '0044';

export default function LtyyBackoffice() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'comptes'>('dashboard');
  const [loading, setLoading] = useState(true);

  // Auth check
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ACCESS_CODE) {
      setIsAuthenticated(true);
      localStorage.setItem('ltyy_auth', 'true');
    } else {
      alert('Code incorrect');
      setPin('');
    }
  };

  useEffect(() => {
    if (localStorage.getItem('ltyy_auth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className={styles.authWrapper}>
        <div className={styles.authCard}>
          <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>Ltyy Admin</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Veuillez entrer le code d'accès</p>
          <form onSubmit={handleAuth}>
            <input 
              type="password" 
              className={styles.pin}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
              autoFocus
            />
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Valider</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminLayout}>
      {/* Mobile Bottom Tab Bar */}
      <nav className={styles.bottomTab}>
        <div 
          className={`${styles.tabItem} ${activeTab === 'dashboard' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <FaChartBar />
          <span>Tableau</span>
        </div>
        <div 
          className={`${styles.tabItem} ${activeTab === 'orders' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <FaShoppingBag />
          <span>Commandes</span>
        </div>
        <div 
          className={`${styles.tabItem} ${activeTab === 'products' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <FaBoxOpen />
          <span>Produits</span>
        </div>
        <div 
          className={`${styles.tabItem} ${activeTab === 'comptes' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('comptes')}
        >
          <FaInstagram />
          <span>Comptes</span>
        </div>
      </nav>

      {/* Sidebar (Desktop only) */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>Ltyy Mood</div>
        <nav className={styles.nav}>
          <div 
            className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <FaChartBar /> <span>Tableau</span>
          </div>
          <div 
            className={`${styles.navItem} ${activeTab === 'orders' ? styles.active : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <FaShoppingBag /> <span>Commandes</span>
          </div>
          <div 
            className={`${styles.navItem} ${activeTab === 'products' ? styles.active : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <FaBoxOpen /> <span>Produits</span>
          </div>
          <div 
            className={`${styles.navItem} ${activeTab === 'comptes' ? styles.active : ''}`}
            onClick={() => setActiveTab('comptes')}
          >
            <FaInstagram /> <span>Comptes</span>
          </div>
          <div 
            className={styles.navItem}
            style={{ marginTop: 'auto' }}
            onClick={() => { localStorage.removeItem('ltyy_auth'); setIsAuthenticated(false); }}
          >
            <FaSignOutAlt /> <span>Déconnexion</span>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.main} style={{ position: 'relative' }}>
        <div className={styles.topActions} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '1rem', zIndex: 100 }}>
          <button className="btn-primary" style={{ fontSize: '0.7rem' }} onClick={() => window.open('/', '_blank')}>
            <FaEye /> Voir le site
          </button>
        </div>
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'orders' && <OrdersView />}
        {activeTab === 'products' && <ProductsView />}
        {activeTab === 'comptes' && <ComptesView />}
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   VIEW: DASHBOARD
   ───────────────────────────────────────────────────────────── */
function DashboardView() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'custom'>('week');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [period, customRange]);

  async function fetchDashboardData() {
    setLoading(true);
    let startDate = new Date();
    const endDate = new Date();

    if (period === 'day') startDate.setHours(0, 0, 0, 0);
    else if (period === 'week') startDate.setDate(endDate.getDate() - 7);
    else if (period === 'month') startDate.setMonth(endDate.getMonth() - 1);
    else if (period === 'custom' && customRange.start && customRange.end) {
      startDate = new Date(customRange.start);
    }

    const { count: pCount } = await supabase.from('lty_products').select('*', { count: 'exact', head: true });
    
    let query = supabase.from('lty_orders').select('*');
    if (period !== 'custom' || (customRange.start && customRange.end)) {
      query = query.gte('created_at', startDate.toISOString());
      if (period === 'custom') query = query.lte('created_at', new Date(customRange.end).toISOString());
    }
    
    const { data: allOrders } = await query;
    const orders = (allOrders || []).filter(o => o.status !== 'cancelled');

    const revenue = orders.reduce((sum, o) => sum + (o.total_price || 0), 0);
    
    // Rank Products
    const productMap: any = {};
    orders.forEach(o => {
      o.items?.forEach((item: any) => {
        const name = item.name_fr || item.name;
        if (!productMap[name]) productMap[name] = { name, qty: 0 };
        productMap[name].qty += (item.qty || 1);
      });
    });
    
    const ranked = Object.values(productMap)
      .sort((a: any, b: any) => b.qty - a.qty)
      .slice(0, 5);

    setStats({
      products: pCount || 0,
      orders: orders?.length || 0,
      revenue
    });
    setTopProducts(ranked);
    setLoading(false);
  }

  return (
    <>
      <div className={styles.header} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
        <h1>Tableau de Bord</h1>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: '100%' }}>
          <select 
            className={styles.filterInput} 
            value={period} 
            onChange={(e: any) => setPeriod(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="day">Aujourd'hui</option>
            <option value="week">Dernière Semaine</option>
            <option value="month">Dernier Mois</option>
            <option value="custom">Période personnalisée</option>
          </select>
          {period === 'custom' && (
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <input type="date" className={styles.filterInput} value={customRange.start} onChange={e => setCustomRange({...customRange, start: e.target.value})} />
              <span>à</span>
              <input type="date" className={styles.filterInput} value={customRange.end} onChange={e => setCustomRange({...customRange, end: e.target.value})} />
            </div>
          )}
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Produits</div>
          <div className={styles.statValue}>{stats.products}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Commandes ({period === 'custom' ? 'Période' : period})</div>
          <div className={styles.statValue}>{stats.orders}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>CA Période</div>
          <div className={styles.statValue}>{stats.revenue.toLocaleString()} CFA</div>
        </div>
      </div>

      <div className={styles.dashboardGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
        <div className={styles.card}>
          <h3 style={{ marginBottom: '1.2rem', fontSize: '0.9rem', color: 'var(--gold)' }}>Classement Meilleurs Produits</h3>
          {topProducts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {topProducts.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ width: '20px', height: '20px', background: i === 0 ? 'var(--gold)' : '#f0f0f0', color: i === 0 ? 'white' : 'inherit', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>{i + 1}</span>
                    <span style={{ fontSize: '0.75rem' }}>{p.name}</span>
                  </div>
                  <strong style={{ fontSize: '0.8rem' }}>{p.qty} vendus</strong>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.8rem', color: '#999', textAlign: 'center' }}>Aucune donnée pour cette période</p>
          )}
        </div>

        <div className={styles.card}>
          <h3 style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Actions Rapides</h3>
          <p style={{ fontSize: '0.75rem', marginBottom: '1.5rem', color: '#666' }}>Utilisez ces raccourcis pour gérer votre boutique plus rapidement.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
             <button className="btn-primary" style={{ fontSize: '0.7rem', width: '100%' }} onClick={() => window.open('/', '_blank')}>Voir ma boutique</button>
             <p style={{ fontSize: '0.6rem', marginTop: '1rem', color: '#999' }}>Astuce : Le classement des produits est basé sur les articles contenus dans vos commandes "Terminées" et "En attente".</p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   VIEW: ORDERS
   ───────────────────────────────────────────────────────────── */
function OrdersView() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => { fetchOrders(); }, []);

  async function fetchOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from('lty_orders').select('*').order('created_at', { ascending: false });
    if (!error) {
      const parsed = (data || []).map(o => ({
        ...o,
        items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items
      }));
      setOrders(parsed);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('lty_orders').update({ status }).eq('id', id);
    fetchOrders();
    if (selectedOrder?.id === id) setSelectedOrder((prev: any) => ({ ...prev, status }));
  }

  async function deleteOrder(id: string) {
    if (!confirm('Supprimer définitivement cette commande ?')) return;
    setDeletingId(id);
    const { error } = await supabase.from('lty_orders').delete().eq('id', id);
    if (!error) {
       if (selectedOrder?.id === id) setSelectedOrder(null);
       fetchOrders();
    }
    setDeletingId(null);
  }

  const filtered = orders.filter(o => {
    const matchesSearch = o.customer_name?.toLowerCase().includes(search.toLowerCase()) || 
                         o.customer_phone?.includes(search);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusStyles: any = {
    pending:    { label: 'En attente', bg: '#fff8ed', color: '#e08800', dot: '#f59e0b' },
    confirmed:  { label: 'Confirmé', bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' },
    processing: { label: 'En cours', bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' },
    completed:  { label: 'Terminé',   bg: '#f0fdf4', color: '#16a34a', dot: '#22c55e' },
    cancelled:  { label: 'Annulé',    bg: '#f9fafb', color: '#4b5563', dot: '#9ca3af' },
  };

  function getStatus(s: string) {
    return statusStyles[s] || statusStyles.pending;
  }

  return (
    <div className={styles.ordersLayout}>
      {/* Left Panel: Order List */}
      <div className={styles.ordersList}>
        <div className={styles.ordersHeader}>
          <h1>Commandes</h1>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: '100%', marginBottom: '0.5rem' }}>
            <select 
              className={styles.filterInput}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ flex: 1, minWidth: '120px' }}
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">⏳ En attente</option>
              <option value="confirmed">📋 Confirmé</option>
              <option value="processing">🚚 En cours</option>
              <option value="completed">✅ Terminé</option>
              <option value="cancelled">❌ Annulé</option>
            </select>
            <input
              type="text"
              placeholder="Rechercher client..."
              className={styles.searchInput}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 2, minWidth: '150px', margin: 0 }}
            />
          </div>
        </div>

        {loading ? (
          <div className={styles.ordersLoading}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Aucune commande trouvée.</p>
          </div>
        ) : (
          <div className={styles.orderCardList}>
            {filtered.map(o => {
              const st = getStatus(o.status);
              const isSelected = selectedOrder?.id === o.id;
              return (
                <div
                  key={o.id}
                  className={`${styles.orderCard} ${isSelected ? styles.orderCardActive : ''}`}
                  onClick={() => setSelectedOrder(o)}
                >
                  {/* Thumbnails strip */}
                  <div className={styles.orderThumbs}>
                    {o.items?.slice(0, 3).map((item: any, i: number) => (
                      <div key={i} className={styles.thumbBox}>
                        {(item.image || (item.images && item.images[0])) ? (
                          <img 
                            src={item.image || item.images[0]} 
                            alt={item.name_fr || item.name} 
                            onError={(e: any) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={styles.thumbPlaceholder} style={{ display: (item.image || (item.images && item.images[0])) ? 'none' : 'flex' }}>
                          {(item.name_fr || item.name || '?')[0]}
                        </div>
                      </div>
                    ))}
                    {(o.items?.length || 0) > 3 && (
                      <div className={styles.thumbMore}>+{o.items.length - 3}</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className={styles.orderCardInfo}>
                    <div className={styles.orderCardTop}>
                      <span className={styles.orderName}>{o.customer_name}</span>
                      <span className={styles.orderStatusPill} style={{ background: st.bg, color: st.color }}>
                        <span className={styles.statusDot} style={{ background: st.dot }} />
                        {st.label}
                      </span>
                    </div>
                    <div className={styles.orderCardMeta}>
                      <span className={styles.orderItems}>
                        {o.items?.map((i: any) => `${i.name_fr || i.name || 'Produit'} ×${i.qty}`).join(' · ')}
                      </span>
                    </div>
                    <div className={styles.orderCardBottom}>
                      <span className={styles.orderDate}>{new Date(o.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                      <strong className={styles.orderTotal}>{o.total_price?.toLocaleString()} CFA</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Panel: Order Detail */}
      {selectedOrder ? (
        <div className={styles.orderDetail}>
          <div className={styles.detailHeader}>
            <div>
              <h2>{selectedOrder.customer_name}</h2>
              <p className={styles.detailDate}>{new Date(selectedOrder.created_at).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <button className={styles.closeDetail} onClick={() => setSelectedOrder(null)}>✕</button>
          </div>

          {/* Status */}
          <div className={styles.detailSection}>
            <label className={styles.detailLabel}>Statut de la commande</label>
            <select
              value={selectedOrder.status}
              onChange={e => updateStatus(selectedOrder.id, e.target.value)}
              className={styles.statusSelect}
            >
              <option value="pending">⏳ En attente</option>
              <option value="confirmed">📋 Confirmé</option>
              <option value="processing">🚚 En cours</option>
              <option value="completed">✅ Terminé</option>
              <option value="cancelled">❌ Annulé</option>
            </select>
          </div>

          <button 
            className={styles.deleteOrderBtn} 
            onClick={() => deleteOrder(selectedOrder.id)}
            disabled={deletingId === selectedOrder.id}
          >
            {deletingId === selectedOrder.id ? 'Suppression...' : 'Supprimer cette commande'}
          </button>

          {/* Customer Info */}
          <div className={styles.detailSection}>
            <label className={styles.detailLabel}>Informations client</label>
            <div className={styles.customerInfoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoKey}>Téléphone</span>
                <a href={`tel:${selectedOrder.customer_phone}`} className={styles.infoVal}>{selectedOrder.customer_phone}</a>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoKey}>Livraison</span>
                <span className={styles.infoVal}>{selectedOrder.delivery_location || '—'}</span>
              </div>
              {selectedOrder.customer_note && (
                <div className={styles.infoItem} style={{ gridColumn: '1 / -1' }}>
                  <span className={styles.infoKey}>Note</span>
                  <span className={styles.infoVal}>{selectedOrder.customer_note}</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Images Grid */}
          <div className={styles.detailSection}>
            <label className={styles.detailLabel}>Articles commandés</label>
            <div className={styles.detailProductGrid}>
              {selectedOrder.items?.map((item: any, i: number) => (
                <div key={i} className={styles.detailProductCard}>
                  <div className={styles.detailProductImg}>
                    {(item.image || (item.images && item.images[0])) ? (
                      <img 
                        src={item.image || item.images[0]} 
                        alt={item.name_fr || item.name} 
                        onError={(e: any) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={styles.thumbPlaceholder} style={{ display: (item.image || (item.images && item.images[0])) ? 'none' : 'flex', fontSize: '2rem' }}>
                      {(item.name_fr || item.name || '?')[0]}
                    </div>
                  </div>
                  <div className={styles.detailProductInfo}>
                    <strong>{item.name_fr || item.name}</strong>
                    <div className={styles.detailProductMeta}>
                      <span>Qté : <b>×{item.qty}</b></span>
                      <span>{(item.price * item.qty).toLocaleString()} CFA</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className={styles.detailTotal}>
            <span>Total commande</span>
            <strong>{selectedOrder.total_price?.toLocaleString()} CFA</strong>
          </div>
        </div>
      ) : (
        <div className={styles.orderDetailEmpty}>
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
            <p>Sélectionnez une commande pour voir les détails</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   VIEW: PRODUCTS (Existing CRUD moved here)
   ───────────────────────────────────────────────────────────── */
function ProductsView() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  
  const [formData, setFormData] = useState({
    name: '', name_fr: '', price: 0, category: 'perruques',
    badge: '', description: '', is_bestseller: false, is_new: false,
    stock_qty: 0, discount_percent: 0
  });
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase.from('lty_products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (selectedFiles.length + imageUrls.length + files.length > 5) {
        alert('Max 5 images'); return;
      }
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of selectedFiles) {
        const compressed = await imageCompression(file, { 
          maxSizeMB: 1, 
          maxWidthOrHeight: 1400, 
          initialQuality: 0.85 
        });
        const filePath = `${Date.now()}-${file.name.replace(/[^a-z0-9]/gi, '_')}`;
        
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, compressed);
        
        if (uploadError) {
          throw new Error(`Erreur d'upload: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
        uploadedUrls.push(publicUrl);
      }

      const productData = { 
        ...formData, 
        name: formData.name_fr, // Map name_fr to name for compatibility
        category: formData.category.toLowerCase(), // Ensure lowercase for filtering
        badge: formData.badge || null,
        description: formData.description || null,
        images: [...imageUrls, ...uploadedUrls] 
      };

      if (editingId) {
        const { error } = await supabase.from('lty_products').update(productData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('lty_products').insert([productData]);
        if (error) throw error;
      }
      alert('Produit enregistré avec succès !');
      resetForm();
      fetchProducts();
    } catch (err: any) { 
      console.error(err);
      alert('Erreur: ' + (err.message || 'Impossible d\'enregistrer le produit')); 
    }
    finally { setUploading(false); }
  }

  function resetForm() {
    setFormData({ name: '', name_fr: '', price: 0, category: 'perruques', badge: '', description: '', is_bestseller: false, is_new: false });
    setSelectedFiles([]); setImageUrls([]); setEditingId(null); setShowForm(false);
  }

  return (
    <>
      <div className={styles.header}>
        <div className={styles.headerFilters}>
          <h1>Catalogue Produits</h1>
          <div style={{ display: 'flex', gap: '10px', flex: 1, width: '100%' }}>
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className={styles.filterInput}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <select 
              className={styles.filterInput}
              value={catFilter}
              onChange={e => setCatFilter(e.target.value)}
              style={{ flex: 1 }}
            >
              <option value="all">Toutes</option>
              <option value="perruques">Perruques</option>
              <option value="vetements">Vêtements</option>
              <option value="accessoires">Accessoires</option>
            </select>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)} style={{ fontSize: '0.7rem' }}>
          <FaPlus /> Ajouter
        </button>
      </div>

      {showForm && (
        <div className={styles.card} style={{ marginBottom: '1.5rem' }}>
          <h3>{editingId ? 'Modifier' : 'Nouveau Produit'}</h3>
          <form onSubmit={handleSubmit} className={styles.formGrid}>
            <div>
              <div className={styles.inputGroup}><label>Nom FR</label><input required value={formData.name_fr} onChange={e => setFormData({...formData, name_fr: e.target.value})} /></div>
              <div className={styles.inputGroup}><label>Prix (CFA)</label><input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} /></div>
              <div className={styles.inputGroup}><label>Catégorie</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="perruques">Perruques</option>
                  <option value="vetements">Vêtements</option>
                  <option value="accessoires">Accessoires</option>
                </select>
              </div>
              <div className={styles.inputGroup}><label>Badge</label>
                <select value={formData.badge} onChange={e => setFormData({...formData, badge: e.target.value})}>
                  <option value="">Aucun</option>
                  <option value="bestseller">Meilleure Vente</option>
                  <option value="new">Nouveau</option>
                  <option value="sale">Promo</option>
                </select>
              </div>
              <div className={styles.inputGroup}><label>Quantité en stock</label><input type="number" value={formData.stock_qty} onChange={e => setFormData({...formData, stock_qty: Number(e.target.value)})} /></div>
              <div className={styles.inputGroup}><label>% Réduction (Promo)</label><input type="number" value={formData.discount_percent} onChange={e => setFormData({...formData, discount_percent: Number(e.target.value)})} /></div>
            </div>
            <div>
              <div className={styles.inputGroup}><label>Description</label><textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
              <div className={styles.inputGroup} style={{ flexDirection: 'row', gap: '1rem', marginTop: '1rem' }}>
                <label><input type="checkbox" checked={formData.is_bestseller} onChange={e => setFormData({...formData, is_bestseller: e.target.checked})} /> Best</label>
                <label><input type="checkbox" checked={formData.is_new} onChange={e => setFormData({...formData, is_new: e.target.checked})} /> New</label>
              </div>
              <div className={styles.inputGroup}>
                <label>Images (Max 5)</label>
                <input type="file" multiple onChange={handleFileChange} />
                <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                   {imageUrls.map((url, i) => (
                     <div key={i} style={{ position: 'relative' }}>
                        <img src={url} style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                        <span onClick={() => setImageUrls(prev => prev.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', borderRadius: '50%', width: 15, height: 15, fontSize: 8, textAlign: 'center', cursor: 'pointer' }}>x</span>
                     </div>
                   ))}
                </div>
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem' }}>
              <button type="submit" disabled={uploading} className={`${styles.btn} ${styles.btnSave}`}>{uploading ? 'Upload...' : 'Enregistrer'}</button>
              <button type="button" onClick={resetForm} className={`${styles.btn} ${styles.btnCancel}`}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.card}>
        {loading ? <p>Chargement...</p> : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Img</th>
                  <th>Nom</th>
                  <th>Catégorie</th>
                  <th>Stock</th>
                  <th>Prix</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.filter(p => {
                  const matchesSearch = p.name_fr?.toLowerCase().includes(search.toLowerCase());
                  const matchesCat = catFilter === 'all' || p.category === catFilter;
                  return matchesSearch && matchesCat;
                }).map(p => (
                  <tr key={p.id}>
                    <td><img src={p.images?.[0]} style={{ width: '30px', height: '40px', objectFit: 'cover' }} /></td>
                    <td>{p.name_fr}</td>
                    <td>{p.category}</td>
                    <td>{p.stock_qty || 0}</td>
                    <td>{p.price?.toLocaleString()} CFA</td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <FaEdit style={{ cursor: 'pointer', color: '#1890ff' }} onClick={() => { setEditingId(p.id); setFormData({...p, badge: p.badge || ''}); setImageUrls(p.images || []); setShowForm(true); }} />
                        <FaTrash style={{ cursor: 'pointer', color: 'red' }} onClick={async () => { if(confirm('Sûr ?')) { await supabase.from('lty_products').delete().eq('id', p.id); fetchProducts(); } }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className={styles.emptyState}>
            <img src="/load.png" className={styles.emptyImg} alt="" />
            <p>Votre catalogue est vide. Commencez par ajouter un produit.</p>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className={styles.mobileCardsList}>
            {products.filter(p => {
              const matchesSearch = p.name_fr?.toLowerCase().includes(search.toLowerCase());
              const matchesCat = catFilter === 'all' || p.category === catFilter;
              return matchesSearch && matchesCat;
            }).map(p => (
              <div key={p.id} className={styles.mobileCard}>
                <div className={styles.cardHeader}>
                  <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    <img src={p.images?.[0]} style={{ width: '40px', height: '50px', objectFit: 'cover', borderRadius: '2px' }} alt="" />
                    <div>
                      <strong style={{ display: 'block' }}>{p.name_fr}</strong>
                      <small style={{ color: '#8c8c8c' }}>{p.category} • Stock: {p.stock_qty || 0}</small>
                    </div>
                  </div>
                  <strong>{p.price?.toLocaleString()} CFA</strong>
                </div>
                <div className={styles.cardActions} style={{ justifyContent: 'flex-end', gap: '1.5rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#1890ff', cursor: 'pointer' }} onClick={() => { setEditingId(p.id); setFormData({...p, badge: p.badge || ''}); setImageUrls(p.images || []); setShowForm(true); window.scrollTo(0, 0); }}>
                      <FaEdit /> <span>Modifier</span>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'red', cursor: 'pointer' }} onClick={async () => { if(confirm('Sûr ?')) { await supabase.from('lty_products').delete().eq('id', p.id); fetchProducts(); } }}>
                      <FaTrash /> <span>Supprimer</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   VIEW: COMPTES (Social + Storefront Management)
   ───────────────────────────────────────────────────────────── */
function ComptesView() {
  const [subTab, setSubTab] = useState<'reseaux' | 'hero' | 'categories'>('reseaux');

  // -- Reseaux state --
  const [previews, setPreviews] = useState<any>({ instagram: '', tiktok: '' });
  const [uploadingSocial, setUploadingSocial] = useState(false);

  // -- Hero & Categories state --
  const [hero, setHero] = useState<any>({ title: '', subtitle: '', text: '', image_left: '' });
  const [categories, setCategories] = useState<any[]>([]);
  const [uploadingContent, setUploadingContent] = useState<string | null>(null);
  const [savingCat, setSavingCat] = useState<string | null>(null);

  // -- New category modal --
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCat, setNewCat] = useState({ label: '', subtitle: '', href: '', sort_order: 0 });
  const [newCatImageFile, setNewCatImageFile] = useState<File | null>(null);
  const [newCatImagePreview, setNewCatImagePreview] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);
  const [deletingCat, setDeletingCat] = useState<string | null>(null);

  useEffect(() => {
    fetchPreviews();
    fetchHomeData();
  }, []);

  // ── Réseaux ──
  async function fetchPreviews() {
    const { data } = await supabase.from('lty_settings').select('*');
    const map: any = {};
    data?.forEach(s => map[s.key] = s.value);
    setPreviews({ instagram: map.ig_preview || '', tiktok: map.tt_preview || '' });
  }

  async function handleSocialUpload(platform: 'ig' | 'tt', file: File) {
    setUploadingSocial(true);
    try {
      const key = `${platform}_preview`;
      const oldUrl = previews[platform === 'ig' ? 'instagram' : 'tiktok'];
      const compressed = await imageCompression(file, { maxSizeMB: 0.8, maxWidthOrHeight: 1200 });
      const filePath = `social_${platform}_${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, compressed);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
      await supabase.from('lty_settings').upsert({ key, value: publicUrl }, { onConflict: 'key' });
      if (oldUrl) {
        const oldFile = oldUrl.split('/').pop();
        if (oldFile && !oldFile.includes('placeholder')) {
          await supabase.storage.from(BUCKET_NAME).remove([oldFile]);
        }
      }
      await fetchPreviews();
      alert('Capture mise à jour avec succès !');
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    } finally {
      setUploadingSocial(false);
    }
  }

  async function fetchHomeData() {
    const { data: settings } = await supabase.from('lty_settings').select('*');
    const heroMap: any = {};
    settings?.forEach(s => {
      if (s.key.startsWith('hero_')) heroMap[s.key.replace('hero_', '')] = s.value;
    });
    setHero(heroMap);
    const { data: cats } = await supabase.from('lty_categories').select('*').order('sort_order', { ascending: true });
    setCategories(cats || []);
  }

  async function updateHeroField(key: string, value: string) {
    await supabase.from('lty_settings').upsert({ key: `hero_${key}`, value }, { onConflict: 'key' });
  }

  async function handleContentImageUpload(path: string, file: File, table: 'settings' | 'categories', id?: string) {
    setUploadingContent(path);
    try {
      const isHero = table === 'settings';
      const options = {
        maxSizeMB: isHero ? 2 : 1, 
        maxWidthOrHeight: isHero ? 2000 : 1600, 
        useWebWorker: true, 
        initialQuality: isHero ? 0.9 : 0.85 
      };
      const compressed = await imageCompression(file, options);
      const fileName = `storefront/${path}_${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(fileName, compressed);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
      if (table === 'settings') {
        await supabase.from('lty_settings').upsert({ key: `hero_${path}`, value: publicUrl }, { onConflict: 'key' });
      } else {
        await supabase.from('lty_categories').update({ image: publicUrl }).eq('id', id);
      }
      await fetchHomeData();
      alert('Image mise à jour !');
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    } finally {
      setUploadingContent(null);
    }
  }

  async function updateCategory(id: string, field: string, value: string) {
    setSavingCat(id);
    await supabase.from('lty_categories').update({ [field]: value }).eq('id', id);
    setSavingCat(null);
  }

  async function createCategory() {
    if (!newCat.label.trim()) return;
    setCreatingCat(true);
    try {
      // Auto-generate id from label
      const autoId = newCat.label.trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

      let imageUrl = '';
      if (newCatImageFile) {
        const compressed = await imageCompression(newCatImageFile, { 
          maxSizeMB: 1, 
          maxWidthOrHeight: 1600, 
          useWebWorker: true,
          initialQuality: 0.85
        });
        const fileName = `storefront/cat_${autoId}_${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(fileName, compressed);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      const insert = {
        id: autoId,
        label: newCat.label.trim(),
        subtitle: newCat.subtitle.trim(),
        href: newCat.href.trim() || `/${autoId}`,
        image: imageUrl || null,
        color: '#2e1f14',
        sort_order: newCat.sort_order || (categories.length + 1),
      };
      const { error } = await supabase.from('lty_categories').insert([insert]);
      if (error) throw error;
      setShowNewCat(false);
      setNewCat({ label: '', subtitle: '', href: '', sort_order: 0 });
      setNewCatImageFile(null);
      setNewCatImagePreview('');
      await fetchHomeData();
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    } finally {
      setCreatingCat(false);
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm(`Supprimer la categorie "${id}" ? Cette action est irreversible.`)) return;
    setDeletingCat(id);
    await supabase.from('lty_categories').delete().eq('id', id);
    setDeletingCat(null);
    await fetchHomeData();
  }

  // Seed default categories if none exist
  async function seedDefaultCategories() {
    const defaults = [
      { id: 'perruques', label: 'ACHETER PERRUQUES', subtitle: 'Wigs & Extensions', href: '/perruques', color: '#3d2b1a', sort_order: 1 },
      { id: 'vetements', label: 'ACHETER VETEMENTS', subtitle: 'Mode & Style', href: '/vetements', color: '#2e1f14', sort_order: 2 },
      { id: 'accessoires', label: 'VOIR ACCESSOIRES', subtitle: 'Bijoux & Plus', href: '/tous-les-produits?cat=accessoires', color: '#352415', sort_order: 3 },
    ];
    for (const cat of defaults) {
      await supabase.from('lty_categories').upsert(cat, { onConflict: 'id' });
    }
    fetchHomeData();
  }

  return (
    <div className={styles.homeHub}>
      <div className={styles.comptesHeader}>
        <div>
          <h1 className={styles.comptesTitle}>Gestion des Comptes</h1>
          <p className={styles.comptesSubtitle}>Réseaux sociaux, bannière et catégories de votre boutique</p>
        </div>
      </div>

      {/* ── Premium Sub-Tabs ── */}
      <div className={styles.subTabs}>
        <button className={`${styles.subTabBtn} ${subTab === 'reseaux' ? styles.subTabActive : ''}`} onClick={() => setSubTab('reseaux')}>
          <span className={styles.tabIcon}>📱</span>
          <span>Réseaux Sociaux</span>
        </button>
        <button className={`${styles.subTabBtn} ${subTab === 'hero' ? styles.subTabActive : ''}`} onClick={() => setSubTab('hero')}>
          <span className={styles.tabIcon}>🖼️</span>
          <span>Bannière Hero</span>
        </button>
        <button className={`${styles.subTabBtn} ${subTab === 'categories' ? styles.subTabActive : ''}`} onClick={() => setSubTab('categories')}>
          <span className={styles.tabIcon}>🗂️</span>
          <span>Catégories</span>
        </button>
      </div>

      {/* ══ RÉSEAUX SOCIAUX ══ */}
      {subTab === 'reseaux' && (
        <div className={styles.reseauxGrid}>
          {(['ig', 'tt'] as const).map((p) => {
            const platform = p === 'ig' ? 'instagram' : 'tiktok';
            const preview = previews[platform];
            const labels = { ig: { name: 'Instagram', emoji: '📸', color: '#E1306C' }, tt: { name: 'TikTok', emoji: '🎵', color: '#000' } };
            const meta = labels[p];
            return (
              <div key={p} className={styles.socialCard}>
                <div className={styles.socialCardHeader} style={{ borderLeftColor: meta.color }}>
                  <span className={styles.socialIcon}>{meta.emoji}</span>
                  <div>
                    <h3 className={styles.socialTitle}>{meta.name}</h3>
                    <p className={styles.socialHint}>Capture d&apos;écran de votre profil</p>
                  </div>
                </div>
                <div className={styles.socialPreviewWrap}>
                  <div className={styles.socialPhoneFrame}>
                    {preview ? (
                      <img key={preview} src={preview} className={styles.socialPreviewImg} alt="" />
                    ) : (
                      <div className={styles.socialEmpty}>
                        <span style={{ fontSize: '2rem' }}>{meta.emoji}</span>
                        <p>Aucune capture</p>
                      </div>
                    )}
                  </div>
                </div>
                <label className={styles.socialUploadBtn}>
                  {uploadingSocial ? 'Chargement...' : preview ? 'Changer la capture' : 'Ajouter une capture'}
                  <input type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && handleSocialUpload(p, e.target.files[0])} disabled={uploadingSocial} />
                </label>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ BANNIÈRE HERO ══ */}
      {subTab === 'hero' && (
        <div className={styles.heroEditorSingle}>
          {/* Image Column */}
          <div className={styles.heroSingleImgCard}>
            <div className={styles.editorCardHeader}>
              <div className={styles.editorCardIcon}>🖼️</div>
              <div>
                <h3>Image de la Bannière</h3>
                <p>Photo de fond principale de la section hero.</p>
              </div>
            </div>
            <div className={styles.heroSingleImgWrap}>
              <div className={styles.heroImgPreview}>
                {hero.image_left ? (
                  <img src={hero.image_left} alt="" />
                ) : (
                  <div className={styles.heroImgEmpty}>
                    <span>📷</span>
                    <p>Aucune image</p>
                    <small>Format recommandé : portrait 9/16</small>
                  </div>
                )}
                <label className={styles.heroImgOverlay}>
                  <span style={{ fontSize: '1rem', fontWeight: 700 }}>
                    {uploadingContent === 'image_left' ? '⏳ Chargement...' : hero.image_left ? '✏️ Changer l\'image' : '＋ Ajouter une image'}
                  </span>
                  <input type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && handleContentImageUpload('image_left', e.target.files[0], 'settings')} />
                </label>
              </div>
            </div>
          </div>

          {/* Text Column */}
          <div className={styles.heroTextCard}>
            <div className={styles.editorCardHeader}>
              <div className={styles.editorCardIcon}>✍️</div>
              <div>
                <h3>Textes de la Bannière</h3>
                <p>Ces textes s&apos;affichent par-dessus l&apos;image.</p>
              </div>
            </div>
            <div className={styles.heroFields}>
              <div className={styles.heroFieldRow}>
                <label>Titre principal</label>
                <input
                  type="text"
                  placeholder="ex: Nouveaux arrivages de Perruques Fashion"
                  value={hero.title || ''}
                  onChange={e => setHero({ ...hero, title: e.target.value })}
                  onBlur={() => updateHeroField('title', hero.title)}
                  className={styles.heroInput}
                />
              </div>
              <div className={styles.heroFieldRow}>
                <label>Badge / Sous-titre</label>
                <input
                  type="text"
                  placeholder="ex: Collection Printemps 2026"
                  value={hero.subtitle || ''}
                  onChange={e => setHero({ ...hero, subtitle: e.target.value })}
                  onBlur={() => updateHeroField('subtitle', hero.subtitle)}
                  className={styles.heroInput}
                />
              </div>
              <div className={styles.heroFieldRow}>
                <label>Description</label>
                <textarea
                  rows={4}
                  placeholder="Une courte description pour présenter la collection..."
                  value={hero.text || ''}
                  onChange={e => setHero({ ...hero, text: e.target.value })}
                  onBlur={() => updateHeroField('text', hero.text)}
                  className={styles.heroInput}
                />
              </div>
              {/* Save hint */}
              <p style={{ fontSize: '0.68rem', color: '#bbb', marginTop: '0.5rem' }}>Les textes sont sauvegardés automatiquement lors du clic en dehors du champ.</p>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORIES CRUD */}
      {subTab === 'categories' && (
        <div>
          {/* Toolbar */}
          <div className={styles.catToolbar}>
            <div>
              <h2 className={styles.catToolbarTitle}>Categories ({categories.length})</h2>
              <p className={styles.catToolbarSub}>Ces cartes apparaissent sous le hero de la page d&apos;accueil.</p>
            </div>
            <button className={styles.catAddBtn} onClick={() => setShowNewCat(true)}>
              + Nouvelle categorie
            </button>
          </div>

          <div className={styles.catEditorGrid}>
            {categories.map(cat => (
                <div key={cat.id} className={styles.catEditorCard}>
                  {/* Header: id + delete */}
                  <div className={styles.catCardTop}>
                    <span className={styles.catIdPill}>{cat.id}</span>
                    <button
                      className={styles.catDeleteBtn}
                      onClick={() => deleteCategory(cat.id)}
                      disabled={deletingCat === cat.id}
                    >
                      {deletingCat === cat.id ? 'Suppression...' : 'Supprimer'}
                    </button>
                  </div>

                  {/* Live Preview */}
                  <div className={styles.catPreviewWrap}>
                    <p className={styles.catPreviewLabel}>Apercu homepage</p>
                    <div className={styles.catPreviewCard} style={{ background: cat.color || 'rgba(0,0,0,0.6)' }}>
                      {cat.image && <img src={cat.image} alt="" className={styles.catPreviewBg} />}
                      <div className={styles.catPreviewOverlay}>
                        <span className={styles.catPreviewSub}>{cat.subtitle || 'Sous-titre'}</span>
                        <span className={styles.catPreviewTitle}>{cat.label || 'Titre'}</span>
                      </div>
                    </div>
                    <label className={styles.catUploadBtn}>
                      {uploadingContent === cat.id ? 'Chargement...' : cat.image ? 'Changer image' : 'Ajouter image'}
                      <input type="file" accept="image/*" hidden
                        onChange={e => e.target.files?.[0] && handleContentImageUpload(cat.id, e.target.files[0], 'categories', cat.id)} />
                    </label>
                  </div>

                  {/* Fields */}
                  <div className={styles.catFields}>
                    <div className={styles.catFieldRow}>
                      <label>Titre de la carte</label>
                      <input type="text" value={cat.label || ''} placeholder="ex: ACHETER PERRUQUES"
                        onChange={e => { const n=[...categories]; n[n.findIndex(c=>c.id===cat.id)].label=e.target.value; setCategories(n); }}
                        onBlur={() => updateCategory(cat.id, 'label', cat.label)} className={styles.catInput} />
                    </div>
                    <div className={styles.catFieldRow}>
                      <label>Sous-titre</label>
                      <input type="text" value={cat.subtitle || ''} placeholder="ex: Wigs & Extensions"
                        onChange={e => { const n=[...categories]; n[n.findIndex(c=>c.id===cat.id)].subtitle=e.target.value; setCategories(n); }}
                        onBlur={() => updateCategory(cat.id, 'subtitle', cat.subtitle)} className={styles.catInput} />
                    </div>
                    <div className={styles.catFieldRow}>
                      <label>Lien (href)</label>
                      <input type="text" value={cat.href || ''} placeholder="ex: /perruques"
                        onChange={e => { const n=[...categories]; n[n.findIndex(c=>c.id===cat.id)].href=e.target.value; setCategories(n); }}
                        onBlur={() => updateCategory(cat.id, 'href', cat.href)} className={styles.catInput} />
                    </div>
                    <p className={styles.catSaveHint}>
                      {savingCat === cat.id ? 'Sauvegarde...' : 'Sauvegarde auto au clic en dehors du champ'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          {/* Create Modal */}
          {showNewCat && (
            <div className={styles.modalOverlay} onClick={() => setShowNewCat(false)}>
              <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h3>Nouvelle categorie</h3>
                  <button className={styles.modalClose} onClick={() => setShowNewCat(false)}>X</button>
                </div>
                <div className={styles.modalBody}>
                  {/* Image upload */}
                  <div className={styles.catFieldRow}>
                    <label>Image de la carte</label>
                    <label className={styles.modalImgUpload}>
                      {newCatImagePreview ? (
                        <img src={newCatImagePreview} alt="" className={styles.modalImgPreview} />
                      ) : (
                        <div className={styles.modalImgEmpty}>
                          <span style={{ fontSize: '2rem' }}>📷</span>
                          <span>Cliquer pour ajouter une image</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" hidden onChange={e => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        setNewCatImageFile(f);
                        setNewCatImagePreview(URL.createObjectURL(f));
                      }} />
                    </label>
                  </div>
                  <div className={styles.catFieldRow}>
                    <label>Titre affiche *</label>
                    <input type="text" placeholder="ex: ACHETER ROBES" value={newCat.label}
                      onChange={e => setNewCat({ ...newCat, label: e.target.value })} className={styles.catInput} />
                    <small style={{ fontSize: '0.62rem', color: '#aaa', marginTop: '0.3rem', display: 'block' }}>L&apos;ID sera genere automatiquement a partir du titre.</small>
                  </div>
                  <div className={styles.catFieldRow}>
                    <label>Sous-titre</label>
                    <input type="text" placeholder="ex: Nouvelle collection" value={newCat.subtitle}
                      onChange={e => setNewCat({ ...newCat, subtitle: e.target.value })} className={styles.catInput} />
                  </div>
                  <div className={styles.catFieldRow}>
                    <label>Lien (href)</label>
                    <input type="text" placeholder="ex: /robes" value={newCat.href}
                      onChange={e => setNewCat({ ...newCat, href: e.target.value })} className={styles.catInput} />
                  </div>
                  <div className={styles.catFieldRow}>
                    <label>Ordre d&apos;affichage</label>
                    <input type="number" placeholder={String(categories.length + 1)} value={newCat.sort_order || ''}
                      onChange={e => setNewCat({ ...newCat, sort_order: parseInt(e.target.value) || 0 })}
                      className={styles.catInput} />
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button className={styles.modalCancel} onClick={() => { setShowNewCat(false); setNewCatImageFile(null); setNewCatImagePreview(''); }}>Annuler</button>
                  <button className={styles.modalSave} onClick={createCategory}
                    disabled={creatingCat || !newCat.label.trim()}>
                    {creatingCat ? 'Creation en cours...' : '+ Creer la categorie'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


