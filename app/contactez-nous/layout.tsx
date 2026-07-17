import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contactez-nous — Sunfall Studio',
  description: 'Contactez Sunfall Studio par WhatsApp, Instagram ou via notre formulaire de contact.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
