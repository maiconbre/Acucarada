# 👨‍💻 GUIA DE DESENVOLVIMENTO

## 🏗️ ARQUITETURA E PADRÕES

### Estrutura de Pastas Detalhada
```
src/
├── app/                          # App Router (Next.js 14)
│   ├── (public)/                 # Grupo de rotas públicas
│   │   ├── page.tsx              # Homepage
│   │   ├── catalogo/             # Catálogo público
│   │   │   ├── page.tsx          # Lista de produtos
│   │   │   └── [slug]/           # Detalhes do produto
│   │   │       └── page.tsx
│   │   ├── categoria/            # Produtos por categoria
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── sobre/                # Página sobre
│   │   │   └── page.tsx
│   │   └── layout.tsx            # Layout público
│   ├── admin/                    # Área administrativa
│   │   ├── dashboard/            # Dashboard principal
│   │   │   └── page.tsx
│   │   ├── produtos/             # Gestão de produtos
│   │   │   ├── page.tsx          # Lista
│   │   │   ├── novo/             # Criar produto
│   │   │   │   └── page.tsx
│   │   │   └── [id]/             # Editar produto
│   │   │       └── page.tsx
│   │   ├── categorias/           # Gestão de categorias
│   │   │   └── page.tsx
│   │   ├── configuracoes/        # Configurações
│   │   │   └── page.tsx
│   │   └── layout.tsx            # Layout admin
│   ├── api/                      # API Routes
│   │   ├── produtos/             # CRUD produtos
│   │   │   ├── route.ts          # GET, POST
│   │   │   └── [id]/
│   │   │       └── route.ts      # GET, PUT, DELETE
│   │   ├── categorias/           # CRUD categorias
│   │   │   └── route.ts
│   │   ├── upload/               # Upload de imagens
│   │   │   └── route.ts
│   │   ├── settings/             # Configurações
│   │   │   └── route.ts
│   │   └── analytics/            # Analytics básico
│   │       └── route.ts
│   ├── auth/                     # Autenticação
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── callback/             # Callback Supabase
│   │   │   └── route.ts
│   │   └── layout.tsx
│   ├── globals.css               # Estilos globais
│   ├── layout.tsx                # Root layout
│   ├── loading.tsx               # Loading UI global
│   ├── error.tsx                 # Error UI global
│   └── not-found.tsx             # 404 page
├── components/                   # Componentes reutilizáveis
│   ├── ui/                       # Componentes base (shadcn)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── public/                   # Componentes públicos
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── product-card.tsx
│   │   ├── product-grid.tsx
│   │   ├── search-bar.tsx
│   │   ├── category-filter.tsx
│   │   └── whatsapp-button.tsx
│   ├── admin/                    # Componentes administrativos
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── product-form.tsx
│   │   ├── image-upload.tsx
│   │   ├── data-table.tsx
│   │   └── dashboard-stats.tsx
│   └── shared/                   # Componentes compartilhados
│       ├── loading-spinner.tsx
│       ├── error-boundary.tsx
│       ├── confirm-dialog.tsx
│       └── toast-provider.tsx
├── lib/                          # Utilitários e configurações
│   ├── supabase/                 # Cliente Supabase
│   │   ├── client.ts             # Cliente browser
│   │   ├── server.ts             # Cliente servidor
│   │   └── middleware.ts         # Middleware auth
│   ├── validations/              # Schemas Zod
│   │   ├── product.ts
│   │   ├── category.ts
│   │   ├── auth.ts
│   │   └── settings.ts
│   ├── utils/                    # Funções utilitárias
│   │   ├── cn.ts                 # className utility
│   │   ├── format.ts             # Formatação
│   │   ├── upload.ts             # Upload helpers
│   │   └── whatsapp.ts           # WhatsApp integration
│   ├── hooks/                    # Custom hooks
│   │   ├── use-products.ts
│   │   ├── use-categories.ts
│   │   ├── use-auth.ts
│   │   └── use-upload.ts
│   ├── constants/                # Constantes
│   │   ├── routes.ts
│   │   ├── messages.ts
│   │   └── config.ts
│   └── types/                    # Tipos TypeScript
│       ├── database.ts           # Tipos do banco
│       ├── api.ts                # Tipos das APIs
│       └── components.ts         # Tipos dos componentes
└── types/                        # Tipos globais
    ├── supabase.ts               # Tipos gerados
    └── global.d.ts               # Declarações globais
```

