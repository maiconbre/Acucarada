# 🔐 Sistema de Autenticação Açucarada

## Visão Geral

O sistema de autenticação do Açucarada foi implementado como um sistema customizado hardcoded, sem dependência do Supabase Auth. Ele suporta dois níveis de usuário:

- **Superadmin**: Acesso completo, pode criar/gerenciar outros usuários
- **Admin**: Acesso ao painel administrativo, não pode gerenciar usuários

## 🚀 Configuração Inicial

### 1. Criar Tabelas no Banco de Dados

Execute as migrações SQL no seu projeto Supabase:

```sql
-- Copie e execute o conteúdo do arquivo docs/MIGRATIONS.sql
```

### 2. Configurar Variáveis de Ambiente

Certifique-se de que as seguintes variáveis estão configuradas no seu `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico
JWT_SECRET=sua_chave_secreta_jwt
```

### 3. Criar Usuário Superadmin Inicial

Execute o script para criar o usuário superadmin:

```bash
npm run create-superadmin
```

Isso criará o usuário:
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `superadmin`

## 🔑 Credenciais de Acesso

### Superadmin (Padrão)
- **URL**: `http://localhost:3000/admin/login`
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **IMPORTANTE**: Altere a senha padrão após o primeiro login!

## 📋 Funcionalidades

### Autenticação
- ✅ Login com username/password
- ✅ Logout seguro
- ✅ Sessões com JWT
- ✅ Middleware de proteção de rotas
- ✅ Controle de tentativas de login
- ✅ Bloqueio temporário após falhas

### Gestão de Usuários (Superadmin)
- ✅ Criar novos usuários admin
- ✅ Ativar/desativar usuários
- ✅ Visualizar logs de acesso
- ✅ Máximo de 2 usuários no sistema

### Perfil do Usuário
- ✅ Visualizar informações do perfil
- ✅ Alterar senha
- ✅ Histórico de login

## 🛡️ Segurança

### Proteção de Senhas
- Hash com bcrypt (salt rounds: 10)
- Validação de força da senha
- Confirmação obrigatória

### Controle de Acesso
- Middleware de autenticação
- Verificação de roles
- Proteção contra ataques de força bruta
- Logs de auditoria

### Sessões
- JWT com expiração (24 horas)
- Cookies httpOnly e secure
- Renovação automática

## 📁 Estrutura de Arquivos

```
src/
├── types/auth.ts              # Interfaces TypeScript
├── lib/auth.ts                # Funções de autenticação
├── middleware.ts              # Middleware de proteção
├── hooks/useAuth.ts           # Hook de autenticação
├── app/
│   ├── api/auth/             # Rotas de API
│   │   ├── login/route.ts    # Login
│   │   ├── logout/route.ts   # Logout
│   │   ├── session/route.ts  # Verificar sessão
│   │   └── change-password/route.ts # Alterar senha
│   ├── api/users/            # Gestão de usuários
│   │   ├── route.ts          # Listar/criar usuários
│   │   └── [id]/route.ts     # Gerenciar usuário específico
│   └── admin/
│       ├── login/page.tsx    # Página de login
│       ├── usuarios/page.tsx # Gestão de usuários
│       ├── perfil/page.tsx   # Perfil do usuário
│       └── layout.tsx        # Layout com autenticação
```

## 🔧 API Endpoints

### Autenticação
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/logout` - Fazer logout
- `GET /api/auth/session` - Verificar sessão
- `POST /api/auth/change-password` - Alterar senha

### Usuários (Superadmin)
- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário
- `GET /api/users/[id]` - Obter usuário
- `PUT /api/users/[id]` - Atualizar usuário
- `DELETE /api/users/[id]` - Desativar usuário

## 🧪 Testando o Sistema

### 1. Teste de Login
```bash
# Acesse http://localhost:3000/admin/login
# Use: admin / admin123
```

### 2. Teste de Criação de Usuário
```bash
# Como superadmin, acesse /admin/usuarios
# Crie um novo usuário admin
```

### 3. Teste de Alteração de Senha
```bash
# Acesse /admin/perfil
# Altere a senha do usuário atual
```

## 🚨 Limitações

- **Máximo 2 usuários**: 1 superadmin + 1 admin
- **Sem recuperação de senha**: Sistema hardcoded
- **Sem autenticação externa**: Apenas username/password
- **Sem 2FA**: Autenticação simples

## 🔄 Manutenção

### Backup de Usuários
```sql
-- Backup da tabela users
SELECT * FROM users;
```

### Reset de Senha (Manual)
```sql
-- Resetar senha para 'admin123'
UPDATE users 
SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE username = 'admin';
```

### Logs de Auditoria
```sql
-- Verificar logs de acesso
SELECT * FROM access_logs 
ORDER BY created_at DESC 
LIMIT 50;
```

## 📞 Suporte

Para problemas com autenticação:

1. Verifique as variáveis de ambiente
2. Confirme que as tabelas foram criadas
3. Execute o script de criação do superadmin
4. Verifique os logs do navegador/servidor

## 🔮 Próximos Passos

- [ ] Implementar recuperação de senha por email
- [ ] Adicionar autenticação de dois fatores (2FA)
- [ ] Integrar com provedores externos (Google, etc.)
- [ ] Implementar roles mais granulares
- [ ] Adicionar auditoria avançada

---

**Desenvolvido para o projeto Açucarada** 🍰