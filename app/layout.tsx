import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import LayoutSwitcher from './layout-switcher';
import PageLoader from '@/components/PageLoader';

export const metadata: Metadata = {
  title: 'Sunfall Studio | Perruques & Mode Premium à Abidjan',
  description:
    'Découvrez Sunfall Studio, votre boutique de référence pour les perruques glams, extensions et vêtements fashion. Qualité premium et style unique à Abidjan.',
  keywords: 'perruques Abidjan, mode femme Côte d\'Ivoire, extensions cheveux, wigs premium, vêtements tendance, Sunfall Studio boutique, mèches humaines',
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: [{ url: '/logo.png', type: 'image/png' }],
    shortcut: '/logo.png',
  },
  openGraph: {
    title: 'Sunfall Studio | Perruques & Mode Premium à Abidjan',
    description: 'Définissez votre mood avec notre collection de perruques et vêtements premium.',
    images: ['/logo.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sunfall Studio | Perruques & Mode Premium',
    description: 'Boutique de perruques et mode tendance.',
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lobster&family=Roboto+Condensed:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/logo.png?v=2" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/logo.png?v=2" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png?v=2" />
      </head>
      <body>
        <CartProvider>
          {/* Animated background wig */}
          <div className="bg-wig-wrapper" aria-hidden="true">
            <svg
              className="bg-wig"
              viewBox="0 0 300 380"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Wig cap */}
              <ellipse cx="150" cy="90" rx="120" ry="88" fill="#c45b7a"/>
              {/* Long flowing hair */}
              <path d="M40 100 Q10 200 18 340 Q60 290 70 360 Q100 280 110 360 Q140 265 150 370 Q160 265 190 360 Q200 280 230 360 Q240 290 282 340 Q290 200 260 100 Q200 140 150 135 Q100 140 40 100Z" fill="#c45b7a"/>
              {/* Hair shine */}
              <path d="M80 120 Q72 220 78 320" stroke="rgba(255,255,255,0.15)" strokeWidth="6" strokeLinecap="round"/>
              <path d="M150 130 Q148 240 152 360" stroke="rgba(255,255,255,0.1)" strokeWidth="4" strokeLinecap="round"/>
              {/* Part line */}
              <path d="M110 75 Q150 65 190 75" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>

          <div className="page-content">
            <PageLoader />
            <LayoutSwitcher>
              {children}
            </LayoutSwitcher>
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
