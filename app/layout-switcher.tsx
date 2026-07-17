'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { GoToTop } from '@/components/GoToTop';
import BottomNav from '@/components/BottomNav';

export default function LayoutSwitcher({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/s-gestion');

  if (isAdmin) {
    return <main>{children}</main>;
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <BottomNav />
      <FloatingWhatsApp />
      <GoToTop />
    </>
  );
}
