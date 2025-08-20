/**
 * Server Actions para operações de produtos
 * 
 * Este arquivo contém todas as Server Actions relacionadas a produtos,
 * permitindo busca e manipulação de dados no servidor.
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { CACHE_CONFIGS } from '@/lib/cache';
import { unstable_cache, revalidateTag } from 'next/cache';
import { getProductMainImage } from '@/lib/utils/product-utils';
import { getCurrentSession } from '@/lib/auth';
import { z } from 'zod';
import { redirect } from 'next/navigation';

// Schemas de validação
const createProductSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  slug: z.string().min(1, 'Slug é obrigatório').max(100),
  short_description: z.string().min(1, 'Descrição curta é obrigatória').max(200),
  description: z.string().optional(),
  price: z.number().positive('Preço deve ser positivo'),
  category_id: z.string().uuid('ID da categoria inválido'),
  ingredients: z.string().optional(),
  allergens: z.string().optional(),
  preparation_time: z.string().optional(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});

const updateProductSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100).optional(),
  slug: z.string().min(1, 'Slug é obrigatório').max(100).optional(),
  short_description: z.string().min(1, 'Descrição curta é obrigatória').max(200).optional(),
  description: z.string().optional(),
  price: z.number().positive('Preço deve ser positivo').optional(),
  category_id: z.string().uuid('ID da categoria inválido').optional(),
  ingredients: z.string().optional(),
  allergens: z.string().optional(),
  preparation_time: z.string().optional(),
  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});

// Tipos para retorno das actions
export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
}

// Tipos para os parâmetros de busca
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
 * Busca produtos com filtros e paginação
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

  const supabase = await createClient();
  
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
    console.error('Erro ao buscar produtos:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      fullError: error
    });
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
 * Busca produtos em destaque para a homepage
 */
export const getFeaturedProducts = unstable_cache(
  async (limit: number = 6) => {
    const supabase = await createClient();
    
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
      console.error('Erro ao buscar produtos em destaque:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error
      });
      throw new Error('Falha ao carregar produtos em destaque');
    }

    return products || [];
  },
  ['featured-products'],
  {
    revalidate: CACHE_CONFIGS.FEATURED.revalidate,
    tags: CACHE_CONFIGS.FEATURED.tags
  }
);

/**
 * Busca produto por slug
 */
export const getProductBySlug = unstable_cache(
  async (slug: string) => {
    const supabase = await createClient();
    
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
  },
  ['product-by-slug'],
  {
    revalidate: CACHE_CONFIGS.PRODUCTS.revalidate,
    tags: CACHE_CONFIGS.PRODUCTS.tags
  }
);

/**
 * Busca produtos relacionados
 */
