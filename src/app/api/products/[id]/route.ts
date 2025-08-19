import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

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
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Buscar produto por ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: 'ID do produto é obrigatório', code: 'MISSING_ID' } },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    const { data: product, error } = await supabase
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
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: { message: 'Produto não encontrado', code: 'NOT_FOUND' } },
          { status: 404 }
        );
      }
      
      console.error('Error fetching product:', error);
      return NextResponse.json(
        { success: false, error: { message: 'Erro ao buscar produto', code: 'FETCH_ERROR' } },
        { status: 500 }
      );
    }

    // Incrementar contador de visualizações apenas para produtos ativos
    if (product.is_active) {
      await supabase
        .from('products')
        .update({ views_count: (product.views_count || 0) + 1 })
        .eq('id', id);
    }

    return NextResponse.json({
      success: true,
      data: product,
    });

  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

// PUT - Atualizar produto (apenas usuários autenticados)
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: 'Não autenticado', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: 'ID do produto é obrigatório', code: 'MISSING_ID' } },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validationResult = updateProductSchema.safeParse(body);
    
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

    const updateData = validationResult.data;
    const supabase = await createClient();

    // Verificar se o produto existe
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id, slug')
      .eq('id', id)
      .single();

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: { message: 'Produto não encontrado', code: 'NOT_FOUND' } },
        { status: 404 }
      );
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
        return NextResponse.json(
          { success: false, error: { message: 'Slug já existe', code: 'SLUG_EXISTS' } },
          { status: 409 }
        );
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
        return NextResponse.json(
          { success: false, error: { message: 'Categoria não encontrada', code: 'CATEGORY_NOT_FOUND' } },
          { status: 400 }
        );
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
      console.error('Error updating product:', error);
      return NextResponse.json(
        { success: false, error: { message: 'Erro ao atualizar produto', code: 'UPDATE_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedProduct,
    });

  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

// DELETE - Excluir produto (apenas usuários autenticados)
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: 'Não autenticado', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: 'ID do produto é obrigatório', code: 'MISSING_ID' } },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verificar se o produto existe
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', id)
      .single();

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: { message: 'Produto não encontrado', code: 'NOT_FOUND' } },
        { status: 404 }
      );
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
      console.error('Error deleting product:', error);
      return NextResponse.json(
        { success: false, error: { message: 'Erro ao excluir produto', code: 'DELETE_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Produto "${existingProduct.name}" excluído com sucesso`,
    });

  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}