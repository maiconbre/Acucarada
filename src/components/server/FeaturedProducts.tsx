import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Heart, ShoppingBag } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { generateWhatsAppURL } from '@/lib/utils/product-utils';
import { CACHE_CONFIGS } from '@/lib/cache';

interface Product {
  id: string;
  name: string;
  short_description: string;
  price: number;
  slug: string;
  category: {
    name: string;
  }[];
  product_images: {
    image_url: string;
    alt_text: string;
  }[];
}

async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      short_description,
      price,
      slug,
      category:categories(name),
      product_images(image_url, alt_text)
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }

  return data || [];
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <div 
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-rose-100 transform hover:-translate-y-2"
      style={{
        animationDelay: `${index * 100}ms`,
        animation: 'fadeInUp 0.6s ease-out forwards'
      }}
    >
      {/* Product Image */}
      <div className="aspect-square bg-gradient-to-br from-rose-100 to-rose-200 relative overflow-hidden">
        {product.product_images?.[0] ? (
          <Image
            src={product.product_images[0].image_url}
            alt={product.product_images[0].alt_text || product.name}
            fill
            priority={index < 3} // Priority para as 3 primeiras imagens
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-2">🧁</div>
              <p className="text-brown-600 font-medium">{product.name}</p>
            </div>
          </div>
        )}
        
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm">
            {product.category?.[0]?.name || 'Doce'}
          </span>
        </div>
        
        {/* Favorite Button */}
        <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors group/heart opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Heart className="w-5 h-5 text-rose-400 group-hover/heart:text-rose-500 group-hover/heart:fill-rose-500 transition-all" />
        </button>
      </div>
      
      {/* Product Info */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-brown-800 mb-2 group-hover:text-rose-500 transition-colors duration-300">
          {product.name}
        </h3>
        
        <p className="text-brown-600 mb-4 line-clamp-2 leading-relaxed">
          {product.short_description}
        </p>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-rose-500">
              R$ {product.price.toFixed(2)}
            </span>
            <span className="text-xs text-brown-400">por unidade</span>
          </div>
          <div className="flex items-center text-yellow-400">
            <span className="text-xs text-brown-500 ml-1">(5.0)</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link
            href={`/produto/${product.slug}`}
            className="flex-1 bg-gradient-to-r from-brown-100 to-brown-50 hover:from-brown-200 hover:to-brown-100 text-brown-700 px-4 py-3 rounded-xl hover:shadow-md transition-all duration-300 font-medium text-center border border-brown-200 hover:border-brown-300"
          >
            Ver Detalhes
          </Link>
          
          <a
            href={generateWhatsAppURL(product)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gradient-to-r from-rose-400 to-rose-500 text-white px-4 py-3 rounded-xl hover:from-rose-500 hover:to-rose-600 transition-all duration-300 font-medium text-center flex items-center justify-center space-x-1 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Pedir</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
          <div className="aspect-square bg-gray-200"></div>
          <div className="p-6">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function ProductGrid() {
  const products = await getFeaturedProducts();

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🧁</div>
        <h3 className="text-xl font-semibold text-brown-700 mb-2">Em breve novos doces!</h3>
        <p className="text-brown-600 mb-6">Estamos preparando delícias especiais para você.</p>
        <a
          href="https://wa.me/5511999999999?text=Olá%20Açucarada!%20Gostaria%20de%20saber%20sobre%20os%20doces%20disponíveis."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-rose-400 to-rose-500 text-white px-6 py-3 rounded-full hover:from-rose-500 hover:to-rose-600 transition-all duration-300 font-medium"
        >
          <span>Falar no WhatsApp</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
      
      {/* View All Button */}
      <div className="text-center">
        <Link
          href="/catalogo"
          className="group inline-flex items-center gap-3 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:from-rose-600 hover:via-pink-600 hover:to-rose-700 transition-all duration-500 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden"
        >
          {/* Efeito de brilho */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          <span className="relative z-10">Ver Catálogo Completo</span>
          <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
        </Link>
        
        {/* Texto adicional */}
        <p className="text-brown-600 mt-4 text-sm">
          Descubra todos os nossos doces artesanais
        </p>
      </div>
    </>
  );
}

export function FeaturedProducts() {
  return (
    <section className="py-20 bg-gradient-to-br from-cream to-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-rose-300 rounded-full"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-rose-400 rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-rose-200 rounded-full"></div>
        <div className="absolute bottom-32 right-1/3 w-24 h-24 bg-rose-300 rounded-full"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-400 to-rose-500 rounded-full mb-6">
            <span className="text-2xl">🧁</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-brown-800 mb-6" style={{ fontFamily: 'Dancing Script, cursive' }}>
            Nossos Doces em Destaque
          </h2>
          <p className="text-xl text-brown-600 max-w-3xl mx-auto leading-relaxed">
            Conheça alguns dos nossos doces mais queridos pelos clientes, feitos com amor e ingredientes selecionados
          </p>
          <div className="mt-6 w-24 h-1 bg-gradient-to-r from-rose-400 to-rose-500 mx-auto rounded-full"></div>
        </div>

        <Suspense fallback={<LoadingSkeleton />}>
          <ProductGrid />
        </Suspense>
      </div>
    </section>
  );
}

// Configuração de cache para revalidação
export const revalidate = 3600; // 1 hora