import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

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
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
});

// GET - Listar produtos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || 'all';
    const sort = searchParams.get('sort') || 'created_desc';
    const featured = searchParams.get('featured');
    
    const supabase = await createClient();
    
    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        short_description,
        description,
        price,
        slug,
        is_active,
        is_featured,
        views_count,
        ingredients,
        allergens,
        preparation_time,
        meta_title,
        meta_description,
        created_at,
        updated_at,
        category:categories(id, name, slug),
        product_images(id, image_url, alt_text, is_primary, sort_order)
      `, { count: 'exact' });

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,short_description.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply category filter
    if (category && category !== 'all') {
      query = query.eq('category_id', category);
    }

    // Apply status filter
    switch (status) {
      case 'active':
        query = query.eq('is_active', true);
        break;
      case 'inactive':
        query = query.eq('is_active', false);
        break;
      case 'featured':
        query = query.eq('is_featured', true);
        break;
    }

    // Apply featured filter
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    // Apply sorting
    switch (sort) {
      case 'name_asc':
        query = query.order('name', { ascending: true });
        break;
      case 'name_desc':
        query = query.order('name', { ascending: false });
        break;
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'views_desc':
        query = query.order('views_count', { ascending: false });
        break;
      case 'created_desc':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: products, error, count } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json(
        { success: false, error: { message: 'Erro ao buscar produtos', code: 'FETCH_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        products: products || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
    });

  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

// POST - Criar produto (apenas usuários autenticados)
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
    const validationResult = createProductSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: validationResult.error.issues[0].message, 
            code: 'VALIDATION_ERROR',
            details: validationResult.error.issues
          } 
        },
        { status: 400 }
      );
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
      return NextResponse.json(
        { success: false, error: { message: 'Slug já existe', code: 'SLUG_EXISTS' } },
        { status: 409 }
      );
    }

    // Verificar se a categoria existe
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('id', productData.category_id)
      .eq('is_active', true)
      .single();

    if (!category) {
      return NextResponse.json(
        { success: false, error: { message: 'Categoria não encontrada', code: 'CATEGORY_NOT_FOUND' } },
        { status: 400 }
      );
    }

    // Criar produto
    const { data: newProduct, error } = await supabase
      .from('products')
      .insert({
        ...productData,
        created_by: session.user.id,
        updated_by: session.user.id,
      })
      .select(`
        id,
        name,
        short_description,
        description,
        price,
        slug,
        is_active,
        is_featured,
        views_count,
        ingredients,
        allergens,
        preparation_time,
        meta_title,
        meta_description,
        created_at,
        updated_at,
        category:categories(id, name, slug)
      `)
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return NextResponse.json(
        { success: false, error: { message: 'Erro ao criar produto', code: 'CREATE_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newProduct,
    }, { status: 201 });

  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}