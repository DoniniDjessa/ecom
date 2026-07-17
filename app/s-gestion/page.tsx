'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './admin.module.css';
import imageCompression from 'browser-image-compression';
import {
  FaChartBar,
  FaShoppingBag,
  FaBoxOpen,
  FaTrash,
  FaEdit,
  FaPlus,
  FaSignOutAlt,
  FaEye,
  FaInstagram,
  FaDesktop,
  FaTiktok,
  FaFacebookF,
} from 'react-icons/fa';

const BUCKET_NAME = 'ecom-bucket';
const ACCESS_CODE = '0044';

type Preset = 'product' | 'social' | 'hero' | 'category';
type Tab = 'dashboard' | 'orders' | 'products' | 'interface' | 'comptes';
type SettingMap = Record<string, string>;
type Product = Record<string, any>;
type Order = Record<string, any>;
type Category = Record<string, any>;

const compressionOptions: Record<Preset, Parameters<typeof imageCompression>[1]> = {
  product: {
    maxSizeMB: 0.7,
    maxWidthOrHeight: 1400,
    fileType: 'image/jpeg',
    useWebWorker: true,
  },
  social: {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1080,
    fileType: 'image/jpeg',
    useWebWorker: true,
  },
  hero: {
    maxSizeMB: 1.2,
    maxWidthOrHeight: 1920,
    fileType: 'image/jpeg',
    useWebWorker: true,
  },
  category: {
    maxSizeMB: 0.7,
    maxWidthOrHeight: 1600,
    fileType: 'image/jpeg',
    useWebWorker: true,
  },
};

async function compressImage(file: File, preset: Preset) {
  return imageCompression(file, compressionOptions[preset]);
}

