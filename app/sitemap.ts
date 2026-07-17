import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ltyymood.com'
  
  // Static routes
  const routes = [
    '',
    '/tous-les-produits',
    '/panier',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  try {
    // Dynamic products
    const { data: products } = await supabase.from('lty_products').select('id, updated_at')
    
    const productRoutes = (products || []).map((p) => ({
      url: `${baseUrl}/produits/${p.id}`,
      lastModified: new Date(p.updated_at || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    return [...routes, ...productRoutes]
  } catch (e) {
    return routes
  }
}
