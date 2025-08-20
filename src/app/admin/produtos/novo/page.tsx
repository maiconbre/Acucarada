'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createProductWithRedirect } from '@/lib/actions/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useFormStatus } from 'react-dom';
import { ImageUpload, type ImagePreview } from '@/components/ui/image-upload';

interface Category {
  id: string;
  name: string;
  slug: string;
}

// Interface removida - usando ImagePreview do componente ImageUpload

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Criando...' : 'Criar Produto'}
    </Button>
  );
}

export default function NovoProductPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<ImagePreview[]>([]);

  
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
    seo_title: '',
    seo_description: '',
  });

  const supabase = createClient();

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias.",
        variant: "destructive",
      });
    }
  }, [supabase, toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from name
    if (field === 'name' && value) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }

    // Auto-generate meta_title from name
    if (field === 'name' && value) {
      setFormData(prev => ({
        ...prev,
        meta_title: `${value} | Açucarada`
      }));
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
    // Validação client-side básica
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const category_id = formData.get('category_id') as string;
    
    if (!name || !price || !category_id) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (images.length === 0) {
      toast({
        title: "Erro",
        description: "Por favor, adicione pelo menos uma imagem do produto.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Obter URLs das imagens (já foram enviadas pelo ImageUpload)
      const imageUrls = getImageUrls(images);
      
      // Adicionar image_urls ao FormData
      formData.set('image_urls', JSON.stringify(imageUrls));

      const result = await createProductWithRedirect(formData);
      
      if (!result.success) {
        toast({
          title: "Erro",
          description: result.error?.message || "Não foi possível criar o produto.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o produto.",
        variant: "destructive",
      });
    }
  };

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
          <h1 className="text-3xl font-bold text-brown-800">Novo Produto</h1>
          <p className="text-brown-600">Adicione um novo produto ao catálogo</p>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-6">
        {/* Hidden fields for boolean values and image URLs */}
        <input type="hidden" name="is_active" value={formData.is_active.toString()} />
        <input type="hidden" name="is_featured" value={formData.is_featured.toString()} />
        
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
                    <Label htmlFor="slug">Slug (URL)</Label>
                    <Input
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="bolo-de-chocolate"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short_description">Descrição Curta</Label>
                  <Input
                    id="short_description"
                    name="short_description"
                    value={formData.short_description}
                    onChange={(e) => handleInputChange('short_description', e.target.value)}
                    placeholder="Descrição breve que aparece nos cards"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição Completa</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Descrição detalhada do produto"
                    rows={4}
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

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhes Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ingredients">Ingredientes</Label>
                  <Textarea
                    id="ingredients"
                    name="ingredients"
                    value={formData.ingredients}
                    onChange={(e) => handleInputChange('ingredients', e.target.value)}
                    placeholder="Liste os principais ingredientes"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergens">Alérgenos</Label>
                  <Input
                    id="allergens"
                    name="allergens"
                    value={formData.allergens}
                    onChange={(e) => handleInputChange('allergens', e.target.value)}
                    placeholder="Ex: Contém glúten, leite, ovos"
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
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seo_title">Título SEO</Label>
                  <Input
                    id="seo_title"
                    name="seo_title"
                    value={formData.seo_title}
                    onChange={(e) => handleInputChange('seo_title', e.target.value)}
                    placeholder="Título para mecanismos de busca"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo_description">Descrição SEO</Label>
                  <Textarea
                    id="seo_description"
                    name="seo_description"
                    value={formData.seo_description}
                    onChange={(e) => handleInputChange('seo_description', e.target.value)}
                    placeholder="Descrição para mecanismos de busca"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Produto Ativo</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_featured">Produto em Destaque</Label>
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                  />
                </div>
              </CardContent>
            </Card>

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
                  uploading={false}
                  multiple={true}
                  showPrimaryToggle={true}
                  showSortOrder={false}
                />
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