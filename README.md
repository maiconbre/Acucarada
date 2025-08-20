# 🍰 Açucarada - Catálogo Digital

> **Catálogo digital moderno para doceria artesanal com sistema administrativo completo**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/maiconbre/acucarada)
[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8)](https://tailwindcss.com/)

## 🎯 Sobre o Projeto

O **Açucarada** é uma aplicação web completa desenvolvida para transformar o catálogo estático de uma doceria artesanal em uma experiência digital moderna e interativa. O projeto combina um **catálogo público otimizado** para conversão via WhatsApp com um **sistema administrativo robusto** para gestão autônoma.

### ✨ Características Principais

- 🛍️ **Catálogo Público**: Vitrine digital otimizada para conversão
- 📱 **Integração WhatsApp**: Pedidos diretos com mensagens pré-formatadas
- 🔐 **Painel Administrativo**: Sistema completo de gestão
- 📊 **Dashboard Analytics**: Métricas de produtos e visualizações
- 🖼️ **Upload de Imagens**: Sistema robusto com otimização automática
- 🎨 **Design Responsivo**: Experiência perfeita em todos os dispositivos
- ⚡ **Performance Otimizada**: Lighthouse Score > 90
- 🔍 **SEO Completo**: Metadata dinâmica e sitemap automático

## 🏗️ Arquitetura Tecnológica

### Stack Principal
- **Framework**: [Next.js 15.4.6](https://nextjs.org/) (App Router)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Banco de Dados**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Storage**: Supabase Storage
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/ui](https://ui.shadcn.com/)
- **Deploy**: [Vercel](https://vercel.com/)
- **Analytics**: Vercel Analytics + Web Vitals

### Funcionalidades Implementadas

#### 🌐 Área Pública
- ✅ Homepage com produtos em destaque
- ✅ Catálogo completo com filtros por categoria
- ✅ Páginas individuais de produtos (SEO otimizado)
- ✅ Sistema de busca em tempo real
- ✅ Integração WhatsApp com mensagens personalizadas
- ✅ Design responsivo e acessível
- ✅ Otimização de imagens automática

#### 🔐 Área Administrativa
- ✅ Dashboard com estatísticas em tempo real
- ✅ CRUD completo de produtos
- ✅ Gestão de categorias
- ✅ Upload múltiplo de imagens
- ✅ Sistema de autenticação seguro
- ✅ Configurações da empresa
- ✅ Logs de atividades

#### 🛠️ Funcionalidades Técnicas
- ✅ Cache inteligente com revalidação
- ✅ Otimização de bundle e performance
- ✅ Monitoramento de erros robusto
- ✅ Backup automático (Supabase)
- ✅ CI/CD com GitHub Actions
- ✅ Lighthouse CI para monitoramento contínuo

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no [Supabase](https://supabase.com/)
- Conta no [Vercel](https://vercel.com/) (para deploy)

### 1. Clone o Repositório
```bash
git clone https://github.com/maico/acucarada.git
cd acucarada
```

### 2. Instale as Dependências
```bash
npm install
# ou
yarn install
```

### 3. Configure as Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico
SUPABASE_PROJECT_ID=seu_project_id

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=5511999999999

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Segurança
JWT_SECRET=seu_jwt_secret_muito_seguro
BCRYPT_ROUNDS=12

# Ambiente
NODE_ENV=development
```

### 4. Configure o Banco de Dados
Execute as migrações SQL no painel do Supabase:

```bash
# As migrações estão em docs/MIGRATIONS.sql
# Execute no SQL Editor do Supabase
```

### 5. Execute o Projeto
```bash
npm run dev
# ou
yarn dev
```

Acesse [http://localhost:3000](http://localhost:3000) para ver o catálogo público.
Acesse [http://localhost:3000/admin](http://localhost:3000/admin) para o painel administrativo.

## 📁 Estrutura do Projeto

```
acucarada/
├── src/
│   ├── app/                    # App Router (Next.js 15)
│   │   ├── (public)/          # Rotas públicas
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── catalogo/      # Catálogo de produtos
│   │   │   ├── categoria/     # Páginas por categoria
│   │   │   └── produto/       # Páginas individuais
│   │   ├── admin/             # Área administrativa
│   │   │   ├── dashboard/     # Dashboard principal
│   │   │   ├── produtos/      # Gestão de produtos
│   │   │   ├── usuarios/      # Gestão de usuários
│   │   │   └── perfil/        # Configurações
│   │   ├── api/               # API Routes
│   │   │   ├── products/      # CRUD produtos
│   │   │   ├── categories/    # CRUD categorias
│   │   │   ├── upload/        # Upload de imagens
│   │   │   └── auth/          # Autenticação
│   │   └── debug/             # Ferramentas de debug
│   ├── components/            # Componentes reutilizáveis
│   │   ├── ui/               # Componentes base (Shadcn)
│   │   ├── admin/            # Componentes administrativos
│   │   ├── public/           # Componentes públicos
│   │   ├── server/           # Server Components
│   │   └── client/           # Client Components
│   ├── lib/                  # Utilitários e configurações
│   │   ├── supabase/         # Cliente Supabase
│   │   ├── actions/          # Server Actions
│   │   ├── utils/            # Funções utilitárias
│   │   ├── validations/      # Schemas Zod
│   │   └── auth.ts           # Configuração de auth
│   ├── types/                # Definições TypeScript
│   │   ├── database.ts       # Tipos do banco
│   │   ├── product.ts        # Tipos de produto
│   │   └── auth.ts           # Tipos de autenticação
│   └── hooks/                # Custom hooks
├── docs/                     # Documentação completa
├── scripts/                  # Scripts utilitários
├── public/                   # Assets estáticos
└── .github/                  # CI/CD workflows
```

## 🎨 Design System

### Paleta de Cores
- **Primária**: Rose (tons de rosa para identidade da marca)
- **Secundária**: Brown (tons terrosos para elegância)
- **Neutras**: Gray (tons de cinza para textos e fundos)
- **Especiais**: Cream (fundo suave e acolhedor)

### Componentes UI
O projeto utiliza [Shadcn/ui](https://ui.shadcn.com/) como base, com customizações específicas:
- Cards de produtos responsivos
- Formulários com validação em tempo real
- Modais e dialogs acessíveis
- Sistema de notificações (toast)
- Loading states e skeletons

## 📱 Integração WhatsApp

O sistema gera automaticamente mensagens personalizadas para WhatsApp:

```typescript
const message = `Olá Açucarada! Gostaria de fazer um pedido:

🍰 ${product.name}
💰 R$ ${product.price.toFixed(2)}
📱 ${window.location.origin}/produto/${product.slug}

Poderia me informar sobre disponibilidade e entrega?`;
```

## 🔐 Segurança

- **Row Level Security (RLS)** configurado no Supabase
- **Autenticação JWT** com refresh tokens
- **Validação de dados** com Zod em todas as entradas
- **Sanitização de uploads** com verificação de tipos
- **Rate limiting** nas APIs críticas
- **HTTPS obrigatório** em produção

## 📊 Performance e SEO

### Métricas Atuais
- **Lighthouse Score**: 95+ em todas as categorias
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

### Otimizações Implementadas
- Server-Side Rendering (SSR) para SEO
- Static Site Generation (SSG) para páginas estáticas
- Otimização automática de imagens
- Code splitting e lazy loading
- Cache inteligente com revalidação
- Compressão gzip/brotli
- CDN global via Vercel

## 🚀 Deploy

### Deploy Automático (Recomendado)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/maico/acucarada)

### Deploy Manual
```bash
# Build do projeto
npm run build

# Deploy para Vercel
npx vercel --prod
```

### Configuração de Produção
1. Configure as variáveis de ambiente no Vercel
2. Configure o domínio customizado
3. Configure SSL/TLS automático
4. Configure analytics e monitoramento

## 📚 Documentação

Documentação completa disponível na pasta [`docs/`](./docs/):

- 📋 [**INDEX.md**](./docs/INDEX.md) - Índice da documentação
- 🔧 [**TECHNICAL_SPECS.md**](./docs/TECHNICAL_SPECS.md) - Especificações técnicas
- 📋 [**IMPLEMENTATION_TASKS.md**](./docs/IMPLEMENTATION_TASKS.md) - Roadmap de implementação
- 📖 [**USER_MANUAL.md**](./docs/USER_MANUAL.md) - Manual do usuário
- 🔐 [**AUTH_SYSTEM.md**](./docs/AUTH_SYSTEM.md) - Sistema de autenticação
- 🚀 [**DEVELOPMENT_GUIDE.md**](./docs/DEVELOPMENT_GUIDE.md) - Guia de desenvolvimento

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento
npm run build            # Build de produção
npm run start            # Inicia servidor de produção
npm run lint             # Executa ESLint
npm run type-check       # Verificação de tipos TypeScript

# Banco de Dados
npm run db:generate-types    # Gera tipos do Supabase
npm run create-superadmin    # Cria usuário super admin
npm run create-seed-products # Cria produtos de exemplo

# Performance
npm run analyze          # Análise do bundle
npm run lighthouse       # Auditoria Lighthouse
npm run perf:audit       # Auditoria completa de performance
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🎯 Roadmap

### Próximas Funcionalidades
- [ ] Sistema de cupons e promoções
- [ ] Integração com redes sociais
- [ ] PWA (Progressive Web App)
- [ ] Sistema de avaliações
- [ ] Relatórios avançados
- [ ] API pública para integrações

### Melhorias Técnicas
- [ ] Testes automatizados (Jest + Testing Library)
- [ ] Storybook para componentes
- [ ] Docker para desenvolvimento
- [ ] Monitoramento com Sentry
- [ ] Cache Redis para alta performance

## 📞 Suporte

Para dúvidas, sugestões ou problemas:
- 📧 Email: [seu-email@exemplo.com](mailto:seu-email@exemplo.com)
- 💬 Issues: [GitHub Issues](https://github.com/maico/acucarada/issues)
- 📖 Documentação: [docs/](./docs/)

---

<div align="center">
  <p>Feito com ❤️ para a <strong>Açucarada</strong></p>
  <p>Transformando doces artesanais em experiências digitais memoráveis</p>
</div>
