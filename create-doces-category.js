const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Carregar variáveis de ambiente do .env.local
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  console.log('Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createDocesCategory() {
  try {
    console.log('🍰 Criando categoria "doces"...');
    
    // Verificar se a categoria já existe
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('slug', 'doces')
      .single();
    
    if (existingCategory) {
      console.log('ℹ️  Categoria "doces" já existe:', existingCategory);
      return;
    }
    
    // Criar a categoria "doces"
    const { data: newCategory, error } = await supabase
      .from('categories')
      .insert([{
        name: 'Doces',
        slug: 'doces',
        description: 'Deliciosos doces artesanais feitos com carinho e ingredientes selecionados',
        is_active: true,
        sort_order: 1
      }])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao criar categoria:', error);
      return;
    }
    
    console.log('✅ Categoria "doces" criada com sucesso:', newCategory);
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createDocesCategory();