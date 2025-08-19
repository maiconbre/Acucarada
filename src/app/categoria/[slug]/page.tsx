'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Grid, List, Search, SlidersHorizontal } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationInfo } from '@/components/ui/pagination';

interface Category {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  image_url: string | null;
  products_count?: number;
}

interface Product {
  id: string;
  name: string;
  short_description: string;
  price: number;
  slug: string;
  is_featured: boolean;
  views_count: number;
  product_images: {
    id: string;
    image_url: string;
    alt_text: string;
    is_primary: boolean;
  }[];
}

type SortOption = 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'newest' | 'popular';
type ViewMode = 'grid' | 'list';

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('busca') || '');
  const [sortBy, setSortBy] = useState<SortOption>('name_asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  const itemsPerPage = 12;

  useEffect(() => {
    if (!slug) return;

    async function fetchCategoryAndProducts() {
      try {
        const supabase = createClient();
        
        // Fetch category details
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id, name, description, slug, image_url')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (categoryError || !categoryData) {
          console.error('Categoria não encontrada:', categoryError);
          return;
        }

        setCategory(categoryData);

        // Build query for products
        let query = supabase
          .from('products')
          .select(`
            id,
            name,
            short_description,
            price,
            slug,
            is_featured,
            views_count,
            created_at,
            product_images(id, image_url, alt_text, is_primary)
          `, { count: 'exact' })
          .eq('category_id', categoryData.id)
          .eq('is_active', true);

        // Apply search filter
        if (searchTerm) {
          query = query.or(`name.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%`);
        }

        // Apply sorting
        switch (sortBy) {
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
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'popular':
            query = query.order('views_count', { ascending: false });
            break;
        }

        // Apply pagination
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;
        query = query.range(from, to);

        const { data: productsData, error: productsError, count } = await query;

        if (productsError) {
          console.error('Erro ao buscar produtos:', productsError);
          return;
        }

        setProducts(productsData || []);
        setTotalProducts(count || 0);
        setTotalPages(Math.ceil((count || 0) / itemsPerPage));

      } catch (error) {
        console.error('Erro ao buscar categoria e produtos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategoryAndProducts();
  }, [slug, searchTerm, sortBy, currentPage]);

  const generateWhatsAppURL = (product: Product) => {
    const message = `Olá! Gostaria de saber mais sobre:

🧁 *${product.name}*
💰 Preço: R$ ${product.price.toFixed(2)}

Poderia me ajudar com mais informações?`;
    return `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
    
    if (viewMode === 'list') {
      return (
        <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="flex">
              {/* Image */}
              <div className="w-48 h-32 bg-gradient-to-br from-rose-100 to-rose-200 relative overflow-hidden flex-shrink-0">
                {primaryImage ? (
                  <img
                    src={primaryImage.image_url}
                    alt={primaryImage.alt_text || product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl mb-1">🧁</div>
                      <p className="text-brown-600 font-medium text-xs">{product.name}</p>
                    </div>
                  </div>
                )}
                {product.is_featured && (
                  <Badge className="absolute top-2 left-2 bg-rose-500 text-white text-xs">
                    Destaque
                  </Badge>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <Link href={`/produto/${product.slug}`}>
                    <h3 className="font-semibold text-brown-800 mb-2 group-hover:text-rose-500 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-brown-600 text-sm mb-3 line-clamp-2">
                    {product.short_description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-rose-500">
                    R$ {product.price.toFixed(2)}
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/produto/${product.slug}`}>
                        Ver Detalhes
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <a
                        href={generateWhatsAppURL(product)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Pedir
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    // Grid view
    return (
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
        <CardContent className="p-0">
          <Link href={`/produto/${product.slug}`}>
            <div className="aspect-square bg-gradient-to-br from-rose-100 to-rose-200 relative overflow-hidden">
              {primaryImage ? (
                <img
                  src={primaryImage.image_url}
                  alt={primaryImage.alt_text || product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🧁</div>
                    <p className="text-brown-600 font-medium">{product.name}</p>
                  </div>
                </div>
              )}
              {product.is_featured && (
                <Badge className="absolute top-3 left-3 bg-rose-500 text-white">
                  Destaque
                </Badge>
              )}
            </div>
          </Link>
          
          <div className="p-4">
            <Link href={`/produto/${product.slug}`}>
              <h3 className="font-semibold text-brown-800 mb-2 group-hover:text-rose-500 transition-colors line-clamp-2">
                {product.name}
              </h3>
            </Link>
            <p className="text-brown-600 text-sm mb-3 line-clamp-2">
              {product.short_description}
            </p>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl font-bold text-rose-500">
                R$ {product.price.toFixed(2)}
              </span>
              {product.views_count > 0 && (
                <span className="text-xs text-brown-500">
                  {product.views_count} visualizações
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" asChild>
                <Link href={`/produto/${product.slug}`}>
                  Ver Detalhes
                </Link>
              </Button>
              <Button size="sm" className="flex-1" asChild>
                <a
                  href={generateWhatsAppURL(product)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Pedir
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-brown-800 mb-2">Categoria não encontrada</h2>
          <p className="text-brown-600 mb-6">A categoria que você está procurando não existe.</p>
          <Button asChild>
            <Link href="/catalogo">Voltar ao Catálogo</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50">
      {/* Breadcrumb */}
      <div className="bg-white shadow-sm border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-brown-600">
            <Link href="/" className="hover:text-rose-500 transition-colors">
              Início
            </Link>
            <span>/</span>
            <Link href="/catalogo" className="hover:text-rose-500 transition-colors">
              Catálogo
            </Link>
            <span>/</span>
            <span className="text-brown-800 font-medium">{category.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/catalogo">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Catálogo
          </Link>
        </Button>

        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-start gap-6">
            {category.image_url && (
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-rose-100 to-rose-200 flex-shrink-0">
                <img
                  src={category.image_url}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-brown-800 mb-2">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-lg text-brown-600 mb-4">
                  {category.description}
                </p>
              )}
              <p className="text-brown-500">
                {totalProducts} produto{totalProducts !== 1 ? 's' : ''} encontrado{totalProducts !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-rose-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400 w-4 h-4" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Sort */}
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-48">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name_asc">Nome (A-Z)</SelectItem>
                  <SelectItem value="name_desc">Nome (Z-A)</SelectItem>
                  <SelectItem value="price_asc">Menor Preço</SelectItem>
                  <SelectItem value="price_desc">Maior Preço</SelectItem>
                  <SelectItem value="newest">Mais Recentes</SelectItem>
                  <SelectItem value="popular">Mais Populares</SelectItem>
                </SelectContent>
              </Select>
              
              {/* View Mode */}
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {products.length > 0 ? (
          <>
            <div className={`grid gap-6 mb-8 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="space-y-4">
                <PaginationInfo
                  currentPage={currentPage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalProducts}
                />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-brown-800 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-brown-600 mb-6">
              {searchTerm 
                ? `Não encontramos produtos com "${searchTerm}" nesta categoria.`
                : 'Esta categoria ainda não possui produtos cadastrados.'
              }
            </p>
            {searchTerm && (
              <Button onClick={() => setSearchTerm('')}>
                Limpar Busca
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}