import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

const uploadImageSchema = z.object({
  image_url: z.string().url('URL da imagem inválida'),
  alt_text: z.string().min(1, 'Texto alternativo é obrigatório').max(200),
  is_primary: z.boolean().default(false),
  sort_order: z.number().int().min(0).default(0),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET - Listar imagens do produto
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: 'ID do produto é obrigatório', code: 'MISSING_ID' } },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Verificar se o produto existe
    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single();

    if (!product) {
      return NextResponse.json(
        { success: false, error: { message: 'Produto não encontrado', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    const { data: images, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', id)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching product images:', error);
      return NextResponse.json(
        { success: false, error: { message: 'Erro ao buscar imagens', code: 'FETCH_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: images || [],
    });

  } catch (error) {
    console.error('Get product images error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

// POST - Adicionar imagem ao produto (apenas usuários autenticados)
export async function POST(
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

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: 'ID do produto é obrigatório', code: 'MISSING_ID' } },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validationResult = uploadImageSchema.safeParse(body);
    
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

    const imageData = validationResult.data;
    const supabase = await createClient();

    // Verificar se o produto existe
    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single();

    if (!product) {
      return NextResponse.json(
        { success: false, error: { message: 'Produto não encontrado', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Se esta imagem for marcada como principal, remover a flag de outras imagens
    if (imageData.is_primary) {
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', id);
    }

    // Adicionar imagem
    const { data: newImage, error } = await supabase
      .from('product_images')
      .insert({
        ...imageData,
        product_id: id,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error adding product image:', error);
      return NextResponse.json(
        { success: false, error: { message: 'Erro ao adicionar imagem', code: 'CREATE_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newImage,
    }, { status: 201 });

  } catch (error) {
    console.error('Add product image error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

// PUT - Atualizar ordem das imagens (apenas usuários autenticados)
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

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: 'ID do produto é obrigatório', code: 'MISSING_ID' } },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { images } = body;

    if (!Array.isArray(images)) {
      return NextResponse.json(
        { success: false, error: { message: 'Lista de imagens inválida', code: 'INVALID_IMAGES' } },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verificar se o produto existe
    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single();

    if (!product) {
      return NextResponse.json(
        { success: false, error: { message: 'Produto não encontrado', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Atualizar ordem das imagens
    const updatePromises = images.map((image: any, index: number) => {
      return supabase
        .from('product_images')
        .update({ 
          sort_order: index,
          is_primary: image.is_primary || false
        })
        .eq('id', image.id)
        .eq('product_id', id);
    });

    const results = await Promise.all(updatePromises);
    
    // Verificar se houve erros
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('Error updating image order:', errors);
      return NextResponse.json(
        { success: false, error: { message: 'Erro ao atualizar ordem das imagens', code: 'UPDATE_ERROR' } },
        { status: 500 }
      );
    }

    // Buscar imagens atualizadas
    const { data: updatedImages } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', id)
      .order('sort_order', { ascending: true });

    return NextResponse.json({
      success: true,
      data: updatedImages || [],
    });

  } catch (error) {
    console.error('Update image order error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}