# 🔑 Como Obter as Chaves do Supabase

## 📋 Instruções Passo a Passo

### 1. Acesse o Painel do Supabase
- Vá para: https://supabase.com/dashboard
- Faça login na sua conta
- Selecione o projeto: **hifnnuwqjyjrmzzdpfku**

### 2. Navegue até as Configurações da API
- No menu lateral, clique em **"Settings"** (Configurações)
- Clique em **"API"**

### 3. Copie as Chaves Necessárias
Você encontrará as seguintes chaves:

#### 🔓 Anon Key (Chave Pública)
- **Nome**: `anon` / `public`
- **Uso**: Para operações públicas (leitura de produtos)
- **Segurança**: Pode ser exposta no frontend

#### 🔒 Service Role Key (Chave de Serviço)
- **Nome**: `service_role`
- **Uso**: Para operações administrativas (bypass RLS)
- **Segurança**: ⚠️ **NUNCA expor no frontend**

### 4. Atualize o Arquivo .env.local
Substitua os placeholders no arquivo `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://hifnnuwqjyjrmzzdpfku.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZm5udXdxanlqcm16emRwZmt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDYyOTAsImV4cCI6MjA3MTEyMjI5MH0.CvjuNaOEt0gEDfuqnIpWxfZ2f8iAqa7CqWbKeGxmKpc

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZm5udXdxanlqcm16emRwZmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU0NjI5MCwiZXhwIjoyMDcxMTIyMjkwfQ.culbJtzkRO2_FfVWZgmsGUsGalme1oGa0zce-CNoaLQ
```

### 5. Execute o Script de Criação do Superadmin
Após configurar as chaves, execute:

```bash
npm run create-superadmin
```

## 🔍 Como Identificar as Chaves

### Anon Key
- Geralmente começa com: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...`
- Contém `"role":"anon"` quando decodificada
- É segura para uso público

### Service Role Key
- Também começa com: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...`
- Contém `"role":"service_role"` quando decodificada
- ⚠️ **NUNCA compartilhe esta chave**

## 🛡️ Segurança

### ✅ Boas Práticas
- Mantenha a `service_role_key` em segredo
- Use apenas no backend/servidor
- Não commite no Git (já está no .gitignore)
- Rotacione as chaves periodicamente

### ❌ Nunca Faça
- Não exponha a `service_role_key` no frontend
- Não compartilhe as chaves em repositórios públicos
- Não use a `service_role_key` em código cliente

## 🔄 Rotação de Chaves (Se Necessário)

Se você suspeitar que as chaves foram comprometidas:

1. Vá para **Settings > API** no painel do Supabase
2. Clique em **"Generate new secret"** na seção JWT Secrets
3. ⚠️ **Atenção**: Isso invalidará todas as chaves existentes
4. Atualize todas as aplicações com as novas chaves

## 📞 Suporte

Se tiver dificuldades para encontrar as chaves:
- Consulte a documentação: https://supabase.com/docs/guides/api/api-keys
- Verifique se você tem permissões de administrador no projeto
- Entre em contato com o suporte do Supabase se necessário