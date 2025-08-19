# 📋 REGRAS E DIRETRIZES DO PROJETO AÇUCARADA

## 🎯 VISÃO GERAL DO PROJETO

O **Açucarada** é um catálogo digital moderno para uma doceria artesanal, desenvolvido com foco em:
- **Experiência do usuário** otimizada para conversão via WhatsApp
- **Gestão administrativa** simplificada para a proprietária
- **Performance e SEO** para alcance orgânico
- **Arquitetura enxuta** com deploy unificado

---

## 🏗️ ARQUITETURA TECNOLÓGICA

### Stack Principal
- **Frontend/Backend**: Next.js 14 (App Router)
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Storage**: Supabase Storage
- **Deploy**: Vercel
- **Estilização**: Tailwind CSS + Shadcn/ui
- **Linguagem**: TypeScript

### Princípios Arquiteturais
1. **Monorepo**: Frontend e backend em um único repositório
2. **SSR/SSG**: Renderização otimizada para SEO
3. **Edge Functions**: Processamento próximo ao usuário
4. **CDN Global**: Entrega rápida de assets
5. **Real-time**: Atualizações instantâneas via Supabase

---

## 📁 ESTRUTURA DE PASTAS OBRIGATÓRIA

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── (public)/          # Rotas públicas
│   │   ├── page.tsx       # Homepage
│   │   ├── catalogo/      # Catálogo de produtos
│   │   └── produto/       # Páginas individuais
│   ├── admin/             # Área administrativa
│   │   ├── dashboard/     # Dashboard principal
│   │   ├── produtos/      # Gestão de produtos
│   │   ├── categorias/    # Gestão de categorias
│   │   └── configuracoes/ # Configurações
│   ├── api/               # API Routes
│   │   ├── products/      # CRUD produtos
│   │   ├── categories/    # CRUD categorias
│   │   └── upload/        # Upload de imagens
│   ├── globals.css        # Estilos globais
│   └── layout.tsx         # Layout raiz
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes base (Shadcn)
│   ├── admin/            # Componentes administrativos
│   ├── public/           # Componentes públicos
│   └── shared/           # Componentes compartilhados
├── lib/                  # Utilitários e configurações
│   ├── supabase/         # Cliente Supabase
│   ├── utils/            # Funções utilitárias
│   ├── validations/      # Schemas Zod
│   └── constants/        # Constantes do projeto
├── types/                # Definições TypeScript
│   ├── database.ts       # Tipos do banco
│   ├── product.ts        # Tipos de produto
│   └── index.ts          # Exports centralizados
└── hooks/                # Custom hooks
    ├── useProducts.ts    # Hook para produtos
    ├── useCategories.ts # Hook para categorias
    └── useAuth.ts       # Hook para autenticação
```

---

## 🎨 PADRÕES DE DESIGN E UI/UX

### Paleta de Cores (Marca Açucarada)
```css
:root {
  /* Cores principais */
  --rose-50: #fff1f2;
  --rose-100: #ffe4e6;
  --rose-200: #fecdd3;
  --rose-400: #fb7185;
  --rose-500: #f43f5e;
  
  /* Cores neutras */
  --brown-600: #92400e;
  --brown-700: #78350f;
  --brown-800: #451a03;
  
  /* Cores de fundo */
  --cream: #FFF9F5;
  --white: #ffffff;
}
```

### Tipografia
- **Títulos**: 'Dancing Script' (handwritten)
- **Corpo**: 'Montserrat' (clean, legível)
- **Hierarquia**: h1(3xl) > h2(2xl) > h3(xl) > p(base)

### Componentes Obrigatórios
1. **ProductCard**: Card responsivo com imagem, título, preço e botão WhatsApp
2. **CategoryFilter**: Filtro por categorias com contadores
3. **SearchBar**: Busca em tempo real
4. **WhatsAppButton**: Botão flutuante com animação
5. **AdminLayout**: Layout com sidebar e navegação
6. **LoadingSkeleton**: Estados de carregamento
7. **ImageUpload**: Upload com preview e validação

### Responsividade
- **Mobile First**: Design prioritário para dispositivos móveis
- **Breakpoints**: sm(640px), md(768px), lg(1024px), xl(1280px)
- **Grid**: 1 coluna (mobile), 2 colunas (tablet), 3 colunas (desktop)

---

## 🔐 SEGURANÇA E AUTENTICAÇÃO

### Row Level Security (RLS)
```sql
-- Leitura pública para dados ativos
CREATE POLICY "Public read active products" ON products
    FOR SELECT USING (is_active = true);

