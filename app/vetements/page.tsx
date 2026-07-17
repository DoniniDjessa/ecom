import { Metadata } from 'next';
import FilterableGallery from '@/components/FilterableGallery';

export const metadata: Metadata = {
  title: 'Vêtements — Bling Store',
  description: 'Collections mode et vêtements premium pour la femme moderne chez Bling Store.',
};

export default function VetementsPage() {
  return (
    <div style={{ paddingTop: '2rem' }}>
      <FilterableGallery
        category="vetements"
        title="VÊTEMENTS"
        subtitle="MODE & STYLE POUR LA FEMME MODERNE"
      />
    </div>
  );
}