export const getRelatedProducts = unstable_cache(
  async (categoryId: string, currentProductId: string, limit: number = 4) => {
    const supabase = await createClient();
    
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(id, name, slug),
        product_images(image_url, alt_text, sort_order)
      `)
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .neq('id', currentProductId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar produtos relacionados:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error
      });
      return [];
    }

    return products || [];
  },
  ['related-products'],
  {
    revalidate: CACHE_CONFIGS.PRODUCTS.revalidate,
    tags: CACHE_CONFIGS.PRODUCTS.tags
  }
);

/**
 * Busca produtos por categoria
 */
export const getProductsByCategory = unstable_cache(
  async (categorySlug: string, page: number = 1, limit: number = 12) => {
    const supabase = await createClient();
    
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
      console.error('Erro ao buscar produtos por categoria:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error
      });
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
  },
  ['products-by-category'],
  {
    revalidate: CACHE_CONFIGS.PRODUCTS.revalidate,
    tags: CACHE_CONFIGS.PRODUCTS.tags
  }
);

/**
 * Busca produtos para o catálogo com cache otimizado
 */
export const getCatalogProducts = unstable_cache(
  async (filters: ProductFilters = {}) => {
    return await getProducts(filters);
  },
  ['catalog-products'],
  {
    revalidate: CACHE_CONFIGS.PRODUCTS.revalidate,
    tags: ['catalog', ...CACHE_CONFIGS.PRODUCTS.tags!]
  }
);



/**
 * Incrementa o contador de visualizações de um produto
 */
export async function incrementProductViews(productId: string): Promise<void> {
  const supabase = await createClient();
  
  try {
    await supabase.rpc('increment_product_views', {
      product_uuid: productId
    });
  } catch (error) {
    console.error('Erro ao incrementar visualizações:', error);
  }
}

/**
 * Gera metadata para um produto específico
 */
export async function generateProductMetadata(product: any): Promise<any> {
  const mainImage = getProductMainImage(product);
  
  return {
    title: product.seo_title || `${product.name} - Açucarada`,
    description: product.seo_description || product.short_description,
    openGraph: {
      title: product.name,
      description: product.short_description,
      type: 'website',
      images: mainImage ? [{
        url: mainImage,
        alt: product.name,
      }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.short_description,
      images: mainImage ? [mainImage] : [],
    },
  };
}

// ============================================
// SERVER ACTIONS PARA CRUD DE PRODUTOS
// ============================================

/**
 * Server Action para criar um novo produto
 */
export async function createProduct(formData: FormData): Promise<ActionResult> {
  try {
    // Verificar autenticação
    const session = await getCurrentSession();
    if (!session) {
      return {
        success: false,
        error: {
          message: 'Não autenticado',
          code: 'UNAUTHORIZED'
        }
      };
    }

    // Extrair dados do FormData
    const data = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      short_description: formData.get('short_description') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      category_id: formData.get('category_id') as string,
      ingredients: formData.get('ingredients') as string,
      allergens: formData.get('allergens') as string,
      preparation_time: formData.get('preparation_time') as string,
      is_active: formData.get('is_active') === 'true',
      is_featured: formData.get('is_featured') === 'true',
      seo_title: formData.get('seo_title') as string,
      seo_description: formData.get('seo_description') as string,
    };

    // Validar dados
    const validationResult = createProductSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        error: {
          message: validationResult.error.issues[0]?.message || 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: validationResult.error.issues
        }
      };
    }

    const productData = validationResult.data;
    const supabase = await createClient();

    // Verificar se o slug já existe
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('slug', productData.slug)
      .single();

    if (existingProduct) {
      return {
        success: false,
        error: {
          message: 'Slug já existe',
          code: 'SLUG_EXISTS'
        }
      };
    }

    // Verificar se a categoria existe
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('id', productData.category_id)
      .eq('is_active', true)
      .single();

    if (!category) {
      return {
        success: false,
        error: {
          message: 'Categoria não encontrada',
          code: 'CATEGORY_NOT_FOUND'
        }
      };
    }

    // Criar produto
    const { data: newProduct, error } = await supabase
      .from('products')
      .insert({
        ...productData,
        created_by: session.user.id,
        updated_by: session.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar produto:', error);
      return {
        success: false,
        error: {
          message: 'Erro interno do servidor',
          code: 'INTERNAL_ERROR'
        }
      };
    }

    // Invalidar cache
    revalidateTag('products');
    revalidateTag('featured');
    revalidateTag('dashboard');

    return {
      success: true,
      data: newProduct
    };
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return {
      success: false,
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    };
  }
}

/**
 * Server Action para atualizar um produto
 */
export async function updateProduct(id: string, formData: FormData): Promise<ActionResult> {
  try {
    // Verificar autenticação
    const session = await getCurrentSession();
    if (!session) {
      return {
        success: false,
        error: {
          message: 'Não autenticado',
          code: 'UNAUTHORIZED'
        }
      };
    }

    if (!id) {
      return {
        success: false,
        error: {
          message: 'ID do produto é obrigatório',
          code: 'MISSING_ID'
        }
      };
    }

    // Extrair dados do FormData
    const data: any = {};
    
    // Só incluir campos que foram fornecidos
    const fields = ['name', 'slug', 'short_description', 'description', 'category_id', 'ingredients', 'allergens', 'preparation_time', 'seo_title', 'seo_description'];
    fields.forEach(field => {
      const value = formData.get(field) as string;
      if (value !== null && value !== '') {
        data[field] = value;
      }
    });

    // Campos numéricos e booleanos
    const priceValue = formData.get('price') as string;
    if (priceValue !== null && priceValue !== '') {
      data.price = parseFloat(priceValue);
    }

    const isActiveValue = formData.get('is_active');
    if (isActiveValue !== null) {
      data.is_active = isActiveValue === 'true';
    }

    const isFeaturedValue = formData.get('is_featured');
    if (isFeaturedValue !== null) {
      data.is_featured = isFeaturedValue === 'true';
    }

    // Validar dados
    const validationResult = updateProductSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        error: {
          message: validationResult.error.issues[0]?.message || 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          details: validationResult.error.issues
        }
      };
    }

    const updateData = validationResult.data;
    const supabase = await createClient();

    // Verificar se o produto existe
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id, slug')
      .eq('id', id)
      .single();

    if (!existingProduct) {
      return {
        success: false,
        error: {
          message: 'Produto não encontrado',
          code: 'NOT_FOUND'
        }
      };
    }

    // Verificar se o novo slug já existe (se fornecido)
    if (updateData.slug && updateData.slug !== existingProduct.slug) {
      const { data: slugExists } = await supabase
        .from('products')
        .select('id')
        .eq('slug', updateData.slug)
        .neq('id', id)
        .single();

      if (slugExists) {
        return {
          success: false,
          error: {
            message: 'Slug já existe',
            code: 'SLUG_EXISTS'
          }
        };
      }
    }

    // Verificar se a categoria existe (se fornecida)
    if (updateData.category_id) {
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('id', updateData.category_id)
        .eq('is_active', true)
        .single();

      if (!category) {
        return {
          success: false,
          error: {
            message: 'Categoria não encontrada',
            code: 'CATEGORY_NOT_FOUND'
          }
        };
      }
    }

    // Atualizar produto
    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update({
        ...updateData,
        updated_by: session.user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar produto:', error);
      return {
        success: false,
        error: {
          message: 'Erro interno do servidor',
          code: 'INTERNAL_ERROR'
        }
      };
    }

    // Invalidar cache
    revalidateTag('products');
    revalidateTag('featured');
    revalidateTag('dashboard');

    return {
      success: true,
      data: updatedProduct
    };
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return {
      success: false,
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    };
  }
}

/**
 * Server Action para deletar um produto
 */
export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    // Verificar autenticação
    const session = await getCurrentSession();
    if (!session) {
      return {
        success: false,
        error: {
          message: 'Não autenticado',
          code: 'UNAUTHORIZED'
        }
      };
    }

    if (!id) {
      return {
        success: false,
        error: {
          message: 'ID do produto é obrigatório',
          code: 'MISSING_ID'
        }
      };
    }

    const supabase = await createClient();

    // Verificar se o produto existe
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', id)
      .single();

    if (!existingProduct) {
      return {
        success: false,
        error: {
          message: 'Produto não encontrado',
          code: 'NOT_FOUND'
        }
      };
    }

    // Excluir imagens do produto primeiro (devido às foreign keys)
    await supabase
      .from('product_images')
      .delete()
      .eq('product_id', id);

    // Excluir produto
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar produto:', error);
      return {
        success: false,
        error: {
          message: 'Erro interno do servidor',
          code: 'INTERNAL_ERROR'
        }
      };
    }

    // Invalidar cache
    revalidateTag('products');
    revalidateTag('featured');
    revalidateTag('dashboard');

    return {
      success: true,
      data: { message: `Produto "${existingProduct.name}" excluído com sucesso` }
    };
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    return {
      success: false,
      error: {
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      }
    };
  }
}

/**
 * Server Action para criar produto com redirecionamento
 */
export async function createProductWithRedirect(formData: FormData) {
  const result = await createProduct(formData);
  
  if (result.success) {
    redirect('/admin/produtos');
  }
  
  return result;
}

/**
 * Server Action para atualizar produto com redirecionamento
 */
export async function updateProductWithRedirect(id: string, formData: FormData) {
  const result = await updateProduct(id, formData);
  
  if (result.success) {
    redirect('/admin/produtos');
  }
  
  return result;
}

/**
 * Server Action para deletar produto com redirecionamento
 */
export async function deleteProductWithRedirect(id: string) {
  const result = await deleteProduct(id);
  
  if (result.success) {
    redirect('/admin/produtos');
  }
  
  return result;
}

/**
 * Gera metadata para uma categoria
 */
export async function generateCategoryMetadata(category: any): Promise<any> {
  return {
    title: `${category.name} - Açucarada`,
    description: category.description || `Explore nossa seleção de ${category.name.toLowerCase()} artesanais`,
    openGraph: {
      title: `${category.name} - Açucarada`,
      description: category.description || `Explore nossa seleção de ${category.name.toLowerCase()} artesanais`,
      type: 'website',
    },
  };
}