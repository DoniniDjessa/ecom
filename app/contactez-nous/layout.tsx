import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contactez-nous — Ltyy Mood',
  description: 'Contactez Ltyy Mood par WhatsApp, Instagram ou via notre formulaire de contact.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
