import { Metadata } from 'next';
import FilterableGallery from '@/components/FilterableGallery';

export const metadata: Metadata = {
  title: 'Perruques — Ltyy Mood',
  description: 'Découvrez notre collection de perruques premium : lace front, ondulées, afro, bob et plus encore.',
};

export default function PerruquesPage() {
  return (
    <div style={{ paddingTop: '2rem' }}>
      <FilterableGallery
        category="perruques"
        title="PERRUQUES"
        subtitle="NOTRE COLLECTION COMPLÈTE DE WIGS & EXTENSIONS"
      />
    </div>
  );
}
