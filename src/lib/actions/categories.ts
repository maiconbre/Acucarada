/**
 * Server Actions para operações de categorias
 * 
 * Este arquivo contém todas as Server Actions relacionadas a categorias,
 * permitindo busca e manipulação de dados no servidor.
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { CACHE_CONFIGS } from '@/lib/cache';
import { unstable_cache } from 'next/cache';

/**
 * Busca todas as categorias ativas
 */
export const getCategories = unstable_cache(
  async () => {
    const supabase = await createClient();
    
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Erro ao buscar categorias:', error);
      throw new Error('Falha ao carregar categorias');
    }

    return categories || [];
  },
  ['categories'],
  {
    revalidate: CACHE_CONFIGS.CATEGORIES.revalidate,
    tags: CACHE_CONFIGS.CATEGORIES.tags
  }
);

/**
 * Busca categorias com contagem de produtos
 */
export const getCategoriesWithCount = unstable_cache(
  async () => {
    const supabase = await createClient();
    
    const { data: categories, error } = await supabase
      .from('categories')
      .select(`
        *,
        products!inner(count)
      `)
      .eq('is_active', true)
      .eq('products.is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Erro ao buscar categorias com contagem:', error);
      throw new Error('Falha ao carregar categorias');
    }

    return categories || [];
  },
  ['categories-with-count'],
  {
    revalidate: CACHE_CONFIGS.CATEGORIES.revalidate,
    tags: CACHE_CONFIGS.CATEGORIES.tags
  }
);

/**
 * Busca categoria por slug
 */
export const getCategoryBySlug = unstable_cache(
  async (slug: string) => {
    const supabase = await createClient();
    
    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Erro ao buscar categoria:', error);
      return null;
    }

    return category;
  },
  ['category-by-slug'],
  {
    revalidate: CACHE_CONFIGS.CATEGORIES.revalidate,
    tags: CACHE_CONFIGS.CATEGORIES.tags
  }
);

/**
 * Busca categorias para navegação (com produtos ativos)
 */
export const getNavigationCategories = unstable_cache(
  async () => {
    const supabase = await createClient();
    
    // Buscar categorias que têm pelo menos um produto ativo
    const { data: categories, error } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        slug,
        description,
        products!inner(id)
      `)
      .eq('is_active', true)
      .eq('products.is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Erro ao buscar categorias de navegação:', error);
      return [];
    }

    // Remover duplicatas e contar produtos
    const uniqueCategories = categories?.reduce((acc: any[], category) => {
      const existing = acc.find(c => c.id === category.id);
      if (!existing) {
        acc.push({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          productCount: 1
        });
      } else {
        existing.productCount++;
      }
      return acc;
    }, []) || [];

    return uniqueCategories;
  },
  ['navigation-categories'],
  {
    revalidate: CACHE_CONFIGS.CATEGORIES.revalidate,
    tags: ['navigation', ...CACHE_CONFIGS.CATEGORIES.tags!]
  }
);

/**
 * Busca estatísticas de categorias para o dashboard
 */
export const getCategoryStats = unstable_cache(
  async () => {
    const supabase = await createClient();
    
    const { data: stats, error } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        products!inner(id, is_active)
      `)
      .eq('is_active', true);

    if (error) {
      console.error('Erro ao buscar estatísticas de categorias:', error);
      return [];
    }

    // Processar estatísticas
    const categoryStats = stats?.map(category => {
      const totalProducts = category.products?.length || 0;
      const activeProducts = category.products?.filter((p: any) => p.is_active).length || 0;
      
      return {
        id: category.id,
        name: category.name,
        totalProducts,
        activeProducts,
        inactiveProducts: totalProducts - activeProducts
      };
    }) || [];

    return categoryStats;
  },
  ['category-stats'],
  {
    revalidate: CACHE_CONFIGS.DASHBOARD_STATS.revalidate,
    tags: CACHE_CONFIGS.DASHBOARD_STATS.tags
  }
);