# 📋 AÇUCARADA - CATÁLOGO DIGITAL

## 🎯 VISÃO GERAL DO PROJETO

### Objetivo Principal
Transformar o catálogo estático da Açucarada em uma aplicação web completa com sistema de gerenciamento administrativo, permitindo que a proprietária gerencie produtos, pedidos e conteúdo de forma autônoma.

### Stack Tecnológico Atualizada
- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Backend**: Next.js API Routes
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Estilização**: Tailwind CSS + Shadcn/ui
- **Upload de Imagens**: Supabase Storage
- **Deploy**: Vercel
- **Repositório**: GitHub

### Público-Alvo
- **Clientes**: Visualização de produtos e realização de pedidos via WhatsApp
- **Administradora**: Proprietária da doceria para gestão completa do catálogo

## 🏗️ ARQUITETURA TÉCNICA

### Estrutura de Pastas
```
acucarada-catalogo/
├── src/
│   ├── app/
│   │   ├── (public)/          # Rotas públicas
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── catalogo/      # Catálogo público
│   │   │   └── sobre/         # Página sobre
│   │   ├── admin/             # Área administrativa
│   │   │   ├── dashboard/     # Dashboard principal
│   │   │   ├── produtos/      # Gestão de produtos
│   │   │   └── configuracoes/ # Configurações
│   │   ├── api/               # API Routes
│   │   │   ├── produtos/      # CRUD produtos
│   │   │   └── upload/        # Upload de imagens
│   │   └── login/             # Página de login
│   ├── components/            # Componentes reutilizáveis
│   │   ├── ui/                # Componentes base (shadcn)
│   │   ├── public/            # Componentes públicos
│   │   └── admin/             # Componentes administrativos
│   ├── lib/                   # Utilitários e configurações
│   │   ├── supabase.ts        # Cliente Supabase
│   │   └── utils.ts           # Funções utilitárias
│   └── types/                 # Definições TypeScript
├── docs/                      # Documentação
├── public/                    # Assets estáticos
└── supabase/                  # Configurações Supabase
    ├── migrations/            # Migrações SQL
    └── seed.sql               # Dados iniciais
```

## 🎨 FUNCIONALIDADES PRINCIPAIS

### 🌐 ÁREA PÚBLICA (Clientes)
- Homepage com hero section e produtos em destaque
- Catálogo dinâmico com filtros e busca
- Detalhes do produto com galeria de imagens
- Integração direta com WhatsApp para pedidos
- Design responsivo e otimizado para mobile

### 🔐 ÁREA ADMINISTRATIVA (Proprietária)
- Dashboard com métricas básicas
- CRUD completo de produtos
- Upload múltiplo de imagens
- Gestão de categorias
- Configurações da empresa
- Sistema de backup

## 🔒 SEGURANÇA
- Autenticação via Supabase Auth
- Row Level Security (RLS) no banco
- Validação de dados com Zod
- Rate limiting nas APIs
- Upload seguro de imagens

## 🚀 DEPLOY E INFRAESTRUTURA
- **Repositório**: GitHub com CI/CD automático
- **Deploy**: Vercel com preview deployments
- **Banco**: Supabase com backups automáticos
- **CDN**: Vercel Edge Network
- **Monitoramento**: Vercel Analytics

## 💰 ESTIMATIVA DE CUSTOS MENSAIS
- **Vercel**: Gratuito (Hobby Plan)
- **Supabase**: Gratuito até 500MB + 2GB bandwidth
- **Domínio**: ~$12/ano
- **Total**: Praticamente gratuito para pequenos negócios

## 📅 CRONOGRAMA ENXUTO (4 SEMANAS)

### Semana 1: Setup e Base
- Configuração do projeto Next.js
- Setup Supabase + autenticação
- Componentes UI base
- Homepage pública

### Semana 2: Catálogo Público
- Listagem e detalhes de produtos
- Sistema de busca e filtros
- Integração WhatsApp
- Responsividade

### Semana 3: Área Administrativa
- Dashboard admin
- CRUD de produtos
- Upload de imagens
- Configurações

### Semana 4: Deploy e Otimizações
- Deploy Vercel
- Otimizações de performance
- Testes finais
- Treinamento da usuária

## 📚 PRÓXIMOS PASSOS
1. Revisar e aprovar este plano
2. Configurar repositório GitHub
3. Criar projeto Supabase
4. Iniciar desenvolvimento seguindo as tasks

---

**Desenvolvido para**: Açucarada Doceria  
**Versão**: 1.0  
**Data**: 2024