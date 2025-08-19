-- =============================================
-- SCRIPT PARA CRIAR USUÁRIO SUPERADMIN INICIAL
-- =============================================

-- Inserir usuário superadmin inicial
-- Username: admin
-- Password: admin123 (hash será gerado pelo bcrypt)
-- Role: superadmin

INSERT INTO users (
  username,
  password_hash,
  full_name,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  'admin',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Hash para 'admin123'
  'Super Administrador',
  'superadmin',
  true,
  NOW(),
  NOW()
) ON CONFLICT (username) DO NOTHING;

-- Verificar se o usuário foi criado
SELECT 
  id,
  username,
  full_name,
  role,
  is_active,
  created_at
FROM users 
WHERE username = 'admin';