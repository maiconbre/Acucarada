'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
import { getProducts } from '@/lib/client/products';
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
}

type SortOption = 'name' | 'price' | 'created_at';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

interface CatalogClientProps {
  initialProducts: Product[];
  initialTotalCount: number;
  initialTotalPages: number;
  initialCurrentPage: number;
  categories: Category[];
  initialFilters: {
    search: string;
    category: string;
    sortBy: string;
    sortOrder: string;
  };
}

export function CatalogClient({
  initialProducts,
  initialTotalCount,
  initialTotalPages,
  initialCurrentPage,
  categories,
  initialFilters
}: CatalogClientProps) {
  const router = useRouter();
  
  // Estados locais
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialFilters.search);
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || 'all');
  const [sortBy, setSortBy] = useState<SortOption>(initialFilters.sortBy as SortOption || 'created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialFilters.sortOrder as SortOrder || 'desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const [totalProducts, setTotalProducts] = useState(initialTotalCount);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Função para atualizar URL otimizada
  const updateURL = useCallback((params: Record<string, string>) => {
    const newSearchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '' && value !== '1') {
        newSearchParams.set(key, value);
      }
    });

    const newURL = `/catalogo${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''}`;
    
    // Use replace para evitar adicionar entradas desnecessárias no histórico
    if (window.location.pathname + window.location.search !== newURL) {
      router.replace(newURL, { scroll: false });
    }
  }, [router]);

  // Função para buscar produtos
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getProducts({
        search: debouncedSearchTerm,
        category: selectedCategory === 'all' ? '' : selectedCategory,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: 12
      });

      setProducts(result.products);
      setTotalProducts(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Erro ao buscar produtos:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        fullError: error
      });
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, selectedCategory, sortBy, sortOrder, currentPage]);

  // Efeito combinado para buscar produtos e atualizar URL
  useEffect(() => {
    const isInitialState = (
      debouncedSearchTerm === initialFilters.search &&
      selectedCategory === (initialFilters.category || 'all') &&
      sortBy === (initialFilters.sortBy || 'created_at') &&
      sortOrder === (initialFilters.sortOrder || 'desc') &&
      currentPage === initialCurrentPage
    );

    // Atualiza URL sempre
    updateURL({
      search: debouncedSearchTerm,
      category: selectedCategory,
      sortBy,
      sortOrder,
      page: currentPage.toString()
    });

    // Só busca produtos se não for o estado inicial
    if (!isInitialState) {
      fetchProducts();
    }
  }, [debouncedSearchTerm, selectedCategory, sortBy, sortOrder, currentPage, fetchProducts, updateURL, initialFilters, initialCurrentPage]);



  // Função para resetar filtros
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('created_at');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  // Componente ProductCard
  const ProductCard = ({ product }: { product: Product }) => {
    const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];

    if (viewMode === 'list') {
      return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row">
              {/* Product Image */}
              <div className="w-full sm:w-48 h-48 bg-gradient-to-br from-rose-100 to-rose-200 relative overflow-hidden">
                {primaryImage ? (
                  <Image
                    src={primaryImage.image_url}
                    alt={primaryImage.alt_text || product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 192px"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🧁</div>
                      <p className="text-brown-600 font-medium text-sm">{product.name}</p>
                    </div>
                  </div>
                )}
                
                {product.is_featured && (
                  <Badge className="absolute top-2 left-2 bg-rose-500 text-white">
                    Destaque
                  </Badge>
                )}
              </div>
              
              {/* Product Info */}
              <div className="flex-1 p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-brown-800 hover:text-rose-500 transition-colors">
                    <Link href={`/produto/${product.slug}`} prefetch={false}>
                      <Highlight text={product.name} searchTerm={debouncedSearchTerm} />
                    </Link>
                  </h3>
                  <button className="text-rose-400 hover:text-rose-500 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
                
                {product.category && product.category[0] && (
                  <Badge variant="outline" className="mb-2">
                    {product.category[0].name}
                  </Badge>
                )}
                
                <p className="text-brown-600 mb-4 line-clamp-2">
                  <Highlight text={product.short_description} searchTerm={debouncedSearchTerm} />
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-rose-500">
                    R$ {product.price.toFixed(2)}
                  </span>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" asChild>
                      <Link href={`/produto/${product.slug}`} prefetch={false}>
                        Ver Detalhes
                      </Link>
                    </Button>
                    
                    <Button asChild>
                      <a
                        href={generateWhatsAppURL(product)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        <ShoppingBag className="w-4 h-4" />
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

    return (
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border border-rose-100">
        <CardContent className="p-0">
          {/* Product Image */}
          <div className="aspect-square bg-gradient-to-br from-rose-100 to-rose-200 relative overflow-hidden">
            {primaryImage ? (
              <Image
                src={primaryImage.image_url}
                alt={primaryImage.alt_text || product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-2">🧁</div>
                  <p className="text-brown-600 font-medium">{product.name}</p>
                </div>
              </div>
            )}
            
            {/* Category Badge */}
            {product.category && product.category[0] && (
              <Badge className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-brown-700">
                {product.category[0].name}
              </Badge>
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
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-rose-500">
                R$ {product.price.toFixed(2)}
              </span>
              
              {product.views_count > 0 && (
                <span className="text-sm text-brown-500">
                  {product.views_count} visualizações
                </span>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" asChild>
                <Link href={`/produto/${product.slug}`}>
                  Ver Detalhes
                </Link>
              </Button>
              
              <Button className="flex-1" asChild>
                <a
                  href={generateWhatsAppURL(product)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1"
                >
                  <ShoppingBag className="w-4 h-4" />
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
    <>
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
            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                setSelectedCategory(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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

        {/* Results Info */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-brown-600">
            {loading ? (
              'Carregando produtos...'
            ) : (
              `${totalProducts} produto${totalProducts !== 1 ? 's' : ''} encontrado${totalProducts !== 1 ? 's' : ''}`
            )}
            {searchTerm && (
              <span className="ml-2">
                para &quot;<strong>{searchTerm}</strong>&quot;
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="ml-2">
                na categoria &quot;<strong>{categories.find(c => c.slug === selectedCategory)?.name}</strong>&quot;
              </span>
            )}
          </p>
        </div>
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

          {/* Pagination Info */}
          <PaginationInfo
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalProducts}
            itemsPerPage={12}
            className="text-center mb-4"
          />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showFirstLast={totalPages > 10}
          />
        </>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-brown-800 mb-2">
            Nenhum produto encontrado
          </h3>
          <p className="text-brown-600 mb-6">
            Tente ajustar os filtros ou buscar por outros termos
          </p>
          <Button onClick={resetFilters}>
            Limpar filtros
          </Button>
        </div>
      )}
    </>
  );
}