'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface UploadImageResult {
  success: boolean;
  url?: string;
  error?: string;
}

interface UploadImagesResult {
  success: boolean;
  urls?: string[];
  error?: string;
}

/**
 * Upload de uma única imagem para o Supabase Storage
 */
export async function uploadImage(
  formData: FormData,
  bucket: string = 'product-images'
): Promise<UploadImageResult> {
  try {
    const file = formData.get('file') as File;
    
    if (!file) {
      return {
        success: false,
        error: 'Nenhum arquivo foi fornecido'
      };
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'Arquivo deve ser uma imagem'
      };
    }

    // Validar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: 'Imagem deve ter no máximo 5MB'
      };
    }

    const supabase = createClient();
    
    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${bucket === 'product-images' ? 'products' : 'categories'}/${fileName}`;

    // Upload para Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      console.error('Erro no upload:', uploadError);
      return {
        success: false,
        error: `Erro no upload: ${uploadError.message}`
      };
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrl
    };
  } catch (error) {
    console.error('Erro inesperado no upload:', error);
    return {
      success: false,
      error: 'Erro inesperado no upload da imagem'
    };
  }
}

/**
 * Upload de múltiplas imagens para o Supabase Storage
 */
export async function uploadImages(
  formData: FormData,
  bucket: string = 'product-images'
): Promise<UploadImagesResult> {
  try {
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return {
        success: false,
        error: 'Nenhum arquivo foi fornecido'
      };
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
      return {
        success: false,
        error: `Nenhuma imagem foi enviada com sucesso. Erros: ${errors.join(', ')}`
      };
    }

    return {
      success: true,
      urls: uploadedUrls
    };
  } catch (error) {
    console.error('Erro inesperado no upload múltiplo:', error);
    return {
      success: false,
      error: 'Erro inesperado no upload das imagens'
    };
  }
}

/**
 * Deletar imagem do Supabase Storage
 */
export async function deleteImage(
  imageUrl: string,
  bucket: string = 'product-images'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    
    // Extrair o caminho do arquivo da URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(-2).join('/'); // Ex: products/filename.jpg

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Erro ao deletar imagem:', error);
      return {
        success: false,
        error: `Erro ao deletar imagem: ${error.message}`
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Erro inesperado ao deletar imagem:', error);
    return {
      success: false,
      error: 'Erro inesperado ao deletar imagem'
    };
  }
}

/**
 * Upload de imagem via API Route (para uso em componentes client)
 */
export async function uploadImageViaAPI(
  file: File,
  bucket: string = 'product-images'
): Promise<UploadImageResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Erro no upload'
      };
    }

    const data = await response.json();
    return {
      success: true,
      url: data.url
    };
  } catch (error) {
    console.error('Erro no upload via API:', error);
    return {
      success: false,
      error: 'Erro inesperado no upload'
    };
  }
}

/**
 * Upload de múltiplas imagens via API Route (para uso em componentes client)
 */
export async function uploadImagesViaAPI(
  files: File[],
  bucket: string = 'product-images'
): Promise<UploadImagesResult> {
  try {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('bucket', bucket);

    const response = await fetch('/api/upload/multiple', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Erro no upload'
      };
    }

    const data = await response.json();
    return {
      success: true,
      urls: data.urls
    };
  } catch (error) {
    console.error('Erro no upload múltiplo via API:', error);
    return {
      success: false,
      error: 'Erro inesperado no upload'
    };
  }
}