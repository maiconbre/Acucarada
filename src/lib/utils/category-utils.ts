/**
 * Utilitários para categorias
 */

/**
 * Gera breadcrumbs para páginas de categoria
 */
export function generateCategoryBreadcrumbs(category: any) {
  return [
    { name: 'Início', href: '/' },
    { name: 'Catálogo', href: '/catalogo' },
    { name: category.name, href: `/categoria/${category.slug}` }
  ];
}

/**
 * Formata descrição de categoria com fallback
 */
export function formatCategoryDescription(category: any, productCount: number = 0): string {
  if (category.description) {
    return category.description;
  }
  
  return `Explore nossa seleção de ${category.name.toLowerCase()} artesanais. ${productCount > 0 ? `${productCount} produtos disponíveis.` : ''} Feitos com carinho pela Açucarada.`;
}

/**
 * Gera metadata para páginas de categoria
 */
export function generateCategoryMetadata(category: any, productCount: number = 0) {
  const description = formatCategoryDescription(category, productCount);
  
  return {
    title: `${category.name} - Açucarada`,
    description,
    openGraph: {
      title: `${category.name} - Açucarada`,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${category.name} - Açucarada`,
      description,
    },
  };
}