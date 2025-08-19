const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Carregar variáveis de ambiente do .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  console.log('Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSuperAdmin() {
  try {
    console.log('🔐 Gerando hash da senha...');
    
    // Gerar hash da senha 'admin123'
    const password = 'admin123';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    console.log('📝 Inserindo usuário superadmin...');
    
    // Inserir usuário no banco
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          username: 'admin',
          password_hash: passwordHash,
          full_name: 'Super Administrador',
          role: 'superadmin',
          is_active: true,
        }
      ])
      .select();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        console.log('ℹ️  Usuário superadmin já existe');
        
        // Verificar usuário existente
        const { data: existingUser } = await supabase
          .from('users')
          .select('id, username, role, is_active, created_at')
          .eq('username', 'admin')
          .single();
          
        if (existingUser) {
          console.log('✅ Usuário superadmin encontrado:');
          console.table(existingUser);
        }
      } else {
        throw error;
      }
    } else {
      console.log('✅ Usuário superadmin criado com sucesso!');
      console.table(data[0]);
    }

    console.log('\n📋 Credenciais de acesso:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('\n🌐 Acesse: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Erro ao criar usuário superadmin:', error.message);
    process.exit(1);
  }
}

// Executar script
createSuperAdmin();