-- Acesso completo para administradores autenticados
CREATE POLICY "Admin full access" ON products
    FOR ALL USING (auth.role() = 'authenticated');
```

### Middleware de Proteção
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Proteger rotas /admin/*
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return withAuth(request);
  }
}
```

### Validação com Zod
```typescript
// Todos os dados devem ser validados
const productSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  category_id: z.string().uuid(),
  // ...
});
```

---

## 📊 BANCO DE DADOS E API

### Tabelas Principais
1. **products**: Produtos com metadados completos
2. **categories**: Categorias organizacionais
3. **product_images**: Imagens com ordenação
4. **settings**: Configurações do sistema
5. **profiles**: Perfis de usuário
6. **analytics**: Métricas básicas

### Padrões de API
```typescript
// GET /api/products
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  
  // Implementar filtros e paginação
}

// POST /api/products (protegido)
export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  // Validar e criar produto
}
```

### Otimizações de Performance
- **Índices**: Criar índices para consultas frequentes
- **Caching**: Cache de consultas com revalidação
- **Pagination**: Implementar paginação em listas grandes
- **Image Optimization**: Next.js Image com lazy loading

---

## 🚀 INTEGRAÇÃO WHATSAPP

### Padrão de URL
```typescript
const generateWhatsAppURL = (product: Product) => {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const message = `Olá Açucarada! Gostaria de fazer um pedido:

🍰 ${product.name}
💰 R$ ${product.price.toFixed(2)}
📱 ${window.location.origin}/produto/${product.slug}

Poderia me informar sobre disponibilidade e entrega?`;
  
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};
```

### Tracking de Conversões
```typescript
// Registrar cliques no WhatsApp
const trackWhatsAppClick = async (productId: string) => {
  await fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify({
      event_type: 'whatsapp_click',
      product_id: productId
    })
  });
};
```

---

## 📈 SEO E PERFORMANCE

### Metadata Dinâmica
```typescript
// app/produto/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug);
  
  return {
    title: `${product.name} - Açucarada`,
    description: product.short_description,
    openGraph: {
      title: product.name,
      description: product.short_description,
      images: [product.images[0]?.image_url],
    },
  };
}
```

### Core Web Vitals
- **LCP**: < 2.5s (otimizar imagens)
- **FID**: < 100ms (minimizar JavaScript)
- **CLS**: < 0.1 (reservar espaço para imagens)

### Sitemap Dinâmico
```typescript
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getActiveProducts();
  
  return [
    { url: 'https://acucarada.vercel.app', lastModified: new Date() },
    ...products.map(product => ({
      url: `https://acucarada.vercel.app/produto/${product.slug}`,
      lastModified: product.updated_at,
    }))
  ];
}
```

---

## 🔧 DESENVOLVIMENTO E DEPLOY

### Scripts Obrigatórios
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "db:generate-types": "supabase gen types typescript --project-id PROJECT_ID > src/types/database.ts"
  }
}
```

