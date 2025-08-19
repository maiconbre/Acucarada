/**
 * Cache helpers para otimização de performance no Açucarada
 * 
 * Este arquivo contém utilitários para configuração de cache
 * em Server Components e API Routes do Next.js 14
 */

// Tipos para configuração de cache
export type CacheConfig = {
  revalidate?: number | false;
  tags?: string[];
};

export type FetchCacheConfig = {
  cache?: 'force-cache' | 'no-store' | 'no-cache';
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

/**
 * Configurações de cache predefinidas para diferentes tipos de dados
 */
export const CACHE_CONFIGS = {
  // Dados estáticos que raramente mudam
  STATIC: {
    revalidate: 86400, // 24 horas
    tags: ['static']
  } as CacheConfig,

  // Produtos - dados que podem mudar algumas vezes por dia
  PRODUCTS: {
    revalidate: 3600, // 1 hora
    tags: ['products']
  } as CacheConfig,

  // Categorias - dados que mudam raramente
  CATEGORIES: {
    revalidate: 7200, // 2 horas
    tags: ['categories']
  } as CacheConfig,

  // Dados em destaque - podem mudar diariamente
  FEATURED: {
    revalidate: 1800, // 30 minutos
    tags: ['featured', 'products']
  } as CacheConfig,

  // Estatísticas do dashboard - podem mudar frequentemente
  DASHBOARD_STATS: {
    revalidate: 300, // 5 minutos
    tags: ['dashboard', 'stats']
  } as CacheConfig,

  // Dados do usuário - sempre frescos
  USER_DATA: {
    revalidate: false,
    tags: ['user']
  } as CacheConfig,

  // Dados administrativos - sempre frescos
  ADMIN_DATA: {
    revalidate: false,
    tags: ['admin']
  } as CacheConfig,

  // Página de catálogo - dados que podem mudar algumas vezes por dia
  CATALOG: {
    revalidate: 3600, // 1 hora
    tags: ['products', 'categories']
  } as CacheConfig
} as const;

/**
 * Configurações para fetch API com cache
 */
export const FETCH_CONFIGS = {
  // Cache forçado para dados estáticos
  FORCE_CACHE: {
    cache: 'force-cache' as const,
    next: {
      revalidate: 86400,
      tags: ['static']
    }
  } as FetchCacheConfig,

  // Sem cache para dados dinâmicos
  NO_STORE: {
    cache: 'no-store' as const
  } as FetchCacheConfig,

  // Cache com revalidação para produtos
  PRODUCTS_CACHE: {
    cache: 'force-cache' as const,
    next: {
      revalidate: 3600,
      tags: ['products']
    }
  } as FetchCacheConfig,

  // Cache com revalidação para categorias
  CATEGORIES_CACHE: {
    cache: 'force-cache' as const,
    next: {
      revalidate: 7200,
      tags: ['categories']
    }
  } as FetchCacheConfig
} as const;

/**
 * Helper para criar configuração de cache personalizada
 */
export function createCacheConfig(
  revalidate: number | false,
  tags: string[] = []
): CacheConfig {
  return {
    revalidate,
    tags
  };
}

/**
 * Helper para criar configuração de fetch com cache
 */
export function createFetchConfig(
  cache: 'force-cache' | 'no-store' | 'no-cache',
  revalidate?: number | false,
  tags: string[] = []
): FetchCacheConfig {
  if (cache === 'no-store' || cache === 'no-cache') {
    return { cache };
  }

  return {
    cache,
    next: {
      revalidate: revalidate ?? false,
      tags
    }
  };
}

/**
 * Tags de cache para invalidação seletiva
 */
export const CACHE_TAGS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  FEATURED: 'featured',
  DASHBOARD: 'dashboard',
  STATS: 'stats',
  USER: 'user',
  ADMIN: 'admin',
  STATIC: 'static'
} as const;

/**
 * Helper para invalidar cache por tags
 * Uso: await invalidateCache([CACHE_TAGS.PRODUCTS])
 */
export async function invalidateCache(tags: string[]): Promise<void> {
  if (typeof window === 'undefined') {
    // Server-side: usar revalidateTag do Next.js
    const { revalidateTag } = await import('next/cache');
    tags.forEach(tag => revalidateTag(tag));
  }
}

/**
 * Helper para invalidar cache de produtos
 */
export async function invalidateProductsCache(): Promise<void> {
  await invalidateCache([CACHE_TAGS.PRODUCTS, CACHE_TAGS.FEATURED]);
}

/**
 * Helper para invalidar cache de categorias
 */
export async function invalidateCategoriesCache(): Promise<void> {
  await invalidateCache([CACHE_TAGS.CATEGORIES]);
}

/**
 * Helper para invalidar cache do dashboard
 */
export async function invalidateDashboardCache(): Promise<void> {
  await invalidateCache([CACHE_TAGS.DASHBOARD, CACHE_TAGS.STATS]);
}

/**
 * Configuração de cache para páginas específicas
 */
export const PAGE_CACHE_CONFIGS = {
  // Homepage - cache moderado
  HOME: {
    revalidate: 1800, // 30 minutos
    tags: ['home', 'products', 'featured']
  },

  // Catálogo - cache curto devido a filtros
  CATALOG: {
    revalidate: 900, // 15 minutos
    tags: ['catalog', 'products', 'categories']
  },

  // Página de produto - cache longo
  PRODUCT: {
    revalidate: 3600, // 1 hora
    tags: ['product', 'products']
  },

  // Categoria - cache moderado
  CATEGORY: {
    revalidate: 1800, // 30 minutos
    tags: ['category', 'products', 'categories']
  },

  // Admin - sem cache
  ADMIN: {
    revalidate: false,
    tags: ['admin']
  }
} as const;

/**
 * Exemplo de uso:
 * 
 * // Em um Server Component
 * export const revalidate = CACHE_CONFIGS.PRODUCTS.revalidate;
 * 
 * // Em uma função de fetch
 * const response = await fetch(url, FETCH_CONFIGS.PRODUCTS_CACHE);
 * 
 * // Invalidar cache após mutação
 * await invalidateProductsCache();
 */