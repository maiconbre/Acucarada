/**
 * Client-side functions para operações de produtos
 * 
 * Este arquivo contém funções que podem ser chamadas de Client Components,
 * usando o cliente Supabase do lado do cliente.
 */

import { createClient } from '@/lib/supabase/client';

export interface ProductFilters {
  search?: string;
  category?: string;
  sortBy?: 'name' | 'price' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductSearchResult {
  products: any[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Busca produtos com filtros e paginação (versão client-side)
 */
export async function getProducts(filters: ProductFilters = {}): Promise<ProductSearchResult> {
  const {
    search = '',
    category = '',
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    limit = 12
  } = filters;

  const supabase = createClient();
  
  // Construir query base
  let query = supabase
    .from('products')
    .select(`
      *,
      categories!inner(id, name, slug),
      product_images(image_url, alt_text, sort_order)
    `, { count: 'exact' })
    .eq('is_active', true);

  // Aplicar filtros
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (category) {
    query = query.eq('categories.slug', category);
  }

  // Aplicar ordenação
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Aplicar paginação
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data: products, error, count } = await query;

  if (error) {
    console.error('Erro ao buscar produtos:', error);
    throw new Error('Falha ao carregar produtos');
  }

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    products: products || [],
    totalCount,
    totalPages,
    currentPage: page
  };
}

/**
 * Busca produtos em destaque para a homepage (versão client-side)
 */
export async function getFeaturedProducts(limit: number = 6) {
  const supabase = createClient();
  
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      categories(id, name, slug),
      product_images(image_url, alt_text, sort_order)
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Erro ao buscar produtos em destaque:', error);
    throw new Error('Falha ao carregar produtos em destaque');
  }

  return products || [];
}

/**
 * Busca produto por slug (versão client-side)
 */
export async function getProductBySlug(slug: string) {
  const supabase = createClient();
  
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      categories(id, name, slug),
      product_images(image_url, alt_text, sort_order)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Erro ao buscar produto:', error);
    return null;
  }

  return product;
}

/**
 * Busca produtos por categoria (versão client-side)
 */
export async function getProductsByCategory(categorySlug: string, page: number = 1, limit: number = 12) {
  const supabase = createClient();
  
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  const { data: products, error, count } = await supabase
    .from('products')
    .select(`
      *,
      categories!inner(id, name, slug),
      product_images(image_url, alt_text, sort_order)
    `, { count: 'exact' })
    .eq('categories.slug', categorySlug)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Erro ao buscar produtos por categoria:', error);
    throw new Error('Falha ao carregar produtos da categoria');
  }

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    products: products || [],
    totalCount,
    totalPages,
    currentPage: page
  };
}