function money(value: unknown) {
  return `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;
}

function dateLabel(value: unknown) {
  if (!value) return '-';
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('fr-FR');
}

function parseItems(value: unknown): Product[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function firstImage(product: Product) {
  const images = product.images;
  if (Array.isArray(images)) return images[0] || '';
  if (typeof images === 'string') {
    try {
      return JSON.parse(images)[0] || '';
    } catch {
      return '';
    }
  }
  return product.image || '';
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirme',
    processing: 'En preparation',
    completed: 'Termine',
    cancelled: 'Annule',
  };
  return labels[status] || 'En attente';
}

async function uploadImage(file: File, preset: Preset, folder: string) {
  const compressed = await compressImage(file, preset);
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filename, compressed, { contentType: 'image/jpeg', upsert: false });
  if (error) throw error;
  return supabase.storage.from(BUCKET_NAME).getPublicUrl(filename).data.publicUrl;
}

async function loadSettings() {
  const { data, error } = await supabase.from('ecom-settings').select('key, value');
  if (error) throw error;
  return (data || []).reduce<SettingMap>((result, row: any) => {
    result[row.key] = String(row.value ?? '');
    return result;
  }, {});
}

async function saveSetting(key: string, value: string) {
  const { error } = await supabase
    .from('ecom-settings')
    .upsert({ key, value }, { onConflict: 'key' });
  if (error) throw error;
}

export default function BlingBackoffice() {
  const [authenticated, setAuthenticated] = useState(false);
  const [ready, setReady] = useState(false);
  const [pin, setPin] = useState('');
  const [tab, setTab] = useState<Tab>('dashboard');

  useEffect(() => {
    setAuthenticated(window.localStorage.getItem('bling_auth') === 'true');
    setReady(true);
  }, []);

  const submitPin = (event: any) => {
    event.preventDefault();
    if (pin !== ACCESS_CODE) {
      window.alert('Code incorrect');
      setPin('');
      return;
    }
    window.localStorage.setItem('bling_auth', 'true');
    setAuthenticated(true);
  };

  const signOut = () => {
    window.localStorage.removeItem('bling_auth');
    setPin('');
    setAuthenticated(false);
  };

  if (!ready || !authenticated) {
    return (
      <div className={styles.authWrapper}>
        <div className={styles.authCard}>
          <h1 style={{ fontFamily: 'var(--font-display)' }}>Sunfall Studio</h1>
          <p style={{ color: '#888', fontSize: '0.8rem' }}>
            Entrez le code d&apos;acces administrateur
          </p>
          <form onSubmit={submitPin}>
            <input
              className={styles.pin}
              type="password"
              inputMode="numeric"
              maxLength={4}
              autoFocus
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              aria-label="Code d'acces"
            />
            <button className="btn-primary" type="submit" style={{ width: '100%' }}>
              Valider
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tabs: Array<{ id: Tab; label: string; icon: any }> = [
    { id: 'dashboard', label: 'Tableau de bord', icon: FaChartBar },
    { id: 'orders', label: 'Commandes', icon: FaShoppingBag },
    { id: 'products', label: 'Produits', icon: FaBoxOpen },
    { id: 'interface', label: 'Interface', icon: FaDesktop },
    { id: 'comptes', label: 'Comptes', icon: FaInstagram },
  ];

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>Sunfall Studio</div>
        <nav className={styles.nav}>
          {tabs.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`${styles.navItem} ${tab === item.id ? styles.active : ''}`}
                onClick={() => setTab(item.id)}
                type="button"
              >
                <Icon />
                {item.label}
              </button>
            );
          })}
        </nav>
        <button className={styles.navItem} onClick={() => window.open('/', '_blank')} type="button">
          <FaEye />
          Voir le site
        </button>
        <button className={styles.navItem} onClick={signOut} type="button">
          <FaSignOutAlt />
          Deconnexion
        </button>
      </aside>

      <main className={styles.main}>
        {tab === 'dashboard' && <DashboardView />}
        {tab === 'orders' && <OrdersView />}
        {tab === 'products' && <ProductsView />}
        {tab === 'interface' && <InterfaceView />}
        {tab === 'comptes' && <ComptesView />}
      </main>

      <nav className={styles.bottomTab}>
        {tabs.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`${styles.tabItem} ${tab === item.id ? styles.activeTab : ''}`}
              onClick={() => setTab(item.id)}
              type="button"
            >
              <Icon />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function DashboardView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [period, setPeriod] = useState('month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [productsResult, ordersResult] = await Promise.all([
        supabase.from('ecom-products').select('*'),
        supabase.from('ecom-orders').select('*').order('created_at', { ascending: false }),
      ]);
      if (!productsResult.error) setProducts(productsResult.data || []);
      if (!ordersResult.error) setOrders(ordersResult.data || []);
      setLoading(false);
    };
    load();
  }, []);

  const startDate = () => {
    const now = new Date();
    if (period === 'custom') return customFrom ? new Date(customFrom) : null;
    const start = new Date(now);
    if (period === 'day') start.setHours(0, 0, 0, 0);
    if (period === 'week') start.setDate(start.getDate() - 7);
    if (period === 'month') start.setMonth(start.getMonth() - 1);
    return start;
  };

  const filteredOrders = orders.filter((order) => {
    if (order.status === 'cancelled') return false;
    const created = new Date(order.created_at);
    const start = startDate();
    const end = period === 'custom' && customTo ? new Date(`${customTo}T23:59:59`) : null;
    return (!start || created >= start) && (!end || created <= end);
  });

  const revenue = filteredOrders.reduce(
    (sum, order) => sum + Number(order.total ?? order.total_amount ?? 0),
    0,
  );
  const itemRanking = new Map<string, { name: string; quantity: number; revenue: number }>();
  filteredOrders.forEach((order) => {
    parseItems(order.items).forEach((item) => {
      const name = item.name_fr || item.name || 'Produit';
      const quantity = Number(item.quantity || item.qty || 1);
      const price = Number(item.price || item.unit_price || 0);
      const old = itemRanking.get(name) || { name, quantity: 0, revenue: 0 };
      old.quantity += quantity;
      old.revenue += price * quantity;
      itemRanking.set(name, old);
    });
  });
  const topProducts = [...itemRanking.values()]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1>Tableau de bord</h1>
          <p className={styles.subtitle}>Suivi de votre boutique</p>
        </div>
        <div className={styles.headerFilters}>
          <select
            className={styles.filterInput}
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
          >
            <option value="day">Aujourd&apos;hui</option>
            <option value="week">7 derniers jours</option>
            <option value="month">30 derniers jours</option>
            <option value="custom">Personnalise</option>
          </select>
          {period === 'custom' && (
            <>
              <input className={styles.filterInput} type="date" value={customFrom} onChange={(event) => setCustomFrom(event.target.value)} />
              <input className={styles.filterInput} type="date" value={customTo} onChange={(event) => setCustomTo(event.target.value)} />
            </>
          )}
        </div>
      </header>

      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Chiffre d&apos;affaires</div>
          <div className={styles.statValue}>{money(revenue)}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Commandes</div>
          <div className={styles.statValue}>{filteredOrders.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Produits</div>
          <div className={styles.statValue}>{products.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Panier moyen</div>
          <div className={styles.statValue}>{money(filteredOrders.length ? revenue / filteredOrders.length : 0)}</div>
        </div>
      </section>

      <section className={styles.dashboardGrid}>
        <div className={styles.card}>
          <h3>Produits les plus vendus</h3>
          {loading ? <p>Chargement...</p> : null}
          {!loading && topProducts.length === 0 ? <p className={styles.emptyState}>Aucune vente sur cette periode.</p> : null}
          {topProducts.map((item, index) => (
            <div className={styles.cardRow} key={item.name}>
              <span>{index + 1}. {item.name}</span>
              <strong>{item.quantity} unites</strong>
            </div>
          ))}
        </div>
        <div className={styles.card}>
          <h3>Dernieres commandes</h3>
          {filteredOrders.slice(0, 5).map((order) => (
            <div className={styles.cardRow} key={order.id}>
              <span>{order.customer_name || order.name || 'Client'}</span>
              <strong>{money(order.total ?? order.total_amount)}</strong>
            </div>
          ))}
          {!loading && filteredOrders.length === 0 ? <p className={styles.emptyState}>Aucune commande.</p> : null}
        </div>
      </section>
    </>
  );
}

function OrdersView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ecom-orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) window.alert(error.message);
    else setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const visibleOrders = orders.filter((order) => {
    const haystack = `${order.id} ${order.customer_name || ''} ${order.email || ''}`.toLowerCase();
    return haystack.includes(search.toLowerCase()) && (filter === 'all' || order.status === filter);
  });

  const setStatus = async (status: string) => {
    if (!selected) return;
    setSaving(true);
    const { error } = await supabase.from('ecom-orders').update({ status }).eq('id', selected.id);
    if (error) window.alert(error.message);
    else {
      const updated = { ...selected, status };
      setSelected(updated);
      setOrders((current) => current.map((order) => (order.id === updated.id ? updated : order)));
    }
    setSaving(false);
  };

  const deleteOrder = async () => {
    if (!selected || !window.confirm('Supprimer cette commande ?')) return;
    setSaving(true);
    const { error } = await supabase.from('ecom-orders').delete().eq('id', selected.id);
    if (error) window.alert(error.message);
    else {
      setOrders((current) => current.filter((order) => order.id !== selected.id));
      setSelected(null);
    }
    setSaving(false);
  };

  const selectedItems = selected ? parseItems(selected.items) : [];

  return (
    <div className={styles.ordersLayout}>
      <section className={styles.ordersList}>
        <header className={styles.ordersHeader}>
          <h1>Commandes</h1>
          <input className={styles.searchInput} placeholder="Rechercher une commande" value={search} onChange={(event) => setSearch(event.target.value)} />
          <select className={styles.filterInput} style={{ marginTop: '0.7rem', width: '100%' }} value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirme</option>
            <option value="processing">En preparation</option>
            <option value="completed">Termine</option>
            <option value="cancelled">Annule</option>
          </select>
        </header>
        <div className={styles.orderCardList}>
          {loading && <p className={styles.ordersLoading}>Chargement...</p>}
          {!loading && visibleOrders.length === 0 && <p className={styles.ordersLoading}>Aucune commande.</p>}
          {visibleOrders.map((order) => (
            <button
              key={order.id}
              type="button"
              className={`${styles.orderCard} ${selected?.id === order.id ? styles.orderCardActive : ''}`}
              onClick={() => setSelected(order)}
            >
              <div className={styles.orderCardInfo}>
                <div className={styles.orderCardTop}>
                  <span className={styles.orderName}>{order.customer_name || order.name || 'Client'}</span>
                  <span className={styles.orderStatusPill}>{statusLabel(order.status)}</span>
                </div>
                <div className={styles.orderCardBottom}>
                  <span className={styles.orderDate}>{dateLabel(order.created_at)}</span>
                  <strong className={styles.orderTotal}>{money(order.total ?? order.total_amount)}</strong>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {!selected && <section className={styles.orderDetailEmpty}>Selectionnez une commande.</section>}
      {selected && (
        <section className={styles.orderDetail}>
          <div className={styles.detailHeader}>
            <div>
              <h2>Commande</h2>
              <div className={styles.detailDate}>{dateLabel(selected.created_at)}</div>
            </div>
            <button className={styles.closeDetail} type="button" onClick={() => setSelected(null)}>X</button>
          </div>
          <div className={styles.detailSection}>
            <span className={styles.detailLabel}>Statut</span>
            <select className={styles.statusSelect} value={selected.status || 'pending'} onChange={(event) => setStatus(event.target.value)} disabled={saving}>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirme</option>
              <option value="processing">En preparation</option>
              <option value="completed">Termine</option>
              <option value="cancelled">Annule</option>
            </select>
          </div>
          <div className={styles.detailSection}>
            <span className={styles.detailLabel}>Client</span>
            <div className={styles.customerInfoGrid}>
              <Info label="Nom" value={selected.customer_name || selected.name} />
              <Info label="Email" value={selected.email || selected.customer_email} />
              <Info label="Telephone" value={selected.phone || selected.customer_phone} />
              <Info label="Adresse" value={selected.address || selected.shipping_address} />
            </div>
          </div>
          <div className={styles.detailSection}>
            <span className={styles.detailLabel}>Articles</span>
            <div className={styles.detailProductGrid}>
              {selectedItems.map((item, index) => (
                <div className={styles.detailProductCard} key={`${item.id || item.name}-${index}`}>
                  <div className={styles.detailProductImg}>
                    {firstImage(item) ? <img src={firstImage(item)} alt="" /> : <div className={styles.thumbPlaceholder}>IMG</div>}
                  </div>
                  <div className={styles.detailProductInfo}>
                    <strong>{item.name_fr || item.name || 'Produit'}</strong>
                    <div className={styles.detailProductMeta}>
                      <span>Qte: {item.quantity || item.qty || 1}</span>
                      <span>{money(item.price || item.unit_price)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {selectedItems.length === 0 && <p>Aucun article disponible.</p>}
            </div>
          </div>
          <div className={styles.detailTotal}>
            <span>Total</span>
            <strong>{money(selected.total ?? selected.total_amount)}</strong>
          </div>
          <button className={styles.deleteOrderBtn} type="button" disabled={saving} onClick={deleteOrder}>
            <FaTrash /> Supprimer la commande
          </button>
        </section>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: unknown }) {
  return (
    <div className={styles.infoItem}>
      <span className={styles.infoKey}>{label}</span>
      <span className={styles.infoVal}>{String(value || '-')}</span>
    </div>
  );
}

const blankProduct = {
  name_fr: '',
  price: '',
  category: '',
  badge: '',
  stock_qty: '0',
  discount_percent: '0',
  description: '',
  is_bestseller: false,
  is_new: false,
  images: [] as string[],
};

function ProductsView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({ ...blankProduct, images: [] });
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const refresh = async () => {
    const { data, error } = await supabase.from('ecom-products').select('*').order('created_at', { ascending: false });
    if (error) window.alert(error.message);
    else setProducts(data || []);
  };

  const refreshCategories = async () => {
    const { data, error } = await supabase
      .from('ecom-categories')
      .select('id, label, sort_order')
      .order('sort_order', { ascending: true });
    if (error) window.alert(error.message);
    else setCategories(data || []);
  };

  useEffect(() => {
    refresh();
    refreshCategories();
  }, []);

  const defaultCategoryId = categories[0]?.id || '';

  const resetForm = () => {
    setEditing(null);
    setForm({ ...blankProduct, images: [], category: defaultCategoryId });
    setShowForm(false);
  };

  const openCreate = () => {
    if (categories.length === 0) {
      window.alert('Creez d\'abord une categorie dans Interface.');
      return;
    }
    setEditing(null);
    setForm({ ...blankProduct, images: [], category: defaultCategoryId });
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name_fr: product.name_fr || product.name || '',
      price: String(product.price || ''),
      category: product.category || defaultCategoryId,
      badge: product.badge || '',
      stock_qty: String(product.stock_qty || 0),
      discount_percent: String(product.discount_percent || 0),
      description: product.description || '',
      is_bestseller: Boolean(product.is_bestseller),
      is_new: Boolean(product.is_new),
      images: Array.isArray(product.images) ? product.images : [],
    });
    setShowForm(true);
  };

  const updateForm = (key: string, value: any) => setForm((current: any) => ({ ...current, [key]: value }));

  const addImage = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, 'product', 'products');
      updateForm('images', [...form.images, url]);
    } catch (error: any) {
      window.alert(error.message || 'Import impossible');
    }
    setUploading(false);
  };

  const save = async (event: any) => {
    event.preventDefault();
    if (!form.name_fr.trim()) return window.alert('Le nom est obligatoire');
    if (!form.category) return window.alert('Choisissez une categorie');
    setSaving(true);
    const payload = {
      name_fr: form.name_fr.trim(),
      name: form.name_fr.trim(),
      price: Number(form.price || 0),
      category: form.category,
      badge: form.badge,
      stock_qty: Number(form.stock_qty || 0),
      discount_percent: Number(form.discount_percent || 0),
      description: form.description,
      is_bestseller: form.is_bestseller,
      is_new: form.is_new,
      images: form.images,
    };
    const result = editing
      ? await supabase.from('ecom-products').update(payload).eq('id', editing.id)
      : await supabase.from('ecom-products').insert(payload);
    if (result.error) window.alert(result.error.message);
    else {
      resetForm();
      await refresh();
    }
    setSaving(false);
  };

  const remove = async (product: Product) => {
    if (!window.confirm(`Supprimer ${product.name_fr || product.name} ?`)) return;
    const { error } = await supabase.from('ecom-products').delete().eq('id', product.id);
    if (error) window.alert(error.message);
    else await refresh();
  };

  const categoryLabel = (id: string) =>
    categories.find((cat) => cat.id === id)?.label || id || '-';

  const filtered = products.filter((product) => `${product.name_fr || product.name || ''} ${product.category || ''}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1>Produits</h1>
          <p className={styles.subtitle}>Gerez votre catalogue</p>
        </div>
        <button className="btn-primary" type="button" onClick={openCreate}><FaPlus /> Ajouter</button>
      </header>
      <input className={styles.filterInput} placeholder="Rechercher un produit" value={search} onChange={(event) => setSearch(event.target.value)} style={{ marginBottom: '1.5rem' }} />

      {showForm && (
        <form className={styles.card} onSubmit={save} style={{ marginBottom: '1.5rem' }}>
          <div className={styles.cardHeader}>
            <h3>{editing ? 'Modifier le produit' : 'Nouveau produit'}</h3>
            <button type="button" className={styles.modalClose} onClick={resetForm}>X</button>
          </div>
          <div className={styles.formGrid}>
            <Field label="Nom" value={form.name_fr} onChange={(value) => updateForm('name_fr', value)} />
            <Field label="Prix" type="number" value={form.price} onChange={(value) => updateForm('price', value)} />
            <label>
              <span className={styles.cardLabel}>Categorie</span>
              <select
                className={styles.filterInput}
                value={form.category}
                onChange={(event) => updateForm('category', event.target.value)}
                required
              >
                {categories.length === 0 && <option value="">Aucune categorie</option>}
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label || cat.id}
                  </option>
                ))}
              </select>
            </label>
            <Field label="Badge" value={form.badge} onChange={(value) => updateForm('badge', value)} />
            <Field label="Stock" type="number" value={form.stock_qty} onChange={(value) => updateForm('stock_qty', value)} />
            <Field label="Reduction en pourcentage" type="number" value={form.discount_percent} onChange={(value) => updateForm('discount_percent', value)} />
          </div>
          <label style={{ display: 'block', marginTop: '1rem' }}><span className={styles.cardLabel}>Description</span><textarea className={styles.heroInput} value={form.description} onChange={(event) => updateForm('description', event.target.value)} /></label>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <label><input type="checkbox" checked={form.is_bestseller} onChange={(event) => updateForm('is_bestseller', event.target.checked)} /> Meilleure vente</label>
            <label><input type="checkbox" checked={form.is_new} onChange={(event) => updateForm('is_new', event.target.checked)} /> Nouveau</label>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label className={styles.catUploadBtn}>Ajouter des images<input hidden type="file" accept="image/*" onChange={(event) => addImage(event.target.files?.[0])} /></label>
            {uploading && <p>Import en cours...</p>}
            <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
              {form.images.map((url: string, index: number) => <div key={url} style={{ position: 'relative' }}><img src={url} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8 }} /><button type="button" onClick={() => updateForm('images', form.images.filter((_: string, itemIndex: number) => itemIndex !== index))} style={{ display: 'block' }}>X</button></div>)}
            </div>
          </div>
          <div className={styles.modalFooter} style={{ marginTop: '1rem' }}>
            <button className={styles.modalCancel} type="button" onClick={resetForm}>Annuler</button>
            <button className={styles.modalSave} disabled={saving || uploading} type="submit">Enregistrer</button>
          </div>
        </form>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead><tr><th>IMG</th><th>Nom</th><th>Categorie</th><th>Prix</th><th>Stock</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map((product) => <tr key={product.id}><td>{firstImage(product) ? <img src={firstImage(product)} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6 }} /> : 'IMG'}</td><td>{product.name_fr || product.name}</td><td>{categoryLabel(product.category)}</td><td>{money(product.price)}</td><td>{product.stock_qty}</td><td><button type="button" onClick={() => openEdit(product)}><FaEdit /></button> <button type="button" onClick={() => remove(product)}><FaTrash /></button></td></tr>)}</tbody>
        </table>
      </div>
      <div className={styles.mobileCardsList}>
        {filtered.map((product) => <article className={styles.mobileCard} key={product.id}><div className={styles.cardHeader}><strong>{product.name_fr || product.name}</strong><strong>{money(product.price)}</strong></div><div className={styles.cardRow}><span>Stock</span><span>{product.stock_qty}</span></div><div className={styles.cardActions}><button type="button" onClick={() => openEdit(product)}><FaEdit /> Modifier</button><button type="button" onClick={() => remove(product)}><FaTrash /> Supprimer</button></div></article>)}
      </div>
    </>
  );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label><span className={styles.cardLabel}>{label}</span><input className={styles.filterInput} type={type} value={value} onChange={(event) => onChange(event.target.value)} style={{ width: '100%' }} /></label>;
}

