
# 📋 TASKS DE REFACTORING - AÇUCARADA

## 🎯 CRONOGRAMA ENXUTO (4  S)

---

### 📅   1: AUDITORIA E PREPARAÇÃO

#### 🔎 Auditoria de Código

* [x] **1.1** Mapear todos os arquivos com `"use client"`

  * Listar componentes/páginas afetadas
  * Classificar em: **interativo** (mantém client) e **estático** (migrar para server)

* [x] **1.2** Identificar gargalos de performance

  * Páginas lentas (catálogo, produto, admin CRUD)
  * Uso excessivo de fetch no client

#### 🗄️ Reorganização da Estrutura

* [x] **1.3** Criar pastas para separar componentes

  ```
  src/components/
  ├── ui/          # Botões, inputs, UI genérica
  ├── client/      # Componentes com estado/hooks
  └── server/      # Renderização no servidor
  ```

* [x] **1.4** Configurar Supabase Client separado

  * `lib/supabase/server.ts` → uso em Server Components
  * `lib/supabase/client.ts` → uso em Client Components

#### ⚙️ Configuração Inicial

* [ ] **1.5** Ajustar `tsconfig.json`

  * Ativar `strict` e `noUncheckedIndexedAccess`
  * Melhorar tipagem do Supabase

* [x] **1.6** Criar helpers para cache

  * `lib/cache.ts` com opções de `revalidate` e `force-cache`

---

### 📅   2: MIGRAÇÃO ÁREA PÚBLICA

#### 🏠 Homepage

* [x] **2.1** Migrar para **Server Component**

  * Dados de produtos em destaque buscados no servidor
  * Suspense para loading de grid

#### 📱 Catálogo

* [x] **2.2** Migrar página `/catalogo` para **Server Component**

  * Produtos carregados direto do Supabase
  * `CategoryFilter` mantido como client

* [x] **2.3** Adicionar caching com `revalidate: 60`

  * Melhorar performance em navegação repetida

#### 🛍️ Produto

* [x] **2.4** Página `[slug]` como **Server Component**

  * `generateMetadata` para SEO dinâmico
  * Buscar imagens e descrições no servidor

* [x] **2.5** Manter `WhatsAppButton` como client

  * Abrir link com `window.location`

---

### 📅   3: MIGRAÇÃO ÁREA ADMINISTRATIVA

#### 📊 Dashboard

* [x] **3.1** Renderização inicial server-side

  * Estatísticas e contagens pré-renderizadas
  * Gráficos → Client Components

#### 🛍️ CRUD de Produtos

* [x] **3.2** Substituir API Routes por **Server Actions**

  * Criar produto (`criarProduto`)
  * Editar produto (`editarProduto`)
  * Deletar produto (`removerProduto`)

* [x] **3.3** Forms usando `action={serverAction}`

  * Remover `fetch` manual
  * Adicionar validação com `zod`

#### 🖼️ Upload de Imagens

* [x] **3.4** Preview em client
* [x] **3.5** Upload para Supabase Storage via **Server Action**
* [x] **3.6** Regras de segurança (apenas admin autorizado)

---

### 📅   4: PERFORMANCE E DEPLOY

#### 🚀 Otimizações

* [x] **4.1** Implementar streaming + suspense

  * Catálogo renderiza primeiro layout, depois produtos
  * Produto carrega descrição sob demanda

* [x] **4.2** Revisar imagens

  * Trocar `<img>` por `<Image>`
  * Ativar `next/image` otimizado

* [x] **4.3** Revisar cache

  * Catálogo: `revalidate: 60`
  * Produto: `force-cache`
  * Admin: `no-store`

#### 🔍 Testes e Qualidade

* [x] **4.4** Testar SSR/CSR híbrido

  * Páginas públicas funcionam sem JS
  * Admin depende apenas de interatividade necessária

* [x] **4.5** Lighthouse + Core Web Vitals

  * Meta > 90 em performance
  * SEO dinâmico validado

#### 📦 Deploy Final

* [x] **4.6** Configurar preview e produção no Vercel
* [ ] **4.7** Testar variáveis de ambiente em produção
* [ ] **4.8** Documentar Server Actions + uso correto

---

## ✅ CHECKLIST DE QUALIDADE PÓS-REFACTOR

* [ ] Homepage carrega sem JS habilitado
* [ ] Catálogo funciona com Server Components + filtros client
* [ ] Produto carrega metadados dinâmicos (SEO)
* [ ] Admin CRUD sem fetch manual (apenas Server Actions)
* [ ] Upload de imagens seguro e funcional
* [ ] Roteamento mais rápido (sem `use client` desnecessário)
* [ ] Lighthouse > 90 em todas métricas

---