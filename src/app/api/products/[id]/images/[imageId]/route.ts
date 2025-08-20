import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{
    id: string;
    imageId: string;
  }>;
}

// DELETE - Excluir imagem específica do produto (apenas usuários autenticados)
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

    const { id, imageId } = await params;
    
    if (!id || !imageId) {
      return NextResponse.json(
        { success: false, error: { message: 'ID do produto e da imagem são obrigatórios', code: 'MISSING_ID' } },
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

    // Verificar se a imagem existe e pertence ao produto
    const { data: existingImage } = await supabase
      .from('product_images')
      .select('id, image_url, is_primary')
      .eq('id', imageId)
      .eq('product_id', id)
      .single();

    if (!existingImage) {
      return NextResponse.json(
        { success: false, error: { message: 'Imagem não encontrada', code: 'IMAGE_NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Verificar se não é a única imagem do produto
    const { count } = await supabase
      .from('product_images')
      .select('id', { count: 'exact' })
      .eq('product_id', id);

    if (count === 1) {
      return NextResponse.json(
        { success: false, error: { message: 'Não é possível excluir a única imagem do produto', code: 'LAST_IMAGE' } },
        { status: 400 }
      );
    }

    // Excluir imagem
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId)
      .eq('product_id', id);

    if (error) {
      console.error('Error deleting product image:', error);
      return NextResponse.json(
        { success: false, error: { message: 'Erro ao excluir imagem', code: 'DELETE_ERROR' } },
        { status: 500 }
      );
    }

    // Se a imagem excluída era a principal, definir a primeira imagem restante como principal
    if (existingImage.is_primary) {
      const { data: firstImage } = await supabase
        .from('product_images')
        .select('id')
        .eq('product_id', id)
        .order('sort_order', { ascending: true })
        .limit(1)
        .single();

      if (firstImage) {
        await supabase
          .from('product_images')
          .update({ is_primary: true })
          .eq('id', firstImage.id);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Imagem excluída com sucesso',
    });

  } catch (error) {
    console.error('Delete product image error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

// PUT - Atualizar imagem específica do produto (apenas usuários autenticados)
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

    const { id, imageId } = await params;
    
    if (!id || !imageId) {
      return NextResponse.json(
        { success: false, error: { message: 'ID do produto e da imagem são obrigatórios', code: 'MISSING_ID' } },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { alt_text, is_primary, sort_order } = body;

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

    // Verificar se a imagem existe e pertence ao produto
    const { data: existingImage } = await supabase
      .from('product_images')
      .select('id')
      .eq('id', imageId)
      .eq('product_id', id)
      .single();

    if (!existingImage) {
      return NextResponse.json(
        { success: false, error: { message: 'Imagem não encontrada', code: 'IMAGE_NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Se esta imagem for marcada como principal, remover a flag de outras imagens
    if (is_primary) {
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', id)
        .neq('id', imageId);
    }

    // Atualizar imagem
    const updateData: any = {};
    if (alt_text !== undefined) updateData.alt_text = alt_text;
    if (is_primary !== undefined) updateData.is_primary = is_primary;
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    const { data: updatedImage, error } = await supabase
      .from('product_images')
      .update(updateData)
      .eq('id', imageId)
      .eq('product_id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating product image:', error);
      return NextResponse.json(
        { success: false, error: { message: 'Erro ao atualizar imagem', code: 'UPDATE_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedImage,
    });

  } catch (error) {
    console.error('Update product image error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}