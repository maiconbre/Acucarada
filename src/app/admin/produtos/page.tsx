'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Star, 
  Package,
  Grid,
  List,
  MoreHorizontal,
  ExternalLink
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';

interface Product {
  id: string;
  name: string;
  short_description: string;
  price: number;
  slug: string;
  is_active: boolean;
  is_featured: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  category: {
    categories: {
      id: string;
      name: string;
      slug: string;
    }[];
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

type SortOption = 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'created_desc' | 'views_desc';
type ViewMode = 'grid' | 'list';
type StatusFilter = 'all' | 'active' | 'inactive' | 'featured';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('created_desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const itemsPerPage = 12;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [searchTerm, selectedCategory, statusFilter, sortBy, currentPage]);

  async function fetchCategories() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Erro ao buscar categorias:', error);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  }

  async function fetchProducts() {
    try {
      const supabase = createClient();
      
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          short_description,
          price,
          slug,
          is_active,
          is_featured,
          views_count,
          created_at,
          updated_at,
          category:product_categories!left(
            categories!inner(
              id,
              name,
              slug
            )
          ),
          product_images!left(
            id,
            image_url,
            alt_text,
            is_primary
          )
        `, { count: 'exact' });

      // Apply search filter
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%`);
      }

      // Apply category filter
      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      // Apply status filter
      switch (statusFilter) {
        case 'active':
          query = query.eq('is_active', true);
          break;
        case 'inactive':
          query = query.eq('is_active', false);
          break;
        case 'featured':
          query = query.eq('is_featured', true);
          break;
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
        case 'created_desc':
          query = query.order('created_at', { ascending: false });
          break;
        case 'views_desc':
          query = query.order('views_count', { ascending: false });
          break;
      }

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Erro ao buscar produtos:', error);
        setProducts([]);
        setTotalProducts(0);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os produtos.",
          variant: "destructive",
        });
        return;
      }

      // Validar se os dados são válidos
      if (!data || !Array.isArray(data)) {
        console.error('Dados inválidos recebidos da API:', data);
        setProducts([]);
        setTotalProducts(0);
        return;
      }

      setProducts(data);
      setTotalProducts(count || 0);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));

    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      setProducts([]);
      setTotalProducts(0);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteProduct(productId: string) {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('Erro ao deletar produto:', error);
        toast({
          title: "Erro",
          description: "Não foi possível deletar o produto.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Produto deletado com sucesso.",
      });

      // Refresh products list
      fetchProducts();
      setDeleteProductId(null);

    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar o produto.",
        variant: "destructive",
      });
    }
  }

  async function toggleProductStatus(productId: string, currentStatus: boolean) {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);

      if (error) {
        console.error('Erro ao alterar status do produto:', error);
        toast({
          title: "Erro",
          description: "Não foi possível alterar o status do produto.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: `Produto ${!currentStatus ? 'ativado' : 'desativado'} com sucesso.`,
      });

      // Refresh products list
      fetchProducts();

    } catch (error) {
      console.error('Erro ao alterar status do produto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do produto.",
        variant: "destructive",
      });
    }
  }

  async function toggleProductFeatured(productId: string, currentFeatured: boolean) {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('products')
        .update({ is_featured: !currentFeatured })
        .eq('id', productId);

      if (error) {
        console.error('Erro ao alterar destaque do produto:', error);
        toast({
          title: "Erro",
          description: "Não foi possível alterar o destaque do produto.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: `Produto ${!currentFeatured ? 'destacado' : 'removido dos destaques'} com sucesso.`,
      });

      // Refresh products list
      fetchProducts();

    } catch (error) {
      console.error('Erro ao alterar destaque do produto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o destaque do produto.",
        variant: "destructive",
      });
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
    
    if (viewMode === 'list') {
      return (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex">
              {/* Image */}
              <div className="w-24 h-24 bg-gradient-to-br from-rose-100 to-rose-200 relative overflow-hidden flex-shrink-0">
                {primaryImage ? (
                  <Image
                    src={primaryImage.image_url}
                    alt={primaryImage.alt_text || product.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-brown-400" />
                  </div>
                )}
                {product.is_featured && (
                  <Badge className="absolute top-1 left-1 bg-rose-500 text-white text-xs px-1 py-0">
                    <Star className="w-3 h-3" />
                  </Badge>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-brown-800">
                      {product.name}
                    </h3>
                    <Badge variant={product.is_active ? 'default' : 'secondary'}>
                      {product.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <p className="text-brown-600 text-sm mb-2 line-clamp-1">
                    {product.short_description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-brown-500">
                    <span>Categoria: {product.category?.[0]?.categories?.[0]?.name || 'Sem categoria'}</span>
                    <span>Criado: {formatDate(product.created_at)}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {product.views_count}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-lg font-bold text-rose-500">
                      R$ {product.price.toFixed(2)}
                    </span>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/produto/${product.slug}`} target="_blank">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Ver no Site
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/produtos/${product.id}`}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleProductStatus(product.id, product.is_active)}>
                        {product.is_active ? 'Desativar' : 'Ativar'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleProductFeatured(product.id, product.is_featured)}>
                        <Star className="w-4 h-4 mr-2" />
                        {product.is_featured ? 'Remover Destaque' : 'Destacar'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setDeleteProductId(product.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Deletar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    // Grid view
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardContent className="p-0">
          <div className="aspect-square bg-gradient-to-br from-rose-100 to-rose-200 relative overflow-hidden">
            {primaryImage ? (
              <Image
                src={primaryImage.image_url}
                alt={primaryImage.alt_text || product.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-16 h-16 text-brown-400" />
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.is_featured && (
                <Badge className="bg-rose-500 text-white text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Destaque
                </Badge>
              )}
              <Badge variant={product.is_active ? 'default' : 'secondary'} className="text-xs">
                {product.is_active ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            
            {/* Actions */}
            <div className="absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="w-8 h-8 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/produto/${product.slug}`} target="_blank">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver no Site
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/produtos/${product.id}`}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/produtos/${product.id}`}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => toggleProductStatus(product.id, product.is_active)}>
                    {product.is_active ? 'Desativar' : 'Ativar'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleProductFeatured(product.id, product.is_featured)}>
                    <Star className="w-4 h-4 mr-2" />
                    {product.is_featured ? 'Remover Destaque' : 'Destacar'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setDeleteProductId(product.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Deletar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="font-semibold text-brown-800 mb-1 line-clamp-1">
              {product.name}
            </h3>
            <p className="text-brown-600 text-sm mb-2 line-clamp-2">
              {product.short_description}
            </p>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold text-rose-500">
                R$ {product.price.toFixed(2)}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs text-brown-500">
              <span>{product.category?.[0]?.categories?.[0]?.name || 'Sem categoria'}</span>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {product.views_count}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brown-800">Produtos</h1>
          <p className="text-brown-600">
            {totalProducts} produto{totalProducts !== 1 ? 's' : ''} encontrado{totalProducts !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/produtos/novo" prefetch={true}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
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
            
            <div className="flex items-center gap-4 flex-wrap">
              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                  <SelectItem value="featured">Destacados</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Sort */}
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_desc">Mais Recentes</SelectItem>
                  <SelectItem value="name_asc">Nome (A-Z)</SelectItem>
                  <SelectItem value="name_desc">Nome (Z-A)</SelectItem>
                  <SelectItem value="price_asc">Menor Preço</SelectItem>
                  <SelectItem value="price_desc">Maior Preço</SelectItem>
                  <SelectItem value="views_desc">Mais Populares</SelectItem>
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
        </CardContent>
      </Card>

      {/* Products Grid/List */}
      {products.length > 0 ? (
        <>
          <div className={`grid gap-6 ${
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
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return <span key={page} className="px-2">...</span>;
                  }
                  return null;
                })}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-brown-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-brown-800 mb-2">
            Nenhum produto encontrado
          </h3>
          <p className="text-brown-600 mb-6">
            {searchTerm || selectedCategory !== 'all' || statusFilter !== 'all'
              ? 'Tente ajustar os filtros de busca.'
              : 'Comece criando seu primeiro produto.'
            }
          </p>
          <Button asChild>
            <Link href="/admin/produtos/novo">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Produto
            </Link>
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este produto? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProductId && handleDeleteProduct(deleteProductId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}