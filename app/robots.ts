import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/ltyy/', // Hide backoffice from search
    },
    sitemap: 'https://ltyymood.com/sitemap.xml',
  }
}