function ComptesView() {
  const [settings, setSettings] = useState<SettingMap>({});
  const [uploading, setUploading] = useState('');

  useEffect(() => {
    loadSettings().then(setSettings).catch((error) => window.alert(error.message));
  }, []);

  const update = async (key: string, value: string) => {
    setUploading(key);
    try {
      await saveSetting(key, value);
      setSettings((current) => ({ ...current, [key]: value }));
    } catch (error: any) {
      window.alert(error.message);
    }
    setUploading('');
  };

  const upload = async (platform: string, file: File | undefined) => {
    if (!file) return;
    setUploading(`${platform}_preview`);
    try {
      const url = await uploadImage(file, 'social', 'social');
      await saveSetting(`${platform}_preview`, url);
      setSettings((current) => ({ ...current, [`${platform}_preview`]: url }));
    } catch (error: any) {
      window.alert(error.message || 'Import impossible');
    }
    setUploading('');
  };

  const platforms = [
    { id: 'ig', title: 'Instagram', icon: FaInstagram, color: '#c13584' },
    { id: 'tt', title: 'TikTok', icon: FaTiktok, color: '#111111' },
    { id: 'fb', title: 'Facebook', icon: FaFacebookF, color: '#1877f2' },
  ];

  return (
    <div className={styles.homeHub}>
      <header className={styles.comptesHeader}>
        <h1 className={styles.comptesTitle}>Comptes sociaux</h1>
        <p className={styles.comptesSubtitle}>Choisissez les apercus affiches sur le site.</p>
      </header>
      <div className={styles.reseauxGrid}>
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const preview = settings[`${platform.id}_preview`];
          const visible = settings[`${platform.id}_visible`] !== 'false';
          return (
            <article className={styles.socialCard} key={platform.id}>
              <div className={styles.socialCardHeader} style={{ borderLeftColor: platform.color }}>
                <Icon className={styles.socialIcon} style={{ color: platform.color }} />
                <div><h2 className={styles.socialTitle}>{platform.title}</h2><p className={styles.socialHint}>Apercu reseau social</p></div>
              </div>
              <div className={styles.socialVisibilityRow}>
                <span className={styles.socialVisibilityLabel}>Afficher sur le site</span>
                <button className={`${styles.switch} ${visible ? styles.switchOn : ''}`} type="button" disabled={uploading === `${platform.id}_visible`} onClick={() => update(`${platform.id}_visible`, visible ? 'false' : 'true')} aria-label={`Afficher ${platform.title}`}><span className={styles.switchThumb} /></button>
              </div>
              {!visible && <div className={styles.socialHiddenBadge}>Masque sur le site</div>}
              <div className={styles.socialPreviewWrap}>
                <div className={styles.socialPhoneFrame}>{preview ? <img className={styles.socialPreviewImg} src={preview} alt="" /> : <div className={styles.socialEmpty}>IMG<br />Aucun apercu</div>}</div>
              </div>
              <label className={styles.socialUploadBtn}>{uploading === `${platform.id}_preview` ? 'Import en cours' : 'Importer une image'}<input hidden type="file" accept="image/*" onChange={(event) => upload(platform.id, event.target.files?.[0])} /></label>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function InterfaceView() {
  const [subTab, setSubTab] = useState<'hero' | 'categories'>('hero');
  const [settings, setSettings] = useState<SettingMap>({});
  const [hero, setHero] = useState({ title: '', subtitle: '', text: '', image_left: '' });
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');
  const [newCategory, setNewCategory] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ label: '', subtitle: '', href: '', image: '', color: '#9a3d5c', sort_order: '0' });

  const refreshCategories = async () => {
    const { data, error } = await supabase.from('ecom-categories').select('*').order('sort_order');
    if (error) window.alert(error.message);
    else setCategories(data || []);
  };

  useEffect(() => {
    loadSettings().then((data) => {
      setSettings(data);
      setHero({
        title: data.hero_title || '',
        subtitle: data.hero_subtitle || '',
        text: data.hero_text || '',
        image_left: data.hero_image_left || '',
      });
    }).catch((error) => window.alert(error.message));
    refreshCategories();
  }, []);

  const saveHero = async () => {
    setSaving(true);
    try {
      await Promise.all([
        saveSetting('hero_title', hero.title),
        saveSetting('hero_subtitle', hero.subtitle),
        saveSetting('hero_text', hero.text),
        saveSetting('hero_image_left', hero.image_left),
      ]);
      setSettings((current) => ({ ...current, hero_title: hero.title, hero_subtitle: hero.subtitle, hero_text: hero.text, hero_image_left: hero.image_left }));
      window.alert('Banniere enregistree');
    } catch (error: any) {
      window.alert(error.message);
    }
    setSaving(false);
  };

  const uploadHero = async (file: File | undefined) => {
    if (!file) return;
    setUploading('hero');
    try {
      const url = await uploadImage(file, 'hero', 'hero');
      setHero((current) => ({ ...current, image_left: url }));
    } catch (error: any) {
      window.alert(error.message);
    }
    setUploading('');
  };

  const slug = (value: string) => value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const saveCategory = async (event: any) => {
    event.preventDefault();
    if (!categoryForm.label.trim()) return window.alert('Le libelle est obligatoire');
    setSaving(true);
    const id = slug(categoryForm.label);
    const payload = {
      id,
      label: categoryForm.label.trim(),
      subtitle: categoryForm.subtitle.trim(),
      href: categoryForm.href.trim() || `/collection/${id}`,
      image: categoryForm.image,
      color: categoryForm.color || '#9a3d5c',
      sort_order: Number(categoryForm.sort_order || 0),
    };
    const { error } = await supabase.from('ecom-categories').upsert(payload, { onConflict: 'id' });
    if (error) window.alert(error.message);
    else {
      setNewCategory(false);
      setCategoryForm({ label: '', subtitle: '', href: '', image: '', color: '#9a3d5c', sort_order: '0' });
      await refreshCategories();
    }
    setSaving(false);
  };

  const updateCategory = async (category: Category, key: string, value: any) => {
    const updated = { ...category, [key]: key === 'sort_order' ? Number(value || 0) : value };
    setCategories((current) => current.map((item) => item.id === category.id ? updated : item));
    const { error } = await supabase.from('ecom-categories').update({ [key]: updated[key] }).eq('id', category.id);
    if (error) {
      window.alert(error.message);
      await refreshCategories();
    }
  };

  const uploadCategory = async (category: Category, file: File | undefined) => {
    if (!file) return;
    setUploading(category.id);
    try {
      const url = await uploadImage(file, 'category', 'categories');
      await updateCategory(category, 'image', url);
    } catch (error: any) {
      window.alert(error.message);
    }
    setUploading('');
  };

  const deleteCategory = async (category: Category) => {
    if (!window.confirm(`Supprimer ${category.label} ?`)) return;
    const { error } = await supabase.from('ecom-categories').delete().eq('id', category.id);
    if (error) window.alert(error.message);
    else setCategories((current) => current.filter((item) => item.id !== category.id));
  };

  return (
    <div className={styles.homeHub}>
      <header className={styles.comptesHeader}>
        <h1 className={styles.comptesTitle}>Interface</h1>
        <p className={styles.comptesSubtitle}>Personnalisez la banniere et les categories.</p>
      </header>
      <div className={styles.subTabs}>
        <button type="button" className={`${styles.subTabBtn} ${subTab === 'hero' ? styles.subTabActive : ''}`} onClick={() => setSubTab('hero')}><FaDesktop className={styles.tabIcon} />Banniere Hero</button>
        <button type="button" className={`${styles.subTabBtn} ${subTab === 'categories' ? styles.subTabActive : ''}`} onClick={() => setSubTab('categories')}><FaBoxOpen className={styles.tabIcon} />Categories</button>
      </div>

      {subTab === 'hero' && (
        <div className={styles.heroEditorSingle}>
          <section className={styles.heroSingleImgCard}>
            <div className={styles.editorCardHeader}><FaDesktop className={styles.editorCardIcon} /><div><h3>Image</h3><p>Image principale de la banniere</p></div></div>
            <div className={styles.heroSingleImgWrap}>
              <label className={styles.heroImgPreview}>
                {hero.image_left ? <img src={hero.image_left} alt="" /> : <div className={styles.heroImgEmpty}><span>IMG</span>Ajoutez une image</div>}
                <span className={styles.heroImgOverlay}>{uploading === 'hero' ? 'Import en cours' : 'Changer l image'}</span>
                <input hidden type="file" accept="image/*" onChange={(event) => uploadHero(event.target.files?.[0])} />
              </label>
            </div>
          </section>
          <section className={styles.heroTextCard}>
            <div className={styles.editorCardHeader}><FaEdit className={styles.editorCardIcon} /><div><h3>Texte</h3><p>Contenu de la banniere</p></div></div>
            <div className={styles.heroFields}>
              <label className={styles.heroFieldRow}>Sous-titre<input className={styles.heroInput} value={hero.subtitle} onChange={(event) => setHero((current) => ({ ...current, subtitle: event.target.value }))} /></label>
              <label className={styles.heroFieldRow}>Titre<input className={styles.heroInput} value={hero.title} onChange={(event) => setHero((current) => ({ ...current, title: event.target.value }))} /></label>
              <label className={styles.heroFieldRow}>Texte<textarea className={styles.heroInput} value={hero.text} onChange={(event) => setHero((current) => ({ ...current, text: event.target.value }))} /></label>
              <button type="button" className="btn-primary" onClick={saveHero} disabled={saving || uploading === 'hero'}>Enregistrer la banniere</button>
            </div>
          </section>
        </div>
      )}

      {subTab === 'categories' && (
        <>
          <div className={styles.catToolbar}>
            <div><h2 className={styles.catToolbarTitle}>Categories</h2><p className={styles.catToolbarSub}>Cartes affichees dans la boutique</p></div>
            <button type="button" className={styles.catAddBtn} onClick={() => setNewCategory(true)}><FaPlus /> Ajouter</button>
          </div>
          {categories.length === 0 && <div className={styles.categoriesEmpty}><h3>Aucune categorie</h3><p>Ajoutez votre premiere categorie.</p></div>}
          <div className={styles.catEditorGrid}>
            {categories.map((category) => (
              <article className={styles.catEditorCard} key={category.id}>
                <div className={styles.catCardTop}><span className={styles.catIdPill}>{category.id}</span><button type="button" className={styles.catDeleteBtn} onClick={() => deleteCategory(category)}><FaTrash /> Supprimer</button></div>
                <div className={styles.catPreviewWrap}>
                  <p className={styles.catPreviewLabel}>Apercu</p>
                  <div className={styles.catPreviewCard} style={{ background: category.color || '#9a3d5c' }}>
                    {category.image && <img className={styles.catPreviewBg} src={category.image} alt="" />}
                    <div className={styles.catPreviewOverlay}><span className={styles.catPreviewSub}>{category.subtitle}</span><span className={styles.catPreviewTitle}>{category.label}</span></div>
                  </div>
                </div>
                <div className={styles.catFields}>
                  <label className={styles.catFieldRow}>Libelle<input className={styles.catInput} value={category.label || ''} onBlur={(event) => updateCategory(category, 'label', event.target.value)} onChange={(event) => setCategories((items) => items.map((item) => item.id === category.id ? { ...item, label: event.target.value } : item))} /></label>
                  <label className={styles.catFieldRow}>Sous-titre<input className={styles.catInput} value={category.subtitle || ''} onBlur={(event) => updateCategory(category, 'subtitle', event.target.value)} onChange={(event) => setCategories((items) => items.map((item) => item.id === category.id ? { ...item, subtitle: event.target.value } : item))} /></label>
                  <label className={styles.catFieldRow}>Lien<input className={styles.catInput} value={category.href || ''} onBlur={(event) => updateCategory(category, 'href', event.target.value)} onChange={(event) => setCategories((items) => items.map((item) => item.id === category.id ? { ...item, href: event.target.value } : item))} /></label>
                  <label className={styles.catFieldRow}>Couleur<input className={styles.catInput} type="color" value={category.color || '#9a3d5c'} onChange={(event) => updateCategory(category, 'color', event.target.value)} /></label>
                  <label className={styles.catFieldRow}>Ordre<input className={styles.catInput} type="number" value={category.sort_order || 0} onBlur={(event) => updateCategory(category, 'sort_order', event.target.value)} onChange={(event) => setCategories((items) => items.map((item) => item.id === category.id ? { ...item, sort_order: event.target.value } : item))} /></label>
                  <label className={styles.catUploadBtn}>{uploading === category.id ? 'Import en cours' : 'Importer une image'}<input hidden type="file" accept="image/*" onChange={(event) => uploadCategory(category, event.target.files?.[0])} /></label>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {newCategory && (
        <div className={styles.modalOverlay}>
          <form className={styles.modal} onSubmit={saveCategory}>
            <header className={styles.modalHeader}><h3>Nouvelle categorie</h3><button type="button" className={styles.modalClose} onClick={() => setNewCategory(false)}>X</button></header>
            <div className={styles.modalBody}>
              <Field label="Libelle" value={categoryForm.label} onChange={(value) => setCategoryForm((current) => ({ ...current, label: value }))} />
              <Field label="Sous-titre" value={categoryForm.subtitle} onChange={(value) => setCategoryForm((current) => ({ ...current, subtitle: value }))} />
              <Field label="Lien" value={categoryForm.href} onChange={(value) => setCategoryForm((current) => ({ ...current, href: value }))} />
              <Field label="Ordre" type="number" value={categoryForm.sort_order} onChange={(value) => setCategoryForm((current) => ({ ...current, sort_order: value }))} />
              <label><span className={styles.cardLabel}>Couleur</span><input type="color" value={categoryForm.color} onChange={(event) => setCategoryForm((current) => ({ ...current, color: event.target.value }))} /></label>
              <label className={styles.modalImgUpload}>{categoryForm.image ? <img className={styles.modalImgPreview} src={categoryForm.image} alt="" /> : <span className={styles.modalImgEmpty}>IMG<br />Importer une image</span>}<input hidden type="file" accept="image/*" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; setUploading('new'); try { const url = await uploadImage(file, 'category', 'categories'); setCategoryForm((current) => ({ ...current, image: url })); } catch (error: any) { window.alert(error.message); } setUploading(''); }} /></label>
            </div>
            <footer className={styles.modalFooter}><button type="button" className={styles.modalCancel} onClick={() => setNewCategory(false)}>Annuler</button><button className={styles.modalSave} type="submit" disabled={saving || uploading === 'new'}>Creer</button></footer>
          </form>
        </div>
      )}
    </div>
  );
}

