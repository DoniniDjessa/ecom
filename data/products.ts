export interface Product {
  id: string;
  name: string;
  nameFr: string;
  price: number;
  category: string;
  image: string;
  images?: string[]; // Supporting multiple images from Supabase
  badge?: 'bestseller' | 'new' | 'sale';
  description?: string;
  isBestseller?: boolean;
  isNew?: boolean;
  stock_qty?: number;
  discount_percent?: number;
}

export const products: Product[] = [];

export const bestsellers = products.filter((p) => p.isBestseller);
export const newArrivals = products.filter((p) => p.isNew);
