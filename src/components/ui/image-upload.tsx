'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Star, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface ImagePreview {
  id?: string;
  url: string;
  file?: File;
  alt_text?: string;
  is_primary?: boolean;
  sort_order?: number;
}

interface ImageUploadProps {
  images: ImagePreview[];
  onImagesChange: (images: ImagePreview[]) => void;
  maxImages?: number;
  maxFileSize?: number; // em MB
  acceptedTypes?: string[];
  uploading?: boolean;
  multiple?: boolean;
  showPrimaryToggle?: boolean;
  showSortOrder?: boolean;
  className?: string;
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 10,
  maxFileSize = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  uploading = false,
  multiple = true,
  showPrimaryToggle = true,
  showSortOrder = false,
  className
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    await handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    const newImages: ImagePreview[] = [];

    // Verificar limite de imagens
    if (images.length + files.length > maxImages) {
      console.warn(`Máximo de ${maxImages} imagens permitidas.`);
      setIsUploading(false);
      return;
    }

    // Upload das imagens via API
    for (const file of files) {
      // Verificar tipo
      if (!acceptedTypes.includes(file.type)) {
        console.warn(`Tipo de arquivo não suportado: ${file.type}`);
        continue;
      }

      // Verificar tamanho
      if (file.size > maxFileSize * 1024 * 1024) {
        console.warn(`Arquivo muito grande: ${file.name}`);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', 'product-images');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro no upload');
        }

        const data = await response.json();
        
        const newImage: ImagePreview = {
          id: `uploaded-${Date.now()}-${Math.random()}`,
          url: data.url,
          alt_text: file.name,
          is_primary: images.length === 0 && newImages.length === 0,
          sort_order: images.length + newImages.length,
        };
        
        newImages.push(newImage);
      } catch (error) {
        console.error(`Erro no upload de ${file.name}:`, error);
      }
    }

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages]);
    }

    setIsUploading(false);

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    handleFiles(files);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    
    // Se removemos a imagem principal, tornar a primeira restante como principal
    if (images[index]?.is_primary && newImages.length > 0) {
if (newImages[0]) {
  newImages[0].is_primary = true;
}
    }
    
    onImagesChange(newImages);
  };

  const setPrimaryImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      is_primary: i === index
    }));
    onImagesChange(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
if (movedImage) {
  newImages.splice(toIndex, 0, movedImage);
}
    
    // Atualizar sort_order
    newImages.forEach((img, index) => {
      img.sort_order = index;
    });
    
    onImagesChange(newImages);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      {canAddMore && (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
            dragOver
              ? 'border-rose-400 bg-rose-50'
              : 'border-gray-300 hover:border-gray-400',
            (uploading || isUploading) && 'opacity-50 pointer-events-none'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            multiple={multiple}
            disabled={uploading || isUploading}
          />
          
          <div className="flex flex-col items-center gap-2">
            {(uploading || isUploading) ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
                <span className="text-sm text-gray-600">Enviando...</span>
              </>
            ) : (
              <>
                <div className="p-3 bg-gray-100 rounded-full">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">
                    Clique para adicionar {multiple ? 'imagens' : 'imagem'} ou arraste aqui
                  </p>
                  <p className="text-xs text-gray-500">
                    {acceptedTypes?.map(type => type?.split('/')?.[1]?.toUpperCase()).join(', ')} até {maxFileSize}MB
                  </p>
                  {maxImages > 1 && (
                    <p className="text-xs text-gray-500">
                      {images.length} de {maxImages} imagens
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Selecionar {multiple ? 'Imagens' : 'Imagem'}
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          <Label>Imagens Selecionadas ({images.length})</Label>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={image.url}
                className="relative group bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="aspect-square relative bg-gray-100">
                  <Image
                    src={image.url}
                    alt={image.alt_text || `Imagem ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  
                  {/* Overlay com ações */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  
                  {/* Botão remover */}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                  
                  {/* Badge principal */}
                  {image.is_primary && (
                    <Badge className="absolute top-2 left-2 text-xs bg-rose-500">
                      <Star className="w-3 h-3 mr-1" />
                      Principal
                    </Badge>
                  )}
                  
                  {/* Indicador de ordem */}
                  {showSortOrder && (
                    <Badge variant="secondary" className="absolute bottom-2 left-2 text-xs">
                      {index + 1}
                    </Badge>
                  )}
                </div>
                
                {/* Ações */}
                <div className="p-2 space-y-1">
                  {showPrimaryToggle && !image.is_primary && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full h-7 text-xs"
                      onClick={() => setPrimaryImage(index)}
                    >
                      <Star className="w-3 h-3 mr-1" />
                      Tornar Principal
                    </Button>
                  )}
                  
                  {showSortOrder && images.length > 1 && (
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="flex-1 h-7 text-xs"
                        disabled={index === 0}
                        onClick={() => moveImage(index, index - 1)}
                      >
                        ←
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="flex-1 h-7 text-xs"
                        disabled={index === images.length - 1}
                        onClick={() => moveImage(index, index + 1)}
                      >
                        →
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Estado vazio */}
      {images.length === 0 && !canAddMore && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Nenhuma imagem selecionada</p>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;