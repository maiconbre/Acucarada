'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, Grid, List, Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useDebounce } from '@/hooks/useDebounce';
import { Highlight } from '@/components/ui/highlight';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination, PaginationInfo } from '@/components/ui/pagination';
import { getProductsByCategory } from '@/lib/client/products';
import { generateWhatsAppURL } from '@/lib/utils/product-utils';

interface Product {
  id: string;
  name: string;
  short_description: string;
  description: string;
  price: number;
  slug: string;
  is_featured: boolean;
  views_count: number;
  category: {
    id: string;
    name: string;
    slug: string;
  }[] | null;
  product_images: {
    id: string;
    image_url: string;
    alt_text: string;
    is_primary: boolean;
  }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

type SortOption = 'name' | 'price' | 'created_at';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

interface CategoryClientProps {
  category: Category;
  initialProducts: Product[];
  initialTotalCount: number;
  initialTotalPages: number;
  initialCurrentPage: number;
  initialFilters: {
    search: string;
    sortBy: string;
    sortOrder: string;
  };
}

export default function CategoryClient({
  category,
  initialProducts,
  initialTotalCount,
  initialTotalPages,
  initialCurrentPage,
  initialFilters
}: CategoryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [totalProducts, setTotalProducts] = useState(initialTotalCount);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState(initialFilters.search);
  const [sortBy, setSortBy] = useState<SortOption>(initialFilters.sortBy as SortOption);
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialFilters.sortOrder as SortOrder);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Update URL when filters change - otimizada
  const updateURL = useCallback((params: Record<string, string>) => {
    const newSearchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '' && value !== '1') {
        newSearchParams.set(key, value);
      }
    });
    
    const newURL = `${window.location.pathname}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''}`;
    
    // Use replace para evitar adicionar entradas desnecessárias no histórico
    if (window.location.pathname + window.location.search !== newURL) {
      router.replace(newURL, { scroll: false });
    }
  }, [router]);
  
  // Fetch products when filters change
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    
    try {
      const result = await getProductsByCategory(
        category.slug,
        currentPage,
        12
      );
      
      setProducts(result.products);
      setTotalProducts(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  }, [category.slug, currentPage]);
  
  // Efeito combinado para buscar produtos e atualizar URL
  useEffect(() => {
    const isInitialState = (
      currentPage === initialCurrentPage &&
      debouncedSearchTerm === initialFilters.search &&
      sortBy === initialFilters.sortBy &&
      sortOrder === initialFilters.sortOrder
    );

    // Atualiza URL sempre
    updateURL({
      search: debouncedSearchTerm,
      sortBy: sortBy,
      sortOrder: sortOrder,
      page: currentPage.toString()
    });

    // Só busca produtos se não for o estado inicial
    if (!isInitialState) {
      fetchProducts();
    }
  }, [currentPage, debouncedSearchTerm, sortBy, sortOrder, fetchProducts, updateURL, initialCurrentPage, initialFilters]);
  
  // Product Card Component
  const ProductCard = ({ product }: { product: Product }) => {
    const primaryImage = product.product_images.find(img => img.is_primary) || product.product_images[0];
    const whatsappUrl = generateWhatsAppURL(product);
    
    if (viewMode === 'list') {
      return (
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row">
              {/* Product Image */}
              <div className="relative w-full sm:w-48 h-48 bg-gradient-to-br from-rose-100 to-rose-200 overflow-hidden">
                {primaryImage ? (
                  <Image
                    src={primaryImage.image_url}
                    alt={primaryImage.alt_text || product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-rose-300" />
                  </div>
                )}
                
                {product.is_featured && (
                  <Badge className="absolute top-3 left-3 bg-rose-500 text-white">
                    Destaque
                  </Badge>
                )}
              </div>
              
              {/* Product Info */}
              <div className="flex-1 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-brown-800 mb-2 group-hover:text-rose-500 transition-colors">
                      <Link href={`/produto/${product.slug}`}>
                        <Highlight text={product.name} searchTerm={debouncedSearchTerm} />
                      </Link>
                    </h3>
                    <p className="text-brown-600 mb-4 line-clamp-2">
                      <Highlight text={product.short_description} searchTerm={debouncedSearchTerm} />
                    </p>
                  </div>
                  
                  <button className="ml-4 w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center hover:bg-rose-100 transition-colors group/heart">
                    <Heart className="w-5 h-5 text-rose-400 group-hover/heart:text-rose-500 group-hover/heart:fill-rose-500 transition-all" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-rose-500">
                    R$ {product.price.toFixed(2)}
                  </div>
                  
                  <Button asChild className="bg-green-600 hover:bg-green-700">
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Pedir no WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
        <CardContent className="p-0">
          {/* Product Image */}
          <div className="relative aspect-square bg-gradient-to-br from-rose-100 to-rose-200 overflow-hidden">
            {primaryImage ? (
              <Image
                src={primaryImage.image_url}
                alt={primaryImage.alt_text || product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-rose-300" />
              </div>
            )}
            
            {/* Featured Badge */}
            {product.is_featured && (
              <Badge className="absolute top-4 right-4 bg-rose-500 text-white">
                Destaque
              </Badge>
            )}
            
            {/* Favorite Button */}
            <button className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors group/heart">
              <Heart className="w-5 h-5 text-rose-400 group-hover/heart:text-rose-500 group-hover/heart:fill-rose-500 transition-all" />
            </button>
          </div>
          
          {/* Product Info */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-brown-800 mb-2 group-hover:text-rose-500 transition-colors">
              <Link href={`/produto/${product.slug}`}>
                <Highlight text={product.name} searchTerm={debouncedSearchTerm} />
              </Link>
            </h3>
            
            <p className="text-brown-600 mb-4 line-clamp-2">
              <Highlight text={product.short_description} searchTerm={debouncedSearchTerm} />
            </p>
            
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-rose-500">
                R$ {product.price.toFixed(2)}
              </div>
              
              <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <ShoppingBag className="w-4 h-4 mr-1" />
                  Pedir
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-rose-50">
      <div className="container mx-auto px-4 py-8">
        {/* Category Header */}
        <div className="text-center mb-12">
          <div className="relative mb-6">
            {category.image_url ? (
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-rose-100 to-rose-200">
                <Image
                  src={category.image_url}
                  alt={category.name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center">
                <ShoppingBag className="w-16 h-16 text-rose-400" />
              </div>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-brown-800 mb-4">
            {category.name}
          </h1>
          
          {category.description && (
            <p className="text-lg text-brown-600 max-w-2xl mx-auto">
              {category.description}
            </p>
          )}
        </div>
        
        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Sort */}
              <Select
                value={`${sortBy}_${sortOrder}`}
                onValueChange={(value) => {
                  const [newSortBy, newSortOrder] = value.split('_') as [SortOption, SortOrder];
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name_asc">Nome (A-Z)</SelectItem>
                  <SelectItem value="name_desc">Nome (Z-A)</SelectItem>
                  <SelectItem value="price_asc">Menor preço</SelectItem>
                  <SelectItem value="price_desc">Maior preço</SelectItem>
                  <SelectItem value="created_at_desc">Mais recentes</SelectItem>
                </SelectContent>
              </Select>
              
              {/* View Mode */}
              <div className="flex border rounded-lg overflow-hidden">
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
        
        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-brown-600">
            {loading ? 'Carregando...' : (
              `${totalProducts} produto${totalProducts !== 1 ? 's' : ''} encontrado${totalProducts !== 1 ? 's' : ''}`
            )}
            {searchTerm && (
              <span className="ml-2">
                para "<strong>{searchTerm}</strong>"
              </span>
            )}
          </p>
        </div>
        
        {/* Products Grid/List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
            <p className="text-brown-600">Carregando produtos...</p>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className={`grid gap-6 mb-8 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <>
                <PaginationInfo
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalProducts}
                  itemsPerPage={12}
                  className="text-center mb-4"
                />
                
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  className="justify-center"
                />
              </>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 text-brown-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-brown-600 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-brown-500">
              {searchTerm 
                ? `Não encontramos produtos para "${searchTerm}" nesta categoria.`
                : 'Esta categoria ainda não possui produtos cadastrados.'
              }
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="mt-4"
              >
                Limpar busca
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}