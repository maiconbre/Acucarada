'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Heart, ShoppingBag, Share2, Eye, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
  preparation_time: string | null;
  ingredients: string[] | null;
  allergens: string[] | null;
  weight_grams: number | null;
  dimensions: string | null;
  seo_title: string | null;
  seo_description: string | null;
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
    sort_order: number;
  }[];
}

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  slug: string;
  product_images: {
    image_url: string;
    alt_text: string;
    is_primary?: boolean;
  }[];
}

interface ProductClientProps {
  product: Product;
  relatedProducts: RelatedProduct[];
}

export default function ProductClient({ product, relatedProducts }: ProductClientProps) {
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.short_description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast here
    }
  };

  const currentImage = product.product_images[selectedImageIndex];
  const whatsappUrl = generateWhatsAppURL(product);

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
            {product.category && (
              <>
                <span>/</span>
                <Link 
                  href={`/catalogo?categoria=${product.category?.[0]?.slug}`} 
                  className="hover:text-rose-500 transition-colors"
                >
                  {product.category?.[0]?.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-brown-800 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gradient-to-br from-rose-100 to-rose-200 rounded-2xl overflow-hidden relative">
              {currentImage ? (
                <Image
                  src={currentImage.image_url}
                  alt={currentImage.alt_text || product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl mb-4">🧁</div>
                    <p className="text-brown-600 font-medium text-xl">{product.name}</p>
                  </div>
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.category && (
                  <Badge className="bg-white/90 backdrop-blur-sm text-brown-700">
                    {product.category?.[0]?.name}
                  </Badge>
                )}
                {product.is_featured && (
                  <Badge className="bg-rose-500 text-white">
                    Destaque
                  </Badge>
                )}
              </div>
              
              {/* Actions */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Button
                  size="sm"
                  variant={isFavorite ? "default" : "secondary"}
                  className="w-10 h-10 p-0"
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-10 h-10 p-0"
                  onClick={handleShare}
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            {/* Thumbnail Gallery */}
            {product.product_images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.product_images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === selectedImageIndex
                        ? 'border-rose-500 ring-2 ring-rose-200'
                        : 'border-gray-200 hover:border-rose-300'
                    }`}
                  >
                    <Image
                      src={image.image_url}
                      alt={image.alt_text || product.name}
                      width={80}
                      height={80}
                      className="object-cover"
                      sizes="80px"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Information */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <h1 className="text-3xl font-bold text-brown-800 mb-2">
                {product.name}
              </h1>
              <p className="text-lg text-brown-600 mb-4">
                {product.short_description}
              </p>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl font-bold text-rose-500">
                  R$ {product.price.toFixed(2)}
                </span>
                {product.views_count > 0 && (
                  <div className="flex items-center gap-1 text-brown-500">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">{product.views_count} visualizações</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Description */}
            {product.description && (
              <div>
                <h3 className="text-lg font-semibold text-brown-800 mb-2">Descrição</h3>
                <p className="text-brown-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}
            
            {/* Product Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {product.preparation_time && (
                <div className="flex items-center gap-2 text-brown-600">
                  <Clock className="w-5 h-5 text-rose-500" />
                  <span>Preparo: {product.preparation_time}</span>
                </div>
              )}
              
              {product.weight_grams && (
                <div className="flex items-center gap-2 text-brown-600">
                  <span className="text-rose-500 font-bold">⚖️</span>
                  <span>Peso: {product.weight_grams}g</span>
                </div>
              )}
              
              {product.dimensions && (
                <div className="flex items-center gap-2 text-brown-600">
                  <span className="text-rose-500 font-bold">📏</span>
                  <span>{product.dimensions}</span>
                </div>
              )}
            </div>
            
            {/* Ingredients */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-brown-800 mb-2">Ingredientes</h3>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map((ingredient, index) => (
                    <Badge key={index} variant="outline">
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Allergens */}
            {product.allergens && product.allergens.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-brown-800 mb-2">Alérgenos</h3>
                <div className="flex flex-wrap gap-2">
                  {product.allergens.map((allergen, index) => (
                    <Badge key={index} variant="destructive">
                      ⚠️ {allergen}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <Separator />
            
            {/* WhatsApp Order Button */}
            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold py-4"
                asChild
              >
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Fazer Pedido via WhatsApp
                </a>
              </Button>
              
              <p className="text-center text-sm text-brown-600">
                Entre em contato conosco para verificar disponibilidade e combinar entrega
              </p>
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-brown-800 mb-6">
              Produtos Relacionados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => {
                const primaryImage = relatedProduct.product_images?.find(img => img.is_primary) || relatedProduct.product_images?.[0];
                
                return (
                  <Card key={relatedProduct.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <Link href={`/produto/${relatedProduct.slug}`}>
                        <div className="aspect-square bg-gradient-to-br from-rose-100 to-rose-200 relative overflow-hidden">
                          {primaryImage ? (
                            <Image
                              src={primaryImage.image_url}
                              alt={primaryImage.alt_text || relatedProduct.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-4xl mb-2">🧁</div>
                                <p className="text-brown-600 font-medium text-sm">{relatedProduct.name}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-semibold text-brown-800 mb-2 group-hover:text-rose-500 transition-colors">
                            {relatedProduct.name}
                          </h3>
                          <span className="text-lg font-bold text-rose-500">
                            R$ {relatedProduct.price.toFixed(2)}
                          </span>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}