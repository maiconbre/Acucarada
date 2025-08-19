'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ShoppingBag, 
  Package, 
  Eye, 
  TrendingUp, 
  Users, 
  Star,
  Calendar,
  DollarSign,
  BarChart3,
  PieChart
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  total_products: number;
  active_products: number;
  total_categories: number;
  active_categories: number;
  total_views: number;
  featured_products: number;
  recent_products: number;
  avg_price: number;
}

interface PopularProduct {
  id: string;
  name: string;
  views_count: number;
  price: number;
  slug: string;
  category_name: string;
}

interface RecentProduct {
  id: string;
  name: string;
  price: number;
  slug: string;
  created_at: string;
  category_name: string;
}

interface CategoryStats {
  category_name: string;
  products_count: number;
  avg_price: number;
  total_views: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [popularProducts, setPopularProducts] = useState<PopularProduct[]>([]);
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const supabase = createClient();

        // Fetch dashboard stats using the view
        const { data: statsData, error: statsError } = await supabase
          .from('dashboard_stats')
          .select('*')
          .single();

        if (statsError) {
          console.error('Erro ao buscar estatísticas:', statsError);
        } else {
          setStats(statsData);
        }

        // Fetch popular products
        const { data: popularData, error: popularError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            views_count,
            price,
            slug,
            category:categories(name)
          `)
          .eq('is_active', true)
          .order('views_count', { ascending: false })
          .limit(5);

        if (popularError) {
          console.error('Erro ao buscar produtos populares:', popularError);
        } else {
          const formattedPopular = popularData?.map(product => ({
            ...product,
            category_name: product.category?.[0]?.name || 'Sem categoria'
          })) || [];
          setPopularProducts(formattedPopular);
        }

        // Fetch recent products
        const { data: recentData, error: recentError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            price,
            slug,
            created_at,
            category:categories(name)
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentError) {
          console.error('Erro ao buscar produtos recentes:', recentError);
        } else {
          const formattedRecent = recentData?.map(product => ({
            ...product,
            category_name: product.category?.[0]?.name || 'Sem categoria'
          })) || [];
          setRecentProducts(formattedRecent);
        }

        // Fetch category statistics
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select(`
            name,
            products!inner(price, views_count)
          `)
          .eq('is_active', true)
          .eq('products.is_active', true);

        if (categoryError) {
          console.error('Erro ao buscar estatísticas de categorias:', categoryError);
        } else {
          const categoryStatsData = categoryData?.map(category => {
            const products = category.products || [];
            const productsCount = products.length;
            const avgPrice = productsCount > 0 
              ? products.reduce((sum, p) => sum + p.price, 0) / productsCount 
              : 0;
            const totalViews = products.reduce((sum, p) => sum + (p.views_count || 0), 0);

            return {
              category_name: category.name,
              products_count: productsCount,
              avg_price: avgPrice,
              total_views: totalViews
            };
          }).filter(stat => stat.products_count > 0) || [];

          setCategoryStats(categoryStatsData);
        }

      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-brown-800">Dashboard</h1>
          <p className="text-brown-600">Visão geral do seu catálogo</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
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
          <h1 className="text-3xl font-bold text-brown-800">Dashboard</h1>
          <p className="text-brown-600">Visão geral do seu catálogo</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/produtos/novo">
              <Package className="w-4 h-4 mr-2" />
              Novo Produto
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-brown-600">
              Total de Produtos
            </CardTitle>
            <Package className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brown-800">
              {stats?.total_products || 0}
            </div>
            <p className="text-xs text-brown-500">
              {stats?.active_products || 0} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-brown-600">
              Categorias
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brown-800">
              {stats?.total_categories || 0}
            </div>
            <p className="text-xs text-brown-500">
              {stats?.active_categories || 0} ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-brown-600">
              Total de Visualizações
            </CardTitle>
            <Eye className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brown-800">
              {stats?.total_views?.toLocaleString('pt-BR') || 0}
            </div>
            <p className="text-xs text-brown-500">
              Todos os produtos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-brown-600">
              Preço Médio
            </CardTitle>
            <DollarSign className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brown-800">
              R$ {stats?.avg_price?.toFixed(2) || '0,00'}
            </div>
            <p className="text-xs text-brown-500">
              Produtos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-brown-600">
              Produtos em Destaque
            </CardTitle>
            <Star className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brown-800">
              {stats?.featured_products || 0}
            </div>
            <p className="text-xs text-brown-500">
              Destacados no site
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-brown-600">
              Produtos Recentes
            </CardTitle>
            <Calendar className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brown-800">
              {stats?.recent_products || 0}
            </div>
            <p className="text-xs text-brown-500">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-brown-600">
              Ações Rápidas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button size="sm" variant="outline" className="w-full" asChild>
                <Link href="/admin/produtos">
                  <Package className="w-3 h-3 mr-1" />
                  Produtos
                </Link>
              </Button>
              <Button size="sm" variant="outline" className="w-full" asChild>
                <Link href="/admin/categorias">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Categorias
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-brown-600">
              Site Público
            </CardTitle>
            <Eye className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button size="sm" variant="outline" className="w-full" asChild>
                <Link href="/" target="_blank">
                  Ver Site
                </Link>
              </Button>
              <Button size="sm" variant="outline" className="w-full" asChild>
                <Link href="/catalogo" target="_blank">
                  Ver Catálogo
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-rose-500" />
              Produtos Mais Populares
            </CardTitle>
          </CardHeader>
          <CardContent>
            {popularProducts.length > 0 ? (
              <div className="space-y-3">
                {popularProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-rose-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <Link 
                          href={`/admin/produtos/${product.id}`}
                          className="font-medium text-brown-800 hover:text-rose-500 transition-colors"
                        >
                          {product.name}
                        </Link>
                        <p className="text-sm text-brown-600">{product.category_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-brown-600">
                        <Eye className="w-4 h-4" />
                        <span className="font-medium">{product.views_count}</span>
                      </div>
                      <p className="text-sm text-rose-500 font-medium">
                        R$ {product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-brown-600 text-center py-4">
                Nenhum produto com visualizações ainda.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-500" />
              Produtos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentProducts.length > 0 ? (
              <div className="space-y-3">
                {recentProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <Link 
                        href={`/admin/produtos/${product.id}`}
                        className="font-medium text-brown-800 hover:text-rose-500 transition-colors"
                      >
                        {product.name}
                      </Link>
                      <p className="text-sm text-brown-600">{product.category_name}</p>
                      <p className="text-xs text-brown-500">
                        {formatDate(product.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-rose-500 font-medium">
                        R$ {product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-brown-600 text-center py-4">
                Nenhum produto cadastrado ainda.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Statistics */}
      {categoryStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-rose-500" />
              Estatísticas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryStats.map((category) => (
                <div key={category.category_name} className="p-4 bg-gradient-to-br from-rose-50 to-orange-50 rounded-lg">
                  <h4 className="font-semibold text-brown-800 mb-2">
                    {category.category_name}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-brown-600">Produtos:</span>
                      <span className="font-medium">{category.products_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brown-600">Preço médio:</span>
                      <span className="font-medium">R$ {category.avg_price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brown-600">Visualizações:</span>
                      <span className="font-medium">{category.total_views}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}