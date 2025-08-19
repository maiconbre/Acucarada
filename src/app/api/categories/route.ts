import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

const createCategorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  slug: z.string().min(1, 'Slug é obrigatório').max(100),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
});

// GET - Listar categorias
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('include_inactive') === 'true';
    const withProductCount = searchParams.get('with_product_count') === 'true';
    
    const supabase = await createClient();
    
    let query = supabase
      .from('categories')
      .select(`
        id,
        name,
        slug,
        description,
        is_active,
        sort_order,
        meta_title,
        meta_description,
        created_at,
        updated_at
      `);

    // Filtrar apenas categorias ativas por padrão
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    // Ordenar por sort_order e depois por nome
    query = query.order('sort_order', { ascending: true })
                 .order('name', { ascending: true });

    const { data: categories, error } = await query;

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json(
        { success: false, error: { message: 'Erro ao buscar categorias', code: 'FETCH_ERROR' } },
        { status: 500 }
      );
    }

    // Se solicitado, buscar contagem de produtos para cada categoria
    let categoriesWithCount = categories;
    if (withProductCount && categories) {
      const categoryCountPromises = categories.map(async (category) => {
        const { count } = await supabase
          .from('products')
          .select('id', { count: 'exact' })
          .eq('category_id', category.id)
          .eq('is_active', true);
        
        return {
          ...category,
          product_count: count || 0,
        };
      });

      categoriesWithCount = await Promise.all(categoryCountPromises);
    }

    return NextResponse.json({
      success: true,
      data: categoriesWithCount || [],
    });

  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

// POST - Criar categoria (apenas usuários autenticados)
export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: 'Não autenticado', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = createCategorySchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: validationResult.error.issues[0]?.message || 'Dados inválidos', 
            code: 'VALIDATION_ERROR',
            details: validationResult.error.issues
          } 
        },
        { status: 400 }
      );
    }

    const categoryData = validationResult.data;
    const supabase = await createClient();

    // Verificar se o slug já existe
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categoryData.slug)
      .single();

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: { message: 'Slug já existe', code: 'SLUG_EXISTS' } },
        { status: 409 }
      );
    }

    // Criar categoria
    const { data: newCategory, error } = await supabase
      .from('categories')
      .insert({
        ...categoryData,
        created_by: session.user.id,
        updated_by: session.user.id,
      })
      .select(`
        id,
        name,
        slug,
        description,
        is_active,
        sort_order,
        meta_title,
        meta_description,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error('Error creating category:', error);
      return NextResponse.json(
        { success: false, error: { message: 'Erro ao criar categoria', code: 'CREATE_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newCategory,
    }, { status: 201 });

  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}