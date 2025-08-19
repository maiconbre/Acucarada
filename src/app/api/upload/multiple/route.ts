import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const bucket = (formData.get('bucket') as string) || 'product-images';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum arquivo foi fornecido' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const uploadedUrls: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: deve ser uma imagem`);
        continue;
      }

      // Validar tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name}: deve ter no máximo 5MB`);
        continue;
      }

      try {
        // Gerar nome único para o arquivo
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${bucket === 'product-images' ? 'products' : 'categories'}/${fileName}`;

        // Upload para Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        if (uploadError) {
          errors.push(`${file.name}: ${uploadError.message}`);
          continue;
        }

        // Obter URL pública
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      } catch (error) {
        console.error(`Erro no upload de ${file.name}:`, error);
        errors.push(`${file.name}: erro inesperado`);
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { 
          error: `Nenhuma imagem foi enviada com sucesso. Erros: ${errors.join(', ')}`,
          errors 
        },
        { status: 400 }
      );
    }

    const response: any = { urls: uploadedUrls };
    if (errors.length > 0) {
      response.warnings = errors;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erro inesperado no upload múltiplo:', error);
    return NextResponse.json(
      { error: 'Erro inesperado no upload das imagens' },
      { status: 500 }
    );
  }
}