### Variáveis de Ambiente
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=5511999999999

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=
```

### CI/CD Pipeline
1. **Lint**: ESLint + Prettier
2. **Type Check**: TypeScript validation
3. **Build**: Next.js build
4. **Deploy**: Vercel automatic deployment
5. **Database**: Supabase migrations

---

## 📱 FUNCIONALIDADES OBRIGATÓRIAS

### Área Pública
- [x] Homepage com produtos em destaque
- [x] Catálogo com filtros e busca
- [x] Páginas individuais de produtos
- [x] Integração WhatsApp em todos os produtos
- [x] Design responsivo e otimizado
- [x] SEO completo com metadata dinâmica

### Área Administrativa
- [x] Dashboard com estatísticas
- [x] CRUD completo de produtos
- [x] CRUD de categorias
- [x] Upload múltiplo de imagens
- [x] Configurações da empresa
- [x] Sistema de autenticação seguro

### Funcionalidades Técnicas
- [x] Cache inteligente
- [x] Otimização de imagens
- [x] Analytics básico
- [x] Backup automático
- [x] Monitoramento de erros

---

## 🎯 MÉTRICAS DE SUCESSO

### Performance
- **Lighthouse Score**: > 90 em todas as categorias
- **Time to First Byte**: < 200ms
- **Bundle Size**: < 500KB (gzipped)

### Conversão
- **Taxa de clique WhatsApp**: > 15%
- **Tempo na página**: > 2 minutos
- **Taxa de rejeição**: < 40%

### Usabilidade
- **Tempo de carregamento**: < 3 segundos
- **Compatibilidade**: 95% dos dispositivos
- **Acessibilidade**: WCAG 2.1 AA

---

## 🚫 RESTRIÇÕES E LIMITAÇÕES

### Não Implementar
- ❌ Sistema de carrinho de compras
- ❌ Gateway de pagamento integrado
- ❌ Sistema de delivery próprio
- ❌ Chat interno (usar botão WhatsApp)
- ❌ Sistema de avaliações/reviews

### Limitações Técnicas
- **Usuários admin**: Máximo 2 usuários
- **Upload de imagens**: Máximo 5MB por arquivo
- **Produtos**: Sem limite (dentro do plano Supabase)
- **Storage**: 1GB incluído no plano gratuito

---

## 📋 CHECKLIST DE QUALIDADE

### Antes de Cada Deploy
- [ ] Todos os testes passando
- [ ] TypeScript sem erros
- [ ] Lighthouse score > 90
- [ ] Funcionalidade WhatsApp testada
- [ ] Responsividade verificada
- [ ] SEO metadata validada
- [ ] Imagens otimizadas
- [ ] Variáveis de ambiente configuradas

### Testes Obrigatórios
- [ ] Navegação completa (público)
- [ ] Login/logout (admin)
- [ ] CRUD produtos (admin)
- [ ] Upload de imagens (admin)
- [ ] Integração WhatsApp (todos os produtos)
- [ ] Performance em dispositivos móveis

---

## 🆘 SUPORTE E MANUTENÇÃO

### Monitoramento
- **Vercel Analytics**: Métricas de performance
- **Supabase Dashboard**: Saúde do banco de dados
- **Error Tracking**: Sentry ou similar
- **Uptime Monitoring**: Verificação de disponibilidade

### Backup e Recuperação
- **Banco de dados**: Backup automático diário (Supabase)
- **Imagens**: Replicação automática (Supabase Storage)
- **Código**: Versionamento Git + GitHub

### Atualizações
- **Dependências**: Atualização mensal
- **Conteúdo**: Atualização pela proprietária
- **Funcionalidades**: Releases quinzenais

---

## 📞 CONTATOS E RESPONSABILIDADES

### Equipe Técnica
- **Desenvolvimento**: Responsável por implementação e manutenção
- **DevOps**: Responsável por deploy e infraestrutura
- **Suporte**: Responsável por treinamento e suporte

### Proprietária (Açucarada)
- **Conteúdo**: Gestão de produtos e categorias
- **Atendimento**: Resposta aos clientes via WhatsApp
- **Feedback**: Sugestões de melhorias

---

## 🎉 CONSIDERAÇÕES FINAIS

Este documento define as regras fundamentais para o desenvolvimento do projeto Açucarada. Todas as decisões técnicas devem estar alinhadas com estes princípios, priorizando:

1. **Simplicidade**: Soluções diretas e eficazes
2. **Performance**: Experiência rápida e fluida
3. **Conversão**: Foco na geração de pedidos via WhatsApp
4. **Manutenibilidade**: Código limpo e bem documentado
5. **Escalabilidade**: Preparado para crescimento futuro

**Lembre-se**: O objetivo principal é converter visitantes em clientes através de uma experiência excepcional que culmina no contato via WhatsApp.

---

**Documento criado em**: 2024  
**Versão**: 1.0 beta  
**Próxima revisão**: A cada milestone do projeto