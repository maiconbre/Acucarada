export interface Product {
  id: string;
  name: string;
  short_description: string;
  description: string;
  price: number;
  slug: string;
  is_featured: boolean;
  is_active: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  category_id: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  product_images: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  totalPages?: number;
  currentPage?: number;
}

export type SortOption = 'name' | 'price' | 'created_at';
export type SortOrder = 'asc' | 'desc';