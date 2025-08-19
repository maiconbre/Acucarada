import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Image from 'next/image';
import { getCategoryBySlug } from '@/lib/actions/categories';
import { getProductsByCategory } from '@/lib/actions/products';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorButton } from '@/components/client/ErrorButton';
import CategoryClient from '@/components/client/CategoryClient';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    search?: string;
    sort?: string;
    page?: string;
  }>;
}

// Configuração de cache
export const revalidate = 1800; // 30 minutos

// Geração de metadata dinâmica
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);
    
    if (!category) {
      return {
        title: 'Categoria não encontrada - Açucarada',
        description: 'A categoria que você está procurando não foi encontrada.',
      };
    }

    return {
      title: `${category.name} - Açucarada`,
      description: category.description || `Explore nossa seleção de ${category.name.toLowerCase()} artesanais.`,
      openGraph: {
        title: `${category.name} - Açucarada`,
        description: category.description || `Explore nossa seleção de ${category.name.toLowerCase()} artesanais.`,
        images: category.image_url ? [category.image_url] : [],
      },
    };
  } catch (error) {
    console.error('Erro ao gerar metadata:', error);
    return {
      title: 'Categoria - Açucarada',
      description: 'Doces artesanais feitos com amor.',
    };
  }
}

// Componente para buscar dados da categoria
async function CategoryData({ slug }: { slug: string }) {
  try {
    const category = await getCategoryBySlug(slug);
    
    if (!category) {
      notFound();
    }

    return category;
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    notFound();
  }
}

// Componente para buscar produtos da categoria
async function CategoryProductsData({ 
  categoryId, 
  searchParams 
}: { 
  categoryId: string;
  searchParams: {
    search?: string;
    sort?: string;
    page?: string;
  };
}) {
  try {
    const page = parseInt(searchParams.page || '1');
    const limit = 12;
    const offset = (page - 1) * limit;
    
    const products = await getProductsByCategory({
      categoryId,
      search: searchParams.search,
      sortBy: searchParams.sort as any,
      limit,
      offset
    });
    
    return products;
  } catch (error) {
    console.error('Erro ao buscar produtos da categoria:', error);
    return { products: [], total: 0 };
  }
}

// Skeleton para produtos da categoria
function CategoryProductsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filtros skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      
      {/* Grid de produtos skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
      
      {/* Paginação skeleton */}
      <div className="flex justify-center">
        <Skeleton className="h-10 w-64" />
      </div>
    </div>
  );
}

// Componente principal com streaming
async function CategoryWithStreaming({ 
  slug, 
  searchParams 
}: { 
  slug: string;
  searchParams: {
    search?: string;
    sort?: string;
    page?: string;
  };
}) {
  const category = await CategoryData({ slug });
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header da categoria - carrega primeiro */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <ErrorButton 
            onRetry={() => window.history.back()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </ErrorButton>
          <h1 className="text-3xl font-bold text-brown-800">{category.name}</h1>
        </div>
        
        {category.description && (
          <p className="text-gray-600 text-lg">{category.description}</p>
        )}
        
        {category.image_url && (
          <div className="mt-6 rounded-lg overflow-hidden relative h-48">
            <Image
              src={category.image_url}
              alt={category.name}
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>
      
      {/* Produtos - carrega de forma independente */}
      <Suspense fallback={<CategoryProductsSkeleton />}>
        <CategoryProductsSection 
          categoryId={category.id} 
          searchParams={searchParams}
        />
      </Suspense>
    </div>
  );
}

// Seção de produtos com streaming
async function CategoryProductsSection({ 
  categoryId, 
  searchParams 
}: { 
  categoryId: string;
  searchParams: {
    search?: string;
    sort?: string;
    page?: string;
  };
}) {
  const { products, total } = await CategoryProductsData({ categoryId, searchParams });
  
  return (
    <CategoryClient 
      initialProducts={products}
      totalProducts={total}
      categoryId={categoryId}
      initialSearchParams={searchParams}
    />
  );
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <CategoryProductsSkeleton />
        </div>
      </div>
    }>
      <CategoryWithStreaming slug={slug} searchParams={resolvedSearchParams} />
    </Suspense>
  );
}

// Geração estática de rotas
export async function generateStaticParams() {
  // Retornar array vazio para permitir geração sob demanda
  return [];
}