---

## 🎯 PADRÕES DE CÓDIGO

### Nomenclatura
```typescript
// ✅ Bom
const ProductCard = () => {}
const useProducts = () => {}
const WHATSAPP_NUMBER = '5511999999999'
const API_ROUTES = {
  PRODUCTS: '/api/produtos',
  CATEGORIES: '/api/categorias'
}

// ❌ Evitar
const productcard = () => {}
const UseProducts = () => {}
const whatsappnumber = '5511999999999'
```

### Estrutura de Componentes
```typescript
// components/public/product-card.tsx
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils/format'
import { Product } from '@/types/database'
import Image from 'next/image'
import Link from 'next/link'

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div className="relative aspect-square">
          <Image
            src={product.images?.[0]?.image_url || '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover rounded-t-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {product.short_description}
          </p>
          <p className="text-2xl font-bold text-primary">
            {formatPrice(product.price)}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/catalogo/${product.slug}`}>
            Ver Detalhes
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
```

### API Routes Pattern
```typescript
// app/api/produtos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { productSchema } from '@/lib/validations/product'
import { z } from 'zod'

// GET - Listar produtos
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        images:product_images(*)
      `)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    
    if (category) {
      query = query.eq('category_id', category)
    }
    
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }
    
    const { data, error, count } = await query
      .range((page - 1) * limit, page * limit - 1)
    
    if (error) {
      return NextResponse.json(
        { error: 'Erro ao buscar produtos' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar produto
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const validatedData = productSchema.parse(body)
    
    const { data, error } = await supabase
      .from('products')
      .insert(validatedData)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json(
        { error: 'Erro ao criar produto' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
```

### Custom Hooks Pattern
```typescript
// lib/hooks/use-products.ts
import { useState, useEffect } from 'react'
import { Product } from '@/types/database'

interface UseProductsOptions {
  category?: string
  search?: string
  page?: number
  limit?: number
}

interface UseProductsReturn {
  products: Product[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    totalPages: number
    total: number
  }
  refetch: () => void
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 0,
    total: 0
  })
  
  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (options.category) params.set('category', options.category)
      if (options.search) params.set('search', options.search)
      if (options.page) params.set('page', options.page.toString())
      if (options.limit) params.set('limit', options.limit.toString())
      
      const response = await fetch(`/api/produtos?${params}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar produtos')
      }
      
      const result = await response.json()
      setProducts(result.data)
      setPagination(result.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchProducts()
  }, [options.category, options.search, options.page, options.limit])
  
  return {
    products,
    loading,
    error,
    pagination,
    refetch: fetchProducts
  }
}
```

---

## 🔒 SEGURANÇA E VALIDAÇÃO

### Schemas Zod
```typescript
// lib/validations/product.ts
import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  slug: z.string().min(1, 'Slug é obrigatório'),
  description: z.string().optional(),
  short_description: z.string().max(200, 'Descrição curta muito longa').optional(),
  price: z.number().positive('Preço deve ser positivo'),
  category_id: z.string().uuid('ID da categoria inválido').optional(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  stock_quantity: z.number().int().min(0, 'Estoque não pode ser negativo').default(0),
  min_order_quantity: z.number().int().positive('Quantidade mínima deve ser positiva').default(1),
  max_order_quantity: z.number().int().positive().optional(),
  preparation_time: z.string().optional(),
  ingredients: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
  weight_grams: z.number().int().positive().optional(),
  dimensions: z.string().optional(),
  seo_title: z.string().max(60, 'Título SEO muito longo').optional(),
  seo_description: z.string().max(160, 'Descrição SEO muito longa').optional()
})

