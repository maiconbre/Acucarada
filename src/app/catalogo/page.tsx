import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { getProducts } from '@/lib/actions/products';
import { getCategories } from '@/lib/actions/categories';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { WhatsAppButton } from '@/components/public/WhatsAppButton';
import { CatalogClient } from '@/components/client/CatalogClient';
import { CatalogSkeleton } from '@/components/ui/CatalogSkeleton';
import { ErrorButton } from '@/components/client/ErrorButton';


// Configuração de cache para a página
export const revalidate = 3600; // 1 hora

// Metadata da página
export const metadata: Metadata = {
  title: 'Catálogo - Açucarada',
  description: 'Explore nossa seleção completa de doces artesanais. Bolos, tortas, brigadeiros e muito mais, feitos com carinho pela Açucarada.',
  openGraph: {
    title: 'Catálogo - Açucarada',
    description: 'Explore nossa seleção completa de doces artesanais. Bolos, tortas, brigadeiros e muito mais, feitos com carinho pela Açucarada.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Catálogo - Açucarada',
    description: 'Explore nossa seleção completa de doces artesanais. Bolos, tortas, brigadeiros e muito mais, feitos com carinho pela Açucarada.',
  },
};

interface CatalogoPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: string;
  }>;
}

export default async function CatalogoPage({ searchParams }: CatalogoPageProps) {
  // Extrair parâmetros de busca
  const params = await searchParams;
  const {
    search = '',
    category = '',
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = '1'
  } = params;

  // Converter página para número
  const currentPage = parseInt(page, 10) || 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header da página */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-brown-800 mb-4">
            Nosso <span className="text-rose-500">Catálogo</span>
          </h1>
          <p className="text-lg text-brown-600 max-w-2xl mx-auto">
            Explore nossa seleção completa de doces artesanais, feitos com carinho e ingredientes selecionados.
          </p>
        </div>

        {/* Streaming de dados com Suspense granular */}
        <Suspense fallback={<CatalogSkeleton />}>
          <CatalogWithStreaming 
            initialSearch={search}
            initialCategory={category}
            initialSortBy={sortBy}
            initialSortOrder={sortOrder}
            initialPage={currentPage}
          />
        </Suspense>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

// Componente com streaming otimizado
interface CatalogStreamingProps {
  initialSearch: string;
  initialCategory: string;
  initialSortBy: string;
  initialSortOrder: string;
  initialPage: number;
}

async function CatalogWithStreaming({
  initialSearch,
  initialCategory,
  initialSortBy,
  initialSortOrder,
  initialPage
}: CatalogStreamingProps) {
  try {
    // Buscar dados em paralelo com streaming
    const [productsResult, categories] = await Promise.all([
      getProducts({
        search: initialSearch,
        category: initialCategory,
        sortBy: initialSortBy as any,
        sortOrder: initialSortOrder as any,
        page: initialPage,
        limit: 12
      }),
      getCategories()
    ]);

    return (
      <CatalogClient
        initialProducts={productsResult.products}
        initialTotalCount={productsResult.totalCount}
        initialTotalPages={productsResult.totalPages}
        initialCurrentPage={productsResult.currentPage}
        categories={categories}
        initialFilters={{
          search: initialSearch,
          category: initialCategory,
          sortBy: initialSortBy,
          sortOrder: initialSortOrder
        }}
      />
    );
  } catch (error) {
    console.error('Erro ao carregar catálogo:', error);
    
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-brown-800 mb-4">
          Ops! Algo deu errado
        </h2>
        <p className="text-brown-600 mb-6">
          Não conseguimos carregar o catálogo no momento. Tente novamente em alguns instantes.
        </p>
        <ErrorButton className="bg-rose-500 text-white px-6 py-3 rounded-lg hover:bg-rose-600 transition-colors">
          Tentar Novamente
        </ErrorButton>
      </div>
    );
  }
}