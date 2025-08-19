-- =============================================
-- AÇUCARADA - MIGRAÇÕES SUPABASE
-- =============================================

-- 1. CRIAÇÃO DAS TABELAS PRINCIPAIS
-- =============================================

-- Tabela de usuários customizada (sistema hardcoded)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  stock_quantity INTEGER DEFAULT 0,
  min_order_quantity INTEGER DEFAULT 1,
  max_order_quantity INTEGER,
  preparation_time TEXT,
  ingredients TEXT[],
  allergens TEXT[],
  weight_grams INTEGER,
  dimensions TEXT,
  sort_order INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de imagens dos produtos
CREATE TABLE IF NOT EXISTS product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  description TEXT,
  category TEXT DEFAULT 'general',
  is_public BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de analytics básico
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data JSONB,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs de acesso (auditoria)
CREATE TABLE IF NOT EXISTS access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  username TEXT,
  action TEXT NOT NULL, -- 'login', 'logout', 'failed_login', 'password_change'
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ÍNDICES PARA PERFORMANCE
-- =============================================

-- Índices para produtos
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sort ON products(sort_order);

-- Índices para categorias
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order);

-- Índices para imagens
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_primary ON product_images(is_primary);

-- Índices para settings
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);

-- Índices para analytics
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Índices para access_logs
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_username ON access_logs(username);
CREATE INDEX IF NOT EXISTS idx_access_logs_action ON access_logs(action);
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON access_logs(created_at);

-- 3. TRIGGERS PARA UPDATED_AT
-- =============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para todas as tabelas com updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para leitura pública (dados ativos)
CREATE POLICY "Public read categories" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public read products" ON products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public read product_images" ON product_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = product_images.product_id 
            AND products.is_active = true
        )
    );

CREATE POLICY "Public read settings" ON settings
    FOR SELECT USING (is_public = true);

-- Políticas para administradores (sistema customizado - será controlado pela aplicação)
-- Nota: Como não usamos Supabase Auth, as políticas serão mais simples
-- O controle de acesso será feito principalmente na aplicação

CREATE POLICY "Users table access" ON users
    FOR ALL USING (true); -- Controlado pela aplicação

CREATE POLICY "Admin access categories" ON categories
    FOR ALL USING (true); -- Controlado pela aplicação

CREATE POLICY "Admin access products" ON products
    FOR ALL USING (true); -- Controlado pela aplicação

CREATE POLICY "Admin access product_images" ON product_images
    FOR ALL USING (true); -- Controlado pela aplicação

CREATE POLICY "Admin access settings" ON settings
    FOR ALL USING (true); -- Controlado pela aplicação

CREATE POLICY "Admin access analytics" ON analytics
    FOR ALL USING (true); -- Controlado pela aplicação

CREATE POLICY "Admin access logs" ON access_logs
    FOR ALL USING (true); -- Controlado pela aplicação

-- 5. STORAGE BUCKETS E POLÍTICAS
-- =============================================

-- Criar bucket para imagens de produtos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images', 
    'product-images', 
    true, 
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Política para upload (controlado pela aplicação)
CREATE POLICY "Upload product images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'product-images' 
        AND (storage.foldername(name))[1] = 'products'
    );

-- Política para leitura pública
CREATE POLICY "Public read product images" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

-- Política para delete (controlado pela aplicação)
CREATE POLICY "Delete product images" ON storage.objects
    FOR DELETE USING (bucket_id = 'product-images');

-- 6. FUNÇÕES UTILITÁRIAS
-- =============================================

-- Função para gerar slug automaticamente
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                regexp_replace(input_text, '[áàâãä]', 'a', 'g'),
                '[éèêë]', 'e', 'g'
            ),
            '[íìîï]', 'i', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Função para incrementar views
CREATE OR REPLACE FUNCTION increment_product_views(product_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE products 
    SET views_count = views_count + 1 
    WHERE id = product_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. DADOS INICIAIS (SEED)
-- =============================================

-- Inserir usuário superadmin padrão
-- Senha: admin123 (hash bcrypt com 12 rounds)
-- IMPORTANTE: Alterar a senha após primeiro login!
INSERT INTO users (username, password_hash, full_name, role, is_active) VALUES
('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXig/pxmcxHK', 'Super Administrador', 'superadmin', true)
ON CONFLICT (username) DO NOTHING;

-- Inserir configurações padrão
INSERT INTO settings (key, value, description, category, is_public) VALUES
('company_name', '"Açucarada"', 'Nome da empresa', 'company', true),
('company_description', '"Doces artesanais feitos com amor"', 'Descrição da empresa', 'company', true),
('company_phone', '"+5511999999999"', 'Telefone da empresa', 'company', true),
('company_whatsapp', '"+5511999999999"', 'WhatsApp da empresa', 'company', true),
('company_email', '"contato@acucarada.com"', 'Email da empresa', 'company', true),
('company_address', '"São Paulo, SP"', 'Endereço da empresa', 'company', true),
('site_title', '"Açucarada - Doces Artesanais"', 'Título do site', 'seo', true),
('site_description', '"Os melhores doces artesanais da região"', 'Descrição do site', 'seo', true),
('delivery_info', '"Entregamos em toda a região metropolitana"', 'Informações de entrega', 'delivery', true),
('min_order_value', '50.00', 'Valor mínimo do pedido', 'delivery', true),
('delivery_fee', '10.00', 'Taxa de entrega', 'delivery', true),
('business_hours', '{"seg-sex": "8h-18h", "sab": "8h-14h", "dom": "fechado"}', 'Horário de funcionamento', 'company', true)
ON CONFLICT (key) DO NOTHING;

-- Inserir categorias padrão
INSERT INTO categories (name, slug, description, is_active, sort_order) VALUES
('Bolos', 'bolos', 'Bolos artesanais para todas as ocasiões', true, 1),
('Docinhos', 'docinhos', 'Docinhos finos para festas', true, 2),
('Tortas', 'tortas', 'Tortas doces e salgadas', true, 3),
('Cookies', 'cookies', 'Cookies artesanais crocantes', true, 4),
('Cupcakes', 'cupcakes', 'Cupcakes decorados', true, 5),
('Especiais', 'especiais', 'Produtos especiais e sazonais', true, 6)
ON CONFLICT (slug) DO NOTHING;

-- 8. VIEWS ÚTEIS
-- =============================================

-- View para produtos com informações completas
CREATE OR REPLACE VIEW products_full AS
SELECT 
    p.*,
    c.name as category_name,
    c.slug as category_slug,
    (
        SELECT json_agg(
            json_build_object(
                'id', pi.id,
                'image_url', pi.image_url,
                'alt_text', pi.alt_text,
                'is_primary', pi.is_primary,
                'sort_order', pi.sort_order
            ) ORDER BY pi.sort_order, pi.created_at
        )
        FROM product_images pi 
        WHERE pi.product_id = p.id
    ) as images
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;

-- View para estatísticas do dashboard
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM products WHERE is_active = true) as total_products,
    (SELECT COUNT(*) FROM categories WHERE is_active = true) as total_categories,
    (SELECT COUNT(*) FROM products WHERE is_featured = true AND is_active = true) as featured_products,
    (SELECT SUM(views_count) FROM products) as total_views,
    (SELECT COUNT(*) FROM product_images) as total_images;

-- =============================================
-- FIM DAS MIGRAÇÕES
-- =============================================

-- Para executar este arquivo no Supabase:
-- 1. Acesse o painel do Supabase
-- 2. Vá em SQL Editor
-- 3. Cole este conteúdo e execute
-- 4. Verifique se todas as tabelas foram criadas corretamente