export const productImageSchema = z.object({
  product_id: z.string().uuid(),
  image_url: z.string().url('URL da imagem inválida'),
  alt_text: z.string().optional(),
  is_primary: z.boolean().default(false),
  sort_order: z.number().int().min(0).default(0)
})

export type ProductInput = z.infer<typeof productSchema>
export type ProductImageInput = z.infer<typeof productImageSchema>
```

### Middleware de Autenticação
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  // Proteger rotas admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      const redirectUrl = new URL('/auth/login', req.url)
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }
  
  // Redirect se já logado e tentando acessar login
  if (req.nextUrl.pathname.startsWith('/auth/login') && session) {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url))
  }
  
  return res
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/auth/login'
  ]
}
```

---

## 🎨 ESTILIZAÇÃO E UI

### CSS Variables (globals.css)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
    
    /* Cores personalizadas Açucarada */
    --brand-primary: 24 100% 50%; /* Laranja */
    --brand-secondary: 45 100% 60%; /* Amarelo dourado */
    --brand-accent: 15 100% 45%; /* Vermelho alaranjado */
  }
  
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 94.1%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
  
  /* Scrollbar personalizada */
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    @apply bg-muted;
  }
  
  ::-webkit-scrollbar-thumb {
    @apply bg-border rounded-full;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    @apply bg-muted-foreground;
  }
}

@layer utilities {
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .animate-fade-in {
    animation: fadeIn 0.5s ease-in-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .glass {
    @apply bg-white/80 backdrop-blur-sm border border-white/20;
  }
  
  .dark .glass {
    @apply bg-gray-900/80 backdrop-blur-sm border border-gray-700/20;
  }
}
```

---

## 📱 RESPONSIVIDADE E PERFORMANCE

### Breakpoints Tailwind
```typescript
// Breakpoints padrão
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large
}

// Uso em componentes
<div className="
  grid 
  grid-cols-1 
  sm:grid-cols-2 
  md:grid-cols-3 
  lg:grid-cols-4 
  gap-4
">
```

### Otimização de Imagens
```typescript
// Componente otimizado
import Image from 'next/image'

function OptimizedImage({ src, alt, ...props }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      priority={false} // true apenas para imagens above-the-fold
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      {...props}
    />
  )
}
```

### Loading States
```typescript
// Skeleton components
function ProductCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <Skeleton className="aspect-square w-full" />
        <div className="p-4 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      </CardContent>
    </Card>
  )
}

// Loading grid
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
```

---

## 🧪 TESTES E QUALIDADE

### ESLint Configuration
```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "prettier"
  ],
  "rules": {
    "prefer-const": "error",
    "no-unused-vars": "error",
    "no-console": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/prefer-const": "error"
  }
}
```

### Prettier Configuration
```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

---

## 📊 MONITORAMENTO E ANALYTICS

### Error Boundary
```typescript
// components/shared/error-boundary.tsx
'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Enviar para serviço de monitoramento
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <h2 className="text-2xl font-bold">Algo deu errado!</h2>
          <p className="text-muted-foreground">Ocorreu um erro inesperado.</p>
          <Button onClick={() => this.setState({ hasError: false })}>
            Tentar novamente
          </Button>
        </div>
      )
    }
    
    return this.props.children
  }
}
```

### Analytics Básico
```typescript
// lib/analytics.ts
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', eventName, properties)
    }
    
    // Analytics customizado
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventName,
        event_data: properties,
        timestamp: new Date().toISOString()
      })
    }).catch(console.error)
  }
}

// Uso
trackEvent('product_view', {
  product_id: product.id,
  product_name: product.name,
  category: product.category?.name
})
```

---

## 🚀 DEPLOY E CI/CD

### Scripts Package.json
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "analyze": "ANALYZE=true npm run build",
    "db:types": "npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts",
    "pre-commit": "npm run lint && npm run type-check && npm run format:check"
  }
}
```

---

**Guia desenvolvido para**: Açucarada Doceria  
**Foco**: Código limpo, performance e manutenibilidade  
**Última atualização**: 2024