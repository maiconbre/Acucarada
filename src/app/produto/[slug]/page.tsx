import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getProductBySlug, getRelatedProducts, incrementProductViews, generateProductMetadata } from '@/lib/actions/products';
import { CACHE_CONFIGS } from '@/lib/cache';
import ProductClient from '@/components/client/ProductClient';
import ProductSkeleton from '@/components/ui/ProductSkeleton';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Product } from '@/types/product';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Configuração de cache para a página
export const revalidate = 3600; // 1 hora

// Geração de metadata dinâmica
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    
    if (!product) {
      return {
        title: 'Produto não encontrado - Açucarada',
        description: 'O produto que você está procurando não foi encontrado.',
      };
    }

    return await generateProductMetadata(product);
  } catch (error) {
    console.error('Erro ao gerar metadata:', error);
    return {
      title: 'Produto - Açucarada',
      description: 'Doces artesanais feitos com amor.',
    };
  }
}

// Componente para buscar dados do produto principal
async function ProductData({ slug }: { slug: string }) {
  try {
    const product = await getProductBySlug(slug);
    
    if (!product) {
      notFound();
    }

    // Incrementar visualizações (não bloquear renderização)
    incrementProductViews(product.id).catch(console.error);

    return product;
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    notFound();
  }
}

// Componente para buscar produtos relacionados
async function RelatedProductsData({ product }: { product: Product }) {
  try {
    if (!product.category?.id) {
      return [];
    }
    
    const relatedProducts = await getRelatedProducts(
      product.id, 
      product.category.id, 
      4
    );
    
    return relatedProducts || [];
  } catch (error) {
    console.error('Erro ao buscar produtos relacionados:', error);
    return [];
  }
}

// Skeleton para produtos relacionados
function RelatedProductsSkeleton() {
  return (
    <div className="mt-12">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente principal com streaming
async function ProductWithStreaming({ slug }: { slug: string }) {
  const product = await ProductData({ slug });
  
  return (
    <div>
      {/* Produto principal - carrega primeiro */}
      <ProductClient product={product} relatedProducts={[]} />
      
      {/* Produtos relacionados - carrega de forma independente */}
      <Suspense fallback={<RelatedProductsSkeleton />}>
        <RelatedProductsSection product={product} />
      </Suspense>
    </div>
  );
}

// Seção de produtos relacionados com streaming
async function RelatedProductsSection({ product }: { product: Product }) {
  const relatedProducts = await RelatedProductsData({ product });
  
  if (relatedProducts.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-brown-800 mb-6">
        Produtos Relacionados
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((relatedProduct) => (
          <div key={relatedProduct.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square relative">
              <Image
                src={relatedProduct.images?.[0]?.image_url || '/placeholder-product.jpg'}
                alt={relatedProduct.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-brown-800 mb-2">
                {relatedProduct.name}
              </h3>
              <p className="text-rose-600 font-bold">
                R$ {relatedProduct.price.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductWithStreaming slug={slug} />
    </Suspense>
  );
}

// Geração estática de rotas (opcional - para produtos mais acessados)
export async function generateStaticParams() {
  // Retornar array vazio para permitir geração sob demanda
  // Em produção, você pode buscar os slugs dos produtos mais populares
  return [];
}