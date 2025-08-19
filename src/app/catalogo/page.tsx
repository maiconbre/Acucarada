'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { WhatsAppButton } from '@/components/public/WhatsAppButton';
import { useDebounce } from '@/hooks/useDebounce';
import { Highlight } from '@/components/ui/highlight';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationInfo } from '@/components/ui/pagination';

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

type SortOption = 'name' | 'price_asc' | 'price_desc' | 'newest' | 'popular';
type ViewMode = 'grid' | 'list';

export default function CatalogoPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 12;

  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (error) {
          console.error('Erro ao buscar categorias:', error);
          return;
        }

        setCategories(data || []);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      }
    }

    fetchCategories();
  }, []);

  // Fetch products with filters
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const supabase = createClient();
        let query = supabase
          .from('products')
          .select(`
            id,
            name,
            short_description,
            description,
            price,
            slug,
            is_featured,
            views_count,
            category:categories(id, name, slug),
            product_images(id, image_url, alt_text, is_primary)
          `, { count: 'exact' })
          .eq('is_active', true);

        // Apply category filter
        if (selectedCategory !== 'all') {
          query = query.eq('category.slug', selectedCategory);
        }

        // Apply search filter
        if (debouncedSearchTerm) {
          query = query.or(`name.ilike.%${debouncedSearchTerm}%,short_description.ilike.%${debouncedSearchTerm}%,description.ilike.%${debouncedSearchTerm}%`);
        }

        // Apply sorting
        switch (sortBy) {
          case 'name':
            query = query.order('name', { ascending: true });
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
        const from = (currentPage - 1) * productsPerPage;
        const to = from + productsPerPage - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
          console.error('Erro ao buscar produtos:', error);
          return;
        }

        setProducts(data || []);
        setTotalProducts(count || 0);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [debouncedSearchTerm, selectedCategory, sortBy, currentPage]);

  const generateWhatsAppURL = (product: Product) => {
    const message = `Olá! Gostaria de saber mais sobre o produto: ${product.name} - R$ ${product.price.toFixed(2)}`;
    return `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
  };

  const totalPages = Math.ceil(totalProducts / productsPerPage);

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
                  <img
                    src={primaryImage.image_url}
                    alt={primaryImage.alt_text || product.name}
                    className="w-full h-full object-cover"
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
                    <Link href={`/produto/${product.slug}`}>
                      <Highlight text={product.name} searchTerm={debouncedSearchTerm} />
                    </Link>
                  </h3>
                  <button className="text-rose-400 hover:text-rose-500 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
                
                {product.category && (
                  <Badge variant="outline" className="mb-2">
                    {product.category?.[0]?.name}
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
                      <Link href={`/produto/${product.slug}`}>
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
              <img
                src={primaryImage.image_url}
                alt={primaryImage.alt_text || product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
            {product.category && (
              <Badge className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-brown-700">
                {product.category?.[0]?.name}
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

  const LoadingSkeleton = () => {
    const skeletons = Array.from({ length: productsPerPage }, (_, i) => (
      <Card key={i} className="overflow-hidden">
        <CardContent className="p-0">
          <Skeleton className="aspect-square" />
          <div className="p-6">
            <Skeleton className="h-6 mb-2" />
            <Skeleton className="h-4 mb-4 w-3/4" />
            <Skeleton className="h-8 mb-4 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    ));

    return (
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      }`}>
        {skeletons}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50">
      <Navbar />
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-brown-800 mb-4" style={{ fontFamily: 'Dancing Script, cursive' }}>
              Catálogo Açucarada
            </h1>
            <p className="text-lg text-brown-600 max-w-2xl mx-auto">
              Descubra todos os nossos doces artesanais feitos com muito carinho
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                value={sortBy}
                onValueChange={(value: SortOption) => {
                  setSortBy(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nome (A-Z)</SelectItem>
                  <SelectItem value="price_asc">Menor preço</SelectItem>
                  <SelectItem value="price_desc">Maior preço</SelectItem>
                  <SelectItem value="newest">Mais recentes</SelectItem>
                  <SelectItem value="popular">Mais populares</SelectItem>
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
                  para "<strong>{searchTerm}</strong>"
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="ml-2">
                  na categoria "<strong>{categories.find(c => c.slug === selectedCategory)?.name}</strong>"
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Products Grid/List */}
        {loading ? (
          <LoadingSkeleton />
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
              itemsPerPage={productsPerPage}
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
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setCurrentPage(1);
              }}
            >
              Limpar filtros
            </Button>
          </div>
        )}
      </div>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}