/**
 * Utilitários para produtos
 */

/**
 * Gera URLs do WhatsApp para produtos
 */
export function generateWhatsAppURL(product: any): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!phone) {
    console.warn('NEXT_PUBLIC_WHATSAPP_NUMBER não configurado');
    return '#';
  }

  const message = `Olá Açucarada! Gostaria de fazer um pedido:

🍰 ${product.name}
💰 R$ ${product.price.toFixed(2)}
📱 ${process.env.NEXT_PUBLIC_SITE_URL || 'https://acucarada.vercel.app'}/produto/${product.slug}

Poderia me informar sobre disponibilidade e entrega?`;
  
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Formata preço para exibição
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
}

/**
 * Obtém a primeira imagem de um produto
 */
export function getProductMainImage(product: any): string {
  if (product.product_images && product.product_images.length > 0) {
    // Ordenar por sort_order e pegar a primeira
    const sortedImages = product.product_images.sort(
      (a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)
    );
    return sortedImages[0].image_url;
  }
  
  // Imagem placeholder se não houver imagem
  return '/placeholder-product.jpg';
}

/**
 * Incrementa o contador de visualizações de um produto (client-side)
 */
export function trackProductView(productId: string): void {
  // Esta função pode ser usada no client para tracking
  if (typeof window !== 'undefined') {
    // Implementar tracking analytics se necessário
    console.log(`Product viewed: ${productId}`);
  }
}