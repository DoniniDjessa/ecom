import { Metadata } from 'next';
import FilterableGallery from '@/components/FilterableGallery';

export const metadata: Metadata = {
  title: 'Accessoires & Bijoux — Sunfall Studio',
  description: 'Complétez votre look avec notre sélection de bijoux et accessoires tendance.',
};

export default function AccessoiresPage() {
  return (
    <div style={{ paddingTop: '2rem' }}>
      <FilterableGallery
        category="accessoires"
        title="BIJOUX & ACCESSOIRES"
        subtitle="LES DÉTAILS QUI FONT LA DIFFÉRENCE"
      />
    </div>
  );
}
