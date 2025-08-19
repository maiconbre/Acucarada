'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useFormStatus } from 'react-dom';
import { createClient } from '@/lib/supabase/client';
import { updateProductWithRedirect } from '@/lib/actions/products';
import { ImageUpload, type ImagePreview } from '@/components/ui/image-upload';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductImage {
  id: string;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  price: number;
  category_id: string;
  ingredients: string;
  allergens: string;
  preparation_time: string;
  is_active: boolean;
  is_featured: boolean;
  meta_title: string;
  meta_description: string;
  product_images: ProductImage[];
}

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Atualizando...' : 'Atualizar Produto'}
    </Button>
  );
}

export default function EditProductPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    short_description: '',
    description: '',
    price: '',
    category_id: '',
    ingredients: '',
    allergens: '',
    preparation_time: '',
    is_active: true,
    is_featured: false,
    meta_title: '',
    meta_description: '',
  });

  const supabase = createClient();

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [productId]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar categorias',
        variant: 'destructive',
      });
    }
  };

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (
            id,
            image_url,
            alt_text,
            is_primary,
            sort_order
          )
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;
      
      if (data) {
        setProduct(data);
        setFormData({
          name: data.name || '',
          slug: data.slug || '',
          short_description: data.short_description || '',
          description: data.description || '',
          price: data.price?.toString() || '',
          category_id: data.category_id || '',
          ingredients: data.ingredients || '',
          allergens: data.allergens || '',
          preparation_time: data.preparation_time || '',
          is_active: data.is_active ?? true,
          is_featured: data.is_featured ?? false,
          meta_title: data.meta_title || '',
          meta_description: data.meta_description || '',
        });
        
        // Set existing images
        const existingImages: ImagePreview[] = data.product_images?.map((img: ProductImage, index: number) => ({
          id: img.id,
          url: img.image_url,
          alt_text: img.alt_text,
          is_primary: img.is_primary,
          sort_order: img.sort_order
        })) || [];
        setImages(existingImages);
      }
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar produto',
        variant: 'destructive',
      });
      router.push('/admin/produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from name
    if (field === 'name' && typeof value === 'string') {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Erro',
          description: 'Por favor, selecione apenas arquivos de imagem',
          variant: 'destructive',
        });
        return null;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: 'Erro',
          description: 'A imagem deve ter no máximo 5MB',
          variant: 'destructive',
        });
        return null;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao fazer upload da imagem',
        variant: 'destructive',
      });
      return null;
    }
  };

  const handleImagesChange = (newImages: ImagePreview[]) => {
    setImages(newImages);
  };

  // As imagens já são enviadas automaticamente pelo componente ImageUpload
  // Apenas extraímos as URLs das imagens
  const getImageUrls = (imageFiles: ImagePreview[]): string[] => {
    return imageFiles.map(image => image.url);
  };

  const handleSubmit = async (formData: FormData) => {
    if (images.length === 0) {
      toast({
        title: 'Erro',
        description: 'Adicione pelo menos uma imagem do produto.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Obter URLs das imagens (já foram enviadas pelo ImageUpload)
      const imageUrls = getImageUrls(images);
      
      // Update the hidden field with current image URLs
      formData.set('image_urls', JSON.stringify(imageUrls));
      
      // Call the Server Action
      const result = await updateProductWithRedirect(productId, formData);
      
      if (!result.success) {
        setError(typeof result.error === 'string' ? result.error : 'Erro ao atualizar produto');
        return;
      }

      // Success - redirect will be handled by the Server Action
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      setError('Erro interno do servidor');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/produtos">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-brown-800">Carregando...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/produtos">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-brown-800">Produto não encontrado</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/produtos">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-brown-800">Editar Produto</h1>
          <p className="text-brown-600">Atualize as informações do produto</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-6">
        {/* Hidden fields for boolean values and image URLs */}
        <input type="hidden" name="is_active" value={formData.is_active.toString()} />
        <input type="hidden" name="is_featured" value={formData.is_featured.toString()} />
        <input type="hidden" name="image_urls" value={JSON.stringify(images.map(img => img.url))} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Produto *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Ex: Bolo de Chocolate"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="bolo-de-chocolate"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="short_description">Descrição Curta *</Label>
                  <Textarea
                    id="short_description"
                    name="short_description"
                    value={formData.short_description}
                    onChange={(e) => handleInputChange('short_description', e.target.value)}
                    placeholder="Uma breve descrição do produto..."
                    rows={3}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição Completa</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Descrição detalhada do produto..."
                    rows={5}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category_id">Categoria *</Label>
                    <Select
                      name="category_id"
                      value={formData.category_id}
                      onValueChange={(value) => handleInputChange('category_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ingredients">Ingredientes</Label>
                  <Textarea
                    id="ingredients"
                    name="ingredients"
                    value={formData.ingredients}
                    onChange={(e) => handleInputChange('ingredients', e.target.value)}
                    placeholder="Liste os ingredientes principais..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="allergens">Alérgenos</Label>
                    <Input
                      id="allergens"
                      name="allergens"
                      value={formData.allergens}
                      onChange={(e) => handleInputChange('allergens', e.target.value)}
                      placeholder="Ex: Glúten, Lactose, Ovos"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="preparation_time">Tempo de Preparo</Label>
                    <Input
                      id="preparation_time"
                      name="preparation_time"
                      value={formData.preparation_time}
                      onChange={(e) => handleInputChange('preparation_time', e.target.value)}
                      placeholder="Ex: 2-3 dias úteis"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Título</Label>
                  <Input
                    id="meta_title"
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => handleInputChange('meta_title', e.target.value)}
                    placeholder="Título para SEO (deixe vazio para usar o nome do produto)"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Descrição</Label>
                  <Textarea
                    id="meta_description"
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => handleInputChange('meta_description', e.target.value)}
                    placeholder="Descrição para SEO (deixe vazio para usar a descrição curta)"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Imagens do Produto</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  images={images}
                  onImagesChange={handleImagesChange}
                  maxImages={10}
                  uploading={uploadingImage}
                  multiple={true}
                  showPrimaryToggle={true}
                  showSortOrder={true}
                />
              </CardContent>
            </Card>
            
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked: boolean) => handleInputChange('is_active', checked)}
                    />
                    <Label htmlFor="is_active">Produto Ativo</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked: boolean) => handleInputChange('is_featured', checked)}
                    />
                    <Label htmlFor="is_featured">Produto em Destaque</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/produtos">Cancelar</Link>
          </Button>
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}